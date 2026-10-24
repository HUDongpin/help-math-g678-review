# DAT001 L2 P002 — local My Lesson host probe

Date: 2026-09-25. Engineering evidence only; no official Current-JS admission.

## Exact scope

- Physical source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`.
- SWF: `G6-G8-shared/DAT001/L2/RW/L2RW02.swf`, SHA-256 `b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.
- Local loopback route: `/en|es/migration-status/g678-calibration/shared-dat001-l02-p002-candidate?host=1`. It reuses the existing exact-path source-SVG and WAV guards. The two guard files are byte-identical to their P047-pinned hashes; no new asset path or provider exposure was added.
- The probe copies the source-ordered DAT001 Lesson 2 descriptor (53 pages) and simulates P002 availability in memory only. Its independent persistence key and release ID distinguish it from the official 2/53 baseline. P002 remains absent from the official registry; the browser reported **475/2,282** G6–G8 registered placements.

## Checks performed

- Host-probe tests: 3/3 passed. They cover source and page identity, one-page simulated delta, compatibility-symlink denial, and production denial.
- Existing source-audio and SVG guard tests: 4/4 passed, including loopback and proxy denials.
- `npx tsc --noEmit -p apps/web/tsconfig.json`: passed. Targeted ESLint on the new host, descriptor, route and test: passed.
- Chromium on the EN loopback host route: loaded the modern Lesson directory and controls with P002 visual projection; source SVGs returned HTTP 200 and source WAV HTTP 206. User-triggered Narration advanced the candidate frame. At source frame 276 the semantic English terminal assignment appeared, old SVG text/card layers stayed suppressed, and `data-runtime-playback-complete` stayed false. This does **not** establish source-host audio synchronization or page-complete semantics.
- Next navigated to P003, unmounted P002, and Previous re-entered P002 at paused frame 1. ES at 375 px displayed the same source-English page inside a Spanish host with no document-width overflow. Browser reduced-motion emulation selected the static terminal frame 276 and semantic assignment.
- A separate EN run confirmed Pause held the projected frame at 204 across subsequent observations. Host Replay from that paused frame incremented the renderer replay counter from 2 to 3 and restarted the media-clock projection (observed playing at frame 110). This is product-control behavior only, not original Flash Replay parity.
- ES viewport screenshot: `output/playwright/dat-l02-p002-host-es-375.png`, SHA-256 `e6c870454480f5512f5bdc3b157c720f47ec9d5043ec899d6d247341cd4ec07b`. Visual inspection found the host and source scene visible; the original source title remains tiny and is not accepted modern teaching typography.

## Failed attempt and remaining gates

An initial distinct `...-p002-host` route required broadening two P047-pinned resource guards; the calibration snapshot rejected the changed file hashes. Those edits and the route were removed. The final query-mode probe retains the original hashes `0ac03a375df17a8d6d28daed77e2351a28415c6afd5e1ecfecf03250e351903e` (WAV guard) and `6fcd6363651debfb2b7a5e8c364a0fb53da4e2317b15b59314e2cc91ae778e9a` (SVG guard).

This host path is a product-path probe, not an admission: source child clocks after parent Stop, original-host natural trace, source-audio trigger/synchronization/listening, Spanish teaching treatment, fidelity, human/Owner review, strict completion, release and publication remain open. The P002 `AnimationModule`, freeze and official registry binding have not been created. No full production build was run for this delta: at the build decision point WestWorld had only about 3.1 GiB free during local dev compilation (space later recovered to about 8.0 GiB after the server stopped). The route and descriptor contain explicit production-denial checks, but a later production-build/HTTP-404 check remains necessary.

The dev browser logged one React pre-mount state-update error during initial load; an earlier P002 candidate run also observed this class of error. Its exact cause is not established, so a clean-console host acceptance claim remains open.
