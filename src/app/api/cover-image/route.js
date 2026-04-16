/**
 * Cover Image API — fetches iconic travel photography from Unsplash.
 *
 * Uses a curated search-term map for well-known destinations so queries
 * target famous landmarks / signature views. Unknown destinations fall
 * back to a smarter generic query.
 */

// Curated search terms → iconic imagery per destination
const DESTINATION_QUERIES = {
  // Americas
  "cancun":              "Cancun turquoise beach Caribbean resort aerial",
  "new york":            "New York City skyline Manhattan aerial",
  "new york city":       "New York City skyline Manhattan aerial",
  "nyc":                 "New York City skyline Manhattan aerial",
  "paris":               "Eiffel Tower Paris cityscape golden hour",
  "portland":            "Portland Oregon aerial cityscape Mount Hood",
  "puerto vallarta":     "Puerto Vallarta beach Banderas Bay sunset",
  "los angeles":         "Los Angeles skyline Hollywood Griffith Observatory",
  "san francisco":       "Golden Gate Bridge San Francisco fog",
  "miami":               "Miami Beach South Beach skyline",
  "seattle":             "Seattle skyline Space Needle Mount Rainier",
  "chicago":             "Chicago skyline Lake Michigan aerial",
  "boston":               "Boston historic waterfront skyline",
  "washington dc":       "Washington DC monuments Capitol aerial",
  "las vegas":           "Las Vegas strip night lights aerial",
  "denver":              "Denver skyline Rocky Mountains sunset",
  "austin":              "Austin Texas skyline Congress Avenue",
  "nashville":           "Nashville skyline Broadway neon",
  "new orleans":         "New Orleans French Quarter architecture",
  "savannah":            "Savannah Georgia Forsyth Park Spanish moss",
  "charleston":          "Charleston South Carolina Rainbow Row waterfront",
  "orlando":             "Orlando Florida sunset skyline",
  "honolulu":            "Honolulu Waikiki Beach Diamond Head",
  "hawaii":              "Hawaii tropical beach volcanic coastline aerial",
  "anchorage":           "Anchorage Alaska mountains wilderness",
  "phoenix":             "Phoenix Arizona desert Camelback Mountain sunset",
  "san diego":           "San Diego Coronado Bridge coastline aerial",
  "mexico city":         "Mexico City Palacio Bellas Artes aerial",
  "cabo san lucas":      "Cabo San Lucas El Arco rock formation",
  "cabo":                "Cabo San Lucas El Arco beach aerial",
  "playa del carmen":    "Playa del Carmen beach Riviera Maya turquoise",
  "tulum":               "Tulum ruins beach Caribbean turquoise",
  "oaxaca":              "Oaxaca Mexico colorful architecture Monte Alban",
  "guadalajara":         "Guadalajara Mexico cathedral historic center",
  "toronto":             "Toronto skyline CN Tower aerial",
  "vancouver":           "Vancouver skyline mountains Stanley Park",
  "montreal":            "Montreal Old Port skyline autumn",
  "havana":              "Havana Cuba vintage cars colorful streets",
  "lima":                "Lima Peru Miraflores coastline aerial",
  "bogota":              "Bogota Colombia Monserrate aerial cityscape",
  "buenos aires":        "Buenos Aires La Boca colorful architecture",
  "rio de janeiro":      "Rio de Janeiro Christ Redeemer Sugarloaf aerial",
  "cartagena":           "Cartagena Colombia walled city colorful",
  "medellin":            "Medellin Colombia valley aerial cityscape",
  "medellín":            "Medellin Colombia valley aerial cityscape",
  "cusco":               "Cusco Peru Machu Picchu Andes",
  "machu picchu":        "Machu Picchu ruins Andes mountains sunrise",
  "patagonia":           "Patagonia Torres del Paine mountains glaciers",
  "costa rica":          "Costa Rica rainforest volcano tropical beach",
  "jamaica":             "Jamaica beach turquoise Caribbean tropical",
  "dominican republic":  "Dominican Republic Punta Cana beach palm trees",
  "punta cana":          "Punta Cana beach resort Caribbean aerial",

  // Europe
  "london":              "London Big Ben Tower Bridge Thames aerial",
  "rome":                "Rome Colosseum Vatican Italian cityscape",
  "barcelona":           "Barcelona Sagrada Familia Park Guell aerial",
  "madrid":              "Madrid Royal Palace Gran Via aerial",
  "amsterdam":           "Amsterdam canals houses bicycles golden hour",
  "berlin":              "Berlin Brandenburg Gate cityscape",
  "prague":              "Prague Charles Bridge Old Town aerial",
  "vienna":              "Vienna Schonbrunn Palace cityscape",
  "lisbon":              "Lisbon colorful tram Alfama aerial",
  "athens":              "Athens Acropolis Parthenon cityscape aerial",
  "istanbul":            "Istanbul Blue Mosque Hagia Sophia Bosphorus",
  "dublin":              "Dublin Ireland Temple Bar colorful",
  "edinburgh":           "Edinburgh Castle Royal Mile Scotland aerial",
  "florence":            "Florence Duomo Ponte Vecchio Tuscan aerial",
  "venice":              "Venice Grand Canal gondola aerial",
  "milan":               "Milan Duomo cathedral Italy aerial",
  "nice":                "Nice French Riviera Promenade des Anglais aerial",
  "marseille":           "Marseille Calanques Mediterranean coastline",
  "lyon":                "Lyon France Old Town Saone River",
  "seville":             "Seville Spain Plaza de Espana aerial",
  "granada":             "Granada Alhambra palace aerial",
  "malaga":              "Malaga Spain beach Mediterranean coastline",
  "porto":               "Porto Portugal Douro River colorful ribeira",
  "budapest":            "Budapest Parliament Danube Chain Bridge night",
  "krakow":              "Krakow Poland Wawel Castle Old Town",
  "copenhagen":          "Copenhagen Nyhavn colorful harbor",
  "stockholm":           "Stockholm Gamla Stan Old Town aerial",
  "oslo":                "Oslo Norway fjord opera house",
  "helsinki":            "Helsinki Finland cathedral harbor aerial",
  "zurich":              "Zurich Switzerland lake Alps cityscape",
  "geneva":              "Geneva Switzerland jet d'eau lake Alps",
  "munich":              "Munich Germany Marienplatz Frauenkirche",
  "bruges":              "Bruges Belgium medieval canals aerial",
  "brussels":            "Brussels Grand Place architecture",
  "dubrovnik":           "Dubrovnik Croatia old town walls aerial",
  "santorini":           "Santorini Greece blue domes white buildings sunset",
  "iceland":             "Iceland Northern Lights glacier waterfall",
  "reykjavik":           "Reykjavik Iceland colorful houses Hallgrimskirkja",
  "swiss alps":          "Swiss Alps Matterhorn snow mountains",
  "switzerland":         "Switzerland Alps lake village aerial",
  "amalfi coast":        "Amalfi Coast Italy Positano colorful cliffs",

  // Asia & Middle East
  "tokyo":               "Tokyo Japan skyline Shibuya neon night",
  "kyoto":               "Kyoto Japan Fushimi Inari torii gates",
  "bangkok":             "Bangkok Thailand temples Grand Palace aerial",
  "singapore":           "Singapore Marina Bay Sands skyline aerial",
  "dubai":               "Dubai Burj Khalifa skyline aerial sunset",
  "hong kong":           "Hong Kong skyline Victoria Peak night",
  "seoul":               "Seoul South Korea Gyeongbokgung Palace skyline",
  "taipei":              "Taipei 101 Taiwan skyline night",
  "bali":                "Bali Indonesia rice terraces temple tropical",
  "hanoi":               "Hanoi Vietnam Old Quarter Hoan Kiem Lake",
  "kuala lumpur":        "Kuala Lumpur Petronas Towers skyline",
  "manila":              "Manila Philippines skyline sunset",
  "beijing":             "Beijing Great Wall Forbidden City aerial",
  "shanghai":            "Shanghai Bund skyline Pudong night",
  "mumbai":              "Mumbai India Gateway aerial cityscape",
  "delhi":               "Delhi India Taj Mahal Red Fort",
  "petra":               "Petra Jordan Treasury ancient rock carved",
  "angkor wat":          "Angkor Wat Cambodia temple sunrise",
  "maldives":            "Maldives overwater bungalows turquoise aerial",

  // Africa & Oceania
  "cairo":               "Cairo Egypt pyramids Giza Sphinx",
  "marrakech":           "Marrakech Morocco medina Jemaa el-Fnaa",
  "cape town":           "Cape Town Table Mountain aerial coastline",
  "nairobi":             "Nairobi Kenya skyline safari wildlife",
  "johannesburg":        "Johannesburg South Africa skyline aerial",
  "sydney":              "Sydney Opera House Harbour Bridge aerial",
  "auckland":            "Auckland New Zealand Sky Tower harbour",
  "queenstown":          "Queenstown New Zealand lake mountains adventure",
  "fiji":                "Fiji tropical island turquoise beach aerial",

  // National Parks / Natural
  "olympic national park": "Olympic National Park Washington Hoh rainforest coast",
  "olympic peninsula":     "Olympic Peninsula Washington wilderness rugged coast",
};

function buildQuery(destination) {
  const lower = destination.toLowerCase().trim();

  // Exact match
  if (DESTINATION_QUERIES[lower]) return DESTINATION_QUERIES[lower];

  // Partial match — check if destination contains a known key or vice versa
  for (const [key, query] of Object.entries(DESTINATION_QUERIES)) {
    if (lower.includes(key) || key.includes(lower)) return query;
  }

  // Smart fallback for unknown destinations
  return `${destination} famous landmark skyline iconic travel photography`;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const destination = searchParams.get("destination");
    const count = parseInt(searchParams.get("count")) || 1;

    if (!destination) {
      return Response.json({ error: "Missing destination" }, { status: 400 });
    }

    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      return Response.json({ images: [], fallback: true });
    }

    const query = encodeURIComponent(buildQuery(destination));
    const perPage = Math.min(count, 10);
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${query}&per_page=${perPage}&orientation=landscape`,
      {
        headers: { Authorization: `Client-ID ${accessKey}` },
      }
    );

    if (!res.ok) {
      return Response.json({ images: [], fallback: true });
    }

    const data = await res.json();
    const images = (data.results || [])
      .map((photo) => photo.urls?.regular || photo.urls?.small)
      .filter(Boolean);

    if (images.length === 0) {
      return Response.json({ images: [], fallback: true });
    }

    return Response.json({
      images,
      imageUrl: images[0],
    });
  } catch (err) {
    console.error("Cover image error:", err);
    return Response.json({ images: [], fallback: true });
  }
}
