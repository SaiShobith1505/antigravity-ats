import { 
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import { db } from "./firebase";

export interface ResumeData {
  personal: {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
  };

  education: Array<{
    institution: string;
    degree: string;
    year: string;
    gpa: string;
  }>;

  experience: Array<{
    company: string;
    role: string;
    duration: string;
    bullets: string[];
  }>;

  projects: Array<{
    title: string;
    techStack: string;
    description: string;
  }>;

  skills: {
    languages: string[];
    frameworks: string[];
    tools: string[];
  };
  certifications?: string[];
}

export interface CompanyAnalysisHistoryItem {
  id: string;
  timestamp: string;
  companyName: string;
  roleName: string;
  matchScore: number;
  technicalMatch: number;
  experienceMatch: number;
  skillsMatch: number;
  projectMatch: number;
  missingSkills: string[];
  suggestions: string[];
  focusMode: string;
  recruiterPerspective: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
  };
  gapAnalysis: {
    expected: string[];
    contains: string[];
    missing: string[];
  };
}

// Save Resume
export async function saveResume(
  userId: string,
  resumeId: string,
  data: ResumeData,
  atsScore: number,
  usedAITailor?: boolean,
  parsedReport?: any,
  analysisHistory?: any,
  companyAnalysisHistory?: CompanyAnalysisHistoryItem[]
): Promise<void> {
  let paymentStatus = "unpaid";
  let downloadsRemaining = 0;
  let downloadsUsed = 0;
  let paymentDate = null;
  let exportSession = null;
  let isTailored = false;
  let existingReport = null;
  let existingHistory: any[] = [];
  let existingCompanyHistory: any[] = [];

  // Try to load existing data from Firestore
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data();
      paymentStatus = existingData.paymentStatus || "unpaid";
      downloadsRemaining = existingData.downloadsRemaining !== undefined ? existingData.downloadsRemaining : 0;
      downloadsUsed = existingData.downloadsUsed !== undefined ? existingData.downloadsUsed : 0;
      paymentDate = existingData.paymentDate || null;
      exportSession = existingData.exportSession || null;
      isTailored = existingData.usedAITailor || false;
      existingReport = existingData.parsedReport || null;
      existingHistory = existingData.analysisHistory || [];
      existingCompanyHistory = existingData.companyAnalysisHistory || [];
    }
  } catch (_) {}

  // Also check local storage for offline continuity
  const existing = typeof window !== "undefined" ? localStorage.getItem(`cv_boost_resume_${resumeId}`) : null;
  if (existing) {
    try {
      const parsed = JSON.parse(existing);
      if (parsed.paymentStatus && paymentStatus === "unpaid") {
        paymentStatus = parsed.paymentStatus;
      }
      if (parsed.downloadsRemaining !== undefined && downloadsRemaining === 0) {
        downloadsRemaining = parsed.downloadsRemaining;
      }
      if (parsed.downloadsUsed !== undefined && downloadsUsed === 0) {
        downloadsUsed = parsed.downloadsUsed;
      }
      if (parsed.paymentDate && !paymentDate) {
        paymentDate = parsed.paymentDate;
      }
      if (parsed.exportSession && !exportSession) {
        exportSession = parsed.exportSession;
      }
      if (parsed.usedAITailor && !isTailored) {
        isTailored = parsed.usedAITailor;
      }
      if (parsed.parsedReport && !existingReport) {
        existingReport = parsed.parsedReport;
      }
      if (parsed.analysisHistory && existingHistory.length === 0) {
        existingHistory = parsed.analysisHistory;
      }
      if (parsed.companyAnalysisHistory && existingCompanyHistory.length === 0) {
        existingCompanyHistory = parsed.companyAnalysisHistory;
      }
    } catch (_) {}
  }

  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const payload: any = {
      id: resumeId,
      userId,
      atsScore,
      data,
      paymentStatus,
      downloadsRemaining,
      downloadsUsed,
      updatedAt: serverTimestamp(),
    };
    if (paymentDate) payload.paymentDate = paymentDate;
    if (exportSession) payload.exportSession = exportSession;
    if (usedAITailor !== undefined) {
      payload.usedAITailor = usedAITailor;
    } else {
      payload.usedAITailor = isTailored;
    }
    if (parsedReport !== undefined) {
      payload.parsedReport = parsedReport;
    } else {
      payload.parsedReport = existingReport;
    }
    if (analysisHistory !== undefined) {
      payload.analysisHistory = analysisHistory;
    } else {
      payload.analysisHistory = existingHistory;
    }
    if (companyAnalysisHistory !== undefined) {
      payload.companyAnalysisHistory = companyAnalysisHistory;
    } else {
      payload.companyAnalysisHistory = existingCompanyHistory;
    }
    await setDoc(resumeRef, payload, { merge: true });
  } catch (error) {
    console.warn("Firestore saveResume failed, falling back to localStorage:", error);
  }

  // Always write to local storage to keep state in perfect sync
  if (typeof window !== "undefined") {
    localStorage.setItem(
      `cv_boost_resume_${resumeId}`,
      JSON.stringify({
        id: resumeId,
        userId,
        atsScore,
        data,
        paymentStatus,
        downloadsRemaining,
        downloadsUsed,
        paymentDate,
        exportSession,
        usedAITailor: usedAITailor !== undefined ? usedAITailor : isTailored,
        parsedReport: parsedReport !== undefined ? parsedReport : existingReport,
        analysisHistory: analysisHistory !== undefined ? analysisHistory : existingHistory,
        companyAnalysisHistory: companyAnalysisHistory !== undefined ? companyAnalysisHistory : existingCompanyHistory,
        updatedAt: new Date().toISOString(),
      })
    );
  }
}

// Get Resume
export async function getResume(
  resumeId: string
): Promise<any | null> {
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (error) {
    console.warn("Firestore getResume failed, falling back to localStorage:", error);
    const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
    if (localData) {
      try {
        return JSON.parse(localData);
      } catch (_) {}
    }
  }
  return null;
}

// Get User Resumes
export async function getUserResumes(
  userId: string
): Promise<any[]> {
  try {
    const q = query(
      collection(db, "resumes"),
      where("userId", "==", userId)
    );
    const querySnapshot = await getDocs(q);
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
      results.push(doc.data());
    });
    return results;
  } catch (error) {
    console.warn("Firestore getUserResumes failed, falling back to localStorage:", error);
    const results: any[] = [];
    if (typeof window !== "undefined") {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("cv_boost_resume_")) {
          try {
            const val = JSON.parse(localStorage.getItem(key) || "");
            if (val.userId === userId) {
              results.push(val);
            }
          } catch (_) {}
        }
      }
    }
    return results;
  }
}

// Check Payment Status
export async function getPaymentStatus(
  resumeId: string
): Promise<boolean> {
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const docSnap = await getDoc(resumeRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.downloadsRemaining !== undefined) {
        return data.downloadsRemaining > 0;
      }
      if (data.exportSession) {
        const { downloaded, expiresAt } = data.exportSession;
        return downloaded === false && new Date(expiresAt) > new Date();
      }
      return data.paymentStatus === "paid";
    }
  } catch (error) {
    console.warn("Firestore getPaymentStatus failed, falling back to localStorage:", error);
    const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        if (parsed.downloadsRemaining !== undefined) {
          return parsed.downloadsRemaining > 0;
        }
        if (parsed.exportSession) {
          const { downloaded, expiresAt } = parsed.exportSession;
          return downloaded === false && new Date(expiresAt) > new Date();
        }
        return parsed.paymentStatus === "paid";
      } catch (_) {}
    }
  }
  return false;
}

// Mark Resume As Paid
export async function setPaymentStatusPaid(
  resumeId: string
): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry
  const paymentDate = new Date().toISOString();
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    await setDoc(
      resumeRef,
      {
        paymentStatus: "paid",
        downloadsRemaining: 2,
        downloadsUsed: 0,
        paymentDate,
        exportSession: {
          token: "mock-local-" + Math.random().toString(36).substring(2, 10),
          expiresAt,
          downloaded: false
        }
      },
      { merge: true }
    );
  } catch (error) {
    console.warn("Firestore setPaymentStatusPaid failed, falling back to localStorage:", error);
  }

  // Always sync to local storage fallbacks
  if (typeof window !== "undefined") {
    const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
    let parsed: any = {};
    if (localData) {
      try {
        parsed = JSON.parse(localData);
      } catch (_) {}
    }
    parsed.id = resumeId;
    parsed.paymentStatus = "paid";
    parsed.downloadsRemaining = 2;
    parsed.downloadsUsed = 0;
    parsed.paymentDate = paymentDate;
    parsed.exportSession = {
      token: "mock-local-" + Math.random().toString(36).substring(2, 10),
      expiresAt,
      downloaded: false
    };
    parsed.updatedAt = new Date().toISOString();
    localStorage.setItem(`cv_boost_resume_${resumeId}`, JSON.stringify(parsed));
  }
}

// Default Demo Resume
export const defaultResumeData: ResumeData = {
  personal: {
    fullName: "Amit Sharma",
    email: "amit.sharma@btech.edu",
    phone: "+91 98765 43210",
    linkedin: "linkedin.com/in/amit-sharma-btech",
    github: "github.com/amitsharma-dev",
  },

  education: [
    {
      institution: "Delhi Technological University (DTU)",
      degree: "B.Tech in Computer Science and Engineering",
      year: "2022 - 2026",
      gpa: "8.85 CGPA",
    },
  ],

  experience: [
    {
      company: "InnovateTech Solutions",
      role: "Backend Engineering Intern",
      duration: "May 2025 - July 2025",
      bullets: [
        "Orchestrated backend migration to Node.js/Express increasing system response times by 32%.",
        "Refactored relational database queries improving latency by 120ms.",
        "Collaborated in agile sprints delivering 4 major microservices.",
      ],
    },
  ],

  projects: [
    {
      title: "BOOSTCV (ATS SaaS Compiler)",
      techStack: "Next.js, Tailwind, React, Node.js",
      description:
        "Engineered ATS-optimized resume generation platform with clean parsing structure.",
    },
  ],

  skills: {
    languages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "C++",
      "SQL",
    ],

    frameworks: [
      "React",
      "Next.js",
      "Express",
      "Node.js",
      "Tailwind CSS",
    ],

    tools: [
      "Git",
      "GitHub",
      "Docker",
      "VS Code",
      "Firebase",
    ],
  },
  certifications: [
    "AWS Certified Solutions Architect - Associate",
    "Google Summer of Code (GSoC) Contributor",
    "React Advanced Developer Certification",
  ],
};

export interface UserProfile {
  uid: string;
  email: string | null;
  atsScansRemaining: number;
  isPro: boolean;
  proExpiresAt?: string | null;
  exportsRemaining?: number;
}

// Get or Create User Profile for trial tracking
export async function getUserProfile(
  uid: string,
  email: string | null
): Promise<UserProfile> {
  try {
    const userRef = doc(db, "users", uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        uid,
        email: data.email || email,
        atsScansRemaining: data.atsScansRemaining !== undefined ? data.atsScansRemaining : 1,
        isPro: data.isPro || false,
        proExpiresAt: data.proExpiresAt || null,
        exportsRemaining: data.exportsRemaining !== undefined ? data.exportsRemaining : 0
      };
    }
  } catch (err) {
    console.warn("Firestore getUserProfile failed:", err);
  }

  // Local storage fallback for sandboxing robustness
  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`cv_boost_profile_${uid}`);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (_) {}
    }
  }

  const newProfile: UserProfile = {
    uid,
    email,
    atsScansRemaining: 1,
    isPro: false,
    proExpiresAt: null,
    exportsRemaining: 0
  };

  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, newProfile, { merge: true });
  } catch (_) {}

  if (typeof window !== "undefined") {
    localStorage.setItem(`cv_boost_profile_${uid}`, JSON.stringify(newProfile));
  }

  return newProfile;
}

// Update User Profile (e.g. decrement scan count or upgrade to Pro)
export async function updateUserProfile(
  uid: string,
  updates: Partial<UserProfile>
): Promise<void> {
  try {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, updates, { merge: true });
  } catch (err) {
    console.warn("Firestore updateUserProfile failed:", err);
  }

  if (typeof window !== "undefined") {
    const cached = localStorage.getItem(`cv_boost_profile_${uid}`);
    let parsed: any = {};
    if (cached) {
      try {
        parsed = JSON.parse(cached);
      } catch (_) {}
    }
    const updated = { ...parsed, ...updates };
    localStorage.setItem(`cv_boost_profile_${uid}`, JSON.stringify(updated));
  }
}