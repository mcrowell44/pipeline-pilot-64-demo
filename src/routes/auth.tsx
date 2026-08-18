import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/useAccount";
import { PLAN_PRICE_LABEL } from "@/lib/stripe";

const title = "Sign in or create an account — Claude CRM";
const description =
  "Sign in to Claude CRM, or create an account and subscribe to the $599/month plan to get your own lead pipeline workspace.";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, loading } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/dashboard", replace: true });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setCheckEmail(true);
          return;
        }
        navigate({ to: "/dashboard", replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/dashboard", replace: true });
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="mb-6 flex items-center gap-2">
          <img src="/favicon.png" alt="" className="h-6 w-6 rounded-sm" />
          <span className="text-sm font-semibold tracking-tight">Claude CRM</span>
        </Link>

        <h1 className="text-lg font-semibold tracking-tight">
          {mode === "signup" ? "Create your account" : "Sign in"}
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          {mode === "signup"
            ? `New workspaces require the ${PLAN_PRICE_LABEL} plan. You'll be asked to subscribe right after signing up.`
            : "Welcome back. Sign in to your pipeline."}
        </p>

        {checkEmail ? (
          <p className="mt-6 rounded-md border border-border bg-surface p-3 text-xs text-foreground">
            Check <strong>{email}</strong> for a confirmation link. Once confirmed, sign in and
            you'll be taken to checkout.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-[11px] text-muted-foreground" htmlFor="fullName">
                  Full name
                </label>
                <input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[13px]"
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label className="text-[11px] text-muted-foreground" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[13px]"
                autoComplete="email"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded-md border border-input bg-background px-2 py-1.5 text-[13px]"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-md bg-primary px-3 py-2 text-[13px] font-medium text-primary-foreground disabled:opacity-60"
            >
              {busy ? "Working…" : mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        )}

        <button
          type="button"
          onClick={() => {
            setCheckEmail(false);
            setMode(mode === "signup" ? "signin" : "signup");
          }}
          className="mt-4 text-[11px] text-muted-foreground underline"
        >
          {mode === "signup" ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </div>
    </div>
  );
}
