# P012 embedded audio source extraction — 2026-09-27

Source: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB07.swf`, 81069 bytes, SHA-256 `b322949a960acef3fee6018a65785b29cd3693717ca3ba33d0d930d7866320aa`. This source is the real AWS file, not a compatibility symlink. Extraction was checked against the frozen P012 triage inventory.

| Independent stream | SWF domain | Blocks | Declared samples | Raw MP3 bytes | SHA-256 | Full-EOF ffmpeg decoded samples |
| --- | --- | ---: | ---: | ---: | --- | ---: |
| Coach | sprite-76 | 53 | 96768 | 21840 | `e551e71005de2df6e95d44ca10fba65b6ae0131032336e67b2609c71b798e8cf` | 96768 |
| Main | sprite-86 | 90 | 164736 | 37180 | `6aaddb1bfc319127e85b94dcfce407765eeb3f0275f42830bdeaff4aaa4cb21a` | 164736 |

Each raw MP3 is a byte concatenation of that domain's SoundStreamBlock MP3 payloads in source tag order. The index records every frame, including absent blocks; for each present block it records the signed seek, declared samples, source offsets, header and payload hashes, and byte/sample offsets in the extracted stream. Coach empty-payload frames: 4. Main empty-payload frames: 31. The extracted streams contain no inserted silence or trimming.

Coach branch labels and return frames are source action/timeline bounds: S1 3–16; S2 18–27; S3 31–36; S4 40–54. These inclusive ranges are raw index ranges, not decoded, trimmed, or approved playback clips.

Unresolved: signed per-block seeks and the head latency marker have no selected Flash-to-Web synchronization rule; an empty MP3 block is not evidence of audible silence; absent block frames are timeline gaps, not proof of pause; source return-frame action ordering may change branch playback bounds. The independent SA sidecar was not spliced. Full-EOF decode proves local decoder readability only. No original-runtime listening, language verification, human audio acceptance, or product registration is claimed.

Reproduce with `node scripts/build-g678-alg-l12-p012-audio-source.mjs --check`.
