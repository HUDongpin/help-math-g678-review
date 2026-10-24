#!/usr/bin/env python3
"""Deterministic source-only P003 audit; never establishes runtime acceptance."""
import collections
import csv
import hashlib
import io
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET

WORK = Path(__file__).resolve().parent.parent
SOURCE = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW03.swf')
SHA = '384f7e8e269768063d8e6ca410350ccbd5c321596fd6f55d68903cc1b6d2bccb'
XML_SHA = '0628b47a313f914b1356c4449ce61b19b285371e07860c6098966bc89c5bfb07'
BUTTONS = {150: 'Graph', 151: 'Relation', 156: 'Function', 157: 'Equation', 161: 'Linear equation', 162: 'Linear function'}

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def timeline(tags, count):
    frame, active, retained, placements, actions, audio = 1, {}, [], [], [], []
    for tag in tags:
        if tag.tag == 'ShowFrame':
            frame += 1
        elif tag.tag == 'SoundStreamBlock':
            audio.append(frame)
        elif tag.tag in ('DoAction', 'FrameLabel'):
            actions.append({'frame': frame, 'type': tag.tag, 'label': tag.get('label'), 'opcodes': [x.tag for x in tag.findall('./actions/*')]})
        elif tag.tag in ('PlaceObject2', 'RemoveObject2'):
            depth = int(tag.get('depth'))
            character = tag.get('objectID')
            if character is not None or tag.tag == 'RemoveObject2':
                previous = active.pop(depth, None)
                if previous and previous[0] in BUTTONS:
                    retained.append({'characterId': previous[0], 'term': BUTTONS[previous[0]], 'depth': depth, 'firstFrame': previous[1], 'lastFrame': frame - 1})
                if character is not None:
                    active[depth] = (int(character), frame)
            transform = tag.find('./transform/Transform')
            placements.append({'frame': frame, 'type': tag.tag, **tag.attrib, 'matrix': transform.attrib if transform is not None else {}})
    assert frame == count + 1
    for depth, (character, start) in active.items():
        if character in BUTTONS:
            retained.append({'characterId': character, 'term': BUTTONS[character], 'depth': depth, 'firstFrame': start, 'lastFrame': count})
    return {'frameCount': count, 'actions': actions, 'placements': placements, 'buttonDisplayListRanges': retained, 'soundStreamBlockCount': len(audio), 'soundStreamFrames': audio}

def main():
    assert SOURCE.resolve() == SOURCE and sha(SOURCE) == SHA
    xml = WORK / 'audit/swfmill.xml'
    assert sha(xml) == XML_SHA
    root = ET.parse(xml).getroot()
    header = root.find('Header')
    tags = header.find('tags')
    definitions = [x for x in tags if x.tag.startswith('Define')]
    sprites = [x for x in definitions if x.tag == 'DefineSprite']
    script_records = []
    for p in sorted((WORK / 'audit/source-scripts').rglob('*.as')):
        script_records.append({'path': str(p.relative_to(WORK)), 'sha256': sha(p), 'text': p.read_text()})
    assert len(script_records) == 9
    for character, term in BUTTONS.items():
        script = next(x['text'] for x in script_records if f'DefineButton2_{character}/' in x['path'])
        assert f'KeyAttribute = "{term}"' in script and '_root.DoHyperLinks()' in script and 'animation.stop()' in script
    summary = {'schemaVersion': 1, 'animationId': WORK.name, 'authority': 'static-structure-only',
        'source': {'path': str(SOURCE), 'bytes': SOURCE.stat().st_size, 'sha256': SHA, 'swfmillXmlSha256': XML_SHA},
        'header': header.attrib, 'stageTwips': header.find('./size/Rectangle').attrib,
        'definitionCounts': dict(collections.Counter(x.tag for x in definitions)),
        'root': timeline(tags, int(header.get('frames'))),
        'sprites': {x.get('objectID'): timeline(x.find('tags'), int(x.get('frames'))) for x in sprites},
        'scripts': script_records,
        'limitations': ['Display-list retention is not hit-test or visibility proof.', 'Host entry and glossary close/resume unresolved.', 'Embedded stream presence is not audio acceptance.']}
    buffer = io.StringIO()
    fields = ['asset_id','swf_character_id','library_symbol','type','source_file','source_frame','exported_file','sha256','format','dimensions_or_bounds','font_glyphs','transformation','confidence','license_or_provenance','notes']
    writer = csv.DictWriter(buffer, fieldnames=fields, lineterminator='\n')
    writer.writeheader()
    for x in definitions:
        writer.writerow({'asset_id': 'character-' + x.get('objectID'), 'swf_character_id': x.get('objectID'), 'library_symbol': x.get('name',''), 'type': x.tag, 'source_file': str(SOURCE), 'sha256': SHA, 'format': 'SWF container', 'confidence': 'verified', 'license_or_provenance': 'owner-provided', 'notes': 'Container hash only; runtime acceptance pending'})
    outputs = {WORK / 'audit/source-structure.json': json.dumps(summary, indent=2) + '\n', WORK / 'asset-inventory.csv': buffer.getvalue()}
    check = sys.argv[1:] == ['--check']
    assert sys.argv[1:] in ([], ['--check'])
    for p, text in outputs.items():
        if check:
            assert p.read_text() == text, str(p)
        else:
            p.write_text(text)
    print(json.dumps({'checked': check, 'definitions': len(definitions), 'sprites': {k: v['frameCount'] for k,v in summary['sprites'].items()}, 'buttons': summary['sprites']['164']['buttonDisplayListRanges']}))

if __name__ == '__main__':
    main()
