from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re,math
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-180');texts={t['characterId']:{**t,'text':''.join(r['text']for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==3 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
 for q in masks:
  b=box(bounds[q['characterId']],q);clip=[max(clip[0],b[0]),min(clip[1],b[1]),max(clip[2],b[2]),min(clip[3],b[3])]
 out='';x=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
# Values are source glyphs, including a vertically stacked negative fraction.
specs=[dict(answer=1,letter='A',instance='AnsBtn1',depth=49,letterId=23,valueIds=[24,26,25],value='–5/9',kind='fraction',numerator='5',denominator='9'),dict(answer=2,letter='B',instance='AnsBtn2',depth=60,letterId=28,valueIds=[29],value='–5',kind='integer'),dict(answer=3,letter='C',instance='AnsBtn3',depth=31,letterId=17,valueIds=[18],value='5',kind='integer'),dict(answer=4,letter='D',instance='AnsBtn4',depth=40,letterId=20,valueIds=[21],value='9',kind='integer')]
answers=[]
for g in specs:
 p=next(p for p in m['namedAtQuiz']if p['name']==g['instance']);wrong=g['answer']!=2;assert p['characterId']==(30 if wrong else 31)
 for row in main['frames']:
  a=alpha(next((p for p in row if p['depth']==g['depth']),None));assert all(alpha(p)==a for p in row if p['characterId']in[g['letterId'],*g['valueIds']])
 answers.append(dict(**g,characterId=p['characterId'],wrongLater=m['findings']['wrongLater']if wrong else None,wrongFirst=m['findings']['wrongFirst']if wrong else None))
assert texts[24]['text']=='–' and texts[26]['text']=='5' and texts[25]['text']=='9'
bs=[dict(spriteId=148,kind='wrong',index=1,child=145,hold=23,close=141,closeJump=24,terminal=29),dict(spriteId=176,kind='wrong',index=2,child=175,hold=20,close=156,closeJump=21,terminal=29),dict(spriteId=162,kind='wrong',index=3,child=159,hold=20,close=156,closeJump=21,terminal=28),dict(spriteId=90,kind='right',index=1,terminal=27),dict(spriteId=123,kind='right',index=2,terminal=33),dict(spriteId=102,kind='right',index=3,terminal=25),dict(spriteId=65,kind='right',index=4,terminal=27)]
script=lambda suffix:next(s['source']for s in m['scripts']if s['file']['path'].endswith('/'+suffix))
branches=[];rootPose=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==180)
for b in bs:
 t=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));assert len(t['frames'])==b['terminal']
 terminal=script(f"DefineSprite_{b['spriteId']}/frame_{b['terminal']}/DoAction.as");assert '_parent.play();'in terminal
 if b['kind']=='wrong':
  assert '_global.quizTryCount++;'in terminal and '_global.quizTryCount >= 2'in terminal
  assert script(f"DefineSprite_{b['spriteId']}/frame_{b['hold']}/DoAction.as").strip()=='stop();'
  assert f"_parent.gotoAndPlay({b['closeJump']});"in script(f"DefineButton2_{b['close']}/BUTTONCONDACTION on(release).as")
  present=[any(p['characterId']==b['child']for p in row)for row in t['frames']];ranges=[[s['first'],s['last']]for s in spans(present)if s['value']];b.update(closeFirst=ranges[0][0],closeRanges=ranges)
 ids=list(dict.fromkeys(p['characterId']for r in t['frames']for p in r if p['characterId']in texts and texts[p['characterId']].get('runs')));titles=[texts[i]['text']for i in ids];assert len(set(titles))==1,(b,titles)
 mp=next(p for p in main['frames'][252]if p['characterId']==b['spriteId']);vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for parent in [mp,rootPose]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),parent)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 branches.append(dict(**b,title=titles[0],titleIds=ids,titleAlpha=spans(vis),naturallySelected=b['index']<=4 if b['kind']=='right'else True))
states=[]
for row in main['frames']:
 dp={p['depth']:p for p in row};definition,continuation,question=[prefix(row,id)for id in[6,12,14]];visible=' '.join([definition,continuation,question]).lower();active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and g['term'].lower()in visible];b=dp.get(60)
 states.append(dict(definition=definition,continuation=continuation,question=question,terms=active,answerAlpha={g['letter']:alpha(dp.get(g['depth']))for g in answers},bMove=0 if not b else (-309-b['matrix'][5])/1160,questionCoefficient=any(p['characterId']==178 for p in row),answerCoefficient=any(p['characterId']==179 for p in row)))
streams=json.loads((B/'native-v1/streams-v1.json').read_text());ds=json.loads((B/'native-v1/decode-native-v1.json').read_text());assert ds['pass'];clocks=[]
for d in ds['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 if d['spriteId']==102:
  assert d['sampleRate']==22050 and d['decodedSamples']==23870;segments=[dict(firstFrame=2,firstDecodedSample=math.ceil(459*22050/5512),endDecodedSample=d['decodedSamples'])];empty=[];count=25
 else:
  s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples'];segments=s['segments'];count=s['frameCount'];empty=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=count,decoder=decoder,segments=segments,emptyNegativeBlocks=empty))
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=180,mainFrameCount=332,quizFrame=253,postQuizFrame=254,correctAnswer=2,answerCharacters={str(a['answer']):a['characterId']for a in answers},answers=answers,behavior=dict(wrongIncrement='feedback-terminal-after-close-exit',end='ordinary332-to1 wrap; next253 resets quiz',replay='full modern page reset',loopDoesNotCompleteLesson=True),branches=branches,visualStates=spans(states),clocks=clocks,sa=sa,terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in texts.values()],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v1.json';out=json.dumps(native,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(pass_=True,bytes=len(out.encode()),spans=len(native['visualStates']),branches=[{k:b[k]for k in ['spriteId','title','closeFirst']if k in b}for b in branches],completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,12,14]},clocks=len(clocks),highlights={key:[[s['first'],s['last']]for s in spans(states)if s['value'][key]]for key in ['questionCoefficient','answerCoefficient']})))
