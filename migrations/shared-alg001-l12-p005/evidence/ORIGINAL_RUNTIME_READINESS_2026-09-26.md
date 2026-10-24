# P005 original-runtime readiness audit — 2026-09-26

Status: execution not ready; no runtime launched and no baseline captured.
This is a read-only readiness finding, not an operator session or approval.
The complete G6–G8 goal remains active. P005 remains unregistered; existing
engineering audio schedule stays an explicitly inferred candidate.

## Current executable, freshly inspected

- Application: `/Applications/Adobe Animate 2021/Players/Flash Player.app`.
- Info.plist `CFBundleShortVersionString`: `32.0.0.414`.
- Executable: `Contents/MacOS/Flash Player`.
- SHA-256: `8f4e10c8c28698f3429a1489f9592f6ae5697fb6eb7d15c4cfe83e925b1ebc30`.
- Size: 23,199,312 bytes.

These values match the historical installed-candidate identity in the G4 L3
readiness report. That report is a different lesson's unapproved containment
plan and grants no authority for P005. Existence and a matching executable
hash do not prove runtime permission, correct source entry or containment.

## Independently rechecked source terminal facts

A GPT-6 Sol / xhigh agent audited the source actions; Main independently parsed
the FFDec XML with Python ElementTree and checked the exported script bytes.
Main391 has only an empty action at frame1 and `07 00` (Stop, End) at968.
Frame968's ordered tags are DoAction, SoundStreamBlock, ShowFrame. Its last
removal tags occur at733; there is no terminal removal. The exported scripts
contain no `stopAllSounds()` and the action audit found no StopSounds opcode.
Root frame1 invokes the external InternalPreloader then stops; root frame6
is labeled `begin` and stops after defining/placing the composition.

XML SHA-256: `944585dd7b3b53e2d65dc268fffcb1f5c81bde71de5f79c5d2c9c158a142f128`.
Terminal exported script SHA-256:
`3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655`.
These strengthen the static action description but do not resolve decoder
tail playback or host response. No new inferred audio timing constant is added.

## Missing P005-specific bindings

1. **Original host and entry path.** Source root frame1 refers to
   `_level0.InternalPreloader`; opening this child alone does not reproduce
   its original entry. The classified physical `G6-G8-shared/ALG001/L12/`
   source contains `index.xml` and page/media subdirectories, not a lesson
   host SWF. A bounded filename inventory under `HELP MATH Related Files`
   found no `.swf`/`.SWF` immediately at `ALG001/` or `ALG001/L12/` paths.
   This is not proof that a renamed host, ZIP member or remote original no
   longer exists. No archive was modified or expanded by this check.
2. **Source-specific minimal runtime tree and entry audit.** No P005
   hash-bound original-host tree, allowed-dependency manifest, source-derived
   host-entry operation sequence, or completed natural-trace record was found
   in its migration workspace. The instrumented derivative is not a substitute.
3. **Contained disposable execution environment.** No P005-bound approved and
   verified no-egress mechanism, disposable profile/SharedObject receipt,
   request-audit setup, or exact launch path is available in its workspace.
4. **Operator and execution approval.** No P005-bound named-human operator or
   owner runtime-execution approval is present. Do not synthesize either from
   the general migration goal or a previous JavaScript approval.

## Applicable protocol boundary

The canonical `flash-to-js/references/original-runtime-evidence.md` requires a
natural trace for nested/audio behavior and all eight containment controls
before runtime launch. `docs/PILOT_ACCEPTANCE_RUNBOOK.md` distinguishes an
empty Projector launch from a named operator's actual `File → Open File…`
opening of the exact staged source/host. Current-account safety rehearsal and
direct-seek/muted fixtures cannot establish natural audio behavior.

Accordingly no Projector launch, GUI automation, Terminal.app interaction,
network contact, profile creation, source staging, capture-kit fabrication,
signature or canonical evidence promotion was attempted. The other lesson's
launcher and containment receipt must not be borrowed for P005.

## Two questions a future valid session must resolve

- From actual original-host entry, how does the first stream group start
  across frames23/24/25? Capture continuous playback, not a direct seek or
  modified root action, because raw seek and candidate continuous positions
  differ by3,675 samples at frame25.
- At main frame968, does the source terminal action stop the embedded stream
  immediately, allow the decoder tail to finish, or hand control to the host?
  The last3,537 candidate-trimmed PCM samples are not all zero on FFmpeg8.1.2.
  A static Stop action alone does not establish the observed sound ending.

Before scheduling that session, recover/identify the original ALG001 L12 host
tree and audit its dependencies. Then bind the owner-approved containment
plan, a named human operator, exact staged hashes and operation sequence.
Do not ask the operator to run an unprepared or unconstrained legacy source.
The current candidate and its successful arithmetic tests remain available,
but no further generic decoder or Ruffle repeat can replace these bindings.
