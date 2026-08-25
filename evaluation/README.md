# ISO/IEC 5055 Evaluation Protocol

How the technical evaluation is actually conducted, and why it runs in two tracks.

## Why two tracks

ISO/IEC 5055:2021 measures software quality by **detecting and counting weaknesses in source code**. Each weakness is CWE-registered and carries detection patterns written to drive automated tools. It is a measurement standard, not a judgment questionnaire.

An expert panel alone therefore cannot produce an ISO/IEC 5055 result. But automated tools alone cannot judge whether the Bit Cost Decision Engine's admission inequality is *sound* — no static analyser reasons about algorithm correctness.

So the evaluation runs both, and each does what the other cannot:

| Track | Method | Produces |
|---|---|---|
| **A — Measurement** | `iso5055_scan.py` over the source tree | Weakness counts per measure, normalised per KLOC |
| **B — Expert review** | The technical instrument (Appendix B) | Judgment on algorithm correctness, and triage of Track A's findings |

Track A also makes Track B answerable. Asking an expert *"is buffer and index handling bounds-safe?"* with nothing but the source in front of them invites an N/A. Handing them the Cppcheck and Flawfinder output turns the same item into an evidence-based judgment.

## Track A — running the measurement

```bash
pip install bandit radon flawfinder semgrep
apt-get install cppcheck            # or: brew install cppcheck

python3 iso5055_scan.py --source /path/to/HuffmanV7 --out ./reports
```

Outputs into `--out`:

| File | Contents |
|---|---|
| `iso5055_report.md` | Weakness counts per measure, per-KLOC densities, CWE breakdown, complexity/MI |
| `triage_worksheet.csv` | One row per finding, for the panel to mark TRUE / FALSE / UNSURE |
| `bandit.json`, `cppcheck.xml`, `flawfinder.csv`, `semgrep.json` | Raw tool output, kept for reproducibility |
| `radon_cc.txt`, `radon_mi.txt` | Complexity and maintainability index |

**Pin your tool versions and commit the raw output.** The measurement has to be reproducible by anyone reading the thesis.

**Check the toolchain table before reporting.** A scanner that fails is reported as `FAILED`, not as zero findings, and the script exits non-zero. A failed scanner means the measures it feeds are under-counted.

### Coverage by tool

| Tool | Target | Feeds |
|---|---|---|
| Bandit | Python | Security, Reliability |
| Cppcheck | C++17 accelerator | Reliability, Maintainability |
| Flawfinder | C/C++ | Security |
| Semgrep | Python, JS | Security |
| Radon | Python | Maintainability narrative (emits no CWEs, reported separately) |

## Raw counts are not the result

Static analysers over-report. This is not a caveat to bury — it is the reason Track B exists, and handling it correctly is what makes the number defensible.

A worked example from the first run against HuffmanV7: Bandit reported **4 CWE-89 (SQL injection) findings** in `db.py`, all MEDIUM severity. On inspection all four are **false positives**:

- Three come from `_scope()`, which returns the constant string `" AND user_id = ?"` with the value passed as a bound parameter. No user data reaches the SQL string.
- The fourth is an `ORDER BY` built with `%`-interpolation — but `sort` is validated against an allowlist and falls back to `created_at`, and `direction` is coerced to exactly `ASC` or `DESC`.

Reporting "4 SQL injection weaknesses" would have been wrong. Reporting "4 raw, 0 confirmed, with the allowlist as evidence" is right, and is a stronger result than a clean scan.

**Procedure:** the expert panel works through `triage_worksheet.csv`, marking each row TRUE, FALSE, or UNSURE with a justification. Only TRUE rows count toward a measure. Report the triaged count as the figure, with the raw count and false-positive rate beside it.

## Sequence

1. **Freeze a commit.** Everything downstream references it.
2. **Run Track A.** Needs no participants. Commit `reports/` alongside the pinned commit.
3. **Assemble the evidence pack** (see below).
4. **Recruit.** 3–5 algorithm experts, 10–15 CS students. The experts are the hardest constraint in the study — start early.
5. **Administer.** Students ~45 min (maintainability only). Experts 2–3 hrs review, then ~20 min on the form.
6. **Triage.** Panel completes the worksheet.
7. **Report.** Triaged counts as the 5055-aligned evidence; expert ratings as corroborating judgment; `ALG` reported separately, as the methodology requires.

## The evidence pack

The manuscript says evaluators review "source code, technical documentation, automated test evidence, and demonstrated system behaviour." Make that concrete. Every evaluator receives:

- [ ] Repository link at the **pinned commit**
- [ ] `reports/` from Track A, including the raw tool output
- [ ] Architecture / technical documentation
- [ ] Automated test evidence and the SHA-256 verification logs
- [ ] Corpus benchmark tables (Canterbury, Silesia, GovDocs1)
- [ ] Credentials for the deployed demonstration system
- [ ] The triage worksheet, for the expert group

## Reporting language

State plainly, wherever results appear:

> Measurement was performed with open-source CWE-emitting static analysers and aggregated against the four ISO/IEC 5055 measure definitions. This is not an official ISO/IEC 5055 implementation, not a certification, and not a substitute for a licensed conformant tool. Raw findings were triaged by the expert panel; only confirmed findings are counted.

## Known limitation of the mapping

The standard's full weakness list is normative and licensed. The CWE-to-measure table in `iso5055_scan.py` is **researcher-assigned** from the published measure definitions, and covers the weaknesses these tools actually emit. Any CWE a tool reports that is absent from the table is surfaced as `UNMAPPED` for manual assignment rather than silently dropped — check that line in the report on every run.

Reference: [CISQ — Software Quality Standards, ISO 5055](https://www.it-cisq.org/standards/code-quality-standards/) · [ISO/IEC 5055:2021](https://www.iso.org/standard/80623.html)

## Objective wording

The current objective — *"to test the developed system's source code using the ISO/IEC 5055 software quality standard, as assessed by the panel of algorithm experts"* — promises measurement but describes judgment. Suggested replacement:

> To measure the developed system's source code against the Reliability, Security, Performance Efficiency, and Maintainability characteristics of ISO/IEC 5055 using automated static analysis, and to corroborate those measurements through structured expert review by a panel of algorithm experts.
