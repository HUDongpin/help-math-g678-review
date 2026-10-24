from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
M=Path(__file__).resolve().parents[1];D=Path('/Volumes/American Dream/.g6l8p18a1/source-extraction-v1');m=json.loads((M/'native-v1/source-model-v1.json').read_text());main=m['timelines'][-1];texts={t['characterId']:t for t in m['texts']};xml=E.parse(M/'source-v1/movie.xml').getroot();sha=lambda b:hashlib.sha256(b).hexdigest();ns='{http://www.w3.org/2000/svg}'
bounds={int(t.get('objectID')):{k:int(v)for k,v in t.find('bounds/Rectangle').attrib.items()}for t in xml.findall('Header/tags/*')if 'Shape'in t.tag and t.find('bounds/Rectangle')is not None}
def alpha(p):
 c=p.get('colorTransform',{});return max(0,min(1,c.get('multiply',[256]*4)[3]/256+c.get('add',[0]*4)[3]/255))
def box(b,p):
 a,bb,c,d,e,f=p['matrix'];q=[(a*x+c*y+e,bb*x+d*y+f)for x in[b['left'],b['right']]for y in[b['top'],b['bottom']]];return[min(x for x,y in q),max(x for x,y in q),min(y for x,y in q),max(y for x,y in q)]
def native(p):
 t=texts[p['characterId']];b=box(t['boundsTwips'],p);return dict(sourceTextId=t['sourceTextId'],sourceCharacterId=t['characterId'],sourceTagSha256=t['sourceTagSha256'],instanceId=p['instanceId'],depth=p['depth'],matrix=p['matrix'],text=t['text'],x=(b[0]+b[1])/2,y=(b[2]+b[3])/2,bounds=b,alpha=alpha(p),runs=[dict(text=r['text'],colorRgba=r['colorRgba'],fontHeightTwips=r['fontHeightTwips'],xOffsetTwips=r['xOffsetTwips'],yOffsetTwips=r['yOffsetTwips'])for r in t['runs']])
def spans(values):
 out=[]
 for f,v in enumerate(values,1):
  if out and out[-1]['value']==v:out[-1]['last']=f
  else:out.append(dict(first=f,last=f,value=v))
 return out
roles={2:'outer demonstration boundary',11:'first grid and axes',34:'first red line',36:'first arrowheads and blue points',39:'second grid and axes',40:'second red line',41:'second arrowheads and blue points',43:'third grid, axes and red line',44:'third arrowheads and blue points',46:'two derivation column separators'}
shapes=[]
for id,role in roles.items():
 p=D/f'ffdec/shapes/{id}.svg';paths=[n.attrib for n in E.parse(p).getroot().iter(ns+'path')];assert paths;shapes.append(dict(sourceShapeId=id,role=role,svgSha256=sha(p.read_bytes()),boundsTwips=bounds[id],paths=paths))
axisIds=set(range(12,34))|{35};equationIds={37,38,42,45,47,48,49,50,55,56,57,58,59};allids=set(roles)|axisIds|equationIds|{3,5,7,8,9,10,51,52,53,54};states=[]
for frame,row in enumerate(main['frames'],1):
 for p in row:
  assert p['characterId']in allids,p['characterId'];assert not p.get('clipDepth');c=p.get('colorTransform',{});assert c.get('multiply',[256]*4)[:3]==[256]*3 and c.get('add',[0]*4)[:3]==[0]*3
 byid={p['characterId']:p for p in row};para=native(byid[5]);axis=[native(p)for p in row if p['characterId']in axisIds];equations=[native(p)for p in row if p['characterId']in equationIds and not(p['characterId']==37 and 45 in byid)]
 fractions=[]
 for ndepth,ddepth,bar in [(183,184,51),(186,187,54)]:
  numerator=next((p for p in row if p['depth']==ndepth),None);denominator=next((p for p in row if p['depth']==ddepth),None)
  if numerator:
   assert numerator['characterId']==52 and denominator['characterId']==53 and bar in byid
   n=native(numerator);d=native(denominator);b=box(bounds[bar],byid[bar]);assert n['text']=='1'and d['text']=='2'and n['y']<d['y'] and n['alpha']==d['alpha']==alpha(byid[bar]);fractions.append(dict(sourceTextIds=[n['sourceTextId'],d['sourceTextId']],sourceCharacterIds=[52,53],sourceBarId=bar,instanceId=n['instanceId'],numerator='1',denominator='2',x=(b[0]+b[1])/2,y=(n['y']+d['y'])/2,alpha=n['alpha'],sourcePositions=[n,d],barBounds=b))
 vectors=[dict(sourceShapeId=p['characterId'],instanceId=p['instanceId'],matrix=p['matrix'],alpha=alpha(p),depth=p['depth'])for p in row if p['characterId']in roles]
 terms=[g['term']for g in m['glossary']if g['characterId']in byid and alpha(byid[g['characterId']])>0]
 states.append(dict(paragraph=para,terms=terms,axisLabels=axis,equations=equations,fractions=fractions,vectors=vectors))
assert len(states)==220 and len(states[29]['axisLabels'])==129
assert [i+1 for i,s in enumerate(states)if any(e['sourceCharacterId']==45 for e in s['equations'])]==[61,63,65,67,69,71]
assert all(v['alpha']==0 for s in states[86:]for v in s['vectors']if v['sourceShapeId']in{11,34,36,39,40,41,43,44})
assert len(states[172]['fractions'])==2 and all(f['alpha']==0 for f in states[172]['fractions'])and all(f['alpha']==1 for f in states[178]['fractions'])
streams=json.loads((M/'native-v1/streams-v1.json').read_text());decode=json.loads((M/'native-v1/decode-native-v1.json').read_text());assert decode['pass']and all(d['contextClosed']for d in decode['streams']);assert len(streams)==1;s=streams[0];d=next(d for d in decode['streams']if d['spriteId']==60);sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate'];assert [s['firstFrame']for s in s['segments']]==[11,13]
clock=dict(version=1,sourceSwfSha256=m['source']['sha256'],frameDomain='sprite-60',firstFrame=1,frameCount=220,fps=12,playbackMode='loop',alignmentStatus='source-run-candidate-not-original-runtime-accepted',decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0])
nativeModel={k:m[k]for k in['animationId','fps','rootFrameCount','rootEntryFrame','mainSpriteId','mainFrameCount','behavior']};nativeModel.update(sourceSha256=m['source']['sha256'],title='Graphing Linear Equations: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((D/'ffdec/shapes/1.svg').read_bytes()),visualStates=spans(states),terms=json.loads((M/'native-v1/glossary-model-v1.json').read_text())['entries'],diagram=dict(viewBox=[-7650,-3150,15300,7200],shapes=shapes,semanticReplacements=[dict(sourceShapeId=3,role='blue glossary underlines represented by semantic glossary controls',sha256=sha((D/'ffdec/shapes/3.svg').read_bytes())),*[dict(sourceShapeId=id,role='native MathML half-fraction bar',sha256=sha((D/f'ffdec/shapes/{id}.svg').read_bytes()))for id in[51,54]]]),clockPlan=clock,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},sourceTexts=[{k:t[k]for k in['characterId','sourceTextId','text','sourceTagSha256']}for t in m['texts']],independentPending=['original-runtime','fidelity','listening','human','Owner','full-typography','full-accessibility','performance','strict','publication'])
p=M/'native-v1/visual-model-v1.json';out=json.dumps(nativeModel,ensure_ascii=False,separators=(',',':'))+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,frames=220,spans=len(nativeModel['visualStates']),nativeAxisLabels=129,shapes=len(shapes),sourceTextDefinitions=len(texts),equationVisibleFrom={str(id):next(i+1 for i,s in enumerate(states)if any(e['sourceCharacterId']==id and e['alpha']>0 for e in s['equations']))for id in sorted(equationIds)},termsVisibleFrom=2,streamRuns=[11,13],registered=False)))
