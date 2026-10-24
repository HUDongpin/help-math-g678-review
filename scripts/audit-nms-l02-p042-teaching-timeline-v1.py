from pathlib import Path
import json,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p042/audit'
c=json.loads((A/'source-text-catalog-v1.json').read_text());d=json.loads((A/'display-ir-v1.json').read_text())
texts={t['characterId']:''.join(r.get('text','')for r in t.get('runs',[]))for t in c['textDefinitions']};runs=[]
for frame,display in enumerate(d['domains']['sprite-261']['frames'],1):
 row=[{'characterId':p['characterId'],'depth':p['depth'],'text':texts[p['characterId']],'matrix':p['matrix'],'colorTransform':p.get('colorTransform'),'maskDepths':p['maskDepths']}for p in display if p['characterId']in texts]
 if runs and runs[-1]['placements']==row:runs[-1]['endFrame']=frame
 else:runs.append({'startFrame':frame,'endFrame':frame,'placements':row})
result={'sourceSha256':c['sourceSha256'],'sourceDisplaySha256':hashlib.sha256((A/'display-ir-v1.json').read_bytes()).hexdigest(),'frameCount':626,'stopFrame':625,'runs':runs,'claim':'Structural text placements and transforms only. Shape-encoded text, masks and actual runtime visibility require separate review; not yet a teaching renderer.'}
p=A/'teaching-text-timeline-v1.json';encoded=json.dumps(result,indent=2)+'\n'
if p.exists():assert p.read_text()==encoded
else:p.write_text(encoded)
print(json.dumps({'frames':626,'textRuns':len(runs),'stopFrame':625}))
