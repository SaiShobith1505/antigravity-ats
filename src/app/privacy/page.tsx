"use client";

import React from "react";
import Link from "next/link";
import { Zap, ChevronLeft, Shield } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <div className="bg-grid-pattern min-h-screen flex flex-col font-sans selection:bg-[#1F5C4A]/30 selection:text-[#2F7A62]/30">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#1F5C4A] to-[#2F7A62] flex items-center justify-center shadow-md">
              <Zap className="h-5 w-5 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-mono">
              BOOSTCV
            </span>
          </Link>

          <Link 
            href="/"
            className="px-4 py-2 text-xs font-extrabold rounded-lg bg-zinc-900 border border-zinc-800 text-slate-200 hover:text-white transition-all flex items-center space-x-1"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Document Content */}
      <main className="flex-grow max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 relative z-10">
        
        {/* Glow behind header */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-[#1F5C4A]/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-8">
          
          {/* Header Title */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#1F5C4A]/10/40 border border-[#1F5C4A]/20/30 text-[#1F5C4A] text-[10px] font-bold font-mono tracking-wider uppercase">
              <Shield className="h-3.5 w-3.5" />
              <span>Security & Trust System</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Privacy Policy
            </h1>
            <p className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
              Last Updated: May 23, 2026
            </p>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-400 leading-relaxed font-medium">
            
            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">01 /</span>
                <span>Information We Collect</span>
              </h2>
              <p>
                At BOOSTCV, we collect personal information you explicitly provide when creating your resume. 
                This includes names, contact details (phone, email, links), academic records, career history, skills, 
                and list of projects. We also sync your profile identity using Google OAuth secure sign-in variables.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">02 /</span>
                <span>How We Use Your Data</span>
              </h2>
              <p>
                We use your details strictly to:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                <li>Generate and score standard ATS-selectable resumes dynamically.</li>
                <li>Verify underlying placement referral counts across B.Tech networks.</li>
                <li>Process secure underlying micro-payments via Razorpay checkout services.</li>
                <li>Keep your saved edits synced and cached across devices securely.</li>
              </ul>
              <p className="text-xs text-zinc-500 italic">
                We absolutely NEVER sell, distribute, or rent your resume details to third-party advertising or recruitment networks.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">03 /</span>
                <span>Security Controls</span>
              </h2>
              <p>
                Your resume documents are structured as private nodes protected by Firebase Authentication rules. 
                All user data transmitted over client networks uses strong TLS/SSL encryption pathways. Payment verification 
                records are validated securely on our Next.js backend securely before database registers are toggled.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">04 /</span>
                <span>Undergrad Network Cookies</span>
              </h2>
              <p>
                We use standard client-side browser tokens (localStorage and basic analytics cookies) to authenticate sessions 
                and keep your working form draft saved safely between browser window shutdowns.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">05 /</span>
                <span>Legal Disclosures</span>
              </h2>
              <p>
                BOOSTCV will only disclose user data when strictly required under Indian placement regulatory provisions, 
                court warrants, or to defend our systems against active cybersecurity threats.
              </p>
            </section>

          </div>
        </div>
      </main>

      {/* Premium Footer */}
      <Footer />

    </div>
  );
}
