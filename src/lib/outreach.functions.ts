import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const sendSchema = z.object({ draftId: z.string().uuid() });

/**
 * Sends one outreach draft. Only ever called from the Send confirm dialog —
 * there is no schedule, no batch path, and no send-on-load anywhere.
 */
export const sendOutreach = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => sendSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { runSendOutreach } = await import("./send-outreach.server");
    return runSendOutreach(context.supabase, context.userId, data.draftId);
  });
