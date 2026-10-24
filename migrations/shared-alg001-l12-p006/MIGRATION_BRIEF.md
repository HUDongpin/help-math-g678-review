# ALG001 L12 P006 implementation specification

2026-09-26. Status: source-bound engineering specification, unregistered.

## Current implementation addendum — 2026-09-27

The dated implementation-absence and unresolved-SA-trigger statements below
describe the original specification. Current maintained implementation now has
a private My Lesson host, mask-corrected Canvas v2, accessible glossary controls,
and continuous-stream-v2 embedded playback. That playback uses one continuous
span; an empty source block at frame 4 does not introduce a gap. See
`evidence/AUDIO_CONTINUOUS_CORRECTION_2026-09-27.md`.

The separate `SA/L12RW06.mp3` is statically bound to an explicit Spanish Audio
host operation by `evidence/SA_HOST_DISPOSITION_2026-09-27.md`. The current
controller loads and hash-verifies it only on explicit user activation, freezes
the retained main cursor, cancels stale loads/decodes/resumes, and releases it
on return, Replay, inspection and navigation. Natural completion or explicit
return resumes a nonterminal main cursor; frame 342 remains ended. SA pause
followed by Play restarts at zero, a documented source-informed candidate
choice, not verified original-runtime resume parity. ES locale does not play
or preload SA. The runtime exposes keyboard-operable EN/ES controls; the
source drawing remains English and narrow-screen teaching readability remains
unaccepted. Source host launch association, audible language, original-runtime
timing, listening, human/Owner acceptance, strict completion and publication
remain separate open gates. No review signature is supplied by this addendum.

Current code paths and frame-domain metadata are listed in `migration.json`;
current engineering verification is recorded in the successor SA report. A
future reviewed registration packet must establish real private Current-JS
membership; this addendum alone does not register a page.

## Identity and purpose

Placement `shared-alg001-l12-p006`, ALG001 lesson12, source ordinal6,
RW section page5, catalog title **Page 5**. Source title fallback is English;
no Spanish translation or subject-specific learning objective is invented.
Immutable asset ID is `swf-933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
The 708,053-byte SWF is physically preserved at the manifest's external AWS
source path. No same-path FLA is available in the catalog. No alias/variant is declared.

## Source structure and behavior

SWF CWS v6, AVM1, 800×600, 12fps, background #b8d8f7. Root10frames;
sprite53 main342frames; sprite56 title1frame. Root duration is not teaching
duration. `audit/frame-domain-disposition.json` declares all three source domains.
The full source drawing state for each of the 353 local/root frames is stored in
`audit/display-ir-v1.json`; transforms use source twips and unscaled matrix coefficients.

Root frame1 calls InternalPreloader.jump_check and stops. Root frame6 is
`begin`, stops, and places these layers in depth order:

1. sprite53, depth1, instance `animation`, translation (5568,7337) twips.
2. text54, depth64, translation (2407,-2760) twips.
3. sprite56, depth65, instance `Mc_Page_Title`, translation (8000,869) twips.
4. shape57, depth67, translation (0,0).

Main frame1 has an empty action; frame342 stops. Root's original preloader
transition is unresolved and must not be simulated as an accepted natural trace.
No additional nested sprite exists inside main53. Three mask placements, seven
morph definitions, bitmap alpha and embedded glyphs must be retained. Source
definitions and serialized-tag hashes are in `asset-inventory.csv`; this is not
a claim of independently exported assets or pixel fidelity.

Four source glossary actions set KeyAttribute to Coordinate/Graph/Equation/
Inequality, call DoHyperLinks, and stop animation. Button IDs48–51 are placed
at frames249 and338. Exact surviving intervals, hit geometry, glossary content,
close/resume policy and source language need their separate disposition.
Do not substitute guessed dictionary definitions or claim a generic modal is
equivalent to the original host. The four interaction traces remain pending
and are not covered by the six default visual-domain planning requirements.

## Audio and Replay

340 embedded MP3 stream blocks occupy main frames3–342. Header rate code2
means 22,050Hz, mono; nominal1837samples/frame and latencySeek1673. Each block's
sampleCount and signed seek are recorded in source-structure-v1.json.
No natural audio clock, decoded duration, audible language or terminal tail
behavior is inferred from frame counts. Separate SA/L12RW06.mp3 is a catalog
candidate with independent hash; its host trigger is unresolved.

Replay in the candidate must reset main frame, glossary selection/modal state,
audio playback generation, decoder position and terminal flag together. This
is an engineering lifecycle requirement; original-host equivalence remains pending.

## Rendering decision and implementation boundary

Compiler-assisted hybrid: extracted Canvas source drawing for the timeline,
with a maintained deterministic state layer and accessible DOM glossary controls.
Reject flattened video because glossary actions and frame-sensitive controls are
required. Retain source glyphs and morph paths rather than inventing SVG redraws.
P005 symbol IDs, masks, audio rate and timing formulas do not apply to P006.

FFDec26.2.1 root/main/title Canvas exports are hash-bound under
`audit/ffdec-26.2.1-canvas-v1/`. Raw FFDec viewers must not be shipped: their
dynamic dispatch, timers and browser event behavior require the reviewed safe
adapter. Generated output is changed only through maintained builders.
No application route, module registration or shared-host modification exists yet.

## Determinism and validation requirements

Keep root and main playheads separate, one-indexed and queryable without timeouts.
Root5→6 introduces the full composition; main1 and342 are explicit boundaries.
Move tags inherit omitted attributes; removal/replacement applies in source tag
order before ShowFrame. Clip geometry must remain independent of painted alpha.
Validate forward/reverse seeks, Replay, masks, morphs, terminal state, every
glossary activation boundary and EN/ES accessible host behavior independently.

Canvas backing store uses exact native800×600 for parity; responsive presentation
and higher-resolution integer scaling require separate host tests. Capture
identity must match frame domain, requirement, trace, scenario, language and seed.
EN/ES visual coverage plans do not claim translated source content. All planned
capture counts remain0, original-runtime authority unresolved and reviewer fields empty.

## Acceptance and current evidence

Extraction and deterministic structural checks only. No browser execution,
production build, original-runtime traces, RMSE comparison, audio listening,
human/Owner approval, strict completion or release claim. Exact commands and
results are documented in evidence/SOURCE_AUDIT_2026-09-26.md and successor reports.
Continue to a bounded candidate, then real My Lesson integration; do not count
this specification, export or structural IR as a registered page.
