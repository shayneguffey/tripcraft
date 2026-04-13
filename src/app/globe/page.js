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
};

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
  }, []);

  async function loadTrips() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setUser(user);

    const { data: ownTrips } = await supabase
      .from("trips").select("*").eq("user_id", user.id)
      .eq("archived", false);

    const { data: collabs } = await supabase
      .from("trip_collaborators").select("trip_id")
      .eq("user_id", user.id).eq("status", "accepted");

    let collabTrips = [];
    if (collabs && collabs.length > 0) {
      const ids = collabs.map((c) => c.trip_id);
      const { data: shared } = await supabase
        .from("trips").select("*").in("id", ids).eq("archived", false);
      collabTrips = shared || [];
    }

    setTrips([...(ownTrips || []), ...collabTrips]);
    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  // Initialize Three.js globe once both data and script are loaded
  useEffect(() => {
    if (!threeLoaded || loading || !containerRef.current || globeRef.current) return;

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

    // Globe with Earth texture
    const globeGeom = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();
    const earthTexture = textureLoader.load(
      "https://unpkg.com/three-globe@2.24.4/example/img/earth-blue-marble.jpg"
    );
    const bumpTexture = textureLoader.load(
      "https://unpkg.com/three-globe@2.24.4/example/img/earth-topology.png"
    );
    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpMap: bumpTexture,
      bumpScale: 0.03,
      specular: new THREE.Color(0x333333),
      shininess: 15,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Atmosphere glow
    const glowGeom = new THREE.SphereGeometry(1.12, 64, 64);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4dc9f6,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(glowGeom, glowMat));

    // Lights — tuned for Earth texture visibility
    const ambient = new THREE.AmbientLight(0x888899, 0.8);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0x8899bb, 0.3);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // Stars
    const starsGeom = new THREE.BufferGeometry();
    const starVerts = [];
    for (let i = 0; i < 2000; i++) {
      starVerts.push((Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 40);
    }
    starsGeom.setAttribute("position", new THREE.Float32BufferAttribute(starVerts, 3));
    const starsMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.02 });
    scene.add(new THREE.Points(starsGeom, starsMat));

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

    // Status colors
    const STATUS_COLORS = {
      planning: 0xfbbf24,  // amber
      traveled: 0x38bdf8,  // sky blue
      wish: 0xf472b6,      // pink
    };

    // Add pins for trips
    const pins = [];
    for (const trip of trips) {
      const coords = geocode(trip.destination);
      if (!coords) continue;

      const color = STATUS_COLORS[trip.status] || STATUS_COLORS.planning;
      const pos = latLngToVec3(coords[0], coords[1], 1.02);

      // Pin sphere
      const pinGeom = new THREE.SphereGeometry(0.03, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color });
      const pin = new THREE.Mesh(pinGeom, pinMat);
      pin.position.copy(pos);
      globe.add(pin);

      // Glow ring
      const ringGeom = new THREE.RingGeometry(0.035, 0.055, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color, transparent: true, opacity: 0.4, side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      ring.lookAt(new THREE.Vector3(0, 0, 0));
      globe.add(ring);

      // Stalk
      const stalkPos = latLngToVec3(coords[0], coords[1], 1.0);
      const stalkGeom = new THREE.CylinderGeometry(0.003, 0.003, 0.02, 8);
      const stalkMat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.6 });
      const stalk = new THREE.Mesh(stalkGeom, stalkMat);
      stalk.position.copy(stalkPos.clone().lerp(pos, 0.5));
      stalk.lookAt(new THREE.Vector3(0, 0, 0));
      stalk.rotateX(Math.PI / 2);
      globe.add(stalk);

      pins.push({ mesh: pin, ring, trip, coords, color });
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
        color: 0x38bdf8, transparent: true, opacity: 0.35,
      });
      globe.add(new THREE.Mesh(curveGeom, curveMat));
    }

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
            <div style="font-weight:700;font-size:15px;color:#38bdf8;">${pin.trip.destination || "Unknown"}</div>
            <div style="opacity:0.7;margin-top:2px;">${pin.trip.title}</div>
            <div style="opacity:0.5;font-size:11px;margin-top:4px;">${pin.trip.status || "planning"}</div>
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
        globe.rotation.y += 0.002;
        rotVel.x *= 0.95;
        rotVel.y *= 0.95;
        globe.rotation.y += rotVel.x;
        globe.rotation.x += rotVel.y;
      }

      // Pin pulse
      const t = Date.now() * 0.003;
      pins.forEach((p, i) => {
        const s = 1 + Math.sin(t + i) * 0.15;
        p.ring.scale.set(s, s, s);
      });

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

    globeRef.current = { renderer, animId };

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", onResize);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [threeLoaded, loading, trips]);

  // Compute stats
  const traveledCount = trips.filter((t) => t.status === "traveled").length;
  const planningCount = trips.filter((t) => t.status === "planning" || !t.status).length;
  const wishCount = trips.filter((t) => t.status === "wish").length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "#0a0e27" }}>
        <div className="text-center">
          <div className="text-4xl mb-3 animate-bounce">🌍</div>
          <p className="text-slate-400">Loading your globe...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={() => setThreeLoaded(true)}
      />
      <div className="min-h-screen relative" style={{ background: "#0a0e27" }}>
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
              className="w-8 h-8 rounded-lg bg-sky-500/30 text-sky-300 flex items-center justify-center backdrop-blur-sm"
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
                <div className="absolute right-0 top-10 z-40 w-56 bg-slate-800 rounded-xl shadow-xl border border-slate-700 py-2 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-700">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm text-white font-medium truncate">{user?.email}</p>
                  </div>
                  <Link href="/archived" className="block px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors" onClick={() => setShowAccount(false)}>
                    Archived Trips
                  </Link>
                  <button onClick={handleSignOut} className="w-full text-left px-4 py-2.5 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats overlay */}
        <div className="absolute top-20 right-8 z-10 text-right">
          <div className="text-4xl font-bold text-sky-400">{traveledCount}</div>
          <div className="text-[11px] text-white/40 uppercase tracking-widest">Traveled</div>
          <div className="text-2xl font-bold text-amber-400 mt-3">{planningCount}</div>
          <div className="text-[11px] text-white/40 uppercase tracking-widest">Planning</div>
          {wishCount > 0 && (
            <>
              <div className="text-2xl font-bold text-pink-400 mt-3">{wishCount}</div>
              <div className="text-[11px] text-white/40 uppercase tracking-widest">Wish List</div>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-8 z-10 flex gap-4 text-sm text-white/70">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-sky-400"></div>
            <span>Traveled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
            <span>Planning</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
            <span>Wish List</span>
          </div>
        </div>

        {/* Globe subtitle */}
        <div className="absolute bottom-6 right-8 z-10 text-right">
          <p className="text-xs text-white/30">Drag to spin · Scroll to zoom</p>
        </div>

        {/* Tooltip */}
        <div
          id="globe-tooltip"
          className="fixed z-50 hidden pointer-events-none rounded-xl px-4 py-3 text-sm max-w-[200px]"
          style={{
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(56, 189, 248, 0.3)",
          }}
        ></div>

        {/* Globe container */}
        <div ref={containerRef} className="w-full h-screen" />
      </div>
    </>
  );
}
