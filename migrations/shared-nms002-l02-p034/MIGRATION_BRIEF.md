# shared-nms002-l02-p034 migration brief

Source audit/specification and native state candidate prepared; renderer, audio player, actual MyLesson and Current-JS admission pending.

## Identity
NMS002 Lesson2 page34/IN18, Decimal Practice. Preserved SWF L2IN19.swf,155382bytes,SHA256 c1ba22980b841b62e84169f3c1527dd6d6ab5f678279d7938bba5af6fd47b7ee. No pairedFLA located. Root10frames/entry6; main172 has396frames and authoredstop395 at12fps,800x600.

## Teaching and interaction
The guided model fills1..12hundredths at99..110, then13/14/15at165/166/167. Static fill disappears394; frame395AS creates100row-major duplicatecells and initializes0.15. Slider x[-339,-90] maps through Math.round((x/50+5)*40/2)+36 to0..100, all101values verified over2491positions. Reset release returns0.00; source digits are read-only and scratchfield171 is offstage. There is no source answer grading or success/failure feedback.

## Text and source projection
Title110 contains outlined course/activity text and must use the clear native title. Instruction152 appears through its own mask292..334; instruction154 through a separate depth mask335..365. Both are fully contained at395. Raw FFDec projection incorrectly omits first line there and does not render dynamic initialdigits or execute duplicatedgrid initialization; do not copy those omissions into the product. Preserve native source text and one exact EN/ES Decimal glossary action101.

## Domain boundary
All74authored domains/488frames are retained in sourceIR. Seven page/button-state reachable domains total415frames: root,156,158,159,161,167,172.67unplaced library/export definitions are preserved forensic data, not requested learner-facing content. Reset down-state contains audio-only sprite167, which ordinary placement reachability misses. No legacy lesson-shell recreation.

## Audio and lifecycle
Two complete embeddedMP3streams passed FFmpeg EOFdecode and repeatedbrowserdecode. Main172 startsframe8 and has714240decoded mono22050Hz samples; Reset167 has8640samples,startsframe1,and stopsframe5. One1673sample latencytrim is retained. Allmainpostlatency content ends725430samples, before the full395interval end725813. Main396remains source inspection pending original host resume. Button-release audio cancellation and exactFlashordering are qualified, not accepted. Native implementation must test fullhold, pause/resume, mastervolume, Resetpress/release,cancel,Replay,glossary andunmount cleanup.

## Native lane and acceptance
Advanced-manual within compiler-assisted hybrid: semantic100cells, accessible range, native source text and maintained state/audio. Touch andkeyboardrange controls are explicit accessibility adaptations. Retain guided redoutline/pointer source states with reduced-motion support. No renderer has been registered. Original runtime/fidelity/listening/human/Owner/strict/release/publication remain separately pending; all original capture counts are0. Source specification pins all evidence and planned requirements before renderer work.

## Native state checkpoint

Continuation131 implements source-generated396guided counts and maintained slider/reset/term/Replay state. Five tests cover all101values over2491source positions,394blank/395initialization/fullhold, resetpress/cancel/release distinction,339Decimalreadability and fullReplay reset. DemosTypeScript passed. Source colors and background#b8d8f7are recorded; no page renderer/audio engine/registration is created yet. See audit/native-state-candidate-v1.json.

## Native teaching components checkpoint

Continuation132 adds396frame source-derived teaching data(159visualstates/39guidanceshapes), native100cell diagram/digit display, independently revealed instructions, accessible range and Reset, plus exact Decimal modal. Seven tests and demosTypeScript passed. Browser checks cover395liveframes,101keyboard values,20width/zoom/language layouts and termfocus roundtrips; realmouse drag/releaseoutside confirms endpoints0/100andmid75. Native title and0.15remain readable at320px/200percent. Audio engine, composed player, module/renderer, actualMyLesson andregistration remain pending. See audit/native-components-candidate-v1.json.

## Audio and composed player checkpoint

Continuation133 adds complete sourcePCM bindings, main172continuousclock with full395hold and separate Reset167down-state audio.13unit tests cover exactPCM, pausedoffsets, hold, asyncReset cancellation, mastervolume, Replay/cache, hashfailure andclosed-lateread rejection. Composed Chromium player passed8realclock/analyser checks: voice andReset signals, mutedReset silence, termpause/resume, practice aftertermclose, pausecancelscue, Replay/narrationoffclock, onecontext andunmountclosure. Practice has no invented completion/scoring event. Module/renderer, actualMyLesson, typography/production isolation andregistration remain pending. See audit/native-audio-player-candidate-v1.json.

## Prepared module and local host interface

Continuation134 prepares seven-domain module/timeline/frame queries and native text/inspection rendering, plus local-only MyLesson adapter and exact two-stream access rules.13,280module queries and415renderer frames passed;18unit/access tests, demos and focused adapter types passed. Source-independent live value history is retained; Reset down-state167inspection stays before release, while main Reset scenario shows0.00.67unplaceddefinitions remain audit-only. The first adapter check rejected an obsolete reachableInNativeQuiz field; corrected loader uses exact167/172source lookup, and failure is retained. ActualMyLesson, typography, production isolation and CurrentJS admission remain pending.
