from pathlib import Path
import hashlib,json
B=Path(__file__).resolve().parents[1];W=B.parents[1]
raw=B/'audit-v1/browser-natural-result-v4.txt'
d=json.loads(raw.read_text().split('### Result\n')[1].split('\n')[0]);r={x['label']:x for x in d['receipts']}
initial,start,end,held,replay,leave=[r[k] for k in ['fresh-return-no-autoplay','explicit-user-start','natural-terminal','Play-at-terminal-holds','Replay-resets-terminal','leave-closes-all']]
assert initial['state']['frame']==1 and initial['diagnostics']['activeNodes']==0 and initial['tableVisible']=='false'
assert start['state']['phase']=='playing' and start['diagnostics']['activeNodes']==3
for v in [end,held]:
 assert v['state']['phase']=='timeline-ended' and v['state']['frame']==1195 and v['state']['terminalHeld']
 assert v['canvasFrame']=='1195' and v['diagnostics']['activeNodes']==0 and v['tableVisible']=='true'
assert held['diagnostics']==end['diagnostics']
assert replay['state']['frame']==1 and replay['state']['replay']==1 and replay['tableVisible']=='false'
assert replay['diagnostics']['closed']==end['diagnostics']['closed']+1
assert leave['diagnostics']['contexts']==leave['diagnostics']['closed'] and leave['diagnostics']['activeNodes']==0
assert all(v['state']['failure'] is None and not v['state']['lessonCompleted'] and v['alert'] is None for v in d['receipts'])
def pin(p):
 b=p.read_bytes();return {'path':str(p.relative_to(W)),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
paths=['output/alg-l07-p002-standalone-v4/app.js','output/alg-l07-p002-standalone-v4/app.css','output/alg-l07-p002-standalone-v4/index.html',
 'migrations/shared-alg001-l07-p002/canvas-v1/native-canvas-renderer-v2.js','migrations/shared-alg001-l07-p002/source-v1/source-stream-452.mp3',
 'packages/demos/src/alg-l07-p002-player-v1.tsx','packages/demos/src/alg-l07-p002-session-v1.ts','packages/demos/src/alg-l07-p002-state-v1.ts',
 'packages/demos/src/alg-l07-p002-presentation-v1.tsx','packages/demos/src/alg-l07-p002-v1.css','packages/demos/src/generated/alg-l07-p002-source-v1.ts']
d.update({'pass':True,'checksPassed':{'natural1195Stop':True,'terminalPlayNoNewAudio':True,'ReplayResetsAndClosesPriorContext':True,'leaveClosesAllContexts':True,'noAutoplayOrLessonCompletion':True},'artifactBinding':[pin(W/p) for p in paths],
 'scope':'Current-JS standalone; original Flash runtime, listening, fidelity, human/Owner acceptance, strict completion, release and publication not established'})
(B/'audit-v1/browser-natural-verified-v4.json').open('x').write(json.dumps(d,indent=2)+'\n')
print(json.dumps({'pass':True,'receipts':len(d['receipts']),'artifactCount':len(paths)}))
