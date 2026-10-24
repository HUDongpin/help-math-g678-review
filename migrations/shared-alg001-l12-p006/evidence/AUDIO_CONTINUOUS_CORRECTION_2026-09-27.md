# P006 continuous MP3 schedule correction — 2026-09-27

Supersedes the two-run/gap scheduling decision in AUDIO_HOST_CANDIDATE_SPEC_2026-09-26.md and its dependent timing observations, not the preserved source bytes or earlier lifecycle evidence. Previous receipts are retained as historical results of that older candidate.

## Evidence that changes implementation

Adobe SWF File Format Specification v19, printed pages 185–186 (PDF pages 187–188), section MP3 frame subdivision:
https://open-flash.github.io/mirrors/swf-spec-19.pdf

The specification describes continuous playback as concatenated MP3 frames at their natural sample rate; per-block SeekSamples are for seeking. An empty count/seek/payload block is a packet-allocation case, not a silence command. This invalidates using P006's empty frame 4 to invent a separate audio gap. The document is a mirrored original Adobe specification, not original-runtime capture or page-specific listening evidence.

Rehashed source SWF remains `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6`; source receipt remains `c3f1c26102fb9b7e0cb41a60a0de764b8cc68da559a7d20be7ccb42f557f4f78`. The receipt binds first block frame 3, 3,456 samples, seek 1,673; frame 4 zero-count/seek/payload; frame 5 1,728 samples, seek 54; all 340 blocks and the complete 624,384-sample decode. Source sprite frame 342 ActionScript is `stop();`.

## Revised private candidate contract

- One continuous source span `[1673,624384)` starts at timeline sample 3,675, corresponding to visual frame 3. Initial latency is skipped once. No re-encoding, stretch, periodic correction or inserted frame-4 silence.
- Continuous sample at visual frame 4 is 3,510.5; at frame 5 it is 5,348. The raw block arithmetic coordinate for frame 5 remains 3,510, and is intentionally not substituted for continuous playback.
- Full decoded audio ends at timeline sample `3675 + 624384 - 1673 = 626386`.
- The last authored visual frame starts at `341 * 1837.5 = 626587.5`. The modern candidate clock therefore continues for a 201.5-sample postroll (about 9.14ms), without an audio source, to show frame 342 and end there.
- Seeking to frame 342 is already at the candidate terminal, so Play cannot schedule a fabricated tail. Replay starts a single run. Seeking/resuming inside a run uses its exact continuous offset; interruption and cancellation protections remain unchanged.
- The raw block-index module is explicitly documented as arithmetic, not a validated Flash seek algorithm. The earlier assertion that it already represented accepted seek semantics is withdrawn; no acceptance rests on it.

This removes a known unsupported gap; it does not establish original-player frame-dropping, latency/seek implementation, audio-end/visual-stop causality or original host behavior. The postroll and explicit modern inspector behavior are named candidate policies. No registration, Spanish narration claim, original-runtime authority, listening, human/Owner or strict/publication gate is granted.

## Verification

Main-agent checks for the changed candidate:

- Targeted TypeScript check of schedule and transport passed; host ESLint passed.
- Audio route/reader and inherited host descriptor: 8/8 passed.
- Production build with process-local 8GB Node heap passed (exec 90848): 11 asset checks, compilation, TypeScript, 250 static pages and traces. This does not retroactively pass the previous full demos typecheck that exhausted its default 4GB heap.
- Current production server on 43216 returned 404 for EN/ES P006 and exact-hash MP3. Production static chunk search found no new schedule marker or audio-context error marker. Server stopped.
- v5 generated private host check passed without regeneration. Frozen base host SHA remains `494cadc14b5b42dbde7e61733a8245dc05209b69d0a47db6dcec568a4eec4f78`; registry remains `b3fd1ae85d6f839d7eef1e922ae11a059432fffc6892e3016ab642f10e51d9d9`.

Playwright CLI session `p006-continuous`, EN, Chromium, reduced motion, dev43218:

- Complete Replay ended naturally at frame342/sample626587.5, one source start, zero live nodes. Scheduled source offset0.07587301587301587 seconds (=1673/22050), duration28.240861678004535 seconds (=622711/22050).
- Inspector frame4 then Continue scheduled source offset0.1592063492063492 seconds (=3510.5/22050), confirming no invented gap. Pause left sample10248.4999999995, zero live nodes. Inspector End then reported ended/frame342/sample626587.5 with no added start.
- Instrumentation recorded source start/stop/disconnect/ended; no scheduling substitution. An initial Mute click timed out after the popup disappeared during development refresh. The complete Replay was subsequently run at the displayed 80% setting, not muted; no human listening or audio-language acceptance is claimed. Console has development refresh history, not a claimed empty log.
- Browser and dev server closed. The earlier two-run browser results do not validate this new schedule; this bounded EN run does not repeat the previous ES/keyboard matrix for the new candidate.

Current implementation hashes: schedule `2ac06a5fde0873b2b4e3e22eab65457f5bdb0bf26f9defafb3aa8f2710596add`; raw index `51a76000fa1fb087fb8cbb9f180c6a7a790e6ece2fde76c44239ff5a23947ca9`; P006 host `21f6fc45121297fcfc280071bca0e4df6932e842b059f90427c280ee960cd6be`.

An intermediate suite run while the sidecar was updating the disjoint test files had 12 passes/13 failures from obsolete two-run transport expectations. Final test results follow after integration.

Final independent complete P006 audio suite: **25/25 passed**, no failed/skipped tests. Main also added a receipt-bound test deriving the single run's entry, latency, decoded end and visual terminal from the hash-bound 340-block source record. Revised schedule/transport tests retain asynchronous cancellation, suspension/restart, failures, postroll and close disposal checks. Main inspected the changed boundary tests and independently ran their targeted TypeScript check successfully.

## Next source-supported implementation

The parallel `SA_HOST_DISPOSITION_2026-09-27.md` resolves the separate MP3's intended role to an explicit Spanish Audio host operation, not automatic locale audio or a second stream segment. Main independently rehashed and inspected the key frame35 AS functions supporting URL construction, pause, load/start and terminal-guarded return. Actual deployment binding and listening remain unresolved. Implement the bounded optional Spanish-audio path next with explicit controls and stale-load cancellation; do not splice it into this corrected embedded stream or silently autoplay it on ES locale. Registry coverage remains480/2282; no external publication or credentials were used.
