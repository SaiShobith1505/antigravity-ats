"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  FileText,
  AlertCircle,
  CheckCircle2,
  Check,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sliders,
  TrendingUp,
  Award,
  Layers,
  Lock,
  Mail,
  LogOut,
  HelpCircle
} from "lucide-react";
import Link from "next/link";
import { PROFILE_KEYWORDS } from "@/lib/scoring-engine";

export default function AdminPage() {
  const { user, signInWithEmail, signOut, loading: authLoading } = useAuth();
  const router = useRouter();

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

  // Results states
  const [studentReport, setStudentReport] = useState<any | null>(null);
  const [universalReport, setUniversalReport] = useState<any | null>(null);

  // Drag over state
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
    setStudentReport(null);
    setUniversalReport(null);

    try {
      // 1. Run Student Scan
      const fdStudent = new FormData();
      fdStudent.append("file", file);
      fdStudent.append("jobDescription", jobDescription);
      fdStudent.append("mode", "student");

      const resStudent = await fetch("/api/ats/check", {
        method: "POST",
        body: fdStudent
      });
      if (!resStudent.ok) {
        throw new Error("Student ATS Scan failed.");
      }
      const dataStudent = await resStudent.json();
      setStudentReport(dataStudent);

      // 2. Run Universal Scan
      const fdUniversal = new FormData();
      fdUniversal.append("file", file);
      fdUniversal.append("jobDescription", jobDescription);
      fdUniversal.append("mode", "universal");

      const resUniversal = await fetch("/api/ats/check", {
        method: "POST",
        body: fdUniversal
      });
      if (!resUniversal.ok) {
        throw new Error("Universal ATS Scan failed.");
      }
      const dataUniversal = await resUniversal.json();
      setUniversalReport(dataUniversal);

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
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold tracking-tight text-white">
            BOOSTCV Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Universal ATS Validation Dashboard
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
                <span>{loginSubmitting ? "Authenticating..." : "Enter Admin Suite"}</span>
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
            <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">Universal ATS Panel</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 hover:bg-slate-800 transition">
            Go to User Dashboard
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
                <Sliders className="h-5 w-5 text-emerald-400" />
                Upload Benchmarked Resume
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
                  placeholder="Paste target job description to match skills and keywords..."
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
                    <span>Running Comparison Scans...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4.5 w-4.5" />
                    <span>Run Parallel ATS Scans</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Comparison Dashboard */}
          <div className="lg:col-span-7 space-y-6">
            {!studentReport && !universalReport && !scanning && (
              <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <FileText className="h-16 w-16 text-slate-600 mb-4 stroke-1" />
                <h3 className="text-lg font-bold text-slate-300">No Active Benchmark</h3>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">
                  Upload a candidate resume and click "Run Parallel ATS Scans" to evaluate performance differences.
                </p>
              </div>
            )}

            {scanning && (
              <div className="bg-[#1E293B]/40 border border-slate-800/80 rounded-2xl p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                <RefreshCw className="h-12 w-12 text-emerald-400 mb-4 animate-spin" />
                <h3 className="text-lg font-bold text-white">Evaluating Resume Profile</h3>
                <p className="text-sm text-slate-400 mt-2">
                  Running both Student and Universal ATS models concurrently...
                </p>
              </div>
            )}

            {studentReport && universalReport && (
              <div className="space-y-6">
                
                {/* Score Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Mode Card */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student ATS Score</p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-white">{studentReport.atsScore}%</span>
                      <span className="text-xs text-slate-400">B.Tech Placements</span>
                    </div>
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all duration-1000"
                        style={{ width: `${studentReport.atsScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Universal Mode Card */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Universal ATS Score</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {universalReport.resumeType}
                      </span>
                    </div>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-5xl font-black text-emerald-400">{universalReport.atsScore}%</span>
                      <span className="text-xs text-slate-400">Confidence: {((universalReport.classificationConfidence || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="mt-4 h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full transition-all duration-1000"
                        style={{ width: `${universalReport.atsScore}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Score Breakdown Table */}
                <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                    <Award className="h-4.5 w-4.5 text-emerald-400" />
                    Category Mismatch Analysis
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-2.5 font-bold">Category</th>
                          <th className="py-2.5 text-center font-bold">Student Score</th>
                          <th className="py-2.5 text-center font-bold">Universal Score</th>
                          <th className="py-2.5 text-center font-bold">Delta</th>
                          <th className="py-2.5 font-bold">Explanation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { key: "structure", label: "Structure" },
                          { key: "formatting", label: "Formatting" },
                          { key: "readability", label: "Readability" },
                          { key: "keywords", label: "Keywords" },
                          { key: "projects", label: "Projects" },
                          { key: "achievements", label: "Achievements" }
                        ].map((cat) => {
                          const sScore = studentReport.breakdown?.[cat.key] ?? 0;
                          const uScore = universalReport.breakdown?.[cat.key] ?? 0;
                          const delta = uScore - sScore;
                          return (
                            <tr key={cat.key} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                              <td className="py-3 font-semibold text-slate-200">{cat.label}</td>
                              <td className="py-3 text-center text-slate-300">{sScore}%</td>
                              <td className="py-3 text-center text-emerald-400 font-semibold">{uScore}%</td>
                              <td className={`py-3 text-center font-bold ${
                                delta > 0 ? "text-emerald-400" : delta < 0 ? "text-rose-400" : "text-slate-500"
                              }`}>
                                {delta > 0 ? `+${delta}` : delta === 0 ? "0" : delta}
                              </td>
                              <td className="py-3 text-slate-400 max-w-xs truncate">
                                {delta > 0
                                  ? `Suppressed B.Tech requirements (optional fields/links).`
                                  : delta === 0
                                  ? `Scores aligned perfectly.`
                                  : `Calibrated or weighted differently for this profile.`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Warnings Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Student Mode Warnings */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4 text-blue-400" />
                      Student Mode Warnings ({studentReport.verifiedWarnings?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {studentReport.verifiedWarnings && studentReport.verifiedWarnings.length > 0 ? (
                        studentReport.verifiedWarnings.map((w: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-blue-400">{w.warning_type.replace(/_/g, " ")}</span>
                              <span className="text-[10px] text-slate-500">Conf: {w.confidence}</span>
                            </div>
                            <p className="text-xs text-slate-300">{w.evidence}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-500 italic">No formatting or structure warnings generated.</p>
                      )}
                    </div>
                  </div>

                  {/* Universal Mode Warnings */}
                  <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Universal Mode Warnings ({universalReport.verifiedWarnings?.length || 0})
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {universalReport.verifiedWarnings && universalReport.verifiedWarnings.length > 0 ? (
                        universalReport.verifiedWarnings.map((w: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-900/40 border border-slate-800 rounded-xl space-y-1">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] uppercase font-bold text-emerald-400">{w.warning_type.replace(/_/g, " ")}</span>
                              <span className="text-[10px] text-slate-500">Conf: {w.confidence}</span>
                            </div>
                            <p className="text-xs text-slate-300">{w.evidence}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-emerald-500 italic">All warnings suppressed or resolved for this profile.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Suppression Highlights */}
                <div className="bg-[#1E293B]/60 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
                    <Layers className="h-4.5 w-4.5 text-emerald-400" />
                    Validation & Warnings Suppression
                  </h3>
                  <div className="space-y-3">
                    {/* Checking Projects Suppression */}
                    {(!universalReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_projects") &&
                      studentReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_projects")) ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>Successfully suppressed <strong>Missing Projects Penalty</strong> (Projects are optional for {universalReport.resumeType}).</span>
                      </div>
                    ) : null}

                    {/* Checking Github Suppression */}
                    {(!universalReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_github") &&
                      studentReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_github")) ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>Successfully suppressed <strong>Missing GitHub Link Penalty</strong> (GitHub is optional for {universalReport.resumeType}).</span>
                      </div>
                    ) : null}

                    {/* Checking Certifications Suppression */}
                    {(!universalReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_certifications") &&
                      studentReport.verifiedWarnings.some((w: any) => w.warning_type === "missing_section" && w.triggering_pattern === "missing_certifications")) ? (
                      <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-2.5 rounded-xl">
                        <Check className="h-4 w-4 flex-shrink-0" />
                        <span>Successfully suppressed <strong>Missing Certifications Warning</strong> (Certifications are optional for {universalReport.resumeType}).</span>
                      </div>
                    ) : null}

                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/30 p-2.5 rounded-xl">
                      <HelpCircle className="h-4 w-4 flex-shrink-0 text-slate-500" />
                      <span>This profile has been categorized as <strong>{universalReport.resumeType}</strong> based on matching context. Default keywords configured: <em>{PROFILE_KEYWORDS[universalReport.resumeType]?.slice(0, 5).join(", ")}</em>.</span>
                    </div>
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
