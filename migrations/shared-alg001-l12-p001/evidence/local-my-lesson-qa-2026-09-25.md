# ALG001 L12 P001 local My Lesson QA — 2026-09-25

Scope: one active G6–G8 page placement, `shared-alg001-l12-p001`. This is a
private engineering Current-JS registration, not publication or acceptance.

## Source and admission

- Physical source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware` (not the compatibility symlink).
- Source SWF SHA-256: `393da0d6755e706bf849a2cff0796823e129fa6bc7f438b93d09c05547679b67`.
- Frozen product packet: `catalog/product-bridge-calibrations/g678-alg-l12-p001-current-js-v1.json`, SHA-256 `b840bba869fd0862d254237965537c76d296f1084fd26143749bf866aebb8226`.
- Materialized Canvas runtime SHA-256: `7e068cf04845b87d9e0e7a9391fdbffc402e5243e9a04b741235f1d25c05294c`, 117,132 bytes.
- Private registry, maintained module, exact source-order descriptor, and modern My Lesson route are bound. The lesson descriptor now has 15/52 registered pages, with this page at position 1. The G6–G8 private registry has 476 unique `shared-*` entries for 2,282 active placements (20.86%); 1,806 remain at this gate.
- The earlier candidate manifest and its builder's `currentJavaScriptRegistered: false` field record the pre-admission candidate state. Current admission is established by the later frozen product packet, private registry, descriptor, and runtime checks; do not reinterpret that historical candidate field as a current registry count.

## Checks performed

- Candidate builder `--check`: byte- and hash-bound materialized runtime check passed.
- `npm run check:registry -w packages/demos`: passed.
- Source-bound server tests: 2/2 passed, including the single-page descriptor delta and local-only route guards.
- `NODE_OPTIONS='--max-old-space-size=8192' npm run build -w apps/web`: passed; the production asset-profile preflight passed 11/11 and kept its 1,320-file production asset inventory unchanged.
- Local My Lesson browser: English desktop and Spanish 390px mobile loaded the exact Canvas asset. Replay returned to an early frame; Next showed the unregistered second page as unavailable; Previous restored this registered first page. Spanish host controls worked and explicitly disclosed English-only source visual content. No browser console errors were observed. At 390px, document scroll width remained 390px.
- Production `next start` on loopback: both `/en/migration-status/g678-calibration/shared-alg001-l12-p001` and the hash-correct same-origin Canvas asset route returned HTTP 404. The server was stopped after this negative check.
- Local-only browser asset requests with an incorrect SHA-256 or without same-origin request context returned 404.
- `git diff --check` on the changed tracked registration and builder files: passed.

Browser captures (local, not original Flash comparison):

- `output/playwright/alg-l12-p001-my-lesson-en-desktop-20260925.png`, SHA-256 `3099362ba3538ef5030d2abb336f97a39bf37595ab866cdbada2036455ddd0bd`.
- `output/playwright/alg-l12-p001-my-lesson-es-mobile-20260925.png`, SHA-256 `b4e3caf5b01cff3be036092b570b55e3c64b0c0852fa8055d8a97fd1e282e71a`.

## Gates still open

Original-runtime comparison, Flash visual/behavior fidelity, source audio and
listening acceptance, human review, Owner sign-off, strict completion, release,
and publication remain unproved. This one-page packet does not authorize
factory scale-out. The other 51 ALG001 L12 pages are not complete merely
because the descriptor preserves their source order.
