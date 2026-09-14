export type TripStop = {
  id: string;
  name: string;
  country: string;
  flag: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  lat: number;
  lng: number;
  stay: string;
  hero: string;
};

export type TripActivity = {
  id: string;
  city: string;
  title: string;
  description: string;
  details: string;
  url: string;
  category: string;
  priority: "must" | "should" | "could";
  image: string;
  status: string;
  lat?: number;
  lng?: number;
  closed?: boolean;
  fit?: string;
  access?: string;
  imageSource?: string;
  imageCredit?: string;
};

export type HotelOffer = {
  provider: string;
  total: number;
  nightly?: number;
  currency: string;
  checkIn: string;
  checkOut: string;
  adults: number;
  rooms: number;
  checked: string;
  url: string;
  roomName?: string;
  breakfast?: string;
  cancellation?: string;
};

export type TripHotel = {
  id: string;
  city: string;
  name: string;
  tier: string;
  neighborhood: string;
  low: number;
  high: number;
  stars: number;
  flags: string[];
  amenities: string[];
  why: string;
  tradeoff: string;
  rating?: number;
  reviews?: number;
  lat?: number;
  lng?: number;
  images: string[];
  offers: HotelOffer[];
  official?: string;
};

export type TransportOption = {
  id: string;
  mode: "flight" | "train" | "car" | "bus";
  name: string;
  ride: string;
  door: string;
  hours: number;
  low: number;
  high: number;
  note: string;
  source?: string;
  published?: string;
  extra?: string;
};

export type TransportLeg = {
  id: string;
  from: string;
  to: string;
  date: string;
  recommend: string;
  options: TransportOption[];
};

export type DayPlanBlock = { time: string; id?: string; title?: string; note: string; link?: string };
export type CityDayPlan = { theme: string; note: string; blocks: DayPlanBlock[]; extras?: string[] };
export type MapPlace = { id: string; title: string; detail: string; lat: number; lng: number; layer: "hotel" | "airport" | "station" };
export type BookingStatus = "confirmed" | "tbc" | "missing" | "conflict";
export type BookingRecord = { kind: string; date: string; title: string; detail: string; status?: BookingStatus; ref: string; href: string };

export type Trip2026Payload = {
  id: "europe-2026";
  dataMode: "private" | "sample";
  title: string;
  subtitle: string;
  start: string;
  end: string;
  stops: TripStop[];
  activities: TripActivity[];
  hotels: TripHotel[];
  transport: TransportLeg[];
  cityPlans: Record<string, CityDayPlan[]>;
  dayAnchors: Record<string, Array<{ kind: string; label: string; detail: string }>>;
  mapPlaces: Record<string, MapPlace[]>;
  clusterGuidance: Record<string, string>;
  bookings: BookingRecord[];
};
