"""Quadratic glyph bounds against the source rectangular instruction mask."""
from pathlib import Path
import json,xml.etree.ElementTree as ET,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p040/audit';c=json.loads((A/'source-text-catalog-v1.json').read_text());ir=json.loads((A/'display-ir-v1.json').read_text());x=ET.parse(A/'source-swfmill-v1.xml');fonts={}
def bounds(edges):
 px=py=0;points=[]
 for e in edges:
  a=e.attrib
  if e.tag=='ShapeSetup':px=int(a.get('x',px));py=int(a.get('y',py))
  elif e.tag=='LineTo':
   points.append((px,py));px+=int(a['x']);py+=int(a['y']);points.append((px,py))
  elif e.tag=='CurveTo':
   q=(px+int(a['x1']),py+int(a['y1']));end=(q[0]+int(a['x2']),q[1]+int(a['y2']));start=(px,py);points.extend([start,end])
   for axis in [0,1]:
    den=start[axis]-2*q[axis]+end[axis]
    if den:
     t=(start[axis]-q[axis])/den
     if 0<t<1:points.append(tuple((1-t)**2*start[j]+2*(1-t)*t*q[j]+t*t*end[j]for j in [0,1]))
   px,py=end
 if not points:return None
 return [min(p[0]for p in points),min(p[1]for p in points),max(p[0]for p in points),max(p[1]for p in points)]
def transform(b,m):
 a,bm,c,d,tx,ty=m;pts=[(a*u+c*v+tx,bm*u+d*v+ty)for u,v in [(b[0],b[1]),(b[0],b[3]),(b[2],b[1]),(b[2],b[3])]];return [min(p[0]for p in pts),min(p[1]for p in pts),max(p[0]for p in pts),max(p[1]for p in pts)]
for f in x.iter('DefineFont2'):fonts[int(f.get('objectID'))]=[bounds(g.find('./GlyphShape/edges'))for g in f.find('glyphs')]
t=next(t for t in c['textDefinitions']if t['characterId']==27);glyphs=[];cursorX=cursorY=0;fontId=None;height=None
for run in t['runs']:
 if run.get('fontId')is not None:fontId=run['fontId']
 if run.get('fontHeightTwips')is not None:height=run['fontHeightTwips']
 if run.get('xOffsetTwips')is not None:cursorX=run['xOffsetTwips']
 if run.get('yOffsetTwips')is not None:cursorY=run['yOffsetTwips']
 for g in run['glyphs']:
  b=fonts[fontId][g['index']];scaled=None if b is None else transform(b,[height/1024,0,0,height/1024,cursorX,cursorY]);glyphs.append({'offset':len(glyphs),'text':g['unicode'],'bounds':None if scaled is None else transform(scaled,t['matrix'])});cursorX+=g['advanceTwips']
mask=next(e for e in x.iter('DefineShape3')if e.get('objectID')=='25');edges=list(mask.find('./shapes/Shape/edges'));assert [e.tag for e in edges]==['ShapeSetup','LineTo','LineTo','LineTo','LineTo','ShapeSetup'];mb=bounds(edges);assert mb==[-6789,-270,6788,271]
rows=[];schedule={g['offset']:[]for g in glyphs if g['bounds']}
for frame,items in enumerate(ir['domains']['sprite-43']['frames'],1):
 byDepth={i['depth']:i for i in items};text=next((i for i in items if i['characterId']==27),None);visible=[]
 if text:
  masks=[byDepth[d]for d in text['maskDepths']];assert len(masks)==1 and masks[0]['characterId']==25;box=transform(mb,masks[0]['matrix'])
  for g in glyphs:
   if g['bounds']is None:continue
   b=transform(g['bounds'],text['matrix']);inside=b[0]>=box[0]-1e-7 and b[1]>=box[1]-1e-7 and b[2]<=box[2]+1e-7 and b[3]<=box[3]+1e-7
   if inside:visible.append(g['offset']);schedule[g['offset']].append(frame)
 rows.append({'frame':frame,'fullyContainedOffsets':visible})
for g in glyphs:
 frames=schedule.get(g['offset'],[]);g['firstFullContainment']=frames[0]if frames else None
 if frames:assert frames==list(range(frames[0],441)),g
out={'animationId':'shared-nms002-l02-p040','sourceSha256':c['sourceSha256'],'text':''.join(g['text']for g in glyphs),'glyphs':glyphs,'frames':rows,'qualification':'Exact quadratic glyph bounds with affine transforms, conservative rectangular full containment; not pixel masking or original-runtime acceptance.'};p=A/'source-glyph-mask-v1.json';data=json.dumps(out,indent=2)+'\n'
if p.exists():assert p.read_text()==data
else:p.write_text(data)
print(json.dumps({'glyphs':len(glyphs),'first':min(g['firstFullContainment']for g in glyphs if g['firstFullContainment']),'last':max(g['firstFullContainment']for g in glyphs if g['firstFullContainment']),'unrevealedNonspace':[g['text']for g in glyphs if g['text'].strip()and g['firstFullContainment']is None]}))
