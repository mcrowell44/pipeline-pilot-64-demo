import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { LeadsTable } from "@/components/crm/LeadsTable";

const title = "Leads Table — Claude Pipe CRM (crowell digitall marketpace - claude CRM)";
const description =
  "Filter, sort and edit ZapAI, Newton Health and KinematicOps leads, job types, pay and benefits in one dense table.";
const OG_IMAGE = "/claude-pipe-cover.jpg";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:card", content: "summary_large_image" },
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
          <h1 className="px-3 pt-2 text-[13px] font-semibold tracking-tight text-foreground">
            Leads table
          </h1>
          <LeadsTable leads={leads} onOpen={open} />
        </>
      )}
    </CrmShell>
  );
}
