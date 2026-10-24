#!/usr/bin/env python3
"""Generate one source-bound NMS002 equivalent-fractions candidate. Never edit outputs."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p025-native-ir-v1/source-ir.json', 'bytes': 914939, 'sha256': '059a2b93c3ecd93fde318a181528f153f7963ca9e1c0fd09b2d758da807e4b6c'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p025-behavior-source-v1/source-teaching-semantics-v1.json', 'bytes': 2878536, 'sha256': '9aad9b7d18bb0ddeffd927c93eb758606c903e8438f2626784e3db0719251877'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p025-behavior-source-v1/source-terms-v1.json', 'bytes': 4007, 'sha256': 'f2565e72cf42f5985c1d4014216d0bf2a8db290d459324e338a1d72743fd2e7b'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p025-behavior-source-v1/audio/measured-source-v1/measurement.json', 'bytes': 3841, 'sha256': '6c906eb3110cadb01a08c8e6f28cef1634cc44dc54f77d91bfbf154df1b494d4'}, {'path': '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-nms002-l02-p025/audit/source-semantic-qualification-v2.json', 'bytes': 9309, 'sha256': '516c5793ae6d4785193864d591b0b7f673af743333bfb6dccf131a6f263bba2b'}]
inputs=[]
for p in PINS:
 f=Path(p['path']);a=f.lstat();raw=f.read_bytes();z=f.lstat();assert f.is_file()and not f.is_symlink()and a.st_nlink==1 and all(getattr(a,k)==getattr(z,k)for k in ['st_dev','st_ino','st_size','st_mtime_ns']);assert len(raw)==p['bytes']and hashlib.sha256(raw).hexdigest()==p['sha256'],str(f);inputs.append(json.loads(raw))
ir,teaching,terms,measurement,qualification=inputs
assert ir['sourceSha256']=='8d67790688d960f87acf21c9129af070e98c9110e4efbf99cd85aae697facaeb'
assert len(ir['art'])==20 and len(ir['texts'])==11 and len(ir['domains'])==2

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
product=dict(schemaVersion=1,animationId=ir['animationId'],sourceSha256=ir['sourceSha256'],stage=ir['stage'],fps=12,rootEntry=6,mainDomain='36',texts=ir['texts'],buttons=[dict(characterId=i,keyTerm=k,stopTarget='_root.animation_mc.animation.stop()')for i,k in [(8,'Equivalent fraction'),(9,'Quantity'),(10,'Fraction')]],poses=poses,domains=domains,visibilityStates=visibility,visibilityFrames=visframes,teachingStates=states,teachingFrames=stateframes)
a=measurement['streams'][0];assert a['decoder']['decodedSamples']==626112 and a['source']['bytes']==141310
assert qualification['audio']['stopSamples']==644963 and qualification['audio']['outputStartSample']==9188
source=dict(sourceSha256=a['source']['sha256'],sourceBytes=a['source']['bytes'],sampleRate=22050,channels=1,decodedSamples=626112,latencySamples=1673,stopSamples=644963,stopSeconds=351/12,firstBlockFrame=6,frames=351,fps=12,language='und',segments=[dict(sourceStartSample=1673,sourceEndSample=626112,outputStartSample=9188,outputEndSample=633627)])
outputs={R/'packages/demos/src/generated/nms-l02-p025-source-ir-v1.ts':"// Generated from exact source inputs; do not edit.\nimport type {P025SourceIR} from '../nms-l02-p025-source-contract-v1';\nexport const NMS_L02_P025_IR:P025SourceIR = "+json.dumps(product,separators=(',',':'))+';\n',R/'packages/demos/src/generated/nms-l02-p025-terms-v1.ts':"// Generated exact source glossary; do not edit.\nexport const P025_SOURCE_TERMS = "+json.dumps(terms,ensure_ascii=False,separators=(',',':'))+' as const;\n',R/'packages/demos/src/nms-l02-p025-audio-source-v1.ts':"// Generated whole-stream source audio mapping; do not edit.\nexport const P025_AUDIO_SOURCE = Object.freeze("+json.dumps(source,indent=2)+" as const);\nObject.freeze(P025_AUDIO_SOURCE.segments);\nfor(const s of P025_AUDIO_SOURCE.segments)Object.freeze(s);\n"}
check='--check'in sys.argv
for p,s in outputs.items():
 if check:assert p.read_text()==s,'Generated output drift '+str(p)
 else:
  with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',check=check,poses=len(poses),visibilityStates=len(visibility),teachingStates=len(states),sourceFrames=361,outputs=[str(p)for p in outputs])))
