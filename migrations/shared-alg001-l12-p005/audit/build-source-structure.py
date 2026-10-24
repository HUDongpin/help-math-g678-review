#!/usr/bin/env python3
"""Rebuild P005's bounded static SWF structure and character inventory.

Reads the FFDec 26.2.1 XML export. This does not execute Flash or render frames.
"""

import argparse
import collections
import csv
import hashlib
import json
from pathlib import Path
import xml.etree.ElementTree as ET


HERE = Path(__file__).resolve().parent
WORKSPACE = HERE.parent
SWF = Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L12/RW/L12RW05.swf')
EXPECTED_SWF = 'b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe'
XML = HERE / 'movie.xml'


def sha256(path):
    digest = hashlib.sha256()
    with path.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    return digest.hexdigest()


def character_id(item):
    for key in ('spriteId', 'shapeId', 'characterID', 'characterId', 'fontID', 'buttonId', 'soundId'):
        if key in item.attrib:
            return int(item.get(key))
    return None


def compress_frames(frames):
    spans = []
    for frame in sorted(frames):
        if spans and frame == spans[-1][1] + 1:
            spans[-1][1] = frame
        else:
            spans.append([frame, frame])
    return spans


def timeline(name, tags, expected_frames, sprite_ids):
    frame = 1
    counts = collections.Counter()
    action_frames = []
    labels = []
    child_placements = []
    active_child_by_depth = {}
    clipping_placements = []
    stream_heads = []
    stream_blocks = []
    placement_count_with_matrix = 0
    placement_count_with_color_transform = 0
    placement_count_with_clip_depth = 0
    placement_count_with_ratio = 0
    for item in tags:
        kind = item.get('type')
        counts[kind] += 1
        if kind == 'DoActionTag':
            action_frames.append(frame)
        elif kind == 'FrameLabelTag':
            labels.append({'frame': frame, 'name': item.get('name')})
        elif kind == 'SoundStreamHeadTag':
            stream_heads.append({key: value for key, value in item.attrib.items() if key != 'type'})
        elif kind == 'SoundStreamBlockTag':
            stream_blocks.append(frame)
        elif kind == 'PlaceObject2Tag':
            depth = int(item.get('depth'))
            child = item.get('characterId')
            if child is not None and depth in active_child_by_depth:
                child_placements[active_child_by_depth.pop(depth)]['retainedThroughFrame'] = frame - 1
            placement_count_with_matrix += item.get('placeFlagHasMatrix') == 'true'
            placement_count_with_color_transform += item.get('placeFlagHasColorTransform') == 'true'
            placement_count_with_clip_depth += item.get('placeFlagHasClipDepth') == 'true'
            placement_count_with_ratio += item.get('placeFlagHasRatio') == 'true'
            if item.get('placeFlagHasClipDepth') == 'true':
                clipping_placements.append({'frame': frame, 'depth': depth, 'clipDepth': int(item.get('clipDepth')),
                                            'characterId': int(child) if child is not None else None})
            if child is not None and int(child) in sprite_ids:
                matrix = item.find('matrix')
                child_placements.append({
                    'parentFrame': frame,
                    'childTimelineId': 'sprite-' + child,
                    'depth': depth,
                    'instanceName': item.get('name'),
                    'matrix': {k: v for k, v in matrix.attrib.items() if k != 'type'} if matrix is not None else None,
                    'ratio': item.get('ratio'),
                })
                active_child_by_depth[depth] = len(child_placements) - 1
        elif kind == 'RemoveObject2Tag':
            depth = int(item.get('depth'))
            if depth in active_child_by_depth:
                child_placements[active_child_by_depth.pop(depth)]['retainedThroughFrame'] = frame - 1
        if kind == 'ShowFrameTag':
            frame += 1
    if frame - 1 != expected_frames:
        raise ValueError(f'{name}: declared {expected_frames} frames, found {frame - 1}')
    for index in active_child_by_depth.values():
        child_placements[index]['retainedThroughFrame'] = expected_frames
    return {
        'timelineId': name,
        'frameCount': expected_frames,
        'tagCounts': dict(sorted(counts.items())),
        'actionFrames': action_frames,
        'labels': labels,
        'childSpritePlacements': child_placements,
        'clippingPlacements': clipping_placements,
        'soundStreamHeads': stream_heads,
        'soundStreamBlockCount': len(stream_blocks),
        'soundStreamBlockSpans': compress_frames(stream_blocks),
        'placementFlags': {
            'withMatrix': placement_count_with_matrix,
            'withColorTransform': placement_count_with_color_transform,
            'withClipDepth': placement_count_with_clip_depth,
            'withRatio': placement_count_with_ratio,
        },
    }


def build():
    if sha256(SWF) != EXPECTED_SWF:
        raise ValueError('Physical P005 SWF digest differs from catalog identity')
    root = ET.parse(XML).getroot()
    if root.get('_generator') != 'JPEXS Free Flash Decompiler v.26.2.1':
        raise ValueError('FFDec version changed: re-audit before rebuilding')
    root_tags = root.find('tags')
    rect = root.find('displayRect')
    stage_twips = [int(rect.get(key)) for key in ('Xmin', 'Ymin', 'Xmax', 'Ymax')]
    background_tag = next(item for item in root_tags if item.get('type') == 'SetBackgroundColorTag')
    background = background_tag.find('backgroundColor')
    background_rgb = [int(background.get(key)) for key in ('red', 'green', 'blue')]
    with SWF.open('rb') as stream:
        swf_prefix = stream.read(8)
    if swf_prefix[:3] != b'CWS':
        raise ValueError('Expected CWS source signature')
    sprites = {int(item.get('spriteId')): item for item in root_tags if item.get('type') == 'DefineSpriteTag'}
    definitions = {}
    for item in root_tags:
        kind = item.get('type', '')
        if not kind.startswith('Define') or kind == 'DefineFontNameTag':
            continue
        cid = character_id(item)
        if cid is None:
            continue
        if cid in definitions:
            raise ValueError(f'duplicate character ID {cid}')
        definitions[cid] = item
    timelines = {'root': timeline('root', root_tags, int(root.get('frameCount')), set(sprites))}
    for sid, item in sorted(sprites.items()):
        timelines[f'sprite-{sid}'] = timeline(f'sprite-{sid}', item.find('subTags'), int(item.get('frameCount')), set(sprites))
    root_composition = []
    frame = 1
    for item in root_tags:
        if item.get('type') == 'PlaceObject2Tag':
            matrix = item.find('matrix')
            root_composition.append({
                'frame': frame, 'characterId': int(item.get('characterId')), 'depth': int(item.get('depth')),
                'instanceName': item.get('name'),
                'matrix': {k: v for k, v in matrix.attrib.items() if k != 'type'} if matrix is not None else None,
                'ratio': item.get('ratio'),
            })
        if item.get('type') == 'ShowFrameTag':
            frame += 1
    reachable = {'root'}
    queue = ['root']
    while queue:
        for placement in timelines[queue.pop(0)]['childSpritePlacements']:
            child = placement['childTimelineId']
            if child not in reachable:
                reachable.add(child)
                queue.append(child)
    structure = {
        'schemaVersion': 1,
        'animationId': 'shared-alg001-l12-p005',
        'evidenceKind': 'FFDec static SWF XML; no playback authority',
        'sourceSwfSha256': EXPECTED_SWF,
        'ffdecXmlSha256': sha256(XML),
        'ffdecXmlVersion': {'major': root.get('_xmlExportMajor'), 'minor': root.get('_xmlExportMinor')},
        'header': {'signature': swf_prefix[:3].decode(), 'version': int(root.get('version')),
                   'compressedBytes': SWF.stat().st_size, 'declaredUncompressedBytes': int.from_bytes(swf_prefix[4:8], 'little'),
                   'stageTwips': stage_twips,
                   'stagePixels': [(stage_twips[2] - stage_twips[0]) / 20, (stage_twips[3] - stage_twips[1]) / 20],
                   'fps': float(root.get('frameRate')), 'rootFrameCount': int(root.get('frameCount'))},
        'backgroundRgb': background_rgb,
        'rootComposition': root_composition,
        'definitionCounts': dict(sorted(collections.Counter(x.get('type') for x in definitions.values()).items())),
        'definedCharacterCount': len(definitions),
        'definedSpriteIds': sorted(sprites),
        'rootReachableTimelineIds': sorted(reachable),
        'unreachableSpriteIds': sorted(int(name.split('-')[1]) for name in timelines if name.startswith('sprite-') and name not in reachable),
        'timelines': timelines,
    }
    columns = ['asset_id', 'swf_character_id', 'library_symbol', 'type', 'source_file', 'source_frame', 'exported_file',
               'sha256', 'format', 'dimensions_or_bounds', 'font_glyphs', 'transformation', 'confidence',
               'license_or_provenance', 'notes']
    rows = []
    for cid, item in sorted(definitions.items()):
        kind = item.get('type')
        bounds = next((ch.attrib for ch in item if ch.tag in ('shapeBounds', 'startBounds', 'textBounds')), None)
        glyphs = len(item.find('codeTable')) if kind == 'DefineFont2Tag' else ''
        rows.append([f'swf-character-{cid}', cid, f'{kind.removesuffix("Tag")}_{cid}', kind.removesuffix('Tag'), str(SWF), '', '',
                     EXPECTED_SWF, 'SWF container', json.dumps(bounds, sort_keys=True) if bounds else '', glyphs,
                     'source-only; no export/render', 'verified', 'owner-provided',
                     'SHA-256 identifies container only; original-runtime appearance and exported asset hash pending'])
    return structure, columns, rows


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    structure, columns, rows = build()
    expected_json = json.dumps(structure, indent=2, ensure_ascii=False) + '\n'
    json_path = HERE / 'source-structure.json'
    csv_path = WORKSPACE / 'asset-inventory.csv'
    if args.check:
        if json_path.read_text() != expected_json:
            raise SystemExit('source-structure.json differs from rebuilt source audit')
        with csv_path.open(newline='') as stream:
            if list(csv.reader(stream)) != [columns, *[[str(value) for value in row] for row in rows]]:
                raise SystemExit('asset-inventory.csv differs from rebuilt source audit')
        print(f'P005 source audit matches: {len(rows)} characters; {len(structure["rootReachableTimelineIds"])} reachable timelines')
        return
    json_path.write_text(expected_json)
    with csv_path.open('w', newline='') as stream:
        writer = csv.writer(stream)
        writer.writerow(columns)
        writer.writerows(rows)
    print(f'Wrote P005 source structure and {len(rows)} character rows')


if __name__ == '__main__':
    main()
