"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import * as THREE from "three";
import { AlertTriangle, CheckCircle, ShieldAlert, Target } from "lucide-react";

export function LandingHero3D() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mouseMoved, setMouseMoved] = useState(false);

  // 1. Scroll-linked 3D Card Rotation
  const { scrollYProgress } = useScroll();
  const scrollRotation = useTransform(scrollYProgress, [0.05, 0.25], [0, 180]);
  
  // 2. Interactive Mouse Tilt Effect
  const rotateXVal = useMotionValue(0);
  const rotateYVal = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 120, mass: 0.8 };
  const springRotateX = useSpring(rotateXVal, springConfig);
  const springRotateY = useSpring(rotateYVal, springConfig);

  const combinedRotateY = useTransform(scrollRotation, (latestScrollRot) => {
    return latestScrollRot + springRotateY.get();
  });

  useEffect(() => {
    return scrollRotation.on("change", (latest) => {
      setIsFlipped(latest > 90);
    });
  }, [scrollRotation]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    setMouseMoved(true);
    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const x = (e.clientX - rect.left) / width - 0.5;
    const y = (e.clientY - rect.top) / height - 0.5;

    rotateXVal.set(-y * 20);
    rotateYVal.set(x * 20);
  };

  const handleMouseLeave = () => {
    rotateXVal.set(0);
    rotateYVal.set(0);
  };

  // 3. Three.js Elegant Light Canvas
  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const scene = new THREE.Scene();
    
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

    // Particle Array Generation - Warm gold and white dust motes
    const particlesCount = 200;
    const positionArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);

    const goldColor = new THREE.Color("#4F7C82"); // Brand premium gold
    const whiteColor = new THREE.Color("#ffffff");

    for (let i = 0; i < particlesCount * 3; i += 3) {
      positionArray[i] = (Math.random() - 0.5) * 60;     // X
      positionArray[i + 1] = (Math.random() - 0.5) * 40; // Y
      positionArray[i + 2] = (Math.random() - 0.5) * 35; // Z

      const mixRatio = Math.random();
      const color = whiteColor.clone().lerp(goldColor, mixRatio);
      colorArray[i] = color.r;
      colorArray[i + 1] = color.g;
      colorArray[i + 2] = color.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));

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
      size: 0.38,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
      map: createCircleTexture(),
      depthWrite: false,
    });

    const particlesMesh = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particlesMesh);

    // Minimalist Beige/Stone wireframe bottom grid
    const gridGeometry = new THREE.PlaneGeometry(80, 80, 20, 20);
    const gridMaterial = new THREE.MeshBasicMaterial({
      color: 0xe7e5e4, // stone-200 wireframe grid
      wireframe: true,
      transparent: true,
      opacity: 0.55,
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

      particlesMesh.rotation.y = elapsedTime * 0.025;
      particlesMesh.rotation.x = elapsedTime * 0.012;

      const positions = gridGeometry.attributes.position;
      if (positions) {
        for (let i = 0; i < positions.count; i++) {
          const x = positions.getX(i);
          const y = positions.getY(i);
          const offset = Math.sin(elapsedTime * 0.8 + (x * 0.08) + (y * 0.08)) * 0.45;
          positions.setZ(i, offset);
        }
        positions.needsUpdate = true;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    window.addEventListener("resize", handleResize);

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
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* Subtle bottom fade to blend with next section */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#B8E3E9] to-transparent pointer-events-none z-1" />

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
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center space-y-1.5 z-20">
          <span className="text-[9px] font-bold font-mono tracking-widest text-[#666666] uppercase">
            {!mouseMoved ? "Hover to Tilt Profile" : "Scroll down to optimize"}
          </span>
          <div className="flex items-center space-x-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${isFlipped ? "bg-[#2E7D32]" : "bg-[#D32F2F] animate-pulse"}`} />
            <span className="text-[10px] font-black font-sans tracking-wide text-[#1E1E1E] uppercase">
              {isFlipped ? "OPTIMIZED FOR RECRUITERS" : "ISSUES FLAGGED"}
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
          {/* FRONT SIDE: Elegant Zinc border & Red Warn Checklist (Before) */}
          {/* ======================================================== */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border border-stone-200 bg-white p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.03)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
          >
            {/* Header branding */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-[#D32F2F] animate-pulse" />
                <span className="text-[9px] font-black font-sans tracking-wide text-[#666666] uppercase">
                  UNRESOLVED RECRUITER ISSUES
                </span>
              </div>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#D32F2F]/6 text-[#D32F2F] border border-[#D32F2F]/15 uppercase font-sans">
                Readiness: 38%
              </span>
            </div>

            {/* Resume Structure Grid representation */}
            <div className="flex-1 py-4 space-y-4 text-left">
              
              {/* Header profile section in resume */}
              <div className="space-y-1">
                <div className="h-4 w-32 bg-stone-100 rounded" />
                <div className="h-2.5 w-48 bg-stone-50 rounded" />
              </div>

              {/* Warning checklist items simulating placement warnings */}
              <div className="space-y-3 pt-1 font-sans text-[10px]">
                
                <div className="p-3 bg-[#D32F2F]/4 border border-[#D32F2F]/12 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D32F2F] font-black text-[10px]">
                    <ShieldAlert className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Incompatible Column Spacing</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Parser vertical grid mismatch. Recruiter systems merge sections horizontally, creating horizontal scrambled lines.
                  </p>
                </div>

                <div className="p-3 bg-[#D32F2F]/4 border border-[#D32F2F]/12 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#D32F2F] font-black text-[10px]">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Missing Core Skill Keywords</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Key target technologies (Docker, AWS, SQL) are written inside circular graphic dials, which are invisible to search engines.
                  </p>
                </div>

                <div className="p-3 bg-[#E6A700]/4 border border-[#E6A700]/12 rounded-xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-[#E6A700] font-black text-[10px]">
                    <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                    <span>Unquantified Experience Bullets</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Muted role descriptions without metrics. Missing precise numbers measuring latency scales or percentage changes.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-mono text-[9px] text-[#999999] font-bold">
              <span>SCANNER: CRITICAL CONFLICTS</span>
              <span>VIT-PL-2026</span>
            </div>

          </div>

          {/* ======================================================== */}
          {/* BACK SIDE: Premium White & Green Checkmarks (After) */}
          {/* ======================================================== */}
          <div 
            className="absolute inset-0 w-full h-full rounded-3xl border border-stone-200 bg-white p-6 flex flex-col justify-between shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            {/* Header branding */}
            <div className="flex items-center justify-between pb-3.5 border-b border-stone-100">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-[#0B2E33]" />
                <span className="text-[9px] font-black font-sans tracking-wide text-[#0B2E33] uppercase">
                  BOOSTCV PLATINUM READY
                </span>
              </div>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-[#0B2E33]/6 text-[#0B2E33] border border-[#0B2E33]/15 uppercase font-sans animate-pulse">
                Readiness: 98%
              </span>
            </div>

            {/* Resume Structure Grid representation */}
            <div className="flex-1 py-4 space-y-4 text-left">
              
              {/* Header profile section in resume */}
              <div className="space-y-1">
                <div className="h-4 w-40 bg-[#0B2E33] rounded" />
                <div className="h-2.5 w-56 bg-stone-150 rounded" />
              </div>

              {/* Verified success checks representation */}
              <div className="space-y-3 pt-1 font-sans text-[10px]">
                
                <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1.5 hover:border-[#0B2E33]/20 transition-all">
                  <div className="flex items-center space-x-2 text-[#0B2E33] font-black text-[10px]">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#0B2E33]" />
                    <span>Linear Recruiter-Approved Format</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Clean, single-column spacing guarantees 100% indexing score. Helvetica typography extracts cleanly on all portals.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1.5 hover:border-[#0B2E33]/20 transition-all">
                  <div className="flex items-center space-x-2 text-[#0B2E33] font-black text-[10px]">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#0B2E33]" />
                    <span>Target Placement Skills Grid</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Skills section automatically mapped to target job requisitions. Core technology phrases indexed successfully.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl space-y-1.5 hover:border-[#0B2E33]/20 transition-all">
                  <div className="flex items-center space-x-2 text-[#2E7D32] font-black text-[10px]">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-[#2E7D32]" />
                    <span>Google XYZ Impact Formulation</span>
                  </div>
                  <p className="text-[9.5px] text-[#666666] leading-normal font-medium pl-5">
                    Experience structured with verified numbers: *\"Reduced API response times by 32% via custom Redis cache\"*.
                  </p>
                </div>

              </div>

            </div>

            {/* Bottom Actions footer */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between font-sans text-[9px] text-[#0B2E33] font-black uppercase">
              <span>SCANNER STATUS: PASS</span>
              <span className="text-[#4F7C82] font-black flex items-center">
                <Target className="h-3 w-3 mr-0.5 text-[#4F7C82]" />
                PRO TEMPLATE
              </span>
            </div>

          </div>

        </motion.div>

      </div>

    </div>
  );
}
