"use client";

import React, { useEffect, useMemo, useState } from "react";

interface AtsScoreGaugeProps {
  score: number;
  size?: number;
  interactive?: boolean;
}

const categoryWeights = [
  { label: "Structure", offset: 8 },
  { label: "Formatting", offset: 2 },
  { label: "Readability", offset: -4 },
  { label: "Skills", offset: -10 },
  { label: "Projects", offset: -6 },
  { label: "Achievements", offset: -12 },
];

export const AtsScoreGauge: React.FC<AtsScoreGaugeProps> = ({
  score,
  size = 160,
}) => {
  const [displayScore, setDisplayScore] = useState(0);
  const compact = size < 110;

  useEffect(() => {
    const end = Math.min(100, Math.max(0, score));
    let frame = 0;
    const steps = 28;
    const timer = window.setInterval(() => {
      frame += 1;
      setDisplayScore(Math.round((end * frame) / steps));
      if (frame >= steps) {
        window.clearInterval(timer);
      }
    }, 18);

    return () => window.clearInterval(timer);
  }, [score]);

  const status = useMemo(() => {
    if (displayScore < 45) {
      return {
        label: "Needs attention",
        color: "#C0392B",
        bg: "bg-[#C0392B]/10",
        text: "text-[#C0392B]",
      };
    }

    if (displayScore < 75) {
      return {
        label: "Improving",
        color: "#C58B00",
        bg: "bg-[#C58B00]/10",
        text: "text-[#8A6400]",
      };
    }

    return {
      label: "Strong",
      color: "#1F5C4A",
      bg: "bg-[#1F5C4A]/10",
      text: "text-[#1F5C4A]",
    };
  }, [displayScore]);

  const categories = categoryWeights.map((category) => ({
    ...category,
    value: Math.min(99, Math.max(28, displayScore + category.offset)),
  }));

  if (compact) {
    return (
      <div className="w-full rounded-xl border border-[#E5E7EB] bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
              Resume Health
            </p>
            <p className="mt-1 text-2xl font-semibold tracking-tight text-[#1C1C1C]">
              {displayScore}%
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${status.bg} ${status.text}`}>
            {status.label}
          </span>
        </div>
        <div className="mt-3 h-2 rounded-full bg-[#F1F2EF]">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${displayScore}%`, backgroundColor: status.color }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[360px] rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">
            Resume Health
          </p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-[#1C1C1C]">
            {displayScore}%
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}>
          {status.label}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {categories.map((category) => (
          <div key={category.label}>
            <div className="mb-1.5 flex items-center justify-between text-xs">
              <span className="font-medium text-[#1C1C1C]">{category.label}</span>
              <span className="text-[#6B7280]">{category.value}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#F1F2EF]">
              <div
                className="h-full rounded-full bg-[#1F5C4A] transition-all duration-300"
                style={{ width: `${category.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
