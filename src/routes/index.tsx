import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { PipelineBoard } from "@/components/crm/PipelineBoard";

const title = "Claude Pipe CRM — crowell digitall marketpace - claude CRM";
const description =
  "Daily Ops and Recon for sales organizations — Kanban lead pipeline for ZapAI, Newton Health and KinematicOps.";
const OG_IMAGE = "/claude-pipe-cover.jpg";

export const Route = createFileRoute("/")({
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
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <CrmShell>
      {({ leads, open }) => (
        <>
          <h1 className="px-3 pt-2 text-[13px] font-semibold tracking-tight text-foreground">
            Lead pipeline board
          </h1>
          <PipelineBoard leads={leads} onOpen={open} />
        </>
      )}
    </CrmShell>
  );
}
