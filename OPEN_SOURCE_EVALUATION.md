# BOOSTCV Open-Source ATS Components — Evaluation & Selection Report

This document evaluates candidate open-source technologies for improving resume text extraction consistency, structural layout analysis, dictionary-based skill extraction, and Named Entity Recognition (NER).

---

## 1. Resume Parsing Components (PDF/DOCX Extraction)

To improve text extraction consistency, we compare four major parsing engines:

### A. pdfplumber (Python)
* **How it works**: Wraps `pdfminer.six` and provides a higher-level API for inspecting characters, words, lines, and rects, as well as extracting tables.
* **Pros**: Extremely consistent character layout tracking; extracts tables with coordinates; handles line segments and visual text positioning beautifully.
* **Cons**: Python-based dependency.
* **Recommendation**: **Priority 1**. Use for server-side PDF extraction to detect tables, columns, and reading flows.

### B. PDF.js (JavaScript)
* **How it works**: Mozilla's HTML5 PDF reader. Reads PDF streams, rendering or extracting raw character streams.
* **Pros**: Node-native (can run client-side in the browser and server-side). Zero Python runtime dependency.
* **Cons**: Extracted text lines are often in arbitrary sequence for multi-column documents; does not provide native table extraction or layout flow grouping without complex geometric heuristics.
* **Recommendation**: **Priority 2**. Maintain as client-side fallback/pre-extraction and user-dashboard browser component.

### C. Apache Tika Concepts
* **How it works**: Java-based framework that detects and extracts metadata and text from over a thousand different file types.
* **Pros**: Highly standard and enterprise-grade.
* **Cons**: Requires a JVM (Java Runtime Environment) or a standalone Tika server running on localhost, adding significant deployment complexity.
* **Recommendation**: Avoid JVM dependency. Adopt Tika's semantic metadata grouping concepts (e.g. metadata content tagging) but do not run the Tika binary.

### D. Mammoth.js (JavaScript)
* **How it works**: Converts `.docx` documents to clean HTML/Markdown, preserving semantic elements (paragraphs, lists, headings).
* **Pros**: Lightweight, pure JS/TS implementation. Prevents typical DOCX parsing garbage characters.
* **Cons**: Only parses DOCX (no PDF support).
* **Recommendation**: Maintain as the primary parser for Word (.docx) documents.

---

## 2. Layout Analysis Components

Layout analysis must identify columns, headers, tables, images, and text blocks to eliminate false positive formatting warnings.

### A. LayoutParser (Python)
* **How it works**: Deep learning-based document image analysis. Uses object detection models (e.g., Detectron2, YOLO) to segment pages.
* **Pros**: Unmatched accuracy for highly graphical papers/resumes.
* **Cons**: Extremely heavy dependency (requires PyTorch, CUDA, Detectron2, and visual models, leading to >2GB installation sizes). Too heavy for a lightweight ATS scanner.
* **Recommendation**: Evaluate and extract concepts, but avoid native installation to keep local execution fast and light.

### B. PDFMiner Layout Analysis (Python)
* **How it works**: Uses geometric heuristics (`LAParams`) to group characters into text lines (`LTTextLine`) and text lines into rectangular text boxes (`LTTextBox`).
* **Pros**: Native python execution, fast, and does not require neural network runtime weights. Detects multi-column text flows by measuring horizontal character gaps.
* **Cons**: Requires custom configuration of horizontal/vertical threshold variables to avoid false grouping on column boundaries.
* **Recommendation**: **Selected**. Implement a Python-based geometric layout checker using `pdfplumber` and `pdfminer` properties to verify column counts, identify tabular alignments, and detect headers.

### C. Document AI Layout Concepts (Cloud API)
* **How it works**: Cloud-hosted OCR and document structure models.
* **Pros**: Perfect extraction, table structure identification, and forms data extraction.
* **Cons**: Requires active API calls, internet connectivity, credentials, and incurs per-scan pricing.
* **Recommendation**: Avoid as primary local parser; use its concepts of semantic hierarchy parsing.

---

## 3. Skill Extraction (Taxonomies vs Keyword Matching)

Standardize skill extraction using structured dictionaries instead of naive keyword substring checks.

### A. spaCy Matcher & NLP Rules (Python)
* **How it works**: Uses tokenization and phrase matching on raw text.
* **Pros**: Token-aware matching prevents substring collisions (e.g., matching "Java" but ignoring "JavaScript").
* **Cons**: Requires downloading spaCy pipeline models.
* **Recommendation**: **Selected**. Use spaCy’s rule-based NLP matcher loaded with standardized skill taxonomy dictionaries.

### B. ESCO Skills Taxonomy
* **How it works**: The European Skills, Competences, Qualifications, and Occupations classification database. Contains over 13,000 distinct skills.
* **Pros**: Comprehensive, standardized dictionary for technical, soft, and specialized skills.
* **Cons**: Extremely large database.
* **Recommendation**: **Selected**. Compile a curated subset of the ESCO Skills Taxonomy (focusing on corporate, engineering, finance, data, and management domains) to load into our rule-based skill dictionary.

### C. O*NET Skills Taxonomy
* **How it works**: US Occupational Information Network listing standard job task lists, work styles, and tech skills.
* **Pros**: Highly aligned with US job descriptions.
* **Recommendation**: Integrate O*NET's tech skills list with the ESCO taxonomy.

---

## 4. Named Entity Recognition (NER)

Identify critical entities (Companies, Job Titles, Universities, Certifications, Technologies) to support warning generation and calibration.

### A. spaCy NER Pipeline
* **How it works**: Core spaCy models label text spans using pretrained transformer/CNN models (e.g. `ORG` for company/university, `PERSON` for candidate, `PRODUCT` for tech).
* **Pros**: Zero-shot detection of novel organization and institution names.
* **Cons**: Can misclassify complex technical terms or formatting lines.
* **Recommendation**: **Selected**. Run the standard spaCy model (`en_core_web_sm`) to isolate institutions (`ORG`), people (`PERSON`), and certifications/technologies (using entity labels combined with custom regex pattern matchers).

---

## 5. Integration Architecture

To keep the system robust and local:
1. **Python Integration Hook**: Create a Python micro-utility `src/lib/ats_parser.py`.
2. **Next.js Integration**: The Next.js parser route `/api/ats/check` will spawn the python script via `child_process.spawn`.
3. **Dual Fallback Strategy**:
   * If Python (with `pdfplumber` and `spacy`) is fully set up, the script runs layout analysis, entity recognition, and dictionary-based skill extraction.
   * If Python is missing or lacks required modules, the system seamlessly falls back to the native TypeScript parser, ensuring 100% uptime.
