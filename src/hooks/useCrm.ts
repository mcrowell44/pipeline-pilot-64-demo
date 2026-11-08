import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Activity, ActivityKind, Draft, Lead, LeadUpdate } from "@/lib/crm";
import { DEMO_ACTIVITY, DEMO_DRAFTS, DEMO_LEADS } from "@/lib/demo-seed";
import { buildDraft, withCanonicalBlocks } from "@/lib/outreach";

/**
 * DEMO COPY: Uses isolated in-memory demo records (falling back to DEMO_LEADS /
 * DEMO_DRAFTS / DEMO_ACTIVITY if offline or empty) and keeps all mutations strictly
 * inside the React Query cache so the main production database and real outreach
 * channels are never modified by demo users.
 */

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    staleTime: Infinity,
    queryFn: async (): Promise<Lead[]> => {
      try {
        const { data, error } = await supabase
          .from("leads")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch {
        // Fall through to isolated demo seed data
      }
      return DEMO_LEADS;
    },
  });
}

export function useDrafts() {
  return useQuery({
    queryKey: ["drafts"],
    staleTime: Infinity,
    queryFn: async (): Promise<Draft[]> => {
      try {
        const { data, error } = await supabase
          .from("outreach_drafts")
          .select("*")
          .order("created_at", { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch {
        // Fall through to isolated demo seed data
      }
      return DEMO_DRAFTS;
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: LeadUpdate }) => {
      qc.setQueryData<Lead[]>(["leads"], (old = []) =>
        old.map((l) =>
          l.id === id ? ({ ...l, ...patch, updated_at: new Date().toISOString() } as Lead) : l,
        ),
      );
    },
  });
}

export function useUpdateLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: LeadUpdate }) => {
      const idSet = new Set(ids);
      qc.setQueryData<Lead[]>(["leads"], (old = []) =>
        old.map((l) =>
          idSet.has(l.id) ? ({ ...l, ...patch, updated_at: new Date().toISOString() } as Lead) : l,
        ),
      );
    },
  });
}

export function useUpdateDraft() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Draft, "subject" | "preview_text" | "body_html" | "status" | "sent_at">>;
    }) => {
      const next = { ...patch };
      if (typeof next.body_html === "string") next.body_html = withCanonicalBlocks(next.body_html);
      qc.setQueryData<Draft[]>(["drafts"], (old = []) =>
        old.map((d) =>
          d.id === id ? ({ ...d, ...next, updated_at: new Date().toISOString() } as Draft) : d,
        ),
      );
    },
  });
}

/** Creates an in-memory demo draft for every lead that doesn't have one yet. */
export function useGenerateMissingDrafts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ leads, drafts }: { leads: Lead[]; drafts: Draft[] }) => {
      const covered = new Set(drafts.map((d) => d.lead_id));
      const targets = leads.filter((l) => !covered.has(l.id));
      if (targets.length === 0) return 0;
      const now = new Date().toISOString();
      const rows: Draft[] = targets.map((lead, idx) => ({
        id: `demo-draft-${Date.now()}-${idx}`,
        lead_id: lead.id,
        owner_id: null,
        from_address: "marcus@cdmweb.store",
        provider: "demo",
        provider_message_id: null,
        sent_at: null,
        created_at: now,
        updated_at: now,
        ...buildDraft(lead),
      }));
      qc.setQueryData<Draft[]>(["drafts"], (old = []) => [...rows, ...old]);
      return rows.length;
    },
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    staleTime: Infinity,
    queryFn: async (): Promise<Activity[]> => {
      try {
        const { data, error } = await supabase
          .from("lead_activity")
          .select("*")
          .order("occurred_at", { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch {
        // Fall through to isolated demo seed data
      }
      return DEMO_ACTIVITY;
    },
  });
}

export function useLogActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      lead_id,
      kind,
      body,
    }: {
      lead_id: string;
      kind: ActivityKind;
      body: string;
    }) => {
      const occurred_at = new Date().toISOString();
      const newActivity: Activity = {
        id: `demo-act-${Date.now()}`,
        lead_id,
        kind,
        body,
        occurred_at,
        owner_id: null,
        created_at: occurred_at,
        updated_at: occurred_at,
      };
      qc.setQueryData<Activity[]>(["activity"], (old = []) => [newActivity, ...old]);
      qc.setQueryData<Lead[]>(["leads"], (old = []) =>
        old.map((l) => (l.id === lead_id ? { ...l, last_touch_at: occurred_at } : l)),
      );
    },
  });
}

/**
 * Simulates sending a draft in the Demo copy without dispatching real emails
 * or mutating production records.
 */
export function useSendOutreach() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (draftId: string) => {
      const now = new Date().toISOString();
      let targetLeadId: string | null = null;
      qc.setQueryData<Draft[]>(["drafts"], (old = []) =>
        old.map((d) => {
          if (d.id === draftId) {
            targetLeadId = d.lead_id;
            return { ...d, status: "Sent", sent_at: now, updated_at: now };
          }
          return d;
        }),
      );
      if (targetLeadId) {
        qc.setQueryData<Lead[]>(["leads"], (old = []) =>
          old.map((l) =>
            l.id === targetLeadId
              ? { ...l, stage: "Email Sent", last_touch_at: now, updated_at: now }
              : l,
          ),
        );
      }
      return { ok: true as const };
    },
  });
}
