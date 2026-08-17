import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SummaryBar } from "./SummaryBar";
import { LeadDrawer } from "./LeadDrawer";
import { useDrafts, useLeads } from "@/hooks/useCrm";
import type { Draft, Lead } from "@/lib/crm";

const NAV = [
  { to: "/", label: "Pipeline" },
  { to: "/leads", label: "Leads" },
  { to: "/outreach", label: "Outreach" },
] as const;

export function CrmShell({
  children,
}: {
  children: (ctx: { leads: Lead[]; drafts: Draft[]; open: (lead: Lead) => void }) => ReactNode;
}) {
  const leadsQuery = useLeads();
  const draftsQuery = useDrafts();
  const [openId, setOpenId] = useState<string | null>(null);

  const leads = leadsQuery.data ?? [];
  const drafts = draftsQuery.data ?? [];
  const active = leads.find((l) => l.id === openId) ?? null;

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2">
        <span className="text-sm font-semibold tracking-tight">Claude CRM</span>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeOptions={{ exact: item.to === "/" }}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <span className="ml-auto text-[11px] text-muted-foreground">
          Marcus Crowell · ZapAI + Newton Health
        </span>
      </header>

      <SummaryBar leads={leads} />

      <main className="min-h-0 flex-1">
        {leadsQuery.isLoading ? (
          <p className="p-6 text-xs text-muted-foreground">Loading pipeline…</p>
        ) : leadsQuery.error ? (
          <p className="p-6 text-xs text-destructive">Failed to load leads.</p>
        ) : (
          children({ leads, drafts, open: (lead) => setOpenId(lead.id) })
        )}
      </main>

      <LeadDrawer
        lead={active}
        draft={drafts.find((d) => d.lead_id === active?.id)}
        onClose={() => setOpenId(null)}
      />
    </div>
  );
}
