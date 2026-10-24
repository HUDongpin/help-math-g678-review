"""Source display lists and byte-verified streams for the bounded L7 P059/P060 pair.

Large, reproducible evidence stays in the explicitly pinned external source root.
This generator does not alter registered P058 bindings or establish AVM parity.
"""
from pathlib import Path
import base64, hashlib, json, re, struct, sys, zlib
import xml.etree.ElementTree as E

R=Path(__file__).resolve().parents[1]
O=R/'output/g678-alg-l07-p059-p060-integration-20261006-v1'
D=Path('/Volumes/American Dream/.g6p5960a1')
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,value):
 p.parent.mkdir(parents=True,exist_ok=True)
 b=value if isinstance(value,bytes)else(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n').encode()
 if '--write'in sys.argv:p.write_bytes(b)
 elif p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def tags(raw,start):
 while start<len(raw):
  h=struct.unpack_from('<H',raw,start)[0];start+=2;c,n=h>>6,h&63
  if n==63:n=struct.unpack_from('<I',raw,start)[0];start+=4
  d=raw[start:start+n];assert len(d)==n;start+=n;yield c,d
  if c==0:break

for n in [59,60]:
 a=json.loads((O/f'p0{n}-source-structure-audit-v1.json').read_text());cfg=a['configuration']
 B=R/'migrations'/a['animationId'];X=D/a['animationId'];V=X/'source-v1'
 c=json.loads((V/'source-text-catalog-v1.json').read_text())
 swfPath=V/Path(a['source']['source']['path']).name;saPath=V/Path(a['source']['spanishAudio']['path']).name
 swf=swfPath.read_bytes();assert sha(swf)==a['source']['source']['sha256']==c['sourceSha256']
 assert pin(Path(a['source']['source']['path']))==a['source']['source']
 assert pin(Path(a['source']['spanishAudio']['path']))==a['source']['spanishAudio']
 for s in a['scripts']:assert pin(Path(s['file']['path']))==s['file']
 timelines=[]
 for t in c['timelines']:
  live={};frames=[];events={}
  for e in t['events']:events.setdefault(e['frame'],[]).append(e)
  for f in range(1,t['declaredFrameCount']+1):
   for e in events.get(f,[]):
    if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
    elif e['kind']=='place':
     p=live.get(e['depth'],{}).copy()if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
     for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']:
      if k in e:p[k]=e[k]
     assert p.get('characterId');live[e['depth']]=p
   frames.append([p.copy()for p in sorted(live.values(),key=lambda p:p['depth'])])
  timelines.append({**{k:t[k]for k in ['timelineId','declaredFrameCount','observedFrameCount','trailingAfterEnd']},'frames':frames})
 by={t['timelineId']:t for t in timelines};main=by[f'sprite-{cfg["main"]}']
 glossary=[]
 for s in a['scripts']:
  match=re.search(r'_global.KeyAttribute\s*=\s*"([^"]+)";',s['source'])
  if not match:continue
  bid=int(re.search(r'DefineButton2_(\d+)',s['file']['path']).group(1))
  for t in timelines:
   for r in spans([any(p['characterId']==bid for p in row)for row in t['frames']]):
    if r['value']:glossary.append(dict(ownerSpriteId=int(t['timelineId'].split('-')[1]),buttonId=bid,key=match.group(1),firstFrame=r['first'],lastFrame=r['last'],script=s['file']))
 activeOwners={cfg['main'],cfg['help'],*cfg['boxes']}
 activeGlossary=[{k:g[k]for k in ['ownerSpriteId','buttonId','key','firstFrame','lastFrame']}for g in glossary if g['ownerSpriteId']in activeOwners]
 texts=[]
 for t in c['textDefinitions']:
  out='';last=None
  for run in t.get('runs',[]):
   if last is not None and run['yOffsetTwips']!=last and out and not out[-1].isspace()and run['text']and not run['text'][0].isspace():out+=' '
   out+=run['text'];last=run['yOffsetTwips']
  texts.append({**t,'text':out})
 dormant=cfg['dormant'];assert all(p['characterId']!=dormant for p in main['frames'][cfg['quiz']-1])
 dormantScript=(V/f'ffdec/scripts/DefineSprite_{dormant}/frame_1/DoAction.as').read_text()
 assert re.sub(r'\s','',dormantScript)=='stop();_parent.enableButton();'
 alternatives=by[f'sprite-{cfg["collision"]}'];assert len(alternatives['frames'])==70
 offstage=[]
 # Embedded angle-library texts are retained in their separate stopped timeline.
 for t in texts:
  if t['text'].startswith('Right angles have square corners'):
   owners=[q['timelineId']for q in timelines if any(p['characterId']==t['characterId']for row in q['frames']for p in row)]
   assert owners==[f'sprite-{cfg["collision"]}'];offstage.append(dict(characterId=t['characterId'],owners=owners))
 assert len(offstage)==1
 offstageMain=[]
 for t in texts:
  if not t['text'].startswith(('This angle measures','The angle looks like','Information given: picture of angle;')):continue
  positions=[p for row in main['frames']for p in row if p['characterId']==t['characterId']]
  assert positions and all(p['matrix'][4]+8247>16000 for p in positions)
  offstageMain.append(dict(characterId=t['characterId'],minimumStageLeftTwips=min(p['matrix'][4]+8247 for p in positions)))
 assert len(offstageMain)==3
 roles=dict(dormantFeedback=dict(spriteId=dormant,ranges=[s for s in spans([any(p['characterId']==dormant for p in row)for row in main['frames']])if s['value']],decision='Stopped at1, absent at final quiz, no answer caller. Extract and decode as dormant material; never select as active feedback.'),popupCollision=dict(exactName='Mc_Popup',selectedSprite=cfg['help'],alternativeName='Mc_PopUp',alternativeSprite=cfg['collision'],decision='Modern binding uses exact source spelling and current question content; original AVM6 case-insensitive receiver resolution remains unverified.'),angleLibrary=offstage,ending=a['main']['ending'],ordinaryWrapBoundary=a['main']['ordinaryWrapBoundary'],continueControl='Expose the authored empty-clip release as native Continue. Original pointer hit reachability is unverified.',helperClose='Close resumes only child15..20, then resets child1. Main remains held; source-cleared quizSection permits explicit parent play.',math='Preserve authored values and exact graph paths; equations use native superscript, radical and fraction semantics after geometry audit.')
 roles['offstageMainTexts']=offstageMain
 behavior=dict(mainSpriteId=cfg['main'],mainLastFrame=cfg['last'],quizFrame=cfg['quiz'],postQuizFrame=cfg['quiz']+1,steps=[dict(frame=f,**({'box':dict(spriteId=cfg['boxes'][i-2])}if i>=2 else{}))for i,f in enumerate(cfg['steps'])],options=[dict(letter=x['letter'],right=x['right'])for x in a['answerBinding']],feedback=a['branches'],help=dict(spriteId=cfg['help']),glossary=activeGlossary)
 model=dict(schemaVersion=1,animationId=a['animationId'],source=pin(swfPath),spanishAudio=pin(saPath),catalog=pin(V/'source-text-catalog-v1.json'),audit=pin(O/f'p0{n}-source-structure-audit-v1.json'),fps=12,rootEntryFrame=6,rootMatrix=[1,0,0,1,8247,5658],stage=dict(width=800,height=600),mainSpriteId=cfg['main'],mainFrameCount=cfg['last'],behavior=behavior,roleDisposition=roles,glossary=glossary,timelines=timelines,texts=texts,shapes=c['shapeDefinitions'],buttons=c['buttonDefinitions'],bitmaps=c['bitmapDefinitions'],risks=c['risks'],registered=False,originalRuntimeAccepted=False)
 put(X/'native-v1/source-model-v1.json',model);put(X/'generator-v1/source-config-v1.json',cfg)
 put(B/'audit-v1/source-role-disposition-v1.json',roles)
 put(B/'native-v1/source-model-binding-v1.json',dict(externalRoot=str(D),model=pin(X/'native-v1/source-model-v1.json'),config=pin(X/'generator-v1/source-config-v1.json'),generator=pin(Path(__file__))))
 xml=E.parse(V/'movie.xml').getroot();assert swf[:3]==b'CWS';body=zlib.decompress(swf[8:]);assert len(body)+8==struct.unpack('<I',swf[4:8])[0]
 rootStart=(5+4*(body[0]>>3)+7)//8+4;sprites={struct.unpack_from('<H',d)[0]:d for code,d in tags(body,rootStart)if code==39}
 streams=[]
 for sid in sorted([cfg['main'],dormant,*[b['spriteId']for b in a['branches']]]):
  sprite=xml.find(f'Header/tags/DefineSprite[@objectID="{sid}"]');head=sprite.find('tags/SoundStreamHead')
  if head.get('compression')=='1':
   assert n==59 and sid==67
   assert(head.get('soundRate'),head.get('soundStereo'),head.get('sampleSize'))==('0','0','459')
   frame=1;blocks=[]
   for tag in sprite.find('tags'):
    if tag.tag=='SoundStreamBlock':blocks.append(dict(frame=frame,hex=base64.b64decode(tag.find('data').text).hex(),sampleCountPerChannel=459))
    if tag.tag=='ShowFrame':frame+=1
   binary=[d for code,d in tags(sprites[sid],4)if code==19]
   assert binary==[bytes.fromhex(b['hex'])for b in blocks]
   assert[b['frame']for b in blocks]==list(range(1,14))and all(len(b)==290 for b in binary)
   raw=b''.join(binary);put(V/f'stream-{sid}.adpcm.bin',raw)
   put(B/'native-v1/adpcm-source-v1.json',dict(spriteId=sid,frameCount=frame-1,sourceSampleRate=5512,sourceNominalRate=5512.5,sourceBytes=len(raw),sourceSha256=sha(raw),blocks=blocks,binaryXmlEquivalent=True))
   continue
  assert(head.get('compression'),head.get('soundRate'),head.get('sampleSize'))==('2','2','1837')
  channels=1+int(head.get('soundStereo'));assert channels in[1,2]
  latency=struct.unpack('<h',base64.b64decode(head.find('latencySeek/data').text))[0]
  frame=1;before=0;blocks=[];payload=[]
  for tag in sprite.find('tags'):
   if tag.tag=='SoundStreamBlock':
    raw=base64.b64decode(tag.find('data').text);samples,seek=struct.unpack('<Hh',raw[:4]);part=raw[4:]
    blocks.append(dict(frame=frame,samples=samples,seek=seek,mp3Bytes=len(part),samplesBefore=before,sourceTargetSample=before+seek));before+=samples;payload.append(part)
   if tag.tag=='ShowFrame':frame+=1
  binary=[d for code,d in tags(sprites[sid],4)if code==19]
  assert[(struct.unpack('<Hh',d[:4]),d[4:])for d in binary]==[((b['samples'],b['seek']),p)for b,p in zip(blocks,payload)]
  mp3=b''.join(payload);put(V/f'stream-{sid}.mp3',mp3)
  positive=[b for b in blocks if b['samples']>0];first=positive[0]['frame'];runs=[]
  for block in positive:
   residual=block['sourceTargetSample']-(block['frame']-first)*1837
   if not runs or residual!=runs[-1]['sourceResidual']:
    if runs:runs[-1]['endDecodedSample']=block['samplesBefore']
    runs.append(dict(firstFrame=block['frame'],firstDecodedSample=block['sourceTargetSample'],sourceResidual=residual))
  runs[-1]['endDecodedSample']=before
  streams.append(dict(spriteId=sid,frameCount=frame-1,sourceSwfSha256=sha(swf),frameDomain=f'sprite-{sid}',sourceBytes=len(mp3),sourceSha256=sha(mp3),sampleRate=22050,channels=channels,decodedSamplesCandidate=before,latency=latency,blocks=blocks,segments=[{k:r[k]for k in['firstFrame','firstDecodedSample','endDecodedSample']}for r in runs],binaryXmlEquivalent=True,sourceSampleSize=1837,physicalSamplesPerFrame=1837.5,clockScope='Source-coordinate runs; fractional frame discrepancy retained. Original runtime alignment and listening are unverified.'))
 put(B/'native-v1/streams-v1.json',streams)
 print(json.dumps(dict(page=n,sourceModelBytes=(X/'native-v1/source-model-v1.json').stat().st_size,terms=sorted({g['key']for g in activeGlossary}),ending=roles['ending'],streams=[dict(sprite=s['spriteId'],channels=s['channels'],latency=s['latency'],bytes=s['sourceBytes'],runs=len(s['segments']))for s in streams])))
