from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re,math
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-182');texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']==3 for q in masks);clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
 for q in masks:
  b=box(bounds[q['characterId']],q);clip=[max(clip[0],b[0]),min(clip[1],b[1]),max(clip[2],b[2]),min(clip[3],b[3])]
 out='';x=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
# Exact source grid extents; source outlined glyphs are replaced by reviewed native roles.
# Stroke-only grid/curve geometry stays byte-derived. Pink cell compound fills contain
# holes shaped like glyphs, so a plain source-color grid rectangle replaces that fill.
specs=[dict(answer=1,letter='A',shape=24,letterId=25,paths=[3,4,5],arrow=5,curve=26,curvePaths=[0],rect=[-76,-51.65,135.85,135.6],origin=[-8.5,16.95],depth=57),dict(answer=2,letter='B',shape=19,letterId=21,paths=[3,4,5,6],arrow=5,rect=[-185.05,20.85,136.1,135.65],origin=[-117.55,89.45],depth=32),dict(answer=3,letter='C',shape=22,letterId=23,paths=[3,4,5,6],arrow=5,rect=[33.05,-131.15,136.1,135.65],origin=[100.55,-62.55],depth=48),dict(answer=4,letter='D',shape=17,letterId=18,paths=[3,4,5,6],arrow=6,rect=[33.05,23.85,136.1,135.65],origin=[100.55,92.45],depth=30)]
graphs=[]
for g in specs:
 p=B/f"source-v1/ffdec/shapes/{g['shape']}.svg";r=E.parse(p).getroot();ps=list(r.iter(ns+'path'));paths=[]
 for i in g['paths']:
  attrs={k:v for k,v in ps[i].attrib.items()if not k.startswith('{')};assert attrs.get('fill')=='none';paths.append(dict(sourceShapeId=g['shape'],sourcePathIndex=i,attributes=attrs))
 # Exact arrow contours are shared by the source's black fill path; fill only
 # the independently exported arrow stroke contour to avoid outlined text.
 paths.append(dict(sourceShapeId=g['shape'],sourcePathIndex=g['arrow'],attributes={**{k:v for k,v in ps[g['arrow']].attrib.items()if not k.startswith('{')},'fill':'#000000'}))
 if 'curve'in g:
  cp=B/f"source-v1/ffdec/shapes/{g['curve']}.svg";cps=list(E.parse(cp).getroot().iter(ns+'path'));paths.extend(dict(sourceShapeId=g['curve'],sourcePathIndex=i,attributes=dict(cps[i].attrib))for i in g['curvePaths'])
 x,y,w,h=g['rect'];ox,oy=g['origin'];labels=[]
 for n in [-6,-4,-2,2,4,6]:labels.append(dict(text=str(n),x=ox+n*w/12,y=oy+5,role='x-'+str(n),sourceShapeId=g['shape'],sourcePathIndex=1))
 for n in [-6,-4,-2,2,4,6]:labels.append(dict(text=str(-abs(n)),x=ox-6,y=oy-n*h/12,role='y-'+str(n),sourceShapeId=g['shape'],sourcePathIndex=1))
 labels.extend([dict(text='x',x=x+w+13,y=oy+6,role='axis-x',sourceShapeId=g['shape'],sourcePathIndex=1),dict(text='y',x=ox-6,y=y-14,role='axis-y',sourceShapeId=g['shape'],sourcePathIndex=1)])
 graphs.append(dict(**g,sourcePaths=paths,labels=labels,svgSha256=sha(p.read_bytes()),viewBox=[x-15,y-22,w+40,h+40],letterSourceTextId=texts[g['letterId']]['sourceTextId']))
states=[]
for f,row in enumerate(main['frames'],1):
 bydepth={p['depth']:p for p in row};definition,question,reminder=[prefix(row,id)for id in[6,12,14]];visible=' '.join([definition,question,reminder]).lower();active=[g['term']for g in m['glossary']if any(p['characterId']==g['characterId']for p in row)and g['term'].lower()in visible];a=bydepth.get(57)
 states.append(dict(definition=definition,question=question,reminder=reminder,terms=active,graphAlpha={g['letter']:alpha(bydepth.get(g['depth']))for g in graphs},aPose=None if not a else a['matrix'],aMove=0 if not a else (a['matrix'][4]+2244)/2200,aScale=1 if not a else a['matrix'][0]))
branches=[]
rootPose=next(p for p in m['timelines'][0]['frames'][5]if p['characterId']==182)
for b in m['branches']:
 t=next(t for t in m['timelines']if t['timelineId']=='sprite-'+str(b['spriteId']));ids=list(dict.fromkeys(p['characterId']for r in t['frames']for p in r if p['characterId']in texts and texts[p['characterId']].get('runs')));titles=[texts[id]['text']for id in ids];assert len(set(titles))==1,(b,titles);mp=next(p for p in main['frames'][203]if p['characterId']==b['spriteId']);vis=[]
 for row in t['frames']:
  aa=[]
  for p in row:
   if p['characterId']in ids:
    q=box(texts[p['characterId']]['boundsTwips'],p);x=mp['matrix'][4]+rootPose['matrix'][4];y=mp['matrix'][5]+rootPose['matrix'][5]
    if q[1]+x>0 and q[0]+x<16000 and q[3]+y>0 and q[2]+y<12000:aa.append(alpha(p))
  vis.append(max(aa,default=0))
 branches.append(dict(**b,title=titles[0],titleIds=ids,titleAlpha=spans(vis)))
streams=json.loads((B/'native-v1/streams-v1.json').read_text());ds=json.loads((B/'native-v1/decode-native-v2.json').read_text());assert ds['pass'];clocks=[]
for d in ds['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 if d['spriteId']==90:
  assert d['sampleRate']==22050 and d['decodedSamples']==23870;segments=[dict(firstFrame=2,firstDecodedSample=math.ceil(459*22050/5512),endDecodedSample=d['decodedSamples'])];empty=[];count=25
 else:
  s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples'];segments=s['segments'];count=s['frameCount'];empty=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=count,decoder=decoder,segments=segments,emptyNegativeBlocks=empty))
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=182,mainFrameCount=296,quizFrame=204,correctAnswer=1,answerCharacters=m['answerCharacters'],answers=[{k:a[k]for k in ['answer','letter','characterId','instance','wrongLater','wrongFirst']}for a in m['answers']],behavior=m['behavior'],graphs=graphs,branches=branches,visualStates=spans(states),clocks=clocks,sa=sa,terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),sourceAxisNote='Authored upper y labels are -6/-4/-2; preserve literal signs. Native labels replace outlined path1 glyphs; source stroke geometry unchanged.',sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v1.json';out=json.dumps(native,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(pass_=True,bytes=len(out.encode()),spans=len(native['visualStates']),branchTitles=[b['title']for b in branches],completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[6,12,14]},clocks=len(clocks))))
