from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');v=J('teaching-visual-source-v2.json');streams=J('streams-v1.json');decoded=J('decode-native-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest()
assert m['source']['sha256']==v['sourceSha256']=='f46c9d99df171d468b6c05f8ff9e6afa2908072e955a895fb36144e54003d8d2'
assert sha((B/'source-v1/L7IN15.swf').read_bytes())==m['source']['sha256'];assert decoded['pass'] and len(decoded['streams'])==4
clocks=[];sa=None
for d in decoded['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256'] and s['decodedSamplesCandidate']==d['decodedSamples']
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
assert sorted(c['spriteId']for c in clocks)==[60,62,86] and sa['sourceSha256']==m['spanishAudio']['sha256']
texts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs'])if 'runs'in t else None,sourceTagSha256=t['sourceTagSha256'])for t in m['texts']]
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=86,mainFrameCount=484,quizFrame=166,postQuizFrame=167,terminalFrame=484,rows=v['rows'],drops=v['drops'],columns=v['columns'],visualStates=v['visualStates'],hint=v['hint'],hintSourceTextId=57,nativeDisposition=v['nativeDisposition'],clocks=clocks,sa=sa,terms=J('glossary-model-v1.json')['entries'],sourceTexts=texts,title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=8,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/8.svg').read_bytes()),behavior=m['findings'],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v2.json';out=json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(model['visualStates']),clocks=3,decodedWithSpanish=4,rows=5,drops=4,sourceTextCount=len(texts),registered=False)))
