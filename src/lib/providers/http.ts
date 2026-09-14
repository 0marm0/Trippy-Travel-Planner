import { ProviderError } from "./errors.ts";
import type { LiveProviderId } from "./types.ts";

export type FetchLike = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

export async function fetchProviderJson(options: {
  provider: LiveProviderId;
  fetchImpl?: FetchLike;
  url: URL;
  init?: RequestInit;
  timeoutMs: number;
  signal?: AbortSignal;
}): Promise<{ payload: unknown; response: Response }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(new DOMException("Provider timeout", "TimeoutError")), options.timeoutMs);
  const abortFromParent = () => controller.abort(options.signal?.reason);
  options.signal?.addEventListener("abort", abortFromParent, { once: true });

  try {
    const response = await (options.fetchImpl ?? fetch)(options.url, {
      ...options.init,
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    const retryAfterSeconds = parseRetryAfter(response.headers.get("retry-after"));

    if (!response.ok) {
      throw new ProviderError({
        provider: options.provider,
        code:
          response.status === 429
            ? "rate-limited"
            : response.status === 401 || response.status === 403
              ? "authentication"
              : response.status >= 400 && response.status < 500
                ? "invalid-request"
                : "upstream-error",
        message: `Provider HTTP ${response.status}`,
        retryable: response.status === 429 || response.status >= 500,
        retryAfterSeconds,
      });
    }

    try {
      return { payload: await response.json(), response };
    } catch (error) {
      throw new ProviderError({
        provider: options.provider,
        code: "invalid-response",
        message: "Provider returned non-JSON content",
        cause: error,
      });
    }
  } catch (error) {
    if (error instanceof ProviderError) throw error;
    if (controller.signal.aborted) {
      throw new ProviderError({
        provider: options.provider,
        code: "timeout",
        message: "Provider request aborted",
        retryable: !options.signal?.aborted,
        cause: error,
      });
    }
    throw new ProviderError({
      provider: options.provider,
      code: "upstream-error",
      message: "Provider fetch failed",
      retryable: true,
      cause: error,
    });
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortFromParent);
  }
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return Math.min(Math.ceil(seconds), 86_400);
  const at = Date.parse(value);
  return Number.isFinite(at) ? Math.min(Math.max(Math.ceil((at - Date.now()) / 1_000), 0), 86_400) : undefined;
}
