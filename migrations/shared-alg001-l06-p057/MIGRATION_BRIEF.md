# ALG001 L6 P057 — source-backed Current-JS candidate

## Exact placement and current boundary

- Source placement 57, TS section occurrence 7, `TS/L6TS08.swf`, Question 2.
- Source SHA-256: `03782ef6ed4587d61db4476648d0d69b5ad158f84b2f6a0ba747605a6712fb31`.
- SWF-only; no same-path FLA was found. Preserved working copies and the physical AWS source remain hash-bound.
- Main sprite 312 has 856 frames at 12 fps on an 800 × 600 stage; the root has 10 frames and enters at frame 6.
- This document describes the unregistered engineering candidate. The real My Lesson admission and final registered host receipts, when produced, are separate artifacts.

## Source behavior and implementation

Source extraction uses FFDec 26.2.1 and swfmill 0.3.6. The model binds 382 exported files, 82 text definitions, 75 ActionScript exports, and nine embedded streams. The maintained Canvas generator resolves the source display list; React supplies readable native text, keyboard controls, and source-bound glossary actions. The source geometry and timeline are retained separately from the native reading layout.

Main holds occur at 313, 481, 629, 788, and 839. The first two step controls resume the parent. The latter two open silent boxes 259 and 267. Box frame 15 holds; Close plays through frame 20 and resets the box to frame 1 while the parent remains held. Native Continue projects the authored release handler from the empty sprite 189. This is not evidence of an original mouse hit area for that empty clip.

The correct choice is D, `y = 5x – 4`, for the table `(3,11), (6,26), (9,41)`. The seven feedback sprites are 77/93/52/105 (right) and 157/117/129 (wrong). All have terminal actions without an intermediate Close hold. Wrong count increments at the feedback terminal: first wrong retries; second wrong resets and resumes. Right feedback resets itself before playing the parent. The source quiz resets the counter at frame 839; frame 840 leaves the quiz. The maintained end hold at 856 does not signal mastery or lesson completion.

Function help is sprite 295, established by static source and a scoped AVM1 diagnostic. The inactive angle popup 311 and stopped duplicate-name wrong clip 233 remain held. Seven distinct glossary keys bind the original English and Spanish dictionary: Equation, Function, Function table, Input, Output, Relation, Value. The help example's final comparison `y = 18 + 5 ≠ 11` is preserved, including the separately placed equals/slash source glyphs. No silent editorial correction has been made.

## Reuse decision

P056 and P057 demonstrate the same four-stop walkthrough, silent-box lifecycle, and terminal-count feedback mechanism. `source-function-walkthrough-state-v1.ts` and `source-function-walkthrough-runtime-v1.ts` extract that mechanism into maintained configuration-driven code. P057 is its current product-code consumer. P056 retains its frozen registered implementation and supplies independent differential regression expectations. This is not a claim of two active shared consumers or family scale-out calibration.

The existing `DecodedSourceStreamTransport`, deterministic host-feedback selector, source Canvas adapter, and My Lesson host bridge are reused. The older generic two-attempt helper increments on release and assumes wrong-feedback holds; those differences make it unsuitable here. Source-specific text, frame destinations, glossary lifetimes, option geometry, and PCM bindings remain in P057 configuration.

## Audio and separate acceptance

The real browser decode receipt pins all ten inspected media files: nine embedded streams plus the separately triggered Spanish MP3. Eight embedded streams are loaded; inactive 233 is measured but never played. Main narration starts at source frame 14. Right feedback 77 starts audio at frame 3. The empty negative markers at sprite 77 frame 27 and sprite 312 frame 855 contain zero payload and zero samples.

Right feedback 105 is source ADPCM at 5512 Hz, decoded through the existing checked SWF ADPCM decoder into a WAV. Chromium measures 11935 samples at 11025 Hz. Selected frame 2 skips 459 source samples and enters decoded sample 919. Resampler phase and original-runtime timing remain unverified. The silent step boxes use the prepared main AudioContext clock without playing main audio. Spanish Audio is explicitly requested, never triggered by locale, and returns to a held source state.

Original Adobe runtime authority, complete frame comparison, audio/listening acceptance, human visual review, Owner acceptance, strict completion, deployment, release, and publication remain open. Ruffle diagnostics, native screenshots, deterministic tests, and registration do not close these gates.
