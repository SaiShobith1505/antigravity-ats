# Capital One Resume Calibration & Validation Report

This validation report verifies the calibration of the TS-first ATS scoring engine against the Capital One Business Analyst candidate profile.

## 1. Summary Metrics
* **Final Score:** 92%
* **Parser Confidence Index:** 95%
* **Classified Industry Type:** Business Analyst (Confidence: 98%)

## 2. Detected Resume Elements

### Detected Sections
* `Education`
* `Professional Experience`
* `Skills`
* `Professional Summary`

### Detected Skills
* `Business Analysis`
* `SQL`
* `Tableau`
* `Power BI`
* `Jira`
* `Agile`
* `Scrum`
* `Requirements Elicitation`
* `Process Mapping`
* `Wireframing`

### Detected Entities
* **Candidate Name:** `Amit Sharma`
* **Email:** `amit.sharma@gmail.com`
* **Phone:** `(832) 787-2174`
* **LinkedIn:** `linkedin.com/in/amitsharma`
* **Target Company:** `Capital One`
* **University:** `Delhi Technological University (DTU)`

## 3. Formatting & Parsing Warnings
* **Warning Type:** `chronological_flow` | **Evidence:** `Chronological flow index mismatch: [487, 158, -1, 1024].` | **Confidence:** `1` | **Page:** `1`
* **Warning Type:** `unquantified_bullet` | **Evidence:** `Bullet lacks numeric metrics: "experience in financial systems and requ..."` | **Confidence:** `0.9` | **Page:** `1`

## 4. Score Explanations (Explanation System)

### Positive Factors
* ✅ Education section detected
* ✅ Experience section detected
* ✅ Skills section detected
* ✅ Professional summary detected at the top
* ✅ Email address detected for follow-up contact
* ✅ LinkedIn profile link provided for verification
* ✅ Clean single-column standard parser-friendly formatting
* ✅ Strong action-oriented vocabulary used for accomplishments
* ✅ High density of target role keywords and skills match

### Negative Factors
* ❌ Limited quantified achievements (few numeric metrics or percentages)
