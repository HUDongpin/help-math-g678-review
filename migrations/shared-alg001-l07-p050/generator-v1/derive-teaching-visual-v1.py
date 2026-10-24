from pathlib import Path
import json,sys
sys.path.insert(0,str(Path.cwd()/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans
B=Path(__file__).resolve().parents[1];v=SourceVisual(B);m=v.m;c=v.c;main=v.main;texts=v.texts;quiz=main['frames'][c['quiz']-1]
termNames={166:'Nonlinear function',167:'Function',168:'Function table',169:'Evaluate',170:'Radius',171:'Area',172:'Circle',173:'Value'}
flashNames={174:'Nonlinear function',175:'Area',176:'Circle',177:'Function',178:'Radius',179:'Function table',180:'Evaluate',181:'Value'}
def rich(id):
 t=texts[id];normal=max(r['fontHeightTwips']for r in t['runs']);last=None;tokens=[]
 for r in t['runs']:
  sup=r['fontHeightTwips']<normal*.8
  if sup:assert r['text']=='2' and r['yOffsetTwips']<last
  else:
   if last is not None and r['yOffsetTwips']>last and tokens and not tokens[-1]['text'].endswith(' ')and not r['text'].startswith(' '):tokens.append(dict(text=' ',superscript=False))
   last=r['yOffsetTwips']
  token=dict(text=r['text'],superscript=sup)
  if id==151:
   term=next((s for s in termNames.values()if s.casefold()==r['text'].strip().casefold()),None)
   if term:token['term']=term
  tokens.append(token)
 plain=''.join('²'if t['superscript']else t['text']for t in tokens)
 return dict(characterId=id,sourceTextId=f'character-{id}',text=plain,tokens=tokens)
richTexts=[rich(id)for id in[134,135,136,139,151,152,341,342,343,344]]
assert next(r for r in richTexts if r['characterId']==135)['text']=='A = 3.14 r²'
answers=[]
for i,(a,id,expected)in enumerate(zip(m['answerBindings'],[183,185,187,189],['3.1432','18.84','28.26','31.4']),1):
 assert texts[id]['text']==expected and len(texts[id]['runs'])==1 and texts[id]['runs'][0]['fontHeightTwips']==440
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],valueKind='number',equationIds=[id],display=expected,wrongFirst=a.get('wrongFirst'),wrongLater=a.get('wrongLater')))
assert answers[2]['instance']=='AnsBtn2' and answers[1]['instance']=='AnsBtn3'
rows=[]
for left,right in [(158,161),(156,162),(163,159),(157,None),(164,160)]:
 p=next(p for p in quiz if p['characterId']==left);q=next((p for p in quiz if p['characterId']==right),None)
 if q:assert abs(p['matrix'][5]-q['matrix'][5])<30
 rows.append(dict(inputId=left,outputId=right,input=texts[left]['text'],output=texts[right]['text']if right else None))
assert [(r['input'],r['output'])for r in rows]==[('0','0'),('1','3.14'),('2','12.56'),('3',None),('4','50.24')]
helpTexts=[dict(id=str(r['characterId']),**{k:r[k]for k in['characterId','sourceTextId','text']})for r in richTexts if r['characterId']in[134,135,136,139]]
start=next(p['matrix'][5]for p in quiz if p['characterId']==60);end=next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==60);assert start==712 and end==-1468
states=[]
for f,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 states.append(dict(questionAlpha=alpha(find(151)),questionOffset=(find(151)['matrix'][5]+4012)/20 if find(151)else 0,terms=[term for id,term in termNames.items()if alpha(find(id))],termFlash=[term for id,term in flashNames.items()if alpha(find(id))],answerAlpha={a['letter']:alpha(find(a['letterId']))for a in answers},answerOffset={a['letter']:(find(a['letterId'])['matrix'][5]-next(p['matrix'][5]for p in quiz if p['characterId']==a['letterId']))/20 if find(a['letterId'])and f<=c['quiz']else 0 for a in answers},correctMove=max(0,min(1,(find(60)['matrix'][5]-start)/(end-start)))if find(60)else 0,whiteHaloTargets=[],overlayShapeIds=[],tableAlpha=alpha(find(153)),tableOffset=(find(153)['matrix'][5]+6652)/20 if find(153)else 0,postEquations=[dict(characterId=id,alpha=alpha(find(id)),offset=(find(id)['matrix'][5]-next(p['matrix'][5]for p in main['frames'][-1]if p['characterId']==id))/20 if find(id)else 0)for id in[341,342,343,344]]))
assert states[-1]['answerAlpha']==dict(A=0,B=0,C=1,D=0)and states[-1]['correctMove']==1
assert all(p['alpha']==0 for p in states[475]['postEquations']) and all(p['alpha']==1 for p in states[-1]['postEquations'])
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=v.branches(),helpTexts=helpTexts,helpTerms=['Equation','Substitute','Order of operations','Calculate','Value','Expression'],question=next(r['text']for r in richTexts if r['characterId']==151),richTexts=richTexts,table=dict(captionId=152,headingIds=[154,155],rows=rows,missingCell='Authored empty output for r=3 remains empty throughout the source; correct C and later formulas supply the answer separately.'),visualStates=spans(states),nativeDisposition={'math':'Native superscript2 follows source font-height/baseline evidence. Wrong A 3.1432 is one baseline text run and remains literal.','table':'Preserve r/A headings and five source rows; the r=3 output remains empty. Native table and answer column reflow vertically on narrow viewports.','timing':'Question/table fade3..9; eight alternating term flashes; staggered answer entry323..330; wrong choices disappear356, C moves352..366; equations fade477..485 and555..563 with source vertical offsets.','scope':'Source engineering; no original-runtime or acceptance.'},registered=False,originalRuntimeAccepted=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(spans=len(result['visualStates']),answers=[a['display']for a in answers],registered=False)))
