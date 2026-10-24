# P004 extraction and composition preflight

Main-agent review, 2026-09-26. This is source/extraction evidence, not a
renderer, registry admission, browser acceptance or complete migration.

## Reproducible inputs

- Physical source: `G6-G8-shared/ALG001/L12/RW/L12RW04.swf` under
  `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`.
- SWF: 363,811 bytes, SHA-256
  `4d7aa78bd955aa52d476f31548c97135da989daf9d106986ff06a954c6d8b334`.
- XML: `audit/movie.xml`, SHA-256
  `7d6a9145ad1aa3df704e440cce62301845971eb044e225db7017a451f73d4f19`.
- Exporter: `scripts/export-g678-alg-l12-p004-canvas.mjs` at repository root.
  FFDec 26.2.1, unpacked JavaScript, abort on export error. Existing output is
  never overwritten. The receipt inventories six output files and records the
  actual command. `--check` rehashes source and every inventoried output.
- Main frames SHA-256:
  `05d5bd9f61013fd688dd5f58c5dbcf4a1c655534a5a969042f4fdfb8fe9febc7`.
- Title frames SHA-256:
  `18e7d4c24a8821a86b16a88ec8730cf3c94a2aefea8172ff282d9c6b34af6b21`.

## Independently checked composition prerequisites

Root frame 6 retains main sprite 90 at depth 1, translation (209.45, 283.5),
title sprite 92 at depth 171, translation (400, 43.45), and border shape 93 at
depth 173 with identity transform. These are source coordinates, not a modern
layout redesign. Preserve the depth order main, title, border.

Main sprite has 969 frames and exported internal translation (122.8, 185.05).
Title has one frame and internal translation (282.6, 12.2). Their required
stage offsets are therefore (86.65, 98.45) and (117.4, 31.25), respectively.
Main exports two font functions, font2 and font60, and the five glossary button
functions 63, 66, 67, 71 and 72. Main/title function declarations do not collide.
Both extracted definition blocks pass JavaScript syntax parsing; they were not
executed by this preflight. No `new Image()` construction occurs in either block.

The three extraction tests pass, covering physical-source and output hashes,
wrong-root rejection, refusal to overwrite prior evidence, declaration
compatibility, frame counts, export translations, fonts and button functions.
Run `node --test scripts/export-g678-alg-l12-p004-canvas.test.mjs` from the exact
implementation worktree. This adds no original-runtime or visual assurance.

## Next implementation boundary

Complete and review canonical source specifications before renderer work.
Build a maintained, source-locked composition; do not edit FFDec output.
The vocabulary-only adapter is not a drop-in match for this real-world page.
Its five visible-by-frame glossary controls need a bounded maintained state
adapter and real host validation. Source release actions stop the animation;
modal close/resume semantics must not be invented as original behavior.

Audio remains required and unresolved. Neither the 881 embedded stream blocks
nor the separate SA file authorizes guessing a playback/language binding.
Keep a candidate silent and explicitly unaccepted until that gate is resolved.

Do not change the frozen shared descriptor host for convenience. Preserve its
52,078 bytes and SHA-256
`494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`.
No P004 registry, freeze, product route or runtime has been admitted by this
extraction review. Current-JS remains 478/2,282 from the preceding P002 slice;
recalculate catalog/registry intersection after actual future admission.
