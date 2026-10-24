from pathlib import Path
import json,array,hashlib,math
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p047/audit';source=json.loads((A/'source-audio-streams-v1.json').read_text());inventory=json.loads((A/'source-pcm-inventory-v1.json').read_text());rows=[]
for stream in source['streams']:
 pcm=next(x for x in inventory['streams']if x['domain']==stream['domain']);raw=(R/pcm['pcm']['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==pcm['pcm']['sha256'];samples=array.array('f');samples.frombytes(raw);assert pcm['sampleRate']==22050 and pcm['channels']==1
 blocks=stream['blocks'];first,empty,resume=blocks[:3];assert first['seekSamples']==1673 and empty['sampleCount']==0 and first['sampleCount']+resume['seekSamples']==3510
 segments=[{'frame':first['frame'],'sourceStart':1673,'sourceEnd':3510,'outputStart':round((first['frame']-1)*22050/12)},{'frame':resume['frame'],'sourceStart':3510,'sourceEnd':len(samples),'outputStart':round((resume['frame']-1)*22050/12)}]
 for seg in segments:seg['outputEnd']=seg['outputStart']+seg['sourceEnd']-seg['sourceStart']
 def source_at(frame):
  tick=round((frame-1)*22050/12)
  for seg in segments:
   if tick<seg['outputStart']:return seg['sourceStart']
   if tick<seg['outputEnd']:return seg['sourceStart']+tick-seg['outputStart']
  return segments[-1]['sourceEnd']+tick-segments[-1]['outputEnd']
 def stats(start,end):
  data=samples[max(0,start):min(len(samples),end)];return {'startSample':start,'endSample':min(len(samples),end),'samples':len(data),'peak':max(map(abs,data),default=0),'rms':math.sqrt(sum(x*x for x in data)/len(data))if data else 0}
 callbacks={'sprite-78':[20],'sprite-80':[16,27,36,54],'sprite-81':[140,188]}[stream['domain']]
 row={'domain':stream['domain'],'decodedSamples':len(samples),'segments':segments,'scheduledSeconds':segments[-1]['outputEnd']/22050,'callbacks':[{'frame':f,'sourceCoordinate':source_at(f),'followingPcm':stats(source_at(f),len(samples))}for f in callbacks]}
 if stream['domain']=='sprite-80':
  row['branches']=[{'label':label,'firstFrame':first,'returnFrame':end,'nominalPcm':stats(source_at(first),source_at(end))}for label,first,end in [('S1',3,16),('S2',18,27),('S3',31,36),('S4',40,54)]]
  row['qualification']='Label-local return boundaries are source facts. These nominal spans do not yet decide treatment of branch tails or gaps.'
 if stream['domain']=='sprite-81':row['endFrameEnvelope']=[{'frame':f,**stats(source_at(f),source_at(f+1))}for f in range(130,189)]
 rows.append(row)
result={'sourceSha256':source['sourceSha256'],'streams':rows,'scope':'Source sample coordinates and measured envelopes only; no decoded-byte splitting and no playback-plan or original-runtime acceptance. Callback-following PCM can include later authored content and must not automatically extend an earlier scene.','audioAccepted':False,'originalRuntimeAccepted':False}
p=A/'source-audio-clock-audit-v1.json'
with p.open('x')as f:f.write(json.dumps(result,indent=2)+'\n')
print(json.dumps([{'domain':x['domain'],'seconds':x['scheduledSeconds'],'callbacks':x['callbacks']}for x in rows]))
