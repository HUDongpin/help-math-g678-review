from pathlib import Path
import json,sys
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][c['quiz']-1]
answers=[]
for i,a in enumerate(m['answerBindings'],1):
 letter=a['letter'];ids=[152]if letter=='A'else[154]if letter=='B'else list(range(156,164));row=[p for p in quiz if p['characterId']in ids and (letter in'AB'or (39<=p['depth']<=48 if letter=='C'else 57<=p['depth']<=66))];row.sort(key=lambda p:p['matrix'][4]);raw=''.join(texts[p['characterId']]['text']for p in row);expected=['M=15L+7.75','M=7.75L+15','L=15M+7.75','L=7.75M+15'][i-1];assert raw.replace(' ','')==expected
 answers.append(dict(answer=i,letter=letter,instance=a['instance'],characterId=a['button'],letterId=a['label'],valueKind='linear-equation',equationIds=sorted({p['characterId']for p in row}),display=expected.replace('=',' = ').replace('+',' + '),sourceAtoms=[dict(characterId=p['characterId'],depth=p['depth'],text=texts[p['characterId']]['text'])for p in row],wrongFirst=a.get('wrongFirst'),wrongLater=a.get('wrongLater')))
helpTexts=[dict(id=str(i),characterId=i,sourceTextId=f'character-{i}',text=reflow_text(texts[i]))for i in[134,135,136,139,140]]
bStart=next(p['matrix'][5]for p in quiz if p['characterId']==37);bEnd=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==37);assert bStart!=bEnd
emphasis=[(318,319,'M'),(320,321,'='),(322,323,'7'),(324,325,'75'),(326,327,'L'),(328,329,'+'),(330,331,'15')]
for shape,text,token in emphasis:
 assert texts[text]['text']==token and all(p.get('fill','none')in['none','#ffffff']for p in v.paths(shape))
states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 states.append(dict(questionAlpha=alpha(find(147)),questionOffset=(find(147)['matrix'][5]+4012)/20 if find(147)else 0,terms=['Linear function']if alpha(find(149))else[],termFlash=['Linear function']if alpha(find(150))else[],answerAlpha={a['letter']:alpha(find(a['letterId']))for a in answers},answerOffset={a['letter']:(find(a['letterId'])['matrix'][5]-next(p['matrix'][5]for p in quiz if p['characterId']==a['letterId']))/20 if find(a['letterId'])and f<=c['quiz']else 0 for a in answers},bMove=max(0,min(1,(find(37)['matrix'][5]-bStart)/(bEnd-bStart)))if find(37)else 0,whiteHaloTargets=[],emphasis=[dict(shapeId=s,sourceTextId=f'character-{t}',token=token,alpha=alpha(find(t)))for s,t,token in emphasis if find(s)and find(t)]))
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0)and states[-1]['bMove']==1
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),helpTexts=helpTexts,helpTerms=['Function'],question=reflow_text(texts[147]),visualStates=spans(states),nativeDisposition={'equations':'Preserve all four complete expressions. C/D are reconstructed from source text placement x order. Correct B retains its decimal point at every frame, including separate 7 and 75 source emphasis flashes. Native emphasis replaces outlined glyph halos; full semantic expression never disappears.','sourceTiming':'Retain per-option alpha and B movement. M, equals, 7, 75, L, plus and 15 flash on exactly the source alternating frames; no contiguous-range interpolation.','scope':'Source engineering only; native integration and acceptance pending.'},registered=False,originalRuntimeAccepted=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),answers=[a['display']for a in answers],registered=False)))
