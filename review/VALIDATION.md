# Validation results

This is the initial snapshot record. The subsequent [registry and tellTarget repairs](REPAIRS-20261024.md) supersede those two findings and document their exact scope; the other failures remain reported.

The snapshot is ready for code review. It is **not an all-green product build or a completed lesson acceptance result**. All checks ran in the isolated review checkout using existing local dependency packages, with workspace package aliases resolving to this checkout. The active conversion checkout was not modified.

| Check | Result | Interpretation |
|---|---|---|
| Frozen candidate byte identity | 78,134 / 78,134 matched | Selected source bytes preserved exactly; three additional fixtures separately checked |
| HFR compiler source guards | 5 / 5 passed | Drift and replacement protection in synthetic fixtures |
| Compiler observable semantics | 40 / 40 passed | Independent evaluation-order expectations |
| Selected shared runtime regressions | 84 / 84 effective distinct cases passed | 64 unaffected initial passes plus 20 affected cases rerun after adding exact fixtures |
| Portable contracts + legacy Canvas adapter tests | 70 / 90 passed | 20 legacy Canvas checks cannot run without external G3–G5 sources/exports |
| Legacy HFR verifier state | 8 / 9 passed | `tellTarget` variable-read assertion returns `undefined` rather than expected `0` |
| Selected host tests | 31 / 36 passed | Three source assertions, one browser-document dependency, one historical predecessor dependency remain |
| Demos and web TypeScript | Incomplete | Both processes exhausted the explicitly bounded 8 GiB V8 heap; neither is reported as passing |
| Registry admission readback | Failed | Existing module pin differs from the captured module bytes |
| Workbench verification | Failed prerequisite | An excluded historical G3–G5 report is required by the broad verifier |
| Whitespace integrity | Warnings retained | Existing generated/extracted whitespace and 13 maintained/license-file warnings; no byte normalization performed |

## Concrete retained findings

The first registry failure is `shared-alg001-l06-p001`, module `packages/demos/src/modules/g678-alg-l06-source-title-p001.tsx`: registry size **3,792 bytes**, observed **3,810 bytes**. Expected SHA-256 `511ad1c0a9f1758a45bd2c22747eaea19bce68db4ddd27c69836fe8bf1a66fca`; observed `3df7b40431e87909f3e184880557102e50ae1887873c65b6afc52c76e6974e2f`. These pins were not rewritten for the review snapshot.

The legacy verifier failure is in `work/hfr-typescript/hfr/tests/verification-state.test.ts`, the `tellTarget variable reads the current target when the captured scope does not contain it` case. The assertion and implementation were preserved.

Host assertions still disagree with the snapshot for host-owned Replay epoch handling, the all-viewport flow-size source pattern, and the unavailable-renderer source pattern. The client loader imports a frozen glossary preparation module requiring a browser `document`. The server-only product-module test was retried with the actual `react-server` condition and non-secret loopback flags; it then correctly stopped at missing `work/g678-shared-page-factory/frozen16-glossary-candidates-v3` evidence. These results do not constitute browser playback observations.

The broad workbench check stops at missing `reports/g4-l3-single-frame-disposition-candidates.json`. The 20 Canvas adapter cases also refer to older G3–G5 original SWFs and Canvas exports absent from the G6–G8 execution inputs. The public repository does not add private or unrelated source archives to manufacture a pass.

## Test dependency repair

The first runtime run passed 77 of 84 cases. All seven failures were missing technical fixtures. Three existing files were added without changing their bytes: the NMS L5 P045 data JSON, the NMS L11 P023 generated factory, and P023's native runtime configuration. Their affected four test files then passed **20/20**. The other 64 first-run passes remain applicable because their inputs did not change.

## Public-content screening

Original private instructions, historical chats, source archives, credential containers and live machine state were excluded by path/type. Fifteen additional private governance/archive files were excluded before the root commit. The selected text was scanned for provider token signatures, private keys, credential-bearing connection strings and named credential assignments. Matches were classified without printing secret values.

Gitleaks 8.30.1 also ran with full redaction and decode depth 0. Its raw exit was 1 with **12,304 detector matches**: 12,189 source exact-match metadata keys, 37 catalog identifiers, 28 source-inventory hashes, 35 TypeScript source-key types/bindings, 14 lesson/artifact identifiers, and one source-bytecode SHA-256. These are classified non-credential matches, not a clean raw scanner result. No unresolved credential finding remains. The three added fixture files produced zero Gitleaks findings. No source allowlist or detector suppression was added. This is a bounded path/pattern review, not a guarantee against every possible secret representation.

## Reproduction and evidence boundary

Commands and structured outcomes are in [VALIDATION.json](VALIDATION.json). The snapshot retains production code and assertions; test failures are not hidden and generated artifacts were not regenerated. The local dependency arrangement used Node v24.18.0 and existing package installations. A fresh checkout must install its dependencies and supply the documented external source/evidence prerequisites for checks that need them.

This work does not perform browser acceptance, new registration, fidelity/audio review, Owner acceptance, production deployment or lesson publication.
