"""P058 source display lists and explicit Current-JS role decisions; no AVM parity claim."""
from pathlib import Path
import json,hashlib,re,sys,xml.etree.ElementTree as E
B=Path(__file__).resolve().parents[1];R=B.parents[1];sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return dict(path=str(p.relative_to(R))if p.is_relative_to(R)else str(p),bytes=len(b),sha256=sha(b))
def put(p,obj):
 b=(json.dumps(obj,ensure_ascii=False,separators=(',',':'))+'\n').encode()
 if p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
a=json.loads((B/'native-v1/source-structure-audit-v1.json').read_text());c=json.loads((B/'source-v1/source-text-catalog-v1.json').read_text());assert sha((B/'source-v1/L7TS07.swf').read_bytes())==c['sourceSha256']==a['source']['sourceFiles'][0]['sha256']
for p in a['scripts']:assert pin(R/p['file']['path'])==p['file']
ts=[]
for t in c['timelines']:
 live={};frames=[]
 for f in range(1,t['declaredFrameCount']+1):
  for e in t['events']:
   if e['frame']!=f:continue
   if e['kind']=='remove':assert e['depth']in live;del live[e['depth']]
   elif e['kind']=='place':
    p=live.get(e['depth'],{}).copy()if e['move']else dict(matrix=[1,0,0,1,0,0],depth=e['depth'],placedFrame=f)
    for k in ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId']:
     if k in e:p[k]=e[k]
    assert p.get('characterId');live[e['depth']]=p
  frames.append([p.copy()for p in sorted(live.values(),key=lambda p:p['depth'])])
 ts.append({**{k:t[k]for k in ['timelineId','declaredFrameCount','observedFrameCount','trailingAfterEnd']},'frames':frames})
by={t['timelineId']:t for t in ts};main=by['sprite-311'];root=by['root'];assert next(p for p in root['frames'][5]if p['characterId']==311)['matrix']==[1,0,0,1,8247,5658]
alpha=lambda p:max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
glossary=[]
for s in a['scripts']:
 match=re.search(r'_global.KeyAttribute\s*=\s*"([^"]+)";',s['source'])
 if not match:continue
 bid=int(re.search(r'DefineButton2_(\d+)',s['file']['path']).group(1));key=match.group(1)
 for t in ts:
  for r in spans([any(p['characterId']==bid for p in row)for row in t['frames']]):
   if r['value']:glossary.append(dict(ownerSpriteId=int(t['timelineId'].split('-')[1]),buttonId=bid,key=key,firstFrame=r['first'],lastFrame=r['last'],script=s['file']))
# Geometry establishes offstage legacy data. AVM6 duplicate name resolution remains unverified.
offstage=[]
for id in [176,177,178]:
 rows=[dict(frame=f,matrix=p['matrix'])for f,row in enumerate(main['frames'],1)for p in row if p['characterId']==id]
 assert rows and all(p['matrix'][4]+8247>16000 for p in rows)
 offstage.append(dict(characterId=id,minStageLeftTwips=min(p['matrix'][4]+8247 for p in rows),first=rows[0]['frame'],last=rows[-1]['frame']))
# Extra wrong clip233 is held at1; it is absent at final quiz and has no local caller.
assert (B/'source-v1/ffdec/scripts/DefineSprite_233/frame_1/DoAction.as').read_text().replace('\n','').replace('\r','')=='stop();_parent.enableButton();'
assert all(p['characterId']!=233 for p in main['frames'][804])
strayRanges=spans([any(p['characterId']==233 for p in row)for row in main['frames']])
helpRanges=spans([any(p['characterId']==295 for p in row)for row in main['frames']]);assert [r for r in helpRanges if r['value']]==[dict(first=805,last=805,value=True)]
# Text rows reflow line boundaries only; original typo244 remains verbatim.
texts=[]
for t in c['textDefinitions']:
 out='';last=None
 for r in t.get('runs',[]):
  if last is not None and r['yOffsetTwips']!=last and out and not out[-1].isspace()and r['text']and not r['text'][0].isspace():out+=' '
  out+=r['text'];last=r['yOffsetTwips']
 texts.append({**t,'text':out})
assert next(t for t in texts if t['characterId']==244)['text']=='To total is the number of pushups: P = 5R+3'
feedback=[dict(spriteId=s,index=i,terminal=f,kind=k)for k,rows in [('right',a['rightBranches']),('wrong',a['wrongBranches'])]for s,i,f in rows]
activeOwners={311,256,273,295};activeGlossary=[g for g in glossary if g['ownerSpriteId']in activeOwners]
behavior=dict(mainSpriteId=311,mainLastFrame=822,quizFrame=805,postQuizFrame=806,steps=[dict(frame=f,**({'box':dict(spriteId=s)}if s else{}))for f,s in [(315,None),(475,None),(613,256),(751,273)]],options=[dict(letter=b['letter'],right=b['letter']=='A')for b in a['answerBinding']],feedback=feedback,help=dict(spriteId=295),glossary=[{k:g[k]for k in ['ownerSpriteId','buttonId','key','firstFrame','lastFrame']}for g in activeGlossary])
roles=dict(offstageTexts=offstage,extraWrong233Ranges=[r for r in strayRanges if r['value']],extraWrong233='Held at1 with unresolved parent.enableButton call (no definition in311) and no released answer exists until805 where this clip is absent. Retain extracted stream233 as audited dormant material; never select it as an eighth feedback.',popupCollision=dict(swfVersion=6,exactNamedCandidate=dict(spriteId=295,name='Mc_Popup',depth=265,first=805),caseOnlyAlternative=dict(spriteId=310,name='Mc_PopUp',depth=300,first=805),maintainedSelection=295,reason='The button and frame805 scripts spell Mc_Popup, and sprite295 contains the current question function-help example. Bind the modern action to this exact source instance. Do not claim this resolves original AVM6 case-insensitive lookup, depth ordering, or original visibility.',alternative='Sprite310 is stopped at1; its visible label and later unrelated angle text are not promoted into current question help. No local script calls its gotoAndPlay2.'),continue191='Empty source sprite with release action; expose a native Continue action without claiming original mouse hit reachability.',step192='Transparent source shape18 hit region; first two releases resume main, later two open the corresponding enlarged step. Close advances only the child timeline.',ordinaryWrap='Main has no final stop. Preserve822 for its full duration; process wrap at823 boundary, re-enter1 and retain page-scoped quiz globals until later authored resets.',noSemanticCorrection='Preserve To total, authored pushups phrasing and Nicky negative25 example. Source text reflow adds only spaces at source line boundaries.')
model=dict(schemaVersion=1,animationId='shared-alg001-l07-p058',source=pin(B/'source-v1/L7TS07.swf'),spanishAudio=pin(B/'source-v1/L7TS07.mp3'),catalog=pin(B/'source-v1/source-text-catalog-v1.json'),audit=pin(B/'native-v1/source-structure-audit-v1.json'),fps=12,rootEntryFrame=6,rootMatrix=[1,0,0,1,8247,5658],stage=dict(width=800,height=600),mainSpriteId=311,mainFrameCount=822,behavior=behavior,roleDisposition=roles,glossary=glossary,timelines=ts,texts=texts,shapes=c['shapeDefinitions'],buttons=c['buttonDefinitions'],bitmaps=c['bitmapDefinitions'],risks=c['risks'],registered=False,originalRuntimeAccepted=False)
put(B/'native-v1/source-model-v1.json',model);put(B/'audit-v1/source-role-disposition-v1.json',roles)
print(json.dumps(dict(pass_=True,domains=len(ts),frames=sum(len(t['frames'])for t in ts),glossary=len(activeGlossary),terms=sorted({g['key']for g in activeGlossary}),feedback=feedback,offstage=offstage)))
