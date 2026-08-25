# ISO/IEC 5055 — Text for the Manuscript

Measurement run at commit `048c2fc`. Six insertion points below.
Items marked **CHANGE** replace existing text. Items marked **ADD** are new.

---

## 1. CHANGE — Objectives of the Study

### EXISTING

> To test the developed system's source code using the ISO/IEC 5055 software quality standard, as assessed by the panel of algorithm experts, in order to verify the reliability, security, performance efficiency, and maintainability of the underlying implementation.

### REPLACEMENT

> To measure the developed system's source code against the Reliability, Security, Performance Efficiency, and Maintainability characteristics of ISO/IEC 5055 using automated static analysis, and to corroborate those measurements through structured expert review by a panel of algorithm experts.

### WHY

The existing sentence contradicts the paper's own Data Analysis section. Phase 3 states that *"ISO/IEC 5055 automated source-code measures are reported separately from human judgment"* and that expert *"Likert responses are not presented as ISO/IEC 5055 measurements."* The objective says the opposite — that the standard is applied *"as assessed by the panel."*

Beyond the internal inconsistency, the objective misdescribes the standard. ISO/IEC 5055 measures quality by detecting and counting CWE-registered weaknesses, with detection patterns written to drive automated tools. A panel rating cannot produce a 5055 measure. The replacement puts the objective in line with Phase 3 and with the standard.

---

## 2. CHANGE — Method → Instruments → Technical Evaluation Framework

### EXISTING (first sentence of the paragraph)

> The technical evaluation uses a researcher-developed questionnaire aligned with the Reliability, Security, Performance Efficiency, and Maintainability characteristics relevant to ISO/IEC 5055.

### REPLACEMENT

> The technical evaluation has two components. ISO/IEC 5055-aligned measurement is performed by automated static analysis, and expert judgment is captured through a researcher-developed questionnaire aligned with the same four characteristics. The two are reported separately and are never combined.
>
> Automated measurement uses open-source analysers that emit CWE identifiers: Bandit 1.9.4 for Python security and error-handling weaknesses, Flawfinder 2.0.20 for C/C++ buffer and memory weaknesses, Cppcheck 2.13 for C++ correctness and code-quality weaknesses, and Radon 6.0.1 for cyclomatic complexity and maintainability index. Findings are aggregated against the four ISO/IEC 5055 measure definitions and normalised as weaknesses per thousand lines of code. This is not an official ISO/IEC 5055 implementation, not a certification instrument, and not a substitute for a licensed conformant tool. The standard's normative weakness list is licensed; the CWE-to-measure mapping used here is researcher-assigned from the published measure definitions.

Keep the rest of the existing paragraph unchanged — it already describes the questionnaire correctly.

### WHY

The section currently names no measurement method, so the objective's promise of ISO/IEC 5055 measurement has no instrument behind it. Naming the analysers and their versions makes the measurement reproducible, and stating the limits up front prevents the work being read as a certification claim.

---

## 3. ADD — Method → Data Collection

Insert as a new paragraph before the sentence beginning *"Human evaluation will begin only after..."*

> Automated source-code measurement was performed at commit `048c2fc` against first-party source only: 22 Python modules totalling 6,620 lines and the C++17 accelerator totalling 1,159 lines, for a combined 7,780 lines. Third-party dependencies, virtual-environment packages, test fixtures, and benchmark corpora were excluded, as ISO/IEC 5055 measures the implementation under study rather than the libraries it consumes. Raw analyser output was retained for every run. Because static analysers over-report, each finding was triaged by source inspection and classified as a true or false positive with a written justification; only confirmed findings contribute to a reported measure. Findings were assigned the CWE confirmed on inspection rather than the identifier proposed by the tool, since triage can move a finding between measures.

### WHY

Scope control is part of the measurement. During this study an initial run that did not exclude the virtual environment reported 389,738 lines and 25 high-severity findings, none of which were in first-party code. Stating the scope boundary and the exclusion rationale is what makes the reported density meaningful.

---

## 4. CHANGE — Method → Data Analysis → Phase 3

### EXISTING

> Phase 3 - Source-Code and Expert Review: ISO/IEC 5055 automated source-code measures are reported separately from human judgment. Experts audit the Bit Cost Decision Engine, lossless invariants, implementation clarity, and reproducibility using a dedicated review instrument; their Likert responses are not presented as ISO/IEC 5055 measurements.

### REPLACEMENT

> Phase 3 - Source-Code and Expert Review: ISO/IEC 5055 automated source-code measures are reported separately from human judgment. Automated findings are aggregated per measure and reported as three figures: the raw count returned by the analysers, the count confirmed on triage, and the resulting false-positive rate. Confirmed counts are normalised as weaknesses per thousand lines of code so the four measures are comparable. A measure returning no findings is reported as such only where an analyser covering that measure was actually run; otherwise the absence is reported as a coverage limitation rather than as a result. Experts audit the Bit Cost Decision Engine, lossless invariants, implementation clarity, and reproducibility using a dedicated review instrument; their Likert responses are not presented as ISO/IEC 5055 measurements. Expert triage of automated findings, however, does contribute to the reported measures, since the classification of a finding as a true or false positive is a judgment the analysers cannot make.

### WHY

The existing sentence establishes the correct separation but does not say how the automated measures are produced or reported. The addition specifies the three-figure reporting format, the normalisation, and the distinction between a measured zero and an unmeasured characteristic. The final sentence resolves an ambiguity the original leaves open: expert judgment is excluded from the Likert scores but is required for triage.

---

## 5. ADD — Method → Research Procedure

Insert as a new step immediately after *"Controlled Execution and Automated Testing."*

> Automated Source-Code Measurement. The source tree is pinned at a fixed commit and scanned with the CWE-emitting analysers named in Instruments. Raw output is retained for reproducibility. Every finding is triaged by source inspection against the surrounding control flow, recorded with a verdict and a written justification, and assigned the CWE confirmed on inspection. Only confirmed findings enter the reported measures.

### WHY

Research Procedure lists every other execution step in the study. Automated measurement is a distinct procedural step with its own inputs and outputs and belongs in the same sequence.

---

## 6. ADD — Results (Chapter 4, when written)

The current manuscript ends at Ethical Consideration and has no Results chapter. The text below is for that chapter once it exists.

> **Automated Source-Code Measurement**
>
> Automated detection at commit `048c2fc` returned 41 raw findings across 7,780 lines of first-party source. Fourteen findings were triaged in full: of five Bandit findings at Medium severity or above, four were false positives; of nine Flawfinder findings, five were false positives. Four defects were confirmed.
>
> Three instances of an unchecked `malloc` return value preceding a `memcpy` (CWE-476) were identified in the native accelerator, contributing to the Reliability measure. One exported kernel accepts a buffer-length parameter and does not use it before reading from that buffer (CWE-125), contributing to Security. One benchmark utility uses a hardcoded temporary-directory fallback (CWE-377), also contributing to Security.
>
> Confirmed weakness density was 0.39 per KLOC for Reliability and 0.26 per KLOC for Security. No high-severity finding survived triage.
>
> The four Bandit findings reporting possible SQL injection (CWE-89) were all false positives. Three arise from a helper returning one of two hardcoded literal fragments, with the user identifier passed as a bound parameter. The fourth arises from a count query assembled entirely from constant fragments; the clause containing string interpolation is appended after that query executes, and the interpolated column and direction are constrained by a seven-member allowlist and a two-valued coercion respectively.
>
> Of the nine Flawfinder findings, all were reported as CWE-120. None of the confirmed defects was CWE-120. Triage reassigned three findings to CWE-476 and one to CWE-125, moving three of the four from the Security measure to Reliability.
>
> **Complexity and Maintainability Index**
>
> Complexity analysis across 403 blocks returned an average cyclomatic complexity of B (5.93). The maintainability index placed 12 of 14 application modules at grade A. The module `containers.py`, which implements PDF, DOCX, and ZIP container handling, was the sole module at grade C and also contained three functions at complexity grade E; `deflate_tokens.py` was at grade B with one function at grade E. Maintainability debt is therefore concentrated in container-format handling rather than distributed across the codebase.
>
> **Limitations of the Measurement**
>
> Three limitations apply. Bandit findings below Medium severity (n=27) were not individually triaged. No analyser in the toolchain emits Performance Efficiency weaknesses, so that measure returned no findings; this reflects toolchain coverage rather than a measured absence of weaknesses. The CWE-to-measure mapping is researcher-assigned from the published measure definitions rather than taken from the standard's normative list, which is licensed.

### Note on tense

The wording above says the defects *"were identified."* If they are fixed before submission, change to *"were identified and subsequently remediated at commit `<hash>`,"* and report both densities. A measurement that drove a fix is a stronger result than a clean sheet, because it demonstrates the method did something.

---

## 7. ADD — Appendix

New appendix, placed with the other instrument appendices.

**Appendix — Automated Source-Code Measurement Record**

Contents:

1. Commit hash: `048c2fc`
2. Analyser versions: Bandit 1.9.4, Flawfinder 2.0.20, Radon 6.0.1, Cppcheck 2.13, Python 3.13.14
3. Exact commands executed, with scope arguments
4. Scope statement: 22 Python modules (6,620 lines), `afc_native.cpp` (1,159 lines)
5. Full triage table — one row per finding: tool, reported CWE, file, line, tool severity, verdict, confirmed CWE, justification
6. Density table — per measure: raw count, confirmed count, false-positive rate, per-KLOC density
7. Raw analyser output as generated

The triage table is the substantive item. Each justification should be short enough to verify against the cited line in under a minute.

---

## Still outstanding

- Cppcheck has not yet run, so **Maintainability has no weakness count**. Section 6 above reports complexity and maintainability index only. Run it and add the count before submission.
- Semgrep has not run. If it stays unrun, add it to the limitations paragraph by name.
- The 27 Bandit Low findings are untriaged. Either triage them or keep the limitation as written.
