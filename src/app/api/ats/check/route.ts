import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const aiApiKey = process.env.GEMINI_API_KEY;
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

export async function POST(req: Request) {
  try {
    const { text, filename } = await req.json();

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: "No text content provided for parsing." },
        { status: 400 }
      );
    }

    // Heuristics checks (Always run alongside Gemini to serve detailed analysis)
    const warnings: string[] = [];
    const keywordGaps: string[] = [];
    const metricEnhancements: string[] = [];
    let computedScore = 85;

    // Check for multi-column / graphic patterns in file text
    const lowerText = text.toLowerCase();
    
    // Graphic resume indicators
    if (lowerText.includes("cocurricular") || lowerText.includes("hobbies") || lowerText.includes("skills:") && lowerText.includes("|")) {
      warnings.push("Detected multi-column text separators (| or tab alignments) indicating potential parsing conflicts.");
      computedScore -= 15;
    }

    // Checking core placement B.Tech keyword gaps
    const techWords = ["react", "next.js", "node.js", "docker", "git", "typescript", "kubernetes", "aws", "gcp"];
    const missedTech = techWords.filter(word => !lowerText.includes(word));
    if (missedTech.length > 3) {
      warnings.push(`Missing critical industry keywords: ${missedTech.slice(0, 3).join(", ")}`);
      computedScore -= 10;
      missedTech.slice(0, 4).forEach(w => keywordGaps.push(w));
    }

    // Quantifications validation check
    const sentences = text.split(/[.!?\n]/);
    let lacksMetricsCount = 0;
    sentences.forEach((sentence: string) => {
      const s = sentence.trim();
      if (s.length > 20 && !/\d+%?|\b(percent|CGPA|CGPA\b)\b/.test(s)) {
        lacksMetricsCount++;
        if (metricEnhancements.length < 3) {
          metricEnhancements.push(`Suggest adding metric to: "${s.slice(0, 50)}..."`);
        }
      }
    });

    if (lacksMetricsCount > 2) {
      warnings.push("Multiple unquantified accomplishments found (lacks percentages, metrics, or performance ratios).");
      computedScore -= 15;
    }

    // If Gemini client is active, fetch deep semantic parsing analysis
    if (ai) {
      try {
        const prompt = `Analyze the following B.Tech student resume text against tech placement requirements.
Check for columns, table structures, graphics, keyword gaps, and metrics/quantifications.
Text:
${text.slice(0, 2500)}

Strict JSON format return:
{
  "atsScore": number (0 to 100),
  "warnings": ["string"],
  "keywordGaps": ["string"],
  "metricEnhancements": ["string"]
}`;

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
          return NextResponse.json(aiResult);
        }
      } catch (aiErr) {
        console.error("Gemini ATS Sandbox analysis failed, falling back to heuristics:", aiErr);
      }
    }

    // Dynamic Heuristics return
    return NextResponse.json({
      atsScore: Math.max(30, computedScore),
      warnings: warnings.length > 0 ? warnings : ["No critical formatting errors found! Keep it up."],
      keywordGaps: keywordGaps.length > 0 ? keywordGaps : ["Docker", "TypeScript", "Redis"],
      metricEnhancements: metricEnhancements.length > 0 ? metricEnhancements : ["Optimize project metrics using the XYZ formula (e.g. Accomplished X, as measured by Y, by doing Z)."]
    });

  } catch (err: any) {
    console.error("ATS scan route crashed:", err);
    return NextResponse.json(
      { error: "Internal server error occurred during scan." },
      { status: 500 }
    );
  }
}
