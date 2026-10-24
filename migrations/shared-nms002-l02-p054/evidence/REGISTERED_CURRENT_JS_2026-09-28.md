# P054 registered local Current-JS — 2026-09-28

P054 is now registered in the local modern My Lesson host. The fresh workflow report counts 495/2,282 G6–G8 placements (1,787 remaining); NMS L2 is 63/64 with P053 still unavailable. This is the Current-JS implementation gate only.

## Exact implementation and boundary

The page is source-bound to `G6-G8-shared/NMS002/L2/GS/L2GS03.swf`, SHA-256 `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`. The maintained matching board renders the source cards and reveal tiles, handles both levels, source-correct/wrong feedback and negative scores, native source audio, Replay, pending-load cancellation, and navigation cleanup. Six matching pairs reach `terminal-unresolved`; no unproved source terminal transition or lesson-progress completion is asserted. The text source is fixed English; Spanish UI uses an explicit English-source fallback.

The registration transaction changed only the private registry, two local dispatch outputs, and P054 activation. Its sealed page proof is `work/g678-workflow/candidates/shared-nms002-l02-p054-v1.json`; sealed host is `catalog/nms-l02-admission-v1/host-v15.json`. The transaction retains predecessor snapshots and verifies all retained registry entries. Canonical checker v2 verified 936 combined entries, 637 private entries, and four generated outputs. These counts have different scopes from the G6–G8 denominator.

## Actual evidence

- Registration and post-write check: `output/nms-l02-p054-product-20260928/registration/receipt.json`; status `registered-local-current-js-not-acceptance`.
- Registered EN desktop / ES reduced-motion mobile: `output/nms-l02-p054-product-20260928/browser/formal-my-lesson-v1/registered-v2/result.json`; both pass, 14 recorded states per case, stable input hashes, no page or console errors, no hot-update requests, browser process closed.
- Registered pending source-media Replay/navigation cancellation: `output/nms-l02-p054-product-20260928/browser/formal-pending-media-v1/registered-v1/result.json`; both cases pass with stable inputs and closed browser process.
- Candidate predecessor continuity: `output/nms-l02-p054-product-20260928/continuity/browser/formal-candidate-v1/formal-candidate-v2/result.json`; technical pass with exact scope in that receipt.
- Production build: `output/nms-l02-p054-product-20260928/admission/formal-production-build-receipt-v1.json`; build exit 0, inputs stable, configuration restored.
- Production isolation: `production-isolation-formal-candidate-v1-unset.json` and `production-isolation-formal-candidate-v1-real-root.json` under the same admission directory; 1,920 exact 404 denials per source-root mode, 3,840 total, with no P054 payload in the scanned production bundle. Local validation only; no provider deployment.
- Workflow host receipt: `output/nms-l02-p054-product-20260928/registration/workflow-host-verification-v1.json` adapts the actual registered browser results and binds their hashes.

The original formal production run passed the unset-source mode but stopped at the second mode's port-availability assertion. Its failed restoration v1 receipt remains unchanged. `scripts/resume-nms-l02-p054-production-v1.py` reverified all build/configuration inputs and retained build IDs, reused the exact built artifact for the missing real-root mode, and produced restoration v2 bound to the prior failure and recovery intent. The original P055 build link and ten retained build IDs were preserved.

The first registered browser run is also retained: EN completed the behaviors but failed the zero-hot-update assertion (five hot-update requests), while ES passed. After prewarming, registered-v2 passed both cases without changing page code. The earlier failed continuity receipt remains separate dated evidence.

Root independently reviewed the registrar/probe changes and P054 proof closure. Registrar focused tests passed 7/7, successor registry checker tests 6/6, and the fresh canonical registry check passed. This is not original Flash execution, audio listening, human visual review, Owner acceptance, strict completion, or publication. All those gates remain ungranted. No remote provider operation was performed.
