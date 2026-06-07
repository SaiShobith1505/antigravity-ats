import { ScoringResult } from "./scoring-engine";

export interface ScoreExplanation {
  positives: string[];
  negatives: string[];
}

export function explainScore(result: ScoringResult, text: string): ScoreExplanation {
  const positives: string[] = [];
  const negatives: string[] = [];
  const lowerText = text.toLowerCase();

  // --- SECTION IDENTIFICATION ---
  const hasEducation = lowerText.includes("education") || lowerText.includes("college") || lowerText.includes("university") || lowerText.includes("academic");
  const hasExperience = lowerText.includes("experience") || lowerText.includes("work") || lowerText.includes("employment") || lowerText.includes("history");
  const hasSkills = lowerText.includes("skills") || lowerText.includes("technologies") || lowerText.includes("tools");
  const hasProjects = lowerText.includes("projects") || lowerText.includes("project");
  const hasCertifications = lowerText.includes("certifications") || lowerText.includes("certification") || lowerText.includes("awards") || lowerText.includes("accomplishments");
  const hasSummary = lowerText.includes("summary") || lowerText.includes("profile") || lowerText.includes("about me") || lowerText.includes("objective") || lowerText.includes("professional summary") || lowerText.includes("professional profile");

  // Positives for Sections
  if (hasEducation) positives.push("Education section detected");
  else negatives.push("Missing Education section");

  if (hasExperience) positives.push("Experience section detected");
  else negatives.push("Missing Experience section");

  if (hasSkills) positives.push("Skills section detected");
  else negatives.push("Missing Skills section");

  if (hasProjects) positives.push("Projects section detected");
  // Projects section is only negative in student mode or if it's explicitly required, but we can list it if missing
  else if (result.resumeType === "Software Engineering" || result.resumeType === "Data Science") {
    negatives.push("Missing Projects section (highly recommended for technical profiles)");
  }

  if (hasCertifications) positives.push("Certifications section detected");

  // Summary check
  if (hasSummary || (result.breakdown.readability >= 40 && !result.verifiedWarnings.some(w => w.warning_type === "missing_section" && w.triggering_pattern === "missing_summary"))) {
    positives.push("Professional summary detected at the top");
  } else {
    negatives.push("Missing professional summary");
  }

  // --- CONTACT INFO ---
  const hasEmail = lowerText.includes("@");
  const hasLinkedIn = lowerText.includes("linkedin");
  const hasGitHub = lowerText.includes("github") || lowerText.includes("git");

  if (hasEmail) positives.push("Email address detected for follow-up contact");
  else negatives.push("Missing email address format");

  if (hasLinkedIn) positives.push("LinkedIn profile link provided for verification");
  else negatives.push("Missing LinkedIn profile URL");

  if (hasGitHub && (result.resumeType === "Software Engineering" || result.resumeType === "Data Science")) {
    positives.push("GitHub repository link provided for project proof-of-work");
  }

  // --- FORMATTING & LAYOUT ---
  const hasCanva = result.verifiedWarnings.some(w => w.warning_type === "grid_layout");
  const hasTable = result.verifiedWarnings.some(w => w.warning_type === "hidden_table");
  const hasImage = result.verifiedWarnings.some(w => w.warning_type === "profile_image");
  const hasGraphics = result.verifiedWarnings.some(w => w.warning_type === "graphics_star");

  if (!hasCanva && !hasTable && !hasImage && !hasGraphics) {
    positives.push("Clean single-column standard parser-friendly formatting");
  }

  if (hasCanva) negatives.push("Complex multi-column grids or visual separators detected");
  if (hasTable) negatives.push("Potential hidden tables or grid charts detected");
  if (hasImage) negatives.push("Embedded profile picture or avatar placeholder detected");
  if (hasGraphics) negatives.push("Excessive graphics, ratings, or emojis detected inside content fields");

  // --- ACHIEVEMENTS & BULLETS ---
  const hasWeakVerbs = result.verifiedWarnings.some(w => w.warning_type === "weak_verbs");
  const hasUnquantified = result.verifiedWarnings.some(w => w.warning_type === "unquantified_bullet");
  const hasLinksWarning = result.verifiedWarnings.some(w => w.warning_type === "missing_links");

  if (!hasWeakVerbs && hasExperience) {
    positives.push("Strong action-oriented vocabulary used for accomplishments");
  } else if (hasExperience) {
    negatives.push("Lacks strong action verbs starting bullet points");
  }

  if (!hasUnquantified && hasExperience) {
    positives.push("Quantified achievements provided with placements or metrics");
  } else if (hasExperience) {
    negatives.push("Limited quantified achievements (few numeric metrics or percentages)");
  }

  if (!hasLinksWarning && hasProjects) {
    positives.push("Projects are backed by active repository or deployment links");
  } else if (hasProjects) {
    negatives.push("Projects lack verifiable proof-of-work URL links");
  }

  // --- KEYWORDS ---
  if (result.breakdown.keywords >= 75) {
    positives.push("High density of target role keywords and skills match");
  } else if (result.breakdown.keywords < 50) {
    negatives.push("Low density of keywords matching standard job description taxonomy");
  }

  return { positives, negatives };
}
