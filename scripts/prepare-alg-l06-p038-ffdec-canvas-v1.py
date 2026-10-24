#!/usr/bin/env python3
"""Regenerate/check the FFDec Canvas source cache from the physical P038 SWF."""
from hashlib import sha256
import json
from pathlib import Path
import re
import shutil
import stat
import subprocess
import sys
import tempfile

WORKTREE = Path(__file__).resolve().parents[1]
HERE = WORKTREE / 'work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1'
TRIAGE = WORKTREE / 'migrations/shared-alg001-l06-p038/audit/source-v1'
NATIVE = WORKTREE / 'migrations/shared-alg001-l06-p038/native-v1/native-model-v1.json'
CANVAS_PROVENANCE = Path('output/alg-l06-p038-canvas-source-preparation-20261001-v1')
TRIAGE_PROVENANCE = Path('output/alg-l06-p038-source-triage-20261001-v1')
NATIVE_PROVENANCE = Path('output/alg-l06-p038-native-source-preparation-20261001-v1/native-model-v1.json')
FROZEN_EXPORT = WORKTREE / 'migrations/shared-alg001-l06-p038/audit/source-v1/ffdec-canvas-provenance'
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN10.swf')
EXPORT = HERE / 'source-canvas-export'
STDOUT = HERE / 'ffdec-export-stdout.txt'
STDERR = HERE / 'ffdec-export-stderr.txt'
RECEIPT = HERE / 'canvas-source-export-v1.json'
RAW_PATHS = ('frames/canvas.js', 'frames/frames.html',
             'sprites/DefineSprite_67/canvas.js',
             'sprites/DefineSprite_67/frames.html')
COMMAND = ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort',
           '-format', 'frame:canvas,sprite:canvas', '-export', 'frame,sprite']
SOURCE_SHA = 'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de'
FACTS_SHA = 'e6df1089aaa9274d1eb3b9771d39e5e3d8cf54c6761050eff0acc00fa9a3f04e'
NATIVE_SHA = '5fe165f369a84e7e08a0b4fbf6de921c40e9cd4f5367a647c9fc70186d26e13f'


def digest(data):
    return sha256(data).hexdigest()


def pin(path):
    before = path.lstat()
    assert stat.S_ISREG(before.st_mode) and before.st_nlink == 1, path
    raw = path.read_bytes()
    after = path.lstat()
    fields = ('st_dev', 'st_ino', 'st_mode', 'st_size', 'st_mtime_ns', 'st_ctime_ns', 'st_nlink')
    assert all(getattr(before, f) == getattr(after, f) for f in fields), path
    if path.is_relative_to(HERE):
        label = CANVAS_PROVENANCE / path.relative_to(HERE)
    elif path.is_relative_to(TRIAGE):
        label = TRIAGE_PROVENANCE / path.relative_to(TRIAGE)
    elif path == NATIVE:
        label = NATIVE_PROVENANCE
    else:
        label = path.relative_to(WORKTREE) if path.is_relative_to(WORKTREE) else path
    return {'path': str(label),
            'bytes': len(raw), 'sha256': digest(raw)}


def ensure_logs(stdout, stderr):
    assert 'JPEXS Free Flash Decompiler v.26.2.1' in stdout
    assert 'Exported canvas 1/1 DefineSprite (chid: 67)' in stdout
    assert stdout.count('Exported canvas 1/1 DefineSprite (chid: 67)') == 1
    assert 'Export finished.' in stdout and stdout.rstrip().endswith('OK')
    assert stderr == ''


def cases(source, name):
    marker = re.search(r'function\s+' + re.escape(name) + r'\(', source)
    assert marker, name
    next_function = re.search(r'\nfunction\s+', source[marker.end():])
    stop = marker.end() + next_function.start() if next_function else len(source)
    return [int(x) for x in re.findall(r'\bcase\s+(\d+)\s*:', source[marker.start():stop])]


def inspect():
    source_pin = pin(SOURCE)
    facts_pin = pin(TRIAGE / 'source-facts-v1.json')
    xml_pin = pin(TRIAGE / 'swfmill.xml')
    native_pin = pin(NATIVE)
    assert (source_pin['bytes'], source_pin['sha256']) == (125928, SOURCE_SHA)
    assert facts_pin['sha256'] == FACTS_SHA
    assert (xml_pin['bytes'], xml_pin['sha256']) == (
        606070, '95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14')
    assert native_pin['sha256'] == NATIVE_SHA
    facts = json.loads((TRIAGE / 'source-facts-v1.json').read_bytes())
    native = json.loads(NATIVE.read_bytes())
    assert facts['animationId'] == native['animationId'] == 'shared-alg001-l06-p038'
    assert facts['physicalSource']['swf']['sha256'] == source_pin['sha256']
    assert native['source']['physicalSwf']['sha256'] == source_pin['sha256']
    assert facts['binary']['rootFrames'] == 13
    assert facts['binary']['spriteId'] == 67 and facts['binary']['spriteFrames'] == 409
    assert native['root']['beginFrame'] == 6
    assert native['root']['placement']['matrixTwips']['transX'] == 8248
    assert native['root']['placement']['matrixTwips']['transY'] == 6466
    assert len(native['textDefinitions']) == 38
    assert len(native['buttonBindings']) == len(native['buttonDefinitions']) == 7
    assert len(native['clipMaskPlacements']) == 10
    actual = sorted(p.relative_to(EXPORT).as_posix() for p in EXPORT.rglob('*') if p.is_file() or p.is_symlink())
    assert actual == sorted(RAW_PATHS), actual
    assert not any(p.is_symlink() for p in EXPORT.rglob('*'))
    raw_pins = {name: pin(EXPORT / name) for name in RAW_PATHS}
    stdout = STDOUT.read_text()
    stderr = STDERR.read_text()
    ensure_logs(stdout, stderr)
    root = (EXPORT / 'frames/frames.html').read_text()
    child = (EXPORT / 'sprites/DefineSprite_67/frames.html').read_text()
    assert cases(root, 'main') == list(range(13))
    assert cases(child, 'sprite67') == list(range(409))
    assert '<canvas id="myCanvas" width="800" height="600"' in root
    assert '<canvas id="myCanvas" width="865" height="373"' in child
    child_header = re.search(
        r'function sprite67\(ctx,ctrans,frame,ratio,time\)\{\s*ctx\.save\(\);\s*ctx\.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);',
        child)
    assert child_header and tuple(map(float, child_header.groups())) == (522.75, 229.35)
    root_placement = 'place("sprite67",canvas,ctx,[0.05,0.0,0.0,0.05,412.4,323.3],ctrans,1,(0+time)%409,5,time);'
    assert root.count(root_placement) >= 1
    assert 'place("shape1",canvas,ctx,[0.05,0.0,0.0,0.05,0.0,0.0],ctrans,1,0,0,time);' in root
    text_ids = sorted(int(x) for x in re.findall(r'\bfunction text(\d+)\(', child))
    button_ids = sorted(int(x) for x in re.findall(r'\bfunction button(\d+)\(', child))
    expected_text = sorted(int(x) for x in native['textDefinitions'])
    expected_buttons = sorted(int(x) for x in native['buttonDefinitions'])
    assert text_ids == expected_text and len(text_ids) == 38
    assert button_ids == expected_buttons == [49, 52, 53, 57, 60, 64, 66]
    for button_id in button_ids:
        assert 'place("button' + str(button_id) + '"' in child
    placed = sorted(set(re.findall(r'place\("([A-Za-z_$][A-Za-z0-9_$]*)"', child)))
    defined = sorted(set(re.findall(r'\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\(', child)))
    assert all(name in defined for name in placed)
    assert 'sprite67' in defined and 'shape45' in defined
    masks = native['clipMaskPlacements']
    assert all(x['objectId'] == 45 and x['startFrame'] >= 166 for x in masks)
    return {'schemaVersion': 1, 'kind': 'p038-ffdec-source-canvas-export-v1',
            'status': 'source-export-only', 'animationId': facts['animationId'],
            'tool': 'JPEXS Free Flash Decompiler v.26.2.1',
            'command': [*COMMAND, str(CANVAS_PROVENANCE / 'source-canvas-export'), str(SOURCE)],
            'physicalSource': source_pin, 'sourceFacts': facts_pin,
            'sourceXml': xml_pin, 'nativeSourceContract': native_pin,
            'ffdecStdout': pin(STDOUT), 'ffdecStderr': pin(STDERR),
            'rawCanvasFiles': raw_pins,
            'root': {'sourceFrames': 13, 'beginFrame': 6, 'entrySpriteId': 67,
                     'placementTwips': {'x': 8248, 'y': 6466},
                     'ffdecPlacementPixels': {'x': 412.4, 'y': 323.3}},
            'child': {'spriteId': 67, 'sourceFrames': 409,
                      'ffdecCasesZeroBased': 409,
                      'standaloneCanvas': {'width': 865, 'height': 373},
                      'exportInternalTranslation': {'x': 522.75, 'y': 229.35},
                      'textCharacterIds': text_ids, 'buttonCharacterIds': button_ids,
                      'placedFunctions': placed, 'placedFunctionsSha256': digest(json.dumps(placed,separators=(',',':')).encode()),
                      'definedFunctions': defined,
                      'tenClipDepthMasksUncalibrated': True},
            'acceptanceEffect': 'none',
            'limits': ['FFDec Canvas exports drawing functions; they do not execute source AVM1 actions, old-host DoHyperLinks, embedded audio or button hit behavior.',
                       'Ten source clipDepth masks and the FFDec-to-native visual transform are not browser-calibrated.',
                       'No original runtime, fidelity, listening, product registration, human or Owner acceptance follows.']}


def reexport_check():
    with tempfile.TemporaryDirectory(prefix='reexport-', dir=HERE) as temp:
        target = Path(temp) / 'canvas'
        result = subprocess.run([*COMMAND, str(target), str(SOURCE)],
                                cwd=WORKTREE, capture_output=True, text=True, check=True)
        ensure_logs(result.stdout, result.stderr)
        actual = sorted(p.relative_to(target).as_posix() for p in target.rglob('*') if p.is_file())
        assert actual == sorted(RAW_PATHS)
        for name in RAW_PATHS:
            assert (target / name).read_bytes() == (EXPORT / name).read_bytes(), name


def main():
    assert sys.argv[1:] in (['--write'], ['--check']), 'Usage: --write | --check'
    mode = sys.argv[1]
    if mode == '--write':
        HERE.mkdir(parents=True, exist_ok=True)
    if mode == '--write' and not EXPORT.exists():
        with tempfile.TemporaryDirectory(prefix='initial-', dir=HERE) as temp:
            target = Path(temp) / 'canvas'
            result = subprocess.run([*COMMAND, str(target), str(SOURCE)],
                                    cwd=WORKTREE, capture_output=True, text=True, check=True)
            ensure_logs(result.stdout, result.stderr)
            shutil.copytree(target, EXPORT, symlinks=False)
    for name, target, expected in (
        ('ffdec-export-stdout.txt', STDOUT,
         '7c01d03b429d1094b32e579d896a4494ad93384aa64811706a88cafa8bb22e7f'),
        ('ffdec-export-stderr.txt', STDERR,
         'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'),
    ):
        frozen = (FROZEN_EXPORT / name).read_bytes()
        assert digest(frozen) == expected
        if mode == '--write' and not target.exists():
            with target.open('xb') as stream:
                stream.write(frozen)
        assert target.read_bytes() == frozen, name
    value = inspect()
    encoded = (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()
    if mode == '--write' and not RECEIPT.exists():
        assert (FROZEN_EXPORT / RECEIPT.name).read_bytes() == encoded
        with RECEIPT.open('xb') as stream:
            stream.write(encoded)
    assert RECEIPT.read_bytes() == encoded, 'receipt drift'
    reexport_check()
    print(json.dumps({'status': 'pass', 'mode': mode, 'receiptSha256': digest(encoded),
                      'sourceFrames': 409, 'textFunctions': 38, 'buttonFunctions': 7,
                      'rawCanvasFiles': len(RAW_PATHS)}, sort_keys=True))


if __name__ == '__main__':
    main()
