from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-86');texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])if 'runs'in t else None}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
# Bound each glyph's actual source outline; advance width includes right bearing.
# Source outline bounds preserve the authored punctuation independently of advance bearings.
glyphBounds={}
for font in xml.findall('Header/tags/DefineFont2'):
 for i,g in enumerate(font.findall('glyphs/Glyph')):
  x=y=0;points=[]
  for e in g.find('GlyphShape/edges'):
   if e.tag=='ShapeSetup':
    if e.get('x')is not None:x=int(e.get('x'));y=int(e.get('y'));points.append((x,y))
   elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'));points.append((x,y))
   elif e.tag=='CurveTo':
    cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));x=cx+int(e.get('x2'));y=cy+int(e.get('y2'));points.extend([(cx,cy),(x,y)])
   else:raise AssertionError(e.tag)
  glyphBounds[(int(font.get('objectID')),i)]=dict(left=min(x for x,y in points),right=max(x for x,y in points),top=min(y for x,y in points),bottom=max(y for x,y in points))if points else None
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];assert t['matrix']==[1,0,0,1,0,0];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']in[23]
 clip=box(bounds[masks[0]['characterId']],masks[0]);out='';x=y=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  if r['yOffsetTwips']is not None:y=r['yOffsetTwips']
  scale=r['fontHeightTwips']/1024
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];gb=glyphBounds[(r['fontId'],g['index'])]
   if gb:
    b=box(dict(left=x+gb['left']*scale,right=x+gb['right']*scale,top=y+gb['top']*scale,bottom=y+gb['bottom']*scale),p)
    if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and t['text'][len(out)].isalnum():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
ns='{http://www.w3.org/2000/svg}'
for id in [23]:
 paths=list(E.parse(B/f'source-v1/ffdec/shapes/{id}.svg').getroot().iter(ns+'path'));assert paths
 for p in paths:assert set(re.findall(r'[A-Za-z]',p.get('d'))) <= set('MLZ'),(id,p.get('d'))

# Validate mathematical roles against individual source runs and source positions.
for id in [17,67,68,75,79,84]:
 t=texts[id];raised=[r for r in t['runs']if r['text']=='2'];assert len(raised)==1
 base=next(r for r in t['runs']if 'y ='in r['text']);assert raised[0]['fontHeightTwips']<base['fontHeightTwips'] and raised[0]['yOffsetTwips']<base['yOffsetTwips']
assert texts[71]['text']=='x' and texts[71]['runs'][0]['fontId']==70
assert [texts[id]['text']for id in[10,11,12,14,15,13,16]]==['Input','Output','–2','–1','0','1','2']
byid={int(t['timelineId'].split('-')[1]):t for t in m['timelines']if t['timelineId']!='root'}
drops=[]
for id,value,allowed in[(40,'0',['Tar_3']),(39,'1',['Tar_2']),(38,'4',['Tar_1','Tar_4']),(37,'4',['Tar_1','Tar_4'])]:
 p=next(p for p in m['namedAtQuiz']if p['characterId']==id);tid=next(p['characterId']for p in byid[id]['frames'][0]if p['characterId']in texts);assert texts[tid]['text']==value
 drops.append(dict(spriteId=id,name=p['name'],textId=tid,value=value,allowedTargets=allowed,sourcePosition=p['matrix'][4:]))
assert [p['sourcePosition'][1]for p in drops]==sorted(p['sourcePosition'][1]for p in drops)
cols=[dict(input='–2',value='4',depths=[46,47,48,50],ids=[67,68,69,72],multiplyDepth=49,steps=['y = x²','y = (–2)²','y = (–2) × (–2)','y = 4']),dict(input='–1',value='1',depths=[51,52,53,55],ids=[67,75,76,77],multiplyDepth=54,steps=['y = x²','y = (–1)²','y = (–1) × (–1)','y = 1']),dict(input='0',value='0',depths=[56,57,58,60],ids=[67,79,80,81],multiplyDepth=59,steps=['y = x²','y = (0)²','y = 0 × 0','y = 0']),dict(input='2',value='4',depths=[61,62,63,65],ids=[67,84,85,72],multiplyDepth=64,steps=['y = x²','y = (2)²','y = 2 × 2','y = 4'])]
states=[]
for frame,row in enumerate(main['frames'],1):
 dp={p['depth']:p for p in row};present=lambda id:any(p['characterId']==id and alpha(p)>0 for p in row)
 paragraphs=[prefix(row,id)for id in [25,34]]
 terms=[term for term,ri,bid in [('Table',1,29),('Output',3,27),('Value',5,28)]if present(bid)and len(paragraphs[0])>=len(''.join(r['text']for r in texts[25]['runs'][:ri+1]).rstrip())]
 stepAlpha=[]
 for c in cols:
  aa=[]
  for depth,id in zip(c['depths'],c['ids']):
   p=dp.get(depth);aa.append(alpha(p)if p and p['characterId']==id else 0)
  mul=dp.get(c['multiplyDepth']);assert (alpha(mul)if mul and mul['characterId']==71 else 0)==aa[2]
  stepAlpha.append(aa)
 states.append(dict(paragraphs=paragraphs,terms=terms,tableAlpha=alpha(dp.get(14)),formulaAlpha=alpha(dp.get(44)),bankAlpha=alpha(dp.get(23))if frame<166 else 1,demonstrationOutputBlink=any(present(id)for id in[31,32,33]),demoCopyVisible=present(35),demoProgress=next(((3026-p['matrix'][4])/2760 for p in row if p['characterId']==35),0),demoCursorAlpha=max((alpha(p)for p in row if p['characterId']==30),default=0),stepAlpha=stepAlpha,emphasis={'input-2':present(64),'output4-negative':present(65),'input-1':present(73),'output1':present(74),'input0':any(p['characterId']==78 and p['matrix'][4]==-1082 for p in row),'output0':any(p['characterId']==78 and p['matrix'][4]!=-1082 for p in row),'input2':present(82),'output4-positive':present(83)}))
for c in cols:
 c['sourceText']=[texts[id]['text']for id in c['ids']];c['multiplySourceId']=71
 c['firstVisible']=[next(f for f,s in enumerate(states,1)if s['stepAlpha'][cols.index(c)][k]>0)for k in range(4)]
 c['fullAlpha']=[next(f for f,s in enumerate(states,1)if s['stepAlpha'][cols.index(c)][k]==1)for k in range(4)]
result=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],rows=[dict(input=i,output=o,target=t)for i,o,t in[('–2','4','Tar_1'),('–1','1','Tar_2'),('0','0','Tar_3'),('1','1',None),('2','4','Tar_4')]],drops=drops,columns=cols,visualStates=spans(states),completeTextFrames={id:next((i+1 for i,row in enumerate(main['frames'])if prefix(row,id)==texts[id]['text'].rstrip()),None)for id in[25,34]},termFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},hint=texts[57]['text'],nativeDisposition={'masks':'Exact glyph-outline clipping through source rectangle23; whole-word paragraph reveal.','exponents':'Source-raised smaller2 in17,67,68,75,79,84 uses semantic native superscript.','multiplication':'Separate source71 x glyph lies between both factors, verified in source final render; semantic multiplication uses ×.','table':'Five input rows; authored output1 at input1 is prefilled. Four draggable values0,1,4,4 retain separate identities, both4 tiles may satisfy Tar1 orTar4.','demonstration':'Source35 copies output1 from bank to the input−1 target and back. Progress uses source x3026→266 over frames128–165; native endpoints follow current table and bank layout. Source30 pointer alpha is retained.','popup':'Static source57 hint retained; missing dynamic txtFeed is not invented. Source54 closes popup without stopping the wrong coach.','enableButton':'Page contains terminal parent.enableButton calls without a local definition; preserve correct-drop locking and available remaining tiles. Do not introduce unsupported global lock or skip.'},originalRuntimeAccepted=False,registered=False)
assert all(result['completeTextFrames'].values())
p=B/'native-v1/teaching-visual-source-v2.json';out=json.dumps(result,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(completeTextFrames=result['completeTextFrames'],terms=result['termFirst'],visualSpans=len(result['visualStates']),columns=[dict(input=c['input'],first=c['firstVisible'],full=c['fullAlpha'])for c in cols],drops=drops,registered=False)))
