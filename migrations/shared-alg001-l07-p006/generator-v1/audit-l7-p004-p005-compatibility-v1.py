from pathlib import Path
import json,hashlib,base64,struct,zlib,xml.etree.ElementTree as E,collections,datetime
ROOT=Path(__file__).resolve().parents[3];B=ROOT/'migrations/shared-alg001-l07-p006/audit-v1/l7-p004-p005-compatibility-v1';identities=json.loads((B/'source-identity-v1.json').read_text());rows=[]
def sha(b):return hashlib.sha256(b).hexdigest()
def scan(raw,start):
 pos=start
 while pos<len(raw):
  h=struct.unpack_from('<H',raw,pos)[0];pos+=2;code=h>>6;size=h&63
  if size==63:size=struct.unpack_from('<I',raw,pos)[0];pos+=4
  data=raw[pos:pos+size];assert len(data)==size;pos+=size;yield code,data
  if code==0:break
for identity,cid in zip(identities,[145,129]):
 n=int(identity['animationId'][-3:]);D=B/f'p{n:03}';swf=(D/f'L7RW{n:02}.swf').read_bytes();assert sha(swf)==identity['sha256']==sha(Path(identity['path']).read_bytes());xml=E.parse(D/'movie.xml');head=xml.find('Header');tags=head.find(f'tags/DefineSprite[@objectID="{cid}"]/tags');assert head.get('framerate')=='12';stream=tags.find('SoundStreamHead');rate=[5512.5,11025,22050,44100][int(stream.get('soundRate'))];assert rate==22050 and stream.get('compression')=='2' and stream.get('soundStereo')=='0';latency=struct.unpack('<h',base64.b64decode(stream.find('latencySeek/data').text))[0]
 frame=1;before=0;blocks=[];payload=[];scripts=[]
 for tag in tags:
  if tag.tag=='SoundStreamBlock':
   data=base64.b64decode(tag.find('data').text);samples,seek=struct.unpack('<Hh',data[:4]);blocks.append({'frame':frame,'samples':samples,'seek':seek,'mp3Bytes':len(data)-4,'samplesBefore':before,'targetSample':before+seek});before+=samples;payload.append(data[4:])
  if tag.tag=='DoAction':scripts.append({'frame':frame,'text':E.tostring(tag).decode()})
  if tag.tag=='ShowFrame':frame+=1
 body=zlib.decompress(swf[8:]);assert len(body)+8==struct.unpack('<I',swf[4:8])[0];bits=body[0]>>3;start=(5+4*bits+7)//8+4;sprite=next(data for code,data in scan(body,start)if code==39 and struct.unpack_from('<H',data)[0]==cid);binary=[data for code,data in scan(sprite,4)if code==19];assert [(struct.unpack('<Hh',d[:4]),d[4:])for d in binary]==[((b['samples'],b['seek']),p)for b,p in zip(blocks,payload)]
 positive=[b for b in blocks if b['samples']>0];first=positive[0]['frame'];runs=[]
 for block in positive:
  residual2=2*block['targetSample']-(block['frame']-first)*3675
  if not runs or max(runs[-1]['residual2Max'],residual2)-min(runs[-1]['residual2Min'],residual2)>1:
   if runs:runs[-1]['endDecodedSample']=block['samplesBefore']
   runs.append({'firstFrame':block['frame'],'firstDecodedSample':block['targetSample'],'residual2Min':residual2,'residual2Max':residual2})
  else:runs[-1]['residual2Min']=min(runs[-1]['residual2Min'],residual2);runs[-1]['residual2Max']=max(runs[-1]['residual2Max'],residual2)
 runs[-1]['endDecodedSample']=before
 scriptFiles=list((D/'ffdec/scripts').rglob('*.as'));texts=[{'path':str(p.relative_to(ROOT)),'sha256':sha(p.read_bytes()),'text':p.read_text()}for p in scriptFiles];assert not scripts and len(texts)==2 and all('stop();'in x['text']for x in texts)
 mp3=b''.join(payload);module=ROOT/f'packages/demos/src/modules/{identity["animationId"]}.tsx';timeline=ROOT/f'packages/demos/src/timelines/{identity["animationId"]}.ts';registry=json.loads((ROOT/'packages/demos/private-current-js-registry.json').read_text());membership=[c['calibrationId']for c in registry['calibrations']if any(e['key']==identity['animationId']for e in c['entries'])]
 row={'identity':identity,'currentRegistryMembership':membership,'sourceRoot':{'frames':10,'fps':12,'entryFrame':6,'scripts':texts},'main':{'id':cid,'frameDomain':f'sprite-{cid}','frames':frame-1,'actions':scripts,'playback':'ordinary sprite loop; no child stop; original shell termination unverified'},'buttons':len(head.findall('tags/DefineButton'))+len(head.findall('tags/DefineButton2')),'stream':{'sampleRate':rate,'channels':1,'latencySeek':latency,'blockCount':len(blocks),'firstBlockFrame':blocks[0]['frame'],'lastBlockFrame':blocks[-1]['frame'],'declaredSamples':before,'assembledMp3Bytes':len(mp3),'assembledMp3Sha256':sha(mp3),'binaryXmlPayloadEquivalent':True,'sourceCoordinateRunCandidates':runs,'emptyBlocks':[b for b in blocks if b['samples']==0],'absentBlockFrames':[f for f in range(1,frame)if f not in {b['frame']for b in blocks}],'nativePcmBinding':'not measured in read-only compatibility audit; no playback acceptance'},'existingProduct':{'moduleSha256':sha(module.read_bytes()),'timelineSha256':sha(timeline.read_bytes()),'playbackMode':'once','blocker':'embedded-audio-lifecycle-not-implemented'},'compatibleClockCandidate':'source-stream-cycle-clock-v1 for22050 mono only after ownnativePCM/source-run measurement; not stopped-family P002/P003','batchSelectionMade':False,'productOrRegistryModified':False,'newCurrentJsPlacements':0}
 rows.append(row)
report={'schemaVersion':1,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'Read-only source compatibility for alreadyregistered P004/P005; no repair/selection/registration','pages':rows,'differencesFromStoppedPair':'Both sources loop and have no glossary/buttons; historical once flag contradicts main source wrap. They do not prove stopped-family scale-out.','differencesFromP006':'P00644100Hzloop withtwo glossary actions; these22050Hzloops withno glossary; rate/gates must stay page-owned.'};(B/'compatibility-v1.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps([{k:r[k]for k in ['identity','currentRegistryMembership','main','buttons','stream']}for r in rows]))
