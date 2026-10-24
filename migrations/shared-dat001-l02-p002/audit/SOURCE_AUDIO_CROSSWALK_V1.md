# DAT001 L2 P002 source-audio crosswalk — 2026-09-25

This is a read-only source and catalog audit, not a listening, host-trigger,
mixing, or synchronization decision. The exact placement is
`shared-dat001-l02-p002`; its physical SWF SHA-256 is
`b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.

The frozen G6–G8 catalog already names one `lesson-SA-candidate` for this
placement, `G6-G8-shared/DAT001/L2/SA/L2RW02.mp3`, under cue ID
`shared-dat001-l02-p002-audio-001`. Its cataloged 319,200-byte size and
SHA-256 `d5a4d20e481fbba71680bc4861b81848446e45eeff977c17a97f3748514d4a4a`
match the current physical, read-only file. Its XML page has empty
`RandomAudio` and references `RW/L2RW02.swf`; this does not specify an audio
trigger. The catalog explicitly leaves host trigger, start, stop, Replay,
language, and required status unresolved.

`ffprobe` reports the external MP3 as mono 48 kHz, 112 kb/s, 950 frames,
22.800 seconds. The separate SWF-embedded stream is mono 22,050 Hz, 879 MP3
frames, and decodes to 506,304 samples / 22.961633 seconds. Their source-file
hashes and normalized 22,050-Hz mono PCM SHA-256 values differ (external
`e2209feb9cdd77cd0f4f89f2825996e07948637da25df9d99cfcccbed7559ed1`;
embedded
`0ea150a6e333d3a2ee6dbca805bdf8cdf8aa6ac8b82b28edcd196feec0909bb5`).
A 100-ms RMS-envelope comparison over shifts from -2 to +2 seconds found a
maximum normalized correlation of about 0.064 at -0.4 seconds. This bounded
machine comparison argues against treating them as interchangeable, but does
not determine what is spoken or whether the original host plays either,
both, or one as an alternative.

`audio-inventory.csv` now retains two independent, unaccepted source rows.
The local diagnostic page currently plays only the decoded embedded stream;
it must not silently substitute, mix, or double-play the external file.
Original-host trigger/volume/stop behavior, content and language listening,
and EN/ES product audio treatment remain open.
