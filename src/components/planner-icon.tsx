import type { SVGProps } from "react";
const travelArtwork: Record<string, { file: string; viewBox: string }> = {
  flight: { file: "flights", viewBox: "220 230 820 820" },
  train: { file: "train-rail", viewBox: "150 165 960 960" },
  car: { file: "car", viewBox: "225 210 825 825" },
  stays: { file: "hotel-bed", viewBox: "250 260 755 755" },
  activities: { file: "star-activities", viewBox: "190 210 875 875" },
};
const paths: Record<string, string> = {
  route: "M5 5h9a4 4 0 0 1 0 8H9a4 4 0 0 0 0 8h10 M5 2v6 M19 18v5",
  flight: "m22 2-7 20-5-8-8-5 20-7ZM10 14 22 2",
  train: "M4 15.5V6a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9.5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3ZM8 21l2-2.5m6 2.5-2-2.5M7 7h10M7 12h.01M17 12h.01",
  car: "M5 17h14l-1-6-2-3H8l-2 3-1 6Zm0 0v2m14-2v2M7 13h10M8 17h.01M16 17h.01",
  cities: "M3 21V7l6-4v18M9 9l6-3v15M15 12l6-2v11M2 21h20M5 9v1m0 3v1m6-3v1m6 2v1",
  stays: "M3 18v3m18-3v3M3 18h18v-6H3v6Zm2-6V5h14v7M5 9h14M12 5v7",
  activities: "m12 3 2.8 5.7 6.3.9-4.5 4.4 1.1 6.2-5.7-3-5.7 3 1.1-6.2-4.5-4.4 6.3-.9L12 3Z",
  itinerary: "M5 3h14v18H5V3ZM9 7h6M9 12h6M9 17h4",
  mail: "M3 5h18v14H3V5Zm0 1 9 7 9-7", calendar: "M4 5h16v16H4V5Zm0 5h16M8 2v5m8-5v5",
  settings: "M4 5h16M4 12h16M4 19h16M8 2v6m8 1v6m-6 1v6", chevron: "m9 5 7 7-7 7",
  arrow: "M4 12h16m-6-6 6 6-6 6", plus: "M12 5v14M5 12h14", close: "m6 6 12 12M6 18 18 6",
  pin: "M19 10c0 5-7 12-7 12S5 15 5 10a7 7 0 1 1 14 0ZM9 10h6m-3-3v6",
  check: "m5 12 4 4L19 6", search: "M21 21l-5-5M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z",
  external: "M14 3h7v7M21 3l-11 11M11 3H3v18h18v-8", download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
  globe: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20ZM2 12h20M12 2c6 6 6 14 0 20-6-6-6-14 0-20Z",
  clock: "M12 8v5l3 2M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
};
export function Icon({ name, ...props }: SVGProps<SVGSVGElement> & { name: string }) {
  const artwork = travelArtwork[name];
  if (artwork) return <svg width="18" height="18" viewBox={artwork.viewBox} fill="none" aria-hidden="true" data-travel-icon={name} {...props}><image href={`/icons/${artwork.file}.png`} width="1280" height="1280" /></svg>;
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d={paths[name] || paths.route} /></svg>;
}
