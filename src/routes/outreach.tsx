import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { OutreachList } from "@/components/crm/OutreachList";

const title = "Outreach Drafts — Claude Pipe CRM (crowell digitall marketpace - claude CRM)";
const description =
  "Review, edit, approve and manually send outreach drafts with a locked signature and CAN-SPAM footer.";
const OG_IMAGE = "/claude-pipe-cover.jpg";

export const Route = createFileRoute("/outreach")({
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
  component: OutreachPage,
});

function OutreachPage() {
  return (
    <CrmShell>
      {({ leads, drafts }) => (
        <>
          <h1 className="px-3 pt-2 text-[13px] font-semibold tracking-tight text-foreground">
            Outreach drafts
          </h1>
          <OutreachList drafts={drafts} leads={leads} />
        </>
      )}
    </CrmShell>
  );
}
