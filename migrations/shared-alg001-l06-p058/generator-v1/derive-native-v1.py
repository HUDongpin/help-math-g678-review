"""P058 native text and original curved graph, cross-checked against raw SWF XML."""
from pathlib import Path
import hashlib,json,re,sys,xml.etree.ElementTree as ET
M=Path(__file__).resolve().parents[1];R=M.parents[1]
sha=lambda b:hashlib.sha256(b).hexdigest()
raw=(M/'native-v1/source-model-v1.json').read_bytes()
assert sha(raw)=='0241cb5d6f0427442f56d6ac9a5188e56f9c2a7394134ab2b897092003f22c04'
m=json.loads(raw);ex=json.loads((M/'audit-v1/source-extraction-v1.json').read_text())
ids=[17,145,146,148,149,151,152,154,155,*range(157,169),178,220,221,*range(223,231),*range(246,251),259,*range(261,267)]
texts={str(i):m['texts'][str(i)]['text']for i in ids};ranges={}
for i in m['domains']['285']['instances']:
 if i['objectId'] in ids:
  ranges.setdefault(str(i['objectId']),[]).extend([[r['firstFrame'],r['lastFrame']]for r in i['runs']if r['color']['factor']['Alpha']+r['color']['offset']['Alpha']>0])
 if i['objectId'] in [141,142,143]:
  assert all((r['matrixTwips']['transX']+m['rootMatrixTwips']['transX'])/20>800 for r in i['runs'])
name='sprites/DefineSprite_285/frames.html';pin=next(x for x in ex['files']if x['path']==name)
b=(Path(ex['exportRoot'])/name).read_bytes();assert sha(b)==pin['sha256']
frames=b.decode().replace('\r\n','\n');start=frames.index('function shape156(');end=frames.index('\nfunction ',start+1);fn=frames[start:end]
paths=[]
for part in fn.split('var pathData="')[1:]:
 path,rest=part.split('";',1);stroke=re.search(r'ctx.strokeStyle=tocolor\(ctrans.apply\((\[[^\n]+?\])\)\);',rest)
 if stroke:paths.append({'path':path,'color':json.loads(stroke[1]),'width':float(re.search(r'ctx.lineWidth=([\d.]+);',rest)[1])})
curve=[p['path']for p in paths if p['width']==2 and 'Q' in p['path']];assert len(curve)==1
grid=[p['path']for p in paths if p['color']==[255,51,0,1]];assert len(grid)==17
xml=Path(ex['xml']['path']).read_bytes();assert sha(xml)==ex['xml']['sha256']
shape=ET.fromstring(xml).find('.//DefineShape2[@objectID="156"]');edges=list(shape.find('./shapes/Shape/edges'))
begin=next(i for i,e in enumerate(edges)if e.tag=='ShapeSetup'and e.get('x')=='-2720'and e.get('y')=='150')
x,y=-2720,150;commands=[['M',x,y]]
for e in edges[begin+1:]:
 if e.tag=='ShapeSetup':assert not e.attrib;break
 if e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));commands.append(['L',x,y])
 elif e.tag=='CurveTo':
  cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));commands.append(['Q',cx,cy,x,y])
 else:raise AssertionError(e.tag)
# Expand implicit SVG repetitions and compare every line and quadratic point.
tokens=re.findall(r'[MLQ]|-?\d+',curve[0]);parsed=[];i=0;cmd=None
while i<len(tokens):
 if tokens[i] in ['M','L','Q']:cmd=tokens[i];i+=1
 count=4 if cmd=='Q'else 2;parsed.append([cmd,*map(int,tokens[i:i+count])]);i+=count
assert parsed==commands and sum(c[0]=='Q'for c in commands)==5
assert (x,y)==(332,154)
graph={'shapeId':156,'sourceFunctionSha256':sha(fn.encode()),'xmlSha256':sha(xml),'sourceCurvePath':curve[0],'sourceGridPaths':grid,
 'sourceCurveCommands':commands,'viewBox':[-2731,-114,3072,1280],
 'xLabels':[{'id':i,'text':texts[str(i)],'sourceX':x}for i,x in zip(range(162,169),[-2731,-2211,-1707,-1195,-683,-179,341],strict=True)],
 'yLabels':[{'id':i,'text':texts[str(i)],'sourceY':y}for i,y in [(159,-114),(160,398),(161,902)]],
 'coordinateAuthority':'Original XML line/quadratic deltas independently equal exported curve; source grid and text labels. No invented numeric function.'}
data={'sourceSha256':m['sourceSha256'],'sourceModelSha256':sha(raw),'texts':texts,'mainTextRanges':ranges,'graph':graph,'excludedOffstageAngleTexts':[141,142,143],'modernNativeLayout':True}
code='// Generated from pinned P058 source text, lifetimes and shape156. Do not hand-edit.\nexport const P058_NATIVE_SOURCE = '+json.dumps(data,ensure_ascii=False,indent=2)+' as const;\n'
p=R/'packages/demos/src/generated/alg-l06-p058-native-v1.ts';assert sys.argv[1:]in [['--write'],['--check']]
if sys.argv[1]=='--write':p.write_text(code)
else:assert p.read_text()==code
print(json.dumps({'status':'PASS','texts':len(texts),'curveSegments':len(commands)-1,'quadratics':5,'sha256':sha(code.encode())}))
