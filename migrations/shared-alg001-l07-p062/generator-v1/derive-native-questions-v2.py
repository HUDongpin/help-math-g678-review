"""Derive P062 native question roles and retain authored graph geometry.
No AVM execution or original-runtime claim. Review is a separately retained source
lane: Finish/Continue closes the legacy host; no in-page review entry is present.
"""
from pathlib import Path
import json,sys,re,hashlib,xml.etree.ElementTree as E
R=Path(__file__).resolve().parents[3];B=R/'migrations/shared-alg001-l07-p062';D=Path('/Volumes/American Dream/.g6p62a1');N='{http://www.w3.org/2000/svg}'
m=json.loads((D/'source-model-v1.json').read_text());by={t['timelineId']:t for t in m['timelines']};texts={t['characterId']:t for t in m['texts']};xml=E.parse(D/'movie.xml').getroot();defs={int(t.get('objectID')):t for t in xml.find('Header/tags')if t.get('objectID')};bounds={id:{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for id,t in defs.items()if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None};letters={24:'A',32:'B',36:'C',41:'D'};graph_questions=set(range(4,8))|set(range(24,31));audit=json.loads((B/'audit-v1/source-behavior-v1.json').read_text());rows=by['sprite-1383']['frames'];root=m['rootMatrix']
def mul(a,b):return[a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
def flatten(row,mat,path=()):
 out=[]
 for p in row:
  id=p['characterId'];name=(p.get('name')or{}).get('text');pt=(*path,dict(characterId=id,depth=p['depth'],name=name));mx=mul(mat,p['matrix'])
  if id in texts or id in bounds:out.append(dict(characterId=id,matrix=mx,path=pt,kind='text'if id in texts else'shape'))
  elif f'sprite-{id}'in by:
   if id==29:out.append(dict(characterId=id,matrix=mx,path=pt,kind='hit-area'))
   else:out.extend(flatten(by[f'sprite-{id}']['frames'][0],mx,pt))
  else:out.append(dict(characterId=id,matrix=mx,path=pt,kind='control'))
 return out
def box(n):
 b=(texts[n['characterId']]['boundsTwips']if n['kind']=='text'else bounds[n['characterId']]);a,c,d,e,x,y=n['matrix'];points=[((a*i+d*j+x)/20,(c*i+e*j+y)/20)for i in[b['left'],b['right']]for j in[b['top'],b['bottom']]];return[min(x for x,y in points),min(y for x,y in points),max(x for x,y in points),max(y for x,y in points)]
def is_circle(n):
 if n['kind']!='shape':return False
 b=bounds[n['characterId']];return n['characterId']==169 or 520<=b['right']-b['left']<=570 and 520<=b['bottom']-b['top']<=570
pathcache={}
def paths(id):
 if id not in pathcache:pathcache[id]=[{k:v for k,v in p.attrib.items()if k in ['d','fill','fill-opacity','fill-rule','stroke','stroke-opacity','stroke-width']}for p in E.parse(D/f'ffdec/shapes/{id}.svg').getroot().iter(N+'path')];assert pathcache[id]
 return pathcache[id]
def graph(ns):
 assert ns and any(n['kind']=='shape'for n in ns)
 boxes=[box(n)for n in ns];left=min(b[0]for b in boxes)-4;top=min(b[1]for b in boxes)-4;right=max(b[2]for b in boxes)+4;bottom=max(b[3]for b in boxes)+4;labels=[];ss=[]
 for n in ns:
  id=n['characterId'];a,b,c,d,x,y=n['matrix']
  if n['kind']=='shape':ss.append(dict(characterId=id,matrix=[a,b,c,d,x/20,y/20],paths=paths(id),sourcePath=n['path']))
  else:
   t=texts[id];assert t['kind']=='static-text';tm=mul(n['matrix'],t['matrix']);a,b,c,d,x,y=tm;assert b==c==0
   rx=ry=0
   for r in t['runs']:
    if r['xOffsetTwips']is not None:rx=r['xOffsetTwips']
    if r['yOffsetTwips']is not None:ry=r['yOffsetTwips']
    labels.append(dict(characterId=id,sourceTextId=t['sourceTextId'],text=r['text'],x=(x+a*rx)/20,y=(y+d*ry)/20,fontSize=abs(d)*r['fontHeightTwips']/20))
    rx+=sum(g['advanceTwips']for g in r['glyphs'])
 return dict(viewBox=[left,top,right-left,bottom-top],shapes=ss,labels=labels)
def atom(n):return dict(characterId=n['characterId'],sourceTextId=texts[n['characterId']]['sourceTextId'],text=texts[n['characterId']]['text'],path=n['path'],matrix=n['matrix'])
def mathparts(q,o,ns):
 tt=[n for n in ns if n['kind']=='text'and n['characterId']not in letters];atoms=[atom(n)for n in tt];simple=[a['text'].strip()for a in atoms];parts=[]
 if q==1:
  expected=[['y =     –1','x','1'],['y = x –1'],['y = x 2 –1'],['y = x 3 –1']][o-1];assert simple==expected
  parts=([dict(kind='text',text='y = '),dict(kind='fraction',numerator='1',denominator='x'),dict(kind='text',text=' –1')]if o==1 else[dict(kind='text',text='y = x –1')]if o==2 else[dict(kind='text',text='y = '),dict(kind='power',base='x',exponent=str(o-1)),dict(kind='text',text=' –1')])
 elif q==2:
  expected=[['x','y =','4','–'],['x','1','y =','4','–'],['4','y = x','–'],['4','y = x 2 –']][o-1];assert simple==expected
  parts=[dict(kind='text',text='y = '),([dict(kind='radical',radicand='x'),dict(kind='fraction',numerator='1',denominator='x'),dict(kind='text',text='x'),dict(kind='power',base='x',exponent='2')][o-1]),dict(kind='text',text=' –4')]
 elif q==3:
  expected=[['y = x+3'],['y = x 2 +3'],['y = x 3 +3'],['y = x 4 +3']][o-1];assert simple==expected
  parts=[dict(kind='text',text='y = '),dict(kind='text',text='x')if o==1 else dict(kind='power',base='x',exponent=str(o)),dict(kind='text',text=' +3')]
 elif 8<=q<=15:
  # Authored baseline order, not dictionary/character-id order, defines fractions.
  values=[n for n in tt if texts[n['characterId']]['text'].strip()!='–'];negative=any(texts[n['characterId']]['text'].strip()=='–'for n in tt)
  if negative:parts.append(dict(kind='text',text='–'))
  if len(values)==1:parts.append(dict(kind='text',text=texts[values[0]['characterId']]['text'].strip()))
  else:
   assert len(values)==2;values.sort(key=lambda n:box(n)[1]);parts.append(dict(kind='fraction',numerator=texts[values[0]['characterId']]['text'].strip(),denominator=texts[values[1]['characterId']]['text'].strip()));assert abs(box(values[0])[1]-box(values[1])[1])>5
 else:
  assert 16<=q<=23 and len(atoms)==1;parts=[dict(kind='text',text=atoms[0]['text'].strip())]
 return dict(kind='math',parts=parts,sourceAtoms=atoms)
questions=[];ledger=[]
for q in range(1,31):
 row=rows[q];flat=flatten(row,root);prompt_nodes=[n for n in flat if len(n['path'])==1 and n['kind']=='text'and texts[n['characterId']]['kind']=='static-text'and len(texts[n['characterId']]['text'])>20];assert len(prompt_nodes)==1;pn=prompt_nodes[0];prompt=atom(pn);prompt['parts']=[dict(kind='text',text=prompt['text'].strip())]
 if q in[29,30]:
  exponent=str(q-27);assert f'x {exponent}'in prompt['text'];prefix,suffix=prompt['text'].split(f'x {exponent}',1);prompt['parts']=[dict(kind='text',text=prefix),dict(kind='power',base='x',exponent=exponent),dict(kind='text',text=suffix.strip())]
 options=[]
 for o in range(1,5):
  name=f'A{q}Opt{o}';nodes=[n for n in flat if n['path'][0]['name']==name];assert nodes;selected=[n for n in nodes if n['kind']in['text','shape']and n['characterId']not in letters and not is_circle(n)]
  display=dict(kind='graph',graph=graph(selected))if q in graph_questions else mathparts(q,o,nodes)
  options.append(dict(option=o,instance=name,characterId=nodes[0]['path'][0]['characterId'],**display));ledger.extend(dict(question=q,role=f'option-{o}',**n)for n in nodes)
 top=[n for n in flat if len(n['path'])==1 and n['kind']in['text','shape']and not n['path'][0]['name']and n['characterId']not in[17,pn['characterId']]];stimulus=None
 if 4<=q<=7:
  tt=[n for n in top if n['kind']=='text'];tt.sort(key=lambda n:box(n)[0]);left=sorted(tt[:3],key=lambda n:box(n)[1]);right=sorted(tt[3:],key=lambda n:box(n)[1]);assert len(left)==len(right)==3;headers=[texts[a['characterId']]['text'].strip()for a in[left[0],right[0]]];assert headers==['Input','Output'];stimulus=dict(kind='table',headers=headers,rows=[[texts[a['characterId']]['text'].strip(),texts[b['characterId']]['text'].strip()]for a,b in zip(left[1:],right[1:])],sourceAtoms=[atom(n)for n in tt])
 elif 8<=q<=19:stimulus=dict(kind='graph',graph=graph(top))
 else:assert not top,(q,top)
 audioNames=[(p.get('name')or{}).get('text')for p in row];answerAudio=all(f'Mc_Quiz_Audio_{o}'in audioNames for o in range(1,5));assert answerAudio==(q not in graph_questions)
 # Retain independent review visuals. Some graph curves differ from their Q counterpart.
 rf=flatten(rows[q+49],root);rprompt=[n for n in rf if len(n['path'])==1 and n['kind']=='text'and texts[n['characterId']]['kind']=='static-text'and len(texts[n['characterId']]['text'])>20];assert len(rprompt)==1
 review=dict(frame=q+50,prompt=atom(rprompt[0]),audio=False,options=[])
 if q in graph_questions:
  # R option sprites contain colorable graph overlays. Include them with the root
  # graph; omit only dynamic fields, letter circles, labels and table stimulus.
  group=[[]for _ in range(4)]
  for n in rf:
   if n['kind']not in['text','shape']or n['characterId']in[17,rprompt[0]['characterId'],*letters]or is_circle(n):continue
   name=n['path'][0]['name']or''
   if name and not re.fullmatch(f'R{q}Opt[1-4]',name):continue
   if n['kind']=='text'and(texts[n['characterId']]['kind']!='static-text'or texts[n['characterId']]['text']in['Your Answer:','Correct Answer:']):continue
   b=box(n);cx=(b[0]+b[2])/2;cy=(b[1]+b[3])/2
   if 4<=q<=7 and 250<cx<420 and cy<235:continue
   assert 80<cx<640 and 130<cy<475,(q,n['characterId'],b)
   i=(0 if cx<400 else 1)+(0 if cy<320 else 2);group[i].append(n)
  review['options']=[dict(option=i+1,kind='graph',graph=graph(ns))for i,ns in enumerate(group)]
 else:
  # The native formula/text content is independently checked below in the role ledger.
  review['options']=[dict(option=i+1,kind='source-math',sourceAtoms=[atom(n)for n in rf if n['kind']=='text'and n['path'][0]['name']==f'R{q}Opt{i+1}'])for i in range(4)]
 questions.append(dict(id=q,frame=q+1,correct=audit['questions'][q-1]['scoringCorrectOption'],prompt=prompt,stimulus=stimulus,options=options,questionAudio=True,answerAudio=answerAudio,review=review))
 ledger.extend(dict(question=q,role='question-top-level',**n)for n in flat if not(n['path'][0]['name']or'').startswith(f'A{q}Opt'));ledger.extend(dict(question=q,role='review-source',**n)for n in rf)
model=dict(schemaVersion=1,animationId=m['animationId'],sourceSha256=m['source']['sha256'],questions=questions,reviewEntry='No in-page caller; Finish Continue calls legacy close/bookmark. Retained dormant review requires explicit source-bound host entry.',sourceLimits=['Question/review graph differences preserved independently.','Q28-Q30 graph axis labels partly exist as source shape contours; native graph text coverage is partial.','Source Mc_Result has no placement in this SWF; doGetReview writes a missing instance.','No original-runtime execution.'])
def put(p,data):
 if '--check'in sys.argv:assert p.read_bytes()==data,p
 else:p.open('xb').write(data)
b=(json.dumps(model,ensure_ascii=False,separators=(',',':'))+'\n').encode();put(B/'native-v1/questions-v2.json',b);put(B/'audit-v1/native-source-roles-v2.json',(json.dumps(dict(questions=30,roles=ledger),ensure_ascii=False,separators=(',',':'))+'\n').encode());print(json.dumps(dict(questions=30,graphs=sum(4 if q['id']in graph_questions else 1 if q['stimulus']and q['stimulus']['kind']=='graph'else 0 for q in questions),roles=len(ledger),bytes=len(b))))
