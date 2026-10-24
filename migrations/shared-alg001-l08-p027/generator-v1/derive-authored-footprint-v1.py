"""Prove the source's final masked glyph footprint without changing its geometry."""
from pathlib import Path
import hashlib,json,math,xml.etree.ElementTree as E
M=Path(__file__).resolve().parents[1]
D=Path('/Volumes/American Dream/.g6l8p27audit1')
cat=json.loads((D/'text-catalog.json').read_text())
main=next(t for t in cat['timelines'] if t['timelineId']=='sprite-41')
# Reconstruct source states independently from the candidate model.
live={}; frames=[]
for frame in range(1,710):
 for e in [e for e in main['events'] if e['frame']==frame]:
  if e['kind']=='remove': del live[e['depth']]
  elif e['kind']=='place':
   p=live[e['depth']].copy() if e['move'] else {'depth':e['depth'],'matrix':[1,0,0,1,0,0]}
   for k in ['characterId','matrix','clipDepth','instanceId']:
    if k in e:p[k]=e[k]
   live[e['depth']]=p
 frames.append({d:p.copy() for d,p in live.items()})
final=frames[-1][43];assert final['characterId']==18 and final['clipDepth']==54
assert final['matrix']==[1,0,0,1,-248,-3816]
assert all(f[43]==final for f in frames[74:])
assert frames[73][43]!=final
assert all(f[45]['matrix']==[1,0,0,1,-500,-4062] for f in frames[10:])
assert all(f[43]['matrix'][1:4]==[0,0,1] and f[43]['matrix'][5]==-3816 for f in frames[10:])
xml=E.parse(D/'movie.xml').getroot();font=xml.find('Header/tags/DefineFont2[@objectID="3"]');glyphs=list(font.find('glyphs'))
shape=xml.find('Header/tags/DefineShape3[@objectID="18"]')
if shape is None:shape=xml.find('Header/tags/DefineShape[@objectID="18"]')
assert shape is not None
# Final mask and text placement are source-local twips. All source glyph x lies
# inside the final mask; only the authored horizontal strip clips the glyphs.
bounds={k:int(v) for k,v in shape.find('bounds/Rectangle').attrib.items()}
assert bounds=={'left':-6980,'right':7219,'top':-250,'bottom':250}
edges=list(shape.find('shapes/Shape/edges'))
assert [e.tag for e in edges]==['ShapeSetup','LineTo','LineTo','LineTo','LineTo','ShapeSetup']
assert [(int(e.get('x')),int(e.get('y'))) for e in edges[1:5]]==[(0,500),(-14199,0),(0,-500),(14199,0)]
assert edges[0].get('fillStyle1')=='1' and len(list(shape.find('styles/StyleList/lineStyles')))==0
clip={k:v+final['matrix'][4 if k in ['left','right'] else 5]-frames[-1][45]['matrix'][4 if k in ['left','right'] else 5] for k,v in bounds.items()}
runs=json.loads((M/'native-v1/glossary-glyph-runs-v1.json').read_text())['runs']
def q(p0,p1,p2,t):return (1-t)**2*p0+2*(1-t)*t*p1+t*t*p2
def roots(p0,p1,p2,value):
 a=p0-2*p1+p2;b=2*(p1-p0);c=p0-value
 if abs(a)<1e-12:return [] if abs(b)<1e-12 else [-c/b]
 disc=b*b-4*a*c
 if disc<0:return []
 return [(-b-math.sqrt(disc))/(2*a),(-b+math.sqrt(disc))/(2*a)]
def clipped_bounds(g, height):
 x=y=0;segments=[]
 for e in glyphs[g['sourceGlyphIndex']].find('GlyphShape/edges'):
  if e.tag=='ShapeSetup':
   if 'x' in e.attrib:x=int(e.get('x'));y=int(e.get('y'))
  elif e.tag=='LineTo':
   end=(x+int(e.get('x')),y+int(e.get('y')));segments.append(((x,y),((x+end[0])/2,(y+end[1])/2),end));x,y=end
  elif e.tag=='CurveTo':
   control=(x+int(e.get('x1')),y+int(e.get('y1')));end=(control[0]+int(e.get('x2')),control[1]+int(e.get('y2')));segments.append(((x,y),control,end));x,y=end
  else:raise AssertionError(e.tag)
 pts=[];scale=height/1024
 for seg in segments:
  xs=[p[0]*scale+g['penX']-6514 for p in seg];ys=[p[1]*scale+g['penY'] for p in seg]
  cuts=sorted(set([0,1]+[t for edge in [clip['top'],clip['bottom']] for t in roots(*ys,edge) if 0<t<1]))
  for a,b in zip(cuts,cuts[1:]):
   ym=q(*ys,(a+b)/2)
   if not clip['top']-1e-8<=ym<=clip['bottom']+1e-8:continue
   ts=[a,b]
   for vals in [xs,ys]:
    denom=vals[0]-2*vals[1]+vals[2]
    if denom:
     t=(vals[0]-vals[1])/denom
     if a<t<b:ts.append(t)
   pts.extend((q(*xs,t),q(*ys,t)) for t in ts)
 assert pts,'No glyph contour inside final source strip'
 return {'left':min(p[0] for p in pts),'right':max(p[0] for p in pts),'top':max(clip['top'],min(p[1] for p in pts)),'bottom':min(clip['bottom'],max(p[1] for p in pts))}
result=[]
for r in runs:
 raw=r['boundsTextLocalTwips'];assert clip['left']<raw['left']<raw['right']<clip['right']
 bs=[clipped_bounds(g,r['fontHeightTwips']) for g in r['glyphs']]
 b={k:(min if k in ['left','top'] else max)(v[k] for v in bs) for k in ['left','right','top','bottom']}
 # Source strip spans the complete glyph run width; its retained bounds equal
 # this exact curve clipping, rather than an assumed font-metric rectangle.
 naive={k:(max(raw[k],clip[k]) if k in ['left','top'] else min(raw[k],clip[k])) for k in b}
 for k in b:assert abs(b[k]-naive[k])<1e-8,(r['sourceKeyAttribute'],k,b,naive)
 result.append({'sourceKeyAttribute':r['sourceKeyAttribute'],'sourceTextCharacterId':20,'fullGlyphBoundsTextLocalTwips':raw,'authoredPaintedBoundsTextLocalTwips':b,'permanentCropPixels':{'top':max(0,clip['top']-raw['top'])/20,'bottom':max(0,raw['bottom']-clip['bottom'])/20},'glyphCount':len(bs)})
record={'animationId':'shared-alg001-l08-p027','sourceSwfSha256':cat['sourceSha256'],'sourceCatalogSha256':hashlib.sha256((D/'text-catalog.json').read_bytes()).hexdigest(),'swfmillXmlSha256':hashlib.sha256((D/'movie.xml').read_bytes()).hexdigest(),'method':'Exact source glyph contour quadratic intersections with the final authored rectangular strip; all glyph x extrema remain within the final source strip; clipped contour extrema independently equal the conservative run-box intersection.','maskCharacterId':18,'maskDepth':43,'maskClipDepth':54,'terminalMaskFirstFrame':75,'terminalMaskLastFrame':709,'terminalMaskMatrix':final['matrix'],'textPlacementMatrix':[1,0,0,1,-500,-4062],'sourceFinalMaskInTextLocalTwips':clip,'runs':result,'sourceGeometryChanged':False,'originalPointerBehaviorAccepted':False,'fidelityAccepted':False}
dest=M/'native-v1/authored-footprint-v1.json';data=json.dumps(record,ensure_ascii=False,indent=2)+'\n'
if dest.exists():assert dest.read_text()==data
else:dest.write_text(data)
print(json.dumps(record,ensure_ascii=False))
