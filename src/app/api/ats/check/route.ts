import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import mammoth from "mammoth";

export const dynamic = "force-dynamic";


const aiApiKey = process.env.GEMINI_API_KEY;
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

// Heuristic synonyms list for matching normalization
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

// Buzzwords to penalize if overused
const BUZZWORDS = ["synergy", "dynamic", "motivated", "detail-oriented", "results-driven", "innovative", "passionate", "detail-oriented", "team-player"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const jobDescription = (formData.get("jobDescription") as string) || "";

    if (!file) {
      return NextResponse.json(
        { error: "No file was uploaded." },
        { status: 400 }
      );
    }

    const filename = file.name.toLowerCase();
    let text = "";

    // Server-side text extraction based on file type
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (filename.endsWith(".pdf")) {
      try {
        // @ts-ignore
        const { PdfReader } = require("pdfreader");
        const pdfText = await new Promise<string>((resolve, reject) => {
          let extracted = "";
          new PdfReader().parseBuffer(buffer, (err: any, item: any) => {
            if (err) {
              reject(err);
            } else if (!item) {
              resolve(extracted);
            } else if (item.text) {
              extracted += item.text + " ";
            }
          });
        });
        text = pdfText || "";
      } catch (pdfErr) {
        console.error("[PARSER] Server-side PDF extraction failed:", pdfErr);
        return NextResponse.json(
          { error: "Failed to parse PDF document. Ensure the file is not corrupted." },
          { status: 500 }
        );
      }
    } else if (filename.endsWith(".docx")) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } catch (docxErr) {
        console.error("[PARSER] Server-side DOCX extraction failed:", docxErr);
        return NextResponse.json(
          { error: "Failed to parse Word document. Ensure the file is not corrupted." },
          { status: 500 }
        );
      }
    } else {
      // Treat as plain text or .txt file
      text = buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "Extracted resume content is empty. Ensure the file contains readable text (not scanned images)." },
        { status: 400 }
      );
    }

    // Initialize Content-Quality & Heuristic Scorer Parameters
    const ACTION_VERBS = [
      "spearheaded", "led", "developed", "optimized", "designed", "built", "implemented",
      "increased", "reduced", "managed", "created", "executed", "formulated", "engineered",
      "boosted", "drove", "improved", "scaled", "automated", "streamlined", "accelerated",
      "pioneered", "coordinated", "launched", "established", "architected", "analyzed"
    ];

    const warnings: string[] = [];
    const keywordGaps: string[] = [];
    const metricEnhancements: string[] = [];
    const lowerText = text.toLowerCase();

    // 1. Structure Check (20% of final score)
    let structureScore = 0;
    const hasEducation = lowerText.includes("education") || lowerText.includes("college") || lowerText.includes("university") || lowerText.includes("academic");
    const hasExperience = lowerText.includes("experience") || lowerText.includes("work") || lowerText.includes("employment") || lowerText.includes("history");
    const hasProjects = lowerText.includes("projects") || lowerText.includes("project");
    const hasSkills = lowerText.includes("skills") || lowerText.includes("technologies") || lowerText.includes("tools");
    const hasCertifications = lowerText.includes("certifications") || lowerText.includes("certification") || lowerText.includes("awards") || lowerText.includes("accomplishments");

    if (hasEducation) structureScore += 20;
    else warnings.push("Missing Education Section. Critical for recruiter academic qualification checks.");

    if (hasExperience) structureScore += 20;
    else warnings.push("Missing Professional Experience Section. Placements boards require tech intern listings.");

    if (hasProjects) structureScore += 20;
    else warnings.push("Missing Technical Projects Section. Critical for engineering resumes.");

    if (hasSkills) structureScore += 20;
    else warnings.push("Missing Technical Skills Section. Search filters fail without specific tools.");

    if (hasCertifications) structureScore += 20;
    else warnings.push("Missing Certifications & Awards Section. Adding professional credentials builds validation.");

    structureScore = Math.max(10, structureScore);

    // 2. Formatting Check (20% of final score)
    // Any resume generated by BOOSTCV should automatically achieve a high formatting score unless manually altered.
    const isBoostCV = lowerText.includes("boostcv") || lowerText.includes("ats saas compiler");
    let formattingScore = 100;

    if (!isBoostCV) {
      if (lowerText.includes("|") || lowerText.includes("  \t") || (lowerText.includes(" • ") && filename.includes("canva"))) {
        warnings.push("Detected complex multi-column grids or visual separators (Canva indicators). Clean single-column layout recommended.");
        formattingScore -= 20;
      }
      if (lowerText.includes("table") || (lowerText.includes("cell") && text.match(/\n.*\t.*\t/))) {
        warnings.push("Potential hidden tables or grid charts detected. ATS scanners ignore table cell data or read it in garbled order.");
        formattingScore -= 15;
      }
      if (text.split("\n").some((line: string) => /\s{4,}/.test(line) && line.length > 30)) {
        warnings.push("Multi-column layout structure detected. Standard applicant systems fail to read parallel columns linearly.");
        formattingScore -= 15;
      }
      if (lowerText.includes("photo") || lowerText.includes("picture") || lowerText.includes("avatar") || lowerText.includes("profile pic") || lowerText.includes("image")) {
        warnings.push("Embedded profile picture or avatar icon detected. Recruiter guidelines recommend removing visual images to avoid parsing errors.");
        formattingScore -= 15;
      }
      if (text.includes("★") || text.includes("●") || text.includes("■") || text.includes("◆") || lowerText.includes("proficiency:") || lowerText.includes("level:")) {
        warnings.push("Excessive graphics or proficiency star-ratings detected in skills. ATS filters cannot parse ratings and standard text is preferred.");
        formattingScore -= 15;
      }
    } else {
      // BOOSTCV-generated resume template base formatting is pristine! Check only if they typed forbidden symbols in input fields
      if (text.includes("★") || text.includes("●") || text.includes("■") || text.includes("◆")) {
        warnings.push("Manual graphics or star-ratings manually introduced in input fields. Emojis and visual graphics are invisible to ATS parsers.");
        formattingScore -= 15;
      }
      if (lowerText.includes("photo") || lowerText.includes("picture") || lowerText.includes("avatar") || lowerText.includes("profile pic")) {
        warnings.push("Mention of profile images manually introduced in fields. Recruiter guidelines recommend keeping text clear of visual placeholders.");
        formattingScore -= 10;
      }
    }

    // General Emoji check (deduct for both)
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
    if (emojiRegex.test(text)) {
      warnings.push("Emojis (🚀, 💻, etc.) manually introduced in text. Professional recruiters recommend removing all emojis for clean ATS linear scanning.");
      formattingScore -= 15;
    }

    formattingScore = Math.max(10, formattingScore);

    // 3. Readability Check (15% of final score)
    let readabilityScore = 20; // baseline for text existence
    const summaryMatch = lowerText.includes("summary") || lowerText.includes("profile") || lowerText.includes("about me") || lowerText.includes("objective");
    if (summaryMatch) {
      readabilityScore += 20;
    } else {
      warnings.push("Missing professional summary section. HR recruiters expect a 2-3 line target profile at the very top.");
    }

    // Contact info completeness check
    let contactPoints = 0;
    if (lowerText.includes("@")) contactPoints += 15; // Email
    else warnings.push("Missing Email Address. Critical for recruiter follow-up.");
    
    // Simple phone match: look for digits
    if (/\+?\d{2,4}[-.\s]?\d{3,5}[-.\s]?\d{4,6}/.test(text)) contactPoints += 15;
    else warnings.push("Missing Phone Number. Critical for screening calls.");

    if (lowerText.includes("linkedin")) contactPoints += 15;
    else warnings.push("Missing LinkedIn profile URL. 92% of recruiters verify candidates on LinkedIn before booking calls.");

    if (lowerText.includes("github") || lowerText.includes("git")) contactPoints += 15;
    else warnings.push("Missing GitHub / portfolio URL. Engineering callbacks double when projects are verified via active code repositories.");

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

    const matchRatio = uniqueTargets.length > 0 ? matchedCount / uniqueTargets.length : 1;
    let baseKeywordsScore = Math.round(matchRatio * 100);

    // Overused Buzzword Penalty
    let buzzwordPenalties = 0;
    BUZZWORDS.forEach(word => {
      const occurrences = (lowerText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
      if (occurrences > 2) {
        buzzwordPenalties += 5;
        warnings.push(`Overused generic buzzword: "${word}" (${occurrences} times). Replace with strong action-oriented accomplishments.`);
      }
    });
    const keywordsScore = Math.max(10, baseKeywordsScore - buzzwordPenalties);

    // 5. Projects Depth Check (15% of final score)
    let projectsScore = 10;
    const projectMentions = (lowerText.match(/project \d+|technical project|personal project|deployed|github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+/g) || []).length;
    let projectCountScore = 50; 
    if (projectMentions >= 3) projectCountScore = 100;
    else if (projectMentions === 2) projectCountScore = 85;
    else if (projectMentions === 1) projectCountScore = 65;
    else if (!hasProjects) projectCountScore = 10;

    // Github link inside project check
    const hasProjectLinks = lowerText.includes("github.com") || lowerText.includes("http://") || lowerText.includes("https://");
    const linkBonus = hasProjectLinks ? 10 : 0;
    if (!hasProjectLinks && hasProjects) {
      warnings.push("Projects lack repository or deployment links. Recruiters trust projects with clickable proof-of-work URLs.");
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

    // Google XYZ Metric check
    let quantificationScore = 5;
    const bullets = text.split(/[•\n\-\*]/).map(b => b.trim()).filter(b => b.length > 15);
    let quantifiedBullets = 0;
    bullets.forEach(bullet => {
      if (/\d+%?|\b(percent|CGPA|CGPA\b|INR|USD|GB|MB|ms)\b/.test(bullet)) {
        quantifiedBullets++;
      } else if (metricEnhancements.length < 3 && bullet.length > 30) {
        metricEnhancements.push(`In bullet: "${bullet.slice(0, 45)}..." -> Add exact placement statistics, speed increases, or percentages.`);
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

    // Derive the final ATS score based on 6 weights
    const derivedScore = Math.round(
      structureScore * 0.20 +
      formattingScore * 0.20 +
      readabilityScore * 0.15 +
      keywordsScore * 0.15 +
      projectsScore * 0.15 +
      achievementsScore * 0.15
    );

    const heuristicScore = Math.min(99, Math.max(35, derivedScore));

    const breakdown = {
      structure: Math.max(10, structureScore),
      formatting: Math.max(10, formattingScore),
      readability: Math.max(10, readabilityScore),
      keywords: Math.max(10, keywordsScore),
      projects: Math.max(10, projectsScore),
      achievements: Math.max(10, achievementsScore)
    };

    // If Gemini client is active, merge heuristic checks with semantic evaluation
    if (ai) {
      try {
        const prompt = `You are a high-level technical recruiter analyzing a candidate's B.Tech resume text against automated ATS filters.
Analyze the following extracted resume text, compare it against the job description (if provided), and calculate a high-precision ATS score (0 to 100) along with a structured 6-category rating breakdown.

Extracted Resume Text:
${text.slice(0, 3000)}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Provide your response in EXACTLY the following JSON format:
{
  "atsScore": number (0 to 100),
  "warnings": ["detailed formatting/structure warnings"],
  "keywordGaps": ["skills or keyword gaps to add"],
  "metricEnhancements": ["actionable recommendations to rewrite bullet points using Google XYZ metrics (e.g. Accomplished X, as measured by Y, by doing Z)"],
  "breakdown": {
    "structure": number (0 to 100),
    "formatting": number (0 to 100),
    "readability": number (0 to 100),
    "keywords": number (0 to 100),
    "projects": number (0 to 100),
    "achievements": number (0 to 100)
  }
}
Please ensure "atsScore" is derived as: (structure * 0.20) + (formatting * 0.20) + (readability * 0.15) + (keywords * 0.15) + (projects * 0.15) + (achievements * 0.15).
Do not include any markdown wrappers (no \`\`\`json), comments, or commentary. Only return a raw JSON string.`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const resultText = response.text?.trim() || "";
        if (resultText) {
          const aiResult = JSON.parse(resultText);
          if (typeof aiResult.atsScore === "number" && aiResult.breakdown) {
            return NextResponse.json({
              atsScore: aiResult.atsScore,
              warnings: aiResult.warnings && aiResult.warnings.length > 0 ? aiResult.warnings : warnings,
              keywordGaps: aiResult.keywordGaps && aiResult.keywordGaps.length > 0 ? aiResult.keywordGaps : keywordGaps,
              metricEnhancements: aiResult.metricEnhancements && aiResult.metricEnhancements.length > 0 ? aiResult.metricEnhancements : metricEnhancements,
              breakdown: {
                structure: aiResult.breakdown.structure || breakdown.structure,
                formatting: aiResult.breakdown.formatting || breakdown.formatting,
                readability: aiResult.breakdown.readability || breakdown.readability,
                keywords: aiResult.breakdown.keywords || breakdown.keywords,
                projects: aiResult.breakdown.projects || breakdown.projects,
                achievements: aiResult.breakdown.achievements || breakdown.achievements
              },
            });
          }
        }
      } catch (aiErr) {
        console.error("Gemini ATS analysis failed, relying on dynamic heuristic scoring engine:", aiErr);
      }
    }

    // Dynamic Heuristics return
    return NextResponse.json({
      atsScore: heuristicScore,
      warnings: warnings.length > 0 ? warnings : ["Your resume matches standard recruiter formatting guidelines beautifully. Good structure."],
      keywordGaps: keywordGaps.length > 0 ? keywordGaps.slice(0, 6) : ["No severe keyword gaps detected."],
      metricEnhancements: metricEnhancements.length > 0 ? metricEnhancements.slice(0, 3) : ["Incorporate Google XYZ metrics: 'Accomplished X, as measured by Y, by doing Z'."],
      breakdown,
    });

  } catch (err: any) {
    console.error("ATS scanner route crashed:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during scanning. Ensure uploaded files are valid PDF or Word documents." },
      { status: 500 }
    );
  }
}
