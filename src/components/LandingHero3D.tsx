"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { AlertTriangle, CheckCircle, HelpCircle, Lock, ShieldAlert, Sparkles, User, Zap } from "lucide-react";

export function LandingHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  // 1. Scroll-linked 3D Card Rotation
  const { scrollYProgress } = useScroll();
  // We want the card to flip between scroll progress 0.05 and 0.25
  const scrollRotation = useTransform(scrollYProgress, [0.05, 0.25], [0, 180]);
  
  // 2. Interactive Mouse Tilt Effect (hardware-accelerated via Spring)
  const rotateXVal = useMotionValue(0);
  const rotateYVal = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.8 };
  const springRotateX = useSpring(rotateXVal, springConfig);
  const springRotateY = useSpring(rotateYVal, springConfig);

  // Combine scroll flip + mouse tilt
  // When card is rotated by scroll, we add scrollRotation to rotateY
  const combinedRotateY = useTransform(scrollRotation, (latestScrollRot) => {
    return latestScrollRot + springRotateY.get();
  });

  // Track flip state for text/badges visibility helper
  useEffect(() => {
    return scrollRotation.on("change", (latest) => {
      // If rotated past 90 degrees, show the optimized "after" side
      setIsFlipped(latest > 90);
    });
  }, [scrollRotation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setMouseMoved(true);
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Calculate cursor coordinate offset from center (-0.5 to 0.5)
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    // Map coordinates to minor rotations (max 12 deg)
    rotateXVal.set(-y * 24);
    rotateYVal.set(x * 24);
  };

  const handleMouseLeave = () => {
    // Return smooth back to center
    rotateXVal.set(0);
    rotateYVal.set(0);
  };

  // 3. Three.js Ambient Particle Space Field
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    
    // Smooth camera setup
    const camera = new THREE.PerspectiveCamera(
      60,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    camera.position.z = 30;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Transparent bg to let CSS grid gradient show through
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Particle Array Generation
    const particlesCount = 280;
    const positionArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    // Soft cyan color token for ambient particles
    const themeColor = new THREE.Color("#0891b2"); // cyan-600

    for (let i = 0; i < particlesCount * 3; i += 3) {
      // Scatter points in a spatial field
      positionArray[i] = (Math.random() - 0.5) * 65;     // X
      positionArray[i + 1] = (Math.random() - 0.5) * 45; // Y
      positionArray[i + 2] = (Math.random() - 0.5) * 40; // Z

      // Color variation (glowing whites & soft cyans)
      const mixRatio = Math.random();
      const color = new THREE.Color("#ffffff").lerp(themeColor, mixRatio);
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

    // Custom Canvas round texture for circular particles
    const createCircleTexture = () => {
      const size = 16;
      const canvasTex = document.createElement("canvas");
      canvasTex.width = size;
      canvasTex.height = size;
      const ctx = canvasTex.getContext("2d");
      if (ctx) {
        ctx.beginPath();
        ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvasTex);
    };

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.32,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      map: createCircleTexture(),
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    // Subtle 3D Ambient Wireframe Grid to create Linear/Vercel spatial feel
    const gridGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0x18181b, // zinc-900 wireframe
      wireframe: true,
      transparent: true,
      opacity: 0.3,
    });
    const gridMesh = new THREE.Mesh(gridGeometry, gridMaterial);
    gridMesh.rotation.x = Math.PI / 2.3;
    gridMesh.position.y = -12;
    scene.add(gridMesh);

    // Animation Loop
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Soft particles float
      particlesMesh.rotation.y = elapsedTime * 0.035;
      particlesMesh.rotation.x = elapsedTime * 0.015;

      // Soft grid breathing wave
      const positions = gridGeometry.attributes.position;
      if (positions) {
        for (let i = 0; i < positions.count; i++) {
          const z = positions.getZ(i);
          const x = positions.getX(i);
          const y = positions.getY(i);
          // Apply sinusoidal wave
          const offset = Math.sin(elapsedTime + (x * 0.1) + (y * 0.1)) * 0.6;
          positions.setZ(i, offset);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Window Resizer Handler
    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup context
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      gridGeometry.dispose();
      gridMaterial.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-[620px] lg:h-[700px] flex items-center justify-center select-none overflow-visible">
      
      {/* 1. Spatial Ambient Canvas Background */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-70"
      />

      {/* Subtle bottom fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none z-1" />

      {/* 2. Interactive Card 3D viewport wrapper */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative w-full max-w-[420px] h-[500px] cursor-grab active:cursor-grabbing z-10 flex items-center justify-center p-4"
        style={{
          perspective: 1200,
        }}
      >
        
        {/* Helper Scroll/Tilt Indicator Overlay */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1 z-20">
          <span className="text-[9px] font-bold font-mono tracking-widest text-zinc-550 uppercase">
            {!mouseMoved ? "Hover to Tilt Card" : "Scroll down to optimize"}
          </span>
          <div className="flex items-center space-x-1">
            <span className={`h-1.5 w-1.5 rounded-full ${isFlipped ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
            <span className="text-[10px] font-black font-mono tracking-wider text-white uppercase">
              {isFlipped ? "OPTIMIZED PROFILE" : "UNOPTIMIZED DETECTED"}
            </span>
          </div>
        </div>

        {/* 3D Double-Sided Card Body container */}
        <motion.div
          className="relative w-full h-full"
          style={{
            transformStyle: "preserve-3d",
            rotateX: springRotateX,
            rotateY: combinedRotateY,
          }}
          transition={{ type: "spring", stiffness: 100 }}
        >
          
          {/* ======================================================== */}
          {/* FRONT SIDE: Muted Zinc & Red Warn Outline (Before Optimization) */}
          {/* ======================================================== */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border border-red-950/20 bg-zinc-950/95 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(239,68,68,0.06)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Header branding */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black font-mono tracking-widest text-zinc-500 uppercase">
                  UNRESOLVED PLACEMENT FILTERS
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-red-950/40 text-red-400 border border-red-900/30 uppercase font-mono">
                Readiness: 38%
              </span>
            </div>

            {/* Resume Structure Grid representation */}
            <div className="flex-1 py-4 space-y-4 text-left">
              
              {/* Header profile section in resume */}
              <div className="space-y-1">
                <div className="h-4 w-32 bg-zinc-800 rounded animate-pulse" />
                <div className="h-2 w-48 bg-zinc-900 rounded" />
              </div>

              {/* Warning checklist items simulating placement warnings */}
              <div className="space-y-3 pt-2 font-mono text-[10px]">
                
                <div className="p-3 bg-red-950/15 border border-red-950/30 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-red-400 font-extrabold">
                    <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Multi-Column Layout Error</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans font-medium pl-5">
                    Parser scrambles columns horizontally. Recruiter matches read education and experience as overlapping lines.
                  </p>
                </div>

                <div className="p-3 bg-red-950/15 border border-red-950/30 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-red-400 font-extrabold">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>0 Placement Keywords Mapped</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans font-medium pl-5">
                    No matching technologies index. Core skills (Docker, AWS, SQL) are written in icons/bars, making them invisible.
                  </p>
                </div>

                <div className="p-3 bg-red-950/15 border border-red-950/30 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-500 font-extrabold">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Unquantified Experience Bullets</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 leading-normal font-sans font-medium pl-5">
                    Muted statements without XYZ metrics. No numbers measuring impact on latency, memory, or cost scales.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between font-mono text-[9px] text-zinc-550 font-bold">
              <span>SCANNER STATUS: CRITICAL FAILURE</span>
              <span>VIT-PL-2026</span>
            </div>

          </div>

          {/* ======================================================== */}
          {/* BACK SIDE: Premium Cyan & Emerald Checked (After Optimization) */}
          {/* ======================================================== */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border border-cyan-500/25 bg-zinc-950/95 p-6 flex flex-col justify-between shadow-[0_20px_50px_rgba(6,182,212,0.1)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header branding */}
            <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black font-mono tracking-widest text-cyan-400 uppercase">
                  BOOSTCV CERTIFIED READY
                </span>
              </div>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 border border-emerald-900/30 uppercase font-mono shadow-[0_0_10px_rgba(16,185,129,0.15)] animate-pulse">
                Readiness: 98%
              </span>
            </div>

            {/* Resume Structure Grid representation */}
            <div className="flex-1 py-4 space-y-4 text-left">
              
              {/* Header profile section in resume */}
              <div className="space-y-1">
                <div className="h-4 w-40 bg-white rounded" />
                <div className="h-2 w-56 bg-zinc-800 rounded" />
              </div>

              {/* Verified success checks representation */}
              <div className="space-y-3 pt-2 font-mono text-[10px]">
                
                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center space-x-2 text-cyan-400 font-extrabold">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-cyan-400" />
                    <span>Linear Single-Column Layout</span>
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-normal font-sans font-medium pl-5">
                    Verified 100% parsable text streams. Zero horizontal wrapping errors or table overlays. Standard Helvetica type.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center space-x-2 text-cyan-400 font-extrabold">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-cyan-400" />
                    <span>Dynamic Placements Match Cloud</span>
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-normal font-sans font-medium pl-5">
                    Skills grid automatically mapped to real job descriptions. 100% keyword extraction rates.
                  </p>
                </div>

                <div className="p-3 bg-zinc-900/40 border border-zinc-900 rounded-xl space-y-1.5 hover:border-cyan-500/20 transition-all">
                  <div className="flex items-center space-x-2 text-emerald-400 font-extrabold">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-400" />
                    <span>Recruiter-Optimized XYZ Metrics</span>
                  </div>
                  <p className="text-[9px] text-zinc-300 leading-normal font-sans font-medium pl-5">
                    Achievements restructured with clear numbers: *\"Reduced API response times by 32% via Redis caching layer\"*.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between font-mono text-[9px] text-cyan-400 font-bold">
              <span>SCANNER STATUS: PASS</span>
              <span>PLACEMENT GUARANTEED</span>
            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
