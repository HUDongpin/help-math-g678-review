from pathlib import Path
import json,xml.etree.ElementTree as E,importlib.util,hashlib,sys
B=Path(__file__).resolve().parents[1];s=importlib.util.spec_from_file_location('source',B/'generator-v1/derive-source-v1.py');a=importlib.util.module_from_spec(s);s.loader.exec_module(a)
m=a.build();rt=E.parse(B/'source-v1/movie.xml').getroot().find('Header/tags');defs={int(t.get('objectID')):t for t in rt if t.tag.startswith('Define') and t.get('objectID')};main=defs[452]
roles={400:(0,'monthly'),**{cid:(0,'rate') for cid in [403,414,415,416,417]},420:(1,'monthly'),423:(1,'rate'),426:(2,'monthly'),**{cid:(2,'rate') for cid in [430,432,433,434,435]}}
active={};frames=[];instances={};f=1
for t in main.find('tags'):
 if t.tag=='PlaceObject2':
  d=int(t.get('depth'));v=active.get(d,{}).copy()
  if t.get('objectID'):v={'id':int(t.get('objectID')),'matrix':{'scaleX':1.,'scaleY':1.,'skewX':0.,'skewY':0.,'transX':0.,'transY':0.},'alpha':256}
  if t.find('transform') is not None:v['matrix']=a.matrix(t)
  c=t.find('colorTransform/ColorTransform2')
  if c is not None:v['alpha']=int(c.get('factorAlpha','256'))
  active[d]=v
 elif t.tag=='RemoveObject2':active.pop(int(t.get('depth')),None)
 elif t.tag=='ShowFrame':
  accents=[];ids=[]
  for d,v in active.items():
   if v['id'] not in roles:continue
   cid=v['id'];box=a.stagebox(defs[cid].find('bounds/Rectangle').attrib,v['matrix']);eligible=v['alpha']>0 and box[0]>=76.71 and box[1]>=88.58 and box[2]<=741.81 and box[3]<=477.85
   if eligible:accents.append(roles[cid]);ids.append(cid)
   instances.setdefault(cid,[]).append({'frame':f,'depth':d,'alpha':v['alpha'],'sourceBox':box,'fullyVisible':eligible})
  frames.append({'frame':f,'accents':sorted(set(accents)),'shapeIds':ids});f+=1
out={'schemaVersion':1,'animationId':m['animationId'],'sourceSha256':m['physicalSource']['sha256'],'sourceXmlSha256':m['swfmillXml']['sha256'],'method':'Source price glyph contours with magenta outline and black glyph fill only; exact per-frame source placements and positive on-stage bounds, mapped to independently decoded table cells. No character/art/decorative geometry suppression.','roles':[{'shapeId':cid,'row':r,'cell':c,'sourceTextId':f'character-{156+r}','sourceShapeDefinitionSha256':hashlib.sha256(E.tostring(defs[cid])).hexdigest(),'sourceSvgSha256':hashlib.sha256((B/f'audit-v1/price-shapes-v1/{cid}.svg').read_bytes()).hexdigest()} for cid,(r,c) in roles.items()],'frames':frames,'instances':instances,'originalRuntimeAccepted':False}
b=(json.dumps(out,indent=2)+'\n').encode();p=B/'native-v1/outline-emphasis-v1.json'
if '--check' in sys.argv:assert p.read_bytes()==b
else:p.open('xb').write(b)
print(json.dumps({'pass':True,'900':frames[899],'1077':frames[1076],'shapeCount':len(roles)}))
