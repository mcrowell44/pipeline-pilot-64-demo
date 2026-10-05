# Remove sign-in completely

Anyone who opens the app goes straight to the pipeline, leads and outreach. There is no login, no account and no $599 paywall. Everyone sees the same single workspace: your 25 scan leads and 19 drafts.

**Warning:** your real prospect data and the Send button (which sends email as marcus@cdmweb.store through GoHighLevel) will be open to anyone who has the link, including the published site and claudepipe.cdmweb.store. Sends still only go out after the confirm dialog.

## What changes for you
- Opening the site lands on the Pipeline board right away.
- The Sign in / Sign up page, Subscribe page, Billing link, Owner badge, Sign out and "Subscription required" screen are removed.
- Pipeline, Leads, Outreach, the lead drawer, activity logging and Send keep working as they do now.

## Technical details
- Routes: move `dashboard`, `leads`, `outreach` out of `_authenticated/` to top level; delete `_authenticated/route.tsx`, `_authenticated/subscribe.tsx`, `auth.tsx`, `checkout.return.tsx`. Make `/` the pipeline board (replacing the landing page) and redirect `/dashboard` to `/`. Update sitemap.
- `CrmShell`: drop `useEntitlement`, the paywall gate, the user email, Billing and Sign out, and `PaymentTestModeBanner`. Point the nav at `/`.
- `__root.tsx`: remove the auth-state listener.
- Database migration: replace the owner-scoped RLS policies on `leads`, `outreach_drafts` and `lead_activity` with open `anon` + `authenticated` select/insert/update/delete policies, and grant those roles access. Make `owner_id` optional on new rows and stop sending it from `useCrm.ts`. Existing rows stay as they are.
- Send: remove `requireSupabaseAuth` from `sendOutreach` and use the server admin client inside the handler; remove `attachSupabaseAuth` from `src/start.ts`.
- Leave the Stripe tables, webhook and profiles/roles tables unused but in place, so billing can be turned back on later. Update the memory notes and AGENTS.md about access and billing.
