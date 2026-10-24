# P003 candidate provenance closure v2 — 2026-09-24

Status: **unregistered local engineering evidence**, not a Current-JS admission,
reusable factory authorization, original-runtime comparison, audio listening,
or a publication decision.

## Why the successor was needed

The original root Canvas generator's `--check` failed on its v1
`adapter-spec.json` after the exact embedded-stream source audio was added to
`audio-inventory.csv`. The stored inventory SHA-256 was
`bbae8148f1753f228e69c4d86dd415a47d3be7c30f5c49246e58328641ae25d8`;
the current SHA-256 is
`678a3bbc54bbfb46653592d5b496db12e9dc424171aca0782998899d7443d397`.
The old v1 output and all v5 browser evidence were preserved; no generated
file was hand-edited or overwritten.

The maintained builder now writes a distinct
`work/g678-shared-page-factory/g678-nms-l09-p003-root-held-candidate-v2/`
using exclusive creation. Its spec SHA-256 is
`18912b7882f5d20340a77324a0be062fb7fb18b62180f852534c76d1b95911e7`
and manifest SHA-256 is
`8b5cf1d9c9ddb3c689787d192212cd2b00e8ea80929b4546c94b2092130f9e31`.
The regenerated 8,695,084-byte drawing JS remains byte-identical to the
historical v1 JS, SHA-256
`b3ca4454098121e236876cdf89882bef55752ae44c220976ecc032f4a01e43da`.
Consequently the existing v5 text-suppression generator and its 8,910,358-byte
runtime still pass exact `--check`; that runtime remains SHA-256
`c03538f5fc07a5697a549f911b15c0aac1c7e4c8da62819188141bba001bad27`.
No duplicate text variant or product runtime was created.

## Repeatable read-only check

Run from this worktree:

```bash
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' \
  node scripts/verify-g678-nms-l09-p003-candidate-closure-v2.mjs
```

The companion lock `CANDIDATE_CLOSURE_V2.json` (SHA-256
`709aa5db3bb4b15671eee0a2ea63e49839cc3f30020a0835a49e1984380b4a9f`)
pins 19 ordinary input/output files: the exact SWF, FFDec launcher and JAR,
project toolchain and npm lock, current audio inventory, raw export, old and
new root JS, v2 spec/manifest, v5 text variant, and local served copy. It also
pins the ten-file transitive **local source graph** of the three generators.
The verifier checks their cross-references and runs all three generators in
`--check` mode. External package bytes, the JVM runtime, actual FFDec execution,
browser pixels, and audio listening are not established by this lock alone.

Checks passed: the v2 root generator, existing v5 text variant, and local
package all reproduced exactly; seven source/renderer/race tests and one
new in-memory tamper regression passed. The tamper test rejects changed audio
inventory, root drawing, and a forged registration claim. The draft migration
validator passed schema-only validation. A separate full product build, real
My Lesson route, original-runtime baseline, visual comparison, listening,
human/Owner review, strict closure, and publication remain open.

The current private registry still has 471 distinct shared G6–G8 keys of
2,282 active placements; `shared-nms002-l09-p003` is absent. This closure
changes the candidate's reproducibility evidence, not that count.
