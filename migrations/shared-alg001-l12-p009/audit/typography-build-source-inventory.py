#!/usr/bin/env python3
"""P009 static typography evidence. This does not execute Flash or admit a page."""
from pathlib import Path
import hashlib
import json
import math
import os
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "migrations/shared-alg001-l12-p009/audit"
OUTPUT = ROOT / "output/playwright/p009-source-native-20260927-v1"
SOURCE = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB04.swf")
SOURCE_SHA = "d8bb6bfb4632fc528a0e14092277d95b2d96998aaeab2f0c1252a0233f35f533"
XML_SHA = "cba1ba1f5ee73ed6f9c33f96d5288dd4aa56e9f51612eda0d49996a68b81c77f"


def stable_read(path, expected=None):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    data = path.read_bytes()
    after = path.lstat()
    assert (before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_ino, after.st_size, after.st_mtime_ns), path
    digest = hashlib.sha256(data).hexdigest()
    assert expected is None or digest == expected, path
    return data, {"path": str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path), "bytes": len(data), "sha256": digest}


def point(matrix, xy):
    a, b, c, d, x, y = matrix
    return [a * xy[0] + c * xy[1] + x, b * xy[0] + d * xy[1] + y]


def transformed_bounds(matrix, bounds):
    corners = [point(matrix, [x, y]) for x in [bounds[0], bounds[2]] for y in [bounds[1], bounds[3]]]
    return [min(p[0] for p in corners), min(p[1] for p in corners), max(p[0] for p in corners), max(p[1] for p in corners)]


def glyph_bounds(shape):
    x = y = 0
    points = []
    for item in shape.find("shapeRecords"):
        kind, attr = item.attrib["type"], item.attrib
        if kind == "StyleChangeRecord":
            assert attr.get("stateNewStyles") != "true", "unexpected font style array"
            if attr.get("stateMoveTo") == "true":
                x, y = int(attr["moveDeltaX"]), int(attr["moveDeltaY"])
        elif kind == "StraightEdgeRecord":
            points.append([x, y])
            x += int(attr.get("deltaX", 0))
            y += int(attr.get("deltaY", 0))
            points.append([x, y])
        elif kind == "CurvedEdgeRecord":
            start = [x, y]
            control = [x + int(attr["controlDeltaX"]), y + int(attr["controlDeltaY"])]
            end = [control[0] + int(attr["anchorDeltaX"]), control[1] + int(attr["anchorDeltaY"])]
            points.extend([start, end])
            for axis in [0, 1]:
                denominator = start[axis] - 2 * control[axis] + end[axis]
                if denominator:
                    t = (start[axis] - control[axis]) / denominator
                    if 0 < t < 1:
                        points.append([(1-t)**2 * start[i] + 2*(1-t)*t*control[i] + t*t*end[i] for i in [0, 1]])
            x, y = end
        else:
            assert kind == "EndShapeRecord", kind
    return None if not points else [min(p[0] for p in points), min(p[1] for p in points), max(p[0] for p in points), max(p[1] for p in points)]


def serialize_event(event):
    return {key: event[key] for key in ["eventId", "frame", "kind", "sourceTagOffset", "sourceTagSha256", "depth", "instanceId", "move", "characterId", "matrix", "colorTransform", "ratio", "name", "clipDepth", "visible"] if key in event}


def poses(timeline):
    active = {}
    states = []
    by_frame = {}
    for event in timeline["events"]:
        by_frame.setdefault(event["frame"], []).append(event)
    for frame in range(1, timeline["declaredFrameCount"] + 1):
        for event in by_frame.get(frame, []):
            if event["kind"] == "remove":
                active.pop(event["depth"], None)
            elif event["kind"] == "place":
                # PlaceObject2 Move+Character replacement inherits unspecified properties.
                # A source instance generation is an identity, not a transform reset.
                state = dict(active.get(event["depth"], {})) if event["move"] else {}
                state.setdefault("matrix", [1, 0, 0, 1, 0, 0])
                state.setdefault("colorTransform", {"multiply": [256]*4, "add": [0]*4, "divisor": 256})
                for key in ["instanceId", "depth", "characterId", "matrix", "colorTransform", "ratio", "name", "clipDepth", "visible"]:
                    if key in event:
                        state[key] = event[key]
                active[event["depth"]] = state
        states.append({depth: dict(value) for depth, value in active.items()})
    return states


assert SOURCE.resolve() == SOURCE, "physical source path must not traverse symlink"
source_data, source_pin = stable_read(SOURCE, SOURCE_SHA)
copy_data, copy_pin = stable_read(OUTPUT / "source-copy.swf", SOURCE_SHA)
xml_data, xml_pin = stable_read(AUDIT / "movie.xml", XML_SHA)
assert len(source_data) == len(copy_data) == 165405
reader_path = ROOT / "scripts/lib/swf-text-source-catalog.mjs"
_, reader_pin = stable_read(reader_path)
code = "import fs from 'node:fs';import {collectSwfTextSourceCatalog} from './scripts/lib/swf-text-source-catalog.mjs';process.stdout.write(JSON.stringify(collectSwfTextSourceCatalog(fs.readFileSync(process.argv[1]))));"
catalog = json.loads(subprocess.run(["node", "--input-type=module", "--eval", code, str(SOURCE)], cwd=ROOT, check=True, capture_output=True, text=True).stdout)
assert catalog["sourceSha256"] == SOURCE_SHA
assert catalog["summary"]["textDefinitions"] == 16 and catalog["summary"]["textRuns"] == 32
assert catalog["summary"]["decodedRuns"] == 32 and catalog["summary"]["unparsedTags"] == 0
assert catalog["summary"]["shapeDefinitions"] == 37 and catalog["summary"]["bitmapDefinitions"] == 0

xml = ET.fromstring(xml_data)
font = next(e for e in xml.iter() if e.attrib.get("type") == "DefineFont2Tag")
assert font.attrib["fontID"] == "3"
glyph_boxes = [glyph_bounds(e) for e in font.find("glyphShapeTable")]
font_codes = [int(e.text) for e in font.find("codeTable")]
assert len(glyph_boxes) == len(font_codes) == 36
assert font_codes == catalog["fonts"][0]["codes"]
shape_boxes = {}
for item in xml.iter():
    if item.attrib.get("type", "").startswith("DefineShape") and "shapeId" in item.attrib:
        bounds = item.find("shapeBounds")
        shape_boxes[int(item.attrib["shapeId"])] = [int(bounds.attrib[k]) for k in ["Xmin", "Ymin", "Xmax", "Ymax"]]
assert set(shape_boxes) == {s["characterId"] for s in catalog["shapeDefinitions"]}
assert shape_boxes[1] == [-5724, -270, 5725, 270] and shape_boxes[29] == [-2100, -270, 2100, 270]

main = next(t for t in catalog["timelines"] if t["timelineId"] == "sprite-62")
root = next(t for t in catalog["timelines"] if t["timelineId"] == "root")
assert main["declaredFrameCount"] == 394 and root["declaredFrameCount"] == 10
main_poses = poses(main)
root_pose = poses(root)[5]
assert root_pose[1]["characterId"] == 62 and root_pose[1]["matrix"] == [1, 0, 0, 1, 8248, 5666]
stage_matrix = root_pose[1]["matrix"]
instances = main["instances"] + root["instances"]
all_events = main["events"] + root["events"]

roles = {4: "definition-part-1", 11: "shared-origin-label", 13: "horizontal-axis-name", 16: "vertical-axis-name", 17: "reused-digit-1", 18: "reused-negative-sign", 19: "reused-digit-2", 20: "reused-digit-3", 21: "reused-digit-4", 22: "reused-digit-5", 26: "definition-part-2", 31: "coordinate-order-part-1", 43: "coordinate-order-part-2", 59: "plotted-ordered-pair-label", 60: "first-coordinate-white-flash", 61: "second-coordinate-white-flash"}
texts = []
glyphs_by_character = {}
for definition in catalog["textDefinitions"]:
    pen_x = pen_y = 0
    glyphs = []
    runs = []
    for run in definition["runs"]:
        if run["changed"]["xOffset"]:
            pen_x = run["xOffsetTwips"]
        if run["changed"]["yOffset"]:
            pen_y = run["yOffsetTwips"]
        run_glyphs = []
        for glyph_index, glyph in enumerate(run["glyphs"]):
            assert glyph["code"] == font_codes[glyph["index"]]
            box = glyph_boxes[glyph["index"]]
            scale = run["fontHeightTwips"] / 1024
            local_box = transformed_bounds(definition["matrix"], [pen_x + box[0]*scale, pen_y + box[1]*scale, pen_x + box[2]*scale, pen_y + box[3]*scale]) if box else None
            entry = {"sourceTextId": run["sourceTextId"], "glyphOrdinalInRun": glyph_index, "unicode": glyph["unicode"], "fontGlyphIndex": glyph["index"], "advanceTwips": glyph["advanceTwips"], "penTwips": [pen_x, pen_y], "inkBoundsInTextDefinitionTwips": local_box}
            glyphs.append(entry)
            run_glyphs.append(entry)
            pen_x += glyph["advanceTwips"]
        runs.append({key: value for key, value in run.items() if key != "glyphs"} | {"glyphs": run_glyphs})
    glyphs_by_character[definition["characterId"]] = glyphs
    texts.append({key: value for key, value in definition.items() if key != "runs"} | {"role": roles[definition["characterId"]], "literalText": "".join(r["text"] for r in definition["runs"]), "runs": runs})


def alpha(state, source_alpha=255):
    color = state["colorTransform"]
    return max(0, min(255, source_alpha*color["multiply"][3]/256 + color["add"][3])) / 255


def glyph_status(box, masks):
    if box is None:
        return "empty-space-glyph"
    for mask in masks:
        if box[2] <= mask[0] or box[0] >= mask[2] or box[3] <= mask[1] or box[1] >= mask[3]:
            return "outside-mask-bounds"
    if all(box[0] >= m[0] and box[1] >= m[1] and box[2] <= m[2] and box[3] <= m[3] for m in masks):
        return "full-ink-bounds-contained"
    return "possible-partial-ink"


text_instances = []
run_instance_visibility = []
for instance in main["instances"]:
    cid = instance["characterId"]
    if cid not in glyphs_by_character:
        continue
    frames = []
    for frame in range(instance["firstFrame"], instance["lastFrameExclusive"]):
        pose = main_poses[frame-1]
        state = pose[instance["depth"]]
        assert state["instanceId"] == instance["instanceId"]
        masks = [transformed_bounds(m["matrix"], shape_boxes[m["characterId"]]) for depth, m in pose.items() if "clipDepth" in m and depth < instance["depth"] <= m["clipDepth"]]
        source_alpha = alpha(state)
        statuses = []
        for glyph in glyphs_by_character[cid]:
            box = glyph["inkBoundsInTextDefinitionTwips"]
            box = transformed_bounds(state["matrix"], box) if box else None
            statuses.append(glyph_status(box, masks) if source_alpha > 0 else "alpha-zero")
        frames.append({"frame": frame, "alpha": source_alpha, "maskBoundsTwips": masks, "glyphGeometryStates": statuses})
    first_pose = main_poses[instance["firstFrame"]-1][instance["depth"]]
    summary = {key: instance[key] for key in ["instanceId", "timelineId", "depth", "generation", "characterId", "firstFrame", "lastFrameExclusive", "createdByEventId"]}
    codes = {"empty-space-glyph": "E", "outside-mask-bounds": "O", "full-ink-bounds-contained": "F", "possible-partial-ink": "P", "alpha-zero": "Z"}
    segments = []
    for value in frames:
        encoded = "".join(codes[s] for s in value["glyphGeometryStates"])
        if segments and segments[-1]["glyphGeometryCodes"] == encoded and segments[-1]["alpha"] == value["alpha"]:
            segments[-1]["lastFrame"] = value["frame"]
        else:
            segments.append({"firstFrame": value["frame"], "lastFrame": value["frame"], "alpha": value["alpha"], "glyphGeometryCodes": encoded})
    summary.update({"role": roles[cid], "firstPose": first_pose, "sourceInstancePath": [root_pose[1]["instanceId"], instance["instanceId"]], "events": [serialize_event(e) for e in main["events"] if e.get("instanceId") == instance["instanceId"]], "visibilitySegments": segments, "glyphGeometryCodeLegend": codes, "maskCoordinatesRecoverableFromExactMaskEvents": True})
    text_instances.append(summary)
    start = 0
    definition = next(t for t in texts if t["characterId"] == cid)
    for run in definition["runs"]:
        end = start + len(run["glyphs"])
        ink = [i for i in range(start, end) if glyphs_by_character[cid][i]["inkBoundsInTextDefinitionTwips"] is not None]
        possible = next((v["frame"] for v in frames if any(v["glyphGeometryStates"][i] in ["possible-partial-ink", "full-ink-bounds-contained"] for i in ink)), None)
        full = next((v["frame"] for v in frames if ink and all(v["glyphGeometryStates"][i] == "full-ink-bounds-contained" for i in ink)), None)
        opaque = next((v["frame"] for v in frames if ink and v["alpha"] == 1 and all(v["glyphGeometryStates"][i] == "full-ink-bounds-contained" for i in ink)), None)
        run_instance_visibility.append({"instanceId": instance["instanceId"], "sourceTextId": run["sourceTextId"], "literalText": run["text"], "firstPossibleInkFrame": possible, "firstAllInkBoundsContainedFrame": full, "firstAllInkBoundsContainedAndFullOpacityFrame": opaque})
        start = end

axis_components = [("x", 1, 42, None), ("x", -1, 43, 44), ("x", 2, 45, None), ("x", -2, 46, 47), ("x", -3, 48, 49), ("x", 3, 50, None), ("x", 4, 51, None), ("x", -4, 52, 53), ("x", -5, 54, 55), ("x", 5, 56, None), ("y", -1, 58, 59), ("y", 1, 60, None), ("y", -2, 61, 62), ("y", 2, 63, None), ("y", -3, 64, 65), ("y", 3, 66, None), ("y", 4, 67, None), ("y", -4, 68, 69), ("y", -5, 70, 71), ("y", 5, 72, None)]
axis_labels = []
for axis, value, digit_depth, sign_depth in axis_components:
    members = [main_poses[25][digit_depth]] + ([main_poses[25][sign_depth]] if sign_depth else [])
    for member in members:
        assert member["characterId"] in glyphs_by_character
    digit = next(t for t in texts if t["characterId"] == members[0]["characterId"])["literalText"]
    sign = next(t for t in texts if t["characterId"] == members[1]["characterId"])["literalText"] if sign_depth else ""
    assert sign + digit == str(value)
    axis_labels.append({"axis": axis, "value": value, "sourceLiteral": sign + digit, "components": [{"instanceId": m["instanceId"], "characterId": m["characterId"], "matrixTwips": m["matrix"]} for m in members], "evidence": "source placements plus static FFDec diagram review; no assignment from character ID alone"})

shape_roles = {1: "rectangular-mask-only", 2: "glossary-underlines-body-part-1", 5: "glossary-button-hit-test-only", 10: "orange-coordinate-grid-and-border", 12: "horizontal-axis-line-and-arrowheads", 14: "vertical-axis-line", 15: "vertical-axis-line-and-arrowheads", 23: "horizontal-axis-ticks", 24: "vertical-axis-ticks-and-red-origin-dot", 25: "glossary-underlines-body-part-2", 29: "rectangular-mask-only", 30: "glossary-underlines-coordinate-order", 34: "blue-origin-ring", 35: "black-coordinate-guide-L", 36: "blue-origin-ring-plus-1-horizontal-unit-tick", 37: "blue-origin-ring-plus-2-horizontal-unit-ticks", 38: "blue-origin-ring-plus-3-horizontal-unit-ticks", 39: "blue-origin-ring-plus-4-horizontal-unit-ticks", 40: "black-coordinate-guide-L-variant", 41: "blue-unit-tick-emphasis", 42: "blue-origin-ring-plus-1-vertical-unit-tick", 44: "blue-origin-ring-plus-2-vertical-unit-ticks", 45: "blue-unit-tick-emphasis-variant", 46: "red-plot-point", 47: "red-path-progress-2-dots", 48: "red-path-progress-3-dots", 49: "red-path-progress-4-dots", 50: "red-path-progress-5-dots", 51: "red-path-progress-6-dots", 52: "red-path-progress-7-dots", 53: "red-path-horizontal-progress-8-dots", 54: "red-path-bend-progress", 55: "red-path-upward-progress-2-dots", 56: "red-path-upward-progress-3-dots", 57: "red-path-upward-progress-4-dots", 58: "ordered-pair-label-background", 63: "outlined-native-title-replacement"}
_, preview_pin = stable_read(OUTPUT / "shape-review-inputs.json")
previews = json.loads((OUTPUT / "shape-review-inputs.json").read_text())
shape_entries = []
for shape in catalog["shapeDefinitions"]:
    cid = shape["characterId"]
    preview = next(e for e in previews["entries"] if e["characterId"] == cid)
    for key, hash_key in [("svg", "svgSha256"), ("preview", "previewSha256")]:
        stable_read(ROOT / preview[key], preview[hash_key])
    matches = [i for i in instances if i["characterId"] == cid]
    disposition = "replace-exact-title-instance-with-native-text" if cid == 63 else "replace-underlines-with-native-linked-term-decoration" if cid in [2, 25, 30] else "retain-mask-geometry-for-source-visibility" if cid in [1, 29] else "retain-hit-test-provenance-without-visible-blue-rectangle" if cid == 5 else "preserve-educational-geometry"
    shape_entries.append(shape | {"boundsTwips": shape_boxes[cid], "reviewRole": shape_roles[cid], "nativeDisposition": disposition, "visualTranscription": "Graphing in the Coordinate Plane: Vocabulary" if cid == 63 else None, "preview": preview, "sourceInstances": [i | {"events": [serialize_event(e) for e in all_events if e.get("instanceId") == i["instanceId"]]} for i in matches]})
assert len(shape_entries) == 37 and len(text_instances) == 44

button_to_run = {6: "character-4/run-1", 7: "character-4/run-3", 8: "character-4/run-5", 9: "character-4/run-7", 27: "character-26/run-0", 28: "character-26/run-2", 32: "character-31/run-1", 33: "character-31/run-3"}
buttons = []
button_pins = []
for button in catalog["buttonDefinitions"]:
    cid = button["characterId"]
    script_path = AUDIT / f"actionscript/as/scripts/DefineButton2_{cid}/BUTTONCONDACTION on(release).as"
    script_data, pin = stable_read(script_path)
    target = re.search(r'_global\.KeyAttribute\s*=\s*"([^"]+)"', script_data.decode())[1]
    assert "_root.DoHyperLinks();" in script_data.decode() and "_root.animation_mc.animation.stop();" in script_data.decode()
    assert all(s["states"] == {"up": False, "over": False, "down": False, "hitTest": True} for s in button["statePlacements"])
    button_pins.append(pin)
    buttons.append(button | {"sourceRunId": button_to_run[cid], "sourceKeyAttribute": target, "actionScriptPin": pin, "sourceInstances": [i for i in main["instances"] if i["characterId"] == cid], "modernDictionaryEntryId": None, "modernDictionaryResolution": "requires actual source-linked dictionary; no invented entry or translation"})

inventory = {"schemaVersion": 1, "kind": "p009-native-typography-source-inventory", "animationId": "shared-alg001-l12-p009", "sourceSha256": SOURCE_SHA, "inputs": [source_pin, copy_pin, xml_pin, reader_pin, preview_pin] + button_pins, "header": catalog["header"], "summary": catalog["summary"] | {"textPlacementGenerations": len(text_instances), "compositeSignedAxisLabels": 20, "sharedZeroLabels": 1, "outlinedTitleDefinitions": 1, "reviewedShapes": 37}, "claimBoundary": {"structuralAndStaticEngineeringReviewOnly": True, "visibilityMethod": "pure placement updates, font-ink extrema and authored rectangular mask bounds; alpha retained; no ActionScript execution or original-runtime pixel observation", "possiblePartialInkIsNotGuaranteedVisiblePixel": True, "sourceNaturalEntryEstablished": False, "modernTypographyImplemented": False, "registered": False, "originalRuntime": False, "audioAccepted": False, "humanReview": False, "ownerAccepted": False, "strictComplete": False, "published": False}, "sourceEntryCondition": {"rootFrame": 6, "rootInstanceId": "root/depth-1/generation-1", "mainCharacterId": 62, "mainFrameCount": 394, "matrixTwips": stage_matrix, "sourceTimelinePlaybackNotExecuted": True}, "fontGlyphInkBounds": [{"fontId": 3, "glyphIndex": i, "code": c, "unicode": chr(c), "boundsFontUnits": glyph_boxes[i], "unitsPerEm": 1024} for i, c in enumerate(font_codes)], "textDefinitions": texts, "textInstances": text_instances, "runInstanceVisibilitySummary": run_instance_visibility, "axisCompositeLabels": axis_labels, "originLabel": {"value": 0, "sharedByAxes": ["x", "y"], "instanceId": "sprite-62/depth-36/generation-1", "characterId": 11}, "axisNames": [{"text": "X-axis", "instanceId": "sprite-62/depth-38/generation-1", "characterId": 13}, {"text": "Y-axis", "instanceId": "sprite-62/depth-41/generation-1", "characterId": 16}], "orderedPair": {"literal": "(4,2)", "semanticCoordinates": [4, 2], "labelInstanceId": "sprite-62/depth-81/generation-1", "firstPlacementFrame": 284, "firstPositiveOpacityFrame": 285, "fullOpacityFrame": 291, "firstCoordinateFlashCharacterId": 60, "firstCoordinateFlashFrames": [353, 355, 357], "secondCoordinateFlashCharacterId": 61, "secondCoordinateFlashFrames": [383, 385, 387], "flashIsWhiteOverlayRatherThanAdditionalIndependentLabel": True}, "masks": [{"instanceId": i["instanceId"], "characterId": i["characterId"], "depth": i["depth"], "boundsTwips": shape_boxes[i["characterId"]], "events": [serialize_event(e) for e in main["events"] if e.get("instanceId") == i["instanceId"]]} for i in main["instances"] if i["depth"] in [1, 13, 21, 29]], "shapeDefinitions": shape_entries, "glossaryButtons": buttons, "languagePolicy": {"sourceTextLanguage": "en", "sourceSpanishTextPresent": False, "spanishTranslationAccepted": False, "nativeRoute": "preserve explicit English source fallback until source-supported Spanish copy is separately accepted"}}
destination = AUDIT / "typography-source-inventory-v1.json"
destination.write_text(json.dumps(inventory, ensure_ascii=False, indent=2) + "\n")
_, pin = stable_read(destination)
print(json.dumps({"inventory": pin, "summary": inventory["summary"], "maskedRunVisibility": [x for x in run_instance_visibility if x["sourceTextId"].split('/')[0] in ['character-4', 'character-26', 'character-31', 'character-43']], "glossaryTargets": [{"button": b["characterId"], "run": b["sourceRunId"], "sourceKeyAttribute": b["sourceKeyAttribute"]} for b in buttons]}))
