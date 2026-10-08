/** Server-only Gmail SMTP (SSL, port 465) transport using an app password. */
import tls from "node:tls";

export const FROM_ADDRESS = "marcus@cdmweb.store";
export const FROM_NAME = "Marcus Crowell";
export const REPLY_TO = "marcus@zapai.io";

const HOST = "smtp.gmail.com";
const PORT = 465;
const TIMEOUT_MS = 20000;

export class SmtpError extends Error {
  code: number;
  /** Hard failures will never succeed on retry — mark the draft Bounced. */
  hard: boolean;
  constructor(message: string, code: number, hard: boolean) {
    super(message);
    this.name = "SmtpError";
    this.code = code;
    this.hard = hard;
  }
}

const b64 = (s: string) => Buffer.from(s, "utf8").toString("base64");
const header = (v: string) => (/^[\x00-\x7F]*$/.test(v) ? v : `=?UTF-8?B?${b64(v)}?=`);

function buildMessage(to: string, subject: string, html: string, messageId: string) {
  const body = b64(html).replace(/.{1,76}/g, "$&\r\n");
  return [
    `From: ${header(FROM_NAME)} <${FROM_ADDRESS}>`,
    `To: <${to}>`,
    `Reply-To: <${REPLY_TO}>`,
    `Subject: ${header(subject)}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: ${messageId}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "Content-Transfer-Encoding: base64",
    "",
    body,
  ].join("\r\n");
}

export async function sendGmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ messageId: string }> {
  const user = process.env["GMAIL_SMTP_USER"];
  const pass = process.env["GMAIL_SMTP_APP_PASSWORD"];
  if (!user || !pass) {
    throw new SmtpError("Gmail sending is not configured yet — add the SMTP username and app password.", 0, false);
  }
  if (/[\r\n<>]/.test(input.to)) throw new SmtpError("Invalid recipient address.", 0, true);

  const messageId = `<${crypto.randomUUID()}@cdmweb.store>`;

  const socket = tls.connect({ host: HOST, port: PORT, servername: HOST });
  let buffer = "";
  let waiter: ((r: { code: number; text: string } | Error) => void) | null = null;
  let failure: Error | null = null;

  const tryResolve = () => {
    if (!waiter) return;
    const lines = buffer.split("\r\n");
    for (let i = 0; i < lines.length - 1; i++) {
      const line = lines[i] ?? "";
      if (/^\d{3} /.test(line)) {
        const text = lines.slice(0, i + 1).join("\n");
        buffer = lines.slice(i + 1).join("\r\n");
        const w = waiter;
        waiter = null;
        w({ code: Number(line.slice(0, 3)), text });
        return;
      }
    }
  };
  socket.on("data", (d: Buffer) => {
    buffer += d.toString("utf8");
    tryResolve();
  });
  socket.on("error", (e: Error) => {
    failure = e;
    waiter?.(e);
    waiter = null;
  });

  const read = () =>
    new Promise<{ code: number; text: string }>((resolve, reject) => {
      if (failure) return reject(failure);
      const t = setTimeout(() => {
        waiter = null;
        reject(new SmtpError("Gmail did not respond in time.", 0, false));
      }, TIMEOUT_MS);
      waiter = (r) => {
        clearTimeout(t);
        r instanceof Error ? reject(new SmtpError(`Could not reach Gmail: ${r.message}`, 0, false)) : resolve(r);
      };
      tryResolve();
    });

  const step = async (cmd: string | null, expect: number, stage: string) => {
    if (cmd !== null) socket.write(cmd + "\r\n");
    const r = await read();
    if (r.code !== expect) {
      // 5xx = permanent (bad address, auth refused); 4xx = throttling/temporary.
      const hard = r.code >= 500;
      throw new SmtpError(`Gmail ${stage} failed [${r.code}]: ${r.text}`, r.code, hard);
    }
    return r;
  };

  try {
    await step(null, 220, "greeting");
    await step("EHLO claudepipe.cdmweb.store", 250, "EHLO");
    await step("AUTH LOGIN", 334, "auth");
    await step(b64(user), 334, "auth");
    await step(b64(pass), 235, "auth");
    await step(`MAIL FROM:<${FROM_ADDRESS}>`, 250, "sender");
    await step(`RCPT TO:<${input.to}>`, 250, "recipient");
    await step("DATA", 354, "data");
    const msg = buildMessage(input.to, input.subject, input.html, messageId).replace(/\r\n\./g, "\r\n..");
    await step(`${msg}\r\n.`, 250, "delivery");
    socket.write("QUIT\r\n");
    return { messageId };
  } catch (err) {
    console.error("Gmail SMTP send failed:", err instanceof Error ? err.message : err);
    throw err instanceof SmtpError ? err : new SmtpError(String(err), 0, false);
  } finally {
    socket.end();
  }
}
