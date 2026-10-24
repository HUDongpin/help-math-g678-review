from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p046/audit';source=json.loads((A/'source-text-catalog-v1.json').read_text());assert source['sourceSha256']=='c82da2eb14e6db6fbb876e795edd8a8ebc1e890a52d9e7b1b1f5e66153b8cb62';main=next(t for t in source['timelines']if t['timelineId']=='sprite-205');texts={t['characterId']:t for t in source['textDefinitions']};rows=[];live={}
for frame in range(1,707):
 for e in main['events']:
  if e['frame']!=frame:continue
  if e['kind']=='remove':live.pop(e['depth'],None)
  if e['kind']=='place':
   old=live.get(e['depth'],{})if e.get('move')else{};state={**old,**e};state['matrix']=e.get('matrix')or old.get('matrix')or[1,0,0,1,0,0];live[e['depth']]=state
 visible=[]
 for depth,e in sorted(live.items()):
  if e.get('characterId')not in texts:continue
  color=e.get('colorTransform');alpha=(color['multiply'][3]/color['divisor']+color['add'][3]/255)if color else 1
  t=texts[e['characterId']];matrix=e['matrix'];bounds=t['boundsTwips'];x=8288+matrix[4];y=5666+matrix[5]
  # Main text transforms have no rotation/skew. Check stage intersection without accepting clipping or runtime visibility.
  assert matrix[1]==matrix[2]==0
  box={'left':(x+bounds['left']*matrix[0])/20,'right':(x+bounds['right']*matrix[0])/20,'top':(y+bounds['top']*matrix[3])/20,'bottom':(y+bounds['bottom']*matrix[3])/20}
  if alpha>0 and box['right']>0 and box['left']<800 and box['bottom']>0 and box['top']<600:
   visible.append({'characterId':t['characterId'],'depth':depth,'text':''.join(g.get('unicode')or'' for r in t.get('runs',[])for g in r.get('glyphs',[])) if t.get('runs')else(t.get('initialText')or{}).get('text',''),'valueEvidence':'static-glyphs' if t.get('runs')else'initial-tag-value-not-runtime','alpha':alpha,'bounds':box})
 rows.append({'frame':frame,'visibleDirectText':visible,'namedInstances':[{'name':e['name']['text'],'characterId':e.get('characterId'),'depth':depth}for depth,e in sorted(live.items())if e.get('name')]})
ranges=[]
for row in rows:
 key=[(x['characterId'],x['text'],round(x['alpha'],4))for x in row['visibleDirectText']]
 if ranges and ranges[-1]['key']==key:ranges[-1]['lastFrame']=row['frame']
 else:ranges.append({'firstFrame':row['frame'],'lastFrame':row['frame'],'key':key})
result={'sourceSha256':source['sourceSha256'],'domain':'sprite-205','rows':rows,'textChangeRanges':ranges,'qualification':'Direct main display-list text with inherited move-state alpha and stage intersection. Nested timelines, action-driven visibility, clipping and original execution remain separate. No natural runtime trace is claimed.'}
with(A/'intro-direct-text-audit-v1.json').open('x')as f:f.write(json.dumps(result,indent=2)+'\n')
print(json.dumps(ranges))
