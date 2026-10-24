#!/usr/bin/env python3
"""Recover graph paths from pinned source drawing and reviewed equation glyphs."""
import collections
import hashlib
import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parents[3]
WORK = ROOT / 'migrations/shared-alg001-l06-p050'
sha = lambda raw: hashlib.sha256(raw).hexdigest()

def read(p, expected=None):
    p = pathlib.Path(p)
    assert p.is_file() and not p.is_symlink()
    before = p.stat()
    raw = p.read_bytes()
    after = p.stat()
    assert (before.st_ino, before.st_size, before.st_mtime_ns) == (after.st_ino, after.st_size, after.st_mtime_ns)
    if expected:
        assert sha(raw) == expected, str(p)
    return raw

model_bytes = read(WORK / 'native-v1/source-model-v1.json', '928ca5042b469795ae207921638d44ffd212034e8eb33e954d943b1721c05fb7')
model = json.loads(model_bytes)
review_bytes = read(WORK / 'native-v1/content-review-v1.json', '4ee3532fec858e05125497c8442bc891d3d7a7dc65814f5a164cdedb0b9d9f37')
review = json.loads(review_bytes)
assert review['sourceModelSha256'] == sha(model_bytes)
read(WORK / 'canvas-v1/canvas-renderer-draft.js', review['canvasSha256'])
receipt = json.loads(read(WORK / 'audit-v1/source-extraction-v1.json', 'dc1d39b3411e04b96ac8f331e60100105c1d0ed16c5ae5d242d806aa04b83f16'))
frame_name = 'sprites/DefineSprite_489/frames.html'
pin = next(x for x in receipt['files'] if x['path'] == frame_name)
frames = read(pathlib.Path(receipt['exportRoot']) / frame_name, pin['sha256']).decode().replace('\r\n', '\n')

def source_function(object_id):
    start = frames.find(f'function shape{object_id}(')
    if start < 0:
        return None
    end = frames.find('\nfunction ', start + 1)
    assert end > start
    return frames[start:end]

def stroke_paths(function):
    result = {}
    for part in function.split('var pathData="')[1:]:
        path, rest = part.split('";', 1)
        color = re.search(r'ctx.strokeStyle=tocolor\(ctrans.apply\((\[[^\n]+?\])\)\);', rest)
        if color:
            assert color[1] not in result
            result[color[1]] = path
    return result

def numbers(path):
    return [float(n) for n in re.findall(r'-?\d+(?:\.\d+)?', path)]

def normalized_path(path, origin, unit):
    tokens = re.findall(r'[A-Za-z]|-?\d+(?:\.\d+)?', path)
    result = []
    index = 0
    for token in tokens:
        if token.isalpha():
            assert token in 'MLQ'
            assert index % 2 == 0
            result.append(token)
        else:
            value = (float(token) - origin[index % 2]) / unit
            result.append(str(round(value, 4)))
            index += 1
    assert index % 2 == 0
    return ' '.join(result)

questions = []
for question, reviewed in zip(model['questions'], review['questions'], strict=True):
    number = question['number']
    assert number == reviewed['question'] and question['frame'] == reviewed['frame']
    shot = reviewed['visualReadback']
    assert len(read(shot['path'], shot['sha256'])) == shot['bytes']
    graphs = []
    for placement in question['displayList']:
        function = source_function(placement['objectId'])
        if not function or 'ctx.strokeStyle=tocolor(ctrans.apply([255,0,0,1]))' not in function:
            continue
        paths = stroke_paths(function)
        if '[255,0,0,1]' not in paths:
            continue
        assert placement['matrixTwips'] == {'scaleX': 1.0, 'scaleY': 1.0, 'skewX': 0.0, 'skewY': 0.0, 'transX': 0.0, 'transY': 0.0}
        axes = numbers(paths['[0,0,0,0.5019608]'])
        pairs = list(zip(axes[::2], axes[1::2], strict=True))
        origin, repeated = collections.Counter(pairs).most_common(1)[0]
        assert repeated >= 2
        grid = numbers(paths['[171,160,252,1]'])
        xs = sorted(set(grid[::2]))
        unit, frequency = collections.Counter(b - a for a, b in zip(xs, xs[1:])).most_common(1)[0]
        assert unit in [120, 175] and frequency >= 8
        raw_path = paths['[255,0,0,1]']
        line = numbers(raw_path)
        endpoint = lambda pair: [round((pair[0] - origin[0]) / unit, 2), round((origin[1] - pair[1]) / unit, 2)]
        graph = {'sourceShapeId': placement['objectId'], 'sourceDepth': placement['depth'],
                 'sourceFunctionSha256': sha(function.encode()), 'sourceRedPath': raw_path,
                 'sourceAxisOrigin': origin, 'sourceModalGridSpacing': unit,
                 'path': normalized_path(raw_path, origin, unit),
                 'approximateEndpoints': [endpoint(line[:2]), endpoint(line[-2:])],
                 'coordinateAuthority': 'source red path and axis intersection; modal source grid spacing; approximate numeric description'}
        if number <= 5:
            stage = [origin[0] / 20 + 419.4, origin[1] / 20 + 263.3]
            owner = [o for o in question['options'] if o['hitBoxPx'][0] <= stage[0] <= o['hitBoxPx'][2]
                     and o['hitBoxPx'][1] <= stage[1] <= o['hitBoxPx'][3]]
            assert len(owner) == 1
            graph['letter'] = owner[0]['letter']
        else:
            graph['letter'] = None
        graphs.append(graph)
    assert len(graphs) == (4 if number <= 5 else 1)
    if number <= 5:
        assert sorted(g['letter'] for g in graphs) == list('ABCD')
    questions.append({'number': number, 'frame': question['frame'], 'kind': reviewed['kind'],
                      'promptFormula': reviewed['promptFormula'], 'optionFormulas': reviewed['optionFormulas'],
                      'graphs': graphs})

intro = []
for text_id in [62, 63, 64, 65]:
    rows = [r for r in model['mainTextInstances'] if r['objectId'] == text_id]
    assert len(rows) == 1
    intro.append({'textId': text_id, 'text': model['texts'][str(text_id)]['text'].strip(),
                  'firstFrame': rows[0]['firstFrame'], 'lastFrame': rows[0]['lastFrame']})
directions = [{'textId': i, 'text': model['texts'][str(i)]['text'].strip()} for i in [19, 21, 20, 23, 22]]
result = {'kind': 'p050-source-native-bindings-v1', 'sourceModelSha256': sha(model_bytes),
          'sourceSwfSha256': receipt['source']['sha256'], 'transcriptionReviewSha256': sha(review_bytes),
          'intro': intro, 'directions': directions, 'questions': questions,
          'excludedUnplacedTextIds': [3, 4, 5], 'modernGraphGrid': True,
          'originalFontFidelity': False, 'originalRuntimeAccepted': False, 'humanAccepted': False}
output = WORK / 'native-v1/native-bindings-v1.json'
raw = (json.dumps(result, ensure_ascii=False, indent=2) + '\n').encode()
assert sys.argv[1] in ['--write', '--check']
if sys.argv[1] == '--write' and not output.exists():
    output.write_bytes(raw)
assert read(output) == raw
print(json.dumps({'mode': sys.argv[1], 'bytes': len(raw), 'sha256': sha(raw), 'questions': len(questions),
                  'graphs': sum(len(q['graphs']) for q in questions)}, indent=2))
