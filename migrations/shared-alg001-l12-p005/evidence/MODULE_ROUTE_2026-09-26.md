# P005 maintained module and private route — 2026-09-26

## Scope

P005 now has a maintained product-module candidate and a real Next.js local-only asset route serving the pinned mask-corrected v2. It is **not registered or yet connected to a source-ordered My Lesson descriptor**. This is progress toward integration, not completed integration. Actual catalog/registry intersection remains480/2,282 (21.034180543383%); P005 membership is false. Full migration goal remains active.

## Files

- `packages/demos/src/timelines/shared-alg001-l12-p005.ts`: source/hash/runtime configuration; native800×600,12fps,root10/main968/rootBegin6,seven separate companion domains. Audio disabled with the source gap explicitly documented. Direct Spanish rendering remains blocked; English-source fallback is a future host policy, not Spanish content acceptance.
- `packages/demos/src/modules/shared-alg001-l12-p005.tsx`: existing maintained Canvas candidate interface, no new shared renderer or host changes, no registry entry.
- `packages/demos/tests/alg-l12-p005-module.test.ts`: exact source/v2/SRI bindings, all968forward and968reverse pure frame states, domain boundaries and SSR evidence flags. These are static queries, not temporal host-playback verification.
- `apps/web/lib/g678-alg-l12-p005.server.ts`: physical non-symlink source and runtime pins; exact size/hash, stable read metadata, production/provider refusal. Reads candidate-v2 from the private migration workspace; no public asset copy.
- `apps/web/app/flash-assets/g678-local/shared-alg001-l12-p005/canvas-renderer.js/route.ts`: opt-in loopback request, local Host header, same-origin script-fetch policy, exactly one SHA query, no-store/noindex/nosniff/CORP headers.
- `apps/web/tests/g678-alg-l12-p005.server-test.ts`: source/route constraints, executable access policy and source-reader tests. It does not invoke GET directly because Next/navigation under react-server raised a React.createContext test-environment error. Real HTTP checks below close that specific delivery gap.

The module tests and route were authored by separate agents. Main read the complete changes, wrote the module/config/file reader, reran tests independently and repaired the read-only NODE_ENV typing issue in the route tests.

## Tests and build

- Main direct module suite:5/5PASS. Server suite under react-server conditions:3/3PASS.
- Initial full web and demos TypeScript checks exhausted the default4GB heap. Both were confirmed terminal; no automatic duplicate process was started on a mere timeout.
- Production build with NODE_OPTIONS=--max-old-space-size=8192 first reached actual TypeScript diagnostics in new route tests (read-only NODE_ENV assignment). Main fixed the tests and reran3/3PASS.
- Final production build PASS, including TypeScript and246staticpages, BUILD_ID `UDiXXACGP8WpWZNVNyIDK`. Eleven production asset-profile checks passed; production asset checksum set unchanged at `54e11e77a8d684fcf9542ba7458c12add3edb1a85c16ac99db756a34ed5c6ad4`.
- Generic `audit:renderer-frame-domains -- --id shared-alg001-l12-p005 --check` remains NOT COMPLETE: existing tool requires prototype registry metadata and reports `prototype runtime is missing`. No public registration was added to bypass this. Direct tests validate candidate pure-state behavior but do not replace original-runtime authority.
- `git diff --check` PASS.
- Main targeted TypeScript check of the P005 module test and imports PASS with explicit `--types node,react`, ES2022, react-jsx, bundler resolution and8GBheap. An initial targeted invocation omitted Node types and reported missing node:* /Buffer declarations; corrected invocation exited0 without source changes.

## Actual HTTP observations

Both servers were started locally on127.0.0.1:3137 and stopped after checks. No provider/deployment action.

Production (`next start`) with local-preview flags and correct source root intentionally enabled: exact same-origin/hash asset request returned404,9bytes,text/plain. Preview flags do not bypass production denial.

Development (`next dev --webpack`) with opt-in/source root:

| Request | Result |
| --- | --- |
| Same-origin script request with exact SHA |200;19,449,678bytes;SHA-256`48efbca3ddebf218565cdd635ffa130ae3a402c5693dd1ebcf359b2c30d500dd` |
| Wrong SHA |404;0bytes |
| Extra query parameter |404;0bytes |
| Cross-site fetch |404;9bytes |
| Missing fetch metadata |404;9bytes |

Successful response: `Cache-Control: private, no-store, max-age=0`, `X-Robots-Tag: noindex, nofollow, noarchive, noimageindex`, `Cross-Origin-Resource-Policy: same-origin`. These are actual Next/proxy responses, not source-code assertions.

## Resume boundary

Next required implementation is the real My Lesson source-ordered descriptor/module-loading path, then browser playback/pause/seek/Replay/navigation and EN/ES responsive checks. Existing private-runtime adapter infrastructure can support an explicitly unregistered probe without editing the frozen shared host; alternatively prepare the exact reviewed freeze/admission transaction but do not count it until real-host verification. The current module alone cannot be reached through the registered loader. Do not report host behavior as tested by these pure-frame or HTTP checks.

Keep audio disabled until a source-supported clock covers the44-frame source block gap and seek headers. Original-runtime natural traces, audio listening, Spanish content, human/Owner acceptance, strict completion and publication remain separate pending work. Preserve v1/v2 and all receipts.

Registry SHA remains`b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`; frozen shared host SHA remains`494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`. All assigned agents closed. No commit/push/deployment.
