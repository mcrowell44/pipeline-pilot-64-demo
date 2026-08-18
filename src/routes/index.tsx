import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { PipelineBoard } from "@/components/crm/PipelineBoard";

const title = "Pipeline Board — Claude CRM";
const description =
  "Kanban lead pipeline for ZapAI and Newton Health contract and consulting sales.";

const OG_IMAGE =
  "https://claudepipe.cdmweb.store/__l5e/assets-v1/a14d14d1-ebd9-4993-b11e-e58fc625c4d2/claude-pipe-logo.jpg";

export const Route = createFileRoute("/")({
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
  component: PipelinePage,
});

function PipelinePage() {
  return (
    <CrmShell>
      {({ leads, open }) => (
        <>
          <h1 className="px-3 pt-2 text-[13px] font-semibold tracking-tight text-foreground">Lead pipeline board</h1>
          <PipelineBoard leads={leads} onOpen={open} />
        </>
      )}
    </CrmShell>
  );
}
