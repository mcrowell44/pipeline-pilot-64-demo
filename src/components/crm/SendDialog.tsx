import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Draft, Lead } from "@/lib/crm";

/**
 * The only path that actually sends email. Nothing sends on a schedule, on
 * load, or in bulk — confirming here is the single trigger.
 */
export function SendDialog({
  draft,
  lead,
  pending,
  onCancel,
  onConfirm,
}: {
  draft: Draft | null;
  lead: Lead | undefined;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog open={!!draft} onOpenChange={(o) => !o && onCancel()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-sm">Send this email now?</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2 text-xs">
              <div className="rounded border border-border bg-surface-2 p-2">
                <div>
                  <span className="text-muted-foreground">To: </span>
                  <span className="font-medium text-foreground">{lead?.email ?? "—"}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Subject: </span>
                  <span className="font-medium text-foreground">{draft?.subject}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">From: </span>
                  <span className="text-foreground">
                    Marcus Crowell &lt;marcus@cdmweb.store&gt;
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Reply-To: </span>
                  <span className="text-foreground">marcus@zapai.io</span>
                </div>
              </div>
              <p className="text-muted-foreground">
                Sends through Gmail (marcus@cdmweb.store), marks the draft Sent, moves {lead?.company} to
                Email Sent, and logs an Email Sent activity. Replies land in that Gmail inbox.
              </p>

            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="h-7 text-xs">Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="h-7 text-xs"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
          >
            {pending ? "Sending…" : "Send email"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
