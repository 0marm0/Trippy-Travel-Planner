import type { HotelFact, HotelPhoto, HotelRating } from "./trip-model";

export type HotelEnrichment = {
  official: string;
  gallery?: string;
  photos?: HotelPhoto[];
  ratings?: HotelRating[];
  facts?: HotelFact[];
  pros?: string[];
  tradeoffs?: string[];
};

const officialPhoto = (src: string, alt: string, kind: HotelPhoto["kind"], sourceUrl: string): HotelPhoto => ({
  src,
  alt,
  kind,
  source: "Official hotel",
  credit: "Hotel website",
  sourceUrl,
  verified: true,
});

const fact = (kind: HotelFact["kind"], label: string, value: string): HotelFact => ({
  kind,
  label,
  value,
  source: "Official hotel website",
  checkedAt: "2026-09-14",
});

const records: Record<string, HotelEnrichment> = {
  "monet-garden-hotel": {
    official: "https://www.monetgardenhotelamsterdam.com/",
    gallery: "https://www.monetgardenhotelamsterdam.com/gallery",
    photos: [
      officialPhoto("https://winhotelsgroup.nl/properties/monet-garden-hotel/images/thumbnail/thumbnail-2.jpg", "Monet Garden Hotel Amsterdam interior", "lobby", "https://www.monetgardenhotelamsterdam.com/gallery"),
      officialPhoto("https://winhotelsgroup.nl/properties/monet-garden-hotel/images/rooms/double-room/double-room-1.jpg", "Double room at Monet Garden Hotel Amsterdam", "room", "https://www.monetgardenhotelamsterdam.com/rooms/"),
      officialPhoto("https://winhotelsgroup.nl/properties/monet-garden-hotel/images/rooms/double-room-with-canal-view/double-room-with-canal-view-1.jpg", "Canal-view double room at Monet Garden Hotel Amsterdam", "view", "https://www.monetgardenhotelamsterdam.com/rooms/"),
    ],
    facts: [fact("room", "Rooms", "105 rooms; canal-view categories available"), fact("breakfast", "Breakfast", "Breakfast buffet available"), fact("amenity", "On property", "Fitness centre")],
    pros: ["Walkable Waterlooplein base with canal-belt access", "Canal-view room categories and a fitness centre", "Practical Central Station and cruise-terminal connections"],
    tradeoffs: ["Confirm whether breakfast is included in the selected rate", "Short stay makes the exact room view and cancellation terms important"],
  },
  "hotel-omega": {
    official: "https://hotelomega.nl/",
    gallery: "https://hotelomega.nl/gallery/",
    photos: [
      officialPhoto("https://hotelomega.nl/wp-content/uploads/2025/11/EmiroSmolders-HotelOmega-0546051-scaled.jpg", "Hotel Omega Amsterdam", "exterior", "https://hotelomega.nl/gallery/"),
      officialPhoto("https://hotelomega.nl/wp-content/uploads/2024/04/Executive-5-Large-1024x682.jpeg", "Executive room at Hotel Omega", "room", "https://hotelomega.nl/gallery/"),
      officialPhoto("https://hotelomega.nl/wp-content/uploads/2024/03/Sup-double-2-1-Large-1-1024x682.jpeg", "Superior double room at Hotel Omega", "room", "https://hotelomega.nl/gallery/"),
    ],
    facts: [fact("room", "Executive Double", "21 m² with a 180 × 200 cm bed"), fact("location", "Location", "Between Museumplein and Vondelpark"), fact("breakfast", "Breakfast", "Not stated on the checked official page")],
    pros: ["Excellent Museumplein and Vondelpark positioning", "Compact boutique scale with clearly documented room categories", "Strong value candidate for museum-heavy days"],
    tradeoffs: ["Less convenient for a canal-belt-first itinerary", "Breakfast inclusion needs provider confirmation"],
  },
  "hotel-jakarta-amsterdam": {
    official: "https://hoteljakarta.com/",
    gallery: "https://hoteljakarta.com/media-gallery/",
    photos: [
      officialPhoto("https://hoteljakarta.com/wp-content/uploads/sites/7/2018/08/hotel-jakarta-amsterdam-westcord-hotels-hortus-botanicus-subtropische-tuin-4.jpg", "Indoor subtropical garden at Hotel Jakarta Amsterdam", "lobby", "https://hoteljakarta.com/media-gallery/"),
      officialPhoto("https://hoteljakarta.com/wp-content/uploads/sites/7/2017/05/locatie-hotel-jakarta-amsterdam-by-westcord-javaeiland-2.jpg", "Hotel Jakarta Amsterdam on Java Island", "exterior", "https://hoteljakarta.com/media-gallery/"),
    ],
    facts: [fact("room", "Rooms", "200 Indonesian-inspired rooms and suites; most have balconies"), fact("breakfast", "Breakfast", "Served at Café Jakarta; verify rate inclusion"), fact("amenity", "Wellness", "Pool and wellness facilities")],
    pros: ["Distinctive waterfront design and subtropical atrium", "Most rooms have balconies", "Tram 26 gives practical Central Station access"],
    tradeoffs: ["Not as walkable for the core canal-belt itinerary", "Verify room category, breakfast and cancellation in the final rate"],
  },
  "the-july-boat-co": {
    official: "https://www.thejuly.com/",
    facts: [fact("room", "Apartment stay", "Equipped kitchen, living space and work area"), fact("amenity", "Dining", "Vessel restaurant and meeting spaces"), fact("breakfast", "Breakfast", "Inclusion not verified on the checked property page")],
    pros: ["Apartment-style space works well for a longer stay", "Waterfront setting and in-room kitchen flexibility"],
    tradeoffs: ["Property-specific gallery could not be verified", "Houthaven adds transit time for a two-night sightseeing stay"],
  },
  "nhow-amsterdam-rai": {
    official: "https://www.nhow-hotels.com/en/hotel/nhow-amsterdam-rai",
    facts: [fact("room", "Rooms", "650 rooms with six directional designs and floor-to-ceiling windows"), fact("breakfast", "Breakfast", "American and continental buffet available"), fact("amenity", "Facilities", "Gym, parking and pet-friendly rooms")],
    pros: ["Excellent RAI and Zuidas access", "Design-led rooms with broad views", "Often the lowest cash-rate lead in the current shortlist"],
    tradeoffs: ["Farther from the historic-centre walking plan", "Official gallery is app-rendered; stable image URLs remain pending"],
  },
  "wilde-aparthotels-checkpoint-charlie": {
    official: "https://www.wilde.com/en/berlin/checkpoint-charlie",
    facts: [fact("room", "Apartments", "Studios through two-bedroom apartments with equipped kitchens"), fact("breakfast", "Breakfast", "Available; confirm inclusion with the selected rate"), fact("amenity", "Facilities", "Gym, laundry and high-speed Wi-Fi")],
    pros: ["Mitte base beside Checkpoint Charlie", "Apartment kitchens add flexibility", "Strong access to the Reichstag, Brandenburg Gate and Topography of Terror"],
    tradeoffs: ["Stable first-party photo URLs remain pending", "Check room servicing and breakfast terms for the selected apartment"],
  },
  "the-charming-by-curt-suites": {
    official: "https://www.curtsuites.com/",
    facts: [fact("room", "Suites", "23–100 m² with kitchenettes, dining tables and private bathrooms"), fact("policy", "Arrival", "Digital check-in"), fact("breakfast", "Breakfast", "Not stated on the checked official page")],
    pros: ["Central Littenstraße base near Alexanderplatz", "Generous suite sizes and kitchenettes", "Strong Museum Island access"],
    tradeoffs: ["Breakfast needs separate verification", "Stable official gallery assets remain pending"],
  },
  "adelante-boutique-hotel": {
    official: "https://www.adelanteboutiquehotel.de/",
    gallery: "https://www.adelanteboutiquehotel.de/galerie/",
    photos: [
      officialPhoto("https://www.adelanteboutiquehotel.de/wp-content/uploads/2025/10/Adelante-Boutique-Hotel-1188-scaled.jpg", "ADELANTE Boutique Hotel room", "room", "https://www.adelanteboutiquehotel.de/galerie/"),
      officialPhoto("https://www.adelanteboutiquehotel.de/wp-content/uploads/2025/10/Adelante-Boutique-Hotel-1545.jpg", "ADELANTE Boutique Hotel interior", "lobby", "https://www.adelanteboutiquehotel.de/galerie/"),
      officialPhoto("https://www.adelanteboutiquehotel.de/wp-content/uploads/2025/10/Adelante-Boutique-Hotel-1846.jpg", "ADELANTE Boutique Hotel room detail", "room", "https://www.adelanteboutiquehotel.de/galerie/"),
    ],
    facts: [fact("location", "Address", "Borsigstraße 1, 10115 Berlin"), fact("breakfast", "Breakfast", "Current official details not verified")],
    pros: ["Premium, quiet Mitte positioning", "Polished boutique-room photography from the official gallery"],
    tradeoffs: ["Displayed total and tax need final verification", "Official site currently provides limited current amenity detail"],
  },
  "kpm-hotel-residences": {
    official: "https://kpmhotel.de/en/",
    gallery: "https://kpmhotel.de/en/galerie/",
    photos: [
      officialPhoto("https://kpmhotel.de/wp-content/uploads/2020/10/HP_KPM-7790-scaled.jpg", "KPM Hotel and Residences interior", "lobby", "https://kpmhotel.de/en/galerie/"),
      officialPhoto("https://kpmhotel.de/wp-content/uploads/2020/10/HP_KPM-8157-klein-scaled.jpg", "Room at KPM Hotel and Residences", "room", "https://kpmhotel.de/en/galerie/"),
      officialPhoto("https://kpmhotel.de/wp-content/uploads/2020/01/00_KPM-Hotel-Residences_White-Kitchen_12-1024x625.jpg", "Residence kitchen at KPM Hotel and Residences", "amenity", "https://kpmhotel.de/en/galerie/"),
    ],
    facts: [fact("room", "Residences", "Kitchen-equipped residence categories and walk-in showers"), fact("amenity", "Facilities", "Sauna, fitness, community kitchen and playroom"), fact("location", "Location", "Between KPM Berlin and Tiergarten")],
    pros: ["High-design residence product with useful shared facilities", "Good Tiergarten and west-Berlin access", "Strong current value lead"],
    tradeoffs: ["Longer transit to the east-side historical core", "Breakfast terms were not confirmed on the checked page"],
  },
  "sly-berlin": {
    official: "https://www.sly-berlin.com/en/",
    photos: [
      officialPhoto("https://www.sly-berlin.com/assets/SlyBerlin2022roomM9444_16605d773f3e83e866d9b12f.jpg", "Room at sly Berlin", "room", "https://www.sly-berlin.com/en/"),
      officialPhoto("https://www.sly-berlin.com/assets/SlyBerlin2022roomM9458_28105dc6a535225866d9aa1b.jpg", "Room interior at sly Berlin", "room", "https://www.sly-berlin.com/en/"),
      officialPhoto("https://www.sly-berlin.com/assets/P1148404_0e3b0211ae25841a66ec0655.jpg", "Interior at sly Berlin", "lobby", "https://www.sly-berlin.com/en/"),
    ],
    facts: [fact("room", "Rooms", "150 individually designed rooms with king bed and coffee machine"), fact("breakfast", "Breakfast", "Restaurant breakfast available"), fact("amenity", "Wellness", "Rooftop sauna and fitness")],
    pros: ["Stylish, characterful Friedrichshain base", "Rooftop sauna and strong restaurant offering", "Good nightlife access"],
    tradeoffs: ["More travel time to the primary historical sights", "Compare late-night location benefits against daytime transit"],
  },
  "platzl-hotel": {
    official: "https://www.platzl.de/en/",
    gallery: "https://www.platzl.de/en/hotel/impressions",
    photos: [
      officialPhoto("https://www.platzl.de/fileadmin/_processed_/3/0/csm_Lobby_Platzl_Hotel_33d8437e59.jpg", "Lobby at Platzl Hotel Munich", "lobby", "https://www.platzl.de/en/hotel/impressions"),
      officialPhoto("https://www.platzl.de/fileadmin/_processed_/4/b/csm_Kategorie_Classic_Queen_Bett_Zimmer_38c8b0588d.jpg", "Classic Queen room at Platzl Hotel Munich", "room", "https://www.platzl.de/en/hotel/impressions"),
    ],
    facts: [fact("room", "Rooms", "Old Town rooms with free Wi-Fi and minibar"), fact("breakfast", "Breakfast", "Available as an optional extra"), fact("amenity", "Facilities", "Spa, fitness and garage")],
    pros: ["Best Old Town location in the shortlist", "Very short walk to Marienplatz and Hofbräuhaus", "Full-service facilities without sacrificing walkability"],
    tradeoffs: ["Often priced above the central value options", "Breakfast may be an extra rather than included"],
  },
  "cortiina-hotel": {
    official: "https://cortiina.com/en/",
    gallery: "https://cortiina.com/en/gallery/",
    photos: [
      officialPhoto("https://cortiina.com/wp-content/uploads/2024/03/CORTIINA-Maisonette-Suite_Wohnbereich_Schreibtisch.jpg", "Maisonette suite at CORTIINA Hotel", "suite", "https://cortiina.com/en/gallery/"),
      officialPhoto("https://cortiina.com/wp-content/uploads/2024/04/Cortiina-322-05-1.jpg", "Room at CORTIINA Hotel Munich", "room", "https://cortiina.com/en/gallery/"),
      officialPhoto("https://cortiina.com/wp-content/uploads/2024/04/cortiina-design-hotel-muenchen-innenhof-terrasse.jpg", "Courtyard terrace at CORTIINA Hotel", "dining", "https://cortiina.com/en/gallery/"),
    ],
    facts: [fact("room", "Rooms", "Natural materials, natural-rubber mattresses and organic-cotton linen"), fact("breakfast", "Breakfast", "Breakfast offered; inclusion and price need rate verification"), fact("location", "Location", "By Viktualienmarkt and Marienplatz")],
    pros: ["Best boutique splurge for the Old Town plan", "Refined natural-material room design", "Excellent Viktualienmarkt and Marienplatz access"],
    tradeoffs: ["Near the top of the stated nightly budget", "Confirm taxes, breakfast and cancellation before selecting"],
  },
  "moma1890-boutique-hotel": {
    official: "https://www.moma1890.com/en/",
    photos: [
      officialPhoto("https://www.moma1890.com/wp-content/uploads/2021/06/DSC_6795-scaled.jpg", "MOMA1890 Boutique Hotel interior", "lobby", "https://www.moma1890.com/en/"),
      officialPhoto("https://www.moma1890.com/wp-content/uploads/2021/06/DSC_7145-1920x1288.jpg", "Room at MOMA1890 Boutique Hotel", "room", "https://www.moma1890.com/en/"),
      officialPhoto("https://www.moma1890.com/wp-content/uploads/2021/06/moma1809_30-1200x800.jpg", "Breakfast at MOMA1890 Boutique Hotel", "dining", "https://www.moma1890.com/en/breakfast/"),
    ],
    facts: [fact("room", "Rooms", "51 individually designed rooms"), fact("breakfast", "Breakfast", "Regional buffet, coffee and egg dishes, 06:30–10:30"), fact("location", "Location", "Orleansplatz 6a with strong S-Bahn and U-Bahn access")],
    pros: ["Strongest style/value balance in the shortlist", "Excellent rapid-transit access", "Detailed, regionally focused breakfast offering"],
    tradeoffs: ["Less walkable for the Old Town day plan", "Confirm whether breakfast is included in the selected rate"],
  },
  "hotel-uhland": {
    official: "https://hotel-uhland.de/en/",
    photos: [
      officialPhoto("https://hotel-uhland.de/wp-content/uploads/2024/08/Hotel-Uhland-Neu-1.jpg", "Hotel Uhland Munich exterior", "exterior", "https://hotel-uhland.de/en/"),
      officialPhoto("https://hotel-uhland.de/wp-content/uploads/2024/08/Hotel-Uhland-Neu-2-1500x602.jpg", "Hotel Uhland Munich property", "lobby", "https://hotel-uhland.de/en/"),
    ],
    facts: [fact("room", "Rooms", "Classic through suite categories with box-spring beds and coffee machine"), fact("breakfast", "Breakfast", "Included; continental and Bavarian buffet, 07:30–10:00"), fact("location", "Location", "Theresienwiese villa district near the station and Old Town")],
    pros: ["Breakfast is included", "Useful Theresienwiese and Sendlinger Tor access", "Characterful villa setting"],
    tradeoffs: ["Less immediately central than the Marienplatz hotels", "Verify the exact room category for the quoted rate"],
  },
  "hotel-deutsche-eiche": {
    official: "https://www.deutsche-eiche.de/en/?it=Home",
    photos: [
      officialPhoto("https://www.deutsche-eiche.de/site/assets/files/1181/dsc4598.800x800.jpg", "Room at Hotel Deutsche Eiche Munich", "room", "https://www.deutsche-eiche.de/en/hotel/"),
      officialPhoto("https://www.deutsche-eiche.de/site/assets/files/1182/dsc4674.800x800.jpg", "Hotel Deutsche Eiche interior", "lobby", "https://www.deutsche-eiche.de/en/hotel/"),
      officialPhoto("https://www.deutsche-eiche.de/site/assets/files/1266/dsc09080.800x800.jpg", "Hotel Deutsche Eiche dining", "dining", "https://www.deutsche-eiche.de/en/hotel/"),
    ],
    facts: [fact("room", "Rooms", "36 modern rooms with Wi-Fi, summer air conditioning and minibar"), fact("breakfast", "Breakfast", "07:00–11:30; €20 unless included in the rate"), fact("location", "Location", "About 200 m from Viktualienmarkt")],
    pros: ["Very central Glockenbach and Viktualienmarkt access", "Long breakfast window", "Strong food and nightlife fit"],
    tradeoffs: ["Breakfast may cost extra", "Lively surroundings may not suit a quiet-stay preference"],
  },
};

const aliases: Record<string, string> = {
  "monet-garden-hotel-amsterdam": "monet-garden-hotel",
  "the-july-boat-and-co": "the-july-boat-co",
  "wilde-aparthotels-berlin-checkpoint-charlie": "wilde-aparthotels-checkpoint-charlie",
  "platzl-hotel-munich": "platzl-hotel",
};

export function hotelEnrichmentKey(name: string) {
  const key = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return aliases[key] || key;
}

export function hotelEnrichmentFor(name: string): HotelEnrichment | undefined {
  return records[hotelEnrichmentKey(name)];
}
