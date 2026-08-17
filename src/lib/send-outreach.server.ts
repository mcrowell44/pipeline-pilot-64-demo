import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { ResendError, sendEmail } from "./resend.server";

function serverClient() {
  return createClient<Database>(
    process.env["SUPABASE_URL"]!,
    process.env["SUPABASE_PUBLISHABLE_KEY"]!,
    { auth: { storage: undefined, persistSession: false, autoRefreshToken: false } },
  );
}

export type SendResult = {
  ok: boolean;
  messageId?: string | null;
  error?: string;
  status?: "Sent" | "Bounced";
};

export async function runSendOutreach(draftId: string): Promise<SendResult> {
  const sb = serverClient();

  const { data: draft, error: draftError } = await sb
    .from("outreach_drafts")
    .select("*")
    .eq("id", draftId)
    .maybeSingle();
  if (draftError) throw new Error(draftError.message);
  if (!draft) throw new Error("Draft not found.");
  if (draft.status === "Sent") {
    return { ok: false, error: "This draft was already sent." };
  }

  const { data: lead, error: leadError } = await sb
    .from("leads")
    .select("*")
    .eq("id", draft.lead_id)
    .maybeSingle();
  if (leadError) throw new Error(leadError.message);
  if (!lead) throw new Error("Lead not found.");
  if (!lead.email) {
    return { ok: false, error: `${lead.company} has no email address on file.` };
  }

  try {
    const { id } = await sendEmail({
      to: lead.email,
      subject: draft.subject,
      html: draft.body_html,
    });

    const now = new Date().toISOString();
    await sb.from("outreach_drafts").update({ status: "Sent", sent_at: now }).eq("id", draft.id);
    await sb
      .from("leads")
      .update({ stage: "Contacted", last_touch_at: now })
      .eq("id", lead.id);
    await sb.from("lead_activity").insert({
      lead_id: lead.id,
      kind: "Email Sent",
      occurred_at: now,
      body: `Sent "${draft.subject}" to ${lead.email}`,
    });

    return { ok: true, messageId: id, status: "Sent" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hard = err instanceof ResendError && err.hard;
    if (hard) {
      await sb.from("outreach_drafts").update({ status: "Bounced" }).eq("id", draft.id);
      await sb.from("lead_activity").insert({
        lead_id: lead.id,
        kind: "Note",
        body: `Send failed (marked Bounced): ${message}`,
      });
    }
    return { ok: false, error: message, ...(hard ? { status: "Bounced" as const } : {}) };
  }
}
