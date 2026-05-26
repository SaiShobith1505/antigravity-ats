"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { AtsScoreGauge } from "@/components/AtsScoreGauge";
import { 
  FileText, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  ArrowRight, 
  ShieldCheck, 
  TrendingUp, 
  Zap, 
  Users,
  Smartphone,
  ChevronDown
} from "lucide-react";
import { Footer } from "@/components/Footer";

export default function LandingPage() {
  const { user, signInWithGoogle } = useAuth();
  const [tickerScore, setTickerScore] = useState(38);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Simulated scan animation for hero section
  useEffect(() => {
    const interval = setInterval(() => {
      setTickerScore((prev) => {
        if (prev >= 98) return 38;
        return prev + 15;
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const faqs = [
    {
      q: "Why do B.Tech graphic/Canva resumes fail?",
      a: "Canva and other drag-and-drop builders use multi-column tables, text boxes, and SVG elements. ATS parsing systems (like Taleo, Workday) read resumes as linear text. Multi-column structures merge your text horizontally, turning 'Software Intern' and 'VIT College' into an unreadable garbled mess."
    },
    {
      q: "Can I use colors, profile pictures, or skill bars?",
      a: "No! Absolutely not. Skill bars and circular graphics are completely invisible to ATS systems. Profile pictures are ignored or can cause rejection due to hiring bias regulations. BOOSTCV generates standard, recruiter-approved black-and-white, single-column structures that guarantee a 98%+ parse score."
    },
    {
      q: "How does the ₹80 micro-payment work?",
      a: "You can build your resume, use our AI bullet enhancers, and run real-time checks completely free of charge. We show you a full live preview. If you love the result, pay a one-time ₹80 micro-payment to instantly unlock your downloadable, high-fidelity selectable text PDF."
    },
    {
      q: "Can I get my download for free?",
      a: "Yes! If you share your unique referral link with 3 classmates in your B.Tech WhatsApp groups and they sign up, your paywall is instantly unlocked for free."
    }
  ];

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

          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-zinc-400">
            <a href="#problem" className="hover:text-cyan-400 transition-colors">The Problem</a>
            <a href="#features" className="hover:text-cyan-400 transition-colors">Core Features</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-cyan-400 transition-colors">FAQs</a>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-slate-100 hover:border-cyan-500 hover:text-white transition-all shadow-sm"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="px-4 py-2 text-xs md:text-sm font-semibold rounded-lg bg-zinc-900 border border-zinc-800 text-slate-200 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                Sign In
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="px-4 py-2 text-xs md:text-sm font-extrabold rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 hover:brightness-110 active:brightness-95 transition-all shadow-[0_0_15px_rgba(6,182,212,0.3)] flex items-center space-x-1"
            >
              <span>Build Resume</span>
              <ArrowRight className="h-3 w-3 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        {/* Abstract Glowing Cyber Circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Copy (Left) */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              {/* Placement Season Alert */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-800/50 text-cyan-400 text-xs font-semibold tracking-wide uppercase mx-auto lg:mx-0">
                <Zap className="h-3.5 w-3.5 animate-pulse" />
                <span>2026 Placements Edition Now Live</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
                Your Resume is Getting <span className="gradient-glow-text">Rejected</span> Before HR Sees It.
              </h1>
              
              <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-medium">
                92% of B.Tech resumes fail basic ATS parser scripts due to columns, tables, and Canva grids. BOOSTCV generates clean, single-column layouts engineered to hit 98%+ parse scores and secure callbacks.
              </p>

              {/* Real-time Statistics Ticker */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-left max-w-lg mx-auto lg:mx-0 border-t border-zinc-900">
                <div>
                  <div className="text-2xl font-black text-cyan-400 font-mono">98%+</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">ATS Score Guaranteed</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">₹80</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Undergrad Micro-Price</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-white font-mono">12,000+</div>
                  <div className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Resumes Passed</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href={user ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-base shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Build ATS Optimized Resume</span>
                  <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                </Link>
                <Link 
                  href="/sandbox"
                  className="w-full sm:w-auto px-8 py-4 rounded-xl bg-zinc-900 border border-zinc-800 text-slate-200 font-bold hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all flex items-center justify-center space-x-2"
                >
                  <span>Test My Current Resume</span>
                  <FileText className="h-4 w-4 text-zinc-500" />
                </Link>
              </div>
            </div>

            {/* Simulated Live ATS Diagnostics (Right) */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-[400px] glass-panel rounded-2xl p-6 border border-zinc-800 animate-neon-pulse relative">
                
                {/* Glowing decorative indicator */}
                <div className="absolute -top-1.5 -right-1.5 h-3 w-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#06b6d4] animate-ping" />

                <div className="flex items-center justify-between pb-4 border-b border-zinc-900 mb-6">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono font-bold tracking-widest text-zinc-400 uppercase">
                      Parser Sandbox
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    Live Diagnostics
                  </span>
                </div>

                <div className="flex justify-center mb-6">
                  <AtsScoreGauge score={tickerScore} size={150} />
                </div>

                {/* Score indicators matching the score */}
                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                    <span className="text-zinc-500">Structure Scan:</span>
                    {tickerScore < 50 ? (
                      <span className="text-red-500 flex items-center space-x-1 font-bold">
                        <XCircle className="h-3.5 w-3.5 inline mr-1" /> Multi-Column Gap
                      </span>
                    ) : tickerScore < 80 ? (
                      <span className="text-amber-500 flex items-center space-x-1 font-bold">
                        <XCircle className="h-3.5 w-3.5 inline mr-1" /> Missing Keywords
                      </span>
                    ) : (
                      <span className="text-cyan-400 flex items-center space-x-1 font-bold">
                        <CheckCircle className="h-3.5 w-3.5 inline mr-1" /> Perfect Single Column
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                    <span className="text-zinc-500">Unreadable Elements:</span>
                    {tickerScore < 50 ? (
                      <span className="text-red-500 font-bold">Tables/Graphics (-25%)</span>
                    ) : tickerScore < 80 ? (
                      <span className="text-amber-500 font-bold">Skill Bars Found (-10%)</span>
                    ) : (
                      <span className="text-cyan-400 font-bold">0 Violations Detected</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-2 rounded bg-zinc-950 border border-zinc-900">
                    <span className="text-zinc-500">Quantified Achievements:</span>
                    {tickerScore < 80 ? (
                      <span className="text-zinc-400">Scan Pending...</span>
                    ) : (
                      <span className="text-cyan-400 font-bold">Yes (XYZ Format)</span>
                    )}
                  </div>
                </div>

                <div className="mt-6 text-center text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                  Diagnostics update automatically
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Trust & Placement Season Alert Bar */}
      <section className="bg-zinc-950 py-4 border-y border-zinc-900 overflow-hidden relative">
        <div className="flex items-center justify-center space-x-8 text-xs font-mono text-zinc-500 select-none animate-marquee whitespace-nowrap">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
            <span>VIT VELLORE: 1,840+ callback reports</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
            <span>DTU DELHI: 94% interview booking rate</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
            <span>SRM UNIVERSITY: 3,200+ resumes generated</span>
          </div>
          <span className="text-zinc-800">|</span>
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-3.5 w-3.5 text-cyan-500" />
            <span>B.TECH PLACEMENT READY (100% SUCCESS)</span>
          </div>
        </div>
      </section>

      {/* The Core Problem (Before vs After) */}
      <section id="problem" className="py-20 bg-zinc-950/60 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-500 font-mono">
              The ATS Hard Truth
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Canva-Style Graphic Resumes Are Instantly Rejected
            </p>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">
              Check out how standard ATS parsers see a fancy graphic resume versus our clean single-column BOOSTCV template.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            
            {/* Graphic Resume Fail */}
            <div className="glass-panel rounded-2xl p-6 border border-red-950/30 bg-red-950/5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-red-950/20">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-sm font-extrabold text-red-400 tracking-tight">
                      Fancy Multi-Column Resume
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-red-950/50 text-red-500 border border-red-900/30">
                    Failed Parser: 8% Score
                  </span>
                </div>

                <div className="space-y-4 text-xs font-mono opacity-80 mb-6">
                  <div className="p-3 bg-red-950/20 border border-red-950/40 rounded text-red-300">
                    ⚠️ <strong>Parser Glitch:</strong> Side-by-side elements were merged horizontally. <br />
                    <span className="text-[10px] text-red-400 mt-2 block font-sans">
                      Reads as: <em>\"React Node.js Intern VIT University 2024 CGPA 9.2 SQL Docker Git...\"</em> (Education, Skills, and Internships are completely scrambled into one sentence).
                    </span>
                  </div>
                  <div className="p-3 bg-red-950/20 border border-red-950/40 rounded text-red-300">
                    ❌ <strong>Skill bar graphics</strong> are seen as empty icons. No skill keywords are indexed.
                  </div>
                  <div className="p-3 bg-red-950/20 border border-red-950/40 rounded text-red-300">
                    ❌ <strong>Two-column grids</strong> cause the software to miss up to 60% of your experience details.
                  </div>
                </div>
              </div>

              <div className="text-center font-bold text-sm text-red-500 py-2 border-t border-red-950/20 uppercase tracking-widest font-mono">
                HR never reads this. Rejection email sent.
              </div>
            </div>

            {/* BOOSTCV Success */}
            <div className="glass-panel rounded-2xl p-6 border border-cyan-900/30 bg-cyan-950/5 relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-cyan-900/20">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-cyan-400" />
                    <span className="text-sm font-extrabold text-cyan-400 tracking-tight">
                      BOOSTCV Single-Column
                    </span>
                  </div>
                  <span className="text-xs font-bold font-mono px-2 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-900/30">
                    Pass Score: 98% Guaranteed
                  </span>
                </div>

                <div className="space-y-4 text-xs font-mono opacity-80 mb-6">
                  <div className="p-3 bg-cyan-950/20 border border-cyan-950/40 rounded text-cyan-300">
                    ✅ <strong>Linear Text Flow:</strong> Single-column standard structure makes it 100% readable. <br />
                    <span className="text-[10px] text-cyan-400 mt-2 block font-sans">
                      Reads as: <em>\"Backend Engineering Intern at InnovateTech Solutions (May 2025 - July 2025)\"</em> (Pristine logical order is successfully parsed).
                    </span>
                  </div>
                  <div className="p-3 bg-cyan-950/20 border border-cyan-950/40 rounded text-cyan-300">
                    ✅ <strong>Keyword Rich:</strong> Custom B.Tech placement checklist scans index every language/tool automatically.
                  </div>
                  <div className="p-3 bg-cyan-950/20 border border-cyan-950/40 rounded text-cyan-300">
                    ✅ <strong>Google XYZ Formatting:</strong> Experience is bulleted with clear numbers (e.g. \"latency down by 32%\").
                  </div>
                </div>
              </div>

              <div className="text-center font-bold text-sm text-cyan-400 py-2 border-t border-cyan-900/20 uppercase tracking-widest font-mono">
                Pristine parsing. HR Callback scheduled.
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="py-20 bg-zinc-950 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-500 font-mono">
              SaaS Engine Architecture
            </h2>
            <p className="text-3xl sm:text-4xl font-black text-white leading-tight">
              Engineered for High-Yield Callback Rates
            </p>
            <p className="text-zinc-400 text-sm sm:text-base font-medium">
              Everything B.Tech undergraduates need to beat placement season filters, built in one clean dashboard.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800 hover:scale-102 transition-all">
              <div className="h-10 w-10 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Form-Based Builder</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Mobile-optimized form structures mapping personal, B.Tech education, and placement-specific details in 5 minutes.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800 hover:scale-102 transition-all">
              <div className="h-10 w-10 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Bullet Enhancer</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Paste rough experience details and the Gemini API will instantly convert it into professional recruiter bullets loaded with high-impact action verbs.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800 hover:scale-102 transition-all">
              <div className="h-10 w-10 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Real-time ATS Score</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Heuristic checker providing live scores, visual compatibility feedback, keyword indexes, and section diagnostics.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="glass-panel p-6 rounded-2xl border border-zinc-900 hover:border-zinc-800 hover:scale-102 transition-all">
              <div className="h-10 w-10 rounded-lg bg-cyan-950/50 border border-cyan-800/40 flex items-center justify-center text-cyan-400 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Clean Text Export</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Exports highly indexable black-and-white standard PDFs using native nodes, guaranteeing a 100% extraction score.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Direct Pricing CTA Section */}
      <section id="pricing" className="py-20 bg-zinc-950/40 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-md mx-auto glass-panel border border-cyan-900/30 rounded-3xl p-8 text-center bg-zinc-950/90 relative">
            {/* Pulsing Tag */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              Limited Placement Offer
            </div>

            <span className="text-xs uppercase font-extrabold tracking-widest text-cyan-400 font-mono block mt-4 mb-2">
              Pay Once. Unlock Forever.
            </span>

            <h3 className="text-2xl font-black text-white mb-4">Pristine ATS Resume Plan</h3>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <span className="text-zinc-500 line-through text-lg font-mono">₹149</span>
              <span className="text-5xl font-black text-white font-mono">₹80</span>
              <span className="text-zinc-400 text-sm font-bold">/one-time</span>
            </div>

            <ul className="space-y-3.5 text-left text-sm text-zinc-300 border-t border-zinc-900 pt-6 mb-8 font-medium">
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0" />
                <span>Unlimited Resume Form Edits</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0" />
                <span>Full AI-Powered Bullet Enhancer</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0" />
                <span>100% Selectable Text PDF Export</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0" />
                <span>Real-Time Keyword & Format Scans</span>
              </li>
            </ul>

            <Link 
              href={user ? "/dashboard" : "/login"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-base shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
            >
              <span>Build ATS Resume Now</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>

            <div className="mt-4 text-[10px] text-zinc-500 font-mono font-bold uppercase tracking-wider">
              🔒 Secure Razorpay Checkout
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section id="faqs" className="py-20 bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-cyan-500 font-mono">
              Got Questions?
            </h2>
            <p className="text-3xl font-black text-white leading-tight">
              Direct Answers for Undergrads
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-xl border border-zinc-900 overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-white hover:bg-zinc-900/50"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`h-5 w-5 text-zinc-500 transform transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-cyan-400" : ""}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-zinc-400 text-sm leading-relaxed border-t border-zinc-900">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <Footer />

    </div>
  );
}
