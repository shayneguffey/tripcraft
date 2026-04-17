"use client";

import { useEffect, useRef } from "react";
import Script from "next/script";

/**
 * HomeGlobe — a purely decorative, auto-rotating globe for the landing page.
 * Uses the posterized/desaturated earth texture. No user interaction.
 */
export default function HomeGlobe() {
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

    // Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 3.4;

    // Transparent background
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Globe geometry
    const globeGeom = new THREE.SphereGeometry(1, 64, 64);
    const textureLoader = new THREE.TextureLoader();

    // Load the posterized desaturated map
    const earthTexture = textureLoader.load("/earth-posterized.png");

    const globeMat = new THREE.MeshPhongMaterial({
      map: earthTexture,
      bumpScale: 0.02,
      // White color so texture renders true-to-source
      color: new THREE.Color(0xffffff),
      emissive: new THREE.Color(0x000000),
      specular: new THREE.Color(0x080808),
      shininess: 2,
    });
    const globe = new THREE.Mesh(globeGeom, globeMat);
    // Tilt slightly for a more dynamic angle
    globe.rotation.x = 0.25;
    scene.add(globe);

    // Subtle atmosphere glow ring
    const atmosphereGeom = new THREE.SphereGeometry(1.03, 64, 64);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0xd4c5a8),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
    });
    const atmosphere = new THREE.Mesh(atmosphereGeom, atmosphereMat);
    scene.add(atmosphere);

    // Lights — neutral white so texture colors stay true
    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(5, 3, 5);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xffffff, 0.15);
    fill.position.set(-5, -2, -3);
    scene.add(fill);

    // Animation loop — gentle auto-rotate
    let animId;
    function animate() {
      animId = requestAnimationFrame(animate);
      globe.rotation.y += 0.0004;
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

    // Cleanup
    globeRef.current = {
      dispose() {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", onResize);
        renderer.dispose();
        globeGeom.dispose();
        globeMat.dispose();
        atmosphereGeom.dispose();
        atmosphereMat.dispose();
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
