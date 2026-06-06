import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
// @ts-ignore
import mammoth from "mammoth";
import { calculateAtsScore } from "@/lib/scoring-engine";

export const dynamic = "force-dynamic";

const aiApiKey = process.env.GEMINI_API_KEY;
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

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

    // Call unified heuristic scorer
    const heuristicResult = calculateAtsScore(text, file.name, jobDescription);
    const heuristicScore = heuristicResult.atsScore;

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
            // Calibrate Gemini score to be within ±3 of heuristic score
            let calibratedScore = aiResult.atsScore;
            if (Math.abs(calibratedScore - heuristicScore) > 3) {
              calibratedScore = calibratedScore > heuristicScore ? heuristicScore + 3 : heuristicScore - 3;
            }

            return NextResponse.json({
              atsScore: calibratedScore,
              warnings: aiResult.warnings && aiResult.warnings.length > 0 ? aiResult.warnings : heuristicResult.warnings,
              verifiedWarnings: heuristicResult.verifiedWarnings,
              actionableFixes: heuristicResult.actionableFixes,
              keywordGaps: aiResult.keywordGaps && aiResult.keywordGaps.length > 0 ? aiResult.keywordGaps : heuristicResult.keywordGaps,
              metricEnhancements: aiResult.metricEnhancements && aiResult.metricEnhancements.length > 0 ? aiResult.metricEnhancements : heuristicResult.metricEnhancements,
              breakdown: {
                structure: aiResult.breakdown.structure || heuristicResult.breakdown.structure,
                formatting: aiResult.breakdown.formatting || heuristicResult.breakdown.formatting,
                readability: aiResult.breakdown.readability || heuristicResult.breakdown.readability,
                keywords: aiResult.breakdown.keywords || heuristicResult.breakdown.keywords,
                projects: aiResult.breakdown.projects || heuristicResult.breakdown.projects,
                achievements: aiResult.breakdown.achievements || heuristicResult.breakdown.achievements
              },
            });
          }
        }
      } catch (aiErr) {
        console.error("Gemini ATS analysis failed, relying on dynamic heuristic scoring engine:", aiErr);
      }
    }

    // Heuristic return if Gemini is disabled or failed
    return NextResponse.json(heuristicResult);

  } catch (err: any) {
    console.error("ATS scanner route crashed:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during scanning. Ensure uploaded files are valid PDF or Word documents." },
      { status: 500 }
    );
  }
}
