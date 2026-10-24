#!/usr/bin/env python3
from pathlib import Path
import json,hashlib,sys
assert __debug__
W=Path(__file__).resolve().parent.parent;P=W/'native-v1/source-model-v1.json'
def sha(b):return hashlib.sha256(b).hexdigest()
def build():
 raw=P.read_bytes();assert sha(raw)=='81f503a766465d83f78826c079b695491327d908d37af0b36c60ae20cb430c58';m=json.loads(raw)
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
 options={x['letter']:{**x,'visibleRanges':ranges(x['textId'])} for x in m['answerPlacements']}
 return {'kind':'p049-source-native-bindings-v1','animationId':m['animationId'],'sourceSha256':m['assetId'][4:],'sourceModelSha256':sha(raw),'runtime':m['runtime'],'behavior':m['sourceBehavior'],'question':text(143),'helpText':[{'textId':tid,'text':m['texts'][str(tid)]['text']} for tid in [134,135]],'options':options,'glossary':m['glossary'],'table':{'headers':[text(145),text(146)],'rows':[[text(x['milesTextId']),text(x['yardsTextId'])] for x in m['sourceTable']['rows']],'description':'Source function table: 5 miles gives 8,800 yards; 10 miles gives 17,600 yards; 15 miles gives 26,400 yards.'},'explanation':[text(tid) for tid in [324,325,326]],'streams':[{k:x[k] for k in ['spriteId','role','activeAnswerPath','frameCount','blockCount','payloadBytes','payloadSha256','assetPath']} for x in m['streams']]}
if __name__=='__main__':
 assert sys.argv[1:] in [['--write'],['--check']];r=build();b=(json.dumps(r,ensure_ascii=False,indent=2)+'\n').encode();p=W/'native-v1/native-bindings-v1.json'
 if sys.argv[1]=='--write':
  with p.open('xb') as f:f.write(b)
 else:assert p.read_bytes()==b
 print(json.dumps({'bytes':len(b),'sha256':sha(b),'options':{k:v['visibleRanges'] for k,v in r['options'].items()},'explanation':r['explanation']}))
