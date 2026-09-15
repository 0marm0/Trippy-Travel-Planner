/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import type { TripStop } from "@/lib/trip-model";
import { hotelEnrichmentFor } from "@/lib/hotel-enrichment";
import { hotelProviderMediaFor } from "@/lib/hotel-provider-media.generated";
import { hotelMarketCandidatesFor, type HotelMarketCandidate } from "@/lib/hotel-market-scan.generated";
import "./hotel-refresh-panel.css";

const providers = ["Booking.com", "Expedia", "Priceline", "trivago", "Tripadvisor"] as const;
type Provider = typeof providers[number];

function propertyPhoto(candidate: HotelMarketCandidate) {
  if (candidate.image) return { src: candidate.image, source: candidate.provider, url: candidate.url };
  const official = hotelEnrichmentFor(candidate.name)?.photos?.[0];
  if (official) return { src: official.src, source: official.source || "Official hotel", url: official.sourceUrl || candidate.url };
  const catalog = hotelProviderMediaFor(candidate.name)?.photos?.[0];
  if (catalog) return { src: catalog.src, source: catalog.source || "Travel provider", url: catalog.sourceUrl || candidate.url };
  return null;
}
function normalizedRating(candidate: HotelMarketCandidate) {
  return candidate.rating / candidate.ratingScale * 10;
}

function itineraryFit(candidate: HotelMarketCandidate) {
  const location = Math.max(0, 1.2 - candidate.distanceKm * .06);
  const rating = Math.max(0, normalizedRating(candidate) - 8) * .35;
  const value = candidate.nightly <= 150 ? .8 : candidate.nightly <= 200 ? .45 : 0;
  return Math.min(9.6, 7.1 + location + rating + value);
}

export default function HotelRefreshPanel({ stop }: { stop: TripStop }) {
  const [budget, setBudget] = useState<200 | 300>(200);
  const [provider, setProvider] = useState<Provider | "all">("all");
  const candidates = useMemo(() => hotelMarketCandidatesFor(stop.id), [stop.id]);
  if (!candidates.length) return null;
  const visible = candidates.filter((candidate) => candidate.nightly <= budget && (provider === "all" || candidate.provider === provider));
  const grouped = providers.map((name) => ({ name, candidates: visible.filter((candidate) => candidate.provider === name) })).filter((group) => group.candidates.length);
  const under200 = candidates.filter((candidate) => candidate.nightly <= 200).length;

  return <section className="hotel-refresh glass" aria-label={`${stop.name} cross-provider hotel research`}>
    <header><div><span className="eyebrow">Cross-provider market scan</span><h3>{under200} strong-value stays under $200</h3></div><span className="rate-snapshot-date">15 Sep · exact dates · 2 adults · 1 room</span></header>
    <div className="hotel-refresh-toolbar">
      <div className="market-budget" role="group" aria-label="Hotel price ceiling"><button className={budget === 200 ? "active" : ""} onClick={() => setBudget(200)}>Under $200</button><button className={budget === 300 ? "active" : ""} onClick={() => setBudget(300)}>Under $300</button></div>
      <div className="market-providers" role="group" aria-label="Hotel provider"><button className={provider === "all" ? "active" : ""} onClick={() => setProvider("all")}>All sources</button>{providers.map((name) => <button key={name} className={provider === name ? "active" : ""} onClick={() => setProvider(name)}>{name}</button>)}</div>
    </div>
    <p>Each lane is an independent provider result for {stop.checkIn}–{stop.checkOut}; rates are not blended. Nightly prices are displayed in the provider&apos;s returned USD view and can change with taxes, room type, availability and cancellation terms. The complete mapped catalogue continues below.</p>
    <div className="hotel-refresh-coverage"><b>Coverage</b><span className="ready">Booking.com live</span><span className="ready">Expedia live</span><span className="ready">Priceline live</span><span className="ready">trivago live</span><span className="ready">Tripadvisor live</span><span>Vio · property media catalogue</span></div>
    <div className="provider-market-grid">{grouped.map((group) => <section className="provider-market-lane" key={group.name}>
      <header><b>{group.name}</b><span>{group.candidates.length} picks</span></header>
      <div>{group.candidates.map((candidate) => { const photo = propertyPhoto(candidate); const fit = itineraryFit(candidate); return <article className="market-hotel" key={`${candidate.provider}:${candidate.name}`}>
        <a className={`market-hotel-photo ${photo ? "has-photo" : "no-photo"}`} href={candidate.url} target="_blank" rel="noreferrer">{photo ? <img src={photo.src} alt={`${candidate.name} property`} /> : <span>{candidate.provider.slice(0, 1)}</span>}<small>{photo ? `Photo · ${photo.source}` : candidate.provider}</small></a>
        <div className="market-hotel-body"><span>{candidate.area || `${candidate.distanceKm} km from city focus`}</span><h4>{candidate.name}</h4><div className="market-hotel-metrics"><strong>${candidate.nightly.toFixed(0)}<small>/night</small></strong><em>{candidate.rating.toFixed(1)}/{candidate.ratingScale}<small>{candidate.reviews ? ` · ${candidate.reviews.toLocaleString()}` : ""}</small></em></div><div className="market-hotel-fit"><span>Fit {fit.toFixed(1)}</span><span>{candidate.distanceKm} km</span>{candidate.stars > 0 && <span>{candidate.stars}★</span>}</div><a href={candidate.url} target="_blank" rel="noreferrer">Open {candidate.provider} ↗</a></div>
      </article>; })}</div>
    </section>)}</div>
    {!visible.length && <div className="hotel-market-empty">No result in this provider lane met the selected ceiling. Try the $300 view.</div>}
  </section>;
}
