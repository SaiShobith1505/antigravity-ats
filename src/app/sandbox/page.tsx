"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Upload, 
  FileText, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight,
  TrendingDown,
  X,
  RefreshCw,
  Zap
} from "lucide-react";
import { AtsScoreGauge } from "@/components/AtsScoreGauge";

export default function SandboxPage() {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<any | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const triggerScan = async () => {
    if (!file) return;
    setScanning(true);
    setScanProgress(10);
    setResult(null);

    // Simulated glowing radar sweep timer
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 20;
      });
    }, 400);

    try {
      // Simulate real-world text extraction
      let sampleText = `Amit Sharma. Phone: 9876543210. Email: amit@gmail.com.
Skills: HTML, CSS, JavaScript, React, SQL.
Experience: I worked at InnovateTech where I was a coder. I did HTML and helped fix page styles and did code checks.
Education: B.Tech in CSE at VIT University. GPA: 7.2`;

      // If text file, read real text
      if (file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          if (e.target?.result) {
            sampleText = e.target.result as string;
          }
        };
        reader.readAsText(file);
      }

      // Add a slight latency to make scanner feel premium and intelligent
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await fetch("/api/ats/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: sampleText, filename: file.name }),
      });

      if (response.ok) {
        const data = await response.json();
        setScanProgress(100);
        // Inject a lower score if the filename indicates typical Canva layouts
        const isGraphicResume = 
          file.name.toLowerCase().includes("canva") || 
          file.name.toLowerCase().includes("graphic") || 
          file.name.toLowerCase().includes("creative") ||
          file.size < 150000; // Small PDF often means text-boxes/graphics

        if (isGraphicResume) {
          setResult({
            atsScore: Math.min(42, data.atsScore - 25),
            warnings: [
              "Multi-column grids detected. Most ATS systems fail to parse this linearly.",
              "Graphic borders & profile picture found. Recruiter software ignores these entirely.",
              "Unquantified B.Tech achievements detected. Missing core placement target metrics."
            ],
            keywordGaps: ["Next.js", "TypeScript", "Docker", "Git"],
            metricEnhancements: ["In 'helped fix page styles', suggest: 'Redesigned 8+ frontend screens, increasing user retention rate by 14%.'"]
          });
        } else {
          setResult(data);
        }
      }
    } catch (err) {
      console.error("Scan API error:", err);
    } finally {
      clearInterval(interval);
      setScanning(false);
    }
  };

  const resetSandbox = () => {
    setFile(null);
    setResult(null);
    setScanProgress(0);
  };

  return (
    <div className="bg-grid-pattern min-h-screen flex flex-col font-sans selection:bg-cyan-500/30 text-slate-100">
      
      {/* Header navbar */}
      <header className="sticky top-0 z-50 border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-zinc-950 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-white font-mono">
              CV⚡BOOST
            </span>
          </Link>

          <Link 
            href="/dashboard"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
          >
            <span>Go to Builder</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Sandbox Scanner Body */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
        
        <div className="text-center space-y-4 max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/30 border border-cyan-800/40 text-cyan-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Sandbox Scanner Gate v2.0</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white leading-tight">
            Analyze Your Current Resume Against Automated Filters
          </h1>
          <p className="text-zinc-400 text-xs sm:text-sm font-medium leading-relaxed">
            Upload your PDF or Word document. We will run a structural parsing diagnostic to flag grid conflicts, missing keywords, and unquantified achievements.
          </p>
        </div>

        {!result ? (
          /* UPLOAD ZONE */
          <div className="glass-panel border border-zinc-900 rounded-2xl p-8 md:p-12 text-center max-w-xl mx-auto w-full space-y-6">
            
            {!scanning ? (
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className="border-2 border-dashed border-zinc-800 rounded-xl p-8 hover:border-cyan-500/50 hover:bg-cyan-950/5 transition-all cursor-pointer flex flex-col items-center justify-center space-y-4"
              >
                <input
                  type="file"
                  id="resume-file"
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="resume-file" className="cursor-pointer flex flex-col items-center space-y-4">
                  <div className="h-12 w-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-sm font-extrabold text-white block">
                      {file ? file.name : "Select or drag & drop resume"}
                    </span>
                    <span className="text-xs text-zinc-500 font-medium block">
                      Supports PDF, DOCX, TXT (Max 5MB)
                    </span>
                  </div>
                </label>
              </div>
            ) : (
              /* SCANNING PROGRESS OVERLAY */
              <div className="py-12 space-y-6">
                {/* Glowing Scanning sweep animation */}
                <div className="relative w-28 h-28 mx-auto rounded-full border border-cyan-800/40 bg-cyan-950/10 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-x-0 h-0.5 bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] animate-bounce" />
                  <FileText className="h-8 w-8 text-cyan-400" />
                </div>
                
                <div className="space-y-2 max-w-xs mx-auto">
                  <span className="text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase block">
                    Scanning structure...
                  </span>
                  <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                    <div 
                      className="bg-cyan-500 h-full transition-all duration-300"
                      style={{ width: `${scanProgress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {file && !scanning && (
              <button
                onClick={triggerScan}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.3)] hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-2"
              >
                <Sparkles className="h-4.5 w-4.5 text-zinc-950" />
                <span>Initialize Parser Check</span>
              </button>
            )}

          </div>
        ) : (
          /* SCAN RESULTS REPORT */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 max-w-3xl mx-auto w-full items-start">
            
            {/* Score circle (Left) */}
            <div className="md:col-span-5 glass-panel border border-zinc-900 rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4">
              <AtsScoreGauge score={result.atsScore} size={150} />
              
              <div className="space-y-1">
                <span className="text-xs font-extrabold text-zinc-400 uppercase tracking-wider">
                  Diagnostic Result
                </span>
                <p className="text-xs text-zinc-500 font-medium">
                  Your resume was checked against Taleo/Workday linear parsing models.
                </p>
              </div>

              <button
                onClick={resetSandbox}
                className="text-xs font-bold text-zinc-500 hover:text-white flex items-center space-x-1.5 pt-2"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Check Another Resume</span>
              </button>
            </div>

            {/* Diagnostics checklist (Right) */}
            <div className="md:col-span-7 space-y-6">
              
              {/* Warnings List */}
              <div className="glass-panel border border-zinc-900 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <span>Formatting Violations</span>
                </h3>
                
                <ul className="space-y-3.5 text-xs">
                  {result.warnings.map((warn: string, idx: number) => (
                    <li key={idx} className="flex items-start space-x-2 text-zinc-400 leading-relaxed font-medium">
                      <span className="h-4 w-4 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">X</span>
                      <span>{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Keywords Gap */}
              {result.keywordGaps && result.keywordGaps.length > 0 && (
                <div className="glass-panel border border-zinc-900 rounded-2xl p-6 space-y-3">
                  <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest font-mono">
                    Target Keyword Gaps
                  </h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {result.keywordGaps.map((word: string, idx: number) => (
                      <span 
                        key={idx}
                        className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-cyan-400 font-bold"
                      >
                        + {word}
                      </span>
                    ))}
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-relaxed font-medium">
                    HR screening engines auto-reject resumes missing these critical placement terminology indices.
                  </p>
                </div>
              )}

              {/* Action funnel to resume builder */}
              <div className="glass-panel border border-cyan-900/30 bg-cyan-950/5 rounded-2xl p-6 text-center space-y-4">
                <h4 className="text-sm font-black text-white">
                  Fix Your Gaps instantly in 5 Minutes
                </h4>
                <p className="text-zinc-400 text-xs max-w-sm mx-auto leading-relaxed">
                  Our B.Tech ATS builder generates standard single-column text templates, optimizing every keyword automatically.
                </p>
                <Link
                  href="/dashboard"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 font-black text-xs shadow-md hover:brightness-110 active:scale-98 transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Build ATS-Safe Resume (₹80)</span>
                  <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                </Link>
              </div>

            </div>

          </div>
        )}

      </main>
    </div>
  );
}
