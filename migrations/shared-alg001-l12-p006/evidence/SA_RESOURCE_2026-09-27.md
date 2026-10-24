# P006 optional SA resource implementation — 2026-09-27

Continues SA_HOST_DISPOSITION_2026-09-27.md. Resource preparation only: optional playback controller and host integration are not implemented. No registration or listening acceptance.

## Implemented

- `apps/web/lib/g678-alg-l12-p006-spanish-audio.server.ts`: source reader requires explicit loopback preview opt-in, exact real source directory and no production/provider environment. It checks the physical lesson index, P006 SWF and separate SA MP3 with exact sizes/hashes, ordinary single-link file identity and stable metadata. Each call returns an independent byte buffer. Intended Spanish-control role does not claim spoken-language verification.
- `apps/web/app/flash-assets/g678-local/shared-alg001-l12-p006/spanish-audio/route.ts`: private GET resource, exactly one expected sha256 parameter, exact path, loopback HTTP with validated Host/port, same-origin Origin/Referer and fetch metadata, no range. Denial is empty404; success has no-store/noindex/same-origin-CORP/nosniff. The existing embedded source-audio route, proxy and shared host are unchanged.
- Exact SA SHA `86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf`,214704bytes. Index SHA `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`,11927bytes. Source SWF SHA remains `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`,708053bytes. No copies of these files were added to public assets or altered in source custody.
- Route implementation SHA `56ef44975bfa905e0050747009cf8736ce13ef4aef643b7b035b1ab56a502d18`; reader SHA `ea168b050f8ef5cd0fe41d2631c20065f65f7d9d41c71764dec9238e78885f80`.

## Checks

`node --conditions=react-server --import tsx --test tests/g678-alg-l12-p006-spanish-audio.server-test.ts` from apps/web:4/4passed. Tests cover actual byte identity, independent buffers, environment denial, normalized localhost request URL with preserved browser Host, fetch/element metadata, wrong path/hash/additional or duplicate query, cross-origin/port, range and POST denial. Scoped ESLint passed. These function-level tests are not live browser evidence.

## Next implementation boundary

Reuse this route for explicit user-selected SA. Do not fetch/play automatically merely because locale is es. Add a controller that pauses the main clock, cancels stale loads, handles source stop/restart versus chosen modern resume explicitly, and cleans up on return/navigation. Completion/return may resume only the retained nonterminal main state under the reviewed policy. Verify actual browser loading, errors, overlap prevention, volume, interruption and EN/ES controls before treating this as a usable feature. No changes to registry480/2282, original-runtime authority, listening, human/Owner, strict completion or publication.
