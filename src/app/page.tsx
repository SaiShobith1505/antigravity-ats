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
      q: "How does the Placement Resume Package help?",
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
    <div className="bg-[#B8E3E9] min-h-screen flex flex-col font-sans antialiased text-[#1E1E1E] overflow-x-hidden selection:bg-[#0B2E33]/10 selection:text-[#0B2E33]">
      
      {/* 1. Sleek Navbar (Stripe/Vercel wireframe style) */}
      <header className="sticky top-0 z-50 border-b border-stone-200/80 bg-white/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-[#0B2E33] flex items-center justify-center shadow-md">
              <Zap className="h-4.5 w-4.5 text-white stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-[#1E1E1E] font-sans uppercase">
              BOOSTCV
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-8 text-xs font-bold font-sans uppercase tracking-wider text-[#666666]">
            <a href="#outcomes" className="hover:text-[#0B2E33] transition-colors">The Outcome</a>
            <a href="#workflow" className="hover:text-[#0B2E33] transition-colors">3-Step Process</a>
            <a href="#demo" className="hover:text-[#0B2E33] transition-colors">Live Showcase</a>
            <a href="#pricing" className="hover:text-[#0B2E33] transition-colors">Pricing</a>
            <a href="#faqs" className="hover:text-[#0B2E33] transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center space-x-3.5">
            {user ? (
              <Link 
                href="/dashboard" 
                className="px-4 py-2 text-xs font-bold font-sans tracking-wider uppercase rounded-xl bg-white border border-stone-200 text-[#1E1E1E] hover:bg-stone-50 transition-all cursor-pointer shadow-sm"
              >
                Dashboard
              </Link>
            ) : (
              <Link 
                href="/login"
                className="px-4 py-2 text-xs font-bold font-sans tracking-wider uppercase rounded-xl bg-white border border-stone-200 text-[#1E1E1E] hover:bg-stone-50 transition-colors cursor-pointer shadow-sm"
              >
                Sign In
              </Link>
            )}
            <Link 
              href={user ? "/dashboard" : "/login"}
              className="px-4 py-2 text-xs font-black font-sans tracking-wider uppercase rounded-xl bg-[#0B2E33] text-white hover:bg-[#004f2f] active:scale-98 transition-all shadow-sm flex items-center space-x-1 cursor-pointer"
            >
              <span>Analyze Resume</span>
              <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-20 overflow-visible bg-grid-pattern">
        {/* Soft Ambient Backdrop */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#4F7C82]/5 rounded-full blur-[130px] pointer-events-none z-0" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Copy (Left) */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              
              {/* Outcome Badge */}
              <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white border border-stone-200 text-[#0B2E33] text-[10px] font-black tracking-wider uppercase font-sans mx-auto lg:mx-0 shadow-sm">
                <Target className="h-3.5 w-3.5 text-[#0B2E33]" />
                <span>PLACEMENT SEASON SHORTLIST ACCELERATOR</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-[#1E1E1E]">
                Get More <br />
                <span className="text-[#0B2E33]">Interview Calls.</span>
              </h1>
              
              <p className="text-[#666666] text-sm sm:text-base max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Know exactly what recruiters see in your resume, identify weaknesses, match real job descriptions, and build a stronger application in minutes.
              </p>

              {/* Minimal Trust Indicator Grid */}
              <div className="grid grid-cols-3 gap-4 pt-4 text-left max-w-md mx-auto lg:mx-0 border-t border-stone-200 font-sans">
                <div>
                  <div className="text-xl font-black text-[#1E1E1E]">98%+</div>
                  <div className="text-[8.5px] uppercase font-black text-zinc-400 tracking-wider">Shortlist rate</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#1E1E1E]">₹80</div>
                  <div className="text-[8.5px] uppercase font-black text-zinc-400 tracking-wider">MICRO PACKAGE</div>
                </div>
                <div>
                  <div className="text-xl font-black text-[#1E1E1E]">24/7</div>
                  <div className="text-[8.5px] uppercase font-black text-zinc-400 tracking-wider">AI ASSISTANT</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link 
                  href={user ? "/dashboard" : "/login"}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0B2E33] text-white hover:bg-[#004f2f] font-black text-xs font-sans uppercase tracking-wider shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <span>Analyze My Resume</span>
                  <ArrowRight className="h-4 w-4 text-white stroke-[2.5]" />
                </Link>
                <a 
                  href="#demo"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white border border-stone-200 text-[#1E1E1E] font-bold font-sans uppercase tracking-wider text-xs hover:bg-stone-50 hover:text-black transition-all flex items-center justify-center space-x-1.5 shadow-sm"
                >
                  <span>View Sample Report</span>
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
      <section className="bg-white border-y border-stone-200 py-3.5 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-center">
          <div className="flex items-center space-x-8 text-[10px] font-sans font-extrabold tracking-widest text-[#666666] uppercase whitespace-nowrap overflow-x-auto no-scrollbar py-1">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-[#2E7D32] flex-shrink-0" />
              <span>94% DTU Placements callback rate</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-[#2E7D32] flex-shrink-0" />
              <span>1,800+ VIT Vellore Shortlists</span>
            </div>
            <span className="text-stone-300">•</span>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-3.5 w-3.5 text-[#2E7D32] flex-shrink-0" />
              <span>4,100+ B.Tech Undergrads Hired</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4. The Recruiter Screen Simulation */}
      <section id="outcomes" className="py-20 relative border-b border-stone-200/60 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Recruiter Perspective
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              You Have Exactly 7 Seconds To Stand Out
            </h2>
            <p className="text-[#666666] text-sm leading-relaxed font-medium">
              HR screening is brutal. Recruiter bots and visual scans filter out 92% of resumes instantly. Here is what they actually look for.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl mx-auto">
            
            {/* Recruiter Simulation Box (Left Column) */}
            <div className="lg:col-span-5">
              <div className="glass-panel border border-stone-200 bg-white rounded-2xl p-6 space-y-5 text-left shadow-sm">
                
                <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4.5 w-4.5 text-[#0B2E33]" />
                    <span className="text-[10px] font-black font-sans tracking-wide text-[#666666] uppercase">
                      What Recruiters See
                    </span>
                  </div>
                  <span className="text-[9px] font-black font-sans bg-[#D32F2F]/6 border border-[#D32F2F]/15 px-2 py-0.5 rounded-full text-[#D32F2F] uppercase">
                    Scan Report
                  </span>
                </div>

                {/* Simulated Screen Analytics */}
                <div className="space-y-4 font-sans text-[11px] leading-relaxed">
                  
                  <div className="p-3 bg-stone-50 border border-stone-100 rounded-xl flex justify-between items-center text-zinc-650">
                    <span className="text-[#666666]">Scan Time Limit:</span>
                    <span className="text-[#1E1E1E] font-black text-xs">7 Seconds</span>
                  </div>

                  <div className="p-3.5 bg-[#2E7D32]/4 border border-[#2E7D32]/12 rounded-xl space-y-1.5">
                    <div className="text-[#2E7D32] font-black text-[9px] uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2E7D32]" />
                      <span>Strengths parsed</span>
                    </div>
                    <ul className="space-y-1 text-[#1E1E1E] text-[10.5px] font-medium">
                      <li>✓ Single-Column standard linear layout</li>
                      <li>✓ Indexed Skill Keywords (React, SQL, Node)</li>
                      <li>✓ Placement Template: Approved</li>
                    </ul>
                  </div>

                  <div className="p-3.5 bg-[#D32F2F]/4 border border-[#D32F2F]/12 rounded-xl space-y-1.5">
                    <div className="text-[#D32F2F] font-black text-[9px] uppercase tracking-wider flex items-center space-x-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#D32F2F]" />
                      <span>Weaknesses flagged</span>
                    </div>
                    <ul className="space-y-1 text-[#666666] text-[10.5px]">
                      <li>✗ Unquantified projects (Missing metrics)</li>
                      <li>✗ Muted impact verbs (XYZ layout mismatch)</li>
                      <li>✗ Skill-bar graphics (Invisible to parser)</li>
                    </ul>
                  </div>

                </div>

              </div>
            </div>

            {/* Core Placements Gaps Showcase (Right Column) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="glass-panel border border-stone-200 bg-white rounded-3xl p-6 space-y-4 text-left shadow-sm">
                <div className="h-8 w-8 rounded-lg bg-[#0B2E33]/6 border border-[#0B2E33]/15 flex items-center justify-center text-[#0B2E33]">
                  <Target className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-[#1E1E1E]">Get Shortlisted Faster</h3>
                <p className="text-[#666666] text-xs leading-relaxed font-medium">
                  We don't just check for spelling errors. BOOSTCV parses your resume structure, cross-references it against real, corporate placement guidelines, and exposes exactly what keywords, frameworks, and metrics are missing from your profile before you apply.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 font-sans text-[10px] font-bold text-[#666666]">
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center space-x-2">
                    <span className="text-[#0B2E33]">✓</span>
                    <span>Action Verb Audit</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center space-x-2">
                    <span className="text-[#0B2E33]">✓</span>
                    <span>Linear Spacing checks</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center space-x-2">
                    <span className="text-[#0B2E33]">✓</span>
                    <span>Quantified Metrics parser</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-100 flex items-center space-x-2">
                    <span className="text-[#0B2E33]">✓</span>
                    <span>Job Description Matching</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 5. 3-Step Process Section */}
      <section id="workflow" className="py-20 relative border-b border-stone-200/60 bg-[#B8E3E9]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Step-by-Step Guide
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Create a Stronger Profile in Minutes
            </h2>
            <p className="text-[#666666] text-sm leading-relaxed font-medium">
              No complicated graphic builders. Enter details cleanly, scan against target jobs, and output a premium, high-shortlist format instantly.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Step 1 */}
            <div className="glass-panel border border-stone-200 bg-white p-5 rounded-2xl relative text-left hover-card-premium shadow-sm">
              <span className="text-[10px] font-black font-sans text-[#0B2E33] tracking-wider uppercase block mb-1.5">
                Step 01
              </span>
              <h3 className="text-sm font-extrabold text-[#1E1E1E] mb-1.5">1. Upload Resume</h3>
              <p className="text-[#666666] text-[11px] leading-relaxed font-medium">
                Upload your existing PDF or DOCX file. Our engine automatically parses every detail cleanly into editable fields in seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-panel border border-stone-200 bg-white p-5 rounded-2xl relative text-left hover-card-premium shadow-sm">
              <span className="text-[10px] font-black font-sans text-[#0B2E33] tracking-wider uppercase block mb-1.5">
                Step 02
              </span>
              <h3 className="text-sm font-extrabold text-[#1E1E1E] mb-1.5">2. Analyze Resume</h3>
              <p className="text-[#666666] text-[11px] leading-relaxed font-medium">
                Review your Resume Health score. Uncover missing skills, unquantified bullets, formatting warnings, and recruiter gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-panel border border-stone-200 bg-white p-5 rounded-2xl relative text-left hover-card-premium shadow-sm">
              <span className="text-[10px] font-black font-sans text-[#0B2E33] tracking-wider uppercase block mb-1.5">
                Step 03
              </span>
              <h3 className="text-sm font-extrabold text-[#1E1E1E] mb-1.5">3. Improve Resume</h3>
              <p className="text-[#666666] text-[11px] leading-relaxed font-medium">
                Tune missing sections, align experience to standard formats using AI sentence enhancers, and fix weak verb phrasings.
              </p>
            </div>

            {/* Step 4 */}
            <div className="glass-panel border border-stone-200 bg-white p-5 rounded-2xl relative text-left hover-card-premium shadow-sm">
              <span className="text-[10px] font-black font-sans text-[#0B2E33] tracking-wider uppercase block mb-1.5">
                Step 04
              </span>
              <h3 className="text-sm font-extrabold text-[#1E1E1E] mb-1.5">4. Download optimized</h3>
              <p className="text-[#666666] text-[11px] leading-relaxed font-medium">
                Download a clean, highly indexable, recruiter-approved linear PDF ready for direct college placements portal uploads.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Live Product Demo Section (Simulated UI Blocks) */}
      <section id="demo" className="py-20 bg-white relative border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Live Dashboard Preview
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              A Complete Placement Suite Inside One Dashboard
            </h2>
            <p className="text-[#666666] text-sm leading-relaxed font-medium">
              Forget basic builder interfaces. See how BOOSTCV optimizes every step of your college placement pipeline.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch max-w-5xl mx-auto">
            
            {/* Left Card: Resume Health and Breakdown */}
            <div className="glass-panel border border-stone-200 bg-[#B8E3E9]/30 rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                  <div className="h-2 w-2 rounded-full bg-[#0B2E33]" />
                  <span className="text-[9px] font-black font-sans tracking-wider text-[#666666] uppercase">
                    1. Resume Health Diagnostics
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E1E1E]">Category Score Diagnostics</h3>
                <p className="text-[#666666] text-xs leading-relaxed font-medium">
                  We verify your content across six key placement markers to give you a clear, quantitative look at your placement preparedness.
                </p>

                {/* Score Mock indicators */}
                <div className="grid grid-cols-2 gap-3.5 pt-2 font-sans text-[10px] font-bold">
                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Structure Format:</span>
                      <span className="text-[#0B2E33]">95%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B2E33] w-[95%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Skill Keywords:</span>
                      <span className="text-[#0B2E33]">88%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B2E33] w-[88%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>Project Depth:</span>
                      <span className="text-[#0B2E33]">92%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B2E33] w-[92%]" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-zinc-500">
                      <span>XYZ Achievements:</span>
                      <span className="text-[#0B2E33]">85%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0B2E33] w-[85%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 text-[10px] text-[#0B2E33] font-sans font-black uppercase tracking-wider">
                ✓ Verified to pass standard corporate filters
              </div>
            </div>

            {/* Right Card: Job Matching Engine and Skill Gaps */}
            <div className="glass-panel border border-stone-200 bg-[#B8E3E9]/30 rounded-3xl p-6 flex flex-col justify-between text-left shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center space-x-2 pb-2 border-b border-stone-100">
                  <div className="h-2 w-2 rounded-full bg-[#0B2E33]" />
                  <span className="text-[9px] font-black font-sans tracking-wider text-[#666666] uppercase">
                    2. Job Match Intelligence
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#1E1E1E]">Interactive Job requirements matcher</h3>
                <p className="text-[#666666] text-xs leading-relaxed font-medium">
                  Paste any job description from Google, Amazon, or TCS, and instantly inspect side-by-side missing skills, keyword frequencies, and recruiter priorities.
                </p>

                {/* Simulated Gaps Display */}
                <div className="p-3.5 bg-white border border-stone-150 rounded-xl space-y-2">
                  <div className="flex justify-between text-[9px] font-sans font-bold">
                    <span className="text-[#666666]">Target Role:</span>
                    <span className="text-[#1E1E1E] font-black">Software Engineer Intern</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2E7D32]/6 border border-[#2E7D32]/15 text-[8.5px] font-black text-[#2E7D32]">
                      ✓ React (Found)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#2E7D32]/6 border border-[#2E7D32]/15 text-[8.5px] font-black text-[#2E7D32]">
                      ✓ TypeScript (Found)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D32F2F]/6 border border-[#D32F2F]/15 text-[8.5px] font-black text-[#D32F2F]">
                      ✗ Docker (Missing)
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#D32F2F]/6 border border-[#D32F2F]/15 text-[8.5px] font-black text-[#D32F2F]">
                      ✗ AWS (Missing)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-stone-100 text-[10px] text-[#0B2E33] font-sans font-black uppercase tracking-wider">
                ✓ Instantly aligns your credentials to actual job descriptions
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 7. Undergrad Trust & Student Story Section */}
      <section className="py-20 bg-[#B8E3E9] relative border-b border-stone-200/60">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          
          <div className="glass-panel border border-stone-200 bg-white rounded-3xl p-8 space-y-6 relative overflow-hidden shadow-sm">
            
            <div className="absolute top-0 right-0 h-28 w-28 bg-[#4F7C82]/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-center">
              <div className="h-12 w-12 rounded-2xl bg-[#0B2E33]/6 border border-[#0B2E33]/15 flex items-center justify-center text-[#0B2E33]">
                <Users className="h-6 w-6" />
              </div>
            </div>

            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Built for Undergrads
            </span>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#1E1E1E] tracking-tight leading-snug max-w-2xl mx-auto font-sans">
              "Built by an engineering student after seeing how often strong candidates get filtered out by poor resume structure."
            </h2>

            <p className="text-[#666666] text-xs sm:text-sm leading-relaxed max-w-xl mx-auto font-medium font-sans">
              We know what it feels like to submit hundreds of applications on college portals only to receive instant automated rejections. It is almost never a lack of skills—it is simply a design, structure, or formatting conflict that prevents parser scripts from reading your achievements. BOOSTCV is built to restore that balance.
            </p>

            <div className="flex items-center justify-center space-x-3 pt-2 text-[10px] font-sans text-zinc-400 font-bold uppercase">
              <span>✓ Resume Intelligence</span>
              <span>•</span>
              <span>✓ Job Matching</span>
              <span>•</span>
              <span>✓ Recruiter Insights</span>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Conversion Pricing Section */}
      <section id="pricing" className="py-20 bg-[#B8E3E9]/60 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#4F7C82]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Straightforward pricing
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1E1E1E] tracking-tight">
              Invest in Your Callback Outcome
            </h2>
            <p className="text-[#666666] text-sm leading-relaxed font-medium">
              No hidden monthly fees, subscriptions, or visual lockups. Secure your complete placement toolkit.
            </p>
          </div>

          <div className="max-w-md mx-auto glass-panel-glow border border-[#4F7C82]/30 rounded-3xl p-8 text-center bg-white relative shadow-md">
            
            {/* Premium badge */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4F7C82] text-white text-[10px] font-black uppercase tracking-widest shadow-sm font-sans">
              Placement Package
            </div>

            <span className="text-[9px] uppercase font-black tracking-widest text-[#4F7C82] font-sans block mt-4 mb-2">
              ONE-TIME SECURE UPGRADE
            </span>

            <h3 className="text-xl font-black text-[#1E1E1E]">Placement Resume Package</h3>
            
            <div className="flex items-center justify-center space-x-2.5 my-6">
              <span className="text-[#666666] line-through text-lg font-sans font-bold">₹149</span>
              <span className="text-5xl font-black text-[#1E1E1E] font-sans">₹80</span>
              <span className="text-zinc-400 text-xs font-bold font-sans">/ONE-TIME</span>
            </div>

            {/* outcome plan highlights */}
            <ul className="space-y-3.5 text-left text-xs text-[#1E1E1E] border-t border-stone-100 pt-6 mb-8 font-medium">
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-[#0B2E33] flex-shrink-0 mt-0.5" />
                <span><strong>Resume Health:</strong> Real-time scan covering Structure, Keywords, and formatting formatting.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-[#0B2E33] flex-shrink-0 mt-0.5" />
                <span><strong>Job Match Report:</strong> Paste job requirements and analyze skill matches immediately.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-[#0B2E33] flex-shrink-0 mt-0.5" />
                <span><strong>Resume Optimization:</strong> Access AI sentence enhancers loaded with placement keywords.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-[#0B2E33] flex-shrink-0 mt-0.5" />
                <span><strong>Premium Recruiter Templates:</strong> 3-tier selectable-text ATS templates instantly compiled.</span>
              </li>
              <li className="flex items-start space-x-2.5">
                <CheckCircle className="h-4.5 w-4.5 text-[#0B2E33] flex-shrink-0 mt-0.5" />
                <span><strong>Downloadable PDF:</strong> Guaranteed clean linear extraction formatting.</span>
              </li>
            </ul>

            <Link 
              href={user ? "/dashboard" : "/login"}
              className="w-full py-4 rounded-xl bg-[#0B2E33] hover:bg-[#004f2f] text-white font-black text-xs font-sans uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Build Outcome Resume</span>
              <ArrowRight className="h-4 w-4 text-white stroke-[2.5]" />
            </Link>

            <div className="mt-4 text-[9px] text-zinc-400 font-sans font-bold uppercase tracking-widest flex items-center justify-center space-x-1.5">
              <span>🔒 SECURE CHECKOUT BY RAZORPAY</span>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FAQs Section */}
      <section id="faqs" className="py-20 bg-white border-t border-stone-200 relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-16">
            <span className="text-[10px] uppercase font-black tracking-widest text-[#0B2E33] font-sans block">
              Clarifications
            </span>
            <h2 className="text-2xl font-extrabold text-[#1E1E1E] tracking-tight">
              Undergrad Placement FAQs
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="glass-panel rounded-xl border border-stone-200 overflow-hidden transition-all duration-300 bg-white shadow-sm"
              >
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between font-bold text-[#1E1E1E] hover:bg-stone-50 text-xs sm:text-sm"
                >
                  <span className="pr-4">{faq.q}</span>
                  <ChevronDown 
                    className={`h-4.5 w-4.5 text-[#666666] transform transition-transform duration-300 ${activeFaq === idx ? "rotate-180 text-[#0B2E33]" : ""}`} 
                  />
                </button>
                {activeFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-[#666666] text-xs leading-relaxed border-t border-stone-150 font-sans font-medium">
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
