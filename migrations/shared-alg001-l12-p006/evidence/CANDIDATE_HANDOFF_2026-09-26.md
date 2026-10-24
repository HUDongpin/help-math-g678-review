# P006 source drawing candidate and integration boundary

## Outcome

The P006 source audit now has a deterministic display IR, complete root/main/title
Canvas extraction, and an unregistered safe JavaScript drawing candidate.
Two parallel agents delivered source glossary and embedded MP3 evidence; the main
agent inspected their scripts/reports and reran the relevant checks.
This is engineering progress, not a new registered page.

## Exact artifact boundary

- Source SHA-256 `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
- Canvas extraction: 8 files, 23,116,449 bytes, root10/main342/title1 domains.
  Receipt SHA-256 `531b5d3bb602e62779ae65106f8ed5961efa7f4db96f8563dde59a9fd76ca16c`.
- Display IR: 645,247 bytes, all353 root/local source frames. Source tag order,
  retained move properties, depth sorting, removal and same-frame replacement are
  reduced by `scripts/build-g678-alg-l12-p006-display-ir.py`, not guessed from screenshots.
- `candidate-v1/canvas-renderer.js`: 11,508,223 bytes, SHA-256
  `95e0f487767fce6364c7e120b75caa81d541cfd96a0f09294be82a488bfc5df6`.
  Maintained builder: `scripts/build-g678-alg-l12-p006-candidate.mjs`.
- Four source layers are composed in original depth order: sprite53, text54,
  sprite56, shape57. Only main53 has a public candidate frame resolver (1–342).
  Root/title domain plans are not implemented by this candidate API.
- The safe adapter removes the FFDec viewer, timers and dynamic dispatch. One
  embedded image is allowlisted. Each draw uses a fresh surface to prevent
  retained clip/context state leaking into reverse seeks.
- This is a **visual-only EN source-frame candidate**. It rejects ES and glossary
  scenarios; it does not translate source content, execute source AS, play audio,
  expose production routes or register a lesson page.

## Parallel source findings

Glossary `audit/glossary-disposition-v1.json` binds four source buttons and their
hit shape, matrices, action order and clip mask. Buttons are present249–337 and
replaced within338, then retained through342. Existing source-backed bilingual
definitions use the same keyterm XML references as the physical L12 index, but
original host lookup, clipped hit behavior and close/resume/audio semantics remain
unverified. Report: `evidence/GLOSSARY_DISPOSITION_2026-09-26.md`.

Embedded source MP3: 140,920 bytes, SHA-256
`801d34dc684341a2644a7fcc3373bea98cbc14bdf91f4364db0e37c30e7c1803`.
340 blocks, including the zero-payload frame4, decode to624,384 mono samples at
22,050Hz. The separate SA MP3 physical hash matches catalog. This is machine
decode only, not a transport schedule or listening acceptance. Report:
`evidence/AUDIO_SOURCE_2026-09-26.md`.

## Checks actually executed

- `node scripts/export-g678-alg-l12-p006-canvas.mjs --check`: pass.
- `python3 scripts/build-g678-alg-l12-p006-display-ir.test.py`: 3 tests pass.
- `python3 scripts/build-g678-alg-l12-p006-display-ir.py --check`: reproducible IR.
- `python3 scripts/build-g678-alg-l12-p006-spec.py --check`: reproducible58 definition
  rows,6 pending default visual-domain requirements and692 structural keyframe rows.
  These are planned rows, not captured or reviewed frames. Glossary trace requirements remain pending.
- `node --test scripts/build-g678-alg-l12-p006-candidate.test.mjs`: 4 tests pass,
  including rebuild, source composition guards,342 forward/reverse pure frame
  states, rejected invalid inputs and forbidden runtime primitive checks.
  The resolver test mocks an already-decoded image; no browser image-decoding or pixel claim.
- `python3 scripts/extract-g678-alg-l12-p006-stream.test.py`: 4 tests pass.
- `python3 scripts/audit-g678-alg-l12-p006-glossary.py --check`: pass.
- Draft migration validator: pass; portable schema only.
- Required renderer-domain audit was attempted with `--id shared-alg001-l12-p006`
  and a P006-local index path. It failed with **prototype runtime is missing**,
  because there is no registered prototype module. This is not a pass and was not
  bypassed by premature registration.

No production build or browser capture was performed this turn. No original-runtime,
RMSE, audio listening, accessibility/host flow, human or Owner gate was closed.

## Next implementation work

1. Inspect and correct clip geometry/morph behavior through the maintained builder;
   the source has three mask placements and raw FFDec mask alpha is not assumed correct.
2. Add the P006 maintained interaction state and source-backed glossary mapping,
   respecting the frame249/338/342 boundaries and mask-clipped hit geometry.
   Keep modern close/resume policy explicit rather than claiming original-host authority.
3. Add a bounded private host probe, tests and production-negative/build checks,
   then inspect actual native-size and responsive browser rendering before registration.
4. Implement independently audited audio decode/transport and timing; do not reuse
   P005's44.1kHz sample schedule. Original-runtime/listening remain separate.

Shared host and private registry were not edited. Source SWF was not modified.
P005 holds are preserved. Full G6–G8 objective remains active; the membership
count remains480/2,282 (21.03418%), not full-goal acceptance.
