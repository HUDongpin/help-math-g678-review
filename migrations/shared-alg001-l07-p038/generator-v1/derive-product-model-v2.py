from pathlib import Path
import json,hashlib,sys,math
B=Path(__file__).resolve().parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');v=J('teaching-visual-source-v2.json');streams=J('streams-v1.json');decoded=J('decode-native-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest()
assert m['source']['sha256']==v['sourceSha256']=='7fc50c309dc274fb4a21510710f58433294d925c6a916f306725f7441c8e0b1e'
assert sha((B/'source-v1/L7IN19.swf').read_bytes())==m['source']['sha256'];assert decoded['pass'] and len(decoded['streams'])==9
clocks=[];sa=None
for d in decoded['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256'] and s['decodedSamplesCandidate']==d['decodedSamples'];count=s['frameCount'];segments=s['segments'];empty=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=count,decoder=decoder,segments=segments,emptyNegativeBlocks=empty))
assert len(clocks)==8 and sa['sourceSha256']==m['spanishAudio']['sha256']
texts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs'])if 'runs'in t else None,sourceTagSha256=t['sourceTagSha256'])for t in m['texts']]
answers=[]
for a in v['answers']:
 msg=m['findings']['wrongMessages'].get(str(a['characterId']))
 answers.append(dict(**a,wrongFirst=msg['first']if msg else None,wrongLater=msg['later']if msg else None))
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=243,mainFrameCount=509,quizFrame=117,postQuizFrame=118,correctAnswer=1,answers=answers,branches=v['branches'],visualStates=v['visualStates'],graphs=v['graphs'],table=v['table'],nativeDisposition=v['nativeDisposition'],clocks=clocks,sa=sa,terms=J('glossary-model-v1.json')['entries'],sourceTexts=texts,title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=9,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/9.svg').read_bytes()),behavior=m['findings'],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert len(model['branches'])==7 and all(b['naturallySelected']for b in model['branches'])
p=B/'native-v1/visual-model-v2.json';out=json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(model['visualStates']),clocks=8,decodedWithSpanish=9,branches=7,sourceTextCount=len(texts),registered=False)))
