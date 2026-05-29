"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, signInWithEmail, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email or username.");
      return;
    }

    setErrorMsg("");
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Sign-in failed. Try again.";
      setErrorMsg(message);
      setSubmitting(false);
    }
  };

  if (loading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8F7F4]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#1F5C4A] border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F7F4] px-4 py-10 text-[#1C1C1C] sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
        <section className="lg:col-span-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F5C4A] text-white shadow-sm">
              <Sparkles className="h-4.5 w-4.5" />
            </div>
            <span className="text-sm font-semibold tracking-tight">BOOSTCV</span>
          </Link>

          <div className="mt-12 max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-medium text-[#1F5C4A] shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure career workspace
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
              Sign in to improve your resume with confidence.
            </h1>
            <p className="mt-5 text-base leading-7 text-[#6B7280]">
              Continue to your Resume Health report, job matcher, recruiter gaps, and clean PDF export flow.
            </p>
          </div>
        </section>

        <section className="lg:col-span-6">
          <div className="mx-auto max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-6 shadow-[0_18px_60px_rgba(28,28,28,0.08)] sm:p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-[#6B7280]">Access your BOOSTCV workspace.</p>
            </div>

            {errorMsg && (
              <div className="mb-5 flex items-start gap-2 rounded-xl border border-[#C0392B]/20 bg-[#C0392B]/10 p-3.5 text-sm font-medium text-[#C0392B]">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                  Email or username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@college.edu"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F8F7F4] py-3 pl-10 pr-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1F5C4A] focus:ring-1 focus:ring-[#1F5C4A]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#6B7280]">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full rounded-lg border border-[#E5E7EB] bg-[#F8F7F4] py-3 pl-10 pr-3 text-sm text-[#1C1C1C] outline-none transition placeholder:text-[#9CA3AF] focus:border-[#1F5C4A] focus:ring-1 focus:ring-[#1F5C4A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#1F5C4A] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#18483A] disabled:cursor-not-allowed disabled:opacity-70"
              >
                <span>{submitting ? "Signing in..." : "Sign in to workspace"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E5E7EB]" />
              <span className="text-xs font-medium text-[#6B7280]">or</span>
              <div className="h-px flex-1 bg-[#E5E7EB]" />
            </div>

            <button
              onClick={signInWithGoogle}
              className="inline-flex w-full items-center justify-center rounded-lg border border-[#E5E7EB] bg-white px-4 py-3 text-sm font-semibold text-[#1C1C1C] shadow-sm transition hover:border-[#D6C5A4]"
            >
              Continue with Google
            </button>

            <div className="pt-6 text-center">
              <Link href="/" className="text-sm font-medium text-[#6B7280] transition hover:text-[#1F5C4A]">
                Return to landing page
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
