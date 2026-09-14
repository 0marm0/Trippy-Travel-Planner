import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { ProviderAccessState } from "./types.ts";

export const PROVIDER_SESSION_COOKIE = "trippy_provider_session";
export const PROVIDER_SESSION_TTL_SECONDS = 12 * 60 * 60;

type AccessConfig = {
  nodeEnv: string | undefined;
  accessCode: string | undefined;
  sessionSecret: string | undefined;
};

export function getProviderAccessState(request: Request, config: AccessConfig = environmentAccessConfig()): ProviderAccessState {
  if (config.nodeEnv === "development" && isLoopback(new URL(request.url).hostname)) {
    return { state: "available", reason: "Loopback development session" };
  }
  const secret = validSessionSecret(config.sessionSecret);
  const token = readCookie(request.headers.get("cookie"), PROVIDER_SESSION_COOKIE);
  if (secret && token && verifyProviderSession(token, secret)) {
    return { state: "available", reason: "Private provider session" };
  }
  return { state: "locked", reason: "Live provider calls require a private session; manual research remains available." };
}

export function providerAccessConfigured(config: AccessConfig = environmentAccessConfig()): boolean {
  return Boolean(validAccessCode(config.accessCode) && validSessionSecret(config.sessionSecret));
}

export function providerSessionOriginAllowed(request: Request, nodeEnv: string | undefined): boolean {
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (!origin) return nodeEnv === "development" && isLoopback(requestUrl.hostname);
  try {
    return new URL(origin).origin === requestUrl.origin;
  } catch {
    return false;
  }
}

export function providerRateLimitKey(request: Request): string {
  const forwarded = request.headers.get("x-vercel-forwarded-for") ?? request.headers.get("x-forwarded-for") ?? "unknown-client";
  const firstAddress = forwarded.split(",", 1)[0]?.trim().slice(0, 128) || "unknown-client";
  const agent = request.headers.get("user-agent")?.slice(0, 256) ?? "unknown-agent";
  return createHash("sha256").update(`${firstAddress}\u0000${agent}`, "utf8").digest("base64url");
}

export function verifyProviderAccessCode(candidate: unknown, config: AccessConfig = environmentAccessConfig()): boolean {
  const expected = validAccessCode(config.accessCode);
  if (typeof candidate !== "string" || !expected || candidate.length > 256) return false;
  const actualDigest = createHash("sha256").update(candidate, "utf8").digest();
  const expectedDigest = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(actualDigest, expectedDigest);
}

export function createProviderSession(secretValue: string, now = Date.now()): string {
  const secret = validSessionSecret(secretValue);
  if (!secret) throw new Error("Provider session configuration is unavailable");
  const expiresAt = Math.floor(now / 1_000) + PROVIDER_SESSION_TTL_SECONDS;
  const unsigned = `v1.${expiresAt}.${randomBytes(16).toString("base64url")}`;
  return `${unsigned}.${sign(unsigned, secret)}`;
}

export function verifyProviderSession(token: string, secretValue: string, now = Date.now()): boolean {
  const secret = validSessionSecret(secretValue);
  if (!secret || token.length > 512) return false;
  const segments = token.split(".");
  if (segments.length !== 4 || segments[0] !== "v1" || !/^\d{10}$/.test(segments[1]) || !/^[A-Za-z0-9_-]{16,64}$/.test(segments[2])) return false;
  const expiresAt = Number(segments[1]);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(now / 1_000)) return false;
  const unsigned = segments.slice(0, 3).join(".");
  return safeEqual(segments[3], sign(unsigned, secret));
}

export function providerSessionCookie(token: string, secure: boolean): string {
  return `${PROVIDER_SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${PROVIDER_SESSION_TTL_SECONDS}${secure ? "; Secure" : ""}`;
}

export function clearProviderSessionCookie(secure: boolean): string {
  return `${PROVIDER_SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? "; Secure" : ""}`;
}

export function environmentAccessConfig(): AccessConfig {
  return {
    nodeEnv: process.env.NODE_ENV,
    accessCode: process.env.TRIPPY_ACCESS_CODE,
    sessionSecret: process.env.TRIPPY_SESSION_SECRET,
  };
}

function validAccessCode(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized && normalized.length >= 12 && !/^your_.+_here$/i.test(normalized) ? normalized : undefined;
}

function validSessionSecret(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  return normalized && normalized.length >= 32 && !/^your_.+_here$/i.test(normalized) ? normalized : undefined;
}

function sign(value: string, secret: string): string {
  return createHmac("sha256", secret).update(value, "utf8").digest("base64url");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left, "utf8");
  const rightBuffer = Buffer.from(right, "utf8");
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function readCookie(header: string | null, name: string): string | undefined {
  return header
    ?.split(";")
    .map((item) => item.trim().split("=", 2))
    .find(([key]) => key === name)?.[1];
}

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "[::1]" || hostname === "::1";
}
