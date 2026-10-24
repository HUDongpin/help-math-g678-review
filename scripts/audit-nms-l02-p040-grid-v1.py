"""Classify source grid cell centers using the source fill edges, not a percent label."""
from pathlib import Path
import json,xml.etree.ElementTree as ET,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p040/audit';x=ET.parse(A/'source-swfmill-v1.xml');shape=next(e for e in x.iter('DefineShape3')if e.get('objectID')=='22');edges=shape.find('./shapes/Shape/edges');epoch=0;px=py=0;f0=f1=line=0;fills={1:[],2:[]};lines=[]
for e in edges:
 a=e.attrib
 if e.tag=='ShapeSetup':
  if e.find('styles')is not None:epoch+=1;assert epoch==1;colors=[tuple(int(c.get(k,'255'))for k in ['red','green','blue','alpha'])for c in e.findall('./styles/StyleList/fillStyles/Solid/color/Color')];assert colors==[(255,255,255,255),(255,255,102,255)]
  px=int(a.get('x',px));py=int(a.get('y',py));f0=int(a.get('fillStyle0',f0));f1=int(a.get('fillStyle1',f1));line=int(a.get('lineStyle',line))
 elif e.tag=='LineTo':
  end=(px+int(a['x']),py+int(a['y']));start=(px,py)
  if epoch:
   if f0:fills[f0].append((end,start))
   if f1:fills[f1].append((start,end))
   if line:lines.append((start,end))
  px,py=end
 elif e.tag=='CurveTo':
  assert epoch==0,'Grid contains unexpected curved edge';px+=int(a['x1'])+int(a['x2']);py+=int(a['y1'])+int(a['y2'])
 else:raise ValueError(e.tag)
def inside(p,segments):
 count=0
 for (x1,y1),(x2,y2)in segments:
  if (y1>p[1])!=(y2>p[1]):
   cross=x1+(p[1]-y1)*(x2-x1)/(y2-y1)
   if cross>p[0]:count+=1
 return bool(count%2)
xs=sorted({a[0]for a,b in lines if a[0]==b[0]});ys=sorted({a[1]for a,b in lines if a[1]==b[1]});print('axes',xs,ys)
assert len(xs)==11 and len(ys)==11
cells=[]
for row in range(10):
 for col in range(10):
  probes=[(xs[col]+(xs[col+1]-xs[col])*u,ys[row]+(ys[row+1]-ys[row])*v)for u in [.25,.5,.75]for v in [.25,.5,.75]];classes=[]
  for p in probes:
   matches=[i for i in [1,2]if inside(p,fills[i])];assert len(matches)==1,(row,col,p,matches);classes.append(matches[0])
  assert len(set(classes))==1,(row,col,classes)
  cells.append({'row':row,'column':col,'filled':classes[0]==2})
filled=[i for i,c in enumerate(cells)if c['filled']];assert len(filled)==40,len(filled)
d={'animationId':'shared-nms002-l02-p040','sourceShapeId':22,'sourceXmlSha256':hashlib.sha256((A/'source-swfmill-v1.xml').read_bytes()).hexdigest(),'xLines':xs,'yLines':ys,'cells':cells,'filledCells':filled,'filledCount':len(filled),'totalCells':100,'interiorProbes':900,'qualification':'Source grid fill membership at nine interior points per cell; native grid can preserve these identities. Does not establish original-runtime raster fidelity.'};p=A/'source-grid-v1.json';s=json.dumps(d,indent=2)+'\n'
if p.exists():assert p.read_text()==s
else:p.write_text(s)
svg=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {xs[-1]-xs[0]} {ys[-1]-ys[0]}">']
for c in cells:svg.append(f'<rect x="{xs[c["column"]]-xs[0]}" y="{ys[c["row"]]-ys[0]}" width="{xs[c["column"]+1]-xs[c["column"]]}" height="{ys[c["row"]+1]-ys[c["row"]]}" fill="'+('#ffff66'if c['filled']else'#ffffff')+'" stroke="#000000" stroke-width="20"/>')
svg.append('</svg>');(A/'source-grid-occupancy-v1.svg').write_text('\n'.join(svg));print(json.dumps({'filledCount':40,'probes':900,'filledCells':filled}))
