# KinematicOps and employment fields

- Add a distinct teal KinematicOps badge and include all three brands in summary counts and brand filters on the table, pipeline, and outreach pages.
- Show editable Job type, Pay range, Pay rate, and Benefits columns in the leads table; add a job-type filter with Contract, W2, Contract-to-hire, and 1099 options.
- Add the new employment fields to the prospect drawer, preserving its existing return buttons.
- Extend the draft-generation lead type with the four employment fields so they are available for draft merging, without rewriting existing drafts.
- Verify filters and editable fields on desktop and mobile without saving changes to existing records.

## Technical details
- Reuse the generated database types, which already contain the new brand and columns; no schema or data changes.
- The sending function in `outreach.functions.ts` only accepts a draft ID; the narrowed lead type used to build drafts actually lives in `outreach.ts`. Extend that type rather than changing the send payload.
- Keep brand and job-type options centralized in `crm.ts` and use the existing select controls and semantic color tokens.