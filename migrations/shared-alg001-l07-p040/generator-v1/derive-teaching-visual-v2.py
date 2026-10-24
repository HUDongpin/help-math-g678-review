from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
by={t['timelineId']:t for t in m['timelines']};main=by['sprite-335'];texts={t['characterId']:{**t,'text':''.join(r['text']for r in t.get('runs',[]))}for t in m['texts']}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def spans(vs):
 out=[]
 for f,v in enumerate(vs,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def box(b,p):
 a,c,d,e,x,y=p['matrix'];q=[(a*u+d*v+x,c*u+e*v+y)for u in[b['left'],b['right']]for v in[b['top'],b['bottom']]];return[min(u for u,v in q),max(u for u,v in q),min(v for u,v in q),max(v for u,v in q)]
# Source glyphs and geometric baselines establish grouping, fraction and powers.
assert texts[155]['text']=='y =  ' and texts[157]['text']=='1'and texts[158]['text']=='x'
assert [(texts[id]['text'])for id in[165,164,161,163,162,161,160]]==['y','=','2','x','+','2','1']
assert texts[167]['text']=='y = x2 – 1' and texts[167]['runs'][1]['fontHeightTwips']==286 and texts[167]['runs'][1]['yOffsetTwips']==272
assert texts[169]['text']=='3'and texts[169]['runs'][0]['fontHeightTwips']==286
answers=[]
for i,(a,ids,spoken,math)in enumerate(zip(m['answerBindings'],[[155,156,157,158],[165,164,161,163,162,161,160],[167],[165,164,163,169,162,161,163]],['y equals one divided by x','y equals two x plus twenty-one','y equals x squared minus one','y equals x cubed plus two x'],['y = 1/x','y = 2x + 21','y = x² – 1','y = x³ + 2x']),1):
 answers.append(dict(answer=i,letter=a['letter'],instance=a['instance'],characterId=a['button'],letterId=a['label'],equationIds=ids,equationText=math,spoken=spoken,wrongFirst=a.get('message','')+' Try again.'if not a.get('correct')else None,wrongLater=a.get('message')))
quiz=main['frames'][78]
# Verify individual baseline locations. B's trailing 2 and 1 are adjacent digits, not x+2 and a separate value.
byDepth={p['depth']:p for p in quiz};assert[(byDepth[d]['characterId'],byDepth[d]['matrix'][4])for d in[41,40,39,38,37,36,35]]==[(165,-5471),(164,-5126),(161,-4639),(163,-4360),(162,-4046),(161,-3559),(160,-3320)]
assert byDepth[25]['matrix'][5]<byDepth[26]['matrix'][5] and byDepth[24]['characterId']==156
helpTexts=[]
for index,(start,end)in enumerate([(0,8),(8,10),(10,14)]):
 rr=texts[134]['runs'][start:end];helpTexts.append(dict(id=f'134-{index}',characterId=134,sourceTextId='character-134',text=''.join(r['text']for r in rr),sourceRunIds=[r['sourceTextId']for r in rr]))
assert [t['text']for t in helpTexts]==['The variables in the equation of a linear function can be multiplied by constants and added.','They cannot have exponents.','The variables also cannot be in a denominator of a fraction.']
branches=[dict(spriteId=237,kind='right',index=4,terminal=32),dict(spriteId=319,kind='wrong',index=4,child=315,hold=21,close=313,closeJump=22,terminal=28)]
root=next(p for p in by['root']['frames'][5]if p['characterId']==335)
for b in branches:
 t=by[f"sprite-{b['spriteId']}"];ids=sorted({p['characterId']for row in t['frames']for p in row if p['characterId']in texts and texts[p['characterId']]['text']});titles={texts[id]['text']for id in ids};assert len(titles)==1
 if b['kind']=='wrong':
  ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==315 for p in row)for row in t['frames']])if s['value']];assert ranges==[[14,21]];b.update(closeFirst=14,closeRanges=ranges)
 parent=next(p for p in quiz if p['characterId']==b['spriteId']);vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p)
    for p2 in[parent,root]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),p2)
    if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 b.update(title=next(iter(titles)),titleIds=ids,titleAlpha=spans(vis),naturallySelected=True)
# All postquiz overlay text is black; shapes are white outlines/underlays, not red highlighting.
shapePins=[]
for id in[320,321,329,330,331,332,333]:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';paths=list(E.parse(p).getroot().iter('{http://www.w3.org/2000/svg}path'));assert paths
 assert {s.get('stroke')for s in paths}<={'none','#ffffff'};assert {s.get('fill')for s in paths}<={'none','#ffffff','#000000'}
 shapePins.append(dict(characterId=id,sha256=sha(p.read_bytes()),role='Outlined denominator x with white halo'if id==333 else'White glyph underlay with black text replacements on top',paths=[{k:v for k,v in s.attrib.items()if k in['fill','stroke','stroke-width']}for s in paths]))
for id in[322,323,324,325,326,327,328,334]:assert all(r['colorRgba']==[0,0,0,255]for r in texts[id]['runs'])
states=[]
for f,row in enumerate(main['frames'],1):
 assert not any(p.get('clipDepth')for p in row)
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 aa={a['letter']:alpha(find(a['letterId']))for a in answers};off={a['letter']:(find(a['letterId'])['matrix'][5]-next(p for p in quiz if p['characterId']==a['letterId'])['matrix'][5])/20 if find(a['letterId']) and f<80 else 0 for a in answers}
 states.append(dict(questionAlpha=alpha(find(149)),questionOffset=(find(149)['matrix'][5]+4012)/20 if find(149)else 0,terms=[term for id,term in[(151,'Equation'),(150,'Linear function')]if alpha(find(id))>0],termFlash=[term for id,term in[(152,'Equation'),(153,'Linear function')]if alpha(find(id))>0],answerAlpha=aa,answerOffset=off,whiteHaloTargets=['B']if find(320)else['C','D']if any(find(id)for id in[321,329,330,331,332])else['A-denominator']if find(333)else[],overlayShapeIds=[p['characterId']for p in row if p['characterId']in[320,321,329,330,331,332,333]],bMove=max(0,min(1,(next((p['matrix'][5]for p in row if p['characterId']==37),-6)+6)/-2400))))
assert states[78]['answerAlpha']==dict(A=251/256,B=1,C=251/256,D=1)
assert states[-1]['answerAlpha']==dict(A=0,B=1,C=0,D=0)and states[-1]['bMove']==1
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],answers=answers,branches=branches,helpTexts=helpTexts,helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if g['characterId']<142)),visualStates=spans(states),question=texts[149]['text'],overlaySources=shapePins,nativeDisposition={'equations':'Native fraction 1/x; literal adjacent digits21; semantic superscripts2 and3 from raised font runs. Labels A B C D retain vertical source reading order.','help':'Three complete teaching sentences from source134; authored line break after can be is reflowed without changing wording.','overlay':'Source320/321/329-332 are white glyph underlays with matching black equation runs above them. Source333 is black denominator x with white stroke under duplicate334. Native white halo preserves mapped targets and source schedule; no red/yellow emphasis or extra correct-answer signal.','alpha':'Each entire answer uses its source letter alpha; all base equation atoms share it. Alpha A/C at held79 is251/256, not assumed1.','layout':'B moves upward by120 source pixels229-236 after A starts fading229; native single-column reflow collapses absent choices, retains movement progress evidence without translating text into the question.','feedback':'Named right237, wrong319 only. Close14-21 jumps22, terminal28 increments attempt counter, correct terminal32. Dormant six feedbacks never selected.','sourceLimit':'Static extraction is not an ActionScript runtime or listening/fidelity acceptance.'},originalRuntimeAccepted=False,registered=False)
p=B/'native-v1/teaching-visual-source-v2.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(result['visualStates']),branches=branches,helpTerms=result['helpTerms'],haloSpans=[s for s in spans([r['whiteHaloTargets']for r in states])if s['value']])))
