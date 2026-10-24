# P003 source specification

Active global placement 3, RW page 2, ALG001 L12, catalog title Page 2. Source and asset SHA: 384f7e8e269768063d8e6ca410350ccbd5c321596fd6f55d68903cc1b6d2bccb. Physical AWS source recorded in migration.json is rehashed; same-path FLA missing. Canonical catalog path is not the physical extraction root.

CWS v6 AVM1, 800x600 at 12fps, background #b8d8f7. Root 10 frames: preloader jump_check then Stop at frame 1, begin label and Stop at 6. Root frame 6 places character 2 at depth 1 (120.35,-138), main 164 at depth 2 (209.45,283.5), title 166 at depth 146 (400,43.45), border 167 at depth 148 identity. Do not omit character 2 based only on its off-stage translation.

Main 164 has 1008 frames (84 seconds nominal), 1008 stream blocks, terminal Stop at 1008. Nested sprite 22 is one frame, placed at main frame 124 depth 8 with source skew/scale. Title 166 is one frame. Four domains must stay distinct. Full placements/matrices and scripts are retained in source-structure.json and swfmill.xml. Fonts: Bauhaus Md BT regular/bold and Arial bold. Morphs: 146,153,158,163. Inventory has 170 Define tags, not necessarily 170 unique characters.

Six on(release) handlers set exact KeyAttribute, call _root.DoHyperLinks(), then stop animation. Inclusive display-list presence unions: Graph150/depth48 and Relation151/depth50 at825-1008; Function156/depth56 and Equation157/depth58 at860-1008; Linear equation161/depth64 and Linear function162/depth66 at908-1008. Same-character replacements at844,907,985,1002 retain continuous presence but may alter transforms. Retention is not hit-test/occlusion proof. Original host close/resume and Replay remain unresolved.

Lane: compiler-assisted Canvas extraction/composition plus maintained page-local state and accessible host companion controls. Provisionally behavior-heavy due to host/audio semantics. Preserve all root layers and nested transforms. Video cannot satisfy six interactions or queryable domains. Do not reuse P004 visibility windows or expand this into bulk generation.

Audio: source MP3 stream declares mono22050Hz, begins child frame1. Container hash is not a decoded payload hash. Audible timing, language, duration, host-SA association and listening remain unresolved; candidate stays silent. English source drawing does not establish Spanish mathematical visuals.

All original-runtime, full-frame comparison, audio, accessibility, human/Owner, strict completion and publication gates pending. Required frame checkpoints: root1/6/10; main1/123/124/824/825/843/844/859/860/906/907/908/984/985/1001/1002/1008; nested/title1. Interactive natural trace schedules require original-host evidence; do not invent them.

FFDec26.2.1 generated movie.xml and source-scripts; swfmill0.3.6 generated swfmill.xml. Deterministic build-source-structure.py --check validates source/XML and generated inventories. No legacy endpoint was called, source altered, renderer registered, or review signature created.
