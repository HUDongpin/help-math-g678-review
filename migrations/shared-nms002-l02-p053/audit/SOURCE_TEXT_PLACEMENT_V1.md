# P053 source text placement — 2026-09-24

This is structural SWF evidence for the unregistered P053 game candidate, not
an original-runtime screenshot, native renderer, Spanish translation, or
typography acceptance. Reproduce it with:

```sh
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' \
  node scripts/check-nms-l02-p053-source-text-v1.mjs
```

The checked source is `G6-G8-shared/NMS002/L2/GS/L2GS02.swf`, SHA-256
`f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf`.
The shared parser's full structural catalog hashes to
`4b92f48d2416025e423aefb70ecd5873212fe697da3af6e2322a527f1733eb9e`.
The check script hashes to
`0941a2103066e8d6983234790ce965f1f85e653bc7d07a224e2fbe1935fe9705`.

| Source text | Static placement fact | Implementation consequence |
| --- | --- | --- |
| 15, “Inequalities Match Game” | Inside sprite 17; sprite 17 has no placement in any parsed timeline or button state. | Do not use this library remnant as the game title. |
| 103, “Fractions, Decimals, and Percents Match Game” | Inside popup sprite 104; sprite 104 first appears in sprite 187 frame 693. | Candidate directions popup copy; still subject to runtime visibility. |
| 102, +10/−2 scoring instructions | Inside sprite 104. | Retain both scoring rules in the directions copy. |
| 178, same matching-game title | Main sprite 187 placement starts at frame 586. | Bind main teaching title to this source ID, not text 15. |
| 142, 143, 145, 171, 173, 174, 180 | Main sprite 187 placements start at frames 174, 221, 277, 436, 492, 535, and 615. | Preserve their separate teaching beats and reading order; source frame placement is not a playback timestamp. |

The parser finds 39 text definitions, 44 decoded runs, two font records and no
unparsed tags. A static graph from the root reaches 13 defined sprites,
including popup sprite 104 but not sprite 17. Script-controlled alpha,
masking, navigation, sound and exact natural-input reachability are not
interpreted by this check. The `Mc_Popup` Close handler's `this._visible=false`
also remains unresolved as documented in `CONTROLLER_ACTIONS_V2_2026-09-24.md`.
The next native text binding must use exact source IDs, deal explicitly with
English-on-Spanish fallback or independently evidenced Spanish copy, and pass
the real G6–G8 typography/host checks before Current-JS admission.
