# P003 root Canvas extraction tool receipt — 2026-09-23

The existing canonical SWF was read only. FFDec CLI returned
`JPEXS Free Flash Decompiler v.26.2.1` and exported the complete root frame
Canvas to `/Volumes/American Dream/hudongpin/g678-p003-root-HMhJ2h` using:

```text
ffdec -config packJavaScripts=false -onerror abort -timeout 120 -exportTimeout 600 -format frame:canvas -export frame <output-directory> <exact-source-swf>
```

`/opt/homebrew/bin/ffdec` resolves to
`/Users/peter/Applications/FFDec.app/Contents/Resources/ffdec.sh`.
The shell launcher SHA-256 is
`1a242c6333aa8dba0f18f635f9ea2585a988f4131aa5164b70eb00ad9e662bab`;
the `ffdec.jar` beside it has SHA-256
`090ab695053ad94cba6408574c7d7eea20ec60b6ae789ee6056a23f45106762f`.
The current `catalog/toolchain.json` SHA-256 was
`07484eaf52751128f91b429b7ce1b7bb46259365c545d17c360b5d0c74c3b41f`.
Its reviewed acquisition entry identifies release asset
`ffdec_26.2.1_macosx.zip`, SHA-256
`a160249e037115b935db253e993a6c00694f5d89bc4808c379e9a08a4034795c`.

The raw `frames.html` and `canvas.js` sizes/hashes are pinned in
`ROOT_HELD_NESTED_DRAWING_V1.json` and rechecked by the candidate builder.
This note records binary provenance after the v1 IR was frozen; the v1
generator manifest does **not** yet bind the launcher/JAR, generator, or
full downstream toolchain hashes. It is local engineering evidence only and
does not authorize a reusable factory lane or redistribution of FFDec output.
