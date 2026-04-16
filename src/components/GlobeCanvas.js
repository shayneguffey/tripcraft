"use client";

import { useEffect, useRef } from "react";
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
};

function geocode(destination) {
  if (!destination) return null;
  const lower = destination.toLowerCase().trim();
  if (GEO_CACHE[lower]) return GEO_CACHE[lower];
  for (const [key, coords] of Object.entries(GEO_CACHE)) {
    if (lower.includes(key) || key.includes(lower)) return coords;
  }
  return null;
}

export default function GlobeCanvas({ trips = [], interactive = true }) {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const threeLoadedRef = useRef(false);
  const tripsRef = useRef(trips);
  tripsRef.current = trips;
  const interactiveRef = useRef(interactive);
  interactiveRef.current = interactive;

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

  // Re-add pins when trips change
  useEffect(() => {
    if (globeRef.current) addPins();
  }, [trips]);

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

    // Globe
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
      bumpScale: 0.04,
      color: new THREE.Color(0xd6c7ad),
      emissive: new THREE.Color(0x150d04),
      specular: new THREE.Color(0x3d3025),
      shininess: 8,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // Lights — desaturated 20% to match card view intensity
    const ambient = new THREE.AmbientLight(0xc2ab8c, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xf5e8d8, 0.9);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xa08f74, 0.25);
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

  function addPins() {
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
      planning: 0x6b4e00,
      traveled: 0x002040,
      wish: 0x004010,
    };

    // Clear old pins
    const oldPins = globeRef.current.pins || [];
    oldPins.forEach((p) => {
      globe.remove(p.mesh);
      if (p.ring) globe.remove(p.ring);
      globe.remove(p.label);
    });
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

    // Arcs between traveled trips
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
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        onLoad={handleThreeLoaded}
      />
      <div ref={containerRef} className="w-full h-full" style={{ pointerEvents: interactive ? "auto" : "none", cursor: interactive ? "grab" : "default" }} />
    </>
  );
}
