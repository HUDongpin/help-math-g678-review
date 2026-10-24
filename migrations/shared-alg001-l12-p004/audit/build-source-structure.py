#!/usr/bin/env python3
"""Rebuild P004 source-only structure from its hash-bound swfmill XML."""
import collections
import csv
import hashlib
import io
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

WORK = Path(__file__).resolve().parent.parent
AUDIT = WORK / "audit"
SOURCE = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW04.swf")
SOURCE_SHA = "4d7aa78bd955aa52d476f31548c97135da989daf9d106986ff06a954c6d8b334"
XML_SHA = "7d6a9145ad1aa3df704e440cce62301845971eb044e225db7017a451f73d4f19"
BUTTONS = {63: "Vertical-line test", 66: "Vertical", 67: "Graph", 71: "Point", 72: "Function"}


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def ranges(numbers):
    result = []
    for number in numbers:
        if not result or number > result[-1][1] + 1:
            result.append([number, number])
        else:
            result[-1][1] = number
    return result


def events(tags, frame_count):
    frame = 1
    active = {}
    starts = {}
    button_ranges = []
    button_placements = []
    streams = []
    controls = []
    removals = []
    for tag in tags:
        if tag.tag == "ShowFrame":
            frame += 1
        elif tag.tag == "SoundStreamBlock":
            streams.append(frame)
        elif tag.tag == "DoAction":
            controls.append({"frame": frame, "opcodes": [x.tag for x in tag.findall("./actions/*")]})
        elif tag.tag == "FrameLabel":
            controls.append({"frame": frame, "label": tag.get("label")})
        elif tag.tag in ("PlaceObject2", "RemoveObject2"):
            depth = int(tag.get("depth"))
            character = tag.get("objectID")
            old = active.get(depth)
            if tag.tag == "RemoveObject2":
                removals.append({"frame": frame, "depth": depth, "removedCharacterId": old})
            if tag.tag == "RemoveObject2" or character is not None:
                if old in BUTTONS:
                    button_ranges.append({"term": BUTTONS[old], "characterId": old, "depth": depth,
                                          "firstFrame": starts[depth], "lastFrame": frame - 1,
                                          "exit": "RemoveObject2" if tag.tag == "RemoveObject2" else "replaced"})
                active.pop(depth, None)
                starts.pop(depth, None)
                if character is not None:
                    number = int(character)
                    active[depth] = number
                    starts[depth] = frame
                    if number in BUTTONS:
                        transform = tag.find("./transform/Transform")
                        button_placements.append({"frame": frame, "term": BUTTONS[number],
                                                  "characterId": number, "depth": depth,
                                                  "matrix": transform.attrib if transform is not None else {}})
    assert frame == frame_count + 1, (frame, frame_count)
    for depth, character in active.items():
        if character in BUTTONS:
            button_ranges.append({"term": BUTTONS[character], "characterId": character,
                                  "depth": depth, "firstFrame": starts[depth], "lastFrame": frame_count,
                                  "exit": "retained-at-terminal-frame"})
    return {"controls": controls, "buttonPlacements": sorted(button_placements, key=lambda x: x["characterId"]),
            "buttonDisplayListRanges": sorted(button_ranges, key=lambda x: x["characterId"]),
            "soundStreamBlockCount": len(streams), "soundStreamBlockRanges": ranges(streams),
            "removals": removals}


def main():
    assert SOURCE.stat().st_size == 363811 and sha(SOURCE) == SOURCE_SHA
    assert sha(AUDIT / "movie.xml") == XML_SHA
    root = ET.parse(AUDIT / "movie.xml").getroot()
    header = root.find("Header")
    tags = header.find("tags")
    definitions = [tag for tag in tags if tag.tag.startswith("Define")]
    sprites = [tag for tag in definitions if tag.tag == "DefineSprite"]
    root_events = events(tags, int(header.get("frames")))
    sprite_events = {tag.get("objectID"): events(tag.find("tags"), int(tag.get("frames"))) for tag in sprites}
    scripts = {}
    for tag in definitions:
        if tag.tag == "DefineButton2":
            dictionary = [s.get("value") for s in tag.findall("./conditions/Condition/actions/Dictionary/strings/String")]
            scripts[tag.get("objectID")] = dictionary
    assert {int(k): v[2] for k, v in scripts.items()} == BUTTONS
    assert [(v["characterId"], v["firstFrame"], v["lastFrame"], v["depth"]) for v in sprite_events["90"]["buttonDisplayListRanges"]] == [
        (63, 19, 969, 151), (66, 29, 969, 157), (67, 29, 969, 159), (71, 203, 969, 165), (72, 203, 969, 167)]
    root_placements = []
    frame = 1
    for tag in tags:
        if tag.tag == "ShowFrame":
            frame += 1
        elif tag.tag == "PlaceObject2":
            transform = tag.find("./transform/Transform")
            root_placements.append({"frame": frame, "characterId": int(tag.get("objectID")),
                                    "depth": int(tag.get("depth")), "name": tag.get("name"),
                                    "matrix": transform.attrib if transform is not None else {}})
    assert [(x["frame"], x["characterId"], x["depth"]) for x in root_placements] == [(6, 90, 1), (6, 92, 171), (6, 93, 173)]
    summary = {
        "schemaVersion": 1, "animationId": "shared-alg001-l12-p004",
        "authority": "static SWF structure only; original-runtime behavior pending",
        "source": {"path": str(SOURCE), "bytes": SOURCE.stat().st_size, "sha256": SOURCE_SHA,
                   "swfmillXmlSha256": XML_SHA},
        "header": {"swfVersion": int(root.get("version")), "compressed": root.get("compressed") == "1",
                   "frameRate": int(header.get("framerate")), "rootFrames": int(header.get("frames")),
                   "stageTwips": header.find("./size/Rectangle").attrib},
        "definitions": dict(sorted(collections.Counter(tag.tag for tag in definitions).items())),
        "fonts": [{"characterId": int(tag.get("objectID")), "name": tag.get("name"),
                   "bold": tag.get("bold") == "1", "italic": tag.get("italic") == "1"}
                  for tag in definitions if tag.tag.startswith("DefineFont")],
        "root": {**root_events, "placements": root_placements},
        "sprites": {k: {"frameCount": int(next(s for s in sprites if s.get("objectID") == k).get("frames")), **v}
                                          for k, v in sprite_events.items()},
        "buttonActionDictionaries": scripts,
        "limitations": ["Display-list retention does not prove unobscured visual or hit-test visibility.",
                        "The SWF contains no glossary close/resume implementation; host behavior is unresolved.",
                        "SoundStreamBlock positions do not prove audible duration or synchronization."]}
    text = json.dumps(summary, indent=2, ensure_ascii=False) + "\n"
    out = AUDIT / "source-structure.json"
    fields = ["asset_id", "swf_character_id", "library_symbol", "type", "source_file", "source_frame",
              "exported_file", "sha256", "format", "dimensions_or_bounds", "font_glyphs",
              "transformation", "confidence", "license_or_provenance", "notes"]
    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=fields, lineterminator="\n")
    writer.writeheader()
    for tag in definitions:
        character = tag.get("objectID")
        bounds = tag.find("./bounds/Rectangle")
        row = {"asset_id": f"swf-character-{character}", "swf_character_id": character,
               "library_symbol": f"{tag.tag}_{character}", "type": tag.tag, "source_file": str(SOURCE),
               "source_frame": "", "exported_file": "", "sha256": SOURCE_SHA, "format": "SWF container",
               "dimensions_or_bounds": json.dumps(bounds.attrib, sort_keys=True) if bounds is not None else "",
               "font_glyphs": "", "transformation": "none; source-only inventory",
               "confidence": "verified", "license_or_provenance": "owner-provided",
               "notes": "SHA-256 is container hash, not an individual export hash; runtime/visual acceptance pending"}
        writer.writerow(row)
    writer.writerow({"asset_id": "sprite-90-embedded-stream", "swf_character_id": "", "library_symbol": "SoundStreamHead and 881 SoundStreamBlock tags in DefineSprite_90",
                     "type": "embedded MP3 stream", "source_file": str(SOURCE), "source_frame": "10-280;360-969",
                     "exported_file": "", "sha256": SOURCE_SHA, "format": "SWF container",
                     "dimensions_or_bounds": "", "font_glyphs": "", "transformation": "none; source-only inventory",
                     "confidence": "verified", "license_or_provenance": "owner-provided",
                     "notes": "Container hash only; stream payload hash and audible timing pending"})
    inventory = WORK / "asset-inventory.csv"
    if len(sys.argv) > 1 and sys.argv[1] == "--check":
        assert out.read_text() == text
        assert inventory.read_text() == buffer.getvalue()
    else:
        assert len(sys.argv) == 1
        out.write_text(text)
        inventory.write_text(buffer.getvalue())
    print(f"P004 structure {'checked' if len(sys.argv) > 1 else 'written'}: {len(definitions)} definitions, {len(sprites)} sprites, 5 buttons")


if __name__ == "__main__":
    main()
