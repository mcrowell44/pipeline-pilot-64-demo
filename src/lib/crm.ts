import type { Database } from "@/integrations/supabase/types";

export type Lead = Database["public"]["Tables"]["leads"]["Row"];
export type LeadUpdate = Database["public"]["Tables"]["leads"]["Update"];
export type Draft = Database["public"]["Tables"]["outreach_drafts"]["Row"];

export const STAGES = [
  "New",
  "Contacted",
  "Replied",
  "Discovery Booked",
  "Meeting Held",
  "Proposal Sent",
  "Won",
  "Lost",
  "Needs Contact Info",
] as const;
export type Stage = (typeof STAGES)[number];

export const BRANDS = ["ZapAI", "Newton Health"] as const;
export const PLAYS = ["Apply", "Subcontract", "Both"] as const;
export const PRIORITIES = ["High", "Medium", "Low"] as const;
export const LEAD_TYPES = ["Employer", "Recruiter"] as const;
export const DRAFT_STATUSES = ["Draft", "Approved", "Sent", "Bounced"] as const;

export function brandClass(brand: string) {
  return brand === "ZapAI" ? "badge-zapai" : "badge-newton";
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
