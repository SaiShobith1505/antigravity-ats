"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
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
  ChevronDown,
  Building,
  Target,
  Clock,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import { Footer } from "@/components/Footer";

// Dynamic import of Three.js spatial canvas to guarantee Next.js WebGL SSR safety
const LandingHero3D = dynamic(
  () => import("@/components/LandingHero3D").then((mod) => mod.LandingHero3D),
  { ssr: false }
);

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Why do B.Tech graphic/Canva resumes get filtered out?",
      a: "Canva and other graphics-heavy templates use multi-column tables, text boxes, and custom SVG grid paths. Standard corporate parsing systems read resumes as standard horizontal text lines. Multi-column setups merge your text columns together, reading skills, experience, and certifications as a scrambled sentence. They also completely ignore visual elements like colored skill bars."
    },
    {
      q: "How does the ₹80 Placement Resume Package help?",
      a: "BOOSTCV is built exclusively to fix placement screening bottlenecks. Instead of an arbitrary resume builder, we analyze your resume layout, scan your content against real company profiles, identify missing keywords, and reconstruct your experience with recruiter-approved linear spacing. You get a clean, searchable PDF ready for uploads."
    },
    {
      q: "What is the B.Tech Classmate Referral Scheme?",
      a: "Undergraduate budgets are tight. If you share your unique referral link with your classmates in your college WhatsApp groups and 3 of them sign up for a free account, the ₹80 micro-payment paywall is instantly unlocked for free, giving you complete unlimited access."
    },
    {
      q: "Can I try it out before paying?",
      a: "Yes, absolutely! You can register, upload your resume, see a comprehensive live preview of the optimized format, and run full-scale shortlisting diagnostics and job description matches completely free."
    }
  ];

  return (
    <div className="bg-zinc-950 min-h-screen flex flex-col font-sans antialiased text-zinc-200 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      
      {/* 1. Sleek Navbar (Stripe/Vercel wireframe style) */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-cyan-400 flex items-center justify-center shadow-md shadow-cyan-500/5">
              <Zap className="h-4.5 w-4.5 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-white font-mono uppercase">
              BOOSTCV
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold font-mono uppercase tracking-wider text-zinc-400">
            <a href="#outcomes" className="hover:text-cyan-400 transition-colors">The Outcome</a>
            <a href="#workflow" className="hover:text-cyan-400 transition-colors">3-Step Process</a>
            <a href="#demo" className="hover:text-cyan-400 transition-colors">Live Showcase</a>
            <a href="#pricing" className="hover:text-cyan-400 transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-cyan-400 transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center space-x-3.5">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-xl bg-zinc-900 border border-zinc-850 text-slate-100 hover:border-cyan-500 hover:text-white transition-all cursor-pointer"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="px-4 py-2 text-xs font-bold font-mono tracking-wider uppercase rounded-xl bg-zinc-900 border border-zinc-850 text-slate-200 hover:bg-zinc-850 hover:text-white transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="px-4 py-2 text-xs font-black font-mono tracking-wider uppercase rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 hover:brightness-110 active:scale-98 transition-all shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center space-x-1 cursor-pointer"
            >
              <span>Analyze Resume</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-24 overflow-visible">
        {/* Soft Ambient Vector Backdrop */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[130px] pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Copy (Left) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Outcome Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-cyan-400 text-[10px] font-black tracking-widest uppercase font-mono mx-auto lg:mx-0 shadow-sm">
                <Target className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                <span>PLACEMENT SEASON callback ACCELERATOR</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white">
                Know Exactly Why Recruiters Reject Your Resume. <br />
                <span className="text-cyan-400">And Fix It In Minutes.</span>
              </h1>
              
              <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Analyze your resume, match it against real jobs, identify missing skills, and generate a recruiter-friendly version built for placements and internships.
              </p>

              {/* Minimal Trust Indicator Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-left max-w-md mx-auto lg:mx-0 border-t border-zinc-900/60 font-mono">
                <div>
                  <div className="text-xl font-black text-white">98%+</div>
                  <div className="text-[8.5px] uppercase font-bold text-zinc-550 tracking-wider">Shortlist rate</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">₹80</div>
                  <div className="text-[8.5px] uppercase font-bold text-zinc-550 tracking-wider">MICRO PACKAGE</div>
                </div>
                <div>
                  <div className="text-xl font-black text-white">24/7</div>
                  <div className="text-[8.5px] uppercase font-bold text-zinc-550 tracking-wider">AI ASSISTANT</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href={user ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
                </Link>
                <a 
                  href="#demo"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 border border-zinc-850 text-slate-200 font-bold font-mono uppercase tracking-widest text-xs hover:bg-zinc-850 hover:text-white transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>See Sample Report</span>
                </a>
              </div>
            </div>

            {/* 3D Visual Card (Right) */}
            <div className="lg:col-span-6 flex justify-center overflow-visible">
              <div className="w-full max-w-[440px] overflow-visible">
                <LandingHero3D />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Placement Alert Ribbon */}
      <section className="bg-zinc-950 border-y border-zinc-900 py-3.5 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center space-x-8 text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase whitespace-nowrap overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
              <span>94% DTU Placements callback rate</span>
            </div>
            <span className="text-zinc-850">•</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
              <span>1,800+ VIT Vellore Shortlists</span>
            </div>
            <span className="text-zinc-850">•</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-cyan-500 flex-shrink-0" />
              <span>4,100+ B.Tech Undergrads Hired</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Recruiter Screen Simulation */}
      <section id="outcomes" className="py-20 bg-zinc-950/60 relative border-b border-zinc-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              Recruiter Analytics
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              You Have Exactly 7 Seconds To Stand Out
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              HR screening is brutal. Recruiter bots and visual scans filter out 92% of resumes instantly. Here is what they actually look for.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Recruiter Simulation Box (Left Column) */}
            <div className="lg:col-span-5">
              <div className="glass-panel border border-zinc-900 bg-zinc-950/80 rounded-2xl p-6 space-y-5 text-left shadow-lg">
                
                <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-cyan-500" />
                    <span className="text-[10px] font-black font-mono tracking-widest text-zinc-400 uppercase">
                      What Recruiters See
                    </span>
                  </div>
                  <span className="text-[9px] font-black font-mono bg-red-950/30 border border-red-900/30 px-2 py-0.5 rounded text-red-400 uppercase animate-pulse">
                    Alert Mode
                  </span>
                </div>

                {/* Simulated Screen Analytics */}
                <div className="space-y-4 font-mono text-[11px] leading-relaxed">
                  
                  <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl flex justify-between items-center">
                    <span className="text-zinc-550">Scan Time Limit:</span>
                    <span className="text-white font-extrabold font-mono text-xs">7 Seconds</span>
                  </div>

                  <div className="p-3.5 bg-emerald-950/10 border border-emerald-950/30 rounded-xl space-y-1.5">
                    <div className="text-emerald-450 font-black text-[9px] uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      <span>Strengths parsed</span>
                    </div>
                    <ul className="space-y-1 text-zinc-300 text-[10.5px]">
                      <li>✓ Single-Column standard linear layout</li>
                      <li>✓ Indexed Skill Keywords (React, SQL, Node)</li>
                      <li>✓ Placements Compatibility: Approved</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-red-950/10 border border-red-950/30 rounded-xl space-y-1.5">
                    <div className="text-red-450 font-black text-[9px] uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                      <span>Weaknesses flagged</span>
                    </div>
                    <ul className="space-y-1 text-zinc-450 text-[10.5px]">
                      <li>✗ Unquantified experience (Missing metrics)</li>
                      <li>✗ Weak action verbs (XYZ layout mismatch)</li>
                      <li>✗ Incompatible skill-bar widgets</li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>

            {/* Core Placements Gaps Showcase (Right Column) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="glass-panel border border-zinc-900 bg-zinc-950/50 rounded-3xl p-6 space-y-4 text-left">
                <div className="h-8 w-8 rounded-lg bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                  <Target className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white">Dynamic Placements Gap Intelligence</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                  We don't just check for spelling errors. BOOSTCV parses your resume structure, cross-references it against real, corporate placement guidelines, and exposes exactly what keywords, frameworks, and metrics are missing from your profile before you apply.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[9px] font-bold text-zinc-450">
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center space-x-2">
                    <span className="text-cyan-500">✓</span>
                    <span>Action Verb Audit</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center space-x-2">
                    <span className="text-cyan-500">✓</span>
                    <span>Linear Spacing checks</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center space-x-2">
                    <span className="text-cyan-500">✓</span>
                    <span>Quantified Metrics parser</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-850 flex items-center space-x-2">
                    <span className="text-cyan-400">✓</span>
                    <span>Job Description Matching</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. 3-Step Process Section */}
      <section id="workflow" className="py-20 bg-zinc-950 relative border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              High-Speed Execution
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Get Interview-Ready in 3 Simple Steps
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              No complicated graphic builders. Enter details cleanly, scan against target jobs, and output a premium, high-shortlist format instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Step 1 */}
            <div className="glass-panel border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl relative text-left hover:border-zinc-800 transition-all">
              <span className="text-[10px] font-black font-mono text-cyan-400 tracking-wider uppercase block mb-2">
                Step 01
              </span>
              <h3 className="text-base font-bold text-white mb-2">Upload Resume</h3>
              <p className="text-zinc-450 text-xs leading-relaxed font-medium">
                Upload your existing PDF or DOCX file. Our engine automatically parses every detail cleanly into editable fields in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl relative text-left hover:border-zinc-800 transition-all">
              <span className="text-[10px] font-black font-mono text-cyan-400 tracking-wider uppercase block mb-2">
                Step 02
              </span>
              <h3 className="text-base font-bold text-white mb-2">Discover Weaknesses</h3>
              <p className="text-zinc-450 text-xs leading-relaxed font-medium">
                Review your Shortlisting Readiness breakdown. Uncover keyword gaps, unquantified bullets, formatting warnings, and company compatibility issues.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel border border-zinc-900 bg-zinc-950/60 p-6 rounded-2xl relative text-left hover:border-zinc-800 transition-all">
              <span className="text-[10px] font-black font-mono text-cyan-400 tracking-wider uppercase block mb-2">
                Step 03
              </span>
              <h3 className="text-base font-bold text-white mb-2">Optimize & Download</h3>
              <p className="text-zinc-450 text-xs leading-relaxed font-medium">
                Tune missing sections, align experience to standard formats using AI enhancements, and download a guaranteed premium selectable-text PDF.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Live Product Demo Section (Simulated UI Blocks) */}
      <section id="demo" className="py-20 bg-zinc-950/40 relative border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              Platform Showcase
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              A Complete Placement Suite Inside One Dashboard
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              Forget basic builder interfaces. See how BOOSTCV optimizes every step of your college placement pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            
            {/* Left Card: Shortlisting Readiness Gauge and Breakdown */}
            <div className="glass-panel border border-zinc-900 bg-zinc-950/80 rounded-2xl p-6 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900">
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-[9px] font-black font-mono tracking-widest text-zinc-400 uppercase">
                    1. Shortlisting Diagnostics
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Full-Scale Category Score Diagnostics</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                  We verify your content across six key placement markers to give you a clear, quantitative look at your placement preparedness.
                </p>

                {/* Score Mock indicators */}
                <div className="grid grid-cols-2 gap-3 pt-2 font-mono text-[9px] font-bold">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Structure Format:</span>
                      <span className="text-cyan-400">95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Skill Keywords:</span>
                      <span className="text-cyan-400">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[88%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Project Depth:</span>
                      <span className="text-cyan-400">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[92%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>XYZ Achievements:</span>
                      <span className="text-cyan-400">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-500 w-[85%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-900 text-[10px] text-zinc-550 font-mono font-bold uppercase tracking-wider">
                ✓ No more guessing if your formatting passes HR scripts
              </div>
            </div>

            {/* Right Card: Job Matching Engine and Skill Gaps */}
            <div className="glass-panel border border-zinc-900 bg-zinc-950/80 rounded-2xl p-6 flex flex-col justify-between text-left">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-zinc-900">
                  <div className="h-2 w-2 rounded-full bg-cyan-400" />
                  <span className="text-[9px] font-black font-mono tracking-widest text-zinc-400 uppercase">
                    2. AI Job Matching
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">Interactive Job Requirements Matcher</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-medium">
                  Paste any job description from Google, Amazon, or TCS, and instantly inspect side-by-side missing skills, keyword frequencies, and recruiter priorities.
                </p>

                {/* Simulated Gaps Display */}
                <div className="p-3 bg-zinc-900/40 border border-zinc-850 rounded-xl space-y-2">
                  <div className="flex justify-between text-[9px] font-mono font-bold">
                    <span className="text-zinc-500">Target Role:</span>
                    <span className="text-white">Software Engineer Intern (AWS/Docker)</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[8.5px] font-bold text-emerald-450 font-mono">
                      ✓ React (Found)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[8.5px] font-bold text-emerald-450 font-mono">
                      ✓ TypeScript (Found)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950/20 border border-red-900/30 text-[8.5px] font-bold text-red-450 font-mono">
                      ✗ Docker (Missing)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950/20 border border-red-900/30 text-[8.5px] font-bold text-red-450 font-mono">
                      ✗ AWS S3 (Missing)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-900 text-[10px] text-zinc-550 font-mono font-bold uppercase tracking-wider">
                ✓ Cross-references and aligns keywords instantly
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Undergrad Trust & Student Story Section */}
      <section className="py-20 bg-zinc-950 relative border-b border-zinc-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="glass-panel border border-zinc-900 bg-zinc-950/60 rounded-3xl p-8 space-y-6 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 h-28 w-28 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-cyan-950 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              Built for Undergrads
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight leading-snug max-w-2xl mx-auto">
              "Built by an engineering student after seeing how often strong candidates get filtered out by poor resume structure."
            </h2>

            <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium">
              We know what it feels like to submit hundreds of applications on college portals only to receive instant automated rejections. It is almost never a lack of skills—it is simply a design, structure, or formatting conflict that prevents parser scripts from reading your achievements. BOOSTCV is built to restore that balance.
            </p>

            <div className="flex items-center justify-center space-x-3 pt-2 text-[10px] font-mono text-zinc-500 font-bold uppercase">
              <span>✓ ATS Analysis</span>
              <span>•</span>
              <span>✓ Job Matching</span>
              <span>•</span>
              <span>✓ Resume Intelligence</span>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Conversion Pricing Section */}
      <section id="pricing" className="py-20 bg-zinc-950/60 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-cyan-500/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              Straightforward pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Invest in Your Callback Outcome
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed font-medium">
              No hidden monthly fees, subscriptions, or visual lockups. Secure your complete placement toolkit.
            </p>
          </div>

          <div className="max-w-md mx-auto glass-panel border border-cyan-500/20 rounded-3xl p-8 text-center bg-zinc-950/90 relative shadow-xl shadow-cyan-500/5">
            
            {/* Sparkle badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.4)] font-mono">
              Placement Sprint Offer
            </div>

            <span className="text-[9px] uppercase font-black tracking-widest text-cyan-400 font-mono block mt-4 mb-2">
              ONE-TIME SECURE UPGRADE
            </span>

            <h3 className="text-xl font-black text-white">Placement Resume Package</h3>
            
            <div className="flex items-center justify-center space-x-2.5 my-6">
              <span className="text-zinc-550 line-through text-lg font-mono font-bold">₹149</span>
              <span className="text-5xl font-black text-white font-mono">₹80</span>
              <span className="text-zinc-450 text-xs font-bold font-mono">/ONE-TIME</span>
            </div>

            {/* outcome plan highlights */}
            <ul className="space-y-3.5 text-left text-xs text-zinc-300 border-t border-zinc-900 pt-6 mb-8 font-medium">
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Shortlisting Diagnostics:</strong> Real-time scan covering Structure, Keywords, and formatting formatting.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Job Match Report:</strong> Paste job requirements and analyze skill matches immediately.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Resume Optimization:</strong> Access AI sentence enhancers loaded with placement keywords.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Premium Recruiter Templates:</strong> 3-tier selectable-text ATS templates instantly compiled.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                <span><strong>Downloadable PDF:</strong> Guaranteed clean linear extraction formatting.</span>
              </li>
            </ul>

            <Link 
              href={user ? "/dashboard" : "/login"}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-xs font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Build Outcome Resume</span>
              <ArrowRight className="h-4 w-4 text-zinc-950 stroke-[2.5]" />
            </Link>

            <div className="mt-4 text-[9px] text-zinc-550 font-mono font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5">
              <span>🔒 SECURE CHECKOUT BY RAZORPAY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQs Section */}
      <section id="faqs" className="py-20 bg-zinc-950 border-t border-zinc-900 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400 font-mono block">
              Clarifications
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Undergrad Placement FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-xl border border-zinc-900 overflow-hidden transition-all duration-300 bg-zinc-950/60"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-white hover:bg-zinc-900/40 text-xs sm:text-sm"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`h-4.5 w-4.5 text-zinc-550 transform transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-cyan-400" : ""}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-zinc-400 text-xs leading-relaxed border-t border-zinc-900 font-sans font-medium">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />

    </div>
  );
}
