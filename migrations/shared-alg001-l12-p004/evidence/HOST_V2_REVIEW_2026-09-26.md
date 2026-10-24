# P004 v2 local Current-JS host review

Supersedes the pending-integration instructions in INTEGRATION_CONTINUATION_2026-09-26.md, not its historical evidence. Overall G6-G8 goal remains active.

## Candidate binding

- Runtime SHA-256: `d4cd5a861761c4548793b8f94468b5284d5a1c98a68bc99ff5267344df124d13` (18,639,014 bytes; unchanged from drawing sweep).
- Module SHA-256: `95f01900875a67523a8eb5853fbe1b15c3a07e7ecea3a98e5f6ce12b3612f8fd`.
- Freeze: `catalog/product-bridge-calibrations/g678-alg-l12-p004-current-js-v2.json`, 5,781 bytes, SHA-256 `15f007eea3e5d19c34f8b3ef82cb67308746333da61b1a0314d246c52b3219df`.
- Logical calibration ID remains `g678-alg-l12-p004-current-js-v1`; v2 is the corrected freeze revision, not a second registered placement. Maintained registry upsert and generator were used.
- Full web production build passed, including TypeScript and 244 static pages. BUILD_ID: `xeJ848lVg1t5z5G8WFrX5`.

## Correction and browser verification

The initial module placed controls/disclosures inside the fixed animation stage and clipped the top of the canvas. Failure screenshot `output/playwright/g678-p004-host-20260926/en-terminal.png` is preserved. The corrected module portals controls into the existing host companion surface; the shared host was not modified.

Real Chrome via Playwright CLI, loopback development port 3134:

- All five glossary buttons open the matching English and Spanish dialog; close restores focus to the matching enabled trigger. Spanish source drawing and trigger terms remain English, explicitly disclosed.
- Paused close remains paused. Playing request holds the source frame during the dialog and resumes after close.
- Mouse, Enter and Space Replay each reset the current drawing to frame 1.
- Frame inspection to 969 followed by Function and Graph reopening passes, retaining 969. This is inspected-terminal evidence, not an original Flash natural trace. Earlier v1 natural current-JS terminal evidence remains distinct.
- Previous selects P003; Next returns P004.
- Canvas clipping-ancestor geometry passes; companion is outside the canvas stage. Widths 390 and 320 have document widths 390 and 320 (no horizontal page overflow).
- Main visually inspected `en-v2-desktop.png`, `es-v2-1280.png`, `es-v2-390.png`, `es-v2-320.png` in the same output directory. Source canvas is uncropped. At 320px the inherited Spanish frame-inspection button text crowds/overlaps its controls. This remains a responsive UI defect; no blanket responsive or typography acceptance is claimed. Source text is small on narrow screens.
- Latest English console query: zero errors/warnings among six messages. Earlier HMR transition had two CSS preload warnings; retained historical console evidence is not silently discarded.

## Isolation and regression

- Production build served only on 127.0.0.1:3135, verified with lsof. Even with local-preview environment flags present, EN route, ES route and exact-hash runtime resource each returned 404 (9-byte body).
- Development asset checks: valid same-origin script request returns the exact 18,639,014-byte runtime, private/no-store and noindex headers. Missing/wrong hash, extra query, cross-site or non-script requests fail closed. An initial Node fetch probe missing Origin was corrected; it was a probe error, not a valid-request product failure.
- Focused module/helper tests 10/10 and corrected P004 server tests 3/3 passed before the complete build. Earlier P004/P002 regression 6/6 and registry tests 4/4 passed; final independent count/check is recorded below when available.

## Acceptance boundary / next work

Independent read-only agent Schrodinger (`01a0dd38-cbff-7630-9376-1595ce9d533d`, GPT-6 Sol xhigh) verified the active catalog/registry intersection: **479/2,282 = 20.990359%**, 1,803 remaining. All active catalog IDs are unique. The private registry has 621 entries, 142 outside this denominator. The v2 upsert `--check`, maintained `check:registry`, and P004/P002 server regression (6/6) passed. Registry SHA-256 is `55f3a57831d1b91c105ff5a927511aff83b37c9914b9533c4c336e5b58f94d07`. Shared host remains SHA-256 `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`. No agent edits were made.

This is a private, source-bound Current-JS integration, not full migration acceptance. The successor lesson has 18/52 registered pages and 31 glossary entries. Original runtime/ActionScript parity, title/root domain acceptance, audio timing and listening, Spanish mathematical visuals, typography, human/Owner sign-off, strict completion and publication remain unaccepted. Audio stays disabled. No provider, deployment, credentials, commit or push was performed.

Continue from this v2 freeze, not the superseded v1 module hash. Preserve the frozen shared host and earlier failure evidence. The whole G6-G8 goal is unfinished; do not mark complete from this local admission.
