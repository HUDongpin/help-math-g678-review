# P006 typography checker postflight — 2026-09-27

The native-text implementation and its twelve technical checks were finalized
from actual hash-bound evidence at `2026-09-26T19:12:15.189Z`.

| Artifact | SHA-256 |
| --- | --- |
| `catalog/typography-v1/g678-page-bindings/shared-alg001-l12-p006.json` | `53d83e2a3d3e6ad292adc50ebaff9cd535bb55f8d248f9cf08052aa1c59f3ed4` |
| `catalog/typography-v1/g678-checks/shared-alg001-l12-p006.json` | `3c83aac90c39652f10bda27f9b13078178b989ddfc6e3b1450692bf7faa390ad` |
| `output/playwright/p006-typography-20260927-v1/technical-evidence.json` | `e157d1c1ce949e38d4834cb5299e77f1138ba47582fc53ad4083c062a12d80da` |

The binding has two source-bound native teaching blocks, 164 current
implementation inputs and no unresolved technical typography issues. The receipt
binds 52 evidence artifacts and all five actual source-risk dispositions. The
maintained producer's independent `--check --evidence …` passed after writing.
The previous candidate binding was preserved byte-for-byte in
`output/playwright/p006-typography-20260927-v1/prior-candidate-binding.json`.

At `2026-09-26T19:14:32.161Z`, the real G678 checker was run on the actual
worktree and then on an isolated physical copy. The copy retained the complete
2,282-placement manifest, the original registry, unchanged integration baseline,
and all current binding/check evidence (4,944 ordinary files, 408,546,348 bytes).
Only the copy received a synthetic P006 registry row. The copy was removed after
validation; no source symlink or replacement source root was used.

| Scope | Changed/new pages | Verified | Issues | P006 result |
| --- | ---: | ---: | ---: | --- |
| Actual registry/worktree | 59 | 40 | 19 | Not scanned because P006 is unregistered |
| Isolated proposed P006 row | 60 | 41 | 19 | `new-page`, `passed: true` |

The 19 actual pre-existing issues are identical in both runs. The overall
checker therefore remains failed; this postflight claims only the explicit P006
row passed and did not hide or alter existing issues. See the exact JSON results
and reproducible script under `output/playwright/p006-typography-20260927-v1/`:
`actual-typography-check.json`, `isolated-typography-check.json`,
`checker-postflight.json`, and `check-isolated-registration.mjs`.

The actual registry stayed byte-identical at
`b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.
Official Current-JS coverage remains **480/2,282**, with P006 and P005 absent.
This is technical validation of the unregistered local My Lesson candidate,
not registration, whole-program typography completion or publication.

The next engineering step is actual admission: finalize maintained route and
descriptor integration, settle final timeline/critical inputs, generate the
canonical runtime/freeze/fragment, upsert and regenerate actual registry files,
then bind new evidence to those final bytes and verify the registered host.
The current finalizer intentionally refuses to overwrite finalized records;
any later changed-input refresh must preserve this dated pair and use a reviewed
producer path with new current evidence. Do not hand-edit the generated JSON.

Original Flash runtime/fidelity, listening, human review, Owner acceptance,
strict completion, release and publication remain independent pending gates.
