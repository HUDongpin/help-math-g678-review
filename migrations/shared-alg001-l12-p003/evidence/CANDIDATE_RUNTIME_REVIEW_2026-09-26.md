# P003 composed drawing runtime review

Status: unregistered engineering candidate. Read earlier CONTINUATION_2026-09-26.md for source identity; this supersedes its not-yet-built runtime statement. Full migration goal remains active.

Maintained builder: scripts/build-g678-alg-l12-p003-candidate.mjs. Runtime: candidate-v1/canvas-renderer.js, 8,757,124 bytes, SHA-256 f42b2edc01881c3ec3d60a8de36da436883e6befa8d066fb673592c4c7e6874c. --check reproduces spec/runtime/manifest. --promote only copies verified bytes into local factory custody, never registers or accepts the page.

Root composition at frame6 retains text2/depth1, main164/depth2, title166/depth146 and border167/depth148. The main's export-bounds translation(131.4,406.4) is offset against source placement(209.45,283.5) exactly once. Root raw definitions are AST-parsed and only missing definitions are appended; all shared definitions except expected standalone sprite164 wrapper must match. Nested sprite22 remains source-derived inside main. Root main() is retained solely for the safe dispatch allowlist, not executed.

P003 includes one DefineBits/JPEG character9, encoded as imageObj9. An initial build assertion incorrectly assumed the P004 zero-image contract; it failed before output creation. Source inventory and exported declarations proved exactly one embedded JPEG. The corrected P003-specific validator allows only that inline data image and two canvas constructions; shared safe runtime checks remain unchanged. Browser ready() successfully decodes the image. No external image fetch is introduced.

## Checks performed

- Candidate tests4/4: byte reproducibility, conflict rejection, active primitive/remote-image rejection, all1008 source-frame identities and invalid-language/frame requests.
- Glossary extraction tests3/3 independently rerun by main after reviewing the agent's code. Six exact English/Spanish source entries; no case normalization required. 10,609-byte source-glossary-v1.json SHA a102009648afcbf4b9f2f81d8bbec1a5b9468329212da44056a9aec5bdce6b0b. Media/original host lookup still unverified.
- Pure glossary state tests3/3 rerun.
- Full web build passed before new product module/route integration: TypeScript,244staticpages,11deploymentassetchecks; BUILD_ID cj9z1cWoFeE-Pm7nm0MbS. This is not a post-integration build.
- Local probe script binds only127.0.0.1:3134, independently confirmed by lsof.
- Real Chrome153 drew1008/1008frames,371distinct native800x600RGBA SHA-256 hashes. Reverse repeated1008,908,860,825,124,1 matched exactly. See current-js-drawing-sweep-2026-09-26.json. This is current-JS direct drawing, not original runtime or natural playback.
- Main visually inspected screenshots for1,124,500,825,1008 under output/playwright/g678-p003-drawing-20260926. Title/border/main are present; frame124 shows the embedded tower image, frame500 the numeric table, later frames the graph and source text. Blank terminal table is not repaired by guessing; source sequence changes are distinct from original-runtime fidelity.
- Hash sweep reads native800x600pixels. Browser DPR2 produced1600x1200display screenshots; these are spot checks, not native baseline comparisons. No RMSE or fidelity claim.
- Console: zero errors, one getImageData willReadFrequently performance warning from repeated probe readback. Preserve it, do not claim warning-free.

## Pending integration and gates

Module/timeline and local route/server are separate parallel tasks after this drawing check. Final freezes, registry admission, current build and actual My Lesson EN/ES/dialog/playback/navigation/layout/production-negative checks must follow their reviewed outputs. Do not count this candidate yet. Root/title/nested isolated-domain captures, original host trace, required audio timing/listening, Spanish teaching visuals, typography, human/Owner review, strict completion and publication remain pending. Audio is intentionally disabled and source drawing fixed-English.
