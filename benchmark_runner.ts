import fs from "fs";
import path from "path";
import { calculateAtsScore } from "./src/lib/scoring-engine";

interface BenchmarkResult {
  filename: string;
  industry: string;
  studentResult: {
    score: number;
    parserConfidence: number;
    warningsCount: number;
    warnings: Array<{
      type: string;
      evidence: string;
      confidence: number;
    }>;
  };
  universalResult: {
    score: number;
    parserConfidence: number;
    classifiedType: string;
    classificationConfidence: number;
    warningsCount: number;
    warnings: Array<{
      type: string;
      evidence: string;
      confidence: number;
    }>;
  };
}

function runBenchmarks() {
  const benchmarkDir = path.join(process.cwd(), "benchmark");
  if (!fs.existsSync(benchmarkDir)) {
    console.error("Benchmark directory does not exist.");
    process.exit(1);
  }

  const files = fs.readdirSync(benchmarkDir).filter(f => f.endsWith(".txt"));
  console.log(`Found ${files.length} benchmark files to process...`);

  const results: BenchmarkResult[] = [];

  for (const file of files) {
    const filePath = path.join(benchmarkDir, file);
    const text = fs.readFileSync(filePath, "utf-8");

    // 1. Run in student mode
    const studentScoring = calculateAtsScore(text, file, undefined, "student");

    // 2. Run in universal mode
    const universalScoring = calculateAtsScore(text, file, undefined, "universal");

    results.push({
      filename: file,
      industry: universalScoring.resumeType || "General Corporate",
      studentResult: {
        score: studentScoring.atsScore,
        parserConfidence: studentScoring.parserConfidence || 95,
        warningsCount: studentScoring.verifiedWarnings.length,
        warnings: studentScoring.verifiedWarnings.map(w => ({
          type: w.warning_type,
          evidence: w.evidence,
          confidence: w.confidence
        }))
      },
      universalResult: {
        score: universalScoring.atsScore,
        parserConfidence: universalScoring.parserConfidence || 95,
        classifiedType: universalScoring.resumeType || "General Corporate",
        classificationConfidence: universalScoring.classificationConfidence || 1.0,
        warningsCount: universalScoring.verifiedWarnings.length,
        warnings: universalScoring.verifiedWarnings.map(w => ({
          type: w.warning_type,
          evidence: w.evidence,
          confidence: w.confidence
        }))
      }
    });

    console.log(`Processed: ${file} | Classified: ${universalScoring.resumeType} | Student Score: ${studentScoring.atsScore}% | Universal Score: ${universalScoring.atsScore}%`);
  }

  const resultsPath = path.join(benchmarkDir, "results.json");
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`Results successfully saved to: ${resultsPath}`);

  // Generate Comparison Report
  const reportPath = path.join(benchmarkDir, "comparison_report.md");
  let report = `# ATS Benchmark Comparison Report\n\n`;
  report += `This report outlines the validation metrics and parsing performance differences between **Student Mode** and **Universal Mode** across the real benchmark dataset.\n\n`;
  report += `| Filename | Classified Type | Student Score | Universal Score | Student Warnings | Universal Warnings | Parser Conf. |\n`;
  report += `| :--- | :---: | :---: | :---: | :---: | :---: | :---: |\n`;

  for (const r of results) {
    report += `| **${r.filename}** | ${r.universalResult.classifiedType} | ${r.studentResult.score}% | ${r.universalResult.score}% | ${r.studentResult.warningsCount} | ${r.universalResult.warningsCount} | ${r.universalResult.parserConfidence}% |\n`;
  }

  fs.writeFileSync(reportPath, report);
  console.log(`Markdown comparison report written to: ${reportPath}`);
}

runBenchmarks();
