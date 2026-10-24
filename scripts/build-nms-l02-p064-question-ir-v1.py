#!/usr/bin/env python3
"""Build a source-locked structural IR for the 35 NMS002 L2 P064 quiz items.

This records SWF text/symbol placements, not accepted runtime, audio, or copy.
"""

import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parent.parent
SOURCE_ROOT = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware')
SOURCE_RELATIVE = Path('G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf')
SOURCE_SHA = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'
CONTRACT = ROOT / 'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json'
CONTRACT_SHA = '943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5'
OUTPUT = ROOT / 'migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json'
OPTION_NAME = re.compile(r'A\d+Opt[1-4] *\Z')
REVIEW_NAME = re.compile(r'R\d+Opt[1-4] *\Z')
TEXT_KINDS = {'DefineText', 'DefineText2', 'DefineEditText'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def sha(data):
    return hashlib.sha256(data).hexdigest()


def command(args):
    result = subprocess.run(args, check=True, capture_output=True, text=True)
    return result.stdout


def frame_rows(sprite):
    frames = []
    label, rows = None, []
    for tag in sprite.find('tags'):
        if tag.tag == 'FrameLabel':
            label = tag.get('label')
        elif tag.tag == 'ShowFrame':
            frames.append((len(frames) + 1, label, rows))
            label, rows = None, []
        else:
            rows.append(tag)
    require(len(frames) == 90, 'P064 main sprite must have 90 frames')
    return frames


def build(xml_path, text_directory, contract):
    root = ET.parse(xml_path).getroot()
    definitions = {
        int(tag.get('objectID')): tag
        for tag in root.find('./Header/tags')
        if tag.tag.startswith('Define') and tag.get('objectID')
    }
    require(definitions[1258].tag == 'DefineSprite', 'main quiz sprite changed')
    text_ids = {symbol_id for symbol_id, tag in definitions.items() if tag.tag in TEXT_KINDS}
    exported = {int(file.stem) for file in text_directory.glob('*.txt')}
    require(len(text_ids) == 649 and exported == text_ids, 'FFDec text definitions changed')
    frames = frame_rows(definitions[1258])
    by_label = {label: (number, rows) for number, label, rows in frames if label}
    require(len([label for label in by_label if re.fullmatch(r'Q\d+', label)]) == 35, 'Q labels changed')
    require(len([label for label in by_label if re.fullmatch(r'R\d+', label)]) == 35, 'R labels changed')
    require(by_label['Review'][0] == 38, 'review entry frame changed')

    def placement(tag):
        symbol_id = int(tag.get('objectID'))
        definition = definitions[symbol_id]
        transform = tag.find('./transform/Transform')
        record = {
            'symbolId': symbol_id,
            'depth': int(tag.get('depth')),
            'kind': definition.tag,
            'name': tag.get('name'),
            'transform': transform.attrib if transform is not None else {},
        }
        if symbol_id in text_ids:
            record['rawText'] = (text_directory / f'{symbol_id}.txt').read_text(encoding='utf-8')
        return record

    def placements(rows):
        return [placement(tag) for tag in rows if tag.tag == 'PlaceObject2' and tag.get('objectID')]

    def move_updates(rows):
        updates = []
        for tag in rows:
            if tag.tag != 'PlaceObject2' or tag.get('objectID'):
                continue
            transform = tag.find('./transform/Transform')
            updates.append({'attributes': tag.attrib,
                            'transform': transform.attrib if transform is not None else {}})
        return updates

    questions = []
    anomalies = []
    review_anomalies = []
    review_lookup_misses = []
    for question_id in range(1, 36):
        frame, rows = by_label[f'Q{question_id}']
        require(frame == question_id + 1, f'Q{question_id} frame moved')
        direct = placements(rows)
        option_placements = [entry for entry in direct if entry['name'] and OPTION_NAME.fullmatch(entry['name'])]
        require(len(option_placements) == 4, f'Q{question_id} needs four source option sprites')
        options = []
        for instance in option_placements:
            require(instance['kind'] == 'DefineSprite', f'Q{question_id} option is not a sprite')
            children = placements(definitions[instance['symbolId']].find('tags'))
            labels = [child['rawText'].strip() for child in children
                      if child['kind'] in TEXT_KINDS and child['rawText'].strip() in ('A', 'B', 'C', 'D')]
            require(len(labels) == 1, f'Q{question_id} option letter is not unique')
            option = ord(labels[0]) - ord('A') + 1
            expected_name = f'A{question_id}Opt{option}'
            if instance['name'] != expected_name:
                anomalies.append({'questionId': question_id, 'option': option,
                                  'actual': instance['name'], 'expected': expected_name})
            options.append({'option': option, 'instance': instance, 'children': children})
        options.sort(key=lambda entry: entry['option'])
        require([entry['option'] for entry in options] == [1, 2, 3, 4],
                f'Q{question_id} letters must be A-D')
        review_frame, review_rows = by_label[f'R{question_id}']
        require(review_frame == question_id + 54, f'R{question_id} frame moved')
        review_options = [entry for entry in placements(review_rows)
                          if entry['name'] and REVIEW_NAME.fullmatch(entry['name'])]
        require(len(review_options) == 4, f'R{question_id} needs four review options')
        review_names = {entry['name'] for entry in review_options}
        for entry in review_options:
            expected = f'R{question_id}Opt{entry["name"][-1]}'
            if entry['name'] != expected:
                review_anomalies.append({'questionId': question_id, 'actual': entry['name'],
                                         'expected': expected})
        for option in options:
            clicked_name = option['instance']['name']
            computed_name = 'R' + clicked_name[1:]
            if computed_name not in review_names:
                review_lookup_misses.append({'questionId': question_id, 'option': option['option'],
                                             'clickedInstanceName': clicked_name,
                                             'computedReviewName': computed_name})
        questions.append({
            'questionId': question_id,
            'questionFrame': frame,
            'frameDeltaPlacements': direct,
            'frameMoveUpdates': move_updates(rows),
            'removedDepths': [int(tag.get('depth')) for tag in rows if tag.tag == 'RemoveObject2'],
            'options': options,
            'correctOption': contract['quiz']['correctOptions'][question_id - 1],
            'reviewFrame': review_frame,
            'reviewDeltaOptionPlacements': review_options,
            'reviewMoveUpdates': move_updates(review_rows),
            'reviewRemovedDepths': [int(tag.get('depth')) for tag in review_rows
                                    if tag.tag == 'RemoveObject2'],
        })
    require(len(anomalies) == 2, 'source option-name anomalies changed')
    require([(entry['questionId'], entry['option']) for entry in anomalies] == [(10, 4), (23, 3)],
            'source option-name anomalies changed')
    require([(entry['questionId'], entry['actual']) for entry in review_anomalies] ==
            [(21, 'R210Opt3')], 'review instance-name anomalies changed')
    require([(entry['questionId'], entry['option']) for entry in review_lookup_misses] ==
            [(10, 4), (21, 3), (23, 3)], 'legacy review lookup mismatches changed')
    move_only_count = sum(len(question['frameMoveUpdates']) + len(question['reviewMoveUpdates'])
                          for question in questions)
    require(move_only_count == 12, 'move-only frame updates changed')
    return {
        'schemaVersion': 1,
        'animationId': 'shared-nms002-l02-p064',
        'authority': 'static-source-structure-only',
        'source': {'relativePath': str(SOURCE_RELATIVE), 'sha256': SOURCE_SHA},
        'sourceQuizContractSha256': CONTRACT_SHA,
        'tools': {'swfmill': '0.3.6', 'ffdec': '26.2.1'},
        'mainSprite': {'symbolId': 1258, 'frames': 90, 'questionLabels': 35,
                       'reviewEntryFrame': 38, 'reviewLabels': 35,
                       'textDefinitions': 649, 'moveOnlyUpdates': move_only_count},
        'questions': questions,
        'instanceNameAnomalies': anomalies,
        'reviewNameAnomalies': review_anomalies,
        'sourceDerivedReviewLookupMisses': review_lookup_misses,
        'limitations': [
            'Frame placements are static structure; they are not an original-host natural trace.',
            'Raw text records and source symbol IDs are not accepted bilingual copy or accessible graphics.',
            'Review lookup misses are derived from source names and ActionScript, not observed runtime failures.',
            'No legacy URL, report, bookmark, or audio callback is executed by this extractor.',
        ],
    }


def main():
    mode = sys.argv[1:]
    require(mode in (['--build'], ['--check']), 'use --build or --check')
    require(os.environ.get('HELP_MATH_G678_SOURCE_ROOT') == str(SOURCE_ROOT), 'exact real source root required')
    require(SOURCE_ROOT.is_dir() and not SOURCE_ROOT.is_symlink() and SOURCE_ROOT.resolve() == SOURCE_ROOT,
            'source root must be a real directory')
    source = SOURCE_ROOT / SOURCE_RELATIVE
    require(source.is_file() and not source.is_symlink(), 'exact source SWF required')
    source_bytes = source.read_bytes()
    require(len(source_bytes) == 55392 and sha(source_bytes) == SOURCE_SHA, 'source SWF changed')
    contract_bytes = CONTRACT.read_bytes()
    require(sha(contract_bytes) == CONTRACT_SHA, 'source quiz contract changed')
    contract = json.loads(contract_bytes)
    with tempfile.TemporaryDirectory(prefix='g678-p064-question-ir-') as temporary:
        temp = Path(temporary)
        xml_path = temp / 'movie.xml'
        command(['swfmill', 'swf2xml', str(source), str(xml_path)])
        stdout = command(['ffdec', '-format', 'script:as,text:plain', '-export',
                          'script,text', str(temp), str(source)])
        require('JPEXS Free Flash Decompiler v.26.2.1' in stdout, 'FFDec version changed')
        main_script = (temp / 'scripts/DefineSprite_1258/frame_1/DoAction.as').read_bytes()
        require(sha(main_script) == contract['scripts']['mainFrameOneSha256'], 'main ActionScript changed')
        require(b'mcName = "R" + _global.arrayResponseAnswer[_global.reviewCount - 1].substring(1' in main_script,
                'source review-name lookup changed')
        value = build(xml_path, temp / 'texts', contract)
    output = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode('utf-8')
    if mode == ['--build']:
        with OUTPUT.open('xb') as target:
            target.write(output)
    else:
        require(OUTPUT.read_bytes() == output, 'P064 question-content IR drift')
    print(json.dumps({'status': 'PASS', 'mode': mode[0], 'output': str(OUTPUT),
                      'sha256': sha(output), 'questions': len(value['questions']),
                      'sourceNameAnomalies': len(value['instanceNameAnomalies']),
                      'reviewLookupMisses': len(value['sourceDerivedReviewLookupMisses'])}))


if __name__ == '__main__':
    main()
