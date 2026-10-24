# P029 source audit reproduction

Run from `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`. The input root is the physical `AWS Grade-Classified Courseware` directory, not the compatibility symlink. These commands inspect source bytes only; they do not start a browser or server, scaffold a migration, or change a registry.

```sh
swfmill swf2xml '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB22.swf' output/alg-l06-p029-source-planning-20261001-v1/source-structure.xml
ffdec -swf2xml '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB22.swf' output/alg-l06-p029-source-planning-20261001-v1/ffdec-structure.xml
ffdec -export script,shape,morphshape,text,sound,button,font output/alg-l06-p029-source-planning-20261001-v1/source-export '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB22.swf'
ffdec -export image output/alg-l06-p029-source-planning-20261001-v1/source-export '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB22.swf'
python3 output/alg-l06-p029-source-planning-20261001-v1/extract-structure-v1.py --check
python3 output/alg-l06-p029-source-planning-20261001-v1/build-source-plan-v1.py --check
```

Installed tools: swfmill 0.3.6, JPEXS FFDec 26.2.1, FFmpeg/ffprobe 8.1.2. `ffdec-help.txt` records the installed command syntax. swfmill emitted `WARNING: end of tag UnknownTag is @650852, should be @6291468`, `WARNING: end of tag DefineSprite is @6291468, should be @524168`, and `WARNING: reached EOF while reading SWF`, although it exited zero and wrote parseable XML. FFDec independently parsed the SWF. The two tools' top-level tag inventories match after mapping swfmill's single `UnknownTag` to FFDec's `ProtectTag`, and all 14 nested sprite frame counts and tag inventories match after excluding swfmill's `End` records; `extract-structure-v1.py` fails if either comparison changes. Keep the warnings with the raw XML as a parsing limitation, especially before trusting ADPCM decoding or runtime action semantics.

The `--write` modes create the JSON and codec-labeled extracted streams only when their targets are absent. `--check` recomputes them from the preserved physical SWF, raw exports and XML and compares bytes. `build-source-plan-v1.py --check` also verifies the physical XML page order, catalog identity, current unregistered state, separate SA file, seven candidate MP3 decodes and plan bytes. It does not decode the SWF ADPCM blocks or verify original-runtime playback.
