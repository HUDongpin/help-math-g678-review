# P003 fixed-canvas native-text candidate browser check — 2026-09-23

This is a private diagnostic page, **not** My Lesson, Current-JS admission,
original-runtime comparison, audio acceptance, or typography sign-off.
Source SWF: `G6-G8-shared/NMS002/L9/RW/L9RW03.swf`, SHA-256
`d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
The generated v5 drawing asset is 8,910,358 bytes, SHA-256
`c03538f5fc07a5697a549f911b15c0aac1c7e4c8da62819188141bba001bad27`.

The maintained native candidate lives at
`packages/demos/src/timelines/shared-nms002-l09-p003-native-candidate.tsx`.
It uses the fixed-800×600 bridge and a semantic DOM title, schedule rows,
source-frame emphasis, and five-step formula. At wide widths the DOM text
occupies the corresponding blanked source drawing areas; below the CSS
container breakpoint it reflows above the complete source illustration.
The original printed bag marks and red instructional circles remain Canvas
graphics. The canvas's assistive label describes those graphics without
adding eleven duplicate `FISH FOOD` readings.

The diagnostic source is under `work/g678-p003-native-preview-20260923/`.
Its browser bundle and screenshots are stored on American Dream at
`/Volumes/American Dream/hudongpin/g678-p003-native-preview-20260923/`.
After the source-text claim-boundary wording and the redundant schedule-region
name were updated, the latest bundle was rebuilt (JavaScript SHA-256
`8629ae78b825c7740fe06416a33117b22eba9089ab4676fbb3d20e89921e04ac`,
CSS SHA-256 `ff56bd5d1b4eadf3061cdf84cb7ce5b24d0fc40ff43db2033d9b1ed5c59352bc`).
The final browser snapshot had one schedule heading, without a duplicate
named-region announcement; frame 1 returned `ready: 9 exact draw sites`,
and frame 615 drew again with zero browser console warnings/errors. The
latest desktop frame-615 screenshot is byte-identical to the earlier desktop
spot screenshot. The earlier mobile screenshots remain local visual spot
evidence, not immutable captures bound to that latest JavaScript hash.
The browser served only loopback port 3234; requests for `/`, `bundle.css`,
`asset.js`, and `bundle.js` all returned 200. The Playwright console showed
zero errors and zero warnings during this local run.

| Browser observation | Result |
| --- | --- |
| 800px frame 1 | `ready`, nine exact source draw sites; one native title, one schedule heading, five rows, no formula. |
| 800px frame 615 | `ready`, 12 exact draw sites; first `+ 2` row emphasized, red circles retained, native `5 + 3 ×` shown. |
| 320px frame 615 | Native title and schedule reflow into readable document order; complete illustration follows. Screenshot has no horizontal overflow. |
| 320px with root font size 32px (text-only enlargement) | Browser reported `scrollWidth = clientWidth = 320`; row text computed at 36px. Full-page screenshot was visually inspected; no text/card clipping was observed, though the layout becomes tall. |
| ES toggle at frame 615 | Spanish UI notice explicitly says the lesson source text is English; native words remain English. This is not translation acceptance. |
| Replay from frame 615 | Returned to frame 1, nine exact draw sites, with the formula absent. |

Screenshots (SHA-256):

- `p003-800-frame001.png`: `37623bb5b3aec001e1e4165f799ddae2a9e9ecaf49f9911325906512b6de1d14`
- `p003-800-frame615.png`: `f0106a3982482e7cf62b2c9c0c7151b5d7da3b6d063dad217a9544fdddfb5d2a`
- `p003-320-frame615.png`: `3031a66de772e939d8b66ff1a9cdee708414983575d068a8c2150f5201d1d3ca`
- `p003-320-200-text.png`: `fd381857251fff0e6b94a0af596b11ccc3bc29f7c85a621a0442c00cf6ca3a41`
- `p003-320-frame615-rebuilt.png` (intermediate claim-wording rebuild): `da39a066b4a5ea30a3445f0be36e5de88180ba4fadc49a44916943015e161809`
- `p003-800-frame615-final.png` (latest bundle): `f0106a3982482e7cf62b2c9c0c7151b5d7da3b6d063dad217a9544fdddfb5d2a`

Open: exact candidate asset loader and immutable package binding; the real
My Lesson host, its responsive controls/focus/reduced-motion behavior,
source-audio transport/listening, complete frame-domain capture, authoritative
original-runtime trace, fidelity, human/Owner review, strict completion,
release, and publication. The narrow layout deliberately leaves the original
graphic card blank after moving its text into document flow; this requires
product/human visual review, not automatic acceptance from a clean screenshot.
