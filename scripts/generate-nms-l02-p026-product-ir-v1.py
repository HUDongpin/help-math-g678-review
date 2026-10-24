from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1]
PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p026-native-ir-v2/source-ir.json', 'bytes': 1833709, 'sha256': 'afe9ced14aa6d78eaf5396e0a5668631bfe77171087478c358a3018f6f714484'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p026-behavior-source-v2/source-teaching-semantics-v1.json', 'bytes': 4509330, 'sha256': '6b4afef7ee47f2e390d90f86506d277b5791c16e993c557c2c2578c8811c2ce7'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p026-behavior-source-v2/source-terms-v1.json', 'bytes': 2707, 'sha256': '6da19a181a587077899f5b4a6e6d3461b3ce750d9093f97a917fe3a326c52489'}]
data=[]
for p in PINS:
 f=Path(p['path']);a=f.lstat();raw=f.read_bytes();z=f.lstat();assert f.is_file()and not f.is_symlink()and a.st_nlink==1 and all(getattr(a,k)==getattr(z,k)for k in ['st_dev','st_ino','st_size','st_mtime_ns']);assert len(raw)==p['bytes']and hashlib.sha256(raw).hexdigest()==p['sha256'];data.append(json.loads(raw))
ir,teaching,terms=data;assert len(ir['domains'])==23 and sum(d['frameCount']for d in ir['domains'].values())==661 and len(ir['dynamicFields'])==4
poses=[];seen={};domains={}
for name,d in ir['domains'].items():
 frames=[]
 for frame in d['frames']:
  indices=[]
  for pose in frame:
   key=json.dumps(pose,sort_keys=True,separators=(',',':'))
   if key not in seen:seen[key]=len(poses);poses.append(pose)
   indices.append(seen[key])
  frames.append(indices)
 domains['root'if name=='root'else'sprite-'+name]=dict(frameCount=d['frameCount'],frames=frames)
rows=[];rowSeen={};rowIndices=[]
for row in teaching['rows']:
 value={k:v for k,v in row.items()if k!='frame'};key=json.dumps(value,sort_keys=True,separators=(',',':'))
 if key not in rowSeen:rowSeen[key]=len(rows);rows.append(value)
 rowIndices.append(rowSeen[key])
product=dict(animationId=ir['animationId'],sourceSha256=ir['sourceSha256'],stage=ir['stage'],fps=12,rootEntry=6,mainDomain='sprite-82',poses=poses,domains=domains,teachingRows=rows,teachingFrames=rowIndices,instruction=next(t for t in ir['texts']if t['characterId']==22),dynamicFields=[dict(characterId=t['characterId'],variable=t['variableName']['text'])for t in ir['dynamicFields']])
outputs={R/'packages/demos/src/generated/nms-l02-p026-source-ir-v1.ts':'// Generated source-local data; never edit. No ActionScript execution.\nimport type{P026SourceIR}from"../nms-l02-p026-source-contract-v1";\nexport const P026_SOURCE_IR:P026SourceIR = '+json.dumps(product,separators=(',',':'))+';\n',R/'packages/demos/src/generated/nms-l02-p026-terms-v1.ts':'// Generated exact glossary definitions; never edit.\nexport const P026_SOURCE_TERMS = '+json.dumps(terms,ensure_ascii=False,separators=(',',':'))+' as const;\n'}
for p,s in outputs.items():
 if '--check'in sys.argv:assert p.read_text()==s
 else:
  with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',poses=len(poses),teachingRows=len(rows),domains=len(domains),frames=661)))
