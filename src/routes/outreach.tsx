import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { OutreachList } from "@/components/crm/OutreachList";

const title = "Outreach Drafts — Claude CRM";
const description =
  "Review, edit, approve and manually send outreach drafts with a locked signature and CAN-SPAM footer.";

const OG_IMAGE =
  "https://claudepipe.cdmweb.store/__l5e/assets-v1/a14d14d1-ebd9-4993-b11e-e58fc625c4d2/claude-pipe-logo.jpg";

export const Route = createFileRoute("/outreach")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:image", content: OG_IMAGE },
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
