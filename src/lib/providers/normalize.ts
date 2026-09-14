import type { Money, ProviderResult, SearchKind } from "./types.ts";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function records(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

export function text(value: unknown, maxLength = 500): string | undefined {
  if (typeof value !== "string" && typeof value !== "number") return undefined;
  const normalized = String(value).replace(/[\u0000-\u001F\u007F]/g, " ").replace(/\s+/g, " ").trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

export function number(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function integer(value: unknown): number | undefined {
  const parsed = number(value);
  return parsed !== undefined && Number.isInteger(parsed) ? parsed : undefined;
}

export function money(amount: unknown, currency: unknown, unit: Money["unit"], display?: unknown): Money | undefined {
  const normalizedAmount = number(amount);
  const normalizedCurrency = text(currency, 3)?.toUpperCase();
  if (normalizedAmount === undefined || normalizedAmount < 0 || !normalizedCurrency?.match(/^[A-Z]{3}$/)) return undefined;
  return {
    amount: normalizedAmount,
    currency: normalizedCurrency,
    unit,
    ...(text(display, 80) ? { display: text(display, 80) } : {}),
  };
}

export function safeProviderUrl(value: unknown, forbiddenValues: readonly string[] = []): string | undefined {
  const raw = text(value, 2_000);
  if (!raw) return undefined;
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") return undefined;
    for (const name of url.searchParams.keys()) {
      if (/(?:api[_-]?key|token|authorization|secret|credential)/i.test(name)) return undefined;
    }
    if (url.username || url.password) return undefined;
    if (
      forbiddenValues
        .map((item) => item.trim())
        .filter((item) => item.length >= 8)
        .some((item) => url.toString().includes(item) || url.toString().includes(encodeURIComponent(item)))
    ) {
      return undefined;
    }
    return url.toString();
  } catch {
    return undefined;
  }
}

export function stableResultId(provider: string, kind: SearchKind, index: number, seed: unknown): string {
  const source = `${provider}:${kind}:${text(seed, 200) ?? index}:${index}`;
  let hash = 2166136261;
  for (let position = 0; position < source.length; position += 1) {
    hash ^= source.charCodeAt(position);
    hash = Math.imul(hash, 16777619);
  }
  return `${provider}:${kind}:${(hash >>> 0).toString(36)}`;
}

export function compactResult(result: ProviderResult): ProviderResult {
  return Object.fromEntries(Object.entries(result).filter(([, value]) => value !== undefined)) as ProviderResult;
}
