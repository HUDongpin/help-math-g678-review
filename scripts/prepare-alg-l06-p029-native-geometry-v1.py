#!/usr/bin/env python3
"""Source-derived P029 stage hit boxes; bounds are candidates, not Flash hit parity."""
import hashlib
import json
import os
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
STAGE = Path("migrations/shared-alg001-l06-p029")
PLAN = Path("migrations/shared-alg001-l06-p029/audit/source-planning-v1")
SOURCE_ROOT = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware")
SOURCE = Path("G6-G8-shared/ALG001/L6/VB/L6VB22.swf")
SWF_SHA = "cbfd012d0aff11544a252c9e2852dff30d408c634aa2a805eb0837933c3370d4"
ID = "shared-alg001-l06-p029"
FEEDBACK = {52: (51, 48, 20, "wrongClose1"),
            67: (63, 61, 21, "wrongClose3"),
            98: (89, 87, 22, "wrongClose2")}


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read(root, relative):
    path = root / relative
    if path.is_symlink() or path.resolve() != path or not path.is_file():
        raise AssertionError(f"ordinary physical file required: {path}")
    before = path.stat()
    data = path.read_bytes()
    after = path.stat()
    for key in ("st_dev", "st_ino", "st_size", "st_mtime_ns", "st_ctime_ns", "st_nlink"):
        assert getattr(before, key) == getattr(after, key), f"unstable {path}: {key}"
    assert before.st_nlink == 1, f"hardlink {path}"
    return data


def pin(root, relative):
    data = read(root, relative)
    return {"path": str(relative), "bytes": len(data), "sha256": digest(data)}


def instance(domain, object_id, name=None):
    found = [i for i in domain["instances"] if i["objectId"] == object_id
             and (name is None or i["name"] == name)]
    assert len(found) == 1, (object_id, name, len(found))
    return found[0]


def matrix(attrs):
    attrs = attrs or {}
    assert not any(k in attrs for k in ("skewX", "skewY", "rotateSkew0", "rotateSkew1")), attrs
    return (float(attrs.get("scaleX", 1)), float(attrs.get("scaleY", 1)),
            float(attrs.get("transX", 0)), float(attrs.get("transY", 0)))


def compose(parent, child):
    psx, psy, ptx, pty = parent
    csx, csy, ctx, cty = child
    return (psx * csx, psy * csy, ptx + psx * ctx, pty + psy * cty)


def rect(element):
    node = element.find("./bounds/Rectangle")
    if node is None:
        node = element.find("./size/Rectangle")
    assert node is not None, (element.tag, element.get("objectID"))
    return tuple(float(node.attrib[k]) for k in ("left", "right", "top", "bottom"))


def stage_box(bounds, transform):
    left, right, top, bottom = bounds
    sx, sy, tx, ty = transform
    xs = ((left * sx + tx) / 20, (right * sx + tx) / 20)
    ys = ((top * sy + ty) / 20, (bottom * sy + ty) / 20)
    return {"left": round(min(xs), 3), "right": round(max(xs), 3),
            "top": round(min(ys), 3), "bottom": round(max(ys), 3)}


def union(boxes):
    return {"left": min(b["left"] for b in boxes),
            "right": max(b["right"] for b in boxes),
            "top": min(b["top"] for b in boxes),
            "bottom": max(b["bottom"] for b in boxes)}


def build():
    assert os.environ.get("HELP_MATH_G678_SOURCE_ROOT") == str(SOURCE_ROOT)
    assert SOURCE_ROOT.resolve() == SOURCE_ROOT
    swf = read(SOURCE_ROOT, SOURCE)
    assert len(swf) == 567027 and digest(swf) == SWF_SHA
    plan_bytes = read(ROOT, PLAN / "source-plan-v1.json")
    display_bytes = read(ROOT, PLAN / "source-display-list-v1.json")
    xml_bytes = read(ROOT, PLAN / "source-structure.xml")
    plan, display = json.loads(plan_bytes), json.loads(display_bytes)
    assert plan["identity"]["animationId"] == ID
    assert plan["source"]["swf"]["sha256"] == SWF_SHA
    assert display["sourceSwfSha256"] == SWF_SHA
    assert digest(xml_bytes) == display["sourceXmlSha256"]
    tree = ET.fromstring(xml_bytes)
    defs = {int(e.attrib["objectID"]): e for e in tree.iter()
            if e.tag.startswith("Define") and "objectID" in e.attrib}
    root_main = instance(display["root"], 185, "animation")
    assert root_main["presentSpans"] == [[6, 10]]
    root_m = matrix(root_main["firstVisibleTransform"])
    main = display["sprites"]["185"]
    assert main["frameCount"] == 234

    def action(key):
        entry = plan["actions"]["selected"][key]
        actual = pin(ROOT, PLAN / entry["path"])
        assert actual["bytes"] == entry["bytes"]
        assert actual["sha256"] == entry["sha256"]
        return {"path": str(PLAN / entry["path"]), "sha256": entry["sha256"]}

    def button_hit(button_id, chain):
        button = defs[button_id]
        assert button.tag == "DefineButton2"
        records = []
        for record in button.findall("./buttons/Button"):
            if record.get("hitTest") != "1":
                continue
            object_id = int(record.get("objectID"))
            shape = defs[object_id]
            assert shape.tag.startswith("DefineShape") or shape.tag == "DefineText"
            transform = record.find("./transform/Transform")
            local = matrix(transform.attrib if transform is not None else {})
            transformed = compose(chain, local)
            records.append({"characterId": object_id, "sourceBoundsTwips": rect(shape),
                            "buttonRecordTransform": list(local),
                            "stageBoundsPx": stage_box(rect(shape), transformed)})
        assert records, button_id
        return {"hitCharacters": records, "stageBoundsPx": union([x["stageBoundsPx"] for x in records])}

    glossary = []
    for key, button_id, action_key in [
        ("Relation", 8, "relationGlossary"),
        ("Ordered pair", 9, "orderedPairGlossary")]:
        row = instance(main, button_id)
        assert row["presentSpans"] == [[2, 234]]
        assert plan["actions"]["glossaryKeys"].count(key) == 1
        chain = compose(root_m, matrix(row["firstVisibleTransform"]))
        glossary.append({"key": key, "buttonCharacterId": button_id,
                         "sourceInstanceId": f"sprite-185/{row['instanceId']}",
                         "visibleFrames": row["visibleSpans"], "event": "pointerReleaseInside",
                         "action": action(action_key), **button_hit(button_id, chain)})

    done = instance(main, 27, "Done")
    entry = instance(main, 180, "Entry_txt")
    assert done["presentSpans"] == [[145, 145]]
    assert entry["presentSpans"] == [[145, 145]]
    assert defs[180].get("readOnly") == "0" and defs[180].get("notSelectable") == "0"
    assert defs[180].get("multiLine") == "0"
    assert plan["visualStructure"]["mainStopAndQuizFrame"] == 145
    done_hit = button_hit(27, compose(root_m, matrix(done["firstVisibleTransform"])))
    entry_bounds = rect(defs[180])
    entry_box = stage_box(entry_bounds, compose(root_m, matrix(entry["firstVisibleTransform"])))
    question = []
    for text_id, label in [(6, "question"), (10, "instruction"),
                           (11, "relation-set"), (19, "answer-label")]:
        row = instance(main, text_id) if text_id != 19 else next(
            x for x in main["instances"] if x["objectId"] == 19 and 145 in
            range(x["presentSpans"][0][0], x["presentSpans"][0][1] + 1))
        export = next(x for x in display["texts"] if x["path"] == f"source-export/texts/{text_id}.txt")
        actual = pin(ROOT, PLAN / export["path"])
        assert actual["sha256"] == export["sha256"] and actual["bytes"] == export["bytes"]
        source_text = read(ROOT, PLAN / export["path"]).decode("utf-8")
        box = stage_box(rect(defs[text_id]), compose(root_m, matrix(row["firstVisibleTransform"])))
        opacity_frames = [change["frame"] for change in main["changes"]
                          if change.get("depth") == row["depth"]
                          and change.get("objectId") == text_id
                          and change.get("alpha") == 256
                          and row["presentSpans"][0][0] <= change["frame"] <= row["presentSpans"][0][1]]
        assert opacity_frames, (text_id, row["instanceId"])
        question.append({"role": label, "textId": text_id,
                         "sourceText": source_text,
                         "readableText": source_text.replace("\n--- RECORDSEPARATOR ---\n", ""),
                         "sourceInstanceId": f"sprite-185/{row['instanceId']}",
                         "stageBoundsPx": box, "semanticReadyFrame": min(opacity_frames),
                         "export": actual})
    assert question[0]["sourceText"] == plan["visualStructure"]["mainQuestion"]
    assert question[2]["sourceText"] == plan["visualStructure"]["relationSet"]
    assert question[0]["readableText"].startswith("How many ordered pairs")
    assert [(x["textId"], x["semanticReadyFrame"]) for x in question[:3]] == [(6, 6), (10, 6), (11, 7)]
    for control in glossary:
        control["visualReadyFrame"] = question[0]["semanticReadyFrame"]
    closes = []
    for feedback_id, (popup_id, button_id, hold_frame, action_key) in FEEDBACK.items():
        feedback = instance(main, feedback_id)
        popup = instance(display["sprites"][str(feedback_id)], popup_id, "Mc_Feed_Popup")
        close = instance(display["sprites"][str(popup_id)], button_id, "BtnClose")
        assert popup["presentSpans"][0][0] <= hold_frame <= popup["presentSpans"][0][1]
        assert close["presentSpans"] == [[1, 1]]
        chain = root_m
        for row in (feedback, popup, close):
            chain = compose(chain, matrix(row["firstVisibleTransform"]))
        closes.append({"feedbackSpriteId": feedback_id, "popupSpriteId": popup_id,
                       "buttonCharacterId": button_id,
                       "sourceInstanceId": f"sprite-{popup_id}/{close['instanceId']}",
                       "sourceInstanceChain": [f"sprite-185/{feedback['instanceId']}",
                        f"sprite-{feedback_id}/{popup['instanceId']}",
                        f"sprite-{popup_id}/{close['instanceId']}"],
                       "popupVisibleFrames": popup["visibleSpans"], "holdFrame": hold_frame,
                       "event": "pointerReleaseInside", "action": action(action_key),
                       **button_hit(button_id, chain)})
    assert [x["feedbackSpriteId"] for x in closes] == [52, 67, 98]
    result = {"schemaVersion": 1, "kind": "alg-l06-p029-native-hit-geometry-v1",
              "status": "source-bound-aabb-draft", "animationId": ID,
              "source": {"swfSha256": SWF_SHA, "sourceXmlSha256": digest(xml_bytes),
                         "displayListSha256": digest(display_bytes),
                         "sourcePlanSha256": digest(plan_bytes)},
              "stage": {"width": 800, "height": 600, "twipsPerPixel": 20},
              "frameDomain": "sprite-185", "mainFrameCount": 234, "quizHoldFrame": 145,
              "textPolicy": {"canvasSourceGlyphs": "preserved",
                             "nativeStaticText": "semantic-screen-reader-companion",
                             "editableInput": "native-visible-only-at-source-frame-145",
                             "visualSuppression": "none"},
              "semanticText": question, "glossary": glossary,
              "input": {"characterId": 180, "name": "Entry_txt",
                        "sourceInstanceId": f"sprite-185/{entry['instanceId']}",
                        "visibleFrames": entry["visibleSpans"],
                        "sourceBoundsTwips": entry_bounds,
                        "stageBoundsPx": entry_box,
                        "sourceAttributes": {
                            "readOnly": defs[180].get("readOnly"),
                            "multiLine": defs[180].get("multiLine"),
                            "align": defs[180].get("align"),
                            "fontRef": defs[180].get("fontRef")},
                        "valueSource": "typed-unmodified-string; AVM1 == coercion unverified"},
              "done": {"buttonCharacterId": 27, "sourceInstanceId": f"sprite-185/{done['instanceId']}",
                       "visibleFrames": done["visibleSpans"], "event": "pointerReleaseInside",
                       "action": action("answerSubmit"), **done_hit},
              "wrongCloses": closes,
              "limits": ["AABB is a source-derived hit candidate, not pixel-perfect Flash hit testing.",
                         "Popup Close is gated to each sprite's authored stop frame.",
                         "Only source English text is staged; Spanish visual copy is unresolved.",
                         "No original-runtime, AVM1 coercion, or listening acceptance."]}
    return result


def main():
    assert len(sys.argv) == 2 and sys.argv[1] in ("--write", "--check")
    mode = sys.argv[1]
    data = (json.dumps(build(), indent=2, ensure_ascii=False) + "\n").encode()
    target = ROOT / STAGE / "native-v1/geometry-v1.json"
    target.parent.mkdir(parents=True, exist_ok=True)
    if mode == "--write":
        target.write_bytes(data)
    else:
        assert target.read_bytes() == data, "native geometry drift"
    print(json.dumps({"mode": mode, "geometrySha256": digest(data),
                      "controls": {"glossary": 2, "done": 1, "wrongClose": 3}}))


if __name__ == "__main__":
    main()
