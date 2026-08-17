import { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BRANDS,
  LEAD_TYPES,
  PLAYS,
  PRIORITIES,
  STAGES,
  ACTIVITY_KINDS,
  brandClass,
  fmtDate,
  priorityClass,
  statusClass,
  fmtDateTime,
  type ActivityKind,
  type Draft,
  type Lead,
} from "@/lib/crm";
import { useActivity, useLogActivity, useUpdateLead } from "@/hooks/useCrm";
import { toast } from "sonner";

const TEXT_FIELDS: Array<[keyof Lead, string]> = [
  ["company", "Company"],
  ["contact_name", "Contact"],
  ["phone", "Phone"],
  ["email", "Email"],
  ["website", "Website"],
  ["city", "City"],
  ["state", "State"],
  ["zip", "ZIP"],
  ["country", "Country"],
  ["tech", "Tech"],
  ["geo", "Geo"],
  ["role_title", "Role title"],
  ["pay_range", "Pay range"],
  ["scan_source", "Scan source"],
  ["next_step", "Next step"],
  ["ghl_contact_id", "GHL contact ID"],
];

const ENUM_FIELDS: Array<[keyof Lead, string, readonly string[]]> = [
  ["brand", "Brand", BRANDS],
  ["play", "Play", PLAYS],
  ["priority", "Priority", PRIORITIES],
  ["lead_type", "Lead type", LEAD_TYPES],
  ["stage", "Stage", STAGES],
];

export function LeadDrawer({
  lead,
  draft,
  onClose,
}: {
  lead: Lead | null;
  draft: Draft | undefined;
  onClose: () => void;
}) {
  const update = useUpdateLead();
  const { data: activity } = useActivity();
  const log = useLogActivity();
  const [form, setForm] = useState<Record<string, unknown>>({});
  const [note, setNote] = useState("");
  const [kind, setKind] = useState<ActivityKind>("Note");

  useEffect(() => {
    setForm(lead ? { ...lead } : {});
    setNote("");
    setKind("Note");
  }, [lead]);


  if (!lead) return null;

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const save = () => {
    const patch: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(form)) {
      if (k === "id" || k === "created_at" || k === "updated_at") continue;
      if ((lead as Record<string, unknown>)[k] !== v) patch[k] = v === "" ? null : v;
    }
    if (Object.keys(patch).length === 0) {
      toast("No changes to save");
      return;
    }
    update.mutate(
      { id: lead.id, patch },
      { onSuccess: () => toast.success("Lead saved"), onError: (e) => toast.error(String(e)) },
    );
  };

  const addActivity = () => {
    if (!note.trim()) return;
    log.mutate(
      { lead_id: lead.id, kind, body: note.trim() },
      {
        onSuccess: () => {
          setNote("");
          toast.success("Activity logged");
        },
        onError: (e) => toast.error(String(e)),
      },
    );
  };

  const timeline = (activity ?? [])
    .filter((a) => a.lead_id === lead.id)
    .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at));


  return (
    <Sheet open={!!lead} onOpenChange={(o) => !o && onClose()}>
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-xl">
        <SheetHeader className="sticky top-0 z-10 gap-1 border-b border-border bg-surface px-4 py-3">
          <SheetTitle className="flex items-center gap-2 text-sm">
            {lead.company}
            <span className={brandClass(lead.brand)}>{lead.brand}</span>
            <span className={priorityClass(lead.priority)}>{lead.priority}</span>
          </SheetTitle>
          <p className="text-[11px] text-muted-foreground">
            {lead.stage} · last touch {fmtDate(lead.last_touch_at)} · scanned {fmtDate(lead.scan_date)}
          </p>
        </SheetHeader>

        <div className="space-y-4 px-4 py-3">
          <section className="grid grid-cols-2 gap-2">
            {ENUM_FIELDS.map(([key, label, options]) => (
              <label key={String(key)} className="space-y-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <Select
                  value={(form[key as string] as string) ?? ""}
                  onValueChange={(v) => set(key as string, v)}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o} value={o} className="text-xs">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </label>
            ))}
            <label className="space-y-1">
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Scan date
              </span>
              <Input
                type="date"
                className="h-7 text-xs"
                value={(form["scan_date"] as string) ?? ""}
                onChange={(e) => set("scan_date", e.target.value)}
              />
            </label>
          </section>

          <section className="grid grid-cols-2 gap-2">
            {TEXT_FIELDS.map(([key, label]) => (
              <label key={String(key)} className="space-y-1">
                <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                  {label}
                </span>
                <Input
                  className="h-7 text-xs"
                  value={(form[key as string] as string) ?? ""}
                  onChange={(e) => set(key as string, e.target.value)}
                />
              </label>
            ))}
          </section>

          <div className="flex gap-2">
            <Button size="sm" className="h-7 text-xs" onClick={save} disabled={update.isPending}>
              Save changes
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="h-7 text-xs"
              onClick={() =>
                update.mutate(
                  { id: lead.id, patch: { last_touch_at: new Date().toISOString() } },
                  { onSuccess: () => toast.success("Touch stamped") },
                )
              }
            >
              Stamp touch
            </Button>
          </div>

          <section className="panel p-3">
            <h3 className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              Outreach draft
            </h3>
            {draft ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className={statusClass(draft.status)}>{draft.status}</span>
                  <span className="text-xs font-medium">{draft.subject}</span>
                </div>
                <div
                  className="email-body max-h-64 overflow-y-auto rounded border border-border bg-background p-3"
                  dangerouslySetInnerHTML={{ __html: draft.body_html }}
                />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No draft yet — generate one from the Outreach view.
              </p>
            )}
          </section>

          <section className="panel p-3">
            <h3 className="mb-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              Activity
            </h3>
            <div className="flex gap-2">
              <Select value={kind} onValueChange={(v) => setKind(v as ActivityKind)}>
                <SelectTrigger className="h-7 w-[124px] shrink-0 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_KINDS.map((k) => (
                    <SelectItem key={k} value={k} className="text-xs">
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Log a call, reply, meeting, or note…"
                className="min-h-[52px] text-xs"
              />
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={addActivity}
                disabled={log.isPending}
              >
                Log
              </Button>
            </div>
            <ul className="mt-3 space-y-2 border-l border-border pl-3">
              {timeline.length === 0 && (
                <li className="text-xs text-muted-foreground">No activity logged.</li>
              )}
              {timeline.map((entry) => (
                <li key={entry.id} className="relative text-xs leading-relaxed">
                  <span className="absolute -left-[15px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span className="font-medium">{entry.kind}</span>
                  <span className="ml-1 text-muted-foreground">
                    {fmtDateTime(entry.occurred_at)}
                  </span>
                  {entry.body && <div className="text-foreground">{entry.body}</div>}
                </li>
              ))}
            </ul>
          </section>

        </div>
      </SheetContent>
    </Sheet>
  );
}
