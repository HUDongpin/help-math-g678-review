#!/usr/bin/env python3
"""Check P043 canonical regeneration and bounded historical receipt drift."""
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
W = HERE.parent
ROOT = W.parents[1]
OUT = ROOT/'output/g678-p043-generator-adaptation-20261002-v1/verification-v1.json'


def digest(data): return sha256(data).hexdigest()


def run(*command):
    completed = subprocess.run(command, cwd=ROOT, text=True, capture_output=True, timeout=120)
    assert completed.returncode == 0, {'command': command, 'stdout': completed.stdout[-1000:], 'stderr': completed.stderr[-1000:]}
    return completed.stdout.strip()


def differences(left, right, path=''):
    if left == right: return []
    if type(left) is not type(right): return [path]
    if isinstance(left, dict):
        return [d for key in sorted(left.keys() | right.keys())
                for d in differences(left.get(key), right.get(key), path+'.'+key)]
    if isinstance(left, list):
        assert len(left) == len(right), path
        return [d for index, (a, b) in enumerate(zip(left, right))
                for d in differences(a, b, path+f'[{index}]')]
    return [path]


def checked_comparison(old, new, allowed):
    before, after = old.read_bytes(), new.read_bytes()
    if old.suffix == '.json':
        delta = differences(json.loads(before), json.loads(after))
        assert set(delta) == set(allowed), {'old': str(old), 'unexpected': sorted(set(delta)-set(allowed)),
            'missing': sorted(set(allowed)-set(delta))}
    else:
        assert before == after, (old, new)
        delta = []
    return {'historical': str(old.relative_to(ROOT)), 'regenerated': str(new.relative_to(ROOT)),
        'historicalSha256': digest(before), 'regeneratedSha256': digest(after),
        'changedFields': sorted(delta)}


def allowed_for(name, old):
    if name == 'native-model': return ['.source.'+part+'.path' for part in
        ('swf', 'lessonXml', 'swfmillXml', 'reusedP041Helper')]
    if name == 'native-bindings': return ['.source.nativeModelSha256']
    if name == 'audio': return ['.physicalSource.path', '.lessonXml.path', '.separateSa.file.path'] + [f'.streams[{i}].file.path' for i in range(3)]
    if name == 'clock': return ['.sourceScheduleSha256']
    if name == 'canvas-extraction':
        data = json.loads(old.read_text())
        return ['.physicalSwf.path', '.swfmillXml.path', '.nativeModel.path',
            '.nativeModel.bytes', '.nativeModel.sha256', '.exportStdout.path', '.exportStderr.path',
            '.command[9]', '.command[10]'] + [f'.rawFiles.{key}.path' for key in data['rawFiles']]
    if name == 'canvas-candidate':
        return [f'.inputs[{i}].path' for i in range(9)] + [f'.outputs[{i}].path' for i in range(3)] + [
            '.inputs[4].bytes', '.inputs[4].sha256', '.inputs[5].bytes', '.inputs[5].sha256',
            '.outputs[1].bytes', '.outputs[1].sha256']
    if name == 'adapter-spec':
        return ['.evidence.nativeSourceContract', '.evidence.audioAudit',
            '.evidence.audioAuditSha256', '.evidence.sourceXml', '.evidence.scenarioInventory',
            '.evidence.nativeSourceContractSha256', '.ffdecExport.framesHtml', '.ffdecExport.helper']
    if name == 'visibility-receipt': return ['.input.path'] + [f'.sourceActions[{i}].path' for i in range(8)]
    return []


def build():
    run(sys.executable, str(HERE/'materialize-adapters-v1.py'), '--check')
    commands = [
        [sys.executable, 'build-p043-native-model.py'],
        [sys.executable, 'derive-native-bindings-v1.py'],
        [sys.executable, 'source-audio-v1.py'],
        [sys.executable, 'build-frame-clock-v1.py'],
        [sys.executable, 'check-canvas-v1.py'],
        ['node', 'prepare-p043-canvas.mjs'],
        ['node', 'prepare-p043-visibility-v2.mjs'],
    ]
    for command in commands:
        run(command[0], str(HERE/command[1]), '--check')
    pairs = {
        'native-model': ('native-v1/native-model-v1.json','regenerated-v1/native/native-model-v1.json'),
        'native-bindings': ('native-v1/native-bindings-v1.json','regenerated-v1/native/native-bindings-v1.json'),
        'audio': ('audio-source-v1/source-audio-v1.json','regenerated-v1/audio/source-audio-v1.json'),
        'clock': ('audio-source-v1/frame-clock-v1.json','regenerated-v1/audio/frame-clock-v1.json'),
        'canvas-extraction': ('canvas-v1/generator-input/canvas-extraction-v1.json','regenerated-v1/canvas/canvas-extraction-v1.json'),
        'canvas-candidate': ('canvas-v1/generator-input/canvas-candidate-manifest-v1.json','regenerated-v1/canvas/canvas-candidate-manifest-v1.json'),
        'adapter-spec': ('../../output/g678-p043-maintained-preparation-20261002-v1/canvas/adapter-spec-v1.json','regenerated-v1/canvas/adapter-spec-v1.json'),
        'dynamic-text': ('../../output/g678-p043-maintained-preparation-20261002-v1/canvas/dynamic-text-contract-v1.json','regenerated-v1/canvas/dynamic-text-contract-v1.json'),
        'canvas-draft': ('canvas-v1/generator-input/canvas-renderer-draft.js','regenerated-v1/canvas/canvas-renderer-draft.js'),
        'canvas-final': ('canvas-v1/canvas-renderer.js','regenerated-v1/canvas/canvas-renderer-visibility-v2.js'),
        'visibility-receipt': ('canvas-v1/generator-input/visibility-source-receipt-v2.json','regenerated-v1/canvas/visibility-source-receipt-v2.json'),
    }
    comparisons = {}
    for name, (old, new) in pairs.items():
        historical, regenerated = (W/old).resolve(), W/new
        comparisons[name] = checked_comparison(historical, regenerated, allowed_for(name, historical))
    for stream in ('sprite-342-main.mp3', 'sprite-307-wrong4.mp3', 'sprite-202-right4.mp3'):
        comparisons[stream] = checked_comparison(W/'audio-source-v1/streams'/stream,
            W/'regenerated-v1/audio/streams'/stream, [])
    return {'kind': 'p043-canonical-regeneration-verification-v1',
        'sourcePromotionPlanSha256': 'c3d0ec5ab9a39e5b51e50e239ee868d6e7bee08ea96ddf1de6d6ed6af3d5fe62',
        'commands': ['python3 migrations/shared-alg001-l06-p043/generator-v1/materialize-adapters-v1.py --check'] +
            [f"{command[0]} migrations/shared-alg001-l06-p043/generator-v1/{command[1]} --check" for command in commands],
        'comparisons': comparisons,
        'gates': {'currentJsRegistered': False, 'originalRuntimeFidelityAccepted': False,
            'audioListeningAccepted': False, 'humanAccepted': False, 'ownerAccepted': False}}


def main():
    assert sys.argv[1:] in (['--write-receipt'], ['--check']), 'usage: --write-receipt | --check'
    data = (json.dumps(build(), indent=2)+'\n').encode()
    if sys.argv[1:] == ['--write-receipt']:
        OUT.parent.mkdir(parents=True, exist_ok=True)
        with OUT.open('xb') as target: target.write(data)
    assert OUT.read_bytes() == data, 'verification receipt drift'
    print(json.dumps({'mode': sys.argv[1], 'comparisons': len(json.loads(data)['comparisons']),
        'receiptSha256': digest(data)}, sort_keys=True))


if __name__ == '__main__': main()
