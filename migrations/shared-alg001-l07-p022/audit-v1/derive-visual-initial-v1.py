from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys,re
B=Path(__file__).resolve().parents[1];m=json.loads((B/'native-v1/source-model-v1.json').read_text());main=m['timelines'][1];texts={t['characterId']:{**t,'text':''.join(r['text'] for r in t['runs'])}for t in m['texts']};xml=E.parse(B/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest()
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):return max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
def box(b,p):
 a,b_,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,b_*x+d*y+f)for x in [b['left'],b['right']]for y in [b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def prefix(row,id):
 p=next((p for p in row if p['characterId']==id),None)
 if not p or not alpha(p):return ''
 t=texts[id];masks=[q for q in row if q.get('clipDepth')and q['depth']<p['depth']<=q['clipDepth']];assert len(masks)==1 and masks[0]['characterId']==2
 clip=box(bounds[2],masks[0]);out='';x=0;end=False
 for r in t['runs']:
  if r['xOffsetTwips']is not None:x=r['xOffsetTwips']
  for g in r['glyphs']:
   nx=x+g['advanceTwips'];b=box(dict(left=x,right=nx,top=t['boundsTwips']['top'],bottom=t['boundsTwips']['bottom']),p)
   if not(b[0]>=clip[0]and b[1]<=clip[1]and b[2]>=clip[2]and b[3]<=clip[3]):end=True;break
   out+=g['unicode'];x=nx
  if end:break
 if out!=t['text']and len(out)<len(t['text'])and not t['text'][len(out)].isspace():out=out.rsplit(' ',1)[0]if' 'in out else''
 return out.rstrip()
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
def pose(p):return dict(sourceCharacterId=p['characterId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'],instanceId=p['instanceId'])
# Explicit source identity for each equation and the overlaid glyph fragments.
eqs=[dict(characterId=id,row=row,column=col,text=texts[id]['text'],sourceTextId=texts[id]['sourceTextId'])for id,row,col in [(12,0,0),(13,0,1),(14,1,0),(15,1,1),(16,2,0),(17,2,1)]]
# Each tuple binds the actual source fragment to its base equation and term role.
overlayMap={22:(12,'x'),23:(14,'x'),24:(16,'x'),25:(13,'x'),26:(17,'x'),28:(12,'constant'),29:(14,'constant'),30:(17,'constant'),31:(15,'constant'),32:(13,'constant')}
for id,(eq,role)in overlayMap.items():assert texts[id]['text'].replace(' ','')in texts[eq]['text'].replace(' ','')
states=[];overlayEvidence=[]
for frame,row in enumerate(main['frames'],1):
 byid={p['characterId']:p for p in row};paragraphs=[prefix(row,id)for id in[5,19]]
 terms=[]
 for g in m['glossary']:
  if g['characterId']not in byid:continue
  paragraph=paragraphs[0 if g['characterId']<20 else 1].lower();pattern=r'\b'+re.escape(g['term'].lower())+('s?'if g['term']=='Term'else'')+r'\b'
  if re.search(pattern,paragraph):terms.append(g['term'])
 equations=[]
 for eq in eqs:
  p=byid.get(eq['characterId']);emphasis=[]
  for q in row:
   cid=q['characterId'];mapping=overlayMap.get(cid)
   if cid==27 and p and abs(q['matrix'][4]-p['matrix'][4])<2 and abs(q['matrix'][5]-p['matrix'][5])<6:mapping=(eq['characterId'],'y')
   if mapping and mapping[0]==eq['characterId']:
    assert p and alpha(p)>0
    # Confirm fragment baseline and placement fall inside that equation, allowing a glyph-spacing tolerance.
    qb=box(texts[cid]['boundsTwips'],q);pb=box(texts[eq['characterId']]['boundsTwips'],p)
    assert abs(q['matrix'][5]-p['matrix'][5])<6 and qb[0]>=pb[0]-20 and qb[1]<=pb[1]+20
    emphasis.append(dict(role=mapping[1],sourceTextId=texts[cid]['sourceTextId'],text=texts[cid]['text'],color=texts[cid]['runs'][0]['colorRgba'],**pose(q)))
    overlayEvidence.append(dict(frame=frame,equationCharacterId=eq['characterId'],overlayCharacterId=cid,role=mapping[1],equationBox=pb,overlayBox=qb))
  equations.append(dict(**eq,alpha=alpha(p),instanceId=p['instanceId']if p else None,emphasis=emphasis))
 annotations=[]
 for label,arrow,target,kind in [(33,34,15,'no-x-term'),(35,36,16,'no-constant-term')]:
  p=byid.get(label);q=byid.get(arrow)
  annotations.append(dict(kind=kind,equationCharacterId=target,text=texts[label]['text'],sourceTextId=texts[label]['sourceTextId'],label=pose(p)if p else None,arrow=pose(q)if q else None))
 states.append(dict(paragraphs=paragraphs,terms=terms,tableAlpha=alpha(byid.get(11)),equations=equations,annotations=annotations))
stream=json.loads((B/'native-v1/streams-v1.json').read_text())[0];decode=json.loads((B/'native-v1/decode-native-v1.json').read_text());d=next(d for d in decode['streams']if d['spriteId']==37);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==stream['sourceSha256']and d['decodedSamples']==stream['decodedSamplesCandidate']and all(d['contextClosed']for d in decode['streams'])
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-37',firstFrame=1,frameCount=341,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=stream['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in stream['blocks']if b['samples']==0 and b['seek']<0]);assert not clock['emptyNegativeBlocks']
vectors=[]
for id in [11,34,36]:
 p=B/f'source-v1/ffdec/shapes/{id}.svg';r=E.parse(p).getroot();vectors.append(dict(sourceShapeId=id,svgSha256=sha(p.read_bytes()),paths=[n.attrib for n in r.iter('{http://www.w3.org/2000/svg}path')]))
native=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,rootFrameCount=10,rootEntryFrame=6,mainSpriteId=37,mainFrameCount=341,title='Identifying Linear Functions',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((B/'native-v1/glossary-model-v1.json').read_text())['entries'],equations=eqs,vectors=vectors,clockPlan=clock,sa={k:sa[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in ['characterId','sourceTextId','text','sourceTagSha256']}for t in texts.values()],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
summary=dict(status='pass',sourceFrames=len(states),spans=len(native['visualStates']),overlayChecks=len(overlayEvidence),completeTextFrames={id:next((i+1 for i,r in enumerate(main['frames'])if prefix(r,id)==texts[id]['text'].rstrip()),None)for id in[5,19]},termsFirst={g['term']:next(i+1 for i,s in enumerate(states)if g['term']in s['terms'])for g in m['glossary']},emphasisFrames={role:[i+1 for i,s in enumerate(states)if any(any(e['role']==role for e in q['emphasis'])for q in s['equations'])]for role in ['x','y','constant']})
for name,value in [('native-v1/visual-model-v1.json',native),('audit-v1/visual-derivation-v1.json',dict(**summary,overlayEvidence=overlayEvidence))]:
 out=json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n';p=B/name
 if '--check'in sys.argv:assert p.read_text()==out
 else:p.write_text(out)
print(json.dumps(summary))
