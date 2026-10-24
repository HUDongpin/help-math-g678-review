from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');v=J('teaching-visual-source-v1.json');streams=J('streams-v1.json');decoded=J('decode-native-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest()
assert m['source']['sha256']==v['sourceSha256']=='0b3bba51fe0955760bd6a25d7ea24bc5c8449771ad2dd48e37bec365fe49bed0'
assert sha((B/'source-v1/L7IN11.swf').read_bytes())==m['source']['sha256'];assert decoded['pass'] and len(decoded['streams'])==10
clocks=[];sa=None
for d in decoded['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in ['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256'] and s['decodedSamplesCandidate']==d['decodedSamples']
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in ['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
assert len(clocks)==9 and sa['sourceSha256']==m['spanishAudio']['sha256']
texts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs'])if 'runs'in t else None,sourceTagSha256=t['sourceTagSha256'])for t in m['texts']]
answers=[dict(**a,valueIds=[a['valueId']],wrongFirst=m['findings']['wrongFirst']if a['answer']!=2 else None,wrongLater=m['findings']['wrongLater']if a['answer']!=2 else None)for a in v['answers']]
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=312,mainFrameCount=1109,quizFrame=368,postQuizFrame=369,correctAnswer=2,answers=answers,branches=v['branches'],visualStates=v['visualStates'],graph=v['graph'],mathRows=v['mathRows'],unitCorrection=v['unitCorrection'],nativeDisposition=v['nativeDisposition'],clocks=clocks,sa=sa,terms=J('glossary-model-v1.json')['entries'],sourceTexts=texts,title='Linear and Nonlinear Functions: Instruction',titleSourceShapeId=1,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/1.svg').read_bytes()),behavior=m['findings'],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert len(model['branches'])==8 and sum(b['naturallySelected']for b in model['branches'])==7 
p=B/'native-v1/visual-model-v1.json';out=json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n'
if '--check'in sys.argv or p.exists():assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(model['visualStates']),clocks=9,decodedWithSpanish=10,branches=8,selectedBranches=7,sourceTextCount=len(texts),registered=False)))
