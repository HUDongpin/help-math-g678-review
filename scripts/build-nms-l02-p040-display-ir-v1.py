"""Reconstruct structural display lists, preserving inherited PlaceObject state."""
from pathlib import Path
import json,hashlib,copy
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p040/audit';p=A/'source-text-catalog-v1.json';c=json.loads(p.read_text());assert c['sourceSha256']=='be66f636ecc8a705fa6e61b5de03d044cfe0f9b988585a708ecaf0f1e1e832fb';out={};runs=[]
fields=['characterId','matrix','colorTransform','ratio','name','clipDepth','visible','blendMode','filters','instanceId']
for t in c['timelines']:
 events={}
 for e in t['events']:events.setdefault(e['frame'],[]).append(e)
 live={};frames=[]
 for frame in range(1,t['declaredFrameCount']+1):
  for e in events.get(frame,[]):
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    depth=e['depth']
    if e.get('move'):assert depth in live;state=copy.deepcopy(live[depth])
    else:state={'matrix':[1,0,0,1,0,0],'depth':depth}
    for field in fields:
     if field in e:state[field]=copy.deepcopy(e[field])
    assert 'characterId'in state;live[depth]=state
  row=[]
  for depth,state in sorted(live.items()):
   item=copy.deepcopy(state);item['maskDepths']=[d for d,m in sorted(live.items())if d<depth<=m.get('clipDepth',-1)];row.append(item)
  frames.append(row)
 out[t['timelineId']]={'frameCount':len(frames),'frames':frames}
main=out['sprite-43']['frames'];characters=sorted({x['characterId']for f in main for x in f})
for char in characters:
 spans=[];start=None
 for f,row in enumerate(main,1):
  present=any(x['characterId']==char for x in row)
  if present and start is None:start=f
  if not present and start is not None:spans.append([start,f-1]);start=None
 if start is not None:spans.append([start,len(main)])
 runs.append({'characterId':char,'placementIntervals':spans,'qualification':'Placement presence only, not mask or alpha visibility.'})
d={'schemaVersion':1,'animationId':'shared-nms002-l02-p040','sourceSha256':c['sourceSha256'],'sourceCatalogSha256':hashlib.sha256(p.read_bytes()).hexdigest(),'domains':out,'mainPlacementIntervals':runs,'qualification':'Post-tag structural display lists; inherited transforms retained. No script execution, pixel mask visibility, or runtime fidelity claim.'};dest=A/'display-ir-v1.json';s=json.dumps(d,indent=2)+'\n'
if dest.exists():assert dest.read_text()==s
else:dest.write_text(s)
print(json.dumps({'domains':len(out),'mainFrames':len(main),'intervals':runs}))
