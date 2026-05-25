"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface AtsScoreGaugeProps {
  score: number;
  size?: number;
  interactive?: boolean;
}

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({ 
  score, 
  size = 160,
  interactive = false
}) => {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Math.min(100, Math.max(0, score));
    if (start === end) {
      setDisplayScore(end);
      return;
    }

    const duration = 1.5; // seconds
    const stepTime = Math.abs(Math.floor((duration * 1000) / end));
    
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start >= end) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  // Score thematic color picker
  const getScoreColor = (val: number) => {
    if (val < 45) return { color: "#ef4444", text: "FAILING", textClass: "text-red-500", glow: "rgba(239, 68, 68, 0.2)" };
    if (val < 75) return { color: "#f59e0b", text: "WARNING", textClass: "text-amber-500", glow: "rgba(245, 158, 11, 0.2)" };
    return { color: "#06b6d4", text: "OPTIMIZED", textClass: "text-cyan-400", glow: "rgba(6, 182, 212, 0.35)" };
  };

  const currentTheme = getScoreColor(displayScore);

  return (
    <div className="flex flex-col items-center justify-center relative" style={{ width: size, height: size + 40 }}>
      {/* Glow Backdrop */}
      <div 
        className="absolute rounded-full transition-all duration-1000"
        style={{
          width: size - 20,
          height: size - 20,
          backgroundColor: currentTheme.glow,
          filter: "blur(24px)",
          top: 10
        }}
      />

      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#16161a"
            strokeWidth={strokeWidth}
          />
          {/* Neon Active Arc */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={currentTheme.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.1s ease-out" }}
          />
        </svg>

        {/* Counter Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="text-4xl font-extrabold tracking-tight text-white font-mono"
          >
            {displayScore}%
          </motion.span>
          <span className="text-[10px] tracking-widest text-zinc-500 font-bold uppercase mt-0.5">
            ATS Score
          </span>
        </div>
      </div>

      {/* Dynamic Status Text */}
      <div className={`mt-3 font-semibold text-xs tracking-wider uppercase font-mono ${currentTheme.textClass}`}>
        {currentTheme.text}
      </div>
    </div>
  );
};
