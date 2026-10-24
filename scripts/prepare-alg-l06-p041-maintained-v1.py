#!/usr/bin/env python3
"""Promote the checked P041 source projection into its canonical draft workspace.

The immutable output packets remain the reproducible producers. This script
rechecks those producers and copies their exact bytes; it never edits a source
asset or generated Canvas. Existing canonical bytes must match on every run.
"""
from hashlib import sha256
import json
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
ID = 'shared-alg001-l06-p041'
TARGET = ROOT / 'migrations' / ID
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN13.swf')
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
PACKETS = {
    'triage': ROOT / 'output/alg-l06-p041-source-triage-20261001-v1',
    'native': ROOT / 'output/alg-l06-p041-native-source-preparation-20261001-v1',
    'canvas': ROOT / 'output/alg-l06-p041-canvas-source-preparation-20261002-v1',
    'audio': ROOT / 'output/alg-l06-p041-audio-source-preparation-20261001-v1',
    'clock': ROOT / 'output/alg-l06-p041-clock-binding-preparation-20261002-v1',
    'host': ROOT / 'output/alg-l06-p041-feedback-host-resolution-20261001-v1',
    'behavior': ROOT / 'output/alg-l06-p041-behavior-preparation-20261001-v1',
}
PINS = {
    'source': 'bb10cab8e835f2c3267e0add3774dc47fa38863fe12dab67f3199e4c0efadd85',
    'facts': '5512f5f65a9fd2eb3da8b22cb145c8fbf642e598eb257bc8db023dae2b14567d',
    'xml': 'a7c77470a326c9d1cfd4d4de5bf89dfe9b5c0ca526c23b7f74065530ed5f52b0',
    'native': '11863a83c6d6bf73e5040c6017b478c8caba78582a7aa79c1ed8da83742e682e',
    'clip': '1c7ed77577a949d35ab36cf873fc2043944c203adc096a0e34c25ceeebc19584',
    'canvas': '77cdf78caf76bc825e4c8cbdc5f511dd377da9b289018a53cf1c72c7f3ad5923',
    'canvasMetadata': '51818ba2823de3e70ae4b290459f87c93b8e8473513bbde9fe76b6ee660e8f8d',
    'audioPlan': '60a80bc27858e02b7c5bf4d4f04c89aecb0b0cbc27cd1b554f1b859aeb2f3dc5',
    'schedule': '57c5a6799468e8506df81f7887cef4d9ed7bdc58561c134e09e520042940f7a4',
    'clock': '9dda4e6d13b35540c3f043823956f1b9a7f84cd814a8344653d321fe9e31fe84',
    'bindings': '3bb05cccba568c5713299bce5427fa5ccf9dc93de5bce13e1fefeb5ce64e9057',
    'hostResolution': '3b325b445e2b6104f2f4199419b5afd1ffa1c3c2956be3ad97c12674e8b9a8ad',
    'hostAction': '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74',
    'behavior': '01ed347b6ab082d3f22ad3a2a8441aae930f60ad347953916e6386b669f97005',
}


def physical(path):
    before = path.lstat()
    assert path.is_file() and not path.is_symlink() and before.st_nlink == 1, path
    raw = path.read_bytes()
    after = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_mode', 'st_nlink')
    assert tuple(getattr(before, x) for x in fields) == tuple(getattr(after, x) for x in fields), path
    return raw


def digest(raw):
    return sha256(raw).hexdigest()


def checked(source, expected=None):
    raw = physical(source)
    if expected is not None:
        assert digest(raw) == expected, source
    return raw


def copy_exact(source, destination, expected, write):
    raw = checked(source, expected)
    assert destination.is_relative_to(TARGET) and not destination.is_symlink(), destination
    if write and not destination.exists():
        destination.parent.mkdir(parents=True, exist_ok=True)
        with destination.open('xb') as output:
            output.write(raw)
    assert physical(destination) == raw, destination
    return {'path': str(destination.relative_to(ROOT)), 'bytes': len(raw), 'sha256': digest(raw)}


def verify_producers():
    commands = [
        ['python3', str(PACKETS['native'] / 'build-p041-native-model.py'), '--check'],
        ['python3', str(PACKETS['native'] / 'check-p041-binary.py')],
        ['python3', str(PACKETS['canvas'] / 'extract-p041-canvas.py'), '--check'],
        ['node', str(PACKETS['canvas'] / 'prepare-p041-canvas.mjs'), '--check'],
        ['node', str(PACKETS['canvas'] / 'test-p041-canvas.mjs')],
        ['python3', str(PACKETS['clock'] / 'prepare-p041-clock-binding.py'), '--check'],
        ['python3', str(PACKETS['clock'] / 'check-p041-clock-conservation.py')],
        ['python3', str(PACKETS['host'] / 'check-host-resolution-v1.py'), '--check'],
        ['python3', str(PACKETS['behavior'] / 'check-behavior-ir-draft-v1.py'), '--check'],
    ]
    for argv in commands:
        subprocess.run(argv, cwd=ROOT, check=True, stdout=subprocess.DEVNULL)


def main():
    assert sys.argv[1:] in (['--write'], ['--check']), 'usage: --write | --check'
    write = sys.argv[1] == '--write'
    assert digest(checked(SOURCE)) == PINS['source']
    verify_producers()
    facts = json.loads(checked(PACKETS['triage'] / 'source-facts-v1.json', PINS['facts']))
    canvas_manifest = json.loads(checked(PACKETS['canvas'] / 'canvas-manifest-v1.json'))
    audio_plan = json.loads(checked(PACKETS['audio'] / 'source-audio-plan-v1.json', PINS['audioPlan']))
    assert facts['animationId'] == canvas_manifest['animationId'] == audio_plan['animationId'] == ID
    assert facts['physicalSource']['swf']['sha256'] == PINS['source']
    files = [
        ('triage', 'source-facts-v1.json', 'audit/source-v1/source-facts-v1.json', PINS['facts']),
        ('triage', 'swfmill.xml', 'audit/source-v1/swfmill.xml', PINS['xml']),
        ('native', 'native-model-v1.json', 'native-v1/native-model-v1.json', PINS['native']),
        ('native', 'clip-plan-v1.json', 'native-v1/clip-plan-v1.json', PINS['clip']),
        ('canvas', 'canvas-renderer-draft.js', 'canvas-v1/canvas-renderer.js', PINS['canvas']),
        ('canvas', 'canvas-metadata-v1.json', 'canvas-v1/canvas-metadata-v1.json', PINS['canvasMetadata']),
        ('audio', 'source-audio-plan-v1.json', 'audio-source-v1/source-audio-plan-v1.json', PINS['audioPlan']),
        ('audio', 'stream-frame-block-schedule-v1.json', 'audio-source-v1/stream-frame-block-schedule-v1.json', PINS['schedule']),
        ('clock', 'p041-frame-sample-clock-ir-v1.json', 'audio-source-v1/frame-sample-clock-ir-v1.json', PINS['clock']),
        ('clock', 'p041-measured-bindings-v1.ts', 'audio-source-v1/measured-bindings-v1.ts', PINS['bindings']),
        ('host', 'host-resolution-v1.json', 'behavior-v1/conditional-host-resolution-v1.json', PINS['hostResolution']),
        ('host', 'host-actionscript/frame_35/DoAction.as', 'behavior-v1/conditional-host-frame35.as', PINS['hostAction']),
        ('behavior', 'behavior-ir-draft-v1.json', 'behavior-v1/behavior-ir-draft-v1.json', PINS['behavior']),
    ]
    for row in audio_plan['streams']:
        asset = row['asset']
        files.append(('audio', asset['path'], 'audio-source-v1/' + asset['path'], asset['sha256']))
    separate = audio_plan['separateSA']['asset']
    files.append(('audio', separate['path'], 'audio-source-v1/' + separate['path'], separate['sha256']))
    result = [copy_exact(PACKETS[packet] / source, TARGET / target, expected, write)
              for packet, source, target, expected in files]
    measured = checked(PACKETS['clock'] / 'p041-measured-bindings-v1.ts', PINS['bindings'])
    before = b"from '../../packages/demos/src/decoded-source-stream-transport';"
    assert measured.count(before) == 1
    maintained = measured.replace(before, b"from './decoded-source-stream-transport';")
    binding_target = ROOT / 'packages/demos/src/alg-l06-p041-measured-bindings-v1.ts'
    assert not binding_target.is_symlink()
    if write and not binding_target.exists():
        with binding_target.open('xb') as output:
            output.write(maintained)
    assert physical(binding_target) == maintained
    result.append({'path': str(binding_target.relative_to(ROOT)), 'bytes': len(maintained),
                   'sha256': digest(maintained)})
    by_path = {row['path']: row for row in result}
    normal = {}
    names = {
        'sourceFacts': 'audit/source-v1/source-facts-v1.json',
        'nativeModel': 'native-v1/native-model-v1.json',
        'clipPlan': 'native-v1/clip-plan-v1.json',
        'canvasMetadata': 'canvas-v1/canvas-metadata-v1.json',
        'canvasRenderer': 'canvas-v1/canvas-renderer.js',
        'audioPlan': 'audio-source-v1/source-audio-plan-v1.json',
        'audioSchedule': 'audio-source-v1/stream-frame-block-schedule-v1.json',
        'clockIr': 'audio-source-v1/frame-sample-clock-ir-v1.json',
        'measuredBindings': 'audio-source-v1/measured-bindings-v1.ts',
        'hostResolution': 'behavior-v1/conditional-host-resolution-v1.json',
        'hostAction': 'behavior-v1/conditional-host-frame35.as',
        'behaviorDraft': 'behavior-v1/behavior-ir-draft-v1.json',
    }
    for name, relative in names.items():
        row = by_path[str((TARGET / relative).relative_to(ROOT))]
        normal[name] = row
    physical_source = facts['physicalSource']
    physical_pins = {}
    for name, key in [('swf', 'swf'), ('xml', 'indexXml'), ('sa', 'separateSA')]:
        source_pin = physical_source[key]
        path = Path(source_pin['path'])
        assert path.is_relative_to(SOURCE_ROOT), path
        raw = checked(path, source_pin['sha256'])
        assert len(raw) == source_pin['bytes']
        physical_pins[name] = {'path': str(path.relative_to(SOURCE_ROOT)),
                               'bytes': len(raw), 'sha256': digest(raw)}
    source_binding = {'physical': physical_pins, **normal}
    source_binding_bytes = ("/** Generated by scripts/prepare-alg-l06-p041-maintained-v1.py. */\n"
                            "export const P041_SOURCE_BINDING = " +
                            json.dumps(source_binding, indent=2, ensure_ascii=False) +
                            " as const;\n").encode('utf-8')
    source_binding_target = ROOT / 'apps/web/lib/alg-l06-p041-source-binding-v1.ts'
    assert not source_binding_target.is_symlink()
    if write and not source_binding_target.exists():
        with source_binding_target.open('xb') as output:
            output.write(source_binding_bytes)
    assert physical(source_binding_target) == source_binding_bytes
    result.append({'path': str(source_binding_target.relative_to(ROOT)),
                   'bytes': len(source_binding_bytes), 'sha256': digest(source_binding_bytes)})
    print(json.dumps({'mode': sys.argv[1], 'animationId': ID, 'files': len(result),
                      'bytes': sum(x['bytes'] for x in result), 'sourceSha256': PINS['source']}, sort_keys=True))


if __name__ == '__main__':
    main()
