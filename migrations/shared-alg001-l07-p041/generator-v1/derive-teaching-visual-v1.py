from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,re,sys
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());sha=lambda b:hashlib.sha256(b).hexdigest()
by={t['timelineId']:t for t in m['timelines']};main=by['sprite-223'];texts={t['characterId']:{**t,'text':''.join(r['text']for r in t.get('runs',[]))}for t in m['texts']};ns='{http://www.w3.org/2000/svg}'
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def spans(vs):
 out=[]
 for f,v in enumerate(vs,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def box(b,p):
 a,c,d,e,x,y=p['matrix'];q=[(a*u+d*v+x,c*u+e*v+y)for u in[b['left'],b['right']]for v in[b['top'],b['bottom']]];return[min(u for u,v in q),max(u for u,v in q),min(v for u,v in q),max(v for u,v in q)]
graphIds=[1,35,59,65,66,67,68,69,73,74,215,216];graphShapes=[]
for id in graphIds:
 file=B/f'source-v1/ffdec/shapes/{id}.svg';paths=[{k:v for k,v in e.attrib.items()if not k.startswith('{')}for e in E.parse(file).getroot().iter(ns+'path')];removed=[]
 if id in[59,67,216]:
  removed=paths[-4:];paths=paths[:-4]
  # These four exact trailing paths are the source's empty Done-button outline,
  # spatially separate from the graph and from its instructional red segment.
  for p in removed:
   ns1=[float(n)for n in re.findall(r'-?\d+(?:\.\d+)?',p['d'])];assert min(ns1[::2])>160 and min(ns1[1::2])>162
 for p in paths:assert not any('url('in v for v in p.values())and set(re.findall(r'[A-Za-z]',p['d']))<=set('MLQZ')
 graphShapes.append(dict(sourceShapeId=id,sourceSvgSha256=sha(file.read_bytes()),paths=paths,removedDoneOutlinePathCount=len(removed)))
labels=[]
for p in main['frames'][10]:
 if p['characterId']not in range(36,59):continue
 t=texts[p['characterId']];q=box(t['boundsTwips'],p)
 axis='name'if t['characterId']in[57,58]else'x'if 22<=p['depth']<=42 else'y'
 labels.append(dict(id=f"axis-{axis}-{t['text']}",axis=axis,sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceDepth=p['depth'],text=t['text'],x=(q[0]+q[1])/40,y=(q[2]+q[3])/40))
assert len(labels)==43 and len({l['id']for l in labels})==43
assert sorted(int(l['text'])for l in labels if l['axis']=='x')==list(range(-10,11))
assert sorted(int(l['text'])for l in labels if l['axis']=='y')==[i for i in range(-10,11)if i]
helpTexts=[dict(characterId=id,sourceTextId=texts[id]['sourceTextId'],text=texts[id]['text'],sourceRunIds=[r['sourceTextId']for r in texts[id]['runs']])for id in[204,205,206]]
assert [t['text']for t in helpTexts]==['Use the function table to make ordered pairs.','The inputs will be x-coordinates, and outputs will be y-coordinates.','Slide the points up or down to match the ordered pairs you make.']
branches=[];quiz=main['frames'][229];root=next(p for p in by['root']['frames'][5]if p['characterId']==223)
for kind in ['right','wrong']:
 for b0 in m['feedback'][kind]:
  b=dict(**b0,kind=kind,key=f"{kind}-{b0['index']}");t=by[f"sprite-{b['spriteId']}"];ids=sorted({p['characterId']for row in t['frames']for p in row if p['characterId']in texts and texts[p['characterId']]['text']});titles={texts[id]['text']for id in ids};assert len(titles)==1
  if kind=='wrong':
   ranges=[[s['first'],s['last']]for s in spans([any(p['characterId']==b['child']for p in row)for row in t['frames']])if s['value']];assert ranges==([[16,22]]if b['spriteId']==186 else[[13,20]])
   b.update(closeFirst=ranges[0][0],closeRanges=ranges)
  parent=next(p for p in quiz if p.get('name',{}).get('text')==f"Mc_{kind.capitalize()}_Feed{b['index']}").copy();parent['matrix']=[*parent['matrix'][:4],100,parent['matrix'][5]];vis=[]
  for row in t['frames']:
   aa=[]
   for p in row:
    if p['characterId']in ids:
     q=box(texts[p['characterId']]['boundsTwips'],p)
     for p2 in[parent,root]:q=box(dict(left=q[0],right=q[1],top=q[2],bottom=q[3]),p2)
     if q[1]>0 and q[0]<16000 and q[3]>0 and q[2]<12000:aa.append(alpha(p))
   vis.append(max(aa,default=0))
  b.update(title=next(iter(titles)),titleIds=ids,titleAlpha=spans(vis),sourceHostX=5,naturallySelected=True);branches.append(b)
overlaySources=[]
for id,targets in [(217,['input-1','input-2']),(218,['axis-x--5']),(219,['axis-x-4']),(220,['output-1','output-2']),(221,['axis-y--2']),(222,['axis-y-3'])]:
 file=B/f'source-v1/ffdec/shapes/{id}.svg';paths=list(E.parse(file).getroot().iter(ns+'path'));assert {p.get('fill')for p in paths}=={'none','#ffffff'}and {p.get('stroke')for p in paths}=={'none','#ffffff'}
 overlaySources.append(dict(sourceShapeId=id,sourceSvgSha256=sha(file.read_bytes()),nativeTargets=targets,role='White glyph fill/stroke under matching duplicate black native text; no added answer marker'))
table=[dict(id=key,sourceTextId=texts[id]['sourceTextId'],characterId=id,text=texts[id]['text'])for key,id in [('input-heading',29),('output-heading',30),('input-1',31),('input-2',32),('output-1',33),('output-2',34)]]
assert [t['text']for t in table]==['Input','Output','–5','4','3','–2']
states=[]
for f,row in enumerate(main['frames'],1):
 assert not any(p.get('clipDepth')for p in row)
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 layers=[dict(sourceShapeId=p['characterId'],matrix=[*p['matrix'][:4],p['matrix'][4]/20,p['matrix'][5]/20],alpha=alpha(p),sourceDepth=p['depth'])for p in sorted(row,key=lambda p:p['depth'])if p['characterId']in graphIds]
 # Source cursor moves in parent coordinates. Retain its exact path/matrix;
 # the bounded native plot clips its off-graph arrival/departure.
 states.append(dict(questionAlpha=alpha(find(19)),questionOffset=(find(19)['matrix'][5]+3998)/20 if find(19)else 0,terms=[term for id,term in[(24,'Graph'),(25,'Linear function'),(26,'Table'),(27,'Point')]if alpha(find(id))>0],termFlash=[term for id,term in[(62,'Graph'),(63,'Linear function'),(64,'Table'),(70,'Point')]if alpha(find(id))>0],tableVisible=bool(find(29)),graphVisible=bool(find(46)),graphLayers=layers,whiteHaloTargets=[key for overlay in overlaySources if find(overlay['sourceShapeId'])for key in overlay['nativeTargets']],overlayShapeIds=[o['sourceShapeId']for o in overlaySources if find(o['sourceShapeId'])],doneOutlineVisible=f>=11))
assert states[9]['tableVisible']==False and states[10]['tableVisible']==True
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],question=texts[19]['text'],doneInstruction=texts[22]['text'],table=table,branches=branches,helpTexts=helpTexts,helpTerms=['Function table','Input','X-coordinate','Ordered pair','Output','Y-coordinate','Point'],graph=dict(viewBox=[-140,-110,330,325],labels=labels,shapes=graphShapes),overlaySources=overlaySources,visualStates=spans(states),nativeDisposition={'graph':'Exact original vector paths, transformations and depth order; native 43 axis labels. The 4 separate empty Done-outline paths are replaced by a native disabled/active Done button. Min-width native plot scrolls horizontally instead of shrinking text.','drag':'Same source coordinates, clamp bounds, AABB hit test, sequential x-only snap, initial points and source predicate. Native focusable point controls add arrow-key movement and pointer capture; no new source answer.','demo':'Source59 includes initial line/points; source68 then1/69 animate the right point and red segment103-130. Source65 pointer path retained with graph-bounded clipping.','question':'Source19 slides/fades1-9; four linked words retain exact magenta flash schedule. Native body reflows with intact words.','postquiz':'Dynamic user line and both handles remain disabled after source231 through353; input/output and matching axis numbers receive white halos from outlined glyph217-222.','help':'Three complete source paragraphs and seven glossary terms; static Close202 controls parent popup visibility.','feedback':'Fresh random 3/4 choice per Done call from conditional historical host. Wrong sprites186/200 retain Close16/13, held22/20 and exit23/21; any number of wrong exits restores drag. Native feedback cards replace decorative globe/star/particles/sign art without claiming Flash visuals.','tail':'Source109 trailing386 bytes retained, excluded after End by both tag extractors. Original runtime remains separately unverified.','language':'English authored teaching content preserved on both locales; original Spanish audio remains explicitly triggered. Source glossary dictionaries provide bilingual definitions.'},registered=False,originalRuntimeAccepted=False)
p=B/'native-v1/teaching-visual-source-v1.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(result['visualStates']),labels=len(labels),shapes=len(graphShapes),branches=[dict(key=b['key'],sprite=b['spriteId'],closeFirst=b.get('closeFirst'))for b in branches],haloSpans=[s for s in spans([r['whiteHaloTargets']for r in states])if s['value']])))
