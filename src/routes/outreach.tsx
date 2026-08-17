import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { OutreachList } from "@/components/crm/OutreachList";

const title = "Outreach Drafts — Claude CRM";
const description =
  "Review, edit, approve and manually send outreach drafts with a locked signature and CAN-SPAM footer.";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: OutreachPage,
});

function OutreachPage() {
  return (
    <CrmShell>
      {({ leads, drafts }) => (
        <>
          <h1 className="sr-only">Outreach drafts</h1>
          <OutreachList drafts={drafts} leads={leads} />
        </>
      )}
    </CrmShell>
  );
}
