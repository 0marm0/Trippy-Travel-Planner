import type { LiveProviderId, ProviderErrorCode, ProviderFailure } from "./types.ts";

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly provider: LiveProviderId;
  readonly retryable: boolean;
  readonly retryAfterSeconds?: number;

  constructor(options: {
    provider: LiveProviderId;
    code: ProviderErrorCode;
    message: string;
    retryable?: boolean;
    retryAfterSeconds?: number;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "ProviderError";
    this.provider = options.provider;
    this.code = options.code;
    this.retryable = options.retryable ?? false;
    this.retryAfterSeconds = options.retryAfterSeconds;
  }
}

const SAFE_MESSAGES: Record<ProviderErrorCode, string> = {
  "access-locked": "Live provider access is locked. Manual research remains available.",
  "not-configured": "This provider is not configured; manual research remains available.",
  "not-supported": "This provider does not support this search type.",
  "invalid-request": "The provider could not accept this search.",
  authentication: "The provider rejected its server-side credentials.",
  "rate-limited": "The provider rate limit was reached. Try again later.",
  timeout: "The provider did not respond before the timeout.",
  "upstream-error": "The provider is temporarily unavailable.",
  "invalid-response": "The provider returned an unusable response.",
};

export function toProviderFailure(error: unknown, fallbackProvider: LiveProviderId): ProviderFailure {
  const normalized =
    error instanceof ProviderError
      ? error
      : new ProviderError({
          provider: fallbackProvider,
          code: "upstream-error",
          message: "Unexpected provider failure",
          retryable: true,
          cause: error,
        });

  return {
    provider: normalized.provider,
    mode: "live",
    status: normalized.code === "access-locked" ? "locked" : normalized.code === "not-configured" ? "unconfigured" : "error",
    checkedAt: new Date().toISOString(),
    limitations: ["No booking or confirmation is implied by this provider response."],
    error: {
      code: normalized.code,
      message: SAFE_MESSAGES[normalized.code],
      retryable: normalized.retryable,
      ...(normalized.retryAfterSeconds === undefined ? {} : { retryAfterSeconds: normalized.retryAfterSeconds }),
    },
  };
}
