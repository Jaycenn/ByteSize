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
> Automated measurement uses open-source analysers that emit CWE identifiers: Bandit 1.9.4 for Python security and error-handling weaknesses, Flawfinder 2.0.20 for C/C++ buffer and memory weaknesses, Cppcheck 2.21.0 for C++ correctness and code-quality weaknesses, and Radon 6.0.1 for cyclomatic complexity and maintainability index. Findings are aggregated against the four ISO/IEC 5055 measure definitions and normalised as weaknesses per thousand lines of code, over the scope each analyser actually covered. This is not an official ISO/IEC 5055 implementation, not a certification instrument, and not a substitute for a licensed conformant tool. The standard's normative weakness list is licensed; the CWE-to-measure mapping used here is researcher-assigned from the published measure definitions.

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
> Automated detection at commit `048c2fc` covered 7,780 lines of first-party source: 6,620 lines of Python across 22 modules and 1,159 lines in the C++17 accelerator. The analysers returned 79 CWE-bearing findings. A further 11 Cppcheck entries at `information` severity carried no CWE and describe the analyser's own coverage limits rather than properties of the source; these were excluded from the counts rather than triaged.
>
> Fifty-two findings were triaged by source inspection: five Bandit findings at Medium severity or above, nine Flawfinder findings, and 38 Cppcheck findings. Thirty-one were confirmed and 21 identified as false positives. The remaining 27 Bandit findings, all below Medium severity, were not individually triaged.
>
> **Reliability.** Three instances of an unchecked `malloc` return value preceding a `memcpy` were confirmed in the native accelerator (CWE-476). If allocation fails, the subsequent copy writes to a null pointer. Two further allocation sites in the same file perform the check correctly, making this an internal inconsistency rather than a uniform omission. Confirmed density was 0.39 per KLOC over the full 7,780-line scope.
>
> **Security.** Two weaknesses were confirmed. One exported kernel accepts a buffer-length parameter and does not use it before reading four bytes from that buffer (CWE-125); the parameter name is commented out at the declaration, indicating the length was available and deliberately unused. One benchmark utility uses a hardcoded temporary-directory fallback (CWE-377). Confirmed density was 0.26 per KLOC over the full scope.
>
> **Performance Efficiency.** No findings. No analyser in the toolchain emits Performance Efficiency weaknesses, so this reflects absence of measurement rather than a measured absence of weaknesses, and no density is reported.
>
> **Maintainability.** Twenty-six of 38 Cppcheck findings were confirmed, comprising 15 instances of a reference that could be declared const and 11 old-style C casts where a C++ cast would state intent. Eight findings recommending replacement of explicit loops with standard-library algorithms were classified as false positives, on the grounds that explicit iteration in a compression kernel preserves control over early exit and iteration order and does not represent maintainability debt. Confirmed density was 22.4 per KLOC over the 1,159-line C++ scope. This figure is not comparable to the Reliability and Security densities: it is computed over the C++ accelerator alone, because no analyser in the toolchain emits maintainability CWEs for Python.
>
> No finding at high severity survived triage, and no memory-safety defect was confirmed in the C++ accelerator.
>
> **Triage Reclassification**
>
> Triage altered both the count and the measure assignment of findings. All four Bandit findings reporting possible SQL injection (CWE-89) were false positives: three arise from a helper returning one of two hardcoded literal fragments with the user identifier passed as a bound parameter, and the fourth from a count query assembled entirely from constant fragments, the interpolating clause being appended only after that query executes and its column and direction being constrained by a seven-member allowlist and a two-valued coercion respectively.
>
> All nine Flawfinder findings were reported as CWE-120. No confirmed defect was CWE-120. Triage reassigned three findings to CWE-476 and one to CWE-125, moving three of the four from the Security measure to Reliability. Cppcheck likewise reported all 38 CWE-bearing findings as CWE-398, including three uninitialised-member warnings that are properly CWE-457; those three were false positives on inspection, as the structure is constructed only by aggregate initialisation supplying every member. Measure assignment therefore cannot be taken from analyser output and was determined on inspection in every case.
>
> **Complexity and Maintainability Index**
>
> Complexity analysis across 403 blocks returned an average cyclomatic complexity of B (5.93). The maintainability index placed 12 of 14 application modules at grade A. The module `containers.py`, which implements PDF, DOCX, and ZIP container handling, was the sole module at grade C and also contained three functions at complexity grade E; `deflate_tokens.py` was at grade B with one function at grade E. Maintainability debt is therefore concentrated in container-format handling rather than distributed across the codebase.
>
> **Limitations of the Measurement**
>
> Five limitations apply. First, Bandit findings below Medium severity (n=27) were not individually triaged. Second, no analyser in the toolchain emits Performance Efficiency weaknesses, so that measure was not obtained. Third, maintainability weaknesses were measured on the C++ accelerator only, as no analyser in the toolchain emits maintainability CWEs for Python; Python maintainability was assessed through cyclomatic complexity and maintainability index instead, and the two forms of evidence are not combined. Fourth, Semgrep was not run, so the Python and JavaScript layers were covered for Security by Bandit alone. Fifth, the CWE-to-measure mapping is researcher-assigned from the published measure definitions rather than taken from the standard's normative list, which is licensed.

### Summary table for the Results chapter

| Measure | Triaged | Confirmed | Scope | Per KLOC |
|---|---:|---:|---|---:|
| Reliability | 9 | 3 | 7,780 lines | 0.39 |
| Security | 14 | 2 | 7,780 lines | 0.26 |
| Performance Efficiency | 0 | 0 | — | not measured |
| Maintainability | 38 | 26 | 1,159 lines (C++ only) | 22.4 |

Excluded: 11 Cppcheck `information` entries carrying no CWE. Untriaged: 27 Bandit findings below Medium severity.

If you want a raw per-measure column as well, derive it from the retained analyser output:

```powershell
$b = Get-Content reports\bandit.json | ConvertFrom-Json
$b.results | Group-Object {$_.issue_cwe.id} | Select-Object Name, Count | Sort-Object Count -Descending
```

Map each CWE to its measure and add the Flawfinder and Cppcheck totals. Report the raw figure only where you can state which CWEs compose it.

### Note on tense

The wording above says the defects *"were identified."* If they are fixed before submission, change to *"were identified and subsequently remediated at commit `<hash>`,"* and report both densities. A measurement that drove a fix is a stronger result than a clean sheet, because it demonstrates the method did something.

---

## 7. ADD — Appendix

New appendix, placed with the other instrument appendices.

**Appendix — Automated Source-Code Measurement Record**

Contents:

1. Commit hash: `048c2fc`
2. Analyser versions: Bandit 1.9.4, Flawfinder 2.0.20, Cppcheck 2.21.0, Radon 6.0.1, Python 3.13.14
3. Exact commands executed, with scope arguments
4. Scope statement: 22 Python modules (6,620 lines), `afc_native.cpp` (1,159 lines)
5. Full triage table — one row per finding: tool, reported CWE, file, line, tool severity, verdict, confirmed CWE, justification
6. Density table — per measure: raw count, confirmed count, false-positive rate, per-KLOC density
7. Raw analyser output as generated

The triage table is the substantive item. Each justification should be short enough to verify against the cited line in under a minute.

---

## Still outstanding

- **Semgrep has not run.** It is named in the limitations paragraph above. Remove that clause if you run it and add its findings; leave it if you do not.
- **The 27 Bandit Low findings are untriaged.** Either triage them and update the counts, or keep the limitation as written.
- **The four confirmed defects are unfixed.** If you remediate them, change the Results wording from *"were confirmed"* to *"were confirmed and subsequently remediated at commit `<hash>`"*, and report the post-fix density alongside. A measurement that drove a fix demonstrates the method worked; a clean sheet demonstrates nothing.
- **Track B has not started.** The Results chapter also needs the expert-panel section, reported separately from everything above.
