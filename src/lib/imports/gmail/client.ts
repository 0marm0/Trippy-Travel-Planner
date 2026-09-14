import type { GmailMessageInput } from "./types.ts";

const GMAIL_API = "https://gmail.googleapis.com/gmail/v1/users/me/messages";
const MAX_PROVIDER_RESPONSE_BYTES = 2_000_000;
const MAX_DECODED_TEXT_BYTES = 70_000;

type GmailHeader = { name?: unknown; value?: unknown };
type GmailBody = { data?: unknown; attachmentId?: unknown };
type GmailPart = { mimeType?: unknown; headers?: unknown; body?: unknown; parts?: unknown };

export async function fetchGmailMessages(
  accessToken: string,
  query: string,
  maxMessages: number,
  fetchImpl: typeof fetch = fetch,
): Promise<GmailMessageInput[]> {
  const listUrl = new URL(GMAIL_API);
  listUrl.searchParams.set("q", query);
  listUrl.searchParams.set("maxResults", String(maxMessages));
  listUrl.searchParams.set("includeSpamTrash", "false");
  const listed = await gmailJson(listUrl, accessToken, fetchImpl);
  if (!isRecord(listed) || !Array.isArray(listed.messages)) return [];
  const ids = listed.messages.flatMap((entry) => isRecord(entry) && typeof entry.id === "string" ? [entry.id] : []).slice(0, maxMessages);

  const messages: GmailMessageInput[] = [];
  for (const id of ids) {
    const detailUrl = new URL(`${GMAIL_API}/${encodeURIComponent(id)}`);
    detailUrl.searchParams.set("format", "full");
    const payload = await gmailJson(detailUrl, accessToken, fetchImpl);
    const normalized = normalizeGmailMessagePayload(id, payload);
    if (normalized) messages.push(normalized);
  }
  return messages;
}

export function normalizeGmailMessagePayload(privateSourceId: string, value: unknown): GmailMessageInput | null {
  if (!privateSourceId || !isRecord(value) || !isRecord(value.payload)) return null;
  const payload = value.payload as GmailPart;
  const headers = Array.isArray(payload.headers) ? payload.headers as GmailHeader[] : [];
  const subject = headerValue(headers, "subject").slice(0, 1_000);
  const sentAt = headerValue(headers, "date").slice(0, 200);
  const text = collectText(payload).slice(0, MAX_DECODED_TEXT_BYTES);
  if (!subject && !text) return null;
  return { privateSourceId, subject, sentAt, text };
}

async function gmailJson(url: URL, accessToken: string, fetchImpl: typeof fetch): Promise<unknown> {
  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("Gmail request failed");
  const text = await response.text();
  if (Buffer.byteLength(text, "utf8") > MAX_PROVIDER_RESPONSE_BYTES) throw new Error("Gmail response exceeded limit");
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error("Gmail response was invalid");
  }
}

function collectText(part: GmailPart): string {
  const chunks: string[] = [];
  let size = 0;
  const visit = (node: GmailPart): void => {
    if (size >= MAX_DECODED_TEXT_BYTES) return;
    const mimeType = typeof node.mimeType === "string" ? node.mimeType.toLowerCase() : "";
    const body = isRecord(node.body) ? node.body as GmailBody : null;
    if ((mimeType === "text/plain" || mimeType === "text/html" || !mimeType) && body && typeof body.data === "string" && !body.attachmentId) {
      const decoded = decodeBase64Url(body.data, MAX_DECODED_TEXT_BYTES - size);
      const safeText = mimeType === "text/html" ? htmlToText(decoded) : decoded;
      chunks.push(safeText);
      size += Buffer.byteLength(safeText, "utf8");
    }
    if (Array.isArray(node.parts)) {
      for (const child of node.parts) if (isRecord(child)) visit(child as GmailPart);
    }
  };
  visit(part);
  return chunks.join("\n").slice(0, MAX_DECODED_TEXT_BYTES);
}

function decodeBase64Url(value: string, remaining: number): string {
  if (value.length > Math.ceil(remaining * 1.5) + 8) return "";
  try {
    return Buffer.from(value, "base64url").toString("utf8").slice(0, remaining);
  } catch {
    return "";
  }
}

function htmlToText(value: string): string {
  return value
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function headerValue(headers: GmailHeader[], name: string): string {
  const header = headers.find((entry) => typeof entry.name === "string" && entry.name.toLowerCase() === name);
  return typeof header?.value === "string" ? header.value.replace(/[\u0000-\u001F\u007F]/g, " ").trim() : "";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
