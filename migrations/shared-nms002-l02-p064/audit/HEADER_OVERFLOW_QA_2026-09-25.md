# P064 local-preview header overflow QA — 2026-09-25

Scope: one responsive-layout repair in the existing G6–G8 migration worktree. This is not P064 Current-JS admission or a typography, fidelity, audio, or release decision.

- Source-bound candidate: `shared-nms002-l02-p064`, `G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf`, SHA-256 `f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c` (rehash matched).
- Chromium local-preview route: `/es/migration-status/g678-calibration/shared-nms002-l02-p064?seed=9714`, served by a separate Webpack dev process on `127.0.0.1:3244` with the exact real source root and loopback preview opt-in. Turbopack failed before serving the page because this worktree's `node_modules` symlink points outside its filesystem root; no dependency link was changed.
- Before the CSS edit, at a 320 × 844 viewport with `html` font size set to `200%`, document `scrollWidth` was 322px. `.mobile-nav-shell` ended at 321.796875px; the P064 quiz was not the overflowing element.
- Changed only the existing `@media (max-width: 720px)` `.site-header__inner` gap to `0.75rem` in `apps/web/app/globals.css`. Existing unrelated dirty CSS was preserved.
- After reload, Spanish document width was 320px, navigation right edge 294.609375px, and the quiz right edge 320px. With the menu open, its 240px panel occupied x=54.609375–294.609375, all four links remained within the viewport, and document width stayed 320px.
- English at 320px had document width 320px at normal and `200%` root font sizes. `git diff --check -- apps/web/app/globals.css` passed. The browser console contained no errors or warnings; development-only info/HMR messages remained.
- This checks only the local candidate route and the named layout states. P064 is still absent from the private registry: 474/2,282 G6–G8 placements registered at this check. Original-host report/exit, Q5 dynamic fields, three review-name anomalies, accepted audio cues, My Lesson integration, full responsive matrix, human/Owner review, strict completion, and publication remain open.
