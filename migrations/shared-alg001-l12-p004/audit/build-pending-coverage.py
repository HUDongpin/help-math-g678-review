#!/usr/bin/env python3
"""Declare P004 source frame domains without manufacturing capture evidence."""
import hashlib
import json
from pathlib import Path
import sys

WORK = Path(__file__).resolve().parent.parent
SOURCE_SHA = "4d7aa78bd955aa52d476f31548c97135da989daf9d106986ff06a954c6d8b334"


def entry_hash(state):
    compact = json.dumps(state, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(compact.encode()).hexdigest()


def requirement(scenario, domain, language, last_frame, entry, authority):
    key = f"{scenario}-{domain}-{language}"
    return {
        "requirementId": f"req-{key}", "scenario": scenario, "frameDomainId": domain,
        "traceId": key, "language": language, "seed": "0",
        "requiredRange": {"firstFrame": 1, "lastFrame": last_frame},
        "entryState": entry, "entryStateSha256": entry_hash(entry),
        "baselineAuthorityRequirement": authority, "baselineAuthority": "unresolved",
        "status": "pending", "capturedFrameCount": 0,
        "missingFrames": list(range(1, last_frame + 1)),
        "baselineCaptureManifest": "", "baselineCaptureManifestSha256": "",
        "captureManifest": "", "captureManifestSha256": "",
        "metricsFile": "", "metricsSha256": ""
    }


def main():
    manifest = json.loads((WORK / "migration.json").read_text())
    assert manifest["source"]["swfSha256"] == SOURCE_SHA
    assert [(d["id"], d["frameCount"]) for d in manifest["implementation"]["frameDomains"]] == [
        ("root", 10), ("sprite-90", 969), ("sprite-92", 1)]
    requirements = []
    for language in ("en", "es"):
        requirements.append(requirement("default", "root", language, 10,
                                        {"kind": "initial-load", "language": language},
                                        "original-runtime-frame-accurate"))
        requirements.append(requirement("source-main-natural", "sprite-90", language, 969,
                                        {"kind": "source-root-begin", "rootFrame": 6,
                                         "sourceTimelineId": "sprite-90", "rootDepth": 1,
                                         "placementTwips": {"x": 4189, "y": 5670}, "language": language},
                                        "original-runtime-natural-trace"))
        requirements.append(requirement("default", "sprite-92", language, 1,
                                        {"kind": "source-root-begin", "rootFrame": 6,
                                         "sourceTimelineId": "sprite-92", "rootDepth": 171,
                                         "placementTwips": {"x": 8000, "y": 869}, "language": language},
                                        "original-runtime-frame-accurate"))
    payload = {
        "schemaVersion": 2, "animationId": "shared-alg001-l12-p004",
        "requirements": requirements,
        "pendingInteractiveTraces": [
            {"term": term, "characterId": character, "frameDomainId": "sprite-90",
             "sourceVisibleRange": {"firstFrame": first, "lastFrame": 969},
             "sourceAction": "release requests DoHyperLinks then stops animation",
             "closeResumeAuthority": "unresolved-original-host-evidence-required",
             "baselineAuthority": "unresolved", "status": "pending"}
            for character, term, first in [(63, "Vertical-line test", 19), (66, "Vertical", 29),
                                           (67, "Graph", 29), (71, "Point", 203), (72, "Function", 203)]
        ],
        "sourceLimitation": "Spanish source text and natural glossary close/resume schedule are unverified. No capture or acceptance claimed."
    }
    output = WORK / "evidence/full-frame-coverage.json"
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + "\n"
    if sys.argv[1:] == ["--check"]:
        assert output.read_text() == rendered
    else:
        assert not sys.argv[1:]
        output.write_text(rendered)
    print(f"P004 pending coverage {'checked' if sys.argv[1:] else 'written'}: 6 frame requirements, 5 interactive traces")


if __name__ == "__main__":
    main()
