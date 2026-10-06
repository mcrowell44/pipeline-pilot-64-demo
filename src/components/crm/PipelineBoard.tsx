import { useState } from "react";
import { BRANDS, STAGES, brandClass, priorityClass, type Lead, type Stage } from "@/lib/crm";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateLead } from "@/hooks/useCrm";
import { toast } from "sonner";

export function PipelineBoard({
  leads,
  onOpen,
}: {
  leads: Lead[];
  onOpen: (lead: Lead) => void;
}) {
  const update = useUpdateLead();
  const [brand, setBrand] = useState("__all__");
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<Stage | null>(null);

  const drop = (stage: Stage) => {
    setOverStage(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stage) return;
    update.mutate(
      { id, patch: { stage, last_touch_at: new Date().toISOString() } },
      {
        onSuccess: () => toast.success(`${lead.company} → ${stage}`),
        onError: (e) => toast.error(String(e)),
      },
    );
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
        <Select value={brand} onValueChange={setBrand}>
          <SelectTrigger aria-label="Brand filter" className="h-7 w-auto min-w-[140px] text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">Brand: any</SelectItem>
            {BRANDS.map((b) => <SelectItem key={b} value={b}>{b} · {leads.filter((l) => l.brand === b).length}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto p-2">
      {STAGES.map((stage) => {
        const items = leads.filter((l) => l.stage === stage && (brand === "__all__" || l.brand === brand));
        return (
          <div
            key={stage}
            onDragOver={(e) => {
              e.preventDefault();
              setOverStage(stage);
            }}
            onDragLeave={() => setOverStage((s) => (s === stage ? null : s))}
            onDrop={() => drop(stage)}
            className={`flex w-[220px] shrink-0 flex-col rounded-md border bg-surface-2 ${
              overStage === stage ? "border-primary" : "border-border"
            }`}
          >
            <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide">{stage}</span>
              <span className="text-[11px] tabular-nums text-muted-foreground">{items.length}</span>
            </div>
            <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-1.5">
              {items.map((lead) => (
                <button
                  key={lead.id}
                  draggable
                  onDragStart={() => setDragId(lead.id)}
                  onDragEnd={() => setDragId(null)}
                  onClick={() => onOpen(lead)}
                  className={`panel w-full cursor-grab space-y-1 p-2 text-left transition-shadow hover:shadow-sm active:cursor-grabbing ${
                    dragId === lead.id ? "opacity-40" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs font-semibold leading-tight">{lead.company}</span>
                    <span className={priorityClass(lead.priority)}>{lead.priority}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={brandClass(lead.brand)}>{lead.brand}</span>
                    <span className="text-[10px] text-muted-foreground">{lead.play}</span>
                  </div>
                  {lead.role_title && (
                    <div className="truncate text-[11px] text-muted-foreground">
                      {lead.role_title}
                    </div>
                  )}
                  {lead.pay_range && (
                    <div className="font-mono text-[11px] tabular-nums">{lead.pay_range}</div>
                  )}
                </button>
              ))}
              {items.length === 0 && (
                <div className="rounded border border-dashed border-border px-2 py-4 text-center text-[11px] text-muted-foreground">
                  Drop here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
    </div>
  );
}
