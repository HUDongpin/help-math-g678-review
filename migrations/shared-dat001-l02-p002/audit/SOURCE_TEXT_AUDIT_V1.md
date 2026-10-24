# DAT001 L2 P002 source text audit

FFDec 26.2.1 `text:plain` export of the exact physical shipped SWF
`G6-G8-shared/DAT001/L2/RW/L2RW02.swf` (SHA-256
`b4a8311aff5e33cc623d6035b4a00647bac6ab9dbe0fd61394e6a6207e652a16`).
Command: `ffdec -format text:plain -export text <this audit export directory>
<physical shipped SWF>`. The five raw `.txt` files under
`ffdec-26.2.1-source-text-v1/` total 144 UTF-8 bytes and have no trailing
newline. These exact English strings are source evidence, not reviewed
modern typography or Spanish translation.

| DefineText character | Exact raw text | Raw SHA-256 |
| --- | --- | --- |
| 105 | `Assignment: ` (trailing space) | `0d21edf7203b3b83d7fd62395e52e698ae71a0fe79b6d4095b90e3654d457d30` |
| 108 | `•Download sunspot data.` | `3c1e92ea1391298ce8224dfd31d7a08294fa1c97a01a29c1da0ac013db58cd41` |
| 110 | `•Represent the data on an appropriate graph.` | `d899a460713c32544f09d4493a0b0fad529961491fc83f3bb85ef13d944ff11a` |
| 112 | `•Interpret the data.` | `56496c6dbba8c592fd5785eef15c1c4c971b870e2eccaa7943bbb0d4384605f1` |
| 114 | `Representing Data:  Real World Activity` (two spaces after colon) | `84d459c667b6ed031e8ccbab88d6d545607ea0df913712e32f224a8d9e51cb8c` |

The terminal local visual candidate shows the assignment text, but visibility
at earlier frames is affected by the source morph masks. Text placement alone
does not establish readable timing, source-host playback, or accessibility.
The source has not supplied a Spanish text layer in this extraction. Human
review must decide the modern bilingual wording and live-text treatment.
The guarded local candidate now offers an optional, explicitly unsynchronized
English transcript read from these same five hash-bound files. It does not
assign source-frame reveal times or supply a Spanish adaptation; see
`LOCAL_TEXT_TRANSCRIPT_QA_2026-09-25.md`.
