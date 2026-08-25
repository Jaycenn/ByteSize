# Appendix B — Technical Evaluation Instrument (ISO/IEC 5055-Aligned)

**Study:** Adaptive File Compression System Using Multi-Level Frequency Analysis & Hybrid Huffman ("ByteSize")
**Institution:** School of Computing, Holy Angel University
**Respondents:** Algorithm experts (3–5) and computer science students (10–15)
**Administration:** Google Forms, after review of source code, documentation, test evidence, and demonstrated behaviour

> **This is not a certification instrument.** It is researcher-developed and aligned with ISO/IEC 5055 characteristics. It is not an official ISO/IEC 5055 questionnaire, not a certification instrument, and not a substitute for automated source-code measurement.

---

## ⚠ Response scale — opposite direction to Appendix A

| 1 | 2 | 3 | 4 | 5 | 6 | 7 | N/A |
|---|---|---|---|---|---|---|-----|
| Strongly Disagree | Disagree | Somewhat Disagree | Neutral | Somewhat Agree | Agree | Strongly Agree | Not Applicable **or Insufficient Evidence** |

**A higher score denotes a more favourable technical evaluation.**

This runs opposite to the end-user instrument in Appendix A, where a *lower* score is better. The two instruments are scored separately and **must never be pooled**.

`N/A` carries a second meaning here — *insufficient evidence to judge* — and evaluators are told to use it rather than guess.

---

## Constructs

| Construct | Code | Items | Basis |
|---|---|---|---|
| Reliability | `REL` | 7 | ISO/IEC 5055-aligned |
| Security | `SEC` | 7 | ISO/IEC 5055-aligned |
| Performance Efficiency | `PE` | 7 | ISO/IEC 5055-aligned |
| Algorithm Transparency and Technical Correctness | `ALG` | 11 | **ByteSize-specific — not combined with the four** |
| Maintainability | `MNT` | 9 | ISO/IEC 5055-aligned |

Items are prefixed by construct rather than numbered continuously, because respondents take different paths through the form and continuous numbering would show gaps.

---

## Respondent routing

The manuscript restricts student judgment to maintainability evidence and declines to generalise it further, so the form branches on evaluator role:

| Role | Sections answered |
|---|---|
| **Algorithm expert** | REL → SEC → PE → ALG → MNT → open-ended |
| **CS student** | MNT → open-ended |

This is why **Maintainability is ordered last** among the rating constructs. Google Forms branching is per-section, not per-respondent, so once the student path rejoins the flow it must land on the only section they answer.

---

## Respondent identification

Collected as explicit fields **after** the privacy notice, not via Google's auto-capture:

- Full name *(required)*
- Email address *(required, validated)*
- Affiliation or organisation *(optional)*

---

## Evaluator profile

- Role — **carries the branch**
- Which material the review drew on *(multi-select: source code inspection · technical documentation · automated test evidence · demonstrated system behaviour)*
- Experience with data structures and algorithms
- Familiarity with data compression specifically
- Approximate review time

---

## Part I — Reliability (REL)

1. The implementation handles error conditions explicitly rather than allowing them to propagate as unhandled exceptions.
2. Resources such as file handles, buffers, and memory allocations are released reliably on every execution path, including error paths.
3. Boundary conditions are handled correctly, including empty files, single-symbol inputs, and files at the maximum supported size.
4. The code validates its internal assumptions — for example tree well-formedness and table bounds — rather than assuming them.
5. The Python reference implementation and the C++17 accelerator produce byte-identical containers and decode each other's output exactly, as the automated checks require.
6. The automated test evidence is sufficient to support a claim of reliable operation.
7. Overall, I judge the reliability of the ByteSize implementation to be satisfactory.

## Part II — Security (SEC)

1. Untrusted input — uploaded file contents, file names, and declared size fields — is validated before use.
2. The decoder is robust against malformed or deliberately crafted container files.
3. Buffer and index handling in the C++17 accelerator is bounds-safe.
4. Credentials and API keys are kept out of the source code, and configuration is externalised.
5. Access to stored compressed results and processing history is properly restricted to the owning account or an administrator.
6. Error messages and logs avoid disclosing sensitive internal detail.
7. Overall, I judge the security posture of the ByteSize implementation to be satisfactory.

## Part III — Performance Efficiency (PE)

1. The algorithmic complexity of the three-tier scan is appropriate for the input sizes the system targets.
2. The data structures used for frequency counting and candidate selection suit their access patterns.
3. Memory use is proportionate; the implementation avoids retaining large intermediate structures longer than necessary.
4. Loops and hot paths avoid redundant recomputation.
5. The C++17 accelerator delivers a performance benefit that justifies the added cost of maintaining two implementations.
6. The 100-megabyte per-file ceiling is a reasonable engineering limit given the system's design.
7. Overall, I judge the performance efficiency of the ByteSize implementation to be satisfactory.

## Part IV — Algorithm Transparency and Technical Correctness (ALG)

> ByteSize-specific. Reported separately and **never** combined with the four ISO/IEC 5055-aligned categories.

1. Tier 1 byte-frequency analysis is implemented correctly, and its role in the pipeline is clear from the source.
2. Tier 2 sequence (n-gram) analysis is implemented correctly, and its candidate-generation logic is traceable.
3. Tier 3 structural-token (whole-word) analysis is implemented correctly, and its tokenisation rules are explicit.
4. The Bit Cost Decision Engine's admission criterion is mathematically sound: a candidate enters the alphabet only when its projected bit savings exceed the cost of storing it.
5. Candidates rejected by the Bit Cost Decision Engine are correctly represented through their underlying byte symbols, with no loss of information.
6. Structural block growth is bounded, and the conditions governing it are evident from the code.
7. The profitability audit correctly verifies that admitted patterns deliver the savings the engine projected.
8. The dynamic-programming optimal parsing produces a genuinely optimal segmentation under the stated cost model.
9. Container selection, including the size guard and raw-storage fallback, is correct and prevents output larger than the input.
10. Exact lossless reconstruction is demonstrated convincingly, and SHA-256 digest verification on every trial is adequate evidence of it.
11. Overall, the algorithm is transparent enough that an independent reviewer could follow its logic from the source.

Items 1–10 cover, in order, every mechanism the manuscript names for this construct.

## Part V — Maintainability (MNT)

> The only rating section answered by the student group.

1. The source code is readable, and its intent is clear without needing to consult the authors.
2. Naming of functions, variables, and modules is consistent and descriptive.
3. The code is adequately documented, through both inline comments and the accompanying technical documentation.
4. The system is modular; responsibilities are separated rather than concentrated in large multi-purpose functions.
5. Coupling between the compression engine and the web application layer is low enough that either could change independently.
6. Individual functions and modules are of manageable size and complexity.
7. Duplicated logic is avoided; shared behaviour is factored into common routines.
8. A developer other than the original authors could maintain and extend this codebase.
9. Overall, I judge the maintainability of the ByteSize implementation to be satisfactory.

## Part VI — Open-ended technical feedback

1. What are the principal technical strengths of the implementation?
2. What technical weaknesses, risks, or defects did you identify?
3. What specific changes would you recommend before this system is presented as complete?

---

## Scoring

- Each construct score is the **arithmetic mean** of its items.
- **N/A is omitted, never imputed** — it means the evaluator lacked evidence, which is not the same as a neutral rating.
- Higher scores indicate a more favourable evaluation.
- The four ISO/IEC 5055-aligned constructs may be reported together. **`ALG` is reported separately and is never folded in.**
- Report `MNT` for the two groups **separately** — expert and student `MNT` means should not be pooled into a single figure, since the groups reviewed with different depth and the manuscript treats the student review as maintainability evidence specifically.
- With 3–5 experts, report descriptively. Do not run inferential tests on a panel this size.

### Reporting the N/A rate

Report the N/A rate per construct alongside the mean. A high N/A rate on `ALG` or `SEC` is itself a finding: it says the evidence supplied to evaluators was insufficient, not that the system scored poorly.

---

## Form configuration checklist

- [ ] Data Privacy Notice and informed consent appear **before** any evaluation item
- [ ] Google's **"Collect email addresses" is OFF** — identity is gathered as explicit consented fields after the notice instead
- [ ] Sign-in is **not** required
- [ ] Evaluators who decline consent **do not proceed**
- [ ] Adviser name, adviser email, repository URL, and documentation URL filled in
- [ ] **Both branches walked in preview** — expert sees REL/SEC/PE/ALG/MNT, student sees MNT only
- [ ] Response spreadsheet linked (Responses → Link to Sheets)
- [ ] On export, name/email/affiliation **split into a separate file** from the ratings
- [ ] Both files on a password-protected machine, destroyed after defense

### ⚠ Manuscript revision required

Same issue as Appendix A. The Ethical Consideration section states that email addresses are not collected and that no directly identifying field is gathered. Both instruments now collect name and email, so that passage must be revised to state what is collected, why, that identifiers are separated from ratings before analysis, and that no participant is named in the manuscript.
