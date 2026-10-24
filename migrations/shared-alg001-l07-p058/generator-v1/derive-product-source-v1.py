from pathlib import Path
import json,hashlib,sys
B=Path(__file__).resolve().parents[1];R=B.parents[1];J=lambda n:json.loads((B/'native-v1'/n).read_text());m=J('source-model-v1.json');streams=J('streams-v1.json');decode=J('decode-native-v1.json');g=J('glossary-model-v1.json');sha=lambda b:hashlib.sha256(b).hexdigest();assert decode['pass']and len(decode['streams'])==10
by={t['timelineId']:t for t in m['timelines']};main=by['sprite-311'];texts={t['characterId']:t for t in m['texts']};alpha=lambda p:max(0,min(1,p.get('colorTransform',{}).get('multiply',[256]*4)[3]/256+p.get('colorTransform',{}).get('add',[0]*4)[3]/255))if p else 0
spans=lambda values:None
def spans(values):
 out=[]
 for frame,value in enumerate(values,1):
  if out and out[-1]['value']==value:out[-1]['last']=frame
  else:out.append(dict(first=frame,last=frame,value=value))
 return out
T=lambda id:dict(characterId=id,sourceTextId=f'character-{id}',text=texts[id]['text'])
ids=[16,194,235,236,*range(239,245),*range(261,267),*range(281,287),289,290,291,292]
answers=[dict(letter=l,instance=instance,characterId=button,labelId=label,valueId=value,text=texts[value]['text'])for l,instance,button,label,value in [('A','AnsBtn1',276,180,181),('B','AnsBtn4',277,183,184),('C','AnsBtn3',277,186,187),('D','AnsBtn2',277,189,190)]]
visual=[]
for row in main['frames']:
 find=lambda id:next((p for p in row if p['characterId']==id),None)
 visual.append(dict(questionAlpha=alpha(find(16)),questionOffset=(find(16)['matrix'][5]+4165)/20 if find(16)else 0,textAlpha={str(id):alpha(find(id))for id in ids if id<280},answerAlpha={a['letter']:min(alpha(find(a['labelId'])),alpha(find(a['valueId'])))for a in answers},panelAlpha=[alpha(find(id))for id in[23,23,238,260]]))
assert visual[-1]['answerAlpha']==dict(A=1,B=0,C=0,D=0)
helpers={}
for sid,tids in [(256,list(range(239,245))),(273,list(range(261,267)))]:
 helpers[str(sid)]=spans([{str(id):max([alpha(p)for p in row if p['characterId']==id],default=0)for id in tids}for row in by[f'sprite-{sid}']['frames']])
branches=[]
for b in m['behavior']['feedback']:
 t=by[f"sprite-{b['spriteId']}"];tids=sorted({p['characterId']for row in t['frames']for p in row if p['characterId']in texts});titles={texts[id]['text']for id in tids};assert len(titles)==1
 branches.append(dict(**b,title=next(iter(titles)),titleIds=tids,titleAlpha=spans([max([alpha(p)for p in row if p['characterId']in tids],default=0)for row in t['frames']])))
clocks=[]
for s in streams:
 d=next(d for d in decode['streams']if d['spriteId']==s['spriteId']);assert d['contextClosed']and d['sourceSha256']==s['sourceSha256']and d['decodedSamples']==s['decodedSamplesCandidate']and d['channels']==s['channels']
 if s['spriteId']==233:continue
 clocks.append(dict(spriteId=s['spriteId'],sourceFrameCount=s['frameCount'],decoder={k:d[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},segments=s['segments'],emptyNegativeBlocks=[{k:b[k]for k in['frame','samples','seek','mp3Bytes']}for b in s['blocks']if b['samples']==0 and b['seek']<0]))
sa=next(d for d in decode['streams']if d['spriteId']=='SA');assert sa['sourceSha256']==m['spanishAudio']['sha256']
model=dict(animationId=m['animationId'],sourceSha256=m['source']['sha256'],fps=12,mainSpriteId=311,mainFrameCount=822,quizFrame=805,behavior=m['behavior'],texts=[T(id)for id in ids],question=T(16),answers=answers,steps=[dict(number=i+1,numberIds=nids,textIds=tids,helperId=h)for i,(nids,tids,h)in enumerate([([27,28],[194],None),([24],[235,236],None),([25],list(range(239,245)),256),([26,259],list(range(261,267)),273)])],help=dict(spriteId=295,rows=[dict(leadIds=[281],exampleIds=[284]),dict(leadIds=[282],exampleIds=[289,292,291,290]),dict(leadIds=[283],exampleIds=[285,286])],equation='M = 0.50S − 25',equationIds=[289,292,291,290]),branches=branches,visualStates=spans(visual),helperStates=helpers,clocks=clocks,sa={k:sa[k]for k in['sourceBytes','sourceSha256','sampleRate','channels','decodedSamples','pcmSha256']},terms=g['entries'])
# Help digits ordered by source x, not numerical character IDs.
helpRow=by['sprite-295']['frames'][0];assert next(p['matrix'][4]for p in helpRow if p['characterId']==291)<next(p['matrix'][4]for p in helpRow if p['characterId']==290)
for p,b in [(B/'native-v1/visual-model-v1.json',(json.dumps(model,separators=(',',':'),ensure_ascii=False)+'\n').encode()),(R/'packages/demos/src/alg-l07-p058-source-v1.ts',((B/'generator-v1/product-source-types-v1.txt').read_text()+'export const ALG_L07_P058_SOURCE: P058Model = '+json.dumps(model,separators=(',',':'),ensure_ascii=False)+';\n').encode())]:
 if '--write' in sys.argv:p.write_bytes(b)
 elif p.exists()or'--check'in sys.argv:assert p.read_bytes()==b,p
 else:p.open('xb').write(b)
print(json.dumps(dict(pass_=True,visualSpans=len(model['visualStates']),activeClocks=len(clocks),stereo=sum(c['decoder']['channels']==2 for c in clocks),terms=len(g['entries']))))
