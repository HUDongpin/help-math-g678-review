#!/usr/bin/env python3
"""Generate one source-bound NMS002 number-line candidate. Never edit outputs."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p023-native-ir-v1/source-ir.json', 'bytes': 947849, 'sha256': 'b774d3d5157f9138fb564b40653dd77610b94c5a7e1713609730737f9900044a'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p023-behavior-source-v1/source-teaching-semantics-v1.json', 'bytes': 1466297, 'sha256': 'f26ec471802b9769e7fd816d423b809286363538bc83e142cb16b6d06ce52083'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p023-behavior-source-v1/source-terms-v1.json', 'bytes': 4860, 'sha256': '6296c4c8d65badf43082b424e06ee045948e0574b4a9d4f07802184482800202'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p023-behavior-source-v1/audio/measured-source-v1/measurement.json', 'bytes': 3654, 'sha256': 'bad693016811871de4aeb77190038a6d29fbd06998fe37864f8f22026a04d158'}, {'path': '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-nms002-l02-p023/audit/source-semantic-qualification-v1.json', 'bytes': 8762, 'sha256': '7d2fd0bf797b337113f63156591d569dee9063b57cf130c06a7716f625507a27'}]
inputs=[]
for p in PINS:
 f=Path(p['path']);a=f.lstat();raw=f.read_bytes();z=f.lstat();assert f.is_file()and not f.is_symlink()and a.st_nlink==1 and all(getattr(a,k)==getattr(z,k)for k in ['st_dev','st_ino','st_size','st_mtime_ns']);assert len(raw)==p['bytes']and hashlib.sha256(raw).hexdigest()==p['sha256'],str(f);inputs.append(json.loads(raw))
ir,teaching,terms,measurement,qualification=inputs
assert ir['sourceSha256']=='3df3b8f63e6c1196d8726912e6601ae9f680a59cb639d2cc17b9bb9c5757ae59'
assert len(ir['art'])==17 and len(ir['texts'])==5 and len(ir['domains'])==2

def cache(rows):
 values=[];indices=[];seen={}
 for row in rows:
  key=json.dumps(row,sort_keys=True,separators=(',',':'))
  if key not in seen:seen[key]=len(values);values.append(row)
  indices.append(seen[key])
 return values,indices
poses=[];lookup={};domains={}
for key,d in ir['domains'].items():
 frames=[]
 for frame in d['frames']:
  ids=[]
  for p in frame:
   name=json.dumps(p,sort_keys=True,separators=(',',':'))
   if name not in lookup:lookup[name]=len(poses);poses.append(p)
   ids.append(lookup[name])
  frames.append(ids)
 domains[key]=dict(frameCount=d['frameCount'],frames=frames)
visibility,visframes=cache([r['visibleTexts']for r in teaching['rows']]);states,stateframes=cache([{k:v for k,v in r.items()if k not in ['frame','visibleTexts']}for r in teaching['rows']])
product=dict(schemaVersion=1,animationId=ir['animationId'],sourceSha256=ir['sourceSha256'],stage=ir['stage'],fps=12,rootEntry=6,mainDomain='28',texts=ir['texts'],buttons=[dict(characterId=i,keyTerm=k,stopTarget='_root.animation_mc.animation.stop()')for i,k in [(23,'Fraction'),(24,'Number line'),(25,'Whole'),(26,'Part')]],poses=poses,domains=domains,visibilityStates=visibility,visibilityFrames=visframes,teachingStates=states,teachingFrames=stateframes)
a=measurement['streams'][0];assert a['decoder']['decodedSamples']==850176 and a['source']['bytes']==191880
source=dict(sourceSha256=a['source']['sha256'],sourceBytes=a['source']['bytes'],sampleRate=22050,channels=1,decodedSamples=850176,latencySamples=1673,stopSamples=861788,stopSeconds=469/12,firstBlockFrame=7,frames=469,fps=12,language='und',segments=[dict(sourceStartSample=1673,sourceEndSample=850176,outputStartSample=11025,outputEndSample=859528)])
outputs={R/'packages/demos/src/generated/nms-l02-p023-source-ir-v1.ts':"// Generated from exact source inputs; do not edit.\nimport type {P023SourceIR} from '../nms-l02-p023-source-contract-v1';\nexport const NMS_L02_P023_IR:P023SourceIR = "+json.dumps(product,separators=(',',':'))+';\n',R/'packages/demos/src/generated/nms-l02-p023-terms-v1.ts':"// Generated exact source glossary; do not edit.\nexport const P023_SOURCE_TERMS = "+json.dumps(terms,ensure_ascii=False,separators=(',',':'))+' as const;\n',R/'packages/demos/src/nms-l02-p023-audio-source-v1.ts':"// Generated whole-stream source audio mapping; do not edit.\nexport const P023_AUDIO_SOURCE = Object.freeze("+json.dumps(source,indent=2)+" as const);\nObject.freeze(P023_AUDIO_SOURCE.segments);\nfor(const s of P023_AUDIO_SOURCE.segments)Object.freeze(s);\n"}
check='--check'in sys.argv
for p,s in outputs.items():
 if check:assert p.read_text()==s,'Generated output drift '+str(p)
 else:
  with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',check=check,poses=len(poses),visibilityStates=len(visibility),teachingStates=len(states),sourceFrames=479,outputs=[str(p)for p in outputs])))
