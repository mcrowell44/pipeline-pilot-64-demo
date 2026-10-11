import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { FROM_ADDRESS, SmtpError, sendGmail } from "./gmail-smtp.server";

type Client = SupabaseClient<Database>;

export type SendResult = {
  ok: boolean;
  messageId?: string | null;
  conversationId?: string | null;
  error?: string;
  status?: "Sent" | "Bounced";
};

export async function runSendOutreach(
  sb: Client,
  draftId: string,
): Promise<SendResult> {
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
    const { messageId } = await sendGmail({
      to: lead.email,
      subject: draft.subject,
      html: draft.body_html,
    });
    const conversationId = null;

    const now = new Date().toISOString();
    await sb
      .from("outreach_drafts")
      .update({
        status: "Sent",
        sent_at: now,
        provider: "gmail",
        provider_message_id: messageId,
        from_address: FROM_ADDRESS,
      })
      .eq("id", draft.id);
    await sb
      .from("leads")
      .update({ stage: "Email Sent", last_touch_at: now })
      .eq("id", lead.id);
    await sb.from("lead_activity").insert({
      lead_id: lead.id,
      kind: "Email Sent",
      occurred_at: now,
      body: `Sent "${draft.subject}" to ${lead.email} from ${FROM_ADDRESS}`,
    });

    return { ok: true, messageId, conversationId, status: "Sent" };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const hard = err instanceof SmtpError && err.hard;
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
