from pathlib import Path
import json,hashlib,sys,math
R=Path.cwd();M=R/'migrations/shared-alg001-l08-p029';Q=R/'output/g678-alg-l08-p029-source-audit-20261007-v1';sha=lambda b:hashlib.sha256(b).hexdigest();audit=json.loads((Q/'audio-audit-v2.json').read_text());swf=M/'source-v1/L8IN14.swf';assert sha(swf.read_bytes())=='2f557ac43c0ec8f1f7dc2e3665cdbbd20ac5091adff5b8c44311cd2a079c12a9'
def put(p,b):
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b
 else:p.open('xb').write(b)
models=[]
for s in audit['streams']:
 assert s['binaryXmlEquivalent'];src=Path(s['sourcePayload']['path']);b=src.read_bytes();assert sha(b)==s['sourcePayload']['sha256'];sid=s['spriteId']
 if s['codec']=='SWF-ADPCM':
  put(M/f'source-v1/stream-{sid}.adpcm.bin',b);continue
 put(M/f'source-v1/stream-{sid}.mp3',b);blocks=s['blocks'];positive=[b for b in blocks if b['samples']>0];first=positive[0]['frame'];runs=[]
 for b in positive:
  residual=b['sourceTargetSample']-(b['frame']-first)*1837
  if not runs or residual!=runs[-1]['sourceResidual']:
   if runs:runs[-1]['endDecodedSample']=b['samplesBefore']
   runs.append(dict(firstFrame=b['frame'],firstDecodedSample=b['sourceTargetSample'],sourceResidual=residual))
 runs[-1]['endDecodedSample']=s['positiveSamplesTotal'];models.append(dict(spriteId=sid,frameCount=s['frameCount'],sourceSwfSha256=sha(swf.read_bytes()),frameDomain=f'sprite-{sid}',sourceBytes=src.stat().st_size,sourceSha256=s['sourcePayload']['sha256'],sampleRate=22050,channels=1,decodedSamplesCandidate=s['positiveSamplesTotal'],latency=s['latencySamples'],blocks=blocks,segments=[{k:r[k]for k in['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],binaryXmlEquivalent=True,sourceSampleSize=1837,physicalSamplesPerFrame=1837.5,maxWithinRunPhysicalResidualSamples=max((b['frame']-next(r['firstFrame']for r in reversed(runs)if r['firstFrame']<=b['frame']))*.5 for b in positive),emptyNegativeBlocks=s['negativeSeekBlocks'],sourceTrailingAfterEnd=next(v for v in audit['afterEnd']if v['domain']==f'sprite-{sid}'),clockScope='Source-coordinate grouping with native physical sample-rate candidate; original-runtime alignment unverified. Preserve empty negative blocks and after-End tail as explicit anomalies; do not attach trailing bytes to MP3 payload.'))
put(M/'native-v1/streams-v1.json',(json.dumps(models,indent=2)+'\n').encode());adpcm=json.loads((Q/'adpcm-source-136-v1.json').read_text());put(M/'native-v1/adpcm-source-v1.json',(json.dumps(adpcm,indent=2)+'\n').encode());print(json.dumps([dict(sprite=x['spriteId'],samples=x['decodedSamplesCandidate'],segments=x['segments'])for x in models]))
