# shared-alg001-l06-p045 migration brief

Evidence checkpoint: 2026-10-02 (Asia/Taipei), before formal Current-JS registration.

## Source and teaching behavior

- Placement: shared ALG001, Lesson 6, global ordinal 45, TI Question 4, source XML line 129.
- Physical source: `G6-G8-shared/ALG001/L6/TI/L6TI05.swf` in the real AWS source root.
- SWF: 783,221 bytes, SHA-256 `9dfff51a15bb0010b98ca10c1fac954bee5d9451ceb649d8ac202e98f2c05b9d`. Same-path FLA is absent.
- Question: “Which graph represents a function?” Use the vertical-line test.
- C is the correct visible graph (lower left). Its source instance is `AnsBtn2`, button 178. B is the upper-right graph, `AnsBtn3`, button 177, and follows wrong4. The source text IDs and full hit rectangles are preserved in `native-v1/answer-hit-geometry-v2.json`.
- Main sprite 350: 167 frames, quiz hold 53, continuation 54. Wrong4 sprite 307: popup 303 appears at frame 16, hold 22, nested Close 300 jumps to 23, terminal 31. Right4 sprite 220 ends at frame 25. A second wrong attempt resumes the main and clears the quiz counter; a correct answer preserves a prior wrong count.
- NMH 145 opens popup 144; Close 188 restores the held quiz. Nine glossary buttons map to Function, Graph, Represent, Vertical, Line, Point, and Vertical-line test.

## Implementation decision and reuse

Compiler-assisted advanced manual lane for graph hit testing, nested feedback, audio ownership, glossary return, and Replay. FFDec 26.2.1 exports are source-pinned, with explicit-frame generation through the existing safe Canvas adapter. SWF dimensions are 800×600 at 12 fps; the root has 10 frames and places the main at frame 6.

The implementation reuses `SourceAudioOwnerV1`, `decoded-source-stream-transport`, `useSourceLessonHostBridge`, `loadBoundLessonAudio`, and the real `SourceLessonCandidatePlayerV1`. P045 keeps its source state, graph labels, geometry, frame destinations and glossary gates local. The frozen P044 implementation is the inspected reference for source quiz/feedback semantics. Graph hit targets are new page-owned React buttons derived from P045 geometry; no generated Canvas output is hand-edited. No broader factory capability or throughput gain is claimed.

The Canvas generator suppresses the source-hidden NMH popup and Close button. The native companion owns those controls and readable popup text. Choices use transparent native button targets over source graph rectangles. The source glyph rendering is preserved; text remains source English in an EN/ES host. Source Canvas typography and original-runtime visual comparison remain open.

## Audio

Three original embedded MP3 streams are physically extracted from main350, wrong307 and right220. Separate `SA/L6TI05.mp3` is user-triggered and never mixed into embedded audio. Source frame/sample metadata and the four browser decode readbacks are recorded under `audio-source-v1`. Decode checks pin compressed bytes, sample rate, sample count and PCM hashes. They do not prove audio-to-frame alignment or listening acceptance.

## Verification and next gate

- Source v2 geometry links each visible A–D glyph to its source hit rectangle and actual ActionScript feedback branch.
- 13 targeted state, runtime, audio-owner and native-control tests passed, including correct C, wrong B, two wrong Close cycles, stale callbacks, Replay, glossary return, and explicit SA.
- Two local request-boundary tests passed for bilingual documents, source hashes, referer/fetch guards, Range denial and Production denial.
- Demos TypeScript and the candidate physical Production build, including web TypeScript, passed. Subsequent formal-view additions require their own current checks.
- Real My Lesson EN checks passed for visible B wrong / C right, two wrong Close cycles, nested NMH/glossary return, Represent, Replay, and Previous P044 / Next P045 cleanup. ES checks passed for keyboard C, explicit SA/return, frame 53 → 167 → Replay 1, and no SA request from locale alone.
- ES viewport 390×844 with root font 20px had document and article widths 390/390, with graph hit rectangles within 0.02px of the source-derived expected positions. Real Tab navigation reached C with a visible 3px outline, and Enter triggered correct feedback through frame 167. This is a bounded layout/interaction check, not whole-page typography or visual-fidelity acceptance.
- Local candidate route: `/en|es/migration-status/g678-calibration/shared-alg001-l06-p045/candidate-v1?mode=focus`, exact loopback port 3331 only.
- The pre-proof physical Production build and compiled review passed, followed by 136/136 HTTP denials across unset and real source roots. The compiled SWF/SA/Canvas hashes were absent and no P045 marker appeared in static output. Formal proof/admission and fresh post-registration browser/Production checks remain separate steps.
- Official registration at this checkpoint is 524/2,282, excluding P045. Read the active admission index and registry for subsequent current counts.

## Corrections and independent acceptance

The output-only v1 intake/geometry/native model incorrectly equated instance numbering with visible letters. The v2 source packet corrects B/C through glyph IDs 37/60 and geometric overlap. The v1 files remain as failed evidence outside the canonical inputs. A draft native-binding export inherited popup frame 13; the maintained generator now derives and asserts frame 16 from the source timeline, with the failed draft retained outside the migration.

Authoritative original-runtime traces, full-frame comparison, source timing, named-human listening, human visual review, Owner acceptance, strict completion, release and publication remain unverified. This work performs no provider deployment or release action.
