import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { SummaryBar } from "./SummaryBar";
import { LeadDrawer } from "./LeadDrawer";
import { useDrafts, useLeads } from "@/hooks/useCrm";
import { useEntitlement } from "@/hooks/useAccount";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import type { Draft, Lead } from "@/lib/crm";

const NAV = [
  { to: "/dashboard", label: "Pipeline" },
  { to: "/leads", label: "Leads" },
  { to: "/outreach", label: "Outreach" },
] as const;

export function CrmShell({
  children,
}: {
  children: (ctx: { leads: Lead[]; drafts: Draft[]; open: (lead: Lead) => void }) => ReactNode;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAdmin, hasAccess, loading: accountLoading } = useEntitlement();
  const leadsQuery = useLeads();
  const draftsQuery = useDrafts();
  const [openId, setOpenId] = useState<string | null>(null);

  const leads = leadsQuery.data ?? [];
  const drafts = draftsQuery.data ?? [];
  const active = leads.find((l) => l.id === openId) ?? null;

  async function signOut() {
    const { supabase } = await import("@/integrations/supabase/client");
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      <PaymentTestModeBanner />
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2">
        <img src="/favicon.png" alt="Claude Pipe" className="h-5 w-5 rounded-sm" />
        <span className="text-sm font-semibold tracking-tight">Claude CRM</span>
        <nav className="flex items-center gap-1">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-secondary"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2 text-[11px] text-muted-foreground">
          <span>{user?.email}</span>
          {isAdmin && (
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-foreground">
              Owner
            </span>
          )}
          {!isAdmin && (
            <Link to="/subscribe" className="underline">
              Billing
            </Link>
          )}
          <button onClick={signOut} className="underline">
            Sign out
          </button>
        </div>
      </header>

      {accountLoading ? (
        <main className="min-h-0 flex-1">
          <p className="p-6 text-xs text-muted-foreground">Checking your account…</p>
        </main>
      ) : !hasAccess ? (
        <main className="min-h-0 flex-1">
          <div className="m-6 max-w-md rounded-lg border border-border bg-surface p-4">
            <h2 className="text-[13px] font-semibold tracking-tight">Subscription required</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Your workspace is inactive. Subscribe for $599/month to open your pipeline, leads and
              outreach tools.
            </p>
            <Link
              to="/subscribe"
              className="mt-3 inline-flex rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
            >
              Subscribe now
            </Link>
          </div>
        </main>
      ) : (
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
      )}
    </div>
  );
}
