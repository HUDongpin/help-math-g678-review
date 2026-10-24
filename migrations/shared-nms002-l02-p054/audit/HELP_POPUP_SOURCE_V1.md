# P054 source Repeat/help popup — 2026-09-24

Authority: source-static SWF/FFDec/swfmill evidence only. This is not an
original-runtime trace, audio listening result, accepted Replay path, or
Current-JS admission.

- P054 `L2GS03.swf`: SHA-256
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`.
  The read-only FFDec 26.2.1 extraction is
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5`.
  Its swfmill XML SHA-256 is
  `2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46`.
- The source controller sprite 731 places `Mc_Popup` sprite 101 in each of its
  five frames (`audit/game-display-list-v1.json`, SHA-256
  `8887c62a93824e851b2b6bba3779742ba43143b5c8e38b47c49b81c04fa6c40c`).
  Sprite 101 places text characters 97, 98, 99, 100 and button 96 named
  `CloseBtn`. It contains instructions, not a score/result screen.
- Button characters 233, 649, and 730 have identical `on(release)` bytes,
  SHA-256 `a3007f42192b05bd5725697a919b0ef5b8125ce7f2ca3ef998e77c947d41c2b5`.
  Each only sets `Mc_Popup._visible = true`; none resets the board or score.
- Close button 96's `on(release)` bytes have SHA-256
  `7ce2739c35ad2613db4f35d07ec77a0a8b3644e23c112bb907229bcd14c86311`
  and set `this._visible = false`. The effective target of `this` in the
  original execution remains unverified.

The extracted English instruction text records are individually bound:

| Text ID | FFDec text-file SHA-256 | Instructional content |
| ---: | --- | --- |
| 97 | `f811b9d4fa1aadfa864698738ad0c7c86ebfd418bcd6bd854002c8f6eb61ffea` | Matching pairs reveal a picture and music. |
| 98 | `0859a58498a7056424e3c7863fa7db137ecffdbd8741cb0bde39d73533c77770` | Correct +10; incorrect −2. |
| 99 | `be276b903c1a93c910d415b451f084ec7861ec7671bcf83b1192be6690e89d3c` | Choose a level, then Start the Fractions, Decimals, and Percents Match Game. |
| 100 | `806c6cc5742a294191231c98451d2507a3c37f2cf815dff9dbdba0ae279a0f99` | Click one box, then its matching box. |

`packages/demos/src/nms-l02-p054-board-candidate.tsx` displays the exact
whitespace-normalized English source text in a semantic native dialog, marked
`lang="en"` even on the Spanish UI. The explicit close/focus behavior and
separately labeled local reset are candidate accessibility/testing decisions,
not claims about the original Flash close or Replay behavior. Source picture
tiles are now visible after a correct pair's temporary Continue control in the
local candidate, but source fade timing and music remain unimplemented; the
picture/music behavior is not accepted. A source-bound local
regression is in `packages/demos/tests/nms-l02-p054-board-candidate.test.tsx`;
it reads the exact SWF and extraction when `HELP_MATH_G678_SOURCE_ROOT` is the
real non-symlink source directory.
