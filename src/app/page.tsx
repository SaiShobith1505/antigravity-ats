"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import {
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  FileText,
  Lock,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react";
import { Footer } from "@/components/Footer";

const reportMetrics = [
  { label: "Structure", value: 92 },
  { label: "Formatting", value: 88 },
  { label: "Readability", value: 84 },
  { label: "Skills", value: 76 },
  { label: "Projects", value: 81 },
  { label: "Achievements", value: 73 },
];

const productSteps = [
  {
    icon: FileText,
    title: "Build a clear resume",
    text: "Create a clean, recruiter-readable profile with education, projects, experience, skills, and certifications in one place.",
  },
  {
    icon: SearchCheck,
    title: "Find recruiter gaps",
    text: "See missing skills, weak achievements, and formatting issues before your resume reaches a screening desk.",
  },
  {
    icon: BriefcaseBusiness,
    title: "Match real roles",
    text: "Paste a job description and understand how your resume lines up against the requirements that matter.",
  },
];

const faqs = [
  {
    q: "What does Resume Health measure?",
    a: "Resume Health reviews structure, formatting, readability, skills, projects, and achievements so candidates can improve the parts recruiters actually scan.",
  },
  {
    q: "Is BOOSTCV only a resume builder?",
    a: "No. The builder is one part of the product. BOOSTCV also helps you compare your resume against job descriptions and identify recruiter gaps before applying.",
  },
  {
    q: "Can I view a report before paying?",
    a: "Yes. You can analyze and preview your resume flow before unlocking the final downloadable PDF export.",
  },
  {
    q: "How does the paid export work?",
    a: "Razorpay unlocks a temporary export session. After the PDF is downloaded, that session is consumed to protect the one-time payment model.",
  },
];

export default function LandingPage() {
  const { user } = useAuth();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const appHref = user ? "/dashboard" : "/login";

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1C1C1C] font-sans antialiased selection:bg-[#D6C5A4]/40 selection:text-[#1C1C1C]">
      <header className="sticky top-0 z-50 border-b border-[#E5E7EB] bg-[#F8F7F4]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden shadow-sm">
              <img src="/logo.png" alt="BOOSTCV Logo" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-semibold tracking-tight">BOOSTCV</span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B7280] md:flex">
            <a href="#report" className="hover:text-[#1C1C1C]">Sample report</a>
            <a href="#workflow" className="hover:text-[#1C1C1C]">Workflow</a>
            <a href="#pricing" className="hover:text-[#1C1C1C]">Pricing</a>
            <a href="#faqs" className="hover:text-[#1C1C1C]">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href={appHref} className="hidden rounded-lg px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#1C1C1C] sm:block">
              {user ? "Dashboard" : "Sign in"}
            </Link>
            <Link
              href={appHref}
              className="inline-flex items-center gap-2 rounded-lg bg-[#1F5C4A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18483A]"
            >
              Analyze My Resume
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden border-b border-[#E5E7EB]">
          <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl grid-cols-1 items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:px-8 lg:py-20">
            <div className="lg:col-span-6">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#1F5C4A] shadow-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Professional resume intelligence for placements
              </div>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-[#1C1C1C] sm:text-6xl lg:text-7xl">
                Get More Interview Calls.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#6B7280]">
                Understand what recruiters see, identify resume weaknesses, match real job descriptions, and improve your chances of getting shortlisted.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={appHref}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F5C4A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18483A]"
                >
                  Analyze My Resume
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="#report"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white px-5 py-3 text-sm font-semibold text-[#1C1C1C] shadow-sm transition hover:border-[#D6C5A4]"
                >
                  View Sample Report
                </a>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-3 gap-6 border-t border-[#E5E7EB] pt-6">
                <div>
                  <p className="text-2xl font-semibold">6</p>
                  <p className="mt-1 text-xs font-medium text-[#6B7280]">health categories</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">₹80</p>
                  <p className="mt-1 text-xs font-medium text-[#6B7280]">one-time export</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold">10 min</p>
                  <p className="mt-1 text-xs font-medium text-[#6B7280]">secure session</p>
                </div>
              </div>
            </div>

            <div id="report" className="lg:col-span-6">
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-[0_18px_60px_rgba(28,28,28,0.08)] sm:p-6">
                <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">Sample report</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">Resume Health</h2>
                  </div>
                  <span className="rounded-full bg-[#1F5C4A]/10 px-3 py-1 text-sm font-semibold text-[#1F5C4A]">82%</span>
                </div>

                <div className="mt-6 space-y-4">
                  {reportMetrics.map((metric) => (
                    <div key={metric.label}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="font-medium text-[#1C1C1C]">{metric.label}</span>
                        <span className="text-[#6B7280]">{metric.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#F1F2EF]">
                        <div
                          className="h-full rounded-full bg-[#1F5C4A]"
                          style={{ width: `${metric.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1F5C4A]">
                      <Target className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold">Missing Skills & Recruiter Gaps</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">Docker, AWS, measurable project impact, and clearer role skills.</p>
                  </div>
                  <div className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] p-4">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#1F5C4A]">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-semibold">Career Readiness</h3>
                    <p className="mt-2 text-sm leading-6 text-[#6B7280]">Strong structure, good readability, and achievement bullets that need more numbers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="workflow" className="border-b border-[#E5E7EB] bg-white py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">Workflow</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">From resume draft to shortlist-ready profile.</h2>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {productSteps.map((step) => (
                <div key={step.title} className="rounded-xl border border-[#E5E7EB] bg-[#F8F7F4] p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#1F5C4A] shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#6B7280]">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-[#E5E7EB] py-20">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:px-8">
            <div className="lg:col-span-5">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">Outcome centric</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">Built around interviews, not vanity scores.</h2>
            </div>
            <div className="grid gap-4 lg:col-span-7 sm:grid-cols-2">
              {[
                "Resume Intelligence instead of resume intelligence.",
                "Resume Health instead of oversized score theatrics.",
                "Missing Skills & Recruiter Gaps instead of keyword stuffing.",
                "Clean export flow with a secure payment session.",
              ].map((item) => (
                <div key={item} className="flex gap-3 rounded-xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#1F5C4A]" />
                  <p className="text-sm leading-6 text-[#1C1C1C]">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-white py-20">
          <div className="mx-auto max-w-xl px-4 text-center sm:px-6">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">Simple pricing</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">One focused export package.</h2>
            <div className="mt-8 rounded-2xl border border-[#E5E7EB] bg-[#F8F7F4] p-8 shadow-sm">
              <div className="flex items-center justify-center gap-3">
                <span className="text-lg font-medium text-[#6B7280] line-through">₹149</span>
                <span className="text-5xl font-semibold tracking-tight">₹80</span>
                <span className="text-sm font-medium text-[#6B7280]">one-time</span>
              </div>
              <p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#6B7280]">
                Analyze, improve, preview, and unlock a clean recruiter-ready PDF export with Razorpay-secured checkout.
              </p>
              <Link
                href={appHref}
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F5C4A] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18483A]"
              >
                Build My Resume
                <ArrowRight className="h-4 w-4" />
              </Link>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-medium text-[#6B7280]">
                <Lock className="h-3.5 w-3.5 text-[#1F5C4A]" />
                Secure checkout by Razorpay
              </div>
            </div>
          </div>
        </section>

        <section id="faqs" className="border-t border-[#E5E7EB] py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6">
            <div className="mb-10 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#6B8F71]">FAQs</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">Clear answers before you start.</h2>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={faq.q} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-sm">
                  <button
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold"
                  >
                    {faq.q}
                    <ChevronDown className={`h-4 w-4 text-[#6B7280] transition ${activeFaq === idx ? "rotate-180" : ""}`} />
                  </button>
                  {activeFaq === idx && (
                    <p className="border-t border-[#E5E7EB] px-5 py-4 text-sm leading-6 text-[#6B7280]">{faq.a}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
