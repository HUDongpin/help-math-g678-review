# P053 → P054 native state transitions — 2026-09-23

Status: source-extracted AVM1 control-flow evidence for the exact P053 and
P054 SWFs. This is not an original-runtime trace, runnable JavaScript game,
host-adapter acceptance, or lesson publication decision. The frozen card
contract remains `catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json`.

## Evidence binding

- P053 `L2GS02.swf`: SHA-256
  `f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`;
  extracted AVM1 in
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/scripts/DefineSprite_187/`.
- P054 `L2GS03.swf`: SHA-256
  `06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8`;
  extracted AVM1 in
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5/scripts/`.
- These decompilations are useful for implementation planning but not proof of
  executed host behavior. The two P053 Start branches have different target
  strings; `audit/START_BRANCH_TRIAGE_V1.md` in the P053 workspace records the
  static placement evidence for the early branch.

## Source-defined transitions

| Site | Precondition/action in extracted AVM1 | Consequence established by source | Still unproven |
| --- | --- | --- | --- |
| P053 sprite 187 frame 1 | `gameLevel1=false`, `gameLevel2=false` | Fresh controller state begins with neither level selected. | Original host reset timing. |
| P053 early Start, frame 1/depth 24 | A selected level sets `startGame=true`; calls `doNeedMoreHelp("L7GS03",1)`. Without a selected level it writes “Please select the Level then Click Start”. | The earlier target is not P054's `L2GS03`. | Whether a learner can activate this visible early control and how the host resolves `L7GS03`. |
| P053 later Start, frame 693/depth 43 | A selected level sets `startGame=true`; calls `doNeedMoreHelp("L2GS03",1,6)`. Without selection it shows `Mc_Msg`. | A separate source-defined path names the cataloged P054 SWF. | Whether the original host lands at the expected P054 state, and the semantic meaning of argument `6`. |
| P054 sprite 731 frame 1 | `startGame()` goes to `Level1` if `gameLevel1`, else `Level2` if `gameLevel2`, else defaults to `Level1`; sets `quizSection=true`. | The game can display Level 1 without an inherited level flag; Level 2 requires a true flag at entry. | Actual cross-SWF persistence of `_global` in the modern host. |
| P054 sprite 731 frame 2 or 4 | Resets `score`, `ansClickCount`, `totAnsCount`, `chkMcName`, all six card pairs and paired reveal images; sets `quizSection=true`. | Each level starts a new six-pair score session. | Natural-frame timing and score presentation. |
| P054 card handler, first click | Increments click count, saves instance name, moves that card to frame 2. | One pending choice. | Pointer/keyboard equivalence and intermediate animation. |
| P054 card handler, second click | Disables cards. If the opposite side of the same numbered pair is at frame 2, adds 10, begins paired fade/reveal, plays correct feedback. Otherwise subtracts 2, returns first card to frame 1, plays wrong feedback. | Matching is source pair-ID based and symmetric across the two sides; the extracted handler does not clamp negative scores. | Whether any other host logic clamps score, and exact fade/feedback timing. |
| Correct feedback sprite 194 frame 27 | Re-enables cards, increments `totAnsCount`; on `>=6`, resets it to 0, sets `quizSection=false`, and calls `nextFrame()` **within that feedback sprite**. | Six successful pairs change quiz state. This alone does not establish a page-level terminal transition or automatic level switch. | Result screen, Replay, completion signal, and host progress semantics. |
| Wrong feedback sprite 208 frame 31 | Re-enables cards. | A mismatch does not increment completed pairs in that feedback action. | Full visual/audio feedback duration. |

The paired fade routines use 100 ms intervals and alpha decrements of 40 in
the inspected card handler. That is source intent, not an observed wall-clock
duration; timer scheduling and nested clip behavior need original-runtime
comparison. `DefineButton2_655` branches on the same two level flags to the
`Level1`/`Level2` labels. The source display list names its placement
`BtnStart`. Three `BtnRepeat` button characters (233, 649, 730) only set
`Mc_Popup._visible = true`; popup close character 96 hides itself. The exact
learner-visible Replay and result flow still requires visual/runtime mapping.
The 24 card handlers have the same SHA-256
`f39b7bc9e865752b35736f6cd782efb4394c62f7ee19df3bc4daf76a5ec3e6cb`.
The source-locked, reproducible audit is `audit/interaction-contract-v1.json`.
The controller's own five-frame display-list map is
`audit/game-display-list-v1.json`: frames 2/4 are game states while 3/5
contain result sprites 648/729. All five controller frame actions are frozen;
none directly advances from 2 to 3 or 4 to 5. This narrows the required
host/natural-trace investigation but does not prove those result frames are
unreachable or establish a completion transition.

## Implementation and acceptance boundary

Do not silently rewrite the early `L7GS03` call as `L2GS03`, infer that six
pairs complete the page, or assume Level 2 follows Level 1 automatically.
Before a runnable renderer or registration, obtain natural-input traces for
both P053 Start branches, P054 entry at each level, correct/wrong/negative
score, six-pair reveal and result, Replay/navigation, and source audio cue
timing. Then freeze the state-machine/host-adapter decision with a reviewed
deviation if the early target is intentionally corrected. Current-JS,
original-runtime, visual, audio, human/Owner, strict-completion, release, and
publication gates all remain open.
