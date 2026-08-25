#!/usr/bin/env python3
"""
ISO/IEC 5055-aligned automated source code measurement for ByteSize.

Runs CWE-emitting static analysers over the engine and web layer, aggregates
their findings into the four ISO/IEC 5055 measures, normalises by KLOC, and
emits a triage worksheet for the expert panel.

    python3 iso5055_scan.py --source /path/to/HuffmanV7 --out ./reports

WHAT THIS IS, AND IS NOT
    ISO/IEC 5055:2021 measures software quality by detecting and counting
    weaknesses in source code. Each weakness is CWE-registered and carries
    detection patterns intended to drive automated tools. This script performs
    that automated detection with open-source analysers.

    It is NOT an official ISO/IEC 5055 implementation. The standard's full
    weakness list is normative and licensed; the CWE-to-measure mapping below
    is researcher-assigned from the published measure definitions and covers
    the weaknesses these tools actually emit. Any CWE the tools report that is
    absent from the table is listed as UNMAPPED for manual assignment against
    the CISQ weakness list rather than being silently dropped.

RAW COUNTS ARE NOT THE RESULT
    Static analysers over-report. Every finding must be triaged by the expert
    panel as a true or false positive before it enters the reported measure.
    This script emits triage_worksheet.csv for exactly that purpose. Report
    the triaged count as the measure, and the raw count alongside it.
"""

import argparse
import collections
import csv
import json
import os
import shutil
import subprocess
import sys
import xml.etree.ElementTree as ET

# ---------------------------------------------------------------------------
# CWE -> ISO/IEC 5055 measure mapping.
#
# Researcher-assigned from the published measure definitions. A CWE may belong
# to more than one measure, which the standard also permits. Extend this table
# as your scanners surface new CWEs; cite the CISQ weakness list when you do.
# ---------------------------------------------------------------------------

SECURITY = {
    22, 78, 79, 89, 90, 91, 94, 95, 119, 120, 129, 134, 190, 259, 295, 306,
    311, 319, 321, 325, 326, 327, 328, 330, 331, 338, 359, 434, 470, 494,
    501, 502, 522, 532, 564, 601, 611, 614, 643, 732, 749, 798, 862, 915, 918,
}

RELIABILITY = {
    396, 397, 401, 404, 415, 416, 457, 459, 471, 476, 480, 484, 617, 662,
    665, 667, 672, 674, 703, 704, 754, 755, 772, 775, 833, 835,
}

PERFORMANCE = {
    400, 405, 1042, 1043, 1046, 1049, 1050, 1057, 1060, 1067, 1073, 1084,
    1089,
}

MAINTAINABILITY = {
    398, 407, 474, 478, 483, 546, 561, 563, 570, 571, 1041, 1045, 1048,
    1052, 1054, 1055, 1064, 1074, 1075, 1079, 1080, 1086, 1095,
}

MEASURES = [
    ("Security", SECURITY),
    ("Reliability", RELIABILITY),
    ("Performance Efficiency", PERFORMANCE),
    ("Maintainability", MAINTAINABILITY),
]

SKIP_DIRS = {".git", "tests", "benchmarks", "node_modules", "__pycache__",
             "static", "venv", ".venv"}


# ---------------------------------------------------------------------------
# Finding record
# ---------------------------------------------------------------------------

class Finding:
    def __init__(self, tool, cwe, path, line, severity, message):
        self.tool = tool
        self.cwe = cwe            # int, or None when the tool emits none
        self.path = path
        self.line = line
        self.severity = severity
        self.message = " ".join(str(message).split())[:200]

    def measures(self):
        if self.cwe is None:
            return []
        return [name for name, members in MEASURES if self.cwe in members]


# ---------------------------------------------------------------------------
# Line counting
# ---------------------------------------------------------------------------

def count_loc(source):
    """Non-blank physical lines, by language, excluding SKIP_DIRS."""
    counts = collections.Counter()
    for root, dirs, files in os.walk(source):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for fname in files:
            ext = os.path.splitext(fname)[1].lower()
            lang = {".py": "python", ".cpp": "cpp", ".h": "cpp",
                    ".hpp": "cpp", ".js": "javascript"}.get(ext)
            if not lang:
                continue
            try:
                with open(os.path.join(root, fname), errors="ignore") as fh:
                    counts[lang] += sum(1 for line in fh if line.strip())
            except OSError:
                pass
    return counts


# ---------------------------------------------------------------------------
# Scanners.
#
# Each returns (findings, status). Three outcomes are kept distinct, because
# conflating them would silently understate a measure:
#     (None, "not installed")  the tool is absent
#     (None, "FAILED: ...")    the tool ran but produced no parsable output
#     ([...], "N findings")    the tool ran; the list may legitimately be empty
# ---------------------------------------------------------------------------

NOT_INSTALLED = "not installed — SKIPPED"


def _failed(reason):
    return None, "FAILED — %s" % reason


def run_bandit(source, out):
    if not shutil.which("bandit"):
        return None, NOT_INSTALLED
    path = os.path.join(out, "bandit.json")
    proc = subprocess.run(
        ["bandit", "-r", source, "-f", "json", "-o", path, "-q",
         "-x", ",".join(os.path.join(source, d) for d in sorted(SKIP_DIRS))],
        capture_output=True, text=True)
    if not os.path.exists(path):
        return _failed((proc.stderr or "no output file").strip()[:120])
    with open(path) as fh:
        data = json.load(fh)
    out_findings = []
    for r in data.get("results", []):
        cwe = (r.get("issue_cwe") or {}).get("id")
        out_findings.append(Finding(
            "bandit", int(cwe) if cwe else None, r["filename"],
            r["line_number"], r["issue_severity"], r["issue_text"]))
    return out_findings, "%d findings" % len(out_findings)


def run_cppcheck(source, out):
    if not shutil.which("cppcheck"):
        return None, NOT_INSTALLED
    sources = []
    for root, dirs, files in os.walk(source):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        sources += [os.path.join(root, f) for f in files
                    if f.lower().endswith((".cpp", ".hpp"))]
    if not sources:
        return [], "no C++ sources found"
    path = os.path.join(out, "cppcheck.xml")
    proc = subprocess.run(
        ["cppcheck", "--enable=all", "--inconclusive", "--std=c++17",
         "--xml", "--output-file=" + path] + sources,
        capture_output=True, text=True)
    if not os.path.exists(path):
        return _failed((proc.stderr or "no output file").strip()[:120])
    root = ET.parse(path).getroot()
    out_findings = []
    for err in root.findall(".//error"):
        loc = err.find("location")
        cwe = err.get("cwe")
        out_findings.append(Finding(
            "cppcheck", int(cwe) if cwe else None,
            loc.get("file") if loc is not None else "?",
            loc.get("line") if loc is not None else "?",
            err.get("severity"), err.get("msg")))
    return out_findings, "%d findings" % len(out_findings)


def run_flawfinder(source, out):
    if not shutil.which("flawfinder"):
        return None, NOT_INSTALLED
    sources = []
    for root, dirs, files in os.walk(source):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        sources += [os.path.join(root, f) for f in files
                    if f.lower().endswith((".cpp", ".hpp", ".c", ".h"))]
    if not sources:
        return [], "no C/C++ sources found"
    path = os.path.join(out, "flawfinder.csv")
    with open(path, "w") as fh:
        subprocess.run(["flawfinder", "--csv"] + sources,
                       stdout=fh, stderr=subprocess.DEVNULL)
    if not os.path.exists(path) or os.path.getsize(path) == 0:
        return _failed("no output file")
    out_findings = []
    with open(path) as fh:
        for row in csv.DictReader(fh):
            # Flawfinder may emit "CWE-119!/CWE-120"; take the first id.
            raw = (row.get("CWEs") or "").replace("!", "/").split("/")[0]
            cwe = int(raw.replace("CWE-", "")) if raw.startswith("CWE-") else None
            out_findings.append(Finding(
                "flawfinder", cwe, row.get("File", "?"), row.get("Line", "?"),
                "level-" + str(row.get("Level", "?")), row.get("Warning", "")))
    return out_findings, "%d findings" % len(out_findings)


def run_semgrep(source, out):
    """Semgrep fetches its ruleset from the registry, so it fails on an
    offline or proxied host. That failure must be reported, not counted as a
    clean scan."""
    if not shutil.which("semgrep"):
        return None, NOT_INSTALLED
    path = os.path.join(out, "semgrep.json")
    proc = subprocess.run(
        ["semgrep", "--config=p/security-audit", "--json", "-o", path,
         "--metrics=off", "-q"]
        + sum([["--exclude", d] for d in sorted(SKIP_DIRS)], [])
        + [source],
        capture_output=True, text=True)
    if not os.path.exists(path):
        reason = (proc.stderr or proc.stdout or "no output file").strip()
        if "registry" in reason.lower() or "network" in reason.lower():
            reason = "could not fetch ruleset from registry (offline?)"
        return _failed(reason[:120])
    with open(path) as fh:
        data = json.load(fh)
    out_findings = []
    for r in data.get("results", []):
        meta = r.get("extra", {}).get("metadata", {})
        cwes = meta.get("cwe") or []
        raw = cwes[0].split(":")[0].replace("CWE-", "") if cwes else ""
        out_findings.append(Finding(
            "semgrep", int(raw) if raw.isdigit() else None,
            r.get("path", "?"), r.get("start", {}).get("line", "?"),
            meta.get("impact", "?"), r.get("extra", {}).get("message", "")))
    return out_findings, "%d findings" % len(out_findings)


def run_radon(source, out):
    """Complexity and maintainability index. Feeds the Maintainability
    narrative; emits no CWEs, so it is reported separately."""
    if not shutil.which("radon"):
        return None
    # Patterns are matched against the full path radon walks, so a bare
    # "tests/*" never matches when --source is absolute. Anchor with */.
    excl = ",".join("*/%s/*" % d for d in sorted(SKIP_DIRS))
    cc = subprocess.run(["radon", "cc", source, "-a", "-s", "--total-average",
                         "-e", excl], capture_output=True, text=True)
    mi = subprocess.run(["radon", "mi", source, "-s", "-e", excl],
                        capture_output=True, text=True)
    with open(os.path.join(out, "radon_cc.txt"), "w") as fh:
        fh.write(cc.stdout)
    with open(os.path.join(out, "radon_mi.txt"), "w") as fh:
        fh.write(mi.stdout)

    average = ""
    for line in cc.stdout.splitlines():
        if "Average complexity" in line:
            average = line.strip()
    flagged = [ln.strip() for ln in mi.stdout.splitlines()
               if ln.strip() and " - A" not in ln]
    return {"average_complexity": average, "below_grade_a": flagged}


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def write_triage_worksheet(findings, path):
    """One row per finding, for the expert panel to mark TRUE or FALSE.

    Only rows marked TRUE count toward the reported measure. This is the
    handoff from automated detection to expert review."""
    with open(path, "w", newline="") as fh:
        w = csv.writer(fh)
        w.writerow(["id", "tool", "cwe", "measure(s)", "file", "line",
                    "tool_severity", "finding",
                    "verdict (TRUE/FALSE/UNSURE)", "reviewer", "justification"])
        for i, f in enumerate(findings, 1):
            w.writerow([i, f.tool, "CWE-%s" % f.cwe if f.cwe else "none",
                        "; ".join(f.measures()) or "UNMAPPED",
                        f.path, f.line, f.severity, f.message, "", "", ""])


def write_report(findings, loc, radon_data, tool_status, path):
    total_loc = sum(loc.values())
    kloc = total_loc / 1000.0 if total_loc else 0.0
    lines = []
    add = lines.append

    add("# ISO/IEC 5055-Aligned Measurement Report — ByteSize\n")
    add("> Automated detection only. Counts below are **raw** and include "
        "false positives.\n> Triage every finding in `triage_worksheet.csv` "
        "before reporting any figure as a measure.\n")

    add("\n## Toolchain\n")
    add("| Tool | Target | Status |")
    add("|---|---|---|")
    for tool, target, status in tool_status:
        add("| %s | %s | %s |" % (tool, target, status))

    add("\n## Scope\n")
    add("| Language | Non-blank lines |")
    add("|---|---:|")
    for lang, n in sorted(loc.items()):
        add("| %s | %s |" % (lang, format(n, ",")))
    add("| **Total** | **%s** |" % format(total_loc, ","))

    add("\n## Raw weakness counts by measure\n")
    add("| Measure | Raw findings | Per KLOC | Distinct CWEs |")
    add("|---|---:|---:|---:|")
    for name, _ in MEASURES:
        hits = [f for f in findings if name in f.measures()]
        cwes = {f.cwe for f in hits}
        density = (len(hits) / kloc) if kloc else 0.0
        add("| %s | %d | %.2f | %d |" % (name, len(hits), density, len(cwes)))

    unmapped = [f for f in findings if f.cwe and not f.measures()]
    nocwe = [f for f in findings if not f.cwe]
    add("\n| Not counted above | Findings |")
    add("|---|---:|")
    add("| CWE reported but unmapped to a measure | %d |" % len(unmapped))
    add("| No CWE emitted by the tool | %d |" % len(nocwe))
    if unmapped:
        ids = sorted({f.cwe for f in unmapped})
        add("\nUnmapped CWEs needing manual assignment: %s"
            % ", ".join("CWE-%d" % c for c in ids))

    add("\n## Findings by CWE\n")
    add("| CWE | Count | Measure(s) | Tools |")
    add("|---|---:|---|---|")
    by_cwe = collections.defaultdict(list)
    for f in findings:
        by_cwe[f.cwe].append(f)
    for cwe, group in sorted(by_cwe.items(),
                             key=lambda kv: -len(kv[1]))[:30]:
        label = "CWE-%s" % cwe if cwe else "(none)"
        tools = ", ".join(sorted({f.tool for f in group}))
        add("| %s | %d | %s | %s |"
            % (label, len(group), "; ".join(group[0].measures()) or "—", tools))

    if isinstance(radon_data, dict):
        add("\n## Complexity and maintainability index\n")
        add("Radon emits no CWEs, so it does not enter the counts above. It "
            "supports the Maintainability narrative and items MNT-6 and MNT-8 "
            "of the expert instrument.\n")
        if radon_data.get("average_complexity"):
            add("- %s" % radon_data["average_complexity"])
        flagged = radon_data.get("below_grade_a") or []
        if flagged:
            add("- Modules below maintainability grade A:")
            for item in flagged[:20]:
                add("  - `%s`" % item)
        else:
            add("- All modules at maintainability grade A.")

    add("\n## How to report this\n")
    add("1. Have the expert panel triage `triage_worksheet.csv`. Only rows "
        "marked TRUE count.")
    add("2. Report the triaged count per measure as the ISO/IEC 5055-aligned "
        "figure, with the raw count and the false-positive rate beside it.")
    add("3. Normalise by KLOC so the four measures are comparable.")
    add("4. State plainly that this is automated detection with open-source "
        "analysers, not an official ISO/IEC 5055 implementation or a "
        "certification.")

    with open(path, "w") as fh:
        fh.write("\n".join(lines) + "\n")


# ---------------------------------------------------------------------------

def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--source", required=True, help="path to the source tree")
    ap.add_argument("--out", default="./reports", help="output directory")
    args = ap.parse_args()

    source = os.path.abspath(args.source)
    out = os.path.abspath(args.out)
    os.makedirs(out, exist_ok=True)

    if not os.path.isdir(source):
        sys.exit("error: source path not found: %s" % source)

    print("scanning %s" % source)
    loc = count_loc(source)
    print("  %s non-blank lines" % format(sum(loc.values()), ","))

    findings = []
    tool_status = []
    scanners = [
        ("bandit", "Python", run_bandit),
        ("cppcheck", "C++", run_cppcheck),
        ("flawfinder", "C/C++", run_flawfinder),
        ("semgrep", "Python, JS", run_semgrep),
    ]
    failures = []
    for name, target, fn in scanners:
        result, status = fn(source, out)
        tool_status.append((name, target, status))
        if result is None:
            print("  %-11s %s" % (name, status))
            if status.startswith("FAILED"):
                failures.append(name)
            continue
        findings += result
        print("  %-11s %s" % (name, status))

    radon_data = run_radon(source, out)
    if radon_data is None:
        print("  %-11s not installed — skipped" % "radon")
        tool_status.append(("radon", "Python", "not installed — SKIPPED"))
    else:
        print("  %-11s complexity and MI captured" % "radon")
        tool_status.append(("radon", "Python", "complexity + MI (no CWEs)"))

    worksheet = os.path.join(out, "triage_worksheet.csv")
    report = os.path.join(out, "iso5055_report.md")
    write_triage_worksheet(findings, worksheet)
    write_report(findings, loc, radon_data, tool_status, report)

    print("\n%d findings total" % len(findings))
    print("report:    %s" % report)
    print("worksheet: %s" % worksheet)
    print("\nRaw counts are not the result — triage the worksheet first.")

    if failures:
        print("\nWARNING: %s failed to run. The measures they feed are "
              "UNDER-COUNTED.\nFix and re-run before reporting anything."
              % ", ".join(failures))
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
