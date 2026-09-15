const cityAliases: Record<string, string> = {
  adenau: "ring",
  bruxelles: "brussels",
  munchen: "munich",
  muenchen: "munich",
  nurburg: "ring",
  nurburgring: "ring",
  nuerburg: "ring",
  nuerburgring: "ring",
};

export function canonicalCityKey(value: string) {
  const key = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return cityAliases[key] || key;
}
