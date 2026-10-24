# P016 source-timed native reading companion

`scripts/build-alg-l06-p016-text-state-v1.mjs` verifies the physical
`L6VB09.swf` and the two frozen time-resolved source audits before generating
`text-state-source-v1.json` and the TypeScript state. Run `--write` to regenerate
and `--check` to verify unchanged output. The source SWF SHA-256 is
`2fdeba5b4dcfcfe7d1b575ab30d76a98fca802d6be670a679a54378f32aa4ae9`.
The 815-frame domain is `sprite-139` at 12 fps, entered from root frame 6.

The 19 source text definitions occur in 39 placement instances. Each generated
instance has its actual placement/last-active frames and all intervals in which
the audited conservative glyph ink hull is fully exposed by the active masks.
The native companion uses those intervals, so the initial `A function` at
depth 2 ends at frame 71 and the replacement at depth 3 begins at frame 72.
The source drawing remains in Canvas; the native component provides reflowing
reading text and a keyboard-usable glossary button.

The companion preserves source English for both interface languages and marks
Spanish as `source-en-fallback`. It renders the exact source definition
fragments, `Inputs`, banana/ice-cream input fragments, `Output`, `1 banana
split`, and the authored equation only after each complete glyph hull is
visible. It does not infer a new result or translate the text. Source text 6
is a brief decorative `function` overlay; its four one-frame instances remain
in the generated state but are not read as repeated vocabulary. Text IDs
128/130/131/132/134/135/136/138 are short-lived late replacements whose
individual instructional roles are not established by this structural audit.
Their exact intervals remain queryable and their source glyphs remain in
Canvas; the native companion does not invent a second explanation from them.

Button 10's source action selects `Function`, calls `DoHyperLinks`, then stops
the main animation. Its blue glyphs and some hit area first become available
at frame 72. The hit rectangle remains about 1.14 stage pixels beyond the
source mask, so there is **no** full-hit frame in the 815-frame audit. The
native control starts at frame 72 as an accessible modern candidate; this is
not evidence that an original Flash click worked. Original-runtime behavior,
listening, human and Owner decisions, strict completion, and publication stay
separate from this generated source-text result.
