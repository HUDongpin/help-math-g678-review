# P006 sprite 53 audio source extraction — 2026-09-26

## Source binding and output

- Placement: `shared-alg001-l12-p006`. Main display sprite 53 owns the stream; the root title and the Coordinate/Graph/Equation/Inequality glossary buttons are separate display/behavior evidence. This work does not route audio through the glossary or change a display IR.
- Physical source: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW06.swf`, 708,053 bytes, SHA-256 `933f1f6db59435e882c1bf6e9392259fc1d28c0974a0a4c6cebc9bcc7a5d46b6` (rehashed).
- FFDec 26.2.1 XML: `audit/ffdec-26.2.1/movie.xml`, 9,258,378 bytes, SHA-256 `60c835b77135803e0699aa6580650413ec9591d14f17dbe70d01365cea28a77a`, matching `audit/ffdec-26.2.1/extraction-receipt.json`.
- Extracted file: `audio-source-v1/sprite-53-source-stream.mp3`, 140,920 bytes, SHA-256 `801d34dc684341a2644a7fcc3373bea98cbc14bdf91f4364db0e37c30e7c1803`. The script concatenates each XML `SoundStreamBlockTag`'s MP3 payload after its four-byte little-endian sample-count/signed-seek wrapper. It neither rewrites the original SWF nor transcodes the MP3 output.
- Block record: `audio-source-v1/stream-source-receipt.json`, 142,839 bytes, SHA-256 `c3f1c26102fb9b7e0cb41a60a0de764b8cc68da559a7d20be7ccb42f557f4f78`. It records each block's sprite frame, count, signed seek, wrapper bytes, tag-body and payload sizes/hashes, and output offset. Sprite 53 has 342 frames and 340 consecutive stream blocks at frames 3–342. Frame 4 is a valid four-byte zero-count/zero-seek block with no MP3 payload; it remains in the record. The first block has count 3,456/seek 1,673; the last has count 2,304/seek 499. Sum of block counts: 624,384 samples.

## Machine probes and separate SA file

- FFprobe 8.1.2 identifies the extracted file as mono MP3 at 22,050 Hz, reports 140,920 bytes and a file-duration estimate of 28.184 seconds. FFmpeg 8.1.2 decoded the payload in memory to 624,384 mono PCM samples (about 28.316735 seconds at 22,050 Hz). The decoded count equals the sum of the block headers. The file-duration estimate and decoded-sample duration differ; neither is asserted as the original host's playback clock or synchronization.
- Physical separate SA candidate: `/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/SA/L12RW06.mp3`, 214,704 bytes, rehashed SHA-256 `86fdbdeb0fec8cd6b9682d75ec436e4db370d56ba23e48efc47cf00c374c64bf`, exactly matching `catalog/g678-shared-catalog.v1.json`. FFprobe reports mono MP3, 48,000 Hz, 15.336 seconds. Its trigger, language, and relationship to the embedded stream remain unverified.

## Reproduction and limits

From `/Volumes/WestWorld/HELP MATH 2.0-g678-implementation`:

```sh
python3 scripts/extract-g678-alg-l12-p006-stream.py --write
python3 scripts/extract-g678-alg-l12-p006-stream.py --check
python3 scripts/extract-g678-alg-l12-p006-stream.test.py -v
```

`--write` creates only new files and refuses an existing output; `--check` rebuilds and byte-compares both outputs against the physical source and pinned XML receipt. Focused tests cover wrapper removal including the empty frame-4 block, missing-block rejection, agreement with the earlier independent structural audit, deterministic check, and no-overwrite behavior. No audio was played. This is static extraction and machine decode only: original-host timing, listening, synchronization, audio acceptance, renderer/registration, fidelity, human/Owner acceptance, strict completion, and publication remain open.
