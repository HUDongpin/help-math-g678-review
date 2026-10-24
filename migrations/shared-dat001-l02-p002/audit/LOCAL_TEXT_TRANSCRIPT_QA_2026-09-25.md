# DAT001 L2 P002 source-English transcript QA — 2026-09-25

Scope: unregistered, loopback-only audiovisual candidate for the exact
`shared-dat001-l02-p002` placement. The physical source SWF SHA-256 is
`b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`.

The candidate page loader re-hashes the five FFDec `DefineText` exports by
character ID (105, 108, 110, 112, 114) and rejects missing or changed bytes.
The viewer has an optional, collapsed-by-default English transcript under the
source SVG. The source title and assignment wording are preserved; each
source `•` prefix becomes an HTML list marker, and the source's trailing
assignment space is trimmed for display. No Spanish lesson text is invented.
The disclosure says explicitly that this is **not frame-synchronized**.

## Observed checks

- The source-loader test passed with the exact title, assignment, and three
  steps. The ten focused source-audio/SVG access, renderer, and visual-plan
  tests passed. Browser QA used the exact physical source root in webpack-mode
  loopback development.
- At 375px viewport width, both EN and ES pages exposed the expandable
  transcript with no document horizontal overflow. EN and ES browser
  snapshots contained the three semantic list items. The ES interface note
  said the extraction has no Spanish text layer, and the content remained
  source English. A final ES browser readback confirmed the SVG's Spanish
  accessible label, an English `lang` marker around the original transcript,
  and exactly three list items.
- Real Chromium full-page screenshots were visually inspected:
  `output/playwright/dat-l02-p002-en-transcript-375.png` SHA-256
  `a255e72cc8914a1bd79317781ee5fc393e07458dbaace48e8974b7f29efa38b9`;
  `output/playwright/dat-l02-p002-es-transcript-375-open.png` SHA-256
  `db0cae624a05b88c42cbfe540a987d9580e34f29b33bfd166648dee8aba4d840`.
  Initial dev navigations after a cold compile recorded one React pre-mount
  state-update error while Fast Refresh was active; subsequently opened fresh
  EN and ES tabs recorded zero console errors or warnings. This observation
  does not identify the initial error's root cause, which remains open.
- With an 8 GiB Node heap, `@helpmath/web` TypeScript checking passed; the
  optimized webpack production build passed compilation, TypeScript, all 232
  static pages, and 11 deployment-asset checks. In a local production server,
  the EN and ES P002 candidate pages, source SVG route, and source-WAV route
  each returned 404; `/en` returned 200. No P002 physical SWF SHA, cataloged
  lesson-SA SHA, or assignment text was found in `.next/static`.

## Remaining boundary

This transcript improves access to exact source wording, not the small SVG
lettering, source-frame reveal timing, original-host behavior, Spanish teaching
copy, audio synchronization/listening, My Lesson integration, registration,
fidelity, human/Owner acceptance, strict completion, or publication.
