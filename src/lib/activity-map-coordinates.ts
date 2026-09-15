/**
 * Share-safe activity anchors reviewed against exact OpenStreetMap features.
 * Existing source coordinates always win; these only fill otherwise unmapped
 * itinerary activities in the public bundle. Checked 2026-09-14.
 */
export type ReviewedActivityCoordinate = {
  city: string;
  lat: number;
  lng: number;
  source: string;
};

export const reviewedActivityCoordinates: Record<string, ReviewedActivityCoordinate> = {
  // Amsterdam
  "guide-0b0950345b": { city: "amsterdam", lat: 52.371979, lng: 4.8847268, source: "https://www.openstreetmap.org/way/222278733" },
  "guide-1d33d6cf35": { city: "amsterdam", lat: 52.3598431, lng: 4.8850395, source: "https://www.openstreetmap.org/way/29989787" },
  "guide-826b041af1": { city: "amsterdam", lat: 52.3583673, lng: 4.88109, source: "https://www.openstreetmap.org/relation/6577680" },
  "guide-decdede58c": { city: "amsterdam", lat: 52.3751558, lng: 4.8840807, source: "https://www.openstreetmap.org/way/601081859" },
  "guide-2be892fc37": { city: "amsterdam", lat: 52.3552329, lng: 4.8917785, source: "https://www.openstreetmap.org/relation/7112728" },
  "guide-0eb7fd0989": { city: "amsterdam", lat: 52.3693692, lng: 4.9012497, source: "https://www.openstreetmap.org/node/250624673" },

  // Berlin
  "guide-32d0a98f78": { city: "berlin", lat: 52.5186538, lng: 13.3761015, source: "https://www.openstreetmap.org/relation/2201742" },
  "guide-c059a99109": { city: "berlin", lat: 52.5162699, lng: 13.3777034, source: "https://www.openstreetmap.org/way/518071791" },
  "guide-1133b07654": { city: "berlin", lat: 52.5138731, lng: 13.3787346, source: "https://www.openstreetmap.org/way/172234733" },
  "guide-07e46fbae4": { city: "berlin", lat: 52.5337903, lng: 13.3874459, source: "https://www.openstreetmap.org/way/53333454" },
  "guide-9bf4517bba": { city: "berlin", lat: 52.5062137, lng: 13.3841548, source: "https://www.openstreetmap.org/way/24368681" },
  "guide-3afd829ee3": { city: "berlin", lat: 52.5201701, lng: 13.3977174, source: "https://www.openstreetmap.org/way/18578139" },
  "guide-7eb1948e45": { city: "berlin", lat: 52.5044542, lng: 13.4408392, source: "https://www.openstreetmap.org/relation/6807791" },
  "guide-625f217113": { city: "berlin", lat: 52.5085133, lng: 13.3647492, source: "https://www.openstreetmap.org/relation/3626233" },
  "guide-f17218d15b": { city: "berlin", lat: 52.5208279, lng: 13.4094214, source: "https://www.openstreetmap.org/way/556435241" },

  // Munich
  "guide-97e8edf5cf": { city: "munich", lat: 48.135672, lng: 11.5522316, source: "https://www.openstreetmap.org/node/2660347912" },
  "guide-83ed4de513": { city: "munich", lat: 48.1371436, lng: 11.5753989, source: "https://www.openstreetmap.org/node/2941687118" },
  "guide-10bdb510f3": { city: "munich", lat: 48.135109, lng: 11.5755367, source: "https://www.openstreetmap.org/way/240014251" },
  "guide-5b7cf2d4a1": { city: "munich", lat: 48.164861, lng: 11.6064042, source: "https://www.openstreetmap.org/way/159075298" },
  "guide-b7f655751a": { city: "munich", lat: 48.1434851, lng: 11.5877586, source: "https://www.openstreetmap.org/node/292913056" },
  "guide-123455308d": { city: "munich", lat: 48.1376334, lng: 11.5799788, source: "https://www.openstreetmap.org/node/11829267544" },
  "guide-f492432bcc": { city: "munich", lat: 48.1411608, lng: 11.5790446, source: "https://www.openstreetmap.org/relation/7456359" },
  "guide-0999ac7906": { city: "munich", lat: 48.1300409, lng: 11.582909, source: "https://www.openstreetmap.org/relation/3866522" },
};

export function reviewedCoordinateForActivity(id: string, city: string) {
  const coordinate = reviewedActivityCoordinates[id];
  return coordinate?.city === city ? coordinate : undefined;
}
