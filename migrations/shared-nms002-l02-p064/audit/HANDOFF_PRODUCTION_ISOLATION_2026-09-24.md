# P064 production-isolation continuation — 2026-09-24

This continues the full G6–G8 migration goal in the intentionally dirty
`/Volumes/WestWorld/HELP MATH 2.0-g678-implementation` worktree. P064 remains
an **unregistered local candidate**. The last independently recounted
Current-JS registry membership is 472/2,282 G6–G8 page placements, leaving
1,810 at that gate; this continuation did not change the registry.

## Actual-build finding and correction

The prior Webpack/Turbopack config-resolution test passed but did not prove
actual production exclusion. An isolated local production build on American
Dream initially failed during `/api/nova` page-data collection because an
external build directory could not resolve the installed `sharp` package.
Adding a `node_modules` symlink **inside that new scratch directory only**
resolved the build-environment issue. The first successful build then exposed
the P064 question payload in both server and client chunks despite the alias.
The result is consistent with the TS path mapping resolving the candidate by
path; the actual-build leak, rather than that mechanism alone, is the proven
finding. No provider or
production deployment was involved.

`apps/web/next.config.ts` now uses a production
`NormalModuleReplacementPlugin` for both the package specifier and resolved
P064 source path. The three-case local boundary test checks the opted-in dev
source, production aliases and replacement, and the isolated local output
directory. The final Webpack production build passed compilation, TypeScript,
static-page generation, and trace collection. Its build ID is
`PNzalvRe8HyMz1w6GLI8H`; its scratch output is
`/Volumes/American Dream/hudongpin/helpmath-p064-production-scan-sUy7ti/build`.
The `apps/web/.next-p064-production-scan` symlink points only to that scratch
output. The existing `.next` and other task-specific output pointers were not
replaced. Next's two automatically added P064 `tsconfig.json` include lines
were removed after the build; unrelated pre-existing edits were preserved.

`scripts/check-nms-l02-p064-production-bundle-v1.mjs` scanned all regular
files under the final build's `server` and `static` surfaces, 2,013 files and
35,994,253 bytes. It found zero occurrences of the exact source SWF SHA,
final source-option identity `A35Opt4`, and two distinct source/candidate
question-text markers. Its immutable report is
`production-bundle-isolation-v1.json`, checksum-set SHA-256
`9301e6ce0e54c3aae7a1d64f7278c984372698c5589eca50ed2067bf74f931e7`;
`--check` reproduced identical report bytes. A temporary `next start` from
that build returned 404 for both EN and ES P064 URLs with a valid seed, even
when the local preview opt-in and real source-root env were supplied. That
temporary server was stopped afterward. An initial HTTP request to the
pre-existing development server on port 3231 timed out while its listener and
process remained live; a repeat returned 200 without a restart. The prior
post-alias Chromium interaction evidence remains in the source-text handoff.

This proves only the checked payload markers are absent from the **scanned
local Webpack production output** and the P064 route is denied in that local
production run. P064 CSS is still emitted through the route's separate import.
There was no Vercel build, Preview, deployment, admission, original-runtime
fidelity, audio listening, human/Owner review, strict completion, release, or
publication acceptance.

Next for actual admission: resolve authoritative original-host quiz traces
and source-name anomalies; implement and verify the modern My Lesson host,
G6–G8 typography and source-audio/report lifecycle; complete EN/ES and
keyboard checks; then make the exact registry/descriptor decision without
collapsing any downstream gate. Do not factory scale out this behavior-heavy
page from the current candidate alone.
