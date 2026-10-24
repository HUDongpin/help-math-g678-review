# P052 local My Lesson browser QA — 2026-09-24

Scope: the private, loopback-only `shared-nms002-l02-p052` candidate in the
modern My Lesson host. Source identity remains `L2TI11.swf`, SHA-256
`5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638`.
The real AWS source directory, not its compatibility symlink, was used.

## Reproduced product path

- English route returned HTTP 200 and rendered Question 10. The interactive
  slider reached 100%; submitting it showed `Try Again.`. Setting it to 75%
  displayed `75% shaded: 75 of 100 squares.` and submitting showed the correct
  75-of-100 feedback. The feedback dialog intercepted background controls,
  as a modal should.
- After closing the dialog, Replay returned the visible interaction to 0% on
  the ordinary-motion path. The Spanish language link reached the corresponding
  `es` route with Spanish instructional text and a `Porcentaje coloreado`
  slider. At 390px and 320px viewport widths, document scroll width equalled
  viewport width.
- `apps/web/e2e/g678-p052-local-candidate.spec.ts` reproduces the above path
  with the package-local Playwright toolchain. After the Replay correction,
  its ordinary-motion and reduced-motion cases both passed (2/2 in 52.9s),
  using an isolated local Next server on port 3335 and the exact private
  candidate flags. The tests skip ordinary site runs where that flag is absent.

## Findings and acceptance boundary

- On the Spanish route, the host H1 still reads `Question 10`, and the lesson
  directory includes an English `Introduction` label. The P052 inner renderer
  reads `Pregunta 10`; therefore the remaining English is in host/catalog
  presentation, not the inner question copy. Bilingual host review remains open.
- The site Playwright default is `prefers-reduced-motion: reduce`. In the
  predecessor candidate, Replay paused the P052 runtime at frame 1 while the
  host toolbar still said `Pause animation`; another observation replayed the
  intro despite the reduced-motion notice. The host resets its own pause state
  during Replay, after P052's first callback. P052 candidate freeze v4
  (`2a13460da78a6052db9d4710f474aca35255c7cdcbe6e3522f19994d9da7f676`)
  republishes the final runtime pause state after that handoff. In a fresh
  reduced-motion browser run, Replay then held frame 1, showed `Play animation`
  and stopped narration; Play resumed the timeline. The new regression case
  passed. This is local product-state evidence, not original-runtime parity.
- A fresh local Production build finished with exit code 0 after this v4
  activation. Its project asset-policy tests passed 11/11; the build compiled,
  typechecked, and generated 214 static pages. The isolation check found zero
  P052 private-marker hits in 703 static JavaScript files and restored the
  diagnostic build pointer. The receipt is under
  `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p052-production-build-0gs5rL/receipt.json`,
  SHA-256 `6993a17fbd8773fafeeae11b9b92e9000c72bb7e213e709cc8a72ddac497548e`.
  This is a local bundle scan, not provider deployment or every negative-route
  test.
- HTTP 200, a passing browser interaction, and the UI's per-page progress text
  are **not** original-Flash runtime parity, visual fidelity, audio listening
  acceptance, human/Owner approval, strict completion, release, or publication.
  Audio was not judged by listening in this QA pass.
