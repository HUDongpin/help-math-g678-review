#!/usr/bin/env python3
"""P043 source-declared frame/sample IR; never treat as a browser seek table."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys

HERE = Path(__file__).resolve().parent
SCHEDULE = HERE/'source-audio-v1.json'
OUTPUT = HERE/'frame-clock-v1.json'
SCRIPT = HERE/'source-audio-v1.py'
SCHEDULE_SHA = '88af856e8217453acee4c5705b145b0b9f6476219fe10f09bf79667a2f635202'
CHECKPOINTS = {342: [61, 62, 63, 241], 307: [22, 23, 24, 29], 202: [30, 31]}


def digest(raw): return hashlib.sha256(raw).hexdigest()


def build():
    result = subprocess.run([sys.executable, str(SCRIPT), '--check'],
                            capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    raw = SCHEDULE.read_bytes()
    assert digest(raw) == SCHEDULE_SHA
    schedule = json.loads(raw)
    assert schedule['animationId'] == 'shared-alg001-l06-p043'
    streams = []
    for source in schedule['streams']:
        blocks = {row['frame']: row for row in source['frameBlocks']}
        cursor = 0
        rows = []
        ordinal = 0
        for frame in range(1, source['frames']+1):
            block = blocks.get(frame)
            row = {'frame': frame, 'visualTickStart': frame-1,
                'visualTickEnd': frame, 'blockPresent': block is not None,
                'declaredSampleStart': cursor}
            if block:
                ordinal += 1
                row.update({'blockOrdinalInStream': ordinal,
                    'declaredSamplesInBlock': block['declaredSamples'],
                    'signedBlockSeekSamples': block['seekSamples'],
                    'mp3PayloadOffset': block['mp3PayloadOffset'],
                    'mp3PayloadBytes': block['mp3PayloadBytes'],
                    'mp3PayloadSha256': block['mp3PayloadSha256']})
                cursor += block['declaredSamples']
            else:
                row.update({'blockOrdinalInStream': None,
                    'declaredSamplesInBlock': None, 'signedBlockSeekSamples': None,
                    'mp3PayloadOffset': None, 'mp3PayloadBytes': None,
                    'mp3PayloadSha256': None})
            row['blocksThroughFrame'] = ordinal
            row['declaredSampleEnd'] = cursor
            rows.append(row)
        assert ordinal == source['blockCount']
        assert cursor == source['declaredSampleCount']
        streams.append({'spriteId': source['spriteId'], 'role': source['role'],
            'sourceFrames': source['frames'], 'sourceFps': 12,
            'sourceBlockCount': source['blockCount'],
            'declaredTotalSamples': cursor, 'sourceSampleRateHz': 22050,
            'sourceMp3Sha256': source['mp3PayloadSha256'],
            'sourceFrameClock': rows,
            'checkpoints': [rows[frame-1] for frame in CHECKPOINTS[source['spriteId']]]})
    return {'schemaVersion': 1,
        'kind': 'p043-output-only-source-declared-frame-sample-clock-v1',
        'status': 'source-declared-not-browser-or-Flash-aligned',
        'animationId': 'shared-alg001-l06-p043',
        'sourceScheduleSha256': SCHEDULE_SHA,
        'clockConvention': {'sourceFrame': 'one-based sprite frame at 12 visual fps',
            'declaredSampleStart': 'sum of preceding SWF block sample fields in this sprite',
            'declaredSampleEnd': 'sum through block on named frame',
            'signedBlockSeekSamples': 'raw SWF field, not a measured playback correction',
            'noMeasuredFrameSeek': True},
        'streams': streams,
        'separateSa': {'sha256': schedule['separateSa']['file']['sha256'],
            'automaticTimelineOwner': False, 'userTriggeredOnly': True},
        'cursorRulesCandidate': [
            'Use one stream owner and run epoch; invalidate stale loads and callbacks on Replay or navigation.',
            'At main frame 62 hold the actual browser cursor; the source-declared sample boundary is not a seek command.',
            'At wrong4 frame 23 hold the same stream owner; Close resumes from frame 24 only after browser alignment is measured.',
            'Right4 frame 31 retires feedback and resumes main; MP3 EOF alone does not complete the lesson.',
            'Never autoplay or splice separate SA into an embedded source stream.'
        ],
        'gates': {'physicalSourceScheduleChecked': True,
            'browserDecodeReadback': False, 'originalRuntimeFrameSeek': False,
            'audioListeningAccepted': False, 'currentJsRegistered': False}}


def main():
    if sys.argv[1:] not in (['--write'], ['--check']):
        raise SystemExit('usage: --write | --check')
    raw = (json.dumps(build(), indent=2)+'\n').encode()
    if sys.argv[1:] == ['--write']:
        with OUTPUT.open('xb') as output:
            output.write(raw)
    else:
        assert OUTPUT.read_bytes() == raw, 'clock drift'
    print(json.dumps({'mode': sys.argv[1], 'bytes': len(raw),
                      'sha256': digest(raw)}))


if __name__ == '__main__': main()
