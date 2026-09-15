import type { HotelPhoto, HotelRating } from "./trip-model";

export type HotelProviderMedia = {
  providerName: string;
  providerUrl: string;
  checkedAt: string;
  description?: string;
  lat?: number;
  lng?: number;
  photos: HotelPhoto[];
  ratings: HotelRating[];
};

// Generated from source-labelled travel-provider and first-party hotel results.
// Image URLs remain remote and retain per-photo attribution in the UI.
const records: Record<string, HotelProviderMedia> = {
  "GT3 das sportliche Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ce3da8ec",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.37725,
    "lng": 6.89755,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/RU5M-e_BR6rCqPXVgymQshcNRnMW9g3rZ9WdkX1YqSg=.jpeg",
        "alt": "GT3 das sportliche Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/EbtiiZqgbMWdKtry37jq6Gt2nNXAvZAJP3AOt-ptwDY=.jpeg",
        "alt": "GT3 das sportliche Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/1Ta7D5FcKlqoOYEEB6_7c7qbbjhgrO5ezOUmk3xC6YI=.jpeg",
        "alt": "GT3 das sportliche Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/CikyD_wiBZBbe-uk04UPdgcs-byB3s5Is8Ez4VGcquI=.jpeg",
        "alt": "GT3 das sportliche Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Y-0CvvLhe6Niq1mI7uQEt0i0oRpkUvRknFi7FSrysFg=.jpeg",
        "alt": "GT3 das sportliche Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/51zN37zEu8Z-aXm0_E4k79o8fDRSfehB40w6VndB5E4=.jpeg",
        "alt": "GT3 das sportliche Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.15,
        "scale": 10,
        "reviewCount": 473,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ce3da8ec"
      }
    ]
  },
  "Hotel Rieder": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/1cc7d070",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.33699,
    "lng": 6.89515,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7fcW_PeUhB9wyLvdgu1Qme0GvnxS2iZBJOpyb03g4Hw=.webp",
        "alt": "Hotel Rieder property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/W5C7Wc_i3g1rmlIh2YaLeExL3uuN7YREJUfC6ADKtVg=.jpeg",
        "alt": "Hotel Rieder gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hMRa4K8Fabj_QLqG1zt_wZ1k-E-FtEfAgcl_IqRep4M=.webp",
        "alt": "Hotel Rieder gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IaXu41hUl2f5Kqj_5ySHM8pmlqjOMs5oI8K6hZRn9UU=.webp",
        "alt": "Hotel Rieder gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TPfpr1mS8cyiH-oZLy2YA6ziM_g9hreD2xxEi57er9E=.webp",
        "alt": "Hotel Rieder gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1jiWZNjF46ttJFL97jYafnkzH73HiJEtFbHXsZ9l5Os=.webp",
        "alt": "Hotel Rieder gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1cc7d070",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.33,
        "scale": 10,
        "reviewCount": 430,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/1cc7d070"
      }
    ]
  },
  "Hotel Retterath am Nürburgring": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/61d6f8f4",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.33726,
    "lng": 6.89547,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/powz9D_FHw2RJjBsclInusPXWfHUJREnP6Durwds5CA=.webp",
        "alt": "Hotel Retterath am Nürburgring property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TFoG-s2GOZdyp0cJUOc-M06HrfIW6fvQJSHUrCHywbk=.jpeg",
        "alt": "Hotel Retterath am Nürburgring gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/A43cWaYVFIDFSNDIyJ_QSdCn8a6H8slX5ZPjLtQtFMY=.webp",
        "alt": "Hotel Retterath am Nürburgring gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5ujVuT-Hwt0FwngxBAbqvVX2mIZdnJ6LHRsLsnBHkx8=.webp",
        "alt": "Hotel Retterath am Nürburgring gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sNyk6-1BZdpci0Akm5EnTmBC6CNXlKwfY3cgxoVdjUw=.jpeg",
        "alt": "Hotel Retterath am Nürburgring gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0nt5-KU38zALAPXqvoxHR4ayDo2cykT5emRRl9SnYaw=.webp",
        "alt": "Hotel Retterath am Nürburgring gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.73,
        "scale": 10,
        "reviewCount": 158,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/61d6f8f4"
      }
    ]
  },
  "Land-gut-Hotel zur Burg Nürburg": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ebd3d575",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.34391,
    "lng": 6.95275,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vSYUWax-FA-qzOnfoY9STu1xyKj4Yrj4gImvEFKcaWE=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Wzd9KvVbSsx3EgYUp6mccCFgXLKlhdeoTnZpmujEvp8=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/v4CzsFT1Mf97UPusu6hMkzlLzuqneTR4fOI_Eo29iio=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/p9cbc4_B9dszuBT8_yjJ1vY__unqfzQEdu1zqPrdr54=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4EZqyR9SLHli1b-zih-P4PjZgaURhqESL6N_0fXLOn0=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/iiY0WMKOrcgkdCPYOIVGImDKZa4VODHvkMoq9lq8FK8=.webp",
        "alt": "Land-gut-Hotel zur Burg Nürburg gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ebd3d575",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.55,
        "scale": 10,
        "reviewCount": 265,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ebd3d575"
      }
    ]
  },
  "Motorsport Hotel Nürburg": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f4f91476",
    "checkedAt": "2026-09-15",
    "description": "Enjoy a comfortable stay with a restaurant, bicycle rental, and a garden, just a short walk from Nürburgring.",
    "lat": 50.33988,
    "lng": 6.95088,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/MogdCVTFZyPa7wXReZ-96vTnyOoP7k6jq_U8wBRgzF8=.jpeg",
        "alt": "Motorsport Hotel Nürburg property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/JfDBtPvD_6WSnU5Qox-O73NoK3o3gWfKYijLiR107ps=.jpeg",
        "alt": "Motorsport Hotel Nürburg gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/cgd9ZSuZmSr66WvenKjeXJZaRwl3DFMnp-6AkuR61-Q=.jpeg",
        "alt": "Motorsport Hotel Nürburg gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/DKxO3vtERIwAdJ2bak17V-RVgdq2co7B5c9huBI7yeU=.jpeg",
        "alt": "Motorsport Hotel Nürburg gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/c9KeFOkMQUaCL8isaguFXKzvm4IH7h0sJeKxCmvg-Aw=.jpeg",
        "alt": "Motorsport Hotel Nürburg gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/jy-00dS4qFFnC8zsI-GTyHyOMWm6mZqH9alq2XxYDXg=.jpeg",
        "alt": "Motorsport Hotel Nürburg gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f4f91476",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 337,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f4f91476"
      }
    ]
  },
  "Lindner Nürburgring Motorsport Hotel": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/nürburgring-motorsport-hotel?cip=234716015&currencyCode=USD&search=100-1152016;dr-20260922-20260924;drs-40;rc-1-2&dealId=7108805443994073531",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.33110046386719,
    "lng": 6.945839881896973,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/e6/e2/0eb83259be953e4b150da2834e9ecc13ed5d5ccd15b1433e6eeedc1c3b4a",
        "alt": "Lindner Nürburgring Motorsport Hotel property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/nürburgring-motorsport-hotel?cip=234716015&currencyCode=USD&search=100-1152016;dr-20260922-20260924;drs-40;rc-1-2&dealId=7108805443994073531",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.3,
        "scale": 10,
        "reviewCount": 1921,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/nürburgring-motorsport-hotel?cip=234716015&currencyCode=USD&search=100-1152016;dr-20260922-20260924;drs-40;rc-1-2&dealId=7108805443994073531"
      }
    ]
  },
  "Dorint Am Nürburgring Hocheifel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/51b2fea7",
    "checkedAt": "2026-09-15",
    "description": "Enjoy a sauna and terrace views at this hotel near Nürburgring, featuring a restaurant and 24-hour front desk services.",
    "lat": 50.33653,
    "lng": 6.95042,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5_lwgPT8JAgtckIcmahu4-lt369ZlshSV1nObw2ijBo=.webp",
        "alt": "Dorint Am Nürburgring Hocheifel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lS152DnpDmt3PwKt_mq2UR61EhvYQhEH6aGG29gUP4w=.webp",
        "alt": "Dorint Am Nürburgring Hocheifel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FrfWEfAEwpt96rQ5elVTtreCnvx-BZ_3pvCtsdjUSTU=.jpeg",
        "alt": "Dorint Am Nürburgring Hocheifel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/v5f9IRhojpN4_6vmAxBV071B9CL0U1UillW0MOG6z9U=.webp",
        "alt": "Dorint Am Nürburgring Hocheifel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/R51Appq3xT3uTRRKKeWnPnEA-VZywAD2VF5A2O1N1jk=.webp",
        "alt": "Dorint Am Nürburgring Hocheifel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UisUsfltcgTgI3t1Guh66YakbiQBXGXU1UBpwOy1WwQ=.webp",
        "alt": "Dorint Am Nürburgring Hocheifel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/51b2fea7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.77,
        "scale": 10,
        "reviewCount": 1435,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/51b2fea7"
      }
    ]
  },
  "Hotel am Tiergarten": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/779939a1",
    "checkedAt": "2026-09-15",
    "description": "Comfortable hotel with free parking, air conditioning, and a restaurant in Nürburg, Germany.",
    "lat": 50.34188,
    "lng": 6.95299,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/-CWxxTgWa1Z-GB6ed5skTXnMhcrzwOpWQbZFFTVyppQ=.jpeg",
        "alt": "Hotel am Tiergarten property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/779939a1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/MMKB7NRF8QAF88ulx4szwl_0QzBDWM213xW2Yes29Fw=.jpeg",
        "alt": "Hotel am Tiergarten gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/779939a1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/6wNm0xpfvPXOeTRQF6a2zt7IrvAURJV3xVUmxhHadMU=.jpeg",
        "alt": "Hotel am Tiergarten gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/779939a1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/aanuK3JSJ5-cmyWAXLWDlbqQ8xTTcmbamOPJfzbI_8Q=.jpeg",
        "alt": "Hotel am Tiergarten gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/779939a1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/3AIDRZb82KFjC6kg-mTtA0gaMSbHGNnET5GfCBEWLEs=.jpeg",
        "alt": "Hotel am Tiergarten gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/779939a1",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 400,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/779939a1"
      }
    ]
  },
  "Hotel an der Nordschleife": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2b2ef1b7",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.37665,
    "lng": 6.9517,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/fiv2Z7leaIxFu8JrnQdSpU7LUGFjPb07eUKAYdYJLPo=.jpeg",
        "alt": "Hotel an der Nordschleife property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/cpat3bQC5auaPIkyMRxUlaMYnnxC-KZmWEWvpl2Cpfo=.jpeg",
        "alt": "Hotel an der Nordschleife gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/JwyQsVoaRBY02yEn7qnoFuQw8rIX3vg2AoBuOfeZbJg=.jpeg",
        "alt": "Hotel an der Nordschleife gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/d2EJ_LR4hEdpiB81NT1OsQkcg2UyMjYSaacmPuzl-So=.jpeg",
        "alt": "Hotel an der Nordschleife gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/njdYL8DKGKWRAXF7OhhIm8BWezrQC8KokKx-zBRAp8Y=.jpeg",
        "alt": "Hotel an der Nordschleife gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/whvBNKzP1lqcrmbyZTMMrnRzJZQr3MKCNupivb0Jd6Q=.jpeg",
        "alt": "Hotel an der Nordschleife gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 474,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2b2ef1b7"
      }
    ]
  },
  "Hotel Blaue Ecke": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d511739c",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.3828,
    "lng": 6.9292,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/iw3Q6mLBFcrSYY0rYTpN7RFHx2r-zkVkGQTYiicg8WY=.jpeg",
        "alt": "Hotel Blaue Ecke property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/QLBhNcpwzJbeL0bqs_fA5Rjk0DGFmPMNFRjKVNfqxRs=.jpeg",
        "alt": "Hotel Blaue Ecke gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/biJSqjGSHC20qr78QVyfs74DG9aVmbVvOcfclxGaiTU=.jpeg",
        "alt": "Hotel Blaue Ecke gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/EhWY6s-ZQsGMIRT7-1mFkpTzBNsTMrT0AtyzgT6qhnE=.jpeg",
        "alt": "Hotel Blaue Ecke gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/iQsj6TrfsmOcPETLZ1UUY7UKLfN_SIEzCXjObaZD5DA=.jpeg",
        "alt": "Hotel Blaue Ecke gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/pzyIYpi4r3t_ItQl2z5XLTLWwyzs8reAx0cXs6iST9w=.jpeg",
        "alt": "Hotel Blaue Ecke gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d511739c",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 572,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d511739c"
      }
    ]
  },
  "Landhaus Sonnenhof": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8f7f4f63",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.37698,
    "lng": 6.92274,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jvniwM73M7Zojji9EsglJl58Kfn4Y8t4tugE_9fi-l8=.jpeg",
        "alt": "Landhaus Sonnenhof property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fM921OAtdPPBApqGKgkaRu-f4Ot5Cbj59wsyF_SKhG8=.webp",
        "alt": "Landhaus Sonnenhof gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vp0VyQmekZaT0Mu2nay1Ivb8HA_25QfSQCrfLNYNBfQ=.jpeg",
        "alt": "Landhaus Sonnenhof gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/c74MFX49tEpiMEW3RXZyRxRbSp2vAdK9D2KFpC1pl0Q=.webp",
        "alt": "Landhaus Sonnenhof gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HKe5g8ToleH3DYXoOmhwr20ooR42g1EKLwU5HGq_KWA=.webp",
        "alt": "Landhaus Sonnenhof gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7mL0CQf-T7pPnw9DhKv6aYYE6lmPQmINSR1Jkxh_I_o=.webp",
        "alt": "Landhaus Sonnenhof gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 739,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8f7f4f63"
      }
    ]
  },
  "Land-gut-Hotel am Ring": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/land-gut-hotel-am-ring-meuspath?cip=234716015&currencyCode=USD&search=100-1368098;dr-20260922-20260924;drs-40;rc-1-2&dealId=-8056662413650486540",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.347129821777344,
    "lng": 6.971310138702393,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/48/45/68aa7f10666ab886a3ac0199689706c16a7c0f72b83e063352f8d0052a9e",
        "alt": "Land-gut-Hotel am Ring property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/land-gut-hotel-am-ring-meuspath?cip=234716015&currencyCode=USD&search=100-1368098;dr-20260922-20260924;drs-40;rc-1-2&dealId=-8056662413650486540",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 386,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/land-gut-hotel-am-ring-meuspath?cip=234716015&currencyCode=USD&search=100-1368098;dr-20260922-20260924;drs-40;rc-1-2&dealId=-8056662413650486540"
      }
    ]
  },
  "Gasthaus Weber": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/e1d2c85b",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.33733,
    "lng": 6.89444,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/35HIKsXH1B_9MVtd7EeDdrms9MtgrsWDbreUiKALKEQ=.webp",
        "alt": "Gasthaus Weber property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9g0WgFuFrJMMHDZPeVFH4gN6hh7Km1fgDrZnKBrPtC4=.webp",
        "alt": "Gasthaus Weber gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KZT7H4a15lPmEG6Ct_txdJ-1a7X6HzJNXub_5SS9FOA=.jpeg",
        "alt": "Gasthaus Weber gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BSJ1YVo07anFIb8GfunMbu7LPyDsjddaYfUnH8pZw64=.webp",
        "alt": "Gasthaus Weber gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/EdEES7tCp5lJ913XRM1M005KR5Q2I30OQ0tfxpzTOdU=.jpeg",
        "alt": "Gasthaus Weber gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8tek37T_lDDmmaGmThZI1IVqNc1d4XSNWWzda9wZdUk=.jpeg",
        "alt": "Gasthaus Weber gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.17,
        "scale": 10,
        "reviewCount": 242,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/e1d2c85b"
      }
    ]
  },
  "Pension N-Ring": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/47601496",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.33958,
    "lng": 6.95229,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=bks/1KIXzPRtCg94D1UxyJ2FnjJGnJ-21kaSHpOqGTYAwYs=.jpeg",
        "alt": "Pension N-Ring property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/47601496",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=bks/QzD1-2UjMRB5FleSK-UIWwfwvz2W-eYwcOYLgkP5VKY=.jpeg",
        "alt": "Pension N-Ring gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/47601496",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=bks/44kDB3UqeFFoSJhdlw3auHSzp7PmhhLlgsxoF1QRwCU=.jpeg",
        "alt": "Pension N-Ring gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/47601496",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=bks/wrXSK8EKSUXCRBuz2P4nfv5gSKKx9gSquAQ-jF5ZJPQ=.jpeg",
        "alt": "Pension N-Ring gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/47601496",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 10,
        "scale": 10,
        "reviewCount": 3,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/47601496"
      }
    ]
  },
  "Hotel Parc Fermé": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a88a40e9",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.38414,
    "lng": 7.02742,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/4d8Nu6V43yvIzTobBH9aJvVrGC36zSfkrMwRH0yyZaE=.jpeg",
        "alt": "Hotel Parc Fermé property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Hhl0ig9MlkWwlFuSTiooIM8ofaWWOre5l7E366SGbRY=.jpeg",
        "alt": "Hotel Parc Fermé gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/-JbqGis2R6R2Aha8XAWKQemLTKDtRo_skodqKUwoY6Y=.jpeg",
        "alt": "Hotel Parc Fermé gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/afdUF5jY2PVh7CUKelJs9xwJOQFixl_VjkRO54cYzls=.jpeg",
        "alt": "Hotel Parc Fermé gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/6yNfodC64izTGVXnuuH0mMAHXmBYy0WH_B8PfogscBE=.jpeg",
        "alt": "Hotel Parc Fermé gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Dq-runH5E3QAmEuXVbQduVpkLjI6fyxX2EnyGKgdJtU=.jpeg",
        "alt": "Hotel Parc Fermé gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a88a40e9",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 208,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a88a40e9"
      }
    ]
  },
  "Park Hotel am Schloss": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ef902738",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.36799,
    "lng": 7.19282,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HTqLWJsWSG3hoT4F6UqDPtJxmOM4RNM6OYPibP1aNy0=.webp",
        "alt": "Park Hotel am Schloss property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/iDSov2pLYL5HGmehMunDoSxKlsUuBZCmNwYaswRnN9g=.webp",
        "alt": "Park Hotel am Schloss gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/--m5f7A_qnIkOPN_-2Vs6Hf753K4sLZFgpUa0xdtiCs=.webp",
        "alt": "Park Hotel am Schloss gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2ZvraN9Ie-79YlX_D5OKM_8rZ3JZRjMixoUq1g_GsUA=.webp",
        "alt": "Park Hotel am Schloss gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aO53jnGzWI9E-9CiLpitP0qOd2fb9DPYbPNGPJbMbFg=.webp",
        "alt": "Park Hotel am Schloss gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rpZ4PuWrUccS7-JdrFG2V4-EgksQ75euUTa5UQ976Uo=.webp",
        "alt": "Park Hotel am Schloss gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ef902738",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.27,
        "scale": 10,
        "reviewCount": 233,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ef902738"
      }
    ]
  },
  "B&B HOTEL Wrocław Centrum": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4dbabe63",
    "checkedAt": "2026-09-15",
    "description": "Hotel in the heart of Wroclaw with air-conditioned rooms and convenient amenities, just a short walk from local attractions.",
    "lat": 51.10659,
    "lng": 17.03856,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ey0OcTyhWeuystJuZVAsHKSlp9WMbm6lZR6p5gjCXMY=.webp",
        "alt": "B&B HOTEL Wrocław Centrum property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rXzQVURfwP0Yf1U6RHVg83fOV4_L9o3-yviYyiPhJvs=.webp",
        "alt": "B&B HOTEL Wrocław Centrum gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VucKDvDrxzvbELor8mBY5zTqWrMkertxUtLmUVSu77I=.webp",
        "alt": "B&B HOTEL Wrocław Centrum gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TA4N1__fIYKoOKwPiTMw0WUA7eywD9ie5tCX2I73LIg=.webp",
        "alt": "B&B HOTEL Wrocław Centrum gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kor4lfeLomAYAz5vhNw8KH_e0HKg5lDHfD65stNrFKE=.webp",
        "alt": "B&B HOTEL Wrocław Centrum gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/W26nkkdBouquDWH5rR6-j8WfJzmMU4ZnVLDFVF5PZSM=.jpeg",
        "alt": "B&B HOTEL Wrocław Centrum gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4dbabe63",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.53,
        "scale": 10,
        "reviewCount": 7027,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4dbabe63"
      }
    ]
  },
  "PURO Wrocław Stare Miasto": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/25e0e389",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Wroclaw with a 24-hour health club and an attached winery, just minutes from local attractions.",
    "lat": 51.10807,
    "lng": 17.02472,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YIU8cPT9FQPHqR3YowFxrsuZteTrDWmDccVwk7bejiM=.webp",
        "alt": "PURO Wrocław Stare Miasto property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_YLGwhEsofa9oMS1z5C4m_0mMQLrZEsZIjuc5Hkl_7A=.webp",
        "alt": "PURO Wrocław Stare Miasto gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NJKt-Y_DqEqOL1iYBp6NB3OPjAAeN_3dzVQ63FURz_o=.webp",
        "alt": "PURO Wrocław Stare Miasto gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/G431XI-5tkWk3-Kp8HsL9mGbfAlKw6d3S-m5sgRVlKA=.jpeg",
        "alt": "PURO Wrocław Stare Miasto gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DA61oyxMQok5Vtb1KrJaDv_uiK-NxiADq9VXaDRxtdI=.jpeg",
        "alt": "PURO Wrocław Stare Miasto gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0GVQ0CXlUBBqTUep1Dyk_K7kvg6sq0_kVMZbkv1tmjM=.jpeg",
        "alt": "PURO Wrocław Stare Miasto gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/25e0e389",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.2,
        "scale": 10,
        "reviewCount": 4146,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/25e0e389"
      }
    ]
  },
  "Wyndham Wrocław Old Town": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/hotel-wyndham-wroclaw-old-town-wrocław?cip=234716015&currencyCode=USD&search=100-122767;dr-20260924-20260927;drs-40;rc-1-2&dealId=6953971758612909017",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.11132049560547,
    "lng": 17.02861976623535,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/fc/15/5dd6c7278685e9253aaf9835cab68cc31fe0a9fc8d4e2edb24cfed75d4c4",
        "alt": "Wyndham Wrocław Old Town property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-wyndham-wroclaw-old-town-wrocław?cip=234716015&currencyCode=USD&search=100-122767;dr-20260924-20260927;drs-40;rc-1-2&dealId=6953971758612909017",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 17262,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-wyndham-wroclaw-old-town-wrocław?cip=234716015&currencyCode=USD&search=100-122767;dr-20260924-20260927;drs-40;rc-1-2&dealId=6953971758612909017"
      }
    ]
  },
  "Hotel Altus Palace": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3005c9af",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Wroclaw with a full-service spa, hot tub, and 24-hour fitness center for a rejuvenating stay.",
    "lat": 51.10497,
    "lng": 17.03641,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/RoXU8stfjUVglQaVhEEDCBqMhTqD3-4YDQHxc_O1wJU=.webp",
        "alt": "Hotel Altus Palace property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/XmGBkP0tGWLlbK8PIXEKE1Vyr4m_P_fYxpW3qXz2l7U=.jpeg",
        "alt": "Hotel Altus Palace gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/YWhSpZY2rQPV1uri-BNYyyvsrs7raF0PRrCk0RupCh0=.webp",
        "alt": "Hotel Altus Palace gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/OEyF_UVQYBR-WtT1Nq7lvQw19YMXi4rJ3_I_rYpLrHw=.webp",
        "alt": "Hotel Altus Palace gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/uvoU5-cjlPNc3K21y9UFfrTnp4-0kwbd4fsrKmlIaPA=.jpeg",
        "alt": "Hotel Altus Palace gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/wKNdaqzLkXcsGm7xo3rla4a85gRBqVcd0jYrwBxVtD8=.webp",
        "alt": "Hotel Altus Palace gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3005c9af",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.4,
        "scale": 10,
        "reviewCount": 866,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3005c9af"
      }
    ]
  },
  "The Bridge Wrocław – MGallery": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/08a8e723",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.11379,
    "lng": 17.04798,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vrJpGZ5uZZ-UbP-P1HZsoF6IE1xeB1Q3ZPxbzKN9EjE=.webp",
        "alt": "The Bridge Wrocław – MGallery property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IYLBdl9Rfxx3nzgOh-l9a4RFDmrznuxKaBeFCgLSuQo=.webp",
        "alt": "The Bridge Wrocław – MGallery gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DatXLcLENRlmsGLMEwRZtSAVFoytWCsBSO772-QVBwQ=.webp",
        "alt": "The Bridge Wrocław – MGallery gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fO_7AtuastwjjLodtUYLAt_nhlKpFvzWqrUUpjjvEbY=.webp",
        "alt": "The Bridge Wrocław – MGallery gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KuasK0E9tWW_kcYpJ7-xQlPQT4q0K4OvJnLSbK8d1J0=.webp",
        "alt": "The Bridge Wrocław – MGallery gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WfCdab00GYnaoB3KRLuo5q0uPulYpZ2X7BERR5BzR68=.webp",
        "alt": "The Bridge Wrocław – MGallery gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/08a8e723",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.28,
        "scale": 10,
        "reviewCount": 1384,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/08a8e723"
      }
    ]
  },
  "Hotel Monopol": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/e1fc89ea",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Wroclaw with a full-service spa, indoor pool, and two restaurants, just steps from cultural attractions.",
    "lat": 51.10603,
    "lng": 17.03081,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hpi4QlzEjbxbFA6_SoGfsobEZhMy566Afaz6P32Gtx4=.webp",
        "alt": "Hotel Monopol property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Xct3x83KnxYK_rc7_OnJmBLxX6BZh5iuDqJwUTxGCUw=.jpeg",
        "alt": "Hotel Monopol gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/w69e6Lvmllf5Jejx3ixPhuwgom1bp60svIffr2SvAn0=.webp",
        "alt": "Hotel Monopol gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rEFgYno1yybcE9ilqguBkYJUCHb3MZRadkttdhnN8xU=.webp",
        "alt": "Hotel Monopol gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yvE0Ns9WQScsJlefdHRAL40jUltPnEvkKtkITxBq7AU=.webp",
        "alt": "Hotel Monopol gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YpIQ4I0Jeiqvwe4yDPGSZjt8HVMmVaswN8ehwTOZ2QM=.jpeg",
        "alt": "Hotel Monopol gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.08,
        "scale": 10,
        "reviewCount": 2968,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/e1fc89ea"
      }
    ]
  },
  "AC Hotel Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/29fbf8f7",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.10769,
    "lng": 17.02703,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/951wJsfFjE-Ypq8eN96i8smN-z03LG31Yyg9JcDMKYw=.webp",
        "alt": "AC Hotel Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oUxQVOo-pU5KM11bE1R29q96wKHQffIeuKfgQAh6v6M=.jpeg",
        "alt": "AC Hotel Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/mgH_AqpUdCC2GfYZXeEq1lkky5sVXj9fCLF-8qGZHss=.webp",
        "alt": "AC Hotel Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/024-lSZc_nbh9nVCbobKcYebwUDwOqbyo5jQN9wpuTE=.webp",
        "alt": "AC Hotel Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/csZFQ28NxqRVXyUkAYnhk4ZsiZWj5yX1HV9U1q2qt4s=.webp",
        "alt": "AC Hotel Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/a7iZdPHQMuq7UyrTBLYrDXXc6N6iBX3d1v-N9pHBJOQ=.jpeg",
        "alt": "AC Hotel Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.98,
        "scale": 10,
        "reviewCount": 987,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/29fbf8f7"
      }
    ]
  },
  "Art Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/232bed78",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.11218,
    "lng": 17.02994,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/znp7eLz7EjrRXVN84JG_G38mklv8p047uFVG7DlUxaw=.webp",
        "alt": "Art Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2y1ewIL2nnU9z6ey_TpaaPW7FgeIqFzCQU9Wtb_wh0Q=.webp",
        "alt": "Art Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SFg8Mhw8rNZs7TEhq5EE0BP_7oIAEpCIHvIG0sl2DW4=.webp",
        "alt": "Art Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ssEa3LQAmGdw6oD3odgZU8U7RJ8EhKSey87UsdvOwk4=.webp",
        "alt": "Art Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6Uy5RKspMvFoI70-O-JCFd1BHTKYEoyLElLCmF9UKt8=.webp",
        "alt": "Art Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sW1isFTv0QE7I-nZGiaiZPWO-OVEmzgIatCVST-TiWs=.jpeg",
        "alt": "Art Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/232bed78",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 1340,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/232bed78"
      }
    ]
  },
  "Entre Hotel": {
    "providerName": "Official hotel",
    "providerUrl": "https://entrehotel.pl/en/",
    "checkedAt": "2026-09-15",
    "description": "Modern boutique hotel in central Wrocław.",
    "photos": [
      {
        "src": "https://entrehotel.pl/wp-content/uploads/2025/08/hero-background-scaled-e1755804455748.webp",
        "alt": "Entre Hotel Wrocław exterior and interior",
        "kind": "exterior",
        "source": "Official hotel",
        "credit": "Entre Hotel",
        "sourceUrl": "https://entrehotel.pl/en/",
        "verified": true
      },
      {
        "src": "https://entrehotel.pl/wp-content/uploads/2025/08/close-to-you-1.webp",
        "alt": "Entre Hotel Wrocław interior",
        "kind": "lobby",
        "source": "Official hotel",
        "credit": "Entre Hotel",
        "sourceUrl": "https://entrehotel.pl/en/",
        "verified": true
      },
      {
        "src": "https://entrehotel.pl/wp-content/uploads/2025/08/close-to-you-2.webp",
        "alt": "Entre Hotel Wrocław room",
        "kind": "room",
        "source": "Official hotel",
        "credit": "Entre Hotel",
        "sourceUrl": "https://entrehotel.pl/en/",
        "verified": true
      }
    ],
    "ratings": []
  },
  "Korona Hotel Wroclaw Market Square": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4290fac6",
    "checkedAt": "2026-09-15",
    "description": "Stay steps from Wroclaw Market Square with a fitness center, bicycle rental, and smart TVs in modern guest rooms.",
    "lat": 51.10908,
    "lng": 17.03357,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ieIepMhrDBhgqmJ7CkPz2HiMT6NNkDTWT9Wsl51AomI=.webp",
        "alt": "Korona Hotel Wroclaw Market Square property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JawU32V7znCLkLn2GlDfMMaoBe7OGMQTrY_ZUqCgmEA=.webp",
        "alt": "Korona Hotel Wroclaw Market Square gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oF0xunmrC-_-Bwa4WWLr0_ozlrDZux6xoL3bFl-kdnc=.webp",
        "alt": "Korona Hotel Wroclaw Market Square gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/v9L-fj47vVGWqpOAgBjKiVth-GMalHZmvXSlwGHTMnM=.webp",
        "alt": "Korona Hotel Wroclaw Market Square gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TmeK3o-q9aEo01j-wXC9zpu2ZhQqSaXBrA_pEGbKNWY=.webp",
        "alt": "Korona Hotel Wroclaw Market Square gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7AVXwTumS8tb4siujN7DJOdRlIEuDQ_wZgrG1BYl9KI=.webp",
        "alt": "Korona Hotel Wroclaw Market Square gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4290fac6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 3714,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4290fac6"
      }
    ]
  },
  "The Cyrus Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/42774d62",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Wroclaw with a 24-hour fitness center, restaurant, and concierge services, just steps from Wroclaw Market Square.",
    "lat": 51.11227,
    "lng": 17.02873,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WnW2NnfomqzWfIDjKIXqH2-queC2jziYBh-XT4_MeKE=.webp",
        "alt": "The Cyrus Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/H9TlykrINLLS1o1SWoZ46VjXv_R0SVdGlSV421rgwBY=.webp",
        "alt": "The Cyrus Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Uyz4OgfbDnKXZQuLUfDgVjKE3rH8ifG4x8OzZpAk6VU=.webp",
        "alt": "The Cyrus Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Gp-wjV6XTuinVxN75nF7O5BAaiJLZcyWRxukgej4GZ4=.webp",
        "alt": "The Cyrus Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xqb76EwwXWZFLC3wziX0UqlxgiZTSQVt-NH16-rkuZU=.webp",
        "alt": "The Cyrus Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lSirQkDBY0KaLRDVVSsE3pmeeUqgVSoEjAje3nkxvcs=.webp",
        "alt": "The Cyrus Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/42774d62",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.67,
        "scale": 10,
        "reviewCount": 112,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/42774d62"
      }
    ]
  },
  "Focus Hotel Premium Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4d380cf6",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.10906,
    "lng": 17.02627,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tNQmoTBKXKNfwnUmA0Q6O-V0Qm8BxaVsnStYgr4zGr8=.webp",
        "alt": "Focus Hotel Premium Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/InqdEIVvqou_R9eIk86dfScDyVPemWf0SQ2xWJxG77U=.webp",
        "alt": "Focus Hotel Premium Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fVrV7jicH0m_KONpufu3HmGkLMmTFWzhX_0wujfgEuo=.webp",
        "alt": "Focus Hotel Premium Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VMOwBpwmtSkO4mYlLofB62KmXq_AyC9pp3qK7Xfd4mk=.webp",
        "alt": "Focus Hotel Premium Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9Cfpq3D0YytNXSklUbiIYkrUzeogPqi_sJUHAswqDqw=.webp",
        "alt": "Focus Hotel Premium Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hQVmYO6bSmYKiUQ6632jJ-Ij4J6iU1iR3Rj9hCTpFpM=.webp",
        "alt": "Focus Hotel Premium Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d380cf6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.45,
        "scale": 10,
        "reviewCount": 35,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4d380cf6"
      }
    ]
  },
  "Mövenpick Grand Hotel Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/5afce11d",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.10003,
    "lng": 17.03612,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qN_cBhWiMYTxnG7wI4phWRgve79dOmZYjgXl9BXHQ-Q=.jpeg",
        "alt": "Mövenpick Grand Hotel Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/u86_xi_M_3_Xi_b7vbxjOX4AFqnnlAzMF5V5oFGiTlk=.webp",
        "alt": "Mövenpick Grand Hotel Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uh2xNVo-ydgLKzaz4KbGftHHsGYywaqbrA9M3OZQ2ZM=.webp",
        "alt": "Mövenpick Grand Hotel Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VL1AT48E6DdJGfBxiu2eyNStoKB8mEEOLmMKbVuNiE4=.webp",
        "alt": "Mövenpick Grand Hotel Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ar4h-s1TrogLLYdQuDkvZ0f8fDC10eenZmyv3KoPUSs=.webp",
        "alt": "Mövenpick Grand Hotel Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yiEOr5a3YXAhmW7cTlSipiGNJd1s3YItpY4kiyDi-Jg=.webp",
        "alt": "Mövenpick Grand Hotel Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5afce11d",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.37,
        "scale": 10,
        "reviewCount": 91,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/5afce11d"
      }
    ]
  },
  "DB Hotel Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/13bc1ebb",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.11276,
    "lng": 17.00433,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/soZJZknn7rnsGRKJwVqYkl1YafMcJcqvNqdxkL5opTE=.jpeg",
        "alt": "DB Hotel Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3PFeiHHMlZ9IRXqz-Vdm5j65CtJvCvUDkFUdPjAfmqQ=.webp",
        "alt": "DB Hotel Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TPtjtUlXXAByg-oF906Nfes8WoryL3wWfTEsfkGtsP4=.webp",
        "alt": "DB Hotel Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/k-G35eTJLEx-v5rpE090Tj5jrSNOGdw84zgfSvbl30Q=.webp",
        "alt": "DB Hotel Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nzU1W2J-R6a9ekIJGzLvqYa7iE7NEzg4miw3ehq8L9o=.jpeg",
        "alt": "DB Hotel Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KUm9Ay4J69wUqPbBqP5PS8sE1tqVuJLCTvuXryqKgrg=.webp",
        "alt": "DB Hotel Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.25,
        "scale": 10,
        "reviewCount": 167,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/13bc1ebb"
      }
    ]
  },
  "Scandic Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8e4a0a9a",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.1014,
    "lng": 17.02815,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OrwLOYQPPq37c_3LiVaqE8fOzCq3FRo0ebsy51Gr65o=.webp",
        "alt": "Scandic Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jqi2kExalpq8rITCB7gs-rcktgvCHf2QwGwOpaIhFyE=.jpeg",
        "alt": "Scandic Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_m4-HCuarxwH4JFaDOtzVUnG4CoC5t_SloS1ZaMLTGE=.webp",
        "alt": "Scandic Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/35EY6BmZudnV27lrZdUgx3OpixwDQoZ2hG1KuDV8VCk=.webp",
        "alt": "Scandic Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/g3VbzqHOAjo-HQv5IjRepc3YMDRTVINeuVcSu8RW1XQ=.webp",
        "alt": "Scandic Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3JFEBqxzCAeg4PtpGvvadaFVzY_MJkDJPAfcKIbyFh4=.webp",
        "alt": "Scandic Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.78,
        "scale": 10,
        "reviewCount": 4547,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8e4a0a9a"
      }
    ]
  },
  "Europeum Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/26e3a71e",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury with a sauna, fitness center, and bicycle rentals in the heart of Wroclaw, just steps from major attractions.",
    "lat": 51.10813,
    "lng": 17.02794,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tjOB9NzYNo0yiScF8sv6bGp9aR8Fr3dxes8ByyVtvcA=.webp",
        "alt": "Europeum Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BrEbqLDSTSTnvq8DarDlmGKw5LXkGDJ58VzIaGo1BE8=.webp",
        "alt": "Europeum Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RNCKFb_F6ipyC4FxtfJrQVOTcdhTdnvIwmM5w9dTuvY=.webp",
        "alt": "Europeum Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RxEVWua_vQoyUS-aeb74W2A_Fr18HGiMODDXiReuZes=.webp",
        "alt": "Europeum Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9Pgu-tZMWjKhF8-HdVFUNU7AxEnDWp1v4UTVd-2aQTU=.webp",
        "alt": "Europeum Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/98vbbucrfYvtWnqWcb4jAasfdCYBPyDS55Kz0tBvdHA=.webp",
        "alt": "Europeum Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26e3a71e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.03,
        "scale": 10,
        "reviewCount": 1991,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/26e3a71e"
      }
    ]
  },
  "Mercure Wrocław Centrum": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/e123e149",
    "checkedAt": "2026-09-15",
    "description": "Relax at the full-service spa in the heart of Wroclaw, just minutes from the Market Square and Church of St Adalbert.",
    "lat": 51.10861,
    "lng": 17.03902,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_eB8mK_VBKw5UzZdl4u2GhMjUNLXLLdFutB-oxi4a4c=.webp",
        "alt": "Mercure Wrocław Centrum property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SzYGy1ShAEGSa6EOs2PGZOYCMYl25NsClub_Vi7sXGI=.webp",
        "alt": "Mercure Wrocław Centrum gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/c1bA7lIl2NcX62Oj2vR-XRcefKokikdumYJ9ReDUPec=.jpeg",
        "alt": "Mercure Wrocław Centrum gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aVU8qMq-WEUYJT_vaxFc7d-8ph1UZNp-lJkw5zC6RUE=.jpeg",
        "alt": "Mercure Wrocław Centrum gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NuXanoHmrYm4_9q96bjIk9GaAhP1kowDAie2Qj31Lb4=.webp",
        "alt": "Mercure Wrocław Centrum gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qWrBhuuorlIt2g13IfERsH_BpnHJcW6gP-l3RSWBWr8=.webp",
        "alt": "Mercure Wrocław Centrum gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e123e149",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.78,
        "scale": 10,
        "reviewCount": 1615,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/e123e149"
      }
    ]
  },
  "SleepWalker Boutique Suites": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/70494c5f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.11147,
    "lng": 17.02611,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BmDdBkaRDqr5NnKTC8nC_PnM5b2PHRDurY6vE-EPs0M=.webp",
        "alt": "SleepWalker Boutique Suites property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F_-lMY_e3L1Zz_3u2AViKlkIiA5WERGvLmUNfmmcsDM=.webp",
        "alt": "SleepWalker Boutique Suites gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9YwjJOTAFU9mzmpvu9_0DaZmJKulzk2z94borqc9H8U=.webp",
        "alt": "SleepWalker Boutique Suites gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6EclD3c4-3WYSLlgU44ISDnEj5PIxElb6R9sj2MPQ54=.webp",
        "alt": "SleepWalker Boutique Suites gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/N1qcUH1emxDTThtI4tzirQ5np4pgiZtohTckiD2Q5JA=.jpeg",
        "alt": "SleepWalker Boutique Suites gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/c4qmQjGxYvugJSjudQqPiBhwq-gnA3ZfJuUdyl9ekoE=.jpeg",
        "alt": "SleepWalker Boutique Suites gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/70494c5f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.03,
        "scale": 10,
        "reviewCount": 866,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/70494c5f"
      }
    ]
  },
  "Radisson Blu Hotel Wrocław": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/radisson-blu-hotel-wroclaw-wrocław?cip=234716015&currencyCode=USD&search=100-123690;dr-20260924-20260927;drs-40;rc-1-2&dealId=-2137835262733976399",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.110870361328125,
    "lng": 17.044029235839844,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/81/87/a5d798458ede48aeafa83327691097891fe7d6be2de2f2d87b5edf38a52f",
        "alt": "Radisson Blu Hotel Wrocław property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/radisson-blu-hotel-wroclaw-wrocław?cip=234716015&currencyCode=USD&search=100-123690;dr-20260924-20260927;drs-40;rc-1-2&dealId=-2137835262733976399",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 8442,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/radisson-blu-hotel-wroclaw-wrocław?cip=234716015&currencyCode=USD&search=100-123690;dr-20260924-20260927;drs-40;rc-1-2&dealId=-2137835262733976399"
      }
    ]
  },
  "DoubleTree by Hilton Wrocław": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/75e42919",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 51.108291,
    "lng": 17.043363,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tXYPxI-s1maLOJPWsOW9Z6mdyF1vdRKM0Qp9xywke58=.webp",
        "alt": "DoubleTree by Hilton Wrocław property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ISUy_CyeWSGnwGGL6GnOsKhXYbYvPPk74JlyZOWvxYE=.webp",
        "alt": "DoubleTree by Hilton Wrocław gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LCCmlcG4flodpZkSze5QoIHNLsfGNWnrNEkNldamoH0=.webp",
        "alt": "DoubleTree by Hilton Wrocław gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/N6oHEUAo1BLbFhLqQEtiZaBiq6xlSImSZ3OFSqSCISQ=.webp",
        "alt": "DoubleTree by Hilton Wrocław gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9hg3-7LtFBg5l2U9uJx1J4UjGGw0b7pL4363cXyycRo=.webp",
        "alt": "DoubleTree by Hilton Wrocław gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nTwHIOOnzlU0zHUYPGrSKgMD9iMw468ZLXZKvUO_cY4=.webp",
        "alt": "DoubleTree by Hilton Wrocław gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/75e42919",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 2241,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/75e42919"
      }
    ]
  },
  "H15 Palace": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c17d44b1",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Kraków with indoor pool, spa services, and a restaurant, just a short walk from Main Market Square.",
    "lat": 50.06463,
    "lng": 19.93969,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AbURcrivEzxET6VfR38YLMoKrBXeqPSpEfveRDDTZw8=.webp",
        "alt": "H15 Palace property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8I8SSFMDbRK_jKz9P_sLae6DkVCoeutVAc7HXodb5tI=.jpeg",
        "alt": "H15 Palace gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XeDw8SRS692Bjtv-ifZJV1nbeXj-tbLKNHZaDjLXucI=.webp",
        "alt": "H15 Palace gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KXk8MkzJ3nCv_AVw36kOz1rYgKnzmFrvXuknLTjWmVE=.webp",
        "alt": "H15 Palace gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eBVRxgPn4SfGRpndu0rFGP0MpM9YfJr_je0clkiZbE0=.webp",
        "alt": "H15 Palace gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/i8qyTWyfqtNbtqNCfoFrFQDErlKoCvb5ILe-sEXPLXk=.webp",
        "alt": "H15 Palace gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c17d44b1",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 859,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c17d44b1"
      }
    ]
  },
  "Hotel Stary": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/11c86784",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel with spa, 2 indoor swimming pools, and fine dining near Main Market Square in Kraków.",
    "lat": 50.06301,
    "lng": 19.93634,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/D-h7a4fEq7beyZZaNur4FBmkfp9pyfJshy613OOzy2A=.webp",
        "alt": "Hotel Stary property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/f23gBMwZUPLK0p4v3smLO3miaEr6XyG8JNtpS0s_d8c=.webp",
        "alt": "Hotel Stary gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rLOgiIARsnVO0fPvRawmUfAYmL7TifDvDcoYeEqr1Co=.webp",
        "alt": "Hotel Stary gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YfSAPhcHpvvWBDDMNYu-VPAVSNMqCVcHiiDPl7_gap0=.jpeg",
        "alt": "Hotel Stary gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/i668Q7ZHgk_eedAaGVfUBxTE-v5j5T4gqSEilO85Ji0=.webp",
        "alt": "Hotel Stary gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/G8O4V0wFLcvyg61VmkTLQG__jtaOjpiYdWOe0XJOftU=.webp",
        "alt": "Hotel Stary gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/11c86784",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.43,
        "scale": 10,
        "reviewCount": 896,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/11c86784"
      }
    ]
  },
  "Hotel Copernicus": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d1b2446e",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05625,
    "lng": 19.93752,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AcxXMEdeW3eTj-mCUjNDLb-u7Q1XVCnpWjE2hjEb5kw=.jpeg",
        "alt": "Hotel Copernicus property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8KOVVgrh_8ifoeew44_sqr6WNxDE6VM2F_6DXWpfbdg=.webp",
        "alt": "Hotel Copernicus gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-b15JoEU9cSY_x5325PPmhURMF4BjCcn13KQ2XJWLdE=.webp",
        "alt": "Hotel Copernicus gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xXbQpPNgtU6V_chn3TFUim9viJPPvzlJEDopLCpVcgY=.webp",
        "alt": "Hotel Copernicus gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ibmPkTE3sAY0S9VFOdJslBLFe-Qj50eQtACK-eQYm98=.webp",
        "alt": "Hotel Copernicus gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8UjDP-4F77ZkVNx4_KA6zOl5Gun0YZ8cMREeD6zcQ4w=.webp",
        "alt": "Hotel Copernicus gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d1b2446e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.33,
        "scale": 10,
        "reviewCount": 655,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d1b2446e"
      }
    ]
  },
  "PURO Kraków Kazimierz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/00244e43",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury at this spa hotel with a fitness center, sauna, and on-site dining in the heart of Kraków's Kazimierz district.",
    "lat": 50.05202,
    "lng": 19.9517,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/09VW_2aXlT16peg4eBwd5HdDNh5di5ajwT7mhch-pvQ=.webp",
        "alt": "PURO Kraków Kazimierz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/d0pYZejH8jJZeqKeP4ouL1PWMmTO6Wlrg48q8FkjkV8=.webp",
        "alt": "PURO Kraków Kazimierz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eP-W8B8TZCp0CKNX5DMGQFiYpsqFohh_21uSp8GIV14=.webp",
        "alt": "PURO Kraków Kazimierz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5-tK41oYZUvDh4TBAZUMRVoRw4a-aVrAb50eItN-bw4=.webp",
        "alt": "PURO Kraków Kazimierz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AwpK6Mfq0ksTkaXYbj9CY-gzrVDI__PuHvoWrx7gu8c=.jpeg",
        "alt": "PURO Kraków Kazimierz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CdhB8XyoVPuk57sH0ptVc9MIUllBNYfG0kmDYZI7pb8=.webp",
        "alt": "PURO Kraków Kazimierz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00244e43",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.48,
        "scale": 10,
        "reviewCount": 6571,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/00244e43"
      }
    ]
  },
  "PURO Kraków Stare Miasto": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/84c799d6",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Kraków with a terrace, restaurant, and 24-hour business center for a comfortable stay.",
    "lat": 50.06877,
    "lng": 19.94499,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/npb99pg8plPeCpe7zoYjvOfV4atAPPW8XHA9YADqMyo=.webp",
        "alt": "PURO Kraków Stare Miasto property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tYarQtBjG3a0CM39JHWvrujFBag852zkfiLohU-PoTI=.jpeg",
        "alt": "PURO Kraków Stare Miasto gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/iPXF52DA5QS1OQhLD73TRaitwG-9DdaYoHU1mo80Mpo=.webp",
        "alt": "PURO Kraków Stare Miasto gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/A6qlFH4pDEQZphUa8aDMOFkGfvraqJ03kPYrfIsijtc=.webp",
        "alt": "PURO Kraków Stare Miasto gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0UzjJWgrqSO_qo60g6KJ1Fspd-fztPlN8aRt3ulspJw=.jpeg",
        "alt": "PURO Kraków Stare Miasto gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bRaJRDm1TyrQwH_HqjhLSd0CJQf2U1susiYUdS90aWI=.jpeg",
        "alt": "PURO Kraków Stare Miasto gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/84c799d6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.25,
        "scale": 10,
        "reviewCount": 3263,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/84c799d6"
      }
    ]
  },
  "Hotel Saski Krakow, Curio Collection": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/471b5f14",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.06334,
    "lng": 19.937416,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-MpnAEa71Asjjbf4v8xvPmEqfwLqWS5n5W7PTDy_0Sc=.jpeg",
        "alt": "Hotel Saski Krakow, Curio Collection property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FOX-cprFkbvYjnMgZcnwt95G3QCCN_qMDp0atNEUMn0=.webp",
        "alt": "Hotel Saski Krakow, Curio Collection gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ALdgh3LLiKeSP3niLp_ihffii3TTm2nFJo-pcQT2ogE=.webp",
        "alt": "Hotel Saski Krakow, Curio Collection gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vRlcb8u7c25a1GrI06_5M4o3KOn28di_1bNWG65JSUI=.webp",
        "alt": "Hotel Saski Krakow, Curio Collection gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MNo1uL6mYnCBRNmISDDXi9beJJvYl2oqgT5Z8VOHQFs=.webp",
        "alt": "Hotel Saski Krakow, Curio Collection gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CASaf0OwECN5O1G_PeYJ9jXhMdSYdVrAHZtf0GspizQ=.webp",
        "alt": "Hotel Saski Krakow, Curio Collection gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/471b5f14",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.52,
        "scale": 10,
        "reviewCount": 540,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/471b5f14"
      }
    ]
  },
  "Hotel Wawel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3cb3ac3b",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Kraków with an excellent in-house restaurant and immaculate rooms.",
    "lat": 50.05823,
    "lng": 19.93915,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ij1xAlInhO_kaStZHEqFQZg0q-j-aiUsMaODf4VA1dk=.jpeg",
        "alt": "Hotel Wawel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dFWriBDgRuJC3iNTpYsMMUb7WDvM1RHHWae3mNp7aLs=.jpeg",
        "alt": "Hotel Wawel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ooWSem_5yFDJLoGp_yvz0tb5NWm3kkgtEdQ1dl_e-uc=.jpeg",
        "alt": "Hotel Wawel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CyPdd9xtb5lxpJtXq_RNjyZvCqNsuVrBMBbtvt5wukU=.webp",
        "alt": "Hotel Wawel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QEn0qrFZ7tMg6PO4jYBAwdLDO4cIgY5mEqB0nUHqWHE=.webp",
        "alt": "Hotel Wawel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cE6aiPnaXSvSzQxdSZ0FWy0Pn156zmc2PKy8lnrh9ls=.webp",
        "alt": "Hotel Wawel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.15,
        "scale": 10,
        "reviewCount": 2379,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3cb3ac3b"
      }
    ]
  },
  "Amber Design Residence": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/406a9e11",
    "checkedAt": "2026-09-15",
    "description": "Centrally located aparthotel in Kraków with a sauna, fitness center, and easy access to Planty Park and Main Market Square.",
    "lat": 50.06266,
    "lng": 19.94334,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/st92FuZbhD6G4eLMa_xJaGIilRyrKyswLWQjR5mi_FI=.jpeg",
        "alt": "Amber Design Residence property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_mPmb1R9Cy4Tg2ZiZ8MuYdQLCuFBLiTi-1dopznTm7s=.jpeg",
        "alt": "Amber Design Residence gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KPqX-Zz94dcRhhbD485wpwFBLRUcRpJCgJTxaAcZWpM=.webp",
        "alt": "Amber Design Residence gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FRjsZEJ8FDFumOSHAjBEplSW2pSrwU5j7JU20weNrl0=.jpeg",
        "alt": "Amber Design Residence gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Izn_EwShckMwVp9BYAMFWRcKqKfI83n_DLizgayW1oY=.webp",
        "alt": "Amber Design Residence gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/D10fN722DxrQ01nj7igwVJv97IIr2e6gVtRCk4SNZiM=.webp",
        "alt": "Amber Design Residence gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/406a9e11",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.38,
        "scale": 10,
        "reviewCount": 1003,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/406a9e11"
      }
    ]
  },
  "Balthazar Design Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b4c66b38",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05577,
    "lng": 19.93817,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/o692IbLo5Aw39FugQcenjFXwYpxkixNETjbSxIn9--g=.webp",
        "alt": "Balthazar Design Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NJpacGHQ7ihKjG5UpHR7osuGqAapetunxotcjgytn6k=.webp",
        "alt": "Balthazar Design Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-8MkG2fjZOKvEHoQjuUlBe7uSuV4dcgkl5B-XrDuGMI=.webp",
        "alt": "Balthazar Design Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1NKKm3z-hlwrQLsVUjFgEcDXfL-rUmODSm7BeAgXyjc=.jpeg",
        "alt": "Balthazar Design Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ZK2lK6eeN4HWVXdwTN1FzquV56T6Y0wjSqCD9EEjF0U=.webp",
        "alt": "Balthazar Design Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qgDr-HGbkUq10tFrDozr1hLMA0A66a4sk4We9qQ7K6w=.webp",
        "alt": "Balthazar Design Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b4c66b38",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.6,
        "scale": 10,
        "reviewCount": 913,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b4c66b38"
      }
    ]
  },
  "Bachleda Luxury Hotel Krakow MGallery": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/26721527",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.0566,
    "lng": 19.9284,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9VfGYWOEkffQ67dmzz_RVAF6Bo0uhRjefCqo4ZCzIjA=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9QfvZIWdkd2doM8DLTwfu7sIIB8w_W_G811ZLfu3l9s=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/pbQ1WZ6BhaKDAYZOmfuhuOymwpfsknCsPIZS2zUSKUI=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-VEqPO0kGoWoJ_vJEUFNxA1Gn1FX6lN--DS6NEHS6C8=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/D5zB_DYn1xeuhntUinRcxH0X0CMtjzpj0-1Rb9AJZVc=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HY5aBWLze9I9af6cwuTKXrM8M2Q8L5KN9eggO73ty0Y=.webp",
        "alt": "Bachleda Luxury Hotel Krakow MGallery gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/26721527",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.58,
        "scale": 10,
        "reviewCount": 691,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/26721527"
      }
    ]
  },
  "Metropolitan Boutique Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d8c34087",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05507,
    "lng": 19.94764,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cpzMSVl2FqMdyb_hOrRzixl0d1VGVvk_gPv1oNN5lgE=.jpeg",
        "alt": "Metropolitan Boutique Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rz_RlQdui4VrL7fdHAT5WXwadDc-fDb5DP4tO5STrZE=.webp",
        "alt": "Metropolitan Boutique Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RCReyvUmrikZ6e74ZS06owT7Q2FdAOsKrIev_1fKoOM=.webp",
        "alt": "Metropolitan Boutique Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/B6JFTVk-yZw3DuZP9IJh-JXdx6fTx1MvSXJzvxORsLA=.webp",
        "alt": "Metropolitan Boutique Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tr9BAp9_u2R_sXeFE2MsYA9SGqj-WYzwLGSuvcPPTMM=.webp",
        "alt": "Metropolitan Boutique Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ba_ErZBub7kJRbuyqBVisMcq_JHitO8X1anrjPMtuvU=.webp",
        "alt": "Metropolitan Boutique Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8c34087",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.4,
        "scale": 10,
        "reviewCount": 1847,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d8c34087"
      }
    ]
  },
  "Hotel Unicus Krakow Old Town": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/50425498",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Kraków with a sauna, fitness center, and an on-site restaurant just minutes from Main Market Square.",
    "lat": 50.06345,
    "lng": 19.94104,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KsMbh9mLin6j6pEg-tFUVaV6Gf6qmQ4hn4V9ZNdjHyc=.webp",
        "alt": "Hotel Unicus Krakow Old Town property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yaIdHJ_dHf2FmIT7wg22KCplPzepIK1jizYfapmEKOI=.jpeg",
        "alt": "Hotel Unicus Krakow Old Town gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/mEf7NqmHs6jHgg-Il750s0u2FTDrZD6scn_-zCBwJhU=.webp",
        "alt": "Hotel Unicus Krakow Old Town gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uhwIsvAJFL3N56miEzRF_dnVw4atrHYFQax354g80nk=.webp",
        "alt": "Hotel Unicus Krakow Old Town gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Kn4plaTEZ2ywCfyCl4RmrJ5EXLUYStadWfQ8hDW9go0=.webp",
        "alt": "Hotel Unicus Krakow Old Town gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XtEFjzNRNZZZD0ZJy_pfutgmT-QGOWJo3OSTqUCtID0=.jpeg",
        "alt": "Hotel Unicus Krakow Old Town gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/50425498",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.98,
        "scale": 10,
        "reviewCount": 1130,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/50425498"
      }
    ]
  },
  "Holiday Inn Krakow City Centre": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/099e97b8",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Kraków with a spa, two restaurants, and a business center, located within a 10-minute walk of Main Market Square.",
    "lat": 50.05921,
    "lng": 19.94365,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2g1AS7eefU2Z63vUmjJk2t_DgVA9rNS_0GOLKQ9CXDA=.jpeg",
        "alt": "Holiday Inn Krakow City Centre property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ukm5T-a_b_xhR12jbgVsqLnZ2ZBOhurq4x6XflmPAcQ=.webp",
        "alt": "Holiday Inn Krakow City Centre gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/il_R2fBfwYLyG-aD695orixPa6TiPiRQ5DuequeXo10=.webp",
        "alt": "Holiday Inn Krakow City Centre gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/blROT-mIUjABUL8coGIYNh8SeFUo9_YgvMTyz3-M4f0=.webp",
        "alt": "Holiday Inn Krakow City Centre gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/f8Nl-bkTS8wVlJYx9GorEVZHBCrIE71IdlyEhW3s7p4=.webp",
        "alt": "Holiday Inn Krakow City Centre gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0gqd-zxEWQlS89ttl04uT-KwAFYBO6UCupbTFA5i0CA=.webp",
        "alt": "Holiday Inn Krakow City Centre gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/099e97b8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 1383,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/099e97b8"
      }
    ]
  },
  "INX Design Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6dd91425",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05114,
    "lng": 19.95066,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SVg7RwlryR_pgmPMuUsTmT7YnFIA2aFRASBEayYA87g=.webp",
        "alt": "INX Design Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GYYvSSagf_LDhsn08V6q2vDStlJMH_RMtenWHIs_hPc=.webp",
        "alt": "INX Design Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RqewE2QTsG6t4Lu6MjZ2itPAubfpaGxUv7ZiM4iwETI=.webp",
        "alt": "INX Design Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vJOUfp5gyukTHTxbW5zLM_JohLW2owlMUTlkoo2qqJ4=.webp",
        "alt": "INX Design Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/K9uYb-Y6kamlRKMbrxFW2KQCl7_g-7E8WT6oZS5a4r8=.webp",
        "alt": "INX Design Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rBerlXzApy8odxv32bDGisa1v5698X_34O5oKO05_VY=.webp",
        "alt": "INX Design Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6dd91425",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 2010,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6dd91425"
      }
    ]
  },
  "Hotel Wielopole": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3f604863",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Kraków with air-conditioned rooms, room service, and a tour desk for your convenience.",
    "lat": 50.05893,
    "lng": 19.94345,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ub1wCNCvCQrqOLvj92vWOk9GSalF0-BXQCR-Rtz6sBo=.webp",
        "alt": "Hotel Wielopole property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ULKzty1mYiMrZCHXkcs7e77Ol9rNz2wZLK1zMtn93ow=.webp",
        "alt": "Hotel Wielopole gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UrGtgoGVQutCP_MHreN9nWmB6R58RlMWetpMYhwp-A8=.webp",
        "alt": "Hotel Wielopole gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fU6aTALtpwy3sf9g_IYnfkpRGu-p3hbTLy4k_2zuph0=.webp",
        "alt": "Hotel Wielopole gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/024kKgRQ0Gs_HUV-qpIeFqHcwSxQk29Zp5xSwPSCUnc=.jpeg",
        "alt": "Hotel Wielopole gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FuIQc3RcS8H0CmXJIKNSyYUAYV2RV6NggMQv8vmHihY=.webp",
        "alt": "Hotel Wielopole gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f604863",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.03,
        "scale": 10,
        "reviewCount": 1504,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3f604863"
      }
    ]
  },
  "Hotel Golden Queen": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d8a0be0d",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05711,
    "lng": 19.93122,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Q8pnkaB-9i44YfSggp0mnkvriDQ1F4Iq5yTBU2Vcw9o=.webp",
        "alt": "Hotel Golden Queen property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TtEmvYTarxQeYdnR2RwfgQmr1sIIQ9sQDWMOdd0VSAE=.jpeg",
        "alt": "Hotel Golden Queen gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4j_cKoihywRKlJMT1Vwc9ada-ggy7cIkShw9QdVG-qY=.webp",
        "alt": "Hotel Golden Queen gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2rO83pUF1sMMQemn_sP49VBqeOZ7Z26riGuqzugjUvE=.webp",
        "alt": "Hotel Golden Queen gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sTMuunndBLfQuq5dpPGtIYNLUdtxYY9TBcZgiXejLdE=.jpeg",
        "alt": "Hotel Golden Queen gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XUCT49OQYLXqgoKz6VS3wjX5xTifddvl82E9JsSS8_g=.jpeg",
        "alt": "Hotel Golden Queen gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.43,
        "scale": 10,
        "reviewCount": 644,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d8a0be0d"
      }
    ]
  },
  "Iron Street by A11": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/eb5f8c52",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.07388,
    "lng": 19.94752,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/I9o0s-1bGNWW2iWui5ZtFqLrcpVi7-lDwBiK9jG_5Fo=.jpeg",
        "alt": "Iron Street by A11 property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/7Lbs8q2dZhwCOQmVThqNkWSMPjgFRTuBWcy9Thw_sAw=.jpeg",
        "alt": "Iron Street by A11 gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/0IgqhqfcS2QCnV5w-Epl1ybKh9UROoaP74t36s_eKzQ=.jpeg",
        "alt": "Iron Street by A11 gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/PU8oh-OdgfCAOF9t-vGBeDz06w84-tj5OTSQmbRciEs=.jpeg",
        "alt": "Iron Street by A11 gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/EIMzlFYyf9jTp6i-S5nPFedJtzM93RdQZOyGUdSQs3A=.jpeg",
        "alt": "Iron Street by A11 gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/gbU2BLZW9uPo4-NO7dbpU880QPeoKUUU4yDSnuVPIj8=.jpeg",
        "alt": "Iron Street by A11 gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 7.95,
        "scale": 10,
        "reviewCount": 23,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/eb5f8c52"
      }
    ]
  },
  "Czeczotka Palace": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b1f2ce84",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.06135,
    "lng": 19.93531,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/9A8Dh3AT2Ms0S0Cqk5uQL5t9oK79OOkC1fFIKGPK_ls=.webp",
        "alt": "Czeczotka Palace property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/sKwa7EQ8LqUQlIdhzzc-HJ8NhqIPx1_uO9tnEWQA2g0=.jpeg",
        "alt": "Czeczotka Palace gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/F6uiGkw5bl0L3UryOZ-ioQpHWfK74cFz7CVHMqV7qoo=.webp",
        "alt": "Czeczotka Palace gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/O2lIUV-eXmm__Qoa5Baa_Q2-PQWQ_CchoJOT6FKHHPM=.webp",
        "alt": "Czeczotka Palace gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/GUqIqmrJVAjAEvalDZj7ikg0GTsTPy2jEG7hqE9UHQo=.webp",
        "alt": "Czeczotka Palace gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/hE0lwS7B6VyVloD9i-Mzl2oG1AoWHO4jjvZdq_5UiqM=.webp",
        "alt": "Czeczotka Palace gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b1f2ce84",
        "verified": true
      }
    ],
    "ratings": []
  },
  "Hotel Polski Pod Białym Orłem": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/766a0bee",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Kraków with a restaurant, business center, and individually decorated rooms near Main Market Square.",
    "lat": 50.06481,
    "lng": 19.94088,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tzw2b9j-LUNN4tSWcP6UbGlsFUBTF7VbO5hVbPZ40Do=.webp",
        "alt": "Hotel Polski Pod Białym Orłem property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bn7BIA95zIobRSERkiO2g8uH4l5Vsv1tfZe-TlE11zY=.webp",
        "alt": "Hotel Polski Pod Białym Orłem gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4mxexfFEoAxF_4bq6LADl6SlYOcmhHhn3NVMf0HgRqw=.webp",
        "alt": "Hotel Polski Pod Białym Orłem gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FgHwPgKM0O2HUy0-OsI3foUV3XJRo18pR6aRb9csvOw=.webp",
        "alt": "Hotel Polski Pod Białym Orłem gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/seBhHtmohGKz6rqtVu7Oxb3y6ENLbfB7N9dqpSlZEc8=.webp",
        "alt": "Hotel Polski Pod Białym Orłem gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xj92gjKuSKbs33KuoW0TaHjjGo8NfV2trzddFHtRR3U=.jpeg",
        "alt": "Hotel Polski Pod Białym Orłem gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/766a0bee",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.35,
        "scale": 10,
        "reviewCount": 1532,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/766a0bee"
      }
    ]
  },
  "Pulitzer Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/02736d68",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37282,
    "lng": 4.88328,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vugn6LknNCU4DzeJThqyB4VgXgoGW9KTH63QvNX-rI0=.webp",
        "alt": "Pulitzer Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_UfR1AbN-AlIbDWps9PmyhN55qJwm5NDCmbjXVxkfJs=.jpeg",
        "alt": "Pulitzer Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Uj2Hl1TcnG3zLHK9rF4IsiqRzdKRaVbn_N1k8WAVWqA=.webp",
        "alt": "Pulitzer Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8OeuAN16byJjTLB0-Xl-Txd2brQ84H4uYC5co9ksB7w=.webp",
        "alt": "Pulitzer Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QJQ6-dUknOvbSycXSTU9g5YsuXU41XxgxltOCPE-y1E=.jpeg",
        "alt": "Pulitzer Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Sun5nk6xDNoZHG759YjEmvNj9nJPdngC8WotwMrHUXI=.webp",
        "alt": "Pulitzer Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02736d68",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.13,
        "scale": 10,
        "reviewCount": 1003,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/02736d68"
      }
    ]
  },
  "The Dylan Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c261b517",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36928,
    "lng": 4.88424,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F4YgEIG--zoDSWYTYIrJT_JI53nPHHcov27Ze2JOCqU=.webp",
        "alt": "The Dylan Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JYSpDBrrbVMDz265SyLlog-GKzO__RiDt7k4WfRvibU=.webp",
        "alt": "The Dylan Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gO3g2eab9-hYKUdD2Z_1yTDyllFVN4NLyIpewTHERQE=.jpeg",
        "alt": "The Dylan Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/wfT9u8kfaADCg66zLirAujcKyTvXqdedOTYaLTXxgyM=.webp",
        "alt": "The Dylan Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tsdRP0KapUU3qxBmCapaMBn5xJ0GFOBzGyaTdUfxbXs=.jpeg",
        "alt": "The Dylan Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_t4X3Crhqx7y66k9r7CXw6Ze2dl4ScunAZFaUIW9lZ0=.webp",
        "alt": "The Dylan Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c261b517",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.41,
        "scale": 10,
        "reviewCount": 1140,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c261b517"
      }
    ]
  },
  "The Hoxton, Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/78cab2b8",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37182,
    "lng": 4.88738,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GrBT5Dc-qxDeeIp5YuvVOTGWVmr_1Z5yQc6Oi8d6BwQ=.webp",
        "alt": "The Hoxton, Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SBR1yCkAFhINSltoD9Ok9UNI94U8v3lH_R3b1AOqixQ=.webp",
        "alt": "The Hoxton, Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RbPVIrGGpp9KhCtY71DFKmRnvYxYPS4SLcSxKntB4to=.webp",
        "alt": "The Hoxton, Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8B9MNeBMHp0IYQGU5tTxLsUPTiqgrZEN5OUlE6XETh0=.webp",
        "alt": "The Hoxton, Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yUx-69mz9xfeOt6c2A2e-Ngr8G4W41wKoYZ0xL-zRpI=.webp",
        "alt": "The Hoxton, Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vzc12nMrM4lKm7X-DwmK7YS3PISHZbYcvxyrz9ERRDE=.webp",
        "alt": "The Hoxton, Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/78cab2b8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 1004,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/78cab2b8"
      }
    ]
  },
  "Hotel Estheréa": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/5e352fb3",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37047,
    "lng": 4.88849,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aXzpi2eh0EOsfHGIA5C9I-hYKLlBfHZIOqmOMIoM21w=.webp",
        "alt": "Hotel Estheréa property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cp3vSAAUOWSl4gGLtoyDgYFlcLDNSe-Jaj8WSsvO2rk=.webp",
        "alt": "Hotel Estheréa gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GyURlHUu7WGt1ws5j5YMjeY2YCPHQWjsdMtT7llWGdg=.webp",
        "alt": "Hotel Estheréa gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4f4wXONrad-DZP3SA-Y8X7ekMsGAsJFYZz6QpChkfl4=.webp",
        "alt": "Hotel Estheréa gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9IPw7I49wPNQ-Wwmy9DQ6j8ky1ewVT_7EBGLFGnCa64=.webp",
        "alt": "Hotel Estheréa gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CJFGS2b9VrKoYKr258B1DiyvH_CgzuEBHx8W9lGbbSk=.webp",
        "alt": "Hotel Estheréa gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5e352fb3",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.33,
        "scale": 10,
        "reviewCount": 3626,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/5e352fb3"
      }
    ]
  },
  "Andaz Amsterdam Prinsengracht": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/5d8f95e8",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36786,
    "lng": 4.88283,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JVbD5BsL3fwBNrkJqWMXLMQF-IMd33sDsIKWhhy-zrw=.webp",
        "alt": "Andaz Amsterdam Prinsengracht property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ow2VBHzqQcyDvN8gjkCjTi2EseNy9cx25v1SKhL_oy4=.webp",
        "alt": "Andaz Amsterdam Prinsengracht gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/m6xGBq-MvxNVZBzTijZ_3jv6vVk_46c9VtAzoK0ZcDU=.webp",
        "alt": "Andaz Amsterdam Prinsengracht gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fC37alHR6LxVGdXL5-1EY8zBRoxRiLyM4KDlSTkGB1Q=.webp",
        "alt": "Andaz Amsterdam Prinsengracht gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9vxnWHtt6BDKz1cdp_akF7n7A44YijEsfwZvoTjmJ-U=.webp",
        "alt": "Andaz Amsterdam Prinsengracht gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vTnPvwgP33XqpY3lXk5QcdnPOgkpqO12b5sYMfV0Exw=.webp",
        "alt": "Andaz Amsterdam Prinsengracht gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.05,
        "scale": 10,
        "reviewCount": 1005,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/5d8f95e8"
      }
    ]
  },
  "Sir Adam Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/1c6e4943",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.38378,
    "lng": 4.90241,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VrRDTabZDha6n6N7UhpIO-MfPTFZTSAlFD7VADCvq28=.webp",
        "alt": "Sir Adam Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KkmQ2OQ4Hbc1Y5MKV6kb_vBivqy2K9azS7vOuLiQWgQ=.webp",
        "alt": "Sir Adam Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qFKmR9BVLCuicskJl2ATGMtTvwH2LejUy-u7SVr43-o=.webp",
        "alt": "Sir Adam Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/g0-Uo905bKgCQPAjx4YyVXjnEjoYvjR6UM58B20p4qA=.webp",
        "alt": "Sir Adam Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bMaPuM7WfDbHLcc108eOum8pUnmuapXGLudMPzNHyiU=.jpeg",
        "alt": "Sir Adam Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UGTSCzRl30HOD5BtwxBeH0rfGaPPDFbFkBdwfd8dDK4=.jpeg",
        "alt": "Sir Adam Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1c6e4943",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.98,
        "scale": 10,
        "reviewCount": 1264,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/1c6e4943"
      }
    ]
  },
  "Motel One Amsterdam-Waterlooplein": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c9723b58",
    "checkedAt": "2026-09-15",
    "description": "Modern hotel in Amsterdam city centre with non-smoking rooms and a 24-hour front desk, close to major attractions.",
    "lat": 52.36998,
    "lng": 4.90738,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ZuBw88BP2Z_Ug2i6T6eVMHGhKHXMq0fgHf1ePZ0S9Nc=.jpeg",
        "alt": "Motel One Amsterdam-Waterlooplein property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ULDxcM94XrZxoq2pw4ld0VwXlpv7jr2nk560hifWAZU=.webp",
        "alt": "Motel One Amsterdam-Waterlooplein gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FYXll20-eMrcTUJYjou7y59O8XZ3734AUe1LvLvnByY=.webp",
        "alt": "Motel One Amsterdam-Waterlooplein gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/g31YLEaHbLQuW8idbY0LahqUAXm-FvBQX-4nHWq23kk=.webp",
        "alt": "Motel One Amsterdam-Waterlooplein gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xufC9zjITh2ol7WaoL29YaxKV_iiOZSctx457CXG-jk=.webp",
        "alt": "Motel One Amsterdam-Waterlooplein gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7ySSp5nGq5a4MB1DHGRH0M5sJmJkkeho4LoaTngTNb8=.webp",
        "alt": "Motel One Amsterdam-Waterlooplein gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c9723b58",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.83,
        "scale": 10,
        "reviewCount": 3004,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c9723b58"
      }
    ]
  },
  "XO Hotels Couture": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/52716e10",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.3511,
    "lng": 4.84125,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/XCHga98dk0ITAgD3Yk6q1LkhxTeSVBQRoJ14J-lhG38=.jpeg",
        "alt": "XO Hotels Couture property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/6P-XDRz1cSywkVZDdgUeF9RuA1BLktUO5uBzIWhXiU4=.jpeg",
        "alt": "XO Hotels Couture gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/2vdcEhac7DtTiWMERkCJFsv9VERARWQzztjCm62aPrg=.jpeg",
        "alt": "XO Hotels Couture gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/mdYbXKRSb1nH3pwBvwE0I2tV22tMZHgxWo5SQ99DlkQ=.jpeg",
        "alt": "XO Hotels Couture gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/9CO6tYzh5xfxinmXxMgdvofbAKHh3bZ635NVdrV71DM=.jpeg",
        "alt": "XO Hotels Couture gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/vIcBv_kzcG14s3OL6sixSQlwlz4WgSz8U2rS8uDa8AU=.jpeg",
        "alt": "XO Hotels Couture gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/52716e10",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.6,
        "scale": 10,
        "reviewCount": 5502,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/52716e10"
      }
    ]
  },
  "WestCord Art Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c908080f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.39281,
    "lng": 4.86878,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DpHxSGsX9b30LR0q_BBzCJPOThu1VmXaBbvRNNL_N20=.webp",
        "alt": "WestCord Art Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fNj16J3kX-0m2sXXJwxlYXj7EiFaK3fnYENP8KZv4hQ=.webp",
        "alt": "WestCord Art Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HWC8gaAMQp-y9vVOIVXtJNzUAnkL2TgGyBSrzu_815c=.webp",
        "alt": "WestCord Art Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eWyyE8iH7GeGK6OCpePkzjMqPS4WcrrMggRhwY8A0aA=.webp",
        "alt": "WestCord Art Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tbLuZCJMMKv76lB50DJxon-f4Oc--FvE4OoMbgQPDfI=.jpeg",
        "alt": "WestCord Art Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Lg5uw-QpZ8xxe_mBgt6khVzvutrPFdW4zo6-cwdEk5c=.webp",
        "alt": "WestCord Art Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c908080f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.68,
        "scale": 10,
        "reviewCount": 1040,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c908080f"
      }
    ]
  },
  "Hotel2Stay": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f1e25266",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.38705,
    "lng": 4.83941,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/7kL2a3hpCe2yfa1Dd2svut2VpJZ3Md9aQ98ppdBTLyc=.jpeg",
        "alt": "Hotel2Stay property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/5VU9pIa0tQk0WV9u5OmLsAD1oPLKbbzhAoxobSOpwuo=.jpeg",
        "alt": "Hotel2Stay gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/DLEnXEZe-TTJcyWGkcxvIVq3hYzdfZPhhb-77M_MtKo=.jpeg",
        "alt": "Hotel2Stay gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/7BdQhOK_JgDBufczzjizpzuC7Eu8IABoAo43f3hwMT4=.jpeg",
        "alt": "Hotel2Stay gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/aBKhvY7wrEw6lcATFEKC4TjTUsYK19t2ZMZvFv5eQVQ=.jpeg",
        "alt": "Hotel2Stay gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/lmq01Y5GWBVv0RjNV8hukL08V-y2SdToBKLWS7L59eQ=.jpeg",
        "alt": "Hotel2Stay gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1e25266",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.7,
        "scale": 10,
        "reviewCount": 4384,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f1e25266"
      }
    ]
  },
  "Met Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b34df542",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36265,
    "lng": 4.83532,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LLziCkqyOWeF4G23Cw7Kl24X07xbACNymdpWxI_8FYE=.jpeg",
        "alt": "Met Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/pNVJeCH5QLn7YKAF9elxPXOsODiLpn1hQav3tQUD63k=.jpeg",
        "alt": "Met Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IIxuQjNb5XRYKTvqPUnkkP3n_o-sv7kHP8CGYD3j1wI=.jpeg",
        "alt": "Met Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FsBZJ5sor2LnOkVRdpU1Cjl10LMigZ4Ak9ZDn0O3btI=.webp",
        "alt": "Met Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IoE79_ucigBS-RQ2mLXwXr3rs5a04j2trhRu0rBtWzE=.webp",
        "alt": "Met Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tlSo16HUND75LPbVlUEnHt4zXUy3kl70scII6j2fjs8=.jpeg",
        "alt": "Met Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b34df542",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 992,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b34df542"
      }
    ]
  },
  "Postillion Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b7d4d899",
    "checkedAt": "2026-09-15",
    "description": "Modern hotel in Amsterdam with fitness center, restaurant, and 24-hour room service. Ideal for business and leisure travelers.",
    "lat": 52.33361,
    "lng": 4.92219,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YS9QoNyHN-NjFcdhz0njuzUUILB_N8XUGzFzBaDA-I8=.jpeg",
        "alt": "Postillion Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TT9kRiYM32iR25u_fp6pejB-nsMYULsEOsxi-FjfipY=.webp",
        "alt": "Postillion Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CBUf3ufMjy4ej8b12kY8-fE3L9xA6hdlg7HKLfi7AgM=.webp",
        "alt": "Postillion Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8VIkYO8KvJVQFydqkDEj1-PTnLBmE4vgjHzr8lQt9GY=.jpeg",
        "alt": "Postillion Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Hig09ISkK2Cl9KaGCIaz0NcLYdYX-2LO89w0gzNu3yY=.jpeg",
        "alt": "Postillion Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/EHmvqBqALJK8MPTvd5lwl0YpLNwu2PDIRY19UZVwT3A=.webp",
        "alt": "Postillion Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b7d4d899",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.52,
        "scale": 10,
        "reviewCount": 7187,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b7d4d899"
      }
    ]
  },
  "XO Hotels Park West": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8252d7fa",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.38562,
    "lng": 4.84717,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/SsI4oyvMiqXBW6jZZIGLyd3pDR6NeFRdb2MteumhorE=.jpeg",
        "alt": "XO Hotels Park West property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Xwqf80BAzJ_NVzrHK0xUtQD1m2B6soyvpWG9zsL1UEI=.jpeg",
        "alt": "XO Hotels Park West gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/XoV1L4X68LmEn3fCiPMCX7U0w8AoULJ3jK2jLKvtreU=.jpeg",
        "alt": "XO Hotels Park West gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/bnw9fT9VY12xBnU2JlUcSUDvH7AWlXPUQ62h2LeP-iQ=.jpeg",
        "alt": "XO Hotels Park West gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/boSjiry9fkzPCdrePoOTZsARn_dppdrb-uFVu0nQoU8=.jpeg",
        "alt": "XO Hotels Park West gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/CkL7n7z_8Ztl8dZNzhobsFck-1nZCq4kd7AoVd5Y_NE=.jpeg",
        "alt": "XO Hotels Park West gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8252d7fa",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 6946,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8252d7fa"
      }
    ]
  },
  "Mercure Amsterdam City Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6b863090",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Amsterdam with a sauna, fitness center, and bicycle rental options. Enjoy international cuisine at the on-site restaurant.",
    "lat": 52.33524,
    "lng": 4.91351,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/A9ol_B75w5wQanS1rx21iZDzmVx3qck4vz-ZV0q30BM=.webp",
        "alt": "Mercure Amsterdam City Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yY5LiFdaqu4jQif6o7OuMMekrZnGNApB35mWiXvr89E=.webp",
        "alt": "Mercure Amsterdam City Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1ZSF7qKXSEYOHLEz8AN5yzLYJdnxy9FcJOZijgAhR9k=.webp",
        "alt": "Mercure Amsterdam City Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aBfnurD8Rlbzgr2zsyDV5s_JA-DwumWt_4_j7Lc-4zE=.webp",
        "alt": "Mercure Amsterdam City Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jYzh5dOHrUIvedjzmipYxBnQ9BIDbMKbWDT-RZwsa1k=.webp",
        "alt": "Mercure Amsterdam City Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/f4GDapCb4vVeyjo2o-jCnyuEjoYuUxZPXUnnsGUuv7o=.webp",
        "alt": "Mercure Amsterdam City Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6b863090",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.33,
        "scale": 10,
        "reviewCount": 2341,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6b863090"
      }
    ]
  },
  "Van der Valk Hotel Amsterdam-Amstel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f8d9b9db",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.33331,
    "lng": 4.91447,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/n_-fDlHTAZpiHjejU-6Ai8EOv4sdNFzHtjvQj4-5Sd4=.jpeg",
        "alt": "Van der Valk Hotel Amsterdam-Amstel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/J088Pa6uE7-LP2qjumx6aFTo94zoHS4fW7fUxqzCXWA=.jpeg",
        "alt": "Van der Valk Hotel Amsterdam-Amstel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Y90zLKJScCW65m7TpUzrCJgfLIaUO4S_UtIvQp0qwIM=.webp",
        "alt": "Van der Valk Hotel Amsterdam-Amstel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/n0lSKA4NB_EAw06BXOV45QG4FIEh1A9UrPIkzQtpu4w=.webp",
        "alt": "Van der Valk Hotel Amsterdam-Amstel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/grfLoInX6StOd2-RQ3V2Ae2c_5V0TY6wMJPJMrVuSPk=.jpeg",
        "alt": "Van der Valk Hotel Amsterdam-Amstel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/PCs-tamNG2Nyn-MEHaZy7YXwO53PguFpY_ku_I3bbL0=.webp",
        "alt": "Van der Valk Hotel Amsterdam-Amstel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.78,
        "scale": 10,
        "reviewCount": 4891,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f8d9b9db"
      }
    ]
  },
  "Jaz in the City Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ea2d22f4",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.31421,
    "lng": 4.93932,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Bsny33Rra9xX3RaKqT-ak2_TvzdMjPZT1tB6Dt208QE=.webp",
        "alt": "Jaz in the City Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8fY8-KVTuTyfcE8QnP3V7-kD3FSgQslY20oHgyGWDE8=.webp",
        "alt": "Jaz in the City Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1x4cXziBE8bBj58U-Ss0UqTyV59w9xza_PxlVI4Xc9k=.webp",
        "alt": "Jaz in the City Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Y8TpjvdrYQfenf391zRSI-Z1B7yCfoIff4lJHC1yK_Y=.webp",
        "alt": "Jaz in the City Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tb2y4CHYbAvkefvtMCWdkzfgHoKppVeL09l2M7LCz00=.jpeg",
        "alt": "Jaz in the City Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Zrpm_IXcSTMJcZj7TM8geocD6D8mDLXuMmMGlNEDeEA=.webp",
        "alt": "Jaz in the City Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.8,
        "scale": 10,
        "reviewCount": 6653,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ea2d22f4"
      }
    ]
  },
  "Novotel Amsterdam City": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4ec6ccd3",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.3338,
    "lng": 4.88854,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/o1nixED7gBnihfbPrAx06hJvhhd7nGnrxRlrmk0M61g=.webp",
        "alt": "Novotel Amsterdam City property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7yemRwgAVl77Km3FyeuqD7EkpdKTUkVQflt_r3BjCsQ=.webp",
        "alt": "Novotel Amsterdam City gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1NqkwGGKaMPOa-3r19WwkehIf5878pPkITfK0cms7QU=.jpeg",
        "alt": "Novotel Amsterdam City gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9QHxwIl59HCGR3KhhquJGHasvlIKQnxDcFAKM0NSYCE=.webp",
        "alt": "Novotel Amsterdam City gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hNKBa4IN_at-uh4zlNEyjIVPxveKqbBUqxoDupaEuCg=.webp",
        "alt": "Novotel Amsterdam City gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F28lWuwFD47sw7wXQwjlznk4ek-2iCZ72ppdcjggkGk=.webp",
        "alt": "Novotel Amsterdam City gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.43,
        "scale": 10,
        "reviewCount": 3926,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4ec6ccd3"
      }
    ]
  },
  "TRIBE Amsterdam City": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8e9c1ff6",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.40249,
    "lng": 4.93105,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ETR8VGu1Z2fC5Y1pvi5A0mVOArEeH3EH0LN09HfUd5A=.webp",
        "alt": "TRIBE Amsterdam City property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gcpn-q6tzDYW8LFKjjUXz_KF18JPq-cxGdPrJo4H92Y=.webp",
        "alt": "TRIBE Amsterdam City gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/734M0iF65cOrXYCEd4qPG3Xl9Cz8PNZH1zUcy93NVIs=.webp",
        "alt": "TRIBE Amsterdam City gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NhhiNpQuMHlTkoCsVkSxG2OOF6BTg-9jAyB9tVw00No=.webp",
        "alt": "TRIBE Amsterdam City gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6SN97NK5Qe1Htdkpt-5qFRr0GamAbi_0bXeZmYwQKHA=.webp",
        "alt": "TRIBE Amsterdam City gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6g3cCtpnGKs2VavYr0VF1eFBkdv0G7fhfDeTrlherG0=.webp",
        "alt": "TRIBE Amsterdam City gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.08,
        "scale": 10,
        "reviewCount": 2723,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8e9c1ff6"
      }
    ]
  },
  "Hotel De Hallen": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c69a72d2",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36793,
    "lng": 4.86726,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1GJ8OLg1GUP78bc2kUtYGiu07LlKSotpgEVTMFiBazw=.webp",
        "alt": "Hotel De Hallen property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Yvvo2-y2PRAXfju5AYguWNjT1zDF07cCsNbNqsrKh5E=.webp",
        "alt": "Hotel De Hallen gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oCUGxiRzRyP8c-2eqfTJmchdJfaP0bPQQBytdpgAPC4=.webp",
        "alt": "Hotel De Hallen gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gmbg5FvQuHh5Wg3Z50ijXmAicSZmKN_6J3vV5Qd9cl8=.jpeg",
        "alt": "Hotel De Hallen gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/n5jH_9svQeUeHTp6dW2MyHWdsf0kavvYDBiDUT8ilh0=.webp",
        "alt": "Hotel De Hallen gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/u4ASRPP8Uj4atfIEhOUrHF6LxFzDL5KgprRUZSvfvYI=.webp",
        "alt": "Hotel De Hallen gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c69a72d2",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.68,
        "scale": 10,
        "reviewCount": 2778,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c69a72d2"
      }
    ]
  },
  "The Hoxton, Lloyd Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/05dd3b92",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37424,
    "lng": 4.93466,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CaidE1XSIPvNskHVqVeGRVNt9TsM0dPwoNHNTyqx4RU=.webp",
        "alt": "The Hoxton, Lloyd Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/luCRL2f-I6B1_nMjhW1vI-SRgRVffrwKjzBEAn4R2vY=.jpeg",
        "alt": "The Hoxton, Lloyd Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nB7B0i8j7Na8FQS3n0-ELE8-DY6C-uy73_XZdUlcAkM=.jpeg",
        "alt": "The Hoxton, Lloyd Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eSf4ClazOWfgr4AiYvh6gezmefY0wdMuiAh_A6f4_ew=.webp",
        "alt": "The Hoxton, Lloyd Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0UN_Tv4hj7qCxCc1l6PBMCZxHp784bVT8YqAa2x4ZOY=.webp",
        "alt": "The Hoxton, Lloyd Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/B3NpnimfNwsRRzeh2KfshD6LGAIBxJ257TyyPf_bT9g=.jpeg",
        "alt": "The Hoxton, Lloyd Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/05dd3b92",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.7,
        "scale": 10,
        "reviewCount": 833,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/05dd3b92"
      }
    ]
  },
  "Hotel Jakarta Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/7ac21af8",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel with a full-service spa, indoor pool, and eco-friendly amenities in central Amsterdam.",
    "lat": 52.37911,
    "lng": 4.9223,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vp5jFACZF5tA8VZH-wEjLGf05mmHbBL3u9wWqaL-8vc=.webp",
        "alt": "Hotel Jakarta Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xV5v03RKOsKituqH2rNw2j3gK9N8bjztNj1yGjA-4r0=.webp",
        "alt": "Hotel Jakarta Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jm1cR5MbZJSNIX8xMv5lsDZ0x7_JtkmYs4hAl0bvV4k=.webp",
        "alt": "Hotel Jakarta Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/X5i4PldhR7pGHCJ8YvKt9iaHaia7-BC-rYEjaOd2il4=.jpeg",
        "alt": "Hotel Jakarta Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ec332xdQZG4zkCGPkKamgc-_WtnCEUjhMgFQ5CeR4RM=.webp",
        "alt": "Hotel Jakarta Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sBWGum_Ew2nKgrnjNMdXxBi-Teeh429Mfme1TMZ4ivo=.webp",
        "alt": "Hotel Jakarta Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/7ac21af8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.05,
        "scale": 10,
        "reviewCount": 5783,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/7ac21af8"
      }
    ]
  },
  "Monet Garden Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/368a3519",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36979,
    "lng": 4.90726,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Zzf3WEH1MNaIRgLEC28ES2UNevIdaT_1bVPmrmPEeRk=.webp",
        "alt": "Monet Garden Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JeNUJG45BUkZeIXgUIkKSMgnPuLKwGcjRE46X4rEalE=.webp",
        "alt": "Monet Garden Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kjYTW2ubow9ZbU4doMS3-5IiV9ZNYEhsu6oGO0kq6k0=.webp",
        "alt": "Monet Garden Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fC7Y_RqI3_2CVe-xnjOJG8V_CqSaWZ65BtSwW2Iqwk0=.jpeg",
        "alt": "Monet Garden Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Jnzm9dZjijr36Fl4OuTI5bYG9TLoxAupvkXlejKF2Ac=.webp",
        "alt": "Monet Garden Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/wG45WgGDScKYR43jhz8O7aiNXZfpGORn72oVMdQb4nI=.webp",
        "alt": "Monet Garden Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/368a3519",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 5226,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/368a3519"
      }
    ]
  },
  "Hotel Aalders": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8665b11f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.35958,
    "lng": 4.88094,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/x_goobGJArfkymyHil6tCJA9ixkdxjKybJ6edmQCIXU=.jpeg",
        "alt": "Hotel Aalders property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/66x2rnd0yetzVS-5ilE3HM0K-NdpAXOKYkqJAGmTgJ0=.jpeg",
        "alt": "Hotel Aalders gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RDo5b8p28vsmcuYWz1tmszvkMbztoR7k3csUFHbqfy0=.jpeg",
        "alt": "Hotel Aalders gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7Gf4xrNUw3GtC5cHye7g0JHB6HSJADZzJR9xF6xPhd4=.jpeg",
        "alt": "Hotel Aalders gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5J_nZ6mYOZjLo2GeKE5MdlOAT2GEuosssO60cUs6Uao=.webp",
        "alt": "Hotel Aalders gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MQAFXa-hOZW-7bGqhVb6vAPTSY4nt96i1JcAXkkbpbI=.webp",
        "alt": "Hotel Aalders gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8665b11f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.08,
        "scale": 10,
        "reviewCount": 1408,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8665b11f"
      }
    ]
  },
  "Mr. Jordaan": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/90bab339",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37467,
    "lng": 4.88009,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YOTtg5uNze9uTXnV0zevBqSUBq4iqhfEiXR9J2l1KdY=.jpeg",
        "alt": "Mr. Jordaan property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Kv3xrQLndnjygINP7RMQDNe27UhOtorjp9AP2HQjjQ0=.jpeg",
        "alt": "Mr. Jordaan gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/00A4lxDtKOiagIc1Ve1KCHW3ocZPjGBwcRgjrYVL8_0=.jpeg",
        "alt": "Mr. Jordaan gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/esDtjHRuUml_oyYUxP1TLSFB0a78SqcXm8Zw-Srd8M0=.jpeg",
        "alt": "Mr. Jordaan gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_qUQRa7n2Q2oujuAk3e-wAzHfnDxI2bmX32gn_Up5yk=.webp",
        "alt": "Mr. Jordaan gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/utipdv6evoMqRNJFTwKUEyEBONv1aTDgtrHVfe45IUc=.webp",
        "alt": "Mr. Jordaan gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/90bab339",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 1808,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/90bab339"
      }
    ]
  },
  "The Hendrick's Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/e7403045",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37351,
    "lng": 4.90604,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/I9q8G7GM35rzg-rkfA7nMsY2iNCE6MxbI3hG1EcCghw=.webp",
        "alt": "The Hendrick's Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vmeD7JgaUR2GoCIO2bgSMp8jrDjcN8kJhUsqVp_9scc=.webp",
        "alt": "The Hendrick's Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9Bqrezked0VYodinQyyvqtnphq87HwlKBVxfPmbJchA=.webp",
        "alt": "The Hendrick's Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DS4S47o2eX67DbSd147XxkrkEyz1yE6HULTCzP0hO6Q=.webp",
        "alt": "The Hendrick's Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ftF35kZZchqy7TBjStPLopYvvc4YVGGpVCNBTVh5Iq8=.webp",
        "alt": "The Hendrick's Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/d9i2p39DPgCTHmDuONfcLJN_CqTse_icyCcZCRIWmDk=.webp",
        "alt": "The Hendrick's Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7403045",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.38,
        "scale": 10,
        "reviewCount": 1277,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/e7403045"
      }
    ]
  },
  "Leonardo Royal Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8db8cd7c",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Amsterdam with a full-service spa, 24-hour fitness center, and on-site dining options.",
    "lat": 52.33243,
    "lng": 4.91785,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/t9UgvBlspe1DVKeerOhT7ZvIUJQ9fyY5kxZeJChItig=.webp",
        "alt": "Leonardo Royal Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IeDwomVbFYWXX-5FbgYbNTq2ACqiLLRpqiAjBYhEvQA=.webp",
        "alt": "Leonardo Royal Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OzsuOsKx2ygXOmnZ4m3UZVWb92Ae0BoNE71TRTTv0c8=.jpeg",
        "alt": "Leonardo Royal Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cBVc5h-gvzdewxoyWNaxW8g86s1btqONx8CzIRvQtek=.webp",
        "alt": "Leonardo Royal Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HgCCnLUjXCka6AzJkKZVqsXkoPopIkyn7anPHD-JJHc=.webp",
        "alt": "Leonardo Royal Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/mZUoorDQ5I7NZoc8MwZmHKkdSi2GlQ6N3GA03jfChG8=.jpeg",
        "alt": "Leonardo Royal Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 4860,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8db8cd7c"
      }
    ]
  },
  "YOTEL Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c0e2098e",
    "checkedAt": "2026-09-15",
    "description": "Modern hotel in Amsterdam with a 24-hour health club and on-site restaurant, perfect for a comfortable stay.",
    "lat": 52.39149,
    "lng": 4.90355,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tbqxJNYpzyVpwZCXFqglKitm5m30tim45nUL3hD_8Zw=.webp",
        "alt": "YOTEL Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/z68DwW6XvF8f0NVmYSNiLaZCDBvSA9hMZvH2NbgjiKE=.webp",
        "alt": "YOTEL Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GZ_wo3L6mV6ZJKp8ABp9aRuLCv7WOJAPY858iS9msMw=.webp",
        "alt": "YOTEL Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0erx00b-NRCXhExW7J0rn7MjUD5aqzkX2xWTjGBKMCY=.webp",
        "alt": "YOTEL Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5MJRSXQwCvGlHeIdhlZQ7KBGYblwF9eUEmLJKGw4drQ=.webp",
        "alt": "YOTEL Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tzMJQ6DsVEP_-JTyGa22jkY2BCGC0knA1MkQcLY57Fs=.webp",
        "alt": "YOTEL Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c0e2098e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.28,
        "scale": 10,
        "reviewCount": 6078,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c0e2098e"
      }
    ]
  },
  "WestCord Fashion Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6c85d9a8",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.35755,
    "lng": 4.84417,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NDS8oF_7L89WVws1bC7y3RxoWD3XX5KvZ2GSoig4-fU=.webp",
        "alt": "WestCord Fashion Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/W-8y4MHvctebc83P3Klu06TNLBV5nl-KD0IdBaMv9KM=.webp",
        "alt": "WestCord Fashion Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VwLcwOe4cuM26awGieT2GPKH4lQZ18kxAF6JNuKT2fk=.webp",
        "alt": "WestCord Fashion Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7M4X0qxrFWMUUFBYkmdnhHabKz5fngoY7aBQTW1fk00=.jpeg",
        "alt": "WestCord Fashion Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nDK_tSQbg-Ni75c-d6OAmW-7plWF-VF6l3lsS54PKA0=.webp",
        "alt": "WestCord Fashion Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dbP4lJTcVSfH9-DBZpeZ-lseJR-fYewdwDZYifJDcx4=.webp",
        "alt": "WestCord Fashion Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.58,
        "scale": 10,
        "reviewCount": 2581,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6c85d9a8"
      }
    ]
  },
  "DoubleTree by Hilton Amsterdam Centraal Station": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a0c1ebaf",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37683,
    "lng": 4.9057,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bK8oJx66bA29JnP8zdXudDDTHw8of2SKuvb12d4Tk5w=.webp",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NfhHxmWRd4Sm1fYkoSafUvkmDhqRUrFKmeWGDLgQ5gg=.webp",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/92x7BO71G3wpdD86k_VRrOY5KOc_M5ZsEaMZqkzbxJo=.webp",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xamxLY3O_C7ZSm12ZP-lPscOuv-qJy7sykP8e8UBcWU=.webp",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IRGS8UJF_NoQJrqV0bYgtHnyizEMrcck1ip4CnaFJr8=.jpeg",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VPAO_bTLczp8f_W1zOFgxeuuiESpv53n3uH9zngZa5I=.webp",
        "alt": "DoubleTree by Hilton Amsterdam Centraal Station gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.3,
        "scale": 10,
        "reviewCount": 2811,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a0c1ebaf"
      }
    ]
  },
  "Eden Hotel Amsterdam": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a4d3d0d7",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Amsterdam with bicycle rental, ballroom, and concierge services, just a short walk from Rembrandt Square.",
    "lat": 52.36687851,
    "lng": 4.898722172,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/HOH_ppnnGSxHQoz6qr1e4yMykIv8YHgImdbjBX_JdSU=.jpeg",
        "alt": "Eden Hotel Amsterdam property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/l1rwk7MbHBnPSSI8nO-QxhmB392bKfEqmlBJZ-ZsBrw=.jpeg",
        "alt": "Eden Hotel Amsterdam gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/1SMKwzw6Rph7WXmuTHk5jYvBxdciqrY48DX3PX6avQU=.jpeg",
        "alt": "Eden Hotel Amsterdam gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/KJAGfGWOgIwgKvMAHHdXkN6CZ5uTXMohi-07QuDs4Ko=.jpeg",
        "alt": "Eden Hotel Amsterdam gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/PbiIK8rO9MhR3qHEGYYwCzdphpm5j-vLNMWj8vw71z4=.jpeg",
        "alt": "Eden Hotel Amsterdam gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/XPiK2-bcSqM2Fc3KDqVoQQlZky2tMzS8A9_ziMeSND4=.jpeg",
        "alt": "Eden Hotel Amsterdam gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.2,
        "scale": 10,
        "reviewCount": 4694,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a4d3d0d7"
      }
    ]
  },
  "Quentin Zoo Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/cfd3343c",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.36676,
    "lng": 4.91142,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1qvQJWhAaaEZRC5SXFP-bawN71H2tCv4ZM7KzjXiXG4=.webp",
        "alt": "Quentin Zoo Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F6tSDOvSo6mnMo8DhcfjmQqa4eTI2RcMheMjg52AJJg=.webp",
        "alt": "Quentin Zoo Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yt6hg1AurQ-0gDT-VvKyW4NzoYGnaLjh-mFwTMi1PF4=.webp",
        "alt": "Quentin Zoo Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/d7NYW6KfLpgKTJmnKw8krqd2X-EgWo6z5-vLxJbx06w=.webp",
        "alt": "Quentin Zoo Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qOllFvV4N1-6EJND0uV9L5tM89ojVQD_MK6QsAQD1LY=.webp",
        "alt": "Quentin Zoo Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1L1BVUdowWkT9A-CUoYo4QoJQppmDgZUhpnFYQCn24Y=.webp",
        "alt": "Quentin Zoo Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cfd3343c",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.1,
        "scale": 10,
        "reviewCount": 1180,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/cfd3343c"
      }
    ]
  },
  "Hotel Amigo": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/9ec7c128",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Brussels with onsite massages, a superb restaurant, and a prime location near La Grand Place.",
    "lat": 50.8461,
    "lng": 4.35139,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WFaCrqArCMNSYPtPTebksHBBR85P87JLoZnZ9sRLh9Q=.webp",
        "alt": "Hotel Amigo property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fR7ZnhbmBKX_OZ12IruNk4aecdh-1492A8Ds9iWXzbk=.webp",
        "alt": "Hotel Amigo gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/smhS1JUpIjNItXTPadoH7i8Nja2EIH--2Sy4SKo7w-A=.webp",
        "alt": "Hotel Amigo gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/61rhI3AwJkYfGtz8CPRSzhwUx6-si7IKvqlYuDBx09Y=.jpeg",
        "alt": "Hotel Amigo gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KKTk0QJdhXIClCqte-DXghQ7O-omAHsuKQuQNsO-QCo=.jpeg",
        "alt": "Hotel Amigo gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4dkOdJ-nX0Q9WYbneZi7iBxunozuMvWuOqKkmB25JSw=.webp",
        "alt": "Hotel Amigo gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/9ec7c128",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.23,
        "scale": 10,
        "reviewCount": 1162,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/9ec7c128"
      }
    ]
  },
  "Hotel des Galeries": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/561a6e06",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.8478,
    "lng": 4.35489,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UvtZeBtxYT07AGN4tFS0veaFkCGu8HpljtwaCLKoIhk=.webp",
        "alt": "Hotel des Galeries property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fzveYJizomFCaym3_Nt5hxomGDWpTRYXv-gPfG7XeXQ=.webp",
        "alt": "Hotel des Galeries gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WT3tjefq0IKpBsMoSoBR-GXaI5vg5kPvmjPKe6mON_4=.webp",
        "alt": "Hotel des Galeries gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hxvEIzie74iwxJJUzVVlGq7Tu5w4VEvWbSWuLzrYP9E=.webp",
        "alt": "Hotel des Galeries gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HI-OzxtAFyO6swcCG3UrH2-glwfJHNpnvXGP2f_4Xzo=.webp",
        "alt": "Hotel des Galeries gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6F-E7_A03dQDz30bYt-0YV5RLRfwHJYO8z2Rg6e5miQ=.webp",
        "alt": "Hotel des Galeries gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/561a6e06",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.85,
        "scale": 10,
        "reviewCount": 1002,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/561a6e06"
      }
    ]
  },
  "Pillows City Hotel Brussels Centre": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/145f6d24",
    "checkedAt": "2026-09-15",
    "description": "Boutique hotel in the heart of Brussels with a 24-hour fitness center and terrace views.",
    "lat": 50.8471,
    "lng": 4.35947,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/A26BwMV7Be1H33f3I4nIe1f4IuIyU5UOELOxhFSkJeY=.webp",
        "alt": "Pillows City Hotel Brussels Centre property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F3AlbzdN8aAa7JlGOYjXD2mvyuipGIMW833HQK04fzI=.webp",
        "alt": "Pillows City Hotel Brussels Centre gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DrPX3TA6ce9VA-7QaiDFj_krVx5FeoB-NVeb4cfUsq8=.webp",
        "alt": "Pillows City Hotel Brussels Centre gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VSkCTq3ilmFjf8b2yXdZGa6hr3vJ6ADbfn2O_NFRFBg=.webp",
        "alt": "Pillows City Hotel Brussels Centre gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jFCayn8Z9AW83NRRjaNHmwRCyc-pSN69MHU_ZNEgjMU=.webp",
        "alt": "Pillows City Hotel Brussels Centre gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GU7pnsPFaUisyZq4b382P3GoYLM8_kEScWq_PGHp2sA=.webp",
        "alt": "Pillows City Hotel Brussels Centre gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/145f6d24",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.35,
        "scale": 10,
        "reviewCount": 1016,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/145f6d24"
      }
    ]
  },
  "The Hoxton, Brussels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/17d92bde",
    "checkedAt": "2026-09-15",
    "description": "Stylish hotel in Brussels with 24-hour fitness center, two restaurants, and eco-friendly amenities.",
    "lat": 50.85572,
    "lng": 4.36327,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GLZyP7UkCc7NvPyrq_WQCvCUvfXaDzlgrTpJgqBgBnc=.webp",
        "alt": "The Hoxton, Brussels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Rf9NfWg217UmLKJXmjF_AyVZWqsoiJgi_Uwx_wn1fww=.webp",
        "alt": "The Hoxton, Brussels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AP7J3V8NyocaSc3KcDGLgYl2urL6hKVZ08W1zq0QvNg=.webp",
        "alt": "The Hoxton, Brussels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-fJSqYQ1P0EHgq0hnfX5mSGtAEY6kTfjVDrf4dVXlkg=.webp",
        "alt": "The Hoxton, Brussels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FFAzlKUQaoeCqnF46c-zAA8P-jYz4TfgIw3Nc5txd20=.webp",
        "alt": "The Hoxton, Brussels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MNVG7ADu3d8-wWjvjrD109EEw6TUi91N59WRdpCj1R0=.webp",
        "alt": "The Hoxton, Brussels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/17d92bde",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 1655,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/17d92bde"
      }
    ]
  },
  "NH Collection Brussels Grand Sablon": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3522ed16",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury in the heart of Brussels with a fitness center, on-site dining, and spacious air-conditioned rooms.",
    "lat": 50.84085,
    "lng": 4.3558,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3afRHDhubsVqCMNuFAFaBzWSZicnrCEArXESADymHCs=.webp",
        "alt": "NH Collection Brussels Grand Sablon property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YTcODSBKnij3fNWdmZzAmZpA1XQ2Jp7p5EpxhbBNImU=.jpeg",
        "alt": "NH Collection Brussels Grand Sablon gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xyFmZ_zyY4Fk8t1vOH8vcxreXLOH33c-vexGOtAmyds=.webp",
        "alt": "NH Collection Brussels Grand Sablon gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ZUVKThmArn80SZSnVPLOyMin1LEJ6Z6LtZz_hXV-PY8=.webp",
        "alt": "NH Collection Brussels Grand Sablon gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QK40G9FINPhS0McVRIsvWT1TqhWXpPGh3Nmg6W49L-k=.webp",
        "alt": "NH Collection Brussels Grand Sablon gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1Az6HYbMhFuP5zgzgdVVUgiR96dRfR11nshXDrjbnaA=.webp",
        "alt": "NH Collection Brussels Grand Sablon gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3522ed16",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9,
        "scale": 10,
        "reviewCount": 3834,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3522ed16"
      }
    ]
  },
  "Warwick Brussels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/80842e11",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel with sauna, fitness center, and 24-hour room service, just a short walk from La Grand Place.",
    "lat": 50.84514,
    "lng": 4.35441,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/iyEbO2K5_EvlZ24Wf0p0Rc07h9_VzseiqnRSMX_z07Y=.webp",
        "alt": "Warwick Brussels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VRDW9dMZ4Va7QZqNiEi6YyVsXkz_uqvEvOKRXcC3v6U=.webp",
        "alt": "Warwick Brussels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WGT-dbwtvmrZPPz20TL_Z7lx5HmWq2G3TbVAVDDM5us=.webp",
        "alt": "Warwick Brussels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vm8FTYkbmwqtr11KzQtd7pEojE7hUWCwtPyaLuLlxLA=.webp",
        "alt": "Warwick Brussels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1rFxPpqngXIBZsj5J2kHV_DgvwRsST1w8ztxUoXDtAI=.webp",
        "alt": "Warwick Brussels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Z_GFihVXO3awpwVlWnZCYxR1UvutGsWVRGJFhJFMLrQ=.webp",
        "alt": "Warwick Brussels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/80842e11",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.4,
        "scale": 10,
        "reviewCount": 7904,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/80842e11"
      }
    ]
  },
  "L-Avenue": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/87fc6e9f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.82262,
    "lng": 4.36807,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/aH0wEmxtKcocd37fiQOdmYlftzejwPvImzylT8aV0q8=.jpeg",
        "alt": "L-Avenue property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/5pErxdfEw268Hnh7GUAYqSHy_XQS0eLjphkWXa-1Ej4=.jpeg",
        "alt": "L-Avenue gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Ihx_RRF-4gQhNjRifprDzwWwTxjVFx8Q7cBy_a_ZI3s=.jpeg",
        "alt": "L-Avenue gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Ja7cd-Ux_pVyd1LTwxiYH3Pmq_fParCbbIiJdVSU9Wc=.jpeg",
        "alt": "L-Avenue gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/J6kbig87X1x9ZXJRsweL-pnj2JFHE6eG7OwzPKABUdw=.jpeg",
        "alt": "L-Avenue gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/0yaMY2kxX2Fx7n1RLnsVOaqOKlV8cSomkLjQRntEQ4w=.jpeg",
        "alt": "L-Avenue gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.35,
        "scale": 10,
        "reviewCount": 444,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/87fc6e9f"
      }
    ]
  },
  "Thon Hotel Brussels City Centre": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d41adeeb",
    "checkedAt": "2026-09-15",
    "description": "Enjoy a central stay in Brussels with a sauna, fitness center, and family-friendly amenities near shopping and dining.",
    "lat": 50.85587,
    "lng": 4.3573,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5jlDniYk1rG3qIoYucb4MJXAt7K8FNld0gLKM0kCNpA=.jpeg",
        "alt": "Thon Hotel Brussels City Centre property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/B5r_zOpyEYP9jHE3CXBFvrYjwHojnG8O84egX4ZXkuA=.jpeg",
        "alt": "Thon Hotel Brussels City Centre gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jq8pMmPZlomnyi3w_Gum2IAOJpcjOZP883o_wRoRTPk=.jpeg",
        "alt": "Thon Hotel Brussels City Centre gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/R-E3GwLHJBlNBaLZnIrsaOTfzdgtWgWD5mxAluEABsY=.jpeg",
        "alt": "Thon Hotel Brussels City Centre gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/wl-HXc3X6fq6EhFZLB1N8dyZqfdj4cQt7Da233hn_p0=.webp",
        "alt": "Thon Hotel Brussels City Centre gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gemDReQDkNYmWfGo_NdS1e3LRUNx32k1NeWaIr53HWI=.webp",
        "alt": "Thon Hotel Brussels City Centre gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d41adeeb",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.27,
        "scale": 10,
        "reviewCount": 1754,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d41adeeb"
      }
    ]
  },
  "B&B HOTEL Brussels Centre Louise": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c259583f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.82808,
    "lng": 4.36487,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/G8al-ZSUVCsJsCpmORd_6uFSEkq02Vqiyn5lOxaZfx0=.jpeg",
        "alt": "B&B HOTEL Brussels Centre Louise property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/K2y_gK9J8V0eJaMUESJSHrIxLx8BHt5Eqn4hMtoyr6w=.webp",
        "alt": "B&B HOTEL Brussels Centre Louise gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GQ8zxAoL-eKYTs7v1BywIaVyph263g6sVc84eugH3tA=.webp",
        "alt": "B&B HOTEL Brussels Centre Louise gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KEz-BKmyvfgSRfv_IfRp0wMOvrdqgPS_w_zeQuJMogs=.webp",
        "alt": "B&B HOTEL Brussels Centre Louise gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_7AkTgVpT6kAq8DWwR78egyysWJXRf-vY8s8igRA9mc=.webp",
        "alt": "B&B HOTEL Brussels Centre Louise gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eRhgV81MtyzPA5Xy6Px7tUg9JUBSEYEBMvvB01F2XRI=.webp",
        "alt": "B&B HOTEL Brussels Centre Louise gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c259583f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.73,
        "scale": 10,
        "reviewCount": 1340,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c259583f"
      }
    ]
  },
  "The Liman Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/15972f5f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.8556,
    "lng": 4.36719,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JUcaQhCQKuB3TdX9lY8YvSulQOhEZ_0B0mm1nyxINMA=.webp",
        "alt": "The Liman Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/EV76T2Pc5Epv9RLKj4Io4RicLyn4TFXqs6BtWcWrqZk=.webp",
        "alt": "The Liman Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lazauRP4kawCPj_vKa8Qg9llvdwjVXOz6YHscOhBfRE=.webp",
        "alt": "The Liman Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HVFyEtZ2RjHL4UQwlA0aDb-r2To0jyHioyWrgu-_Vl4=.webp",
        "alt": "The Liman Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fECOjVqzGfmD1lvIFDseC3Gj7DZYpf5dQ-tr_jnB63A=.webp",
        "alt": "The Liman Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tRmzDUCv_jm5T8Ik39rtMvSwR8UMtecihEUukzFzYS0=.webp",
        "alt": "The Liman Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/15972f5f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.2,
        "scale": 10,
        "reviewCount": 424,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/15972f5f"
      }
    ]
  },
  "Thon Hotel Bristol Stephanie": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a3afa686",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.83153,
    "lng": 4.35898,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kmmAWXCp8q18dzXLgKSP-jb90Nz-iXpVqFmZtfnCGqY=.webp",
        "alt": "Thon Hotel Bristol Stephanie property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KmufEi8VDkS3G0wqhUf573SCs8nmvWkdJtPpwfV96-A=.jpeg",
        "alt": "Thon Hotel Bristol Stephanie gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oQE7xEDcABq7gb7ZMkQ49Yqs-Be9QESsPALpikUSHxk=.webp",
        "alt": "Thon Hotel Bristol Stephanie gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xTYSWg0tyEuOyuMxXibOSI_MtzB9K_Eugd1lO0rnjWU=.jpeg",
        "alt": "Thon Hotel Bristol Stephanie gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UZlrsb2MXUysfRixTl67h8OkYXDnyVRdyz49YaZyqTA=.jpeg",
        "alt": "Thon Hotel Bristol Stephanie gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/pFzbE6bb124ojKnLGJz1T3O7pg-pnD5kaXHJKpY4VpE=.webp",
        "alt": "Thon Hotel Bristol Stephanie gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a3afa686",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 1344,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a3afa686"
      }
    ]
  },
  "The Scott Hotel Brussels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8bd2b596",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.83184,
    "lng": 4.35327,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KtQD9HLgDLsFcVj8CcD419jfSAqdmDWMV29UjP_1nso=.jpeg",
        "alt": "The Scott Hotel Brussels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WnKoabza6FfJ8AtlG9v7jDe9z_NGg5wQb72A_w363Aw=.webp",
        "alt": "The Scott Hotel Brussels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QlYg8msdLdrRZa2M4FeFhlFxVZFE2ynvl4QIvD7VFSk=.webp",
        "alt": "The Scott Hotel Brussels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DQ2zlqp9UG4ta-EypNKXz2sLPYFnauEoquax7TrFnSg=.webp",
        "alt": "The Scott Hotel Brussels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qYsleAsh7csiKhqQvRfp84MZuIMbDA3EhERkTn1Pr6U=.webp",
        "alt": "The Scott Hotel Brussels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CoArklAPypo9Lq9IWkDZ6KyPn8eDw6uFwqO4aWOv_K0=.webp",
        "alt": "The Scott Hotel Brussels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8bd2b596",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.6,
        "scale": 10,
        "reviewCount": 2581,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8bd2b596"
      }
    ]
  },
  "Zoom Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/00c9a202",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.83238,
    "lng": 4.35985,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/P2j0J2MBNHXPjOROyZDn2XRXLcQHmK2UAZ3J11jL5FM=.webp",
        "alt": "Zoom Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Q_qSrQYpslUTetcDn16de5wZvBRcRFuo4RI9u9J8rVU=.webp",
        "alt": "Zoom Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MCXt1wCADwhzPO3DnDydVJ3INwSJlN2mKEBcjyHufj4=.webp",
        "alt": "Zoom Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KVrloy_w6hLfGf8lX1mF_WPf771yZ0VEcCfRoUHgWi8=.webp",
        "alt": "Zoom Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/P2vSTEqh_r4wZNgDM-klgOOZA5zv4bvRaRtVGXjTh2g=.webp",
        "alt": "Zoom Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rsXLKJ-rrwcGS3V3eQU9lWEGyWSOq6NdL0e4OsahZQg=.webp",
        "alt": "Zoom Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/00c9a202",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 643,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/00c9a202"
      }
    ]
  },
  "Cardo Brussels, Autograph Collection": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b792f33f",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Brussels with spa, indoor pool, and two restaurants, located near Rue Neuve and City 2 Shopping Mall.",
    "lat": 50.85582,
    "lng": 4.35775,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UBDBIB7q7jbe2lxwPmMtxZzB6gu63C-isZfngNl_Ok0=.webp",
        "alt": "Cardo Brussels, Autograph Collection property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/buYB7UA0ZCwEcGiyACcj5Sf5HnbO8nK75VyJfTcAbvQ=.webp",
        "alt": "Cardo Brussels, Autograph Collection gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/giRKedK5AvxUal8UpeL7P0vmAQ2L8CEap1HJv-1_Pm8=.webp",
        "alt": "Cardo Brussels, Autograph Collection gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OwVonqElF4XRvgPRLFu0vaTdTho6yBrVJvO9rHd3VR0=.webp",
        "alt": "Cardo Brussels, Autograph Collection gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/si-bFwx9gx1BrxmRr9vphxZ-V1QAp3NmOfimGvzZUTk=.webp",
        "alt": "Cardo Brussels, Autograph Collection gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4E0bVqaowTmtfNbFE5jcp-snegb7Pfwoh_Ozr9trCJs=.webp",
        "alt": "Cardo Brussels, Autograph Collection gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b792f33f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 1222,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b792f33f"
      }
    ]
  },
  "Craves Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8aaec6a6",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Brussels, just minutes from La Grand Place, with modern amenities and a 24-hour front desk.",
    "lat": 50.84873,
    "lng": 4.351,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XZnQvI6F9GzefcPOG81uOfd5NbV3-YYwnJqTN8yBweM=.webp",
        "alt": "Craves Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_u1ooOwcaXF26h6YXyHceq9IF6ZX4T1UKzV9dctXMHM=.jpeg",
        "alt": "Craves Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ynfuZ-kMbRu4czg4n7TObWGJYcNcyjVVJ1lu5M1OHJ0=.jpeg",
        "alt": "Craves Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SNZfUP1FzT1yu4ggXndKyJWAXHMz7M7FWMzSST7R4Zs=.webp",
        "alt": "Craves Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ebOSRob5oUwSh3TDk_hjEpdhgQKky3WKD4VxG-GM2Bk=.jpeg",
        "alt": "Craves Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gxfOcN3oFSr_ntdcrXy0o9wBM-vpb-nbxsdmDSDPIjA=.jpeg",
        "alt": "Craves Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.47,
        "scale": 10,
        "reviewCount": 1902,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8aaec6a6"
      }
    ]
  },
  "Hotel Indigo Brussels - City": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/59ed6ac7",
    "checkedAt": "2026-09-15",
    "description": "Art Deco hotel with a health club, terrace views, and vegetarian dining in Brussels' vibrant Saint-Josse-ten-Noode district.",
    "lat": 50.85573,
    "lng": 4.3597,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CFHxBpnsSXvTnHLGbVe5zdCl2B0pNAQmHQalX_UqU8U=.webp",
        "alt": "Hotel Indigo Brussels - City property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_go3PLMMYxT66mP4818KdyqU8LG6OMv6CUxeGg2AbZU=.webp",
        "alt": "Hotel Indigo Brussels - City gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jp4CAqqwQ7kwMMs4A69kevOjmySrCOi9sH75sibmmpA=.webp",
        "alt": "Hotel Indigo Brussels - City gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gzMyQRX9XrhK4cOph_Jw_eGr3ryCpk-RnJxVgbYAol0=.webp",
        "alt": "Hotel Indigo Brussels - City gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/W1inFe0DzNNhTwUw_ep_SC0Uu7bNVSPMk0J7Sp7VXBc=.jpeg",
        "alt": "Hotel Indigo Brussels - City gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CuyCWQSya_w2tc3tgaEjFKPVyev88XHVlX5dpkqj62Y=.webp",
        "alt": "Hotel Indigo Brussels - City gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.7,
        "scale": 10,
        "reviewCount": 5237,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/59ed6ac7"
      }
    ]
  },
  "Motel One Brussels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/1e3dfbe9",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Brussels with a terrace, garden views, and modern amenities for a comfortable stay.",
    "lat": 50.84869,
    "lng": 4.36313,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XBrOQItVpgmSmcv7JTAeUxTjsKhUNUd3FKcPBTid7w4=.webp",
        "alt": "Motel One Brussels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/S6jEXvcKNku-_t9hiFVxvoiEwidPHTCp4VNVPA43FXY=.jpeg",
        "alt": "Motel One Brussels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/a0yUTu1-ENVq0lmzxJ1ofwNcpAjx7kXLp745Jxai84E=.webp",
        "alt": "Motel One Brussels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WjcJV0vlkZQLdNVf7gA8Ok5OKoP53799oDafpkE_cSU=.jpeg",
        "alt": "Motel One Brussels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5qGQQZUz0yUhRoP3u4u2noDNCo0q851ECPUJYTNRLDY=.jpeg",
        "alt": "Motel One Brussels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SLyhp3omaATviU4yd-_99nE_whRClMy_biiibChlss0=.jpeg",
        "alt": "Motel One Brussels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.83,
        "scale": 10,
        "reviewCount": 10667,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/1e3dfbe9"
      }
    ]
  },
  "Stanhope Hotel Brussels by Thon Hotels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/e7d4a55a",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.83966,
    "lng": 4.36733,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LlLHV9vmM5K4T5m59Z_Go-wvB54JLLTj_OVj5KlfsLc=.webp",
        "alt": "Stanhope Hotel Brussels by Thon Hotels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MgAIemwXsi4NZP4f_xu4b7Ky23hdcGv1_pwG1ZIPlVk=.webp",
        "alt": "Stanhope Hotel Brussels by Thon Hotels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_5DaqgSMHtN4vE7ALg214JMrfL08A6DpAogkqu_e8JY=.webp",
        "alt": "Stanhope Hotel Brussels by Thon Hotels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/k8PB41ciTsBPx1y8D_NL8T9e7Ur1avTICJeYg6RblSk=.jpeg",
        "alt": "Stanhope Hotel Brussels by Thon Hotels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9EKm5qxvsQ7iJCQrZ4oTEEOi4_a0yFmN27yK4fNFZAI=.webp",
        "alt": "Stanhope Hotel Brussels by Thon Hotels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eopFClhoNaa5Z9zXonxUHQc5QNucz3vMHybdVQOksHU=.jpeg",
        "alt": "Stanhope Hotel Brussels by Thon Hotels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 1001,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/e7d4a55a"
      }
    ]
  },
  "Hotel La Grande Cloche": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/685fb039",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Brussels with a terrace, restaurant, and modern amenities just a short walk from La Grand Place.",
    "lat": 50.84295,
    "lng": 4.34625,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/8z4H_vb02KXv3-ToCRza6pk2MggtkGi2S1l-6AW8KCY=.jpeg",
        "alt": "Hotel La Grande Cloche property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/685fb039",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/BaXiN07gecDhN7NxrMyf6QOOmHL2q9c6xkl2QLRXvEc=.jpeg",
        "alt": "Hotel La Grande Cloche gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/685fb039",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/qqSIVMDoQhudiX4uIDSitC0kOWb5ftUYU9OaHPQbB0s=.jpeg",
        "alt": "Hotel La Grande Cloche gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/685fb039",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/Pm4c_Y52m0v5YCUsMqub9NQ-5nd4dKLYhcqai50L_2U=.jpeg",
        "alt": "Hotel La Grande Cloche gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/685fb039",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/czejtBvbB8KmivKwImx6xo2mOIeWpz_5Z5qybVdaxZ4=.jpeg",
        "alt": "Hotel La Grande Cloche gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/685fb039",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.57,
        "scale": 10,
        "reviewCount": 592,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/685fb039"
      }
    ]
  },
  "Bedford Hotel & Congress Centre": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/914670b6",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Brussels with a fitness center and banquet facilities, just a short walk from La Grand Place.",
    "lat": 50.8442,
    "lng": 4.3474,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0twcwVTOwis71n0aPiI1M1uCvKVXetqfdANR6egbMtU=.webp",
        "alt": "Bedford Hotel & Congress Centre property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/J8f3FjzxsuvFxAMK7vHB3zoAK1uUA4rMYOsrU9BgQDI=.webp",
        "alt": "Bedford Hotel & Congress Centre gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vkjufpZWC6MSxyDqofrs7RyqSOUOnS0dCEpClbsCprU=.webp",
        "alt": "Bedford Hotel & Congress Centre gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jDL11xg6e_XziCpD6N8ugo9Pa6i8_vC4Gr5N1Q3LewY=.webp",
        "alt": "Bedford Hotel & Congress Centre gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/417XzI9AUP4YWX5Q5L3Zgd9l8tXw2e5heYLCB9UMwYo=.webp",
        "alt": "Bedford Hotel & Congress Centre gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7GnJXAy257LfVt2F8_yMxUL9iaEfE-uTTZT0-tq7QMw=.webp",
        "alt": "Bedford Hotel & Congress Centre gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/914670b6",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.15,
        "scale": 10,
        "reviewCount": 10840,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/914670b6"
      }
    ]
  },
  "Numa Brussels Royal Galleries": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2f37775b",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.84832,
    "lng": 4.35623,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dN3d-1VL9D_WBdlOk3eGk_2kVXWGdrU1FPK5BzeFqJw=.webp",
        "alt": "Numa Brussels Royal Galleries property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AcM9kIeaqh1AJlTWMQjQC59C210QgoC-XvbjGxYc_2Q=.webp",
        "alt": "Numa Brussels Royal Galleries gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lvLv0uU197MW_yXJe-TTqE0X9hfb6VZtX0Y8zcrU368=.jpeg",
        "alt": "Numa Brussels Royal Galleries gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OmOs5WjEUY3ERm3Uw3ZIU4kRW5LLhl6Kkz4o2exv2yg=.webp",
        "alt": "Numa Brussels Royal Galleries gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Azvl34zw9olnH-P2FHTssgwEb0Fn_rPb2wu-kpPsCu8=.webp",
        "alt": "Numa Brussels Royal Galleries gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fqsT_tLi0RBii-_cRGOYjRIVJsJV3-cy30QwRQCDWEQ=.webp",
        "alt": "Numa Brussels Royal Galleries gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f37775b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 1001,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2f37775b"
      }
    ]
  },
  "Radisson RED Brussels": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/hotel-radisson-red-brussels?cip=234716015&currencyCode=USD&search=100-147899;dr-20260930-20261003;drs-40;rc-1-2&dealId=4687147081296665290",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.83729934692383,
    "lng": 4.372499942779541,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/67/80/987b8b51dbd21bf447bb270b1923b9dbc72d54bcb7ff353c681733b86bb6",
        "alt": "Radisson RED Brussels property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-radisson-red-brussels?cip=234716015&currencyCode=USD&search=100-147899;dr-20260930-20261003;drs-40;rc-1-2&dealId=4687147081296665290",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.7,
        "scale": 10,
        "reviewCount": 8062,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-radisson-red-brussels?cip=234716015&currencyCode=USD&search=100-147899;dr-20260930-20261003;drs-40;rc-1-2&dealId=4687147081296665290"
      }
    ]
  },
  "H2 Hotel Berlin-Alexanderplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ac46dad9",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Berlin with modern amenities, complimentary breakfast, and a 24-hour front desk.",
    "lat": 52.52537,
    "lng": 13.41429,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QDnNFeWH1GNHSQwrPnigwdnIvDQvXXNDX1gDNZzTvJ4=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8X64p5N6VbsBPyOO1Aswr4wBZJz3SMko6Escnp1l4Sw=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Eop6BIneXBExf30SGP2PsMK4hD7DIwmWe6gzf4lOfRs=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SNH35X4kMuIWv_ogHsl9AHlRBWfjr8hBvnrB_KSIlhU=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cIMW8IfBGWCe6ionYDEn13RMZDP4R0NTr9kOo9aXJlA=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/t8AR7p2KHBm4wbh-gvq2aoDvhrSdWMrAy4MBqvqAokw=.webp",
        "alt": "H2 Hotel Berlin-Alexanderplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ac46dad9",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.2,
        "scale": 10,
        "reviewCount": 14916,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ac46dad9"
      }
    ]
  },
  "Hotel Sachsenhof": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b2df0f20",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.4987,
    "lng": 13.3514,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/I_2PhDCrvojf3UhpXNOqLV788pT7RdISc_pvOTLvZ_w=.webp",
        "alt": "Hotel Sachsenhof property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xBKHNZNbgs6UHJZ0K9bMVM9eMmC9K3e5j2F0yOsUkl8=.webp",
        "alt": "Hotel Sachsenhof gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eiaeckJ3td35D0zadt4bFVGKLWS26eH1lxWiFuNYca4=.webp",
        "alt": "Hotel Sachsenhof gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6EjQ_H7troTec0lrKlnZ0m7749veX2TEBktT192hpPc=.jpeg",
        "alt": "Hotel Sachsenhof gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yUi5PLMhFxHgQJaRQ9gnEGC9HIAgkjtFE28RTGQa3fA=.webp",
        "alt": "Hotel Sachsenhof gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jaXHf1IbdR8gr53SqDdUW44eLk2eo8grSN8NxpitvSw=.webp",
        "alt": "Hotel Sachsenhof gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b2df0f20",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 3439,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b2df0f20"
      }
    ]
  },
  "Hotel Les Nations": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/364f033b",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.52342,
    "lng": 13.33186,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kNQJUdYFQ0Cy5vJ_o0Y5E49GFqKR6dAHsaJ6ZkkGkhQ=.jpeg",
        "alt": "Hotel Les Nations property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CApggnAfBv43hqcb87lD6jH3TMavDjvDOzUvBbDjG6w=.webp",
        "alt": "Hotel Les Nations gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NgdxfjV_9-1rao3RzERy9P7r9Z-uoSQsGY7HyQqNNtM=.webp",
        "alt": "Hotel Les Nations gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Bl1utmEHmWtIZwfJlkQyHpNuwEVlK-R_UZK6CfxiE9U=.webp",
        "alt": "Hotel Les Nations gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/foyKj7bh8fH2XhjSh5T3V3pWvNhwrTz_Ft5obhvFzzk=.webp",
        "alt": "Hotel Les Nations gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AI4bExgQesd_IV8wh-FMSvSoR_jyZB0uvF1LfZdAzks=.webp",
        "alt": "Hotel Les Nations gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/364f033b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.47,
        "scale": 10,
        "reviewCount": 1120,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/364f033b"
      }
    ]
  },
  "Hotel Nikolai Residence": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4c66d4ba",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.51715,
    "lng": 13.4066,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/5v4T_oXifXYIZTFRNZsPp4wIZxIYPmrHcXlwISChHE4=.jpeg",
        "alt": "Hotel Nikolai Residence property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/u_SybwBbxbIcV8rWf3Zf1wUrp-CokdsAIIyvxOWR_fE=.jpeg",
        "alt": "Hotel Nikolai Residence gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/MZvAypGZvfDtzdMk7y21XLfLOxXTu5VPz66h7imRVVQ=.jpeg",
        "alt": "Hotel Nikolai Residence gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/rsDGurxVEKV1Z0Eu6RkFHVP7dJtnq-lINQp9vAjTpyU=.jpeg",
        "alt": "Hotel Nikolai Residence gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/SmndO7CAKQwcC5-MgQkZl7FcKdydV60ku2KEbTt8yFM=.jpeg",
        "alt": "Hotel Nikolai Residence gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/TRUuatiNx2uqG7k2b8McpQQ1yC3YtPT_z19-YNzSTvQ=.jpeg",
        "alt": "Hotel Nikolai Residence gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 710,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4c66d4ba"
      }
    ]
  },
  "Château Royal Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8f6dd9db",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.51774,
    "lng": 13.38579,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/S4sGjccnMjwW7QoEuHrQLKIVsOBbpGq-RkREvxnwVjU=.jpeg",
        "alt": "Château Royal Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sg_41jBqYxwmS9Fr2rCTPT0NMeo9S0t_pTwyVOvdRtY=.jpeg",
        "alt": "Château Royal Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sM3YJQ3GeU7QKwBmMVJps3WFVjK0fz-IEqLJxvTmEto=.webp",
        "alt": "Château Royal Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/paXlyIe3ZXbPLebwZ5XLASzZXA1q6lb6JWM_eIaJNGc=.webp",
        "alt": "Château Royal Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QvoMfLwIY38--QOL7quw5Qefr1SwKG-y-smMOVEVnXw=.jpeg",
        "alt": "Château Royal Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bxkuRosSfQq73CRbAL_P3kPxR9i5-A44vETxTvpZjS0=.webp",
        "alt": "Château Royal Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.35,
        "scale": 10,
        "reviewCount": 106,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8f6dd9db"
      }
    ]
  },
  "Telegraphenamt": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f78cb27b",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.52391,
    "lng": 13.39454,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IpGyC4tfS9pfICXsxkvIAajoGpbje3VG0uwpgMFbB1M=.webp",
        "alt": "Telegraphenamt property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Fcd7G8cSRPx3QV4TC_01K70o7KX9mdqjXJK3FBlPsi0=.webp",
        "alt": "Telegraphenamt gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LvkD4FAsQf9DmacLwJWI2VAiq6Ep5nYkhmBQhbfZFVY=.jpeg",
        "alt": "Telegraphenamt gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-rM-uhwCAzHuXJkPvMH_qp4_1zyvEwij5SnEBXysR1c=.webp",
        "alt": "Telegraphenamt gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dExoWVgIwdjJOkxeRnFjL2JxyuDzkIPAEcj79vMEt0A=.webp",
        "alt": "Telegraphenamt gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AaWXL6k3X_E2TRdKMDqxQegL-oEQyVOTzd9_zy7sDfo=.jpeg",
        "alt": "Telegraphenamt gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f78cb27b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.2,
        "scale": 10,
        "reviewCount": 346,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f78cb27b"
      }
    ]
  },
  "Hotel Zoo Berlin": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/hotel-zoo-berlin?cip=234716015&currencyCode=USD&search=100-16466;dr-20261005-20261008;drs-40;rc-1-2&dealId=-1946031914773277969",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50360870361328,
    "lng": 13.329039573669434,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/hotelier-images/20/ef/91167a7386fa592ae1f58416d0a6d26b32584dfe279eac36ca0c62a60d5f",
        "alt": "Hotel Zoo Berlin property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-zoo-berlin?cip=234716015&currencyCode=USD&search=100-16466;dr-20261005-20261008;drs-40;rc-1-2&dealId=-1946031914773277969",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.9,
        "scale": 10,
        "reviewCount": 7343,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/hotel-zoo-berlin?cip=234716015&currencyCode=USD&search=100-16466;dr-20261005-20261008;drs-40;rc-1-2&dealId=-1946031914773277969"
      }
    ]
  },
  "Orania.Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/0dfd6d72",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50223,
    "lng": 13.41685,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ukZZVEKZcvpp3o37zG1YFUJT0wblu0RQozpdDUZwmqY=.webp",
        "alt": "Orania.Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/wagiAPEhNRg4J4PmnkmcQ2pAHl2e1QJQnmD7pP9cSL8=.webp",
        "alt": "Orania.Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MS5689oBat77YcBOw--JA0_yaVr_8fGZiTk5AH0HBWA=.jpeg",
        "alt": "Orania.Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/prgm6jFSjBWHEYPTlQWf9SinwYmNPT99nsh_Z6YBXqU=.jpeg",
        "alt": "Orania.Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5m5oTccOhp87upj1_s0PJvE3OAtQuD_ogLsPgmCTCPE=.webp",
        "alt": "Orania.Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sPX0c1Z5hfYYlIa1F_FfXpB6fBWViGMA6ITaiYreP7U=.jpeg",
        "alt": "Orania.Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.25,
        "scale": 10,
        "reviewCount": 405,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/0dfd6d72"
      }
    ]
  },
  "The Mandala Hotel": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/the-mandala-hotel-berlin?cip=234716015&currencyCode=USD&search=100-5726;dr-20261005-20261008;drs-40;rc-1-2&dealId=-5312939781635780885",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50897979736328,
    "lng": 13.373680114746094,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/hotelier-images/6d/0e/05c1023c4dde37cc26a13d02c6361e266d7fd74e8907ea002ea6da4be541",
        "alt": "The Mandala Hotel property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/the-mandala-hotel-berlin?cip=234716015&currencyCode=USD&search=100-5726;dr-20261005-20261008;drs-40;rc-1-2&dealId=-5312939781635780885",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 15100,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/the-mandala-hotel-berlin?cip=234716015&currencyCode=USD&search=100-5726;dr-20261005-20261008;drs-40;rc-1-2&dealId=-5312939781635780885"
      }
    ]
  },
  "Gorki Apartments": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a0d79fb3",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.53057,
    "lng": 13.40175,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SB4U7sTJVPXJGFumlobJsTxG5vK9KFGHcWyZ_MlZsM8=.webp",
        "alt": "Gorki Apartments property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vn6vS3tb8xWcoN4Ls90e9iqf8KqQdXUa5yHIiFAr2Z8=.webp",
        "alt": "Gorki Apartments gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uACPIrMjvGQxX0cXEXfh4QCoJekfh_a1x9O8jfvSqX0=.webp",
        "alt": "Gorki Apartments gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gdqq89Ltha4EQaxZw5UxmdAXixS0-sfGhRI0BVoQrYg=.jpeg",
        "alt": "Gorki Apartments gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/RooKgRifS_3eyqEx9fgrdWjSf-gmLyBkNYdvX4wgTP8=.jpeg",
        "alt": "Gorki Apartments gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TNMWUcydLAv49GKCtB6be2I4yr3x_xgip_PEoIF4GwY=.webp",
        "alt": "Gorki Apartments gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.43,
        "scale": 10,
        "reviewCount": 292,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a0d79fb3"
      }
    ]
  },
  "Locke at East Side Gallery": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3f365269",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50697,
    "lng": 13.43709,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/X5GVdUiJ2bKX6jFNSvGcDWOoq51q4oxVlKtlNlmH94U=.webp",
        "alt": "Locke at East Side Gallery property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kU4rdPpZM7fHvtI0khbjElTMajRjS0ttYJq_2Vl2mJ4=.webp",
        "alt": "Locke at East Side Gallery gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IQgMdf--8WQO5OBUXWoUSgtmasj7NdSGBUmWFap6H78=.webp",
        "alt": "Locke at East Side Gallery gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JCpiapLsVN50eCBCfYeDLh6uAcEsnGIzmeFd1poAtJM=.webp",
        "alt": "Locke at East Side Gallery gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KKJ9Z7FCyDR76WsqEYrvJJ30N8nmDgP70-TG9f0jvk4=.webp",
        "alt": "Locke at East Side Gallery gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qWZLNH1W80yQacbfLqfOhGXdK1dlkQfxEPxWtlokpys=.webp",
        "alt": "Locke at East Side Gallery gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3f365269",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 975,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3f365269"
      }
    ]
  },
  "Radisson Collection Hotel, Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8ecd3b2e",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Berlin with an indoor pool, spa services, and a superb restaurant near Museum Island.",
    "lat": 52.51933,
    "lng": 13.40303,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oSBtvXga_B6kv78LFHhJA_cIxspUJuQTuc4XSlAHJFQ=.webp",
        "alt": "Radisson Collection Hotel, Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uhPsItaPnC77MvlprFBnPh4FjLd3iwLY9ePvL_u_2fw=.jpeg",
        "alt": "Radisson Collection Hotel, Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rjfNreLNeR7loUarUtfLj8MoNtK56Vs85svZ20uM1rQ=.webp",
        "alt": "Radisson Collection Hotel, Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/duCgsu4Nl2b1udwTVM25o0ag6peB-WMwecdNsm5Hig8=.jpeg",
        "alt": "Radisson Collection Hotel, Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7aRuflZH_-4yHkDOftwTC5DFvz2wgJp3amiaRwFht0w=.webp",
        "alt": "Radisson Collection Hotel, Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/zsqsmjG175We6zT4PkLPs48ngFBFvmLMUDWhg1CJ1wM=.webp",
        "alt": "Radisson Collection Hotel, Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.88,
        "scale": 10,
        "reviewCount": 1003,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8ecd3b2e"
      }
    ]
  },
  "Holiday Inn Express Berlin - Alexanderplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2c2979e5",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel with bicycle rentals, terrace views, and a complimentary breakfast in Berlin.",
    "lat": 52.516,
    "lng": 13.41158,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5Wn1h7NWfJfNSW7y8WQTFBiiOZ5tWHbR5IMDFLpZvkE=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XhSCoyzgxb2fmPJiQsZtFDwVPT609MeuA46h_2ukOZA=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/23IA8CvRAyfDgNU2nl99GBWyWTb3l3ff9Hz54FiOA9c=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1O49j1zKR9wL9bc_29pQgJD3dJNlHuRu_sqOb_GGBaM=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gEV73kLOmabwT5DHr_udy9FYBG8IyiG1tPoE6Ll1ulA=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uuUP1jU-JgbEOn9CIi2COiYUSmsJxOaAgju_2uMp8k4=.webp",
        "alt": "Holiday Inn Express Berlin - Alexanderplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c2979e5",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.68,
        "scale": 10,
        "reviewCount": 7179,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2c2979e5"
      }
    ]
  },
  "Hampton by Hilton Berlin City Centre Alexanderplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/194393c1",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Berlin with a 24-hour fitness center and complimentary breakfast near Alexanderplatz.",
    "lat": 52.524526,
    "lng": 13.4187,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IRTMXFeu31z1ou9fvjC1LLQMjBhdZ7cIM7NRCWDssf4=.webp",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_wV5xytAnerfDq0MmBihfJRv62a32CvgcI3ary8txZc=.jpeg",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lKvIYKGzOX_f48dkBQCgIoQKiq4lD6f3JzKzCIlGDpI=.webp",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Z08uU0XzQRCuCIurZlS-vNctjf9K7wWPhDy6XEdkLmw=.webp",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tVlOnHS41U16BqqBq4BeEMgQcVwq-FgcXM_ZqfgfOqk=.webp",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/SM9Hlv9bDDoOgrB6WUjao_3EdCw3v7AE8ryvA9i086w=.webp",
        "alt": "Hampton by Hilton Berlin City Centre Alexanderplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/194393c1",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.3,
        "scale": 10,
        "reviewCount": 12728,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/194393c1"
      }
    ]
  },
  "Leonardo Royal Hotel Berlin Alexanderplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/bca37fac",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Berlin with a full-service spa, 24-hour health club, and international dining options.",
    "lat": 52.52741,
    "lng": 13.42333,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Nvfge4GYXAGlAic18cYznVOscg1AaPQdndHLe6_Cd3k=.jpeg",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Arn0js-U362qHKwqypjE_EJjRAYjTYgk-fd1_Ae7wvA=.webp",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NxFlnEFb4HTrK3iST2txO_PStNbH2fn-72DlUcMElf4=.webp",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GE5n46ns5itSKYs8Yo5A3VUhDelBwUIbPVqy4lfmApI=.webp",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bkJrUWOYd9mK6MSUPt5pDA4wiApy86D6oYEONC15moc=.webp",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/t-w1_EXL5nXIte7N42Nmx-N6r5c3mbOBGqRyO4E3lAY=.webp",
        "alt": "Leonardo Royal Hotel Berlin Alexanderplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bca37fac",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.6,
        "scale": 10,
        "reviewCount": 9332,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/bca37fac"
      }
    ]
  },
  "art'otel Berlin Mitte": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8d00a144",
    "checkedAt": "2026-09-15",
    "description": "Enjoy a full-service spa, fitness center, and dining at this centrally located Berlin hotel near Museum Island.",
    "lat": 52.51235,
    "lng": 13.40992,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9RJbAKcsU_sA6pTpVnBvkSQ9SfMv5Puwyfv1RdLql6U=.jpeg",
        "alt": "art'otel Berlin Mitte property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/pqx1tS4Gymnbq96xnxpfHDqK71ILvZVvSfI3zvtHHBA=.webp",
        "alt": "art'otel Berlin Mitte gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/den2JM35oCUvwaP3Ok8MGF_s0QQy5dnOEFbwNFyn__g=.webp",
        "alt": "art'otel Berlin Mitte gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/APWbLD5KN49xJoulDni0hfHRxYg_i1MV-7WkFynpMpk=.webp",
        "alt": "art'otel Berlin Mitte gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sAkqhZ6LZqTCoj5toyfOUdyYMiV9ZvLOoZ82y10TOc0=.jpeg",
        "alt": "art'otel Berlin Mitte gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/izMzvrgPqh7g93_mqYHKioUpQEzTK4VP2f2kkP-8VO8=.jpeg",
        "alt": "art'otel Berlin Mitte gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8d00a144",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.68,
        "scale": 10,
        "reviewCount": 2105,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8d00a144"
      }
    ]
  },
  "Eurostars Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8c8c57a0",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Berlin with an indoor pool, banquet facilities, and a central location near Friedrichstrasse and Museum Island.",
    "lat": 52.52038,
    "lng": 13.38829,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gETrOEpKKl1im7YTKxDOTbnc6FobsX4N62opiom9jqc=.webp",
        "alt": "Eurostars Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/keFWimGdaIUjK0HpTit4saLRkT-HXz0M0IxRd_6FL0Q=.webp",
        "alt": "Eurostars Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/zyTl_GVW5DAoMQHz70_u6LPPBcU6QCDoXAHSdrdWW5s=.webp",
        "alt": "Eurostars Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lK4W_mmlxkRag03ANcS7BIFHAnjyZLJHEQ51cHeJ5Ow=.jpeg",
        "alt": "Eurostars Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7LbpB0w1qNO1q4RAfYIs4pJtMw9sVHpgJtRPW9fYK98=.jpeg",
        "alt": "Eurostars Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7EmW97GrCB6QSuZMfGe_Oq-sX75L-rzjvnfMBo2YBsY=.webp",
        "alt": "Eurostars Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.55,
        "scale": 10,
        "reviewCount": 3747,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8c8c57a0"
      }
    ]
  },
  "Dorint Kurfürstendamm Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3df3af91",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.5027,
    "lng": 13.33195,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QIzzgXpHTR3rHMY8UJE7WQhprE_5545kiUQfvOpr3F8=.webp",
        "alt": "Dorint Kurfürstendamm Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KxezEpY45zjBnxHCfQaSrRcZCKZ2GuNoVLlTopkQR0M=.jpeg",
        "alt": "Dorint Kurfürstendamm Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7IDxA4JFBH-gs2sm42kSd5X55z5VNZCdY1ZSgHThYeQ=.webp",
        "alt": "Dorint Kurfürstendamm Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HIK1f3vGOzl14J4jbBNpEXq7aTOztP-MrT6zDl35FiY=.jpeg",
        "alt": "Dorint Kurfürstendamm Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/u4QxHpZT1b8yESgIV8c1DG0fcELPNaIrBsmcMr6EgP4=.webp",
        "alt": "Dorint Kurfürstendamm Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dY-FnOPVWHZPZY-RLRBEa43odmq7QtBEURBh5W8Fv6A=.webp",
        "alt": "Dorint Kurfürstendamm Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3df3af91",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.03,
        "scale": 10,
        "reviewCount": 1020,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3df3af91"
      }
    ]
  },
  "Scandic Berlin Potsdamer Platz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/99d6bdea",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50471,
    "lng": 13.37483,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/snKJ5qagrJSXYn2fsNH8lNOHkshOeY7kBVF9enfV3ns=.webp",
        "alt": "Scandic Berlin Potsdamer Platz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eb-FSfBepwZFIk2gHFRiPdTVAony-gSD-jFpSdxC1ko=.jpeg",
        "alt": "Scandic Berlin Potsdamer Platz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Akdccu5-vPSSwusOpuot4sxTtpnj4bF8G1_5xjjliY4=.jpeg",
        "alt": "Scandic Berlin Potsdamer Platz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Dl54f3g1p1N9nqNF7n0CEMTWNsL-rN7IUusGksNAHSk=.webp",
        "alt": "Scandic Berlin Potsdamer Platz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3aY74v9iQXOlCG6p_ZhTMh1Z1scyskVTxVbKlHWeYx0=.webp",
        "alt": "Scandic Berlin Potsdamer Platz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sVmgPoGqxuSG5Bt1PNMvkaX6u5RAFyWQqdgy2-ne99U=.webp",
        "alt": "Scandic Berlin Potsdamer Platz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/99d6bdea",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.48,
        "scale": 10,
        "reviewCount": 9825,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/99d6bdea"
      }
    ]
  },
  "Mercure Hotel Berlin Wittenbergplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/457cdecb",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Berlin with bicycle rental and a garden for relaxation. Enjoy room service and a bar/lounge.",
    "lat": 52.50103,
    "lng": 13.34255,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DmpUXNl1nflSQuqPaQa7ADUFXujzPofd4MWeD37V1nY=.webp",
        "alt": "Mercure Hotel Berlin Wittenbergplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MkR7m1Djb_Kjl0xIds99kAF5tGcolxcjJBWoAwf8G8c=.webp",
        "alt": "Mercure Hotel Berlin Wittenbergplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cxsKb4SiT9ujr47nVaJlRhdvsEEBCtk4wEzJ-FD-ieo=.webp",
        "alt": "Mercure Hotel Berlin Wittenbergplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-77Ra3Rrh7l9myz_UVXufqgi9clXiCeNniOVK5YmjRM=.webp",
        "alt": "Mercure Hotel Berlin Wittenbergplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_Hwhlhr7rM-28dU6mlyM-L0QB-Bm2kobKrzoke_Jr3c=.jpeg",
        "alt": "Mercure Hotel Berlin Wittenbergplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0C2asGtLgDrvl9fZ4T5EIwqXjs5wf8fJfqH3uax0-yA=.webp",
        "alt": "Mercure Hotel Berlin Wittenbergplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/457cdecb",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 2896,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/457cdecb"
      }
    ]
  },
  "Living Hotel Berlin Mitte": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2b7c6756",
    "checkedAt": "2026-09-15",
    "description": "Enjoy a comfortable stay in Berlin with a restaurant, bicycle rental, and easy access to local attractions.",
    "lat": 52.51207,
    "lng": 13.40845,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UA2-nHU0S9XXAcWOw9zH9r5PHCfC-WGBaI0PUMAftxs=.webp",
        "alt": "Living Hotel Berlin Mitte property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/mbBtrbjph3Vw6pxX_4R8wRTgn_nnkDv1Z3rTQWMSbxM=.webp",
        "alt": "Living Hotel Berlin Mitte gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ubG7JYh_-fMVqFcINFxUZFT3IypZdXH9_5K883rMX_E=.webp",
        "alt": "Living Hotel Berlin Mitte gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jerHbhcjpCIeVQjAqsIg0NMB-ChkCGItg7DVmqwZrR8=.webp",
        "alt": "Living Hotel Berlin Mitte gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FKebIylvPMtr2DScl1v9aiWGIoyBe6A2c3I9Ukg5L_0=.webp",
        "alt": "Living Hotel Berlin Mitte gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bu29UZTZyL_hK2b_MjETlVs9mnVbNWB0ukLr7mNJCMo=.webp",
        "alt": "Living Hotel Berlin Mitte gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2b7c6756",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 1003,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2b7c6756"
      }
    ]
  },
  "Hotel AMANO Grand Central": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/884fd7ee",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.5279,
    "lng": 13.37042,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vqWopzU2-JEDuGbsF8tC-N9wNoPLB7jEwiGjUCYeA_g=.webp",
        "alt": "Hotel AMANO Grand Central property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sx867Le-qTnaEBUvpmEI_CfH2T4ICG8rp5cb042WXaU=.webp",
        "alt": "Hotel AMANO Grand Central gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VqK-1kgw1H80iG7jTwzW69E_L6aSLJRJUeN6VsmYalo=.webp",
        "alt": "Hotel AMANO Grand Central gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QGkxELIqljIUsSUrfhZTM7yDhyfOJbHjY8oDTCK4yiI=.jpeg",
        "alt": "Hotel AMANO Grand Central gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OFibX1NVcZJOpYSS341Odlb1oQGvaEQtYwuqDSkqA2s=.webp",
        "alt": "Hotel AMANO Grand Central gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Y0BUs-gTp2axtcr7QUbUumIutVGoLzSo3gRYzOGb_fs=.webp",
        "alt": "Hotel AMANO Grand Central gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/884fd7ee",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 7991,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/884fd7ee"
      }
    ]
  },
  "Hotel Adlon Kempinski Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ff618f0e",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury in Berlin with a spa, indoor pool, and exquisite dining options just steps from major attractions.",
    "lat": 52.51611,
    "lng": 13.38006,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/loUn2WnE3UWysJct5Vsvuv7-BRNhmbGUaEZsn-g8PKk=.webp",
        "alt": "Hotel Adlon Kempinski Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2TAWZUrkGMw5iVzaTGHAQ7Sh9lbfhBuw4WfqnZpzGkI=.webp",
        "alt": "Hotel Adlon Kempinski Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/L5t1nAIGE5kAvJZPbUDEeA5yyk5rDQ_AqomWa44Nrac=.webp",
        "alt": "Hotel Adlon Kempinski Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/g3rJkVCvtU3c1HeY3w0okFLxj1Ca2694Nvh6Pi4qr5c=.webp",
        "alt": "Hotel Adlon Kempinski Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/15D6KUZTmabBDJXawlhifLkQ6XD-KNrDKhyufCzNHyo=.webp",
        "alt": "Hotel Adlon Kempinski Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lfwzrw_Y7DXoTO9IfI4BiU5hTwjCOh3WOLPbI6Lslpc=.webp",
        "alt": "Hotel Adlon Kempinski Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ff618f0e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 3603,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ff618f0e"
      }
    ]
  },
  "KPM Hotel & Residences": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2d4791ad",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.51504,
    "lng": 13.33169,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HnKqXntxTmLYmQUT03yvHv24-r_mI7zDHjcUjZ8fG8I=.jpeg",
        "alt": "KPM Hotel & Residences property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KcRmxcZhXkBOxJqToeRd7gqfVkIO6ar4fOBLppiQR4g=.jpeg",
        "alt": "KPM Hotel & Residences gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qa6N69XdsPZyYYGyuMluIfOIGpTcNjyo_lJQUz8am2g=.jpeg",
        "alt": "KPM Hotel & Residences gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NGRmyPifdeg1bnlFkr1fgh4dwrTR3sBHUCIb7uE1xOo=.webp",
        "alt": "KPM Hotel & Residences gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/llPzVrGSzeCM4abhkH1mkh0CELsaJcWqeYQmoPmMgag=.webp",
        "alt": "KPM Hotel & Residences gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vawxk587eGT0xKi6-_xUy4K9d9QjqJ-1-f6hQ6U06RQ=.webp",
        "alt": "KPM Hotel & Residences gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d4791ad",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.4,
        "scale": 10,
        "reviewCount": 1152,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2d4791ad"
      }
    ]
  },
  "Motel One Berlin-Hackescher Markt": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f1433cdc",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.52315,
    "lng": 13.40855,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/wWnz9xBYpk1JStAAYOJP7iR1ows3BhcHs202bowtGWc=.webp",
        "alt": "Motel One Berlin-Hackescher Markt property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/eFy4ZqwxVmkfJaWEwLK677Y7igT9NBKQwva1RTPjTY0=.jpeg",
        "alt": "Motel One Berlin-Hackescher Markt gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/w83t1v63nl0mxgTT12lROE8YPqu-PM5Y_K3GXQfB6Ug=.webp",
        "alt": "Motel One Berlin-Hackescher Markt gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/b5dUpA-9gDc6oplbsbbsizn5WWZZpxKaWlOKVwj9UqA=.webp",
        "alt": "Motel One Berlin-Hackescher Markt gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IGfm92nmtX7KreLIo2W_nVNJo66PCH3nldEgPWDJycY=.webp",
        "alt": "Motel One Berlin-Hackescher Markt gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GcWdBMEVBnrb2pWKqmh2ykRPqrsgBF8iP0Ms4BQ0i9o=.webp",
        "alt": "Motel One Berlin-Hackescher Markt gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f1433cdc",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.67,
        "scale": 10,
        "reviewCount": 1579,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f1433cdc"
      }
    ]
  },
  "Hotel ZOE by AMANO": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/3c7184eb",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Berlin with modern amenities, bicycle rentals, and a terrace for stunning views.",
    "lat": 52.5231,
    "lng": 13.40085,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ENwcs-90oPm0PEAlge5PCchoLN56Rkqvn8wYAJ8CnxU=.jpeg",
        "alt": "Hotel ZOE by AMANO property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MC5ZeRQkcSwI339aN5yVxOIyXugSEpFokCXDK2GhpGA=.jpeg",
        "alt": "Hotel ZOE by AMANO gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cWh2sTQabAygfuYLL1R52pYP7PXUK_K4s-KUxevBs78=.webp",
        "alt": "Hotel ZOE by AMANO gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fBEBR68I-8nO6gi5kWeg3s7oqu7X6THEZxfkKTKIUtg=.webp",
        "alt": "Hotel ZOE by AMANO gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3xx7xWYrOosMEuolAabWtvsomkY1DDFLq9rtv4veKoM=.webp",
        "alt": "Hotel ZOE by AMANO gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gVlaiI3eNwo9eor8C_6qxUCF6RfG7UP4ReEztRh0mmg=.webp",
        "alt": "Hotel ZOE by AMANO gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/3c7184eb",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.6,
        "scale": 10,
        "reviewCount": 3505,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/3c7184eb"
      }
    ]
  },
  "Monbijou Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c035e39b",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Berlin with a full-service spa, sauna, and fitness center for a relaxing stay.",
    "lat": 52.52292,
    "lng": 13.39999,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VvLDlWIiXyJRjZxnZ2n-qc72PRpdCsxHhy3hmuNROog=.webp",
        "alt": "Monbijou Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/w5w0hoPuXt_o2fdyMau7it5GWahWaqV4E_qCNhTn7nw=.webp",
        "alt": "Monbijou Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/V1NgPwayIjuy_bZK2DRvi-RvZlW0qTBbC7lw5i3QDrE=.webp",
        "alt": "Monbijou Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1HwWBfcwNz_nzU9GylDjkQmrLsvR2Sd-c0kXh-5Sw3c=.webp",
        "alt": "Monbijou Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/K-DEZ9NfFsnnRj6FNW8BidBgB8xOQnjM2UIk_7_24WQ=.webp",
        "alt": "Monbijou Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NdIUwT0-WY9y6WgoF0OfsS4rHwYAv2x87aK-j1-XZig=.webp",
        "alt": "Monbijou Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c035e39b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.83,
        "scale": 10,
        "reviewCount": 1452,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c035e39b"
      }
    ]
  },
  "H4 Hotel Berlin Alexanderplatz": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/45ae9ba7",
    "checkedAt": "2026-09-15",
    "description": "Stay in the heart of Berlin with a health club, sauna, and on-site dining just minutes from Alexanderplatz and Berlin TV Tower.",
    "lat": 52.52571,
    "lng": 13.41452,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/0z_l4UA9GompfBtCNoz-x5ZVw2zEpoC8LJmVLaoJ0A8=.webp",
        "alt": "H4 Hotel Berlin Alexanderplatz property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8jwNTrfvDfaIjGfPq57_xTIgHExfSBjY9x90RmLnIg4=.webp",
        "alt": "H4 Hotel Berlin Alexanderplatz gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/YVgMJ8PYt7rnEtcdKzky6c1UqqE8zWrxzluDZhXoc9A=.webp",
        "alt": "H4 Hotel Berlin Alexanderplatz gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/M3d6SyxrfSTjsGIuGHpzp8JLTuYcY6sAcMhF9uHQrC8=.webp",
        "alt": "H4 Hotel Berlin Alexanderplatz gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Uc2RSSMmNolqqf5oVx6DcjYPZFr4Di6imiGZ7ewWpP0=.jpeg",
        "alt": "H4 Hotel Berlin Alexanderplatz gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yM62dqpbj9JwstkMaXyQ-PJRTkpdC81k_58VMbOnD_Y=.webp",
        "alt": "H4 Hotel Berlin Alexanderplatz gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.2,
        "scale": 10,
        "reviewCount": 6914,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/45ae9ba7"
      }
    ]
  },
  "Rosewood Munich": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/eec40872",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury with an indoor pool, spa services, and a restaurant in the heart of Munich, just a short walk from Marienplatz.",
    "lat": 48.14111,
    "lng": 11.57457,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ft_3mIk1I0IH3XFv81WlVtBwbEfT1mb4cUZkDkzzrBg=.webp",
        "alt": "Rosewood Munich property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4ZFzoVAaEnf9n-0Q6z_BunICAHSztHKyZRYJi3m5fxk=.webp",
        "alt": "Rosewood Munich gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AvgJroZoum5TIpf4IH9GzNHghbzrmmvPsBnPPYFWbNE=.webp",
        "alt": "Rosewood Munich gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uz85I1abDUQ0xD2-a6VCaysjB66dmlJllx_xxwoPSUo=.webp",
        "alt": "Rosewood Munich gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FckcX1uQwc4MKgHkA25uG9Uur9t6X_tpxnZ2WkH79Gs=.webp",
        "alt": "Rosewood Munich gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/EUmmOAEogXP6MUwTbZ5uBVMP_pqLK2d1sJHMoaom8gA=.webp",
        "alt": "Rosewood Munich gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/eec40872",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.3,
        "scale": 10,
        "reviewCount": 261,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/eec40872"
      }
    ]
  },
  "BEYOND by Geisel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c6ea256b",
    "checkedAt": "2026-09-15",
    "description": "Adults-only hotel in the heart of Munich, featuring individually decorated rooms with heated floors and Smart televisions.",
    "lat": 48.13695,
    "lng": 11.57532,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/lSpGdmP3p5vtwPd_Toy8EuuGaydI3iUm_gW77YaGdJU=.webp",
        "alt": "BEYOND by Geisel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6eMdfGm0_f4m23i-WHdsIgPhVw5ws43SIKfVKHV5FA4=.webp",
        "alt": "BEYOND by Geisel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/gXxTt3tn3T7Bk-cugv4bD0UDnCpNBNmqcLcKlRrqVPI=.webp",
        "alt": "BEYOND by Geisel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8bwmIm-WWVxs2CwBaPL33SGU0Ns4XkzvgWK6aJT1nj0=.webp",
        "alt": "BEYOND by Geisel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VRM8Zu_RYclPm7nGIODiCt4HA7k3YAEA8WhIa32sKKA=.jpeg",
        "alt": "BEYOND by Geisel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aqPqDNlVadWRkxcQpicEgU0bpy9JH9FuK0V3Hlch2lQ=.webp",
        "alt": "BEYOND by Geisel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c6ea256b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.35,
        "scale": 10,
        "reviewCount": 528,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c6ea256b"
      }
    ]
  },
  "DO & CO Hotel München": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c77d2348",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Munich with Mediterranean dining, fitness center, and eco-friendly amenities near Marienplatz and Viktualienmarkt.",
    "lat": 48.1384,
    "lng": 11.575,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/l9FCmbN7qw2_eKFV5XecnCKfYvC4GQ50Se2K_Gr3Ekg=.webp",
        "alt": "DO & CO Hotel München property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/10Mlm6pOg4p12n8PxE-oO5Bq3we93RzaKFBLDFiyPZE=.jpeg",
        "alt": "DO & CO Hotel München gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8KdxBimE_aqGMD4Jgjf26QmRxBylExPH4SzHn47KZSM=.webp",
        "alt": "DO & CO Hotel München gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/naqpbI5ieb3X34FW1zfhc9cccLpCTEAA1sTg67b0RnI=.webp",
        "alt": "DO & CO Hotel München gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/GLVo5mamIpeG0CWQdAFUsXWfsXP8YONv9vQJtB6GkZc=.webp",
        "alt": "DO & CO Hotel München gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7Ec5IEyCX_q8Tb0qQdB6ANKWkDzgOcyctU-AIJmvQ5E=.jpeg",
        "alt": "DO & CO Hotel München gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c77d2348",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.27,
        "scale": 10,
        "reviewCount": 427,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c77d2348"
      }
    ]
  },
  "Louis Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/da07329d",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury in the heart of Munich with a 24-hour health club and exquisite dining options near Viktualienmarkt.",
    "lat": 48.13578,
    "lng": 11.5759,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ms3ClkAo5fpDWb7OtJYW3mTq-2Q9kJs9c8OXLgsdpSU=.jpeg",
        "alt": "Louis Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VUoNB3X7KMdE9pUFpNQgEe3lJbNdEOQEL9SpcXex6i4=.webp",
        "alt": "Louis Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TiplOnYnNiVxcUqi55CKO3wSfNBbg36vCJcZSYRhqI0=.webp",
        "alt": "Louis Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/aRZgwSv9TMWYauJT6xMm20Z3-o-2aR9y0Nr6qlj7a0k=.jpeg",
        "alt": "Louis Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KWTUw5MdsBDV2a8hPinPuRVoWPWvBfiIKyYWo5COKQ4=.webp",
        "alt": "Louis Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/uStvMIhYXgvutHMtbTeoquoUaLCjJL5YvcO681RcXbg=.webp",
        "alt": "Louis Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/da07329d",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.88,
        "scale": 10,
        "reviewCount": 859,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/da07329d"
      }
    ]
  },
  "Platzl Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c25f0aec",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13799,
    "lng": 11.57879,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ZnyUhZCvfd6vIiEVeaG-rJzsuTo7rkq6P7NBzmtFWrA=.webp",
        "alt": "Platzl Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Osquv9DuEMlDeaymljhqSp1PjL5dFRyFwKiB4Ybat4A=.jpeg",
        "alt": "Platzl Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Wugi46doY_0mvFM4O65lbnHP4grHxx4HA2LllDdL7RQ=.webp",
        "alt": "Platzl Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/G056ZSNunIjYDptLC2GHPdBOsIZd0ZNSs64XMFDZPhc=.webp",
        "alt": "Platzl Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dxeJW8c3-Xq4tiEF7NHeSoBG5q8eKDUu5lidY0pP2ts=.webp",
        "alt": "Platzl Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/TvErhhfAA8_7-c6cu8F-QVUxODAQqw2_CbxU9FZvq8s=.webp",
        "alt": "Platzl Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c25f0aec",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.08,
        "scale": 10,
        "reviewCount": 2079,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c25f0aec"
      }
    ]
  },
  "25hours Hotel The Royal Bavarian": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a5069d04",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13971,
    "lng": 11.56131,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cOo3WYTLGMnbY2DiIRy9w9Pz0Egl0hKxwnt_aM0cRHM=.webp",
        "alt": "25hours Hotel The Royal Bavarian property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/u8B6Epoc0ELcJoCr-hVeoAi3gIaTr4ubpZ3Xw-Sxxc4=.webp",
        "alt": "25hours Hotel The Royal Bavarian gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Fgj19qHKv0gFxtFA866_ECU5daLn9lZvEFKUtsmidcg=.jpeg",
        "alt": "25hours Hotel The Royal Bavarian gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Scas-gmhdL6Vwob8nRo5bUyYg6jVRVzS9Lgu0EWX0S8=.webp",
        "alt": "25hours Hotel The Royal Bavarian gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rbQORE_MmW6HgOvcmelJn_kDCmS9frKF64UBRpvZPlI=.webp",
        "alt": "25hours Hotel The Royal Bavarian gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_qmd9QKKV7LOAUBRf1KeMx7eY8uEWsoJwETDGVd1VAw=.jpeg",
        "alt": "25hours Hotel The Royal Bavarian gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a5069d04",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.65,
        "scale": 10,
        "reviewCount": 1832,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a5069d04"
      }
    ]
  },
  "Hotel Torbräu": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/23d7e297",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Munich with a terrace, restaurant, and concierge services, steps from Beer and Oktoberfest Museum.",
    "lat": 48.13542,
    "lng": 11.58152,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_ZifniTwSH-7n_J1wZtN8gRc_2uhrYUvr8goW_Z2p7c=.webp",
        "alt": "Hotel Torbräu property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/n8PGmoWyn-oVQc_U2Zoh4e76FcBzFAGcCXip87DSjzM=.webp",
        "alt": "Hotel Torbräu gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/x7Eeb2ky9XyVilWHqyOOXbpS8j_BC6Wi2NMlonvps8c=.webp",
        "alt": "Hotel Torbräu gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/azrtQZLx94CGceBe2w4yvHwqZLBXTjr_qXzUHaKU40U=.webp",
        "alt": "Hotel Torbräu gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LjvwxJF9lEQp9up_g7-legvFFoyLe8Dm2BgXarbBkt4=.webp",
        "alt": "Hotel Torbräu gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QTOZk0T8iKCXaCKcOICP40PzGhWsGvk-Radmd6wrXpg=.webp",
        "alt": "Hotel Torbräu gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/23d7e297",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.13,
        "scale": 10,
        "reviewCount": 1868,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/23d7e297"
      }
    ]
  },
  "Revo Munich": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/cd69feda",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.08733,
    "lng": 11.64576,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qxLxtZzxElr-h6kWPD_Xb4J9a6V6fSiX7gv0zL0Usw8=.webp",
        "alt": "Revo Munich property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/w4lKST_h3-74A50azExZvHi8MtxhvI3nBmKAuGYurW8=.jpeg",
        "alt": "Revo Munich gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8KsbzxtAsY-BNObFyUsjlEO6dPdkFg4N0mUmiQU-i-o=.webp",
        "alt": "Revo Munich gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/rQ707uaqv7-hjpjoomSzq_PNM2XdTK7qX8_VZRkoCms=.webp",
        "alt": "Revo Munich gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Dlf_ARf58bo90CHAtFDRpdp-eYq9ZP7axbHhsIOtBLA=.jpeg",
        "alt": "Revo Munich gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OS7UZX8y_b6GsaPkbaFYSaId8-P7k1wvQ2IeFjegJQs=.webp",
        "alt": "Revo Munich gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/cd69feda",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 618,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/cd69feda"
      }
    ]
  },
  "GS Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c86e5320",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.10275,
    "lng": 11.53104,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/clQSyTm_vx_iICpgxw_VfbxLcdBqhzhNxVSr1CRcTZ8=.webp",
        "alt": "GS Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/E7ohaFzsOhw9rRIOM-ukZ8qRBnAP0aoPjBQ5Up3SWfE=.webp",
        "alt": "GS Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/V6BoNfweZuW251g80cbPtjVNb_yXNe2LaZ1OUplcjHk=.webp",
        "alt": "GS Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1GQJKlJflAaqQIJecxhm0fApF69Y45D6cKpTOa6z9Ts=.webp",
        "alt": "GS Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xurWadmsGaLwcjnOGTYtZxmhInx_nK57_fpwYIkITIQ=.webp",
        "alt": "GS Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/K-40XwAumBaF0d-fHjnS9UgWC40lDQyeMq6nITia6Jk=.webp",
        "alt": "GS Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c86e5320",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.05,
        "scale": 10,
        "reviewCount": 2176,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c86e5320"
      }
    ]
  },
  "Holiday Inn Express Munich North": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/5b51e418",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.18988,
    "lng": 11.58504,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/24_C4XHnPSooEoparne5VJMwDSP7iwm3kS-hKAU6eaY=.jpeg",
        "alt": "Holiday Inn Express Munich North property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Zcudj2EfykC5fP5MM99YK9SjNHQOBjng3sELypQ5W18=.webp",
        "alt": "Holiday Inn Express Munich North gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/N5qBn8N0_5mF3osdPJdyiuBzYjbPgQNwAujIWKI2K6s=.webp",
        "alt": "Holiday Inn Express Munich North gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bghPnznK1b6wPHpMRjntEdOWXZVLPAV2OD1YTTIwO8E=.webp",
        "alt": "Holiday Inn Express Munich North gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Fz_T7eSzaCZsP1c3RTRm8kufLXRjCMpCYZf3dfk9izA=.webp",
        "alt": "Holiday Inn Express Munich North gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6ooLmmQdKFLTtoxJB5FxX-pr_3F7dlnf22VVMCKVGqc=.webp",
        "alt": "Holiday Inn Express Munich North gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5b51e418",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.37,
        "scale": 10,
        "reviewCount": 1004,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/5b51e418"
      }
    ]
  },
  "Grand Hotel Palladium Munich": {
    "providerName": "trivago",
    "providerUrl": "https://www.trivago.com/en-US/lm/grand-hotel-palladium-munich?cip=234716015&currencyCode=USD&search=100-4907642;dr-20261008-20261012;drs-40;rc-1-2&dealId=-894082015458919876",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.095699310302734,
    "lng": 11.510089874267578,
    "photos": [
      {
        "src": "https://imgcy.trivago.com/c_fill,d_dummy.jpeg,e_sharpen:60,f_auto,h_534,q_40,w_800/partner-images/f1/17/add9067481745d67773371bc72ed6c21ab058753aaf9e13cc036737fe1a6",
        "alt": "Grand Hotel Palladium Munich property photograph",
        "kind": "exterior",
        "source": "trivago",
        "credit": "Property image via trivago",
        "sourceUrl": "https://www.trivago.com/en-US/lm/grand-hotel-palladium-munich?cip=234716015&currencyCode=USD&search=100-4907642;dr-20261008-20261012;drs-40;rc-1-2&dealId=-894082015458919876",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "trivago",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 6343,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://www.trivago.com/en-US/lm/grand-hotel-palladium-munich?cip=234716015&currencyCode=USD&search=100-4907642;dr-20261008-20261012;drs-40;rc-1-2&dealId=-894082015458919876"
      }
    ]
  },
  "Hilton Garden Inn Munich City Centre West": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/ed7d8953",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.1405,
    "lng": 11.5351,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BOdJDGcfG1tc5A3ejnOQnbK760c6vucbKV-dI-1-uXs=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LuplSmtt0n0dIng298A3IHEQjDQvAq3l6oeA4webgsw=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Up2sA1Jn2IEOCvPHAWs2K0zH0pejWubb0KtTGbVn1wY=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_SKwiLb_PCG48IzTPNUHdu5IJPTzuhZKp1YlH2ZqFD8=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/s5m0XphB1Ru6TylF48Jikb7DtvSFGu2YuCN3g-grmdk=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/njOp4K1LLaGpiDi7gz1sB6F6CiN_1JRz00EjSW2R-ZY=.webp",
        "alt": "Hilton Garden Inn Munich City Centre West gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/ed7d8953",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.13,
        "scale": 10,
        "reviewCount": 1917,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/ed7d8953"
      }
    ]
  },
  "Munich Marriott Hotel City West": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d3c11caf",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.14118,
    "lng": 11.52629,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yLvfd77LV8nmRPPeZVPHYYiWDHvxRPkj_r84cQzlMcY=.webp",
        "alt": "Munich Marriott Hotel City West property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3HxlNkBsk0egHUYF4XMzti1fpqEuD-NFJGoa6m6X0cU=.webp",
        "alt": "Munich Marriott Hotel City West gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_VNzGO30BLecx1ULqOcg_dHo0nhRDJ8frncmqSMPLQw=.webp",
        "alt": "Munich Marriott Hotel City West gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/i3MoqwXDdnwBh3JeUQWBn-D3--znsNtm8__l8u1jTrc=.webp",
        "alt": "Munich Marriott Hotel City West gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4yPpCgBH2MuQ6TrOFzalEueJ44WAhs1k5aXkksjLTB0=.webp",
        "alt": "Munich Marriott Hotel City West gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/5sHUf9IE1jLmHV-OWHHqULmxXKJeAXrkUVlT7yO5WF4=.webp",
        "alt": "Munich Marriott Hotel City West gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d3c11caf",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.93,
        "scale": 10,
        "reviewCount": 461,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d3c11caf"
      }
    ]
  },
  "Eden Hotel Wolff": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2d43374a",
    "checkedAt": "2026-09-15",
    "description": "Relax in a family-friendly hotel with a full-service spa, sauna, and fitness center in the heart of Munich.",
    "lat": 48.14161,
    "lng": 11.55916,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OINuJ3T49PmCsVl3ddFbdQBOKbtZ3Sgpt7g_atZAzxM=.webp",
        "alt": "Eden Hotel Wolff property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XcyMu8HEv4i8JdCNgeMlDRr-EUJp3AULVuH0mCPa1xE=.webp",
        "alt": "Eden Hotel Wolff gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Fw4dYzBcg_RIpI5E85MWzgIRIs229xSrTbQwQGJgpBg=.webp",
        "alt": "Eden Hotel Wolff gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Y1TBDd9dZJSWzwhR9Rg61aULsFeMWs-Gdd3BFiRPH6Y=.webp",
        "alt": "Eden Hotel Wolff gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BPopTHxXAuO0uVdjFgMWgRw6n2Gb-w2WtYEelGDNBb8=.webp",
        "alt": "Eden Hotel Wolff gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XUjt-OvH89k5igqsh1tUEEAzzlZiCpTlIfkSe3PUfl8=.jpeg",
        "alt": "Eden Hotel Wolff gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2d43374a",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.63,
        "scale": 10,
        "reviewCount": 2952,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2d43374a"
      }
    ]
  },
  "Boutique Hotel Germania": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4a582792",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Munich with modern amenities, banquet facilities, and comfortable rooms featuring tablet computers.",
    "lat": 48.13765,
    "lng": 11.56023,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/c8XraYNxxNkgxIKGyvTF9GJtQjE7v6GnoruUzDcGLZ4=.webp",
        "alt": "Boutique Hotel Germania property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IyyV5JxeZ-EZrL7jdw7uSjFIRysgY8K-bsm480NXHFU=.webp",
        "alt": "Boutique Hotel Germania gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4yFGkTkUrL0YcqYWFRaWR7WByyigL0bjJn-IIgvDx_c=.webp",
        "alt": "Boutique Hotel Germania gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vrc7ExC1EtkfG-qa9DOdd059ZQR7hN7DSWMcLFnb5Rw=.jpeg",
        "alt": "Boutique Hotel Germania gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/NHTjOlrHc6e_VWVNGBPWb4mv7wri3UJSuC0-_wP5fpk=.webp",
        "alt": "Boutique Hotel Germania gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2CB_9BNpbaF2IA3LfLMkSxVMTbqHnhPofaxTxC51nA0=.webp",
        "alt": "Boutique Hotel Germania gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4a582792",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.08,
        "scale": 10,
        "reviewCount": 3384,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4a582792"
      }
    ]
  },
  "Hotel Lux": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/5cbcf4a5",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13718,
    "lng": 11.57894,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/ai3caSXqNaZwN3D0tYM-Wup0IuAhHuJun-DqmMNC1hQ=.jpeg",
        "alt": "Hotel Lux property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/5BDoN1CdvseIP0HAPKyQr8a7PrBGSH6xnIdaN3_UPao=.jpeg",
        "alt": "Hotel Lux gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/GPGqb60jBHExei79Enmf4c5mrkaQjAtXpmEr-eg9PN0=.jpeg",
        "alt": "Hotel Lux gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/NkRdHXy_16vAEOh4I4HWPAvFMOjYRqphbdeoiXfnchY=.jpeg",
        "alt": "Hotel Lux gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/chSfIzRJv6hG0nMwXwtgJbn925_5Ycd8zQw2Au3oZPU=.jpeg",
        "alt": "Hotel Lux gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/veBQHDoBW_A1lvlyIcDmXlURuc4XuMGDxEIRiLteSSQ=.jpeg",
        "alt": "Hotel Lux gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.05,
        "scale": 10,
        "reviewCount": 854,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/5cbcf4a5"
      }
    ]
  },
  "Brunnenhof City Center": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a69d9a61",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13584,
    "lng": 11.56079,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/itz0So1Y4wvk5_LXbEsRVxmVztc69qrpSwlcmTM56h8=.webp",
        "alt": "Brunnenhof City Center property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hrn4Nxw7SlJMSixxD1F3QIx1ct4GaBKHT_C0KC6xpAE=.webp",
        "alt": "Brunnenhof City Center gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/2gCitK87_ye7Y_-ZAGNtsXRxW_Ns83j7w4IE1BEeYtg=.jpeg",
        "alt": "Brunnenhof City Center gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/AwpXC-0kXy93YPaR16yJ6B8F-fzOCOJapu66vGQBSBk=.webp",
        "alt": "Brunnenhof City Center gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/56MzvDG4L-BGjXOlKMiU1wHztJOD3lDaHqyge5BP3Vo=.jpeg",
        "alt": "Brunnenhof City Center gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/jM0QQ4AZiO7KyEqKBHrbLoCDVCT6A6UL4eymi6aEqZo=.webp",
        "alt": "Brunnenhof City Center gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a69d9a61",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.17,
        "scale": 10,
        "reviewCount": 2571,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a69d9a61"
      }
    ]
  },
  "Leonardo Hotel & Residenz München": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/d9b9724f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.11372,
    "lng": 11.5838,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HFvZu9ABrorBFe_MeHaXMsJDXi6dUy5PZM7UPx0sP7g=.webp",
        "alt": "Leonardo Hotel & Residenz München property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Af5T_Hy3rANnXbhowg_dhYkNT_nR4qvzeIvYb0m_48Q=.webp",
        "alt": "Leonardo Hotel & Residenz München gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dtt87GuySw7kkGTIZLEppWZ-ZPOrWmnliLh3vKOfyAU=.webp",
        "alt": "Leonardo Hotel & Residenz München gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vyZKIXhYsqcQLHOoVP3ga-EslDZQX9glZ9exXJ-gbe0=.webp",
        "alt": "Leonardo Hotel & Residenz München gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Kt6UE2Z1Ak1bBToVkUOt_YMdxO0hoJGQSwu1SoyoTec=.webp",
        "alt": "Leonardo Hotel & Residenz München gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DiZ5fRF-okVKiYHURCVja0dEsukJLx4HunGnsCBnro4=.webp",
        "alt": "Leonardo Hotel & Residenz München gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/d9b9724f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.28,
        "scale": 10,
        "reviewCount": 6619,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/d9b9724f"
      }
    ]
  },
  "Ramada Encore by Wyndham Munich Messe": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/91a965ab",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13462,
    "lng": 11.66926,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qhrtI1B2uxygrwBCVIPgjG9AGObHnYEONct98yoYTyk=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/q2JSsK5HObw2VRHzO0lEzgnzOsrBt4RrJgbxejHd2Sc=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/t_Qiz2UFiv-84FcM4nChyUF97NGUn31byQD4wxGzbFg=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/IMUrIB1aB-oJFuSvfqP2S1hNq96OqkiYaU-qX_KFLIk=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/USSphtZMWZ4KGFRWU0LQlbN3SrPJKkUGKLshijWlNxw=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/T2yGtjLjnV4n_9KDd8S0flrerJJJPMQVu_GSkBoWcss=.webp",
        "alt": "Ramada Encore by Wyndham Munich Messe gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/91a965ab",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.18,
        "scale": 10,
        "reviewCount": 10200,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/91a965ab"
      }
    ]
  },
  "AMERON München Motorworld": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/adbf7341",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.19515,
    "lng": 11.60808,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/V3oWTmoCvrs95l6TxxDksygbvulUQqOWA4Fsx0zv8qg=.webp",
        "alt": "AMERON München Motorworld property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/F_mslfu_UojPv9gNYqFfdeeNgM7pOO_rjRuXNDUGA-8=.webp",
        "alt": "AMERON München Motorworld gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/7r8Mk3mcfXVtglZpKidvRIxR4QaGdQ5PNFM7UI-eYkw=.webp",
        "alt": "AMERON München Motorworld gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-YGJg6JKMJAEBBkj5a4JebNdqsM9JI70L3LhJRvwPGo=.webp",
        "alt": "AMERON München Motorworld gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/egugNWR0GVFqR11uRwVen8WrmEvjegMlyeZPQ20CtDQ=.webp",
        "alt": "AMERON München Motorworld gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3jPRoJk7hFEHwWxPsAtI47q4I2gjFbsOsImi7i1UBSY=.webp",
        "alt": "AMERON München Motorworld gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/adbf7341",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.1,
        "scale": 10,
        "reviewCount": 582,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/adbf7341"
      }
    ]
  },
  "Mandarin Oriental, Munich": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2c34d61e",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Munich with a swimming pool, multiple dining options, and a 24-hour fitness center, steps from Hofbräuhaus.",
    "lat": 48.13701,
    "lng": 11.58087,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/MZ-sd1V8ndTOhkzQzT9Zh78f-ytzM1QPSssCPeNqgJw=.jpeg",
        "alt": "Mandarin Oriental, Munich property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/26yGWmusm9L3eIEMQVQklZzGNcVnVVtIkO-nI8zga5Q=.webp",
        "alt": "Mandarin Oriental, Munich gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cqMMAyhHZNP-6CajyY9-htq8mSMrbYr-XRK8D6-m6uI=.webp",
        "alt": "Mandarin Oriental, Munich gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Xe3EVDtOYdsYMn3NqcKGh0FXyIMXVbERam3ciQVq1Mc=.webp",
        "alt": "Mandarin Oriental, Munich gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bg-C9IGlkhaLLgnGZiN6TLT_k5O6pESAHY107K3rKXk=.webp",
        "alt": "Mandarin Oriental, Munich gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ohx3f1YIxF6YMLUD_lnmIh2kG7VZirDyZWi-HZxo2us=.jpeg",
        "alt": "Mandarin Oriental, Munich gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2c34d61e",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.25,
        "scale": 10,
        "reviewCount": 230,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2c34d61e"
      }
    ]
  },
  "CORTIINA Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/327a6ad4",
    "checkedAt": "2026-09-15",
    "description": "Boutique hotel in Munich with a 24-hour health club and terrace, steps from Hofbräuhaus and Marienplatz.",
    "lat": 48.13683,
    "lng": 11.57955,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dWadLETgpB-ViXQ-R_JQK6k57CZVA6ZyGz4Xz4VWZGs=.webp",
        "alt": "CORTIINA Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/r1QtxUMjoJKcgI4VdRL5MmLFovVkd-S9v1IJGr0937g=.jpeg",
        "alt": "CORTIINA Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/dNkQWTadB1tgsh8LGOXaKt8EMPYIwFFjyrBZkk9ho_s=.webp",
        "alt": "CORTIINA Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/QUZBIhv-HfIAqkBobtkkzFo4X3ASX7YtAwoD29OdbeU=.webp",
        "alt": "CORTIINA Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1v4SJJxp00dIEJ9uvchUQ1zmEcKYuwnSsYWHSDMrmwA=.webp",
        "alt": "CORTIINA Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3hMsoAcgW9EkNgFfT2u3MRNOLFqx0PbjWSoGYsP7WcY=.jpeg",
        "alt": "CORTIINA Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/327a6ad4",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.2,
        "scale": 10,
        "reviewCount": 1003,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/327a6ad4"
      }
    ]
  },
  "Andaz Munich Schwabinger Tor": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/97084ad8",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.17345,
    "lng": 11.58567,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qLcDMNo6hvw7MuzoJKZySraDCikKynDNwAmvmNK3HF0=.jpeg",
        "alt": "Andaz Munich Schwabinger Tor property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/C7QQqzQ3bvNHiG4um3QTp-8-g1wg3OeYDLufIKBG3aw=.webp",
        "alt": "Andaz Munich Schwabinger Tor gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1RdOP9sM0Gu6kFYD2lQGj80oTKyTPfMH4dQovbCgXpU=.webp",
        "alt": "Andaz Munich Schwabinger Tor gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Zd5gVbq0yh2dbTuekwtKGCz5mJ8Lmve9rLkE18I1P-s=.webp",
        "alt": "Andaz Munich Schwabinger Tor gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tsrtu1U6RBjkDgveHCMIYXLzInfUmQ5LMY9TbR9DHQQ=.webp",
        "alt": "Andaz Munich Schwabinger Tor gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/sqAANdKqA_Y9XZHsENlqEoiwBOb2FHldTOeM1q8P3T4=.webp",
        "alt": "Andaz Munich Schwabinger Tor gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/97084ad8",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 1157,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/97084ad8"
      }
    ]
  },
  "Hotel München Palace": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/8c8be8f5",
    "checkedAt": "2026-09-15",
    "description": "Experience luxury at this family-friendly hotel with a full-service spa, restaurant, and convenient access to Munich's attractions.",
    "lat": 48.13997,
    "lng": 11.60134,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/LvedlaoEnyfxIfMJypOCeMTFRA6jDeDvTyH4ZXn0xMk=.webp",
        "alt": "Hotel München Palace property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6xhV12V-t7eLAzIL206z_o49mAjN7fsuAGiie5qhLhA=.jpeg",
        "alt": "Hotel München Palace gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/UssjFKSjamDZZXywfTbfk24oM2ku1g_ggj7hw53bRCU=.webp",
        "alt": "Hotel München Palace gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HUETP_pbz8Fb0-AFfuDQ_d-FvaRxomoj5QgsCbRc_F8=.webp",
        "alt": "Hotel München Palace gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nbEB5RxvPe-LZ2Yi7q4A7gRWryJboqz84a9Xpczt6Jw=.webp",
        "alt": "Hotel München Palace gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9rWnGinORQReeqJrCKiNJMShgU6SjwlUeP4yi_atrfg=.webp",
        "alt": "Hotel München Palace gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.95,
        "scale": 10,
        "reviewCount": 600,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/8c8be8f5"
      }
    ]
  },
  "Hotel MIO by AMANO": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/f8a14c7d",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13478,
    "lng": 11.56875,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hpfmsSkK3R0TAghi9_0FPxONyPkMUygeoWNcB6IT1R0=.webp",
        "alt": "Hotel MIO by AMANO property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tBYotr0CDEQrTNwpvb1pjYMnBJ07qEXX0UYAr1_2LNc=.webp",
        "alt": "Hotel MIO by AMANO gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-mrfiZK9Tq8SNA5xU87ShG1x8qMqEmvEiSuCWAWr4DM=.webp",
        "alt": "Hotel MIO by AMANO gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oPZwkpEuTcOQ8Dz8QdoyDbduzQSpt-z9cl8l1vCGSmE=.webp",
        "alt": "Hotel MIO by AMANO gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ePHG3K0PDAyOuZ7fT9pGblSDdt-sc5fc6arVZ-La0GE=.webp",
        "alt": "Hotel MIO by AMANO gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HFFxLMtUZJouTcO9wiXa6-o0eTXJXHRlzVpO-IXH7Qo=.jpeg",
        "alt": "Hotel MIO by AMANO gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.75,
        "scale": 10,
        "reviewCount": 3348,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/f8a14c7d"
      }
    ]
  },
  "Hotel Metropol by Maier Privathotels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/92890f8b",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13806,
    "lng": 11.55741,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ncjbqN-euRyBvxFdNKQANUOnN7HtYoMWYpkKpoQ7HWo=.webp",
        "alt": "Hotel Metropol by Maier Privathotels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/qlUE39xZypiKxUWrXryHb2p7Qk42PSEcKBC6AQGV39M=.jpeg",
        "alt": "Hotel Metropol by Maier Privathotels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/CmCyf0h7sjXOKCauuFy1kxL3swuvRwQQwCg9BGI2LDc=.webp",
        "alt": "Hotel Metropol by Maier Privathotels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/OHtGTcPJsaUP59UT_hkF3SDYcGseuNRbm0ezpvGfOxo=.webp",
        "alt": "Hotel Metropol by Maier Privathotels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/-HVo-NVxsc26CQuPN4BuQCkVmnJzL1HX_tvdY98-Bgg=.webp",
        "alt": "Hotel Metropol by Maier Privathotels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xJ3VF5E7IcuRb58-1Vwv6piU9GjmLbgWxoDWZWnn7lI=.webp",
        "alt": "Hotel Metropol by Maier Privathotels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/92890f8b",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.08,
        "scale": 10,
        "reviewCount": 3011,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/92890f8b"
      }
    ]
  },
  "HYPERION Hotel München": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/a8aa1f0c",
    "checkedAt": "2026-09-15",
    "description": "Modern hotel in Munich with a 24-hour health club and Eastern European restaurant, ideal for business travelers.",
    "lat": 48.137,
    "lng": 11.62297,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/XwxftDyBWg7VTQFWvQXD424hjWEY6Y9JzfPrf0W0BgI=.webp",
        "alt": "HYPERION Hotel München property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1lubSZegq_3BTF3STeSy6r6buiydSgd4_TPD92J1g2g=.webp",
        "alt": "HYPERION Hotel München gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BRbJJ-6ypUoTW2P6CC_PilxDs_2hJSt8csfyygbwssA=.webp",
        "alt": "HYPERION Hotel München gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/VNTYBBUoGGRNw_-wy4S0CsN7gPBvmSbou7heYdLWuJA=.webp",
        "alt": "HYPERION Hotel München gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/h77yt__36wixjcsAHithRquyj9ZNo62O2g0NkAMjEtw=.webp",
        "alt": "HYPERION Hotel München gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6K05D2sSYwCZ2n_zd9PyB7mTBQt2cNOM7PVxvKlMLeM=.webp",
        "alt": "HYPERION Hotel München gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.75,
        "scale": 10,
        "reviewCount": 4865,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/a8aa1f0c"
      }
    ]
  },
  "Hotel Isartor": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/705ed570",
    "checkedAt": "2026-09-15",
    "description": "Centrally located hotel in Munich with a full-service spa, sauna, and fitness center for a relaxing stay.",
    "lat": 48.13341,
    "lng": 11.58142,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/iZgg2BDGX5Y-lmMt0l7tBndMV7zb36hWTsE4q-8r_RE=.webp",
        "alt": "Hotel Isartor property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hcjgNtk-nDvw0aUIIAOL-uHG7TmfKUCu3D4fMhcPc4Y=.webp",
        "alt": "Hotel Isartor gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/C1UX283Tx4cOQMPP7KsTAxEinDhjQ9um9K7Sw3JNSw4=.webp",
        "alt": "Hotel Isartor gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/8L3Q6ljywBr50nzmkdv4WcjwckFLstjv6ZGT_SwS004=.jpeg",
        "alt": "Hotel Isartor gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/WXBBkbdiYL6PT3mq9ijgGq1WAINiqF09_cyyVi1truo=.webp",
        "alt": "Hotel Isartor gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cv_TpK_FqNPoD_ZeeOqTTSksojo7KvXM9aIuY7WnAsM=.webp",
        "alt": "Hotel Isartor gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/705ed570",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.4,
        "scale": 10,
        "reviewCount": 2425,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/705ed570"
      }
    ]
  },
  "Bob W Munich Old Town": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/bf640d3a",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.13348,
    "lng": 11.58182,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/qTabTHiZPsq_75fa02XlTq_Waz7B5Y_axg4h85RY8Vk=.jpeg",
        "alt": "Bob W Munich Old Town property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/oVdBA9WvzMuk0-9l6n2MJvU-jPNGliHaAKYZP7JGObQ=.jpeg",
        "alt": "Bob W Munich Old Town gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/huojToelroQiIGZkMC8jWoZfYgwXWsTOz6U70ymb2Gs=.jpeg",
        "alt": "Bob W Munich Old Town gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/24kkm3LizvhPrUZwgVkc5ABCd-xri3u2z_oYQVl39l8=.jpeg",
        "alt": "Bob W Munich Old Town gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/fLBho0035QjSDULooAIZxWXqrKGjf05QMBP-L1WeF9U=.jpeg",
        "alt": "Bob W Munich Old Town gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/_Gh-TW4yqVxkCSOG-IUjR9GbkjVB9-YH_uGgE3uQ4sA=.jpeg",
        "alt": "Bob W Munich Old Town gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/bf640d3a",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8,
        "scale": 10,
        "reviewCount": 57,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/bf640d3a"
      }
    ]
  },
  "Best Western Hotel Arabellapark München": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/2f10df91",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 48.15072,
    "lng": 11.61958,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/KMfVcSiwyevTvDKxgRjiYZFSnm5f_oRnbBigeB_ji9M=.jpeg",
        "alt": "Best Western Hotel Arabellapark München property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bcRLWZcmIVcGlywfP_91kPIxFe60BqFIBt-FGy0BLOg=.webp",
        "alt": "Best Western Hotel Arabellapark München gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ce4DLVUO9-KZ_N6UQoAnfih_0bmoaNqc1bw12hWhgz8=.webp",
        "alt": "Best Western Hotel Arabellapark München gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9JuO3BWW6YjMcYndmhGes9NtEFjEvItbtac8Wc7F0a8=.webp",
        "alt": "Best Western Hotel Arabellapark München gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/I4PvVuZbRhsE-JQlnh47Zpor4yAm9_ztQkmeQ1Q_SgI=.webp",
        "alt": "Best Western Hotel Arabellapark München gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/1xCsS1ilEL-fgtR3LfJBOiPwitL0cDk5DfJALMYZHG4=.webp",
        "alt": "Best Western Hotel Arabellapark München gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/2f10df91",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.68,
        "scale": 10,
        "reviewCount": 1731,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/2f10df91"
      }
    ]
  }
};

const supplementalRecords: Record<string, HotelProviderMedia> = {
  "Stradom House, Autograph Collection": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/89273d3f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05297,
    "lng": 19.94065,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/stSv6LxNWR10qDtWUqvAZUTwbZ9x0MPRWKzfJr9Ufw8=.jpeg",
        "alt": "Stradom House, Autograph Collection property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/tfuZjtqsxgHHUuRhYb-BTSic5HePw7CjL3AsVUHQXLU=.jpeg",
        "alt": "Stradom House, Autograph Collection gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/I0VTUO8ncknXGCCNo6zrvq8cuEw9PQk4Z5u4E6IQHbs=.webp",
        "alt": "Stradom House, Autograph Collection gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/JO6dvhcJE8z1pERoCZILGnx09d2IZxLo9r0bkQQzHyU=.webp",
        "alt": "Stradom House, Autograph Collection gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kmNgsGTds4OZfNO-HZgVANbhXhbhu0OMsj4eUgeslB4=.webp",
        "alt": "Stradom House, Autograph Collection gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/hHoYnD3lH-xOBWDf8Vzz2AJQAjdOP0JBSQrBOyi8uhw=.webp",
        "alt": "Stradom House, Autograph Collection gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/89273d3f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.27,
        "scale": 10,
        "reviewCount": 427,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/89273d3f"
      }
    ]
  },
  "Vienna House by Wyndham Andel’s Krakow": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/02161601",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.06535,
    "lng": 19.94553,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/taL1X8_aSIPqGCC2fpCwnTayZ0Sf9CVL6L9PxQMr4OY=.webp",
        "alt": "Vienna House by Wyndham Andel’s Krakow property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/PLd6sJvAgG2WiAQWCJu8xr_M7t40S3ZEEXq_cB98QLg=.webp",
        "alt": "Vienna House by Wyndham Andel’s Krakow gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xo8SOel0Vbz8IPgK_JN6LbmjEmxV09fZd9Mv-37SV08=.webp",
        "alt": "Vienna House by Wyndham Andel’s Krakow gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Ce7f4hI5pxjyIjS5TCQSMkY6IOVwQFCJfwOSnFsXfuw=.webp",
        "alt": "Vienna House by Wyndham Andel’s Krakow gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/yVx4tgtgF7R4QRFJTMsMibu1WPbHIqHen1l7Z58HTZY=.webp",
        "alt": "Vienna House by Wyndham Andel’s Krakow gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/t7boWpdMKDarGdBqTVTKGdba8lTjwkc24GBeem9skaQ=.jpeg",
        "alt": "Vienna House by Wyndham Andel’s Krakow gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/02161601",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.2,
        "scale": 10,
        "reviewCount": 1580,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/02161601"
      }
    ]
  },
  "Bonerowska 5": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6ba06317",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.05911,
    "lng": 19.94656,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/UA8-X7j1RuomrJfSQF4IAHgNWtjRYIhLsFAew4xWOZ8=.jpeg",
        "alt": "Bonerowska 5 property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/IgUlPTPKFUTeNk6Nwf4V5jvOoKU2CuoDdlpzdV3D198=.jpeg",
        "alt": "Bonerowska 5 gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/DXLifLMge0C56sNstme_il43BP7tjrnqzFEULKqUDZ8=.jpeg",
        "alt": "Bonerowska 5 gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/pE92LiAuXLFb81VmAZqVzOtWBAPxPskKz08qQ5e1XIw=.jpeg",
        "alt": "Bonerowska 5 gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/YaHHMCqWVQ2edA2HS0_sU6l3Fn5zpRVyLD5vRYauVzo=.jpeg",
        "alt": "Bonerowska 5 gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/vl5YMsjmpvlhUTr4J0Ny83C7dJ501TKYKPrhJfVXy9c=.jpeg",
        "alt": "Bonerowska 5 gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6ba06317",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.3,
        "scale": 10,
        "reviewCount": 994,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6ba06317"
      }
    ]
  },
  "Die Port van Cleve": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6e01d49f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.37401,
    "lng": 4.89075,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/DSjDci_q1Q67eW6IVgN7RdCP9D-B8liyiiUO04sw8K4=.webp",
        "alt": "Die Port van Cleve property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/1cXEWKEW0GwcIA06HsJJdGJeqABq0tWgnvvkRIag0YU=.webp",
        "alt": "Die Port van Cleve gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/8VNeKRa1ssSyGgPfCVG9P4IaYaJSm4-2YN3e6yREkxI=.jpeg",
        "alt": "Die Port van Cleve gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/WAJTzEqyo1tHT8cEcV30QHPb-ewLJD100-qFq9tbLPY=.jpeg",
        "alt": "Die Port van Cleve gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/kGFqrRX3eeEkinRVSSpJUfxZG3vTtkFdXp1jcdZAcjk=.webp",
        "alt": "Die Port van Cleve gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=exp/TtCY-7KkIyy-gI-Gl3hVgM0BnI5A-y1L_vx7hQW7850=.webp",
        "alt": "Die Port van Cleve gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6e01d49f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.47,
        "scale": 10,
        "reviewCount": 1737,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6e01d49f"
      }
    ]
  },
  "Juliana Hotel Brussels": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/b6fcd9ad",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.85159,
    "lng": 4.35572,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Cbfxk8V5vNyv_vXWN-Mj1MDKphj7NtIVk-tQ3gp8Qk8=.webp",
        "alt": "Juliana Hotel Brussels property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/fPjCyE_JSWSCQxxrVZoDNM0ywXmBzhohTqkrLjT0Kj8=.jpeg",
        "alt": "Juliana Hotel Brussels gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/DVog__e2bCc7xZrUW7kY6RU9mkdeI6MmsoXEbVivwM4=.webp",
        "alt": "Juliana Hotel Brussels gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/3QUvHHetitfJi4gK4EvJE0pQOOc6bGH7sKJ-SMayYtY=.webp",
        "alt": "Juliana Hotel Brussels gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/do069BEcx1xt1XdJGRp5jbrgSvlieelVfCJ3qy3NCTI=.webp",
        "alt": "Juliana Hotel Brussels gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/4eWaCfRoYJiPZ8zQTYuvzeoEJ0vPSCNQJX9Z5JaGT_4=.webp",
        "alt": "Juliana Hotel Brussels gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.7,
        "scale": 10,
        "reviewCount": 164,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/b6fcd9ad"
      }
    ]
  },
  "Novotel Brussels Off Grand Place": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/328d631d",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.8463,
    "lng": 4.35498,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6Xn1cfAKP_2xYb1-G8TrZyCC3sFUnND1gnYQz5-Ye3c=.webp",
        "alt": "Novotel Brussels Off Grand Place property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/BqlWp_Xx6wlAsB5wEyM8g-QhPdXGjvCcd_6zmpy6Kv8=.webp",
        "alt": "Novotel Brussels Off Grand Place gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/6P-sTFFu4uzMFg5Hgy75UK1szgXTV8-mp7oggIow6mI=.webp",
        "alt": "Novotel Brussels Off Grand Place gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/87XcsPJy_Y7jyVvwln-QddqSVpqB9TR6PIfQcc2HBnU=.webp",
        "alt": "Novotel Brussels Off Grand Place gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/kOKYwalsOqPGoMAyqhx7HJWgedz6Di7aZn2Anya8s9s=.webp",
        "alt": "Novotel Brussels Off Grand Place gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Qdy9uivOXM6IxHV9prrJ-3VpqgGgEhWIjDrH85-br3w=.jpeg",
        "alt": "Novotel Brussels Off Grand Place gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/328d631d",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.5,
        "scale": 10,
        "reviewCount": 2214,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/328d631d"
      }
    ]
  },
  "ibis Brussels off Grand Place": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/c410ea30",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 50.84675,
    "lng": 4.35527,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/PXdowrWMf0JKwPLFlE0Efq_DrJ5tBxaQRFGFfZRz1Jw=.webp",
        "alt": "ibis Brussels off Grand Place property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/nIfkmIqpLZhhAPa4QRRm0rRl-T-oDdibCxW8DcpA794=.webp",
        "alt": "ibis Brussels off Grand Place gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ZEr07Jrofse-ZZu9XHoCt9m37bUUQIN7Dfybmx1GfHw=.webp",
        "alt": "ibis Brussels off Grand Place gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/FKhFugQGW0OHxJvVcHTAzrN-P8dKCM4755aOaNRMS4Q=.webp",
        "alt": "ibis Brussels off Grand Place gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/d_JfPly0htazYjpUdsjn8yUIUAUBXLhXXE5j9VFxL_Y=.webp",
        "alt": "ibis Brussels off Grand Place gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cqys3xRddX6LsW4zgroeUx-98SKXhSE6r_wTgCV2hYs=.webp",
        "alt": "ibis Brussels off Grand Place gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/c410ea30",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.53,
        "scale": 10,
        "reviewCount": 3925,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/c410ea30"
      }
    ]
  },
  "Hotel Anna 1908": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/85109483",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.46544,
    "lng": 13.32607,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/fJAGj27EgfCwYlm63HxcfzeUL0P7ur4tqQ8vi_oPCb8=.jpeg",
        "alt": "Hotel Anna 1908 property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/i3gSNfbv3d9ZjakI9TnvIoeKrOzAE_LQO0aZ9fGRhPE=.jpeg",
        "alt": "Hotel Anna 1908 gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/cqpo0q3BH7pIlrP20n1G584nMaQO7-frTuysfcs0Z3M=.jpeg",
        "alt": "Hotel Anna 1908 gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/SRzYJ81yngOYISa-7dRYb3wX3TxS8AcmQ6y6DUwe1cw=.jpeg",
        "alt": "Hotel Anna 1908 gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/8XCgnJDTp97p5uvTR5aN_BavsCXroVCrotcuM-MyxO4=.jpeg",
        "alt": "Hotel Anna 1908 gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=agd/0W9HT63iklomZY5W8euncKlJtV2xY28rEjk1tQV0-Pk=.jpeg",
        "alt": "Hotel Anna 1908 gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/85109483",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.67,
        "scale": 10,
        "reviewCount": 1463,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/85109483"
      }
    ]
  },
  "Hotel Riu Plaza Berlin": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/6f32c57f",
    "checkedAt": "2026-09-15",
    "description": "",
    "lat": 52.50029,
    "lng": 13.34675,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/bHsi0wxiL-BB867dUA0fxK6QQs91VCgH_NH36MMPbZs=.webp",
        "alt": "Hotel Riu Plaza Berlin property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/ePo3MQR1ube6Vwdegh9zevfqysuqU8wdpTvguD8bwR8=.webp",
        "alt": "Hotel Riu Plaza Berlin gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/cKcNltvwbB4RGX7nv80IhA-pic84ohDeDfwVjlJukCU=.webp",
        "alt": "Hotel Riu Plaza Berlin gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/9GsE4Fh4_n_KkkQ9M__gQbXV6PEwtPBDbXJouumbAbI=.jpeg",
        "alt": "Hotel Riu Plaza Berlin gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/HLNa3qPzSF1bqEn8GvbvQBBEHv4wVF-NDawgiBbd_-k=.jpeg",
        "alt": "Hotel Riu Plaza Berlin gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/Q-THuNV8VLbWzHQoO6iBOr3Q3QQKz8AsiaGRa92Ucrs=.jpeg",
        "alt": "Hotel Riu Plaza Berlin gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/6f32c57f",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 8.55,
        "scale": 10,
        "reviewCount": 15829,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/6f32c57f"
      }
    ]
  },
  "The Charles Hotel, a Rocco Forte Hotel": {
    "providerName": "Vio.com",
    "providerUrl": "https://vio.com/m/s/4d7eca1a",
    "checkedAt": "2026-09-15",
    "description": "Luxury hotel in Munich with a full-service spa, indoor pool, and Mediterranean dining options.",
    "lat": 48.14276,
    "lng": 11.56261,
    "photos": [
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/vxWazNTTgn-wEMcVHCKzxuA33aKo9cRsA0Q2VaAjpQY=.webp",
        "alt": "The Charles Hotel, a Rocco Forte Hotel property photo 1",
        "kind": "exterior",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/_viISo3FmyOBia8Ac9TcQ_StNgksCQhd-TGQIJSUC5I=.webp",
        "alt": "The Charles Hotel, a Rocco Forte Hotel gallery photo 2",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/plpBo06Y1xsj2EI4CxrMFCOqhw4vhUkVuA1qeqIqO3M=.webp",
        "alt": "The Charles Hotel, a Rocco Forte Hotel gallery photo 3",
        "kind": "room",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/u9ZOaGjvmJVdnTAcYhxEk6IwHCPlOJ_CffnybDqH2js=.webp",
        "alt": "The Charles Hotel, a Rocco Forte Hotel gallery photo 4",
        "kind": "lobby",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/oqfiFg5bYYpavW6fZayY2jTlspIh5FSOqcKRHQW5_WI=.jpeg",
        "alt": "The Charles Hotel, a Rocco Forte Hotel gallery photo 5",
        "kind": "amenity",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      },
      {
        "src": "https://img.fih.io/image/raw/regular/provider_partition=eps/xzfv16R8WPexcF28LJO1Q_5gvCh3ARceWwK5xEY8kVE=.webp",
        "alt": "The Charles Hotel, a Rocco Forte Hotel gallery photo 6",
        "kind": "dining",
        "source": "Vio.com",
        "credit": "Property gallery via Vio",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a",
        "verified": true
      }
    ],
    "ratings": [
      {
        "provider": "Vio.com",
        "score": 9.17,
        "scale": 10,
        "reviewCount": 920,
        "checkedAt": "2026-09-15",
        "sourceUrl": "https://vio.com/m/s/4d7eca1a"
      }
    ]
  }
};


export function hotelProviderMediaFor(name: string): HotelProviderMedia | undefined {
  return supplementalRecords[name] || records[name];
}

export const hotelProviderMediaCoverage = {
  "total": 176,
  "propertySpecific": 176,
  "generatedAt": "2026-09-15"
} as const;
