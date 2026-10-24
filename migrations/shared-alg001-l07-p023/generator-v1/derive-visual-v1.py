from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-160');texts={t['characterId']:{**t,'text':''.join(r['text']for r in t['runs'])}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
 for q in [q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']]:
  assert q['characterId']==3;b=box(bounds[3],q);clip=[max(clip[0],b[0]),min(clip[1],b[1]),max(clip[2],b[2]),min(clip[3],b[3])]
 out='';x=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
# Reverify conditional historical host bytes; source-compatible, not runtime attestation.
h=json.loads(Path('migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json').read_text());hp={k:h['inputs'][k]for k in['hostSwf','hostFrame35ActionScript','hostFrame49ActionScript']}
for p in hp.values():
 b=Path(p['path']).read_bytes();assert len(b)==p['bytes']and sha(b)==p['sha256']
host=Path(hp['hostFrame35ActionScript']['path']).read_text();assert 'showWrongFeed1'in script('DefineSprite_160/frame_144/DoAction.as');assert not re.search(r'showWrongFeed[12]',host)
for name,n in [('Wrong',3),('Right',4)]:
 f=re.search(r'function show'+name+r'Feed\(\)\s*\{(.*?)\n\}',host,re.S)[1];assert f'random({n})'in f and f'Mc_{name}_Feed" + intMc_Name)'in f and 'quizTryCount'not in f
assert all(not p['name'].endswith('_1')for p in m['namedAtQuiz'])
# Four distinct source equations, same source glyph-run exponent in all wrong options.
answers=[]
for i,letter,eid,lid,button in [(1,'A',20,15,28),(2,'B',21,19,26),(3,'C',22,17,26),(4,'D',25,24,27)]:
 p=next(p for p in m['namedAtQuiz']if p['name']==f'AnsBtn{i}');assert p['characterId']==button;assert texts[lid]['text']==letter
 runs=texts[eid]['runs'];base=max(r['fontHeightTwips']for r in runs);segments=[dict(text=r['text'],sup=r['fontHeightTwips']<base and r['yOffsetTwips']<420)for r in runs]
 assert [s['text'].strip()for s in segments if s['sup']]==(['2']if i<4 else [])
 ep=next(p for p in main['frames'][143]if p['characterId']==eid);lp=next(p for p in main['frames'][143]if p['characterId']==lid);assert abs(ep['matrix'][5]-lp['matrix'][5])<60 and abs(ep['matrix'][5]-p['matrix'][5])<400
 answers.append(dict(answer=i,letter=letter,characterId=button,instance=f'AnsBtn{i}',equationId=eid,letterId=lid,segments=segments,equation=texts[eid]['text'],wrongFirst='A linear function cannot have x² terms. Try again.'if i<4 else None,wrongLater='A linear function cannot have x² terms.'if i<4 else None))
bs=[dict(spriteId=54,kind='right',index=1,terminal=31,titleIds=[43,44]),dict(spriteId=66,kind='right',index=4,terminal=27,titleIds=[63,64]),dict(spriteId=83,kind='right',index=2,terminal=28,titleIds=[78,79]),dict(spriteId=97,kind='right',index=3,terminal=32,titleIds=[90,91,95]),dict(spriteId=124,kind='wrong',index=3,terminal=29,titleIds=[104],child=121,hold=23,close=115,closeJump=24),dict(spriteId=137,kind='wrong',index=2,terminal=28,titleIds=[128,129,132],child=134,hold=20,close=133,closeJump=21),dict(spriteId=156,kind='wrong',index=1,terminal=28,titleIds=[141,142],child=155,hold=23,close=115,closeJump=24)]
byid={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'};root=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==160)
def title_leaves(row,ids,parents=(),pa=1):
 out=[]
 for p in row:
  if p['characterId']in ids:
   b=box(texts[p['characterId']]['boundsTwips'],p)
   for q in parents:b=box(dict(left=b[0],right=b[1],top=b[2],bottom=b[3]),q)
   if b[1]>0 and b[0]<16000 and b[3]>0 and b[2]<12000:out.append(pa*alpha(p))
  elif p['characterId']in byid and byid[p['characterId']]['declaredFrameCount']==1:out.extend(title_leaves(byid[p['characterId']]['frames'][0],ids,(p,*parents),pa*alpha(p)))
 return out
for b in bs:
 t=byid[b['spriteId']];assert t['declaredFrameCount']==b['terminal'];terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal and 'quizTryCount++;'not in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount >= 2'in terminal and '_global.quizTryCount = 0;'in terminal
  assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();'
  assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  assert '_global.quizTryCount == 1'in script(f"DefineSprite_{b['child']}/frame_1/DoAction.as")
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 titles=list(set(texts[i]['text']for i in b['titleIds']));assert len(titles)==1;b['title']=titles[0];b['naturallySelected']=True
 mp=dict(next(p for p in main['frames'][143]if p['characterId']==b['spriteId']));mp['matrix']=[*mp['matrix'][:4],100,mp['matrix'][5]]
 b['titleAlpha']=spans([max(title_leaves(row,b['titleIds'],(mp,root)),default=0)for row in t['frames']])
# Glossary visibility uses the exact linked run's complete prefix, never a coincidental later substring.
termspec=[('Linear function',6,1,8),('Term',6,3,9),('Constant',6,5,10),('Equation',12,1,13)]
emphasisWindows={id:[f for f,row in enumerate(main['frames'],1)if any(p['characterId']==id for p in row)]for id in[157,158,159]}
states=[]
for frame,row in enumerate(main['frames'],1):
 d,q=[prefix(row,id)for id in[6,12]];visible={6:d,12:q};terms=[term for term,id,ri,bid in termspec if any(p['characterId']==bid for p in row)and len(visible[id])>=len(''.join(r['text']for r in texts[id]['runs'][:ri+1]).rstrip())]
 aa={a['letter']:alpha(next((p for p in row if p['characterId']==a['equationId']),None))for a in answers};dp=next((p for p in row if p['characterId']==25),None)
 states.append(dict(definition=d,question=q,terms=terms,answerAlpha=aa,dPose=None if dp is None else dp['matrix'],emphasis=[id for id in[157,158,159]if any(p['characterId']==id for p in row)],emphasisTerms=[id for id,frames in emphasisWindows.items()if min(frames)<=frame<=max(frames)]))
streams=json.loads((B/'native-v1/streams-v1.json').read_text());ds=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert ds['pass'];clocks=[]
for d in ds['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples'];clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
assert len(clocks)==8
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=160,mainFrameCount=302,quizFrame=144,postQuizFrame=145,correctAnswer=4,answers=answers,branches=bs,visualStates=spans(states),clocks=clocks,sa=sa,terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],domains=[dict(id=t['timelineId'],frameCount=t['declaredFrameCount'])for t in m['timelines']],title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in texts.values()],host=dict(inputs=hp,sourceCompatible=True,originalRuntimeVerified=False,localFunctions='showWrongFeed1/2 are defined only on page main frame144; no page invocation or historical host invocation. Wrong buttons call root.showWrongFeed. No _1 named feedback instances. Compatibility conditional on inspected indexMI host.',selection='random(3)+1 wrong; random(4)+1 right; no attempt-specific rotation'),behavior=dict(wrongIncrement='button-release-before-feedback',tryAgain='visible only at quizTryCount==1',secondWrongExit='reset count0 clear quiz resume main; first exit stays held144',end='ordinary302-to1 wrap; next144 resets quiz',replay='full modern page reset',loopDoesNotCompleteLesson=True),independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v1.json';out=json.dumps(native,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(passed=True,bytes=len(out.encode()),spans=len(native['visualStates']),branches=[{k:b[k]for k in['spriteId','title','index']}for b in bs],completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,12]},clocks=len(clocks))))
