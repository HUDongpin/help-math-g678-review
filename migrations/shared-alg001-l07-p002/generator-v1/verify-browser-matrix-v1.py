from pathlib import Path
import json,sys
B=Path(__file__).resolve().parents[1];version=sys.argv[1] if len(sys.argv)>1 else 'v3';d=json.loads((B/f'audit-v1/browser-matrix-result-{version}.txt').read_text().split('### Result\n')[1].split('\n')[0]);r={x['label']:x for x in d['receipts']}
assert r['initial-no-autoplay']['diagnostics']['contexts']==0
assert r['desktop-695']['tableVisible']=='false' and r['desktop-696']['tableVisible']=='true'
for prefix in ['desktop','es390-20px']:
 assert r[prefix+'-900']['emphasis']==[{'cell':'0-rate','text':'$.20/minute'}]
 assert r[prefix+'-1077']['emphasis']==[{'cell':'2-rate','text':'$.03/minute'}]
assert r['Replay-reset']['state']['replay']==1 and r['Replay-reset']['state']['frame']<10 and r['Replay-reset']['tableVisible']=='false'
assert r['keyboard-pause']['state']['phase']=='paused' and r['keyboard-pause']['diagnostics']['activeNodes']==0
assert r['leave-cleanup']['diagnostics']['closed']==r['leave-cleanup']['diagnostics']['contexts']
assert r['return-es-no-autoplay']['state']['frame']==1 and r['return-es-no-autoplay']['diagnostics']['activeNodes']==0
assert r['final-cleanup']['diagnostics']['contexts']==r['final-cleanup']['diagnostics']['closed'] and r['final-cleanup']['diagnostics']['activeNodes']==0
assert all(not x['overflow'] and not x['state']['lessonCompleted'] and x['state']['failure'] is None for x in d['receipts'])
for v in d['receipts']:
 if v.get('rates'):
  assert [c['text'] for c in v['rates']]==['$.20/minute','$.05/minute','$.03/minute'],v['label']
  assert all(c['fullTextInsideCell'] and c['scrollWidth']<=c['clientWidth'] for c in v['rates']),v['label']
d['checksPassed']={'stateLifecycleAndReplay':True,'initialAndEsNoAutoplay':True,'sourceTableRevealAndEmphasis':True,'cellTextRangeInsideBounds':True,'allNativeAudioNodesRetiredAndContextsClosed':True}
p=B/f'audit-v1/browser-matrix-verified-{version}.json';p.open('x').write(json.dumps(d,indent=2)+'\n');print(json.dumps({'pass':True,'version':version,'receipts':len(d['receipts'])}))
