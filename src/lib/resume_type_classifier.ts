export interface ClassificationResult {
  resume_type: string;
  confidence: number;
}

export function classifyResume(text: string): ClassificationResult {
  const cleanText = text.toLowerCase();
  
  const profiles: Record<string, string[]> = {
    "Software Engineering": [
      "software engineer", "software developer", "frontend", "backend", "fullstack", "full stack",
      "javascript", "typescript", "python", "java", "c++", "c#", "golang", "rust", "react", "angular",
      "node.js", "kubernetes", "docker", "git", "github", "aws", "gcp", "azure", "algorithms",
      "data structures", "html", "css", "web development", "databases"
    ],
    "Data Science": [
      "data scientist", "data science", "machine learning", "deep learning", "artificial intelligence",
      "tensorflow", "pytorch", "pandas", "numpy", "scikit-learn", "data analyst", "data analysis",
      "tableau", "power bi", "analytics", "statistics", "statistical", "sql", "spark", "hadoop"
    ],
    "Business Analyst": [
      "business analyst", "business analysis", "tableau", "power bi", "sql", "requirements gathering",
      "user stories", "jira", "process mapping", "wireframes", "system requirements", "business process",
      "use cases", "stakeholder management", "gap analysis", "brd", "frd"
    ],
    "Product Manager": [
      "product manager", "product management", "roadmap", "user research", "agile", "scrum",
      "product launch", "prd", "backlog", "user stories", "wireframing", "competitor analysis",
      "product strategy", "customer feedback", "feature prioritization"
    ],
    "Marketing": [
      "marketing", "campaign", "seo", "sem", "adwords", "google analytics", "social media", "brand",
      "copywriting", "content strategy", "growth marketing", "digital marketing", "ctr", "cpc",
      "customer acquisition", "email marketing", "public relations"
    ],
    "Finance": [
      "finance", "financial", "accounting", "ledger", "audit", "cfa", "cpa", "valuation", "excel",
      "investment", "portfolio", "banking", "corporate finance", "budgeting", "forecasting",
      "taxation", "financial modeling", "profitability"
    ],
    "HR": [
      "hr", "human resources", "recruiting", "talent acquisition", "onboarding", "payroll",
      "employee relations", "hiring", "applicant tracking", "benefits administration", "diversity",
      "talent management", "performance appraisal"
    ]
  };

  let bestType = "General Corporate";
  let maxScore = 0;

  for (const [type, keywords] of Object.entries(profiles)) {
    let score = 0;
    keywords.forEach(kw => {
      // Escape regex chars and check word boundaries
      const escapedKw = kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedKw}\\b`, 'gi');
      const matches = cleanText.match(regex);
      if (matches) {
        score += matches.length;
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestType = type;
    }
  }

  let confidence = 0.5;
  if (maxScore > 0) {
    confidence = Math.min(0.98, 0.6 + (maxScore / 10) * 0.38);
  } else {
    bestType = "General Corporate";
    confidence = 0.5;
  }

  return { resume_type: bestType, confidence };
}
