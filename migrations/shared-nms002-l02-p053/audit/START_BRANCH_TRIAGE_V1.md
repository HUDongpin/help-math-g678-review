# P053 early Start branch — structural addendum, 2026-09-23

This addendum narrows the earlier `L7GS03` uncertainty without claiming
authoritative original-runtime interaction or revising the frozen v1 game
contract. It must be considered before implementing or registering P053.

Source: exact P053 SWF SHA-256
`f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
The swfmill XML is
`/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/movie.xml`,
SHA-256 `058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1`.

- Within placed sprite 187, `mcStart` character 136 is placed at depth 24
  in nested frame 1 and `RemoveObject2 depth=24` occurs in frame 7.
  `xmllint` counts preceding `ShowFrame` tags as 0 and 6 respectively.
  Selected FFDec static frame 3 visibly includes the Start control:
  `visual-probes/DefineSprite_187/3.png`, SHA-256
  `59b121577f0fd34bfae469adb4a7bed6480454139ea9ab19498c1be8f6a15687`.
- The early instance's `on(release)` action calls
  `_root.doNeedMoreHelp("L7GS03", 1)` after a level is selected. Its
  visibility and placement make it a plausible early-input branch, not just
  a dead string. Static extraction does **not** prove whether real learners
  can activate it or what the original host does with that target.
- A different `mcStart` instance of the same character is placed at depth 43
  in nested frame 693, labeled `SelectLevel`. Its `on(release)` action calls
  `_root.doNeedMoreHelp("L2GS03", 1, 6)` after level selection. `L2GS03.swf`
  is cataloged as the separate NMS002 L2 P054 page.
- `audit/host-navigation-resolution-v1.json` (SHA-256
  `4082197b15ee072fcbbbff594c5a92ceaf19c039964fa3d8cd58cb83a3536332`)
  binds the exact recovered `indexMI.swf` host, its frame-35 navigation
  functions, both P053 button actions, and the L2 lesson XML. The host's
  `doNeedMoreHelp` searches only `arrayTotalSectionDetails[sectionNumber]`
  by SWF basename; `framePlay` and `tempSection` are unused there. The L2 GS
  list contains `L2GS02` and `L2GS03`, not `L7GS03`. Under the ordinary L2 GS
  entry state with P053 selected, the early request therefore leaves
  `playSwfFileName` unchanged, `doCreateSlide` does not rewrite it, and
  `loadSWFMovie` loads that retained path. The later `L2GS03` request finds
  the second GS page. A real NMS002 L7 `L7GS03.swf` exists and is separately
  hash-bound, but its existence does not make the early L2 lookup cross-lesson.
- This is a conditional source-static resolution, not an observed runtime
  reload or proof of learner-visible behavior. The actual section/global
  state at the early click, reload effects, and intended product behavior
  still require a natural host trace. Do not silently redirect every Start
  event to P054 or to the L7 file. Until that decision is reviewed, P053
  remains unregistered and no fidelity/Owner gate changes.

Reproduction (read-only): `xmllint --xpath` against the XML above with
`count(//DefineSprite[@objectID="187"]/tags/PlaceObject2[@name="mcStart" and @depth="24"]/preceding-sibling::ShowFrame)+1`,
`count(//DefineSprite[@objectID="187"]/tags/RemoveObject2[@depth="24"]/preceding-sibling::ShowFrame)+1`,
and the corresponding depth-43 placement expression. The results are 1,
7, and 693. These are source timeline indices, not playback timestamps.
