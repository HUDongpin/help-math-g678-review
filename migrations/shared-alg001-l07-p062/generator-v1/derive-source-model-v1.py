from pathlib import Path
import json,hashlib,sys,collections
R=Path(__file__).resolve().parents[3];B=R/'migrations/shared-alg001-l07-p062';D=Path('/Volumes/American Dream/.g6p62a1');sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,v):
 b=(json.dumps(v,ensure_ascii=False,separators=(',',':'))+'\n').encode()
 if '--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
c=json.loads((D/'source-text-catalog-v1.json').read_text());audit=json.loads((B/'audit-v1/source-behavior-v1.json').read_text());source=B/'source-v1/L7FQ02.swf';assert sha(source.read_bytes())==c['sourceSha256']=='577ab968e3c2b0a287b69657bdf15330b6144c7be27ae62198512542e3106ed2';assert not c['unparsedTags'];timelines=[]
for t in c['timelines']:
 live={};frames=[];events=collections.defaultdict(list)
 for e in t['events']:events[e['frame']].append(e)
 for f in range(1,t['declaredFrameCount']+1):
  for e in events[f]:
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    p=live.get(e['depth'],{}).copy()if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
    for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']:
     if k in e:p[k]=e[k]
    assert p.get('characterId');live[e['depth']]=p
  frames.append([p.copy()for p in sorted(live.values(),key=lambda p:p['depth'])])
 timelines.append({**{k:t[k]for k in ['timelineId','declaredFrameCount','observedFrameCount','trailingAfterEnd']},'frames':frames})
by={t['timelineId']:t for t in timelines};texts=[]
for t in c['textDefinitions']:
 text='';last=None
 for r in t.get('runs',[]):
  if last is not None and r['yOffsetTwips']!=last and text and not text[-1].isspace()and r['text']and not r['text'][0].isspace():text+=' '
  text+=r['text'];last=r['yOffsetTwips']
 if t['kind']=='dynamic-field':text=(t.get('initialText')or{}).get('text','')
 texts.append({**t,'text':text})
root=next(p for p in by['root']['frames'][5]if p['characterId']==1383);assert root['matrix']==[1,0,0,1,7350,4322];assert by['sprite-1383']['declaredFrameCount']==81
model=dict(schemaVersion=1,animationId='shared-alg001-l07-p062',source=pin(source),sourceXml=pin(B/'source-v1/index.xml'),catalog=pin(D/'source-text-catalog-v1.json'),audit=pin(B/'audit-v1/source-behavior-v1.json'),stage=dict(width=800,height=600),fps=12,rootEntryFrame=6,rootMatrix=root['matrix'],mainSpriteId=1383,mainFrameCount=81,timelines=timelines,texts=texts,shapes=c['shapeDefinitions'],buttons=c['buttonDefinitions'],bitmaps=c['bitmapDefinitions'],fonts=c['fonts'],risks=c['risks'],registered=False,originalRuntime=False)
put(D/'source-model-v1.json',model);put(B/'native-v1/source-model-binding-v1.json',dict(externalRoot=str(D),model=pin(D/'source-model-v1.json'),generator=pin(Path(__file__))))
T={t['characterId']:t for t in texts};Q=[]
def mul(a,b):
 return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
def flatten(row,matrix,prefix,seen):
 out=[]
 for p in row:
  id=p['characterId'];m=mul(matrix,p['matrix']);name=(p.get('name')or{}).get('text');pth=prefix+[dict(characterId=id,depth=p['depth'],name=name)]
  if id in T:
   t=T[id];out.append(dict(characterId=id,text=t['text'],kind=t['kind'],matrix=m,path=pth,boundsTwips=t['boundsTwips'],runs=t.get('runs',[])))
  elif f'sprite-{id}'in by:
   assert id not in seen;out.extend(flatten(by[f'sprite-{id}']['frames'][0],m,pth,seen|{id}))
 return out
for q in audit['questions']:
 states=[]
 for role,key in [('question','questionFrame'),('review','reviewFrame')]:
  flat=flatten(by['sprite-1383']['frames'][q[key]-1],root['matrix'],[],{1383});states.append(dict(role=role,frame=q[key],texts=flat))
 Q.append(dict(id=q['id'],correct=q['scoringCorrectOption'],states=states))
put(D/'question-text-layout-v1.json',dict(questions=Q,scope='Recursive first-child-frame static text placements, without script visibility. Source controller fields, Finish/Result and audio widgets need independent disposition.'))
summary=[dict(id=q['id'],correct=q['correct'],questionTexts=[dict(id=t['characterId'],text=t['text'],kind=t['kind'],path='/'.join(x['name']or str(x['characterId'])for x in t['path']),x=t['matrix'][4]/20,y=t['matrix'][5]/20)for t in q['states'][0]['texts']if t['text']])for q in Q]
put(B/'audit-v1/question-text-summary-v1.json',summary);print(json.dumps(dict(timelines=len(timelines),textDefinitions=len(texts),questions=len(Q),sourceModelBytes=(D/'source-model-v1.json').stat().st_size)))
