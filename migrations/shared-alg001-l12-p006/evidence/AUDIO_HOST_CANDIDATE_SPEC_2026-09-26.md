# P006 audio-host candidate specification

Advanced-manual, private-only continuation of the source-locked Canvas/host candidate. This is a maintained sample-clock adapter, not factory scale-out or registration. Source SWF remains `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`; extracted MP3 remains `801d34dc684341a2644a7fcc3373bea98cbc14bdf91f4364db0e37c30e7c1803`.

## Chosen candidate scheduling

The previous audit preserved all 624,384 samples at 22,050 Hz. Use one complete browser decode; do not split encoded MP3 packets. Preserve source-backed seek anchors while distinguishing them from a continuous playback hypothesis:

- First run: decoded samples [1,673, 3,510), scheduled at timeline sample 3,675 (sprite frame 3).
- Second run: decoded samples [3,510, 624,384), scheduled at timeline sample 7,350 (sprite frame 5).
- The candidate has preroll [0, 3,675) and a scheduling gap [5,512, 7,350). Empty source frame 4 alone does not prove that this is original audible silence.
- Exact visual grid is (frame - 1) * 1,837.5 samples, not the 1,837 source direct-seek step. Do not resample, stretch, periodically trim or insert half-samples to force those coordinates to agree.
- The complete decoded tail after initial latency is scheduled. Timeline end is sample 628,224. Visual frame 342 begins at 626,587.5 and holds while the final 1,636.5 samples finish. Source terminal stop versus audio cutoff remains unproven, so this is an explicit candidate policy, not original-runtime parity.

AudioContext.currentTime is the shared transport authority. Pause and seek stop all current/future nodes; resume reschedules remaining windows at one context anchor. Replay resets timeline position and future nodes. A generation token must prevent stale asynchronous resume from starting audio after pause, seek, modal entry, navigation or unmount. Unmount aborts loading and closes the owned context. Loading, canvas error, missing asset, decode failure and unauthorized requests fail closed. No automatic playback occurs on loading; explicit Play/Replay is required, including under reduced-motion preference.

## Host and acceptance scope

Only the P006 private runtime adapter enables source audio. The inherited official lesson descriptor, registry, frozen host and other pages are unchanged. Use the existing host volume, pause, replay, glossary and inspector controls. Source-language identity and Spanish narration are not established; the UI must disclose that instead of calling this Spanish audio. The separate SA MP3 is not selected by this candidate.

Verify pure run boundaries and every source/clock conversion, async cancellation/failure paths, real host start/pause/resume, volume, Replay, glossary close staying paused, direct inspector seeks, terminal tail and navigation cleanup. Build and test production denial of both page routes and the exact-hash audio resource. These checks establish only candidate behavior; original-runtime traces, listening, fidelity, human/Owner, strict completion and publication remain independent.
