# shared-nms002-l02-p043 Migration Brief

## Objective and identity

Migrate the four-term matching activity in NMS002 Lesson 2, Try It, page placement P043 into the retained modern My Lesson host. Learners match fraction, equivalent, decimal and percent to four definitions and mathematical pictures. English and Spanish interfaces are required.

The immutable asset is `swf-a6a13838f1301d7665dd4f8a96c561fd3ef23e90ffeaf6e433909d26cc419528`. The shipped SWF is preserved at the exact external path in migration.json; no paired FLA is available. Source catalogs and extraction records live under audit/ and remain structural evidence.

## Runtime and behavior

The source is SWF version 6, AS2, 800 x 600, 12 fps. Root has 10 frames; root frame 6 enters main sprite-250, which has 225 frames and holds at 223 for matching. Correct pairs are fraction/row2, equivalent/row4, decimal/row1, percent/row3. Wrong drops restore the term and open feedback until Close. Correct drops remove the term and run sprite-249 feedback; four accepted pairs request final feedback before main frame 225.

The maintained matching machine, clock and PCM transport keep answer state, media duration, pause and Replay separate. Five seeded completion identities are a modern host adapter; original showRightFeed selection remains unverified. All five contain authored praise text: sprite-232 also places characters 140/141 at frame 9, correcting the earlier no-text interpretation. See source-text-binding-decisions-v1.json.

## Implementation lane

Behavior-heavy, advanced-manual within the compiler-assisted hybrid workflow, per behavior-intake-v1.json. React and editable SVG retain semantic matching, keyboard selection, diagrams, glossary links and responsive text. A passive video cannot satisfy these interactions. Pure frame queries expose separate root, main and feedback domains. Post-stop local inspection never invents completed answers. Native static celebrations are documented visual adaptations, not source-pixel fidelity.

The copy module supplies both the presentation and text snapshots. Core and diagram bindings reference exact source text IDs; mathematical fractions reconstruct the source numerator/denominator layout. Supplemental glossary definitions come from the recovered technical index and do not prove original host lookup. Overlay snapshots require explicit picture or glossary state.

## Evidence and remaining work

Source structure, scripts, text, visual-role, picture-state, glossary, audio stream and PCM audits are retained under audit/. Focused matching, clock, transport, diagram, completion, frame and text tests exist under packages/demos/tests/. Previous browser evidence covers the standalone candidate only; the latest text/feedback changes still require browser verification.

This is an unregistered engineering candidate. Finish complete frame-domain disposition, asset/audio/keyframe inventories, source-ordered module/descriptor registration, modern My Lesson host integration, production isolation/build checks and real browser QA before counting this page. Original-runtime evidence, full-frame fidelity comparison, audio listening acceptance, named human review, Owner acceptance, strict completion and publication remain separately pending. No provider or publication action is performed by this work.
