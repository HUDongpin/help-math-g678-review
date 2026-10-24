# P005 instrumented Ruffle stream diagnostic — 2026-09-26

## Result and authority

The final diagnostic capture contains all 968 sequential main-sprite frame
traces, from 1 through 968, with zero recorded event drops. It observes the
source animation and mixed audio output in Ruffle 0.4.1, with output muted.
It is not an original Flash runtime baseline, original-host entry proof,
listening review, synchronization acceptance, or a completed Current-JS page.

Official catalog/private-registry intersection was freshly recomputed:
480/2,282 = 21.034180543383%, with 1,802 remaining. P005 is unregistered.
No product implementation, registry, shared host, or provider was changed by
this diagnostic step. The complete G6–G8 migration goal remains active.

## Source-preserving diagnostic setup

Maintained tools: `scripts/forensic-g678-alg-l12-p005-stream.mjs`,
`scripts/lib/g678-p005-forensic-derivative.mjs`, and the corresponding server
test. The original source is read from the physical AWS source root, checked
against its exact size and SHA, and never written:

- Source SHA: `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
- Source bytes: 1,950,595.
- Linear-entry derivative SHA: `ce856f85e3cbc9f5384a437b9c573a58589999f211fdf207774a41d7366c410b`.
- Derivative bytes: 2,292,879, retained in server memory only.

The derivative replaces root frame1's external-preloader action with Play,
allowing root frames1–6 to execute until the authored frame6 Stop. It adds one
frame-number Trace before each of the 968 main-sprite ShowFrame tags. It does
not reproduce or establish the legacy host's entry semantics. All 902 stream
block bodies and frame associations are compared against the original;
the complete audio payload remains SHA
`988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`.

The server binds ephemeral localhost only, permits exact source/runtime
allowlisted routes, and rejects alternate Host headers, cross-site requests,
queries, unknown routes, and non-GET requests. Ruffle networking and script
access are disabled. WebAudio destinations pass through a zero-gain node.
Per-buffer scalar statistics are collected; no decoded PCM is persisted.

## Failed and partial observations retained

1. The unmodified standalone source remained at the preloader-dependent blank
   stage. This does not establish natural main-timeline playback.
2. A direct-jump derivative also remained blank. That failed entry strategy is
   retained, not described as a source defect. An initial trace callback placed
   before Ruffle load was ineffective; subsequent runs attach it after load.
3. The first successful linear run captured frames1–901, then reached the old
   10,000-event cap. Rotating the event array later did not recover frames902–968.
   `linear-trace-part-a.json` and `linear-trace-part-b.json` must not be joined
   into a purported full-frame trace.
4. The recorder was raised to 30,000 events with an explicit dropped-event
   counter and an overflow regression check, then a fresh run was captured.

## Final capture

All paths below are relative to
`output/playwright/g678-p005-source-forensic-20260926/`:

| Artifact | SHA-256 |
|---|---|
| `linear-full-trace.json` | `c21e7d4957a5093454db0496634d5942d70d8d2e605fc290ed1a7e29a557b5a0` |
| `linear-full-terminal.png` | `c01c62736931f7f8c40879c67c069d6a518442dd6fa46f52be327a44de8260be` |
| Earlier `linear-trace-part-a.json` | `b47a867876d81cb7408fe4309b4272de227ad71bcb5f510b6fd3329095f137f5` |

The full JSON has 11,279 events, exactly 968 contiguous frame traces,
eventCapacity 30,000, droppedEvents 0, and one muted 44,100 Hz AudioContext.
Frame1 context time is 0.5108390022675737 seconds; frame968 is
81.13052154195012 seconds. Trace time is an observed callback clock, not a
sample-exact original-runtime clock. Main visually inspected the final
screenshot; this is a terminal-view spot check, not full-frame visual parity.

Ruffle emits small mixed-output buffers, not one AudioBufferSourceNode per SWF
stream. Buffer counts must not be called source-stream counts. A zero-output
observation inside the missing-block region is compatibility evidence only;
the absence of SWF blocks itself does not prove silence. Browser console has
one favicon 404 and no other recorded errors; do not claim zero HTTP errors.

The maintained analyzer `scripts/analyze-g678-alg-l12-p005-forensic.mjs` reads
an explicit capture path and prints a SHA-bound diagnostic summary without
writing over the evidence. In the full capture, the observed frame340..384
context-time interval is [28.775328798185942, 32.44698412698413] seconds.
Exactly 158 scheduled buffers lie entirely inside it; all 158 have zero
sample values. Buffers crossing either boundary are excluded, so this is not
a claim that every sample of the whole interval has been proven silent.
The first recorded nonzero sample is scheduled at 2.5016780045351488 seconds;
the first in a buffer starting after the gap boundary is at
32.76104308389938 seconds. These are this run's AudioContext coordinates,
not offsets to copy directly into the product player.

The CLI click command reported a timeout because the button was already
disabled. Live state independently showed exactly one load and advancing
frames; the exported trace is the evidence, not the click command status.

Independent review requested an explicit distinction between preserved source
identity and the bytes served at `/source.swf`. The maintained server now adds
`servedSha256` and `servedBytes`, with a test hashing the actual instrumented
HTTP response. The saved capture predates these additive fields and is not
rewritten: its nested `binding.derivative` already binds the served derivative.
The review's 159 zero buffer starts within the marker interval and the
analyzer's 158 wholly contained buffers use different selection rules; the
more restricted 158-buffer result above excludes boundary-crossing buffers.

## Preservation and next implementation boundary

The shared host SHA remains
`494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`;
private registry SHA remains
`b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.
The diagnostic browser and server were closed after capture. No commit, push,
provider access, deployment, or source rewrite was performed.

Two GPT-6 Sol / xhigh agents implemented the bounded analyzer and independently
reviewed the diagnostic setup. Main inspected the changes, tightened analyzer
validation, resolved the served-identity review finding, and independently ran
36 passing tests: 8 forensic analysis, 3 derivative/server, 10 audio
extraction/timing/seek/decoder, and 15 drawing/runtime/mask/nested-timeline.
Source extraction and seek-map `--check` passed, as did `git diff --check`.
Both agents were closed after result collection. No new production build was
run for this diagnostic-only change; earlier build receipts remain dated.

The next product step is a bounded maintained audio scheduling candidate,
checked against source block semantics, this explicitly limited compatibility
observation, pause/seek/Replay behavior, and actual My Lesson controls. Do not
turn raw seek arithmetic into an audio clock or activate P005 registration
from this diagnostic result alone. Keep original-runtime, fidelity, listening,
human/Owner, strict-completion, release, and publication gates independent.
