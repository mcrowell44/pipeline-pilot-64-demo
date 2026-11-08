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
      <header className="header-claude-pipe flex items-center gap-3 px-3 py-2">
        <img
          src="/favicon.png"
          alt="Claude Pipe CRM"
          className="h-6 w-6 rounded-sm ring-1 ring-primary/40"
        />
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold tracking-tight text-white">Claude Pipe CRM</span>
          <span className="hidden text-[11px] font-medium tracking-wide text-primary sm:inline">
            crowell digitall marketpace - claude CRM · Daily Ops &amp; Recon
          </span>
        </div>
        <nav className="ml-2 flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded px-2.5 py-1 text-xs text-white/75 transition-colors hover:bg-white/10 hover:text-white"
              activeOptions={{ exact: true }}
              activeProps={{
                className: "bg-primary text-primary-foreground font-semibold shadow-xs",
              }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <>
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
      </>
    </div>
  );
}
