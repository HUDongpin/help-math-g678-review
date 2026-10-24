# P052 bilingual exercise semantics — 2026-09-23

Candidate modules: `packages/demos/src/nms-l02-p052-copy-v1.ts` and generated
`nms-l02-p052-glossary-v1.ts`. No renderer or product registration is added.

The page copy binds title154, question158, prompt157/159, Done168, Reset170,
help4/5, Close312, retry321, answer330, example339 and help explanation340 to
the source text catalog. English text is retained exactly where not explicitly
adapted. The prompt now covers pointer/touch/keyboard rather than saying only
“mouse”; supplementary keyboard instructions are authored accessibility copy.
The target remains75 of100. The separate source help example remains35%, not75%.

The primary grid projection produces100 cells in source row-major order for
every integer percent0…100. Help explains column counting as an alternative;
it does not falsely describe the main grid as column-major. This added
clarification is a native adaptation and still requires visual/language review.
The semantic projection is for the exercise only; it must not replace authored
intro digits001→016→000 or source scene geometry.

## Recovered source glossary, not newly invented definitions

Square and Column are recovered from the existing preserved MI key-term XML
pair, with live hashes matching the P051 glossary lineage. The bounded legacy
record parser is reused because original ~LNG~ element names are not standard
XML names; source files are never repaired or rewritten.

`scripts/generate-nms-l02-p052-glossary-v1.mjs` pins both complete XMLs, exact
source entries, the P052 SWF and buttons342/343's exported scripts. It generates
only labels/definitions into product TypeScript; private paths and provenance
remain in `audit/source-glossary-v1.json`. There are two keys, four language
entries and two button bindings. Generation uses exclusive creation or exact
`--check`, never hand-edited generated output.

- Column: “The vertical section on a grid or graph.” Source Spanish is retained.
- Square: “A parallelogram with four equal sides and four right angles.” Source
  Spanish retains “paralelogramo”; it is not simplified to an authored paraphrase.

Original host lookup and associated glossary SWF/audio remain unverified. The
definition text recovery does not assert companion media or listening acceptance.

Page Spanish copy outside these two glossary entries is an authored translation,
not a recovered original Spanish page asset. Both languages require later human
review and rendered layout QA.

## Checks

The combined copy/state/audio-plan/audio-window suite passed34tests, including
202language/value projections,101initial answers,10100retry combinations,
source-bound glossary equality and all previous audio invariants. Targeted
strict TypeScript passed for state/copy and their two tests with ESNext/bundler,
explicit node types and skipLibCheck; this is not a whole-project typecheck.
Glossary `--check` rehashed originals and reproduced both generated outputs.

Pending before view/product admission: complete scene selection and deterministic
capture/domain/entry-state specification, actual HTML/SVG view, controller/audio
lifecycle, keyboard/touch/focus, modern My Lesson route/descriptor/registration,
production build and browser typography QA. The original-runtime/fidelity/audio/
human/Owner/strict/publication gates remain separate and pending.
