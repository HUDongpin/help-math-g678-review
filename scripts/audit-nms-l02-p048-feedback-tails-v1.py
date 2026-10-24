from pathlib import Path
import json,hashlib,array,math
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p048/audit';clock=json.loads((A/'source-audio-clock-audit-v1.json').read_text());streams=json.loads((A/'source-audio-streams-v1.json').read_text());pcm=json.loads((A/'source-pcm-inventory-v1.json').read_text());rows=[]
for timeline in clock['streams']:
 stream=next(x for x in streams['streams']if x['domain']==timeline['domain']);record=next(x for x in pcm['streams']if x['domain']==timeline['domain']);raw=(R/record['pcm']['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==record['pcm']['sha256'];samples=array.array('f');samples.frombytes(raw)
 def sourceAt(frame):
  tick=round((frame-1)*22050/12)
  for seg in timeline['segments']:
   if tick<seg['outputStart']:return seg['sourceStart']
   if tick<seg['outputEnd']:return seg['sourceStart']+tick-seg['outputStart']
  return timeline['segments'][-1]['sourceEnd']+tick-timeline['segments'][-1]['outputEnd']
 cumulative=0;coordinates=[]
 for block in stream['blocks']:
  if block['sampleCount']:
   actual=cumulative+block['seekSamples'];nominal=sourceAt(block['frame']);coordinates.append({'frame':block['frame'],'tagSourceSample':actual,'timelineSourceSample':nominal,'deltaSamples':actual-nominal})
  cumulative+=block['sampleCount']
 assert cumulative==len(samples)
 tails=[]
 spans=[('correct',20,None)]if stream['domain']=='sprite-442'else[('S1',16,18),('S2',27,31),('S3',36,40),('S4',54,None)]if stream['domain']=='sprite-444'else[('terminal',363 if stream['domain']=='sprite-498' else 5,None)]
 for label,start,end in spans:
  lo=sourceAt(start);hi=sourceAt(end)if end else len(samples);data=samples[lo:hi];assert hi>=lo
  tails.append({'label':label,'afterReturnFrame':start,'beforeNextLabelFrame':end,'sourceStart':lo,'sourceEnd':hi,'samples':len(data),'peak':max(map(abs,data),default=0),'rms':math.sqrt(sum(x*x for x in data)/len(data))if data else 0})
 rows.append({'domain':stream['domain'],'coordinates':coordinates,'maxAbsoluteDeltaSamples':max(abs(x['deltaSamples'])for x in coordinates),'tails':tails})
report={'sourceSha256':clock['sourceSha256'],'rows':rows,'policyBoundary':'Tag seek counters and12fps nearest-sample coordinates remain distinct. Native continuous PCM preparation preserves complete samples and uses the declared timeline clock; differences are disclosed, not resampled away or called original-runtime parity.','audioAccepted':False,'originalRuntimeAccepted':False};p=A/'source-feedback-tail-audit-v1.json';text=json.dumps(report,indent=2)+'\n'
if p.exists():assert p.read_text()==text
else:p.write_text(text)
print(json.dumps([{'domain':r['domain'],'delta':r['maxAbsoluteDeltaSamples'],'tails':r['tails']}for r in rows]))
