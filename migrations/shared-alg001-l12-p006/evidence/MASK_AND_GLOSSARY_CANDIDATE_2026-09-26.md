# P006 mask correction and glossary interaction candidate

## Outcome

Unregistered engineering progress only. The maintained mask builder creates
candidate-v2 without overwriting v1. A parallel agent added the glossary state
module and tests; main reviewed it, removed an unsupported restriction on opening
a glossary while the playhead is paused, and added source-derived clipped hit geometry.
No host route, registry, browser capture, audio playback or acceptance gate changed.

## Mask correction

Source XML SHA-256 `60c835b77135803e0699aa6580650413ec9591d14f17dbe70d01365cea28a77a`.
Source SWF SHA-256 `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`.
The XML-library audit confirms exclusive clipDepth uses of characters1,43,52:
depth1→62 and depth18→29. The two shape masks have alpha90/255 and51/255;
the morph mask's fill alpha is51/255 and its line has zero width/zero alpha.

Adobe's mask-layer documentation says mask geometry ignores transparency,
colors and line styles:
https://helpx.adobe.com/uk/animate/desktop/animation/using-mask-layers.html

The maintained builder therefore changes only these three mask functions to
opaque fill coverage and omits the morph mask's stroke. It preserves fill paths,
morph interpolation, placements and all other drawing code byte-for-byte.
This is a source/documentation-supported correction, not an original-runtime
pixel comparison or fidelity acceptance.

- v1 SHA-256: `95e0f487767fce6364c7e120b75caa81d541cfd96a0f09294be82a488bfc5df6`.
- v2 SHA-256: `b2fd1788ce5bab5efab167bf303608da66621ead66f6d276979fb09558b39ddc`.
- v2 size:11,507,597bytes. Browser validation remains false.

## Glossary state and hit geometry

`packages/demos/src/alg-l12-p006-glossary-state.ts` binds four exact source keys,
preserves source placement segments249–337 and338–342, and implements pure
advance/request/close/resume/Replay transitions. A request requires an explicit
eligible-hit input; display-list presence alone cannot open a term.
Closing stays paused until explicit resume; this is labeled a modern policy,
not original-host parity. A valid later release may reopen a term while paused,
because a stopped timeline does not remove the buttons. An open modal blocks
another request, and terminal342 remains stopped.

`scripts/build-g678-alg-l12-p006-hit-spec.py` pins XML and display IR, verifies
each source geometry is a closed axis-aligned four-edge rectangle, verifies the
button's identity hit-shape matrix, and intersects button shape47 against all
active clipDepth masks. Morph mask43 interpolates its actual source endpoint
rectangles using the authored ratio at each frame. Generated data is under
`packages/demos/src/generated/alg-l12-p006-hit-spec.ts`.

The candidate's first nonempty intersections are Coordinate286, Graph311,
Equation314 and Inequality332. No candidate hit is available249–285 despite
all buttons being structurally present. These are analytic candidate geometry
results, not observed Flash hit-test frames; integer rounding, edge/antialias
and original-host behavior remain unverified. Runtime hit testing deliberately
excludes exact boundaries. The future responsive host must transform pointer
coordinates to the native800×600 space.

## Executed validation and limits

- Mask correction tests:4pass, including exact non-mask preservation, opaque
  fill operations at four morph ratios, source-only mask uses and reproducible v2.
- Glossary state tests:4pass, including source bindings, boundaries, modal gating,
  explicit eligibility, terminal and Replay.
- Candidate hit tests:4pass, including all342frames, rectangle centers/edges,
  generated-spec reproducibility and caller mutation isolation.
- Scoped TypeScript check covers both maintained modules, their generated data
  and both test files. No broad demos typecheck is substituted for browser validation.

Initial mask test failure was a file-URL decoding bug in the test path; fixed
with fileURLToPath. Initial scoped tsc failure was an intentional-mutation test's
readonly cast; fixed using Reflect.set. Neither fix changed source geometry.

Reproduce from implementation worktree:

```sh
node --test scripts/build-g678-alg-l12-p006-mask-candidate.test.mjs
node --import tsx --test packages/demos/tests/alg-l12-p006-glossary-state.test.ts packages/demos/tests/alg-l12-p006-glossary-hit.test.ts
python3 scripts/build-g678-alg-l12-p006-hit-spec.py --check
```

Next: bind the corrected drawing and state/hit modules to a private P006 My Lesson
probe, validate native/responsive/keyboard behavior, and implement audio separately.
Current-JS membership remains480/2,282; strict acceptance is not inferred.
