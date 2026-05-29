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
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const payload: any = {
      id: resumeId,
      userId,
      atsScore,
      data,
      paymentStatus: "unpaid",
      updatedAt: serverTimestamp(),
    };
    if (usedAITailor !== undefined) {
      payload.usedAITailor = usedAITailor;
    }
    if (parsedReport !== undefined) {
      payload.parsedReport = parsedReport;
    }
    if (analysisHistory !== undefined) {
      payload.analysisHistory = analysisHistory;
    }
    if (companyAnalysisHistory !== undefined) {
      payload.companyAnalysisHistory = companyAnalysisHistory;
    }
    await setDoc(resumeRef, payload, { merge: true });
  } catch (error) {
    console.warn("Firestore saveResume failed, falling back to localStorage:", error);
    let paymentStatus = "unpaid";
    let isTailored = false;
    let existingReport = null;
    let existingHistory: any[] = [];
    let existingCompanyHistory: any[] = [];
    const existing = localStorage.getItem(`cv_boost_resume_${resumeId}`);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        paymentStatus = parsed.paymentStatus || "unpaid";
        isTailored = parsed.usedAITailor || false;
        existingReport = parsed.parsedReport || null;
        existingHistory = parsed.analysisHistory || [];
        existingCompanyHistory = parsed.companyAnalysisHistory || [];
      } catch (_) {}
    }
    localStorage.setItem(
      `cv_boost_resume_${resumeId}`,
      JSON.stringify({
        id: resumeId,
        userId,
        atsScore,
        data,
        paymentStatus,
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
  try {
    const resumeRef = doc(db, "resumes", resumeId);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min expiry
    await setDoc(
      resumeRef,
      {
        paymentStatus: "paid",
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    const localData = localStorage.getItem(`cv_boost_resume_${resumeId}`);
    let parsed: any = {};
    if (localData) {
      try {
        parsed = JSON.parse(localData);
      } catch (_) {}
    }
    parsed.id = resumeId;
    parsed.paymentStatus = "paid";
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