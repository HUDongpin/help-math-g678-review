# P002 frame-domain triage — 2026-09-23

The canonical SWF is `G6-G8-shared/DAT001/L2/RW/L2RW02.swf`, 354,812 bytes,
SHA-256 `b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
This is source intake/triage only, not Current-JS implementation.

The 10-frame root directly places `sprite-113` at frame 6. That sprite has
276 frames, one script tag, and three script-free children: `sprite-41`
(279 frames), `sprite-49` (22), and `sprite-53` (151). The root also places
`sprite-116` (1 frame), text 114, and shape 117. The SWF has 276 embedded
sound-stream blocks. The longest statically reachable sprite is **41**, but
it is a child of the direct root main **113**; selecting 41 as the product
clock would drop the parent frame domain and its terminal behavior.

Decision: hold P002 out of single-clock generation and registration until a
source-bound nested-domain adapter and original-runtime trace resolve the
parent/child relationship. The scaffold is preserved. Audio, visual fidelity,
human/Owner review, strict completion, and publication are all unaccepted.

## Exact child-instance crosswalk — 2026-09-25

`audit/movie.xml` is a reproducible swfmill 0.3.6 extraction of the unchanged
SWF (SHA-256 `1d0d14c87f96f7a501311833a90ee50257f392129bb068fb3c27fb6800cce02a`).
`audit/nested-domain-instances-v1.json` (SHA-256
`516362a046f6731472de6106b2d1a84f1722d86cf16a62fe4a9f9e03f2512092`)
is rebuilt and checked by `scripts/build-g678-dat-l02-p002-nested-domains.py`
against both the real SWF and a fresh swfmill extraction. The root places
sprite 113 at frame 6 and stops; sprite 113 stops at frame 276 and has exactly
one sound-stream block per frame.

| Child | Parent depth | Parent frames present | Synchronous child frame at last parent frame |
| --- | ---: | ---: | ---: |
| 41 (279 frames) | 108 | 1–42 | 42 |
| 49 (22 frames) | 199 | 1–42 | 20 |
| 53 (151 frames) | 240 | 1–42 | 42 |
| 49 (22 frames) | 253 | 43–276 | 14 |
| 41 (279 frames) | 162 | 60–276 | 217 |
| 53 (151 frames) | 325 | 60–276 | 66 |

The three first instances leave on parent frame 43. The later three remain
placed when the parent stops. Their last-frame numbers are only a synchronous
source-clock projection; they do **not** prove how the original host enters the
page or whether child clips keep advancing after the parent Stop. This is the
specific terminal/replay behavior to resolve before an admitted renderer.
