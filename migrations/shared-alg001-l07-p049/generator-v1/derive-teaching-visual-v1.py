from pathlib import Path
import json,sys
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][c['quiz']-1]
answers=[dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],valueKind='graph',equationIds={'A':[65,74],'B':[77,78],'C':[80,81],'D':[84,85]}[a['letter']],graph=a['letter'],display='Graph '+a['letter'],wrongFirst=a.get('wrongFirst'),wrongLater=a.get('wrongLater'))for i,a in enumerate(m['answerBindings'],1)]
# Keep each graph in a local coordinate system while the source moves B to A's position.
groups=[('A',65,74,27,40),('B',77,78,53,66),('C',80,81,79,93),('D',84,85,105,118)];graphs=[]
for letter,grid,curve,first,last in groups:
 p=next(p for p in quiz if p['characterId']==grid);bb=box(v.bounds[grid],p);labels=[]
 for q in sorted(quiz,key=lambda q:q['depth']):
  if first<=q['depth']<=last and q['characterId']in texts:
   t=texts[q['characterId']];b=box(t['boundsTwips'],q);labels.append(dict(depth=q['depth'],sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2))
 assert len(labels)==14
 graphs.append(dict(name=letter,gridBounds=bb,viewBox=[bb[0]-300,bb[2]-300,bb[1]-bb[0]+600,bb[3]-bb[2]+600],paths=[dict(sourceShapeId=id,matrix=next(q['matrix']for q in quiz if q['characterId']==id),paths=v.paths(id))for id in[grid,curve]],labels=labels))
bStart=next(p['matrix'][5]for p in quiz if p['characterId']==76);bEnd=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==76);assert bStart!=bEnd
states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 graphStates=[]
 for g,(letter,grid,curve,first,last)in zip(graphs,groups):
  base=next(q for q in quiz if q['characterId']==grid);now=find(grid);delta=[now['matrix'][4]-base['matrix'][4],now['matrix'][5]-base['matrix'][5]]if now else[0,0]
  norm=lambda mat:mat[:4]+[mat[4]-delta[0],mat[5]-delta[1]]
  paths=[dict(sourceShapeId=id,alpha=alpha(find(id)),matrix=norm(find(id)['matrix'])if find(id)else base['matrix'])for id in[grid,curve]]
  labels=[]
  for l in g['labels']:
   q=next((p for p in row if p['depth']==l['depth']and p['characterId']==l['sourceCharacterId']),None)
   labels.append(dict(depth=l['depth'],alpha=alpha(q)))
  overlays=[]
  for q in sorted(row,key=lambda p:p['depth']):
   id=q['characterId']
   if id not in[240,241,242]:continue
   target='C'if id==240 else'A'if q['matrix'][4]<0 else'D'
   if target==letter:overlays.append(dict(sourceShapeId=id,depth=q['depth'],matrix=norm(q['matrix']),alpha=alpha(q)))
  graphStates.append(dict(name=letter,paths=paths,labels=labels,overlays=overlays))
 states.append(dict(questionAlpha=alpha(find(57)),questionOffset=(find(57)['matrix'][5]+4012)/20 if find(57)else 0,terms=[term for id,term in[(59,'Nonlinear function'),(60,'Graph')]if alpha(find(id))],termFlash=[term for id,term in[(61,'Graph'),(62,'Nonlinear function')]if alpha(find(id))],answerAlpha={a['letter']:alpha(find(a['letterId']))for a in answers},answerOffset={a['letter']:(find(a['letterId'])['matrix'][5]-next(p['matrix'][5]for p in quiz if p['characterId']==a['letterId']))/20 if find(a['letterId'])and f<=c['quiz']else 0 for a in answers},bMove=max(0,min(1,(find(76)['matrix'][5]-bStart)/(bEnd-bStart)))if find(76)else 0,whiteHaloTargets=['B']if find(239)else[],graphs=graphStates))
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0)and states[-1]['bMove']==1
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),graphs=graphs,graphOverlaySources=[dict(sourceShapeId=id,paths=v.paths(id))for id in[240,241,242]],helpTexts=[dict(id=str(i),characterId=i,sourceTextId=f'character-{i}',text=reflow_text(texts[i]))for i in[38,39,40]],helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<50)),question=reflow_text(texts[57]),visualStates=spans(states),nativeDisposition={'graphs':'Preserve all four source curves and grids, fourteen native axis labels per graph, independent source alpha, B movement, source magenta C-line emphasis, and growing purple vertical-test strokes with red source lines for A and D. Do not invent intersection markers absent from the source shapes.','order':'Original display order A,C in top row and B,D in bottom row. Correct B maps to AnsBtn4; use explicit source identity, never infer correctness from button suffix.','scope':'Source engineering model; native integration and acceptance pending.'},registered=False,originalRuntimeAccepted=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),graphs=[dict(name=g['name'],labels=len(g['labels']))for g in graphs],registered=False)))
