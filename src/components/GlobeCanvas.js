"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";

// Simple geocoding lookup for common destinations
const GEO_CACHE = {
  "paris": [48.86, 2.35], "london": [51.51, -0.13], "tokyo": [35.68, 139.65],
  "new york": [40.71, -74.01], "rome": [41.90, 12.50], "bangkok": [13.76, 100.50],
  "sydney": [-33.87, 151.21], "istanbul": [41.01, 28.98], "dubai": [25.20, 55.27],
  "barcelona": [41.39, 2.17], "amsterdam": [52.37, 4.90], "singapore": [1.35, 103.82],
  "berlin": [52.52, 13.41], "prague": [50.08, 14.44], "vienna": [48.21, 16.37],
  "lisbon": [38.72, -9.14], "athens": [37.98, 23.73], "cairo": [30.04, 31.24],
  "mexico city": [19.43, -99.13], "buenos aires": [-34.60, -58.38],
  "rio de janeiro": [-22.91, -43.17], "cape town": [-33.93, 18.42],
  "marrakech": [31.63, -8.01], "reykjavik": [64.15, -21.94],
  "machu picchu": [-13.16, -72.55], "bali": [-8.34, 115.09],
  "santorini": [36.39, 25.46], "kyoto": [35.01, 135.77],
  "fiji": [-17.78, 177.95], "maldives": [3.20, 73.22],
  "hawaii": [21.31, -157.86], "cancun": [21.16, -86.85],
  "seattle": [47.61, -122.33], "los angeles": [34.05, -118.24],
  "san francisco": [37.77, -122.42], "chicago": [41.88, -87.63],
  "miami": [25.76, -80.19], "denver": [39.74, -104.99],
  "nairobi": [-1.29, 36.82], "johannesburg": [-26.20, 28.05],
  "mumbai": [19.08, 72.88], "delhi": [28.61, 77.21],
  "beijing": [39.90, 116.41], "shanghai": [31.23, 121.47],
  "hong kong": [22.32, 114.17], "seoul": [37.57, 126.98],
  "taipei": [25.03, 121.57], "hanoi": [21.03, 105.85],
  "kuala lumpur": [3.14, 101.69], "manila": [14.60, 120.98],
  "auckland": [-36.85, 174.76], "queenstown": [-45.03, 168.66],
  "vancouver": [49.28, -123.12], "toronto": [43.65, -79.38],
  "montreal": [45.50, -73.57], "havana": [23.11, -82.37],
  "lima": [-12.05, -77.04], "bogota": [4.71, -74.07],
  "dominican republic": [18.74, -70.16], "punta cana": [18.58, -68.40],
  "jamaica": [18.11, -77.30], "costa rica": [9.93, -84.08],
  "olympic national park": [47.80, -123.60], "olympic peninsula": [47.80, -123.60],
  "iceland": [64.96, -19.02], "switzerland": [46.82, 8.23],
  "swiss alps": [46.56, 7.98], "amalfi coast": [40.63, 14.60],
  "dubrovnik": [42.65, 18.09], "patagonia": [-48.50, -72.50],
  "petra": [30.33, 35.44], "angkor wat": [13.41, 103.87],
  "puerto vallarta": [20.65, -105.23], "portland": [45.52, -122.68],
  "madrid": [40.42, -3.70], "austin": [30.27, -97.74], "nashville": [36.16, -86.78],
  "new orleans": [29.95, -90.07], "boston": [42.36, -71.06], "washington dc": [38.91, -77.04],
  "san diego": [32.72, -117.16], "las vegas": [36.17, -115.14], "honolulu": [21.31, -157.86],
  "anchorage": [61.22, -149.90], "phoenix": [33.45, -112.07], "orlando": [28.54, -81.38],
  "savannah": [32.08, -81.09], "charleston": [32.78, -79.93],
  "edinburgh": [55.95, -3.19], "dublin": [53.35, -6.26],
  "florence": [43.77, 11.25], "venice": [45.44, 12.34], "milan": [45.46, 9.19],
  "nice": [43.71, 7.26], "lyon": [45.76, 4.84], "marseille": [43.30, 5.37],
  "seville": [37.39, -5.98], "granada": [37.18, -3.60], "malaga": [36.72, -4.42],
  "porto": [41.16, -8.63], "budapest": [47.50, 19.04], "krakow": [50.06, 19.94],
  "copenhagen": [55.68, 12.57], "stockholm": [59.33, 18.07], "oslo": [59.91, 10.75],
  "helsinki": [60.17, 24.94], "zurich": [47.38, 8.54], "geneva": [46.20, 6.14],
  "munich": [48.14, 11.58], "bruges": [51.21, 3.22], "brussels": [50.85, 4.35],
  "cartagena": [10.39, -75.51], "medellín": [6.25, -75.56], "medellin": [6.25, -75.56],
  "cusco": [-13.52, -71.97], "playa del carmen": [20.63, -87.08],
  "tulum": [20.21, -87.43], "oaxaca": [17.07, -96.73], "guadalajara": [20.67, -103.35],
  "cabo san lucas": [22.89, -109.91], "cabo": [22.89, -109.91],
  "santo domingo": [18.47, -69.90], "bordeaux": [44.84, -0.58],
  "lyon": [45.76, 4.84], "toulouse": [43.60, 1.44], "strasbourg": [48.57, 7.75],
  "naples": [40.85, 14.27], "palermo": [38.12, 13.36], "salzburg": [47.80, 13.04],
  "tallinn": [59.44, 24.75], "riga": [56.95, 24.11], "vilnius": [54.69, 25.28],
  "split": [43.51, 16.44], "zagreb": [45.81, 15.98], "belgrade": [44.79, 20.47],
  "bucharest": [44.43, 26.10], "sofia": [42.70, 23.32], "tbilisi": [41.72, 44.79],
  "san juan": [18.47, -66.11], "kingston": [18.00, -76.79],
  "nassau": [25.05, -77.34], "bridgetown": [13.10, -59.61],
  "bermuda": [32.30, -64.78], "aruba": [12.51, -69.97],
  "antigua": [17.12, -61.85], "st lucia": [13.91, -60.98],
  "turks and caicos": [21.69, -71.80],
  "chiang mai": [18.79, 98.98], "ho chi minh": [10.82, 106.63], "saigon": [10.82, 106.63],
  "phnom penh": [11.56, 104.92], "luang prabang": [19.89, 102.13],
  "kathmandu": [27.72, 85.32], "jaipur": [26.92, 75.79], "goa": [15.50, 73.83],
  "colombo": [6.93, 79.85], "uluru": [-25.34, 131.04], "tasmania": [-42.05, 146.60],
};

// Persistent localStorage caches — survive page refreshes
const STORAGE_KEY = "tripcraft_geocache";
const COUNTRY_CACHE_KEY = "tripcraft_countrycache";

function loadPersistedCache() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch { return {}; }
}

function saveToPersistedCache(key, coords) {
  try {
    const cache = loadPersistedCache();
    cache[key] = coords;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {}
}

// Try: 1) hardcoded cache → 2) localStorage → 3) Nominatim API
async function geocode(destination) {
  if (!destination) return null;
  const lower = destination.toLowerCase().trim();

  // 1. Check hardcoded cache (instant)
  if (GEO_CACHE[lower]) return GEO_CACHE[lower];
  for (const [key, coords] of Object.entries(GEO_CACHE)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }

  // 2. Check persisted localStorage cache
  const persisted = loadPersistedCache();
  if (persisted[lower] !== undefined) {
    if (persisted[lower]) GEO_CACHE[lower] = persisted[lower];
    return persisted[lower];
  }

  // 3. Call Nominatim (free, no API key, max 1 req/sec)
  try {
    const now = Date.now();
    if (geocode._lastCall && now - geocode._lastCall < 1100) {
      await new Promise((r) => setTimeout(r, 1100 - (now - geocode._lastCall)));
    }
    geocode._lastCall = Date.now();

    const query = encodeURIComponent(destination);
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`,
      { headers: { "User-Agent": "TripCraft/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.length > 0) {
        const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
        GEO_CACHE[lower] = coords;
        saveToPersistedCache(lower, coords);
        console.log(`[Globe] Geocoded "${destination}" → [${coords}] (saved to cache)`);
        return coords;
      }
    }
  } catch (err) {
    console.warn(`[Globe] Nominatim lookup failed for "${destination}":`, err.message);
  }

  // 4. Nothing found — save null so we don't retry
  saveToPersistedCache(lower, null);
  console.warn(`[Globe] No coordinates found for "${destination}"`);
  return null;
}

// Reverse geocode: [lat, lng] → country name, cached in localStorage
async function reverseGeocodeCountry(lat, lng, destination) {
  const key = `${lat.toFixed(2)},${lng.toFixed(2)}`;

  // 1. Check localStorage cache
  try {
    const stored = localStorage.getItem(COUNTRY_CACHE_KEY);
    const cache = stored ? JSON.parse(stored) : {};
    if (cache[key]) return cache[key];
  } catch {}

  // 2. Call Nominatim reverse geocoding
  try {
    const now = Date.now();
    if (reverseGeocodeCountry._lastCall && now - reverseGeocodeCountry._lastCall < 1100) {
      await new Promise((r) => setTimeout(r, 1100 - (now - reverseGeocodeCountry._lastCall)));
    }
    reverseGeocodeCountry._lastCall = Date.now();

    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=3`,
      { headers: { "User-Agent": "TripCraft/1.0" } }
    );
    if (res.ok) {
      const data = await res.json();
      const country = data?.address?.country;
      if (country) {
        // Save to localStorage
        try {
          const stored = localStorage.getItem(COUNTRY_CACHE_KEY);
          const cache = stored ? JSON.parse(stored) : {};
          cache[key] = country;
          localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(cache));
        } catch {}
        console.log(`[Globe] Country for "${destination}" → ${country}`);
        return country;
      }
    }
  } catch (err) {
    console.warn(`[Globe] Reverse geocode failed for [${lat}, ${lng}]:`, err.message);
  }

  return null;
}

// Airport IATA code → [lat, lng] for common airports
const AIRPORT_CACHE = {
  "SEA": [47.45, -122.31], "PDX": [45.59, -122.60], "LAX": [33.94, -118.41],
  "SFO": [37.62, -122.38], "JFK": [40.64, -73.78], "EWR": [40.69, -74.17],
  "LGA": [40.77, -73.87], "ORD": [41.97, -87.91], "ATL": [33.64, -84.43],
  "DFW": [32.90, -97.04], "DEN": [39.86, -104.67], "MIA": [25.80, -80.29],
  "BOS": [42.37, -71.02], "IAD": [38.95, -77.46], "DCA": [38.85, -77.04],
  "PHX": [33.43, -112.01], "LAS": [36.08, -115.15], "MCO": [28.43, -81.31],
  "MSP": [44.88, -93.22], "DTW": [42.21, -83.35], "CLT": [35.21, -80.94],
  "SAN": [32.73, -117.19], "HNL": [21.32, -157.92], "ANC": [61.17, -150.00],
  "AUS": [30.19, -97.67], "BNA": [36.12, -86.68], "MSY": [29.99, -90.26],
  "SLC": [40.79, -111.98], "IAH": [29.98, -95.34], "TPA": [27.98, -82.53],
  "PHL": [39.87, -75.24], "BWI": [39.18, -76.67], "RDU": [35.88, -78.79],
  "CHS": [32.90, -80.04], "SAV": [32.13, -81.20],
  "LHR": [51.47, -0.46], "CDG": [49.01, 2.55], "FCO": [41.80, 12.24],
  "BCN": [41.30, 2.08], "MAD": [40.47, -3.57], "AMS": [52.31, 4.77],
  "FRA": [50.03, 8.57], "MUC": [48.35, 11.79], "ZRH": [47.46, 8.55],
  "LIS": [38.77, -9.13], "ATH": [37.94, 23.94], "IST": [41.26, 28.74],
  "DUB": [53.42, -6.27], "EDI": [55.95, -3.37], "CPH": [55.62, 12.66],
  "ARN": [59.65, 17.94], "OSL": [60.19, 11.10], "HEL": [60.32, 24.97],
  "VCE": [45.50, 12.35], "MXP": [45.63, 8.72], "NCE": [43.66, 7.22],
  "BRU": [50.90, 4.48], "VIE": [48.11, 16.57], "PRG": [50.10, 14.26],
  "BUD": [47.44, 19.26], "WAW": [52.17, 20.97], "KRK": [50.08, 19.78],
  "NRT": [35.76, 140.39], "HND": [35.55, 139.78], "KIX": [34.43, 135.23],
  "ICN": [37.46, 126.44], "PEK": [40.08, 116.58], "PVG": [31.14, 121.81],
  "HKG": [22.31, 113.91], "TPE": [25.08, 121.23], "SIN": [1.36, 103.99],
  "BKK": [13.69, 100.75], "HAN": [21.22, 105.81], "KUL": [2.75, 101.71],
  "MNL": [14.51, 121.02], "DXB": [25.25, 55.36], "DOH": [25.26, 51.61],
  "CAI": [30.12, 31.41], "JNB": [26.14, 28.25], "CPT": [-33.97, 18.60],
  "NBO": [-1.32, 36.93], "DEL": [28.56, 77.10], "BOM": [19.09, 72.87],
  "SYD": [-33.95, 151.18], "MEL": [-37.67, 144.84], "AKL": [-37.01, 174.78],
  "ZQN": [-45.02, 168.74],
  "MEX": [19.44, -99.07], "CUN": [21.04, -86.87], "PVR": [20.68, -105.25],
  "GDL": [20.52, -103.31], "SJO": [9.99, -84.21], "PTY": [9.07, -79.38],
  "BOG": [4.70, -74.15], "CTG": [10.44, -75.51], "MDE": [6.16, -75.43],
  "LIM": [-12.02, -77.11], "CUZ": [-13.54, -71.94], "EZE": [-34.82, -58.54],
  "GIG": [-22.81, -43.25], "GRU": [-23.43, -46.47],
  "SDQ": [18.43, -69.67], "PUJ": [18.57, -68.36], "SJU": [18.44, -66.00],
  "KIN": [17.94, -76.79], "NAS": [25.04, -77.47], "HAV": [22.99, -82.41],
  "BGI": [13.07, -59.49], "AUA": [12.50, -70.02],
  "KEF": [63.99, -22.62], "BOD": [44.83, -0.72],
  "DBV": [42.56, 18.27], "SPU": [43.54, 16.30],
};

const AIRPORT_CACHE_KEY = "tripcraft_airport_geocache";

async function geocodeAirport(code) {
  if (!code || code.length !== 3) return null;
  const upper = code.toUpperCase();

  // 1. Check hardcoded cache
  if (AIRPORT_CACHE[upper]) return AIRPORT_CACHE[upper];

  // 2. Check localStorage
  try {
    const stored = JSON.parse(localStorage.getItem(AIRPORT_CACHE_KEY) || "{}");
    if (stored[upper]) return stored[upper];
  } catch {}

  // 3. Query Nominatim for "<CODE> airport"
  try {
    await new Promise((r) => setTimeout(r, 1100)); // rate limit
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${upper}+airport&format=json&limit=1`,
      { headers: { "User-Agent": "TripCraft/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const coords = [parseFloat(data[0].lat), parseFloat(data[0].lon)];
      // Save to localStorage
      try {
        const stored = JSON.parse(localStorage.getItem(AIRPORT_CACHE_KEY) || "{}");
        stored[upper] = coords;
        localStorage.setItem(AIRPORT_CACHE_KEY, JSON.stringify(stored));
      } catch {}
      return coords;
    }
  } catch (err) {
    console.warn(`[Globe] Airport geocode failed for ${upper}:`, err.message);
  }
  return null;
}

export default function GlobeCanvas({ trips = [], flightLegs = [], interactive = true }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const threeLoadedRef = useRef(false);
  const tripsRef = useRef(trips);
  tripsRef.current = trips;
  const flightLegsRef = useRef(flightLegs);
  flightLegsRef.current = flightLegs;
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;
  const [countriesVisited, setCountriesVisited] = useState([]);
  const [showCountryList, setShowCountryList] = useState(false);
  const [showFlightPaths, setShowFlightPaths] = useState(true);
  const showFlightPathsRef = useRef(true);

  // Build unique countries list for "traveled" trips using reverse geocoding
  useEffect(() => {
    async function buildCountryList() {
      const traveled = trips.filter((t) => t.status === "traveled" && t.destination);
      if (traveled.length === 0) { setCountriesVisited([]); return; }

      // Map: country name → earliest travel date
      const countryMap = {};
      for (const trip of traveled) {
        const coords = await geocode(trip.destination);
        if (coords) {
          const country = await reverseGeocodeCountry(coords[0], coords[1], trip.destination);
          if (country) {
            const tripDate = trip.start_date || trip.created_at;
            if (!countryMap[country] || (tripDate && tripDate < countryMap[country])) {
              countryMap[country] = tripDate;
            }
          }
        }
      }

      // Convert to sorted array
      const list = Object.entries(countryMap)
        .map(([name, date]) => ({ name, date }))
        .sort((a, b) => a.name.localeCompare(b.name));
      setCountriesVisited(list);
    }
    buildCountryList();
  }, [trips]);

  function handleThreeLoaded() {
    threeLoadedRef.current = true;
    initGlobe();
  }

  useEffect(() => {
    if (window.THREE) {
      threeLoadedRef.current = true;
      initGlobe();
    }
  }, []);

  // Re-add pins when trips or flight legs change
  useEffect(() => {
    if (globeRef.current) addPins();
  }, [trips, flightLegs]);

  // Toggle flight path arc visibility
  useEffect(() => {
    showFlightPathsRef.current = showFlightPaths;
    if (!globeRef.current) return;
    const { globe } = globeRef.current;
    globe.children.filter((c) => c._isArc).forEach((c) => { c.visible = showFlightPaths; });
  }, [showFlightPaths]);

  function initGlobe() {
    if (!threeLoadedRef.current || !containerRef.current || globeRef.current) return;

    const THREE = window.THREE;
    if (!THREE) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3;

    // Transparent background — no dark space
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Globe — custom posterized texture
    const globeGeom = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load("/globe posterized lores.png");
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0,
      specular: new THREE.Color(0x222222),
      shininess: 5,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Lights — warm, even lighting to show the texture faithfully
    const ambient = new THREE.AmbientLight(0xfff5e8, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff0e0, 0.6);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xe8dcc8, 0.3);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // Interaction — always bind listeners, gate on interactiveRef so drag works when view toggles
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0 };

    renderer.domElement.addEventListener("mousedown", (e) => {
      if (!interactiveRef.current) return;
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!interactiveRef.current || !isDragging) return;
      rotVel.x = (e.clientX - prevMouse.x) * 0.005;
      rotVel.y = (e.clientY - prevMouse.y) * 0.005;
      globe.rotation.y += rotVel.x;
      globe.rotation.x += rotVel.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener("mouseup", () => { isDragging = false; });
    renderer.domElement.addEventListener("mouseleave", () => { isDragging = false; });

    // Touch support for mobile / trackpad
    renderer.domElement.addEventListener("touchstart", (e) => {
      if (!interactiveRef.current || e.touches.length !== 1) return;
      isDragging = true;
      prevMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }, { passive: true });
    renderer.domElement.addEventListener("touchmove", (e) => {
      if (!interactiveRef.current || !isDragging || e.touches.length !== 1) return;
      const t = e.touches[0];
      rotVel.x = (t.clientX - prevMouse.x) * 0.005;
      rotVel.y = (t.clientY - prevMouse.y) * 0.005;
      globe.rotation.y += rotVel.x;
      globe.rotation.x += rotVel.y;
      prevMouse = { x: t.clientX, y: t.clientY };
    }, { passive: true });
    renderer.domElement.addEventListener("touchend", () => { isDragging = false; });

    renderer.domElement.addEventListener("wheel", (e) => {
      if (!interactiveRef.current) return;
      camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.002));
    });

    // Tooltip
    const tooltip = document.getElementById("globe-tooltip");
    let pins = [];

    if (tooltip) {
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      renderer.domElement.addEventListener("mousemove", (e) => {
        if (!interactiveRef.current) { tooltip.style.display = "none"; return; }
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const currentPins = globeRef.current?.pins || [];
        let found = false;
        for (const pin of currentPins) {
          const hits = raycaster.intersectObject(pin.hitbox || pin.mesh);
          if (hits.length > 0) {
            pin.label.visible = true;
            found = true;
            break;
          }
        }
        if (!found) {
          for (const pin of currentPins) { pin.label.visible = false; }
        }
      });
    }

    // Animation
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      if (!isDragging) {
        globe.rotation.y += 0.0002;
        rotVel.x *= 0.95;
        rotVel.y *= 0.95;
        globe.rotation.y += rotVel.x;
        globe.rotation.x += rotVel.y;
      }
      renderer.render(scene, camera);
    }
    animate();

    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    globeRef.current = { renderer, animId, globe, pins, THREE, onResize };

    // Add pins if trips already loaded
    if (tripsRef.current.length > 0) addPins();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeRef.current = null;
    };
  }

  async function addPins() {
    if (!globeRef.current) return;
    const { globe, THREE } = globeRef.current;
    const trips = tripsRef.current;

    function latLngToVec3(lat, lng, r) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    function makeTextLabel(text, dateStr) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const fontSize = 40;
      const dateSize = 26;
      const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
      const hasDate = !!dateStr;
      const pad = 14;

      ctx.font = `700 ${fontSize}px ${fontFamily}`;
      const nameW = ctx.measureText(text).width;
      let dateW = 0;
      if (hasDate) {
        ctx.font = `400 ${dateSize}px ${fontFamily}`;
        dateW = ctx.measureText(dateStr).width;
      }
      const w = Math.max(nameW, dateW) + pad * 2;
      const h = hasDate ? fontSize + dateSize + pad * 2 + 6 : fontSize + pad * 2;
      canvas.width = w;
      canvas.height = h;

      ctx.font = `700 ${fontSize}px ${fontFamily}`;
      ctx.shadowColor = "rgba(0,0,0,0.9)";
      ctx.shadowBlur = 6;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(text, w / 2, pad);

      if (hasDate) {
        ctx.font = `400 ${dateSize}px ${fontFamily}`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(dateStr, w / 2, pad + fontSize + 6);
      }
      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      const tex = new THREE.CanvasTexture(canvas);
      tex.needsUpdate = true;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide, depthWrite: false });
      const planeGeom = new THREE.PlaneGeometry(w / 1400, h / 1400);
      return new THREE.Mesh(planeGeom, mat);
    }

    function formatLabelDate(startStr) {
      if (!startStr) return "";
      const s = new Date(startStr + "T00:00:00");
      return s.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }

    // Match trip card status edge colors
    const STATUS_COLORS = {
      planning: 0x4a965a,  // green — matches rgba(74,150,90)
      traveled: 0x3c78b4,  // blue — matches rgba(60,120,180)
      wish: 0xd2aa32,      // gold — matches rgba(210,170,50)
    };

    // Clear old pins
    const oldPins = globeRef.current.pins || [];
    oldPins.forEach((p) => {
      globe.remove(p.mesh);
      if (p.hitbox) globe.remove(p.hitbox);
      if (p.ring) globe.remove(p.ring);
      globe.remove(p.label);
    });
    globe.children.filter((c) => c._isArc).forEach((c) => globe.remove(c));

    const pins = [];
    // Geocode all trips — sequential for API rate limits (Nominatim: 1 req/sec)
    // Cached/hardcoded lookups are instant, only API calls are slow
    const geocodeResults = [];
    for (const trip of trips) {
      geocodeResults.push(await geocode(trip.destination));
    }
    for (let ti = 0; ti < trips.length; ti++) {
      const trip = trips[ti];
      const coords = geocodeResults[ti];
      if (!coords) continue;

      const color = STATUS_COLORS[trip.status] || STATUS_COLORS.planning;
      const pos = latLngToVec3(coords[0], coords[1], 1.005);

      const pinGeom = new THREE.SphereGeometry(0.012, 12, 12);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      globe.add(pin);

      // Invisible larger hitbox for easier hover detection
      const hitGeom = new THREE.SphereGeometry(0.04, 8, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitbox = new THREE.Mesh(hitGeom, hitMat);
      hitbox.position.copy(pos);
      globe.add(hitbox);

      const labelText = trip.destination || trip.title || "Trip";
      const dateStr = formatLabelDate(trip.start_date);
      const label = makeTextLabel(labelText, dateStr);
      const labelPos = latLngToVec3(coords[0], coords[1], 1.02);
      label.position.copy(labelPos);
      label.lookAt(labelPos.clone().multiplyScalar(2));
      label.visible = false; // hidden by default — shown on hover
      globe.add(label);

      pins.push({ mesh: pin, hitbox, label, trip, coords, color });
    }

    // Flight path arcs from real flight legs data
    const legs = flightLegsRef.current || [];
    if (legs.length > 0) {
      // Deduplicate routes (same departure→arrival pair)
      const routeSet = new Set();
      const uniqueLegs = [];
      for (const leg of legs) {
        if (!leg.departure_airport || !leg.arrival_airport) continue;
        const key = `${leg.departure_airport}-${leg.arrival_airport}`;
        if (!routeSet.has(key)) {
          routeSet.add(key);
          uniqueLegs.push(leg);
        }
      }

      // Geocode all airports (sequential for rate limits)
      const airportCodes = new Set();
      uniqueLegs.forEach((l) => { airportCodes.add(l.departure_airport); airportCodes.add(l.arrival_airport); });
      const airportCoords = {};
      for (const code of airportCodes) {
        airportCoords[code] = await geocodeAirport(code);
      }

      // Draw arcs for each flight leg
      for (const leg of uniqueLegs) {
        const depCoords = airportCoords[leg.departure_airport];
        const arrCoords = airportCoords[leg.arrival_airport];
        if (!depCoords || !arrCoords) continue;

        const a = latLngToVec3(depCoords[0], depCoords[1], 1.0);
        const b = latLngToVec3(arrCoords[0], arrCoords[1], 1.0);
        // Arc height proportional to distance
        const dist = a.distanceTo(b);
        const arcHeight = 1.0 + Math.min(dist * 0.35, 0.4);
        const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(arcHeight);
        const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
        const curveGeom = new THREE.TubeGeometry(curve, 48, 0.003, 8, false);
        const curveMat = new THREE.MeshBasicMaterial({
          color: 0x3c78b4, transparent: true, opacity: 0.5,
        });
        const arcMesh = new THREE.Mesh(curveGeom, curveMat);
        arcMesh._isArc = true;
        arcMesh.visible = showFlightPathsRef.current;
        globe.add(arcMesh);
      }
    }

    globeRef.current.pins = pins;
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={handleThreeLoaded}
      />
      <div ref={containerRef} className="w-full h-full" style={{ pointerEvents: interactive ? "auto" : "none", cursor: interactive ? "grab" : "default" }} />

      {/* Countries visited counter + Status legend — bottom left */}
      {interactive && (
        <div className="fixed bottom-8 left-6 z-30 flex flex-col gap-3">
          {/* Countries visited — clickable */}
          <div className="relative">
            <div
              className="px-4 py-3 rounded-xl text-center cursor-pointer hover:brightness-110 transition-all"
              style={{
                background: "rgba(30, 22, 12, 0.75)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(212, 165, 116, 0.2)",
              }}
              onClick={() => setShowCountryList(!showCountryList)}
            >
              <div className="text-2xl font-bold text-white/90">
                {countriesVisited.length}
              </div>
              <div className="text-[10px] text-white/50 font-medium tracking-wide uppercase">Country Count</div>
            </div>

            {/* Country list panel */}
            {showCountryList && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowCountryList(false)} />
                <div
                  className="absolute bottom-full left-0 mb-2 z-40 rounded-xl"
                  style={{
                    background: "rgba(30, 22, 12, 0.75)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid rgba(212, 165, 116, 0.2)",
                    minWidth: "200px",
                  }}
                >
                  {countriesVisited.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-white/40">No traveled trips yet</div>
                  ) : (
                    <div className="py-2">
                      {countriesVisited.map((c) => (
                        <div key={c.name} className="flex items-center gap-2 px-3 py-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#3c78b4] flex-shrink-0">
                            <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-white/90 font-medium">{c.name}</span>
                          <span className="text-[10px] text-white/40 ml-auto whitespace-nowrap">
                            {c.date ? new Date(c.date + (c.date.includes("T") ? "" : "T00:00:00")).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : ""}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Flight paths toggle */}
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer select-none hover:brightness-110 transition-all"
            style={{
              background: "rgba(30, 22, 12, 0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(212, 165, 116, 0.2)",
            }}
            onClick={() => setShowFlightPaths(!showFlightPaths)}
          >
            <div
              className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0"
              style={{
                border: "1.5px solid rgba(212, 165, 116, 0.5)",
                background: showFlightPaths ? "rgba(60, 120, 180, 0.6)" : "transparent",
              }}
            >
              {showFlightPaths && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3 text-white">
                  <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className="text-xs text-white/80 font-medium">Flight Paths</span>
          </div>

          {/* Status legend */}
          <div
            className="flex flex-col gap-2 px-4 py-3 rounded-xl"
            style={{
              background: "rgba(30, 22, 12, 0.75)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(212, 165, 116, 0.2)",
            }}
          >
            {[
              { label: "Planning", color: "#4a965a" },
              { label: "Traveled", color: "#3c78b4" },
              { label: "Wish", color: "#d2aa32" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-white/80 font-medium">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
