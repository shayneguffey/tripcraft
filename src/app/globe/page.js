"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  "london": [51.51, -0.13], "edinburgh": [55.95, -3.19], "dublin": [53.35, -6.26],
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
};

// Map destinations to countries
const COUNTRY_MAP = {
  "paris": "France", "london": "United Kingdom", "tokyo": "Japan", "kyoto": "Japan",
  "new york": "United States", "rome": "Italy", "amalfi coast": "Italy",
  "bangkok": "Thailand", "sydney": "Australia", "istanbul": "Turkey",
  "dubai": "United Arab Emirates", "barcelona": "Spain", "amsterdam": "Netherlands",
  "singapore": "Singapore", "berlin": "Germany", "prague": "Czech Republic",
  "vienna": "Austria", "lisbon": "Portugal", "athens": "Greece", "santorini": "Greece",
  "cairo": "Egypt", "mexico city": "Mexico", "cancun": "Mexico",
  "buenos aires": "Argentina", "patagonia": "Argentina",
  "rio de janeiro": "Brazil", "cape town": "South Africa", "johannesburg": "South Africa",
  "marrakech": "Morocco", "reykjavik": "Iceland", "iceland": "Iceland",
  "machu picchu": "Peru", "lima": "Peru", "bali": "Indonesia",
  "fiji": "Fiji", "maldives": "Maldives", "hawaii": "United States",
  "seattle": "United States", "los angeles": "United States", "san francisco": "United States",
  "chicago": "United States", "miami": "United States", "denver": "United States",
  "nairobi": "Kenya", "mumbai": "India", "delhi": "India",
  "beijing": "China", "shanghai": "China", "hong kong": "China",
  "seoul": "South Korea", "taipei": "Taiwan", "hanoi": "Vietnam",
  "kuala lumpur": "Malaysia", "manila": "Philippines",
  "auckland": "New Zealand", "queenstown": "New Zealand",
  "vancouver": "Canada", "toronto": "Canada", "montreal": "Canada",
  "havana": "Cuba", "bogota": "Colombia",
  "dominican republic": "Dominican Republic", "punta cana": "Dominican Republic",
  "jamaica": "Jamaica", "costa rica": "Costa Rica",
  "olympic national park": "United States", "olympic peninsula": "United States",
  "switzerland": "Switzerland", "swiss alps": "Switzerland",
  "dubrovnik": "Croatia", "petra": "Jordan", "angkor wat": "Cambodia",
  "puerto vallarta": "Mexico", "portland": "United States", "madrid": "Spain",
  "austin": "United States", "nashville": "United States", "new orleans": "United States",
  "boston": "United States", "washington dc": "United States", "san diego": "United States",
  "las vegas": "United States", "honolulu": "United States", "anchorage": "United States",
  "phoenix": "United States", "orlando": "United States", "savannah": "United States",
  "charleston": "United States", "edinburgh": "United Kingdom", "dublin": "Ireland",
  "florence": "Italy", "venice": "Italy", "milan": "Italy",
  "nice": "France", "lyon": "France", "marseille": "France",
  "seville": "Spain", "granada": "Spain", "malaga": "Spain",
  "porto": "Portugal", "budapest": "Hungary", "krakow": "Poland",
  "copenhagen": "Denmark", "stockholm": "Sweden", "oslo": "Norway",
  "helsinki": "Finland", "zurich": "Switzerland", "geneva": "Switzerland",
  "munich": "Germany", "bruges": "Belgium", "brussels": "Belgium",
  "cartagena": "Colombia", "medellín": "Colombia", "medellin": "Colombia",
  "cusco": "Peru", "playa del carmen": "Mexico", "tulum": "Mexico",
  "oaxaca": "Mexico", "guadalajara": "Mexico", "cabo san lucas": "Mexico", "cabo": "Mexico",
};

function getCountry(destination) {
  if (!destination) return null;
  const lower = destination.toLowerCase().trim();
  if (COUNTRY_MAP[lower]) return COUNTRY_MAP[lower];
  for (const [key, country] of Object.entries(COUNTRY_MAP)) {
    if (lower.includes(key) || key.includes(lower)) return country;
  }
  return null;
}

function geocode(destination) {
  if (!destination) return null;
  const lower = destination.toLowerCase().trim();
  // Direct match
  if (GEO_CACHE[lower]) return GEO_CACHE[lower];
  // Partial match
  for (const [key, coords] of Object.entries(GEO_CACHE)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  return null;
}

export default function GlobePage() {
  const [user, setUser] = useState(null);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    loadTrips();
    // If Three.js was already loaded from a previous visit, set it immediately
    if (window.THREE) setThreeLoaded(true);
  }, []);

  async function loadTrips() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    // Parallel fetch: own trips + collaborator IDs at the same time
    const [ownResult, collabResult] = await Promise.all([
      supabase.from("trips").select("*").eq("user_id", user.id).eq("archived", false),
      supabase.from("trip_collaborators").select("trip_id")
        .eq("user_id", user.id).eq("status", "accepted"),
    ]);

    const ownTrips = ownResult.data || [];
    const collabs = collabResult.data || [];

    let collabTrips = [];
    if (collabs.length > 0) {
      const ids = collabs.map((c) => c.trip_id);
      const { data: shared } = await supabase
        .from("trips").select("*").in("id", ids).eq("archived", false);
      collabTrips = shared || [];
    }

    const allTrips = [...ownTrips, ...collabTrips];

    // Show trips immediately — don't wait for activity locations
    setTrips(allTrips);
    setLoading(false);

    // Then fetch activity locations in background for country count
    const traveledTrips = allTrips.filter((t) => t.status === "traveled");
    if (traveledTrips.length > 0) {
      const tIds = traveledTrips.map((t) => t.id);
      const { data: days } = await supabase
        .from("days").select("id, trip_id").in("trip_id", tIds);
      if (days && days.length > 0) {
        const dayIds = days.map((d) => d.id);
        const { data: activities } = await supabase
          .from("activities").select("location, day_id").in("day_id", dayIds);
        if (activities) {
          const dayToTrip = {};
          days.forEach((d) => { dayToTrip[d.id] = d.trip_id; });
          const tripActivityLocations = {};
          activities.forEach((a) => {
            if (a.location) {
              const tid = dayToTrip[a.day_id];
              if (!tripActivityLocations[tid]) tripActivityLocations[tid] = [];
              tripActivityLocations[tid].push(a.location);
            }
          });
          // Update trips with activity locations (triggers re-render for country count)
          setTrips((prev) => prev.map((t) => ({
            ...t, _activityLocations: tripActivityLocations[t.id] || t._activityLocations || [],
          })));
        }
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Initialize Three.js globe as soon as script loads (don't wait for trip data)
  useEffect(() => {
    if (!threeLoaded || !containerRef.current || globeRef.current) return;

    const THREE = window.THREE;
    if (!THREE) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Globe with vintage Earth texture
    const globeGeom = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    // Load earth texture — vintage tint via material color (no pixel processing)
    const earthTexture = textureLoader.load(
      "https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg"
    );
    const bumpTexture = textureLoader.load(
      "https://unpkg.com/three-globe@2.24.4/example/img/earth-topology.png"
    );
    // Material color multiplies with texture — warm parchment tone creates vintage look instantly
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.04,
      color: new THREE.Color(0xddc8a0),   // warm parchment tint
      emissive: new THREE.Color(0x1a0f05), // subtle warm self-glow
      specular: new THREE.Color(0x443322),
      shininess: 8,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Lights — warm amber tones for vintage feel
    const ambient = new THREE.AmbientLight(0xc9a87c, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffeedd, 0.9);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xaa8866, 0.25);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // Sparse warm-toned stars (like aged paper specks)
    const starsGeom = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 1200; i++) {
      starVerts.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    }
    starsGeom.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffe8cc, size: 0.015 });
    scene.add(new THREE.Points(starsGeom, starsMat));

    // Drag rotation
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVel = { x: 0, y: 0 };

    renderer.domElement.addEventListener("mousedown", (e) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      rotVel.x = (e.clientX - prevMouse.x) * 0.005;
      rotVel.y = (e.clientY - prevMouse.y) * 0.005;
      globe.rotation.y += rotVel.x;
      globe.rotation.x += rotVel.y;
      prevMouse = { x: e.clientX, y: e.clientY };
    });
    renderer.domElement.addEventListener("mouseup", () => { isDragging = false; });

    // Scroll zoom
    renderer.domElement.addEventListener("wheel", (e) => {
      camera.position.z = Math.max(1.5, Math.min(6, camera.position.z + e.deltaY * 0.002));
    });

    // Tooltip
    const tooltip = document.getElementById("globe-tooltip");
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pins = [];

    renderer.domElement.addEventListener("mousemove", (e) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      let found = false;
      for (const pin of pins) {
        const hits = raycaster.intersectObject(pin.mesh);
        if (hits.length > 0) {
          tooltip.style.display = "block";
          tooltip.style.left = e.clientX + 15 + "px";
          tooltip.style.top = e.clientY - 10 + "px";
          tooltip.innerHTML = `
            <div style="font-weight:700;font-size:15px;color:#d4a574;">${pin.trip.destination || "Unknown"}</div>
            <div style="opacity:0.7;margin-top:2px;">${pin.trip.title}</div>
            <div style="opacity:0.5;font-size:11px;margin-top:4px;font-style:italic;">${pin.trip.status || "planning"}</div>
          `;
          found = true;
          break;
        }
      }
      if (!found) tooltip.style.display = "none";
    });

    // Animation loop
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

    // Resize handler
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // Store scene objects so the trips effect can add pins later
    globeRef.current = { renderer, animId, globe, pins, THREE };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
      globeRef.current = null;
    };
  }, [threeLoaded]);

  // Add/update pins when trip data arrives (separate from globe init)
  useEffect(() => {
    if (!globeRef.current || trips.length === 0) return;
    const { globe, THREE } = globeRef.current;

    // Convert lat/lng to 3D position
    function latLngToVec3(lat, lng, r) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi),
        r * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Create surface-fixed text label (mesh plane, not sprite)
    function makeTextLabel(text, dateStr) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const fontSize = 28;
      const dateSize = 18;
      const hasDate = !!dateStr;
      const pad = 10;

      ctx.font = `700 ${fontSize}px Georgia, serif`;
      const nameW = ctx.measureText(text).width;
      let dateW = 0;
      if (hasDate) {
        ctx.font = `400 ${dateSize}px Georgia, serif`;
        dateW = ctx.measureText(dateStr).width;
      }
      const w = Math.max(nameW, dateW) + pad * 2;
      const h = hasDate ? fontSize + dateSize + pad * 2 + 4 : fontSize + pad * 2;
      canvas.width = w;
      canvas.height = h;

      ctx.font = `700 ${fontSize}px Georgia, serif`;
      ctx.shadowColor = "rgba(0,0,0,0.8)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 1;
      ctx.shadowOffsetY = 1;
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillText(text, w / 2, pad);

      if (hasDate) {
        ctx.font = `400 ${dateSize}px Georgia, serif`;
        ctx.fillStyle = "#ffffff";
        ctx.fillText(dateStr, w / 2, pad + fontSize + 4);
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

    const STATUS_COLORS = {
      planning: 0x6b4e00,  // deep saturated gold
      traveled: 0x002040,  // deep saturated blue
      wish: 0x004010,      // deep saturated green
    };

    // Clear old pins if re-rendering
    const oldPins = globeRef.current.pins || [];
    oldPins.forEach((p) => {
      globe.remove(p.mesh);
      if (p.ring) globe.remove(p.ring);
      globe.remove(p.label);
    });
    // Also clear old arcs
    globe.children.filter((c) => c._isArc).forEach((c) => globe.remove(c));

    const pins = [];
    for (const trip of trips) {
      const coords = geocode(trip.destination);
      if (!coords) continue;

      const color = STATUS_COLORS[trip.status] || STATUS_COLORS.planning;
      const pos = latLngToVec3(coords[0], coords[1], 1.005);

      const pinGeom = new THREE.SphereGeometry(0.008, 10, 10);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      globe.add(pin);

      const labelText = trip.destination || trip.title || "Trip";
      const dateStr = formatLabelDate(trip.start_date);
      const label = makeTextLabel(labelText, dateStr);
      const labelPos = latLngToVec3(coords[0], coords[1], 1.02);
      label.position.copy(labelPos);
      label.lookAt(labelPos.clone().multiplyScalar(2));
      globe.add(label);

      pins.push({ mesh: pin, label, trip, coords, color });
    }

    // Draw arcs between "traveled" trips
    const traveled = pins.filter((p) => p.trip.status === "traveled");
    for (let i = 0; i < traveled.length - 1; i++) {
      const a = latLngToVec3(traveled[i].coords[0], traveled[i].coords[1], 1.0);
      const b = latLngToVec3(traveled[i + 1].coords[0], traveled[i + 1].coords[1], 1.0);
      const mid = a.clone().add(b).multiplyScalar(0.5).normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const curveGeom = new THREE.TubeGeometry(curve, 32, 0.004, 8, false);
      const curveMat = new THREE.MeshBasicMaterial({
        color: 0x002040, transparent: true, opacity: 0.4,
      });
      const arcMesh = new THREE.Mesh(curveGeom, curveMat);
      arcMesh._isArc = true;
      globe.add(arcMesh);
    }

    globeRef.current.pins = pins;
  }, [trips]);

  // Compute stats
  const traveledCount = trips.filter((t) => t.status === "traveled").length;
  const planningCount = trips.filter((t) => t.status === "planning" || !t.status).length;
  const wishCount = trips.filter((t) => t.status === "wish").length;

  // Country count — from traveled trip destinations + their activity locations
  // Also include planning trips so the stat is visible even without "traveled" status
  const countriesSet = new Set();
  trips.forEach((t) => {
    if (t.status === "traveled" || t.status === "planning" || !t.status) {
      const c = getCountry(t.destination);
      if (c) countriesSet.add(c);
      // Also check activity locations within the trip
      if (t._activityLocations) {
        t._activityLocations.forEach((loc) => {
          const ac = getCountry(loc);
          if (ac) countriesSet.add(ac);
        });
      }
    }
  });
  const countryCount = countriesSet.size;

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => setThreeLoaded(true)}
      />
      <div className="min-h-screen relative" style={{ background: "#1a1408" }}>
        {/* Header bar */}
        <div className="absolute top-0 left-0 right-0 z-20 max-w-6xl mx-auto px-6 pt-6 pb-4 flex items-center justify-between">
          {/* View toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="w-8 h-8 rounded-lg bg-white/10 text-white/50 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 hover:text-white transition-colors"
              title="Card view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M2 2h5v5H2V2Zm7 0h5v5H9V2ZM2 9h5v5H2V9Zm7 0h5v5H9V9Z" />
              </svg>
            </Link>
            <Link
              href="/globe"
              className="w-8 h-8 rounded-lg flex items-center justify-center backdrop-blur-sm"
              style={{ background: "rgba(212,165,116,0.3)", color: "#d4a574" }}
              title="Globe view"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1ZM5.404 3.196a5.518 5.518 0 0 0-2.66 3.054H4.84c.1-1.14.345-2.175.715-3.032l-.15-.022Zm-2.66 4.554a5.518 5.518 0 0 0 2.66 3.054l.15-.022c-.37-.857-.615-1.892-.715-3.032H2.744ZM8 13.5c-.753 0-1.596-1.348-1.834-3.75h3.668C9.596 12.152 8.753 13.5 8 13.5Zm1.834-5.25H6.166C6.404 5.848 7.247 4.5 8 4.5s1.596 1.348 1.834 3.75Zm.762 5.054a5.518 5.518 0 0 0 2.66-3.054H11.16c-.1 1.14-.345 2.175-.715 3.032l.15.022Zm2.66-4.554a5.518 5.518 0 0 0-2.66-3.054l-.15.022c.37.857.615 1.892.715 3.032h2.096Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>

          {/* Title */}
          <div className="flex items-center gap-2">
            <span className="text-2xl">✈️</span>
            <span className="text-2xl font-bold text-white">TripCraft</span>
          </div>

          {/* Account */}
          <div className="relative">
            <button
              onClick={() => setShowAccount(!showAccount)}
              className="w-8 h-8 rounded-full bg-white/10 text-white/70 flex items-center justify-center backdrop-blur-sm hover:bg-white/20 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.255 1.139.872 1.139h9.47Z" />
              </svg>
            </button>
            {showAccount && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setShowAccount(false)} />
                <div className="absolute right-0 top-10 z-40 w-56 rounded-xl shadow-xl py-2 overflow-hidden" style={{ background: "rgba(30,22,12,0.95)", border: "1px solid rgba(212,165,116,0.2)" }}>
                  <div className="px-4 py-2" style={{ borderBottom: "1px solid rgba(212,165,116,0.15)" }}>
                    <p className="text-xs" style={{ color: "rgba(212,165,116,0.5)" }}>Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                  </div>
                  <Link href="/archived" className="block px-4 py-2.5 text-sm transition-colors" style={{ color: "rgba(212,165,116,0.7)" }} onClick={() => setShowAccount(false)}>
                    Archived Trips
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm transition-colors" style={{ color: "rgba(212,165,116,0.7)" }}>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-20 right-8 z-10 text-right">
          <div className="text-4xl font-bold" style={{ color: "#d4a574" }}>{countryCount}</div>
          <div className="text-[11px] uppercase tracking-widest" style={{ color: "rgba(212,165,116,0.5)" }}>Countries</div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-8 z-10 flex gap-4 text-sm" style={{ color: "rgba(212,165,116,0.7)" }}>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#002040" }}></div>
            <span>Traveled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#6b4e00" }}></div>
            <span>Planning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#004010" }}></div>
            <span>Wish List</span>
          </div>
        </div>

        {/* Globe subtitle */}
        <div className="absolute bottom-6 right-8 z-10 text-right">
          <p className="text-xs" style={{ color: "rgba(212,165,116,0.35)" }}>Drag to spin · Scroll to zoom</p>
        </div>

        {/* Tooltip */}
        <div
          id="globe-tooltip"
          className="fixed z-50 hidden pointer-events-none rounded-xl px-4 py-3 text-sm max-w-[200px]"
          style={{
            background: "rgba(30, 22, 12, 0.92)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(212, 165, 116, 0.3)",
          }}
        ></div>

        {/* Globe container */}
        <div ref={containerRef} className="w-full h-screen" />
      </div>
    </>
  );
}
