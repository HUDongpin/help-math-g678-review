from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');v=J('teaching-visual-source-v2.json');streams=J('streams-v1.json');decoded=J('decode-native-v1.json');glossary=J('glossary-model-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest()
assert m['source']['sha256']==v['sourceSha256']=='ac93fd30593018abd3010d98eacd5d5945efe2a3e7efc923342cff7ee8bcbd7a'
assert sha((B/'source-v1/L7TI02.swf').read_bytes())==m['source']['sha256'];assert decoded['pass']and len(decoded['streams'])==10
clocks=[];sa=None
for d in decoded['streams']:
 assert d['contextClosed'];decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']}
 if d['spriteId']=='SA':sa=decoder;continue
 s=next(s for s in streams if s['spriteId']==d['spriteId']);assert s['sourceSha256']==d['sourceSha256']and s['decodedSamplesCandidate']==d['decodedSamples']
 if d['spriteId']not in[280,361,366]:continue
 clocks.append(dict(spriteId=d['spriteId'],sourceFrameCount=s['frameCount'],decoder=decoder,segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
assert len(clocks)==3 and sa['sourceSha256']==m['spanishAudio']['sha256']
active=set(json.loads((B/'audit-v1/source-role-disposition-v1.json').read_text())['activeDefinitions'])
texts=[dict(characterId=t['characterId'],sourceTextId=t['sourceTextId'],text=''.join(r['text']for r in t['runs'])if'runs'in t else None,sourceTagSha256=t['sourceTagSha256'])for t in m['texts']if t['characterId']in active]
terms=[]
for e in glossary['entries']:
 keys=set(b['sourceActionKey']for b in glossary['caseBindings']if b['dictionaryKey']==e['sourceKeyAttribute']);assert len(keys)==1;terms.append(dict(**e,sourceActionKey=next(iter(keys))))
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=366,mainFrameCount=375,quizFrame=61,postQuizFrame=62,correctAnswer=4,answers=v['answers'],branches=v['branches'],visualStates=v['visualStates'],graphs=v['graphs'],graphOverlays=v['graphOverlays'],question=v['question'],helpTexts=v['helpTexts'],helpTerms=v['helpTerms'],nativeDisposition=v['nativeDisposition'],clocks=clocks,sa=sa,terms=terms,sourceTexts=texts,title='Linear and Nonlinear Functions: Try It!',titleSourceShapeId=190,titleSvgSha256=sha((B/'source-v1/ffdec/shapes/190.svg').read_bytes()),behavior=m['findings'],independentPending=['original-runtime','fidelity','listening','human','Owner','strict','publication'])
assert model['correctAnswer']==next(a['answer']for a in model['answers']if a['instance']=='AnsBtn2')
p=B/'native-v1/visual-model-v1.json';out=json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n'
if p.exists()or'--check'in sys.argv:assert p.read_text()==out
else:p.open('x').write(out)
print(json.dumps(dict(pass_=True,spans=len(model['visualStates']),clocks=3,decodedWithSpanish=10,branches=2,sourceTextCount=len(texts),terms=len(terms),registered=False)))
