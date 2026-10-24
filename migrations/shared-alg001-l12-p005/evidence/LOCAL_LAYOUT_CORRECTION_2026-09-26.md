# P005 local probe narrow-screen correction — 2026-09-26

Supersedes only the two narrow-layout findings in `HOST_PROBE_2026-09-26.md`.
Does not replace its dated screenshots, change registry membership or establish
full product/visual acceptance.

## Surgical implementation

Added `probe.module.css` beside the P005 route and applied its wrapper class.
Only this page at widths up to 360 px uses the three scoped overrides:
remove the fixed-header padding, place the platform header in normal flow, and
give each reviewer ±12-frame button the full toolbar grid width. No global CSS,
generated host, renderer, registration, navigation or audio code was changed.

Files under `apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l12-p005/`:

- `probe.module.css`: `b8f7fa904ffacf396f8533f9c79aaacb5cda908a491c19a0a60a26da1732f789`
- `page.tsx`: `1271a5c4e4643dc2aa671cb3f1a59289eebf94c9b502c943a372066515bd684b`

## Main-agent independent browser verification

Actual Next dev loopback opt-in, Playwright CLI Chromium session `p005layout`:

- ES 320 px: both step buttons had `clientWidth=scrollWidth=282`, with visible
  full labels. Clicking +12 after inspecting 507 produced frame 519.
- EN and ES 320 px: no horizontal document overflow and no audio elements.
- At scroll top, header bottom / evidence-banner top were 128 / 134.390625 px
  at widths 320, 360 and 390; 72 / 78.390625 at 768 and 1280. No banner overlap.
- An initial geometry probe ran while scrolled and is not used as overlap
  evidence; the corrected probe explicitly reset scroll position.
- Main visually inspected both fresh full-page screenshots, including the
  contained source drawing, visible disclosure and full-width review controls.

Screenshots under `output/playwright/g678-p005-layout-20260926/`:

- `en-320.png`: `ede63eec09ef87058008a1ee9a2bd2d56466542647733219e77e69906a73a280`
- `es-320.png`: `dc9ab06b006e6b69a969d79d43c025fa131e2464109fe4c5f9dda98d300192a3`

Targeted page ESLint passed; all three existing server probe tests passed.
`git diff --check` passed. The CSS was compiled by the actual dev server.
The full production build/negative evidence in the predecessor record predates
this scoped CSS-only correction and was not rerun for this bounded change.

The frozen shared host SHA remains
`494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`;
official registry SHA remains
`b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.
P005 is still unregistered; source-stream timing is the next implementation
boundary. See `SEEK_AND_DECODER_BOUNDARY_2026-09-26.md` for the new source map and
executed decoder comparison. No audio, Spanish-content, original-runtime,
human/Owner, strict-completion or publication acceptance is asserted.
