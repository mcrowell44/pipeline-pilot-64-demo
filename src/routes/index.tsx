import { createFileRoute } from "@tanstack/react-router";
import { CrmShell } from "@/components/crm/CrmShell";
import { PipelineBoard } from "@/components/crm/PipelineBoard";

const title = "Pipeline Board — Claude CRM";
const description =
  "Kanban lead pipeline for ZapAI and Newton Health contract and consulting sales.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
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
