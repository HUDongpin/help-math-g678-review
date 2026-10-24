from pathlib import Path
import base64,struct,hashlib,json,xml.etree.ElementTree as E,sys,zlib
sha=lambda b:hashlib.sha256(b).hexdigest()
def put(p,b):
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b
 else:p.open('xb').write(b)
def tags(raw,start):
 while start<len(raw):
  h=struct.unpack_from('<H',raw,start)[0];start+=2;c,n=h>>6,h&63
  if n==63:n=struct.unpack_from('<I',raw,start)[0];start+=4
  d=raw[start:start+n];assert len(d)==n;start+=n;yield c,d
  if c==0:break
for page,ids in [(51,[185]),(52,[157,170])]:
 B=Path(f'migrations/shared-alg001-l07-p0{page}');model=json.loads((B/'native-v1/source-model-v1.json').read_text());swf=Path(model['source']['copy']).read_bytes();assert sha(swf)==model['source']['sha256'];body=zlib.decompress(swf[8:]);assert len(body)+8==struct.unpack('<I',swf[4:8])[0]
 root_start=(5+4*(body[0]>>3)+7)//8+4;sprites={struct.unpack_from('<H',d)[0]:d for c,d in tags(body,root_start)if c==39};xml=E.parse(B/'source-v1/movie.xml').getroot();models=[]
 assert [int(s.get('objectID'))for s in xml.findall('Header/tags/DefineSprite')if s.find('tags/SoundStreamHead')is not None]==ids
 for sid in ids:
  sp=xml.find(f'Header/tags/DefineSprite[@objectID="{sid}"]');head=sp.find('tags/SoundStreamHead');assert(head.get('compression'),head.get('soundRate'),head.get('soundStereo'),head.get('sampleSize'))==('2','2','0','1837');latency=struct.unpack('<h',base64.b64decode(head.find('latencySeek/data').text))[0];assert latency==1673
  f=1;before=0;blocks=[];payload=[]
  for tag in sp.find('tags'):
   if tag.tag=='SoundStreamBlock':
    raw=base64.b64decode(tag.find('data').text);samples,seek=struct.unpack('<Hh',raw[:4]);part=raw[4:];blocks.append(dict(frame=f,samples=samples,seek=seek,mp3Bytes=len(part),samplesBefore=before,sourceTargetSample=before+seek));before+=samples;payload.append(part)
   if tag.tag=='ShowFrame':f+=1
  binary=[d for c,d in tags(sprites[sid],4)if c==19];assert[(struct.unpack('<Hh',d[:4]),d[4:])for d in binary]==[((b['samples'],b['seek']),p)for b,p in zip(blocks,payload)]
  mp3=b''.join(payload);put(B/f'source-v1/stream-{sid}.mp3',mp3);positive=[b for b in blocks if b['samples']>0];first=positive[0]['frame'];runs=[]
  for b in positive:
   residual=b['sourceTargetSample']-(b['frame']-first)*1837
   if not runs or residual!=runs[-1]['sourceResidual']:
    if runs:runs[-1]['endDecodedSample']=b['samplesBefore']
    runs.append(dict(firstFrame=b['frame'],firstDecodedSample=b['sourceTargetSample'],sourceResidual=residual))
  runs[-1]['endDecodedSample']=before
  models.append(dict(spriteId=sid,frameCount=f-1,sourceSwfSha256=sha(swf),frameDomain=f'sprite-{sid}',sourceBytes=len(mp3),sourceSha256=sha(mp3),sampleRate=22050,channels=1,decodedSamplesCandidate=before,latency=latency,blocks=blocks,segments=[{k:r[k]for k in ['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],binaryXmlEquivalent=True,sourceSampleSize=1837,physicalSamplesPerFrame=1837.5,alignmentStatus='source-coordinate candidate, browser decode and original runtime independent'))
 put(B/'native-v1/streams-v1.json',(json.dumps(models,indent=2)+'\n').encode());print(json.dumps(dict(page=page,streams=[dict(sprite=m['spriteId'],bytes=m['sourceBytes'],segments=m['segments'])for m in models])))
