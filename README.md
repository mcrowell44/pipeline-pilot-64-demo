# Claude Pipeline

Build "Claude CRM" — a lead pipeline app for Marcus Crowell, who runs contract/consulting sales for two brands: ZapAI (zapai.io, Microsoft cloud consultancy — Dynamics 365, Copilot Studio, Power Platform, Microsoft Fabric, Power BI, data engineering) and Newton Health (newtonhealth.ai, AI automation for medical practices — voice/SMS/chat patient comms, scheduling, intake, reactivation).

Enable the database (Supabase) and create a `leads` table with these columns:
company (text), contact_name, phone, email, website, city, state, zip, country (default 'US'),
brand (enum: 'ZapAI' | 'Newton Health'),
play (enum: 'Apply' | 'Subcontract' | 'Both'),
priority (enum: 'High' | 'Medium' | 'Low'),
tech (text), geo (text), lead_type (enum: 'Employer' | 'Recruiter'),
role_title (text), pay_range (text), scan_source (text), scan_date (date),
stage (enum, default 'New': 'New' | 'Contacted' | 'Replied' | 'Discovery Booked' | 'Meeting Held' | 'Proposal Sent' | 'Won' | 'Lost' | 'Needs Contact Info'),
last_touch_at (timestamp), next_step (text), notes (text), ghl_contact_id (text).

Also create an `outreach_drafts` table: lead_id (FK), subject, preview_text, body_html, status (enum default 'Draft': 'Draft' | 'Approved' | 'Sent' | 'Bounced'), sent_at, created_at.

UI — three main views, clean and dense, not spacious:
1. **Pipeline board** — kanban by `stage`, cards show company, brand badge (ZapAI = blue, Newton Health = teal), priority chip (High = red, Medium = amber, Low = grey), role title, pay range. Drag cards between stages; dragging updates `stage` and stamps `last_touch_at`.
2. **Leads table** — sortable/filterable by brand, play, priority, stage, geo, scan_date. Inline edit. Bulk select. Click a row to open a detail drawer with all fields, the outreach draft, and a notes timeline.
3. **Outreach** — list of drafts. Each shows the lead, subject line, and rendered HTML body with an Edit / Approve / Send row. Nothing sends automatically — Send is always an explicit click.

Add a top-bar summary: counts by stage, count by brand, and "new this scan".

Every outreach draft must render with this exact signature block at the end of the body:
<p>Marcus Crowell<br>Crowell Digital Marketplace<br>AI Developer for <a href="https://zapai.io">zapai.io</a> and <a href="https://newtonhealth.ai">newtonhealth.ai</a><br>469-389-0208<br>Reply to <a href="mailto:marcus@zapai.io">marcus@zapai.io</a></p>

...followed by this exact CAN-SPAM footer as the final block:
<p style="color:#6b7280;font-size:12px;line-height:1.5;border-top:1px solid #dfe3e8;padding-top:12px;margin-top:20px">Crowell Digital Marketplace · 1830 Range Dr, Suite 111, Mesquite, TX 75149 — sending on behalf of ZapAI (zapai.io)<br>Not the right contact? Reply "remove" and I won't follow up.</p>

Store both blocks as constants so they can't drift. Links in drafts are always <a href> with descriptive anchor text — never raw URLs.

Don't wire up email sending yet — build the schema, seed structure, and UI first. I'll add the send integration in the next message.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pipeline-pilot-64.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/22ad670f-93e8-42eb-97af-59adab11cc04).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
