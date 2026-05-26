"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Zap, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const { user, signInWithEmail, signInWithGoogle, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your email or username");
      return;
    }
    setErrorMsg("");
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || "Sign-In failure. Try again.");
      setSubmitting(false);
    }
  };



  if (loading || user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 bg-grid-pattern flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Decorative Neon background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-electric-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10 text-center">
        <Link href="/" className="inline-flex items-center space-x-2.5 mx-auto">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="h-5.5 w-5.5 text-zinc-950 stroke-[2.5]" />
          </div>
          <span className="text-xl font-black tracking-tight text-white font-mono">
            BOOSTCV
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-black tracking-tight text-white">
          Sign In to Your Workspace
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-zinc-400 font-medium">
          Optimize B.Tech resumes to land high-yield interview shortlists.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4 sm:px-0">
        <div className="glass-panel border border-zinc-900 rounded-2xl py-8 px-6 sm:px-10 shadow-2xl space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-xs font-bold flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Email or Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@college.edu"
                  className="bg-zinc-900/40 border border-zinc-800/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-xl pl-10 pr-3 py-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-extrabold uppercase tracking-widest text-zinc-500 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-zinc-600" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-900/40 border border-zinc-800/80 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-100 placeholder-zinc-600 rounded-xl pl-10 pr-3 py-3 w-full text-sm outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-zinc-950 font-black text-sm transition-all transform active:scale-98 shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center space-x-2"
            >
              <span>{submitting ? "Processing..." : "Sign In & Access Sandbox"}</span>
              <ArrowRight className="h-4 w-4 text-zinc-950" />
            </button>
          </form>

          {/* Social Sign-In */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-zinc-900"></div>
            </div>
            <div className="relative flex justify-center text-xs font-mono uppercase tracking-wider">
              <span className="bg-zinc-950 px-3 text-zinc-600 font-bold font-mono">Or continue with Google</span>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-slate-200 font-extrabold text-sm transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>Continue with Google Account</span>
          </button>

          <div className="text-center pt-2">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
              ← Return to Landing Page
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
