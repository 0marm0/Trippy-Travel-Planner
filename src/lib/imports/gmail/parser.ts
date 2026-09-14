import { opaqueCandidateId } from "./crypto.ts";
import { containsForbiddenMailData } from "./redaction.ts";
import type {
  ExistingBookingFact,
  GmailCandidateConflictField,
  GmailCandidateKind,
  GmailImportCandidate,
  GmailMessageInput,
} from "./types.ts";

const PROVIDERS: Array<[RegExp, string]> = [
  [/\bunited(?: airlines)?\b/i, "United Airlines"],
  [/\blufthansa\b/i, "Lufthansa"],
  [/\bdelta(?: air lines)?\b/i, "Delta Air Lines"],
  [/\bamerican airlines\b/i, "American Airlines"],
  [/\bair france\b/i, "Air France"],
  [/\bklm\b/i, "KLM"],
  [/\bemirates\b/i, "Emirates"],
  [/\bqatar airways\b/i, "Qatar Airways"],
  [/\bbooking\.com\b/i, "Booking.com"],
  [/\bairbnb\b/i, "Airbnb"],
  [/\bexpedia\b/i, "Expedia"],
  [/\bmarriott\b/i, "Marriott"],
  [/\bhilton\b/i, "Hilton"],
  [/\bdeutsche bahn\b|\bDB Bahn\b/i, "Deutsche Bahn"],
  [/\beurostar\b/i, "Eurostar"],
];

const MONTHS: Record<string, number> = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3, apr: 4, april: 4,
  may: 5, jun: 6, june: 6, jul: 7, july: 7, aug: 8, august: 8, sep: 9,
  sept: 9, september: 9, oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

const FLIGHT_PREFIXES = "UA|AA|DL|LH|AF|KL|BA|EK|QR|SQ|B6|U2|6E";

export function buildImportCandidates(
  messages: GmailMessageInput[],
  existing: ExistingBookingFact[],
  idSecret: string,
): GmailImportCandidate[] {
  const seen = new Set<string>();
  const candidates: GmailImportCandidate[] = [];

  for (const message of messages) {
    const candidate = parseMessage(message, existing, idSecret);
    const signature = candidateSignature(candidate);
    if (seen.has(signature)) continue;
    seen.add(signature);
    if (containsForbiddenMailData(candidate)) throw new Error("Candidate safety invariant failed");
    candidates.push(candidate);
  }
  return candidates;
}

function parseMessage(message: GmailMessageInput, existing: ExistingBookingFact[], idSecret: string): GmailImportCandidate {
  const source = `${message.subject}\n${message.text}`.slice(0, 70_000);
  const kind = inferKind(source);
  const provider = PROVIDERS.find(([pattern]) => pattern.test(source))?.[1] ?? "Travel provider";
  const dates = extractDates(source);
  const route = kind === "flight" ? extractRoute(source) : { originCode: null, destinationCode: null };
  const flightNumber = kind === "flight" ? extractFlightNumber(source) : null;
  const confidenceReasons = [
    ...(kind !== "other" ? ["travel type recognized"] : []),
    ...(dates.length ? ["travel date recognized"] : []),
    ...(route.originCode && route.destinationCode ? ["route recognized"] : []),
    ...(provider !== "Travel provider" ? ["provider recognized"] : []),
  ];
  const confidence = confidenceReasons.length >= 3 ? "high" : confidenceReasons.length >= 2 ? "medium" : "low";
  const base = {
    kind,
    provider,
    startDate: dates[0] ?? null,
    endDate: kind === "hotel" ? dates[1] ?? null : null,
    ...route,
  };
  const { duplicate, conflicts } = compareExisting(base, existing);

  return {
    id: opaqueCandidateId(message.privateSourceId, idSecret),
    kind,
    title: `${kind === "other" ? "Travel" : titleCase(kind)} booking candidate`,
    provider,
    startDate: base.startDate,
    endDate: base.endDate,
    originCode: base.originCode,
    destinationCode: base.destinationCode,
    flightNumber,
    suggestedBookingState: conflicts.length ? "conflict" : "missing",
    confidence,
    confidenceReasons,
    duplicate,
    conflicts,
  };
}

function inferKind(text: string): GmailCandidateKind {
  if (/\b(flight|airline|boarding|departure|arrival)\b/i.test(text)) return "flight";
  if (/\b(hotel|hostel|lodging|check[ -]?in|check[ -]?out|room)\b/i.test(text)) return "hotel";
  if (/\b(train|rail|railway|eurostar)\b/i.test(text)) return "train";
  if (/\b(rental car|car rental|vehicle hire)\b/i.test(text)) return "car";
  if (/\b(tour|museum|activity|admission|experience)\b/i.test(text)) return "activity";
  return "other";
}

function extractDates(text: string): string[] {
  const values: Array<{ index: number; value: string }> = [];
  for (const match of text.matchAll(/\b(20\d{2})[-/](0[1-9]|1[0-2])[-/](0[1-9]|[12]\d|3[01])\b/g)) {
    const value = validIso(Number(match[1]), Number(match[2]), Number(match[3]));
    if (value) values.push({ index: match.index ?? 0, value });
  }
  for (const match of text.matchAll(/\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sept?(?:ember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(20\d{2})\b/gi)) {
    const value = validIso(Number(match[3]), MONTHS[match[1].toLowerCase()], Number(match[2]));
    if (value) values.push({ index: match.index ?? 0, value });
  }
  const unique = [...new Map(values.sort((a, b) => a.index - b.index).map((entry) => [entry.value, entry.value])).values()];
  if (unique.length) return unique.slice(0, 2);
  return [];
}

function validIso(year: number, month: number, day: number): string | null {
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date.toISOString().slice(0, 10);
}

function extractRoute(text: string): { originCode: string | null; destinationCode: string | null } {
  const match = text.match(/\b(?:from\s+)?([A-Z]{3})\s*(?:→|->|\bto\b)\s*([A-Z]{3})\b/);
  return match ? { originCode: match[1], destinationCode: match[2] } : { originCode: null, destinationCode: null };
}

function extractFlightNumber(text: string): string | null {
  const match = text.toUpperCase().match(new RegExp(`\\b(${FLIGHT_PREFIXES})\\s?(\\d{1,4})\\b`));
  return match ? `${match[1]}${match[2]}` : null;
}

function compareExisting(
  candidate: Pick<GmailImportCandidate, "kind" | "startDate" | "endDate" | "originCode" | "destinationCode" | "provider">,
  existing: ExistingBookingFact[],
): { duplicate: boolean; conflicts: Array<{ field: GmailCandidateConflictField; existingIndex: number }> } {
  const conflicts: Array<{ field: GmailCandidateConflictField; existingIndex: number }> = [];
  let duplicate = false;
  existing.forEach((fact, existingIndex) => {
    if (fact.kind !== candidate.kind) return;
    const routeMatches = sameRoute(candidate, fact);
    const providerMatches = sameKnownProvider(candidate.provider, fact.provider);
    const startMatches = Boolean(candidate.startDate && fact.startDate && candidate.startDate === fact.startDate);
    const endMatches = !candidate.endDate || !fact.endDate || candidate.endDate === fact.endDate;
    if (startMatches && endMatches && (routeMatches || providerMatches)) {
      duplicate = true;
      return;
    }
    if (candidate.startDate && fact.startDate && candidate.startDate !== fact.startDate && (routeMatches || providerMatches)) {
      conflicts.push({ field: "date", existingIndex });
    }
    if (startMatches && hasCompleteRoute(candidate) && hasCompleteRoute(fact) && !routeMatches) {
      conflicts.push({ field: "route", existingIndex });
    }
    if (startMatches && candidate.provider !== "Travel provider" && fact.provider
        && normalize(candidate.provider) !== normalize(fact.provider)) {
      conflicts.push({ field: "provider", existingIndex });
    }
  });
  return { duplicate, conflicts: uniqueConflicts(conflicts) };
}

function sameRoute(candidate: { originCode: string | null; destinationCode: string | null }, fact: ExistingBookingFact): boolean {
  return Boolean(hasCompleteRoute(candidate) && hasCompleteRoute(fact)
    && candidate.originCode === fact.originCode && candidate.destinationCode === fact.destinationCode);
}

function hasCompleteRoute(value: { originCode?: string | null; destinationCode?: string | null }): boolean {
  return Boolean(value.originCode && value.destinationCode);
}

function sameKnownProvider(left: string | null | undefined, right: string | null | undefined): boolean {
  return Boolean(left && right && left !== "Travel provider" && normalize(left) === normalize(right));
}

function uniqueConflicts(conflicts: Array<{ field: GmailCandidateConflictField; existingIndex: number }>) {
  return conflicts.filter((entry, index) => conflicts.findIndex((other) => other.field === entry.field && other.existingIndex === entry.existingIndex) === index);
}

function normalize(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function candidateSignature(candidate: GmailImportCandidate): string {
  const facts = [candidate.kind, candidate.startDate, candidate.endDate, candidate.originCode, candidate.destinationCode, candidate.provider, candidate.flightNumber]
    .map(normalize)
    .join("|");
  return candidate.startDate || candidate.originCode || candidate.flightNumber ? facts : `${facts}|${candidate.id}`;
}

function titleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
