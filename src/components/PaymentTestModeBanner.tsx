const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN;

export function PaymentTestModeBanner() {
  if (!clientToken) {
    return (
      <div className="w-full border-b border-destructive/40 bg-destructive/10 px-4 py-1.5 text-center text-[11px] text-destructive">
        Production checkout is not configured yet. Complete payment go-live to accept real payments.
      </div>
    );
  }
  if (clientToken.startsWith("pk_test_")) {
    return (
      <div className="w-full border-b border-warning/40 bg-warning/10 px-4 py-1.5 text-center text-[11px] text-foreground">
        All payments made in the preview are in test mode.
      </div>
    );
  }
  return null;
}
