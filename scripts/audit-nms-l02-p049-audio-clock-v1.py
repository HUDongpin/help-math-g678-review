"""Audit full-decoded source PCM, preserving the main stream discontinuity."""
from pathlib import Path
import json,hashlib,array,math
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p049/audit'
source=json.loads((A/'source-audio-streams-v1.json').read_text());inventory=json.loads((A/'source-pcm-inventory-v1.json').read_text());rows=[]
assert source['sourceSha256']=='896e38a05c5e6392f7e9284aa278a5b7e10c13b15f7911fa09d1dc9b1de865b2'
for stream in source['streams']:
 rec=next(x for x in inventory['streams']if x['domain']==stream['domain']);raw=(R/rec['pcm']['path']).read_bytes();assert hashlib.sha256(raw).hexdigest()==rec['pcm']['sha256'];samples=array.array('f');samples.frombytes(raw)
 blocks=stream['blocks'];first,empty,resume=blocks[:3];assert first['seekSamples']==1673 and empty['sampleCount']==0 and first['sampleCount']+resume['seekSamples']==3510
 if stream['domain']=='sprite-156':
  frames={x['frame']for x in blocks};assert [f for f in range(346,388)if f in frames]==[]
  offset=sum(x['sampleCount']for x in blocks if x['frame']<388)+next(x['seekSamples']for x in blocks if x['frame']==388);assert offset==624495
  segments=[{'frame':5,'sourceStart':1673,'sourceEnd':3510},{'frame':7,'sourceStart':3510,'sourceEnd':offset},{'frame':388,'sourceStart':offset,'sourceEnd':len(samples)}]
 else:segments=[{'frame':first['frame'],'sourceStart':1673,'sourceEnd':3510},{'frame':resume['frame'],'sourceStart':3510,'sourceEnd':len(samples)}]
 for seg in segments:seg['outputStart']=round((seg['frame']-1)*22050/12);seg['outputEnd']=seg['outputStart']+seg['sourceEnd']-seg['sourceStart']
 assert sum(x['sourceEnd']-x['sourceStart']for x in segments)==len(samples)-1673
 def coordinate(frame):
  tick=round((frame-1)*22050/12)
  for seg in segments:
   if tick<seg['outputStart']:return {'source':seg['sourceStart'],'inGap':True}
   if tick<seg['outputEnd']:return {'source':seg['sourceStart']+tick-seg['outputStart'],'inGap':False}
  return {'source':len(samples),'inGap':True}
 def stats(lo,hi):
  data=samples[max(0,lo):min(hi,len(samples))];return {'start':lo,'end':hi,'samples':len(data),'peak':max(map(abs,data),default=0),'rms':math.sqrt(sum(x*x for x in data)/len(data))if data else 0}
 cumulative=0;deltas=[]
 for b in blocks:
  if b['sampleCount']:
   predicted=coordinate(b['frame']);deltas.append({'frame':b['frame'],'tagCoordinate':cumulative+b['seekSamples'],'proposedCoordinate':predicted['source'],'deltaSamples':cumulative+b['seekSamples']-predicted['source'],'inGap':predicted['inGap']})
  cumulative+=b['sampleCount']
 assert cumulative==len(samples)
 tails=[]
 if stream['domain']in ['sprite-72','sprite-143','sprite-153']:spans=[('correct',20,None)]
 elif stream['domain']=='sprite-74':spans=[('S1',16,18),('S2',27,31),('S3',36,40),('S4',54,None)]
 elif stream['domain']=='sprite-156':spans=[('terminal',435,None)]
 else:spans=[('click',5,None)]
 for name,frame,end in spans:tails.append({'name':name,'returnFrame':frame,**stats(coordinate(frame)['source'],coordinate(end)['source']if end else len(samples))})
 row={'domain':stream['domain'],'decodedSamples':len(samples),'segments':segments,'sourceCoordinateDeltas':deltas,'maxAbsoluteDeltaSamples':max(abs(x['deltaSamples'])for x in deltas),'tails':tails}
 if stream['domain']=='sprite-156':row.update(boundaries=[{'frame':f,**coordinate(f)}for f in [327,328,345,346,350,370,385,386,388,390,411,435]],seamEvidence=stats(624384,624495))
 rows.append(row)
result={'sourceSha256':source['sourceSha256'],'streams':rows,'policy':'Proposed nearest-sample12fps schedule with full decoded content after source latency. Main resume uses exact frame388 tag coordinate; zero-sample block345 is not a new audio start. Every decoded post-latency sample occurs once. Gap is timing, not deleted PCM. Tag-clock deviations are disclosed, not original-runtime parity.','audioAccepted':False,'originalRuntimeAccepted':False}
p=A/'source-audio-clock-audit-v1.json';assert not p.exists();p.write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps([{'domain':x['domain'],'delta':x['maxAbsoluteDeltaSamples'],'tails':x['tails'],'boundaries':x.get('boundaries')}for x in rows]))
