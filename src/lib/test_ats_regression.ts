import fs from "fs";
import path from "path";

// 1. Load env variables programmatically at startup before other modules are imported
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    // @ts-ignore
    if (typeof process.loadEnvFile === "function") {
      // @ts-ignore
      process.loadEnvFile(envPath);
    } else {
      const envContent = fs.readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach(line => {
        const part = line.trim();
        if (part && !part.startsWith("#")) {
          const eqIdx = part.indexOf("=");
          if (eqIdx !== -1) {
            const key = part.slice(0, eqIdx).trim();
            const val = part.slice(eqIdx + 1).replace(/^['"]|['"]$/g, "").trim();
            process.env[key] = val;
          }
        }
      });
    }
  }
} catch (e) {
  console.warn("Failed to load .env.local file:", e);
}

// 2. Use dynamic imports to prevent ES6 import hoisting from loading Firebase first
async function runRegressionTest() {
  const React = await import("react");
  const { renderToBuffer } = await import("@react-pdf/renderer");
  const { PdfReader } = await import("pdfreader");
  const { defaultResumeData } = await import("./db");
  const { ResumeTemplatePdf } = await import("../components/ResumeTemplatePdf");
  const { calculateAtsScore, serializeResumeDataToText } = await import("./scoring-engine");

  console.log("==================================================");
  console.log("RUNNING BOOSTCV SCORE REGRESSION INTEGRATION TEST");
  console.log("==================================================");

  let failed = false;
  const templates = ["classic", "minimal", "technical"] as const;

  // Compute Builder score
  const builderText = serializeResumeDataToText(defaultResumeData);
  const builderResult = calculateAtsScore(builderText, "resume.json");
  console.log(`\nBuilder Overall Score: ${builderResult.atsScore}%`);
  console.log("Builder Category Breakdown:", builderResult.breakdown);

  for (const temp of templates) {
    console.log(`\n--- Testing Template: ${temp.toUpperCase()} ---`);

    // Generate PDF
    const pdfElement = React.default.createElement(ResumeTemplatePdf, { data: defaultResumeData, template: temp }) as any;
    const pdfBuffer = await renderToBuffer(pdfElement);

    // Extract text with page markers
    let currentPage = 1;
    const extractedText = await new Promise<string>((resolve, reject) => {
      let extracted = "";
      new PdfReader().parseBuffer(pdfBuffer, (err: any, item: any) => {
        if (err) {
          reject(err);
        } else if (!item) {
          resolve(extracted);
        } else if (item.page !== undefined) {
          currentPage = item.page;
          extracted += `\n[PAGE ${currentPage}]\n`;
        } else if (item.text) {
          extracted += item.text + " ";
        }
      });
    });

    // Compute Scanner score on PDF text
    const pdfResult = calculateAtsScore(extractedText, "resume.pdf");
    console.log(`PDF Overall Score:     ${pdfResult.atsScore}%`);
    console.log("PDF Category Breakdown:", pdfResult.breakdown);
    console.log("Warnings Generated:\n", pdfResult.warnings.map(w => `  ${w}`).join("\n"));

    // Assert deltas
    const overallDelta = Math.abs(builderResult.atsScore - pdfResult.atsScore);
    console.log(`Overall Delta: ${overallDelta} points (Max allowed: 3)`);

    if (overallDelta > 3) {
      console.error(`❌ REGRESSION FAILURE: Overall Score Delta for template '${temp}' is ${overallDelta} (> 3 allowed)`);
      failed = true;
    }

    const categories = ["structure", "formatting", "readability", "keywords", "projects", "achievements"] as const;
    categories.forEach(cat => {
      const bScore = builderResult.breakdown[cat];
      const pScore = pdfResult.breakdown[cat];
      const catDelta = Math.abs(bScore - pScore);
      console.log(`  - ${cat.toUpperCase()} Delta: ${catDelta} points (Max allowed: 5) | Builder=${bScore}%, PDF=${pScore}%`);
      if (catDelta > 5) {
        console.error(`❌ REGRESSION FAILURE: Category '${cat.toUpperCase()}' Delta for template '${temp}' is ${catDelta} (> 5 allowed)`);
        failed = true;
      }
    });
  }

  if (failed) {
    console.error("\n❌ REGRESSION TEST FAILED. Failing the build pipeline.");
    process.exit(1);
  } else {
    console.log("\n✅ ALL REGRESSION TESTS PASSED SUCCESSFULLY! Score alignment is stable.");
    process.exit(0);
  }
}

runRegressionTest().catch(err => {
  console.error("Test execution crashed:", err);
  process.exit(1);
});
