#!/usr/bin/env python3
"""Source-only P010 glyph/rectangular-mask evidence; does not admit or play a page."""
from pathlib import Path
import hashlib
import json
import subprocess
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[3]
AUDIT = ROOT / "migrations/shared-alg001-l12-p010/audit"
SOURCE = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB05.swf")
SOURCE_SHA = "a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd"
XML_SHA = "94c06c842ebd821d5d239666e3e00e4d639f47d4861149438a0a6a1cc02912da"


def stable_read(path, expected=None):
    assert path.resolve() == path, f"nonphysical path: {path}"
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


assert len(sys.argv) == 2 and sys.argv[1] in ["--write", "--check"]
source_data, source_pin = stable_read(SOURCE, SOURCE_SHA)
copy_data, copy_pin = stable_read(AUDIT / "source-input.swf", SOURCE_SHA)
xml_data, xml_pin = stable_read(AUDIT / "movie.xml", XML_SHA)
assert len(source_data) == len(copy_data) == 183770
reader_path = ROOT / "scripts/lib/swf-text-source-catalog.mjs"
_, reader_pin = stable_read(reader_path)
code = "import fs from 'node:fs';import {collectSwfTextSourceCatalog} from './scripts/lib/swf-text-source-catalog.mjs';process.stdout.write(JSON.stringify(collectSwfTextSourceCatalog(fs.readFileSync(process.argv[1]))));"
catalog = json.loads(subprocess.run(["node", "--input-type=module", "--eval", code, str(SOURCE)], cwd=ROOT, check=True, capture_output=True, text=True).stdout)
assert catalog["sourceSha256"] == SOURCE_SHA
assert catalog["summary"]["textDefinitions"] == 28 and catalog["summary"]["textRuns"] == 52
assert catalog["summary"]["decodedRuns"] == 52 and catalog["summary"]["unparsedTags"] == 0
assert catalog["summary"]["shapeDefinitions"] == 58 and catalog["summary"]["bitmapDefinitions"] == 0
xml = ET.fromstring(xml_data)
fonts = [e for e in xml.iter() if e.attrib.get("type") == "DefineFont2Tag"]
assert len(fonts) == 1 and fonts[0].attrib["fontID"] == "3"
font = fonts[0]
glyph_boxes = [glyph_bounds(e) for e in font.find("glyphShapeTable")]
font_codes = [int(e.text) for e in font.find("codeTable")]
assert len(glyph_boxes) == len(font_codes) == 41
assert font_codes == catalog["fonts"][0]["codes"]
assert catalog["fonts"][0]["unitsPerEm"] == 1024
shape_boxes = {}
rectangles = {}
for item in xml.iter():
    if item.attrib.get("type", "").startswith("DefineShape") and "shapeId" in item.attrib:
        cid = int(item.attrib["shapeId"])
        bounds = item.find("shapeBounds")
        shape_boxes[cid] = [int(bounds.attrib[k]) for k in ["Xmin", "Ymin", "Xmax", "Ymax"]]
        if cid in [18, 30]:
            records = list(item.find("shapes/shapeRecords"))
            assert [r.get("type") for r in records] == ["StyleChangeRecord"] + ["StraightEdgeRecord"]*4 + ["EndShapeRecord"]
            assert records[0].get("stateFillStyle0") == "true" and records[0].get("fillStyle0") == "1"
            assert all(records[0].get(k) == "false" for k in ["stateFillStyle1", "stateLineStyle", "stateNewStyles"])
            fills = list(item.find("shapes/fillStyles/fillStyles"))
            assert len(fills) == 1 and fills[0].get("fillStyleType") == "0"
            assert len(item.find("shapes/lineStyles/lineStyles")) == 0
            x,y = int(records[0].get("moveDeltaX")), int(records[0].get("moveDeltaY"))
            vertices = [[x,y]]
            for r in records[1:5]:
                dx,dy = int(r.get("deltaX",0)),int(r.get("deltaY",0))
                assert (dx == 0) != (dy == 0)
                x,y = x+dx,y+dy
                vertices.append([x,y])
            box = shape_boxes[cid]
            assert vertices[-1] == vertices[0]
            assert set(map(tuple,vertices[:-1])) == {(box[0],box[1]),(box[0],box[3]),(box[2],box[1]),(box[2],box[3])}
            rectangles[cid] = {"characterId":cid,"boundsTwips":box,"verifiedClosedRectangleVerticesTwips":vertices,"authoredFillAlpha":int(fills[0].find("color").get("alpha")),"maskSemantics":"filled geometry; authored fill alpha is not a visibility multiplier"}
assert set(shape_boxes) == {s["characterId"] for s in catalog["shapeDefinitions"]}
main = next(t for t in catalog["timelines"] if t["timelineId"] == "sprite-96")
root = next(t for t in catalog["timelines"] if t["timelineId"] == "root")
assert main["declaredFrameCount"] == 465 and root["declaredFrameCount"] == 10
main_poses = poses(main)
root_pose = poses(root)[5]
assert root_pose[1]["characterId"] == 96 and root_pose[1]["matrix"] == [1,0,0,1,8248,5666]
texts = []
glyphs_by_character = {}
for definition in catalog["textDefinitions"]:
    pen_x = pen_y = 0
    glyphs = []
    runs = []
    for run in definition["runs"]:
        assert run["fontId"] == 3
        if run["changed"]["xOffset"]: pen_x = run["xOffsetTwips"]
        if run["changed"]["yOffset"]: pen_y = run["yOffsetTwips"]
        run_glyphs = []
        for ordinal, glyph in enumerate(run["glyphs"]):
            assert glyph["code"] == font_codes[glyph["index"]]
            box = glyph_boxes[glyph["index"]]
            scale = run["fontHeightTwips"] / 1024
            local_box = transformed_bounds(definition["matrix"], [pen_x+box[0]*scale,pen_y+box[1]*scale,pen_x+box[2]*scale,pen_y+box[3]*scale]) if box else None
            entry = {"sourceTextId":run["sourceTextId"],"glyphOrdinalInRun":ordinal,"unicode":glyph["unicode"],"fontGlyphIndex":glyph["index"],"advanceTwips":glyph["advanceTwips"],"penTwips":[pen_x,pen_y],"inkBoundsInTextDefinitionTwips":local_box,"sourceColorAlpha":run["colorRgba"][3]}
            glyphs.append(entry)
            run_glyphs.append(entry)
            pen_x += glyph["advanceTwips"]
        runs.append({key:value for key,value in run.items() if key != "glyphs"} | {"glyphs":run_glyphs})
    glyphs_by_character[definition["characterId"]] = glyphs
    texts.append({key:value for key,value in definition.items() if key != "runs"} | {"literalText":"".join(r["text"] for r in definition["runs"]),"runs":runs})


def alpha(state, source_alpha=255):
    color = state["colorTransform"]
    return max(0,min(255,source_alpha*color["multiply"][3]/256+color["add"][3]))/255


def glyph_status(box, masks):
    if box is None: return "E"
    for mask in masks:
        if box[2] <= mask[0] or box[0] >= mask[2] or box[3] <= mask[1] or box[1] >= mask[3]: return "O"
    if all(box[0] >= m[0] and box[1] >= m[1] and box[2] <= m[2] and box[3] <= m[3] for m in masks): return "F"
    return "P"


text_instances = []
run_visibility = []
for instance in main["instances"]:
    cid = instance["characterId"]
    if cid not in glyphs_by_character: continue
    frames = []
    for frame in range(instance["firstFrame"],instance["lastFrameExclusive"]):
        pose = main_poses[frame-1]
        state = pose[instance["depth"]]
        assert state["instanceId"] == instance["instanceId"]
        masks = []
        for depth, m in pose.items():
            if "clipDepth" in m and depth < instance["depth"] <= m["clipDepth"]:
                assert m["characterId"] in rectangles
                assert m["matrix"][1:3] == [0,0], "axis-aligned mask required for exact containment"
                masks.append(transformed_bounds(m["matrix"],shape_boxes[m["characterId"]]))
        statuses = []
        alphas = []
        for glyph in glyphs_by_character[cid]:
            box = glyph["inkBoundsInTextDefinitionTwips"]
            box = transformed_bounds(state["matrix"],box) if box else None
            a = alpha(state,glyph["sourceColorAlpha"])
            alphas.append(a)
            statuses.append(glyph_status(box,masks) if a>0 and state.get("visible",True) else "Z")
        frames.append({"frame":frame,"alpha":alphas,"codes":"".join(statuses)})
    segments = []
    for v in frames:
        if segments and segments[-1]["codes"] == v["codes"] and segments[-1]["alpha"] == v["alpha"]:
            segments[-1]["lastFrame"] = v["frame"]
        else: segments.append({"firstFrame":v["frame"],"lastFrame":v["frame"],"codes":v["codes"],"alpha":v["alpha"]})
    text_instances.append(instance | {"firstPose":main_poses[instance["firstFrame"]-1][instance["depth"]],"events":[serialize_event(e) for e in main["events"] if e.get("instanceId")==instance["instanceId"]],"visibilitySegments":segments})
    start = 0
    definition = next(t for t in texts if t["characterId"]==cid)
    for run in definition["runs"]:
        end = start+len(run["glyphs"])
        ink = [i for i in range(start,end) if glyphs_by_character[cid][i]["inkBoundsInTextDefinitionTwips"] is not None]
        possible = next((v["frame"] for v in frames if any(v["codes"][i] in ["F","P"] for i in ink)),None)
        full = next((v["frame"] for v in frames if ink and all(v["codes"][i]=="F" for i in ink)),None)
        opaque = next((v["frame"] for v in frames if ink and all(v["codes"][i]=="F" and v["alpha"][i]==1 for i in ink)),None)
        run_visibility.append({"instanceId":instance["instanceId"],"sourceTextId":run["sourceTextId"],"literalText":run["text"],"firstPossibleInkFrame":possible,"firstAllInkBoundsContainedFrame":full,"firstAllInkBoundsContainedAndFullOpacityFrame":opaque})
        start = end
assert len(text_instances)==53
masks = [i | {"events":[serialize_event(e) for e in main["events"] if e.get("instanceId")==i["instanceId"]]} for i in main["instances"] if i["characterId"] in rectangles]
assert len(masks)==4
inventory = {"schemaVersion":1,"kind":"p010-native-typography-source-geometry","animationId":"shared-alg001-l12-p010","sourceSha256":SOURCE_SHA,"inputs":[source_pin,copy_pin,xml_pin,reader_pin],"summary":catalog["summary"] | {"textPlacementGenerations":len(text_instances),"runInstancePairs":len(run_visibility),"verifiedRectangularMaskDefinitions":len(rectangles)},"claimBoundary":{"structuralGeometryOnly":True,"possiblePartialInkIsNotGuaranteedVisiblePixel":True,"staticPlacementLifetimeIsNotFullInkReveal":True,"glyphBoundsAreConservativeAfterNonAxisAlignedTextTransforms":True,"sourceNaturalEntryEstablished":False,"modernTypographyImplemented":False,"registered":False,"originalRuntime":False,"audioAccepted":False,"humanReview":False,"ownerAccepted":False,"strictComplete":False,"published":False},"sourceEntryCondition":{"rootFrame":6,"mainCharacterId":96,"mainFrameCount":465,"matrixTwips":root_pose[1]["matrix"],"sourceTimelinePlaybackNotExecuted":True},"fontGlyphInkBounds":[{"fontId":3,"glyphIndex":i,"code":c,"unicode":chr(c),"boundsFontUnits":glyph_boxes[i],"unitsPerEm":1024} for i,c in enumerate(font_codes)],"textDefinitions":texts,"textInstances":text_instances,"runInstanceVisibilitySummary":run_visibility,"glyphGeometryCodeLegend":{"E":"empty glyph","O":"outside at least one rectangular mask","F":"all ink bounds contained","P":"possible partial ink","Z":"zero alpha or hidden placement"},"maskDefinitions":list(rectangles.values()),"maskInstances":masks}
destination = AUDIT / "typography-source-geometry-v1.json"
result = (json.dumps(inventory,ensure_ascii=False,indent=2)+"\n").encode()
if sys.argv[1]=="--check": assert stable_read(destination)[0]==result, "generated geometry changed"
else:
    with destination.open("xb") as f: f.write(result)
print(json.dumps({"path":str(destination.relative_to(ROOT)),"bytes":len(result),"sha256":hashlib.sha256(result).hexdigest(),"summary":inventory["summary"],"maskedRunVisibility":[v for v in run_visibility if v["sourceTextId"].split("/")[0] in ["character-20","character-26","character-32","character-36"]]}))
