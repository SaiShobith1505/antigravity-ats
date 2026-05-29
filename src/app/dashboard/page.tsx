"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { ResumeForm } from "@/components/ResumeForm";
import { AtsScoreGauge } from "@/components/AtsScoreGauge";
import { 
  defaultResumeData, 
  saveResume, 
  getResume, 
  getPaymentStatus, 
  setPaymentStatusPaid 
} from "@/lib/db";
import { 
  Zap, 
  Lock, 
  Download, 
  Share2, 
  CheckCircle2, 
  ChevronLeft,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
  FileText,
  Check,
  AlertCircle,
  Trash2,
  Briefcase,
  RotateCcw,
  History,
  ShieldAlert,
  BarChart3,
  ListChecks
} from "lucide-react";
import Link from "next/link";

// Dynamic import of PDF compilation components to bypass Next.js SSR hydration errors
const PDFDownloadButton = dynamic(
  () => import("@/components/PDFDownloadButton").then((mod) => mod.PDFDownloadButton),
  { ssr: false }
);

export default function DashboardPage() {
  const { user, signInWithGoogle, signOut, loading: authLoading } = useAuth();
  const router = useRouter();
  const [resumeData, setResumeData] = useState(defaultResumeData);
  const [atsScore, setAtsScore] = useState(85);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Referral Viral growth states
  const [referralCount, setReferralCount] = useState(0);
  const [referralLink, setReferralLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  // Simulated Payment Sandbox Modal States
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockOrderId, setMockOrderId] = useState("");
  const [mockAmount, setMockAmount] = useState(8000);

  // AI JD Matcher & Optimizer states
  const [activeTab, setActiveTab] = useState<"edit" | "matcher">("edit");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    id?: string;
    matchScore: number;
    scoreImprovement: number;
    extractedKeywords: string[];
    missingKeywords: string[];
    suggestions: string[];
    beforeAfterComparison: Array<{ original: string; optimized: string }>;
    tailoredResume: typeof defaultResumeData;
    extractedJd: {
      requiredSkills: string[];
      preferredSkills: string[];
      technologies: string[];
      frameworks: string[];
      certifications: string[];
      experienceRequired: string;
      softSkills: string[];
    };
    gapAnalysis: {
      matchingSkills: string[];
      missingSkills: string[];
      matchingTechnologies: string[];
      missingTechnologies: string[];
      matchingCertifications: string[];
      missingCertifications: string[];
    };
    keywordFrequency: Array<{ keyword: string; count: number; importance: "high" | "medium" | "low" }>;
    breakdown: {
      keywordCoverage: number;
      skillsCoverage: number;
      atsCompatibility: number;
    };
    improvementPriority: Array<{ task: string; priority: "critical" | "high" | "medium"; impact: string }>;
  } | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [tailorApplied, setTailorApplied] = useState(false);
  const [originalResumeDraft, setOriginalResumeDraft] = useState<typeof defaultResumeData | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "minimal" | "technical">("classic");

  // AI Resume Parser States
  const [isParsing, setIsParsing] = useState(false);
  const [parsingProgress, setParsingProgress] = useState(0);
  const [parsedReport, setParsedReport] = useState<{
    warnings: string[];
    keywordGaps: string[];
    metricEnhancements: string[];
    breakdown: {
      structure: number;
      formatting: number;
      readability: number;
      keywords: number;
      projects: number;
      achievements: number;
    };
  } | null>(null);

  const handleOptimizeResume = async () => {
    if (!jobDescription.trim()) {
      setPaymentError("Please paste a job description first.");
      return;
    }
    setPaymentError("");
    setIsAnalyzing(true);
    setTailorApplied(false);

    try {
      // Save current draft for rollback capability
      setOriginalResumeDraft(resumeData);

      const res = await fetch("/api/resume/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription,
          resumeData
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to tailor resume draft.");
      }

      const data = await res.json();
      setMatchResult(data);
      
      // Auto-apply tailored changes to current draft for live preview rendering
      setResumeData(data.tailoredResume);
      setAtsScore(data.scoreImprovement);
      setTailorApplied(true);

      // Append new job description analysis to history list
      const cleanTitle = jobDescription.split("\n")[0].replace(/[#*_\-[\]()]/g, "").trim().slice(0, 35) || "Full Stack Developer";
      const cleanCompany = jobDescription.match(/(?:at|company|employer|hiring):?\s*([A-Za-z0-9\s]+)/i)?.[1]?.trim().slice(0, 20) || "Target Company";
      
      const newHistoryItem = {
        id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        timestamp: new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        jobTitle: cleanTitle,
        companyName: cleanCompany,
        matchScore: data.matchScore,
        scoreImprovement: data.scoreImprovement,
        extractedKeywords: data.extractedKeywords,
        missingKeywords: data.missingKeywords,
        extractedJd: data.extractedJd,
        gapAnalysis: data.gapAnalysis,
        keywordFrequency: data.keywordFrequency,
        breakdown: data.breakdown,
        improvementPriority: data.improvementPriority,
        suggestions: data.suggestions,
        beforeAfterComparison: data.beforeAfterComparison,
        tailoredResume: data.tailoredResume
      };

      const updatedHistory = [newHistoryItem, ...analysisHistory].slice(0, 10);
      setAnalysisHistory(updatedHistory);

      // Save to cache securely
      if (user) {
        saveResume(user.uid, resumeId, data.tailoredResume, data.scoreImprovement, true, parsedReport, updatedHistory);
      }
    } catch (err: any) {
      console.error("Tailoring action failed:", err);
      setPaymentError(err.message || "Unable to parse and optimize resume draft.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUndoTailoring = () => {
    if (originalResumeDraft) {
      setResumeData(originalResumeDraft);
      const { score: prevScore, breakdown } = calculateHeuristicAtsScore(originalResumeDraft);
      setAtsScore(prevScore);
      setTailorApplied(false);
      setMatchResult(null);
      const updatedReport = {
        warnings: parsedReport?.warnings || ["Your resume matches standard recruiter formatting guidelines beautifully. Good structure."],
        keywordGaps: parsedReport?.keywordGaps || ["No severe keyword gaps detected."],
        metricEnhancements: parsedReport?.metricEnhancements || ["Incorporate Google XYZ metrics: 'Accomplished X, as measured by Y, by doing Z'."],
        breakdown
      };
      setParsedReport(updatedReport);
      if (user) {
        saveResume(user.uid, resumeId, originalResumeDraft, prevScore, false, updatedReport, analysisHistory);
      }
    }
  };

  const handleConfirmTailoring = () => {
    setTailorApplied(true);
    // Keep the tailored draft as active and clear match overlay comparison
    setMatchResult(null);
  };

  // Dynamic Script Loading Helpers
  const loadPdfJs = (): Promise<any> => {
    return new Promise<any>((resolve) => {
      if ((window as any).pdfjsLib) {
        resolve((window as any).pdfjsLib);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js";
        resolve(pdfjsLib);
      };
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const loadMammoth = (): Promise<any> => {
    return new Promise<any>((resolve) => {
      if ((window as any).mammoth) {
        resolve((window as any).mammoth);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
      script.async = true;
      script.onload = () => resolve((window as any).mammoth);
      script.onerror = () => resolve(null);
      document.body.appendChild(script);
    });
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    const pdfjsLib: any = await loadPdfJs();
    if (!pdfjsLib) {
      throw new Error("Failed to load PDF extraction engine. Check your connection.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item: any) => item.str);
      text += strings.join(" ") + "\n";
    }
    return text;
  };

  const extractTextFromDocx = async (file: File): Promise<string> => {
    const mammoth: any = await loadMammoth();
    if (!mammoth) {
      throw new Error("Failed to load Word document parser. Check your connection.");
    }
    const arrayBuffer = await file.arrayBuffer();
    const result = await (mammoth as any).extractRawText({ arrayBuffer });
    return result.value;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsParsing(true);
    setParsingProgress(10);
    setPaymentError("");

    try {
      let extractedText = "";

      if (file.name.endsWith(".pdf")) {
        setParsingProgress(25);
        extractedText = await extractTextFromPdf(file);
      } else if (file.name.endsWith(".docx")) {
        setParsingProgress(25);
        extractedText = await extractTextFromDocx(file);
      } else if (file.name.endsWith(".txt")) {
        setParsingProgress(35);
        extractedText = await file.text();
      } else {
        throw new Error("Unsupported file type. Please upload a PDF, DOCX, or TXT file.");
      }

      setParsingProgress(60);
      
      const response = await fetch("/api/resume/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, filename: file.name }),
      });

      if (!response.ok) {
        throw new Error("Failed to parse resume text using AI.");
      }

      setParsingProgress(90);
      const data = await response.json();
      
      // Auto-populate dashboard states
      setResumeData(data.parsedResume);
      setAtsScore(data.atsScore);
      setParsedReport({
        warnings: data.warnings,
        keywordGaps: data.keywordGaps,
        metricEnhancements: data.metricEnhancements,
        breakdown: data.breakdown
      });

      setParsingProgress(100);

      // Save to cache securely
      if (user) {
        saveResume(user.uid, resumeId, data.parsedResume, data.atsScore, false, {
          warnings: data.warnings,
          keywordGaps: data.keywordGaps,
          metricEnhancements: data.metricEnhancements,
          breakdown: data.breakdown
        });
      }
    } catch (err: any) {
      console.error("AI Upload parsing failed:", err);
      setPaymentError(err.message || "Unable to extract and parse your uploaded resume.");
    } finally {
      setIsParsing(false);
      setParsingProgress(0);
    }
  };

  const resumeId = user ? `resume_${user.uid}` : "default-resume";

  // Load user data on startup
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      // Calculate dynamic referral link
      setReferralLink(`${window.location.origin}/?ref=${user.uid}`);

      if (user.email === "admin@cvboost.co") {
        setIsPaid(true);
      } else {
        // Sync mock referrals from localStorage
        const storedRefs = localStorage.getItem(`cv_boost_refs_${user.uid}`);
        const count = storedRefs ? parseInt(storedRefs) : 0;
        setReferralCount(count);
        if (count >= 3) {
          setIsPaid(true);
          setPaymentStatusPaid(resumeId);
        }
      }

      // Load resume data
      const load = async () => {
        const res = await getResume(resumeId);
        if (res && res.data) {
          const merged = {
            ...defaultResumeData,
            ...res.data,
            personal: { ...defaultResumeData.personal, ...(res.data.personal || {}) },
            skills: { ...defaultResumeData.skills, ...(res.data.skills || {}) },
            education: res.data.education || defaultResumeData.education,
            experience: res.data.experience || defaultResumeData.experience,
            projects: res.data.projects || defaultResumeData.projects,
            certifications: res.data.certifications || defaultResumeData.certifications || [],
          };
          setResumeData(merged);
          if (res.atsScore !== undefined && res.atsScore !== null) {
            setAtsScore(res.atsScore);
          }
          if (res.usedAITailor !== undefined && res.usedAITailor !== null) {
            setTailorApplied(res.usedAITailor);
          }
          if (res.parsedReport) {
            setParsedReport(res.parsedReport);
          }
          if (res.analysisHistory) {
            setAnalysisHistory(res.analysisHistory);
          }
        }
        if (user.email === "admin@cvboost.co") {
          setIsPaid(true);
        } else {
          const paidStatus = await getPaymentStatus(resumeId);
          setIsPaid(prev => prev || paidStatus);
        }
        setLoading(false);
      };
      load();
    }
  }, [user, authLoading, router, resumeId]);

  // Active payment session monitoring and auto-lock
  useEffect(() => {
    if (isPaid && user && user.email !== "admin@cvboost.co") {
      const checkSession = async () => {
        const active = await getPaymentStatus(resumeId);
        if (!active) {
          setIsPaid(false);
        }
      };
      checkSession();
      const interval = setInterval(checkSession, 10000); // check status every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isPaid, user, resumeId]);

  // Real-time content-quality heuristic scoring analyzer
  const calculateHeuristicAtsScore = (data: typeof defaultResumeData) => {
    // 1. Structure Check (20% of final score)
    let structureScore = 0;
    if (data.education && data.education.length > 0) structureScore += 20;
    if (data.experience && data.experience.length > 0) structureScore += 20;
    if (data.projects && data.projects.length > 0) structureScore += 20;
    if (data.skills && (data.skills.languages.length > 0 || data.skills.frameworks.length > 0 || data.skills.tools.length > 0)) structureScore += 20;
    if (data.certifications && data.certifications.length > 0) structureScore += 20;
    structureScore = Math.max(10, structureScore);

    // 2. Formatting Check (20% of final score)
    // BOOSTCV baseline template is pristine (100%). Deducts points only if emojis or graphics are manually introduced in text.
    let formattingScore = 100;
    const allText = JSON.stringify(data);
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
    if (emojiRegex.test(allText)) {
      formattingScore -= 20;
    }
    if (allText.includes("★") || allText.includes("●") || allText.includes("■") || allText.includes("◆")) {
      formattingScore -= 20;
    }
    formattingScore = Math.max(10, formattingScore);

    // 3. Readability Check (15% of final score)
    let readabilityScore = 40; // baseline for pre-optimized BOOSTCV layout flow
    let contactPoints = 0;
    if (data.personal.email) contactPoints += 15;
    if (data.personal.phone) contactPoints += 15;
    if (data.personal.linkedin) contactPoints += 15;
    if (data.personal.github) contactPoints += 15;
    readabilityScore += contactPoints;
    readabilityScore += 20; // flow sorted standard
    readabilityScore = Math.min(100, Math.max(10, readabilityScore));

    // 4. Keywords Check (15% of final score)
    const standardKeywords = ["react", "next.js", "nodejs", "typescript", "docker", "git", "sql", "nosql", "aws", "gcp", "rest api"];
    let matchedKeywords = 0;
    const lowerAllText = allText.toLowerCase();
    standardKeywords.forEach(kw => {
      if (lowerAllText.includes(kw)) matchedKeywords++;
    });
    const matchRatio = matchedKeywords / standardKeywords.length;
    let baseKeywordsScore = Math.round(matchRatio * 100);

    // Buzzword penalty
    const buzzwords = ["synergy", "dynamic", "motivated", "detail-oriented", "results-driven", "innovative", "passionate", "team-player"];
    let buzzwordPenalties = 0;
    buzzwords.forEach(word => {
      const occurrences = (lowerAllText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
      if (occurrences > 2) {
        buzzwordPenalties += 5;
      }
    });
    const keywordsScore = Math.max(10, baseKeywordsScore - buzzwordPenalties);

    // 5. Projects Depth Check (15% of final score)
    let projectsScore = 10;
    let projectCountScore = 0;
    if (data.projects.length >= 3) projectCountScore = 80;
    else if (data.projects.length === 2) projectCountScore = 65;
    else if (data.projects.length === 1) projectCountScore = 50;

    let projectLinksBonus = 0;
    data.projects.forEach(p => {
      if (p.techStack && (p.techStack.toLowerCase().includes("github") || p.techStack.toLowerCase().includes("http") || p.techStack.toLowerCase().includes("www"))) {
        projectLinksBonus = 10;
      }
      if (p.description && (p.description.toLowerCase().includes("github") || p.description.toLowerCase().includes("http") || p.description.toLowerCase().includes("www"))) {
        projectLinksBonus = 10;
      }
    });

    let descriptionsBonus = 0;
    let totalDescLength = 0;
    data.projects.forEach(p => {
      totalDescLength += (p.description || "").length;
    });
    if (data.projects.length > 0 && (totalDescLength / data.projects.length) > 50) {
      descriptionsBonus = 10;
    }
    projectsScore = Math.min(100, projectCountScore + projectLinksBonus + descriptionsBonus);

    // 6. Achievements Check (15% of final score)
    const actionVerbs = [
      "spearheaded", "led", "developed", "optimized", "designed", "built", "implemented",
      "increased", "reduced", "managed", "created", "executed", "formulated", "engineered",
      "boosted", "drove", "improved", "scaled", "automated", "streamlined", "accelerated",
      "pioneered", "coordinated", "launched", "established", "architected", "analyzed"
    ];
    let actionVerbScore = 5;
    let foundVerbs = 0;
    actionVerbs.forEach(v => {
      if (lowerAllText.includes(v)) foundVerbs++;
    });
    if (foundVerbs >= 4) actionVerbScore = 30;
    else if (foundVerbs >= 2) actionVerbScore = 15;

    // Quantification (Google XYZ metrics)
    let quantificationScore = 5;
    let totalBullets = 0;
    let quantifiedBullets = 0;
    data.experience.forEach(exp => {
      exp.bullets.forEach(bullet => {
        totalBullets++;
        if (/\d+%?|\b(percent|CGPA|CGPA\b|INR|USD|GB|MB|ms)\b/.test(bullet)) {
          quantifiedBullets++;
        }
      });
    });
    const bulletMetricsRatio = totalBullets > 0 ? quantifiedBullets / totalBullets : 0;
    if (bulletMetricsRatio >= 0.35) quantificationScore = 40;
    else if (bulletMetricsRatio >= 0.15) quantificationScore = 20;

    let bulletQualityScore = 15;
    let totalBulletLength = 0;
    let bulletCount = 0;
    data.experience.forEach(exp => {
      exp.bullets.forEach(b => {
        totalBulletLength += b.length;
        bulletCount++;
      });
    });
    if (bulletCount > 0) {
      const avgLen = totalBulletLength / bulletCount;
      if (avgLen >= 40 && avgLen <= 150) bulletQualityScore = 30;
    }
    const achievementsScore = Math.min(100, actionVerbScore + quantificationScore + bulletQualityScore);

    // Derive the final ATS score based on 6 weights
    const derivedScore = Math.round(
      structureScore * 0.20 +
      formattingScore * 0.20 +
      readabilityScore * 0.15 +
      keywordsScore * 0.15 +
      projectsScore * 0.15 +
      achievementsScore * 0.15
    );

    const score = Math.min(99, Math.max(35, derivedScore));

    const breakdown = {
      structure: Math.max(10, structureScore),
      formatting: Math.max(10, formattingScore),
      readability: Math.max(10, readabilityScore),
      keywords: Math.max(10, keywordsScore),
      projects: Math.max(10, projectsScore),
      achievements: Math.max(10, achievementsScore)
    };

    return { score, breakdown };
  };

  // Sync state modifications in form
  const handleFormChange = (newData: typeof defaultResumeData) => {
    setResumeData(newData);
    const { score: newScore, breakdown } = calculateHeuristicAtsScore(newData);
    setAtsScore(newScore);

    // Live update breakdown bars
    const updatedReport = {
      warnings: parsedReport?.warnings || ["Your resume matches standard recruiter formatting guidelines beautifully. Good structure."],
      keywordGaps: parsedReport?.keywordGaps || ["No severe keyword gaps detected."],
      metricEnhancements: parsedReport?.metricEnhancements || ["Incorporate Google XYZ metrics: 'Accomplished X, as measured by Y, by doing Z'."],
      breakdown
    };
    setParsedReport(updatedReport);

    // Persistent cache
    if (user) {
      saveResume(user.uid, resumeId, newData, newScore, tailorApplied, updatedReport, analysisHistory);
    }
  };

  // Simulated Payment Sandbox Handlers
  const handleMockPaymentSuccess = async () => {
    setPaymentError("");
    try {
      const verifyRes = await fetch("/api/payment/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: mockOrderId,
          razorpay_payment_id: `pay_mock_${Math.random().toString(36).substring(2, 12)}`,
          razorpay_signature: "mock_signature_bypass",
          resumeId
        }),
      });

      if (verifyRes.ok) {
        setIsPaid(true);
        await setPaymentStatusPaid(resumeId);
        setPaymentError("");
        setShowMockModal(false);
      } else {
        const errData = await verifyRes.json();
        setPaymentError(errData.error || "Mock payment verification failed.");
        setShowMockModal(false);
      }
    } catch (err) {
      setPaymentError("Network verification error occurred during simulation.");
      setShowMockModal(false);
    }
  };

  const handleMockPaymentFailure = () => {
    setPaymentError("Payment failed: Simulated transaction decline.");
    setShowMockModal(false);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay Checkout Endpoint
  const triggerRazorpayCheckout = async () => {
    if (!user) return;
    setPaymentError("");

    const sdkLoaded = await loadRazorpayScript();
    if (!sdkLoaded) {
      setPaymentError("Razorpay SDK failed to load. Please check your internet connection or disable adblockers.");
      return;
    }
 
    try {
      const response = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, userId: user.uid, usedAITailor: tailorApplied }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to initialize checkout.");
      }
      
      const order = await response.json();
 
      // Test Mode Offline Sandbox Bypass
      if (order.isMock) {
        console.log("[TEST MODE] Mock order detected. Triggering Mock Payment Sandbox Modal...");
        setMockOrderId(order.id);
        setMockAmount(order.amount);
        setShowMockModal(true);
        return;
      }
      // Configure Razorpay client options
      const options = {
        key: order.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "BOOSTCV",
        description: "ATS Standard Selectable Text PDF Unlock",
        order_id: order.id,
        handler: async function (res: any) {
          try {
            // Payment success callback
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
                resumeId
              }),
            });
            
            if (verifyRes.ok) {
              setIsPaid(true);
              setPaymentStatusPaid(resumeId);
              setPaymentError("");
            } else {
              const errData = await verifyRes.json();
              setPaymentError(errData.error || "Cryptographic verification verification failed.");
            }
          } catch (verifyErr) {
            setPaymentError("Network verification error occurred.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#06b6d4",
        },
        modal: {
          ondismiss: function () {
            console.warn("Razorpay checkout modal closed by user.");
            setPaymentError("Checkout cancelled. Complete checkout payment to download.");
          }
        }
      };
 
      // Load client-side Razorpay library
      const rzp = new (window as any).Razorpay(options);
      
      // Payment failure handling event listener
      rzp.on("payment.failed", function (response: any) {
        console.error("Razorpay transaction failed:", response.error);
        setPaymentError(`Payment failed: ${response.error.description || "Transaction rejected"}`);
      });
 
      rzp.open();
    } catch (err: any) {
      console.error("Razorpay setup/execution failed:", err);
      setPaymentError(err.message || "Failed to initialize secure checkout. Please try again.");
    }
  };

  // Trigger referral share count
  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Simulate viral sign-ups inside local sandbox to allow quick free unlock testing!
    const nextCount = Math.min(3, referralCount + 1);
    setReferralCount(nextCount);
    if (user) {
      localStorage.setItem(`cv_boost_refs_${user.uid}`, nextCount.toString());
      if (nextCount >= 3) {
        setIsPaid(true);
        setPaymentStatusPaid(resumeId);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-zinc-950 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // FORCE ONBOARDING IF NOT AUTHENTICATED
  if (!user) {
    return (
      <div className="flex-1 bg-zinc-950 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-zinc-900 rounded-2xl p-8 text-center space-y-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center mx-auto shadow-md">
            <Zap className="h-6 w-6 text-zinc-950 stroke-[2.5]" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Unlock BOOSTCV Dashboard</h2>
            <p className="text-zinc-400 text-sm">
              We sync your resume progress and real-time ATS scores to your student profile automatically.
            </p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="w-full py-3.5 px-4 rounded-xl bg-slate-100 hover:bg-white text-zinc-950 font-extrabold text-sm shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Continue with Google Sign-In</span>
          </button>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300 block">
            ← Return to Landing Page
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-zinc-950">
      
      {/* Dynamic script tags for Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      {/* Dashboard Top bar */}
      <nav className="h-16 border-b border-zinc-900 bg-zinc-950/80 px-4 md:px-8 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center">
              <Zap className="h-4.5 w-4.5 text-zinc-950 stroke-[2.5]" />
            </div>
             <span className="text-base font-black tracking-tight text-white font-mono hidden sm:inline">
              BOOSTCV
             </span>
          </Link>
        </div>

        {/* Action Tickers */}
        <div className="flex items-center space-x-4">
          <span className="text-xs font-mono text-zinc-400 font-medium hidden md:inline">
            Logged as: <strong className="text-cyan-400">{user.email}</strong>
          </span>
          <button 
            onClick={signOut}
            className="text-xs text-zinc-500 hover:text-zinc-300 font-bold font-mono"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Split Work Panels */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Input Fields Panel (Form & AI Job Description Matcher) */}
        <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto border-r border-zinc-900 h-full flex flex-col space-y-6 text-left">
          
          {/* Tabs Selector Bar */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-900/50 border border-zinc-850 rounded-xl flex-shrink-0">
            <button
              onClick={() => setActiveTab("edit")}
              className={`py-2.5 px-3 rounded-lg font-bold font-mono text-xs transition-all flex items-center justify-center space-x-2 ${
                activeTab === "edit"
                  ? "bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileText className="h-4 w-4" />
              <span>Edit Resume Draft</span>
            </button>
            <button
              onClick={() => setActiveTab("matcher")}
              className={`py-2.5 px-3 rounded-lg font-bold font-mono text-xs transition-all flex items-center justify-center space-x-2 relative ${
                activeTab === "matcher"
                  ? "bg-zinc-800 text-cyan-400 shadow-sm border border-zinc-700/50"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Sparkles className="h-4 w-4" />
              <span>AI Job Matcher</span>
              {tailorApplied && (
                <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>
          </div>

          {/* Conditional Content Panel */}
          {activeTab === "edit" ? (
            <ResumeForm data={resumeData} onChange={handleFormChange} />
          ) : (
            <div className="space-y-6 flex-grow flex flex-col">
              
              {/* Job Analysis History Logs */}
              {analysisHistory.length > 0 && (
                <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-3 relative overflow-hidden">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                    <span className="text-[10px] font-black text-white font-mono uppercase tracking-wider flex items-center space-x-1.5">
                      <History className="h-3.5 w-3.5 text-cyan-400" />
                      <span>JD Scan History Logs ({analysisHistory.length})</span>
                    </span>
                    <button
                      onClick={() => {
                        setAnalysisHistory([]);
                        if (user) saveResume(user.uid, resumeId, resumeData, atsScore, tailorApplied, parsedReport, []);
                      }}
                      className="text-[9px] font-bold text-zinc-500 hover:text-red-400 transition-colors cursor-pointer"
                    >
                      Clear History
                    </button>
                  </div>
                  <div className="flex flex-col space-y-2 max-h-40 overflow-y-auto pr-1">
                    {analysisHistory.map((hist) => (
                      <button
                        key={hist.id}
                        onClick={() => {
                          setMatchResult(hist);
                          setResumeData(hist.tailoredResume);
                          setAtsScore(hist.scoreImprovement);
                          setTailorApplied(true);
                        }}
                        className={`p-2.5 rounded-lg border text-left flex justify-between items-center transition-all cursor-pointer ${
                          matchResult?.id === hist.id
                            ? "bg-cyan-950/20 border-cyan-800/40 text-cyan-400"
                            : "bg-zinc-900/10 border-zinc-900/60 hover:bg-zinc-900/30 text-zinc-450 hover:text-zinc-300"
                        }`}
                      >
                        <div className="space-y-0.5 max-w-[70%]">
                          <div className="text-[10px] font-bold font-mono truncate">{hist.jobTitle}</div>
                          <div className="text-[8px] font-mono text-zinc-500">{hist.companyName} • {hist.timestamp}</div>
                        </div>
                        <div className="text-right flex items-center space-x-2">
                          <span className="text-xs font-black font-mono bg-zinc-950 border border-zinc-800/80 px-2 py-0.5 rounded text-slate-100">
                            {hist.matchScore}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Job Description Input Card */}
              <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-7 w-7 rounded bg-cyan-950 border border-cyan-800/35 flex items-center justify-center">
                      <Briefcase className="h-4 w-4 text-cyan-400" />
                    </div>
                    <span className="text-xs font-black text-white font-mono uppercase tracking-wider">
                      Target Job Description
                    </span>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-zinc-500 uppercase">
                    Max 3,000 chars
                  </span>
                </div>

                <div className="space-y-2 relative text-left">
                  <textarea
                    rows={6}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value.slice(0, 3000))}
                    placeholder="Paste the target company job description here (e.g. required frameworks, technologies, roles, verbs)..."
                    className="bg-zinc-900/30 border border-zinc-900 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 placeholder-zinc-600 rounded-xl p-4 w-full text-xs leading-relaxed outline-none transition-all font-sans resize-none"
                  />
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-zinc-500 px-1">
                    <span>{jobDescription.length} / 3000 characters</span>
                    {jobDescription && (
                      <button
                        onClick={() => setJobDescription("")}
                        className="text-zinc-500 hover:text-red-400 flex items-center space-x-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Clear</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleOptimizeResume}
                  disabled={isAnalyzing || !jobDescription.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:brightness-110 active:scale-98 transition-all disabled:opacity-50 disabled:pointer-events-none text-zinc-950 font-black text-xs shadow-[0_0_20px_rgba(6,182,212,0.25)] flex items-center justify-center space-x-2 cursor-pointer"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Extracting Keywords & Gap Analysis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-zinc-950 fill-zinc-950 stroke-[2.5]" />
                      <span>Scan & Match for Job Description</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Analysis Staging Overlay */}
              {matchResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                  
                  {/* ATS Compatibility Improvement Indicator */}
                  <div className="glass-panel border border-cyan-500/25 bg-gradient-to-tr from-cyan-950/20 to-zinc-950/90 rounded-2xl p-5 space-y-3 relative overflow-hidden shadow-[0_0_25px_rgba(6,182,212,0.1)] text-left">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black font-mono text-cyan-400 tracking-wider uppercase">
                        ⚡ ATS Match Compatibility Optimized
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 px-2 py-0.5 rounded">
                        +{matchResult.scoreImprovement - matchResult.matchScore}% Boost
                      </span>
                    </div>

                    <div className="flex items-baseline space-x-2.5 pt-1.5 justify-start">
                      <span className="text-3xl font-black font-mono text-zinc-650 line-through">
                        {matchResult.matchScore}%
                      </span>
                      <span className="text-xl font-bold font-mono text-zinc-500">→</span>
                      <span className="text-4xl font-black font-mono text-white tracking-tight drop-shadow-[0_0_15px_rgba(34,197,94,0.2)]">
                        {matchResult.scoreImprovement}% Match
                      </span>
                    </div>

                    <p className="text-[10px] text-zinc-400 leading-relaxed font-semibold">
                      Extracted semantic alignment keywords. The optimization injected missing high-yield B.Tech placements technical tags into experience bullets and skills.
                    </p>

                    {/* Tailor state controller buttons */}
                    <div className="flex items-center space-x-3 pt-3 border-t border-zinc-900">
                      <button
                        onClick={handleUndoTailoring}
                        className="flex-1 py-2 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-400 hover:text-white font-extrabold text-[10px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Discard Optimizations</span>
                      </button>
                      <button
                        onClick={handleConfirmTailoring}
                        className="flex-1 py-2 px-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/40 text-cyan-400 font-black text-[10px] transition-all flex items-center justify-center space-x-1 cursor-pointer"
                      >
                        <Check className="h-3 w-3" />
                        <span>Confirm & Keep Tailored</span>
                      </button>
                    </div>
                  </div>

                  {/* Neon Stats Grid Dashboard */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass-panel border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.05)] text-center">
                      <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">MATCH SCORE</span>
                      <div className="py-2.5 relative flex items-center justify-center">
                        <span className="text-3xl font-black font-mono text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.3)]">{matchResult.matchScore}%</span>
                      </div>
                      <span className="text-[8px] font-mono text-zinc-400">JD vs Resume overlap</span>
                    </div>

                    <div className="glass-panel border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.05)] text-center space-y-2">
                      <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">KEYWORD COVERAGE</span>
                      <div className="py-1 relative flex items-center justify-center">
                        <span className="text-3xl font-black font-mono text-white">{matchResult.breakdown?.keywordCoverage || 0}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${matchResult.breakdown?.keywordCoverage || 0}%` }} />
                      </div>
                    </div>

                    <div className="glass-panel border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.05)] text-center space-y-2">
                      <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">SKILLS COVERAGE</span>
                      <div className="py-1 relative flex items-center justify-center">
                        <span className="text-3xl font-black font-mono text-white">{matchResult.breakdown?.skillsCoverage || 0}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${matchResult.breakdown?.skillsCoverage || 0}%` }} />
                      </div>
                    </div>

                    <div className="glass-panel border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between items-center relative overflow-hidden shadow-[0_0_12px_rgba(6,182,212,0.05)] text-center space-y-2">
                      <span className="text-[8px] font-bold font-mono text-zinc-500 uppercase tracking-widest block">ATS COMPATIBILITY</span>
                      <div className="py-1 relative flex items-center justify-center">
                        <span className="text-3xl font-black font-mono text-white">{matchResult.breakdown?.atsCompatibility || 0}%</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden">
                        <div className="bg-cyan-500 h-full" style={{ width: `${matchResult.breakdown?.atsCompatibility || 0}%` }} />
                      </div>
                    </div>
                  </div>

                  {/* Skills Gap Analysis Grid */}
                  <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center space-x-1.5 text-left">
                      <ShieldAlert className="h-4 w-4 text-cyan-400" />
                      <span>Recruiter Skills Gap Audit</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Job Requires */}
                      <div className="p-4 rounded-xl bg-zinc-900/10 border border-zinc-900/60 space-y-2.5 text-left">
                        <span className="text-[9px] font-black text-zinc-400 font-mono uppercase tracking-widest block">JOB REQUIRES</span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.extractedJd?.requiredSkills.map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-300">
                              {sk}
                            </span>
                          ))}
                          {matchResult.extractedJd?.preferredSkills.map((tech, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] font-mono font-bold text-zinc-400">
                              {tech}
                            </span>
                          ))}
                          {matchResult.extractedJd?.softSkills?.slice(0, 3).map((soft, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/50 text-[9px] font-mono font-bold text-zinc-500">
                              {soft}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Resume Contains */}
                      <div className="p-4 rounded-xl bg-emerald-950/5 border border-emerald-900/20 space-y-2.5 text-left">
                        <span className="text-[9px] font-black text-emerald-400 font-mono uppercase tracking-widest block">RESUME CONTAINS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.gapAnalysis?.matchingSkills.map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[9px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                              <span>✓</span>
                              <span>{sk}</span>
                            </span>
                          ))}
                          {matchResult.gapAnalysis?.matchingTechnologies.map((tech, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950/20 border border-emerald-900/30 text-[9px] font-mono font-bold text-emerald-400 flex items-center space-x-1">
                              <span>✓</span>
                              <span>{tech}</span>
                            </span>
                          ))}
                          {([...(matchResult.gapAnalysis?.matchingSkills || []), ...(matchResult.gapAnalysis?.matchingTechnologies || [])].length === 0) && (
                            <span className="text-[8px] text-zinc-650 font-semibold italic">0 matching items found.</span>
                          )}
                        </div>
                      </div>

                      {/* Missing Gaps */}
                      <div className="p-4 rounded-xl bg-amber-950/5 border border-amber-950/20 space-y-2.5 text-left">
                        <span className="text-[9px] font-black text-amber-400 font-mono uppercase tracking-widest block">MISSING CORE GAPS</span>
                        <div className="flex flex-wrap gap-1.5">
                          {matchResult.gapAnalysis?.missingSkills.map((sk, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/25 border border-amber-900/40 text-[9px] font-mono font-bold text-amber-450 flex items-center space-x-1">
                              <span>✗</span>
                              <span>{sk}</span>
                            </span>
                          ))}
                          {matchResult.gapAnalysis?.missingTechnologies.map((tech, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-amber-950/25 border border-amber-900/40 text-[9px] font-mono font-bold text-amber-450 flex items-center space-x-1">
                              <span>✗</span>
                              <span>{tech}</span>
                            </span>
                          ))}
                          {matchResult.gapAnalysis?.missingCertifications.map((cert, idx) => (
                            <span key={idx} className="px-2 py-0.5 rounded bg-red-950/25 border border-red-900/40 text-[9px] font-mono font-bold text-red-400 flex items-center space-x-1">
                              <span>✗</span>
                              <span>{cert}</span>
                            </span>
                          ))}
                          {([...(matchResult.gapAnalysis?.missingSkills || []), ...(matchResult.gapAnalysis?.missingTechnologies || []), ...(matchResult.gapAnalysis?.missingCertifications || [])].length === 0) && (
                            <span className="text-[8px] text-zinc-500 font-semibold italic">Perfect match! No gaps found.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Keyword Frequency Report */}
                  <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center space-x-1.5 text-left">
                      <BarChart3 className="h-4 w-4 text-cyan-400" />
                      <span>Keyword Frequency Coverage</span>
                    </h4>
                    
                    <div className="flex flex-wrap gap-2.5 pt-1 justify-start">
                      {matchResult.keywordFrequency?.map((item, idx) => (
                        <div 
                          key={idx} 
                          className="flex items-center space-x-2 px-2.5 py-1 rounded bg-zinc-900 border border-zinc-850 hover:border-zinc-800 transition-colors"
                        >
                          <span className="text-[10px] font-mono font-black text-slate-200">{item.keyword}</span>
                          <span className={`text-[8px] font-mono font-black px-1.5 py-0.25 rounded ${
                            item.count > 0 
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50" 
                              : "bg-red-950/40 text-red-400 border border-red-900/50"
                          }`}>
                            {item.count}x
                          </span>
                          <span className={`text-[7px] font-mono font-extrabold uppercase px-1 rounded ${
                            item.importance === "high" 
                              ? "bg-red-950/30 text-red-500" 
                              : (item.importance === "medium" ? "bg-amber-950/30 text-amber-500" : "bg-cyan-950/30 text-cyan-500")
                          }`}>
                            {item.importance}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Prioritised Optimization Checklist */}
                  <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center space-x-1.5 text-left">
                      <ListChecks className="h-4 w-4 text-cyan-400" />
                      <span>Placements Sprints Priority Action Checklist</span>
                    </h4>

                    <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                      {matchResult.improvementPriority?.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3.5 rounded-xl border flex justify-between items-center transition-all hover:bg-zinc-900/10 text-left ${
                            item.priority === "critical" 
                              ? "bg-red-950/5 border-red-900/20 text-red-400" 
                              : (item.priority === "high" ? "bg-amber-950/5 border-amber-900/20 text-amber-400" : "bg-cyan-950/5 border-cyan-900/20 text-cyan-400")
                          }`}
                        >
                          <div className="flex items-start space-x-2.5">
                            <span className={`h-4 w-4 rounded-full border text-[9px] font-mono font-black flex items-center justify-center mt-0.5 flex-shrink-0 ${
                              item.priority === "critical" ? "border-red-500 text-red-500 animate-pulse" : (item.priority === "high" ? "border-amber-500 text-amber-500" : "border-cyan-500 text-cyan-500")
                            }`}>
                              !
                            </span>
                            <div className="space-y-0.5">
                              <p className="text-[10px] font-bold text-slate-200">{item.task}</p>
                              <p className="text-[8px] font-mono text-zinc-500">Priority: {item.priority.toUpperCase()} impact • Projected {item.impact}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-zinc-900 border text-white ${
                            item.priority === "critical" ? "border-red-900/50" : (item.priority === "high" ? "border-amber-900/50" : "border-cyan-900/50")
                          }`}>
                            {item.impact}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Before vs After Bullet Comparisons */}
                  <div className="glass-panel border border-zinc-900 rounded-2xl p-5 space-y-4">
                    <h4 className="text-xs font-black text-white font-mono uppercase tracking-wider border-b border-zinc-900 pb-3 flex items-center justify-between">
                      <span>🔄 AI Bullet Optimization Pipeline</span>
                      <span className="text-[9px] font-bold font-mono text-zinc-500 lowercase">Compare improvements</span>
                    </h4>

                    <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                      {matchResult.beforeAfterComparison.map((comp, idx) => (
                        <div key={idx} className="space-y-2 border-b border-zinc-900 pb-4 last:border-0 last:pb-0">
                          
                          {/* Original Bullet */}
                          <div className="p-3 rounded-lg bg-red-950/10 border border-red-950/30 text-left relative overflow-hidden">
                            <span className="absolute top-1 right-2 text-[8px] font-black font-mono text-red-500 uppercase opacity-60">Original Draft</span>
                            <p className="text-[10px] text-zinc-500 font-medium font-sans leading-normal pr-12">
                              {comp.original}
                            </p>
                          </div>

                          {/* Optimized Bullet */}
                          <div className="p-3 rounded-lg bg-emerald-950/10 border border-emerald-900/20 text-left relative overflow-hidden">
                            <span className="absolute top-1 right-2 text-[8px] font-black font-mono text-emerald-400 uppercase opacity-80">Tailored Optimization</span>
                            <p className="text-[10px] text-zinc-200 font-bold font-sans leading-normal pr-12">
                              {comp.optimized}
                            </p>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Right Output Panel (ATS Score Tracker & Live Blurrable HTML Preview) */}
        <div className="w-full lg:w-1/2 p-4 md:p-6 overflow-y-auto bg-zinc-950/80 h-full flex flex-col space-y-6">
          
          {/* Diagnostic Stats Header */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center glass-panel border border-zinc-900 rounded-2xl p-4 md:p-6">
            <div className="md:col-span-4 flex justify-center">
              <AtsScoreGauge score={atsScore} size={130} />
            </div>
            
            <div className="md:col-span-8 space-y-3 text-left">
              <h3 className="text-sm font-extrabold text-white uppercase tracking-wider font-mono">
                ATS Compatibility Report
              </h3>
              
              {parsedReport ? (
                <div className="space-y-4">
                  {/* Visual Score Breakdown Progress Bars */}
                  {(() => {
                    const bd = parsedReport.breakdown || {};
                    const structureVal = bd.structure !== undefined ? bd.structure : 80;
                    const formattingVal = bd.formatting !== undefined ? bd.formatting : 95;
                    const readabilityVal = bd.readability !== undefined ? bd.readability : 85;
                    const keywordsVal = bd.keywords !== undefined ? bd.keywords : 70;
                    const projectsVal = bd.projects !== undefined ? bd.projects : 75;
                    const achievementsVal = bd.achievements !== undefined ? bd.achievements : 60;

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[9px] font-bold font-mono border-b border-zinc-900 pb-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Structure completeness:</span>
                            <span className="text-cyan-400">{structureVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${structureVal}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Formatting & symbols:</span>
                            <span className="text-cyan-400">{formattingVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${formattingVal}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Recruiter readability:</span>
                            <span className="text-cyan-400">{readabilityVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${readabilityVal}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Target keywords:</span>
                            <span className="text-cyan-400">{keywordsVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${keywordsVal}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Project depth:</span>
                            <span className="text-cyan-400">{projectsVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${projectsVal}%` }} />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-zinc-400">
                            <span>Achievements quality:</span>
                            <span className="text-cyan-400">{achievementsVal}%</span>
                          </div>
                          <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${achievementsVal}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Format & Checklist diagnostics */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-black text-white uppercase tracking-widest font-mono block">
                      Formatting Violations ({parsedReport.warnings.length})
                    </span>
                    <ul className="space-y-1.5 text-[9px] font-bold font-mono max-h-24 overflow-y-auto pr-1">
                      {parsedReport.warnings.map((warn, idx) => (
                        <li key={idx} className="flex items-start space-x-1.5 text-zinc-400">
                          <span className="h-3 w-3 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-[7px] mt-0.5 flex-shrink-0">!</span>
                          <span>{warn}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Missing keyword chip Cloud highlights */}
                  {parsedReport.keywordGaps.length > 0 && (
                    <div className="space-y-2 border-t border-zinc-900 pt-2.5">
                      <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest font-mono block">
                        Target Keyword Gaps ({parsedReport.keywordGaps.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {parsedReport.keywordGaps.map((word, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded bg-amber-950/20 border border-amber-900/30 text-[8px] font-mono text-amber-400 font-bold"
                          >
                            + {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              ) : (
                <ul className="text-xs space-y-2 text-zinc-400">
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Format check:</strong> Clean single-column layout detected (Pass).</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                    <span><strong>Fonts standard:</strong> Helvetica / Arial parsed cleanly.</span>
                  </li>
                  {atsScore < 85 ? (
                    <li className="flex items-start space-x-2 text-amber-500">
                      <span className="h-4 w-4 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-[10px] mt-0.5 flex-shrink-0">!</span>
                      <span><strong>Quantify suggestion:</strong> Add metrics to experience for 98%+ score.</span>
                    </li>
                  ) : (
                    <li className="flex items-start space-x-2 text-cyan-400">
                      <CheckCircle2 className="h-4 w-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span><strong>Quantified bullets:</strong> Standard XYZ numbers detected!</span>
                    </li>
                  )}
                </ul>
              )}

              {/* Paywall Action / Download Trigger */}
              <div className="pt-2">
                {paymentError && (
                  <div className="p-3 rounded-xl bg-red-950/30 border border-red-800/40 text-red-400 text-xs font-bold font-mono tracking-wide flex items-center space-x-2 mb-3">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-ping flex-shrink-0" />
                    <span>{paymentError}</span>
                  </div>
                )}
                 {isPaid ? (
                   <PDFDownloadButton 
                     data={resumeData} 
                     isPaid={isPaid} 
                     userEmail={user.email} 
                     template={selectedTemplate} 
                     resumeId={resumeId}
                     onDownloadConsumed={() => {
                       setIsPaid(false);
                       const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
                       if (localData) {
                         try {
                           const parsed = JSON.parse(localData);
                           parsed.paymentStatus = "unpaid";
                           if (parsed.exportSession) {
                             parsed.exportSession.downloaded = true;
                           }
                           localStorage.setItem(`cv_boost_resume_${resumeId}`, JSON.stringify(parsed));
                         } catch (_) {}
                       }
                     }}
                   />
                 ) : (
                  <button
                    onClick={triggerRazorpayCheckout}
                    className="px-6 py-3 text-xs font-black rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 text-zinc-950 hover:brightness-110 active:scale-98 transition-all shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center space-x-2 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-zinc-950" />
                    <span>Unlock Selection PDF (₹{tailorApplied ? 149 : 80})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Dynamic HTML Document Live Preview Panel */}
          <div className="flex-1 bg-zinc-950 rounded-xl border border-zinc-900 overflow-hidden relative min-h-[450px] shadow-lg flex flex-col">
            
            {/* Template Selector Bar */}
            <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
              <span className="text-[10px] font-black font-mono tracking-wider text-zinc-400 uppercase">
                ATS Template Compiler
              </span>
              <div className="flex items-center space-x-1.5 p-0.5 bg-zinc-950 border border-zinc-850 rounded-lg">
                {(["classic", "minimal", "technical"] as const).map((temp) => (
                  <button
                    key={temp}
                    onClick={() => setSelectedTemplate(temp)}
                    className={`px-2.5 py-1 text-[9px] font-bold font-mono tracking-wide rounded-md transition-all uppercase cursor-pointer ${
                      selectedTemplate === temp
                        ? "bg-cyan-500 text-zinc-950 shadow-sm font-black"
                        : "text-zinc-400 hover:text-zinc-200"
                    }`}
                  >
                    {temp}
                  </button>
                ))}
              </div>
            </div>

            {/* Resume HTML-layout replica (Simulated Preview) */}
            <div 
               onContextMenu={!isPaid ? (e) => e.preventDefault() : undefined}
               className={`w-full h-full p-8 text-[9px] text-[#111] leading-normal bg-white overflow-y-auto relative flex flex-col min-h-full ${
                 selectedTemplate === "minimal" 
                   ? "font-sans px-10 py-10" 
                   : selectedTemplate === "technical" 
                   ? "font-sans px-6 py-6 text-[8.5px]" 
                   : "font-sans px-8 py-8"
               } ${!isPaid ? "select-none" : "select-text"}`}>
              
              {/* Subtle repeating watermark pattern over the sheet if not paid */}
              {!isPaid && (
                <div 
                  className="absolute inset-0 pointer-events-none select-none z-10" 
                  style={{
                    backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='120' viewBox='0 0 160 120'><text x='50%' y='50%' fill='%23000000' font-family='monospace' font-weight='bold' font-size='7.5' opacity='0.04' transform='rotate(-25 80 60)' text-anchor='middle'>BOOSTCV PREVIEW</text></svg>")`,
                    backgroundRepeat: "repeat",
                  }}
                />
              )}

              {/* Header */}
              <div className={`mb-4 flex flex-col ${
                selectedTemplate === "minimal" 
                  ? "items-start text-left mb-6" 
                  : "items-center text-center"
              }`}>
                <h2 className={`font-bold text-black ${
                  selectedTemplate === "minimal"
                    ? "text-2xl text-cyan-600 mb-1 tracking-tight"
                    : selectedTemplate === "technical"
                    ? "text-lg mb-0.5"
                    : "text-xl mb-1"
                }`}>{resumeData.personal.fullName || "Your Full Name"}</h2>
                <div className={`flex flex-wrap gap-2 text-zinc-650 text-[8px] ${
                  selectedTemplate === "minimal" 
                    ? "justify-start" 
                    : "justify-center"
                }`}>
                  {resumeData.personal.phone && <span>{resumeData.personal.phone}</span>}
                  {resumeData.personal.phone && resumeData.personal.email && <span className="text-zinc-400">{selectedTemplate === "technical" ? "|" : "•"}</span>}
                  {resumeData.personal.email && <span>{resumeData.personal.email}</span>}
                  {resumeData.personal.email && resumeData.personal.linkedin && <span className="text-zinc-400">{selectedTemplate === "technical" ? "|" : "•"}</span>}
                  {resumeData.personal.linkedin && <span>{resumeData.personal.linkedin}</span>}
                  {resumeData.personal.linkedin && resumeData.personal.github && <span className="text-zinc-400">{selectedTemplate === "technical" ? "|" : "•"}</span>}
                  {resumeData.personal.github && <span>{resumeData.personal.github}</span>}
                </div>
              </div>

              {/* Education - Unprotected / Crisp and visible */}
              {resumeData.education.length > 0 && (
                <div className={selectedTemplate === "technical" ? "mb-2.5" : "mb-4"}>
                  <h3 className={`font-bold uppercase pb-0.5 text-[9px] tracking-wide ${
                    selectedTemplate === "minimal"
                      ? "text-cyan-600 border-none mb-1 mt-2"
                      : "text-black border-b border-zinc-800 mb-1.5"
                  }`}>
                    Education
                  </h3>
                  {resumeData.education.map((edu, idx) => (
                    <div key={idx} className={selectedTemplate === "technical" ? "mb-1" : "mb-2"}>
                      <div className="flex justify-between font-bold">
                        <span>{edu.institution || "Institution Name"}</span>
                        <span>{edu.year || "2022 - 2026"}</span>
                      </div>
                      <div className="flex justify-between text-zinc-600 italic">
                        <span>{edu.degree || "B.Tech"}</span>
                        <span>{edu.gpa || "9.0 CGPA"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Technical Skills - Unprotected / Crisp and visible */}
              <div className={selectedTemplate === "technical" ? "mb-2.5" : "mb-4"}>
                <h3 className={`font-bold uppercase pb-0.5 text-[9px] tracking-wide ${
                  selectedTemplate === "minimal"
                    ? "text-cyan-600 border-none mb-1 mt-2"
                    : "text-black border-b border-zinc-800 mb-1.5"
                }`}>
                  Technical Skills
                </h3>
                <div className={`text-zinc-850 ${
                  selectedTemplate === "technical" ? "space-y-0.5 text-[8px]" : "space-y-1 text-[8.5px]"
                }`}>
                  {resumeData.skills.languages.length > 0 && (
                    <div>
                      <strong className={`font-bold ${selectedTemplate === "minimal" ? "text-cyan-600" : "text-black"}`}>Languages: </strong>
                      <span>{resumeData.skills.languages.join(", ")}</span>
                    </div>
                  )}
                  {resumeData.skills.frameworks.length > 0 && (
                    <div>
                      <strong className={`font-bold ${selectedTemplate === "minimal" ? "text-cyan-600" : "text-black"}`}>Frameworks: </strong>
                      <span>{resumeData.skills.frameworks.join(", ")}</span>
                    </div>
                  )}
                  {resumeData.skills.tools.length > 0 && (
                    <div>
                      <strong className={`font-bold ${selectedTemplate === "minimal" ? "text-cyan-600" : "text-black"}`}>Developer Tools: </strong>
                      <span>{resumeData.skills.tools.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Certifications - Unprotected / Crisp and visible */}
              {resumeData.certifications && resumeData.certifications.length > 0 && (
                <div className={selectedTemplate === "technical" ? "mb-2.5" : "mb-4"}>
                  <h3 className={`font-bold uppercase pb-0.5 text-[9px] tracking-wide ${
                    selectedTemplate === "minimal"
                      ? "text-cyan-600 border-none mb-1 mt-2"
                      : "text-black border-b border-zinc-800 mb-1.5"
                  }`}>
                    Certifications
                  </h3>
                  <ul className={`list-disc pl-4 text-zinc-800 ${
                    selectedTemplate === "minimal"
                      ? "space-y-1 text-[8.5px]"
                      : selectedTemplate === "technical"
                      ? "space-y-0.5 text-[8.2px]"
                      : "space-y-0.5 text-[8.5px]"
                  }`}>
                    {resumeData.certifications.map((cert, idx) => (
                      cert.trim().length > 0 && (
                        <li key={idx} className={selectedTemplate === "minimal" ? "marker:text-cyan-500" : ""}>{cert}</li>
                      )
                    ))}
                  </ul>
                </div>
              )}

               {/* Experience and Projects Gated Container */}
               {((resumeData.experience.length > 0) || (resumeData.projects.length > 0)) && (
                 <div className={!isPaid ? "relative overflow-hidden max-h-[220px] select-none pointer-events-none blur-[1.5px] border-b border-zinc-200" : ""}>
                   
                   {/* Experience */}
                   {resumeData.experience.length > 0 && (
                     <div className={selectedTemplate === "technical" ? "mb-2.5 relative" : "mb-4 relative"}>
                       <h3 className={`font-bold uppercase pb-0.5 text-[9px] tracking-wide ${
                         selectedTemplate === "minimal"
                           ? "text-cyan-600 border-none mb-1 mt-2"
                           : "text-black border-b border-zinc-800 mb-1.5"
                       }`}>
                         Experience
                       </h3>
                       {resumeData.experience.map((exp, idx) => (
                         <div key={idx} className={selectedTemplate === "technical" ? "mb-2" : "mb-3"}>
                           <div className="flex justify-between font-bold text-black">
                             <span>{exp.company || "Company Name"}</span>
                             <span className="text-zinc-600 font-normal">{exp.duration || "Duration"}</span>
                           </div>
                           <div className={`italic text-zinc-600 mb-1 ${selectedTemplate === "technical" ? "font-bold text-black" : ""}`}>{exp.role || "Role"}</div>
                           
                           <ul className={`list-disc pl-4 text-zinc-800 ${
                             selectedTemplate === "minimal"
                               ? "space-y-1.5 text-[8.5px]"
                               : selectedTemplate === "technical"
                               ? "space-y-0.5 text-[8.2px]"
                               : "space-y-1 text-[8.5px]"
                           }`}>
                             {exp.bullets.map((bullet, bIdx) => (
                               bullet.trim().length > 0 && (
                                 <li key={bIdx} className={selectedTemplate === "minimal" ? "marker:text-cyan-500" : ""}>{bullet}</li>
                               )
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   )}
 
                   {/* Projects */}
                   {resumeData.projects.length > 0 && (
                     <div className={selectedTemplate === "technical" ? "mb-2.5 relative" : "mb-4 relative"}>
                       <h3 className={`font-bold uppercase pb-0.5 text-[9px] tracking-wide ${
                         selectedTemplate === "minimal"
                           ? "text-cyan-600 border-none mb-1 mt-2"
                           : "text-black border-b border-zinc-800 mb-1.5"
                       }`}>
                         Projects
                       </h3>
                       {resumeData.projects.map((proj, idx) => (
                         <div key={idx} className={selectedTemplate === "technical" ? "mb-1.5" : "mb-2"}>
                           <div className="flex justify-between font-bold text-black">
                             <span>{proj.title || "Project Title"}</span>
                             <span className="text-zinc-500 text-[8px] font-normal">Tech: {proj.techStack || "Tech Stack"}</span>
                           </div>
                           
                           <ul className={`list-disc pl-4 text-zinc-800 mt-1 ${
                             selectedTemplate === "minimal"
                               ? "space-y-1.5 text-[8.5px]"
                               : selectedTemplate === "technical"
                               ? "space-y-0.5 text-[8.2px]"
                               : "space-y-0.5 text-[8.5px]"
                           }`}>
                             {proj.description.split("\n").map((line, lIdx) => (
                               line.trim().length > 0 && (
                                 <li key={lIdx} className={selectedTemplate === "minimal" ? "marker:text-cyan-500" : ""}>{line}</li>
                               )
                             ))}
                           </ul>
                         </div>
                       ))}
                     </div>
                   )}
                   
                 </div>
               )}
 
             </div>

            {/* Paywall Bottom Fade Mask Overlay & Floating glassmorphic CTA */}
            {!isPaid && (
              <>
                {/* Premium Dark Gradient Fade blending the white page into dark dashboard background */}
                <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-zinc-950 via-zinc-950/85 to-transparent pointer-events-none z-20" />

                {/* Floating premium Glassmorphism Checkout CTA */}
                <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col items-center">
                  <div className="w-full max-w-md p-5 rounded-xl border border-cyan-500/25 bg-zinc-950/90 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.15)] space-y-4 animate-neon-pulse">
                    
                    {/* Header cyber lock emblem */}
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-6 w-6 rounded-full bg-cyan-950 border border-cyan-500/35 flex items-center justify-center shadow-sm">
                        <Lock className="h-3 w-3 text-cyan-400 animate-pulse" />
                      </div>
                      <span className="text-[10px] font-black font-mono tracking-widest text-cyan-400 uppercase">
                        PREMIUM ATS FORMAT LOCKED
                      </span>
                    </div>

                    {/* Sales Copy */}
                    <div className="text-center space-y-1">
                      <h4 className="text-sm font-extrabold text-white leading-tight">
                        Unlock Final Recruiter-Ready PDF
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-medium">
                        Secure your 100% clean selectable-text PDF. Fully verified against placements scanner guidelines.
                      </p>
                    </div>

                    {/* Quick Trust Checks */}
                    <div className="grid grid-cols-2 gap-2 border-y border-zinc-900 py-2.5 text-[9px] text-zinc-300 font-bold font-mono">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-400">✓</span>
                        <span>98%+ ATS Pass Guaranteed</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-400">✓</span>
                        <span>Standard Single-Column</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-400">✓</span>
                        <span>100% Editable Selection Text</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="text-cyan-400">✓</span>
                        <span>Lifetime Free AI Re-tuner</span>
                      </div>
                    </div>

                    {/* Razorpay Standard Instant Unlock Button */}
                    <button
                      onClick={triggerRazorpayCheckout}
                      className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-zinc-950 font-black text-xs shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all transform active:scale-98 flex items-center justify-center space-x-1.5"
                    >
                      <Zap className="h-4 w-4 text-zinc-950 fill-zinc-950 stroke-[2.5]" />
                      <span>Unlock & Download Now — ₹{tailorApplied ? 149 : 80}</span>
                    </button>

                    {/* Classmate referral share widget for free access */}
                    <div className="border-t border-zinc-900 pt-3 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-zinc-400">B.Tech Referral Scheme (Unlock Free)</span>
                        <span className="text-cyan-400 font-mono">{referralCount} / 3 Classmates Joined</span>
                      </div>
                      <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-cyan-500 h-full transition-all duration-500" 
                          style={{ width: `${(referralCount / 3) * 100}%` }}
                        />
                      </div>
                      
                      <div className="flex items-center space-x-1.5 pt-1">
                        <input
                          type="text"
                          readOnly
                          value={referralLink}
                          className="bg-zinc-900/60 border border-zinc-900 text-[9px] p-2 rounded flex-1 text-zinc-500 outline-none select-all font-mono"
                        />
                        <button
                          onClick={copyReferral}
                          className="px-3 py-2 rounded bg-cyan-950 border border-cyan-800 text-cyan-400 hover:bg-cyan-900 transition-colors font-bold text-[9px]"
                        >
                          {copied ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </>
            )}

        </div>
 
      </div>

    </div>

      {/* Simulated Payment Sandbox Modal Overlay */}
      {showMockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md border border-cyan-500/30 rounded-2xl bg-zinc-950/95 backdrop-blur-md p-6 space-y-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header branding */}
            <div className="flex items-center space-x-3 border-b border-zinc-900 pb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-electric-blue flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                <Zap className="h-5.5 w-5.5 text-zinc-950 stroke-[2.5]" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black text-white font-mono tracking-wide uppercase">
                  Razorpay Sandbox Gateway
                </h3>
                <p className="text-[10px] text-cyan-400 font-bold font-mono tracking-widest uppercase">
                  Offline Development Mode
                </p>
              </div>
            </div>

            {/* Simulated Payment details */}
            <div className="bg-zinc-900/40 border border-zinc-900 rounded-xl p-4 space-y-3 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">Merchandiser:</span>
                <span className="text-slate-200 font-bold">BOOSTCV Professional</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Simulated Order:</span>
                <span className="text-cyan-400 font-bold select-all">{mockOrderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Amount Due:</span>
                <span className="text-emerald-400 font-extrabold text-sm">₹{(mockAmount / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Currency:</span>
                <span className="text-slate-200">INR (Indian Rupee)</span>
              </div>
              <div className="flex justify-between border-t border-zinc-900 pt-2.5 mt-1">
                <span className="text-zinc-500">Simulation Method:</span>
                <span className="text-amber-400 font-bold">Mock Signature Verification</span>
              </div>
            </div>

            {/* Information Callout */}
            <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-800/20 text-zinc-400 text-[10px] leading-relaxed space-y-1 text-left">
              <div className="flex items-center space-x-1 text-cyan-400 font-black">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping mr-1" />
                <span>DEVELOPER INFO</span>
              </div>
              <p>
                No live Razorpay credential keys were configured in your environment variable files (`.env`).
                The backend automatically generated a safe mock checkout token. Click below to simulate the transaction.
              </p>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleMockPaymentFailure}
                className="py-3 px-4 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 hover:bg-zinc-900/50 text-zinc-400 hover:text-white font-extrabold text-xs transition-all transform active:scale-98"
              >
                Decline & Cancel
              </button>
              
              <button
                onClick={handleMockPaymentSuccess}
                className="py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 hover:brightness-110 text-zinc-950 font-black text-xs transition-all transform active:scale-98 shadow-[0_0_15px_rgba(6,182,212,0.25)] flex items-center justify-center space-x-1.5"
              >
                <CheckCircle2 className="h-4 w-4 text-zinc-950" />
                <span>Simulate Pay</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
