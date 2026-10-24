from pathlib import Path
import hashlib, json, math, sys, xml.etree.ElementTree as E

M = Path(__file__).resolve().parents[1]
B = Path('/Volumes/American Dream/.g6l8p28audit1')
catalog = json.loads((B / 'text-catalog.json').read_text())
xml = E.parse(B / 'movie.xml').getroot()
font = xml.find('Header/tags/DefineFont2[@objectID="3"]')
assert font.get('name') == 'Bauhaus Md BT'
assert catalog['fonts'][0]['unitsPerEm'] == 1024
glyphs = list(font.find('glyphs'))

def outline_bounds(glyph):
    x = y = 0
    points = []
    def quadratic(p0, p1, p2, t):
        return (1-t)**2*p0 + 2*(1-t)*t*p1 + t*t*p2
    for edge in glyph.find('GlyphShape/edges'):
        if edge.tag == 'ShapeSetup':
            if 'x' in edge.attrib:
                x = int(edge.get('x')); y = int(edge.get('y'))
        elif edge.tag == 'LineTo':
            points.append((x,y)); x += int(edge.get('x')); y += int(edge.get('y')); points.append((x,y))
        elif edge.tag == 'CurveTo':
            x1 = x + int(edge.get('x1')); y1 = y + int(edge.get('y1'))
            x2 = x1 + int(edge.get('x2')); y2 = y1 + int(edge.get('y2'))
            points.extend([(x,y),(x2,y2)])
            for p0,p1,p2 in [(x,x1,x2),(y,y1,y2)]:
                denominator = p0 - 2*p1 + p2
                if denominator:
                    t = (p0-p1)/denominator
                    if 0 < t < 1:
                        points.append((quadratic(x,x1,x2,t),quadratic(y,y1,y2,t)))
            x,y = x2,y2
        else:
            raise AssertionError('unparsed glyph edge ' + edge.tag)
    if not points:
        return None
    return {'left': min(x for x,y in points), 'right': max(x for x,y in points),
            'top': min(y for x,y in points), 'bottom': max(y for x,y in points)}

bounds = [outline_bounds(g) for g in glyphs]
text = next(t for t in catalog['textDefinitions'] if t['characterId'] == 20)
assert text['matrix'] == [1,0,0,1,-5733,0]
x = y = 0
runs = []
for run in text['runs']:
    if run['changed']['xOffset']: x = run['xOffsetTwips']
    if run['changed']['yOffset']: y = run['yOffsetTwips']
    scale = run['fontHeightTwips']/1024
    painted = []
    placements = []
    for glyph in run['glyphs']:
        b = bounds[glyph['index']]
        assert int(glyphs[glyph['index']].get('map')) == glyph['code']
        if b:
            shifted = {'left':x+b['left']*scale-5733, 'right':x+b['right']*scale-5733,
                       'top':y+b['top']*scale, 'bottom':y+b['bottom']*scale}
            painted.append(shifted)
            placements.append({'unicode':glyph['unicode'], 'sourceGlyphIndex':glyph['index'],
                               'penX':x, 'penY':y, 'boundsTextLocalTwips':shifted})
        x += glyph['advanceTwips']
    if run['colorRgba'] == [0,0,204,255]:
        runs.append({'text':run['text'],'runIndex':run['runIndex'],'fontId':3,'fontHeightTwips':run['fontHeightTwips'],
                     'glyphs':placements,'boundsTextLocalTwips':{
                         'left':min(b['left'] for b in painted),'right':max(b['right'] for b in painted),
                         'top':min(b['top'] for b in painted),'bottom':max(b['bottom'] for b in painted)}})
assert [r['text'] for r in runs] == ['Graph ',' linear equation','slope','y-intercept']
for run,key in zip(runs,['Graph','Linear equation','Slope','Y-intercept']): run['sourceKeyAttribute']=key
record = {'sourceSwfSha256':catalog['sourceSha256'],'sourceTextCharacterId':20,
          'sourceTextMatrix':text['matrix'],'method':'Exact embedded DefineFont2 contours, quadratic extrema, source glyph advances and continuing run pen; no system font metrics.',
          'fontGlyphCount':len(glyphs),'runs':runs,'originalPointerHitBehaviorAccepted':False,
          'sourceCatalogSha256':hashlib.sha256((B/'text-catalog.json').read_bytes()).hexdigest(),
          'swfmillXmlSha256':hashlib.sha256((B/'movie.xml').read_bytes()).hexdigest()}
out = json.dumps(record,ensure_ascii=False,indent=2)+'\n'
dest = M/'native-v1/glossary-glyph-runs-v1.json'
if dest.exists() or '--check' in sys.argv: assert dest.read_text() == out
else: dest.write_text(out)
print(json.dumps({r['sourceKeyAttribute']:r['boundsTextLocalTwips'] for r in runs}))
