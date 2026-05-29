import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const aiApiKey = process.env.GEMINI_API_KEY;
const ai = aiApiKey ? new GoogleGenAI({ apiKey: aiApiKey }) : null;

// Complete high-fidelity company optimization profiles for 13 leaders
interface CompanyProfile {
  name: string;
  preferredSkills: string[];
  resumeExpectations: string;
  typicalKeywords: string[];
  desiredProjectDepth: string;
  depthKeywords: string[];
  atsTendencies: string;
  hiringFocusAreas: string[];
  focusMode: string;
}

const COMPANY_PROFILES: Record<string, CompanyProfile> = {
  Google: {
    name: "Google",
    preferredSkills: ["C++", "Java", "Python", "Go", "Algorithms", "DSA", "System Design", "Distributed Systems", "Open Source"],
    resumeExpectations: "Expects strong technical depth, computational complexity awareness (O(log N)), Google XYZ metrics, and open source or system-level achievements.",
    typicalKeywords: ["DSA", "Algorithms", "Distributed Systems", "System Design", "Scalability", "Concurrency", "Open Source", "C++", "Go", "Python", "O(N)"],
    desiredProjectDepth: "High computational complexity: custom engines, operating system interfaces, scalable cloud clusters, or compiler optimization.",
    depthKeywords: ["concurrency", "multithreading", "compiler", "operating system", "custom engine", "distributed", "scalability", "latency", "optimization", "asynchronous"],
    atsTendencies: "Extremely sensitive to resume layout, ignores multi-column tables or text boxes. Scans for algorithmic complexity and foundational engineering paradigms.",
    hiringFocusAreas: ["Algorithmic efficiency", "Systems design", "Technical depth", "Open source leadership"],
    focusMode: "Technical depth first: Position 'Technical Skills' and high-scale, deep 'Projects' right below the header. Hide academic credentials towards the bottom."
  },
  Microsoft: {
    name: "Microsoft",
    preferredSkills: ["C#", "C++", "Azure", ".NET", "TypeScript", "System Design", "OOP", "Design Patterns", "SQL Server"],
    resumeExpectations: "Expects scalable product-centric engineering, understanding of enterprise design patterns, and robust cloud services integration.",
    typicalKeywords: ["C#", "C++", "Azure", ".NET", "OOP", "Design Patterns", "Microservices", "REST API", "SQL Server", "Cloud Architecture"],
    desiredProjectDepth: "Enterprise software designs: microservice backends, SDK libraries, low-level tooling, or enterprise cloud platforms.",
    depthKeywords: ["microservices", "oop", "design patterns", "azure", "enterprise", "api", "database", "robustness", "clean architecture", "library"],
    atsTendencies: "Scans for strong enterprise system terminology and object-oriented methodologies.",
    hiringFocusAreas: ["Object-oriented software design", "Enterprise scalability", "Cloud infrastructure integration"],
    focusMode: "Core software engineering first: Position 'Technical Skills' and 'Software Projects' at the top, followed by 'Experience'."
  },
  Amazon: {
    name: "Amazon",
    preferredSkills: ["Java", "Python", "AWS", "Distributed Systems", "Microservices", "NoSQL", "Scalability", "System Design"],
    resumeExpectations: "Demands demonstration of Amazon Leadership Principles (Customer Obsession, Ownership, Bias for Action) and quantitative data points of scale.",
    typicalKeywords: ["AWS", "Java", "Python", "Distributed Systems", "Microservices", "NoSQL", "Scalability", "DynamoDB", "Ownership", "Customer Obsession"],
    desiredProjectDepth: "Large-scale systems: real-time streaming, high-throughput database interactions, and AWS cloud solutions.",
    depthKeywords: ["aws", "cloud", "distributed", "scale", "microservices", "nosql", "dynamodb", "redundancy", "fault tolerance", "throughput"],
    atsTendencies: "Scans for specific AWS resource names (EC2, S3, RDS, DynamoDB) and indicators of large-scale execution.",
    hiringFocusAreas: ["Distributed cloud systems", "Scale execution metrics", "Leadership & ownership traits"],
    focusMode: "Experience & Scale projects first: Highlight high-impact internship/professional experience and large-scale AWS projects. Place certifications next."
  },
  Meta: {
    name: "Meta",
    preferredSkills: ["React", "TypeScript", "JavaScript", "C++", "GraphQL", "Product Engineering", "DSA", "System Design"],
    resumeExpectations: "Expects rapid product design capability, extensive modern web tools knowledge, and high-impact metrics (user count, latency drops).",
    typicalKeywords: ["React", "TypeScript", "GraphQL", "Product Engineering", "DSA", "System Design", "Frontend", "UI Optimization", "Latency Reduction"],
    desiredProjectDepth: "Dynamic product-driven engineering: interactive web apps, custom libraries, client-side optimizations, and high-speed API layers.",
    depthKeywords: ["react", "typescript", "graphql", "client", "frontend", "optimization", "api", "interactive", "latency", "rendering"],
    atsTendencies: "Heavy scanner for frontend/backend languages, libraries, and rapid feature iteration accomplishments.",
    hiringFocusAreas: ["End-to-end product development", "Modern framework mastery", "User-centric speed optimizations"],
    focusMode: "Product impact first: Order 'Technical Skills' and user-facing 'Projects' or internships at the very top. Frame project accomplishments with product growth."
  },
  Apple: {
    name: "Apple",
    preferredSkills: ["Swift", "Objective-C", "C++", "Systems Programming", "macOS", "iOS", "Metal", "UI/UX", "Hardware Integration"],
    resumeExpectations: "Demands meticulous attention to detail, hardware-software synergy, pixel-perfect user interface design, and clean low-level systems execution.",
    typicalKeywords: ["Swift", "iOS", "Systems Programming", "C++", "Objective-C", "Metal", "CoreData", "Memory Management", "User Experience", "Embedded"],
    desiredProjectDepth: "Native system apps, iOS applications, graphics pipeline programs, low-level compilers, or hardware control scripts.",
    depthKeywords: ["ios", "swift", "native", "hardware", "systems", "memory", "metal", "graphics", "embedded", "ui", "ux"],
    atsTendencies: "Filters heavily on native development languages (Swift, C++) and rejects boilerplate generic web layouts.",
    hiringFocusAreas: ["Meticulous code elegance", "Low-level system efficiency", "Native SDK performance"],
    focusMode: "Native & Low-level systems first: Place native application achievements (Swift/C++) or systems integration projects at the top. Detail UI quality."
  },
  Netflix: {
    name: "Netflix",
    preferredSkills: ["Java", "Spring Boot", "Microservices", "Chaos Engineering", "AWS", "System Design", "Scalability", "High Throughput"],
    resumeExpectations: "Looks for deep technical autonomy, chaos testing structures, highly scalable microservices, and senior-level decision making bullets.",
    typicalKeywords: ["Java", "Spring Boot", "Microservices", "AWS", "Chaos Engineering", "Scalability", "System Design", "Fault Tolerance", "High Throughput"],
    desiredProjectDepth: "Extreme high-traffic setups: custom streaming queues, telemetry aggregations, fault-tolerant nodes, or real-time event brokers.",
    depthKeywords: ["chaos", "fault tolerance", "throughput", "streaming", "microservices", "aws", "spring boot", "scalability", "resiliency", "concurrency"],
    atsTendencies: "Strict filters searching for experienced microservices patterns and resilient system designs.",
    hiringFocusAreas: ["High-throughput engineering", "Resiliency & chaos testing", "System autonomy"],
    focusMode: "System design & Resiliency first: Place complex distributed backends or automation test infrastructure at the top of your resume."
  },
  TCS: {
    name: "TCS",
    preferredSkills: ["Java", "SQL", "Python", "Agile", "Testing", "SDLC", "Cloud Basics", "IT Certifications"],
    resumeExpectations: "Focuses on formal academic percentages/GPAs, structured software development life cycle (SDLC) exposure, and technology training certifications.",
    typicalKeywords: ["Java", "SQL", "Agile", "Testing", "SDLC", "HTML", "CSS", "Python", "Oracle", "Certifications"],
    desiredProjectDepth: "Academic capstones, relational database web tools, quality assurance automation, or system migrations.",
    depthKeywords: ["database", "web", "testing", "sdlc", "sql", "academic", "system", "automation", "migration", "manual"],
    atsTendencies: "Values standard, plain ATS structures, high keyword density in standard languages, and formal certification declarations.",
    hiringFocusAreas: ["Core development basics", "Software quality testing", "Client adaptability"],
    focusMode: "Certifications & Academics first: Position 'Education' and professional technology 'Certifications' immediately below the contact info."
  },
  Infosys: {
    name: "Infosys",
    preferredSkills: ["Java", ".NET", "Python", "Angular", "Spring Boot", "DBMS", "Agile", "SQL"],
    resumeExpectations: "Seeks structured development foundations, specialized training completions, robust academic performance, and solid database workflows.",
    typicalKeywords: ["Java", "DBMS", "Spring Boot", "Angular", "Agile", "SQL", "Full Stack", "SDLC", "Lex", "Training"],
    desiredProjectDepth: "Multi-tier web applications, management trackers, business automation tools, or full stack setups.",
    depthKeywords: ["full stack", "database", "web", "angular", "spring boot", "management", "tracker", "sql", "workflow"],
    atsTendencies: "Searches for standardized framework lists, training keywords (like Infosys Lex or similar courses), and high-level tech stacks.",
    hiringFocusAreas: ["Full-stack web engineering", "Enterprise database operations", "Structured development workflow"],
    focusMode: "Formal training & Academic honors first: Showcase 'Education', specialized training courses, and verified 'Certifications' before project sections."
  },
  Wipro: {
    name: "Wipro",
    preferredSkills: ["Java", "Python", "SQL", "Testing", "Automation", "DevOps", "Agile", "Cloud Fundamentals"],
    resumeExpectations: "Prioritizes formal technology credentials, testing/automation tools, quality assurance metrics, and agile process execution.",
    typicalKeywords: ["Java", "SQL", "Testing", "Automation", "Agile", "DevOps", "CI/CD", "Quality Assurance", "Python"],
    desiredProjectDepth: "Automated test beds, standard web interfaces, deployment pipelines, or corporate databases.",
    depthKeywords: ["testing", "automation", "quality", "ci/cd", "pipeline", "database", "web", "agile", "script"],
    atsTendencies: "Plain layout parser checking for programming keywords, automation frameworks, and academic scores.",
    hiringFocusAreas: ["Software testing & automation", "DevOps pipeline foundations", "Service execution compliance"],
    focusMode: "Process & Certification first: Elevate 'Certifications' and 'Education' to the top. Place automated testing or devops projects immediately below."
  },
  Accenture: {
    name: "Accenture",
    preferredSkills: ["Cloud Architecture", "DevOps", "Salesforce", "SAP", "Agile", "Project Management", "Enterprise Integration"],
    resumeExpectations: "Expects professional consulting language, digital transformation case studies, agile execution, and enterprise systems integration.",
    typicalKeywords: ["Digital Transformation", "Enterprise Architecture", "DevOps", "AWS Cloud", "Agile Scrum", "Salesforce", "SAP", "Integration", "Consulting"],
    desiredProjectDepth: "Cloud migrations, enterprise API linkages, business workflow systems, or automated management structures.",
    depthKeywords: ["cloud", "migration", "integration", "enterprise", "salesforce", "sap", "agile", "workflow", "management", "devops"],
    atsTendencies: "Searches for high-level business technology words, consulting terminology, cloud certifications, and delivery metrics.",
    hiringFocusAreas: ["Enterprise technology enablement", "DevOps orchestration", "Consulting & workflow planning"],
    focusMode: "Enterprise & Cloud readiness first: Place high-level cloud/devops certifications and complex enterprise workflows at the top. Use strong consultant phrasing."
  },
  Deloitte: {
    name: "Deloitte",
    preferredSkills: ["Cybersecurity", "Risk Management", "Analytics", "Tableau", "SQL", "SAP", "ERP", "Agile", "Business Intelligence"],
    resumeExpectations: "Values technology risk, cyber governance terms, robust database querying, and beautiful business visualization tools (Tableau, PowerBI).",
    typicalKeywords: ["Risk Advisory", "Business Intelligence", "Tableau", "SQL", "ERP", "Cybersecurity", "Auditing", "Analytics", "Agile"],
    desiredProjectDepth: "Business analytics dashboards, threat risk models, security compliance audits, or data visualization pipelines.",
    depthKeywords: ["security", "risk", "analytics", "tableau", "visualization", "dashboard", "compliance", "audit", "sql", "database"],
    atsTendencies: "Highly responsive to analytical terms, cyber threat vocab, compliance frameworks, and business dashboard suites.",
    hiringFocusAreas: ["Data visualization & analytics", "Technology risk advisory", "Enterprise security systems"],
    focusMode: "Analytics & Governance first: Highlight Tableau/SQL analytics or cybersecurity certifications. Position business-oriented projects next."
  },
  Capgemini: {
    name: "Capgemini",
    preferredSkills: ["Java", "React", "Angular", "Cloud Platform", "SQL", "Agile", "DevOps", "Microservices"],
    resumeExpectations: "Looks for multi-framework versatility, solid web developer certifications, agile sprints exposure, and full-stack software capability.",
    typicalKeywords: ["Spring Boot", "React", "Angular", "Microservices", "SQL", "CI/CD", "Agile", "Java", "DevOps"],
    desiredProjectDepth: "Modern client-side interfaces, responsive server backends, database migration pipelines, and microservice stacks.",
    depthKeywords: ["spring boot", "react", "angular", "microservices", "sql", "full stack", "web", "agile", "api", "database"],
    atsTendencies: "Screens for specific framework name-drops and backend design patterns (MVC, microservices).",
    hiringFocusAreas: ["Full-stack application logic", "Agile sprint coordination", "Modern client frameworks"],
    focusMode: "Framework skills & Academics first: Highlight modern frontend and backend frameworks under 'Technical Skills' at the top, accompanied by academic achievements."
  },
  Cognizant: {
    name: "Cognizant",
    preferredSkills: ["Java", "Spring Boot", "TypeScript", ".NET", "Quality Engineering", "AWS", "SQL", "Agile"],
    resumeExpectations: "Seeks foundational software engineering knowledge, testing frameworks, database workflows, and cloud-hosted application builds.",
    typicalKeywords: ["Spring Boot", "SQL Server", "Quality Engineering", ".NET", "Agile", "AWS", "Java", "Web APIs", "Testing"],
    desiredProjectDepth: "API integration backends, backend data layers, automated testing systems, or web platforms.",
    depthKeywords: ["testing", "spring boot", "database", "sql", "api", "web", "net", "backend", "agile", "quality"],
    atsTendencies: "Filters on developer-track terms (GenC, Elevate) and scans for structural clean layout frameworks.",
    hiringFocusAreas: ["Developer foundational knowledge", "Quality engineering & automation", "Cloud application builds"],
    focusMode: "Technical capabilities first: Place programming language skills at the top, followed by structured web backends or API projects."
  }
};

export async function POST(req: Request) {
  try {
    const { companyName, roleName, resumeData } = await req.json();

    if (!companyName || !COMPANY_PROFILES[companyName]) {
      return NextResponse.json(
        { error: `Valid company selection is required. Supported companies: ${Object.keys(COMPANY_PROFILES).join(", ")}` },
        { status: 400 }
      );
    }

    if (!roleName || roleName.trim().length === 0) {
      return NextResponse.json(
        { error: "Target role is required." },
        { status: 400 }
      );
    }

    if (!resumeData || !resumeData.personal) {
      return NextResponse.json(
        { error: "Resume data is required." },
        { status: 400 }
      );
    }

    const profile = COMPANY_PROFILES[companyName];

    // If Gemini client is active, run deep generative API matching
    if (ai) {
      try {
        const prompt = `System Role: You are an elite company-specific recruiter and resume intelligence engine at ${profile.name}.
Task: Analyze the candidate's Resume Data against our target Company Profile expectations for the role of "${roleName}".
Perform a highly critical, realistic, and company-specific evaluation. Do not make up fake candidate experience, placements, GPAs, or degrees. Only provide analysis and guidance.

Company Profile Context:
- Preferred skills: ${profile.preferredSkills.join(", ")}
- Resume expectations: ${profile.resumeExpectations}
- Keywords: ${profile.typicalKeywords.join(", ")}
- Desired project depth: ${profile.desiredProjectDepth}
- ATS tendencies: ${profile.atsTendencies}
- Hiring focus areas: ${profile.hiringFocusAreas.join(", ")}
- Focus Mode sequence recommendation: ${profile.focusMode}

Provide your response in EXACTLY the following JSON format:
{
  "matchScore": number (0 to 100 representing overall company suitability),
  "technicalMatch": number (0 to 100 based on preferred skills matching),
  "experienceMatch": number (0 to 100 based on role requirements & bullet formatting),
  "skillsMatch": number (0 to 100 based on keyword density),
  "projectMatch": number (0 to 100 based on project depth & technologies),
  "gapAnalysis": {
    "expected": ["list of top preferred skills expected at ${profile.name}"],
    "contains": ["list of matching skills currently present in the candidate's resume"],
    "missing": ["list of preferred skills missing in the candidate's resume"]
  },
  "suggestions": [
    "actionable skill to add",
    "specific project area to highlight",
    "technology to emphasize",
    "section to strengthen"
  ],
  "focusMode": "re-ordering guidance explaining exactly how to structure the resume sections",
  "recruiterPerspective": {
    "strengths": ["recruiter observations on what is done well"],
    "weaknesses": ["realistic gap observations"],
    "opportunities": ["actionable tweaks to stand out in the placements filter"]
  }
}
Do not include any markdown wrappers (no \`\`\`json), comments, or commentary. Only return a raw JSON string.

Resume Data:
${JSON.stringify(resumeData)}
`;

        const response = await ai.models.generateContent({
          model: "gemini-1.5-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
          }
        });

        const resultText = response.text?.trim() || "";
        if (resultText) {
          const parsed = JSON.parse(resultText);
          if (parsed && typeof parsed.matchScore === "number") {
            return NextResponse.json(parsed);
          }
        }
      } catch (aiErr) {
        console.error("Gemini API company analysis failed, falling back to heuristic engine:", aiErr);
      }
    }

    // High-Fidelity Local Offline Matching Engine & Gap Audit
    const resumeText = JSON.stringify(resumeData).toLowerCase();
    
    // Extract Skills list for exact matching
    const languages = (resumeData.skills?.languages || []).map((s: string) => s.toLowerCase());
    const frameworks = (resumeData.skills?.frameworks || []).map((s: string) => s.toLowerCase());
    const tools = (resumeData.skills?.tools || []).map((s: string) => s.toLowerCase());
    const certifications = (resumeData.certifications || []).map((s: string) => s.toLowerCase());
    const candidateSkillsAll = [...languages, ...frameworks, ...tools];

    // 1. GAP ANALYSIS
    const expected = [...profile.preferredSkills];
    const contains: string[] = [];
    const missing: string[] = [];

    expected.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      // Check in candidateSkillsAll or within certifications or general resumeText
      const exists = candidateSkillsAll.some((c: string) => c.includes(lowerSkill) || lowerSkill.includes(c)) ||
                     certifications.some((c: string) => c.includes(lowerSkill)) ||
                     resumeText.includes(lowerSkill);
      if (exists) {
        contains.push(skill);
      } else {
        missing.push(skill);
      }
    });

    // 2. MULTI-DIMENSIONAL FIT SCORE
    
    // A. Skills Match: keyword density of typical keywords
    const keywordsFound = profile.typicalKeywords.filter(keyword => {
      return resumeText.includes(keyword.toLowerCase());
    });
    const skillsMatch = Math.round((keywordsFound.length / profile.typicalKeywords.length) * 100);

    // B. Technical Match: percentage of preferred skills found
    const technicalMatch = Math.round((contains.length / expected.length) * 100);

    // C. Project Match: evaluates project descriptions against depth keywords
    let projectMatch = 40; // baseline
    const hasProjects = resumeData.projects && resumeData.projects.length > 0;
    if (hasProjects) {
      projectMatch = 60;
      let depthHits = 0;
      resumeData.projects.forEach((proj: any) => {
        const descriptionLower = (proj.description || "").toLowerCase() + " " + (proj.techStack || "").toLowerCase();
        profile.depthKeywords.forEach(depthKw => {
          if (descriptionLower.includes(depthKw)) {
            depthHits++;
          }
        });
      });
      projectMatch += Math.min(40, depthHits * 10);
    }

    // D. Experience Match: checks experience bullet qualities (action verbs, numbers/metrics)
    let experienceMatch = 40; // baseline
    const hasExperience = resumeData.experience && resumeData.experience.length > 0;
    if (hasExperience) {
      experienceMatch = 65;
      let metricsCount = 0;
      let verbCount = 0;
      
      const ACTION_VERBS = ["orchestrated", "engineered", "spearheaded", "accelerated", "designed", "optimized", "collaborated", "refactored", "migrated", "implemented", "delivered", "slashed", "boosted"];
      
      resumeData.experience.forEach((exp: any) => {
        (exp.bullets || []).forEach((bullet: string) => {
          const lowerBullet = bullet.toLowerCase();
          // Detect metrics (percentages, numbers, milliseconds)
          if (lowerBullet.match(/\d+[%]/) || lowerBullet.match(/\d+\s*(?:ms|second|kb|mb|gb|user|percent|%|rs|₹|\$)/)) {
            metricsCount++;
          }
          // Detect verbs
          ACTION_VERBS.forEach(verb => {
            if (lowerBullet.includes(verb)) {
              verbCount++;
            }
          });
        });
      });

      experienceMatch += Math.min(20, metricsCount * 5);
      experienceMatch += Math.min(15, verbCount * 4);
    }

    // Adjust matches for Service-Integrators (SIs) like TCS, Infosys, Wipro where certifications are highly prized
    const isServiceIntegrator = ["TCS", "Infosys", "Wipro", "Capgemini", "Cognizant"].includes(profile.name);
    if (isServiceIntegrator) {
      const certCount = certifications.length;
      if (certCount >= 2) {
        technicalMatch.toString(); // no-op to bypass types
        experienceMatch = Math.min(100, experienceMatch + 10);
        projectMatch = Math.min(100, projectMatch + 5);
      }
    }

    // E. Overall Match Score (derived average)
    const matchScore = Math.min(99, Math.max(30, Math.round(
      technicalMatch * 0.30 +
      experienceMatch * 0.25 +
      skillsMatch * 0.25 +
      projectMatch * 0.20
    )));

    // 3. RECIPES FOR IMPROVEMENT SUGGESTIONS & PERSPECTIVES
    const suggestions: string[] = [];
    if (missing.length > 0) {
      suggestions.push(`Skills to add: Integrate core missing technologies like ${missing.slice(0, 3).join(", ")} into your profile.`);
    } else {
      suggestions.push("Skills to add: Keep updating your stack with emerging tools in cloud computing and automation.");
    }

    if (isServiceIntegrator) {
      suggestions.push("Projects to highlight: Emphasize relational database structures, SDLC phases, and automated testing implementations.");
      suggestions.push("Technologies to emphasize: Clearly state your certifications (Java, AWS Cloud, or Salesforce) in dedicated sections.");
      suggestions.push("Sections to strengthen: Elevate the 'Education' and 'Certifications' grids to show academic consistency.");
    } else {
      suggestions.push(`Projects to highlight: Showcase highly technical, complex projects featuring ${profile.depthKeywords.slice(0, 3).join(", ")} to demonstrate systems-level depth.`);
      suggestions.push("Technologies to emphasize: Highlight concurrency architectures, distributed systems patterns, and performance metrics (latency, memory optimization).");
      suggestions.push("Sections to strengthen: Detail experience bullets using the Google XYZ structure ('Accomplished X, measured by Y, by doing Z').");
    }

    // 4. RECRUITER PERSPECTIVE LOGS
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const opportunities: string[] = [];

    // Strengths
    if (contains.length > 3) {
      strengths.push(`Good keyword alignment: Found ${contains.slice(0, 3).join(", ")} which matches our core engineering focus.`);
    } else {
      strengths.push("Candidate lists foundational languages that show general program comprehension.");
    }
    if (hasExperience) {
      strengths.push("Has prior professional/internship experience, showing workplace adaptability.");
    }

    // Weaknesses
    if (missing.length > 0) {
      weaknesses.push(`Missing key role stacks: Resume lacks any mention of ${missing.slice(0, 2).join(" or ")} which is heavily queried by our hiring managers.`);
    }
    if (!resumeText.includes("gpa") && !resumeText.includes("cgpa")) {
      weaknesses.push("Missing academic scoring parameters (GPA/CGPA) which are useful benchmark indices.");
    }
    if (isServiceIntegrator && certifications.length === 0) {
      weaknesses.push("Lacks certified technology credentials (e.g. Oracle, AWS, Scrum), which are heavily valued for billing allocations.");
    } else if (!isServiceIntegrator && projectMatch < 65) {
      weaknesses.push("Projects feel generic (CRUD apps) rather than showing low-level systems depth or high scalability concurrency designs.");
    }

    // Opportunities
    opportunities.push("Highlight exact optimization metrics: instead of 'improved speed', state 'slashed memory heap by 22%'.");
    if (isServiceIntegrator) {
      opportunities.push("Ensure your certifications block is fully populated with certifications or bootcamp accomplishments.");
    } else {
      opportunities.push("Add GitHub repository links to projects to invite technical recruiters to look at your clean codebase.");
    }

    return NextResponse.json({
      matchScore,
      technicalMatch: Math.max(30, technicalMatch),
      experienceMatch: Math.max(30, experienceMatch),
      skillsMatch: Math.max(30, skillsMatch),
      projectMatch: Math.max(30, projectMatch),
      gapAnalysis: {
        expected,
        contains,
        missing
      },
      suggestions,
      focusMode: profile.focusMode,
      recruiterPerspective: {
        strengths: strengths.length > 0 ? strengths : ["Acceptable structural formatting"],
        weaknesses: weaknesses.length > 0 ? weaknesses : ["Slightly boilerplate wording"],
        opportunities
      }
    });

  } catch (err: any) {
    console.error("Company analysis API route crashed:", err);
    return NextResponse.json(
      { error: "Internal server error occurred." },
      { status: 500 }
    );
  }
}
