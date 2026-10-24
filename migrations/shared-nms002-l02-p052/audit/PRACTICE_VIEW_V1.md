# P052 controlled practice view — 2026-09-23

New maintained component `packages/demos/src/nms-l02-p052-practice-view-v1.tsx`
renders the existing reducer/copy projection without owning teaching state,
timers, random selection or audio. CSS is in the matching `.css`; the future
page entry must import it and supply the shared lesson fonts. It is not yet a
registered page or standalone route.

The figure has100 source-row-major SVG cells, exact0–100shading and a semantic
summary. HTML output preserves three digits; native range input supports the
standard keyboard/touch contract. Done/Reset/help send current-epoch reducer
events. Feedback is explicit-close; correct and revealed outcomes use the same
source answer statement rather than false first-try praise. Help retains its
separate35%example, column-count explanation and source Square/Column glossary.

Native dialog effects call showModal, focus the title and restore connected
trigger focus on cleanup. Help and nested glossary remain separate owners.
Escape cancellation is prevented and routed to the reducer; paused dialogs
offer a native Resume/Continuar action because the reducer intentionally ignores
close events while paused. These browser behaviors are implemented but not yet
browser-tested. The root remains host-owned; no new My Lesson callback is assumed.

Capture/static rendering uses `interactive=false`, open attributes and disabled
controls. The component rejects intro state so it cannot silently replace the
authored intro. It may display retained answer graphics during outro, but the
actual source outro wrapper/timing and complete capture identity remain pending.

Verification:5new React static-markup tests PASS; all101percentage figures,
EN/ES range semantics, wrong/correct/revealed text, nested glossary35%example,
paused-resume text and intro rejection. Targeted strictTS PASS. Combined P052
state/copy/intro/capture/feedback/view/audio/coverage tests58/58PASS.

No browser visual QA, production build, actual event dispatch/focus verification,
responsive/200%zoom matrix, shared lesson-text binding/check record, real audio
lifecycle, page route or registry admission yet. Rendering HTML in tests does
not prove keyboard/touch accessibility. Originalruntime/fidelity/listening,
human/Owner/strict/publication gates unchanged.

Next: connect source intro/outro graphics and real controller, import styles,
add the source-bound lesson-text presentation/binding and actual local preview;
then build and inspect browser state/interaction before admission. Preserve
previous source/audio/capture plans; no need to re-extract completed inputs.
