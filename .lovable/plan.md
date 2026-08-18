# Approve-and-send outreach through GoHighLevel (marcus@cdmweb.store)

## Findings

- The current send path is coded against Resend (`src/lib/resend.server.ts`), but no Resend connection or API key exists — every send fails today with "Resend is not connected yet". That module gets retired.
- There is no GoHighLevel connector in Lovable's catalog and no GHL MCP server attached to this project (the only MCP here is n8n, and it is currently offline). So the app will call GHL's public API v2 directly using a **Private Integration token** stored as a project secret — no gateway, no extra cost.
- Everything else you asked for already exists: draft list, Edit, Approve, an explicit Send confirm dialog, Sent/Bounced statuses, `sent_at`, auto-logged "Email Sent" activity, and the "Sent" filter. Only the transport changes.
- Cost: $0 beyond your existing GHL plan. Sends go out from your GHL sending identity `marcus@cdmweb.store`, so replies land in GHL Conversations and the contact history builds up there.

## How sending will work

For each approved draft, on your explicit confirm:

```text
Send dialog confirm
  -> upsert the lead into GHL as a contact (email, name, company)
  -> POST an Email message to that contact's conversation
       from: marcus@cdmweb.store, subject + locked HTML body
  -> on success: draft = Sent, sent_at stamped, GHL message id saved,
                 lead -> Contacted, "Email Sent" activity logged
  -> on permanent rejection: draft = Bounced + failure note on the lead
  -> on transient error (429/5xx): draft stays sendable, banner explains why
```

Nothing sends on load, on a schedule, or in bulk. The confirm dialog stays the only trigger and will show the recipient, subject, and the `marcus@cdmweb.store` sender.

## What you need to provide

1. In GHL: **Settings → Private Integrations → Create** with scopes `contacts.readonly`, `contacts.write`, `conversations.write`, `conversations/message.write`. Copy the token.
2. Your **Location ID** (Settings → Business Profile, or the ID in the GHL URL).

I'll prompt for both as secrets — they stay server-side and never reach the browser.

## Build steps

1. Add secrets `GHL_API_TOKEN` and `GHL_LOCATION_ID`.
2. New `src/lib/ghl.server.ts`: contact upsert + email send against `https://services.leadconnectorhq.com`, with error classification (permanent vs retryable) and the provider's status/body surfaced to the UI banner.
3. Rewire `src/lib/send-outreach.server.ts` to use it; delete `src/lib/resend.server.ts` and its "not connected" copy.
4. Migration: add `provider_message_id`, `provider` and `from_address` to `outreach_drafts` (nullable, GRANTs unchanged) so every send is traceable back to a GHL conversation.
5. Update the send dialog to show `Marcus Crowell <marcus@cdmweb.store>` and, on success, a link-out reference to the GHL conversation id.
6. Tighten approval (optional, say if you want it): require status `Approved` before Send is enabled — today a raw `Draft` can be sent directly.
7. Verify with one live test send to an address you control before touching the 19 real drafts.

## Technical notes

- Endpoints: `POST /contacts/upsert` and `POST /conversations/messages` with `type: "Email"`, `html`, `subject`, `emailFrom`, plus headers `Authorization: Bearer <token>`, `Version: 2021-07-28`, `Content-Type: application/json`.
- All calls stay inside the authenticated `sendOutreach` server function; the from-address is fixed server-side, never accepted from the browser.
- 4xx other than 429 → hard failure → `Bounced`; 429/5xx → soft failure, draft untouched.
- Sending as `marcus@zapai.io` is not part of this build. If you want it later, the cleanest free route is your connected Gmail account with a verified "Send mail as" alias — I can add it as a second transport behind a sender picker.
