# Source-local slider feedback: no-assignment successor

P014 is the third independently audited consumer of the existing P011/P012 local slider, every-submit counter and immediate feedback Close behavior. The v1 templates and profiles remain frozen and are reused directly with exact hashes. P011/P012 generated state, session and player must reproduce byte-for-byte.

The only new state-generation variation is the source-proven absence of a post-quiz slope assignment in P014. Its named slope text survives84..86, then source field66 supplies an unnamed prefilled en-dash –1 at87. The internal student slope stays unchanged; page-specific display state selects the new source field. V2 substitutes this one expression in the existing state template. It does not copy the templates or change prior consumer provenance. P014 retains the persistent Draw behavior after second-wrong Close, while the removed popup and drag handler cannot be resurrected.

Run `node tools/shared-page-factory/source-slider-feedback-v2/generate.mjs --check`. Without --check only missing outputs may be created; existing files are always compared. No original-runtime, fidelity, listening, human, Owner, strict or publication acceptance is established.
