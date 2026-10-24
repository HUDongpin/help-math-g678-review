#!/usr/bin/env python3
"""Materialize P043-only generators from the frozen extraction scripts.

Each substitution is exact and single-use; source algorithms stay in their
reviewed snapshot. Generated scripts read this migration's source and audit
files and write solely to regenerated-v1, never to pinned outputs.
"""
from hashlib import sha256
import json
from pathlib import Path
import sys

HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
ROOT = WORKSPACE.parents[1]
ORIGINAL = WORKSPACE/'generator-input/original-output-scripts'
PLAN = ROOT/'output/g678-p043-canonical-integration-proposal-20261002-v1/source-material-promotion-plan-v1.json'
PLAN_SHA = 'c3d0ec5ab9a39e5b51e50e239ee868d6e7bee08ea96ddf1de6d6ed6af3d5fe62'
W = 'migrations/shared-alg001-l06-p043'


def digest(data): return sha256(data).hexdigest()


def replace(text, old, new):
    count = text.count(old)
    assert count == 1, (old, count)
    return text.replace(old, new)


def preflight():
    assert digest(PLAN.read_bytes()) == PLAN_SHA
    plan = json.loads(PLAN.read_text())
    assert len(plan['copy']) == 280 and plan['copyBytes'] == 25952635
    for row in plan['copy']:
        file = ROOT/row['to']
        assert file.is_file() and not file.is_symlink(), file
        data = file.read_bytes()
        assert len(data) == row['bytes'] and digest(data) == row['sha256'], file
    return plan


def build():
    preflight()
    output = {}
    old_lesson = "/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6"
    old_intake = 'output/g678-p043-source-intake-20261002-v1'
    old_maintained = 'output/g678-p043-maintained-preparation-20261002-v1'
    old_helper = 'output/alg-l06-p041-native-source-preparation-20261001-v1/build-p041-native-model.py'
    transformations = {
        'build-p043-native-model.py': [
            (f"LESSON = Path('{old_lesson}')", "LESSON = WORKSPACE/'source-v1'"),
            (f"XML = ROOT/'{old_intake}/audit/swfmill.xml'", "XML = WORKSPACE/'audit-v1/swfmill.xml'"),
            (f"HELPER = ROOT/'{old_helper}'", "HELPER = WORKSPACE/'generator-input/p041-affine-timeline-helper.py'"),
            ("MODEL = HERE/'native-model-v1.json'", "MODEL = WORKSPACE/'regenerated-v1/native/native-model-v1.json'"),
        ],
        'derive-native-bindings-v1.py': [
            ("ROOT = HERE.parents[1]", "ROOT = HERE.parents[2]"),
            (f"MODEL = ROOT/'{old_maintained}/native/native-model-v1.json'", "MODEL = WORKSPACE/'regenerated-v1/native/native-model-v1.json'"),
            (f"XML = ROOT/'{old_intake}/audit/swfmill.xml'", "XML = WORKSPACE/'audit-v1/swfmill.xml'"),
            (f"HELPER = ROOT/'{old_helper}'", "HELPER = WORKSPACE/'generator-input/p041-affine-timeline-helper.py'"),
            ("OUTPUT = HERE/'native-bindings-v1.json'", "OUTPUT = WORKSPACE/'regenerated-v1/native/native-bindings-v1.json'"),
            ("158cc7f897d0d23fd55ca87536fba851080e0c26996d69a43eb9e910ce5dae9c", "762333e5e6eb6a346801f98c9b8c322425397ec35819d000b1be7a4d5003c92d"),
        ],
        'source-audio-v1.py': [
            (f"LESSON = Path('{old_lesson}')", "LESSON = WORKSPACE/'source-v1'"),
            ("RECEIPT = HERE/'source-audio-v1.json'", "RECEIPT = WORKSPACE/'regenerated-v1/audio/source-audio-v1.json'"),
            ("target = HERE/FILES[sprite_id]", "target = WORKSPACE/'regenerated-v1/audio/streams'/FILES[sprite_id]"),
        ],
        'build-frame-clock-v1.py': [
            ("SCHEDULE = HERE/'source-audio-v1.json'", "SCHEDULE = WORKSPACE/'regenerated-v1/audio/source-audio-v1.json'"),
            ("OUTPUT = HERE/'frame-clock-v1.json'", "OUTPUT = WORKSPACE/'regenerated-v1/audio/frame-clock-v1.json'"),
            ("88af856e8217453acee4c5705b145b0b9f6476219fe10f09bf79667a2f635202", "80830741c550603c117eca0e5ffd1f30c8ca7a3c28d21fe520d591c8d95ab8dc"),
        ],
        'check-canvas-v1.py': [
            ("ROOT = HERE.parents[2]", "ROOT = HERE.parents[2]"),
            (f"SWF = Path('{old_lesson}/TI/L6TI03.swf')", "SWF = WORKSPACE/'source-v1/TI/L6TI03.swf'"),
            (f"XML = ROOT/'{old_intake}/audit/swfmill.xml'", "XML = WORKSPACE/'audit-v1/swfmill.xml'"),
            ("NATIVE = HERE.parent/'native/native-model-v1.json'", "NATIVE = WORKSPACE/'regenerated-v1/native/native-model-v1.json'"),
            ("EXPORT = HERE/'source-export'", "EXPORT = WORKSPACE/'canvas-v1/generator-input/ffdec-export'"),
            ("STDOUT, STDERR = HERE/'ffdec-stdout.txt', HERE/'ffdec-stderr.txt'", "STDOUT, STDERR = WORKSPACE/'canvas-v1/generator-input/ffdec-stdout.txt', WORKSPACE/'canvas-v1/generator-input/ffdec-stderr.txt'"),
            ("MANIFEST = HERE/'canvas-extraction-v1.json'", "MANIFEST = WORKSPACE/'regenerated-v1/canvas/canvas-extraction-v1.json'"),
            ("158cc7f897d0d23fd55ca87536fba851080e0c26996d69a43eb9e910ce5dae9c", "762333e5e6eb6a346801f98c9b8c322425397ec35819d000b1be7a4d5003c92d"),
        ],
        'prepare-p043-canvas.mjs': [
            ("const BASE = 'output/g678-p043-maintained-preparation-20261002-v1';", f"const BASE = '{W}/regenerated-v1';"),
            (f"const SWF = '{old_lesson}/TI/L6TI03.swf';", f"const SWF = path.resolve(ROOT, '{W}/source-v1/TI/L6TI03.swf');"),
            (f"index: '{old_lesson}/index.xml'", f"index: '{W}/source-v1/index.xml'"),
            (f"sourcePacket: '{old_intake}/source-intake-v1.json'", f"sourcePacket: '{W}/audit-v1/source-intake-v1.json'"),
            (f"xml: '{old_intake}/audit/swfmill.xml'", f"xml: '{W}/audit-v1/swfmill.xml'"),
            ("`${BASE}/canvas/source-export/sprites/DefineSprite_342/frames.html`", f"'{W}/canvas-v1/generator-input/ffdec-export/sprites/DefineSprite_342/frames.html'"),
            ("`${BASE}/canvas/source-export/frames/frames.html`", f"'{W}/canvas-v1/generator-input/ffdec-export/frames/frames.html'"),
            ("`${BASE}/canvas/source-export/sprites/DefineSprite_342/canvas.js`", f"'{W}/canvas-v1/generator-input/ffdec-export/sprites/DefineSprite_342/canvas.js'"),
            ("`${BASE}/canvas/source-export/${relative}`", f"`{W}/canvas-v1/generator-input/ffdec-export/${{relative}}`"),
            ("const file = path.join(HERE, name);", "const file = path.resolve(ROOT, BASE, 'canvas', name);"),
            ("assert.equal(path.dirname(file), HERE);", "assert.equal(path.dirname(file), path.resolve(ROOT, BASE, 'canvas'));"),
            ("158cc7f897d0d23fd55ca87536fba851080e0c26996d69a43eb9e910ce5dae9c", "762333e5e6eb6a346801f98c9b8c322425397ec35819d000b1be7a4d5003c92d"),
            ("7965b03f90d5c2c659048a24d028633a354400e2e74795393d50bff3f93ce9cf", "f3ad969569ef754ece787ad375631e3e45e28a097cb16f05b5be874b03c35e52"),
        ],
        'prepare-p043-visibility-v2.mjs': [
            ("const ROOT = path.resolve(HERE, '../..');", "const ROOT = path.resolve(HERE, '../../..');"),
            (f"const INPUT = '{old_maintained}/canvas/canvas-renderer-draft.js';", f"const INPUT = '{W}/regenerated-v1/canvas/canvas-renderer-draft.js';"),
            (f"const SOURCE = '{old_intake}/audit/ffdec-export/scripts';", f"const SOURCE = '{W}/behavior-v1/source-actions';"),
            ("const file = path.join(HERE, name);", "const file = path.resolve(ROOT, 'migrations/shared-alg001-l06-p043/regenerated-v1/canvas', name);"),
        ],
    }
    for name, edits in transformations.items():
        text = (ORIGINAL/name).read_text()
        for old, new in edits:
            if old == new: continue
            text = replace(text, old, new)
        if name.endswith('.py'):
            text = replace(text, "HERE = Path(__file__).resolve().parent", "HERE = Path(__file__).resolve().parent\nWORKSPACE = HERE.parent")
        if name in ('build-p043-native-model.py', 'derive-native-bindings-v1.py'):
            text = replace(text, 'import sys\n', 'import sys\nsys.dont_write_bytecode = True\n')
        output[name] = text.encode()
    return output


def main():
    mode = sys.argv[1:]
    assert mode in (['--write'], ['--check']), 'usage: --write | --check'
    outputs = build()
    for name, data in outputs.items():
        target = HERE/name
        if mode == ['--write'] and not target.exists():
            target.write_bytes(data)
        assert target.read_bytes() == data, name
    print(json.dumps({'mode': mode[0], 'scripts': {name: digest(data) for name, data in outputs.items()}}, sort_keys=True))


if __name__ == '__main__': main()
