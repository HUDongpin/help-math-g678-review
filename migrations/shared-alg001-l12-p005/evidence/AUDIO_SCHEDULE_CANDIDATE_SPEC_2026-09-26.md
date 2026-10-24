# P005 continuous schedule candidate specification — 2026-09-26

Status: unregistered engineering hypothesis, not original-runtime clock proof.
This additive specification does not supersede the structural seek map or
pretend its raw coordinates establish continuous playback offsets.

## Source-bound inputs and proposed semantics

The source SWF remains `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
The extracted whole MP3 remains `988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`.
The exact source block groups are 23–339 and384–968, separated by absent
blocks340–383. Their cumulative decoded sample boundaries are 0/1,158,912/
3,309,696. Source frame rate is12fps and source sample rate44,100Hz.

Candidate policy, explicitly inferred rather than accepted:

1. Begin each contiguous source block group at its first authored frame.
2. Apply that group's first signed SeekSamples once: 1,695 for group1;
   1,047 for group2. The latter starts at whole-buffer sample1,159,959.
3. Read each group's complete decoded sample interval continuously at44,100Hz.
   Do not create a per-frame stop or silence for zero blocks24 and339; do not
   seek again using each following block's seek field. Stop a group when its
   decoded interval exhausts. Preserve the single full decoded buffer.
4. Pause the timeline and audio together. A modern inspector seek queries this
   candidate's continuous sample position; it does not claim legacy direct-seek
   parity. Replay returns to timeline frame1 before the first audio group.
5. The authored main-sprite Stop at frame968 stops the candidate transport.
   This clips the second group's planned source position at sample3,306,159,
   not the full decoded end3,309,696. Whether those final3,537 samples should
   continue under the original host is an explicit unresolved behavior.

The candidate is reversible maintained code, not a new accepted audio asset.
No synthesized silence, per-group MP3 slicing, source rewrite, host activation,
official registration, or acceptance is authorized by this specification.

## Why compatibility observation does not close the hypothesis

Adobe distinguishes continuous MP3 concatenation/read-ahead from seeking and
describes first-block latency. That does not resolve this file's exceptional
zero blocks or terminal host behavior. See the
[Adobe SWF19 specification, printed pp.184–186](https://open-flash.github.io/mirrors/swf-spec-19.pdf).

The versioned Ruffle source has a stream-reader path that skips the four-byte
block header without using its signed seek field. Its missing-block exhaustion
condition is explicitly provisional. The related mixer wraps that decoder
directly. These are compatibility implementation facts, not Flash authority:
[Ruffle0.4.1 decoder](https://github.com/ruffle-rs/ruffle/blob/v0.4.1/core/src/backend/audio/decoders.rs#L287-L330),
[Ruffle0.4.1 mixer](https://github.com/ruffle-rs/ruffle/blob/v0.4.1/core/src/backend/audio/mixer.rs#L375-L386).

Consequently, no one-frame delay or other empirical correction will be added
merely to fit the Ruffle output timestamps. Validate the candidate's arithmetic,
real browser lifecycle, and observed differences separately. Keep it outside
the host until the source-specific timing choice is resolved or deliberately
reviewed as a bounded implementation exception. Strict fidelity, audio
listening, human/Owner acceptance and publication remain pending independently.

## Executed candidate and boundary observations

Maintained implementation:
`packages/demos/src/alg-l12-p005-audio-schedule.ts`, SHA-256
`142c4b78875274af3ff6467acc190c364fdfc999a24d3cadf62794d76f5d76c3`.
The pure resolver uses integer timeline samples and exposes its inferred,
unregistered status. It rejects noninteger, unsafe, negative and out-of-domain
inputs. It never consults or modifies the original seek map.

Real Chromium execution of
`node scripts/probe-g678-alg-l12-p005-audio-transport.mjs --schedule` checked
14 positions: frames1,22,23,24,25,337,338,339,340,383,384,385,967,968.
Seven active positions each created one muted source node with precisely the
candidate's offset and remaining-window duration. The other seven created no
node. The original pause/resume/seek/Replay/completion/close checks also passed.
This is a candidate seek-window/lifecycle test, not a full natural audio trace
or host synchronization test.

Two GPT-6 Sol / xhigh agents independently checked source boundaries and
implemented schedule tests. Main inspected the tests, added explicit per-group
sample-sum checks, and independently reran all5 schedule tests plus the15
decoder/transport regressions. All20 passed. The schedule tests query all968
frames forward and backward but prove only the declared candidate arithmetic,
not source playback correctness. Targeted strict TypeScript checks passed;
no full demos typecheck or app build was repeated for this isolated candidate.
The browser, server and both agents were closed after capture. Registry and
P005 My Lesson adapter hashes remain unchanged; official coverage remains
480/2,282, with P005 unregistered.

Receipt: `output/playwright/g678-p005-audio-transport-20260926/audio-schedule-candidate.json`,
SHA-256 `ffdd9d2bc853ae45b9b17aaea04978b9d9144f4b4d7d1a496d80cadbe6ab0b6b`.
The receipt binds the schedule, decoder, transport, source audio and browser.
The probe console has a favicon404; no zero-HTTP-error claim is made.

Explicit discrepancies retained:

- Candidate frame25 is sample9045; raw block seek arithmetic is5370, a
  difference of3675. The candidate first group exhausts before frame338,
  even though the source still places a positive block at338. Read-ahead may
  explain availability but does not establish the timing choice as correct.
- An in-memory FFmpeg8.1.2 decode confirmed the candidate's leading discarded
  ranges [0,1695) and [1158912,1159959) are zero-valued on that decoder.
- Its terminal discarded range [3306159,3309696) has1137 nonzero float32
  samples, peak0.000003862493940687273. Do not call it silence or accepted
  inaudibility. Original terminal behavior remains unresolved.

These discrepancies are reasons to withhold host activation, not reasons to
make the tests accept a different unstated clock. The next necessary evidence
is a source-specific resolution of initial-run timing and terminal stream
behavior; no further generic MP3 decoding test closes those issues.
