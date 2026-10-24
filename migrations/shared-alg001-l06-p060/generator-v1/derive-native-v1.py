"""Readable source-owned quiz content; all curves retain extracted geometry."""
from pathlib import Path
import hashlib,json,re,sys,xml.etree.ElementTree as ET
M=Path(__file__).resolve().parents[1];R=M.parents[1];E=Path('/Volumes/American Dream/hudongpin/g678-p060-source-extraction-20261003-v1/ffdec-export')
sha=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':sha(b)}
def svg_commands(path):
 tokens=re.findall(r'[MLQZ]|-?\d+(?:\.\d+)?',path);i=0;cmd=None;x=y=0;start=(0,0);out=[]
 while i<len(tokens):
  if tokens[i]in 'MLQZ':cmd=tokens[i];i+=1
  if cmd=='Z':x,y=start;cmd=None;continue
  assert cmd in ['M','L','Q'];n=4 if cmd=='Q'else 2;v=list(map(float,tokens[i:i+n]));i+=n
  if cmd=='Q':out.append([x,y,*v])
  x,y=v[-2:]
  if cmd=='M':start=(x,y);cmd='L'
 return out
def build():
 mp=M/'native-v1/source-model-v1.json';m=json.loads(mp.read_text());assert pin(mp)['sha256']=='6e5422eb24aeac0d76138d1733b3d1fd22650cfba51f14ecf0e7258ab4f373a1'
 ex=json.loads((M/'audit-v1/source-extraction-v1.json').read_text());xml=Path(ex['xml']['path']);assert pin(xml)==ex['xml'];tags=ET.parse(xml).getroot().find('Header/tags');inputs=[pin(mp),pin(xml)];questions=[];geometry=[]
 def shapes(placements):
  out=[]
  for d in placements:
   sid=d['objectId'];p=E/f'shapes/{sid}.svg';meta=next(r for r in ex['files']if r['path']==f'shapes/{sid}.svg');assert pin(p)['sha256']==meta['sha256'];inputs.append(pin(p));svg=ET.parse(p).getroot();paths=[];curves=[]
   for n in svg.iter('{http://www.w3.org/2000/svg}path'):
    assert set(n.attrib)<=set(['d','fill','fill-rule','stroke','stroke-linecap','stroke-linejoin','stroke-width','{https://www.free-decompiler.com/flash}has-small-stroke','{https://www.free-decompiler.com/flash}original-stroke-width'])
    a={k:v for k,v in n.attrib.items()if not k.startswith('{')}
    if '{https://www.free-decompiler.com/flash}original-stroke-width'in n.attrib:a['stroke-width']=n.attrib['{https://www.free-decompiler.com/flash}original-stroke-width']
    paths.append(a);curves.extend(svg_commands(a['d']))
   node=next(t for t in tags if t.get('objectID')==str(sid));x=y=0;raw=[]
   for e in node.find('shapes/Shape/edges'):
    if e.tag=='ShapeSetup':
     if e.get('x')is not None:x=int(e.get('x'));y=int(e.get('y'))
    elif e.tag=='LineTo':x+=int(e.get('x'));y+=int(e.get('y'))
    elif e.tag=='CurveTo':
     cx=x+int(e.get('x1'));cy=y+int(e.get('y1'));nx=cx+int(e.get('x2'));ny=cy+int(e.get('y2'));raw.append([x,y,cx,cy,nx,ny]);x,y=nx,ny
    else:raise AssertionError(e.tag)
   actual={tuple(round(v*20)for v in c)for c in curves};expected={tuple(c)for c in raw};reverse={tuple([c[4],c[5],c[2],c[3],c[0],c[1]])for c in raw}
   assert actual<=expected|reverse,(sid,actual-expected-reverse)
   assert all(c in actual or (c[4],c[5],c[2],c[3],c[0],c[1])in actual for c in expected),(sid,'missing curve')
   geometry.append({'shapeId':sid,'svgQuadraticOccurrences':len(curves),'xmlQuadraticEdges':len(raw),'allCurvesIndependentlyCrosschecked':True})
   matrix=d['matrixTwips'];out.append({'shapeId':sid,'matrix':[matrix[k]for k in ['scaleX','skewY','skewX','scaleY']]+[matrix['transX']/20,matrix['transY']/20],'paths':paths})
  return out
 for q in m['questions']:
  qid=q['id'];draw=q['questionDrawing'];text=[d for d in draw if d['kind']in ['DefineText','DefineEditText']and d['ownerName']is None]
  prompt=next(d for d in text if d['boundsPx'][0]<80 and len(d['text'])>30);options=[]
  for opt in q['options']:
   values=[d for d in draw if d['kind']=='DefineText'and d['ownerName']==opt['sourceInstance']and d['text'].strip()!=opt['letter']];assert len(values)==1
   options.append({**{k:v for k,v in opt.items()if k!='handler'},'value':values[0]['text'].strip(),'textId':values[0]['textId']})
  formula=None;promptBefore=prompt['text'];promptAfter='';used={prompt['textId']}
  if qid<=4:
   base=next(d for d in text if d['text'].startswith('y ='));digits=sorted([d for d in text if d is not base and d is not prompt],key=lambda d:d['boundsPx'][1]);assert len(digits)==2
   formula={'prefix':'y = ','numerator':digits[0]['text'],'denominator':digits[1]['text'],'suffix':re.sub(r'^y =\s+','',base['text']),'sourceTextIds':[base['textId'],*[d['textId']for d in digits]]};used.update(formula['sourceTextIds'])
  elif qid<=7:
   digits=sorted([d for d in text if d is not prompt],key=lambda d:d['boundsPx'][1]);assert len(digits)==2
   match=re.search(r't =\s+\+ \d+',prompt['text']);assert match
   formula={'prefix':'t = ','numerator':digits[0]['text'],'denominator':digits[1]['text'],'suffix':re.search(r'\+ \d+',match[0])[0],'sourceTextIds':[prompt['textId'],*[d['textId']for d in digits]],'inline':True};promptBefore=prompt['text'][:match.start()];promptAfter=prompt['text'][match.end():];used.update(formula['sourceTextIds'])
  elif 13<=qid<=16:
   base=next(d for d in text if d['text'].startswith('y ='));formula={'plain':base['text'],'sourceTextIds':[base['textId']]};used.add(base['textId'])
  table=None
  if 13<=qid<=20:
   cells=[d for d in text if d['textId']not in used and d['boundsPx'][0]<410];rows=[]
   for c in sorted(cells,key=lambda d:d['boundsPx'][1]):
    y=(c['boundsPx'][1]+c['boundsPx'][3])/2
    row=next((r for r in rows if abs(r['y']-y)<6),None)
    if row is None:row={'y':y,'cells':[]};rows.append(row)
    row['cells'].append(c)
   assert len(rows)==(4 if qid<17 else 6)
   for row in rows:row['cells'].sort(key=lambda d:d['boundsPx'][0]);assert len(row['cells'])==2
   table={'headers':[d['text']for d in rows[0]['cells']],'rows':[[{'value':d['text'],'textId':d['textId']}for d in r['cells']]for r in rows[1:]],'headerTextIds':[d['textId']for d in rows[0]['cells']]};assert table['headers']==['x','y'];used.update(d['textId']for d in cells)
  graph=None
  if qid>=17:
   graphIds={17:[325,332],18:[348,349],19:[361,362],20:[374,375],21:[387,399],22:[419,421],23:[437,399],24:[449,421]}[qid]
   placements=[d for d in draw if d['kind']=='shape'and d['objectId']in graphIds];assert len(placements)==2
   # Text ownership is by placement, since several labels share one DefineText.
   labels=[d for d in text if d['boundsPx'][0]>=410 and d is not prompt];assert len(labels)==(14 if qid<21 else 11 if qid in [21,23]else 12)
   boxes=[d['boundsPx']for d in placements+labels];left=min(b[0]for b in boxes)-20;top=min(b[1]for b in boxes)-20;right=max(b[2]for b in boxes)+20;bottom=max(b[3]for b in boxes)+20
   nativeLabels=[]
   for d in labels:
    box=d['boundsPx'];cx=(box[0]+box[2])/2;cy=(box[1]+box[3])/2;align='center'
    sourceCenter=[cx,cy]
    if qid<21:
     if 515<cx<542:align='y-tick';cx=placements[0]['boundsPx'][0]+2
     elif 330<cy<342:align='x-tick';cy=placements[0]['boundsPx'][3]+8
    else:
     if box[0]<450:align='y-tick';cx=box[2]-4
     elif box[1]>=425:align='x-tick'
    nativeLabels.append({'text':d['text'],'textId':d['textId'],'center':[cx,cy],'sourceCenter':sourceCenter,'align':align})
   if qid<21:
    left=min(left,*[l['center'][0]-36 for l in nativeLabels if l['align']=='y-tick'])
    bottom=max(bottom,*[l['center'][1]+32 for l in nativeLabels if l['align']=='x-tick'])
   graph={'viewBox':[left,top,right-left,bottom-top],'shapes':shapes(placements),'labels':nativeLabels,'semanticKind':'coordinate-function'if qid<21 else 'machine-efficiency'if qid in [21,23]else 'golf-ball-height','numericFunctionInvented':False}
  questions.append({'id':qid,'questionFrame':q['questionFrame'],'reviewFrame':q['reviewFrame'],'promptTextId':prompt['textId'],'sourcePrompt':prompt['text'],'promptBefore':promptBefore,'promptAfter':promptAfter,'formula':formula,'table':table,'graph':graph,'options':options,'answerKey':q['answerKey']})
 return {'sourceSha256':m['sourceSha256'],'sourceModelSha256':pin(mp)['sha256'],'sessionQuestionCount':10,'questions':questions,'geometryChecks':geometry,'inputs':list({p['path']:p for p in inputs}.values()),'sourceLanguage':'en','sourceAxisEInGolfGraphsRetained':True,'originalRuntime':False}
if __name__=='__main__':
 assert sys.argv[1:]in [['--write'],['--check']];d=build();inputs=d.pop('inputs');p=R/'packages/demos/src/generated/alg-l06-p060-native-v1.ts';b=('// Generated from P060 source text, options, tables and original paths. Do not hand-edit.\nexport const P060_NATIVE_SOURCE = '+json.dumps(d,ensure_ascii=False,indent=2)+' as const;\n').encode()
 audit=M/'native-v1/native-derivation-v1.json';ab=(json.dumps({'inputs':inputs,'geometryChecks':d['geometryChecks'],'generated':{'path':str(p.relative_to(R)),'bytes':len(b),'sha256':sha(b)}},indent=2)+'\n').encode()
 if sys.argv[1]=='--write':p.write_bytes(b);audit.write_bytes(ab)
 else:assert p.read_bytes()==b and audit.read_bytes()==ab
 print(json.dumps({'output':pin(p),'questions':len(d['questions']),'graphs':sum(q['graph']is not None for q in d['questions']),'crosschecks':len(d['geometryChecks'])}))
