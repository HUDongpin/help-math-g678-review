from pathlib import Path
import json,sys
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box

B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][249]
assert [texts[i]['text'].strip() for i in [257,260,262,265]]==['$0.09 per minute','$0.10 per minute','$0.12 per minute','$0.25 per minute']
answers=[]
for i,(a,id,amount) in enumerate(zip(m['answerBindings'],[257,260,262,265],['0.09','0.10','0.12','0.25']),1):
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],valueKind='currency-rate',sourceTextId=f'character-{id}',equationIds=[id],amount=amount,currency='USD',unit='minute',display=texts[id]['text'].strip(),wrongFirst=a.get('message','')+' Try again.' if not a.get('correct') else None,wrongLater=a.get('message')))
helpTexts=[dict(id=str(i),characterId=i,sourceTextId=f'character-{i}',text=reflow_text(texts[i]))for i in [176,177,178,179]]
graphs=[]
for name,row,shapes,depths in [('question',quiz,[227,241],list(range(19,32))+list(range(33,40))),('help',v.by['sprite-214']['frames'][0],[194,207,210,212],list(range(38,52))+[53,54,62,64])]:
 grid=next(p for p in row if p['characterId']==shapes[0]);bb=box(v.bounds[shapes[0]],grid);paths=[];labels=[]
 for id in shapes:
  p=next(p for p in row if p['characterId']==id);paths.append(dict(sourceShapeId=id,matrix=p['matrix'],paths=v.paths(id)))
 for depth in depths:
  p=next(p for p in row if p['depth']==depth);t=texts[p['characterId']];b=box(t['boundsTwips'],p);labels.append(dict(depth=depth,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
 graphs.append(dict(name=name,gridBounds=bb,viewBox=[bb[0]-550,bb[2]-550,bb[1]-bb[0]+1100,bb[3]-bb[2]+1100],paths=paths,labels=labels))
assert len(graphs[0]['labels'])==20 and len(graphs[1]['labels'])==18
overlayIds=[416,418,421,422,425,426,430,431]
for id in [425,426,430,431,446]:assert all(p.get('fill','none')in['none','#ffffff']and p.get('stroke','none')in['none','#ffffff']for p in v.paths(id))
bStart=next(p['matrix'][5]for p in quiz if p['characterId']==259);bEnd=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==259);assert (bStart,bEnd)==(-406,-1286)
formulaIds=[433,434,435,438,440,441,443,444,445];changeIds=[423,424,427,428,429,432];states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 overlays=[]
 for p in sorted(row,key=lambda p:p['depth']):
  if p['characterId']not in overlayIds:continue
  clips=[box(v.bounds[q['characterId']],q)for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']]
  overlays.append(dict(sourceShapeId=p['characterId'],depth=p['depth'],matrix=p['matrix'],alpha=alpha(p),clips=clips))
 coordinate=[]
 for id in [417,419]:
  p=find(id)
  if p:
   b=box(texts[id]['boundsTwips'],p);coordinate.append(dict(characterId=id,depth=p['depth'],text=texts[id]['text'],alpha=alpha(p),x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
 atoms=[dict(characterId=p['characterId'],depth=p['depth'],alpha=alpha(p),matrix=p['matrix'])for p in row if p['characterId']in formulaIds]
 bars=[dict(characterId=p['characterId'],depth=p['depth'],matrix=p['matrix'],alpha=alpha(p),ratio=p.get('ratio',0))for p in row if p['characterId']in [436,437,439,442]]
 states.append(dict(questionAlpha=alpha(find(221)),questionOffset=(find(221)['matrix'][5]+4012)/20 if find(221) else 0,terms=[term for id,term in [(222,'Graph'),(223,'Function'),(224,'Calculate'),(225,'Slope'),(226,'Line')]if alpha(find(id))>0],termFlash=[term for id,term in [(247,'Graph'),(249,'Function'),(251,'Calculate'),(252,'Slope'),(253,'Line')]if alpha(find(id))>0],answerAlpha={a['letter']:alpha(find(a['letterId']))for a in answers},answerOffset={a['letter']:(find(a['letterId'])['matrix'][5]-next(p['matrix'][5]for p in quiz if p['characterId']==a['letterId']))/20 if find(a['letterId'])and f<=250 else 0 for a in answers},bMove=max(0,min(1,(find(259)['matrix'][5]-bStart)/(bEnd-bStart)))if find(259)else 0,graphAlpha=alpha(find(227)),graphOverlays=overlays,coordinate=coordinate,changeTexts=[dict(characterId=id,text=texts[id]['text'],alpha=alpha(find(id)))for id in changeIds if find(id)],formula=atoms,fractionBars=bars,whiteHaloTargets=['B']if find(446)else[]))
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0) and states[-1]['bMove']==1
assert len(states[-1]['formula'])==11 and len(states[-1]['fractionBars'])==3
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),graphs=graphs,graphOverlaySources=[dict(sourceShapeId=id,paths=v.paths(id))for id in overlayIds],helpTexts=helpTexts,helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<214)),question=texts[221]['text'],visualStates=spans(states),formulaTexts=[dict(characterId=id,sourceTextId=texts[id]['sourceTextId'],text=texts[id]['text'])for id in formulaIds],fractionBarSources=[dict(characterId=id,paths=v.paths(id))for id in [437,439,442]],morphBarSource=dict(characterId=436,path=str((B/'source-v1/ffdec/morphshapes/436.svg').relative_to(Path.cwd())),startLength=2.55,endLength=134,sourceRatioDenominator=65535),nativeDisposition={'answers':'Native currency rates retain the authored two decimal digits and per minute unit; do not coerce into integer or fraction answer models.','graphs':'Question and help are different source graphs. Retain twenty question labels and eighteen help labels including vertical/horizontal length labels.','coordinates':'Question uses (20,12) and (40,14); the revealed triangle has vertical2 and horizontal20. Source shapes include annotation backgrounds; corresponding coordinate text remains native.','formula':'Vertical14-12=2 and horizontal40-20=20 precede slope=vertical change/horizontal change=2/20=1/10=0.1. Preserve per-atom alpha and repeated equals signs by depth. Source fraction bar436 grows across frames701..705 into437 at706.','scope':'Source-derived intermediate model only. Native consumer, source-role classification, browser decode, module, registration and all acceptance gates remain open.'},registered=False,originalRuntimeAccepted=False)
p=B/'native-v1/teaching-visual-source-v1.json';content=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==content
else:p.open('x').write(content)
print(json.dumps(dict(spans=len(result['visualStates']),graphs=[dict(name=g['name'],labels=len(g['labels']))for g in graphs],helpTerms=result['helpTerms'],registered=False)))
