"""Bind P029 right-feedback #3 host entry to physical ADPCM and Chrome PCM.

Only writes adpcm179-cue-v1.json when run without --check.
"""

from __future__ import annotations

import argparse
import base64
import gzip
import hashlib
import json
import math
import re
import wave
import xml.etree.ElementTree as ET
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SOURCE_ROOT = Path("/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6")
LESSON_XML = SOURCE_ROOT / "index.xml"
PAGE_SWF = SOURCE_ROOT / "VB/L6VB22.swf"
HOST_SWF = Path("/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-26-HELP-MATH-HISTORICAL-COURSEWARE-S3-153-V1/source-paths/Transfer/FromStagingServer/HELP 1.5 VERSION CORRECTIONS/HELP_COURSES/indexMI.swf")
HOST_SCRIPT = ROOT / "output/alg-l06-p029-prequiz-host-ownership-v1/indexMI-historical-extract/scripts/frame_35/DoAction.as"
HOST_LOADER = ROOT / "output/alg-l06-p029-prequiz-host-ownership-v1/indexMI-historical-extract/scripts/frame_2/DoAction.as"
PAGE_SUBMIT = ROOT / "output/alg-l06-p029-source-planning-20261001-v1/source-export/scripts/DefineButton2_27/BUTTONCONDACTION on(release).as"
PAGE_STRUCTURE = ROOT / "output/alg-l06-p029-source-planning-20261001-v1/source-structure.xml"
RAW_ADPCM = ROOT / "output/alg-l06-p029-source-planning-20261001-v1/embedded-streams/sprite-179.swf-adpcm-blocks.bin"
WAV = ROOT / "output/alg-l06-p029-audio-player-staging-v1/assets/sprite-179.wav"
CHROME_RECEIPT = ROOT / "output/alg-l06-p029-chrome-decode-staging-v1/browser-pcm-receipt-v1.json"
G3_HOST = ROOT / "migrations/course-g03-l01-ts-008/audit/host-function-binding.json"
G4_HOST = ROOT / "migrations/shell-course-g04-l10-index-local/audit/machine/ffdec-scripts.txt.gz"
G5_HOST = ROOT / "migrations/course-g05-l13-rw-002/audit/original-host-entry/ffdec-scripts/frame_35/DoAction.as"

EXPECTED = {
    "lessonXml": "9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c",
    "pageSwf": "cbfd012d0aff11544a252c9e2852dff30d408c634aa2a805eb0837933c3370d4",
    "hostSwf": "275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9",
    "hostScript": "380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74",
    "hostLoader": "3e0dd52444cfa5daa05a771aa4c00172a498192e634c6bef5a8815a02f51ce8a",
    "pageSubmit": "80053294a1776a3622920e2505194ba0b08e438c82a31bdc5bbc01fa3d003484",
    "pageStructure": "a22596049a263d1fb13056714af8db143aac4c7b9aa8e9b0a5e68d0047797c07",
    "rawAdpcm": "e5c99e029d9df7717bc7755b5f4660841ad3f453d10bb8dbc8010d69b5a653b6",
    "wav": "f3e05365073feff502feda8779b3d3a5e3ba4ca6ee213e7a162e1ad5b3961eb8",
    "chromeReceipt": "121517b913e8d07e5f354a3e57981707a2af9adc84ea0b306de6dc04bb62bbd0",
    "g3Host": "444b49203626ed196a59f77f9164158e47a450bb448d1f24bb40b7d3f13a068e",
    "g4Host": "a2578f54460dc61088c170be1f7bb591bda10654d1a0f53b2360665ff7cf9969",
    "g5Host": "19a500653e0e71cb8c936373a709f13f6377e74f2d74c57e179a68710a8da08f",
}


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def bound_body(script: str, name: str) -> str:
    match = re.search(r"function " + re.escape(name) + r"\(\)\s*\{(.*?)\n\}", script, re.S)
    assert match, name
    return match.group(1)


def generate() -> dict:
    files = {"lessonXml": LESSON_XML, "pageSwf": PAGE_SWF, "hostSwf": HOST_SWF,
             "hostScript": HOST_SCRIPT, "hostLoader": HOST_LOADER,
             "pageSubmit": PAGE_SUBMIT, "pageStructure": PAGE_STRUCTURE,
             "rawAdpcm": RAW_ADPCM, "wav": WAV, "chromeReceipt": CHROME_RECEIPT}
    files.update({"g3Host": G3_HOST, "g4Host": G4_HOST, "g5Host": G5_HOST})
    for role, path in files.items():
        assert sha(path) == EXPECTED[role], f"{role} byte drift"

    lesson = ET.parse(LESSON_XML).getroot()
    page_root = lesson.findtext("PageRoot")
    assert page_root == "HELP_COURSES/ALG001/L6"
    assert [p.text for p in lesson.iter("Page")].count("VB/L6VB22.swf") == 1
    loader = HOST_LOADER.read_text()
    assert 'S_L_1.toUpperCase() == "PAGEROOT"' in loader
    assert '_loc1_.PageRoot + "/" + S_X.childNodes[i].childNodes[j].firstChild' in loader
    assert "_root.showRightFeed();" in PAGE_SUBMIT.read_text()

    host = HOST_SCRIPT.read_text()
    right = bound_body(host, "showRightFeed")
    assert "random(4)" in right and "intMc_Name += 1" in right
    assert '"_root.animation_mc.animation.Mc_Right_Feed" + intMc_Name' in right
    assert 'eval("_root.animation_mc.animation.Mc_Right_Feed" + intMc_Name).gotoAndPlay(2)' in right
    # Three maintained host chains corroborate the selected-clip entry rule.
    # They are not substituted for the exact historical indexMI chain above.
    g3 = json.loads(G3_HOST.read_text())
    g3_functions = {f["role"]: f["text"] for f in g3["hostActionScript"]["functions"]}
    g4_text = gzip.decompress(G4_HOST.read_bytes()).decode(errors="replace")
    g5_text = G5_HOST.read_text()
    for kind in ("Right", "Wrong"):
        clip = f"Mc_{kind}_Feed"
        g3_function = g3_functions[f"host-function-show{kind}Feed"]
        for corroborating in (g3_function, bound_body(g4_text, f"show{kind}Feed"),
                              bound_body(g5_text, f"show{kind}Feed")):
            assert clip in corroborating and "gotoAndPlay(2)" in corroborating

    structure = ET.parse(PAGE_STRUCTURE).getroot()
    main = next(x for x in structure.iter("DefineSprite") if x.attrib["objectID"] == "185")
    assert any(t.attrib.get("objectID") == "179" and t.attrib.get("name") == "Mc_Right_Feed3"
               for t in main.iter("PlaceObject2"))
    sprite = next(x for x in structure.iter("DefineSprite") if x.attrib["objectID"] == "179")
    tags = sprite.find("tags")
    head = tags.find("SoundStreamHead")
    assert head is not None and head.attrib["compression"] == "1"
    assert head.attrib["soundRate"] == "0" and head.attrib["sampleSize"] == "459"
    frame = 1
    blocks = []
    for tag in tags:
        if tag.tag == "ShowFrame":
            frame += 1
        elif tag.tag == "SoundStreamBlock":
            blocks.append((frame, base64.b64decode(tag.find("data").text)))
    assert [f for f, _ in blocks] == list(range(1, 14))
    assert all(len(data) == 290 for _, data in blocks)
    assert b"".join(data for _, data in blocks) == RAW_ADPCM.read_bytes()
    first_block_source_samples = int(head.attrib["sampleSize"])
    with wave.open(str(WAV), "rb") as wav:
        assert wav.getnchannels() == 1 and wav.getsampwidth() == 2
        source_rate, source_samples = wav.getframerate(), wav.getnframes()
    assert source_rate == 5512 and source_samples == 13 * first_block_source_samples == 5967

    receipt = json.loads(CHROME_RECEIPT.read_text())
    pcm = next(x for x in receipt["results"] if x["domain"] == "sprite-179")
    assert pcm["sourceSha256"] == EXPECTED["wav"]
    assert pcm["browserDecodedSampleRate"] == 11025
    assert pcm["browserDecodedSamples"] == 11935
    assert pcm["browserDecodedChannels"] == 1
    exact_grid_position = first_block_source_samples * pcm["browserDecodedSampleRate"] / source_rate
    cue = math.ceil(exact_grid_position)
    assert 918 < exact_grid_position < 919 and cue == 919
    # This is the first target-grid sample whose nominal time is not before
    # the first 459 source samples. It does not prove Chromium filter phase.
    evidence = "p029-host-adpcm179:" + hashlib.sha256(
        "|".join(EXPECTED[k] for k in ("lessonXml", "pageSwf", "hostSwf", "hostScript",
                                               "hostLoader", "pageSubmit",
                                               "pageStructure", "rawAdpcm", "wav", "chromeReceipt",
                                               "g3Host", "g4Host", "g5Host")).encode()
    ).hexdigest()
    return {
        "schemaVersion": 1, "kind": "p029-adpcm179-source-host-chrome-cue-v1",
        "sourceBinding": {"pageSwfSha256": EXPECTED["pageSwf"],
                          "pageStructureSha256": EXPECTED["pageStructure"],
                          "rawAdpcmSha256": EXPECTED["rawAdpcm"],
                          "wavSha256": EXPECTED["wav"],
                          "spriteCharacterId": 179, "mainSpriteCharacterId": 185,
                          "mainInstance": "Mc_Right_Feed3", "firstBlockFrame": 1,
                          "adpcmBlocks": 13, "firstBlockSourceSamples": first_block_source_samples,
                          "sourceSampleRate": source_rate, "sourceDecodedSamples": source_samples},
        "hostBinding": {"lessonXmlSha256": EXPECTED["lessonXml"],
                        "hostLoaderScriptSha256": EXPECTED["hostLoader"],
                        "pageSubmitScriptSha256": EXPECTED["pageSubmit"],
                        "pageRoot": page_root, "pageRef": "VB/L6VB22.swf",
                        "hostSwfSha256": EXPECTED["hostSwf"],
                        "hostShowRightFeedScriptSha256": EXPECTED["hostScript"],
                        "hostMethod": "showRightFeed", "hostSelection": "random(4)+1",
                        "selectedClipEntryFrame": 2,
                        "corroboratingMaintainedHostHashes": [EXPECTED["g3Host"], EXPECTED["g4Host"], EXPECTED["g5Host"]]},
        "chromeBinding": {"receiptSha256": EXPECTED["chromeReceipt"],
                          "sourceWavSha256": pcm["sourceSha256"],
                          "sampleRate": pcm["browserDecodedSampleRate"],
                          "decodedSamples": pcm["browserDecodedSamples"],
                          "pcmSha256": pcm["browserInterleavedFloat32LePcmSha256"]},
        "entryPolicy": {"entryFrame": 2, "decodedSample": cue,
                        "evidenceRef": evidence,
                        "roundingRule": "ceil(firstBlockSourceSamples * chromeSampleRate / sourceSampleRate)",
                        "nominalTargetGridPosition": exact_grid_position,
                        "oldLinearGridPosition": pcm["browserDecodedSampleRate"] / 12,
                        "basis": "source ADPCM block boundary plus source-locked host gotoAndPlay(2) and Chrome technical rate",
                        "resamplerPhaseVerified": False,
                        "originalRuntimeAccepted": False,
                        "listeningAccepted": False},
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare generated bytes without writing")
    args = parser.parse_args()
    output = ROOT / "migrations/shared-alg001-l06-p029/audio-v1/adpcm179-cue-v1.json"
    encoded = (json.dumps(generate(), separators=(",", ":"), ensure_ascii=False) + "\n").encode()
    if args.check:
        if not output.exists() or output.read_bytes() != encoded:
            parser.error("adpcm179-cue-v1.json absent or differs from source-derived bytes")
        print("checked without writing", output)
    else:
        output.parent.mkdir(parents=True, exist_ok=True)
        output.write_bytes(encoded)
        print("wrote", output)
