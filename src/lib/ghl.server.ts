/** Server-only GoHighLevel (LeadConnector) email sending via a Private Integration token. */

const BASE_URL = "https://services.leadconnectorhq.com";
const API_VERSION = "2021-07-28";

export const FROM_ADDRESS = "marcus@cdmweb.store";
export const FROM_NAME = "Marcus Crowell";

export class GhlError extends Error {
  status: number;
  /** Hard failures will never succeed on retry — mark the draft Bounced. */
  hard: boolean;
  constructor(message: string, status: number, hard: boolean) {
    super(message);
    this.name = "GhlError";
    this.status = status;
    this.hard = hard;
  }
}

function credentials() {
  const token = process.env["GHL_API_TOKEN"];
  const locationId = process.env["GHL_LOCATION_ID"];
  if (!token || !locationId) {
    throw new GhlError(
      "GoHighLevel is not configured yet — add the private integration token and location id.",
      0,
      false,
    );
  }
  return { token, locationId };
}

async function ghlFetch(
  path: string,
  token: string,
  body: unknown,
): Promise<Record<string, unknown>> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Version: API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new GhlError(`Could not reach GoHighLevel: ${String(err)}`, 0, false);
  }

  const text = await response.text();
  if (!response.ok) {
    console.error(`GoHighLevel ${path} failed [${response.status}]: ${text}`);
    // 4xx other than rate limiting will never succeed on retry.
    const hard = response.status >= 400 && response.status < 500 && response.status !== 429;
    throw new GhlError(
      `GoHighLevel rejected the request [${response.status}]: ${text}`,
      response.status,
      hard,
    );
  }

  try {
    return text ? (JSON.parse(text) as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

/** Creates or updates the lead in GHL and returns its contact id. */
export async function upsertContact(input: {
  email: string;
  name?: string | null;
  company?: string | null;
  phone?: string | null;
}): Promise<string> {
  const { token, locationId } = credentials();
  const [firstName, ...rest] = (input.name ?? "").trim().split(/\s+/).filter(Boolean);

  const payload: Record<string, unknown> = {
    locationId,
    email: input.email,
    ...(firstName ? { firstName } : {}),
    ...(rest.length ? { lastName: rest.join(" ") } : {}),
    ...(input.company ? { companyName: input.company } : {}),
    ...(input.phone ? { phone: input.phone } : {}),
    source: "crowell digitall marketpace - claude CRM",
  };

  const data = await ghlFetch("/contacts/upsert", token, payload);
  const contact = (data["contact"] ?? data) as Record<string, unknown> | undefined;
  const id = (contact?.["id"] ?? data["id"]) as string | undefined;
  if (!id) {
    throw new GhlError("GoHighLevel did not return a contact id for this lead.", 0, false);
  }
  return id;
}

/** Sends one HTML email to a GHL contact from marcus@cdmweb.store. */
export async function sendEmail(input: {
  contactId: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string | null; conversationId: string | null }> {
  const { token } = credentials();

  const data = await ghlFetch("/conversations/messages", token, {
    type: "Email",
    contactId: input.contactId,
    subject: input.subject,
    html: input.html,
    emailFrom: `${FROM_NAME} <${FROM_ADDRESS}>`,
    emailReplyMode: "reply",
  });

  return {
    messageId: (data["messageId"] ?? data["emailMessageId"] ?? data["id"] ?? null) as string | null,
    conversationId: (data["conversationId"] ?? null) as string | null,
  };
}
