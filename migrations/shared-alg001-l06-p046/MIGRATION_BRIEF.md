# ALG001 L6 P046 — Question 5

## Identity and source

Active placement `shared-alg001-l06-p046`: ALG001 L6 global ordinal 46,
TI ordinal 5, `TI/L6TI06.swf`, Question 5. The 60-page lesson XML identifies
this occurrence. It is a five-value drag/drop function-table exercise for
`y = 3x – 5`, followed by worked substitutions.

Physical source root:
`/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6`.

- SWF: 240,172 bytes; SHA-256 `c69f1f0fdaff0201af171aaee6b9b90a33b483e8c93ffef406c31cf0853a54b8`.
- XML: 13,926 bytes; SHA-256 `9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c`.
- SA: 350,784 bytes; SHA-256 `de3c127ba68d082b9a296fb17cb31a72f477f460fde01b8e3370402bb414f18e`.
- Same-path FLA absent. Read-only working copies are under `source-v1/`.
  Original sources are unchanged; no canonical source promotion occurred.

## Audit and specification

FFDec26.2.1 and swfmill0.3.6 extracted 31 ActionScript files, 57 text definitions,
2 fonts and 11 sprites. CWS6/AS2, 800×600 at12fps; root10 with entry at6.
Nested main123 has743 frames; root length remains separate.
`generator-v1/derive-source-model-v1.py --check` verifies source/copy hashes,
export inventory, glyph text against FFDec, placement history, drag geometry,
scripts and raw binary/XML MP3 block identity. It reuses the frozen affine
helper exercised by P041–P045 without changing it. The source model retains
all text definitions, main text placement runs and source stream blocks.

Bank top-to-bottom: 0, –3, 6, –8, 4. Exact matching:

| Source / target | Value | Missing cell | Given cell |
| --- | --- | --- | --- |
| Src_1 / Tar_1 | –3 | row1 input | output –14 |
| Src_2 / Tar_2 | –8 | row2 output | input –1 |
| Src_3 / Tar_3 | 0 | row3 input | output –5 |
| Src_4 / Tar_4 | 4 | row4 output | input 3 |
| Src_5 / Tar_5 | 6 | row5 input | output 13 |

Main163 stops and resets quizDragCount. Press stores the origin and hides
Try again. Wrong release restores that source, shows Try again and restarts
wrong coach61 at2. Correct release snaps and disables only that source,
increments count and restarts right coach63 at2. Unmatched sources remain
available. Wrong/right coaches may overlap; restarting one leaves the other.
Both reach20 then loop to stopped1. Right63/frame20 resumes main only at
count>=5. Main164 removes coach/popup objects; main743 stops.

NMH opens static popup85; Close74 hides its owning popup. Main glossary:
Input, Output, Function, Table. Popup glossary adds Variable, Value, Solve,
Substitute, Equation. Referenced Mc_Ani help subclips are absent. The page
has no enableButton definition or Mc_Right_Feed/Mc_Wrong_Feed variants.
The retained indexMI host is conditionally compatible; historical invocation
remains unverified. Do not invent help animation or random feedback variants.
No legacy endpoints are executed.

## Lane and reuse

Bounded advanced-manual implementation inside the compiler-assisted hybrid
workflow. ALG L9 VB06 groups cards by category and resolves immediately;
P045 serializes feedback. Neither matches P046 semantics. Keep the reducer
local; reuse affine extraction, decoded audio transport and modern My Lesson
bridge where compatible. The existing single-selected-stream owner cannot
represent concurrent coaches; browser integration needs parallel transports.

Native quiz uses a semantic table, exact source text IDs/values, pointer drag
and keyboard pick/place. Layout is modern presentation; source positions stay
in evidence. Full timeline/Canvas and real My Lesson integration are pending.
ES retains disclosed English source teaching text; Spanish controls and exact
source dictionary definitions are separate from lesson translation.

## Audio and evidence

MP3 extraction removes only the 4-byte block header. Binary/XML agree on
724 main,19 wrong,19 right blocks; payload sizes are300040/7800/7800 bytes.
All three and SA decode with FFmpeg. Decode does not prove browser PCM,
frame alignment or listening. SA is explicit-user-trigger only.

Source spot frames162/163/164/743 are under
`output/g678-p046-source-intake-20261002-v1/source-keyframes/`.
These FFDec static projections do not execute ActionScript. Frame163 includes
popup85 before script visibility; it does not establish an initial help popup
or original-runtime evidence.

Pure implementation: `packages/demos/src/alg-l06-p046-state-v1.ts` and tests.
Native projection: `generator-v1/derive-native-bindings-v1.mjs --check`.
Nine exact EN/ES glossary entries now regenerate and check successfully.
11 targeted tests pass. The isolated native browser confirms real drag, keyboard,
help return and source163/164 boundary; mobile390x844/root20 has no overflow.
See output/g678-p046-source-intake-20261002-v1/root-checkpoint-v1.json.
Still required: full renderer, glossary host integration, browser audio ownership
and PCM measurements, real My Lesson candidate, bilingual/interaction/layout
checks, physical production isolation, guarded registration and postflight.

Registry remains525/2282, ALG001 L6 48/60; P046 is unregistered. Original
runtime, fidelity, audio alignment/listening, human/Owner, strict completion,
release and publication remain open. No deployment occurred.
