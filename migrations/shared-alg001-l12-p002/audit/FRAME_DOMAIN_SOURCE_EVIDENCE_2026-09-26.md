# P002 root-reachable frame-domain source audit — 2026-09-26

Scope: structural source evidence for `shared-alg001-l12-p002` only. The page is
present in the private Current-JS registry; this audit changes no candidate,
registry, manifest, freeze, or coverage requirement. Current-JS membership does
not establish original-runtime, visual, behavior, audio, human, Owner, or strict
acceptance.

## Exact source binding and method

- Physical AWS source root: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware` (verified real directory, not a symlink).
- Shipped SWF: `G6-G8-shared/ALG001/L12/RW/L12RW02.swf`, SHA-256 `15e67732b739f0194087ded0748c2d23f9871363ed33388807c351f2aad6fb62`.
- Active placement: `G6-G8-shared/ALG001/L12/index.xml`, SHA-256 `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`; exact `RW/L12RW02.swf` Page 1 element checked.
- Existing swfmill 0.3.6 extraction: `audit/movie.xml`, SHA-256 `9332ec48d2a17395e7d37c593b5336aa47bb0a821ba135fb3e350d425af19aee`. FFDec 26.2.1 frame scripts are individually indexed and hashed in `scenario-inventory.json`.
- Root is 800 × 600 at 12 fps, with 10 `ShowFrame` tags. The script parses every root and `DefineSprite` tag list, preserves every placement/update and removal with its local frame and XML tag ordinal, then traverses all sprite-object placement edges from root. All six defined sprites are reachable; there is no excluded sprite definition. Each declared frame count equals its observed `ShowFrame` count.

## Reachable timeline and disposition inventory

| Source timeline | Local frames | Placement/update tags | Removal tags | Action tags | Source-parent entry | Disposition |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| root | 10 | 3 | 0 | 2 | source root | declared frame domain |
| sprite 43 | 22 | 6 | 2 | 0 | sprite 454 frame 24, depth 64 | unresolved |
| sprite 389 | 36 | 6 | 2 | 0 | sprite 454 frame 1201, depth 68 | unresolved |
| sprite 449 | 19 | 4 | 0 | 0 | sprite 454 frame 1951, depth 35 | unresolved |
| sprite 451 | 36 | 18 | 0 | 0 | sprite 454 frame 1951, depth 46 | unresolved |
| sprite 454 | 1951 | 2820 | 417 | 2 | root frame 6, depth 1, `animation` | declared frame domain |
| sprite 458 | 1 | 2 | 0 | 0 | root frame 6, depth 147, `Mc_Page_Title` | unresolved |

Root frame 6 places sprite 454 and the separate title sprite 458 together.
Sprite 454 introduces 43 at local frame 24, 389 at 1201, and 449/451 at
1951. The four inner placements have no retained instance name in swfmill;
their complete root-reachable chain is recorded in the scenario inventory's
placement edges, while the canonical disposition's *named* path correctly
remains unresolved. Six sprite-to-sprite placement edges and all 2,859
placement/update tags are indexed. Sprite 454 also contains one
`SoundStreamHead` and 1,927 `SoundStreamBlock` tags. This is tag structure,
not an audible-duration or synchronization result.

The only four `DoAction` coordinates are root frames 1 and 6, and sprite 454
frames 1 and 1951. FFDec exports root frame 1 as
`_level0.InternalPreloader.gotoAndPlay("jump_check"); stop();`, root frame 6
as `stop();`, sprite 454 frame 1 as an empty action body, and sprite 454 frame
1951 as `stop();`. There are no `DefineButton`, `DefineButton2`,
`DefineEditText`, global `DoInitAction`, or placement clip-action records in
this extraction. Absence of those tags does not prove absence of host behavior.

`migration.json` already declares only the root and sprite 454 frame domains,
with frame counts 10 and 1,951. The canonical disposition helper therefore
records two `declared-frame-domain` rows and five `unresolved` rows. A
single-frame title does not become `nonvisual` or `composite-child-with-parent`
from duration alone. Likewise, multi-frame children cannot be assigned
`independent-required` or parent-clock composite status from static placement
coordinates. None is given a final disposition here.

## Scenario boundary and unresolved behavior

The source supports candidate investigation of the root preloader path, the
frame-6 composed stage, and the sprite-454 stream/terminal state. Their natural
event schedules are pending in `scenario-inventory.json`. In particular,
`InternalPreloader.jump_check` is an external host target; this SWF does not
establish when root reaches `begin`, whether nested playheads reset or persist,
how sprite 454 reaches its final stop under the original host, or how the
catalog lesson-SA MP3 relates to the embedded stream. No trace, replay result,
audio cue timing, or language is synthesized from the static frame numbers.

The existing course/shell scenario JSON Schema limits `animationId` to
`course-*` or `shell-course-*`. This G6–G8 shared page uses the same required
field contract, with a **focused validation of the ID field to this exact
`shared-alg001-l12-p002` value in memory**. The generic schema file and
generic verifier remain unchanged. The conventional disposition JSON is built
with the canonical `buildDispositionReport` helper and checked by the canonical
`validateFrameDomainDisposition` function. That validator reports exactly the
expected two strict blockers: status is not strict-ready, and the five child
timelines remain unresolved. It reports no additional structure or binding
error.

Reproduce the source/hash/schema/build/validator check without a server:

```bash
node scripts/build-g678-alg-l12-p002-domain-evidence.mjs --check
```

The builder's `--write` mode uses exclusive creation and is for a fresh
artifact only. This audit advances structural coverage; original natural-clock
dispositions, authoritative traces, full-frame fidelity, audio listening,
human/Owner review, strict completion, release, and publication remain pending.
