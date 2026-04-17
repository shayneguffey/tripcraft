"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * HomeGlobeAnimated — decorative auto-rotating globe with two animated
 * flight paths tracing solid red trails between world destinations.
 * Experimental — does NOT replace HomeGlobe.
 */

// ─── Flight path 1: East Asia / Oceania loop ─────────────────
const PATH_1 = [
  { name: "Tokyo",       lat: 35.68,  lng: 139.65 },
  { name: "Seoul",       lat: 37.57,  lng: 126.98 },
  { name: "Shanghai",    lat: 31.23,  lng: 121.47 },
  { name: "Hong Kong",   lat: 22.32,  lng: 114.17 },
  { name: "Bangkok",     lat: 13.76,  lng: 100.50 },
  { name: "Singapore",   lat: 1.35,   lng: 103.82 },
  { name: "Jakarta",     lat: -6.21,  lng: 106.85 },
  { name: "Sydney",      lat: -33.87, lng: 151.21 },
  { name: "Auckland",    lat: -36.85, lng: 174.76 },
  { name: "Manila",      lat: 14.60,  lng: 120.98 },
];

// ─── Flight path 2: Europe / Africa / Middle East loop ────────
const PATH_2 = [
  { name: "London",      lat: 51.51,  lng: -0.13 },
  { name: "Paris",       lat: 48.86,  lng: 2.35 },
  { name: "Rome",        lat: 41.90,  lng: 12.50 },
  { name: "Athens",      lat: 37.98,  lng: 23.73 },
  { name: "Istanbul",    lat: 41.01,  lng: 28.98 },
  { name: "Cairo",       lat: 30.04,  lng: 31.24 },
  { name: "Dubai",       lat: 25.20,  lng: 55.27 },
  { name: "Nairobi",     lat: -1.29,  lng: 36.82 },
  { name: "Cape Town",   lat: -33.93, lng: 18.42 },
  { name: "Barcelona",   lat: 41.39,  lng: 2.17 },
  { name: "Lisbon",      lat: 38.72,  lng: -9.14 },
  { name: "Mumbai",      lat: 19.08,  lng: 72.88 },
];

// ─── Flight path 3: North America / Caribbean loop ────────────
const PATH_3 = [
  { name: "New York",    lat: 40.71,  lng: -74.01 },
  { name: "Miami",       lat: 25.76,  lng: -80.19 },
  { name: "Havana",      lat: 23.11,  lng: -82.37 },
  { name: "Mexico City", lat: 19.43,  lng: -99.13 },
  { name: "Los Angeles", lat: 34.05,  lng: -118.24 },
  { name: "San Francisco",lat: 37.77, lng: -122.42 },
  { name: "Vancouver",   lat: 49.28,  lng: -123.12 },
  { name: "Chicago",     lat: 41.88,  lng: -87.63 },
  { name: "Toronto",     lat: 43.65,  lng: -79.38 },
  { name: "Honolulu",    lat: 21.31,  lng: -157.86 },
];

// ─── Flight path 4: South America loop ────────────────────────
const PATH_4 = [
  { name: "Buenos Aires",lat: -34.60, lng: -58.38 },
  { name: "Santiago",    lat: -33.45, lng: -70.67 },
  { name: "Lima",        lat: -12.05, lng: -77.04 },
  { name: "Bogota",      lat: 4.71,   lng: -74.07 },
  { name: "Caracas",     lat: 10.48,  lng: -66.90 },
  { name: "Rio",         lat: -22.91, lng: -43.17 },
  { name: "Sao Paulo",   lat: -23.55, lng: -46.63 },
  { name: "Montevideo",  lat: -34.88, lng: -56.16 },
];

function buildRoutes(dests) {
  return dests.map((d, i) => ({
    from: d,
    to: dests[(i + 1) % dests.length],
  }));
}

export default function HomeGlobeAnimated() {
  const containerRef = useRef(null);
  const globeRef = useRef(null);
  const threeLoadedRef = useRef(false);

  function handleThreeLoaded() {
    threeLoadedRef.current = true;
    initGlobe();
  }

  useEffect(() => {
    if (window.THREE) {
      threeLoadedRef.current = true;
      initGlobe();
    }
    return () => {
      if (globeRef.current) {
        globeRef.current.dispose?.();
        globeRef.current = null;
      }
    };
  }, []);

  function initGlobe() {
    if (!threeLoadedRef.current || !containerRef.current || globeRef.current) return;

    const THREE = window.THREE;
    if (!THREE) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // ─── Scene ────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.4;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // ─── Globe ────────────────────────────────────────────────
    const globeGeom = new THREE.SphereGeometry(1, 64, 64);
    const earthTexture = new THREE.TextureLoader().load("/earth-posterized.png");

    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.02,
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x080808),
      shininess: 2,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    globe.rotation.x = 0.25;
    globe.rotation.y = -2.5; // Start centered on East Asia
    scene.add(globe);

    // Atmosphere
    const atmosphereGeom = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xd4c5a8),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    scene.add(new THREE.Mesh(atmosphereGeom, atmosphereMat));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 3, 5);
    scene.add(dirLight);
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.15);
    fillLight.position.set(-5, -2, -3);
    scene.add(fillLight);

    // ─── Shared group ─────────────────────────────────────────
    const animGroup = new THREE.Group();
    globe.add(animGroup);

    // ─── Helpers ──────────────────────────────────────────────
    function latLngToVec3(lat, lng, radius) {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lng + 180) * (Math.PI / 180);
      return new THREE.Vector3(
        -(radius * Math.sin(phi) * Math.cos(theta)),
        radius * Math.cos(phi),
        radius * Math.sin(phi) * Math.sin(theta)
      );
    }

    // Slerp-based arc that follows globe curvature
    function buildArcPoints(from, to, liftBase, liftScale, numPoints) {
      const startDir = latLngToVec3(from.lat, from.lng, 1).normalize();
      const endDir = latLngToVec3(to.lat, to.lng, 1).normalize();
      const points = [];
      for (let i = 0; i <= numPoints; i++) {
        const t = i / numPoints;
        const dir = new THREE.Vector3().copy(startDir).lerp(endDir, t).normalize();
        const lift = liftBase + liftScale * Math.sin(t * Math.PI);
        points.push(dir.clone().multiplyScalar(1.008 + lift));
      }
      return points;
    }

    // Build a solid tube mesh from an array of points
    function buildTubeFromPoints(points, color, opacity, radius) {
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeom = new THREE.TubeGeometry(curve, 64, radius, 6, false);
      const tubeMat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
      });
      return new THREE.Mesh(tubeGeom, tubeMat);
    }

    // ─── Destination dots ─────────────────────────────────────
    const dotGeom = new THREE.CircleGeometry(0.008, 12);
    const dotMat1 = new THREE.MeshBasicMaterial({ color: 0x4a6e44, side: THREE.DoubleSide });

    [PATH_1, PATH_2, PATH_3, PATH_4].forEach((path) => {
      path.forEach((d) => {
        const dot = new THREE.Mesh(dotGeom, dotMat1);
        const pos = latLngToVec3(d.lat, d.lng, 1.003);
        dot.position.copy(pos);
        dot.lookAt(pos.clone().multiplyScalar(2)); // face outward from globe
        animGroup.add(dot);
      });
    });

    // ─── Flat plane silhouette sprite ────────────────────────────
    function buildPlaneSprite(color) {
      // Draw a top-down airplane silhouette onto a canvas
      const size = 128;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      const cx = size / 2;
      const cy = size / 2;

      ctx.fillStyle = color;
      ctx.beginPath();

      // Nose (pointing up = forward)
      ctx.moveTo(cx, 8);
      // Right fuselage
      ctx.lineTo(cx + 6, 30);
      // Right wing
      ctx.lineTo(cx + 50, 58);
      ctx.lineTo(cx + 48, 64);
      ctx.lineTo(cx + 6, 52);
      // Right body
      ctx.lineTo(cx + 5, 90);
      // Right tail
      ctx.lineTo(cx + 22, 105);
      ctx.lineTo(cx + 20, 110);
      ctx.lineTo(cx + 2, 100);
      // Tail center
      ctx.lineTo(cx, 104);
      // Left tail
      ctx.lineTo(cx - 2, 100);
      ctx.lineTo(cx - 20, 110);
      ctx.lineTo(cx - 22, 105);
      ctx.lineTo(cx - 5, 90);
      // Left body
      ctx.lineTo(cx - 6, 52);
      // Left wing
      ctx.lineTo(cx - 48, 64);
      ctx.lineTo(cx - 50, 58);
      ctx.lineTo(cx - 6, 30);
      ctx.closePath();
      ctx.fill();

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;

      const planeGeom = new THREE.PlaneGeometry(0.065, 0.065);
      const planeMat = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(planeGeom, planeMat);
      mesh.userData.geometries = [planeGeom];
      mesh.userData.materials = [planeMat];
      mesh.userData.textures = [texture];
      return mesh;
    }

    // ─── Create plane sprites ─────────────────────────────────
    const plane1 = buildPlaneSprite("#ffffff");
    animGroup.add(plane1);

    const plane2 = buildPlaneSprite("#ffffff");
    animGroup.add(plane2);

    const plane3 = buildPlaneSprite("#ffffff");
    animGroup.add(plane3);

    const plane4 = buildPlaneSprite("#ffffff");
    animGroup.add(plane4);

    // ─── Animator ─────────────────────────────────────────────
    function createAnimator(opts) {
      const {
        routes, vehicle, trailColor, tubeRadius,
        liftBase, liftScale, speed, pauseFrames,
        startAt = 0,
      } = opts;

      const completedTrails = [];
      let currentRoute = 0;
      let progress = 0;
      let pauseCounter = 0;
      let arcPoints = null;
      let activeTube = null;

      function getPointAtProgress(t) {
        const idx = t * (arcPoints.length - 1);
        const lo = Math.floor(idx);
        const hi = Math.min(lo + 1, arcPoints.length - 1);
        const frac = idx - lo;
        return new THREE.Vector3().lerpVectors(arcPoints[lo], arcPoints[hi], frac);
      }

      function startRoute(index) {
        currentRoute = index;
        progress = 0;
        pauseCounter = 0;
        const route = routes[currentRoute];
        arcPoints = buildArcPoints(route.from, route.to, liftBase, liftScale, 100);
      }

      function finalizeTrail() {
        const tube = buildTubeFromPoints(arcPoints, trailColor, 0.7, tubeRadius);
        tube.userData.age = 0;
        animGroup.add(tube);
        completedTrails.push(tube);
      }

      startRoute(startAt % routes.length);

      return {
        completedTrails,
        update() {
          if (pauseCounter > 0) {
            pauseCounter--;
            if (pauseCounter === 0) {
              startRoute((currentRoute + 1) % routes.length);
            }
            return;
          }
          if (!arcPoints) return;

          progress = Math.min(1, progress + speed);

          // Move vehicle
          const pos = getPointAtProgress(progress);
          vehicle.position.copy(pos);

          // Orient flat plane: face outward from globe, nose toward destination
          const lookT = Math.min(1, progress + 0.02);
          const ahead = getPointAtProgress(lookT);
          const up = pos.clone().normalize(); // outward from globe center
          const forward = ahead.clone().sub(pos).normalize(); // travel direction

          // Build orientation matrix: Z = up (outward), Y = forward (nose)
          const right = new THREE.Vector3().crossVectors(forward, up).normalize();
          const correctedForward = new THREE.Vector3().crossVectors(up, right).normalize();

          const m = new THREE.Matrix4();
          m.makeBasis(right, correctedForward, up);
          vehicle.setRotationFromMatrix(m);

          // Rebuild active tube up to current progress
          if (activeTube) {
            animGroup.remove(activeTube);
            activeTube.geometry.dispose();
            activeTube.material.dispose();
            activeTube = null;
          }
          if (progress > 0.02) {
            const subPoints = [];
            const steps = Math.max(4, Math.floor(progress * 80));
            for (let i = 0; i <= steps; i++) {
              subPoints.push(getPointAtProgress((i / steps) * progress));
            }
            activeTube = buildTubeFromPoints(subPoints, trailColor, 0.9, tubeRadius);
            animGroup.add(activeTube);
          }

          // Route complete
          if (progress >= 1) {
            if (activeTube) {
              animGroup.remove(activeTube);
              activeTube.geometry.dispose();
              activeTube.material.dispose();
              activeTube = null;
            }
            finalizeTrail();
            arcPoints = null;
            pauseCounter = pauseFrames;
          }
        },
        dispose() {
          if (activeTube) {
            activeTube.geometry.dispose();
            activeTube.material.dispose();
          }
          completedTrails.forEach((t) => {
            t.geometry.dispose();
            t.material.dispose();
          });
        },
      };
    }

    // ─── Create four regional flight animators ─────────────────
    const routes1 = buildRoutes(PATH_1);
    const routes2 = buildRoutes(PATH_2);
    const routes3 = buildRoutes(PATH_3);
    const routes4 = buildRoutes(PATH_4);

    const animOpts = {
      trailColor: 0x9b5e4a,
      tubeRadius: 0.005,
      liftBase: 0.002,
      liftScale: 0.004,
      speed: 0.0005,
    };

    const anim1 = createAnimator({
      ...animOpts, routes: routes1, vehicle: plane1,
      pauseFrames: 90, startAt: 0,
    });

    const anim2 = createAnimator({
      ...animOpts, routes: routes2, vehicle: plane2,
      pauseFrames: 80, startAt: 3,
    });

    const anim3 = createAnimator({
      ...animOpts, routes: routes3, vehicle: plane3,
      pauseFrames: 70, startAt: 1,
    });

    const anim4 = createAnimator({
      ...animOpts, routes: routes4, vehicle: plane4,
      pauseFrames: 85, startAt: 2,
    });

    // ─── Animation loop ───────────────────────────────────────
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);

      globe.rotation.y += 0.0004;
      anim1.update();
      anim2.update();
      anim3.update();
      anim4.update();

      // Fade old trails
      [anim1.completedTrails, anim2.completedTrails, anim3.completedTrails, anim4.completedTrails].forEach((trails) => {
        for (let i = trails.length - 1; i >= 0; i--) {
          const trail = trails[i];
          trail.userData.age++;
          if (trail.userData.age > 600) {
            trail.material.opacity -= 0.003;
            if (trail.material.opacity <= 0) {
              animGroup.remove(trail);
              trail.geometry.dispose();
              trail.material.dispose();
              trails.splice(i, 1);
            }
          }
        }
      });

      renderer.render(scene, camera);
    }
    animate();

    // ─── Resize ───────────────────────────────────────────────
    function onResize() {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    }
    window.addEventListener("resize", onResize);

    // ─── Cleanup ──────────────────────────────────────────────
    globeRef.current = {
      dispose() {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        globeGeom.dispose();
        globeMat.dispose();
        atmosphereGeom.dispose();
        atmosphereMat.dispose();
        [plane1, plane2, plane3, plane4].forEach((p) => {
          p.userData.geometries?.forEach((g) => g.dispose());
          p.userData.materials?.forEach((m) => m.dispose());
          p.userData.textures?.forEach((t) => t.dispose());
        });
        dotGeom.dispose();
        dotMat1.dispose();
        anim1.dispose();
        anim2.dispose();
        anim3.dispose();
        anim4.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      },
    };
  }

  return (
    <>
      <Script
        src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"
        strategy="afterInteractive"
        onLoad={handleThreeLoaded}
      />
      <div
        ref={containerRef}
        className="absolute inset-0"
        style={{ pointerEvents: "none" }}
      />
    </>
  );
}
