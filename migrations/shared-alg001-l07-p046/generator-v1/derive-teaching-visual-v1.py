from pathlib import Path
import json,sys,re,hashlib,xml.etree.ElementTree as E
R=Path(__file__).resolve().parents[3];B=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(R/'scripts/lib'))
from g678_fixed_exit_visual_v1 import SourceVisual,alpha,spans,box,reflow_text
v=SourceVisual(B);m=v.m;texts=v.texts;main=v.main;quiz=main['frames'][317];NS='{http://www.w3.org/2000/svg}'
assert hashlib.sha256(Path(m['source']['path']).read_bytes()).hexdigest()==m['source']['sha256']
def paths(id):
 if id not in [280,282]:return v.paths(id)
 nodes=E.parse(B/f'source-v1/ffdec/morphshapes/{id}.svg').getroot().iter(NS+'path');out=[]
 for n in nodes:
  d={k:x for k,x in n.attrib.items()if k in ['d','fill','stroke','stroke-width','fill-opacity','stroke-opacity']};ends={}
  for a in n:
   key=a.get('attributeName');first,last=a.get('values').split(';');assert key in ['d','stroke','stroke-width','fill-opacity'];assert first==d.get(key,'1.0');ends[key]=last
  assert re.sub(r'-?\d+(?:\.\d+)?','',ends['d'])==re.sub(r'-?\d+(?:\.\d+)?','',d['d']);d['end']=ends;out.append(d)
 return out
shapeIds=[29,53,59,60,71,72,74,265,266,267,268,279,280,281,282,283,284,285]
shapeSources=[dict(characterId=id,paths=paths(id))for id in shapeIds]
labelSources=[];labelIndex={}
def label(p):
 t=texts[p['characterId']];b=box(t['boundsTwips'],p);x=(b[0]+b[1])/2;y=(b[2]+b[3])/2
 key=(p['characterId'],tuple(p['matrix']))
 if key not in labelIndex:
  labelIndex[key]=len(labelSources);labelSources.append(dict(id='graph-label-'+str(len(labelSources)),characterId=p['characterId'],sourceTextId=t['sourceTextId'],text=t['text'],x=x,y=y))
 return dict(labelIndex=labelIndex[key],depth=p['depth'],alpha=alpha(p))
states=[]
for frame,row in enumerate(main['frames'],1):
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 question=find(14);shapeRows=[dict(characterId=p['characterId'],depth=p['depth'],matrix=p['matrix'],alpha=alpha(p),ratio=p.get('ratio',0))for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in shapeIds]
 labels=[label(p)for p in row if p['characterId']in list(range(30,53))+[272,273,287]]
 states.append(dict(questionAlpha=alpha(question),questionOffset=(question['matrix'][5]+3998)/20 if question else 0,graphVisible=any(p['characterId']in [29,59,265]for p in row),shapes=shapeRows,labels=labels,drawVisible=any(p['characterId']in[26,28,63]for p in row),terms=[g['term']for g in m['glossary']if g['characterId']in[21,22,23,24,25]and alpha(find(g['characterId']))>0],termFlash=[key for id,key in [(54,'Graph'),(55,'Linear function'),(56,'Slope'),(57,'Y-intercept'),(58,'Coordinates')]if alpha(find(id))>0],constantHighlight=alpha(find(270)),interceptHighlight=alpha(find(272)),slopeHighlight=alpha(find(275)),numeratorHighlight=alpha(find(278)),coordinateHighlight=alpha(find(287))))
# Title visibility includes nested static text but excludes dormant dynamic fields.
root=next(p for p in v.by['root']['frames'][5]if p['characterId']==288)
def chain_box(bounds,chain):
 b=[bounds['left'],bounds['right'],bounds['top'],bounds['bottom']]
 for p in chain:b=box(dict(left=b[0],right=b[1],top=b[2],bottom=b[3]),p)
 return b
branches=[]
for kind in ['wrong','right']:
 for source in m['feedback'][kind]:
  id=source['spriteId'];parent=dict(next(p for p in quiz if p['characterId']==id));parent['matrix']=[*parent['matrix'][:4],100,parent['matrix'][5]] # conditional host _x=5 pixels, converted to twips
  rows=v.by[f'sprite-{id}']['frames'];found=set();values=[]
  def visit(row,chain,weight,out):
   for p in row:
    cid=p['characterId'];a=weight*alpha(p)
    if cid in texts and texts[cid]['text']:
     found.add(cid);bb=chain_box(texts[cid]['boundsTwips'],[p,*chain]);
     if bb[1]>0 and bb[0]<16000 and bb[3]>0 and bb[2]<12000:out.append(a)
    elif f'sprite-{cid}'in v.by:visit(v.by[f'sprite-{cid}']['frames'][0],[p,*chain],a,out)
  for row in rows:
   out=[];visit(row,[parent,root],1,out);values.append(max(out,default=0))
  titles={texts[i]['text']for i in found};assert len(titles)==1,(id,titles)
  branch=dict(**source,kind=kind,title=next(iter(titles)),titleIds=sorted(found),titleAlpha=spans(values),depth=parent['depth'])
  if kind=='wrong':
   ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==source['child']for p in row)for row in rows])if s['value']];assert ranges==[[source['closeFirst'],source['hold']]];branch['closeRanges']=ranges
  branches.append(branch)
button=next(b for b in m['buttons']if b['characterId']==65);assert len(button['statePlacements'])==1 and button['statePlacements'][0]['states']==dict(up=False,over=False,down=False,hitTest=True)
hitPlacement=next(p for p in quiz if p['characterId']==65);hitBounds=box(v.bounds[64],hitPlacement)
assert hitBounds[0]>-4036 and hitBounds[1]<1415 and hitBounds[2]>-1489 and hitBounds[3]<3962
helpTexts=[dict(id=str(id),characterId=id,sourceTextId=texts[id]['sourceTextId'],text=reflow_text(texts[id]))for id in [104,105,106,109,110,111,112]]
helpTerms=list(dict.fromkeys(g['term']for g in m['glossary']if 107<=g['characterId']<=124));assert len(helpTerms)==14
# Grid source axis path59 crosses at (-66.1,61.85) SVG pixels. Keyboard
# navigation uses a declared modern256-twip step; pointer selection is unsnapped.
assert 'M-66.1 197.1 L-66.1 61.85' in paths(59)[-1]['d']
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],title='Linear and Nonlinear Functions: Try It!',titleSourceShapeId=11,question=texts[14]['text'],questionNumber=8,questionTextIds=[14,16,18,19],titleBranches=branches,shapeSources=shapeSources,labelSources=labelSources,graphViewBox=[-4500,-2100,6400,6500],backgroundHitBounds=hitBounds,keyboardOrigin=[-1322,1237],keyboardStep=256,helpTexts=helpTexts,helpTerms=helpTerms,visualStates=spans(states),sourceTexts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=t['text'],sourceTagSha256=t['sourceTagSha256'])for t in texts.values()],pointFrames=[dict(spriteId=id,frames=[[(p['characterId'],p['matrix'])for p in row]for row in v.by[f'sprite-{id}']['frames']])for id in [73,75,76,77,78,79]],morphRatioDenominator=65535,registered=False,originalRuntimeAccepted=False)
# This is generated product data, separate from the already frozen core source.
content=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
header="""// Generated by derive-teaching-visual-v1.py. Do not hand-edit.
import type {P046VisualSource} from './alg-l07-p046-native-v1';
const visual = """
ts=header+content.strip()+" as const;\nexport const ALG_L07_P046_VISUAL:P046VisualSource=visual;\n"
for p,body in [(B/'native-v1/teaching-visual-source-v1.json',content),(R/'packages/demos/src/alg-l07-p046-visual-source-v1.ts',ts)]:
 if p.exists()or'--check'in sys.argv:assert p.read_text()==body,str(p)
 else:p.open('x').write(body)
print(json.dumps(dict(pass_=True,spans=len(result['visualStates']),labels=len(labelSources),shapeSources=len(shapeSources),feedbackTitles=[b['title']for b in branches],helpTerms=len(helpTerms),productBytes=len(ts.encode()))))
