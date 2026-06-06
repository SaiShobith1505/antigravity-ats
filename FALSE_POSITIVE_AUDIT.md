# FALSE POSITIVE AUDIT

This audit records the performance of the BOOSTCV scoring engine against five distinct resume profiles to verify the elimination of false formatting, table, and Canva warnings.

---

## Audit Logs

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

## Summary of Results

| Metric | Target | Actual | Status |
| :--- | :---: | :---: | :---: |
| **False Canva Warnings** | `0` | `0` | **PASS** |
| **False Table Warnings** | `0` | `0` | **PASS** |
| **False Multi-column Warnings** | `0` | `0` | **PASS** |
| **Score Delta Variance** | $\le 3$ | `0` | **PASS** |
| **Category Delta Variance** | $\le 5$ | `0` | **PASS** |
