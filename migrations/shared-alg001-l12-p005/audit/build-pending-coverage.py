#!/usr/bin/env python3
"""Declare P005 frame domains and pending captures; never generate authority."""

import hashlib
import json
from pathlib import Path
import sys


WORK = Path(__file__).resolve().parent.parent
SOURCE_SHA = 'b411401131b484ee693063b46fdbbbdbc45f81fc265512a17ae0a379dbad2dfe'


def state_hash(state):
    return hashlib.sha256(json.dumps(state, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()


def requirement(scenario, domain, language, count, entry, authority, trace_suffix=''):
    key = f'{scenario}-{domain}{trace_suffix}-{language}'
    return {
        'requirementId': f'req-{key}', 'scenario': scenario, 'frameDomainId': domain,
        'traceId': key, 'language': language, 'seed': '0',
        'requiredRange': {'firstFrame': 1, 'lastFrame': count},
        'entryState': entry, 'entryStateSha256': state_hash(entry),
        'baselineAuthorityRequirement': authority, 'baselineAuthority': 'unresolved',
        'status': 'pending', 'capturedFrameCount': 0, 'missingFrames': list(range(1, count + 1)),
        'baselineCaptureManifest': '', 'baselineCaptureManifestSha256': '',
        'captureManifest': '', 'captureManifestSha256': '', 'metricsFile': '', 'metricsSha256': ''
    }


def main():
    manifest = json.loads((WORK / 'migration.json').read_text())
    structure = json.loads((WORK / 'audit/source-structure.json').read_text())
    assert manifest['source']['swfSha256'] == structure['sourceSwfSha256'] == SOURCE_SHA
    domains = {d['id']: d['frameCount'] for d in manifest['implementation']['frameDomains']}
    assert set(domains) == set(structure['rootReachableTimelineIds'])
    assert all(domains[k] == v['frameCount'] for k, v in structure['timelines'].items())
    root_placements = structure['timelines']['root']['childSpritePlacements']
    assert [(p['childTimelineId'], p['parentFrame'], p['depth']) for p in root_placements] == [
        ('sprite-391', 6, 1), ('sprite-395', 6, 135)]
    nested = structure['timelines']['sprite-391']['childSpritePlacements']
    assert len(nested) == 7
    requirements = []
    for language in ('en', 'es'):
        requirements.append(requirement('default', 'root', language, 10,
                                        {'kind': 'initial-load', 'language': language},
                                        'original-runtime-frame-accurate'))
        for placement in root_placements:
            domain = placement['childTimelineId']
            requirements.append(requirement('source-main-natural' if domain == 'sprite-391' else 'default',
                                            domain, language, domains[domain],
                                            {'kind': 'source-root-begin', 'rootFrame': 6,
                                             'sourceTimelineId': domain, 'rootDepth': placement['depth'],
                                             'placementTwips': {'x': int(placement['matrix']['translateX']),
                                                                'y': int(placement['matrix']['translateY'])},
                                             'language': language},
                                            'original-runtime-natural-trace' if domain == 'sprite-391'
                                            else 'original-runtime-frame-accurate'))
        for placement in nested:
            domain = placement['childTimelineId']
            parent_frame = placement['parentFrame']
            requirements.append(requirement('nested-animation-entry', domain, language, domains[domain],
                                            {'kind': 'source-child-placement', 'rootFrame': 6,
                                             'parentTimelineId': 'sprite-391', 'parentFrame': parent_frame,
                                             'parentDepth': placement['depth'], 'sourceTimelineId': domain,
                                             'language': language}, 'original-runtime-natural-trace',
                                            f'-entry-{parent_frame}'))
    payload = {
        'schemaVersion': 2, 'animationId': 'shared-alg001-l12-p005',
        'requirements': requirements,
        'pendingReplayTraces': [{'scenario': 'source-main-natural', 'status': 'pending',
                                'reason': 'Original host Replay, child clock reset, nested restart and MP3 stream reset are unobserved'}],
        'sourceLimitation': 'All 20 requirements have zero captures. Nested source frame counts may exceed natural placement lifetimes; full-domain original-runtime seek authority and Spanish source mapping remain unresolved.'
    }
    output = WORK / 'evidence/full-frame-coverage.json'
    rendered = json.dumps(payload, indent=2, ensure_ascii=False) + '\n'
    if sys.argv[1:] == ['--check']:
        assert output.read_text() == rendered
    else:
        assert not sys.argv[1:]
        output.write_text(rendered)
    print(f'P005 pending coverage {"checked" if sys.argv[1:] else "written"}: {len(requirements)} requirements; zero captures')


if __name__ == '__main__':
    main()
