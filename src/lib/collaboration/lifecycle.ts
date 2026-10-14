import { CollaborationError } from "./schema.ts";

export const MAX_INVITATION_LIFETIME_MS = 30 * 24 * 60 * 60 * 1000;
export const DEFAULT_INVITATION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;

/** Expiry is fixed at issue time; legacy NULL expiries remain valid until revoked. */
export function invitationExpiry(input: unknown, now: number) {
  if (input === undefined) return now + DEFAULT_INVITATION_LIFETIME_MS;
  if (typeof input !== "string" || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(input)) throw new CollaborationError(400, "Use an ISO UTC invitation expiry.");
  const expires = Date.parse(input);
  if (!Number.isFinite(expires) || new Date(expires).toISOString() !== input || expires <= now || expires > now + MAX_INVITATION_LIFETIME_MS) throw new CollaborationError(400, "Invitation expiry must be in the next 30 days.");
  return expires;
}
