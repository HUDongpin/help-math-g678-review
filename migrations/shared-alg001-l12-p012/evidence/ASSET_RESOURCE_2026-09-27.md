# ALG001 L12 P012 local asset resource — 2026-09-27

The local-only reader `apps/web/lib/g678-alg-l12-p012-assets.server.ts` and dynamic GET route `apps/web/app/flash-assets/g678-local/shared-alg001-l12-p012/[asset]/route.ts` expose four exact candidate resources. `p012Asset(name)` returns fresh `{bytes, sha256, contentType}` after full validation. `p012AssetManifest()` validates all four and returns their public `{name, sha256, bytes, contentType}` descriptors. This does not register the page or authorize a provider deployment.

| URL name | Source-bound local file | Bytes | SHA-256 |
| --- | --- | ---: | --- |
| `graphics.js` | `graphics-source-v1/source-drawings.js` | 1,236,501 | `ae25f758635bd24bc2c8c4ae877a57da2be5671d04c02d102491bf56a6d346e9` |
| `main.mp3` | `audio-source-v1/main-sprite-86.mp3` | 37,180 | `6aaddb1bfc319127e85b94dcfce407765eeb3f0275f42830bdeaff4aaa4cb21a` |
| `coach.mp3` | `audio-source-v1/coach-sprite-76.mp3` | 21,840 | `e551e71005de2df6e95d44ca10fba65b6ae0131032336e67b2609c71b798e8cf` |
| `typography.js` | `typography-v1/renderer.js` | 1,253,326 | `eee27611df58685bad502c7ceb54eb745a0407cd7fbb93cadd93e326e95491f1` |

All relative files above are under `migrations/shared-alg001-l12-p012/`. Each read requires the exact physical, nonsymlink AWS source root and `VB/L12VB07.swf` (81,069 bytes, SHA-256 `b322949a960acef3fee6018a65785b29cd3693717ca3ba33d0d930d7866320aa`). The graphics manifest (332,659 bytes, SHA-256 `4d8de6041039bf5486adbefacb3e71d515d085cc89071951455b7e52b42ae1d4`), audio raw index (127,722 bytes, SHA-256 `7c9d9e1b355ca6347ba7eac5081fb8476b18cfb4721aba0d1263e54d33a0cf3c`), and typography runtime metadata (3,648 bytes, SHA-256 `4a782fda378251825149f30323e51e0adf379eb74f845de47630f14d69d3a17a`) are also pinned and checked against the resource they describe. The reader checks file type, link count, size, full hash, and stable stat data before and after reading. Returned buffers are never cached.

The route is available only with the existing G6–G8 loopback preview opt-in, `NODE_ENV` outside production, no `VERCEL_ENV`, and exact real AWS source root. It requires `GET`, one literal `?sha256=<expected>` query, loopback HTTP, same-origin Host/Referer/Origin, appropriate script or audio fetch metadata, and no Range header. It returns private `no-store`, `nosniff`, same-origin resource policy and `noindex` headers. A denial is a bodyless 404. Existing proxy allowlists and host registration were not changed here; an actual browser request still needs that independent product wiring and check.

The focused server suite passed **11/11** under `node --conditions=react-server --import tsx --test tests/g678-alg-l12-p012-assets.server-test.ts` from `apps/web`. It verifies exact response bytes and headers for all four resources, SHA/query/path/header/method/range denials, environment and source-root fail-closed behavior, physical indirection, hard links, read-time stat drift, and artifact/metadata byte drift. The MP3s are raw embedded-stream concatenations; this endpoint does not establish a playback schedule, Flash runtime sound behavior, language, listening, audio acceptance, visual fidelity, or publication.
