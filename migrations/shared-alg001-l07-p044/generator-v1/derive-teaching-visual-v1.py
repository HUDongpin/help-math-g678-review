from pathlib import Path
import json,sys
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][73]
assert texts[234]['text']=='What is the y-intercept of the linear function whose graph in shown?  '
assert [texts[i]['text']for i in[252,254,255,257,258,260]]==['– 2',' –','1','2','–','0']
answers=[]
for i,(a,ids,neg,num,den)in enumerate(zip(m['answerBindings'],[[252],[254,255],[258,255,222,257],[260]],[True,True,True,False],[2,1,1,0],[None,None,2,None]),1):
 text=('−'if neg else'')+str(num)+(f'/{den}'if den else'');spoken=('negative 'if neg else'')+str(num)+(f' over {den}'if den else'')
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],equationIds=ids,negative=neg,numerator=str(num),denominator=str(den)if den else None,equationText=text,spoken=spoken,wrongFirst=a.get('message','')+' Try again.'if not a.get('correct')else None,wrongLater=a.get('message')))
dp={p['depth']:p for p in quiz};assert [dp[d]['characterId']for d in[62,63,64,65]]==[222,257,255,258]
n=box(texts[255]['boundsTwips'],dp[64]);b=box(v.bounds[222],dp[62]);d=box(texts[257]['boundsTwips'],dp[63]);assert(n[2]+n[3])/2<(b[2]+b[3])/2<(d[2]+d[3])/2
helpTexts=[dict(id=str(i),characterId=i,sourceTextId=f'character-{i}',text=reflow_text(texts[i]))for i in[219,220,221]]
assert [t['text']for t in helpTexts]==['The y-intercept of a line is the y-coordinate of the point where the line intersects the y-axis.','Find the point where the line intersects the y-axis.','The y-coordinate of that point is the answer.']
grid=next(p for p in quiz if p['characterId']==235);bb=box(v.bounds[235],grid);paths=[]
for id in[235,244]:
 p=next(p for p in quiz if p['characterId']==id);paths.append(dict(sourceShapeId=id,matrix=p['matrix'],paths=v.paths(id)))
labels=[]
for depth in range(7,21):
 p=dp[depth];t=texts[p['characterId']];q=box(t['boundsTwips'],p);labels.append(dict(depth=depth,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],text=t['text'],x=(q[0]+q[1])/2,y=(q[2]+q[3])/2))
graphs=[dict(name='question',viewBox=[bb[0]-500,bb[2]-500,bb[1]-bb[0]+1000,bb[3]-bb[2]+1000],gridBounds=bb,paths=paths,labels=labels)];assert len(labels)==14
assert v.paths(410)[0]['fill']=='#ff0000'
for id in[415,416]:assert all(p.get('stroke','none')in['none','#ffffff']and p.get('fill','none')in['none','#ffffff']for p in v.paths(id))
assert [texts[i]['text']for i in[412,413,414]]==['0,','_','1']
bStart=next(p['matrix'][5]for p in quiz if p['characterId']==122);bEnd=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==122);assert(bStart,bEnd,bEnd-bStart)==(-406,-1286,-880)
states=[]
for f,row in enumerate(main['frames'],1):
 bydepth={p['depth']:p for p in row};find=lambda id:next((p for p in row if p['characterId']==id),None)
 overlays=[dict(sourceShapeId=p['characterId'],depth=p['depth'],matrix=p['matrix'],ratio=0,alpha=alpha(p),clips=[])for p in row if p['characterId']==410]
 coordinate=[]
 for depth,id in[(30,412),(31,413),(32,414)]:
  p=bydepth.get(depth)
  if p and p['characterId']==id:
   b=box(texts[id]['boundsTwips'],p);coordinate.append(dict(depth=depth,characterId=id,sourceTextId=f'character-{id}',text=texts[id]['text'],alpha=alpha(p),x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
 if coordinate:assert len(coordinate)==3 and len({a['alpha']for a in coordinate})==1
 states.append(dict(questionAlpha=alpha(find(234)),questionOffset=(find(234)['matrix'][5]+4012)/20 if find(234)else 0,terms=[term for id,term in[(245,'y-intercept'),(246,'Linear function'),(247,'Graph')]if alpha(find(id))>0],termFlash=[term for id,term in[(248,'y-intercept'),(249,'Linear function'),(250,'Graph')]if alpha(find(id))>0],answerAlpha={a['letter']:alpha(find(a['letterId']))for a in answers},answerOffset={a['letter']:(find(a['letterId'])['matrix'][5]-next(p for p in quiz if p['characterId']==a['letterId'])['matrix'][5])/20 if find(a['letterId'])and f<=74 else 0 for a in answers},bMove=max(0,min(1,(find(122)['matrix'][5]-bStart)/(bEnd-bStart)))if find(122)else 0,graphAlpha=alpha(find(235)),graphOverlays=overlays,coordinate=coordinate,whiteHaloTargets=(['coordinate-y']if find(415)else[])+(['B']if find(416)else[]),overlayShapeIds=[id for id in[415,416]if find(id)]))
assert states[73]['answerAlpha']==dict(A=251/256,B=1,C=251/256,D=1)
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0)and states[-1]['bMove']==1
assert [x['characterId']for x in states[-1]['coordinate']]==[412,413,414]
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),graphs=graphs,graphOverlaySources=[dict(sourceShapeId=410,paths=v.paths(410))],helpTexts=helpTexts,helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<228)),visualStates=spans(states),question=texts[234]['text'],coordinateText=dict(sourceTextIds=[412,413,414],originalParts=['0,','_','1'],display='0, −1',spoken='zero, negative one'),nativeDisposition={'question':'Preserve exact graph question including source grammar graph in shown. A=-2, B=-1, C=-1/2, D=0; B correct.','graph':'Exact source235 grid and244 descending blue line,14 native axis labels; source410 red point at y-axis crossing reveals153..160.','coordinate':'Source412 zero/comma,413 underscore used as minus,414 one at same baseline compose 0,-1; native ordered-pair label keeps source position and alpha160..167, with native background replacing decorative rounded capsule411. No extra parentheses added to visible source text.','help':'Three exact source paragraphs and five unique glossary terms; repeated Point uses source meaning.','emphasis':'White glyph415 highlights coordinate negative-one at intermittent217..232;416 highlights B negative-one at265..280. Source duplicate413/414 redraws above halo; one native semantic value plus white halo retains schedule. Correct B moves44 source pixels upward as wrong answers fade.','scope':'Public-tool engineering source analysis; no original runtime, fidelity, listening or human acceptance.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),helpTerms=result['helpTerms'],halo=[s for s in spans([s['whiteHaloTargets']for s in states])if s['value']])))
