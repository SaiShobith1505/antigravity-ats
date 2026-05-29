"use client";

import React from "react";
import Link from "next/link";
import { Zap, ShieldCheck, Mail, Lock, CheckCircle2 } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-stone-200 pt-16 pb-8 text-sm text-[#6B7280] font-medium relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12 border-b border-stone-200">
          
          {/* Brand & Tagline Column (Left) */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center space-x-2.5 group">
              <div className="h-9 w-9 rounded-lg bg-[#1F5C4A] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300">
                <Zap className="h-5 w-5 text-white stroke-[2.5]" />
              </div>
              <span className="text-xl font-black tracking-tight text-[#1C1C1C] font-sans">
                BOOSTCV
              </span>
            </Link>
            
            <p className="text-xs text-[#6B7280] max-w-sm leading-relaxed font-sans">
              Engineered to help you secure placement callbacks and pass HR screenings. 
              Get your resume placement-ready with high-trust resume intelligence.
            </p>

            {/* Quick Trust Badges */}
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] font-bold font-sans tracking-wide text-[#6B7280]">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F8F7F4] border border-stone-200">
                <Lock className="h-3 w-3 text-[#1F5C4A]" />
                <span>Razorpay Secured</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F8F7F4] border border-stone-200">
                <CheckCircle2 className="h-3 w-3 text-[#1F5C4A]" />
                <span>Verified Format</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F8F7F4] border border-stone-200">
                <ShieldCheck className="h-3 w-3 text-[#1F5C4A]" />
                <span>Google Sync</span>
              </div>
            </div>
          </div>

          {/* Quick Links Column (Center) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider font-sans">
              Product Intelligence
            </h4>
            <ul className="space-y-2.5 text-xs font-bold font-sans">
              <li>
                <Link href="/" className="hover:text-[#1F5C4A] transition-colors block">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1F5C4A] transition-colors block">
                  Resume Health Report
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1F5C4A] transition-colors block">
                  Resume Builder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#1F5C4A] transition-colors block">
                  User Workspace
                </Link>
              </li>
              <li>
                <Link href="/#pricing" className="hover:text-[#1F5C4A] transition-colors block">
                  Micro Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Gateway Compliance Column (Right) */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-black text-[#1C1C1C] uppercase tracking-wider font-sans">
              Legal & Compliance
            </h4>
            <ul className="space-y-2.5 text-xs font-bold font-sans text-[#6B7280]">
              <li>
                <Link href="/privacy" className="hover:text-[#1F5C4A] hover:underline transition-all block">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#1F5C4A] hover:underline transition-all block">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#1F5C4A] hover:underline transition-all block">
                  Refund & Cancellation Policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#1F5C4A] hover:underline transition-all block">
                  Contact Information
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright/support strip */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-[#6B7280] font-bold font-sans space-y-4 md:space-y-0">
          <div className="text-center md:text-left">
            © {currentYear} BOOSTCV. Built for Placements.
          </div>

          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-[#F8F7F4] border border-stone-200 hover:border-[#1F5C4A]/20 transition-all">
            <Mail className="h-3.5 w-3.5 text-[#1F5C4A]" />
            <span className="text-[#6B7280]">Support:</span>
            <a href="mailto:support@boostcv.in" className="text-[#1C1C1C] hover:text-[#1F5C4A] transition-colors">
              support@boostcv.in
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
