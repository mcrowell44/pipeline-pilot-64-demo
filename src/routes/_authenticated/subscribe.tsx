import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { useEntitlement } from "@/hooks/useAccount";
import { PLAN_PRICE_ID, PLAN_PRICE_LABEL } from "@/lib/stripe";

const title = "Subscribe — Claude CRM";
const description = "Activate your Claude CRM workspace for $599 per month.";

export const Route = createFileRoute("/_authenticated/subscribe")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: SubscribePage,
});

function SubscribePage() {
  const navigate = useNavigate();
  const { user, hasAccess, loading } = useEntitlement();

  useEffect(() => {
    if (!loading && hasAccess) navigate({ to: "/dashboard", replace: true });
  }, [loading, hasAccess, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <PaymentTestModeBanner />
      <header className="flex items-center gap-3 border-b border-border bg-surface px-3 py-2">
        <img src="/favicon.png" alt="" className="h-5 w-5 rounded-sm" />
        <span className="text-sm font-semibold tracking-tight">Claude CRM</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{user?.email}</span>
        <button
          className="text-[11px] text-muted-foreground underline"
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/", replace: true });
          }}
        >
          Sign out
        </button>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-lg font-semibold tracking-tight">Activate your workspace</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Claude CRM Pro — {PLAN_PRICE_LABEL}, billed monthly and renewed automatically until you
          cancel. Your workspace is private: only you can see the leads, drafts and activity in it.
        </p>

        <div className="mt-6 rounded-lg border border-border bg-surface p-4">
          {loading ? (
            <p className="text-xs text-muted-foreground">Checking your account…</p>
          ) : (
            <ErrorBoundaryCheckout />
          )}
        </div>

        <Link to="/" className="mt-6 inline-block text-[11px] text-muted-foreground underline">
          Back to home
        </Link>
      </main>
    </div>
  );
}

function ErrorBoundaryCheckout() {
  try {
    return (
      <StripeEmbeddedCheckout
        priceId={PLAN_PRICE_ID}
        returnUrl={`${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`}
      />
    );
  } catch (error) {
    toast.error(error instanceof Error ? error.message : "Checkout is unavailable.");
    return (
      <p className="text-xs text-destructive">
        Checkout is not available yet. Payments still need to be finished in the payments dashboard.
      </p>
    );
  }
}
