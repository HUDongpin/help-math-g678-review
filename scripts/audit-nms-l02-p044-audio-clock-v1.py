from pathlib import Path
import json,array,hashlib
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p044/audit';streams=json.loads((A/'source-audio-streams-v1.json').read_text());inventory=json.loads((A/'source-pcm-inventory-v1.json').read_text());rows=[]
for s in streams['streams']:
 pcm=next(p for p in inventory['streams']if p['domain']==s['domain']);file=R/pcm['pcm']['path'];raw=file.read_bytes();assert hashlib.sha256(raw).hexdigest()==pcm['pcm']['sha256'];samples=array.array('f');samples.frombytes(raw);anchors=[];cursor=0
 for block in s['blocks']:
  anchors.append({'frame':block['frame'],'cumulativeSamples':cursor,'seekSamples':block.get('seekSamples'),'sourceCoordinate':cursor+block.get('seekSamples',0),'sampleCount':block.get('sampleCount',s['header']['sampleSize'])});cursor+=block.get('sampleCount',s['header']['sampleSize'])
 row={'domain':s['domain'],'sampleRate':pcm['sampleRate'],'decodedSamples':len(samples),'anchors':anchors,'codec':pcm['codec']}
 if s['header']['compression']==2:
  first=s['blocks'][0];assert first['seekSamples']==1673 and s['blocks'][1]['sampleCount']==0
  resume=s['blocks'][2];split=first['sampleCount']+resume['seekSamples'];assert split==3510
  segments=[{'frame':first['frame'],'sourceStart':1673,'sourceEnd':split,'outputStart':round((first['frame']-1)*22050/12)},{'frame':resume['frame'],'sourceStart':split,'sourceEnd':len(samples),'outputStart':round((resume['frame']-1)*22050/12)}]
  for seg in segments:seg['outputEnd']=seg['outputStart']+seg['sourceEnd']-seg['sourceStart']
  stop=361 if s['domain']=='sprite-243' else s['frames'];sourceEnd=split+round((stop-1)*22050/12)-segments[-1]['outputStart'];tail=samples[sourceEnd:]
  row.update(segments=segments,sourceCallbackFrame=stop,callbackSourceCoordinate=sourceEnd,postCallbackPeak=max(map(abs,tail),default=0),postCallbackSamples=len(tail),latencyPeak=max(map(abs,samples[:1673])),fullScheduledSeconds=segments[-1]['outputEnd']/22050)
  if s['domain']=='sprite-242':row['sourceCallbackFrame']=None;row['qualification']='Random branch labels3,18,31,40 reset16,27,36,54. Whole55frame stream is not a single selected playback branch; check-answer source event enters the selector at2.'
 else:row['qualification']='ADPCM459samples perblock;13blocks. Source rate code0 nominal5512.5Hz, FFDec WAV rate5512Hz. No resampling or host entry equivalence claimed.'
 rows.append(row)
result={'sourceSha256':streams['sourceSha256'],'streams':rows,'decisions':['All original encoded bytes and complete decoded PCM remain preserved.','Discard source-declared MP3seek latency1673 only when constructing playback.','Two scheduling spans preserve initial empty block; source sample coordinates for random branch entry require separate mapping.','Main361tail is measured below; no blanket silence or completion claim.'],'audioAccepted':False,'originalRuntimeAccepted':False}
p=A/'source-audio-clock-audit-v1.json';text=json.dumps(result,indent=2)+'\n'
if p.exists():assert p.read_text()==text
else:p.write_text(text)
print(json.dumps([{k:r.get(k)for k in ['domain','sourceCallbackFrame','postCallbackPeak','postCallbackSamples','fullScheduledSeconds']}for r in rows]))
