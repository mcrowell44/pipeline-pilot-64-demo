import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/hooks/useAccount";
import { PLAN_PRICE_LABEL } from "@/lib/stripe";

const title = "Claude CRM — Contract Pipeline & Outreach Console";
const description =
  "A dense operator console for contract and consulting pipelines: kanban stages, a sortable leads workspace, and outreach drafts you approve and send by hand.";

const OG_IMAGE =
  "https://claudepipe.cdmweb.store/__l5e/assets-v1/a14d14d1-ebd9-4993-b11e-e58fc625c4d2/claude-pipe-logo.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: LandingPage,
});

const FEATURES = [
  {
    name: "Pipeline board",
    copy: "Drag leads across stages; every move stamps the last touch so nothing goes cold unnoticed.",
  },
  {
    name: "Leads workspace",
    copy: "Sort, filter, inline-edit and bulk-update. A needs-attention filter surfaces anything overdue.",
  },
  {
    name: "Outreach drafts",
    copy: "Draft, edit and approve emails with a locked signature and CAN-SPAM footer. Nothing sends without your click.",
  },
  {
    name: "Sales-cycle capture",
    copy: "Timestamped activity, next steps and due dates on every lead, newest first.",
  },
];

function LandingPage() {
  const { user } = useSession();

  return (
    <div className="min-h-screen bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-surface px-4 py-2">
        <img src="/favicon.png" alt="" className="h-5 w-5 rounded-sm" />
        <span className="text-sm font-semibold tracking-tight">Claude CRM</span>
        <nav className="ml-auto flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
            >
              Open my pipeline
            </Link>
          ) : (
            <>
              <Link to="/auth" className="rounded-md px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary">
                Sign in
              </Link>
              <Link
                to="/auth"
                className="rounded-md bg-primary px-3 py-1.5 text-[12px] font-medium text-primary-foreground"
              >
                Start for {PLAN_PRICE_LABEL}
              </Link>
            </>
          )}
        </nav>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-14">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground">
          Work the whole contract sales cycle in one dense console.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
          Claude CRM is built for operators running contract and consulting pipelines: scan intake,
          stage tracking, activity logging and manual-only outreach — no autopilot, no fluff.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <Link
            to={user ? "/dashboard" : "/auth"}
            className="rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            {user ? "Open my pipeline" : `Create an account — ${PLAN_PRICE_LABEL}`}
          </Link>
          <span className="text-[11px] text-muted-foreground">
            Monthly subscription, renews at $599/month until cancelled.
          </span>
        </div>

        <section className="mt-12 grid gap-3 sm:grid-cols-2">
          {FEATURES.map((f) => (
            <div key={f.name} className="rounded-lg border border-border bg-surface p-4">
              <h2 className="text-[13px] font-semibold tracking-tight text-foreground">{f.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{f.copy}</p>
            </div>
          ))}
        </section>

        <section className="mt-12 rounded-lg border border-border bg-surface p-5">
          <h2 className="text-[13px] font-semibold tracking-tight">Claude CRM Pro</h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight">$599</p>
          <p className="text-[11px] text-muted-foreground">per month, per workspace</p>
          <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
            <li>Your own private workspace — leads, drafts and activity visible only to you</li>
            <li>Unlimited leads, outreach drafts and activity history</li>
            <li>Manual-send email outreach with locked signature and CAN-SPAM footer</li>
            <li>Cancel anytime from your billing portal</li>
          </ul>
          <Link
            to={user ? "/subscribe" : "/auth"}
            className="mt-4 inline-flex rounded-md bg-primary px-4 py-2 text-[13px] font-medium text-primary-foreground"
          >
            Subscribe
          </Link>
        </section>
      </main>

      <footer className="border-t border-border px-4 py-6 text-[11px] text-muted-foreground">
        Claude CRM · Crowell Digital Marketplace
      </footer>
    </div>
  );
}
