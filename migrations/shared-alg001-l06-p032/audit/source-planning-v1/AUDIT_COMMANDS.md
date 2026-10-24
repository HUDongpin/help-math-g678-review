# P032 physical-source extraction and readback

Run from `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`. The physical source root is `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware`, not a compatibility symlink. The source SWF `G6-G8-shared/ALG001/L6/IN/L6IN04.swf` is 146,070 bytes, SHA-256 `e425600d0b6cfab41ae50f7512cb8e6c4e3c6ee04bbfa10c29b437459876d836`. The physical lesson `index.xml` is 13,926 bytes, SHA-256 `9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c`.

The FFDec 26.2.1 structure/scripts and swfmill 0.3.6 XML were **copied byte-for-byte** from the already pinned P032 candidate in `output/alg-l06-p029-prequiz-resolution-v1/candidate-p032`; `build-source-plan-v1.py` checks that copy. No second structure/script decompilation was needed. FFDec 26.2.1 exported only the nine text definitions from the exact physical SWF:

```sh
ffdec -export text output/alg-l06-p032-source-planning-20261001-v1/source-export '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN04.swf'
```

FFDec writes text files to the export root for this command; the nine `.txt` files were moved unchanged into `source-export/texts/` for the extractor's existing folder convention. The source extractor is the maintained source-only timeline/stream reader copied from P031 and scoped to P032. It checks physical SWF hash, compares swfmill and FFDec root/sprite tag inventories and frame counts, computes instance spans, and reconstructs MP3 bytes from all 413 `SoundStreamBlock`s. The planner checks physical SWF/SA/XML SHA, exact XML ordinal 32 and subtitle, catalog identity, absent same-path FLA and registration, source scripts/texts, four glossary actions, root entry, nested frame domain, and payload. Its source-only producer refuses overwrites.

```sh
python3 output/alg-l06-p032-source-planning-20261001-v1/extract-structure-v1.py --check
python3 output/alg-l06-p032-source-planning-20261001-v1/build-source-plan-v1.py --check
```

Both readbacks passed on 2026-10-01. `source-display-list-v1.json` SHA-256 is `a1711a4829fda9b1cd46c40e4e8f3468e79a85bc00a4c6240ed329b399cf4e6a`. `source-plan-v1.json` SHA-256 is `593976a049450ddb17d0b344f8877ffe110c312c5324a3527358c62538f92d26`. The embedded MP3 payload is 171,080 bytes, SHA-256 `2584a692ee3936f02c3dc491872225f020744ce92710f890e1a31d468a75c85b`. FFprobe describes file-level codec and duration only; browser-decoded PCM, listening, source-host behavior, and original-runtime playback were not measured.

Only `output/alg-l06-p032-source-planning-20261001-v1/**` was written. The physical source, catalog, migration workspace, registry, product code, host, and browser state were not changed.
