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

    const duration = 1.2; // seconds
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

  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (displayScore / 100) * circumference;

  // Outcome-based theme color mapping matching rebrand palette
  const getScoreColor = (val: number) => {
    if (val < 45) {
      return { 
        color: "#D32F2F", // Error Red
        text: "NEEDS WORK", 
        textClass: "text-[#D32F2F] bg-[#D32F2F]/6 border-[#D32F2F]/15", 
      };
    }
    if (val < 75) {
      return { 
        color: "#E6A700", // Warning Gold/Amber
        text: "IMPROVING", 
        textClass: "text-[#E6A700] bg-[#E6A700]/6 border-[#E6A700]/15", 
      };
    }
    return { 
      color: "#0B2E33", // Brand Green
      text: "EXCELLENT", 
      textClass: "text-[#0B2E33] bg-[#0B2E33]/6 border-[#0B2E33]/15", 
    };
  };

  const currentTheme = getScoreColor(displayScore);

  return (
    <div className="flex flex-col items-center justify-center relative select-none" style={{ width: size, height: size + 35 }}>
      
      {/* 1. Circle container with clean gray base track */}
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          {/* Base Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9" // slate-100 base
            strokeWidth={strokeWidth}
          />
          {/* Active progress arc */}
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

        {/* Counter Overlay (Premium Inter font) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            className="text-3xl font-black tracking-tight text-[#1E1E1E] font-sans"
          >
            {displayScore}%
          </motion.span>
          <span className="text-[9px] tracking-wider text-zinc-400 font-extrabold uppercase mt-0.5 font-sans">
            Resume Health
          </span>
        </div>
      </div>

      {/* 2. Elegant status badge */}
      <div className={`mt-3.5 px-3 py-0.5 rounded-full border text-[9px] font-black tracking-wider uppercase font-sans ${currentTheme.textClass}`}>
        {currentTheme.text}
      </div>

    </div>
  );
};
