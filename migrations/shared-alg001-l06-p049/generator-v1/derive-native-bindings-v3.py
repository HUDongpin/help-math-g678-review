#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,sys,importlib.util
sys.dont_write_bytecode=True
assert __debug__
W=Path(__file__).resolve().parent.parent;P=W/'native-v1/source-model-v2.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def build():
 raw=P.read_bytes();assert sha(raw)=='8faf55033928e8449c96fe3a9c1a7504b7f119119f2f90a4f81d8caf309b11ff';m=json.loads(raw)
 def ranges(tid):
  frames=set()
  for x in m['mainTextInstances']:
   if x['objectId']!=tid:continue
   for run in x['runs']:
    c=run['color']
    if c['factor']['Alpha']+c['offset']['Alpha']>0:frames.update(range(run['firstFrame'],run['lastFrame']+1))
  rows=[]
  for f in sorted(frames):
   if rows and rows[-1][1]+1==f:rows[-1][1]=f
   else:rows.append([f,f])
  return rows
 def text(tid):return {'textId':tid,'text':m['texts'][str(tid)]['text'],'visibleRanges':ranges(tid)}
 helper=W.parents[1]/'migrations/shared-alg001-l06-p045/generator-input/p041-affine-timeline-helper.py'
 assert sha(helper.read_bytes())=='5e31ad5ccbc4947444c4aa9dcea3ec4700fdaae4019dc3a0e8d59f4656350906'
 spec=importlib.util.spec_from_file_location('p049_highlight',helper);h=importlib.util.module_from_spec(spec);spec.loader.exec_module(h)
 def box(tid,frame):
  row=next(x for x in m['mainTextInstances'] if x['objectId']==tid and x['firstFrame']<=frame<=x['lastFrame'])
  run=next(x for x in row['runs'] if x['firstFrame']<=frame<=x['lastFrame'])
  return h.box(m['texts'][str(tid)]['boundsTwips'],h.compose(m['rootMatrixTwips'],run['matrixTwips']))
 emphasis=[]
 for target in [148,325]:
  target_box=box(target,374);hits=[]
  for x in m['mainTextInstances']:
   if x['objectId']!=326 or x['firstFrame']!=374:continue
   b=h.box(m['texts']['326']['boundsTwips'],h.compose(m['rootMatrixTwips'],x['runs'][0]['matrixTwips']))
   overlap=h.overlap_of_text(b,target_box)
   if overlap>=.8:hits.append({'depth':x['depth'],'boxPx':b,'targetBoxPx':target_box,'overlap':overlap})
  assert len(hits)==1,(target,hits)
  emphasis.append({'sourceTextId':326,'targetTextId':target,'value':'8,800','visibleRanges':ranges(326),'sourceGeometry':hits[0]})
 options={x['letter']:{**x,'visibleRanges':ranges(x['textId'])} for x in m['answerPlacements']}
 return {'kind':'p049-source-native-bindings-v1','animationId':m['animationId'],'sourceSha256':m['assetId'][4:],'sourceModelSha256':sha(raw),'runtime':m['runtime'],'behavior':m['sourceBehavior'],'question':text(143),'helpText':[{'textId':tid,'text':m['texts'][str(tid)]['text']} for tid in [134,135]],'options':options,'glossary':m['glossary'],'table':{'headers':[text(145),text(146)],'rows':[[text(x['milesTextId']),text(x['yardsTextId'])] for x in m['sourceTable']['rows']],'description':'Source function table: 5 miles gives 8,800 yards; 10 miles gives 17,600 yards; 15 miles gives 26,400 yards.'},'explanation':[text(tid) for tid in [324,325]],'pairedValueEmphasis':emphasis,'streams':[{k:x[k] for k in ['spriteId','role','codec','activeAnswerPath','frameCount','blockCount','payloadBytes','payloadSha256','assetPath']} for x in m['streams']]}
if __name__=='__main__':
 assert sys.argv[1:] in [['--write'],['--check']];r=build();b=(json.dumps(r,ensure_ascii=False,indent=2)+'\n').encode();p=W/'native-v1/native-bindings-v3.json'
 if sys.argv[1]=='--write':
  with p.open('xb') as f:f.write(b)
 else:assert p.read_bytes()==b
 print(json.dumps({'bytes':len(b),'sha256':sha(b),'options':{k:v['visibleRanges'] for k,v in r['options'].items()},'explanation':r['explanation']}))
