# P005 source-audio transport candidate — 2026-09-26

## Scope and implementation decision

This continues the P005 implementation, not registration or audio acceptance.
The prior source-structure, raw seek-coordinate map, decoder boundary, and
instrumented Ruffle observations remain separately scoped evidence. They do
not yet establish the authoritative frame-to-sample policy across the initial
zero block and the long block gap. No diagnostic timestamp is copied into the
lesson's visual clock, and no silence is synthesized as an accepted source cue.

Implement the necessary reusable playback lifecycle in source-sample space
first: one complete source decode, one active node, explicit sample windows,
pause/resume, paused seeking, Replay, completion, and context disposal. The
future page scheduling adapter owns the mapping from source frame to sample
window. This candidate is not a substitute whole-file soundtrack for the page.

## Maintained code

- `packages/demos/src/alg-l12-p005-audio-decode.ts`: snapshots the supplied
  bytes, checks 597,584 bytes and SHA-256
  `988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`
  before decoding a copy, preserving the caller's buffer. Requires 44,100 Hz
  context and decoded mono data with 3,309,696 samples. No fetch, playback,
  or context creation is performed by the helper.
- `packages/demos/src/alg-l12-p005-audio-transport.ts`: owns the transferred
  AudioContext and a zero-gain-by-default output. Each resume creates at most
  one source node. A generation counter cancels stale asynchronous resume
  success/failure after pause, seek, Replay, replacement play, or close. Sample
  windows and cursor bounds are checked before changing playback state.
  Natural completion never advances a lesson by itself. Closing disconnects
  owned nodes and closes the context once.
- `scripts/probe-g678-alg-l12-p005-audio-transport.mjs`: an ephemeral
  localhost-only, source-hash-checked, muted browser probe. It bundles the
  maintained TypeScript modules in memory and serves only the probe, bundle,
  and pinned MP3. No app/registry route is enabled. It records implementation
  input hashes, browser identity, decode shape, nonzero sample count, and
  exercised lifecycle states without persisting PCM.

The original SWF remains SHA-256
`b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
Source extraction remains byte-identical. No compressed MP3 slicing, generated
renderer editing, Ruffle dependency in product code, or source modification
is introduced. Source speech remains English; Spanish translation and source
language listening acceptance are not established by this work.

## Executed verification

Two GPT-6 Sol / xhigh agents implemented the decoder and independent transport
tests in disjoint files. Main authored the transport, reviewed both additions,
fixed the shared start-time anchor and stale rejection handling, and reran:

- 4 decoder tests plus 11 transport tests: 15/15 PASS.
- Strict TypeScript check explicitly scoped to both new modules and both test
  files, with `--types node`: PASS. The first main command omitted Node types;
  the corrected command also exposed and fixed a test-fixture override type.
- Source extraction `--check`: PASS, same MP3 and SWF hashes as above.
- Real Chromium 153 browser probe: PASS. Entire source decodes to 3,309,696
  finite mono samples at 44,100 Hz, including 3,073,328 nonzero samples and
  peak amplitude 0.9418219923973083. The playback run is muted; nonzero data
  is not listening acceptance. No PCM files were saved.
- Browser controls: pause at sample5504 holds position, resume advances to9088,
  seek sets22050, Replay restarts near the window origin, the final1000-sample
  window reaches natural end3309696, and repeated close leaves context closed.
  These sample positions reflect the actual test run's timing, not product
  cue constants or SWF frame positions.

The full demos package typecheck attempted by the agents exhausted Node's
default approximately 4 GiB heap. It provides no project-wide pass or fail
diagnostic. No app build was rerun: these modules are not yet imported by the
app and prior app-build results remain dated evidence.

Browser receipt:
`output/playwright/g678-p005-audio-transport-20260926/audio-lifecycle.json`,
SHA-256 `5f7490e704b29768cdcc8ee2aa31dc83eb06948880920032fcefea8a2eabf1bc`.
It pins the decoded source and both executed implementation files:

- Decoder: `ae83ba26cb1cab5e8079bd8f17c2938940d0c6e9c2380c1d08e763d383aadbce`.
- Transport: `2c3022b53a36e9bd0235b86ab11b008ae24548ff67431b914f84a99c523d4879`.

Main inspected `audio-lifecycle.png` as a status-view spot check, not a lesson
visual comparison. The diagnostic console recorded an unrelated favicon404;
zero HTTP errors is not claimed. The browser, ephemeral server, and both
agents were closed after evidence collection.

## Product gate remains unchanged

P005's My Lesson probe remains visual-only (`audioEnabled: false`), unregistered,
and production-excluded. No shared host, registry, production route, provider,
or release change is made. Page coverage remains 480/2,282; this transport is
not counted as another page. Frame scheduling, real host audio controls and
navigation lifecycle, original-runtime behavior, synchronization, listening,
human/Owner, strict completion, and publication remain to be verified.
