# P064 local question-audio candidate — 2026-09-24

This is a bounded continuation of the full G6–G8 migration goal in the
intentionally dirty `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`
worktree. P064 remains **unregistered**. A fresh intersection of both generated
registry key lists with `catalog/g678-page-only-release-manifest.v1.json` has
472 distinct registered placements of 2,282 active pages, 1,810 unregistered,
and no P064 registration. This is Current-JS membership only, not a downstream
acceptance count.

## Source and local implementation

- The source root is the real directory
  `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`,
  not the compatibility symlink. The P064 SWF is a 55,392-byte regular file,
  SHA-256 `f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c`.
- `audit/audio-source-candidates-v1.json` is pinned at SHA-256
  `60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58`.
  The new reader checks the exact index and SWF, rejects symlink/path drift,
  and verifies each requested MP3's size and SHA-256 from the real source.
  All 70 EA/SA Q1–Q35 **question** candidates passed a source-byte test.
  The 280 option files are catalogued source candidates but are not served by
  this route. The accepted `audio-inventory.csv` remains empty.
- `apps/web/lib/nms-l02-p064-question-audio-access.ts`,
  `nms-l02-p064-question-audio-source.ts`, and
  `nms-l02-p064-question-audio-response.ts` implement the local-only access,
  source binding, and range response. The route is under
  `/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]`.
  Access requires a real-root opt-in, loopback development, exact P064
  same-origin Referer and media Fetch Metadata. It denies production, wrong
  host/origin/path/query, and non-question IDs; valid range requests return
  206 and invalid ranges 416. No source MP3 was copied into a web bundle.
- The candidate React view shows two explicitly labelled native controls for
  the current question only. Playing one pauses the other; answering or Replay
  pauses and unmounts the old players. It does not auto-play, use option audio,
  or invoke the legacy report/host APIs.

## Verification and failed-evidence boundary

- Focused audio and presentation tests, the config-boundary tests, the
  P064 TypeScript project, and a full isolated Next Webpack production build
  passed. Chromium Q9 playback reached `readyState=4` and advancing time for
  both EA and SA; switching players paused the first. Answering and Replay
  paused/unmounted the old player. At 320px, document width equalled viewport
  width; both native controls fitted (286px). The inspected screenshot is
  `.playwright-cli/page-2026-09-23T23-00-40-393Z.png` in this worktree.
  A loopback EA Q9 `Range: bytes=0-1023` request returned 206 and 1,024 bytes.
  This is machine playback, **not** listening acceptance, spoken-language
  verification, original-host cue scheduling, or audio fidelity.
- The first post-audio production build completed but failed the existing
  payload scan: `server/chunks/2383.js` contained the P064 SWF SHA because the
  source-audio reader was bundled despite the route's 404 guard. Its untouched
  scratch output is
  `/Volumes/American Dream/hudongpin/helpmath-p064-production-scan-audio-zgjRYU/build`,
  retained as failed evidence. The earlier pre-audio build also remains at
  `/Volumes/American Dream/hudongpin/helpmath-p064-production-scan-sUy7ti/build`.
- The correction adds a production-only denying module replacement for the
  audio reader in both Webpack and Turbopack config. The successful fresh
  scratch output is
  `/Volumes/American Dream/hudongpin/helpmath-p064-production-scan-audio-fixed-ND63DB/build`,
  build ID `mENfMn_vrZ4XR3ZHLd_gP`. The immutable new report
  `production-bundle-isolation-audio-v1.json` records 2,018 scanned
  server/static files, 36,061,825 bytes, zero checked P064 payload-marker
  hits, and checksum-set SHA-256
  `1aeb013f1f827b734c3f913508ce5a947bca63de492747621e3925cec42037a0`.
  `--check` reproduced the report exactly; an additional exact search found
  no source-audio-index SHA in server/static outputs. A temporary local
  `next start` from this build returned 404 for EN and ES P064 pages and EA
  and SA Q9 audio requests, even with local-preview and source-root env set.
  That server was stopped. The two Next-generated P064 `tsconfig.json`
  includes were removed after the build; unrelated pre-existing edits remain.

## Open gates

The route and playback evidence do not establish the original Flash host's
question/option audio trigger or timing, actual spoken language, human
listening, translation, original-runtime interaction/fidelity, privacy-safe
progress/report adapter, modern My Lesson admission, human or Owner review,
strict completion, release, or publication. The next source-backed step is an
original-host trace of the quiz/audio lifecycle and the minimal modern host
contract before any registry decision or scale-out. Do not infer that a local
candidate, a successful build, or an HTTP 206 closes those gates.
