# HELP Math G6–G8 execution review

This repository stores a reviewable snapshot of the G6–G8 execution tree captured on **24 October 2026**. It is a code and evidence review repository. It is not a production deployment or a new lesson acceptance record.

The import baseline is `0111cf5a9d0f0e1bf16de23b51d3a300a14a95f2` from `HUDongpin/help-math-2-0-workbench`. A new root commit contains a filtered baseline without importing the original Git history. Subsequent commits separate maintained implementation, generated page modules, product integration, source-derived evidence and exact runtime artifacts.

The follow-up [registry and tellTarget repair report](review/REPAIRS-20261024.md) records the resolved defects, reproducible empty-directory setup and remaining host integration limits.

See [the commit list](review/COMMITS.md), [validation results](review/VALIDATION.md), and [snapshot scope](review/SNAPSHOT.md). Apply the complete series in order. Intermediate commits are review boundaries, not independently certified releases.

## Included

- Maintained shared HFR runtime, host bridge, compiler, tests and validation tools.
- ALG, NMS, GEO and DAT page implementations, generated modules and My Lesson routes.
- Registry/dispatch inputs and source-bound technical evidence as captured.
- The explicit runtime artifact paths referenced by the active G6–G8 registry, plus the maintained HFR compiler package.

## Scope and use

Original FLA/SWF collections, private archives, credentials, personal and business records, historical chat exports, machine-specific links, build caches and operational custody state are not included. Evidence retains its original bytes and dated claims; committing it does not renew or expand those claims. Some historical evidence and source-bound checks still require external source files or omitted local operational artifacts. This repository is not advertised as a complete standalone reproduction of the original execution environment.

Registration, runnable integration, observed playback, technical closure, original-runtime fidelity, audio listening, human/Owner review and release remain separate gates. This snapshot creates no new page credit.

Install dependencies only in an isolated checkout using the checked-in lockfile. The original package scripts include generation and registration operations; review their effects before running them. Validation commands actually executed for this snapshot are recorded separately. No provider credentials or production service connections are needed for the recorded unit tests.
