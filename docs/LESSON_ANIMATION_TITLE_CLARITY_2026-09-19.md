# Lesson animation title clarity — Owner requirement

On 2026-09-19 the Owner explicitly requested clarity improvements for the titles
inside every HELP Math lesson animation, including “Fractions, Decimals, and
Percents Concepts: Instruction”. This is part of the animation typography work,
not only the surrounding My Lesson page heading.

## Required student presentation

- Preserve the exact source title, including the course/topic and activity or
  section name. Preserve source order and punctuation when arranging lines.
- Render titles as native semantic HTML text, using the pinned self-hosted lesson
  fonts. Retained source vectors, thin outlined glyphs, bitmap titles and Canvas
  font exports are evidence, not a clarity improvement by themselves.
- Use solid, readable strokes, sufficient font size and strong contrast. Target
  a text/background contrast of at least 4.5:1 for this title treatment. Do not
  retain decorative pale outlines or shadows that make letter edges indistinct.
- Allow natural line wrapping without cropping, truncation, horizontal page
  overflow or reducing the user's chosen text scale. Verify 100% and 200% text
  sizes at the actual supported phone, tablet and desktop widths and DPRs.
- Retain a source-bound heading/title role decision for outlined source text.
  Native title text must be selectable/searchable and available to assistive
  technology in the source language. An English source title in Spanish UI is
  a disclosed fallback, not an invented translation.
- Check the actual My Lesson title at initial, teaching and terminal states;
  ensure font readiness, replay, navigation and layout changes preserve it.

## Coverage and evidence

This requirement applies to new migrations and existing HELP Math animation
pages. Existing pages need a separate title inspection/remediation backlog;
neither a native-body check nor a registry entry proves that their titles meet
this requirement. Keep G3–G5 and G6–G8 counts separate, and exclude the legacy
course-shell SWFs from migration denominators.

`LessonAnimationTitleV1` is the initial reusable native title treatment. New
page bindings must include the component, stylesheet, source-role evidence and
actual browser checks in their implementation inventory. Existing frozen pages
must be revised and reverified deliberately before adoption; never edit their
frozen outputs or rehash acceptance evidence merely to make a checker pass.

Title implementation, technical clarity checks, human visual review, Current-JS,
original runtime, fidelity, audio acceptance, Owner acceptance, strict completion
and publication remain separate gates. This requirement supplies no signature
or acceptance decision for an unreviewed page.
