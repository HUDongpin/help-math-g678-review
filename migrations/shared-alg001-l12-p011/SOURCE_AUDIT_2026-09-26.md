# ALG001 L12 P011: Origin

Source-structure audit and implementation plan. No Current-JS admission yet.

The exact placement is `shared-alg001-l12-p011`, lesson 12 page 11, vocabulary
page 5, `G6-G8-shared/ALG001/L12/VB/L12VB06.swf`. The 52,188-byte SWF hash is
`c26cce962362fe8aa1782e3cf5c4f358f76f3276af9dce4b14cbe81e0e049655`.
The physical AWS source root has been verified. The catalog binds no FLA.
The lesson XML hash is `0755afb5645d3179fb1105641b0d1f1b06d8c803c02484bfbdc703ba5bb6f325`.

swfmill XML hash: `79737d87ff67635067aba29581eca826d0c0c40c1f6942b2785c4eeddf1c9c2f`.
The native stage is 800 × 600, 12 fps, CWS v6; root has ten frames. The
root stops at its preloader and begins at labeled frame 6. At frame 6 it
places sprite 2 (one-frame vector title, depth 1, 400/42.85 px) and sprite 33
(118-frame lesson animation, depth 3, 412.4/283.3 px). Both are required.
The title is vector outlines, not an exported text record. All diagram,
coordinate labels, and sentences come from the preserved drawing export.

Six source buttons invoke `DoHyperLinks()` with `KeyAttribute`, then stop the
animation. These are the only exported button actions:

| Character | First frame | KeyAttribute |
| --- | ---: | --- |
| 20 | 8 | Origin |
| 21 | 8 | Point |
| 22 | 8 | Coordinate plane/Cartesian Plane |
| 27 | 78 | X-axis |
| 28 | 78 | Y-axis |
| 29 | 78 | Intersect |

The source animation has 110 embedded sound-stream blocks. The catalog MP3
`SA/L12VB06.mp3` hash is
`77c0d85461fb97db78696a48d19d298c32fa8a46a2fa983674721b24db4c5a86`.
Source language, host selection, synchronization, and human listening remain
open. The draft's default audio-required field is not audio-absence evidence.

FFDec 26.2.1 was run with `-config packJavaScripts=false -format sprite:canvas`
to preserve inspectable drawing functions. The packed export is retained as
earlier extraction evidence. The unpacked sprite 33 export is 816,899 bytes,
SHA-256 `db0e876708566c4750753feb7cadcd3ce59bb72299c49f951a00d9cbdb3378ab`;
sprite 2 export hash is
`33b3ba1bbb53569ca5b6fab60f216aa2296f5fd3c5375d989a2a8ac8ef94f1ab`.

Implementation lane: compiler-assisted extraction plus maintained glossary
adapter. Compose the vector title below the animation in native coordinates.
Expose source-local frames 1–118, with Replay resetting frame and interaction
state. Treat clamp-once playback as an engineering policy until original
runtime terminal behavior is verified. Exercise frames 1/7/8/77/78/118 and
all six modern glossary requests before registry/My Lesson admission.

Original-runtime comparison, bilingual content authority, audio, human/Owner
acceptance, strict completion, release, and publication remain open.
