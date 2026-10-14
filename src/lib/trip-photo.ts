/** A usable reference is not a live-availability or licensing verdict. */
export function usableTripPhoto(value: unknown): value is string {
  if (typeof value !== "string" || !value || /\[redacted\]|%5bredacted%5d/i.test(value)) return false;
  if (/^\/(?:guide-images|media)\/[a-z0-9-]+\.webp$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch { return false; }
}

export function preferredActivityPhoto(original: unknown, override: unknown): string {
  // Exact activity-associated bundled photos survive provider outages.
  if (usableTripPhoto(original) && original.startsWith("/")) return original;
  if (usableTripPhoto(override)) return override;
  return usableTripPhoto(original) ? original : "";
}
