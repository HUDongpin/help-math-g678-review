#!/usr/bin/env python3
"""Source-locked balloon drag candidate; generated output must not be edited."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p024-native-ir-v1/source-ir.json', 'bytes': 724354, 'sha256': '61efbf9fe52dbdac21a76b77865b20ca23728a7bf9c63f544d0f561913e619d6'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p024-behavior-source-v1/source-teaching-semantics-v1.json', 'bytes': 124355, 'sha256': 'f6d11e009e40c8d5ada0d429bc2e600d9e5f5d66ace14f51e25307cd3bf1d858'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p024-behavior-source-v1/source-terms-v1.json', 'bytes': 2600, 'sha256': '3567aa18ddc4c5107621c0ecb078cf01603977d661ddf2a7cc1ad9b1ddfdf385'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p024-behavior-source-v1/audio/measured-source-v1/measurement.json', 'bytes': 12186, 'sha256': '9d10c4001970f6b69c197b3e256c37908ea29d1aa0b4d049c01cba3531a79a41'}, {'path': '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/migrations/shared-nms002-l02-p024/audit/source-semantic-qualification-v1.json', 'bytes': 13013, 'sha256': '8c356d553947f7a18e5261059a33c1441524c020ead5f777d13cd3570818a320'}]
items=[]
for p in PINS:
 f=Path(p['path']);a=f.lstat();raw=f.read_bytes();z=f.lstat();assert f.is_file()and not f.is_symlink()and a.st_nlink==1 and all(getattr(a,k)==getattr(z,k)for k in ['st_dev','st_ino','st_size','st_mtime_ns']);assert len(raw)==p['bytes']and hashlib.sha256(raw).hexdigest()==p['sha256'];items.append(json.loads(raw))
ir,teaching,terms,measured,qualification=items;poses=[];cache={};domains={}
for name,d in ir['domains'].items():
 frames=[]
 for ps in d['frames']:
  frame=[]
  for p in ps:
   key=json.dumps(p,sort_keys=True,separators=(',',':'))
   if key not in cache:cache[key]=len(poses);poses.append(p)
   frame.append(cache[key])
  frames.append(frame)
 domains[name]=dict(frameCount=d['frameCount'],frames=frames)
audio={}
for s in measured['streams']:
 d=s['frameDomain'].split('-')[1];frames=domains[d]['frameCount'];start=round((s['rawFirstFrame']-1)*22050/12);count=s['decoder']['decodedSamples'];audio[d]=dict(domain=d,frames=frames,sourceBytes=s['source']['bytes'],sourceSha256=s['source']['sha256'],decodedSamples=count,pcmSha256=s['decoder']['pcmSha256'],latencySamples=1673,firstBlockFrame=s['rawFirstFrame'],outputStartSample=start,outputEndSample=start+count-1673,totalSamples=round(frames*22050/12),sampleRate=22050,channels=1,sourceFormat=2)
product=dict(sourceSha256=ir['sourceSha256'],fps=12,rootEntry=6,mainDomain='98',poses=poses,domains=domains,texts={str(t['characterId']):t for t in ir['texts']},audio=audio,teaching=teaching['rows'],terms=terms,maskGeometry=ir['maskGeometry'])
art={c:dict(body=ir['art'][c]['body'],viewBox=v['viewBox'])for c,v in teaching['shapeViewBoxes'].items()};assert len(art)==53 and all('<text'not in a['body']and'<script'not in a['body']and'data:'not in a['body']for a in art.values())
outputs={R/'packages/demos/src/generated/nms-l02-p024-source-ir-v1.ts':"// Generated exact source data; do not edit.\nimport type {P024SourceData} from '../nms-l02-p024-source-contract-v1';\nexport const P024_IR:P024SourceData = "+json.dumps(product,separators=(',',':'))+';\n',R/'packages/demos/src/generated/nms-l02-p024-art-ir-v1.ts':"// Generated source balloon/cursor illustrations; no teaching glyphs.\nexport const P024_ART:Readonly<Record<string,{readonly body:string;readonly viewBox:readonly number[]}>> = "+json.dumps(art,separators=(',',':'))+';\n'}
for p,s in outputs.items():
 if '--check'in sys.argv:assert p.read_text()==s,'Generated output drift'
 else:
  with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',check='--check'in sys.argv,poses=len(poses),domains=len(domains),frames=sum(d['frameCount']for d in domains.values()),art=len(art),audio=len(audio))))
