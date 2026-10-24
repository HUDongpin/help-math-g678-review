"""Generate P029 MP3 decoder cue coordinates from the physical SWF XML.

Only reads frozen inputs and writes source-cues-v1.json beside this script.
Adobe SWF File Format Specification v19, Sounds pp. 183-191, defines
SoundStreamBlock SampleCount, MP3 SeekSamples, initial latency, and frame size.
"""

from __future__ import annotations

import base64
import argparse
import hashlib
import json
import struct
import xml.etree.ElementTree as ET
from pathlib import Path


HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
SOURCE = ROOT / "output/alg-l06-p029-source-planning-20261001-v1/source-structure.xml"
MANIFEST = ROOT / "output/alg-l06-p029-audio-player-staging-v1/audio-manifest-v1.json"
RECEIPT = ROOT / "output/alg-l06-p029-chrome-decode-staging-v1/browser-pcm-receipt-v1.json"
EXTRACTED = ROOT / "output/alg-l06-p029-source-planning-20261001-v1/embedded-streams"
STRUCTURE_SHA256 = "a22596049a263d1fb13056714af8db143aac4c7b9aa8e9b0a5e68d0047797c07"


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def check_mp3_frames(data: bytes) -> tuple[int, int]:
    """Count real MPEG Layer III frames and decoded samples; reject leftovers."""
    at = 0
    frames = 0
    samples = 0
    while at < len(data):
        if len(data) - at < 4:
            raise ValueError(f"trailing MPEG bytes at {at}")
        h = int.from_bytes(data[at:at + 4], "big")
        version, layer = (h >> 19) & 3, (h >> 17) & 3
        bitrate_index, rate_index = (h >> 12) & 15, (h >> 10) & 3
        pad = (h >> 9) & 1
        if h >> 21 != 0x7ff or version not in (0, 2, 3) or layer != 1:
            raise ValueError(f"invalid MPEG Layer III header at {at}")
        if bitrate_index in (0, 15) or rate_index == 3:
            raise ValueError(f"unsupported bitrate/rate at {at}")
        rates = {3: (44100, 48000, 32000), 2: (22050, 24000, 16000),
                 0: (11025, 12000, 8000)}
        bitrates = ((0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320)
                    if version == 3 else
                    (0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160))
        frame_bytes = (144 if version == 3 else 72) * bitrates[bitrate_index] * 1000 // rates[version][rate_index] + pad
        if frame_bytes < 4 or at + frame_bytes > len(data):
            raise ValueError(f"truncated MPEG frame at {at}")
        at += frame_bytes
        frames += 1
        samples += 1152 if version == 3 else 576
    return frames, samples


def generate() -> dict:
    manifest = json.loads(MANIFEST.read_text())
    receipt = json.loads(RECEIPT.read_text())
    swf = manifest["physicalSwf"]
    source_bytes = Path(swf["path"]).read_bytes()
    assert len(source_bytes) == swf["bytes"] and sha(source_bytes) == swf["sha256"]
    assert sha(SOURCE.read_bytes()) == STRUCTURE_SHA256
    tree = ET.parse(SOURCE)
    assert int(tree.getroot().find("Header").attrib["framerate"]) == manifest["fps"] == 12
    browser = {r["domain"]: r for r in receipt["results"]}
    sprites = {int(sprite.attrib["objectID"]): sprite for sprite in tree.iter("DefineSprite")}
    streams = {}
    for asset in manifest["embedded"]:
        if asset["codec"] != "mp3":
            continue
        tags = sprites[asset["characterId"]].find("tags")
        head = tags.find("SoundStreamHead")
        assert head is not None and head.attrib["compression"] == "2"
        latency = struct.unpack("<h", base64.b64decode(head.find("latencySeek/data").text))[0]
        assert latency > 0
        frame = 1
        decoded_before = 0
        blocks = []
        concatenated = bytearray()
        for tag in tags:
            if tag.tag == "ShowFrame":
                frame += 1
                continue
            if tag.tag != "SoundStreamBlock":
                continue
            raw = base64.b64decode(tag.find("data").text)
            declared, seek = struct.unpack("<Hh", raw[:4])
            payload = raw[4:]
            mpeg_frames, real_samples = check_mp3_frames(payload)
            assert declared == real_samples, (asset["domain"], frame, declared, real_samples)
            concatenated.extend(payload)
            # Per Adobe v19: the first seek is encoder latency; on a later
            # block seek, Flash adds that latency to the signed local seek.
            # A zero-data block has no independently addressable decoded start.
            derived_cue = (decoded_before + seek + (0 if not blocks else latency)
                           if mpeg_frames else None)
            blocks.append([frame, decoded_before, real_samples, seek, mpeg_frames, derived_cue])
            decoded_before += real_samples
        assert blocks[0][0] == asset["firstBlockFrame"]
        assert blocks[0][3] == latency and blocks[0][5] == latency
        assert decoded_before == asset["technicalSamples"]
        assert len(blocks) == asset["blockCount"]
        assert sha(concatenated) == asset["sourceSha256"]
        assert (EXTRACTED / asset["filename"]).read_bytes() == concatenated
        pcm = browser[asset["domain"]]
        assert pcm["browserDecodedSamples"] == decoded_before
        assert pcm["browserDecodedSampleRate"] == asset["sampleRate"]
        for block in blocks:
            candidate = block[5]
            block.append(candidate if candidate is not None and 0 <= candidate < decoded_before else None)
        streams[asset["domain"]] = {
            "sourceSha256": asset["sourceSha256"], "sampleRate": asset["sampleRate"],
            "decodedSamples": decoded_before, "initialLatencySamples": latency,
            "blocks": blocks,
        }
    return {
        "schemaVersion": 1, "kind": "p029-physical-swf-mp3-decoder-cues-v1",
        "physicalSwfSha256": swf["sha256"], "sourceStructureSha256": STRUCTURE_SHA256, "fps": 12,
        "blockColumns": ["swfFrame", "decodedBefore", "mpegSamples", "signedSeek", "mpegFrameCount", "derivedCue", "playableCue"],
        "cueRule": "first block: SeekSamples; later nonempty block: decodedBefore + first LatencySeek + signed SeekSamples; zero-data or out-of-decoder-range block: playableCue null",
        "specification": "Adobe SWF File Format Specification v19, Sounds pp.183-191",
        "streams": streams,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="compare generated bytes without writing")
    args = parser.parse_args()
    result = generate()
    out = ROOT / "migrations/shared-alg001-l06-p029/audio-v1/source-cues-v1.json"
    encoded = (json.dumps(result, separators=(",", ":"), ensure_ascii=False) + "\n").encode()
    if args.check:
        if not out.exists() or out.read_bytes() != encoded:
            parser.error("source-cues-v1.json is absent or differs from source-derived bytes")
    else:
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(encoded)
    main = result["streams"]["sprite-185"]
    verb = "checked without writing" if args.check else "wrote"
    print(f"{verb} {out}; 7 MP3 streams; main frame146={next(x[5] for x in main['blocks'] if x[0] == 146)}")
