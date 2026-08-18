import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { getStripeEnvironment } from "@/lib/stripe";

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      setLoading(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { session, user: session?.user ?? null, loading };
}

function environmentOrNull() {
  try {
    return getStripeEnvironment();
  } catch {
    return null;
  }
}

/** Role + subscription entitlement for the signed-in user. */
export function useEntitlement() {
  const { user, loading } = useSession();

  const query = useQuery({
    queryKey: ["entitlement", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const env = environmentOrNull();
      const [{ data: roles }, subs] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", user!.id),
        env
          ? supabase
              .from("subscriptions")
              .select("*")
              .eq("user_id", user!.id)
              .eq("environment", env)
              .order("created_at", { ascending: false })
              .limit(1)
          : Promise.resolve({ data: [] as any[] }),
      ]);

      const isAdmin = (roles ?? []).some((r) => r.role === "admin");
      const sub = (subs.data ?? [])[0] ?? null;
      const periodOk = !sub?.current_period_end || new Date(sub.current_period_end) > new Date();
      const active =
        Boolean(sub) &&
        ((["active", "trialing", "past_due"].includes(sub.status) && periodOk) ||
          (sub.status === "canceled" && periodOk));

      return { isAdmin, subscription: sub, hasAccess: isAdmin || active };
    },
  });

  return {
    user,
    loading: loading || (Boolean(user) && query.isLoading),
    isAdmin: query.data?.isAdmin ?? false,
    subscription: query.data?.subscription ?? null,
    hasAccess: query.data?.hasAccess ?? false,
  };
}
