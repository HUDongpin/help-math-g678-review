#!/usr/bin/env python3
"""List each P005 source timeline frame with a structural display/control event."""

import csv
import json
from pathlib import Path
import sys
import xml.etree.ElementTree as ET


WORK = Path(__file__).resolve().parent.parent
HEADER = ('frame,requirement_id,frame_domain_id,trace_id,entry_state_sha256,time_ms,scenario,language,kind,'
          'expected_state,trigger,baseline_file,baseline_sha256,implementation_file,implementation_sha256,'
          'diff_file,diff_sha256,normalized_rmse,timing_result,visual_result,evidence_source,reviewer,notes').split(',')


def main():
    structure = json.loads((WORK / 'audit/source-structure.json').read_text())
    coverage = json.loads((WORK / 'evidence/full-frame-coverage.json').read_text())
    requirements = {}
    for req in coverage['requirements']:
        if req['language'] == 'en' and req['frameDomainId'] not in requirements:
            requirements[req['frameDomainId']] = req
    root = ET.parse(WORK / 'audit/movie.xml').getroot()
    tags = root.find('tags')
    domains = {'root': tags}
    for item in tags:
        if item.get('type') == 'DefineSpriteTag':
            domains['sprite-' + item.get('spriteId')] = item.find('subTags')
    assert set(domains) == set(structure['rootReachableTimelineIds'])
    rows = []
    for domain, items in domains.items():
        frame = 1
        events = {}
        audio_blocks = set()
        for item in items:
            kind = item.get('type')
            if kind == 'ShowFrameTag':
                frame += 1
                continue
            if kind == 'SoundStreamBlockTag':
                audio_blocks.add(frame)
                continue
            if kind not in ('PlaceObject2Tag', 'RemoveObject2Tag', 'DoActionTag', 'FrameLabelTag', 'SoundStreamHeadTag'):
                continue
            if kind == 'PlaceObject2Tag':
                description = f'place/change char {item.get("characterId", "same")} depth {item.get("depth")}'
                if item.get('ratio') is not None:
                    description += f' ratio {item.get("ratio")}'
            elif kind == 'RemoveObject2Tag':
                description = f'remove depth {item.get("depth")}'
            elif kind == 'FrameLabelTag':
                description = f'label {item.get("name")}'
            else:
                description = kind.removesuffix('Tag')
            events.setdefault(frame, []).append(description)
        spans = structure['timelines'][domain]['soundStreamBlockSpans']
        for first, last in spans:
            events.setdefault(first, []).append(f'embedded stream blocks begin ({first}-{last})')
            events.setdefault(last, []).append(f'embedded stream block span ends ({first}-{last})')
            if last + 1 <= structure['timelines'][domain]['frameCount']:
                events.setdefault(last + 1, []).append('no stream block at next frame')
        req = requirements[domain]
        for n, event_list in sorted(events.items()):
            row = dict.fromkeys(HEADER, '')
            row.update(frame=n, requirement_id=req['requirementId'], frame_domain_id=domain,
                       trace_id=req['traceId'], entry_state_sha256=req['entryStateSha256'],
                       time_ms=f'{(n - 1) * 1000 / 12:.3f}', scenario=req['scenario'], language='en',
                       kind='static-source-event', expected_state='; '.join(event_list),
                       trigger='source timeline advance / host entry pending',
                       timing_result='pending', visual_result='pending', evidence_source='audit/movie.xml',
                       notes='Static tag event only; composed pixels, natural child clock and original-runtime visibility unverified')
            rows.append([row[key] for key in HEADER])
    output = WORK / 'keyframes.csv'
    if sys.argv[1:] == ['--check']:
        with output.open(newline='') as stream:
            assert list(csv.reader(stream)) == [HEADER, *[[str(value) for value in row] for row in rows]]
    else:
        assert not sys.argv[1:]
        with output.open('w', newline='') as stream:
            writer = csv.writer(stream)
            writer.writerow(HEADER)
            writer.writerows(rows)
    print(f'P005 static event inventory {"checked" if sys.argv[1:] else "written"}: {len(rows)} frame-domain rows')


if __name__ == '__main__':
    main()
