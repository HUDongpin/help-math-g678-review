# P043 canonical regeneration (local candidate)

`materialize-adapters-v1.py` is the P043-only adapter for the nine frozen scripts in `../generator-input/original-output-scripts/`. It first verifies every file in the reviewed 280-file promotion plan by size and SHA-256, then applies exact, single-use path substitutions to seven generators. The frozen scripts and the pinned `native-v1`, `audio-source-v1`, and `canvas-v1` files are never written. The adapted generators write under `../regenerated-v1/`.

From the repository root, the one-command deterministic check is:

```sh
python3 migrations/shared-alg001-l06-p043/generator-v1/verify-regeneration-v1.py --check
```

To reproduce in an empty `regenerated-v1` directory, run in this order:

```sh
mkdir -p migrations/shared-alg001-l06-p043/regenerated-v1/native migrations/shared-alg001-l06-p043/regenerated-v1/audio/streams migrations/shared-alg001-l06-p043/regenerated-v1/canvas
python3 migrations/shared-alg001-l06-p043/generator-v1/materialize-adapters-v1.py --check
python3 migrations/shared-alg001-l06-p043/generator-v1/build-p043-native-model.py --write
python3 migrations/shared-alg001-l06-p043/generator-v1/derive-native-bindings-v1.py --write
python3 migrations/shared-alg001-l06-p043/generator-v1/source-audio-v1.py --write
python3 migrations/shared-alg001-l06-p043/generator-v1/build-frame-clock-v1.py --write
python3 migrations/shared-alg001-l06-p043/generator-v1/check-canvas-v1.py --write
node migrations/shared-alg001-l06-p043/generator-v1/prepare-p043-canvas.mjs --write
node migrations/shared-alg001-l06-p043/generator-v1/prepare-p043-visibility-v2.mjs --write
python3 migrations/shared-alg001-l06-p043/generator-v1/verify-regeneration-v1.py --check
```

The write commands use exclusive creation or byte comparison and never overwrite an existing output. The verifier runs all seven `--check` commands, including a fresh FFDec reexport comparison of all 72 Canvas source files and 555 frame cases. It compares 14 historical/generated pairs and permits only the recorded canonical path and propagated digest fields to change. Its exact comparison record is `output/g678-p043-generator-adaptation-20261002-v1/verification-v1.json`.

The Canvas draft (`b310d4a5fb9a7ae6c7822d5d9211d4eb9e5acb33ac9149d225f04dd9c2161c14`), final visibility asset (`4ef3fd48ec83ba97542791832682e0a14aabec52611d7a4f6f0750e5b4852de5`), dynamic text contract, and three reachable MP3 streams reproduce byte for byte. The native model's only four changed fields are recorded source paths; its SHA therefore changes from `158cc7f8…` to `762333e5…`. The source audio receipt's six changed fields are paths; its SHA changes from `88af856e…` to `80830741…`. Native bindings, frame clock, Canvas extraction manifest, Canvas candidate manifest, adapter specification, and visibility receipt propagate those canonical locations or hashes. They have separate regenerated SHA values and must not be mislabeled as byte identical.

This is source/model generation evidence for an unregistered Current-JS candidate. The source right-feedback sprite 202 still has 386 unclassified trailing bytes after its End tag. Source frame/sample fields are not a measured browser seek table. Original runtime fidelity, audio listening, human and Owner acceptance, strict completion, release, and publication remain separate.
