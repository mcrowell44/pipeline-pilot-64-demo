import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { LeadsTable } from "@/components/crm/LeadsTable";

const title = "Leads Table — Claude CRM";
const description =
  "Filter, sort, inline-edit and bulk-update every ZapAI and Newton Health lead in one dense table.";

export const Route = createFileRoute("/leads")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: LeadsPage,
});

function LeadsPage() {
  return (
    <CrmShell>
      {({ leads, open }) => (
        <>
          <h1 className="sr-only">Leads table</h1>
          <LeadsTable leads={leads} onOpen={open} />
        </>
      )}
    </CrmShell>
  );
}
