import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const VERSION = "v1";

function keyFromSecret(secret: string): Buffer {
  return createHash("sha256").update(secret, "utf8").digest();
}

export function sealPrivatePayload(value: unknown, secret: string, purpose: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyFromSecret(secret), iv);
  cipher.setAAD(Buffer.from(`${VERSION}:${purpose}`, "utf8"));
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [VERSION, iv.toString("base64url"), ciphertext.toString("base64url"), tag.toString("base64url")].join(".");
}

export function openPrivatePayload<T>(sealed: string | undefined, secret: string, purpose: string): T | null {
  if (!sealed) return null;
  const parts = sealed.split(".");
  if (parts.length !== 4 || parts[0] !== VERSION) return null;

  try {
    const iv = Buffer.from(parts[1], "base64url");
    const ciphertext = Buffer.from(parts[2], "base64url");
    const tag = Buffer.from(parts[3], "base64url");
    if (iv.length !== 12 || tag.length !== 16 || ciphertext.length > 12_000) return null;
    const decipher = createDecipheriv("aes-256-gcm", keyFromSecret(secret), iv);
    decipher.setAAD(Buffer.from(`${VERSION}:${purpose}`, "utf8"));
    decipher.setAuthTag(tag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
    return JSON.parse(plaintext) as T;
  } catch {
    return null;
  }
}

export function opaqueCandidateId(privateSourceId: string, secret: string): string {
  return createHmac("sha256", keyFromSecret(secret)).update(`candidate:${privateSourceId}`, "utf8").digest("base64url").slice(0, 22);
}

export function equalState(left: string, right: string): boolean {
  const a = Buffer.from(left, "utf8");
  const b = Buffer.from(right, "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}
