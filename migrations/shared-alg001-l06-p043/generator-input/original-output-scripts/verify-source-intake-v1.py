#!/usr/bin/env python3
"""Recheck the bounded P043 physical-source packet without modifying sources."""

import hashlib
import json
import re
from pathlib import Path

HERE = Path(__file__).resolve().parent
packet = json.loads((HERE / "source-intake-v1.json").read_text())
source_root = Path(packet["sourceRoot"])


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


for entry in packet["physicalFiles"]:
    path = source_root / entry["relativePath"]
    assert path.stat().st_size == entry["bytes"], path
    assert sha256(path) == entry["sha256"], path

for key, file in [
    ("ffdecHeaderSha256", "ffdec-header.txt"),
    ("ffdecTagsSha256", "ffdec-tags.txt"),
    ("ffdecExportLogSha256", "ffdec-export.log"),
    ("swfmillXmlSha256", "swfmill.xml"),
]:
    assert sha256(HERE / "audit" / file) == packet["auditArtifacts"][key], file

assert len(list((HERE / "audit/ffdec-export/scripts").rglob("*.as"))) == 70
assert len(list((HERE / "audit/ffdec-text").glob("*.txt"))) == 103
assert packet["identity"]["coursePageXml"] in (
    source_root / "index.xml"
).read_text().splitlines()[126]

script_root = HERE / "audit/ffdec-export/scripts"
assert "_global.quizTryCount = 0" in (
    script_root / "DefineSprite_342/frame_62/DoAction.as"
).read_text()
assert "Mc_Wrong_Feed4.gotoAndPlay(2)" in (
    script_root / "DefineButton2_165/BUTTONCONDACTION on(release).as"
).read_text()
assert "Mc_Right_Feed4.gotoAndPlay(2)" in (
    script_root / "DefineButton2_166/BUTTONCONDACTION on(release).as"
).read_text()
assert "_parent.gotoAndPlay(24)" in (
    script_root / "DefineButton2_301/BUTTONCONDACTION on(release).as"
).read_text()
assert "_global.quizTryCount >= 2" in (
    script_root / "DefineSprite_307/frame_29/DoAction.as"
).read_text()
assert "_parent.play()" in (
    script_root / "DefineSprite_202/frame_31/DoAction.as"
).read_text()

tags = (HERE / "audit/ffdec-tags.txt").read_text().splitlines()
sprite_lines = []
for index, line in enumerate(tags):
    match = re.match(r"^[0-9a-f]+:  \s*\d+\. DefineSprite \(chid: (\d+)\)", line)
    if match:
        sprite_lines.append((index, int(match.group(1))))
blocks = {}
heads = {}
for index, (start, sprite_id) in enumerate(sprite_lines):
    end = sprite_lines[index + 1][0] if index + 1 < len(sprite_lines) else len(tags)
    segment = tags[start:end]
    blocks[sprite_id] = sum("SoundStreamBlock " in line for line in segment)
    heads[sprite_id] = sum("SoundStreamHead (" in line for line in segment)
for domain in packet["embeddedAudio"]["domains"]:
    assert blocks[domain["spriteId"]] == domain["blocks"], domain
    assert heads[domain["spriteId"]] == 1, domain
assert sum(blocks.values()) == packet["embeddedAudio"]["soundStreamBlockCount"]
assert sum(heads.values()) == packet["embeddedAudio"]["soundStreamHeadCount"]

print(json.dumps({
    "status": "pass",
    "animationId": packet["identity"]["animationId"],
    "physicalFiles": len(packet["physicalFiles"]),
    "ffdecScripts": 70,
    "ffdecTextFiles": 103,
    "embeddedDomains": len(packet["embeddedAudio"]["domains"]),
    "embeddedBlocks": sum(blocks.values()),
    "packetSha256": sha256(HERE / "source-intake-v1.json"),
}, sort_keys=True))
