from pathlib import Path
import json,hashlib,array
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p051/audit'
source=json.loads((A/'source-audio-streams-v1.json').read_text());pcm=json.loads((A/'source-pcm-inventory-v1.json').read_text())
assert source['sourceSha256']==pcm['sourceSha256']=='9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f'
tick=lambda frame:round((frame-1)*22050/12)
rows=[]
for stream in source['streams']:
 p=next(row for row in pcm['streams']if row['domain']==stream['domain']);b=(R/p['pcm']['path']).read_bytes();assert hashlib.sha256(b).hexdigest()==p['pcm']['sha256'];samples=array.array('f');samples.frombytes(b)
 blocks=stream['blocks'];assert blocks[0]['seekSamples']==1673 and blocks[1]['sampleCount']==0 and blocks[2]['frame']==blocks[0]['frame']+2
 cumulative=0;anchors=[]
 for block in blocks:
  if block['sampleCount']:anchors.append({'frame':block['frame'],'sourceStart':cumulative+block['seekSamples']})
  cumulative+=block['sampleCount']
 assert cumulative==len(samples)
 first,second=anchors[:2];assert first['sourceStart']==1673 and second['sourceStart']==3510
 # Source seeks use a constant integer1837sample step; native continuous playback
 # at22050Hz and12fps differs by half a sample per frame. Preserve and report it.
 residuals=[row['sourceStart']-second['sourceStart']-(tick(row['frame'])-tick(second['frame'])) for row in anchors[1:]]
 assert all(b['sourceStart']-a['sourceStart']==1837*(b['frame']-a['frame']) for a,b in zip(anchors[1:],anchors[2:]))
 segments=[]
 for row,end in [(first,second['sourceStart']),(second,len(samples))]:
  start=tick(row['frame']);segments.append({'frame':row['frame'],'sourceStart':row['sourceStart'],'sourceEnd':end,'outputStart':start,'outputEnd':start+end-row['sourceStart']})
 tailStart=second['sourceStart']+tick(blocks[-1]['frame'])-tick(second['frame']);tail=samples[tailStart:]
 rows.append({'domain':stream['domain'],'segments':segments,'preparedSamples':segments[-1]['outputEnd'],'lastFrame':blocks[-1]['frame'],'sourceSeekStepSamples':1837,'maxContinuousClockSeekDifferenceSamples':max(map(abs,residuals)),'sourceLastFrameSeek':anchors[-1]['sourceStart'],'tailAfterLastFrameStart':{'sourceStart':tailStart,'samples':len(tail),'peak':max(map(abs,tail),default=0)},'firstPreparedSegmentPeak':max(map(abs,samples[first['sourceStart']:second['sourceStart']]),default=0)})
result={'sourceSha256':source['sourceSha256'],'rounding':'nearest ties-to-even','sampleRate':22050,'fps':12,'rows':rows,'policy':'Whole decoded PCM after one source latency trim; preserve nonzero callback tails. Source seek quantization retained in audit.','audioAccepted':False}
p=A/'audio-sample-anchors-v1.json';text=json.dumps(result,indent=2)+'\n'
if p.exists():assert p.read_text()==text
else:p.write_text(text)
print(json.dumps([{'domain':r['domain'],'preparedSamples':r['preparedSamples'],'tail':r['tailAfterLastFrameStart'],'headPeak':r['firstPreparedSegmentPeak']}for r in rows]))
