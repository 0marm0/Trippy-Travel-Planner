// Bounded owner-attested activity-photo derivatives. Original attribution remains on each activity.
// Existing source inventory SHA-256: be5ccf79bb387b7819673bab206b601367ac120f0627841f843e89866c6f6cce
const activityPhotoCache: Readonly<Record<string, string>> = {
  "https://101countriesbefore50.com/wp-content/uploads/2021/04/okolice-Krakowa-3.jpg": "/media/activity-af2c99b6d85c792ec62ba367.webp",
  "https://a.storyblok.com/f/320720/1200x800/66a6d4654e/flagship_tour3_open.png/m/1600x1067/filters:quality(80)": "/media/activity-932a3c3cda28d002d97b31d0.webp",
  "https://cdn.prod.website-files.com/62e6c9692736d12a70afc63e/65c39cf5c17c6737190b34fc_marche-foodhallen-amsterdam-hd.jpeg": "/media/activity-ca50def9418aec21a79d170d.webp",
  "https://dst-cms.frogriot.com/wp-content/uploads/2025/01/Ogrod-Japonski-3-1920x1281.jpg": "/media/activity-a0a51c1327845d5c455783d4.webp",
  "https://images.ctfassets.net/gyb9rohhih9s/22fTbGEHGAYmkwMZrS85lJ/ccd4a5b96d6b8adf35b559c5ff2e9d4b/07_PTE_MS_Nordschleife_26_06_2025_8917.jpg": "/media/activity-737e92e4fa1ea7f7944904da.webp",
  "https://images.hln.be/MThkMzM1ZmI0MGFlMDlhODg2ZWUvZGlvLzIwMTMwODkyMS9maWxsLzEyMDAvNjMw/het-lam-gods-met-linksonder-het-paneel-de-rechtvaardige-rechters": "/media/activity-526ce59a81cc96eb9ffd70ed.webp",
  "https://images.trvl-media.com/place/6098924/577300c5-bb6f-403a-b762-91aa8b36ad5c.jpg?h=1200&impolicy=fcrop&p=1&q=medium&w=1600": "/media/activity-ed4a2f8cbcd8de8063e857f7.webp",
  "https://mediapool.bmwgroup.com/cache/P9/202406/P90553136/P90553136-mini-john-cooper-works-and-bulldog-racing-at-the-24-hours-race-nuerburgring-first-qualifying-on-30-0-2250px.jpg": "/media/activity-3efc1187c39f5d0728823260.webp",
  "https://s.inyourpocket.com/img/text/poland/wroclaw/photo-by-hrs-poland_2.jpg": "/media/activity-e5a36fd84c0825de81b2cc51.webp",
  "https://s2.tvp.pl/images2/2/c/0/uid_2c0b3afcd28641e9ae39ae2244de6a0a_width_1200_play_0_pos_0_gs_0_height_675.png": "/media/activity-9653af8645edf38c04b84608.webp",
  "https://s3.eu-central-1.amazonaws.com/pressland-cms/cache/metatags_image/fe/17070370-afrykarium-we-wroclawiu.jpeg": "/media/activity-1fa736cec14bbc873feea497.webp",
  "https://s3.us-west-004.backblazeb2.com/wcn-media/2024/12/shutterstock_2391541185-scaled.jpg": "/media/activity-ba8f7172697e69507a2cd4e9.webp",
  "https://s7.dziennik.pl/pliki/10703000/10703422-wawel-krakow-900-555.jpg": "/media/activity-6e6e932b5591a52b0a497cab.webp",
  "https://static.moniteurautomobile.be/imgcontrol/images_tmp/clients/moniteur/c680-d465/content/medias/Divers/Musees/Ringwerk-BMW.jpg": "/media/activity-c3a5c90ef73bedf7232084fe.webp",
  "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Checkpoint_Charlie_Berlin.jpg/1280px-Checkpoint_Charlie_Berlin.jpg": "/media/activity-7d37657aa10f9112c7bcd9d6.webp",
  "https://waymap.pl/images/guides/wroclaw/ostrow-tumski.webp": "/media/activity-a9954ff6a0a8fbf6857836a3.webp",
  "https://www.admirable-facades.brussels/media/1b4d4v5l/ett02-eastman-parc-leopold-polak-hoch-01-3419.jpg": "/media/activity-ce652a6436a0c5bde1f7d410.webp",
  "https://www.amsterdam-spirit.com/images/guides/heineken-experience-guide.jpg": "/media/activity-09882571f0c52de64f516e0b.webp",
  "https://www.caldana.it/files/vg/tour/2-Breslavia_06.jpg": "/media/activity-f9ec9189e839389aef2279f6.webp",
  "https://www.muenchen.travel/var/ger_muc/storage/images/_aliases/stage_large/2/8/1/5/4705182-1-ger-DE/dde493b58809-muenchen-deutsches-museum-verkehrszentrum-foto-sigi-mueller.jpg": "/media/activity-d9d9096d2d2c02c1885ad761.webp",
  "https://www.swinburne.edu.au/content/dam/media/place/STOCK-BMW_Welt_munich.jpg/_jcr_content/renditions/cq5dam.web.3840.2160.jpeg": "/media/activity-a3e74eb4ac6bbc66b8717651.webp"
};

export function cachedActivityPhoto(original: string): string {
  return activityPhotoCache[original] || original;
}

export const activityPhotoCacheCoverage = {"attempted":57,"cached":21,"rejected":2,"failures":{"unsafe_destination":18,"http_404":14,"http_400":1,"http_410":1,"http_403":2}} as const;
