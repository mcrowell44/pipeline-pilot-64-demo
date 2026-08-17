import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { brandClass, statusClass, type Draft, type Lead } from "@/lib/crm";
import { useGenerateMissingDrafts, useUpdateDraft } from "@/hooks/useCrm";
import { CAN_SPAM_FOOTER, SIGNATURE_BLOCK } from "@/lib/outreach";
import { toast } from "sonner";

export function OutreachList({ drafts, leads }: { drafts: Draft[]; leads: Lead[] }) {
  const update = useUpdateDraft();
  const generate = useGenerateMissingDrafts();
  const [editing, setEditing] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const leadOf = (id: string) => leads.find((l) => l.id === id);
  const missing = leads.filter((l) => !drafts.some((d) => d.lead_id === l.id)).length;

  const startEdit = (draft: Draft) => {
    setEditing(draft.id);
    setSubject(draft.subject);
    setBody(
      draft.body_html.split(SIGNATURE_BLOCK).join("").split(CAN_SPAM_FOOTER).join("").trim(),
    );
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-border bg-surface px-2 py-1.5">
        <span className="text-[11px] text-muted-foreground">
          {drafts.length} drafts · {missing} leads without a draft
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

      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {drafts.map((draft) => {
          const lead = leadOf(draft.lead_id);
          const isEditing = editing === draft.id;
          return (
            <article key={draft.id} className="panel">
              <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2">
                <span className="text-xs font-semibold">{lead?.company ?? "Unknown lead"}</span>
                {lead && <span className={brandClass(lead.brand)}>{lead.brand}</span>}
                <span className={statusClass(draft.status)}>{draft.status}</span>
                <span className="text-[11px] text-muted-foreground">
                  {lead?.contact_name ?? "—"} · {lead?.email ?? "no email"}
                </span>
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
                      Signature and CAN-SPAM footer are appended automatically and can't be edited.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="text-xs">
                      <span className="text-muted-foreground">Subject: </span>
                      <span className="font-medium">{draft.subject}</span>
                    </div>
                    {draft.preview_text && (
                      <div className="text-[11px] text-muted-foreground">{draft.preview_text}</div>
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
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      disabled={draft.status !== "Approved"}
                      onClick={() =>
                        update.mutate(
                          {
                            id: draft.id,
                            patch: { status: "Sent", sent_at: new Date().toISOString() },
                          },
                          {
                            onSuccess: () =>
                              toast.success("Marked as sent — no email was delivered yet"),
                          },
                        )
                      }
                    >
                      Send
                    </Button>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      Sending is manual — nothing goes out automatically.
                    </span>
                  </>
                )}
              </footer>
            </article>
          );
        })}
        {drafts.length === 0 && (
          <p className="p-8 text-center text-xs text-muted-foreground">
            No drafts yet. Use “Generate missing drafts”.
          </p>
        )}
      </div>
    </div>
  );
}
