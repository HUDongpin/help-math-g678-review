from pathlib import Path
import base64,struct,hashlib,json,xml.etree.ElementTree as E,sys,zlib
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
# FFDec does not export this older SoundStreamHead stream. Verify against the shipped binary as well as swfmill.
swf=(B/'source-v1/L7RW06.swf').read_bytes();assert hashlib.sha256(swf).hexdigest()=='72c7f3e0d0fd0a5251214c3511262bf164d983837a5c52e9f1e56d4de96df155'
body=zlib.decompress(swf[8:]);assert len(body)+8==struct.unpack('<I',swf[4:8])[0]
def scan(raw,start):
 pos=start
 while pos<len(raw):
  header=struct.unpack_from('<H',raw,pos)[0];pos+=2;code=header>>6;length=header&63
  if length==63:length=struct.unpack_from('<I',raw,pos)[0];pos+=4
  data=raw[pos:pos+length];assert len(data)==length;pos+=length
  yield code,data
  if code==0:break
bits=body[0]>>3;rootStart=(5+4*bits+7)//8+4
sprite=next(data for code,data in scan(body,rootStart)if code==39 and struct.unpack_from('<H',data)[0]==223)
binaryBlocks=[data for code,data in scan(sprite,4)if code==19]
assert len(binaryBlocks)==len(blocks) and [data[4:]for data in binaryBlocks]==payload
assert [struct.unpack('<Hh',data[:4])for data in binaryBlocks]==[(b['samples'],b['seek'])for b in blocks]
assert b''.join(data[4:]for data in binaryBlocks)==mp3
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
model={'schemaVersion':1,'animationId':'shared-alg001-l07-p006','sourceSwfSha256':'72c7f3e0d0fd0a5251214c3511262bf164d983837a5c52e9f1e56d4de96df155','frameDomain':'sprite-223','fps':12,'sampleRate':44100,'channels':1,'initialSeekSamples':latency,'sampleCount':before,'sourceBytes':len(mp3),'sourceSha256':hashlib.sha256(mp3).hexdigest(),'blockCount':len(blocks),'audioFirstFrame':6,'sourceHasNegativeSeek':False,'blocks':blocks,'segments':[{k:r[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],'sourceRuns':runs,'emptyBlocks':[b for b in blocks if b['samples']==0],'emptyNegativeBlocks':[],'playbackMode':'loop','binaryAndXmlPayloadByteEquivalent':True,'ffdecSoundExportStatus':'no emitted stream; source binary and swfmill independently agree','alignment':'signed-source-sample-coordinate-candidate-original-runtime-unverified','replay':'retire native nodes and reset source visual1/cycle0; explicit play only'}
out=(json.dumps(model,indent=2)+'\n').encode();p=B/'native-v1/stream-model-v1.json'
if '--check' in sys.argv:assert p.read_bytes()==out
else:p.open('xb').write(out)
print(json.dumps({k:model[k] for k in ['sampleRate','channels','sourceBytes','sourceSha256','segments','emptyBlocks','sourceHasNegativeSeek']}))
