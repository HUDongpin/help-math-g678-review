# P006 optional SA resource independent recheck — 2026-09-27

Bounded read-only resource review for `shared-alg001-l12-p006`, performed alongside the separate controller and host implementation work. Fresh checks began at `2026-09-26T17:43:46.091109Z` (2026-09-27 Asia/Taipei). This worker wrote only this new evidence report. It changed no reader, route, tests, generated files, registry, source archive, provider state, or registration contract, and ran no build, development server, browser, original runtime, or listening session.

The canonical `/Volumes/WestWorld/HELP MATH 2.0/skills/flash-to-js/SKILL.md` and its `references/audio-and-review.md` were loaded. The implementation worktree's older skill was identified as a superseded copy. `SA_HOST_DISPOSITION_2026-09-27.md`, `SA_RESOURCE_2026-09-27.md`, the full session handoff, applicable project instructions, and inherited-work entry points were read. The review preserves the explicit optional SA role and does not reinterpret locale selection as an audio trigger.

## Fresh physical-source checks

The exact source root `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware` resolved to itself and was a real directory. Each input below resolved to its exact physical path, was not a symlink, had one hard link, and retained identical device, inode, size, nanosecond mtime/ctime, link count, and mode before and after reading.

| Exact path beneath the physical source root | Bytes | Fresh SHA-256 |
| --- | ---: | --- |
| `G6-G8-shared/ALG001/L12/index.xml` | 11,927 | `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325` |
| `G6-G8-shared/ALG001/L12/RW/L12RW06.swf` | 708,053 | `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6` |
| `G6-G8-shared/ALG001/L12/SA/L12RW06.mp3` | 214,704 | `86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf` |

A new `ffprobe` read of the exact SA MP3 exited 0 and reported codec `mp3`, mono, sample rate 48,000 Hz, duration 15.336000 seconds, and format size 214,704 bytes. This is machine metadata only; spoken language, content, listening correctness, and original-host synchronization remain unverified.

## Exact reviewed implementation

Paths below are relative to `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`.

| File | Bytes | SHA-256 at review |
| --- | ---: | --- |
| `apps/web/lib/g678-alg-l12-p006-spanish-audio.server.ts` | 2,127 | `ea168b050f8ef5cd0fe41d2631c20065f65f7d9d41c71764dec9238e78885f80` |
| `apps/web/app/flash-assets/g678-local/shared-alg001-l12-p006/spanish-audio/route.ts` | 2,655 | `56ef44975bfa905e0050747009cf8736ce13ef4aef643b7b035b1ab56a502d18` |
| `apps/web/tests/g678-alg-l12-p006-spanish-audio.server-test.ts` | 5,523 | `121b5f23ff282a10b15bf2b71a07ae398d86d27df9bf10e3118b46dd5241cf26` |

The reader freshly hashes index, page SWF, and separate SA MP3 on each call, checks stable file metadata, returns independent bytes, requires the exact real source root and explicit loopback Preview settings, and denies production/provider environments. Its role is `explicit-spanish-audio-control`; `spokenLanguageVerified` remains false.

The route requires the exact local path and single expected SHA query; validates loopback HTTP, browser Host/port, Origin/Referer, fetch metadata, and no Range header; returns empty 404 on denial. Successful responses include exact audio bytes, private no-store, noindex, same-origin CORP, nosniff, audio/mpeg, and the exact content length. The normalized Request URL / preserved browser Host handling matches the existing embedded-audio route's tested integration boundary.

No actionable reader/route defect was found in this bounded review. Reuse the existing route with a same-origin fetch and exact SHA query. Host integration must supply explicit user activation, main-clock suspension, stale-load cancellation, return/terminal behavior, and navigation cleanup. Function-level resource checks do not establish those client behaviors.

## Independent checks

From `apps/web`:

```sh
node --conditions=react-server --import tsx --test tests/g678-alg-l12-p006-spanish-audio.server-test.ts
../../node_modules/.bin/eslint lib/g678-alg-l12-p006-spanish-audio.server.ts app/flash-assets/g678-local/shared-alg001-l12-p006/spanish-audio/route.ts tests/g678-alg-l12-p006-spanish-audio.server-test.ts
```

Reader/route tests: **4 passed, 0 failed**, none skipped/cancelled. Tests exercised actual source byte identity, buffer independence, opt-in/bind/root/production/provider denials, successful request variants including normalized localhost URLs, private response headers, exact hash membership, and query/origin/fetch/range/method denials. Scoped ESLint exited 0 with no findings. These are current function-level checks; live HTTP/browser behavior is owned by the main integration verification and is not claimed here.

## Independent gates

This report establishes source-byte stability, metadata, and reader/route test results only. It creates no Current-JS registration, original-runtime authority, audio/listening acceptance, human review, Owner acceptance, strict completion, lesson release, or publication. P006's continuous embedded stream and optional separate SA remain different audio resources; this review does not alter or revalidate the continuous-stream timing schedule.
