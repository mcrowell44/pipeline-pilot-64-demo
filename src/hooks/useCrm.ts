import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Draft, Lead, LeadUpdate } from "@/lib/crm";
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
