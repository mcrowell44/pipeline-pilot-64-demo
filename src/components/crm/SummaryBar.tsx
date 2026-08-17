import { STAGES, type Lead } from "@/lib/crm";

export function SummaryBar({ leads }: { leads: Lead[] }) {
  const byStage = STAGES.map((s) => ({ stage: s, count: leads.filter((l) => l.stage === s).length }));
  const zap = leads.filter((l) => l.brand === "ZapAI").length;
  const newton = leads.filter((l) => l.brand === "Newton Health").length;
  const latestScan = leads.reduce<string | null>(
    (acc, l) => (l.scan_date && (!acc || l.scan_date > acc) ? l.scan_date : acc),
    null,
  );
  const newThisScan = latestScan ? leads.filter((l) => l.scan_date === latestScan).length : 0;

  return (
    <div className="flex flex-wrap items-stretch gap-px overflow-hidden border-b border-border bg-border text-[11px]">
      {byStage.map(({ stage, count }) => (
        <div key={stage} className="flex-1 min-w-[86px] bg-surface px-2.5 py-1.5">
          <div className="truncate uppercase tracking-wide text-muted-foreground">{stage}</div>
          <div className="text-base font-semibold leading-tight tabular-nums">{count}</div>
        </div>
      ))}
      <div className="min-w-[96px] bg-surface px-2.5 py-1.5">
        <div className="uppercase tracking-wide text-muted-foreground">By brand</div>
        <div className="mt-0.5 flex gap-1">
          <span className="badge-zapai">ZapAI {zap}</span>
          <span className="badge-newton">NH {newton}</span>
        </div>
      </div>
      <div className="min-w-[96px] bg-surface px-2.5 py-1.5">
        <div className="uppercase tracking-wide text-muted-foreground">New this scan</div>
        <div className="text-base font-semibold leading-tight tabular-nums">{newThisScan}</div>
      </div>
    </div>
  );
}
