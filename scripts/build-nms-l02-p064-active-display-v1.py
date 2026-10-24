#!/usr/bin/env python3
"""Resolve the P064 main sprite's SWF display list without running Flash code.

This is a static source artifact, not a natural trace or approved visual copy.
"""

import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
SOURCE_RELATIVE = Path('G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf')
SOURCE_SHA = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'
IR_PATH = ROOT / 'migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json'
IR_SHA = 'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350'
OUTPUT = ROOT / 'migrations/shared-nms002-l02-p064/audit/active-display-list-v1.json'


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_source():
    require(os.environ.get('HELP_MATH_G678_SOURCE_ROOT') == str(SOURCE_ROOT),
            'exact real source root required')
    require(SOURCE_ROOT.is_dir() and not SOURCE_ROOT.is_symlink() and SOURCE_ROOT.resolve() == SOURCE_ROOT,
            'source root must be a real directory')
    source = SOURCE_ROOT / SOURCE_RELATIVE
    require(source.is_file() and not source.is_symlink(), 'exact source SWF required')
    source_bytes = source.read_bytes()
    require(len(source_bytes) == 55392 and digest(source_bytes) == SOURCE_SHA, 'source SWF changed')
    return source


def build(xml_path, ir):
    root = ET.parse(xml_path).getroot()
    definitions = {int(tag.get('objectID')): tag for tag in root.find('./Header/tags')
                   if tag.tag.startswith('Define') and tag.get('objectID')}
    sprite = definitions[1258]
    require(sprite.tag == 'DefineSprite', 'main quiz sprite changed')
    texts = {}
    for question in ir['questions']:
        for placement in question['frameDeltaPlacements']:
            if 'rawText' in placement:
                symbol_id = placement['symbolId']
                require(symbol_id not in texts or texts[symbol_id] == placement['rawText'],
                        'text symbol has conflicting source values')
                texts[symbol_id] = placement['rawText']
    # Every direct text symbol used in the teaching frames must be indexed in the v1 IR.
    frames = []
    active = {}
    label = None
    move_updates = 0
    matrixless_replacements = 0
    for tag in sprite.find('tags'):
        if tag.tag == 'FrameLabel':
            label = tag.get('label')
        elif tag.tag == 'RemoveObject2':
            depth = int(tag.get('depth'))
            require(depth in active, f'removal at unoccupied depth {depth}')
            del active[depth]
        elif tag.tag == 'PlaceObject2':
            depth = int(tag.get('depth'))
            transform = tag.find('./transform/Transform')
            color = tag.find('./colorTransform/ColorTransform2')
            if tag.get('objectID'):
                symbol_id = int(tag.get('objectID'))
                require(symbol_id in definitions, f'undefined symbol {symbol_id}')
                previous = active.get(depth)
                replacing = tag.get('replace') == '1'
                require(not replacing or previous is not None,
                        f'replacement at unoccupied depth {depth}')
                require(replacing or previous is None,
                        f'new placement at occupied depth {depth}')
                require(transform is not None or replacing,
                        f'new placement without matrix at depth {depth}')
                placement = {'depth': depth, 'symbolId': symbol_id,
                             'kind': definitions[symbol_id].tag, 'name': tag.get('name'),
                             'originFrame': len(frames) + 1,
                             'transform': (transform.attrib if transform is not None
                                           else previous['transform'])}
                if transform is None:
                    matrixless_replacements += 1
                    placement['transformInheritedFromSymbolId'] = previous['symbolId']
                    placement['transformInheritedFromFrame'] = previous.get(
                        'lastMoveFrame', previous['originFrame'])
                if color is not None:
                    placement['colorTransform'] = color.attrib
                elif replacing and 'colorTransform' in previous:
                    placement['colorTransform'] = previous['colorTransform']
                if symbol_id in texts:
                    placement['rawText'] = texts[symbol_id]
                active[depth] = placement
            else:
                require(depth in active, f'move update at unoccupied depth {depth}')
                require(transform is not None or color is not None or tag.get('name'),
                        'empty move update')
                placement = dict(active[depth])
                if transform is not None:
                    placement['transform'] = transform.attrib
                if color is not None:
                    placement['colorTransform'] = color.attrib
                if tag.get('name'):
                    placement['name'] = tag.get('name')
                placement['lastMoveFrame'] = len(frames) + 1
                active[depth] = placement
                move_updates += 1
        elif tag.tag == 'ShowFrame':
            frame_number = len(frames) + 1
            if label and (label.startswith('Q') or label.startswith('R')):
                frames.append({'frame': frame_number, 'label': label,
                               'placements': [active[d] for d in sorted(active)]})
            else:
                frames.append({'frame': frame_number, 'label': label, 'placements': None})
            label = None
    # The v1 IR counts only moves in Q/R labelled frames. The main sprite also
    # moves items in its intro, review entry, and result frames.
    require(len(frames) == 90 and move_updates == 27 and matrixless_replacements == 151,
            'main sprite frame, move, or matrixless replacement count changed')
    selected = {frame['label']: frame for frame in frames if frame['label']}
    questions = []
    for question in ir['questions']:
        question_id = question['questionId']
        q = selected[f'Q{question_id}']
        r = selected[f'R{question_id}']
        require(q['frame'] == question['questionFrame'] and r['frame'] == question['reviewFrame'],
                'question/review frame changed')
        option_names = {entry['instance']['name'] for entry in question['options']}
        active_option_names = {entry['name'] for entry in q['placements'] if entry['name'] in option_names}
        require(active_option_names == option_names, f'Q{question_id} option display list changed')
        direct_depths = {entry['depth'] for entry in question['frameDeltaPlacements']}
        inherited = [entry for entry in q['placements']
                     if entry['depth'] not in direct_depths and entry['originFrame'] < q['frame']]
        questions.append({
            'questionId': question_id,
            'questionFrame': q['frame'],
            'activePlacements': q['placements'],
            'inheritedPlacements': inherited,
            'reviewFrame': r['frame'],
            'reviewActivePlacements': r['placements'],
        })
    return {
        'schemaVersion': 1,
        'animationId': 'shared-nms002-l02-p064',
        'authority': 'static-swf-display-list-only',
        'source': {'relativePath': str(SOURCE_RELATIVE), 'sha256': SOURCE_SHA},
        'questionContentIrSha256': IR_SHA,
        'mainSprite': {'symbolId': 1258, 'frames': 90, 'moveOnlyUpdates': move_updates,
                       'matrixlessReplacements': matrixless_replacements},
        'questions': questions,
        'limitations': [
            'Active placements are statically resolved SWF tags, not a Flash-host natural trace.',
            'Replacement tags without a matrix carry the prior depth matrix as a static inference; original Flash runtime is not observed.',
            'Inherited text may be mutated by ActionScript; rawText is a symbol default, not runtime copy.',
            'Nested sprite state, host media, accessibility, and visual fidelity are not established.',
        ],
    }


def main():
    mode = sys.argv[1:]
    require(mode in (['--build'], ['--check']), 'use --build or --check')
    source = read_source()
    ir_bytes = IR_PATH.read_bytes()
    require(digest(ir_bytes) == IR_SHA, 'question-content IR changed')
    ir = json.loads(ir_bytes)
    with tempfile.TemporaryDirectory(prefix='g678-p064-active-display-') as temporary:
        xml_path = Path(temporary) / 'movie.xml'
        subprocess.run(['swfmill', 'swf2xml', str(source), str(xml_path)], check=True,
                       capture_output=True, text=True)
        value = build(xml_path, ir)
    output = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    if mode == ['--build']:
        with OUTPUT.open('xb') as target:
            target.write(output)
    else:
        require(OUTPUT.read_bytes() == output, 'P064 active display list drift')
    print(json.dumps({'status': 'PASS', 'mode': mode[0], 'sha256': digest(output),
                      'questions': len(value['questions']), 'bytes': len(output)}))


if __name__ == '__main__':
    main()
