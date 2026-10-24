import argparse,pathlib,json,hashlib
p=argparse.ArgumentParser();p.add_argument('--ir',type=pathlib.Path,required=True);p.add_argument('--output',type=pathlib.Path,required=True);a=p.parse_args();raw=a.ir.read_bytes();sha=hashlib.sha256(raw).hexdigest();assert sha=='afee7a2fa13b67694d609f7ed3828bebb5d7aceafe754f0c9160d39fb3aac5d7';d=json.loads(raw);buttons={str(b['characterId']):b for b in d['buttons']};seen=set();queue=['root']
while queue:
 i=queue.pop()
 if i in seen:continue
 seen.add(i)
 if i in d['domains']:queue.extend(str(x['characterId'])for f in d['domains'][i]['frames']for x in f)
 if i in buttons:queue.extend(str(x['characterId'])for x in buttons[i]['statePlacements'])
visual={'root':10,'237':579,'227':15,'228':35,'234':13,'223':5};static={'204','206','207','209'};assert {i for i in d['domains']if i in seen}==set(visual)|static|{'230','236'}
rows=[]
for key,domain in d['domains'].items():
 if key in visual:assert domain['frameCount']==visual[key];disposition='native-visual-local-query'
 elif key in static:assert domain['frameCount']==1;disposition='single-frame-helper-replaced-by-native-grid-or-range'
 elif key=='230':assert domain['frameCount']==55;disposition='offstage-coach-label-and-independent-audio-clock'
 elif key=='236':assert domain['frameCount']==20;disposition='placed-stopped-dormant-no-native-start'
 else:assert key not in seen;disposition='not-reachable-in-structural-root-and-button-closure'
 rows.append({'domain':'root'if key=='root'else'sprite-'+key,'sourceFrames':domain['frameCount'],'structurallyReachable':key in seen,'disposition':disposition})
out={'schemaVersion':1,'animationId':'shared-nms002-l02-p039','sourceIr':{'path':str(a.ir),'sha256':sha},'rows':rows,'querySemantics':['Root queries hold main at entry1 rather than implying natural elapsed child time.','Main frame546 scenario fixtures select source-supported actions. Frames547..579 use an explicit canonical correct or corrected-reveal continuation.','Nested queries select legal canonical invocations and return post-action state at234/13 and228/35.','223shows maintained native pressed Close styling, not source-button pixel parity.','230is an offstage55frame audio domain; four source-byte coach partitions and qualified tails are transported outside visual queries.','236remains preserved and unstarted.'],'qualification':'Structural display-list/button closure only; existing ActionScript/host audit remains required. No original-runtime or fidelity acceptance.','originalRuntimeAccepted':False,'fidelityAccepted':False,'registered':False}
a.output.write_text(json.dumps(out,indent=2)+'\n');print(json.dumps({'status':'PASS','sourceDomains':len(rows),'rootReachableDomains':sum(r['structurallyReachable']for r in rows),'visualQueryDomains':len(visual)}))
