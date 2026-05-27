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

    // Initialize Heuristic Scorer Parameters
    let formatScore = 20;
    let keywordScore = 30;
    let qualityScore = 20;
    let technicalScore = 10;
    let completenessScore = 10;

    const warnings: string[] = [];
    const keywordGaps: string[] = [];
    const metricEnhancements: string[] = [];
    const lowerText = text.toLowerCase();

    // 1. Format & Structure Check (20 pts)
    if (lowerText.includes("|") || lowerText.includes("  \t") || lowerText.includes(" • ") && filename.includes("canva")) {
      warnings.push("Detected complex multi-column grids or visual separators (Canva indicators). Clean single-column layout recommended.");
      formatScore -= 10;
    }
    if (lowerText.includes("table") || lowerText.includes("cell") && text.match(/\n.*\t.*\t/)) {
      warnings.push("Potential hidden tables or grid charts detected. ATS scanners ignore table cell data or read it in garbled order.");
      formatScore -= 5;
    }
    // Section order checklist
    const sections = ["education", "experience", "projects", "skills"];
    const sectionIndex = sections.map(sec => lowerText.indexOf(sec));
    const isSorted = sectionIndex.every((val, i, arr) => !i || arr[i - 1] === -1 || val === -1 || val >= arr[i - 1]);
    if (!isSorted) {
      warnings.push("Chronological section flow issue: Recommended order is Header -> Summary -> Education -> Experience -> Projects -> Skills.");
      formatScore -= 5;
    }

    // 2. Keyword Matching & Normalization (30 pts)
    const targetKeywords = jobDescription
      ? jobDescription.toLowerCase().match(/\b[a-z]{3,}\b/g) || []
      : ["react", "next.js", "nodejs", "typescript", "docker", "git", "sql", "nosql", "aws", "gcp"];

    const uniqueTargets = Array.from(new Set(targetKeywords)).slice(0, 15);
    let matchedCount = 0;

    uniqueTargets.forEach(word => {
      // Synonym support
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
    keywordScore = Math.round(matchRatio * 30);

    // Overused Buzzword Penalty
    let buzzwordPenalties = 0;
    BUZZWORDS.forEach(word => {
      const occurrences = (lowerText.match(new RegExp(`\\b${word}\\b`, "g")) || []).length;
      if (occurrences > 2) {
        buzzwordPenalties += 2;
        warnings.push(`Overused generic buzzword: "${word}" (${occurrences} times). Replace with strong action-oriented accomplishments.`);
      }
    });
    keywordScore = Math.max(5, keywordScore - buzzwordPenalties);

    // 3. Content Quality Check (20 pts)
    const summaryMatch = lowerText.includes("summary") || lowerText.includes("profile") || lowerText.includes("about me");
    if (summaryMatch) {
      qualityScore += 5;
    } else {
      warnings.push("Missing professional summary section. HR recruiters expect a 2-3 line target profile at the very top.");
      qualityScore -= 5;
    }

    // Quantifications check (Google XYZ Metrics)
    const bullets = text.split(/[•\n\-\*]/).map(b => b.trim()).filter(b => b.length > 15);
    let quantifiedBullets = 0;
    bullets.forEach(bullet => {
      if (/\d+%?|\b(percent|CGPA|CGPA\b)\b/.test(bullet)) {
        quantifiedBullets++;
      } else if (metricEnhancements.length < 3 && bullet.length > 30) {
        metricEnhancements.push(`In bullet: "${bullet.slice(0, 45)}..." -> Add exact placement statistics, speed increases, or percentages.`);
      }
    });

    const bulletMetricsRatio = bullets.length > 0 ? quantifiedBullets / bullets.length : 0;
    if (bulletMetricsRatio < 0.3) {
      warnings.push("Lacks quantified accomplishments. Recruiters require metrics, scale increases, and measurable outputs (XYZ structure).");
      qualityScore -= 10;
    } else {
      qualityScore += 10;
    }

    // 4. Technical Depth Check (10 pts)
    const technicalKeyCount = ["javascript", "python", "typescript", "c++", "java", "react", "next.js", "docker", "git", "aws"].filter(term => lowerText.includes(term)).length;
    technicalScore = Math.min(10, Math.round((technicalKeyCount / 5) * 10));

    // 5. Completeness Check (10 pts)
    const hasEducation = lowerText.includes("education") || lowerText.includes("college") || lowerText.includes("university");
    const hasExperience = lowerText.includes("experience") || lowerText.includes("work") || lowerText.includes("employment");
    const hasProjects = lowerText.includes("projects") || lowerText.includes("project");
    const hasSkills = lowerText.includes("skills") || lowerText.includes("technologies");

    let completeCount = 0;
    if (hasEducation) completeCount++;
    else warnings.push("Missing Education Section. Critical for academic qualification checks.");

    if (hasExperience) completeCount++;
    if (hasProjects) completeCount++;
    else warnings.push("Missing Technical Projects Section. Critical for engineering callbacks.");

    if (hasSkills) completeCount++;
    else warnings.push("Missing Technical Skills Section. Critical for recruiter search filters.");

    completenessScore = Math.round((completeCount / 4) * 10);

    const heuristicScore = Math.min(99, Math.max(35, formatScore + keywordScore + qualityScore + technicalScore + completenessScore));

    const breakdown = {
      formatting: Math.max(10, formatScore * 5),
      keywords: Math.max(10, Math.round((keywordScore / 30) * 100)),
      experienceQuality: Math.max(10, Math.round((qualityScore / 20) * 100)),
      technicalSkills: Math.max(10, technicalScore * 10),
      readability: Math.max(10, completenessScore * 10),
    };

    // If Gemini client is active, merge heuristic checks with semantic evaluation
    if (ai) {
      try {
        const prompt = `You are a high-level technical recruiter analyzing a candidate's B.Tech resume text against automated ATS filters.
Analyze the following extracted resume text, compare it against the job description (if provided), and calculate a high-precision ATS score (0 to 100).
Check for multi-column grids, Canva graphics, standard section order, synonym metrics, buzzword density, Google XYZ accomplishments, and completeness.

Extracted Resume Text:
${text.slice(0, 3000)}

${jobDescription ? `Job Description:\n${jobDescription}` : ""}

Provide your response in EXACTLY the following JSON format:
{
  "atsScore": number (0 to 100),
  "warnings": ["detailed formatting/structure warnings"],
  "keywordGaps": ["skills or keyword gaps to add"],
  "metricEnhancements": ["actionable recommendations to rewrite bullet points using Google XYZ metrics (e.g. Accomplished X, as measured by Y, by doing Z)"]
}
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
          if (typeof aiResult.atsScore === "number") {
            return NextResponse.json({
              atsScore: aiResult.atsScore,
              warnings: aiResult.warnings && aiResult.warnings.length > 0 ? aiResult.warnings : warnings,
              keywordGaps: aiResult.keywordGaps && aiResult.keywordGaps.length > 0 ? aiResult.keywordGaps : keywordGaps,
              metricEnhancements: aiResult.metricEnhancements && aiResult.metricEnhancements.length > 0 ? aiResult.metricEnhancements : metricEnhancements,
              breakdown,
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
      keywordGaps: keywordGaps.length > 0 ? keywordGaps.slice(0, 6) : ["TypeScript", "Docker", "AWS"],
      metricEnhancements: metricEnhancements.length > 0 ? metricEnhancements.slice(0, 3) : ["Rewrite accomplishments: 'Assisted in React layouts' -> 'Designed 8 responsive React dashboards, decreasing customer latency by 24%.'"],
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
