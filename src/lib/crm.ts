import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type Draft = Database["public"]["Tables"]["outreach_drafts"]["Row"];
export type Activity = Database["public"]["Tables"]["lead_activity"]["Row"];

export const ACTIVITY_KINDS = ["Email Sent", "Reply", "Call", "Meeting", "Note"] as const;
export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

/**
 * A lead needs attention when its next step is due today or earlier, or when it
 * has been sitting in Email Sent for more than 7 days with no Reply logged.
 */
export function needsAttention(lead: Lead, activity: Activity[]): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (lead.next_step_due) {
    const due = new Date(`${lead.next_step_due}T00:00:00`);
    if (!Number.isNaN(due.getTime()) && due.getTime() <= today.getTime()) return true;
  }

  if (lead.stage === "Email Sent") {
    const since = lead.last_touch_at ?? lead.updated_at;
    const stale = new Date(since).getTime() < Date.now() - 7 * 24 * 60 * 60 * 1000;
    const replied = activity.some((a) => a.lead_id === lead.id && a.kind === "Reply");
    if (stale && !replied) return true;
  }

  return false;
}

export function fmtDateTime(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
}


export const STAGES = [
  "New",
  "Email Sent",
  "Manually Contacted",
  "Replied",
  "Discovery Booked",
  "Meeting Held",
  "Proposal Sent",
  "Won",
  "Lost",
  "Needs Contact Info",
  "Wrong Fit",
] as const;
export type Stage = (typeof STAGES)[number];

export const BRANDS = ["ZapAI", "Newton Health", "KinematicOps"] as const;
export const JOB_TYPES = ["Contract", "W2", "Contract-to-hire", "1099"] as const;
export const PLAYS = ["Apply", "Subcontract", "Both"] as const;
export const PRIORITIES = ["High", "Medium", "Low"] as const;
export const LEAD_TYPES = ["Employer", "Recruiter"] as const;
export const DRAFT_STATUSES = ["Draft", "Approved", "Sent", "Bounced"] as const;

export function brandClass(brand: string) {
  if (brand === "ZapAI") return "badge-zapai";
  if (brand === "Newton Health") return "badge-newton";
  if (brand === "KinematicOps") return "badge-kinematic";
  return "chip-low";
}

export function priorityClass(priority: string) {
  if (priority === "High") return "chip-high";
  if (priority === "Medium") return "chip-medium";
  return "chip-low";
}

export function statusClass(status: string) {
  switch (status) {
    case "Approved":
      return "chip-approved";
    case "Sent":
      return "chip-sent";
    case "Bounced":
      return "chip-high";
    default:
      return "chip-low";
  }
}

export function fmtDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function stageClass(stage: string) {
  if (stage === "Manually Contacted") return "stage-manual";
  if (stage === "Wrong Fit") return "stage-wrongfit";
  return "";
}
