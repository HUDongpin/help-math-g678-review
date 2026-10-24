from pathlib import Path
import json,sys,re
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,reflow_text,box
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts
assert texts[231]['text']=='What is the slope of the linear function y =         x –     ?'
assert [texts[i]['text']for i in[232,233,234,235]]==[' –','2','3','1']
quiz=main['frames'][113];dp={p['depth']:p for p in quiz}
assert [dp[d]['characterId']for d in[4,5,6,7,8,9,10]]==[220,232,233,234,220,235,233]
for numerator,bar,denominator in[(6,4,7),(9,8,10)]:
 n=box(texts[dp[numerator]['characterId']]['boundsTwips'],dp[numerator]);b=box(v.bounds[220],dp[bar]);d=box(texts[dp[denominator]['characterId']]['boundsTwips'],dp[denominator]);assert n[3]<=b[2]<b[3]<=d[2]
answers=[]
for i,(a,ids,neg,num,den)in enumerate(zip(m['answerBindings'],[[232,233,220,234],[232,235,220,233],[235,220,233],[245,220,246]],[True,True,False,False],[2,1,1,2],[3,2,2,3]),1):
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],equationIds=ids,negative=neg,numerator=str(num),denominator=str(den),equationText=('−'if neg else'')+f'{num}/{den}',spoken=('negative 'if neg else'')+f'{num} over {den}',wrongFirst=a.get('message','')+' Try again.'if not a.get('correct')else None,wrongLater=a.get('message')))
helptext=reflow_text(texts[219]);assert helptext=='The slope of a linear function is the coefficient of the independent variable, which is x.'
assert set(re.findall('[A-Za-z]',v.paths(397)[0]['d']))<=set('MLZ')
for p in v.paths(406):assert p.get('stroke')in['none','#ffffff']and p.get('fill')in['none','#ffffff','#000000']
states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 paragraphs=[v.prefix(row,id,{397})for id in[399,403]]
 terms=[term for id,term in[(238,'Slope'),(237,'Linear function')]if alpha(find(id))>0]
 for id,term,index,word in[(400,'Coefficient',0,'coefficient'),(401,'Independent variable',0,'independent'),(404,'Variable',1,'variable'),(405,'slope-intercept form',1,'slope-intercept form.')]:
  if alpha(find(id))and word in paragraphs[index]:terms.append(term)
 aa={a['letter']:alpha(find(a['letterId']))for a in answers}
 off={a['letter']:(find(a['letterId'])['matrix'][5]-next(p for p in quiz if p['characterId']==a['letterId'])['matrix'][5])/20 if find(a['letterId'])and f<=114 else 0 for a in answers}
 states.append(dict(questionAlpha=alpha(find(231)),questionOffset=(find(231)['matrix'][5]+4012)/20 if find(231)else 0,terms=list(dict.fromkeys(terms)),termFlash=[term for id,term in[(239,'Slope'),(240,'Linear function')]if alpha(find(id))],answerAlpha=aa,answerOffset=off,paragraphs=paragraphs,whiteHaloTargets=['A']if find(406)else[],overlayShapeIds=[406]if find(406)else[],aMove=max(0,min(1,(find(137)['matrix'][5]+1482)/-1000))if find(137)else 0))
assert states[113]['answerAlpha']==dict(A=251/256,B=1,C=251/256,D=1)
assert states[-1]['answerAlpha']==dict(A=1,B=0,C=0,D=0)and states[-1]['aMove']==1
assert ' '.join(states[-1]['paragraphs'])=='The slope of a linear function is the coefficient of the independent variable when written in slope-intercept form.'
complete={id:next(f for f,s in enumerate(states,1)if s['paragraphs'][i]==texts[id]['text'].rstrip())for i,id in enumerate([399,403])}
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),helpTexts=[dict(id='219',characterId=219,sourceTextId='character-219',text=helptext)],helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<225)),visualStates=spans(states),question=texts[231]['text'],questionMath=dict(negative=True,numerator='2',denominator='3',constantNumerator='1',constantDenominator='2',sourceTextIds=[231,232,233,234,235],fractionShape=220),completeTextFrames=complete,nativeDisposition={'question':'Exact source y=-2/3 x-1/2 from placed minus, numerator2, denominator3, numerator1 and denominator2 with fraction bars; no slash ambiguity.','answer':'A=-2/3; B=-1/2; C=1/2; D=2/3. Source order retained; source A alpha251/256 at quiz.','help':'Native paragraph inserts a space where the authored baseline changes between the and independent. No wording changed.','post':'Separate source masks reveal whole words in source399 then403. Links become available only with their complete source term. A moves up50 source pixels as incorrect choices fade.','halo':'White vector406 behind A fraction at275-289; native white halo retains meaning and schedule.','library':'Unplaced legacy graph/table/library definitions retained in source, excluded from this equation question.','scope':'Engineering source extraction; no original-runtime/fidelity/listening/human acceptance.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),completeTextFrames=complete,helpTerms=result['helpTerms'],halo=[s for s in spans([s['whiteHaloTargets']for s in states])if s['value']])))
