import { createFileRoute, Link } from "@tanstack/react-router";

const title = "Checkout complete — Claude CRM";
const description = "Your Claude CRM subscription checkout result.";

export const Route = createFileRoute("/checkout/return")({
  validateSearch: (search: Record<string, unknown>): { session_id?: string } =>
    typeof search["session_id"] === "string"
      ? { session_id: search["session_id"] }
      : {},
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id: sessionId } = Route.useSearch();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-lg font-semibold tracking-tight">
          {sessionId ? "Payment received" : "No checkout session found"}
        </h1>
        <p className="mt-2 text-xs text-muted-foreground">
          {sessionId
            ? "Your subscription is being activated. This usually takes a few seconds."
            : "Head back and start checkout again."}
        </p>
        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground"
        >
          Go to my pipeline
        </Link>
      </div>
    </div>
  );
}
