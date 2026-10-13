const patterns = [
  /https?:\/\/(?:mail\.google\.com|gmail\.com)\/[^\s"']*/gi,
  /mailto:[^\s"']+/gi,
  /[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g,
  /\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[A-Za-z0-9_-]{12,}/g,
  /\bBearer\s+[A-Za-z0-9_.~+\/-]{12,}/gi,
  /\b\d{9,}\b/g,
  /\b(?:confirmation|reservation|booking|record)\s*(?:number|code|reference|ref|locator)\s*[:#-]?\s*[A-Z0-9-]{4,}/gi,
  /\b(?:PNR|loyalty(?: number| id)?|member(?: number| id)?|frequent flyer|seat)\s*[:#-]?\s*[A-Z0-9-]{2,}/gi,
];
export const forbiddenSampleKey = /confirmation|booking.?ref|record.?locator|loyalty|frequent.?flyer|email|seat.?assignment|api.?key|token|secret|authorization|password|raw.?mail|message.?id/i;
export function redactSampleString(value) {
  const text = patterns.reduce((result, pattern) => result.replace(pattern, '[redacted]'), value);
  if (!/^https?:\/\//i.test(text)) return text;
  try {
    const url = new URL(text);
    if (url.username || url.password || url.protocol !== 'https:' || /mail\.google\.com|gmail\.com/i.test(url.hostname)) return '';
    // Source/photo URLs may keep innocuous resizing parameters. Booking links
    // are removed separately, and account/ref/token query strings fail closed.
    if ([...url.searchParams.keys()].some((key) => /key|token|auth|secret|signature|credential|email|ref|confirm|booking|session|loyalty/i.test(key))) return '';
    url.hash = '';
    return url.href;
  } catch { return ''; }
}
export function sanitizePublicSample(value) {
  if (typeof value === 'string') return redactSampleString(value);
  if (Array.isArray(value)) return value.map(sanitizePublicSample);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).filter(([key]) => !forbiddenSampleKey.test(key)).map(([key, child]) => [key, sanitizePublicSample(child)]));
}
