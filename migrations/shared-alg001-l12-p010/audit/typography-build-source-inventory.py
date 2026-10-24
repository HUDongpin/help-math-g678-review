#!/usr/bin/env python3
"""P010 source typography inventory. Reads source and sealed evidence; no playback."""
from pathlib import Path
import copy
import hashlib
import json
import re
import struct
import subprocess
import sys
import xml.etree.ElementTree as ET
import zlib

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "migrations/shared-alg001-l12-p010/audit"
REVIEW = ROOT / "output/p010-typography-inventory-review-20260927-v1"
VECTOR = ROOT / "output/p010-vector-source-review-20260927-v1"
SOURCE = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB05.swf")
SOURCE_SHA = "a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd"
GEOMETRY_SHA = "2fb18d047c60819c8508e4414a7d4a193b62cd1f40df1cbf19cb56b2d43b1bcd"
PINS = {
    "movie.xml": "94c06c842ebd821d5d239666e3e00e4d639f47d4861149438a0a6a1cc02912da",
    "source-text-catalog.json": "0926104d8e08a517807e389ccdd4a13cef5081c9229afed4900f424f8fe561d1",
    "extraction-receipt.json": "d42a9b58831223bf9be5825586c31d74232dda6965e7458eca7dd3c73fa91385",
    "ffdec-26.2.1-canvas-v1/extraction-receipt.json": "e75250b0f7243cc239a08eba89097c2dfe97d0bc89d8b2fa53e2d2f8b85cd64c",
    "typography-build-source-geometry.py": "6883c1a835204f5ac97770a5621d71ec88a43f916486999af3956d720b2723fd",
}
inputs = []
verified_pins = {}


def stable_read(path, expected=None, record=True):
    path = path if path.is_absolute() else ROOT / path
    assert path.resolve() == path, f"nonphysical input: {path}"
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_dev, before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_dev, after.st_ino, after.st_size, after.st_mtime_ns), path
    pin = {"path": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
    assert expected is None or pin["sha256"] == expected, f"hash mismatch: {path}"
    if record and pin["path"] not in verified_pins:
        inputs.append(pin)
    verified_pins[pin["path"]] = pin
    return data, pin


def read_json(path, expected=None):
    data, pin = stable_read(path, expected)
    return json.loads(data), pin


def verify_pin(pin, base=ROOT):
    path = Path(pin["path"])
    data, actual = stable_read(path if path.is_absolute() else base / path, pin["sha256"], False)
    assert len(data) == pin["bytes"], path
    return actual


def verify_pin_tree(value, base=ROOT):
    if isinstance(value, dict):
        if set(["path", "bytes", "sha256"]).issubset(value):
            verify_pin(value, base)
        else:
            for item in value.values():
                verify_pin_tree(item, base)
    elif isinstance(value, list):
        for item in value:
            verify_pin_tree(item, base)


def poses(timeline):
    active, states, frames = {}, [], {}
    for event in timeline["events"]:
        frames.setdefault(event["frame"], []).append(event)
    for frame in range(1, timeline["declaredFrameCount"] + 1):
        for event in frames.get(frame, []):
            if event["kind"] == "remove":
                active.pop(event["depth"], None)
            elif event["kind"] == "place":
                state = copy.deepcopy(active.get(event["depth"], {})) if event["move"] else {}
                state.setdefault("matrix", [1, 0, 0, 1, 0, 0])
                state.setdefault("colorTransform", {"multiply": [256]*4, "add": [0]*4, "divisor": 256})
                for key in ["instanceId", "depth", "characterId", "matrix", "colorTransform", "ratio", "name", "clipDepth", "visible"]:
                    if key in event:
                        state[key] = copy.deepcopy(event[key])
                active[event["depth"]] = state
        states.append(copy.deepcopy(active))
    return states


def point(matrix, xy):
    a, b, c, d, x, y = matrix
    return [a*xy[0] + c*xy[1] + x, b*xy[0] + d*xy[1] + y]


def read_tag(data, offset):
    head = struct.unpack_from("<H", data, offset)[0]
    start = offset + 2
    code, size = head >> 6, head & 63
    if size == 63:
        size = struct.unpack_from("<I", data, start)[0]
        start += 4
    assert start + size <= len(data)
    return code, data[start:start+size], data[offset:start+size]


def run_checked(command):
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    assert result.returncode == 0, f"failed upstream check: {command}\n{result.stdout}\n{result.stderr}"
    return command


def build():
    source, source_pin = stable_read(SOURCE, SOURCE_SHA)
    source_copy, _ = stable_read(AUDIT / "source-input.swf", SOURCE_SHA)
    assert source == source_copy and len(source) == 183770
    for path, digest in PINS.items():
        stable_read(AUDIT / path, digest)
    geometry, geometry_pin = read_json(AUDIT / "typography-source-geometry-v1.json", GEOMETRY_SHA)
    assert geometry["kind"] == "p010-native-typography-source-geometry" and geometry["sourceSha256"] == SOURCE_SHA
    geometry_check = run_checked(["python3", str(AUDIT / "typography-build-source-geometry.py"), "--check"])
    parser = ROOT / "scripts/lib/swf-text-source-catalog.mjs"
    stable_read(parser, "5a65075738bcdd62a9fb79cca0aaf7fe7ab59857bd3852fdf5063d6c1fe8a3dc")
    code = "import fs from 'node:fs';import {collectSwfTextSourceCatalog} from './scripts/lib/swf-text-source-catalog.mjs';process.stdout.write(JSON.stringify(collectSwfTextSourceCatalog(fs.readFileSync(process.argv[1]))));"
    parsed = subprocess.run(["node", "--input-type=module", "--eval", code, str(SOURCE)], cwd=ROOT, capture_output=True, text=True, check=True)
    catalog = json.loads(parsed.stdout)
    stored, _ = read_json(AUDIT / "source-text-catalog.json", PINS["source-text-catalog.json"])
    assert catalog == stored, "fresh physical source parser differs from sealed catalog"
    assert catalog["sourceSha256"] == SOURCE_SHA and catalog["summary"]["unparsedTags"] == 0
    assert {k: catalog["summary"][k] for k in ["textDefinitions", "textRuns", "shapeDefinitions", "bitmapDefinitions", "buttonDefinitions"]} == {"textDefinitions": 28, "textRuns": 52, "shapeDefinitions": 58, "bitmapDefinitions": 0, "buttonDefinitions": 9}

    raw_receipt, raw_pin = read_json(AUDIT / "ffdec-26.2.1-canvas-v1/extraction-receipt.json", PINS["ffdec-26.2.1-canvas-v1/extraction-receipt.json"])
    verify_pin_tree(raw_receipt["inputs"])
    verify_pin_tree(raw_receipt["generator"])
    verify_pin_tree(raw_receipt["tool"])
    verify_pin_tree(raw_receipt["files"], AUDIT / "ffdec-26.2.1-canvas-v1")
    candidate_receipt, candidate_pin = read_json(ROOT / "output/p010-source-canvas-20260927-v1/source-canvas-receipt.json", "e1bae02d2e8bd7cf7bf8a4a0ed96d8836503e052be76a1f3e2ba38c1e7efb1e1")
    for key in ["source", "inputs", "generatorDependencies", "outputs"]:
        verify_pin_tree(candidate_receipt[key])
    vector, vector_pin = read_json(VECTOR / "classification.json", "a28a7ec8f755e09292066490054bd2b4603ebffe51a36277c177900da2fa812e")
    assert vector["definitionCount"] == 58 and vector["animationId"] == "shared-alg001-l12-p010"
    shape_inventory, _ = read_json(VECTOR / "shape-inventory.json", "d1703e546f9f72880104f25ba193a29424c93bfa598a4b86b03a73a11c69aa41")
    source_pins, _ = read_json(VECTOR / "source-pins.json", "f63463e2d945fce387673fbeee22f1b239351a5f422ca6e4051814288aec3728")
    verify_pin_tree(source_pins["inputs"])
    verify_pin(vector["captureReceipt"], VECTOR)
    capture, _ = read_json(VECTOR / "capture-receipt.json", "4bacc4fb06a75263c67d49a42950b9246ec001ecb9f236b2dfae2b51bbdba176")
    verify_pin_tree(capture["reviewArtifacts"], VECTOR)
    correction, correction_pin = read_json(ROOT / "output/p010-source-main-review-20260927-v1/review.json", "6fcc0897568526ace0b5be7e83837990842eae6b0f86bbc0ab4697e2b78f0146")
    assert correction["rawVsOpaque465DifferenceBounds"] == [65, 85, 697, 195] and correction["graphRegionDifferenceBounds"] is None

    text_source, text_pin = stable_read(ROOT / "packages/demos/src/generated/alg-l12-p010-text-data.ts", "ff4f151327fd56eac3f3ef508d4a0e05233fe1ecd54228ef97b23c6f9376658a")
    stable_read(ROOT / "scripts/build-g678-alg-l12-p010-text-data.mjs", "c493f7c29ac9eb35254556f6164d8df34c1203d77517a9800812063b1f3b3c6c")
    stable_read(ROOT / "scripts/build-g678-alg-l12-p010-text-data.test.mjs", "b10af22bc3c65ed7b6ba32232173c13cd999978d6643bd5d117d5cc02b234f11")
    text_data = json.loads(text_source.decode().split("export const P010_TEXT_DATA = ", 1)[1].rsplit(" as const;", 1)[0])
    assert text_data["sourceSha256"] == SOURCE_SHA and text_data["sourceGeometrySha256"] == GEOMETRY_SHA
    text_check = run_checked(["node", "scripts/build-g678-alg-l12-p010-text-data.mjs", "--check"])
    main = next(t for t in catalog["timelines"] if t["timelineId"] == "sprite-96")
    root = next(t for t in catalog["timelines"] if t["timelineId"] == "root")
    assert main["declaredFrameCount"] == 465 and root["declaredFrameCount"] == 10
    states, root_states = poses(main), poses(root)
    root_pose = root_states[5]
    assert root_pose[1]["characterId"] == 96 and root_pose[1]["matrix"] == [1, 0, 0, 1, 8248, 5666]
    assert root_pose[108]["characterId"] == 97 and root_pose[108]["matrix"] == [1, 0, 0, 1, 0, 0]
    stage_matrix = root_pose[1]["matrix"]
    roles = {4: "shared-origin-label", 6: "horizontal-axis-name", 9: "vertical-axis-name", 10: "reused-digit-1", 11: "reused-negative-sign", 12: "reused-digit-2", 13: "reused-digit-3", 14: "reused-digit-4", 15: "reused-digit-5", 20: "point-definition-part-1", 26: "point-definition-dimensions", 32: "coordinate-plane-definition", 36: "ordered-pair-definition", 38: "point-A-letter", 50: "reused-pair-first-coordinate-5", 55: "point-A-second-coordinate-3", 56: "point-A-callout", 57: "point-B-letter", 64: "point-B-first-coordinate-minus-4", 69: "point-B-second-coordinate-2", 70: "point-B-callout", 71: "point-C-letter", 75: "point-C-first-coordinate-minus-3", 84: "point-C-second-coordinate-minus-5", 85: "point-C-callout", 86: "point-D-letter", 94: "point-D-second-coordinate-minus-3", 95: "point-D-callout"}
    assert set(roles) == {d["characterId"] for d in catalog["textDefinitions"]}
    definitions = [copy.deepcopy(d) | {"role": roles[d["characterId"]]} for d in geometry["textDefinitions"]]
    definitions_by_cid = {d["characterId"]: d for d in definitions}
    generated_defs = {d["characterId"]: d for d in text_data["definitions"]}
    run_metrics = {}
    reveal_cids = {20, 26, 32, 36}
    for source_definition in catalog["textDefinitions"]:
        cid, pen_x, pen_y = source_definition["characterId"], 0, 0
        generated = generated_defs[cid]
        assert generated["matrix"] == source_definition["matrix"] and generated["sourceTagSha256"] == source_definition["sourceTagSha256"]
        for run, compact in zip(source_definition["runs"], generated["runs"], strict=True):
            if run["changed"]["xOffset"]:
                pen_x = run["xOffsetTwips"]
            if run["changed"]["yOffset"]:
                pen_y = run["yOffsetTwips"]
            start = [pen_x, pen_y]
            advance = sum(glyph["advanceTwips"] for glyph in run["glyphs"])
            assert compact["id"] == run["sourceTextId"] and compact["text"] == run["text"]
            assert compact["baselineTwips"] == start and compact["advanceTwips"] == advance
            assert compact["color"] == run["colorRgba"] and compact["fontHeightTwips"] == run["fontHeightTwips"]
            run_metrics[run["sourceTextId"]] = {"baselineTwips": start, "advanceTwips": advance, "fontHeightTwips": run["fontHeightTwips"], "revealFrame": compact["revealFrame"], "baselineOwnedByRun": True}
            definition_run = next(r for r in definitions_by_cid[cid]["runs"] if r["sourceTextId"] == run["sourceTextId"])
            definition_run["nativeMetrics"] = copy.deepcopy(run_metrics[run["sourceTextId"]])
            pen_x += advance
        assert "baselineTwips" not in generated, "definition-level baseline would flatten multiline text"
    assert len(run_metrics) == 52
    text_instances = []
    for instance in geometry["textInstances"]:
        source_instance = next(i for i in main["instances"] if i["instanceId"] == instance["instanceId"])
        assert all(instance[k] == value for k, value in source_instance.items())
        assert instance["firstPose"] == states[instance["firstFrame"]-1][instance["depth"]]
        entry = copy.deepcopy(instance) | {"role": roles[instance["characterId"]], "sourceInstancePath": [root_pose[1]["instanceId"], instance["instanceId"]]}
        text_instances.append(entry)
    visibility = copy.deepcopy(geometry["runInstanceVisibilitySummary"])
    metrics_instances = []
    for source_run, generated_run in zip(visibility, text_data["runInstances"], strict=True):
        assert all(generated_run[k] == v for k, v in source_run.items())
        metrics = run_metrics[source_run["sourceTextId"]]
        assert generated_run["baselineTwips"] == metrics["baselineTwips"] and generated_run["revealFrame"] == metrics["revealFrame"]
        if int(source_run["sourceTextId"].split("/")[0].split("-")[1]) in reveal_cids:
            assert metrics["revealFrame"] == source_run["firstAllInkBoundsContainedAndFullOpacityFrame"]
        else:
            assert metrics["revealFrame"] is None
        instance = next(i for i in text_instances if i["instanceId"] == source_run["instanceId"])
        definition = definitions_by_cid[instance["characterId"]]
        stage_twips = point(stage_matrix, point(instance["firstPose"]["matrix"], point(definition["matrix"], metrics["baselineTwips"])))
        metrics_instances.append(source_run | metrics | {"stageBaselineAtFirstPlacementPixels": [p/20 for p in stage_twips], "stageBaselineMethod": "run pen -> text matrix -> instance matrix -> root sprite matrix; later poses retained in textInstances.events"})
    assert len(text_instances) == 53 and len(visibility) == len(metrics_instances) == 77
    for cid in [56, 70, 85, 95]:
        assert [r["nativeMetrics"]["baselineTwips"][1] for r in definitions_by_cid[cid]["runs"]] == [380, 900, 1420]

    def instance_at(depth):
        return next(i for i in main["instances"] if i["depth"] == depth and i["characterId"] in definitions_by_cid)

    def component(depth):
        item = instance_at(depth)
        return {"instanceId": item["instanceId"], "characterId": item["characterId"], "literalText": definitions_by_cid[item["characterId"]]["literalText"], "firstFrame": item["firstFrame"], "lastFrameExclusive": item["lastFrameExclusive"], "matrixTwips": states[item["firstFrame"]-1][depth]["matrix"], "runVisibility": [v for v in visibility if v["instanceId"] == item["instanceId"]]}

    axes = [("x", 1, 48, None), ("x", -1, 49, 50), ("x", 2, 51, None), ("x", -2, 52, 53), ("x", -3, 54, 55), ("x", 3, 56, None), ("x", 4, 57, None), ("x", -4, 58, 59), ("x", -5, 60, 61), ("x", 5, 62, None), ("y", -1, 64, 65), ("y", 1, 66, None), ("y", -2, 67, 68), ("y", 2, 69, None), ("y", -3, 70, 71), ("y", 3, 72, None), ("y", 4, 73, None), ("y", -4, 74, 75), ("y", -5, 76, 77), ("y", 5, 78, None)]
    axis_labels = []
    for axis, value, digit_depth, sign_depth in axes:
        digit, sign = component(digit_depth), component(sign_depth) if sign_depth else None
        literal = (sign["literalText"] if sign else "") + digit["literalText"]
        assert literal == str(value)
        if sign:
            assert sign["characterId"] == 11 and sign["matrixTwips"][0] == 1.4901885986328125
        axis_labels.append({"axis": axis, "value": value, "sourceLiteral": literal, "components": [digit] + ([sign] if sign else []), "evidence": "P010 source placements, literal text and pinned raw vector/static review"})
    ordered_pairs = []
    for letter, coordinates, letter_depth, first_depth, second_depth, callout_depth in [("A", [5,3], 81,86,87,88), ("B", [-4,2], 90,92,93,94), ("C", [-3,-5], 96,98,99,100), ("D", [5,-3], 102,104,105,106)]:
        label, first, second, callout = [component(d) for d in [letter_depth, first_depth, second_depth, callout_depth]]
        literal = first["literalText"] + second["literalText"]
        assert label["literalText"] == letter and literal == f"({coordinates[0]},{coordinates[1]})"
        assert f"({coordinates[0]},{coordinates[1]})." in callout["literalText"]
        ordered_pairs.append({"letter": letter, "literal": literal, "semanticCoordinates": coordinates, "letterComponent": label, "coordinateComponents": [first, second], "callout": callout, "reusedFirstCoordinateDefinitionRequiresInstanceIdentity": letter in ["A", "D"], "calloutUsesThreeDistinctRunBaselines": True})

    xml_bytes, _ = stable_read(AUDIT / "movie.xml", PINS["movie.xml"])
    xml = ET.fromstring(xml_bytes)
    shape_bounds = {}
    for item in xml.iter():
        if item.attrib.get("type", "").startswith("DefineShape") and "shapeId" in item.attrib:
            bounds = item.find("shapeBounds")
            shape_bounds[int(item.attrib["shapeId"])] = [int(bounds.attrib[k]) for k in ["Xmin", "Ymin", "Xmax", "Ymax"]]
    assert len(shape_bounds) == 58
    assert source[:3] == b"CWS"
    inflated = b"FWS" + source[3:8] + zlib.decompress(source[8:])
    assert len(inflated) == struct.unpack_from("<I", source, 4)[0]
    raw_shape_by_cid = {s["characterId"]: s for s in catalog["shapeDefinitions"]}
    inventory_by_cid = {s["characterId"]: s for s in shape_inventory["definitions"]}
    shape_entries = []
    all_instances = main["instances"] + root["instances"]
    all_events = main["events"] + root["events"]
    for classification in vector["definitions"]:
        cid = classification["characterId"]
        source_shape = raw_shape_by_cid[cid]
        code, payload, tag = read_tag(inflated, source_shape["sourceTagOffset"])
        assert struct.unpack_from("<H", payload, 0)[0] == cid
        assert hashlib.sha256(struct.pack("<H", code) + payload).hexdigest() == source_shape["sourceTagSha256"]
        assert len(payload) == classification["sourcePayloadBytes"] and hashlib.sha256(payload).hexdigest() == classification["sourcePayloadSha256"]
        assert len(tag) == classification["sourceTagRecordBytes"] and hashlib.sha256(tag).hexdigest() == classification["sourceTagRecordSha256"]
        assert classification["bboxTwips"] == dict(zip(["Xmin","Ymin","Xmax","Ymax"], shape_bounds[cid]))
        assert inventory_by_cid[cid]["sourceTagRecordSha256"] == classification["sourceTagRecordSha256"]
        verify_pin_tree(classification["evidence"], VECTOR)
        matches = [i for i in all_instances if i["characterId"] == cid]
        disposition = "replace-exact-root-title-instance-with-native-text" if cid == 97 else "replace-exact-glossary-underlines-with-native-linked-term-decoration" if cid in [19,25,31,35] else "retain-source-mask-geometry-and-lifetimes" if cid in [18,30] else "retain-hit-test-provenance-without-visible-hit-shape" if cid == 21 else "preserve-educational-geometry"
        shape_entries.append(source_shape | {"boundsTwips": shape_bounds[cid], "reviewRole": classification["classification"], "observedVisualRole": classification["observedVisualRole"], "nativeDisposition": disposition, "visualTranscription": classification.get("semanticValue"), "classificationEvidence": copy.deepcopy(classification), "sourceInstances": [copy.deepcopy(i) | {"events": [e for e in all_events if e.get("instanceId") == i["instanceId"]]} for i in matches]})
    assert vector["classificationCounts"] == {"instructional-graphic":50,"clip-mask":2,"glossary-underline":4,"button-hit-region":1,"outlined-text":1}
    assert [s["characterId"] for s in shape_entries if s["visualTranscription"]] == [97]

    contract_data, contract_pin = stable_read(ROOT / "packages/demos/src/alg-l12-p010-glossary.ts", "5992a987b60cdbd4936024a4bf17897c123cca5fa4200678aec6caab17dd276f")
    stable_read(ROOT / "packages/demos/tests/alg-l12-p010-glossary.test.ts", "8e365654e67f33cb34e312dd37e4ffd523f7addfd2e2b99e0005fbd926cd5348")
    glossary_validation, glossary_validation_pin = read_json(REVIEW / "glossary-contract-validation.json")
    verify_pin_tree(glossary_validation["inputs"])
    assert glossary_validation["summary"] == {"tests":16,"passed":16,"failed":0} and glossary_validation["result"]["exit_code"] == 0
    array_literal = contract_data.decode().split("export const P010_GLOSSARY_TERMS = ",1)[1].split("] as const;",1)[0] + "]"
    # This sealed literal contains only simple identifier keys, strings and ints.
    literal_json = re.sub(r"\b([A-Za-z][A-Za-z0-9]*):", r'"\1":', array_literal.replace("'", '"'))
    literal_json = re.sub(r",\s*([}\]])", r"\1", literal_json)
    glossary_instances = json.loads(literal_json)
    assert len(glossary_instances) == 10
    keys_by_cid, buttons = {}, []
    for button in catalog["buttonDefinitions"]:
        cid = button["characterId"]
        script, script_pin = stable_read(AUDIT / f"actionscript/as/scripts/DefineButton2_{cid}/BUTTONCONDACTION on(release).as")
        match = re.search(r'_global\.KeyAttribute\s*=\s*"([^"]+)"', script.decode())
        assert match and "_root.DoHyperLinks();" in script.decode() and "_root.animation_mc.animation.stop();" in script.decode()
        key = match[1]
        assert all(s["characterId"] == 21 and s["states"] == {"up":False,"over":False,"down":False,"hitTest":True} for s in button["statePlacements"])
        keys_by_cid[cid] = key
        rows = [row for row in glossary_instances if row["characterId"] == cid]
        buttons.append(copy.deepcopy(button) | {"sourceKeyAttribute":key,"actionScriptPin":script_pin,"sourceInstances":[i for i in main["instances"] if i["characterId"] == cid],"sourceRunIds":[row["sourceTextId"] for row in rows],"sourceInstanceMappings":[row["instanceId"] for row in rows],"modernDictionaryEntryId":None,"modernDictionaryResolution":"source key and explicit lookup key retained; content acceptance separate"})
    for row in glossary_instances:
        source_instance = next(i for i in main["instances"] if i["instanceId"] == row["instanceId"])
        assert source_instance["characterId"] == row["characterId"] and keys_by_cid[row["characterId"]] == row["sourceKeyAttribute"]
        text_instance = next(i for i in text_instances if i["instanceId"] == row["sourceTextInstanceId"])
        run = next(r for r in definitions_by_cid[text_instance["characterId"]]["runs"] if r["sourceTextId"] == row["sourceTextId"])
        assert 0 <= row["spanStart"] < row["spanEnd"] <= len(run["text"])
        run_visibility = next(v for v in visibility if v["instanceId"] == row["sourceTextInstanceId"] and v["sourceTextId"] == row["sourceTextId"])
        assert row["firstReadableFrame"] == run_visibility["firstAllInkBoundsContainedAndFullOpacityFrame"]
        assert row["dictionaryLookupKey"] == ("Length" if row["sourceKeyAttribute"] == "length" else row["sourceKeyAttribute"])
        row["sourceRunId"] = row["sourceTextId"]
        row["sourceLiteralSpan"] = run["text"][row["spanStart"]:row["spanEnd"]]
        row["sourceFirstFrame"] = source_instance["firstFrame"]
        row["sourceLastFrameExclusive"] = source_instance["lastFrameExclusive"]
    assert len(keys_by_cid) == 9 and [r["sourceFirstFrame"] for r in glossary_instances if r["sourceKeyAttribute"] == "Position"] == [10,173]

    suppression = []
    for item in text_instances:
        suppression.append({"id":f"root:1:1:96/sprite-96:{item['depth']}:{item['generation']}:{item['characterId']}","firstFrame":item["firstFrame"],"lastFrameExclusive":item["lastFrameExclusive"],"sourceInstanceId":item["instanceId"],"role":"source-text-instance"})
    underlines = [i for i in main["instances"] if i["characterId"] in [19,25,31,35]]
    assert len(underlines) == 4
    for item in underlines:
        suppression.append({"id":f"root:1:1:96/sprite-96:{item['depth']}:{item['generation']}:{item['characterId']}","firstFrame":item["firstFrame"],"lastFrameExclusive":item["lastFrameExclusive"],"sourceInstanceId":item["instanceId"],"role":"source-glossary-underline-instance"})
    source_order = {item["instanceId"]: index for index, item in enumerate(main["instances"])}
    suppression.sort(key=lambda item: source_order[item["sourceInstanceId"]])
    suppression.append({"id":"root:108:1:97","firstFrame":1,"lastFrameExclusive":466,"sourceInstanceId":"root/depth-108/generation-1","sourceRootFirstFrame":6,"sourceRootLastFrameExclusive":11,"role":"outlined-root-title-at-frozen-root-frame-6"})
    runtime_meta, runtime_meta_pin = read_json(ROOT / "migrations/shared-alg001-l12-p010/typography-v1/runtime-meta.json")
    assert runtime_meta["sourceSha256"] == SOURCE_SHA
    assert [{k:i[k] for k in ["id","firstFrame","lastFrameExclusive"]} for i in suppression] == runtime_meta["exactSuppressionInstances"]
    assert len(suppression) == 58
    _, self_pin = stable_read(Path(__file__))
    result = {
        "schemaVersion":1,"kind":"p010-native-typography-source-inventory","animationId":"shared-alg001-l12-p010","sourceSha256":SOURCE_SHA,
        "inputs":inputs,"generator":self_pin,"header":catalog["header"],
        "summary":catalog["summary"] | {"textPlacementGenerations":53,"runInstancePairs":77,"compositeSignedAxisLabels":20,"sharedZeroLabels":1,"orderedPairs":4,"outlinedTitleDefinitions":1,"reviewedShapes":58,"glossaryInstanceMappings":10,"exactNativeSuppressionInstances":58},
        "claimBoundary":{"structuralAndStaticEngineeringReviewOnly":True,"visibilityMethod":"source placement updates, exact per-run pens and font-ink extrema with authored rectangle bounds; text alpha retained; source mask fill alpha not treated as visibility multiplier","possiblePartialInkIsNotGuaranteedVisiblePixel":True,"sourceNaturalEntryEstablished":False,"modernTypographyImplemented":False,"registered":False,"originalRuntime":False,"audioAccepted":False,"humanReview":False,"ownerAccepted":False,"strictComplete":False,"published":False,"countsDoNotEstablishAcceptance":True},
        "sourceGeometry":geometry_pin,"generatedNativeTextData":text_pin,
        "sourceEntryCondition":copy.deepcopy(geometry["sourceEntryCondition"]) | {"rootInstanceId":"root/depth-1/generation-1","childTerminalActionNotPresent":True,"originalHostTerminalOrLoopPolicyUnknown":True},
        "fontGlyphInkBounds":copy.deepcopy(geometry["fontGlyphInkBounds"]),"textDefinitions":definitions,"textInstances":text_instances,"runInstanceVisibilitySummary":visibility,"nativeRunInstanceMetrics":metrics_instances,
        "axisCompositeLabels":axis_labels,"originLabel":{"value":0,"sharedByAxes":["x","y"],**component(42)},"axisNames":[{"text":"X-axis",**component(44)},{"text":"Y-axis",**component(47)}],"orderedPairs":ordered_pairs,
        "maskDefinitions":copy.deepcopy(geometry["maskDefinitions"]),"masks":copy.deepcopy(geometry["maskInstances"]),
        "shapeDefinitions":shape_entries,"shapeClassificationSource":vector_pin,"outlinedTitle":{"literal":"Graphing in the Coordinate Plane: Vocabulary","characterId":97,"sourceInstanceId":"root/depth-108/generation-1","depth":108,"generation":1,"sourceRootFrames":[6,10],"matrixTwips":root_pose[108]["matrix"],"nativeReplacementBoundToExactInstance":True},
        "nativeSuppressionInstances":suppression,"nativeSuppressionCrosscheck":runtime_meta_pin,"suppressionDenominators":{"shapeDefinitions":58,"suppressedPlacementInstances":58,"sourceTextPlacementInstances":53,"sourceUnderlinePlacementInstances":4,"rootOutlinedTitlePlacementInstances":1,"sameNumberDifferentMembership":True,"instructionalShapeDefinitionsRetained":50},
        "glossaryButtons":buttons,"glossaryInstances":glossary_instances,"glossaryContract":contract_pin,"glossaryContractValidation":glossary_validation_pin,
        "languagePolicy":{"sourceTextLanguage":"en","sourceSpanishTextPresent":False,"spanishTranslationAccepted":False,"nativeRoute":"preserve explicit English source fallback until source-supported Spanish copy is separately accepted","sourceGrammarPreserved":True,"unreviewedGrammarCharacters":[32,36],"editorialCorrectionRequiresDeliberateSeparateReview":True},
        "maskDiagnosticReview":{"originalSealedClassification":vector_pin,"mainCorrection":correction_pin,"rawChild465VsOpaqueDifferenceBounds":[65,85,697,195],"graphRegionDifferenceBounds":None,"effectiveFinding":"Difference was observed in clipped prose; the separate Main pixel comparison found no graph-region difference. The old sealed text/axes sentence remains historical and is not repeated as an accepted finding.","rawMaskFillAlpha":{"18":164,"30":184},"rawExportPreserved":True,"maskedTextGeometryMethod":"closed rectangle geometry; preserve instance alpha; authored fill alpha is not a mask visibility multiplier","originalRuntimeVerified":False},
        "upstreamChecks":{"geometryCommand":geometry_check,"textDataCommand":text_check,"physicalSourceCatalogReparsed":True,"sourceRawCanvasReceipt":raw_pin,"sourceCandidateReceipt":candidate_pin,"vectorReviewArtifactsRehashed":len(capture["reviewArtifacts"]),"allShapePayloadAndTagRecordsRehashed":58,"allNativeRunMetricsRecomputed":52,"allRunInstanceSourceSummariesCompared":77,"glossaryContractTestsPassed":16},
    }
    # Last read verifies inputs did not change during the independent source checks.
    for pin in list(verified_pins.values()):
        verify_pin(pin)
    return result


def report(inventory, pin):
    rows = "\n".join(f"| {p['letter']} | `{p['literal']}` | {p['coordinateComponents'][0]['firstFrame']} / {p['coordinateComponents'][1]['firstFrame']} | {p['callout']['firstFrame']} |" for p in inventory["orderedPairs"])
    glossary_rows = "\n".join(f"| {g['instanceId']} | `{g['sourceRunId']}` [{g['spanStart']},{g['spanEnd']}) | {g['sourceKeyAttribute']} | {g['dictionaryLookupKey']} | {g['firstReadableFrame']} |" for g in inventory["glossaryInstances"])
    return f"""# P010 typography source inventory — 2026-09-27

This is the P010 source and static engineering inventory for `shared-alg001-l12-p010` / `VB/L12VB05.swf`. It binds the physical SWF, independent maintained parser, sealed public-tool Canvas export, original source geometry, generated native text data, all 58 shape classifications and the source-linked glossary contract. It does not execute Flash, change the registry, operate the My Lesson host, listen to audio, or establish acceptance.

Inventory: `migrations/shared-alg001-l12-p010/audit/typography-source-inventory-v1.json`, {pin['bytes']:,} bytes, SHA-256 `{pin['sha256']}`. Source: {183770:,} bytes, SHA-256 `{SOURCE_SHA}`. Original source geometry remains unchanged at SHA-256 `{GEOMETRY_SHA}`.

## Source domain and teaching roles

The root declares 10 frames and places sprite 96 at root frame 6 with matrix `[1,0,0,1,8248,5666]` twips. The child declares 465 frames. Root stop actions do not prove child termination; the child has no terminal ActionScript stop. The original host's terminal/loop policy remains unknown.

The source has 28 static text definitions, 52 exact runs, 53 text placement generations and 77 run/instance pairs. The inventory retains every source text ID, per-run glyph/advance/pens, text matrix, source-tag hash, placement event, source alpha and conservative rectangle visibility summary. It adds source-supported roles for the four definition groups, the shared zero, X/Y axis names, reused digits/signs, four point letters, split ordered-pair labels and their callouts.

Twenty signed axis labels use source depth mappings. Ten negative signs share definition 11 at source horizontal scale `1.4901885986328125`; digits and signs remain separate source components. All axis labels, the shared origin and both names retain their independent source placements and fade timing.

## Per-run baseline and ordered-pair evidence

Each of the 52 runs has its own pen/baseline, advance, font height and source text matrix. The 77 run/instance records retain those metrics and exact source visibility boundaries. A single definition-level baseline is prohibited. Callouts 56, 70, 85 and 95 each have three baselines at 380, 900 and 1420 twips. Source run x offsets differ between lines and callouts and remain unflattened. Stage baseline projection uses the run pen, text matrix, instance matrix and root sprite matrix in that order; later placement matrices remain in exact source events.

| Point | Source pair | Fragment placement frames | Callout placement frame |
| --- | --- | --- | --- |
{rows}

Definition 50, `(5,`, is reused at depth 86 for A and depth 104 for D. Its two instance visibility summaries differ; no character-ID-only reveal rule is valid. A coordinate fragment's placement frame is not its complete ink or full opacity boundary. All 77 precise run summaries are retained for consumption by the maintained text generator.

## Shapes, title and exact native replacement membership

All 58 vector definitions were independently matched to decompressed physical SWF payloads and complete tag records, XML bounds and the sealed visual classification. The categories are 50 instructional graphics, two mask definitions, four glossary underline definitions, one hit-only region and one outlined title. Every referenced visual review artifact was rehashed. Source panel, coordinate grid, axes, ticks, origin, plotted points, red paths, guide lines and callout backgrounds retain their source graphics.

Root shape 97 at depth 108, generation 1, is the outlined title `Graphing in the Coordinate Plane: Vocabulary`. Its identity matrix and root frame 6–10 lifetime are retained. Native title replacement is bound to this exact placement.

There are also exactly 58 native suppression **instances**: 53 source text placements, four underline placements and the one root title. This is a different membership and denominator from the 58 shape **definitions**. The inventory independently derives those instance IDs and compares them to the current typography runtime metadata; it does not authorize broad shape suppression.

## Masks, reveal and diagnostic correction

Shape 18 masks depths 1→10 from child frame 10 and 11→20 from frame 69. Shape 30 masks depths 21→28 from frame 113 and 29→36 from frame 173. Exact mask histories and verified closed rectangles are retained. Prose run complete-ink/full-opacity boundaries are `[12,17,25,40,50,58,69]`, `[86,90,96,97]`, `[118,134,154,165,173]` and `[181,190,195,195]` for text definitions 20, 26, 32 and 36 respectively. Partial ink is a conservative geometry indication, not an observed original-runtime visible pixel.

The raw FFDec mask fills have alpha 164/255 and 184/255; raw exports remain preserved. Mask visibility is based on filled geometry while source **text-instance** opacity stays independent. The earlier sealed vector report's text/axes opacity sentence is superseded only in this successor's effective finding by the separate Main comparison: raw versus opaque child frame 465 differs within `[65,85,697,195]`, and the graph-region difference bounds are `null`. No axis difference or Flash runtime equivalence is claimed.

## Glossary source instance mappings

The nine button definitions produce ten exact instance mappings; Position is reused at depths 8 and 34 with separate source text and readable boundaries. All buttons use hit-only shape 21 and preserve `_global.KeyAttribute`, `_root.DoHyperLinks()` and child stop calls. The maintained contract's 16 tests passed, including exact source keys, hit geometry/lexical spans, complete-run boundaries, reused Position, independent length/width spans, pending state and close/Replay/navigation behavior. Close stays paused until explicit resume; original host return parity is unverified.

| Button instance | Text run and half-open span | Raw source key | Lookup key | First readable frame |
| --- | --- | --- | --- | --- |
{glossary_rows}

Only `length` → `Length` is an explicit lookup alias. `Geometric figures` retains its exact source key. Display labels and dictionary translations remain separate from source keys. Dictionary content acceptance is not established by these source mappings.

## Language and independent gates

Every literal English run is preserved, including the source grammar in definitions 32 and 36. Any grammar revision requires deliberate editorial review. Spanish navigation does not establish Spanish animation text: preserve an explicit English fallback until source-supported Spanish copy is accepted.

The producer independently reparses the physical SWF; runs the original geometry and text-data reproducibility checks; verifies raw Canvas and candidate closure; rehashes all 110 vector review artifacts; verifies all 58 shape payload/tag records; recomputes 52 run metrics; compares all 77 source run/instance summaries; and binds the 16/16 glossary test receipt. `--check` regenerates this inventory and report byte for byte. No source archive, prior audit report/receipt, candidate, product file or registry is written.

Original runtime, visual fidelity, listening/audio acceptance, human review, Owner acceptance, strict completion and publication remain separate and unaccepted by this artifact.
"""


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ["--write", "--check"], "use --write or --check"
    inventory = build()
    data = (json.dumps(inventory, ensure_ascii=False, indent=2) + "\n").encode()
    inventory_path = AUDIT / "typography-source-inventory-v1.json"
    pin = {"path":str(inventory_path.relative_to(ROOT)),"bytes":len(data),"sha256":hashlib.sha256(data).hexdigest()}
    report_data = report(inventory, pin).encode()
    report_path = ROOT / "migrations/shared-alg001-l12-p010/evidence/TYPOGRAPHY_SOURCE_INVENTORY_2026-09-27.md"
    report_pin = {"path":str(report_path.relative_to(ROOT)),"bytes":len(report_data),"sha256":hashlib.sha256(report_data).hexdigest()}
    receipt_path = REVIEW / "typography-source-inventory-receipt.json"
    receipt = {"schemaVersion":1,"kind":"p010-typography-source-inventory-receipt","animationId":inventory["animationId"],"sourceSha256":SOURCE_SHA,"outputs":[pin,report_pin],"generator":inventory["generator"],"inputs":inventory["inputs"],"summary":inventory["summary"],"upstreamChecks":inventory["upstreamChecks"],"claimBoundary":inventory["claimBoundary"]}
    receipt_data = (json.dumps(receipt, ensure_ascii=False, indent=2) + "\n").encode()
    outputs = [(inventory_path,data),(report_path,report_data),(receipt_path,receipt_data)]
    if sys.argv[1] == "--write":
        assert all(not path.exists() for path, _ in outputs), "new output already exists; use --check"
        for path, content in outputs:
            assert path.parent.is_dir(), f"expected existing authorized directory: {path.parent}"
            with path.open("xb") as handle:
                handle.write(content)
    else:
        for path, content in outputs:
            actual, _ = stable_read(path, record=False)
            assert actual == content, f"generated output drift: {path}"
    print(json.dumps({"status":"P010_TYPOGRAPHY_SOURCE_INVENTORY_WRITTEN" if sys.argv[1] == "--write" else "P010_TYPOGRAPHY_SOURCE_INVENTORY_VERIFIED_READ_ONLY","inventory":pin,"report":report_pin,"summary":inventory["summary"],"claimBoundary":inventory["claimBoundary"]}))


if __name__ == "__main__":
    main()
