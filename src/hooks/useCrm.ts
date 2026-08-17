import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { sendOutreach } from "@/lib/outreach.functions";
import type { Activity, ActivityKind, Draft, Lead, LeadUpdate } from "@/lib/crm";
import { buildDraft, withCanonicalBlocks } from "@/lib/outreach";

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useDrafts() {
  return useQuery({
    queryKey: ["drafts"],
    queryFn: async (): Promise<Draft[]> => {
      const { data, error } = await supabase
        .from("outreach_drafts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, patch }: { id: string; patch: LeadUpdate }) => {
      const { error } = await supabase.from("leads").update(patch).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeads() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ ids, patch }: { ids: string[]; patch: LeadUpdate }) => {
      const { error } = await supabase.from("leads").update(patch).in("id", ids);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
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
      const { error } = await supabase.from("outreach_drafts").update(next).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

/** Creates a draft for every lead that doesn't have one yet. */
export function useGenerateMissingDrafts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ leads, drafts }: { leads: Lead[]; drafts: Draft[] }) => {
      const covered = new Set(drafts.map((d) => d.lead_id));
      const targets = leads.filter((l) => !covered.has(l.id));
      if (targets.length === 0) return 0;
      const rows = targets.map((lead) => ({ lead_id: lead.id, ...buildDraft(lead) }));
      const { error } = await supabase.from("outreach_drafts").insert(rows);
      if (error) throw error;
      return rows.length;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drafts"] }),
  });
}

export function useActivity() {
  return useQuery({
    queryKey: ["activity"],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from("lead_activity")
        .select("*")
        .order("occurred_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
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
      const { error } = await supabase
        .from("lead_activity")
        .insert({ lead_id, kind, body, occurred_at });
      if (error) throw error;
      const { error: touchError } = await supabase
        .from("leads")
        .update({ last_touch_at: occurred_at })
        .eq("id", lead_id);
      if (touchError) throw touchError;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activity"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });
}

/**
 * Sends a single draft. Only wired to the Send confirm dialog — never called on
 * mount, on a timer, or over a list.
 */
export function useSendOutreach() {
  const qc = useQueryClient();
  const send = useServerFn(sendOutreach);
  return useMutation({
    mutationFn: async (draftId: string) => {
      const result = await send({ data: { draftId } });
      if (!result.ok) throw new Error(result.error ?? "Send failed.");
      return result;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["drafts"] });
      qc.invalidateQueries({ queryKey: ["leads"] });
      qc.invalidateQueries({ queryKey: ["activity"] });
    },
  });
}
