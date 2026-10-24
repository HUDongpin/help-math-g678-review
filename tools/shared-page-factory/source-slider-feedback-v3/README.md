# Source integer slider and feedback, v3

Actual consumers: ALG001 L7 P017 and P018. Both extracted sources use drag bounds -70..130, `Math.round(x/10-3)`, integer read-only output and no later ActionScript input assignment. This version shares only those substitutions over immutable v1 state/session/player templates. The generator first checks all existing P011/P012/P014/P015/P017 outputs and compares P017 bytes unchanged.

Profiles retain source SHA/model hash, initial and correct values, main/popup domains, and Draw lifetime. P018 retains input through124 but Draw through361; its popup assigns text at2 and stops15. P017 retains Draw only through140 and popup stops8. Visuals, source geometry, annotation, tint and morph timing stay page-owned. Run `node tools/shared-page-factory/source-slider-feedback-v3/generate.mjs --check`. This mechanism does not claim original-runtime or audio acceptance.
