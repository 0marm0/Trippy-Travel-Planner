const EMAIL = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const GMAIL_URL = /https?:\/\/(?:mail|accounts)\.google\.com\/\S*/gi;
const PRIVATE_CODE = /\b(?:confirmation|booking|reservation|record\s+locator|reference|ref|pnr|ticket)\s*(?:(?:number|no\.?|code)\s*(?:#|:|-)?|[#:-])\s*[A-Z0-9-]{4,}\b/gi;
const SEAT_OR_LOYALTY = /\b(?:seat\s+\d{1,3}[A-Z]|(?:loyalty|frequent\s+flyer|member(?:ship)?|mileage)\s*(?:(?:number|no\.?|code)\s*(?:#|:|-)?|[#:-])\s*[A-Z0-9-]{2,})\b/gi;

export function redactPrivateMailText(value: string, maxLength = 500): string {
  return value
    .replace(EMAIL, "[private email removed]")
    .replace(GMAIL_URL, "[private link removed]")
    .replace(PRIVATE_CODE, "[private code removed]")
    .replace(SEAT_OR_LOYALTY, "[private detail removed]")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export function containsForbiddenMailData(value: unknown): boolean {
  const text = typeof value === "string" ? value : JSON.stringify(value);
  resetPatterns();
  const forbidden = EMAIL.test(text) || GMAIL_URL.test(text) || PRIVATE_CODE.test(text) || SEAT_OR_LOYALTY.test(text);
  resetPatterns();
  return forbidden;
}

function resetPatterns(): void {
  EMAIL.lastIndex = 0;
  GMAIL_URL.lastIndex = 0;
  PRIVATE_CODE.lastIndex = 0;
  SEAT_OR_LOYALTY.lastIndex = 0;
}
