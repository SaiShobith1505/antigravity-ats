import { ResumeData } from "./db";
import { explainScore } from "./score_explainer";
import { classifyResume } from "./resume_type_classifier";

export interface VerifiedWarning {
  warning_type: string;
  confidence: number;
  evidence: string;
  affected_section: string;
  triggering_pattern: string;
  source_page?: number;
}


export interface ActionableFix {
  issue: string;
  reason: string;
  severity: "critical" | "high" | "medium";
  affected_section: "personal" | "education" | "experience" | "projects" | "skills" | "certifications" | "summary";
  recommended_fix: string;
  expected_score_gain: {
    category: "structure" | "formatting" | "readability" | "keywords" | "projects" | "achievements";
    points: number;
  };
}

export interface ScoringResult {
  atsScore: number;
  warnings: string[];
  verifiedWarnings: VerifiedWarning[];
  actionableFixes: ActionableFix[];
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
  resumeType?: string;
  classificationConfidence?: number;
  parserConfidence?: number;
  scoreExplanation?: { positives: string[]; negatives: string[] };
}

const SYNONYM_MAP: Record<string, string[]> = {
  javascript: ["js", "javascript", "reactjs", "node", "nodejs"],
  typescript: ["ts", "typescript"],
  react: ["react", "reactjs", "react.js"],
  nextjs: ["next", "nextjs", "next.js"],
  nodejs: ["node", "nodejs", "node.js"],
  docker: ["docker", "containerization"],
  git: ["git", "github", "gitlab"],
  kubernetes: ["k8s", "kubernetes"],
  aws: ["aws", "amazon web services"],
  gcp: ["gcp", "google cloud"],
  sql: ["sql", "mysql", "postgresql", "sqlite"],
  nosql: ["nosql", "mongodb", "redis"],
};

const BUZZWORDS = ["synergy", "dynamic", "motivated", "detail-oriented", "results-driven", "innovative", "passionate", "team-player"];

const ACTION_VERBS = [
  "spearheaded", "led", "developed", "optimized", "designed", "built", "implemented",
  "increased", "reduced", "managed", "created", "executed", "formulated", "engineered",
  "boosted", "drove", "improved", "scaled", "automated", "streamlined", "accelerated",
  "pioneered", "coordinated", "launched", "established", "architected", "analyzed"
];

// Compile structured JSON fields into plain text stream matching raw text from files
export function serializeResumeDataToText(data: ResumeData): string {
  const lines: string[] = [];
  
  if (data.personal) {
    lines.push(data.personal.fullName || "");
    lines.push(data.personal.email || "");
    lines.push(data.personal.phone || "");
    lines.push(data.personal.linkedin || "");
    lines.push(data.personal.github || "");
    // Support personal.summary if added
    if ((data.personal as any).summary) {
      lines.push("Summary");
      lines.push((data.personal as any).summary);
    }
  }

  if (data.education && data.education.length > 0) {
    lines.push("Education");
    data.education.forEach(edu => {
      lines.push(`${edu.institution || ""} ${edu.degree || ""} ${edu.year || ""} ${edu.gpa || ""}`);
    });
  }

  if (data.experience && data.experience.length > 0) {
    lines.push("Experience");
    data.experience.forEach(exp => {
      lines.push(`${exp.company || ""} ${exp.role || ""} ${exp.duration || ""}`);
      if (exp.bullets && Array.isArray(exp.bullets)) {
        exp.bullets.forEach(bullet => {
          lines.push(bullet || "");
        });
      }
    });
  }

  if (data.projects && data.projects.length > 0) {
    lines.push("Projects");
    data.projects.forEach(proj => {
      lines.push(`${proj.title || ""} ${proj.techStack || ""}`);
      lines.push(proj.description || "");
    });
  }

  if (data.skills) {
    lines.push("Skills");
    const langs = data.skills.languages || [];
    const frameworks = data.skills.frameworks || [];
    const tools = data.skills.tools || [];
    lines.push(langs.join(", "));
    lines.push(frameworks.join(", "));
    lines.push(tools.join(", "));
  }

  if (data.certifications && data.certifications.length > 0) {
    lines.push("Certifications");
    lines.push(data.certifications.join(", "));
  }

  return lines.join("\n");
}

function getPageForIndex(text: string, index: number): number {
  const pageMarkerRegex = /\[PAGE (\d+)\]/g;
  let match;
  let lastPage = 1;
  while ((match = pageMarkerRegex.exec(text)) !== null) {
    if (match.index <= index) {
      lastPage = parseInt(match[1], 10);
    } else {
      break;
    }
  }
  return lastPage;
}

export interface ProfileSettings {
  weights: {
    structure: number;
    formatting: number;
    readability: number;
    keywords: number;
    projects: number;
    achievements: number;
  };
  requiredSections: string[];
  requiresGithub: boolean;
}

export const PROFILE_SETTINGS: Record<string, ProfileSettings> = {
  "Software Engineering": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.15, projects: 0.15, achievements: 0.15 },
    requiredSections: ["education", "experience", "projects", "skills"],
    requiresGithub: true
  },
  "Data Science": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.15, projects: 0.15, achievements: 0.15 },
    requiredSections: ["education", "experience", "projects", "skills"],
    requiresGithub: true
  },
  "Cybersecurity": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.15, projects: 0.15, achievements: 0.15 },
    requiredSections: ["education", "experience", "projects", "skills"],
    requiresGithub: true
  },
  "Business Analyst": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.25, projects: 0.00, achievements: 0.20 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Product Management": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.05, achievements: 0.20 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Marketing": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.00, achievements: 0.25 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Finance": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.00, achievements: 0.25 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Consulting": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.00, achievements: 0.25 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Sales": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.00, achievements: 0.25 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "Operations": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.00, achievements: 0.25 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "HR": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.25, projects: 0.00, achievements: 0.20 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  },
  "General Corporate": {
    weights: { structure: 0.20, formatting: 0.20, readability: 0.15, keywords: 0.20, projects: 0.05, achievements: 0.20 },
    requiredSections: ["education", "experience", "skills"],
    requiresGithub: false
  }
};

export const PROFILE_KEYWORDS: Record<string, string[]> = {
  "Software Engineering": ["react", "next.js", "nodejs", "typescript", "docker", "git", "sql", "nosql", "aws", "gcp"],
  "Data Science": ["python", "machine learning", "deep learning", "pandas", "numpy", "sql", "tableau", "power bi", "analytics", "statistics"],
  "Cybersecurity": ["cybersecurity", "security", "firewall", "cryptography", "penetration", "vulnerability", "incident response", "soc", "siem", "compliance"],
  "Business Analyst": ["business analysis", "sql", "tableau", "power bi", "requirements", "user stories", "jira", "agile", "process mapping", "stakeholders"],
  "Product Management": ["product roadmap", "agile", "scrum", "prd", "user stories", "prioritization", "ux", "metrics", "product strategy", "launch"],
  "Marketing": ["seo", "sem", "google analytics", "campaign", "social media", "content strategy", "brand", "email marketing", "copywriting", "ctr"],
  "Finance": ["financial modeling", "accounting", "ledger", "audit", "cfa", "valuation", "excel", "budgeting", "forecasting", "portfolio"],
  "Consulting": ["strategy", "management consulting", "process improvement", "advisory", "case study", "stakeholder management", "change management", "analysis"],
  "Sales": ["salesforce", "crm", "lead generation", "sales pipeline", "cold calling", "b2b", "negotiation", "quota", "revenue"],
  "Operations": ["supply chain", "logistics", "process optimization", "lean", "six sigma", "inventory", "vendor management", "procurement", "efficiency"],
  "HR": ["recruiting", "talent acquisition", "onboarding", "payroll", "employee relations", "hiring", "compliance", "training", "benefits", "performance"],
  "General Corporate": ["management", "project", "strategy", "analysis", "communication", "collaboration", "planning", "reporting", "operations", "excel"]
};



export function hasPhoneNumber(text: string): boolean {
  const phoneRegex = /(\+?\(?\d[\d-\s\(\)\.]{6,22}\d)/g;
  const matches = text.match(phoneRegex);
  if (!matches) return false;

  for (const m of matches) {
    if (/\b\d{4}\s*[-–/]\s*\d{4}\b/.test(m)) continue;
    if (/\b\d{1,2}\s*[-–/]\s*\d{4}\b/.test(m)) continue;
    if (/\b\d{1,2}\s*[-–/]\s*\d{1,2}\s*[-–/]\s*\d{2,4}\b/.test(m)) continue;

    const digits = m.replace(/\D/g, "");
    if (digits.length >= 7 && digits.length <= 15) {
      if (/^\d{8}$/.test(digits)) {
        if (/^(19|20)\d{2}(19|20)\d{2}$/.test(digits)) continue;
        if (/^\d{2}\d{2}\d{4}$/.test(digits)) continue;
      }
      return true;
    }
  }
  return false;
}

export function calculateParserConfidence(text: string, filename: string): number {
  if (!text || text.trim().length === 0) return 35;
  const lowerFilename = filename.toLowerCase();
  let score = 95;

  if (lowerFilename.endsWith(".docx")) {
    score = 98;
  }

  const charCount = text.length;
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

  if (charCount < 400 || wordCount < 50) {
    return 35;
  }

  const avgWordLength = charCount / Math.max(1, wordCount);
  if (avgWordLength > 20) {
    return 45;
  }

  const corruptedChars = (text.match(/[\uFFFD\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g) || []).length;
  if (corruptedChars > 10) {
    score -= Math.min(30, corruptedChars * 2);
  }

  return Math.max(35, Math.min(98, score));
}

export function calculateAtsScore(
  text: string,
  filename: string,
  jobDescription?: string,
  mode: "student" | "universal" = "student"
): ScoringResult {
  const verifiedWarnings: VerifiedWarning[] = [];
  const actionableFixes: ActionableFix[] = [];
  const keywordGaps: string[] = [];
  const metricEnhancements: string[] = [];
  
  const lowerText = text.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  // Classification Layer
  const classification = mode === "universal" ? classifyResume(text) : { resume_type: "Software Engineering", confidence: 1.0 };
  const currentType = classification.resume_type;
  const currentConf = classification.confidence;
  const profile = PROFILE_SETTINGS[currentType] || PROFILE_SETTINGS["General Corporate"];

  // 1. Structure Check (20% of final score)
  let structureScore = 0;
  const hasEducation = lowerText.includes("education") || lowerText.includes("college") || lowerText.includes("university") || lowerText.includes("academic");
  const hasExperience = lowerText.includes("experience") || lowerText.includes("work") || lowerText.includes("employment") || lowerText.includes("history");
  const hasProjects = lowerText.includes("projects") || lowerText.includes("project");
  const hasSkills = lowerText.includes("skills") || lowerText.includes("technologies") || lowerText.includes("tools");
  const hasCertifications = lowerText.includes("certifications") || lowerText.includes("certification") || lowerText.includes("awards") || lowerText.includes("accomplishments");

  if (mode === "student") {
    if (hasEducation) {
      structureScore += 20;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No Education heading detected.",
        affected_section: "education",
        triggering_pattern: "missing_education"
      });
      actionableFixes.push({
        issue: "Missing Education Section",
        reason: "ATS filters and placement boards require tech intern listings to confirm college registration.",
        severity: "critical",
        affected_section: "education",
        recommended_fix: "Add institutional credentials, degree path, graduation year, and GPA metrics.",
        expected_score_gain: { category: "structure", points: 20 }
      });
    }

    if (hasExperience) {
      structureScore += 20;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No Experience heading detected.",
        affected_section: "experience",
        triggering_pattern: "missing_experience"
      });
      actionableFixes.push({
        issue: "Missing Experience Section",
        reason: "ATS systems weight professional internship listings higher than personal projects.",
        severity: "critical",
        affected_section: "experience",
        recommended_fix: "Include details of past jobs, internships, or freelance roles with achievements.",
        expected_score_gain: { category: "structure", points: 20 }
      });
    }

    if (hasProjects) {
      structureScore += 20;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No Projects heading detected.",
        affected_section: "projects",
        triggering_pattern: "missing_projects"
      });
      actionableFixes.push({
        issue: "Missing Technical Projects",
        reason: "Engineering recruiters rely heavily on code portfolios to judge technical competence.",
        severity: "critical",
        affected_section: "projects",
        recommended_fix: "Include at least 2 capstone technical projects showcasing your tech stack.",
        expected_score_gain: { category: "structure", points: 20 }
      });
    }

    if (hasSkills) {
      structureScore += 20;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No Skills heading detected.",
        affected_section: "skills",
        triggering_pattern: "missing_skills"
      });
      actionableFixes.push({
        issue: "Missing Technical Skills Section",
        reason: "Applicant systems use keyword matching tools on programming languages to rank candidate profiles.",
        severity: "critical",
        affected_section: "skills",
        recommended_fix: "Create a dedicated skills block detailing languages, frameworks, and developer tools.",
        expected_score_gain: { category: "structure", points: 20 }
      });
    }

    if (hasCertifications) {
      structureScore += 20;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No Certifications heading detected.",
        affected_section: "certifications",
        triggering_pattern: "missing_certifications"
      });
      actionableFixes.push({
        issue: "Missing Certifications Section",
        reason: "Certifications validate capabilities in competitive fields and boost overall profile authority.",
        severity: "medium",
        affected_section: "certifications",
        recommended_fix: "Add relevant tech licenses or accomplishments, e.g. AWS Certified Architect.",
        expected_score_gain: { category: "structure", points: 20 }
      });
    }
  } else {
    // universal mode
    const reqSections = profile.requiredSections;
    const missingSectionPenalty = Math.round(100 / reqSections.length);
    let tempStructureScore = 100;

    if (reqSections.includes("education")) {
      if (!hasEducation) {
        verifiedWarnings.push({
          warning_type: "missing_section",
          confidence: 1.0,
          evidence: "No Education heading detected.",
          affected_section: "education",
          triggering_pattern: "missing_education"
        });
        actionableFixes.push({
          issue: "Missing Education Section",
          reason: "ATS filters and recruitment guidelines require academic credentials to be verified.",
          severity: "critical",
          affected_section: "education",
          recommended_fix: "Add institutional credentials, degree path, and graduation year.",
          expected_score_gain: { category: "structure", points: missingSectionPenalty }
        });
        tempStructureScore -= missingSectionPenalty;
      }
    }

    if (reqSections.includes("experience")) {
      if (!hasExperience) {
        verifiedWarnings.push({
          warning_type: "missing_section",
          confidence: 1.0,
          evidence: "No Experience heading detected.",
          affected_section: "experience",
          triggering_pattern: "missing_experience"
        });
        actionableFixes.push({
          issue: "Missing Experience Section",
          reason: "ATS filters heavily weight professional history and career timeline.",
          severity: "critical",
          affected_section: "experience",
          recommended_fix: "Add details of past jobs, internships, or freelance roles.",
          expected_score_gain: { category: "structure", points: missingSectionPenalty }
        });
        tempStructureScore -= missingSectionPenalty;
      }
    }

    if (reqSections.includes("projects")) {
      if (!hasProjects) {
        verifiedWarnings.push({
          warning_type: "missing_section",
          confidence: 1.0,
          evidence: "No Projects heading detected.",
          affected_section: "projects",
          triggering_pattern: "missing_projects"
        });
        actionableFixes.push({
          issue: "Missing Projects Section",
          reason: "Portfolios and projects validate technical execution capacity.",
          severity: "critical",
          affected_section: "projects",
          recommended_fix: "Add key projects showcasing execution or code work.",
          expected_score_gain: { category: "structure", points: missingSectionPenalty }
        });
        tempStructureScore -= missingSectionPenalty;
      }
    }

    if (reqSections.includes("skills")) {
      if (!hasSkills) {
        verifiedWarnings.push({
          warning_type: "missing_section",
          confidence: 1.0,
          evidence: "No Skills heading detected.",
          affected_section: "skills",
          triggering_pattern: "missing_skills"
        });
        actionableFixes.push({
          issue: "Missing Skills Section",
          reason: "ATS uses keyword screening on skills lists to rank candidate profiles.",
          severity: "critical",
          affected_section: "skills",
          recommended_fix: "Add a list of skills, methodologies, or tools.",
          expected_score_gain: { category: "structure", points: missingSectionPenalty }
        });
        tempStructureScore -= missingSectionPenalty;
      }
    }

    if (reqSections.includes("certifications")) {
      if (!hasCertifications) {
        verifiedWarnings.push({
          warning_type: "missing_section",
          confidence: 1.0,
          evidence: "No Certifications heading detected.",
          affected_section: "certifications",
          triggering_pattern: "missing_certifications"
        });
        actionableFixes.push({
          issue: "Missing Certifications Section",
          reason: "Professional certifications validate competency in key methodologies.",
          severity: "medium",
          affected_section: "certifications",
          recommended_fix: "Add relevant professional certifications or licenses.",
          expected_score_gain: { category: "structure", points: missingSectionPenalty }
        });
        tempStructureScore -= missingSectionPenalty;
      }
    }

    structureScore = Math.max(10, tempStructureScore);
  }

  // 2. Formatting Check (20% of final score)
  let formattingScore = 100;

  // Check for Canva columns and layout grids
  const lines = text.split("\n");
  let tableRowsCount = 0;
  let firstTableLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if ((line.match(/\|/g) || []).length >= 3) {
      tableRowsCount++;
      if (firstTableLine === -1) firstTableLine = i;
      continue;
    }
    const cols = line.split(/\s{4,}|\t/).filter(c => c.trim().length > 0);
    if (cols.length >= 3) {
      if (!line.includes("@") && !line.includes("linkedin") && !line.includes("github")) {
        tableRowsCount++;
        if (firstTableLine === -1) firstTableLine = i;
      }
    }
  }
  const hasActualTable = tableRowsCount >= 3;

  let colRowsCount = 0;
  let firstColLine = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes("@") || line.includes("linkedin") || line.includes("github")) {
      continue;
    }
    if (line.includes("|") && line.length > 25) {
      colRowsCount++;
      if (firstColLine === -1) firstColLine = i;
      continue;
    }
    const match = line.match(/^([^\s].{8,})\s{8,}([^\s].{8,})$/);
    if (match) {
      colRowsCount++;
      if (firstColLine === -1) firstColLine = i;
    }
  }
  const hasActualMultiColumn = colRowsCount >= 4;

  const isCanvaFile = lowerFilename.includes("canva") || lowerFilename.includes("layout");
  if (hasActualMultiColumn || (isCanvaFile && (text.includes("|") || text.split("\n").some(l => /\s{6,}/.test(l))))) {
    const colIdx = firstColLine !== -1 ? text.indexOf(lines[firstColLine]) : 0;
    const pageNum = getPageForIndex(text, colIdx !== -1 ? colIdx : 0);
    verifiedWarnings.push({
      warning_type: "grid_layout",
      confidence: 0.88,
      evidence: `Detected side-by-side columns alignment on page ${pageNum}.`,
      affected_section: "personal",
      triggering_pattern: "multi_column_parallel",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Complex Grid Layout Detected",
      reason: "Recruiter parsing systems fail to parse parallel text columns linearly, mixing experiences together.",
      severity: "high",
      affected_section: "personal",
      recommended_fix: "Use a clean, single-column standard format to guarantee linear parsing.",
      expected_score_gain: { category: "formatting", points: 20 }
    });
    formattingScore -= 20;
  }

  // Check for Hidden Tables using strict boundary
  if (hasActualTable) {
    const tableIdx = firstTableLine !== -1 ? text.indexOf(lines[firstTableLine]) : 0;
    const pageNum = getPageForIndex(text, tableIdx !== -1 ? tableIdx : 0);
    verifiedWarnings.push({
      warning_type: "hidden_table",
      confidence: 0.94,
      evidence: `Detected ${tableRowsCount} table structures on page ${pageNum}.`,
      affected_section: "experience",
      triggering_pattern: "tabular_layout",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Hidden Tables or Grid Charts",
      reason: "ATS systems skip scanning content nested in complex HTML or XML table cells.",
      severity: "high",
      affected_section: "experience",
      recommended_fix: "Present experience data using simple paragraphs and bulleted text instead of tables.",
      expected_score_gain: { category: "formatting", points: 15 }
    });
    formattingScore -= 15;
  }

  // Photo/Image check using strict boundaries
  const imageMatch = text.match(/\b(photo|picture|avatar|profile pic)\b/i);
  if (imageMatch) {
    const pageNum = getPageForIndex(text, imageMatch.index || 0);
    verifiedWarnings.push({
      warning_type: "profile_image",
      confidence: 0.85,
      evidence: `Detected keyword associated with profile image: "${imageMatch[0]}".`,
      affected_section: "personal",
      triggering_pattern: "/\\b(photo|avatar|picture|profile pic)\\b/",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Profile Image Detected",
      reason: "Visual graphics bloat file sizes and cause parser validation warnings under GDPR/bias protocols.",
      severity: "medium",
      affected_section: "personal",
      recommended_fix: "Remove any visual avatars, placeholders, or image segments from the layout.",
      expected_score_gain: { category: "formatting", points: 15 }
    });
    formattingScore -= 15;
  }

  // Graphics stars check
  const graphicsMatches = text.match(/[★●■◆]/g);
  if (graphicsMatches) {
    const charIndex = text.indexOf(graphicsMatches[0]);
    const pageNum = getPageForIndex(text, charIndex);
    verifiedWarnings.push({
      warning_type: "graphics_star",
      confidence: 0.95,
      evidence: `Detected visual rating indicators: "${graphicsMatches.slice(0, 5).join(" ")}".`,
      affected_section: "skills",
      triggering_pattern: "/[★●■◆]/",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Skill Graphic Metrics / Stars",
      reason: "Scanners fail to convert graphics (e.g. 4/5 stars) into text, classifying the skill as unverified.",
      severity: "medium",
      affected_section: "skills",
      recommended_fix: "List skills as simple text strings without graphics or rating widgets.",
      expected_score_gain: { category: "formatting", points: 15 }
    });
    formattingScore -= 15;
  }

  // Emoji check
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  const emojiMatches = text.match(emojiRegex);
  if (emojiMatches && emojiMatches.length > 0) {
    const charIndex = text.search(emojiRegex);
    const pageNum = getPageForIndex(text, charIndex !== -1 ? charIndex : 0);
    verifiedWarnings.push({
      warning_type: "graphics_star",
      confidence: 0.95,
      evidence: `Detected emojis: "${emojiMatches.slice(0, 5).join(" ")}".`,
      affected_section: "personal",
      triggering_pattern: "emoji_regex",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Emojis inside content fields",
      reason: "Visual graphics like emojis are processed as corrupted tokens by standard enterprise scanners.",
      severity: "medium",
      affected_section: "personal",
      recommended_fix: "Remove emojis (🚀, 💻, ⚙️) from your text and use professional vocabulary.",
      expected_score_gain: { category: "formatting", points: 15 }
    });
    formattingScore -= 15;
  }

  formattingScore = Math.max(10, formattingScore);

  // 3. Readability Check (15% of final score)
  let readabilityScore = 20; // baseline
  const summaryKeywords = [
    "summary",
    "professional summary",
    "profile",
    "career profile",
    "objective",
    "about me",
    "professional profile",
    "career summary",
    "executive summary"
  ];
  
  let hasSummary = false;
  let summaryEvidence = "";
  
  for (const heading of summaryKeywords) {
    const regex = new RegExp(`\\b${heading}\\b`, 'i');
    if (regex.test(text)) {
      hasSummary = true;
      summaryEvidence = `Detected explicit summary heading: "${heading}"`;
      break;
    }
  }

  if (!hasSummary) {
    const linesList = text.split("\n").map(l => l.trim());
    let earliestSectionLine = -1;
    const sectionsReg = /\b(education|experience|work|employment|projects?|skills|technical skills|technologies|certifications?|credentials)\b/i;
    
    for (let i = 0; i < linesList.length; i++) {
      if (sectionsReg.test(linesList[i])) {
        earliestSectionLine = i;
        break;
      }
    }
    
    const limit = earliestSectionLine !== -1 ? earliestSectionLine : Math.min(25, linesList.length);
    for (let i = 0; i < limit; i++) {
      const line = linesList[i];
      if (line.length > 150 && /[a-zA-Z]/.test(line)) {
        if (!line.includes("@") && !line.includes("linkedin") && !line.includes("github")) {
          hasSummary = true;
          summaryEvidence = `Detected implicit summary paragraph on line ${i + 1} with ${line.length} characters.`;
          break;
        }
      }
    }
  }

  if (hasSummary) {
    readabilityScore += 20;
  } else {
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 0.98,
      evidence: "No summary heading or summary content found.",
      affected_section: "summary",
      triggering_pattern: "missing_summary"
    });
    actionableFixes.push({
      issue: "Missing Professional Summary",
      reason: "Recruiters scan target profiles at the top to establish core focus within 6 seconds.",
      severity: "high",
      affected_section: "summary",
      recommended_fix: "Write a brief 2-3 line summary highlighting your stack and major engineering strengths.",
      expected_score_gain: { category: "readability", points: 20 }
    });
  }

  let maxContactPoints = 60;
  let contactPoints = 0;
  if (lowerText.includes("@")) {
    contactPoints += 15;
  } else {
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      evidence: "No email address format detected.",
      affected_section: "personal",
      triggering_pattern: "missing_email"
    });
  }

  if (hasPhoneNumber(text)) {
    contactPoints += 15;
  } else {
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 0.9,
      evidence: "No telephone number pattern detected.",
      affected_section: "personal",
      triggering_pattern: "missing_phone"
    });
  }

  if (lowerText.includes("linkedin")) {
    contactPoints += 15;
  } else {
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      evidence: "No LinkedIn profile link detected.",
      affected_section: "personal",
      triggering_pattern: "missing_linkedin"
    });
  }

  const reqGithub = (mode === "student") || profile.requiresGithub;
  if (reqGithub) {
    if (lowerText.includes("github") || lowerText.includes("git")) {
      contactPoints += 15;
    } else {
      verifiedWarnings.push({
        warning_type: "missing_section",
        confidence: 1.0,
        evidence: "No GitHub repository link detected.",
        affected_section: "personal",
        triggering_pattern: "missing_github"
      });
    }
  } else {
    maxContactPoints = 45;
  }

  const normalizedContactPoints = Math.round((contactPoints / maxContactPoints) * 60);
  readabilityScore += normalizedContactPoints;

  // Flow order check using strict word boundaries
  const sectionMatchers = [
    { id: "education", regex: /\b(education|academic)\b/i },
    { id: "experience", regex: /\b(experience|work|employment)\b/i },
    { id: "projects", regex: /\b(projects|project)\b/i },
    { id: "skills", regex: /\b(skills|technical skills|technologies)\b/i }
  ];
  const sectionIndex = sectionMatchers.map(sec => {
    const match = text.match(sec.regex);
    return match && match.index !== undefined ? match.index : -1;
  });
  const isSorted = sectionIndex.every((val, i, arr) => !i || arr[i - 1] === -1 || val === -1 || val >= arr[i - 1]);
  if (isSorted) {
    readabilityScore += 20;
  } else {
    const flowTriggerIndex = sectionIndex.findIndex((val, i, arr) => i > 0 && arr[i - 1] !== -1 && val !== -1 && val < arr[i - 1]);
    const flowIndex = flowTriggerIndex !== -1 ? sectionIndex[flowTriggerIndex] : 0;
    const pageNum = getPageForIndex(text, flowIndex);
    verifiedWarnings.push({
      warning_type: "chronological_flow",
      confidence: 1.0,
      evidence: `Chronological flow index mismatch: [${sectionIndex.join(", ")}].`,
      affected_section: "experience",
      triggering_pattern: "section_chronology",
      source_page: pageNum
    });
    readabilityScore = Math.max(10, readabilityScore - 10);
  }

  readabilityScore = Math.min(100, Math.max(10, readabilityScore));

  // 4. Keywords Check (15% of final score)
  const defaultKeywords = PROFILE_KEYWORDS[currentType] || PROFILE_KEYWORDS["General Corporate"];
  const targetKeywords = jobDescription
    ? jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    : defaultKeywords;

  const uniqueTargets = Array.from(new Set(targetKeywords)).slice(0, 15);
  let matchedCount = 0;

  uniqueTargets.forEach(word => {
    let found = false;
    const synonyms = SYNONYM_MAP[word] || [word];
    for (const syn of synonyms) {
      if (lowerText.includes(syn)) {
        found = true;
        break;
      }
    }
    if (found) {
      matchedCount++;
    } else {
      keywordGaps.push(word.charAt(0).toUpperCase() + word.slice(1));
    }
  });

  const keywordMatchRatio = uniqueTargets.length > 0 ? matchedCount / uniqueTargets.length : 1;
  let baseKeywordsScore = Math.round(keywordMatchRatio * 100);

  // Overused Buzzword Penalty
  let buzzwordPenalties = 0;
  BUZZWORDS.forEach(word => {
    const occurrences = (lowerText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
    if (occurrences > 2) {
      buzzwordPenalties += 5;
      const bIndex = lowerText.indexOf(word);
      const pageNum = getPageForIndex(text, bIndex !== -1 ? bIndex : 0);
      verifiedWarnings.push({
        warning_type: "excessive_buzzwords",
        confidence: 1.0,
        evidence: `Buzzword "${word}" repeated ${occurrences} times.`,
        affected_section: "experience",
        triggering_pattern: `buzzword_${word}`,
        source_page: pageNum
      });
    }
  });

  const keywordsScore = Math.max(10, baseKeywordsScore - buzzwordPenalties);

  if (keywordGaps.length > 0) {
    actionableFixes.push({
      issue: "Missing Keywords Target Stack",
      reason: "Applicant keyword checks drop candidate rankings if core role tools are omitted.",
      severity: "high",
      affected_section: "skills",
      recommended_fix: `Incorporate missing keywords: ${keywordGaps.slice(0, 4).join(", ")} inside your skills lists.`,
      expected_score_gain: { category: "keywords", points: 15 }
    });
  }

  // 5. Projects Depth Check (15% of final score)
  let projectsScore = 10;
  const projectMentions = (lowerText.match(/project \d+|technical project|personal project|deployed|github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g) || []).length;
  let projectCountScore = 50;
  if (projectMentions >= 3) projectCountScore = 100;
  else if (projectMentions === 2) projectCountScore = 85;
  else if (projectMentions === 1) projectCountScore = 65;
  else if (!hasProjects) projectCountScore = 10;

  const hasProjectLinks = lowerText.includes("github.com") || lowerText.includes("http://") || lowerText.includes("https://");
  const linkBonus = hasProjectLinks ? 10 : 0;
  if (!hasProjectLinks && hasProjects) {
    const projIdx = text.toLowerCase().indexOf("project");
    const pageNum = getPageForIndex(text, projIdx !== -1 ? projIdx : 0);
    verifiedWarnings.push({
      warning_type: "missing_links",
      confidence: 0.90,
      evidence: "Projects lack repository or deployment links.",
      affected_section: "projects",
      triggering_pattern: "project_links_check",
      source_page: pageNum
    });
    actionableFixes.push({
      issue: "Missing Project Links",
      reason: "Recruiters double project validity assessments when clickable code source repositories are provided.",
      severity: "high",
      affected_section: "projects",
      recommended_fix: "Include active GitHub URL or deployment link for each listed project.",
      expected_score_gain: { category: "projects", points: 10 }
    });
  }

  const sentences = text.split(/[.\n]/).map(s => s.trim()).filter(s => s.length > 20);
  const descriptionBonus = sentences.length > 5 ? 10 : 0;
  projectsScore = Math.min(100, projectCountScore + linkBonus + descriptionBonus);

  // 6. Achievements Check (15% of final score)
  let actionVerbScore = 5;
  let foundVerbsCount = 0;
  ACTION_VERBS.forEach(verb => {
    if (lowerText.includes(verb)) {
      foundVerbsCount++;
    }
  });
  if (foundVerbsCount >= 4) actionVerbScore = 30;
  else if (foundVerbsCount >= 2) actionVerbScore = 15;
  else {
    const pageNum = getPageForIndex(text, text.toLowerCase().indexOf("experience") !== -1 ? text.toLowerCase().indexOf("experience") : 0);
    verifiedWarnings.push({
      warning_type: "weak_verbs",
      confidence: 0.90,
      evidence: "Lacks strong action verbs in experience description.",
      affected_section: "experience",
      triggering_pattern: "action_verbs_check",
      source_page: pageNum
    });
  }

  // Quantification Check
  let quantificationScore = 5;

  // Extract Experience section for bullet analysis
  let experienceText = text;
  const expMatch = text.match(/\b(experience|work|employment)\b/i);
  if (expMatch && expMatch.index !== undefined) {
    const startIdx = expMatch.index;
    const remainingText = text.slice(startIdx);
    const nextSecMatch = remainingText.slice(20).match(/\b(projects?|skills|technical|certifications?|awards?|education)\b/i);
    if (nextSecMatch && nextSecMatch.index !== undefined) {
      experienceText = remainingText.slice(0, nextSecMatch.index + 20);
    } else {
      experienceText = remainingText;
    }
  }

  const bullets = experienceText.split(/[•\n\-\*]/).map(b => b.trim()).filter(b => b.length > 15);
  let quantifiedBullets = 0;
  let unquantifiedBulletExamples: string[] = [];

  bullets.forEach(bullet => {
    if (/\d+%?|\b(percent|CGPA|CGPA\b|INR|USD|GB|MB|ms)\b/.test(bullet)) {
      quantifiedBullets++;
    } else {
      unquantifiedBulletExamples.push(bullet);
      if (metricEnhancements.length < 3 && bullet.length > 30) {
        metricEnhancements.push(`In bullet: "${bullet.slice(0, 45)}..." -> Add exact placement statistics, speed increases, or percentages.`);
      }
    }
  });

  const bulletMetricsRatio = bullets.length > 0 ? quantifiedBullets / bullets.length : 0;
  if (bulletMetricsRatio >= 0.35) {
    quantificationScore = 40;
  } else if (bulletMetricsRatio >= 0.15) {
    quantificationScore = 20;
    const bulletText = unquantifiedBulletExamples[0] || "";
    const bulletIndex = bulletText ? text.indexOf(bulletText) : 0;
    const pageNum = getPageForIndex(text, bulletIndex !== -1 ? bulletIndex : 0);
    verifiedWarnings.push({
      warning_type: "unquantified_bullet",
      confidence: 0.90,
      evidence: `Few quantified accomplishments found. Snippet: "${bulletText.slice(0, 40)}..."`,
      affected_section: "experience",
      triggering_pattern: "lack_of_numbers",
      source_page: pageNum
    });
  } else {
    if (bullets.length > 0) {
      const bulletText = unquantifiedBulletExamples[0] || "";
      const bulletIndex = bulletText ? text.indexOf(bulletText) : 0;
      const pageNum = getPageForIndex(text, bulletIndex !== -1 ? bulletIndex : 0);
      verifiedWarnings.push({
        warning_type: "unquantified_bullet",
        confidence: 0.90,
        evidence: `Bullet lacks numeric metrics: "${bulletText.slice(0, 40)}..."`,
        affected_section: "experience",
        triggering_pattern: "lack_of_numbers",
        source_page: pageNum
      });
      actionableFixes.push({
        issue: "Unquantified Achievement Bullets",
        reason: "Recruiters and systems prioritize resumes using the Google XYZ structure: Accomplished X, as measured by Y, by doing Z.",
        severity: "high",
        affected_section: "experience",
        recommended_fix: "Rewrite accomplishments in professional roles to include specific percentages, volumes, or time metrics.",
        expected_score_gain: { category: "achievements", points: 20 }
      });
    }
  }

  let bulletQualityScore = 15;
  if (bullets.length > 0) {
    let sweetSpotCount = 0;
    bullets.forEach(b => {
      if (b.length >= 40 && b.length <= 150) sweetSpotCount++;
    });
    if (sweetSpotCount / bullets.length >= 0.5) {
      bulletQualityScore = 30;
    }
  }
  const achievementsScore = Math.min(100, actionVerbScore + quantificationScore + bulletQualityScore);

  // Derive final score
  const activeWeights = (mode === "universal") ? profile.weights : {
    structure: 0.20,
    formatting: 0.20,
    readability: 0.15,
    keywords: 0.15,
    projects: 0.15,
    achievements: 0.15
  };

  const derivedScore = Math.round(
    structureScore * activeWeights.structure +
    formattingScore * activeWeights.formatting +
    readabilityScore * activeWeights.readability +
    keywordsScore * activeWeights.keywords +
    projectsScore * activeWeights.projects +
    achievementsScore * activeWeights.achievements
  );

  const finalAtsScore = Math.min(99, Math.max(35, derivedScore));

  const breakdown = {
    structure: Math.max(10, structureScore),
    formatting: Math.max(10, formattingScore),
    readability: Math.max(10, readabilityScore),
    keywords: Math.max(10, keywordsScore),
    projects: Math.max(10, projectsScore),
    achievements: Math.max(10, achievementsScore)
  };

  const warningsList: string[] = [];
  verifiedWarnings.forEach(w => {
    if (!w.evidence || w.evidence.trim() === "") return;
    let desc = "";
    if (w.warning_type === "missing_section") {
      if (w.triggering_pattern === "missing_education") desc = "Missing Education Section. Critical for recruiter academic qualification checks.";
      else if (w.triggering_pattern === "missing_experience") desc = "Missing Professional Experience Section. Placements boards require tech intern listings.";
      else if (w.triggering_pattern === "missing_projects") desc = "Missing Technical Projects Section. Critical for engineering resumes.";
      else if (w.triggering_pattern === "missing_skills") desc = "Missing Technical Skills Section. Search filters fail without specific tools.";
      else if (w.triggering_pattern === "missing_certifications") desc = "Missing Certifications & Awards Section. Adding professional credentials builds validation.";
      else if (w.triggering_pattern === "missing_summary") desc = "Missing professional summary section. HR recruiters expect a 2-3 line target profile at the very top.";
      else if (w.triggering_pattern === "missing_email") desc = "Missing Email Address. Critical for recruiter follow-up.";
      else if (w.triggering_pattern === "missing_phone") desc = "Missing Phone Number. Critical for screening calls.";
      else if (w.triggering_pattern === "missing_linkedin") desc = "Missing LinkedIn profile URL. 92% of recruiters verify candidates on LinkedIn before booking calls.";
      else if (w.triggering_pattern === "missing_github") desc = "Missing GitHub / portfolio URL. Engineering callbacks double when projects are verified via active code repositories.";
    } else if (w.warning_type === "grid_layout") {
      desc = "Complex multi-column grids or visual separators detected. Clean single-column layout recommended.";
    } else if (w.warning_type === "hidden_table") {
      desc = "Potential hidden tables or grid charts detected. ATS scanners ignore table cell data or read it in garbled order.";
    } else if (w.warning_type === "profile_image") {
      desc = "Embedded profile picture or avatar icon detected. Recruiter guidelines recommend removing visual images to avoid parsing errors.";
    } else if (w.warning_type === "graphics_star") {
      desc = "Excessive graphics, ratings, or emojis detected. Standard text is preferred for linear scanning.";
    } else if (w.warning_type === "unquantified_bullet") {
      desc = "Lacks quantified achievements. Recruiters require metrics, scale increases, and measurable outputs.";
    } else if (w.warning_type === "excessive_buzzwords") {
      desc = "Overused generic buzzwords detected. Replace with strong action-oriented accomplishments.";
    } else if (w.warning_type === "chronological_flow") {
      desc = "Chronological section flow issue: Recommended order is Header -> Summary -> Education -> Experience -> Projects -> Skills.";
    } else if (w.warning_type === "missing_links") {
      desc = "Projects lack repository or deployment links. Recruiters trust projects with clickable proof-of-work URLs.";
    } else if (w.warning_type === "weak_verbs") {
      desc = "Lacks strong action verbs. Start experience bullet points with words like 'Spearheaded', 'Optimized', or 'Engineered'.";
    }

    if (!desc) desc = `${w.warning_type.replace(/_/g, " ")} issue.`;

    warningsList.push(`${desc} Evidence: ${w.evidence} (Page: ${w.source_page || 1})`);
  });

  const finalWarnings = warningsList.length > 0 ? warningsList : ["Your resume matches standard recruiter formatting guidelines beautifully. Good structure."];

  const parserConfidence = calculateParserConfidence(text, filename);

  const scoringResult: ScoringResult = {
    atsScore: finalAtsScore,
    warnings: finalWarnings,
    verifiedWarnings,
    actionableFixes,
    keywordGaps: keywordGaps.length > 0 ? keywordGaps.slice(0, 6) : ["No severe keyword gaps detected."],
    metricEnhancements: metricEnhancements.length > 0 ? metricEnhancements.slice(0, 3) : ["Incorporate Google XYZ metrics: 'Accomplished X, as measured by Y, by doing Z'."],
    breakdown,
    resumeType: currentType,
    classificationConfidence: currentConf,
    parserConfidence
  };

  scoringResult.scoreExplanation = explainScore(scoringResult, text);
  return scoringResult;
}

export function calculateLiveGaps(data: ResumeData, initialFixState: any) {
  if (!initialFixState || !initialFixState.gaps) return null;
  const initialGaps = initialFixState.gaps;

  const missingSections = (initialGaps.missingSections || []).filter((sec: string) => {
    if (sec === "summary") return !data.personal.summary;
    if (sec === "education") return !data.education || data.education.length === 0;
    if (sec === "experience") return !data.experience || data.experience.length === 0;
    if (sec === "projects") return !data.projects || data.projects.length === 0;
    if (sec === "skills") return !data.skills || ((data.skills.languages || []).length === 0 && (data.skills.frameworks || []).length === 0 && (data.skills.tools || []).length === 0);
    if (sec === "certifications") return !data.certifications || data.certifications.length === 0;
    return true;
  });

  const missingKeywords = (initialGaps.missingKeywords || []).filter((kw: string) => {
    const text = serializeResumeDataToText(data).toLowerCase();
    return !text.includes(kw.toLowerCase());
  });

  const unquantifiedBullets: Array<{ expIdx: number; bulletIdx: number; text: string }> = [];
  if (data.experience) {
    data.experience.forEach((exp, expIdx) => {
      if (exp.bullets) {
        exp.bullets.forEach((bullet, bulletIdx) => {
          const isInitiallyUnquantified = (initialGaps.unquantifiedBullets || []).some((b: any) => b.expIdx === expIdx && b.bulletIdx === bulletIdx);
          if (isInitiallyUnquantified) {
            const isQuantifiedNow = /\d+%?|\b(percent|CGPA|CGPA\b|INR|USD|GB|MB|ms)\b/.test(bullet);
            if (!isQuantifiedNow) {
              unquantifiedBullets.push({ expIdx, bulletIdx, text: bullet });
            }
          }
        });
      }
    });
  }

  const formattingErrors = (initialGaps.formattingErrors || []).filter((err: string) => {
    const text = serializeResumeDataToText(data);
    if (err === "emoji_usage") {
      const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
      return emojiRegex.test(text);
    }
    if (err === "graphics_stars") {
      return text.includes("★") || text.includes("●") || text.includes("■") || text.includes("◆");
    }
    return true;
  });

  // Calculate completed list
  const completedFixes: string[] = [];
  if ((initialGaps.missingSections || []).includes("summary") && !missingSections.includes("summary")) completedFixes.push("Summary Section Added");
  if ((initialGaps.missingSections || []).includes("education") && !missingSections.includes("education")) completedFixes.push("Education Section Added");
  if ((initialGaps.missingSections || []).includes("experience") && !missingSections.includes("experience")) completedFixes.push("Experience Section Added");
  if ((initialGaps.missingSections || []).includes("projects") && !missingSections.includes("projects")) completedFixes.push("Projects Section Added");
  if ((initialGaps.missingSections || []).includes("skills") && !missingSections.includes("skills")) completedFixes.push("Skills Section Added");
  if ((initialGaps.missingSections || []).includes("certifications") && !missingSections.includes("certifications")) completedFixes.push("Certifications Section Added");

  (initialGaps.missingKeywords || []).forEach((kw: string) => {
    if (!missingKeywords.includes(kw)) {
      completedFixes.push(`Keyword: ${kw}`);
    }
  });

  (initialGaps.unquantifiedBullets || []).forEach((b: any) => {
    const isStillUnquantified = unquantifiedBullets.some((ub: any) => ub.expIdx === b.expIdx && ub.bulletIdx === b.bulletIdx);
    if (!isStillUnquantified) {
      completedFixes.push(`Quantified bullet under experience #${b.expIdx + 1}`);
    }
  });

  (initialGaps.formattingErrors || []).forEach((err: string) => {
    if (!formattingErrors.includes(err)) {
      completedFixes.push(`Formatting fixed: ${err === "emoji_usage" ? "Removed Emojis" : "Removed Graphics Stars"}`);
    }
  });

  return {
    missingSections,
    missingKeywords,
    unquantifiedBullets,
    formattingErrors,
    completedFixes
  };
}
