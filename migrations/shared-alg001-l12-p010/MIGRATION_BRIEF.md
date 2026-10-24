# shared-alg001-l12-p010 — source-audited draft

This canonical workspace holds source audit evidence for ALG001 L12 active page 10, VB page 4, **Plotting Points**. The physical source is `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/VB/L12VB05.swf`, SHA-256 `a846950547f7c3ab7b0445dfc2118d534565ffd352b6e9687ba8211e5d4a3fcd`; its paired FLA is absent. The source catalog navigation title `Trazado de puntos` establishes navigation wording only.

The compiler-assisted hybrid workflow is selected provisionally as **interactive-understood**: the root places sprite 96 at frame 6; the child contains 465 frames at 12 fps, nine release-driven glossary definitions, ten main button placements, four animated masks, 28 static-text definitions with 52 exact decoded runs and 53 main text placements, and 58 unclassified vector shapes. Shape 97 remains an unclassified separate root graphic. See [source audit](evidence/SOURCE_AUDIT_2026-09-27.md) and the exact inventories.

FFDec 26.2.1 XML, ActionScript, hex p-code, text and tag exports agree with fresh maintained byte parsing. Each release body assigns an exact `_global.KeyAttribute`, calls `_root.DoHyperLinks()`, and stops `_root.animation_mc.animation`. `Position` occurs twice. `Geometric figures` is exact, including its space and lowercase f; `length` → `Length` is the single explicit dictionary case crosswalk. Generic normalization is not authorized.

The MP3 stream is extracted only: 456 blocks on child frames 10–465, first empty MP3 payload at frame 11, 1,673 source latency/seek samples, and 189,020 concatenated payload bytes. The lesson-SA file is a separately pinned candidate, with different bytes and an unknown source host trigger. Neither stream nor sidecar was decoded, played, retimed, synthesized, or listened to.

Implementation must independently map sourceTextIds and repeated text/negative-sign instances; preserve or explicitly source-review every graphic, mask and hit region; provide a typed paused-frame glossary adapter; and derive P010 audio/visual end, Replay, seek and close/resume policies from P010 evidence. No renderer, route, timeline module, registry admission, Current-JS proof or runtime baseline is delivered in this draft.

The original seven scaffold files are preserved under `output/p010-source-native-20260927-v1/scaffold-before-audit` with byte hashes. The acceptance checklist, root-only keyframes and pending full-frame-coverage file remain unchanged. Main 465-frame and interactive trace coverage must be added deliberately in a later implementation task. All engineering, original-runtime, fidelity, audio/synchronization/listening, human, Owner, strict completion, release and publication gates remain pending.

Reproduction:

```sh
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node migrations/shared-alg001-l12-p010/audit/extract-source.mjs --check
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node migrations/shared-alg001-l12-p010/audit/build-source-audit.mjs --check
node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p010 --allow-draft
```
