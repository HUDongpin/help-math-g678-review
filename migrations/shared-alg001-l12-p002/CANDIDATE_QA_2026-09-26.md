# ALG001 L12 P002 composed Canvas candidate — local QA

This is an unregistered, silent engineering candidate. It does not change the
shared registry, a Next route, or the modern My Lesson host.

## Source composition

The physical `RW/L12RW02.swf` is 800 × 600 at 12 fps, with 10 root frames.
Root frame 6 (`begin`, stopped) places sprite 454 at depth 1, title sprite 458
at depth 147, and frame shape 459 at depth 150. Sprite 454 has 1,951 frames.
The candidate draws those three root elements in that depth order, using the
source placement matrices and the existing FFDec 26.2.1 sprite exports.

The title root Y is −42.4 px. XML bounds put its `DefineText` 456 entirely
above the stage (Y −131.75 to −108.35), while its `DefineShape` 457 reaches
Y 31.25 to 55.65. The visible top-band title is therefore not inferred from
the text placement alone. Browser pixels in X 100–699, Y 20–64 had identical
SHA-256 `855db3be8178cf5d3fdfbb15b2e8cd760972c7f87a33a70ad6a336119935974d`
at sprite frames 1, 435, 1121, and 1951. The source frame shape's blue border
is visible in both spot captures.

The generated runtime SHA-256 is
`993722d3cf0c30601805005fe8b750cecf50620a9b6692f5628f342184b4a3e4`
(23,587,892 bytes). `candidate/adapter-manifest.json` binds the physical SWF,
swfmill XML, two FFDec exports, FFDec helper, peer adapter spec, builder, shared
adapter, audio parser, and generated output hashes. `--check` reproduces each
candidate artifact byte-for-byte from those inputs.

## Focused verification

- `node --check scripts/build-g678-alg-l12-p002-candidate.mjs`: passed.
- `HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' node scripts/build-g678-alg-l12-p002-candidate.mjs --check`: passed after generation.
- `node skills/flash-to-js/scripts/validate_migration.mjs migrations/shared-alg001-l12-p002 --allow-draft`: passed portable draft structure only.
- Isolated Playwright CLI session `alg-l12-p002` on loopback port 3128 rendered frames 1, 2, 415, 416, 435, 1115, 1116, 1121, 1839, and 1951. Full-stage RGBA SHA-256 for frame 1 was `44077abe52754e231e9c0c67a68406e4dbf774857f85ab1a77a5a9a60836f258`; frame 1951 was `3a2413db86f1dc526c9ae2578be59a66e378753806fd5fa5d1c1a552a1b6d206`.
- Frame 1 after later frames matched the initial pixel hash; repeated frame 1951 matched. Requests for frames 0, 1952, and 1.5 were rejected. There were no browser console errors; pixel readback emitted one performance warning. Only the local probe and runtime were requested.
- Local captures: `candidate/frame-0001-local.png` SHA-256 `a1349baa8a87a2124bf4c709f9e76a7319c02ebdb04e2ac9ea418d8e9b8c7495`, and `candidate/frame-1951-local.png` SHA-256 `26314357262feedc876ca178a7bc6a1a211d253813e890f3df8479761b9c6225`.

## Audio identification and limits

`candidate/audio-identification.json` records the MP3 stream under sprite 454:
1,927 blocks, 797,680 payload bytes, with block windows 1–415, 435–1115,
and 1121–1951. Frames 415 and 1115 have negative seek markers. The separate
`SA/L12RW02.mp3` is 478,128 bytes and is not byte-identical to the embedded
payload. `ffprobe` identified the embedded payload as 22,050 Hz mono MP3 and
the separate SA file as 48,000 Hz mono MP3; `ffmpeg -xerror` full decode to
null returned exit 0 for both. These facts do not establish cue meaning,
language, playback clock, segment synchronization, or listening acceptance.
The candidate has no audio playback.

The browser checks sampled frames; they are not a complete 1,951-frame
comparison or an original Flash runtime baseline. Root preloader behavior,
natural nested timing, pause/resume, bilingual product behavior, My Lesson
integration, original-runtime fidelity, audio listening, human and Owner
review, strict completion, release, and publication remain open.
