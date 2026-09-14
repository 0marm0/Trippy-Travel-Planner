import { createHash, randomBytes } from "node:crypto";

import type { GmailImportConfig } from "./config.ts";

export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const GOOGLE_AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
export const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
export const GOOGLE_REVOKE_ENDPOINT = "https://oauth2.googleapis.com/revoke";

export type OAuthFlowState = {
  state: string;
  verifier: string;
  expiresAt: number;
};

export type GmailTokenSession = {
  accessToken: string;
  expiresAt: number;
  scope: string;
};

export function createOAuthFlow(config: GmailImportConfig, now = Date.now()): { authorizationUrl: string; flow: OAuthFlowState } {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(64).toString("base64url");
  const challenge = createHash("sha256").update(verifier, "utf8").digest("base64url");
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: "code",
    scope: GMAIL_READONLY_SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: "S256",
    access_type: "online",
  });
  return {
    authorizationUrl: `${GOOGLE_AUTHORIZATION_ENDPOINT}?${params}`,
    flow: { state, verifier, expiresAt: now + 10 * 60 * 1_000 },
  };
}

export async function exchangeAuthorizationCode(
  config: GmailImportConfig,
  code: string,
  verifier: string,
  fetchImpl: typeof fetch = fetch,
): Promise<GmailTokenSession> {
  const response = await fetchImpl(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: config.redirectUri,
      grant_type: "authorization_code",
      code_verifier: verifier,
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error("OAuth token exchange failed");
  const payload: unknown = await response.json();
  if (!isRecord(payload)) throw new Error("OAuth token response was invalid");
  const accessToken = typeof payload.access_token === "string" ? payload.access_token : "";
  const expiresIn = typeof payload.expires_in === "number" ? payload.expires_in : 0;
  const scope = typeof payload.scope === "string" ? payload.scope : "";
  if (!accessToken || expiresIn < 60 || !hasExactGmailReadOnlyScope(scope)) {
    throw new Error("OAuth token response did not include the required scope");
  }
  return { accessToken, expiresAt: Date.now() + Math.min(expiresIn, 3_600) * 1_000, scope };
}

export function hasExactGmailReadOnlyScope(scope: string): boolean {
  const scopes = scope.trim().split(/\s+/).filter(Boolean);
  return scopes.length === 1 && scopes[0] === GMAIL_READONLY_SCOPE;
}

export async function revokeGoogleToken(accessToken: string, fetchImpl: typeof fetch = fetch): Promise<void> {
  try {
    await fetchImpl(GOOGLE_REVOKE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ token: accessToken }),
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    });
  } catch {
    // Local token disposal must still succeed when Google is unavailable.
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
