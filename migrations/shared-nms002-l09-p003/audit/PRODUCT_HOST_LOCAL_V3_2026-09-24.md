# P003 source-bound local My Lesson host check — 2026-09-24

Status: **local engineering bridge verified, downstream acceptance open**. This
record supersedes the v1 preparation note's statement that P003 is not
registered. It does not replace or rewrite the immutable v1/v2/v3 packets.

## Exact boundary

- Real source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware` (not its compatibility symlink). `G6-G8-shared/NMS002/L9/RW/L9RW03.swf` is 473,410 bytes, SHA-256 `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`.
- NMS002 Lesson 9 is a source-ordered 53-page lesson. P003 is global ordinal 3 and RW ordinal 2. A fresh intersection with `catalog/g678-page-only-release-manifest.v1.json` finds 472 distinct catalog-matching G6–G8 keys out of 2,282 active page placements, with zero nonmatching shared keys; the P003 key occurs exactly once. This is registry membership, not a 472-page host or acceptance finding. The local Lesson 9 descriptor has 6/53 registered pages, not a complete lesson.
- Current immutable v3 packet: `catalog/product-bridge-calibrations/g678-nms-l09-p003-product-candidate-v3.json`, 11,418 bytes, SHA-256 `4a8dccbfa5c9441b0b8031fc6cd0945fe9d8694d26ae9858a99ad3f7b7a6417f`. Its source run and member manifest SHA-256 values are `6b035b5e043a796dd5232a3f70f6cadd315e1cf58f42582de764700ee2675f5a` and `249a3306cc59729b99b59c97cdf54388e22e31b52a0250c4eac2c219079d6a9b`. The packet's `registered:false` and `productHostVerified:false` are preparation-time observations, not a readback of the later registry and browser state.
- `apps/web/lib/g678-nms-l09-p003-binding.server.ts` checks regular source files, non-symlink/non-hardlink identity, real-root binding, size/hash, and before/after stat. `apps/web/lib/g678-nms-l09-p003.server.ts` checks the packet, registry, source order, and one-page descriptor extension. The page route is local-only, EN/ES, noindex, audio-disabled, unpublished and strict count zero. The generic bridge now recognizes versioned vN freeze filenames while retaining its other fail-closed checks.

## Rechecked implementation and host behavior

- `HELP_MATH_G678_SOURCE_ROOT` set to the exact real AWS directory: `node scripts/freeze-g678-nms-l09-p003-product-candidate-v3.mjs --check` passed, including its focused renderer, source-clock, text and canvas checks. `npm run check:registry --workspace @helpmath/demos` passed. The source-binding server test passed (correct binding and wrong hash/path/root/production rejection). The P003 module's five focused cases passed, including the `sprite-246` runtime context state declaration. An initial freeze-check invocation *without* the required root failed as intended; no alternate root was accepted.
- The local browser used only an isolated loopback Next instance on port 3235 with the explicit `frozen16-continuous-audio-provisional-browser-qa` phase and exact source root. The default bridge still fails closed at P044's unrelated exact lineage; this local QA phase is not a general admission override. The tested page was `/en/migration-status/g678-calibration/shared-nms002-l09-p003` and the ES switch landed on the corresponding `/es/` page.
- Real browser rendered `data-p003-status="ready"`, `data-animation-module="shared-nms002-l09-p003"`, source-bound fish-feeding schedule/image and 6/53 lesson badge in both languages. EN/ES controls and page position persisted through the switch. The ES host explicitly warns that the animation text remains English-source content, not a verified Spanish translation. Replay restarted the renderer; Pause stopped frame advancement and Play resumed it. Audio volume and unsafe frame inspection remained disabled. Zero browser-console errors were returned at the end of the run.
- At 320, 960 and 1920 CSS-pixel viewport widths, `document.documentElement.scrollWidth` did not exceed `innerWidth`, and the renderer stayed ready. The 320px ES and 1920px EN viewport captures are in `output/playwright/g678-p003-host-20260924/.playwright-cli/page-2026-09-23T18-43-26-640Z.png` and `page-2026-09-23T18-46-52-754Z.png`. These are responsive observations, not a full visual comparison or true browser-zoom acceptance; actual 200% zoom remains open.
- Loopback EN returned 200 and `x-robots-tag: noindex, nofollow, noarchive`; a spoofed `x-forwarded-host: helpmath.ai` and an unknown P099 route both returned 404. This is a local negative request test, not a production deployment test.

## Remaining gates and limitations

The `sprite-246` static-frame candidate does not establish the original
ActionScript natural trace, original Replay semantics, continuous/source audio
listening, original-runtime visual or interaction fidelity, human visual review,
Owner signature, 200% browser zoom, strict completion, release or publication.
The retained source component currently emits
`data-source-alignment="unregistered-candidate"`; this DOM label is stale after
registry admission and requires a new versioned freeze before being corrected.
The current browser view must not be interpreted as full Lesson 9 completion or
G6–G8 scale-out authorization.

The isolated QA server was stopped and its generated 4.2 GiB cache removed
after capture. Only this run's temporary Next dist profile and tsconfig
includes were reverted; pre-existing dirty work and other processes were
left alone. Typecheck and targeted checks are recorded below rather than
inferred from browser 200.

## Post-host checks

- Web TypeScript: the first concurrent attempt exhausted Node's default 4 GiB heap and yielded no verdict. After stopping the isolated QA server, a 6 GiB heap rerun identified four test-only readonly `NODE_ENV` writes. The fixture was changed to use a mutable test-only environment view, and `NODE_OPTIONS='--max-old-space-size=6144' npm run typecheck --workspace @helpmath/web` then passed. The host binding server test passed again.
- Generic bridge suite: 8/9 cases passed. Its ninth case is an older exact-live-freeze assertion restricted to V4 or p042378; the current checkout points at v26/P044 lineage, so that assertion fails before checking the present bridge behavior. It was preserved as a visible baseline failure, not loosened for P003. The actual P003 browser and local descriptor checks above used an explicit QA phase and do not resolve the default P044 lineage failure.
- P003 migration draft validation passed. Draft mode checks the portable schema only; it does not resolve paths or prove completion.
- `npm run verify:workbench` entered its full completion-ledger `--check` over 387 migration workspaces and remained CPU-active without output for about 7.5 minutes. This run was interrupted with exit 130; it has **no verdict** and is not listed as passing. No ledger output was rewritten by the `--check` path.
