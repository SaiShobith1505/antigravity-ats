import { ResumeData } from "./db";

export interface VerifiedWarning {
  warning_type: "grid_layout" | "hidden_table" | "graphics_star" | "profile_image" | "unquantified_bullet" | "missing_section" | "excessive_buzzwords";
  confidence: number;
  triggering_text: string;
  triggering_pattern: string;
  affected_section: "personal" | "education" | "experience" | "projects" | "skills" | "certifications" | "summary";
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

  // To help parser identify BoostCV template base
  lines.push("ATS SAAS Compiler BoostCV");

  return lines.join("\n");
}

export function calculateAtsScore(
  text: string,
  filename: string,
  jobDescription?: string
): ScoringResult {
  const warnings: string[] = [];
  const verifiedWarnings: VerifiedWarning[] = [];
  const actionableFixes: ActionableFix[] = [];
  const keywordGaps: string[] = [];
  const metricEnhancements: string[] = [];
  
  const lowerText = text.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  // 1. Structure Check (20% of final score)
  let structureScore = 0;
  const hasEducation = lowerText.includes("education") || lowerText.includes("college") || lowerText.includes("university") || lowerText.includes("academic");
  const hasExperience = lowerText.includes("experience") || lowerText.includes("work") || lowerText.includes("employment") || lowerText.includes("history");
  const hasProjects = lowerText.includes("projects") || lowerText.includes("project");
  const hasSkills = lowerText.includes("skills") || lowerText.includes("technologies") || lowerText.includes("tools");
  const hasCertifications = lowerText.includes("certifications") || lowerText.includes("certification") || lowerText.includes("awards") || lowerText.includes("accomplishments");

  if (hasEducation) {
    structureScore += 20;
  } else {
    warnings.push("Missing Education Section. Critical for recruiter academic qualification checks.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_education",
      affected_section: "education"
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
    warnings.push("Missing Professional Experience Section. Placements boards require tech intern listings.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_experience",
      affected_section: "experience"
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
    warnings.push("Missing Technical Projects Section. Critical for engineering resumes.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_projects",
      affected_section: "projects"
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
    warnings.push("Missing Technical Skills Section. Search filters fail without specific tools.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_skills",
      affected_section: "skills"
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
    warnings.push("Missing Certifications & Awards Section. Adding professional credentials builds validation.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_certifications",
      affected_section: "certifications"
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

  structureScore = Math.max(10, structureScore);

  // 2. Formatting Check (20% of final score)
  const isBoostCV = lowerText.includes("boostcv") || lowerText.includes("ats saas compiler");
  let formattingScore = 100;

  if (!isBoostCV) {
    // Check for Canva columns and layout grids
    if (lowerText.includes("|") || lowerText.includes("  \t") || (lowerText.includes(" • ") && lowerFilename.includes("canva"))) {
      let trigText = "";
      if (lowerText.includes("|")) trigText = "|";
      else if (lowerText.includes("  \t")) trigText = "tab spacer";
      else trigText = "• spacer";

      warnings.push("Detected complex multi-column grids or visual separators (Canva indicators). Clean single-column layout recommended.");
      verifiedWarnings.push({
        warning_type: "grid_layout",
        confidence: 0.9,
        triggering_text: trigText,
        triggering_pattern: "canva_or_column_spacers",
        affected_section: "personal"
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

    // Check for Hidden Tables
    if (lowerText.includes("table") || (lowerText.includes("cell") && text.match(/\n.*\t.*\t/))) {
      warnings.push("Potential hidden tables or grid charts detected. ATS scanners ignore table cell data or read it in garbled order.");
      verifiedWarnings.push({
        warning_type: "hidden_table",
        confidence: 0.85,
        triggering_text: "cell sequence or raw tables",
        triggering_pattern: "/table|cell/",
        affected_section: "experience"
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

    // Multi-column layouts check
    if (text.split("\n").some((line: string) => /\s{4,}/.test(line) && line.length > 30)) {
      warnings.push("Multi-column layout structure detected. Standard applicant systems fail to read parallel columns linearly.");
      verifiedWarnings.push({
        warning_type: "grid_layout",
        confidence: 0.9,
        triggering_text: "large spacer gaps",
        triggering_pattern: "/\\s{4,}/",
        affected_section: "personal"
      });
      formattingScore -= 15;
    }

    // Photo/Image check
    if (lowerText.includes("photo") || lowerText.includes("picture") || lowerText.includes("avatar") || lowerText.includes("profile pic") || lowerText.includes("image")) {
      warnings.push("Embedded profile picture or avatar icon detected. Recruiter guidelines recommend removing visual images to avoid parsing errors.");
      verifiedWarnings.push({
        warning_type: "profile_image",
        confidence: 0.8,
        triggering_text: "photo keyword",
        triggering_pattern: "/photo|avatar|picture/",
        affected_section: "personal"
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
    if (graphicsMatches || lowerText.includes("proficiency:") || lowerText.includes("level:")) {
      warnings.push("Excessive graphics or proficiency star-ratings detected in skills. ATS filters cannot parse ratings and standard text is preferred.");
      verifiedWarnings.push({
        warning_type: "graphics_star",
        confidence: 0.95,
        triggering_text: graphicsMatches ? graphicsMatches.join(" ") : "proficiency/level tag",
        triggering_pattern: "/[★●■◆]|proficiency|level/",
        affected_section: "skills"
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
  } else {
    // BOOSTCV clean document check
    const graphicsMatches = text.match(/[★●■◆]/g);
    if (graphicsMatches) {
      warnings.push("Manual graphics or star-ratings manually introduced in input fields. Emojis and visual graphics are invisible to ATS parsers.");
      verifiedWarnings.push({
        warning_type: "graphics_star",
        confidence: 0.95,
        triggering_text: graphicsMatches.join(" "),
        triggering_pattern: "/[★●■◆]/",
        affected_section: "skills"
      });
      actionableFixes.push({
        issue: "Visual Graphics in Fields",
        reason: "Star indicators confuse resume parsers and lower content scan reliability.",
        severity: "medium",
        affected_section: "skills",
        recommended_fix: "Remove special shapes or star indicators from text inputs.",
        expected_score_gain: { category: "formatting", points: 15 }
      });
      formattingScore -= 15;
    }
    if (lowerText.includes("photo") || lowerText.includes("picture") || lowerText.includes("avatar") || lowerText.includes("profile pic")) {
      warnings.push("Mention of profile images manually introduced in fields. Recruiter guidelines recommend keeping text clear of visual placeholders.");
      verifiedWarnings.push({
        warning_type: "profile_image",
        confidence: 0.85,
        triggering_text: "photo placeholder keyword",
        triggering_pattern: "/photo|avatar/",
        affected_section: "personal"
      });
      formattingScore -= 10;
    }
  }

  // Emoji check
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  const emojiMatches = text.match(emojiRegex);
  if (emojiMatches && emojiMatches.length > 0) {
    warnings.push("Emojis (🚀, 💻, etc.) manually introduced in text. Professional recruiters recommend removing all emojis for clean ATS linear scanning.");
    verifiedWarnings.push({
      warning_type: "graphics_star",
      confidence: 1.0,
      triggering_text: emojiMatches.slice(0, 5).join(" "),
      triggering_pattern: "emoji_regex",
      affected_section: "personal"
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
  const hasSummary = lowerText.includes("summary") || lowerText.includes("profile") || lowerText.includes("about me") || lowerText.includes("objective");
  if (hasSummary) {
    readabilityScore += 20;
  } else {
    warnings.push("Missing professional summary section. HR recruiters expect a 2-3 line target profile at the very top.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_summary",
      affected_section: "summary"
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

  let contactPoints = 0;
  if (lowerText.includes("@")) {
    contactPoints += 15;
  } else {
    warnings.push("Missing Email Address. Critical for recruiter follow-up.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_email",
      affected_section: "personal"
    });
  }

  if (/\+?\d{2,4}[-.\s]?\d{3,5}[-.\s]?\d{4,6}/.test(text)) {
    contactPoints += 15;
  } else {
    warnings.push("Missing Phone Number. Critical for screening calls.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 0.9,
      triggering_text: "",
      triggering_pattern: "missing_phone",
      affected_section: "personal"
    });
  }

  if (lowerText.includes("linkedin")) {
    contactPoints += 15;
  } else {
    warnings.push("Missing LinkedIn profile URL. 92% of recruiters verify candidates on LinkedIn before booking calls.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_linkedin",
      affected_section: "personal"
    });
  }

  if (lowerText.includes("github") || lowerText.includes("git")) {
    contactPoints += 15;
  } else {
    warnings.push("Missing GitHub / portfolio URL. Engineering callbacks double when projects are verified via active code repositories.");
    verifiedWarnings.push({
      warning_type: "missing_section",
      confidence: 1.0,
      triggering_text: "",
      triggering_pattern: "missing_github",
      affected_section: "personal"
    });
  }

  readabilityScore += contactPoints;

  // Flow order check
  const sections = ["education", "experience", "projects", "skills"];
  const sectionIndex = sections.map(sec => lowerText.indexOf(sec));
  const isSorted = sectionIndex.every((val, i, arr) => !i || arr[i - 1] === -1 || val === -1 || val >= arr[i - 1]);
  if (isSorted) {
    readabilityScore += 20;
  } else {
    warnings.push("Chronological section flow issue: Recommended order is Header -> Summary -> Education -> Experience -> Projects -> Skills.");
    readabilityScore = Math.max(10, readabilityScore - 10);
  }

  readabilityScore = Math.min(100, Math.max(10, readabilityScore));

  // 4. Keywords Check (15% of final score)
  const targetKeywords = jobDescription
    ? jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
    : ["react", "next.js", "nodejs", "typescript", "docker", "git", "sql", "nosql", "aws", "gcp"];

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
      warnings.push(`Overused generic buzzword: "${word}" (${occurrences} times). Replace with strong action-oriented accomplishments.`);
      verifiedWarnings.push({
        warning_type: "excessive_buzzwords",
        confidence: 1.0,
        triggering_text: word,
        triggering_pattern: `buzzword_${word}`,
        affected_section: "experience"
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
    warnings.push("Projects lack repository or deployment links. Recruiters trust projects with clickable proof-of-work URLs.");
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
    warnings.push("Lacks strong action verbs. Start experience bullet points with words like 'Spearheaded', 'Optimized', or 'Engineered'.");
  }

  // Quantification Check
  let quantificationScore = 5;
  const bullets = text.split(/[•\n\-\*]/).map(b => b.trim()).filter(b => b.length > 15);
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
    warnings.push("Few quantified accomplishments found. Increase numbers, percentages, or placements metrics inside achievements.");
  } else {
    warnings.push("Lacks quantified achievements. Recruiters require metrics, scale increases, and measurable outputs (XYZ structure).");
    if (bullets.length > 0) {
      verifiedWarnings.push({
        warning_type: "unquantified_bullet",
        confidence: 0.9,
        triggering_text: unquantifiedBulletExamples[0]?.slice(0, 50) || "",
        triggering_pattern: "lack_of_numbers",
        affected_section: "experience"
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
  const derivedScore = Math.round(
    structureScore * 0.20 +
    formattingScore * 0.20 +
    readabilityScore * 0.15 +
    keywordsScore * 0.15 +
    projectsScore * 0.15 +
    achievementsScore * 0.15
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

  return {
    atsScore: finalAtsScore,
    warnings: warnings.length > 0 ? warnings : ["Your resume matches standard recruiter formatting guidelines beautifully. Good structure."],
    verifiedWarnings,
    actionableFixes,
    keywordGaps: keywordGaps.length > 0 ? keywordGaps.slice(0, 6) : ["No severe keyword gaps detected."],
    metricEnhancements: metricEnhancements.length > 0 ? metricEnhancements.slice(0, 3) : ["Incorporate Google XYZ metrics: 'Accomplished X, as measured by Y, by doing Z'."],
    breakdown
  };
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
