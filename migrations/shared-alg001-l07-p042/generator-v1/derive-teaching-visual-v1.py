from pathlib import Path
import json,sys,hashlib
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][71]
assert texts[167]['text']=='What is the slope of the linear function whose graph in shown?'
assert [texts[i]['text']for i in[178,179,180,186,187]]==[' –','4','3','4','3']
answers=[]
for i,(a,ids,neg,num,den)in enumerate(zip(m['answerBindings'],[[178,179,126,180],[178,180,126,179],[180,126,179],[186,184,187]],[True,True,False,False],[4,3,3,4],[3,4,4,3]),1):
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],equationIds=ids,negative=neg,numerator=str(num),denominator=str(den),equationText=('−'if neg else'')+f'{num}/{den}',spoken=('negative 'if neg else'')+f'{num} over {den}',wrongFirst=a.get('message','')+' Try again.'if not a.get('correct')else None,wrongLater=a.get('message')))
dp={p['depth']:p for p in quiz}
for numerator,bar,denominator in[(49,47,50),(61,59,62),(73,71,72),(83,81,84)]:
 n=box(texts[dp[numerator]['characterId']]['boundsTwips'],dp[numerator]);b=box(v.bounds[126]if bar!=81 else dict(left=-108.15*20,right=-90.65*20,top=-76.1*20,bottom=-74.5*20),dp[bar]);d=box(texts[dp[denominator]['characterId']]['boundsTwips'],dp[denominator]);assert (n[2]+n[3])/2 < (b[2]+b[3])/2 < (d[2]+d[3])/2,(numerator,bar,denominator,n,b,d)
assert v.paths(184)[0]['d']=='M-108.15 -76.1 L-90.65 -76.1 -90.65 -74.5 -108.15 -74.5 -108.15 -76.1'
helpTexts=[dict(id=str(id),characterId=id,sourceTextId=f'character-{id}',text=reflow_text(texts[id]))for id in[123,124,125,128,129,130]]
assert [h['text']for h in helpTexts]==['Choose two points whose coordinates are easy to identify.','Form a right triangle using those points.','Find the length of the vertical segment and the length of the horizontal segment.','Slope is the fraction ','Add a negative sign in front of the fraction if the line runs downhill from left to right.','Simplify the fraction if possible.']
assert texts[131]['text']=='vertical change'and texts[132]['text']=='horizontal change'
graphs=[]
for name,row,shapes,labeldepths in[('question',quiz,[145,172],list(range(15,29))),('help',v.by['sprite-160']['frames'][0],[145,154],list(range(42,56))+[65,67])]:
 paths=[]
 for id in shapes:
  p=next(p for p in row if p['characterId']==id);paths.append(dict(sourceShapeId=id,matrix=p['matrix'],paths=v.paths(id)))
 grid=next(p for p in row if p['characterId']==145);bb=box(v.bounds[145],grid);labels=[]
 for depth in labeldepths:
  p=next(p for p in row if p['depth']==depth);t=texts[p['characterId']];q=box(t['boundsTwips'],p);labels.append(dict(depth=depth,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],text=t['text'],x=(q[0]+q[1])/2,y=(q[2]+q[3])/2))
 graphs.append(dict(name=name,viewBox=[bb[0]-500,bb[2]-500,bb[1]-bb[0]+1000,bb[3]-bb[2]+1000],gridBounds=bb,paths=paths,labels=labels))
assert len(graphs[0]['labels'])==14 and len(graphs[1]['labels'])==16
overlayIds=[340,342,343,*range(344,350),350,*range(354,360),369,370,371]
overlays=[dict(sourceShapeId=id,paths=v.paths(id))for id in overlayIds]
for id in[344,345,346,347,348,349,354,355,356,357,358,359,371]:assert all(p['stroke']=='#ffffff'for p in v.paths(id))
assert v.paths(363)[0]['end']['d']=='M64.2 54.95 L208.5 54.95'
assert v.paths(370)[0]['end']['d']=='M-242.25 101.3 L-73.1 -119.75'
dStart=next(p for p in quiz if p['characterId']==185)['matrix'][5]
dEnd=next(p for p in main['frames'][102]if p['characterId']==185)['matrix'][5]
assert (dStart,dEnd)==(1123,-2137)
assert all(next(p for p in row if p['characterId']==185)['matrix'][5]==dEnd for row in main['frames'][102:])
states=[]
for f,row in enumerate(main['frames'],1):
 bydepth={p['depth']:p for p in row};find=lambda id:next((p for p in row if p['characterId']==id),None)
 graphOverlays=[]
 for p in sorted(row,key=lambda p:p['depth']):
  if p['characterId']not in overlayIds:continue
  clips=[box(v.bounds[q['characterId']],q)for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']]
  graphOverlays.append(dict(sourceShapeId=p['characterId'],depth=p['depth'],matrix=p['matrix'],ratio=p.get('ratio',0),alpha=alpha(p),clips=clips))
 aa={a['letter']:alpha(find(a['letterId']))for a in answers}
 off={a['letter']:(find(a['letterId'])['matrix'][5]-next(p for p in quiz if p['characterId']==a['letterId'])['matrix'][5])/20 if find(a['letterId'])and f<=72 else 0 for a in answers}
 graphNumbers=[]
 for d,id in[(86,351),(89,353)]:
  p=bydepth.get(d)
  if p and p['characterId']==id:
   b=box(texts[id]['boundsTwips'],p);graphNumbers.append(dict(depth=d,sourceTextId=f'character-{id}',text=texts[id]['text'],alpha=alpha(p),x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
 formula=[dict(depth=d,characterId=bydepth[d]['characterId'],alpha=alpha(bydepth[d]),matrix=bydepth[d]['matrix'])for d,id in[(91,361),(92,362),(94,365),(95,366),(96,351),(97,367),(98,353),(99,368),(100,366),(101,372),(102,373),(103,374)]if d in bydepth and bydepth[d]['characterId']==id]
 bar=bydepth.get(93);barRatio=0 if not bar else 1 if bar['characterId']==364 else (.027+(1-.027)*bar.get('ratio',0)/65535)
 states.append(dict(questionAlpha=alpha(find(167)),questionOffset=(find(167)['matrix'][5]+4012)/20 if find(167)else 0,terms=[term for id,term in[(169,'Slope'),(170,'Linear function'),(171,'Graph')]if alpha(find(id))>0],termFlash=[term for id,term in[(173,'Slope'),(174,'Linear function'),(175,'Graph')]if alpha(find(id))>0],answerAlpha=aa,answerOffset=off,dMove=max(0,min(1,(find(185)['matrix'][5]-dStart)/(dEnd-dStart)))if find(185)else 0,graphAlpha=alpha(find(145)),graphOverlays=graphOverlays,graphNumbers=graphNumbers,changeTexts=[dict(characterId=id,text=texts[id]['text'],alpha=alpha(find(id)))for id in[352,360]if find(id)],formula=formula,fractionBarProgress=barRatio,whiteHaloTargets=['D']if find(375)else[],overlayShapeIds=[375]if find(375)else[]))
assert states[71]['answerAlpha']==dict(A=251/256,B=1,C=251/256,D=1)
assert states[-1]['answerAlpha']==dict(A=0,B=0,C=0,D=1)
assert [x['characterId']for x in states[-1]['formula']]==[361,362,365,366,351,367,353,368,366,372,373,374]
assert texts[352]['text']=='Vertical change in length: 8'and texts[360]['text']=='Horizontal change in length: 6'
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),graphs=graphs,graphOverlaySources=overlays,helpTexts=helpTexts,helpFraction=dict(numerator=texts[131]['text'],denominator=texts[132]['text'],ids=[131,126,132]),helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<160)),visualStates=spans(states),question=texts[167]['text'],formulaTexts=[dict(characterId=id,sourceTextId=texts[id]['sourceTextId'],text=texts[id]['text'])for id in[351,353,361,362,365,366,368,373,374]],nativeDisposition={'question':'Source grammar graph in shown is preserved. Four slope fractions A -4/3 B -3/4 C3/4 D4/3 retain source sign, numerator and denominator.','graphs':'Exact source vector grid, blue line, black points, red dashed legs, white flashes and arrow/morph retained; 14 question and16 help labels rendered as native text. Source help triangle is a separate example, not the main graph.','masks':'Two separate source341 rectangle instances clip the horizontal and vertical segments at their own depths; derived clip bounds retain their gradual reveals.','formula':'Native words and stacked fractions appear at their source depths/alpha. Graph8/6 labels persist while duplicate glyphs move to the equation. The explicit plus sign and simplified4/3 appear only at their source frames.','help':'Six complete source instructions plus vertical change over horizontal change fraction and help triangle. Source baseline breaks become spaces only between unspaced words.','emphasis':'White leg flashes and white line cover/morph preserve schedule. White glyph375 highlights correct D fraction in its exact presence frames.','scope':'Source engineering extraction, no original-runtime/fidelity/listening/human acceptance.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v3.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),graphs=[dict(name=g['name'],labels=len(g['labels']))for g in graphs],helpTerms=result['helpTerms'],halo=[s for s in spans([s['whiteHaloTargets']for s in states])if s['value']])))
