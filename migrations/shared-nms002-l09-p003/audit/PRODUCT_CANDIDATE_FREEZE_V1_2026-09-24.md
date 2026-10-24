# P003 product-candidate freeze v1 — 2026-09-24

Status: **prepared local engineering candidate only**. It is not installed in
the private Current-JS registry, a source-ordered My Lesson descriptor, or a
learner route. No original-runtime, fidelity, audio-listening, human, Owner,
strict-completion, release, or publication decision is implied.

The source is the real AWS directory's
`G6-G8-shared/NMS002/L9/RW/L9RW03.swf` (473,410 bytes,
SHA-256 `d6841b40ee8da4857ba9075944c2393ee214e056373fe10abd2f0c2b2a375ebd`).
The 53-page Lesson 9 source XML is 13,941 bytes, SHA-256
`29e77c35dfa9d8942bf453f377743c7548d15015d9e1d9333353366b6516c200`;
the canonical catalog puts P003 at global ordinal 3, RW ordinal 2.

The maintained module is
`packages/demos/src/modules/g678-nms-l09-native-candidate-p003.tsx` and its
registry-shaped timeline entrypoint is
`packages/demos/src/timelines/g678-nms-l09-p003.ts`. The module maps the
635-frame `sprite-246` clock under root frame 6, keeps source audio disabled,
and declares the English-source text binding to the existing G6–G8 host
contract. Spanish UI language retains English source visuals and requires an
explicit fallback notice; it is not a translation.

`scripts/freeze-g678-nms-l09-p003-product-candidate-v1.mjs` generated, by
exclusive creation, a 20-input/5-output local closure:

- Freeze: `catalog/product-bridge-calibrations/g678-nms-l09-p003-product-candidate-v1.json`,
  9,945 bytes, SHA-256 `6e2d591e17f6dd086eefad8fb195bf329a37dced103871cfc30df8665677b821`.
- Run manifest: `work/g678-shared-page-factory/g678-nms-l09-p003-product-candidate-v1/run-manifest.json`,
  5,318 bytes, SHA-256 `17dcd51269973e8ed4e504e70169484fcbc4988fa8a885ad0e0adae5bff39dce`.
- Member manifest: `work/g678-shared-page-factory/g678-nms-l09-p003-product-candidate-v1/members/shared-nms002-l09-p003/member-manifest.json`,
  5,579 bytes, SHA-256 `e3c3fb7c0ac3b35794e897d4c445ee1d0bbd7735e36b59488f34eeb4658ff4cb`.

Repeatable read-only verification:

```bash
HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware' \
  node scripts/freeze-g678-nms-l09-p003-product-candidate-v1.mjs --check
```

The check passed, rerunning the existing drawing/toolchain closure and 19
focused module/clock/text/bridge tests. An isolated strict TypeScript check
of the new module, timeline and test passed. A second generation without
`--check` failed before writing, and the freeze hash remained unchanged.
Registry generation `--check` and draft migration validation passed; P003
remains absent from the registry. The broader demos TypeScript check still
reports the six pre-existing P044/P046/P054 dirty-test errors; it is not green.
An in-memory call to the maintained private-registry upsert validator accepts
this packet's entry and would produce 472 distinct shared keys, but no registry
file was written. This proves only the proposal's structural shape, not module
loading or product admission.

Next admission work is an independently reviewed registry fragment and exact
source-ordered NMS002 Lesson 9 descriptor, followed by the actual local My
Lesson EN/ES, Replay/visibility, 320–1920px and 100%/200% browser checks and
a production-negative check. The current static diagnostic route may be
replaced in place, as the registered P027 route demonstrates. The prepared
freeze alone does not authorize that replacement or increase 471/2,282.
