from pathlib import Path
import json, hashlib, xml.etree.ElementTree as E, re, sys

B = Path(__file__).resolve().parents[1]
m = json.loads((B/'native-v1/source-model-v1.json').read_text())
main = next(t for t in m['timelines'] if t['timelineId'] == 'sprite-50')
texts = {t['characterId']: t for t in m['texts']}
ns = '{http://www.w3.org/2000/svg}'
sha = lambda b: hashlib.sha256(b).hexdigest()
assert m['mainFrameCount'] == 837 and len(m['scripts']) == 2
assert all(not p.get('clipDepth') for row in main['frames'] for p in row)

def alpha(p):
    return max(0, min(1, p.get('colorTransform', {}).get('multiply', [256]*4)[3]/256 + p.get('colorTransform', {}).get('add', [0]*4)[3]/255)) if p else 0

def center(p):
    b = texts[p['characterId']]['boundsTwips']
    assert texts[p['characterId']]['matrix'] == [1, 0, 0, 1, 0, 0]
    x, y = (b['left']+b['right'])/2, (b['top']+b['bottom'])/2
    a, b_, c, d, e, f = p['matrix']
    return dict(x=(a*x+c*y+e)/20, y=(b_*x+d*y+f)/20)

def spans(values):
    out = []
    for f, v in enumerate(values, 1):
        if out and out[-1]['value'] == v: out[-1]['last'] = f
        else: out.append(dict(first=f, last=f, value=v))
    return out

static_ids = [2, 25, 26, 28, 29, 30, 42, 43, 47]
morph_ids = [24, 27, 41, 46]
paths = []
for id in static_ids + morph_ids:
    p = B/f"source-v1/ffdec/{'morphshapes' if id in morph_ids else 'shapes'}/{id}.svg"
    rows = []
    for i, el in enumerate(E.parse(p).getroot().iter(ns+'path')):
        attrs = {k: v for k, v in el.attrib.items() if not k.startswith('{')}
        original = el.get('{https://www.free-decompiler.com/flash}original-stroke-width')
        if original: attrs['stroke-width'] = original
        end = None
        end_attrs = {}
        for anim in el.findall(ns+'animate'):
            a, z = anim.get('values').split(';')
            if anim.get('attributeName') == 'd':
                assert attrs['d'] == a
                # These four source morphs contain only paired M/L coordinates.
                assert re.sub(r'[-+]?\d+(?:\.\d+)?', '', a) == re.sub(r'[-+]?\d+(?:\.\d+)?', '', z)
                assert not re.search('[A-KN-Za-kn-z]', a)
                end = z
            elif a != z:
                assert anim.get('attributeName') == 'stroke' and re.fullmatch('#[0-9a-f]{6}',a) and re.fullmatch('#[0-9a-f]{6}',z)
                end_attrs['stroke'] = z
        if id in morph_ids: assert end is not None
        rows.append(dict(sourcePathIndex=i, attributes=attrs, endPath=end, endAttributes=end_attrs))
    paths.append(dict(sourceShapeId=id, svgSha256=sha(p.read_bytes()), paths=rows))

labels = []
for p in main['frames'][6]:
    if 6 <= p['depth'] <= 32:
        t = texts[p['characterId']]
        labels.append(dict(sourceDepth=p['depth'], sourceTextId=t['sourceTextId'], text=''.join(r['text'] for r in t['runs']), **center(p)))
assert len(labels) == 27
assert next(l for l in labels if l['sourceDepth'] == 6)['text'] == '2'
assert next(l for l in labels if l['sourceDepth'] == 22)['text'] == '1'
assert next(l for l in labels if l['sourceDepth'] == 28)['text'] == '-5'

states = []
for row in main['frames']:
    dp = {p['depth']: p for p in row}
    byid = {p['characterId']: p for p in row}
    graph = [dict(sourceShapeId=p['characterId'], depth=p['depth'], alpha=alpha(p), ratio=p.get('ratio', 0), matrix=p['matrix'][:4]+[p['matrix'][4]/20, p['matrix'][5]/20]) for p in sorted(row, key=lambda p:p['depth']) if p['characterId'] in static_ids+morph_ids]
    grid_alpha = alpha(dp.get(5))
    assert all(alpha(dp.get(d)) == grid_alpha for d in range(6, 33))
    annotations = []
    for id in [32, 45, 49]:
        if id in byid:
            p, t = byid[id], texts[id]
            annotations.append(dict(sourceTextId=t['sourceTextId'], sourceCharacterId=id, text=''.join(r['text'] for r in t['runs']), alpha=alpha(p), **center(p)))
    states.append(dict(graph=graph, graphAlpha=grid_alpha, annotations=annotations, equationAlpha=alpha(byid.get(19)), firstCalculationAlpha=alpha(byid.get(20)), secondCalculationAlpha=alpha(byid.get(33)), firstXEmphasis=21 in byid, firstYEmphasis=22 in byid, secondXEmphasis=35 in byid, secondYEmphasis=38 in byid))

stream = json.loads((B/'native-v1/streams-v1.json').read_text())[0]
decode = json.loads((B/'audit-v1/native-decode-v1.json').read_text())
d = next(d for d in decode['streams'] if d['spriteId'] == 50)
sa = next(d for d in decode['streams'] if d['spriteId'] == 'SA')
assert d['sourceSha256'] == stream['sourceSha256'] and d['decodedSamples'] == stream['decodedSamplesCandidate']
assert all(d['contextClosed'] for d in decode['streams'])
clock = dict(version=1, sourceSwfSha256=m['source']['sha256'], frameDomain='sprite-50', firstFrame=1, frameCount=837, fps=12, playbackMode='loop', alignmentStatus='source-run-candidate-not-original-runtime-accepted', decoder={k:d[k] for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}, segments=stream['segments'], emptyNegativeBlocks=[])
native = dict(animationId=m['animationId'], sourceSha256=m['source']['sha256'], fps=12, rootFrameCount=10, rootEntryFrame=6, mainSpriteId=50, mainFrameCount=837, title='Linear and Nonlinear Functions: Instruction', titleSourceShapeId=1, titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()), graph=dict(viewBox=[-357,-150,310,310], paths=paths, labels=labels), equation=texts[19]['runs'][0]['text'], firstCalculation=[r['text'] for r in texts[20]['runs']], secondCalculation=[r['text'] for r in texts[33]['runs']], visualStates=spans(states), terms=[], clockPlan=clock, sa={k:sa[k] for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}, sourceTexts=[dict(characterId=t['characterId'], sourceTextId=t['sourceTextId'], text='\n'.join(r['text'] for r in t['runs']), sourceTagSha256=t['sourceTagSha256']) for t in texts.values()], independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
dispositions = {1:'Native title, verified from outlined source title', 2:'Exact graph paths; grid hairlines receive minimum visible native stroke', 21:'Native equation digit 2 white halo and x-axis 2 cyan emphasis', 22:'Native equation result 1 white halo and y-axis 1 cyan emphasis', 23:'Native y-axis 1 emphasis replaces duplicate overlay', 31:'Native background attached to character-32 coordinate', 34:'Native equation substitution 0 white halo', 35:'Native equation substitution 0 replaces duplicate overlay', 36:'Native origin 0 magenta emphasis', 37:'Native equation result negative5 white halo', 38:'Native equation result negative5 replaces duplicate overlay', 39:'Native y-axis negative5 magenta emphasis', 40:'Native y-axis negative5 replaces duplicate overlay', 44:'Native background attached to character-45 coordinate', 48:'Native background attached to character-49 equation', 18:'Native source grid zero; duplicate depth52 merged into same label during emphasis'}
summary = dict(status='pass', sourceFrames=837, spans=len(native['visualStates']), graphShapeCount=len(paths), graphLabels=27, masks=0, mainScripts=0, sourceTextDefinitions=len(texts), nativeDispositions=dispositions, fullAlphaFrames={key:next(i+1 for i,s in enumerate(states) if s[key]==1) for key in ['graphAlpha','equationAlpha','firstCalculationAlpha','secondCalculationAlpha']}, sourceLoopWithoutCompletion=True, originalRuntimeAccepted=False)
for name, value in [('native-v1/visual-model-v1.json',native), ('audit-v1/visual-derivation-v1.json',summary)]:
    out=json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n'; p=B/name
    if '--check' in sys.argv: assert p.read_text()==out
    else: p.write_text(out)
print(json.dumps(summary, ensure_ascii=False))
