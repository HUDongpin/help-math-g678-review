from pathlib import Path
import base64,struct,hashlib,json,xml.etree.ElementTree as E,sys
B=Path(__file__).resolve().parents[1]
tags=E.parse(B/'source-v1/movie.xml').getroot().find('Header/tags/DefineSprite[@objectID="223"]/tags')
head=tags.find('SoundStreamHead');assert (head.get('compression'),head.get('soundRate'),head.get('soundStereo'),head.get('sampleSize'))==('2','3','0','3675')
latency=struct.unpack('<h',base64.b64decode(head.find('latencySeek/data').text))[0];assert latency==1695
frame=1;before=0;blocks=[];payload=[]
for tag in tags:
 if tag.tag=='SoundStreamBlock':
  raw=base64.b64decode(tag.find('data').text);samples,seek=struct.unpack('<Hh',raw[:4]);body=raw[4:]
  blocks.append({'frame':frame,'samples':samples,'seek':seek,'mp3Bytes':len(body),'samplesBefore':before,'sourceTargetSample':before+seek});before+=samples;payload.append(body)
 if tag.tag=='ShowFrame':frame+=1
mp3=b''.join(payload);assert mp3==(B/'source-v1/source-stream-223.mp3').read_bytes()
exported=list((B/'source-v1/ffdec').rglob('*.mp3'));assert len(exported)==1 and exported[0].read_bytes()==mp3
assert len(blocks)==1840 and (blocks[0]['frame'],blocks[-1]['frame'],before)==(6,1845,6755328)
assert all(b['seek']>=0 for b in blocks)
positive=[b for b in blocks if b['samples']>0];runs=[]
for block in positive:
 residual=block['sourceTargetSample']-(block['frame']-6)*3675
 if not runs or residual!=runs[-1]['sourceCoordinateResidual']:
  if runs:runs[-1]['endDecodedSample']=block['samplesBefore']
  runs.append({'firstFrame':block['frame'],'firstDecodedSample':block['sourceTargetSample'],'sourceCoordinateResidual':residual})
assert len(runs)==3
runs[-1]['endDecodedSample']=before
model={'schemaVersion':1,'animationId':'shared-alg001-l07-p006','sourceSwfSha256':'72c7f3e0d0fd0a5251214c3511262bf164d983837a5c52e9f1e56d4de96df155','frameDomain':'sprite-223','fps':12,'sampleRate':44100,'channels':1,'initialSeekSamples':latency,'sampleCount':before,'sourceBytes':len(mp3),'sourceSha256':hashlib.sha256(mp3).hexdigest(),'blockCount':len(blocks),'audioFirstFrame':6,'sourceHasNegativeSeek':False,'blocks':blocks,'segments':[{k:r[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],'sourceRuns':runs,'emptyBlocks':[b for b in blocks if b['samples']==0],'emptyNegativeBlocks':[],'playbackMode':'loop','alignment':'signed-source-sample-coordinate-candidate-original-runtime-unverified','replay':'retire native nodes and reset source visual1/cycle0; explicit play only'}
out=(json.dumps(model,indent=2)+'\n').encode();p=B/'native-v1/stream-model-v1.json'
if '--check' in sys.argv:assert p.read_bytes()==out
else:p.open('xb').write(out)
print(json.dumps({k:model[k] for k in ['sampleRate','channels','sourceBytes','sourceSha256','segments','emptyBlocks','sourceHasNegativeSeek']}))
