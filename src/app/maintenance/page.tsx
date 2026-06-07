"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Maintenance page displaying premium placeholder during downtime.
 * Includes rotating status messages, relaunch indicator, and an admin‑only banner.
 */
export default function MaintenancePage() {
  const { user } = useAuth(); // Assumes admin flag is part of user object
  const isAdmin = !!user?.isAdmin; // Adjust property as per actual implementation

  const messages = [
    '☕ Refilling coffee levels...',
    '🐛 Convincing bugs to leave peacefully...',
    '⚡ Optimizing pixels at dangerous speeds...',
    '🚀 Preparing for relaunch sequence...',
    '☕ The team is currently refactoring code, fixing bugs, and preparing a much better BOOSTCV experience.',
  ];

  const [msgIndex, setMsgIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIndex((i) => (i + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F5F0] flex flex-col items-center justify-center px-4 text-[#1A1A1A] font-sans">
      {/* Admin banner */}
      {isAdmin && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#B08D57] text-white px-4 py-1 rounded-full text-sm shadow-md">
          Maintenance Mode Active
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-center" style={{ color: '#143D2E' }}>
        We&rsquo;re Building Something Better.
      </h1>
      <p className="text-lg md:text-xl text-center max-w-2xl mb-8">
        BOOSTCV is currently undergoing a major redesign to deliver a faster, cleaner, and smarter resume optimization experience.
      </p>

      <div className="text-xl font-medium mb-6 text-center" style={{ color: '#B08D57' }}>
        {messages[msgIndex]}
      </div>

      {/* Progress placeholder */}
      <div className="w-full max-w-md bg-[#E5E7EB] rounded-full h-4 mb-2 overflow-hidden">
        <div className="bg-[#143D2E] h-4" style={{ width: '45%' }} />
      </div>
      <p className="text-sm text-[#6B7280] mb-6 text-center">Improving your experience…</p>

      {/* Relaunch indicator */}
      <div className="text-center mb-8">
        <span className="inline-block bg-[#B08D57]/10 text-[#B08D57] px-3 py-1 rounded-full text-sm font-medium">
          Estimated Return: Within 7 Days
        </span>
      </div>

      <Link href="/" className="inline-flex items-center gap-2 bg-[#143D2E] text-white px-6 py-3 rounded-lg hover:bg-[#102C23] transition">
        Return Home
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
