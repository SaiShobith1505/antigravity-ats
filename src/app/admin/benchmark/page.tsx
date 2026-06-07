"use client";

import React, { useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Award,
  Layers,
  Lock,
  Mail,
  LogOut,
  HelpCircle,
  HelpCircle as InfoIcon,
  ShieldCheck,
  Check
} from "lucide-react";
import Link from "next/link";

export default function AdminBenchmarkPage() {
  const { user, signInWithEmail, signOut, loading: authLoading } = useAuth();

  // Login form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Scan states
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<any | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setLoginError("Please enter your email and password.");
      return;
    }
    setLoginError("");
    setLoginSubmitting(true);
    try {
      await signInWithEmail(email, password);
    } catch (err: any) {
      setLoginError(err.message || "Invalid credentials.");
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleRunScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setReport(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("jobDescription", jobDescription);
      fd.append("mode", "universal"); // Run standard universal calibration scan

      const res = await fetch("/api/ats/check", {
        method: "POST",
        body: fd
      });
      if (!res.ok) {
        throw new Error("ATS scan endpoint failed.");
      }
      const data = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || "An error occurred during scanning.");
    } finally {
      setScanning(false);
    }
  };

  const isUserAdmin = user && user.email === "admin@cvboost.co";

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0F172A]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#10B981] border-t-transparent" />
      </div>
    );
  }

  // Render Login Panel if not logged in as Admin
  if (!isUserAdmin) {
    return (
      <main className="min-h-screen bg-[#0F172A] px-4 py-16 text-slate-100 flex flex-col justify-center sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-900/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            BOOSTCV Admin Benchmark
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            ATS Calibration & Calibration QA Portal
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-[#1E293B] py-8 px-4 shadow-xl border border-slate-700/60 rounded-2xl sm:px-10">
            {loginError && (
              <div className="mb-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-sm font-medium text-rose-400">
                <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Admin Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cvboost.co"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/50 py-3 pl-10 pr-3 text-sm text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loginSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-3 text-sm font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50"
              >
                <span>{loginSubmitting ? "Authenticating..." : "Enter Calibration Suite"}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0F172A] text-slate-100 font-sans pb-16">
      {/* Admin Nav */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white font-bold">
            B
          </div>
          <div>
            <h1 className="text-md font-bold tracking-tight text-white">BOOSTCV</h1>
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">ATS Calibration Dashboard</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition">
            Heuristic dashboard
          </Link>
          <Link href="/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition">
            User Dashboard
          </Link>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-1.5 text-xs font-semibold text-rose-400 hover:text-rose-300 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* File Upload and Input Area */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-emerald-400" />
                Upload Calibration Resume
              </h2>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer flex flex-col items-center justify-center ${
                  dragOver
                    ? "border-emerald-400 bg-emerald-500/5"
                    : "border-slate-700 bg-slate-900/20 hover:border-slate-600"
                }`}
              >
                <input
                  type="file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className={`h-10 w-10 mb-3 ${dragOver ? "text-emerald-400 animate-bounce" : "text-slate-500"}`} />
                {file ? (
                  <div>
                    <p className="text-sm font-semibold text-emerald-400">{file.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-300">Drag and drop resume here</p>
                    <p className="text-xs text-slate-500 mt-1">Supports PDF, DOCX, TXT files</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Job Description (Optional)
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste target job description..."
                  rows={6}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              {error && (
                <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-sm font-medium text-rose-400">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleRunScan}
                disabled={scanning || !file}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 py-3 text-sm font-bold text-white shadow-md hover:from-emerald-600 hover:to-teal-600 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {scanning ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Analyzing Candidate Metrics...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Run Calibration Scan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Comparison Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {!report && !scanning && (
              <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <FileText className="h-16 w-16 text-slate-600 mb-4 stroke-1" />
                <h3 className="text-lg font-bold text-slate-300">No Calibration Active</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  Upload a resume and run the calibration scan to view parsing metrics, evidence extraction logs, and score breakdowns.
                </p>
              </div>
            )}

            {scanning && (
              <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <RefreshCw className="h-12 w-12 text-emerald-400 mb-4 animate-spin" />
                <h3 className="text-lg font-bold text-white">Running ATS Diagnostics</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Extracting text, verifying layout structures, matching taxonomies, and auditing warnings...
                </p>
              </div>
            )}

            {report && (
              <div className="space-y-6">
                
                {/* Score Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* ATS Compatibility Score */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATS Score</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-white">{report.atsScore}%</span>
                      <span className="text-xs text-slate-400">Overall compatibility</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${report.atsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Parser Confidence */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Parser Confidence</p>
                    <div className="mt-2 flex items-baseline gap-1.5">
                      <span className="text-4xl font-black text-emerald-400">{report.parserConfidence || 95}%</span>
                      <span className="text-xs text-slate-400">Extraction quality</span>
                    </div>
                    <div className="mt-3 h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                        style={{ width: `${report.parserConfidence || 95}%` }}
                      />
                    </div>
                  </div>

                  {/* Industry Classifier */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Classified Industry</p>
                    <div className="mt-2">
                      <span className="text-md font-bold text-teal-400 block truncate">{report.resumeType || "General Corporate"}</span>
                      <span className="text-[10px] text-slate-400 block mt-1">Conf: {((report.classificationConfidence || 0.98) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Cards */}
                <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-emerald-400" />
                    Score Categories Breakdown
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { key: "structure", label: "Structure" },
                      { key: "formatting", label: "Formatting" },
                      { key: "readability", label: "Readability" },
                      { key: "keywords", label: "Keywords" },
                      { key: "projects", label: "Projects" },
                      { key: "achievements", label: "Achievements" }
                    ].map(cat => {
                      const val = report.breakdown?.[cat.key] ?? 0;
                      return (
                        <div key={cat.key} className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-3.5 text-center">
                          <p className="text-xs text-slate-400">{cat.label}</p>
                          <p className="text-2xl font-black text-white mt-1">{val}%</p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Score Explanation System */}
                {report.scoreExplanation && (
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                      <InfoIcon className="h-4.5 w-4.5 text-emerald-400" />
                      Score Explanation Diagnostics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Positives */}
                      <div>
                        <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2.5">Positive Factors</h4>
                        <ul className="space-y-2">
                          {report.scoreExplanation.positives.map((pos: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <Check className="h-4 w-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                              <span>{pos}</span>
                            </li>
                          ))}
                          {report.scoreExplanation.positives.length === 0 && (
                            <li className="text-xs text-slate-500 italic">No positive factors detected.</li>
                          )}
                        </ul>
                      </div>

                      {/* Negatives */}
                      <div>
                        <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2.5">Negative Factors</h4>
                        <ul className="space-y-2">
                          {report.scoreExplanation.negatives.map((neg: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                              <AlertCircle className="h-4 w-4 text-rose-400 mt-0.5 flex-shrink-0" />
                              <span>{neg}</span>
                            </li>
                          ))}
                          {report.scoreExplanation.negatives.length === 0 && (
                            <li className="text-xs text-emerald-500 italic font-semibold">✅ Perfect structure. Zero negative factors.</li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* Warnings Evidence System Log */}
                <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-emerald-400" />
                    Warnings & Evidence Logs ({report.verifiedWarnings?.length || 0})
                  </h3>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                    {report.verifiedWarnings && report.verifiedWarnings.length > 0 ? (
                      report.verifiedWarnings.map((w: any, idx: number) => (
                        <div key={idx} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                              {w.warning_type.replace(/_/g, " ")}
                            </span>
                            <div className="flex gap-3 text-[10px] text-slate-400 font-semibold">
                              <span>Page: {w.source_page || 1}</span>
                              <span>Confidence: {w.confidence}</span>
                            </div>
                          </div>
                          <div className="text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded border border-slate-800/80 font-mono">
                            <p className="text-slate-400 uppercase text-[9px] font-sans font-bold tracking-wider mb-1">Physical Evidence:</p>
                            {w.evidence}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-500 italic">No formatting or structure warnings generated. (100% compliant resume layout!)</p>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
