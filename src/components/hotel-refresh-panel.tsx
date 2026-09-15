"use client";

import type { TripStop } from "@/lib/trip-model";
import "./hotel-refresh-panel.css";

type Snapshot = {
  name: string;
  area: string;
  usdNight: number;
  eurGuide: number;
  score: number;
  rationale: string;
  booking: string;
};

const byCity: Record<string, Snapshot[]> = {
  amsterdam: [
    { name: "Monet Garden Hotel", area: "Plantage / Waterlooplein", usdNight: 170.68, eurGuide: 148, score: 9.1, rationale: "Best central all-rounder for the canal belt, Anne Frank House, cruise and Central Station transfer.", booking: "https://www.booking.com/city/nl/amsterdam.html?checkin=2026-10-03&checkout=2026-10-05&group_adults=2&no_rooms=1" },
    { name: "Hotel Omega", area: "Oud-Zuid", usdNight: 143.47, eurGuide: 124, score: 9, rationale: "The Museumplein value play: about 500m from Van Gogh Museum, but less ideal for a short central/canal-focused stay.", booking: "https://www.booking.com/city/nl/amsterdam.html?checkin=2026-10-03&checkout=2026-10-05&group_adults=2&no_rooms=1" },
    { name: "Hotel Jakarta Amsterdam", area: "Java Island", usdNight: 195.18, eurGuide: 169, score: 9, rationale: "Distinctive waterfront option with practical Central Station access by tram 26; strongest design-forward choice.", booking: "https://www.booking.com/city/nl/amsterdam.html?checkin=2026-10-03&checkout=2026-10-05&group_adults=2&no_rooms=1" },
    { name: "The July – Boat & Co", area: "Houthaven", usdNight: 185.36, eurGuide: 161, score: 9.3, rationale: "Excellent-value waterfront stay, but the transit tradeoff makes it less compelling for this short sightseeing window.", booking: "https://www.booking.com/city/nl/amsterdam.html?checkin=2026-10-03&checkout=2026-10-05&group_adults=2&no_rooms=1" },
    { name: "nhow Amsterdam RAI", area: "Zuideramstel", usdNight: 131.58, eurGuide: 114, score: 9.1, rationale: "Lowest current rate with excellent RAI access; reserve only if price outranks central-city convenience.", booking: "https://www.booking.com/city/nl/amsterdam.html?checkin=2026-10-03&checkout=2026-10-05&group_adults=2&no_rooms=1" },
  ],
  berlin: [
    { name: "Wilde Aparthotels, Checkpoint Charlie", area: "Mitte", usdNight: 162.06, eurGuide: 140, score: 9, rationale: "Best overall base for the Reichstag, Brandenburg Gate, Topography of Terror and citywide transit.", booking: "https://www.booking.com/city/de/berlin.html?checkin=2026-10-05&checkout=2026-10-09&group_adults=2&no_rooms=1" },
    { name: "The Charming by Curt Suites", area: "Mitte / Alexanderplatz", usdNight: 198.3, eurGuide: 172, score: 9, rationale: "Strong Museum Island and Alexanderplatz access; an easy, polished central compromise.", booking: "https://www.booking.com/city/de/berlin.html?checkin=2026-10-05&checkout=2026-10-09&group_adults=2&no_rooms=1" },
    { name: "ADELANTE Boutique Hotel", area: "Mitte", usdNight: 250.76, eurGuide: 217, score: 9.4, rationale: "The premium central option. Fits the room budget on the displayed rate, but validate all-in total before selecting.", booking: "https://www.booking.com/city/de/berlin.html?checkin=2026-10-05&checkout=2026-10-09&group_adults=2&no_rooms=1" },
    { name: "KPM Hotel & Residences", area: "Charlottenburg", usdNight: 153.58, eurGuide: 133, score: 9.3, rationale: "A great design/value choice with a west-side transit tradeoff for the historical core.", booking: "https://www.booking.com/city/de/berlin.html?checkin=2026-10-05&checkout=2026-10-09&group_adults=2&no_rooms=1" },
    { name: "sly Berlin", area: "Friedrichshain-Kreuzberg", usdNight: 148.64, eurGuide: 129, score: 9.1, rationale: "Stylish value and nightlife access; more travel time to the main historical sights.", booking: "https://www.booking.com/city/de/berlin.html?checkin=2026-10-05&checkout=2026-10-09&group_adults=2&no_rooms=1" },
  ],
  munich: [
    { name: "Platzl Hotel", area: "Altstadt-Lehel", usdNight: 225.14, eurGuide: 195, score: 9, rationale: "Best location fit: roughly two minutes to Marienplatz/Hofbräuhaus and the simplest Old Town base.", booking: "https://www.booking.com/city/de/munich.html?checkin=2026-10-09&checkout=2026-10-12&group_adults=2&no_rooms=1" },
    { name: "CORTIINA Hotel", area: "Altstadt-Lehel", usdNight: 283.53, eurGuide: 246, score: 9.1, rationale: "Best boutique splurge that still fits the current target before final tax and currency confirmation.", booking: "https://www.booking.com/city/de/munich.html?checkin=2026-10-09&checkout=2026-10-12&group_adults=2&no_rooms=1" },
    { name: "MOMA1890 Boutique Hotel", area: "Haidhausen", usdNight: 171.57, eurGuide: 149, score: 9.1, rationale: "Best style/value balance with strong S-Bahn/U-Bahn access, though less walkable for the Old Town plan.", booking: "https://www.booking.com/city/de/munich.html?checkin=2026-10-09&checkout=2026-10-12&group_adults=2&no_rooms=1" },
    { name: "Hotel Uhland", area: "Ludwigsvorstadt", usdNight: 226.44, eurGuide: 196, score: 9, rationale: "Practical for Theresienwiese and Sendlinger Tor; solid if Oktoberfest logistics matter most.", booking: "https://www.booking.com/city/de/munich.html?checkin=2026-10-09&checkout=2026-10-12&group_adults=2&no_rooms=1" },
    { name: "Hotel Deutsche Eiche", area: "Glockenbach / central", usdNight: 244.5, eurGuide: 212, score: 9, rationale: "Central and lively with a stronger food/nightlife fit; confirm the exact room and terms.", booking: "https://www.booking.com/city/de/munich.html?checkin=2026-10-09&checkout=2026-10-12&group_adults=2&no_rooms=1" },
  ],
};

export default function HotelRefreshPanel({ stop }: { stop: TripStop }) {
  const candidates = byCity[stop.id];
  if (!candidates) return null;
  return <section className="hotel-refresh glass" aria-label={`${stop.name} live hotel research`}>
    <header><div><span className="eyebrow">Live rate snapshot</span><h3>Shortlist for {stop.checkIn}–{stop.checkOut}</h3></div><span className="rate-snapshot-date">Checked 14 Sep · 2 adults · 1 room</span></header>
    <p>Booking.com displayed these as starting nightly rates in USD. The euro guide uses the 14 Sep USD/EUR reference rate; it is not a hold. Confirm tax, room, breakfast and cancellation terms before selecting.</p>
    <div className="hotel-refresh-grid">{candidates.map((candidate, index) => <article key={candidate.name} className={index < 2 ? "top-pick" : ""}><div><span>#{index + 1} · {candidate.area}</span><b>{candidate.name}</b><small>★ {candidate.score.toFixed(1)}</small></div><strong>US${candidate.usdNight.toFixed(2)} <small>/ night</small><em>≈ €{candidate.eurGuide} guide</em></strong><p>{candidate.rationale}</p><a href={candidate.booking} target="_blank" rel="noreferrer">Open exact-date Booking search ↗</a></article>)}</div>
  </section>;
}
