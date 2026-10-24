from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');v=J('teaching-visual-source-v1.json');streams=J('streams-v1.json');decoded=J('decode-native-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest()
assert m['source']['sha256']==v['sourceSha256']=='153f74f637e433d4f2c8707bc7f8e7012040c0d02ee279572f990265b3e9447a'
assert sha((B/'source-v1/L7IN18.swf').read_bytes())==m['source']['sha256'];assert decoded['pass']and len(decoded['streams'])==4
clocks=[];sa=None
for d in decoded['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256'] and s['decodedSamplesCandidate']==d['decodedSamples']
 if d['spriteId']==55:continue # Dormant coach; audited but not a runtime audio resource.
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
assert sorted(c['spriteId']for c in clocks)==[57,85]and sa['sourceSha256']==m['spanishAudio']['sha256']
texts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs'])if'runs'in t else None,sourceTagSha256=t['sourceTagSha256'])for t in m['texts']]
hint='Multiply each input by itself. A negative number times a negative number is a positive number.'
assert all(x in m['scripts'][2]['source']for x in [hint,hint+' Try again.','Please fill in all empty boxes and click Done'])
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=85,mainFrameCount=474,quizFrame=215,postQuizFrame=216,terminalFrame=474,answers=[i['expected']for i in m['inputFields']],rows=v['rows'],columns=v['columns'],visualStates=v['visualStates'],wrongHint=hint,emptyHint='Please fill in all empty boxes and click Done',nativeDisposition=v['nativeDisposition'],clocks=clocks,sa=sa,terms=J('glossary-model-v1.json')['entries'],sourceTexts=texts,title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=8,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/8.svg').read_bytes()),behavior=m['findings'],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
p=B/'native-v1/visual-model-v1.json';out=json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(passed=True,spans=len(model['visualStates']),activeClocks=2,decodedWithDormantCoachAndSpanish=4,rows=5,sourceTextCount=len(texts),registered=False)))
