# P052 native audio candidate decision — 2026-09-23

This is an engineering decision within the source-bound advanced-manual lane, not an original-runtime or Owner acceptance. SOURCE_SPEC_V1/V2 and the original source-count failure remain preserved. No source or decoded PCM file was changed.

## Decision

Use complete decoded streams as the candidate audio input. Retain every sample after the source's1673-sample latency exactly once, with the independently observed initial stream gap. Keep the continuous22050Hz sample clock and12fps visual clock. Do not insert576 fabricated samples at mainframe102, remove real samples, stretch speech, or silently rewrite the source tag's count.

The page-specific pure implementation is `scripts/lib/nms-l02-p052-audio-plan-v1.mjs`. It is currently an audit/engineering helper, **not connected to a product renderer or registered module**. The maintained generator `scripts/build-nms-l02-p052-audio-plan-v1.mjs` creates `native-audio-plan-v1.json` through exclusive creation or exact check.

Every plan records:

- declared source anchor, actual cumulative decoded-packet anchor and continuous-clock anchor for every nonempty block;
- exact source/output intervals and preserved sample count;
- known sample-count discrepancy and maximum timing difference;
- source/PCM identity and candidate-only qualification.

The constructor only accepts the known discrepancy at sprite350/frame102 with its exact source-tag hash, declared1728/decoded1152 samples and two packets. An additional, moved or changed discrepancy fails. This is a narrow explicit source exception, not a general relaxation of sample consistency.

## Quantified behavior and caveats

Main frame102's anchor itself is unaffected. From103 onward, declared cumulative positions exceed actual packet positions by576samples. The continuous clock also differs from the source's1837-sample integer frame increments by fractional-frame rounding. The largest measured combined difference is645samples, about29.25ms, at the last main source block.

The generated candidate preserves258103 post-latency main samples. Other retained counts are6967 for each click stream,32887 for correct Coach347 and95095 for wrong Coach349. No anomaly replacement samples are generated. The silence before first playback and the separately recorded initial stream gap are source-scheduling structure, not a repair of the102count discrepancy.

Rejected alternatives:

- Fabricating576samples: no source waveform establishes them.
- Deleting/repeating real speech or applying time-stretch: modifies the original audio without evidence.
- Treating declared counts as actual decoded offsets: demonstrably misaddresses post102 source PCM by576samples.
- Claiming exact Flash synchronization from this candidate: original player behavior has not been observed authoritatively.

This permits testing a byte-preserving native candidate; it does **not** resolve original-runtime synchronization/fidelity. The earlier `audio-sample-anchors-v1.json` still correctly records that no count-equal main-clock plan was admitted by that audit. This document and `native-audio-plan-v1.json` introduce a different, explicitly qualified native policy, not a retroactive PASS for the failed invariant.

## Verification and remaining integration

`node --test scripts/lib/nms-l02-p052-audio-plan-v1.test.mjs`:10tests passed. Covers all six domains, every retained sample with distinguishable synthetic values, positive one-indexed/ties-to-even clock, exact known anomaly, mutated count/tag/frame/channel/length rejection, missing tail, overlap and nonfinite PCM.

Generator independently compares every retained real decoded float to its output location. `--check` reproduces the complete plan byte-for-byte. Existing packet/PCM/source export evidence is rechecked separately.

Still required: cue/phase windows at practice stop115 and outro116, explicit-close/callback and randomized wrong-feedback boundaries, all clicks under keyboard/touch, source audio language/host routing, real browser decode and lifecycle cleanup. These are not covered by this helper's10tests. Page renderer, product registration, source-fidelity, named listening, human/Owner, strict completion and publication remain pending.
