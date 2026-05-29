"use client";

import React from "react";
import Link from "next/link";
import { Zap, ChevronLeft, FileText } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="bg-grid-pattern min-h-screen flex flex-col font-sans selection:bg-[#1F5C4A]/30 selection:text-[#2F7A62]/30">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-[#1F5C4A] to-[#2F7A62] flex items-center justify-center shadow-md">
              <Zap className="h-5.5 w-5.5 text-zinc-950 stroke-[2.5]" />
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
              <FileText className="h-3.5 w-3.5" />
              <span>Service Legal Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Terms & Conditions
            </h1>
            <p className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
              Last Updated: May 23, 2026
            </p>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-400 leading-relaxed font-medium">
            
            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">01 /</span>
                <span>Acceptance of Agreement</span>
              </h2>
              <p>
                By signing up for BOOSTCV, accessing our student dashboard, using our AI-heuristic scoring models, 
                or completing a Razorpay checkout, you agree to comply with and be bound by these Terms & Conditions. 
                If you are creating resumes on behalf of other undergraduates, you warrant that you have their explicit consent.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">02 /</span>
                <span>User Workspace Guidelines</span>
              </h2>
              <p>
                Users are solely responsible for keeping their login credentials secure and for all actions taken through their 
                workspace profiles. You agree that:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                <li>All resume details submitted are accurate, truthful, and non-plagiarized.</li>
                <li>You will not use automated scripts to scrap or disrupt the PDF compiler systems.</li>
                <li>Referral schemes (sharing links to unlock for free) must reflect authentic peer sign-ups. Mock/self-referral tricks are subject to instant workspace termination.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">03 /</span>
                <span>Micro-Payments & Commercial Purchases</span>
              </h2>
              <p>
                BOOSTCV charges a one-time placement campaign fee of ₹80 (inclusive of relevant taxes) to unlock 
                the downloadable, high-fidelity selectable text PDF of your custom resume layout. All transactions 
                are securely routed via Razorpay Checkout protocols. Verification states are saved cryptographically.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">04 /</span>
                <span>Limitations of Placement Placement</span>
              </h2>
              <p>
                BOOSTCV is an engineering tool designed to optimize resume parsing structures based on standard single-column 
                recruiter schemas. We do NOT guarantee job callbacks, shortlist outcomes, placement clearances, 
                or interview success. Results vary based on actual student merit, market requirements, and hiring seasons.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-[#1F5C4A] font-bold">05 /</span>
                <span>Modification of Services</span>
              </h2>
              <p>
                We reserve the right to alter features, micro-pricing bounds (such as placement discount schemes), 
                and terms of use without prior notice. Continued use of BOOSTCV after updates implies full acceptance.
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
