import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANDS,
  JOB_TYPES,
  PLAYS,
  PRIORITIES,
  STAGES,
  brandClass,
  fmtDate,
  priorityClass,
  needsAttention,
  type Lead,
} from "@/lib/crm";
import { useActivity, useUpdateLead, useUpdateLeads } from "@/hooks/useCrm";
import { toast } from "sonner";

type SortKey = "company" | "brand" | "play" | "priority" | "stage" | "geo" | "scan_date" | "job_type" | "pay_range" | "pay_rate" | "benefits";

const ANY = "__any__";

const COLUMNS: Array<{ key: SortKey | null; label: string; className?: string }> = [
  { key: "company", label: "Company" },
  { key: null, label: "Contact" },
  { key: "brand", label: "Brand" },
  { key: "play", label: "Play" },
  { key: "priority", label: "Pri" },
  { key: "stage", label: "Stage" },
  { key: null, label: "Role" },
  { key: "job_type", label: "Job type" },
  { key: "pay_range", label: "Pay range" },
  { key: "pay_rate", label: "Pay rate" },
  { key: "benefits", label: "Benefits" },
  { key: "geo", label: "Geo" },
  { key: null, label: "Next step" },
  { key: null, label: "Due" },
  { key: "scan_date", label: "Scan" },
  { key: null, label: "Touch" },
];

export function LeadsTable({ leads, onOpen }: { leads: Lead[]; onOpen: (lead: Lead) => void }) {
  const update = useUpdateLead();
  const bulk = useUpdateLeads();
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState(ANY);
  const [jobType, setJobType] = useState(ANY);
  const [play, setPlay] = useState(ANY);
  const [priority, setPriority] = useState(ANY);
  const [stage, setStage] = useState(ANY);
  const [geo, setGeo] = useState("");
  const [scanDate, setScanDate] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "company", dir: 1 });
  const [selected, setSelected] = useState<string[]>([]);
  const [attention, setAttention] = useState(false);
  const { data: activity } = useActivity();

  const rows = useMemo(() => {
    const filtered = leads.filter((l) => {
      if (brand !== ANY && l.brand !== brand) return false;
      if (jobType !== ANY && l.job_type !== jobType) return false;
      if (play !== ANY && l.play !== play) return false;
      if (priority !== ANY && l.priority !== priority) return false;
      if (stage !== ANY && l.stage !== stage) return false;
      if (geo && !(l.geo ?? "").toLowerCase().includes(geo.toLowerCase())) return false;
      if (scanDate && l.scan_date !== scanDate) return false;
      if (attention && !needsAttention(l, activity ?? [])) return false;
      if (q) {
        const hay = [l.company, l.contact_name, l.email, l.role_title, l.tech, l.city, l.job_type, l.pay_range, l.pay_rate, l.benefits]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q.toLowerCase())) return false;
      }
      return true;
    });
    return [...filtered].sort((a, b) => {
      const av = (a[sort.key] ?? "") as string;
      const bv = (b[sort.key] ?? "") as string;
      return av.localeCompare(bv) * sort.dir;
    });
  }, [leads, brand, jobType, play, priority, stage, geo, scanDate, q, sort, attention, activity]);

  const allSelected = rows.length > 0 && rows.every((r) => selected.includes(r.id));

  const saveCell = (lead: Lead, key: keyof Lead, value: string) => {
    if (((lead[key] ?? "") as string) === value) return;
    update.mutate({ id: lead.id, patch: { [key]: value || null } });
  };

  const bulkPatch = (patch: Record<string, string>) =>
    bulk.mutate(
      { ids: selected, patch },
      {
        onSuccess: () => {
          toast.success(`Updated ${selected.length} leads`);
          setSelected([]);
        },
      },
    );

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-surface px-2 py-1.5">
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search company, contact, role…"
          className="h-7 w-56 text-xs"
        />
        <FilterSelect value={brand} onChange={setBrand} options={BRANDS} label="Brand" />
        <FilterSelect value={jobType} onChange={setJobType} options={JOB_TYPES} label="Job type" />
        <FilterSelect value={play} onChange={setPlay} options={PLAYS} label="Play" />
        <FilterSelect value={priority} onChange={setPriority} options={PRIORITIES} label="Priority" />
        <FilterSelect value={stage} onChange={setStage} options={STAGES} label="Stage" />
        <Input
          value={geo}
          onChange={(e) => setGeo(e.target.value)}
          placeholder="Geo"
          className="h-7 w-24 text-xs"
        />
        <Input
          type="date"
          value={scanDate}
          onChange={(e) => setScanDate(e.target.value)}
          className="h-7 w-36 text-xs"
        />
        <button
          onClick={() => setAttention((a) => !a)}
          title="Next step due today or earlier, or sitting in Email Sent 7+ days with no reply"
          className={`h-7 rounded border px-2 text-[11px] ${
            attention
              ? "border-transparent bg-destructive text-destructive-foreground"
              : "border-border text-muted-foreground hover:bg-surface-2"
          }`}
        >
          Needs attention
          <span className="ml-1 opacity-70">
            {leads.filter((l) => needsAttention(l, activity ?? [])).length}
          </span>
        </button>
        <span className="ml-auto text-[11px] text-muted-foreground">{rows.length} leads</span>
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-accent px-2 py-1.5 text-xs">
          <span className="font-medium">{selected.length} selected</span>
          <FilterSelect
            value={ANY}
            onChange={(v) => v !== ANY && bulkPatch({ stage: v })}
            options={STAGES}
            label="Set stage"
          />
          <FilterSelect
            value={ANY}
            onChange={(v) => v !== ANY && bulkPatch({ priority: v })}
            options={PRIORITIES}
            label="Set priority"
          />
          <Button
            size="sm"
            variant="ghost"
            className="h-6 text-xs"
            onClick={() => setSelected([])}
          >
            Clear
          </Button>
        </div>
      )}

      <div className="flex-1 overflow-auto">
        <table className="w-full min-w-[1600px] border-collapse text-xs">
          <thead className="sticky top-0 z-10 bg-surface-2">
            <tr className="border-b border-border">
              <th className="w-8 px-2 py-1.5">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(c) => setSelected(c ? rows.map((r) => r.id) : [])}
                />
              </th>
              {COLUMNS.map((col) => (
                <th
                  key={col.label}
                  onClick={() => {
                    const key = col.key;
                    if (!key) return;
                    setSort((s) => s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 });
                  }}
                  className={`whitespace-nowrap px-2 py-1.5 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground ${
                    col.key ? "cursor-pointer hover:text-foreground" : ""
                  }`}
                >
                  {col.label}
                  {sort.key === col.key ? (sort.dir === 1 ? " ↑" : " ↓") : ""}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((lead) => (
              <tr key={lead.id} className="border-b border-border hover:bg-surface-2">
                <td className="px-2 py-1">
                  <Checkbox
                    checked={selected.includes(lead.id)}
                    onCheckedChange={(c) =>
                      setSelected((s) => (c ? [...s, lead.id] : s.filter((i) => i !== lead.id)))
                    }
                  />
                </td>
                <td className="px-2 py-1">
                  <button
                    className="font-medium underline-offset-2 hover:underline"
                    onClick={() => onOpen(lead)}
                  >
                    {lead.company}
                  </button>
                </td>
                <EditableCell lead={lead} field="contact_name" onSave={saveCell} />
                <td className="px-2 py-1">
                  <span className={brandClass(lead.brand)}>{lead.brand}</span>
                </td>
                <td className="px-2 py-1 text-muted-foreground">{lead.play}</td>
                <td className="px-2 py-1">
                  <span className={priorityClass(lead.priority)}>{lead.priority}</span>
                </td>
                <td className="px-2 py-1">
                  <select
                    className="cell-input"
                    value={lead.stage}
                    onChange={(e) =>
                      update.mutate({
                        id: lead.id,
                        patch: { stage: e.target.value as Lead["stage"], last_touch_at: new Date().toISOString() },
                      })
                    }
                  >
                    {STAGES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
                <EditableCell lead={lead} field="role_title" onSave={saveCell} />
                <EditableCell lead={lead} field="job_type" onSave={saveCell} />
                <EditableCell lead={lead} field="pay_range" onSave={saveCell} />
                <EditableCell lead={lead} field="pay_rate" onSave={saveCell} />
                <EditableCell lead={lead} field="benefits" onSave={saveCell} />
                <EditableCell lead={lead} field="geo" onSave={saveCell} />
                <EditableCell lead={lead} field="next_step" onSave={saveCell} />
                <td className="whitespace-nowrap px-2 py-1">
                  <input
                    type="date"
                    className="cell-input"
                    defaultValue={(lead.next_step_due as string) ?? ""}
                    onChange={(e) =>
                      update.mutate({
                        id: lead.id,
                        patch: { next_step_due: e.target.value || null },
                      })
                    }
                  />
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-muted-foreground">
                  {fmtDate(lead.scan_date)}
                </td>
                <td className="whitespace-nowrap px-2 py-1 text-muted-foreground">
                  {fmtDate(lead.last_touch_at)}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 1} className="px-2 py-8 text-center text-muted-foreground">
                  No leads match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EditableCell({
  lead,
  field,
  onSave,
}: {
  lead: Lead;
  field: keyof Lead;
  onSave: (lead: Lead, field: keyof Lead, value: string) => void;
}) {
  const [value, setValue] = useState(((lead[field] ?? "") as string) || "");
  return (
    <td className="px-2 py-1">
      <input
        className="cell-input"
        aria-label={`${field.replaceAll("_", " ")} for ${lead.company}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={() => onSave(lead, field, value)}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      />
    </td>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  label: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={`${label} filter`} className="h-7 w-auto min-w-[104px] text-xs">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY} className="text-xs">
          {label}: any
        </SelectItem>
        {options.map((o) => (
          <SelectItem key={o} value={o} className="text-xs">
            {o}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
