"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Mail, Lock, CheckCircle2 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8 text-sm text-zinc-400 font-medium relative overflow-hidden">
      
      {/* Subtle background glow */}
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-zinc-900">
          
          {/* Brand & Tagline Column (Left) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:scale-105 transition-transform duration-300">
                <Zap className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-mono">
                BOOSTCV
              </span>
            </Link>
            
            <p className="text-xs text-zinc-500 max-w-sm leading-relaxed">
              Engineered to bypass automated HR gates and Taleo/Workday filters. 
              Get your resume placement-ready with a 98%+ guaranteed ATS compatibility rating.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold font-mono tracking-wide text-zinc-500">
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-900">
                <Lock className="h-3 w-3 text-cyan-400" />
                <span>Razorpay Secured</span>
              </div>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-900">
                <CheckCircle2 className="h-3 w-3 text-cyan-400" />
                <span>98%+ ATS Pass</span>
              </div>
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded bg-zinc-900/50 border border-zinc-900">
                <ShieldCheck className="h-3 w-3 text-cyan-400" />
                <span>Google Sync</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column (Center) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
              Product Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs font-bold font-mono">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors block">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/#problem" className="hover:text-cyan-400 transition-colors block">
                  ATS Scanner
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors block">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors block">
                  User Workspace
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-cyan-400 transition-colors block">
                  Micro Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Gateway Compliance Column (Right) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest font-mono">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs font-bold font-mono text-zinc-400">
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 hover:underline transition-all block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-cyan-400 hover:underline transition-all block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-cyan-400 hover:underline transition-all block">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-cyan-400 hover:underline transition-all block">
                  Contact Information
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright/support strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-zinc-500 font-bold font-mono space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            © {currentYear} BOOSTCV. Built for Placements. Optimized for ATS.
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-zinc-900 hover:border-cyan-500/20 transition-all">
            <Mail className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-zinc-400">Support:</span>
            <a href="mailto:support@boostcv.in" className="text-white hover:text-cyan-400 transition-colors">
              support@boostcv.in
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
