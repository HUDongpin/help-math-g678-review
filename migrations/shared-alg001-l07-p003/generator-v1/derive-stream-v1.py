from pathlib import Path
import xml.etree.ElementTree as E,base64,json,hashlib,sys
B=Path(__file__).resolve().parents[1];tags=E.parse(B/'source-v1/movie.xml').getroot().find('Header/tags/DefineSprite[@objectID="401"]/tags');f=1;before=0;blocks=[];payload=[]
for t in tags:
 if t.tag=='ShowFrame':f+=1
 elif t.tag=='SoundStreamBlock':
  raw=base64.b64decode(t.findtext('data'),validate=True);a=int.from_bytes(raw[:2],'little');seek=int.from_bytes(raw[2:4],'little',signed=True);assert seek>=0
  blocks.append(dict(frame=f,sampleCount=a,seekSamples=seek,decodedBefore=before,payloadBytes=len(raw)-4,payloadSha256=hashlib.sha256(raw[4:]).hexdigest()));payload.append(raw[4:]);before+=a
mp3=b''.join(payload);assert mp3==(B/'source-v1/source-stream-401.mp3').read_bytes();assert (len(blocks),blocks[0]['frame'],blocks[-1]['frame'],before)==(2137,5,2141,3923136)
assert all(x['decodedBefore']+x['seekSamples']==1673+(x['frame']-5)*1837-(0 if x['frame']==5 else 1837 if x['frame']<1843 else 3674) for x in blocks if x['sampleCount'])
assert [(x['frame'],x['sampleCount'],x['payloadBytes']) for x in blocks if not x['sampleCount']]==[(6,0,0),(1843,0,0)]
d={'schemaVersion':1,'animationId':'shared-alg001-l07-p003','sourceSwfSha256':'947ca0854281ead821f62270e4199044861404562be249b121eefbe410b2ef86','frameDomain':'sprite-401','audioFirstFrame':5,'terminalStopFrame':2141,'fps':12,'initialSeekSamples':1673,'sampleCount':before,'sourceBytes':len(mp3),'sourceSha256':hashlib.sha256(mp3).hexdigest(),'sourceHasNegativeSeek':False,'blockCount':len(blocks),'sampleRate':22050,'channels':1,'blocks':blocks,'segments':[{'firstFrame':5,'firstDecodedSample':1673,'endDecodedSample':3456},{'firstFrame':7,'firstDecodedSample':3510,'endDecodedSample':3375936},{'firstFrame':1844,'firstDecodedSample':3376242,'endDecodedSample':3923136}],'alignment':'source-sample-seek-candidate-original-runtime-unverified','replay':'stop all native nodes, reset visual1 and source sample1673, explicit user Play','spanish':'separate-SA-candidate, no embedded stream replacement'}
p=B/'native-v1/stream-model-v1.json';s=json.dumps(d,indent=2)+'\n'
if '--check'in sys.argv:assert p.read_text()==s
else:p.open('x').write(s)
print(json.dumps({'pass':True,'frameRange':[5,2141],'blocks':len(blocks),'sampleCount':before,'sourceBytes':len(mp3),'sourceSha256':d['sourceSha256']}))
