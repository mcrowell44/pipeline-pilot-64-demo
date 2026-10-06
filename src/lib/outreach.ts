/**
 * Canonical outreach building blocks.
 * These strings are the single source of truth — never inline or re-type them.
 */
import type { Lead } from "@/lib/crm";

export const SIGNATURE_BLOCK =
  '<p>Marcus Crowell<br>Crowell Digital Marketplace<br>AI Developer for <a href="https://zapai.io">zapai.io</a> and <a href="https://newtonhealth.ai">newtonhealth.ai</a><br>469-389-0208<br>Reply to <a href="mailto:marcus@zapai.io">marcus@zapai.io</a></p>';

export const CAN_SPAM_FOOTER =
  '<p style="color:#6b7280;font-size:12px;line-height:1.5;border-top:1px solid #dfe3e8;padding-top:12px;margin-top:20px">Crowell Digital Marketplace · 1830 Range Dr, Suite 111, Mesquite, TX 75149 — sending on behalf of ZapAI (zapai.io)<br>Not the right contact? Reply "remove" and I won\'t follow up.</p>';

/** Strips any existing signature/footer then re-appends the canonical blocks. */
export function withCanonicalBlocks(bodyHtml: string): string {
  let body = bodyHtml ?? "";
  body = body.split(SIGNATURE_BLOCK).join("").split(CAN_SPAM_FOOTER).join("").trim();
  return `${body}\n${SIGNATURE_BLOCK}\n${CAN_SPAM_FOOTER}`;
}

export function hasCanonicalBlocks(bodyHtml: string): boolean {
  return (
    (bodyHtml ?? "").includes(SIGNATURE_BLOCK) && (bodyHtml ?? "").trimEnd().endsWith(CAN_SPAM_FOOTER)
  );
}

/** Descriptive anchor text only — never raw URLs in draft copy. */
export function link(href: string, text: string): string {
  return `<a href="${href}">${text}</a>`;
}

export type DraftSeedLead = Pick<Lead,
  "company" | "contact_name" | "brand" | "role_title" | "tech" | "city" | "state" |
  "job_type" | "pay_range" | "pay_rate" | "benefits"
>;

export function buildDraft(lead: DraftSeedLead): {
  subject: string;
  preview_text: string;
  body_html: string;
} {
  const first = (lead.contact_name ?? "").split(" ")[0] || "there";
  const place = [lead.city, lead.state].filter(Boolean).join(", ");

  if (lead.brand === "Newton Health") {
    const subject = `${lead.company}: fewer missed patient calls`;
    const preview_text = "AI voice + SMS that answers, schedules, and reactivates.";
    const body = [
      `<p>Hi ${first},</p>`,
      `<p>I work with ${place || "Texas"} practices on patient communication automation — AI voice and SMS that answers every call, books appointments, handles intake, and reactivates lapsed patients.</p>`,
      `<p>For a practice like ${lead.company}, the usual first win is after-hours and overflow calls that currently go to voicemail. Setup runs alongside your existing phones and EHR workflow.</p>`,
      `<p>Worth a 15-minute look? More detail at ${link("https://newtonhealth.ai", "Newton Health")}.</p>`,
    ].join("\n");
    return { subject, preview_text, body_html: withCanonicalBlocks(body) };
  }

  const subject = lead.role_title
    ? `${lead.role_title} — ${lead.company}`
    : `Microsoft cloud delivery support for ${lead.company}`;
  const preview_text = "Dynamics 365, Power Platform, Fabric and Power BI delivery.";
  const body = [
    `<p>Hi ${first},</p>`,
    `<p>I saw ${lead.company} is working on ${lead.tech || "Microsoft cloud delivery"}${place ? ` out of ${place}` : ""}${
      lead.role_title ? `, including the ${lead.role_title} role` : ""
    }.</p>`,
    `<p>I deliver Dynamics 365, Copilot Studio, Power Platform, Microsoft Fabric, Power BI and data engineering work — as a direct contractor or as a subcontractor under your paper.</p>`,
    `<p>Happy to send a short capability summary or jump on a call. Background at ${link("https://zapai.io", "ZapAI")}.</p>`,
  ].join("\n");
  return { subject, preview_text, body_html: withCanonicalBlocks(body) };
}
