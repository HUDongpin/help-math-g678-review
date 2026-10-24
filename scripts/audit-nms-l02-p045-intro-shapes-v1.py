from pathlib import Path
import json,hashlib,xml.etree.ElementTree as ET
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p045/audit';c=json.loads((A/'source-text-catalog-v1.json').read_text());events=next(t for t in c['timelines']if t['timelineId']=='sprite-204')['events'];live={};rows=[]
for frame in range(1,450):
 for e in events:
  if e['frame']!=frame:continue
  if e['kind']=='remove':live.pop(e['depth'],None)
  elif e['kind']=='place':
   old=live.get(e['depth'],{})if e.get('move')else{};live[e['depth']]={**old,**e,'matrix':e.get('matrix')or old.get('matrix')or[1,0,0,1,0,0]}
 chart=live.get(20);row={'frame':frame,'chart':None}
 if chart:
  ident=chart['characterId'];p=A/'shapes-svg-v1'/f'{ident}.svg';assert p.is_file();cx=chart.get('colorTransform');alpha=cx['multiply'][3]/cx['divisor']+cx['add'][3]/255 if cx else 1;row['chart']={'characterId':ident,'matrix':chart['matrix'],'alpha':alpha,'svgSha256':hashlib.sha256(p.read_bytes()).hexdigest()}
 rows.append(row)
ranges=[]
for r in rows:
 if ranges and ranges[-1]['chart']==r['chart']:ranges[-1]['lastFrame']=r['frame']
 else:ranges.append({'firstFrame':r['frame'],'lastFrame':r['frame'],'chart':r['chart']})
ids=sorted({r['chart']['characterId']for r in rows if r['chart']});assets=[]
for ident in ids:
 p=A/'shapes-svg-v1'/f'{ident}.svg';root=ET.parse(p).getroot();assets.append({'characterId':ident,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'gradients':[{'id':e.get('id'),'stops':[s.attrib for s in e if s.tag.endswith('stop')]}for e in root.iter()if e.tag.endswith('Gradient')]})
result={'sourceSha256':c['sourceSha256'],'domain':'sprite-204','sourceDepth':20,'rows':rows,'ranges':ranges,'assets':assets,'observations':['The introductory chart uses separate gradient assets, not the blue practice-sector sprites.','Chart117 replaces the prior example at286 and remains through449; live practice chart177 enters at450 at another depth.','All source chart changes and opacity are preserved as structural evidence; modern timing/geometry decisions and original playback remain separate.'],'originalRuntimeAccepted':False}
with(A/'intro-chart-timeline-v1.json').open('x')as f:f.write(json.dumps(result,indent=2)+'\n')
assert rows[285]['chart']['characterId']==117 and rows[448]['chart']['characterId']==117
print(json.dumps({'frames':len(rows),'ranges':len(ranges),'uniqueChartShapes':len(ids),'ids':ids}))
