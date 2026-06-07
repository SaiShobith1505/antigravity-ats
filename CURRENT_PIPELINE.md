# BOOSTCV ATS Scoring Engine — Current Pipeline Audit

This document audits the current state of the BOOSTCV ATS parsing, validation, scoring, and warning pipeline as of Phase 1.

---

## 1. Document Extraction Methods

BOOSTCV supports text extraction from both **PDF** and **Word (DOCX)** formats, with separate implementations for client-side (local browser) and server-side (API) parsing:

### A. PDF Extraction
* **Server-Side API (`/api/ats/check/route.ts`)**:
  * Uses the `pdfreader` package's `PdfReader` class.
  * Parses buffers page-by-page.
  * Captures page boundaries dynamically: when `item.page` is defined, it appends a structural page marker: `\n[PAGE <currentPage>]\n`.
  * Joins text items together with space: `item.text + " "`.
* **Client-Side Interface (`/dashboard/page.tsx` via `extractTextFromPdf`)**:
  * Loads PDF.js from a CDN: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js`.
  * Instantiates the worker: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`.
  * Reads the array buffer and extracts text content page-by-page.
  * Joins the page content items by space: `content.items.map(item => item.str).join(" ")`.
  * **Limitation**: Client-side text extraction does not write `[PAGE <num>]` tokens, leading to page-number mapping discrepancies between client and server scoring.

### B. DOCX Extraction
* **Server-Side API**:
  * Uses `mammoth` (npm library).
  * Runs `mammoth.extractRawText({ buffer })` to retrieve a flat string representation of the word document.
* **Client-Side Interface**:
  * Loads Mammoth.js from a CDN: `https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js`.
  * Runs `(window.mammoth).extractRawText({ arrayBuffer })`.

---

## 2. Text Parsing & Section Detection Logic

Parsing is handled under `/api/resume/parse/route.ts`. If the `GEMINI_API_KEY` is present, it uses Gemini to populate the structured JSON. If the API is missing or fails, it falls back to a high-fidelity local heuristic parser:

### A. Section Detection Heuristics
Sections are located by finding the earliest indices of specific pattern groups, sorting by appearance index, and slicing the string:
* **Education**: `/education/i`, `/academic/i`, `/study/i`
* **Experience**: `/experience/i`, `/work/i`, `/employment/i`, `/professional history/i`, `/internship/i`
* **Projects**: `/projects/i`, `/technical projects/i`, `/personal projects/i`
* **Skills**: `/skills/i`, `/technical skills/i`, `/technologies/i`, `/languages & technologies/i`
* **Certifications**: `/certifications/i`, `/licenses/i`, `/certificates/i`, `/credentials/i`

### B. Heuristic Field Extraction
* **Full Name**: Scans the first 3 lines of text. Checks if it matches capital name boundaries: `/^[A-Z][a-zA-Z]+\s+[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)?$/` and verifies it doesn't contain terms like `resume`, `cv`, `contact`, `phone`, etc.
* **Email**: Regular expression `/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/`.
* **Phone Number**: Uses custom validation function checking digit count (7 to 15 numbers) while filtering out date sequences.
* **LinkedIn/GitHub URLs**: Matching patterns `(?:linkedin\.com\/in\/|linkedin\.com\/)[a-zA-Z0-9\-]+/i` and `(?:github\.com\/)[a-zA-Z0-9\-]+/i`.

---

## 3. Heuristic Rules & Scoring Metrics

The engine grades resumes out of 100 points, broken down into six heavily regulated categories:

| Category | Weight | Logic & Penalties |
| :--- | :---: | :--- |
| **Structure** | 20% | checks for presence of required headings. In Student Mode, all five headings (Education, Experience, Projects, Skills, Certifications) are mandatory (20 pts each). In Universal mode, the required headings list is loaded dynamically per profile. |
| **Formatting** | 20% | Starts at 100%. Deducts for standard parsing hazards:<br>- `complex multi-column grid/Canva` (-20 pts)<br>- `hidden tables` (-15 pts)<br>- `profile images` (-15 pts)<br>- `skills star-ratings/rating symbols` (-15 pts)<br>- `emojis` (-15 pts) |
| **Readability** | 15% | Grades contact information completeness (Email, Phone, LinkedIn, GitHub - 15 pts each) and checks if the section headings flow chronologically (Header -> Summary -> Education -> Experience -> Projects -> Skills) (+20 pts). |
| **Keywords** | 15% | Matches the top 15 terms in a job description (or fallback profile keywords) against the resume text. Uses `SYNONYM_MAP` to handle variations (e.g. `JS` for `JavaScript`). Deducts 5 pts per overused buzzword (repeated > 2 times). |
| **Projects** | 15% | Scores based on project count (3+ projects = 100 pts, 2 = 85 pts, 1 = 65 pts). Awards +10 pts bonus for clickable project links and +10 pts for description depth (> 5 sentences). |
| **Achievements** | 15% | Evaluates experience bullet points:<br>- Verbs: checks for action verbs (+30 pts for 4+ verbs, +15 for 2+ verbs).<br>- Quantification: checks if achievements contain numeric metrics or percentages (+40 pts for $\ge 35\%$, +20 for $\ge 15\%$).<br>- Length: rewards bullet points in the "sweet spot" of 40-150 characters (+30 pts if $\ge 50\%$ bullets are in sweet spot). |

* **Overall Score Calibration**:
  $$\text{Score} = (\text{Structure} \times 0.20) + (\text{Formatting} \times 0.20) + (\text{Readability} \times 0.15) + (\text{Keywords} \times 0.15) + (\text{Projects} \times 0.15) + (\text{Achievements} \times 0.15)$$
  * Overall score is capped between $35\%$ and $99\%$.
  * If the Gemini model runs, its semantic breakdown scores are strictly calibrated to be within $\pm 5$ points of the local heuristic scores, preserving the local calculations as the absolute source of truth.

---

## 4. Warnings & Evidence Logging

Every rule that fails structural or layout constraints logs a `VerifiedWarning` block containing:
* `warning_type` (e.g., `missing_section`, `grid_layout`, `hidden_table`, `profile_image`, `graphics_star`, `unquantified_bullet`, `excessive_buzzwords`, `chronological_flow`, `missing_links`, `weak_verbs`)
* `confidence` (confidence decimal between 0.85 and 1.0)
* `evidence` (the specific match or string trigger)
* `affected_section` (personal, education, experience, etc.)
* `triggering_pattern` (regex or substring matched)
* `source_page` (computed page index using `[PAGE \d+]` boundaries)

---

## 5. Pipeline Vulnerabilities & Refinements

Based on the audit, here are the identified system limitations:

### A. False Positives
* **Hidden Tables**: Prior to boundary corrections, substring collisions on words like `"executable"` or `"comfortable"` would trigger warnings for tables (`/\btables?\b/` matches `comfortable`).
* **Multi-column Layouts**: Simple indentation, tab-spaced blocks, or contact details side-by-side might trigger a multi-column warning.
* **Phone Numbers**: Dates like `2022-2026` or date ranges in experience sections could be captured as telephone patterns without digit length and context rules.

### B. False Negatives
* **Unstructured text**: Plain-text extractors fail to preserve structural columns. Standard scanners read column 1 and column 2 side-by-side, resulting in scrambled text segments that the heuristic section-splitter fails to isolate.
* **Keyword Matching**: Naive keyword search matching (checking if `lowerText.includes(keyword)`) does not verify if the keyword exists as a separate word, triggering false matches (e.g., `"java"` inside `"javascript"`).

### C. Hardcoded Assumptions
* **Buzzwords and Action Verbs**: Static lists that do not adapt to modern industry standards.
* **Strict Section Header Names**: Failing to recognize standard synonyms for headers.

### D. Student-Specific Assumptions
* In **Student Mode**, projects and GitHub links are strictly mandatory, which causes false scoring penalties when applied to non-technical, experienced, or corporate applicants.
