# P053 embedded source stream product candidate

The exact real AWS source is `G6-G8-shared/NMS002/L2/GS/L2GS02.swf` (236774 bytes; SHA-256 `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`). The source-order MP3 payload from sprite 187 contains 619 SoundStreamBlock tags at frames 4–694. It is 256230 bytes, SHA-256 `225177c9c27670c636ce383e0ec58e439888b14afa33427a53c14ff1ca7a4e7d`; the external raw index records each source tag, four-byte SWF wrapper, signed seek, declared sample count, cumulative sample interval, and payload offset/hash.

The stream head declares 22,050 Hz mono MP3, 1,837 nominal samples per block, and 1,673 latency/seek samples. There are no block tags in frames 303–374 (72 frames). Frames 5 and 302 have empty payloads and zero declared samples; frame 302 has a signed seek of -1,898. No silence was inserted, no seek trim was applied, and blocks were not reclocked.

FFprobe read 1971 MP3 frames. FFmpeg decoded the concatenation to EOF as 1135296 mono signed-16-bit samples (51.487347 seconds at 22,050 Hz), PCM SHA-256 `df1dbec69ef5e95d71b036e1e8b923a66ed1a6c1db89bab9d24ec1d4c4f453b0`. This equals the sum of the SWF block-header sample counts. The decoded duration is a file/decode property, not proven natural runtime duration. The structural block at frame 694 does not prove it is reached during natural playback; the audited frame-693 stop action requires runtime assessment.

The separate lesson-SA candidate was not mixed into this stream. Audible content, source synchronization, Spanish behavior, original-runtime fidelity, listening, and Owner acceptance remain unresolved. This extraction registers no page and changes no product runtime.
