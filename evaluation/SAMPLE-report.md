# ISO/IEC 5055-Aligned Measurement Report — ByteSize

> Automated detection only. Counts below are **raw** and include false positives.
> Triage every finding in `triage_worksheet.csv` before reporting any figure as a measure.


## Toolchain

| Tool | Target | Status |
|---|---|---|
| bandit | Python | 35 findings |
| cppcheck | C++ | 47 findings |
| flawfinder | C/C++ | 9 findings |
| semgrep | Python, JS | FAILED — no output file |
| radon | Python | complexity + MI (no CWEs) |

## Scope

| Language | Non-blank lines |
|---|---:|
| cpp | 1,482 |
| javascript | 808 |
| python | 9,992 |
| **Total** | **12,282** |

## Raw weakness counts by measure

| Measure | Raw findings | Per KLOC | Distinct CWEs |
|---|---:|---:|---:|
| Security | 37 | 3.01 | 7 |
| Reliability | 7 | 0.57 | 1 |
| Performance Efficiency | 0 | 0.00 | 0 |
| Maintainability | 37 | 3.01 | 1 |

| Not counted above | Findings |
|---|---:|
| CWE reported but unmapped to a measure | 0 |
| No CWE emitted by the tool | 10 |

## Findings by CWE

| CWE | Count | Measure(s) | Tools |
|---|---:|---|---|
| CWE-398 | 37 | Maintainability | cppcheck |
| CWE-78 | 13 | Security | bandit |
| (none) | 10 | — | cppcheck |
| CWE-330 | 9 | Security | bandit |
| CWE-120 | 8 | Security | flawfinder |
| CWE-703 | 7 | Reliability | bandit |
| CWE-89 | 4 | Security | bandit |
| CWE-295 | 1 | Security | bandit |
| CWE-22 | 1 | Security | bandit |
| CWE-119 | 1 | Security | flawfinder |

## Complexity and maintainability index

Radon emits no CWEs, so it does not enter the counts above. It supports the Maintainability narrative and items MNT-6 and MNT-8 of the expert instrument.

- Average complexity: B (5.932642487046632)
- Modules below maintainability grade A:
  - `/home/user/jaycenn/huffmanv7/deflate_tokens.py - B (11.89)`
  - `/home/user/jaycenn/huffmanv7/containers.py - C (0.00)`
  - `/home/user/jaycenn/huffmanv7/app.py - C (8.12)`

## How to report this

1. Have the expert panel triage `triage_worksheet.csv`. Only rows marked TRUE count.
2. Report the triaged count per measure as the ISO/IEC 5055-aligned figure, with the raw count and the false-positive rate beside it.
3. Normalise by KLOC so the four measures are comparable.
4. State plainly that this is automated detection with open-source analysers, not an official ISO/IEC 5055 implementation or a certification.
