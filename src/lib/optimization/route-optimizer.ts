export type OptimizerMode = "flight" | "train" | "car" | "bus" | "ferry";

export type OptimizerStop = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  minNights?: number;
  maxNights?: number;
};

export type OptimizerLegQuote = {
  id: string;
  from: string;
  to: string;
  mode: OptimizerMode;
  cash: number;
  durationHours: number;
  transfers?: number;
  reliability?: number;
  carbonKg?: number;
  overnight?: boolean;
  source?: string;
  checkedAt?: string;
};

export type OptimizationWeights = {
  cost: number;
  time: number;
  simplicity: number;
  reliability: number;
  carbon: number;
};

export type RouteOptimizationInput = {
  stops: OptimizerStop[];
  legs: OptimizerLegQuote[];
  startId?: string;
  endId?: string;
  allowedModes?: OptimizerMode[];
  weights?: Partial<OptimizationWeights>;
  maxResults?: number;
};

export type RankedRoute = {
  rank: number;
  score: number;
  confidence: "high" | "medium" | "low";
  orderedStops: Array<{ id: string; name: string; nights: number }>;
  selectedLegs: OptimizerLegQuote[];
  missingLegs: Array<{ from: string; to: string; estimatedDistanceKm: number }>;
  totals: {
    cash: number;
    durationHours: number;
    transfers: number;
    carbonKg?: number;
    nights: number;
  };
  explanation: string[];
};

const DEFAULT_WEIGHTS: OptimizationWeights = {
  cost: 0.32,
  time: 0.27,
  simplicity: 0.2,
  reliability: 0.16,
  carbon: 0.05,
};

const MODE_RISK: Record<OptimizerMode, number> = {
  flight: 0.42,
  train: 0.18,
  car: 0.28,
  bus: 0.34,
  ferry: 0.3,
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizedWeights(input?: Partial<OptimizationWeights>): OptimizationWeights {
  const raw = {
    cost: clamp(Number(input?.cost ?? DEFAULT_WEIGHTS.cost), 0, 1),
    time: clamp(Number(input?.time ?? DEFAULT_WEIGHTS.time), 0, 1),
    simplicity: clamp(Number(input?.simplicity ?? DEFAULT_WEIGHTS.simplicity), 0, 1),
    reliability: clamp(Number(input?.reliability ?? DEFAULT_WEIGHTS.reliability), 0, 1),
    carbon: clamp(Number(input?.carbon ?? DEFAULT_WEIGHTS.carbon), 0, 1),
  };
  const total = Object.values(raw).reduce((sum, value) => sum + value, 0) || 1;
  return Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, value / total])) as OptimizationWeights;
}

function haversineKm(left: OptimizerStop, right: OptimizerStop) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const earthRadiusKm = 6_371;
  const lat = radians(right.lat - left.lat);
  const lng = radians(right.lng - left.lng);
  const a = Math.sin(lat / 2) ** 2 + Math.cos(radians(left.lat)) * Math.cos(radians(right.lat)) * Math.sin(lng / 2) ** 2;
  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function permutations<T>(values: T[], cap = 40_320): T[][] {
  const result: T[][] = [];
  const visit = (remaining: T[], current: T[]) => {
    if (result.length >= cap) return;
    if (!remaining.length) {
      result.push(current);
      return;
    }
    for (let index = 0; index < remaining.length; index += 1) {
      visit([...remaining.slice(0, index), ...remaining.slice(index + 1)], [...current, remaining[index]]);
      if (result.length >= cap) return;
    }
  };
  visit(values, []);
  return result;
}

function routeSequences(stops: OptimizerStop[], startId?: string, endId?: string) {
  const start = startId ? stops.find((stop) => stop.id === startId) : undefined;
  const end = endId ? stops.find((stop) => stop.id === endId) : undefined;
  const middle = stops.filter((stop) => stop.id !== start?.id && stop.id !== end?.id);
  return permutations(middle).map((items) => [
    ...(start ? [start] : []),
    ...items,
    ...(end && end.id !== start?.id ? [end] : []),
  ]);
}

function preferredNights(stop: OptimizerStop) {
  const min = clamp(Math.round(stop.minNights ?? 1), 0, 30);
  const max = clamp(Math.round(stop.maxNights ?? Math.max(min, 3)), min, 30);
  return Math.round((min + max) / 2);
}

function pairKey(left: string, right: string) {
  return left < right ? `${left}\u0000${right}` : `${right}\u0000${left}`;
}

function legUtility(leg: OptimizerLegQuote, maxima: { cash: number; time: number; transfers: number; carbon: number }, weights: OptimizationWeights) {
  const reliability = clamp(leg.reliability ?? (1 - MODE_RISK[leg.mode]), 0, 1);
  const cost = leg.cash / maxima.cash;
  const time = leg.durationHours / maxima.time;
  const simplicity = (leg.transfers ?? 0) / maxima.transfers;
  const carbon = leg.carbonKg === undefined ? 0.5 : leg.carbonKg / maxima.carbon;
  const overnightPenalty = leg.overnight ? 0.04 : 0;
  return cost * weights.cost + time * weights.time + simplicity * weights.simplicity + (1 - reliability) * weights.reliability + carbon * weights.carbon + overnightPenalty;
}

function validatedInput(input: RouteOptimizationInput) {
  if (!Array.isArray(input.stops) || input.stops.length < 2 || input.stops.length > 9) throw new Error("Provide between 2 and 9 stops.");
  const ids = new Set<string>();
  for (const stop of input.stops) {
    if (!/^[a-z0-9][a-z0-9_-]{0,63}$/i.test(stop.id) || ids.has(stop.id)) throw new Error("Every stop needs a unique, safe id.");
    if (!stop.name?.trim() || stop.name.length > 120) throw new Error("Every stop needs a short name.");
    if (!Number.isFinite(stop.lat) || stop.lat < -90 || stop.lat > 90 || !Number.isFinite(stop.lng) || stop.lng < -180 || stop.lng > 180) throw new Error("Every stop needs valid coordinates.");
    ids.add(stop.id);
  }
  if (input.startId && !ids.has(input.startId)) throw new Error("The fixed start is not one of the stops.");
  if (input.endId && !ids.has(input.endId)) throw new Error("The fixed end is not one of the stops.");
  if (input.startId && input.startId === input.endId && input.stops.length > 2) throw new Error("Start and end must differ for a multi-stop route.");
  if (!Array.isArray(input.legs) || input.legs.length > 1_000) throw new Error("Too many transport options.");
  for (const leg of input.legs) {
    if (!ids.has(leg.from) || !ids.has(leg.to) || leg.from === leg.to) throw new Error("Every transport option must connect two trip stops.");
    if (!Number.isFinite(leg.cash) || leg.cash < 0 || leg.cash > 1_000_000 || !Number.isFinite(leg.durationHours) || leg.durationHours <= 0 || leg.durationHours > 240) throw new Error("Transport cost or duration is invalid.");
  }
}

export function optimizeRoutes(input: RouteOptimizationInput): RankedRoute[] {
  validatedInput(input);
  const allowed = new Set(input.allowedModes?.length ? input.allowedModes : ["flight", "train", "car", "bus", "ferry"]);
  const legs = input.legs.filter((leg) => allowed.has(leg.mode));
  const weights = normalizedWeights(input.weights);
  const maxima = {
    cash: Math.max(1, ...legs.map((leg) => leg.cash)),
    time: Math.max(1, ...legs.map((leg) => leg.durationHours)),
    transfers: Math.max(1, ...legs.map((leg) => leg.transfers ?? 0)),
    carbon: Math.max(1, ...legs.map((leg) => leg.carbonKg ?? 0)),
  };
  const legsByPair = new Map<string, OptimizerLegQuote[]>();
  for (const leg of legs) {
    const key = pairKey(leg.from, leg.to);
    legsByPair.set(key, [...(legsByPair.get(key) ?? []), leg]);
  }
  const scored = routeSequences(input.stops, input.startId, input.endId).map((sequence) => {
    const selectedLegs: OptimizerLegQuote[] = [];
    const missingLegs: RankedRoute["missingLegs"] = [];
    let utility = 0;
    let routeDistance = 0;
    for (let index = 0; index < sequence.length - 1; index += 1) {
      const from = sequence[index];
      const to = sequence[index + 1];
      routeDistance += haversineKm(from, to);
      const candidates = legsByPair.get(pairKey(from.id, to.id)) ?? [];
      const chosen = candidates.toSorted((left, right) => legUtility(left, maxima, weights) - legUtility(right, maxima, weights))[0];
      if (chosen) {
        selectedLegs.push(chosen);
        utility += legUtility(chosen, maxima, weights);
      } else {
        missingLegs.push({ from: from.id, to: to.id, estimatedDistanceKm: Math.round(haversineKm(from, to)) });
        utility += 1.25;
      }
    }
    const directDistance = sequence.length > 1 ? haversineKm(sequence[0], sequence.at(-1)!) : routeDistance;
    const backtracking = directDistance > 1 ? Math.max(0, routeDistance / directDistance - 1) : 0;
    utility += Math.min(backtracking, 3) * 0.08;
    const totals = selectedLegs.reduce((result, leg) => ({
      cash: result.cash + leg.cash,
      durationHours: result.durationHours + leg.durationHours,
      transfers: result.transfers + (leg.transfers ?? 0),
      carbonKg: result.carbonKg + (leg.carbonKg ?? 0),
      nights: result.nights,
    }), { cash: 0, durationHours: 0, transfers: 0, carbonKg: 0, nights: sequence.reduce((sum, stop) => sum + preferredNights(stop), 0) });
    return { sequence, selectedLegs, missingLegs, utility, backtracking, totals };
  }).toSorted((left, right) => left.utility - right.utility);

  const best = scored[0]?.utility ?? 1;
  const worst = scored.at(-1)?.utility ?? best + 1;
  return scored.slice(0, clamp(Math.round(input.maxResults ?? 5), 1, 12)).map((candidate, index): RankedRoute => {
    const range = Math.max(0.001, worst - best);
    const score = Math.round(clamp(96 - ((candidate.utility - best) / range) * 31 - candidate.missingLegs.length * 11, 1, 99));
    const directCount = candidate.selectedLegs.filter((leg) => (leg.transfers ?? 0) === 0).length;
    const modeSummary = [...new Set(candidate.selectedLegs.map((leg) => leg.mode))].join(", ") || "unpriced links";
    const explanation = [
      `${modeSummary || "Mixed transport"} route with ${directCount} direct leg${directCount === 1 ? "" : "s"}.`,
      `${Math.round(candidate.totals.durationHours * 10) / 10} travel hours and ${candidate.totals.transfers} transfer${candidate.totals.transfers === 1 ? "" : "s"} across priced options.`,
      candidate.missingLegs.length ? `${candidate.missingLegs.length} leg${candidate.missingLegs.length === 1 ? " needs" : "s need"} live or manual pricing before this route is decision-ready.` : "Every intercity leg has at least one comparable option.",
      candidate.backtracking > 0.6 ? "This order contains geographic backtracking; keep it only if price or a fixed event justifies the detour." : "The sequence keeps geographic backtracking controlled.",
    ];
    const carbonKnown = candidate.selectedLegs.some((leg) => leg.carbonKg !== undefined);
    return {
      rank: index + 1,
      score,
      confidence: candidate.missingLegs.length === 0 && candidate.selectedLegs.every((leg) => leg.checkedAt) ? "high" : candidate.missingLegs.length <= 1 ? "medium" : "low",
      orderedStops: candidate.sequence.map((stop) => ({ id: stop.id, name: stop.name, nights: preferredNights(stop) })),
      selectedLegs: candidate.selectedLegs,
      missingLegs: candidate.missingLegs,
      totals: { ...candidate.totals, carbonKg: carbonKnown ? Math.round(candidate.totals.carbonKg) : undefined },
      explanation,
    };
  });
}

export function optimizerStopById(input: RouteOptimizationInput, id: string) {
  return input.stops.find((stop) => stop.id === id);
}

export function estimatedLegDistance(input: RouteOptimizationInput, from: string, to: string) {
  const left = optimizerStopById(input, from);
  const right = optimizerStopById(input, to);
  return left && right ? Math.round(haversineKm(left, right)) : undefined;
}
