# P064 content and audio continuation — 2026-09-24

Continue the full G6–G8 migration in
`/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`; preserve its dirty
state. P064 remains a preserved, unregistered behavior-heavy candidate, not a
Current-JS page or accepted lesson. The earlier `HANDOFF_2026-09-24.md` and
`SOURCE_QUIZ_V1.md` remain the prior boundary and detailed source audit.

New source-bound artifacts:

- `question-content-ir-v1.json`, SHA-256
  `ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350`:
  all 35 question frames, 140 option sprites, 35 review frames, raw FFDec text,
  swfmill symbol/depth/transform references, 12 move-only frame updates, and
  source answer keys.
- `audio-source-candidates-v1.json`, SHA-256
  `60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58`:
  175 EA and 175 SA source MP3s, each with exact path, size, and SHA-256.
  These are candidate files, not active or accepted cues.

The IR records two question instance-name anomalies (Q10 D has a trailing
space; Q23 C is `A231Opt3`) and one review-name anomaly (R21 C is
`R210Opt3`). The exact source ActionScript's name-based lookup statically
misses Q10 D, Q21 C, and Q23 C; original-runtime behavior has not been
observed. Do not silently normalize these names or record a fidelity pass.
Ten question frames have no direct unlabelled text placement, so continue
with their diagrams and candidate audio before writing semantic/accessible
copy. Do not infer missing prompts or audio behavior from the IR alone.

Verification in this continuation: both generators' `--check` pass, focused
P064 TypeScript tests 8/8 pass, strict targeted TypeScript check passes, and
each generator's exclusive `--build` refuses an existing output without
changing its SHA-256. Both reject the compatibility source path. The worktree
wide `verify:sources` symlink failure and prior incomplete broad checks are
unchanged; do not report them as green.

Next: source-bound diagram/option visual semantics, authorized original-host
natural traces (including the three review-name cases), EN/SP host media
selection and listening, privacy-reviewed modern report/progress adapter,
then a responsive accessible renderer and real My Lesson integration. Only
after source, typography, keyboard, audio, and host checks should P064 be
considered for a versioned freeze and exact Current-JS registry admission.
Strict fidelity, human/Owner, release, and publication remain separate.
