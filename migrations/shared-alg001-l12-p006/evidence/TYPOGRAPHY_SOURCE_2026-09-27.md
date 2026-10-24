# P006 typography source audit — 2026-09-27

This is a bounded source and typography role audit for `shared-alg001-l12-p006`. It authorizes engineering decisions about the exact native title/question instances described below. It records no Current-JS admission, check record, original-runtime acceptance, fidelity acceptance, named listening, human/Owner review, strict completion, release, or publication. Runtime, glossary, audio, and resource implementation remain separately verified work.

## Source identity and method

- Real, non-symlink source: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW06.swf`; regular file, one link, 708,053 bytes.
- Source SWF SHA-256: `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
- Source header: CWS/SWF6, source-declared stage 800×600, 12 fps, root 10 frames. Teaching playback uses nested sprite53 public source frames1..342 through the maintained root-frame6 context; sprite56 has 1 source frame.
- Source XML: `migrations/shared-alg001-l12-p006/audit/ffdec-26.2.1/movie.xml`, SHA-256 `60c835b77135803e0699aa6580650413ec9591d14f17dbe70d01365cea28a77a`.
- Source parser output: `output/p006-typography-source/source-catalog.json`; compact `JSON.stringify(catalog)` content SHA-256 `ade09b22c6df92ebbef45c15154abe20e60ffff2f8328dd9e1b877b734611996`. Its pretty-file SHA is separately listed below. The parser reports 47 shape/morph definitions, 1 bitmap, 2 static-text definitions, 4 button definitions, 3 timelines, and zero unparsed tags. Font45 is the embedded glyph font with a separate name metadata record.
- Direct FFDec26.2.1 source exports were visually inspected:39 static-shape PNGs, all 40 static SVGs (including zero-height shape44), both endpoints of 7 morph shapes, bitmap2, and visible title55 at native and 4× nearest-neighbor size. These are source extraction views, not original Flash runtime evidence.
- Tool executable: `/Users/peter/Applications/FFDec.app/Contents/Resources/ffdec.sh`, current reverified SHA-256 `1a242c6333aa8dba0f18f635f9ea2585a988f4131aa5164b70eb00ad9e662bab`; FFDec jar current reverified SHA-256 `090ab695053ad94cba6408574c7d7eea20ec60b6ae789ee6056a23f45106762f`. The tool executable, jar, and current source bytes were rehashed for this report.

## Visible title and exact suppression identity

Visible shape55 reads **Graphing in the Coordinate Plane: Real World Activity**. The direct PNG enlarged4× confirms capital C/P; the undersized preview initially suggested lowercase, but enlargement and an independent second visual review resolve that ambiguity. The source text54 definition decodes the same semantic title and casing; it is an offstage reference rather than the visible title drawing.

- Visible outlined title definition: shape55, raw source-tag SHA-256 `c12e756f774672ff8ded0cc3916ee99587d3243c138ca83839b2f61a4e1a2dbf`.
- Exact source instance: `root/depth-65/generation-1>sprite-56/depth-1/generation-1`. Do not substitute FFDec export placement ordinal3 for source depth65.
- Root parent: `root/tag-742225`, source-tag SHA-256 `95c6f1b61934a4383d0df69047f18070121ec9e098e22246c10a204fbe45301e`, source matrix `[1,0,0,1,8000,869]`twips, name `Mc_Page_Title`, present root source frames6..10.
- Child: `sprite-56/tag-742213`, source-tag SHA-256 `98b8449fc44ed43635f56607f9a303dcedf4413153fad8b23163c918100ed530`, local identity matrix, child source frame1. The maintained teaching frame clock keeps the selected root source context while sprite53 advances.
- Offstage decoded text54: SHA-256 `ce5a753b0b7be666e8107f61c23375ebcd99c6d128b3e818ac374425ad16b504`, exact `root/depth-64/generation-1`, root frames6..10, matrix translation`[2407,-2760]`twips. Text bounds `[16,11603,125,593]`twips produce stage y=-131.75..-108.35px, outside the stage. Do not globally suppress text54 or treat its presence as a second visible title.
- Engineering role decision: `{kind:"outlined-text",role:"title",semanticValue:"Graphing in the Coordinate Plane: Real World Activity",sourceShapeHashes:[{characterId:55,sourceTagSha256:"c12e756f774672ff8ded0cc3916ee99587d3243c138ca83839b2f61a4e1a2dbf"}]}`.

## Essential Question and source reveal

Exact text46 is **Essential Question: How can we use the coordinate plane to graph equations and inequalities?** It has 92 characters, 7 style runs, font45 at320twips=16px, and source black/blue word styling. Native text must preserve this wording and derive its timing from the actual source geometry.

- Definition text46 SHA-256: `add6792b852d59e5ea04ec0cdbb35e4b52d19ae9bd64156dfb96919938420fdd`; bounds `[11,13085,81,379]`twips; identity text matrix.
- Exact source instance: `root/depth-1/generation-1>sprite-53/depth-20/generation-1`, created `sprite-53/tag-698509`, source-tag SHA-256 `3da8f75e15b6d9fd2e7945c40786a972dd9a69f3737d2b1bdb936e71bb8825d0`.
- Single text generation is present public frames249..342inclusive. Its local translation`[-3827,-5250]`twips combines with source root animation`[5568,7337]`twips to stage origin87.05,104.35px. Presence at249 does not mean the question is fully visible.
- Parent source animation instance `root/depth-1/generation-1`, created `root/tag-739181`, SHA-256 `bd70b3fbcdfda6772700c9bbbbbb51f15a234fff3f8bc3ebde72f18579951226`.

| Source run | Exact value | Advance interval, twips | Source color |
| --- | --- | --- | --- |
| character-46/run-0 | `Essential Question: How can we use the ` | 0..5544 | black |
| character-46/run-1 | `coordinate` | 5544..6982 | blue |
| character-46/run-2 | ` plane to ` | 6982..8280 | black |
| character-46/run-3 | `graph equations` | 8280..10517 | blue |
| character-46/run-4 | ` and ` | 10517..11215 | black |
| character-46/run-5 | `inequalities` | 11215..12749 | blue |
| character-46/run-6 | `?` | 12749..12909 | black |

Question reveal is a rectangular clip. Shape43 starts at public249 with bounds x=-6502..-6422,y=-490..30twips; its end bounds are x=-6502..6641 with the same y-range. It is placed local`[2514,-4806]`twips at sprite53depth18 with clipDepth29. It is removed at338 and shape52 takes the same placement/clipDepth through342. Relative to text46 the clip left=-161twips and top/bottom=-46..474twips. Before338 the right edge is `-81 + 13063 * actualSourceRatio / 65535`; at338..342 it is12982twips. Source ratios are sparse and remain unchanged between their actual update events; do not linearly interpolate elapsed frame249..338.

The complete-word schedule below derives each actual DefineFont2 glyph contour bound, including quadratic extrema, applies inherited advances and the 320/1024 font scale, and finds the first source frame whose translated clip fully contains every glyph on all four left/top/right/bottom boundaries. This is exact static-source geometry analysis; it does not prove original Flash runtime execution. A modern whole-word reveal avoids source half-glyph clipping while retaining each word's fully-visible source threshold. The teaching-text policy must explicitly record that readability treatment. Audio/frame-clock behavior is unchanged by this audit.

| Complete word | Character indices, zero-based | Last glyph right, text-relative twips | First fully visible source frame |
| --- | --- | --- | --- |
| Essential | 0..8 | 1170.5625 | 254 |
| Question: | 10..18 | 2568.9375 | 259 |
| How | 20..22 | 3286.8750 | 278 |
| can | 24..26 | 3840.8750 | 280 |
| we | 28..29 | 4358.3750 | 282 |
| use | 31..33 | 4921.3750 | 284 |
| the | 35..37 | 5448.3750 | 286 |
| coordinate | 39..48 | 6973.3750 | 298 |
| plane | 50..54 | 7822.3750 | 301 |
| to | 56..57 | 8183.6875 | 311 |
| graph | 59..63 | 9073.0625 | 314 |
| equations | 65..73 | 10505.5000 | 319 |
| and | 75..77 | 11112.3750 | 331 |
| inequalities? | 79..91 | 12897.7500 | 338 |

The source begins clipping in from no visible glyph at249. A second source view exported sprite53 frames286,298,314,319,331,337,338 through FFDec and inspected a same-crop contact sheet. The direct source views confirm each sampled complete-word boundary and the missing question mark at337 / complete question at338. They also retain the next partially clipped letter in some frames, which the declared modern whole-word treatment omits for readability; this is not a pixel-identical reveal claim. At337 the clip right≈12715.697twips still cuts the final word; at338 the question mark right12897.75twips is inside the final12982twip clip, so the complete sentence is fully covered. The machine-readable evidence `output/p006-typography-source/question-reveal.json` retains all glyph bounds, all four translated clip boundaries, actual ratio update behavior, and per-word `firstFullyVisibleFrame`. The derivation selects text46 / sprite-53 / font45 by identity, verifies fixed source SWF / catalog file and compact content / XML / text hashes before writing, and asserts actual placements and source geometry. It was regenerated twice after the final correction with identical bytes; output SHA-256 `ae8a7b5bcb7eb73e7aabd8fe383575940d94095754aa41895356560856c024bd`. The schedule is unchanged by adding full-boundary checks.

Shape44 is source text decoration, four blue underlines under the glossary spans, not mathematical geometry. It has zero vertical extent and cannot be PNG-exported by FFDec; the SVG/XML line records resolve its role. Its exact instance is `root/depth-1/generation-1>sprite-53/depth-19/generation-1`, public249..342inclusive, created `sprite-53/tag-698497`. The local line y=-111twips has xsegments[-761,610],[1960,2730],[2870,4161],[4891,6411]. The final engineering treatment replaces those decorative underline strokes with the native question and existing semantic glossary buttons. Suppress only this exact instance while the native question owns the corresponding source frames. Definition SHA-256 is `b67301df210b5e9ba802077935654f227285dde4570083f3bc6b71cc0df96cc2`. Shape44 is not authored words or mathematical geometry, and it is not a separate native text block. This disposition does not authorize global shape44 suppression.

Source shape42 is the original question container, a light yellow/green rounded plate, and is independently replaced by the native question container's light-yellow-paper style. Its exact definition SHA-256 is `9060ab0868b4a2ca44d5e805be99b6bca29abd8816230ef628aa09e55173f7bc`; exact canonical instance is `root/depth-1/generation-1>sprite-53/depth-17/generation-17`. Do not substitute generation1: earlier educational artwork reuses source depth17. It is present public frames242..342 inclusive, created by `sprite-53/tag-695330`, source placement-tag SHA-256 `08c55e085f0eb2d2ff51ca50604e068924cbe29e64b24dac22b5ea380c33c9f3`, local matrix `[1,0,0,1,2514,-4826]` twips with no later matrix changes. The source alpha multiplier is0/256 at242,43/256 at243,85/256 at244,128/256 at245,171/256 at246,213/256 at247, and256/256 from248 through342. This native container substitution suppresses only this exact instance and preserves every other source depth17 generation and all educational imagery. The container is neither authored words nor mathematical geometry; its source fade and the eventual native timing/style still need actual implementation verification. The machine-readable `output/p006-typography-source/question-container-disposition.json` retains bounds, all7source events and exact hashes.

## Four glossary buttons

The four source DefineButton2 buttons48..51 use only shape47 at their recorddepth1 with `hitTest=true` and up/over/down=false. Shape47 is a plain124×29px rectangle, not outlined teaching text or visible button art. Definitions and actions are source-pinned below. Each `on(release)` sets the exact `_global.KeyAttribute`, calls `_root.DoHyperLinks()`, then stops `_root.animation_mc.animation`. The maintained host's local glossary behavior must remain independently verified; the parser does not execute those actions.

| Button | Exact KeyAttribute | Source depth | Definition SHA-256 | Action-byte SHA-256 |
| --- | --- | --- | --- | --- |
| 48 | Coordinate | 21 | `75776ef5bd3b804beff05a8d84fcc7ac592ef42b6595097b11c027edfe527633` | `4be89e8b951f3f490e4dba8801d18a068f31fa9c8825604ba23a2c65228cbd83` |
| 49 | Graph | 23 | `13424f35eb2f6c662d0144bc668647a3ae024f4236ecae1f2daae5f39c049632` | `a166738a046a0f40c86c2e76c6735cb8e17807531abdc2b1fd133fc45cc07852` |
| 50 | Equation | 25 | `29d0ba7f51c6377da228b5dd1824c62e62a1fe8f2e4c00d6853816e2805a8ea6` | `acec2ddbdec541c53aa048565d1718c6ac9de8c80537fb950d635292318ef1ff` |
| 51 | Inequality | 27 | `4f398f7f313c561434f3f33184957ac22d971ed4a908db4fd676cca69fb02dd6` | `68d027351a55b0ef471f5ab758c66045d6239dc1b6df1e7358a08531299a06d6` |

All four have generation1 from249..337 and generation2 from338..342 at the same source depths, due explicit remove/readd operations at338. Text46 is not readded. Canonical button instance paths use root/depth1parent and sprite53depth21/23/25/27generation1or2. Source hit activation windows and native complete-word reveal are different facts: for example the retained source glossary policy first exposes Coordinate at286, while the complete word coordinate is fully unclipped at298. Do not infer one from the other or advance an existing source action gate solely from native wording.

## Complete shape and bitmap role disposition

All 47 source shape/morph definitions are classified below. Character/rope drawings are source illustration, including the activity's visual motion; classifying them as nontext does not authorize removal. Shape55 is the only outlined teaching title in this inventory. Shape44 is text decoration. The other definitions have no outlined teaching words, coordinate-axis labels, numerical teaching labels, equation strings, or mathematical symbols identified in their direct source drawings. This is a role audit, not a visual-fidelity pass.

| Character | Source tag | Role | Raw source-tag SHA-256 | Source drawing disposition |
| --- | --- | --- | --- | --- |
| 1 | DefineShape3 | viewport-mask | `f915c07605886e45406afd5bbd642fdac14a78e03a4652f1dc3f4ff0413e1a5d` | Plain rectangle, used at sprite53 depth1 with clipDepth62; no teaching text. |
| 3 | DefineShape2 | illustration | `362b97d1f2c0e22cdf2578633a354f99194e637b8941486dea201911d1269bd4` | Bitmap-fill bridge photograph, dependent on bitmap2; no teaching text. |
| 4 | DefineShape3 | character-and-rope-illustration | `ae013a8ecfa5d9a6e4aec4aea61bef2a0cec4883f3127f9224a3a722c5707514` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 5 | DefineShape | character-and-rope-illustration | `571bd8080830864841365905491c898aba80af132d2c7efec37e96c5a66630f1` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 6 | DefineShape | transition-fill | `9c697599429dd25b262361601873d717568ca0e312d2fa447aa90799dde2ebab` | Plain opening sky-blue wipe/fill; no teaching text. |
| 7 | DefineShape | character-and-rope-illustration | `4f6627b0c89c047144d93fd5f62e0c3f28a4c0c4bfb9b216affd7c2431adc069` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 8 | DefineShape3 | character-and-rope-illustration | `d9ef6c3c210ff8437125c9b974155724d17a9b425ecc2343b1606a681b33cd0e` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 9 | DefineShape3 | character-and-rope-illustration | `83d37d55556b923881e6e36d0a9a98d6749e6c3667bc85114baa7113e6bf969b` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 10 | DefineShape | character-and-rope-illustration | `0eb9205039a8ead7ef95424a2b575841e544f543679010a684d20cfc0dfb61e1` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 11 | DefineShape3 | character-and-rope-illustration | `dc87f4ed1a1ef510dc42259b9747569c30e01f994c147846752fa13f58ea432a` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 12 | DefineShape2 | character-and-rope-illustration | `ab1ede708f117a17296a9881611418a40463a999c5bb2323732a6512d134c16b` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 13 | DefineShape3 | character-and-rope-illustration | `d37b520307a0bcde41c5b84140d94184f5007a0de4b5a402a8652819bacb2d25` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 14 | DefineShape3 | character-and-rope-illustration | `bb0d72cb8c4b3cc4a232f9b84da3b60ae4b39cdda95f3ef9bf31a858fb0531e3` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 15 | DefineShape | character-and-rope-illustration | `1da12ebee5560c5ae57bac0edd87b124dba5f29397c6bac4a4a25dc96fe9f33a` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 16 | DefineShape3 | character-and-rope-illustration | `1de6845cf1e7c80183f7a27693207616fe2daf6a436588f88f7752e496c95cad` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 17 | DefineShape | character-and-rope-illustration | `6cdd8768a5548e5bb84fdca05245d7d362190d04db01167b979f6f4809a53dc2` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 18 | DefineShape3 | character-and-rope-illustration | `f698bf41b058e05b197fc7463e0ee7d2c771f2509ae9a991ee3b0ccdebaf81aa` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 19 | DefineShape2 | character-and-rope-illustration | `8f4a8ca43b0cf949d0f280ed1d25a4c0ade8f107c3c9e8ffae91463edb17f33d` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 20 | DefineShape3 | character-and-rope-illustration | `0038d34291259c6ea719e3ae42a005af427cf84b8fc88f79be98ce88ccc5ded3` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 21 | DefineShape | character-and-rope-illustration | `5e51651e3789ba0a1396491ca50d37c21f3e65f2ea888a7ad610c96328c75ffb` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 22 | DefineShape3 | character-and-rope-illustration | `65a8886170582446b6bd8da4619d94f5efa48f87b0414656bc7ca0c46fe71e61` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 23 | DefineShape | character-and-rope-illustration | `16cb743dcb569769aa10d215071554288217aa2e1a9bf6e0a161c3553cd3c127` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 24 | DefineShape3 | character-and-rope-illustration | `5e87b214a3b69ed0e26dde6ef106730f7f7bc958e251fb139e59e471e2b4d8d0` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 25 | DefineShape2 | character-and-rope-illustration | `48d78673221fbdcf14cbab11e5f669a6903b55dd3fcdf1eae21819f5ad9af353` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 26 | DefineShape | character-and-rope-illustration | `85e91266bae8a1268520da779b99871ba27bf9d16a4cd5f129201f851fa9d2d0` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 27 | DefineShape | character-and-rope-illustration | `39aa82710598722b138508728dae2c43a252935a216f29ed0ec3f96b38b66318` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 28 | Tag46 | rope-motion-illustration | `1dd1fc7b024cb985b05e05daf1c4cbb74645c5c8bdf196219b75829f436dea9a` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 29 | DefineShape3 | character-and-rope-illustration | `25c83e4655bc8c37791e5b6bb7ea55b0a37d3cecf0650e54e88b470e396385f1` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 30 | Tag46 | rope-motion-illustration | `e043493b82f8c78d9726cb98ec7b6b15ef0617c6152311035d33c7ce436b10aa` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 31 | DefineShape3 | character-and-rope-illustration | `6567908170216745329ef73c11cd133ac480289a503c52aa12d979e922247982` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 32 | Tag46 | rope-motion-illustration | `d5f60719cb1d5ee43d41d7c6b896c9ff631c690e00deacdb924f6d6b357abf0b` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 33 | DefineShape3 | character-and-rope-illustration | `dfc9c093e6c0d6cf0c5fa5aecbff5e107187d43031254f61570189b728eafef8` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 34 | Tag46 | rope-motion-illustration | `c23cb593aaaaff5214ae96106977f39444fadeaaa7d64e5000706f87fc824d64` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 35 | DefineShape3 | character-and-rope-illustration | `892b7694bfc13a2dd76d5f090c7aae1f5277c840cbcdb8b65ee8509ac5cbe455` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 36 | DefineShape | character-and-rope-illustration | `5a80a14355a84af566c608f7907c39dd2844cfe7d0a0a571e7d028831ee1a9f0` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 37 | Tag46 | rope-motion-illustration | `9fe33825c513f631ca8539790781bd2bb5a2f42f2bf1ef5619ebe29c8ecd49a0` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 38 | DefineShape3 | character-and-rope-illustration | `80cd0cfdb2507a4725f5399aca7ceded85ec15ecb5efc5d8a9a30230b7e098c3` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 39 | DefineShape | character-and-rope-illustration | `434daf31cdcb98a4be83cce29227af06fa106fafa892275231e35e1df5af4c80` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 40 | Tag46 | rope-motion-illustration | `442134c768f7a1f2a05cd4ba7a5a3ed8086e9c4cab5b3d525f1e90d111f8e808` | Morphing bungee rope stroke; source endpoints and edge records contain no outlined words or mathematical labels. |
| 41 | DefineShape3 | character-and-rope-illustration | `9f6f0f9044255947ae1b1d4ac3d8a1f77db2caa227f0503122c62d680d127ce5` | Character pose/mouth or bungee rope artwork in the illustrated bridge activity; no teaching text. |
| 42 | DefineShape3 | question-background | `9060ab0868b4a2ca44d5e805be99b6bca29abd8816230ef628aa09e55173f7bc` | Yellow rounded question plate; no teaching text. |
| 43 | Tag46 | question-reveal-mask | `48e36fd14461c60e833db8a06db68706c1fa1e622bd1c59b9d5b1a7d3ad752b1` | Rectangular morph mask at sprite53 depth18 with clipDepth29; no teaching text. |
| 44 | DefineShape | glossary-word-underlines | `b67301df210b5e9ba802077935654f227285dde4570083f3bc6b71cc0df96cc2` | Four blue line segments styling glossary words; no glyphs or mathematical notation. |
| 47 | DefineShape | glossary-hit-region | `110a379d0432700569752110d4c769add6955abd6207b1a866a408ddbe722ca5` | Plain rectangle used only as hitTest artwork in buttons48..51, not visible up/over/down artwork. |
| 52 | DefineShape3 | question-reveal-mask | `b39c75619ee79a400412945c5bf87a2138cdaa0ec2275611e33f865a14e4289d` | Final rectangular question clip at frame338; no teaching text. |
| 55 | DefineShape | outlined-title | `c12e756f774672ff8ded0cc3916ee99587d3243c138ca83839b2f61a4e1a2dbf` | Visible outlined title: Graphing in the Coordinate Plane: Real World Activity. |
| 57 | DefineShape | scene-frame | `d9e7c2bd6ed1f97a3721d085e54edb2350fc82c2693323ae3360cb216e212d73` | Outer blue rectangular border; no teaching text. |

Bitmap2 is the bridge/canyon photograph supplying shape3's bitmap fill. It provides real-world scene context, with no instructional captions, axis labels, numerical teaching labels, or equations. Small roadway signage is incidental photographic context, not identified teaching text. Bitmap definition type is DefineBitsJPEG3; source-tag SHA-256 `5e6e506638235ccae3ddf4647f08021a9e16464d99eeb6fb650e1ad90dd9aae2`. Its full 1776×1748 export was inspected; rendered file SHA appears below. Keep this source illustration. Do not remove it or claim mathematics-text migration from its classification.

## Parser risk dispositions and boundary

| Parser risk | This audit resolves | Still required elsewhere |
| --- | --- | --- |
| shape-text-unclassified | Complete 47 definition role inventory, exact outlined-title55 wording/hash/instance, underline44role | Native implementation binding, exact suppression, responsive/readable layout, renderer verification |
| bitmap-text-unclassified | Bitmap2 and dependent shape3 are photographic illustration with no identified teaching captions | Maintain source imagery and verify actual host rendering |
| button-runtime-state-and-actions-not-interpreted | Four hit-only source records and exact release actions/KeyAttribute values reviewed | Local host behavior, keyboard, focus, glossary lifecycle, return/Replay and Source timing checks |
| actionscript-visibility-and-values-not-interpreted | Rootframe6placement and nested342frame teaching timeline distinguished; no dynamic text definition was found; body/title static semantics identified | Maintained source entry/playback/terminal/replay policy and actual runtime verification |
| mask-filter-blend-semantics-unresolved | Exact question43/52clip rectangle source geometry, ratio schedule, word thresholds; outer shape1mask identified | Full renderer mask/color/compositing verification and independent original-runtime/fidelity acceptance |

The report does not erase the parser risk list or write a technical-risk pass record. The final binding/check must tie this evidence to the actual native layer and exact renderer generation, test the treated behavior on the modern My Lesson host, and keep independent acceptance gates false until their own evidence exists. EN text is source-bound; Spanish UI does not establish a translated source question/title. A source-fallback ES presentation needs an explicit language policy.

## Retained evidence

| File | Bytes | SHA-256 |
| --- | --- | --- |
| `output/p006-typography-source/source-catalog.json` | 677056 | `ada381da7aaf3d8326fc6f3986c6464d1ca50d86d1d32bf8b968243246e3bc63` |
| `output/p006-typography-source/question-reveal.json` | 112843 | `ae8a7b5bcb7eb73e7aabd8fe383575940d94095754aa41895356560856c024bd` |
| `output/p006-typography-source/derive-question-reveal.py` | 10580 | `f6b46b877a07a1d0af68b353ec1eaeb93b8ccb9806e1ead89defc5a66f118d7e` |
| `output/p006-typography-source/shape-contact-sheet.png` | 113591 | `d040d6d4533560439668698f1ab3f40f7e7aaec8ba967f167c33f212667afb28` |
| `output/p006-typography-source/morph-contact-sheet.png` | 23733 | `a8db714b4d8d5c35154a9e06858ec352578022658264db2cea78874ded301176` |
| `output/p006-typography-source/ffdec-final-shapes/55.png` | 12485 | `2de863f6d44acc2c76bda6bc8d28381a40545af526238f0a39f801e89fc965a7` |
| `output/p006-typography-source/title55-upscaled.png` | 14366 | `e53aa4c62a0d1662a2cd8c53bcf6ea7776837fbc11137f8b4834be6b6b8c5840` |
| `output/p006-typography-source/ffdec-26.2.1/images/2.png` | 7074174 | `d9d139d8e45c5f209ad3ccf4aa09299fab9671167fff4fdf76012085b5cae90a` |
| `output/p006-typography-source/ffdec-svg/shapes/44.svg` | 601 | `6cf2e1790a15fba9e28ec7ac5045fa69e54414e1edbc0fafd614236019f862ec` |

| `output/p006-typography-source/question-reveal-contact-sheet.png` | 96985 | `79ecfddcc9e5632c2603c325eadeb5a657d1d6e6bf494222cfe62f0f50c34b23` |

| `output/p006-typography-source/question-container-disposition.json` | 9196 | `89697532a2412892bd1ce1b8c541eafe70c1826367a42bcdf6df8e44fc318299` |

FFDec commands were run against the exact physical source and wrote only the temporary typography evidence folder. The initial all-shape PNG command stopped on shape44 because its zero-height bounds produce FFDec`Width(359),height(0)`; all 40 SVGs subsequently exported successfully, and the four remaining nonzero static shapes 47/52/55/57 were exported by exact character selection. All 7 morph start/end exports succeeded. The failure was retained as an extraction limitation, not treated as source absence or suppressed by weakening the extractor.

Only this new report and temporary`output/p006-typography-source/`evidence were written by the typography source-audit subtask. No source archive, registry, renderer, route, host, glossary, audio policy, provider state, or deployment was changed by it.
