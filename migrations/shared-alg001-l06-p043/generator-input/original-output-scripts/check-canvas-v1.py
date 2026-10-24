#!/usr/bin/env python3
"""Pin P043 full-frame raw FFDec Canvas extraction, output-only."""
from hashlib import sha256
import json
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SWF = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/TI/L6TI03.swf')
XML = ROOT/'output/g678-p043-source-intake-20261002-v1/audit/swfmill.xml'
NATIVE = HERE.parent/'native/native-model-v1.json'
EXPORT = HERE/'source-export'
STDOUT, STDERR = HERE/'ffdec-stdout.txt', HERE/'ffdec-stderr.txt'
MANIFEST = HERE/'canvas-extraction-v1.json'
COMMAND = ['ffdec', '-config', 'packJavaScripts=false', '-onerror', 'abort',
           '-format', 'frame:canvas,sprite:canvas', '-export', 'frame,sprite']
EXPECTED = {
    SWF: '8bec405895d09cc8f7dd9f0da197f67726cb45cab6cc8dec3d15b103bc04a97b',
    XML: 'b4a018ccd7c0b5a9b3ef89a623210a6e3da89c59e69da69c7bd353d4cc8f6597',
    NATIVE: '158cc7f897d0d23fd55ca87536fba851080e0c26996d69a43eb9e910ce5dae9c',
}


def digest(raw): return sha256(raw).hexdigest()


def pin(path):
    assert path.is_file() and not path.is_symlink(), path
    before = path.stat()
    raw = path.read_bytes()
    after = path.stat()
    assert before.st_nlink == 1 and (before.st_dev, before.st_ino, before.st_size,
        before.st_mtime_ns, before.st_ctime_ns) == (after.st_dev, after.st_ino,
        after.st_size, after.st_mtime_ns, after.st_ctime_ns), path
    if path in EXPECTED:
        assert digest(raw) == EXPECTED[path], path
    return raw, {'path': str(path), 'bytes': len(raw), 'sha256': digest(raw)}


def cases(text, function):
    start = re.search(r'function\s+' + re.escape(function) + r'\(', text)
    assert start, function
    end = re.search(r'\nfunction\s+', text[start.end():])
    assert end, function
    body = text[start.start():start.end()+end.start()]
    return [int(x) for x in re.findall(r'\bcase\s+(\d+)\s*:', body)]


def build():
    _, swf_pin = pin(SWF)
    xmlraw, xml_pin = pin(XML)
    native_raw, native_pin = pin(NATIVE)
    stdout, stdout_pin = pin(STDOUT)
    stderr, stderr_pin = pin(STDERR)
    assert b'JPEXS Free Flash Decompiler v.26.2.1' in stdout
    assert stdout.rstrip().endswith(b'OK') and not stderr
    root = ET.fromstring(xmlraw)
    native = json.loads(native_raw)
    assert native['animationId'] == 'shared-alg001-l06-p043'
    assert native['root']['animationSpriteId'] == 342
    frames = {int(n.get('objectID')): int(n.get('frames')) for n in root.iter('DefineSprite')}
    assert len(frames) == 35 and frames[342] == 241
    dirs = [p for p in (EXPORT/'sprites').iterdir() if p.is_dir()]
    assert len(dirs) == 35
    by_id = {}
    for folder in dirs:
        match = re.fullmatch(r'DefineSprite_(\d+)(?:_.+)?', folder.name)
        assert match, folder
        sprite_id = int(match.group(1))
        assert sprite_id not in by_id and sprite_id in frames
        by_id[sprite_id] = folder
    assert set(by_id) == set(frames)
    files = sorted(p for p in EXPORT.rglob('*') if p.is_file() or p.is_symlink())
    assert len(files) == 72 and not any(p.is_symlink() for p in files)
    file_pins = {p.relative_to(EXPORT).as_posix(): pin(p)[1] for p in files}
    assert cases((EXPORT/'frames/frames.html').read_text(), 'main') == list(range(10))
    for sprite_id, frame_count in frames.items():
        assert cases((by_id[sprite_id]/'frames.html').read_text(),
                     f'sprite{sprite_id}') == list(range(frame_count)), sprite_id
    root_html = (EXPORT/'frames/frames.html').read_text()
    main_html = (by_id[342]/'frames.html').read_text()
    right_html = (by_id[202]/'frames.html').read_text()
    assert '<canvas id="myCanvas" width="800" height="600"' in root_html
    assert 'place("sprite342",canvas,ctx,[0.05,0.0,0.0,0.05,412.4,283.3]' in root_html
    assert right_html.count('place("shape177"') == 7
    assert len(re.findall(r'function morphshape\d+\(', main_html)) == 46
    assert len(re.findall(r'var imageObj\d+ = document.createElement\("img"\)', main_html)) == 14
    for text_id in (287, 303, 317, 333):
        assert re.search(r'function text'+str(text_id)+r'\(ctx,ctrans,frame,ratio,time\)\{\s*\}',
                         main_html), text_id
    total = sum(row['bytes'] for row in file_pins.values())
    result = {'schemaVersion': 1, 'kind': 'p043-output-only-full-frame-canvas-extraction-v1',
        'animationId': 'shared-alg001-l06-p043',
        'status': 'raw-source-export-only-renderer-blocked',
        'physicalSwf': swf_pin, 'swfmillXml': xml_pin, 'nativeModel': native_pin,
        'tool': 'JPEXS Free Flash Decompiler v.26.2.1',
        'command': COMMAND+[str(EXPORT), str(SWF)],
        'exportStdout': stdout_pin, 'exportStderr': stderr_pin,
        'rawFiles': file_pins, 'rawFileCount': len(file_pins), 'rawBytesTotal': total,
        'frameCoverage': {'rootCasesZeroBased': 10,
            'spriteCasesZeroBased': {str(k): v for k, v in sorted(frames.items())},
            'totalCases': 10+sum(frames.values()), 'mainSpriteId': 342,
            'quizHoldSourceFrameOneBased': 62, 'mainTerminalSourceFrameOneBased': 241},
        'graphicsInventory': {'staticTexts': 99,
            'readOnlyDynamicTextsMissingFromRawCanvas': [287, 303, 317, 333],
            'shapeDefinitions': 114, 'morphFunctions': 46,
            'embeddedImageVariables': 14, 'maskShapeId': 177,
            'maskOwnerSpriteId': 202, 'maskFramesOneBased': [2, 8],
            'maskSourceClipDepth': 7, 'maskRawPlacementCases': 7},
        'adapterPlan': {'main': 'explicit 1–241 main-frame request; no FFDec viewer autoplay',
            'feedback': 'only sprite202 right4 or sprite307 wrong4 after source answer selection',
            'dynamicText': 'native text companion for blank EditText functions',
            'mask': 'normalize shape177 clipDepth=7 under the right4 conditional path',
            'audio': 'separate main/right4/wrong4 stream clocks; SA explicit user action',
            'host': 'quiz, NMH, glossary, Replay and navigation from maintained state'},
        'failClosed': {'maintainedRendererReady': False,
            'reasons': ['raw FFDec viewer does not execute AVM1',
                'dynamic EditText functions are empty',
                'right4 clip-depth mask needs normalization',
                'audio source-frame synchronization is unresolved',
                'physical right4 sprite has 386 unexplained bytes after End',
                'browser graphics and original runtime are unverified']},
        'gates': {'currentJsRegistered': False, 'browserVerified': False,
            'fidelityAccepted': False, 'audioAccepted': False, 'strictComplete': False}}
    return (json.dumps(result, indent=2)+'\n').encode(), result


def reexport(expected):
    with tempfile.TemporaryDirectory(prefix='p043-canvas-recheck-', dir=HERE) as tmp:
        target = Path(tmp)/'source-export'
        run = subprocess.run(COMMAND+[str(target), str(SWF)], cwd=ROOT,
                             capture_output=True, text=True, check=True)
        assert run.stderr == '' and run.stdout.rstrip().endswith('OK')
        found = {p.relative_to(target).as_posix(): p for p in target.rglob('*') if p.is_file()}
        assert set(found) == set(expected)
        for name, file in found.items():
            assert file.read_bytes() == (EXPORT/name).read_bytes(), name


def main():
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('usage: --write | --check')
    raw, result = build()
    if sys.argv[1:] == ['--write']:
        with MANIFEST.open('xb') as output:
            output.write(raw)
    assert MANIFEST.read_bytes() == raw, 'manifest drift'
    reexport(result['rawFiles'])
    print(json.dumps({'mode': sys.argv[1], 'manifestSha256': digest(raw),
        'rawFiles': result['rawFileCount'], 'rawBytes': result['rawBytesTotal'],
        'cases': result['frameCoverage']['totalCases']}, sort_keys=True))


if __name__ == '__main__':
    main()
