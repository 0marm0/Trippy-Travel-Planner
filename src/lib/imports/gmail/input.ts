import type { ExistingBookingFact, GmailCandidateKind, GmailPreviewRequest } from "./types.ts";

const KINDS = new Set<GmailCandidateKind>(["flight", "hotel", "train", "car", "activity", "other"]);
const SEARCH_TERM = /^[\p{L}\p{N} .,'&()/-]*$/u;

export class GmailPreviewInputError extends Error {}

export function parseGmailPreviewRequest(value: unknown): GmailPreviewRequest {
  if (!isRecord(value)) throw new GmailPreviewInputError("Invalid request");
  const searchTerm = typeof value.searchTerm === "string" ? value.searchTerm.trim().replace(/\s+/g, " ") : "";
  if (searchTerm.length > 80 || !SEARCH_TERM.test(searchTerm) || /\b(?:from|to|cc|bcc|label|in|is|has):/i.test(searchTerm)) {
    throw new GmailPreviewInputError("Invalid search term");
  }

  const after = optionalDate(value.after);
  const before = optionalDate(value.before);
  if (after && before) {
    const span = Date.parse(`${before}T00:00:00Z`) - Date.parse(`${after}T00:00:00Z`);
    if (span <= 0 || span > 2 * 366 * 24 * 60 * 60 * 1_000) throw new GmailPreviewInputError("Invalid date window");
  }

  const maxMessages = value.maxMessages === undefined ? 10 : value.maxMessages;
  if (!Number.isInteger(maxMessages) || (maxMessages as number) < 1 || (maxMessages as number) > 20) {
    throw new GmailPreviewInputError("Invalid message limit");
  }

  if (value.existing !== undefined && (!Array.isArray(value.existing) || value.existing.length > 100)) {
    throw new GmailPreviewInputError("Invalid existing records");
  }
  const existing = (value.existing ?? []).map(parseExistingFact);
  return { searchTerm, after, before, maxMessages: maxMessages as number, existing };
}

export function buildNarrowTravelQuery(input: Pick<GmailPreviewRequest, "searchTerm" | "after" | "before">): string {
  const terms = [
    "{subject:reservation subject:itinerary subject:booking subject:confirmation subject:ticket subject:flight subject:hotel subject:train}",
  ];
  if (input.after) terms.push(`after:${input.after.replaceAll("-", "/")}`);
  else terms.push("newer_than:1y");
  if (input.before) terms.push(`before:${input.before.replaceAll("-", "/")}`);
  if (input.searchTerm) terms.push(`\"${input.searchTerm}\"`);
  return terms.join(" ");
}

function parseExistingFact(value: unknown): ExistingBookingFact {
  if (!isRecord(value) || typeof value.kind !== "string" || !KINDS.has(value.kind as GmailCandidateKind)) {
    throw new GmailPreviewInputError("Invalid existing record");
  }
  return {
    kind: value.kind as GmailCandidateKind,
    startDate: optionalDate(value.startDate),
    endDate: optionalDate(value.endDate),
    originCode: optionalCode(value.originCode),
    destinationCode: optionalCode(value.destinationCode),
    provider: optionalSafeText(value.provider, 80),
  };
}

function optionalDate(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new GmailPreviewInputError("Invalid date");
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== value) throw new GmailPreviewInputError("Invalid date");
  return value;
}

function optionalCode(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string" || !/^[A-Za-z]{3}$/.test(value)) throw new GmailPreviewInputError("Invalid location code");
  return value.toUpperCase();
}

function optionalSafeText(value: unknown, maxLength: number): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new GmailPreviewInputError("Invalid text");
  const normalized = value.trim().replace(/\s+/g, " ");
  if (!normalized || normalized.length > maxLength || /[\u0000-\u001F\u007F@]/.test(normalized)) {
    throw new GmailPreviewInputError("Invalid text");
  }
  return normalized;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
