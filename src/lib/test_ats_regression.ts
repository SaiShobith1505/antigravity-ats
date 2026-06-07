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

  // --- PART 1: Strict PDF vs Builder consistency check ---
  const templates = ["classic", "minimal", "technical"] as const;
  const builderText = serializeResumeDataToText(defaultResumeData);
  const builderResult = calculateAtsScore(builderText, "resume.json");
  console.log(`\nBuilder Overall Score: ${builderResult.atsScore}%`);
  console.log("Builder Category Breakdown:", builderResult.breakdown);

  for (const temp of templates) {
    console.log(`\n--- Testing Template: ${temp.toUpperCase()} ---`);

    const pdfElement = React.default.createElement(ResumeTemplatePdf, { data: defaultResumeData, template: temp }) as any;
    const pdfBuffer = await renderToBuffer(pdfElement);

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

    const pdfResult = calculateAtsScore(extractedText, "resume.pdf");
    console.log(`PDF Overall Score:     ${pdfResult.atsScore}%`);
    console.log("PDF Category Breakdown:", pdfResult.breakdown);

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

  // --- PART 2: Universal Mode & Benchmarks ---
  console.log("\n==================================================");
  console.log("RUNNING UNIVERSAL ATS BENCHMARK LIBRARY AUDITS");
  console.log("==================================================");

  const benchmarkLibrary = [
    {
      name: "Engineering Resume",
      text: `
        Amit Sharma
        amit.sharma@gmail.com | +91 99661 48499 | linkedin.com/in/amitsharma | github.com/amitsharma
        
        Summary
        Experienced software engineer specialized in fullstack web development.
        
        Education
        B.Tech in Computer Science, DTU, GPA: 9.1/10 (2024)
        
        Experience
        Software Engineer Intern at Tech Corp
        - Developed a real-time analytics dashboard reducing database load by 35%.
        - Spearheaded refactoring of backend modules increasing query speed by 20%.
        
        Projects
        E-Commerce Platform
        - Built a React and Node.js e-commerce app deployed on AWS.
        
        Skills
        React, Next.js, Node.js, TypeScript, SQL, Git
      `,
      expectedType: "Software Engineering",
      shouldRequireGithub: true,
      shouldRequireProjects: true
    },
    {
      name: "Business Analyst Resume",
      text: `
        Sarah Jenkins
        sarah.j@gmail.com | (832) 787-2174 | linkedin.com/in/sarahj
        
        Summary
        Results-driven Business Analyst with 3 years of experience in stakeholder requirements elicitation.
        
        Experience
        Business Analyst at EduSkills Corporation
        - Collaborated with product owners to define user stories and build wireframes in Jira.
        - Analyzed sales pipeline data using Tableau, saving over 40 hours of manual reporting monthly.
        - Formulated functional requirements specifications for translation into executable system components.
        
        Skills
        Business Analysis, SQL, Tableau, Power BI, Jira, Agile, Scrum
      `,
      expectedType: "Business Analyst",
      shouldRequireGithub: false,
      shouldRequireProjects: false
    },
    {
      name: "Finance Resume",
      text: `
        David Miller
        david.miller@financecorp.co.uk | +44 7911 123456 | linkedin.com/in/davidmiller
        
        Summary
        Chartered Financial Analyst candidate with expertise in valuation, auditing, and ledger management.
        
        Experience
        Finance Intern at London Advisory Group
        - Managed daily ledger accounts and audited quarterly cash flows for a $5M portfolio.
        - Built financial modeling spreadsheets in Excel for corporate forecasting assessments.
        
        Skills
        Financial Modeling, Accounting, Ledger, Audit, CFA, Excel, Forecasting
      `,
      expectedType: "Finance",
      shouldRequireGithub: false,
      shouldRequireProjects: false
    },
    {
      name: "Marketing Resume",
      text: `
        Emma Dupont
        emma.dupont@marketing.fr | +33 1 42 68 53 00 | linkedin.com/in/emmadupont
        
        Summary
        Digital Marketing Specialist focused on growth marketing, SEO, and paid ad campaigns.
        
        Experience
        Marketing Specialist at BrandBoost
        - Managed Google AdWords campaigns generating 2.5x growth in customer acquisition.
        - Optimized website copy for SEO, increasing click-through rate (CTR) by 18%.
        
        Skills
        SEO, SEM, Google Analytics, AdWords, Campaign Management, CTR
      `,
      expectedType: "Marketing",
      shouldRequireGithub: false,
      shouldRequireProjects: false
    },
    {
      name: "Consulting Resume",
      text: `
        Rohan Sen
        rohan.sen@consultant.com | +91 98765 43210 | linkedin.com/in/rohansen
        
        Summary
        Management Consultant specialized in strategic planning and process improvement.
        
        Experience
        Associate Consultant at McKinsey & Company
        - Designed process improvement strategies for a global logistics client.
        - Conducted comprehensive market research and business transformation case studies.
        
        Skills
        Strategy, Advisory, Case Study, Analysis, Strategic Planning, Change Management
      `,
      expectedType: "Consulting",
      shouldRequireGithub: false,
      shouldRequireProjects: false
    },
    {
      name: "HR Resume",
      text: `
        Priya Patel
        priya.patel@hrinc.com | 9966148499 | linkedin.com/in/priyapatel
        
        Summary
        HR Generalist with experience in talent acquisition, employee relations, and onboarding.
        
        Experience
        Human Resources Associate at TechCorp
        - Managed applicant tracking systems (ATS) and coordinated talent acquisition pipelines.
        - Standardized onboarding procedures to improve employee retention by 15%.
        
        Skills
        Recruiting, Talent Acquisition, Onboarding, Compliance, HR Management
      `,
      expectedType: "HR",
      shouldRequireGithub: false,
      shouldRequireProjects: false
    }
  ];

  for (const resume of benchmarkLibrary) {
    console.log(`\n--- Auditing Profile: ${resume.name} ---`);
    
    // 1. Run in Universal Mode
    const universalResult = calculateAtsScore(resume.text, `${resume.name.toLowerCase().replace(/\s+/g, "_")}.pdf`, undefined, "universal");
    console.log(`  Classified Type: ${universalResult.resumeType} (Confidence: ${((universalResult.classificationConfidence || 0) * 100).toFixed(0)}%)`);
    console.log(`  Universal Score: ${universalResult.atsScore}%`);

    if (universalResult.resumeType !== resume.expectedType) {
      console.warn(`  [WARNING] Expected classification '${resume.expectedType}', got '${universalResult.resumeType}'`);
    }

    // Assert no false phone warnings
    const hasPhoneWarning = universalResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_phone");
    if (hasPhoneWarning) {
      console.error(`❌ BENCHMARK FAILURE: False phone warning triggered for ${resume.name}`);
      failed = true;
    } else {
      console.log(`  ✅ Phone number recognized correctly.`);
    }

    // Assert no false summary warnings
    const hasSummaryWarning = universalResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_summary");
    if (hasSummaryWarning) {
      console.error(`❌ BENCHMARK FAILURE: False summary warning triggered for ${resume.name}`);
      failed = true;
    } else {
      console.log(`  ✅ Summary recognized correctly.`);
    }

    // Assert no false table warnings (especially on words like "executable")
    const hasTableWarning = universalResult.verifiedWarnings.some(w => w.warning_type === "hidden_table");
    if (hasTableWarning) {
      console.error(`❌ BENCHMARK FAILURE: False table warning triggered for ${resume.name}`);
      failed = true;
    } else {
      console.log(`  ✅ No false table warnings.`);
    }

    // Assert no project warnings or penalties if projects are optional
    const hasProjectWarning = universalResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_projects");
    if (!resume.shouldRequireProjects && hasProjectWarning) {
      console.error(`❌ BENCHMARK FAILURE: Optional projects penalized for ${resume.name}`);
      failed = true;
    } else {
      console.log(`  ✅ Projects penalty checked correctly.`);
    }

    // Assert no github warnings or penalties if github is optional
    const hasGithubWarning = universalResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_github");
    if (!resume.shouldRequireGithub && hasGithubWarning) {
      console.error(`❌ BENCHMARK FAILURE: Optional GitHub penalized for ${resume.name}`);
      failed = true;
    } else {
      console.log(`  ✅ GitHub penalty checked correctly.`);
    }

    // 2. Run in Student Mode to verify strict mode is preserved
    const studentResult = calculateAtsScore(resume.text, `${resume.name.toLowerCase().replace(/\s+/g, "_")}.pdf`, undefined, "student");
    if (!resume.shouldRequireProjects) {
      // Student mode should penalize missing projects
      const studentHasProjectWarning = studentResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_projects");
      if (!studentHasProjectWarning) {
        console.error(`❌ BENCHMARK FAILURE: Student mode did NOT penalize missing projects for ${resume.name}`);
        failed = true;
      }
    }
  }

  // --- PART 3: Capital One Calibration Check ---
  console.log("\n==================================================");
  console.log("RUNNING CAPITAL ONE ATS CALIBRATION CHECK");
  console.log("==================================================");
  const capOnePath = path.join(process.cwd(), "benchmark", "capital_one_resume.txt");
  if (fs.existsSync(capOnePath)) {
    const capOneText = fs.readFileSync(capOnePath, "utf-8");
    const capOneResult = calculateAtsScore(capOneText, "capital_one_resume.txt", undefined, "universal");
    
    if (capOneResult.resumeType !== "Business Analyst") {
      console.error(`❌ CAPITAL ONE CALIBRATION FAILURE: Expected 'Business Analyst', got '${capOneResult.resumeType}'`);
      failed = true;
    }
    
    const capOnePhoneWarning = capOneResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_phone");
    if (capOnePhoneWarning) {
      console.error("❌ CAPITAL ONE CALIBRATION FAILURE: Phone number warning triggered.");
      failed = true;
    }
    
    const capOneSummaryWarning = capOneResult.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_summary");
    if (capOneSummaryWarning) {
      console.error("❌ CAPITAL ONE CALIBRATION FAILURE: Summary warning triggered.");
      failed = true;
    }
    
    const capOneTableWarning = capOneResult.verifiedWarnings.some(w => w.warning_type === "hidden_table");
    if (capOneTableWarning) {
      console.error("❌ CAPITAL ONE CALIBRATION FAILURE: Table warning triggered.");
      failed = true;
    }
    
    const capOneCanvaWarning = capOneResult.verifiedWarnings.some(w => w.warning_type === "grid_layout");
    if (capOneCanvaWarning) {
      console.error("❌ CAPITAL ONE CALIBRATION FAILURE: Canva/column warning triggered.");
      failed = true;
    }

    if (capOneResult.atsScore < 85) {
      console.error(`❌ CAPITAL ONE CALIBRATION FAILURE: Score is below expected calibration range (Expected >= 85, got ${capOneResult.atsScore}%)`);
      failed = true;
    } else {
      console.log(`  ✅ Capital One BA Resume parsed successfully. Score: ${capOneResult.atsScore}%.`);
    }
  } else {
    console.error("❌ CAPITAL ONE CALIBRATION FAILURE: capital_one_resume.txt not found.");
    failed = true;
  }

  if (failed) {
    console.error("\n❌ REGRESSION OR BENCHMARK TESTS FAILED.");
    process.exit(1);
  } else {
    console.log("\n✅ ALL REGRESSION AND BENCHMARK TESTS PASSED SUCCESSFULLY!");
    process.exit(0);
  }
}

runRegressionTest().catch(err => {
  console.error("Test execution crashed:", err);
  process.exit(1);
});
