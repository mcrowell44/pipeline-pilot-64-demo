# Approve-and-send email, at no cost

## What exists today

- Sending is coded against Resend through the connector gateway (`src/lib/resend.server.ts`), but **no Resend connection exists and no API key is set** — every send currently fails with "Resend is not connected yet". Resend also charges once you pass its free tier and requires domain DNS.
- No Lovable email domain is configured. Lovable's own email product needs a domain you own, delegated by NS records — workable for `cdmweb.store`, not for `zapai.io` unless you control its DNS.
- Your workspace already has **five connected Gmail accounts** (OAuth, via the connector gateway). That is a genuinely free send path: Gmail sends up to ~500/day (consumer) or 2,000/day (Workspace), from your real mailbox, with replies landing in your inbox and sent copies in your Sent folder.
- The approval flow you asked for is already half-built: draft → Edit → Approve → Send confirm dialog → status Sent/Bounced, plus auto-logged "Email Sent" activity.

## Recommended approach: send through your connected Gmail

Swap the Resend transport for Gmail. Nothing else in the pipeline changes.

Why Gmail over the alternatives:
- $0, no new billing, no DNS work.
- Best deliverability for 1:1 prospecting — it is a real human mailbox, not a bulk API.
- Replies thread naturally to you; sent mail is searchable in Gmail.
- Supports both identities: `marcus@zapai.io` and `marcus@cdmweb.store` can each be a Gmail "Send mail as" alias on one account (verified once inside Gmail settings, free).

Trade-off: daily cap and no bulk analytics. For 19 drafts and ongoing 1:1 outreach that is not a constraint.

## What gets built

1. **Sender picker.** A `from_address` choice on the send dialog: `Marcus Crowell <marcus@zapai.io>` or `Marcus Crowell <marcus@cdmweb.store>`. Default remembered per brand — ZapAI leads default to zapai.io, Newton Health / Crowell Digital leads to cdmweb.store. Reply-to matches the chosen sender.
2. **Gmail transport.** New server-only sender that builds a MIME message (HTML body, From/Reply-To/To/Subject) and posts it to the Gmail API through the connector gateway. Replaces the Resend call inside the existing send routine; all status/stage/activity logic stays as-is.
3. **Approval gate stays explicit.** Draft → Approve → Send is still three deliberate clicks; nothing sends on load, on a schedule, or in bulk. Optional tightening: only Approved drafts can be sent (today a Draft can be sent directly) — say the word and I'll enforce it.
4. **Error surfacing.** Gmail API failures map to the same UI banner you have now; permanent rejections (invalid address, alias not verified) mark the draft Bounced, transient ones (quota, 5xx) leave it sendable and say so.
5. **Send record.** Store the Gmail message id and the from-address used on the draft so each send is traceable.
6. **Cleanup.** Remove the dead Resend module and its "not connected" messaging.

## Setup you need to do once

- Link one Gmail connection to this project (I'll open the connect card; pick the account that owns `marcus@zapai.io`).
- In that Gmail account: Settings → Accounts → "Send mail as" → add the second address (`marcus@cdmweb.store` or `marcus@zapai.io`, whichever isn't the primary) and confirm the verification email. Without this, Gmail silently rewrites the From to the account address.

## Fallback options, for the record

- **Lovable Emails (free tier, domain-based):** good if you later want programmatic branded sends from `notify.cdmweb.store`. Needs NS delegation at your registrar and cannot send as `@zapai.io` unless you delegate that domain too. Better suited to app/system mail than cold outreach.
- **Resend free tier (3,000/mo):** works, but needs DKIM/SPF on each sending domain and cold outreach from a new sending domain typically lands in spam for the first weeks.

## Technical notes

- Transport lives in `src/lib/gmail.server.ts`; `src/lib/send-outreach.server.ts` keeps owning status transitions, stage move to Contacted, and the activity insert.
- Gmail API call: `POST /gmail/v1/users/me/messages/send` with a base64url raw RFC-2822 message, routed through the Lovable connector gateway with the project's `LOVABLE_API_KEY` — no user-pasted secret.
- Migration adds `from_address` and `provider_message_id` to `outreach_drafts` (nullable, with GRANTs unchanged).
- Sending stays inside the authenticated `sendOutreach` server function; the sender address is validated server-side against the two allowed identities rather than trusted from the browser.
