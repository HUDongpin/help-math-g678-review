# P005 stream placement and decoder boundary — 2026-09-26

## Source and result

Physical source and existing extraction were independently rechecked with
`node scripts/extract-g678-alg-l12-p005-stream.mjs --check`.
SWF SHA: `b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe`.
MP3 SHA: `988a60d21db50f1b70babf7cd9503311c4635be8e46654c8bc6b27fbb26f50af`.
Receipt SHA: `c193f9856de277227e8ee6dbe3c97d714863c701398bc98854276e94baa4b639`.

`scripts/build-g678-alg-l12-p005-seek-map.mjs` generates a 1,625-byte compact
structural map, checked against all 968 frames and every source block payload.
The immutable generated output is `audio-source-v1/seek-map-v1.json`, SHA
`d0daa3e661c47fb6cf54061820ae607e4dab72039d5bf638d93118d4e992859c`.

For a source block, U = cumulative preceding SampleCount + signed SeekSamples.
This is **raw structural arithmetic, not a playback offset or audio clock**.
Positive blocks have three coordinate runs:

| Sprite frame range | U = (frame − 1) × 3,675 + intercept | Blocks |
|---|---:|---:|
| 23 | intercept −79,155 | 1 |
| 25–338 | intercept −82,830 | 314 |
| 384–968 | intercept −247,566 | 585 |

Frame 24 is a zero-sample/zero-payload block with seek 0. Frame 339 is a
zero-sample/zero-payload block with seek −4,080; its U=1,154,832 does not extend
the previous run (which would predict 1,159,320). Frames 1–22 and 340–383 have
no stream block. These states remain distinct, with no inferred silence.

## Specification boundary

The Adobe SWF v19 streaming-sound description distinguishes continuous
playback/read-ahead from timeline seeking, and identifies the first block's
latency header. It does not establish frame 23 as a silent pre-roll or the
negative seek at 339 as a stop instruction. Zero new encoded bytes at frame 24
does not itself imply zero audible samples. Reference: Adobe SWF v19, pp.
184–186, mirrored at https://open-flash.github.io/mirrors/swf-spec-19.pdf .

The exact frame-384 MP3 boundary is byte 209,248, after 1,006 MPEG frames /
1,158,912 decoded samples. Its first MPEG-1 Layer III frame has a 511-byte
`main_data_begin` back-pointer. RFC 5219 section 3 defines this as a reference
to prior encoded audio/ancillary data, excluding headers and side information:
https://www.rfc-editor.org/rfc/rfc5219.html#section-3 .
This raises a decoder-dependency question; it does not alone prove damage.

## Executed experiment, not just a proposed risk

`scripts/probe-g678-alg-l12-p005-decoder-boundary.mjs` pipes source bytes into
FFmpeg 8.1.2 and compares mono 44,100 Hz float32 PCM entirely in memory. It
never plays sound or persists PCM. Each restart is aligned to the same source
sample range before comparison. All 2,150,784 remaining samples are compared.

| Preceding MPEG frames retained | Samples discarded after decoding | Differences from continuous decode |
|---:|---:|---:|
| 0 | 0 | 0; byte-identical |
| 3 | 3,456 | 0; byte-identical |
| 10 | 11,520 | 0; byte-identical |

All decoder runs returned no error messages. A separate test verifies that the
comparison tail contains more than 44,100 nonzero PCM samples, so the result is
not an all-zero-output comparison. The result refutes an assumed observed
FFmpeg boundary defect; it does not prove browser decoder equivalence or the
original Flash host's gap timing.

Receipt: `audio-source-v1/decoder-boundary-v1.json`, SHA
`f3e7a08a58b42b07d5c44cf825d3de026fdbfcaef275657c4ddb712eee512347`.
Both maintained tools support `--check`; `--write` refuses existing output.
Eight extraction/bitstream/map tests and two decoder tests passed.

## Implementation decision and next work

Keep one complete source MP3 and its decoder context for the future browser
audio adapter rather than make independent per-group files prematurely. The
current host stays silent. The next targeted timing experiment must observe
continuous source playback across 23/24/25 and 338/339/340/383/384; direct-seek
coordinates are not a substitute. Ruffle can supply a labeled compatibility
comparison, not original-runtime authority. No source gap, speech language,
listening, synchronization, registry, fidelity, human/Owner or publication gate
was promoted by this work. Official registration remains 480/2,282.
