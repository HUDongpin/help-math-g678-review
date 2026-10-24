from pathlib import Path
import json,sys,re
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts
assert texts[233]['text']=='What is the y-intercept of the linear function y =         x –     ?'
assert [texts[i]['text']for i in[234,235,236,237,238]]==[' –','3','4','2','5']
quiz=main['frames'][127];dp={p['depth']:p for p in quiz}
assert [dp[d]['characterId']for d in[4,5,6,7,8,9,10]]==[221,234,235,236,221,237,238]
for numerator,bar,denominator in[(6,4,7),(9,8,10)]:
 n=box(texts[dp[numerator]['characterId']]['boundsTwips'],dp[numerator]);b=box(v.bounds[221],dp[bar]);d=box(texts[dp[denominator]['characterId']]['boundsTwips'],dp[denominator]);assert n[3]<=b[2]<b[3]<=d[2]
answers=[]
for i,(a,ids,neg,num,den)in enumerate(zip(m['answerBindings'],[[234,235,221,236],[234,237,221,238],[237,221,238],[248,221,249]],[True,True,False,False],[3,2,2,3],[4,5,5,4]),1):
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],equationIds=ids,negative=neg,numerator=str(num),denominator=str(den),equationText=('−'if neg else'')+f'{num}/{den}',spoken=('negative 'if neg else'')+f'{num} over {den}',wrongFirst=a.get('message','')+' Try again.'if not a.get('correct')else None,wrongLater=a.get('message')))
helpTexts=[dict(id=str(i),characterId=i,sourceTextId=f'character-{i}',text=reflow_text(texts[i]))for i in[219,220]]
assert helpTexts[0]['text'].strip()=='The y-intercept of a linear function is the constant term when written in slope-intercept form.'
assert helpTexts[1]['text']=='When a term is subtracted, the negative sign is part of the term.'
assert set(re.findall('[A-Za-z]',v.paths(400)[0]['d']))<=set('MLZ')
assert all(p.get('stroke','none')in['none','#ffffff']and p.get('fill','none')in['none','#ffffff','#000000']for p in v.paths(404))
assert [(p.get('fill'),p.get('stroke'))for p in v.paths(406)]==[('#ff00ff','none'),('none','#ffff00')]
start=next(p['matrix'][5]for p in quiz if p['characterId']==122);end=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==122);assert(start,end,end-start)==(-406,-2286,-1880)
states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 paragraph=v.prefix(row,402,{400});terms=[term for id,term in[(240,'Y-intercept'),(241,'Linear function')]if alpha(find(id))>0]
 if alpha(find(403))and 'constant'in paragraph:terms.append('Constant')
 aa={a['letter']:alpha(find(a['letterId']))for a in answers};off={a['letter']:(find(a['letterId'])['matrix'][5]-next(p for p in quiz if p['characterId']==a['letterId'])['matrix'][5])/20 if find(a['letterId'])and f<=128 else 0 for a in answers}
 states.append(dict(questionAlpha=alpha(find(233)),questionOffset=(find(233)['matrix'][5]+4012)/20 if find(233)else 0,terms=list(dict.fromkeys(terms)),termFlash=[term for id,term in[(242,'Y-intercept'),(243,'Linear function')]if alpha(find(id))],answerAlpha=aa,answerOffset=off,paragraphs=[paragraph],whiteHaloTargets=['question-constant']if find(404)else[],negativeSignHighlight=bool(find(406)),overlayMinus=bool(find(405)),overlayShapeIds=[id for id in[404,406]if find(id)],bMove=max(0,min(1,(find(122)['matrix'][5]-start)/(end-start)))if find(122)else 0))
assert states[127]['answerAlpha']==dict(A=251/256,B=1,C=251/256,D=1)
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0)and states[-1]['bMove']==1
assert states[-1]['paragraphs']==['The y-intercept of a linear function is the constant term in the function.']
complete=next(f for f,s in enumerate(states,1)if s['paragraphs'][0]==texts[402]['text'].rstrip())
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),helpTexts=helpTexts,helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<227)),visualStates=spans(states),question=texts[233]['text'],questionMath=dict(negative=True,numerator='3',denominator='4',constantNumerator='2',constantDenominator='5',sourceTextIds=[233,234,235,236,237,238],fractionShape=221),completeTextFrames={'402':complete},nativeDisposition={'question':'Exact source y=-3/4 x-2/5; stacked fractions preserve source numerator/denominator geometry.','answer':'A=-3/4; B=-2/5; C=2/5; D=3/4. Exact source B is correct; B moves upward94 source pixels as other answers fade.','help':'Native two paragraphs retain source text with spaces only for authored line breaks; five terms.','post':'Mask400 progressively reveals source402; Constant glossary action becomes available after its whole word is revealed.','halo':'Source404 white halo emphasizes entire question constant -2/5 at authored intermittent placements204..243; source405 redraws its minus above halo. Source406 yellow halo/magenta interior emphasizes the minus at intermittent placements278..291, with black source405 glyph above it. Map to semantic constant and minus nodes, never an invented extra term.','library':'Unplaced hurricane graph/table library retained as source evidence and excluded from this question.','scope':'Public-tool structural/visual source evidence, not original-runtime/fidelity/listening acceptance.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),completeTextFrame=complete,helpTerms=result['helpTerms'],haloSpans=[s for s in spans([s['whiteHaloTargets']for s in states])if s['value']],negativeHighlightSpans=[s for s in spans([s['negativeSignHighlight']for s in states])if s['value']])))
