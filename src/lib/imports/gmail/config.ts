import "server-only";

export type GmailImportConfig = {
  clientId: string;
  clientSecret: string;
  sessionSecret: string;
  baseUrl: URL;
  redirectUri: string;
};

export type GmailConfigurationStatus = {
  enabled: boolean;
  reason: "disabled" | "incomplete" | "invalid" | "ready";
};

export function gmailConfigurationStatus(): GmailConfigurationStatus {
  if (process.env.TRIPPY_ENABLE_GMAIL_IMPORT !== "true") return { enabled: false, reason: "disabled" };
  const values = [
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.TRIPPY_GMAIL_SESSION_SECRET,
    process.env.APP_BASE_URL,
  ];
  if (values.some((value) => !value?.trim())) return { enabled: false, reason: "incomplete" };

  try {
    const baseUrl = new URL(process.env.APP_BASE_URL!);
    const loopback = baseUrl.hostname === "localhost" || baseUrl.hostname === "127.0.0.1" || baseUrl.hostname === "::1" || baseUrl.hostname === "[::1]";
    const safeProtocol = baseUrl.protocol === "https:" || (loopback && baseUrl.protocol === "http:");
    const noPath = baseUrl.pathname === "/" && !baseUrl.search && !baseUrl.hash && !baseUrl.username && !baseUrl.password;
    if (!safeProtocol || !noPath || process.env.TRIPPY_GMAIL_SESSION_SECRET!.trim().length < 32) {
      return { enabled: false, reason: "invalid" };
    }
  } catch {
    return { enabled: false, reason: "invalid" };
  }
  return { enabled: true, reason: "ready" };
}

export function requireGmailImportConfig(): GmailImportConfig {
  if (!gmailConfigurationStatus().enabled) throw new Error("Gmail import is not configured");
  const baseUrl = new URL(process.env.APP_BASE_URL!);
  return {
    clientId: process.env.GOOGLE_OAUTH_CLIENT_ID!.trim(),
    clientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET!.trim(),
    sessionSecret: process.env.TRIPPY_GMAIL_SESSION_SECRET!.trim(),
    baseUrl,
    redirectUri: new URL("/api/integrations/gmail/callback", baseUrl).toString(),
  };
}
