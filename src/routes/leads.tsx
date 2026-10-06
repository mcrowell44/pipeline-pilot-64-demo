import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { LeadsTable } from "@/components/crm/LeadsTable";

const title = "Leads Table — Claude CRM";
const description =
  "Filter, sort and edit ZapAI, Newton Health and KinematicOps leads, job types, pay and benefits in one dense table.";

const OG_IMAGE =
  "https://claudepipe.cdmweb.store/__l5e/assets-v1/a14d14d1-ebd9-4993-b11e-e58fc625c4d2/claude-pipe-logo.jpg";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <CrmShell>
      {({ leads, open }) => (
        <>
          <h1 className="px-3 pt-2 text-[13px] font-semibold tracking-tight text-foreground">Leads table</h1>
          <LeadsTable leads={leads} onOpen={open} />
        </>
      )}
    </CrmShell>
  );
}
