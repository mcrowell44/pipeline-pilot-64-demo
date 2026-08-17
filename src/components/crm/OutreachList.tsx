import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  brandClass,
  fmtDateTime,
  statusClass,
  DRAFT_STATUSES,
  type Draft,
  type Lead,
} from "@/lib/crm";
import { useGenerateMissingDrafts, useSendOutreach, useUpdateDraft } from "@/hooks/useCrm";
import { CAN_SPAM_FOOTER, SIGNATURE_BLOCK } from "@/lib/outreach";
import { SendDialog } from "./SendDialog";
import { toast } from "sonner";

const ALL = "__all__";

export function OutreachList({ drafts, leads }: { drafts: Draft[]; leads: Lead[] }) {
  const update = useUpdateDraft();
  const generate = useGenerateMissingDrafts();
  const send = useSendOutreach();
  const [editing, setEditing] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>(ALL);
  const [confirming, setConfirming] = useState<Draft | null>(null);
  const [error, setError] = useState<string | null>(null);

  const leadOf = (id: string) => leads.find((l) => l.id === id);
  const missing = leads.filter((l) => !drafts.some((d) => d.lead_id === l.id)).length;

  const visible = useMemo(
    () => (statusFilter === ALL ? drafts : drafts.filter((d) => d.status === statusFilter)),
    [drafts, statusFilter],
  );

  const startEdit = (draft: Draft) => {
    setEditing(draft.id);
    setSubject(draft.subject);
    setBody(draft.body_html.split(SIGNATURE_BLOCK).join("").split(CAN_SPAM_FOOTER).join("").trim());
  };

  const confirmSend = () => {
    if (!confirming) return;
    const draft = confirming;
    setError(null);
    send.mutate(draft.id, {
      onSuccess: () => {
        setConfirming(null);
        toast.success(`Sent to ${leadOf(draft.lead_id)?.email}`);
      },
      onError: (e) => {
        setConfirming(null);
        const message = e instanceof Error ? e.message : String(e);
        setError(message);
        toast.error("Send failed", { description: message });
      },
    });
  };

  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
          <div className="flex items-center gap-1">
            {[ALL, ...DRAFT_STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded px-2 py-0.5 text-[11px] ${
                  statusFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-surface-2"
                }`}
              >
                {s === ALL ? "All" : s}
                <span className="ml-1 opacity-60">
                  {s === ALL ? drafts.length : drafts.filter((d) => d.status === s).length}
                </span>
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {missing} leads without a draft
          </span>
          <Button
            size="sm"
            className="ml-auto h-7 text-xs"
            disabled={missing === 0 || generate.isPending}
            onClick={() =>
              generate.mutate(
                { leads, drafts },
                { onSuccess: (n) => toast.success(`Generated ${n} drafts`) },
              )
            }
          >
            Generate missing drafts
          </Button>
        </div>

        {error && (
          <div className="border-b border-destructive/40 bg-destructive/10 px-3 py-2 text-[11px] text-destructive">
            <span className="font-semibold">Email not sent — </span>
            {error}
            <button className="ml-2 underline" onClick={() => setError(null)}>
              dismiss
            </button>
          </div>
        )}

        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {visible.map((draft) => {
            const lead = leadOf(draft.lead_id);
            const isEditing = editing === draft.id;
            const noEmail = !lead?.email;
            const alreadySent = draft.status === "Sent";
            const sendDisabled = noEmail || alreadySent || send.isPending;
            const disabledReason = noEmail
              ? `${lead?.company ?? "This lead"} has no email address — add one on the lead record first.`
              : alreadySent
                ? `Already sent ${fmtDateTime(draft.sent_at)}.`
                : null;

            return (
              <article key={draft.id} className="panel">
                <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                  <span className="text-xs font-semibold">{lead?.company ?? "Unknown lead"}</span>
                  {lead && <span className={brandClass(lead.brand)}>{lead.brand}</span>}
                  <span className={statusClass(draft.status)}>{draft.status}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {lead?.contact_name ?? "—"} · {lead?.email ?? "no email"}
                  </span>
                  {draft.status === "Sent" && (
                    <span className="ml-auto text-[11px] text-muted-foreground">
                      Sent {fmtDateTime(draft.sent_at)}
                    </span>
                  )}
                </header>

                <div className="space-y-2 px-3 py-2">
                  {isEditing ? (
                    <>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="h-7 text-xs"
                      />
                      <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        className="min-h-[180px] font-mono text-[11px]"
                      />
                      <p className="text-[10px] text-muted-foreground">
                        Signature and CAN-SPAM footer are appended automatically and can't be
                        edited.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Subject: </span>
                        <span className="font-medium">{draft.subject}</span>
                      </div>
                      {draft.preview_text && (
                        <div className="text-[11px] text-muted-foreground">
                          {draft.preview_text}
                        </div>
                      )}
                      <div
                        className="email-body rounded border border-border bg-background p-3"
                        dangerouslySetInnerHTML={{ __html: draft.body_html }}
                      />
                    </>
                  )}
                </div>

                <footer className="flex items-center gap-1.5 border-t border-border px-3 py-1.5">
                  {isEditing ? (
                    <>
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() =>
                          update.mutate(
                            { id: draft.id, patch: { subject, body_html: body } },
                            {
                              onSuccess: () => {
                                setEditing(null);
                                toast.success("Draft saved");
                              },
                            },
                          )
                        }
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => setEditing(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={alreadySent}
                        onClick={() => startEdit(draft)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs"
                        disabled={draft.status !== "Draft"}
                        onClick={() =>
                          update.mutate(
                            { id: draft.id, patch: { status: "Approved" } },
                            { onSuccess: () => toast.success("Draft approved") },
                          )
                        }
                      >
                        Approve
                      </Button>

                      {disabledReason ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span tabIndex={0}>
                              <Button size="sm" className="h-7 text-xs" disabled>
                                Send
                              </Button>
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs text-xs">
                            {disabledReason}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={sendDisabled}
                          onClick={() => setConfirming(draft)}
                        >
                          Send
                        </Button>
                      )}

                      <span className="ml-auto text-[10px] text-muted-foreground">
                        Sending is manual — nothing goes out automatically.
                      </span>
                    </>
                  )}
                </footer>
              </article>
            );
          })}
          {visible.length === 0 && (
            <p className="p-8 text-center text-xs text-muted-foreground">
              {drafts.length === 0
                ? "No drafts yet. Use “Generate missing drafts”."
                : "No drafts match this filter."}
            </p>
          )}
        </div>

        <SendDialog
          draft={confirming}
          lead={confirming ? leadOf(confirming.lead_id) : undefined}
          pending={send.isPending}
          onCancel={() => setConfirming(null)}
          onConfirm={confirmSend}
        />
      </div>
    </TooltipProvider>
  );
}
