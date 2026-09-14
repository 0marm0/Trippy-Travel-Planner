import "server-only";

import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { basename, join } from "node:path";
import { homedir } from "node:os";

export type ItineraryRecord = Record<string, unknown>;

export type PrivateItineraryImage = {
  id: string;
  contentType: string;
  alt: string;
  endpoint: string;
};

export type ItineraryCredit = {
  label: string;
  href: string;
};

export type ItineraryDrivingGuidance = {
  label: string;
  title: string;
  paragraphs: string[];
};

export type ItineraryBookingItem = {
  priority: "critical" | null;
  when: string | null;
  title: string;
  body: string | null;
};

export type ItineraryCard = {
  title: string;
  description: string;
  meta: string | null;
  imageId: string | null;
  links: Array<{ href: string; label: string }>;
};

export type ItineraryDestination = {
  id: string;
  country: string;
  name: string;
  heroImageId: string | null;
  lede: string;
  stay: string;
  signature: {
    label: string;
    title: string;
    description: string;
    meta: string | null;
    imageId: string | null;
  } | null;
  tiers: Array<{
    rank: 1 | 2 | 3;
    label: string;
    count: string | null;
    items: ItineraryCard[];
  }>;
};

export type PrivateItinerary = {
  sourceName: string;
  routes: ItineraryRecord[];
  destinations: ItineraryDestination[];
  images: PrivateItineraryImage[];
  credits: ItineraryCredit[];
  drivingGuidance: ItineraryDrivingGuidance[];
  bookingChecklist: ItineraryBookingItem[];
};

type EmbeddedImage = PrivateItineraryImage & { base64: string };

type LoadedItinerary = PrivateItinerary & {
  imageData: Map<string, EmbeddedImage>;
};

type CacheEntry = {
  filePath: string;
  modifiedMs: number;
  value: LoadedItinerary;
};

let cache: CacheEntry | null = null;

const DEFAULT_ITINERARY_FILENAME = "europe-planner2.html";
const DATA_ASSIGNMENT = /\b(?:var|let|const)\s+DATA\s*=\s*/g;

/**
 * This intentionally stays outside the repository. An explicit environment
 * variable is useful for a different private checkout, while the default does
 * not encode a person's home directory.
 */
export function getPrivateItineraryPath(): string {
  return process.env.TRIPPY_ITINERARY_PATH?.trim() || join(homedir(), "Desktop", DEFAULT_ITINERARY_FILENAME);
}

/** Read the HTML as inert text; no source JavaScript is evaluated. */
export async function loadPrivateItinerary(): Promise<PrivateItinerary> {
  const loaded = await loadItineraryWithImages();
  return {
    sourceName: loaded.sourceName,
    routes: loaded.routes,
    destinations: loaded.destinations,
    images: loaded.images,
    credits: loaded.credits,
    drivingGuidance: loaded.drivingGuidance,
    bookingChecklist: loaded.bookingChecklist,
  };
}

export async function loadPrivateItineraryImage(id: string): Promise<EmbeddedImage | null> {
  const loaded = await loadItineraryWithImages();
  return loaded.imageData.get(id) ?? null;
}

async function loadItineraryWithImages(): Promise<LoadedItinerary> {
  const filePath = getPrivateItineraryPath();
  // The source is intentionally outside this application; never trace or bundle it.
  const fileInfo = await stat(/* turbopackIgnore: true */ filePath);

  if (cache?.filePath === filePath && cache.modifiedMs === fileInfo.mtimeMs) {
    return cache.value;
  }

  const html = await readFile(/* turbopackIgnore: true */ filePath, "utf8");
  const imageData = new Map<string, EmbeddedImage>();
  const routes = extractRoutes(html);
  const destinations = extractDestinations(html, imageData);
  const value: LoadedItinerary = {
    sourceName: basename(filePath),
    routes,
    destinations,
    images: [...imageData.values()].map((image) => ({
      id: image.id,
      contentType: image.contentType,
      alt: image.alt,
      endpoint: image.endpoint,
    })),
    credits: extractCredits(html),
    drivingGuidance: extractDrivingGuidance(html),
    bookingChecklist: extractBookingChecklist(html),
    imageData,
  };

  cache = { filePath, modifiedMs: fileInfo.mtimeMs, value };
  return value;
}

function extractDrivingGuidance(html: string): ItineraryDrivingGuidance[] {
  const section = elementById(html, "section", "driving");
  if (!section) return [];

  return [...section.matchAll(/<div\b(?=[^>]*\bclass=(?:"[^"]*\bdbox\b[^"]*"|'[^']*\bdbox\b[^']*'|dbox))([^>]*)>([\s\S]*?)<\/div>/gi)]
    .map((card) => ({
      label: classText(card[2], "kick"),
      title: tagText(card[2], "h4"),
      paragraphs: [...card[2].matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)].map((paragraph) => textContent(paragraph[1])),
    }))
    .filter((card) => card.label || card.title || card.paragraphs.length > 0);
}

function extractBookingChecklist(html: string): ItineraryBookingItem[] {
  const section = elementById(html, "details", "book");
  if (!section) return [];

  return [...section.matchAll(/<li\b([^>]*)>([\s\S]*?)<\/li>/gi)]
    .filter((item) => /\bbk\b/.test(getAttribute(item[1], "class") ?? ""))
    .map<ItineraryBookingItem>((item) => {
      const className = getAttribute(item[1], "class") ?? "";
      return {
        priority: /\bcrit\b/.test(className) ? "critical" : null,
        when: classText(item[2], "bw") || null,
        title: tagText(item[2], "b"),
        body: tagText(item[2], "em") || null,
      };
    })
    .filter((item) => item.when || item.title || item.body);
}

function elementById(markup: string, tag: string, id: string): string | null {
  const escapedTag = escapeRegex(tag);
  const escapedId = escapeRegex(id);
  const element = markup.match(
    new RegExp(`<${escapedTag}\\b[^>]*\\bid=(?:"${escapedId}"|'${escapedId}')[^>]*>([\\s\\S]*?)<\\/${escapedTag}>`, "i"),
  );
  return element?.[1] ?? null;
}

/**
 * Credit text stays exactly as supplied by the source's credit item; this
 * makes no claim about rights or the current availability of a linked page.
 */
function extractCredits(html: string): ItineraryCredit[] {
  const creditsBlock = html.match(
    /<(ul|ol|div)\b[^>]*\bclass=(?:"[^"]*\bcreds\b[^"]*"|'[^']*\bcreds\b[^']*')[^>]*>([\s\S]*?)<\/\1>/i,
  )?.[2];
  const source = creditsBlock ?? html.match(/<footer\b[^>]*>([\s\S]*?)<\/footer>/i)?.[1] ?? "";
  const seen = new Set<string>();
  const credits: ItineraryCredit[] = [];

  for (const item of source.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/gi)) {
    const anchor = item[1].match(/<a\b([^>]*)>([\s\S]*?)<\/a>/i);
    const href = anchor ? decodeHtml(getAttribute(anchor[1], "href") ?? "") : "";
    const label = textContent(item[1]);
    if (!href || !label || seen.has(`${href}\u0000${label}`)) continue;
    seen.add(`${href}\u0000${label}`);
    credits.push({ label, href });
  }

  // Some source versions use footer anchors without a `.creds` list.
  if (!creditsBlock) {
    for (const anchor of source.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
      const href = decodeHtml(getAttribute(anchor[1], "href") ?? "");
      const label = textContent(anchor[2]);
      if (!href || !label || seen.has(`${href}\u0000${label}`)) continue;
      seen.add(`${href}\u0000${label}`);
      credits.push({ label, href });
    }
  }

  return credits;
}

export function isLoopbackRequest(request: Request): boolean {
  const host = request.headers.get("host")?.trim().toLowerCase();
  return host !== undefined && /^(?:localhost|127\.0\.0\.1)(?::\d+)?$|^\[::1\](?::\d+)?$/.test(host);
}

function extractRoutes(html: string): ItineraryRecord[] {
  const assignment = DATA_ASSIGNMENT.exec(html);
  DATA_ASSIGNMENT.lastIndex = 0;
  if (!assignment) {
    throw new Error("Private itinerary does not contain a DATA assignment.");
  }

  const jsonStart = html.indexOf("{", assignment.index + assignment[0].length);
  if (jsonStart < 0) {
    throw new Error("Private itinerary DATA assignment is malformed.");
  }

  const parsed: unknown = JSON.parse(extractBalancedObject(html, jsonStart));
  if (!isRecord(parsed)) {
    throw new Error("Private itinerary DATA value is not an object.");
  }

  return Object.values(parsed).filter(isRecord);
}

/** Extract one JSON object while respecting quoted strings and escapes. */
function extractBalancedObject(source: string, start: number): string {
  let depth = 0;
  let quote: '"' | "'" | null = null;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (character === "\\") {
        escaped = true;
      } else if (character === quote) {
        quote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      quote = character;
    } else if (character === "{") {
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  throw new Error("Private itinerary DATA object is not balanced.");
}

function extractDestinations(html: string, images: Map<string, EmbeddedImage>): ItineraryDestination[] {
  const starts = [...html.matchAll(/<details\b[^>]*\bclass=(?:"[^"]*\bdest\b[^"]*"|'[^']*\bdest\b[^']*')[^>]*\bid=(?:"([^"]+)"|'([^']+)')/gi)];

  return starts.map((match, index) => {
    const id = match[1] ?? match[2];
    const start = match.index ?? 0;
    const end = index + 1 < starts.length ? (starts[index + 1].index ?? html.length) : html.length;
    return extractDestination(id, html.slice(start, end), images);
  });
}

function extractDestination(id: string, markup: string, images: Map<string, EmbeddedImage>): ItineraryDestination {
  const firstTierIndex = markup.search(/<section\b[^>]*\bclass=(?:"[^"]*\btier1\b[^"]*"|'[^']*\btier1\b[^']*')[^>]*>/i);
  const intro = firstTierIndex >= 0 ? markup.slice(0, firstTierIndex) : markup;
  const summary = intro.match(/<summary\b[^>]*\bclass=(?:"[^"]*\bsum\b[^"]*"|'[^']*\bsum\b[^']*')[^>]*>([\s\S]*?)<\/summary>/i)?.[1] ?? "";
  const signature = extractSignature(intro, images);
  const itemsByRank = new Map<1 | 2 | 3, ItineraryCard[]>([
    [1, []],
    [2, []],
    [3, []],
  ]);

  for (const article of markup.matchAll(/<article\b([^>]*)>([\s\S]*?)<\/article>/gi)) {
    const className = getAttribute(article[1], "class") ?? "";
    const rank = className.match(/\bc([123])\b/)?.[1];
    if (!rank) continue;
    itemsByRank.get(Number(rank) as 1 | 2 | 3)?.push(extractCard(article[2], images));
  }

  return {
    id,
    country: classText(summary, "sumc"),
    name: classText(summary, "sumname"),
    heroImageId: imageIdFromMarkup(summary, images),
    lede: classText(intro, "lede"),
    stay: classText(intro, "stay"),
    signature,
    tiers: ([1, 2, 3] as const).map((rank) => {
      const heading = tierHeading(markup, rank);
      const { label, count } = splitTierHeading(heading, rank);
      return { rank, label, count, items: itemsByRank.get(rank) ?? [] };
    }),
  };
}

function extractSignature(markup: string, images: Map<string, EmbeddedImage>): ItineraryDestination["signature"] {
  const signatureStart = markup.search(/<div\b[^>]*\bclass=(?:"[^"]*\bintro\b[^"]*"|'[^']*\bintro\b[^']*')[^>]*>/i);
  if (signatureStart < 0) return null;
  const signatureMarkup = markup.slice(signatureStart);
  const title = tagText(signatureMarkup, "h3");
  const description = firstParagraphText(signatureMarkup);
  if (!title && !description) return null;

  return {
    label: classText(signatureMarkup, "tag"),
    title,
    description,
    meta: classText(signatureMarkup, "meta") || null,
    imageId: imageIdFromMarkup(
      signatureMarkup.match(/<span\b[^>]*\bclass=(?:"[^"]*\bsigimg\b[^"]*"|'[^']*\bsigimg\b[^']*')[^>]*>([\s\S]*?)<\/span>/i)?.[1] ?? "",
      images,
    ),
  };
}

function extractCard(markup: string, images: Map<string, EmbeddedImage>): ItineraryCard {
  return {
    title: tagText(markup, "h5"),
    description: firstParagraphText(markup),
    meta: classText(markup, "meta") || null,
    imageId: imageIdFromMarkup(markup, images),
    links: [...markup.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)]
      .map((link) => ({ href: decodeHtml(getAttribute(link[1], "href") ?? ""), label: textContent(link[2]) }))
      .filter((link) => link.href.length > 0),
  };
}

function tierHeading(markup: string, rank: 1 | 2 | 3): string {
  const tier = markup.match(
    new RegExp(
      `<(?:section|details)\\b[^>]*\\bclass=(?:"[^"]*\\btier${rank}\\b[^"]*"|'[^']*\\btier${rank}\\b[^']*')[^>]*>([\\s\\S]*?)(?=<article\\b)`,
      "i",
    ),
  )?.[1] ?? "";
  return textContent(tier);
}

function splitTierHeading(heading: string, rank: 1 | 2 | 3): { label: string; count: string | null } {
  const match = heading.match(/^(.*?)(?:\s+(\d+))?$/);
  const fallback = rank === 1 ? "Must do" : rank === 2 ? "Worth it" : "If there is time";
  return { label: match?.[1]?.trim() || fallback, count: match?.[2] ?? null };
}

function imageIdFromMarkup(markup: string, images: Map<string, EmbeddedImage>): string | null {
  const imageTag = markup.match(/<img\b([^>]*)>/i)?.[1];
  if (!imageTag) return null;
  const source = getAttribute(imageTag, "src");
  if (!source) return null;
  const match = source.match(/^data:(image\/[a-z0-9.+-]+);base64,([a-z0-9+/=\s]+)$/i);
  if (!match) return null;

  const id = createHash("sha256").update(source).digest("hex").slice(0, 24);
  const alt = textContent(getAttribute(imageTag, "alt") ?? "");
  const existing = images.get(id);
  if (existing) {
    if (!existing.alt && alt) existing.alt = alt;
    return id;
  }

  images.set(id, {
    id,
    contentType: match[1].toLowerCase(),
    alt,
    endpoint: `/api/itinerary/image/${id}`,
    base64: match[2].replace(/\s/g, ""),
  });
  return id;
}

function classText(markup: string, className: string): string {
  const escaped = escapeRegex(className);
  const element = markup.match(
    new RegExp(
      `<([a-z0-9]+)\\b[^>]*\\bclass=(?:"[^"]*\\b${escaped}\\b[^"]*"|'[^']*\\b${escaped}\\b[^']*'|${escaped})[^>]*>([\\s\\S]*?)<\\/\\1>`,
      "i",
    ),
  );
  return element ? textContent(element[2]) : "";
}

function tagText(markup: string, tag: string): string {
  return textContent(markup.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"))?.[1] ?? "");
}

function firstParagraphText(markup: string): string {
  return tagText(markup, "p");
}

function getAttribute(markup: string, name: string): string | null {
  const escaped = escapeRegex(name);
  const match = markup.match(new RegExp(`\\b${escaped}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i"));
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? null;
}

function textContent(markup: string): string {
  return decodeHtml(markup.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

function decodeHtml(value: string): string {
  const named: Record<string, string> = { amp: "&", apos: "'", gt: ">", lt: "<", nbsp: " ", quot: '"' };
  return value.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z]+);/g, (entity, token: string) => {
    if (token.startsWith("#x") || token.startsWith("#X")) return String.fromCodePoint(Number.parseInt(token.slice(2), 16));
    if (token.startsWith("#")) return String.fromCodePoint(Number.parseInt(token.slice(1), 10));
    return named[token] ?? entity;
  });
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isRecord(value: unknown): value is ItineraryRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
