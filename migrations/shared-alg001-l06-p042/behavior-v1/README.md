# P042 canonical source, native, and behavior inputs

`prepare-p042-canonical-inputs.mjs` assembles and checks the P042-only files in sibling `audit-v1/`, `native-v1/`, and this `behavior-v1/` directory. `--write` copies a fixed set of reviewed source artifacts only when absent; `--check` verifies the canonical copies and regenerates the derived clip plan, corrected behavior IR, adapted reducer test, and manifest in memory. The check also rehashes the physical SWF, lesson XML, separate SA candidate, and all 16 copied ActionScript extracts. It does not edit app, host, registry, or provider files.

The exact-byte copies include the source audit and swfmill XML in `audit-v1/`, the 1,676,871-byte native model and Canvas extraction plan in `native-v1/`, and the v2 source pins and pure reducer here. The original behavior IR is copied unchanged as `historical-behavior-ir-draft-v1.json`. Its `visibleAnswerLabels` field remains unresolved as a dated record. `behavior-ir-source-corrected-v2.json` uses the native display-list/text-hit overlap to bind the **source stage** as follows:

| Visible choice | Source value | Instance | Button | Branch |
| --- | ---: | --- | ---: | --- |
| A | −3 | `AnsBtn2` | 171 | right |
| B | 3 | `AnsBtn1` | 169 | wrong |
| C | 10 | `AnsBtn3` | 170 | wrong |
| D | 25 | `AnsBtn4` | 170 | wrong |

This source-stage binding does not establish browser hit parity, responsive label layout, actual historical launcher binding, or original-runtime choice outcomes. The separate SA file is a source candidate and stays user-triggered; this packet makes no listening or EN/ES coverage claim.

`native-v1/clip-plan-v1.json` records shape 182 as a `clipDepth=7` mask at depth 1 on feedback sprite 207 frames 2–8. The Canvas asset normalizes its one solid fill for drawing. The Chrome smoke did not exercise that feedback-1 mask; browser clipping, original-runtime clipping, and pixel fidelity remain unverified.

Recheck from the implementation worktree:

```sh
node migrations/shared-alg001-l06-p042/behavior-v1/prepare-p042-canonical-inputs.mjs --check
node --test migrations/shared-alg001-l06-p042/behavior-v1/state-machine-v2.test.mjs
```

The reducer tests cover ten source-grounded state cases, including the wrong-feedback stop at 22 and required Close before terminal 31, the right path's unchanged try count, NMH visibility, glossary eligibility, Replay, and stale callbacks. They are local behavior tests. No Current-JS registration, real My Lesson run, original-runtime fidelity, audio/listening acceptance, typography, human/Owner acceptance, strict completion, release, or publication follows from this packet.
