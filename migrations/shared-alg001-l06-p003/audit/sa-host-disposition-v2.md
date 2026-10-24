# P003 separate Spanish Audio host disposition — 2026-09-28

The source supports an **explicit optional Spanish Audio host operation** for ALG001 L6 P003, conditional on the identified canonical `indexMI.swf` actually hosting the lesson with Spanish enabled. It does not support automatic playback from the modern Spanish UI locale or appending the SA MP3 to the main embedded stream.

The exact current XML selects `HELP_COURSES/ALG001/ALG001.jpg`, declares `PageRoot=HELP_COURSES/ALG001/L6`, and places `RW/L6RW03.swf` in RW section 2 (global page 3, section page 2). Host frame49 AS lines32–36 has the matching ALG001 course-image case. The source XML export lines191643–191647 names main sprite154 `animation`, matching the host's `animation_mc.animation` target. These are static compatibility facts; the historical launcher and actual `dtfSPANISH` setting remain unobserved.

The SA release handler calls `doPlaySpanishAudio()`. Host frame35 lines2786–2855 gate availability on `dtfSPANISH=ON`, section eligibility, no currently active SA, and a filename suffix other than `01.SWF`. P003 ends in `03.swf`, so it passes that filename condition. Lines1519–1664 derive a same-lesson `SA/<current-page-stem>.mp3`; substituting the exact P003 path yields `<ServerRoot>/HELP_COURSES/ALG001/L6/SA/L6RW03.mp3`. No actual domain or resolved network request was observed.

SA play pauses the main animation, loads a separate Sound with `loadSound(..., false)`, and starts at zero only on successful load while the loading flag remains true. Completion calls stop, literal `unLoad()`, and the return function. Host lines1665–1708 stop/unload SA and resume the retained main position only when nonterminal and nonquiz. The original unload spellings are evidence, not proof they worked in AVM1. Page loading lines422–437 stops SA and clears its loading flag. SA pause calls `stop()`; SA play calls `start()` without an offset, so sample-exact pause/resume must not be claimed from those handlers.

Fresh read-only parsing of P003 confirms zero button definitions, exactly three DoAction tags (root1 legacy preloader plus stop; root6 stop; main sprite154 frame719 stop), and no additional page quiz/glossary interaction in those actions. The genuine remaining source-host feature in the continuous-v2 candidate is optional explicit SA playback with cancellation and conditional return. Its absence should be implemented or explicitly handled in a reviewed capability disposition before claiming complete host behavior. This report does not admit or register the page and does not recreate the excluded legacy course shell.

The current separate MP3 is 135,408 bytes, SHA-256 `d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a`. Fresh FFprobe reports MP3, mono48,000Hz, duration9.672s. **No playback or listening occurred**; intended Spanish role is source-supported, spoken content/language remains unverified. The continuous embedded stream stays independent.

## Exact current input pins

The JSON companion records all absolute paths, bytes, SHA-256 hashes, source references, current parser results, and probe output. All listed inputs were read and rehashed without modifying them. Retained AS was reused, not freshly exported. No provider operation occurred.

| Input | Bytes | SHA-256 | Exact path |
| --- | ---: | --- | --- |
| lessonXml | 13926 | `9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c` | `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/index.xml` |
| pageSwf | 1220637 | `c3d265b61aedccc48e679cbecfe6424a2a78f2a9cb5cfa2a33791fa124933766` | `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW03.swf` |
| separateSa | 135408 | `d280e8f5e653c165755baf2f8960cfd667f03205d2f9aaafe1820a15d327f89a` | `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/SA/L6RW03.mp3` |
| hostCas | 689006 | `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` | `/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` |
| hostWorkingCopy | 689006 | `275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/source.swf` |
| hostExtractionReceipt | 19619 | `4f4daa77ce7a369b6635a28a3c1f0411d12c57358905a9b8c016510d9cbc7e0c` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/extraction.json` |
| hostFunctions | 104008 | `380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_35/DoAction.as` |
| hostGallery | 1918 | `713f73c05dba1a9cd080b2a58b9cbfff277f6b5d5aa38136947c5a9013702ba6` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_49/DoAction.as` |
| saRelease | 437 | `c177d473fd8a90ab61ed17bc4b63a895cee9fedc1f316658af43e8984dd43f33` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/DefineButton2_273/BUTTONCONDACTION on(release).as` |
| eaRelease | 49 | `5dacf94a56789afb84d10eb6e3682c23241e82724da2a706c7d1f0fdf55cff15` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/DefineButton2_265/BUTTONCONDACTION on(release).as` |
| saPlay | 123 | `07f0badc3feeee33c3b8b707c84b29fca376baf5d15e1c2da93695e09e47f1dc` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_49/PlaceObject2_278_169/CLIPACTIONRECORD on(release).as` |
| saPause | 122 | `3b63895944ac93c59d74277a882ce533b9e84408bf7609ff6a576658f3a6d665` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_49/PlaceObject2_282_171/CLIPACTIONRECORD on(release).as` |
| hostFrameObserver | 61 | `0f74c16ab4c673bd21f5d82f4c7bd77f2c003198d8870bda7764b3cd7699c035` | `/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts/frame_50/PlaceObject2_743_130/CLIPACTIONRECORD onClipEvent(enterFrame).as` |
| priorP006Disposition | 14326 | `80c5b89c21716234a6baee90245f721e8d90fb0ecd19cadb74d00895e6939e7f` | `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-alg001-l12-p006/evidence/SA_HOST_DISPOSITION_2026-09-27.md` |
| pageXmlExport | 9849926 | `06a62bfa3791432396d16a1eff2751576b98f13216560220492b59f03c84d72e` | `/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt/source.xml` |
| pageRoot1 | 63 | `af7188282949f2613421ba9c8be629f489bbe2ee1e370a072024794b2d2cfc19` | `/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt/ffdec-audit/scripts/frame_1/DoAction.as` |
| pageRoot6 | 9 | `3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655` | `/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt/ffdec-audit/scripts/frame_6/DoAction.as` |
| pageTerminal | 9 | `3271a793e3f9600314c6b0facc05023c4f3ed09c116d452966200a5d04735655` | `/Volumes/American Dream/hudongpin/g678-p003-audit.11qugt/ffdec-audit/scripts/DefineSprite_154/frame_719/DoAction.as` |
| sourceParser | 56716 | `079ae4c5f3034de39520ec1508079be1b8fe482c81b1d879ed2ba1a3a625a4dd` | `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/scripts/build-g4-l3-machine-source-audits.mjs` |
| actionExtractor | 11376 | `d621449a3b79267699e23f914ba5e3f038af9485f35d2d27db9c05e2e1a373e5` | `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/scripts/prepare-g678-terminal-source-v1.mjs` |

All acceptance effects remain false: original-runtime, fidelity, listening/audio, human, Owner, strict completion, and publication. Historical brief/audio reports remain unchanged; the old two-run audio interpretation is outside this SA disposition.
