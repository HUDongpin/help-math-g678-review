from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,copy
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());c=json.loads((B/'source-v1/source-text-catalog-v1.json').read_text());main=next(t for t in m['timelines']if t['timelineId']=='sprite-80');texts={t['characterId']:t for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape' in t.tag and t.find('bounds/Rectangle') is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth') and q['depth']<p['depth']<=q['clipDepth']];assert all(q['characterId']in [10,50]for q in masks)
 clip=[-float('inf'),float('inf'),-float('inf'),float('inf')]
 for q in masks:
  b=box(bounds[q['characterId']],q);clip=[max(clip[0],b[0]),min(clip[1],b[1]),max(clip[2],b[2]),min(clip[3],b[3])]
 out='';x=0;end=False
 for r in t.get('runs',[]):
  if r['xOffsetTwips'] is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0] and b[1]<=clip[1] and b[2]>=clip[2] and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text'] and len(out)<len(t['text']) and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if ' 'in out else ''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
states=[]
for f,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};a=lambda id:alpha(byid.get(id));shown=lambda id:id in byid and a(id)>0
 definition=prefix(row,12);instruction=prefix(row,42);ending=prefix(row,51);pointer=byid.get(30)
 states.append(dict(definition=definition,instruction=instruction,ending=ending,machineAlpha=a(17)if f<600 else a(53),backgroundAlpha=a(16),form=f>=600,
  input='8'if shown(40)else '4'if shown(34) and byid[34]['matrix'][4]<0 else '',output='4'if shown(34)and byid[34]['matrix'][4]>0 else '1'if shown(35)else '',
  exampleSlope='3/4'if shown(26)else '',exampleIntercept='– 2'if shown(27)else '',exampleAlpha=a(26),
  emphasis={'inputLabel':shown(38),'inputValue':shown(39)or shown(46),'outputLabel':shown(36),'outputValue':shown(37),'slope':shown(47),'intercept':shown(48),'enter':shown(49),'reset':shown(52)},
  pointer={'sourceCharacterId':30,'matrix':pointer['matrix'],'x':max(8,min(90,(pointer['matrix'][4]+6000)/3200*100)),'y':max(8,min(88,(pointer['matrix'][5]+1700)/3500*100))}if pointer else None,
  terms=[g['term']for g in m['glossary']if any(a<=f<=z for a,z in g['frameRanges'])and g['term'].lower()in ((definition if g['term']in ['Input','Output']else instruction).lower())]))
ns={'s':'http://www.w3.org/2000/svg'}
def vector(id,clip):
 p=B/f'source-v1/ffdec-shapes/shapes/{id}.svg';root=E.parse(p).getroot();paths=list(root.iter('{'+ns['s']+'}path'));assert len(paths)==12
 gradients=[dict(attributes=n.attrib,stops=[s.attrib for s in n])for n in root.find('s:defs',ns)];assert all(n.tag=='{'+ns['s']+'}radialGradient'for n in root.find('s:defs',ns))
 return dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=[n.attrib for n in paths[:10]],gradients=gradients,viewBox=clip,omittedPaths=[10,11],omissionReason='Input rectangle represented by native editable input; isolated machine vector unchanged.')
decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());streams=json.loads((B/'native-v1/streams-v1.json').read_text());sa=json.loads((B/'native-v1/sa-native-v1.json').read_text());glossary=json.loads((B/'native-v1/glossary-model-v1.json').read_text());clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['contextClosed']and d['decodedSamples']==s['decodedSamplesCandidate']and d['sourceSha256']==s['sourceSha256'];clocks.append(dict(spriteId=s['spriteId'],sourceFrameCount=s['frameCount'],decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments']))
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=80,mainFrameCount=604,formFrame=600,title='Linear and Nonlinear Functions: Vocabulary',titleSourceShapeId=9,titleSvgSha256=sha((B/'source-v1/ffdec-shapes/shapes/9.svg').read_bytes()),terms=glossary['entries'],visualStates=spans(states),machines=[vector(17,[-196,-136,162,98]),vector(53,[-123,-93,162,98])],clocks=clocks,sa={k:sa['decoder'][k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},hintText=texts[78]['text'],sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
out=json.dumps(native,ensure_ascii=False,separators=(',',':'))+'\n';p=B/'native-v1/visual-model-v1.json'
if '--check'in sys.argv:assert p.read_text()==out
else:p.write_text(out)
print(json.dumps(dict(status="pass",spans=len(native['visualStates']),completeTextFrames={str(id):next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in [12,42,51]},machineRoles='Source shape17/53 with native input rectangle; no authored text discarded',hint='source frame1 visibility only; stream retained but not auto-triggered')))
