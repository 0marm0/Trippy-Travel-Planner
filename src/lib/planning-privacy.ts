/** Shared client/server planning boundary. Never echo rejected values in errors. */
export function hasPrivatePlanningText(value: string): boolean {
  return /\b(?:api[\s_-]?key|access[\s_-]?token|client[\s_-]?secret|oauth|bearer|password|secret|token|confirmation|pnr|booking[\s_-]?(?:reference|number|code)|record[\s_-]?locator|loyalty(?:[\s_-]?id)?|seat[\s_-]?(?:assignment|number|\d{1,3}[a-z]))\b|\b(?:sk-|ghp_|github_pat_|AIza|ya29\.)[a-z0-9_-]+|\b\d{9,}\b/i.test(value.normalize("NFKC"));
}
