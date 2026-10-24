#!/usr/bin/env python3
"""Derive occurrence geometry from exact shipped SWF XML; no runtime acceptance."""
import hashlib,json,pathlib,xml.etree.ElementTree as ET
ROOT=pathlib.Path(__file__).resolve().parent.parent
XML=ROOT/'migrations/shared-alg001-l06-p004/audit/movie-root-verified.xml'
OUT=XML.parent/'button-geometry-v1.json'
r=ET.parse(XML).getroot()
def matrix(node):
 t=node.find('transform/Transform')
 return dict(t.attrib) if t is not None else None
symbols={int(x.get('objectID')):x for x in r.find('Header/tags') if x.tag.startswith('Define') and x.get('objectID')}
buttons={}
for key in [57,59,79,80,81,84,85,86]:
 b=symbols[key];hits=[x for x in b.findall('buttons/Button') if x.get('hitTest')=='1'];assert len(hits)==1
 hit=hits[0];shape=symbols[int(hit.get('objectID'))];rect=shape.find('bounds/Rectangle');assert matrix(hit)=={'transX':'0','transY':'0'}
 edges=shape.findall('shapes/Shape/edges/LineTo');assert len(edges)==4
 terms=[s.get('value') for s in b.findall('conditions/Condition/actions/Dictionary/strings/String')];assert terms[1]=='KeyAttribute' and terms[4]=='DoHyperLinks'
 buttons[key]={'term':terms[2],'bounds':{k:int(v) for k,v in rect.attrib.items()}}
root_placements=[t for t in r.find('Header/tags') if t.tag.startswith('PlaceObject') and t.get('objectID')=='95']
assert len(root_placements)==1 and matrix(root_placements[0])=={'transX':'7390','transY':'5060'}
main=symbols[95];frame=1;states={};samples={}
for tag in main.find('tags'):
 if tag.tag.startswith('PlaceObject'):
  depth=int(tag.get('depth'));state=dict(states.get(depth,{}))
  if tag.get('objectID'):state['symbol']=int(tag.get('objectID'))
  if matrix(tag) is not None:state['matrix']=matrix(tag)
  states[depth]=state
 elif tag.tag.startswith('RemoveObject'):states.pop(int(tag.get('depth')),None)
 elif tag.tag=='ShowFrame':
  for depth,state in states.items():
   if state.get('symbol') not in buttons:continue
   symbol=state['symbol'];m=state['matrix'];assert not any(k in m for k in ['skewX','skewY','rotateSkew0','rotateSkew1'])
   b=buttons[symbol]['bounds'];sx=float(m.get('scaleX',1));sy=float(m.get('scaleY',1));tx=int(m.get('transX',0))+7390;ty=int(m.get('transY',0))+5060
   geometry=[(b['left']*sx+tx)/20,(b['top']*sy+ty)/20,(b['right']-b['left'])*sx/20,(b['bottom']-b['top'])*sy/20]
   key=f'{symbol}@{depth}';samples.setdefault(key,[]).append({'frame':frame,'rect':geometry,'matrix':m})
  frame+=1
assert frame==832 and len(samples)==9
rows=[]
for key,values in samples.items():
 symbol,depth=map(int,key.split('@'));runs=[]
 for value in values:
  if runs and runs[-1]['lastFrame']==value['frame']-1 and runs[-1]['rect']==value['rect']:runs[-1]['lastFrame']=value['frame']
  else:runs.append({'firstFrame':value['frame'],'lastFrame':value['frame'],'rect':value['rect']})
 rows.append({'occurrenceId':key,'buttonId':symbol,'depth':depth,'keyAttribute':buttons[symbol]['term'],'ranges':runs})
report={'schemaVersion':1,'kind':'alg-l06-p004-button-geometry-v1','xmlSha256':hashlib.sha256(XML.read_bytes()).hexdigest(),'frameDomain':'sprite-95','rootEntryFrame':6,'rootTranslationTwips':[7390,5060],'coordinateSystem':'800x600 root pixels','occurrences':rows,'qualification':'Source rectangular hit geometry and display-list membership. Original host interaction, clipping, and runtime acceptance remain unestablished.'}
body=(json.dumps(report,indent=2)+'\n').encode()
if OUT.exists():assert OUT.read_bytes()==body
else:OUT.write_bytes(body)
print(json.dumps({'occurrences':len(rows),'ranges':sum(len(r['ranges']) for r in rows),'output':str(OUT),'sha256':hashlib.sha256(body).hexdigest()}))
