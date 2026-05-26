"use client";

import React from "react";
import Link from "next/link";
import { Zap, ChevronLeft, CreditCard } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function RefundPage() {
  return (
    <div className="bg-grid-pattern min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center shadow-md">
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
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-72 h-72 bg-cyan-500/5 rounded-full blur-[80px] pointer-events-none" />

        <div className="space-y-8">
          
          {/* Header Title */}
          <div className="space-y-3 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-800/30 text-cyan-400 text-[10px] font-bold font-mono tracking-wider uppercase">
              <CreditCard className="h-3.5 w-3.5" />
              <span>Billing Guarantee Policy</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Refund & Cancellation
            </h1>
            <p className="text-zinc-500 text-xs font-mono font-bold uppercase tracking-wider">
              Last Updated: May 23, 2026
            </p>
          </div>

          <div className="glass-panel border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-6 text-sm text-zinc-400 leading-relaxed font-medium">
            
            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">01 /</span>
                <span>General Refund Principles</span>
              </h2>
              <p>
                BOOSTCV operates under strict undergraduate micro-payment guidelines (₹80 campaign). Since downloading 
                a resume PDF constitutes immediate consumption of digital data services, we operate a 
                <strong className="text-white"> no-questions-asked refund policy under specific technical conditions</strong>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">02 /</span>
                <span>Eligible Technical Claims</span>
              </h2>
              <p>
                You are fully eligible for a 100% refund of your ₹80 payment if:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                <li>Your payment was successfully charged by Razorpay but our Next.js compiler crashed and failed to unlock your PDF document within 30 minutes.</li>
                <li>You were double-charged for the same resume document due to network latency during the gateway verification cycle.</li>
                <li>The downloaded PDF contains severe rendering anomalies that cannot be resolved through our support dashboard within 24 hours of reporting.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">03 /</span>
                <span>Ineligible Conditions</span>
              </h2>
              <p>
                Refunds will NOT be issued for claims based on:
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400 text-xs">
                <li>Changes in personal plans (e.g., "I decided not to apply for jobs anymore").</li>
                <li>Rejections from specific placement offices or companies (shortlisting depends on personal profile details, GPA, and test scores, not just formatting).</li>
                <li>Failing to get 3 referrals on the free path (the paid path is an alternative for instant bypass).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center space-x-2">
                <span className="text-cyan-400 font-bold">04 /</span>
                <span>How to Submit a Refund Claim</span>
              </h2>
              <p>
                To file a support claim, email us at <a href="mailto:support@boostcv.in" className="text-cyan-400 font-mono hover:underline">support@boostcv.in</a> with:
              </p>
              <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-900 text-xs font-mono space-y-1.5">
                <div>- Subject: <span className="text-white font-bold">PLACEMENT REFUND - [Your Order ID]</span></div>
                <div>- Body: Provide your Google-registered email.</div>
                <div>- Proof: Attach the Razorpay payment confirmation receipt.</div>
              </div>
              <p className="text-[11px] text-zinc-500">
                Verified claims are processed back to your original source payment method (UPI / Card / NetBanking) within 5-7 working days.
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
