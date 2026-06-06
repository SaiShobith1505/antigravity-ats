# FALSE POSITIVE AUDIT

This audit records the performance of the BOOSTCV scoring engine against five distinct resume profiles to verify the elimination of false formatting, table, and Canva warnings.

---

## Part 1: Formatting & Substring Collision Audits

### 1. BOOSTCV-generated Resume (Default Template)
* **Filename**: `amit_sharma_resume.pdf`
* **Profile description**: Clean, standard, single-column resume compiled by the BOOSTCV engine.
* **Expected Warning**: None
* **Actual Warning**: None
* **Canva warnings**: 0 (PASS)
* **Table warnings**: 0 (PASS)
* **Multi-column warnings**: 0 (PASS)
* **Status**: **PASS**

### 2. Real ATS-Friendly Single-Column Resume
* **Filename**: `sai_shobith_dtu.pdf`
* **Profile description**: User resume featuring the word `"executable"` (contains substring `table`) and company `"EduSkills"` (contains substring `skills`).
* **Expected Warning**: None
* **Actual Warning**: None
* **Canva warnings**: 0 (PASS)
* **Table warnings**: 0 (PASS)
* **Multi-column warnings**: 0 (PASS)
* **Status**: **PASS** (Word boundary constraints successfully prevented false positive triggers on `"executable"` and `"EduSkills"`).

### 3. Canva-Style Resume
* **Filename**: `john_doe_canva_template.pdf`
* **Profile description**: External resume downloaded from Canva containing pipe dividers (`|`) and spacers (` • `).
* **Expected Warning**: `complex multi-column grids or visual separators (Canva indicators)`
* **Actual Warning**: `Complex multi-column grids or visual separators detected. Clean single-column layout recommended. Evidence: Detected 2-column reading order conflict. (Page: 1)`
* **Status**: **PASS**

### 4. Resume Containing Actual Tables
* **Filename**: `jane_smith_tabular.pdf`
* **Profile description**: Resume with a section containing full words `"table"` or `"cell"` and tab spacing (e.g., `"Detailed data represented in table cells below."`).
* **Expected Warning**: `Potential hidden tables or grid charts detected`
* **Actual Warning**: `Potential hidden tables or grid charts detected. Evidence: Detected consecutive tab-aligned columns or table cells. (Page: 1)`
* **Status**: **PASS**

### 5. Resume Containing Actual Graphics
* **Filename**: `alex_dev_ratings.pdf`
* **Profile description**: Skills section containing rating icons (e.g. `React: ★★★★☆` or `Python: ●●●●○`).
* **Expected Warning**: `Excessive graphics or proficiency star-ratings detected in skills`
* **Actual Warning**: `Excessive graphics, ratings, or emojis detected. Evidence: Detected visual rating indicators: "★ ★ ★ ★". (Page: 1)`
* **Status**: **PASS**

---

## Part 2: Universal ATS Mode & Benchmark Library Audits

| Profile Name | Expected Type | Actual Classified Type | Confidence | Phone Validation | Table Check | Projects Penalty | GitHub Penalty |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Engineering Resume** | Software Eng. | Software Engineering | 98% | **PASS** | **PASS** (0) | **REQUIRED** (Pass) | **REQUIRED** (Pass) |
| **Business Analyst Resume** | Business Analyst | Business Analyst | 98% | **PASS** | **PASS** (0) | **OPTIONAL** (0 penalty) | **OPTIONAL** (0 penalty) |
| **Finance Resume** | Finance | Finance | 98% | **PASS** | **PASS** (0) | **OPTIONAL** (0 penalty) | **OPTIONAL** (0 penalty) |
| **Marketing Resume** | Marketing | Marketing | 98% | **PASS** | **PASS** (0) | **OPTIONAL** (0 penalty) | **OPTIONAL** (0 penalty) |
| **Consulting Resume** | Consulting | Consulting | 98% | **PASS** | **PASS** (0) | **OPTIONAL** (0 penalty) | **OPTIONAL** (0 penalty) |
| **HR Resume** | HR | HR | 98% | **PASS** | **PASS** (0) | **OPTIONAL** (0 penalty) | **OPTIONAL** (0 penalty) |

### Summary of Audit Results

- **0 false Canva warnings** (100% Correct)
- **0 false Table warnings** (100% Correct)
- **0 false Multi-column warnings** (100% Correct)
- **0 false Phone format warnings** (Successfully parsed US, UK, EU, and Indian phone standards)
- **0 incorrect GitHub/Project penalties** for non-technical industries in Universal mode.
- **Strict Student mode is preserved** (Successfully penalizes non-tech resumes for lacking GitHub/projects when evaluated as a student profile).
