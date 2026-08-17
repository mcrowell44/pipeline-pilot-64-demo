/** Server-only Resend sending, routed through the Lovable connector gateway. */

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export const FROM_ADDRESS = '"Marcus Crowell" <marcus@zapai.io>';
export const REPLY_TO_ADDRESS = "marcus@zapai.io";

export class ResendError extends Error {
  status: number;
  /** Hard failures mean the address/message will never be accepted — mark the draft Bounced. */
  hard: boolean;
  constructor(message: string, status: number, hard: boolean) {
    super(message);
    this.name = "ResendError";
    this.status = status;
    this.hard = hard;
  }
}

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const lovableKey = process.env["LOVABLE_API_KEY"];
  const resendKey = process.env["RESEND_API_KEY"];
  if (!lovableKey || !resendKey) {
    throw new ResendError(
      "Resend is not connected yet — link the Resend connector in project settings.",
      0,
      false,
    );
  }

  let response: Response;
  try {
    response = await fetch(`${GATEWAY_URL}/emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": resendKey,
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [input.to],
        reply_to: REPLY_TO_ADDRESS,
        subject: input.subject,
        html: input.html,
      }),
    });
  } catch (err) {
    throw new ResendError(`Could not reach the email service: ${String(err)}`, 0, false);
  }

  if (!response.ok) {
    const body = await response.text();
    console.error(`Resend request failed [${response.status}]: ${body}`);
    // 4xx (bad address, rejected content, unverified sender) will never succeed on retry.
    const hard = response.status >= 400 && response.status < 500 && response.status !== 429;
    throw new ResendError(`Resend rejected the message [${response.status}]: ${body}`, response.status, hard);
  }

  const data = (await response.json()) as { id?: string };
  return { id: data.id ?? null };
}
