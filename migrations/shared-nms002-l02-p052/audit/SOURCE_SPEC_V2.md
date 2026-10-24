# P052 display-list and decoded-audio audit — 2026-09-23

This supplements SOURCE_SPEC_V1.md. Source SHA256 remains
`5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
Status remains **source-audited, unimplemented and unregistered**. No acceptance gate advances.

## Newly resolved structural questions

- `source-display-list-v1.json` records all156 main-timeline frame states, applying ordered PlaceObject/RemoveObject events by depth. It is not a screenshot sequence or ActionScript interpreter. Dynamic duplicate cells, script-assigned text/visibility and nested clocks remain separate.
- Prompt begins alpha0 at frame2 and is visible by7. Main audio begins at15. Authored digits are001 at32, increasing once per frame through016 at47, retaining016 through61, then decreasing015 at62 to000 at77. Shape293 replaces shape160 at depth1 at99. Do not invent an intro demonstrating75percent.
- Frame115 installs interactive controls and dynamic digits. At116, depths23,27,32,39,50,61 (Reset, Done, help opener, wrong/right feedback, help popup) are removed. The remaining static display list does not change through156. Runtime answer digits and duplicate cells must retain their solved state; static initialText=0 is not a runtime post-answer observation.
- `source-domain-reachability-v1.json` inventories all84 domains. Fourteen are structurally reachable from root through timeline placements and button state records. This is graph reachability, not natural runtime visibility or strict full-frame coverage.
- No bitmap definitions. Four embedded font definitions: Bauhaus Md BT characters3/143, Arial106/110. Text/font modernization still needs explicit source-bound typography and localization decisions.
- Sprite8 is a button-down click sound, used by help153, Reset307, Done310 and help-close337 (also legacy unplaced button9). Sprite318 is wrong-close319's down sound; sprite327 is right-close328's down sound. These are not merely unplaced library audio. Keyboard/touch equivalent policy and actual runtime audibility remain pending.

## PCM and newly discovered source mismatch

`source-pcm-inventory-v1.json` pins complete, untrimmed f32le decodes of all six original MP3 streams. No resampling, normalization, synthesized speech, encoded-byte cue splitting or silence replacement occurred. The decoder executable and exact commands are pinned. Re-running with `--check` reproduces identical bytes.

The first clock audit failed declared-versus-decoded sample equality for main sprite350: source declared260352, actual decoded259776. `source-packet-audit-v1.json` localizes the difference independently through full-stream FFprobe frame records:

- Main frame102 has encoded byte range36010–36270 (end exclusive), two complete130-byte MP3 packets, each576 decoded samples.
- Its SWF block declares1728 samples, but the packets decode1152: excess declaration576 samples, approximately26.12ms at22050Hz.
- Source block SHA256: `ab5c13a7fe36e5d6ff9b02740577b4df1df92b0308f571e0d17e40de9c22185b`.
- All451 main MP3 packets decode; the source XML matches extracted bytes. This establishes a count inconsistency, **not proof that a recoverable missing audio packet exists**.
- The other five streams have exact declared/decoded count agreement.

Do not invent the missing576 samples, assert decoder failure, trim extra real speech, or claim synchronization acceptance. Main audio clock status is `UNRESOLVED_SOURCE_SAMPLE_COUNT`; `audio-sample-anchors-v1.json` deliberately contains no admitted main segments. Next work should compare actual cumulative decoded packet positions, declared seek positions and the continuous source clock, then explicitly document a source-aware native playback policy. Original-runtime synchronization remains an independent evidence gate.

## Other audio anchors

All streams specify latency1673samples. For the five count-consistent streams, the first nonempty block starts at decoded sample1673; the next nonempty block is two source frames later at sample3510. Source seek increments use1837samples/frame while the continuous22050Hz/12fps clock uses1837.5. The proposed native plan preserves all post-latency PCM and the authored initial gap, with ties-to-even sample rounding. It remains a candidate plan, not a runtime proof.

The three click streams have a nonzero first segment (peak about0.3687), so that segment must not be dropped as assumed silence. Correct Coach347 has1650 nonzero samples beginning at its final-frame clock position, peak about0.1423. Wrong Coach349 has1383 nonzero samples after its final-frame position, peak about0.1256. Preserve these facts when deciding explicit close, callback and branch-boundary policies; structural tails alone do not prove what the original player audibly emitted.

## Inventories and validation

Maintained `scripts/build-nms-l02-p052-inventories-v1.mjs` populated:

- `asset-inventory.csv`:109 source assets (96 SVGs, six MP3s, six PCM files, preserved SWF). Export membership is not runtime inclusion.
- `audio-inventory.csv`:six stream entries, language undetermined, source domain/start semantics and full decoded duration before scheduling. EN/ES host routing and listening pending.
- `keyframes.csv`:122 EN/ES planned inspections. No captures, trace authority, entry-state hashes, RMSE or human review are fabricated.

Checks passed: source/359export hash check; 156frame static audit; whole PCM reproducibility; inventories exact regeneration; draft manifest validation. Packet audit returns `PASS_WITH_SOURCE_DISCREPANCY`; clock audit returns `PARTIAL_MAIN_CLOCK_UNRESOLVED`. These statuses are intentionally not flattened into a page-level PASS.

Still required before renderer implementation: explicit native discrepancy/host decisions, complete behavior traces and entry-state contracts, full-frame coverage specification, detailed visual asset selection and bilingual semantic copy. SOURCE_SPEC_V1's reveal thumb and row-versus-column mismatches remain open. No production build or browser claim is made for this source-only change.
