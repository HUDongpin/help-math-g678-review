# P006 host policy correction — 2026-09-26

Status: unregistered engineering work. Supersedes the three code defects listed in PRIVATE_HOST_INTEGRATION_2026-09-26.md only to the extent verified below. Browser acceptance is separate.

## Changes

- Transport readiness now latches across Canvas updating/ready repaint cycles, retaining elapsed-time accumulation. Initial loading and actual error still prevent playback.
- Reduced motion prevents automatic startup and pauses when the preference changes to reduce. Explicit user Play and Replay are permitted, so host and local transport no longer intentionally disagree.
- P006 opts into a private glossary-close policy. The new v4 generated host consumes that policy in the synchronous host transition. The DOM observer now only clears the pending UI state and restores focus; it no longer races host playback state.
- Source button release sets KeyAttribute, calls DoHyperLinks and stops the source animation. Staying paused after modal close is explicitly a modern candidate policy, not proven original-host parity.

## Isolation and failed attempt

The initial agent implementation changed shared glossary helpers. Although the default logic was unchanged, predecessor hash validation correctly rejected that drift (ALG_L12_P001_INVALID: 379-page predecessor). Shared helper, adapter type and original tests were restored. No predecessor pins were refreshed.

The final implementation uses apps/web/lib/g678-private-glossary-pause-v1.ts and a reproducibly generated v4 host, consumed only by P006. Existing v3 generator/output/manifest remain unchanged. The rejected v4 candidate and manifest are preserved under evidence/rejected-shared-policy-v4/. No generated file was hand-edited.

## Verified checks

- P006 module, visual clock, source-derived hit geometry, glossary state and host policy: 20/20 passed.
- Original glossary transition, private successor transition, P006 source asset and probe descriptor: 14/14 passed. This includes the real inherited 52-page descriptor after restoring shared files.
- v3 and v4 generator --check passed. v4 output SHA-256 98f6bc63ba01cd402484099861c5ab0122c6a4ff0171c6d89ba314fe12434544.
- ESLint passed for P006 host, new private helper and tests. Scoped host-policy TypeScript passed.
- Standard renderer frame-domain --check was attempted and correctly stopped at prototype runtime is missing because P006 is unregistered. No registration was added to bypass this; pure module domain tests are narrower evidence.

## Still unproven

Actual browser behavior, exact original-runtime traces, full visual comparison, audio timing/listening, Spanish source drawing, human/Owner acceptance and strict completion remain separate. No production release, provider change or registry change occurred.

## Browser pass and resulting layout correction

After the policy build passed fully (including 250 static pages), the real local My Lesson route was opened in Chromium through Playwright CLI, at 1440x1000 with reduced motion enabled. Initial frame 1 was ready and paused. Explicit Play advanced to frame 25 after about 2 seconds; Pause stopped playback. Keyboard frame inspection reached 332. Continue followed by Inequality opened the exact definition. Close held frame 332 for a further second, remained paused and restored focus to Inequality. Explicit Play then reached terminal frame 342 and paused. These are candidate-host observations, not original Flash evidence.

The first screenshot, output/playwright/p006-host-policy-20260926-v1/en-frame332.png, was visually inspected and revealed clipped below-drawing controls. Browser focus also produced an aria-hidden warning while the trigger was inside the clipped stage. Zero console errors were recorded in that pass. Do not label that screenshot a layout pass.

The follow-up correction opts only P006 into the existing pageInteractionCompanionTargetIdSuffix contract and portals its glossary controls/disclosure to the host's below-stage companion. The original drawing remains 800x600. In-stage duplicate engineering text is suppressed; page and companion disclosures remain. Shared CSS and frozen base host are not changed. The descriptor test now checks this exact P006-only target.

## Final bounded verification

- Layout successor full production build passed, including TypeScript and all 250 static pages. P006 descriptor tests 4/4, affected module/policy tests 5/5 and host ESLint were rerun successfully.
- Browser: Chromium 153.0.8010.54, Playwright CLI session p006-fix-20260926, loopback development port 43217. EN desktop 1440x1000 and EN/ES narrow 320x900 were inspected. This is a bounded layout/interaction sample, not a complete responsive matrix or native fidelity capture.
- After the portal fix, EN Coordinate, Graph, Equation and Inequality each opened the matching heading, closed at frame 332 and restored the exact initiating button focus. All four controls were outside lesson-shell2__stage.
- ES Coordenada, Gráfico, Ecuación and Desigualdad each opened the matching heading, closed at frame 342 and restored the exact initiating button focus. Drawing remained explicitly English-source fallback.
- Both 320px pages measured document scrollWidth=320 with viewport width=320. EN glossary buttons measured 44px high. All four screenshots were visually inspected.
- Spanish Replay activated by Space reset to frame 1 and advanced to frame 8 approximately 500ms later, with local paused=false, despite reduced-motion preference. This is explicit user playback; automatic startup remained paused.
- Zero browser console errors. Three retained aria-hidden focus warnings remain: the first before the portal correction and two after it (EN/ES companion). This accessibility defect is NOT resolved by moving the buttons and blocks claiming complete modal accessibility. Inspect focus transfer before hiding the background; do not weaken accessibility checks or casually modify frozen shared code.
- Production EN/ES route and exact-hash asset denial were retested after the policy build (all 404); final layout successor build passed but its live production HTTP denial was not separately rerun. No provider or publication action occurred.

Screenshot SHA-256 values (under output/playwright/p006-host-policy-20260926-v1):

- en-frame332.png: a280a57972c49326d836b100069f3f1479f31f0acf114ad5f6dcda37324cd083 (preserved clipped-control failure).
- en-portal-frame332.png: 311f86d445873ee966efaed75b1bf9915ddb844901d1d10c647d4d8c99af0620.
- en-mobile320.png: ceef5fd512a32b42b97d9d1c00f95f71e897565e71ecf8bd86e753872a510d09.
- es-mobile320-frame342.png: cd9183def148ff083dc04524df00ce92ea4ecea5f10f29723b8e42569066f51f.

Next: resolve the recorded modal accessibility warning; verify keyboard Enter, navigation cleanup, tablet/native layout, terminal Play behavior, and a clean-session reduced-motion/playback/glossary run. Audio, original runtime and downstream acceptance remain open. Registry and frozen shared base hashes remain identical to the preceding handoff, so official coverage remains 480/2,282, not 481.
