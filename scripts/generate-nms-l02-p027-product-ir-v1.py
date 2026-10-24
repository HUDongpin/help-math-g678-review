from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];PINS=[{'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-native-ir-v2/source-ir.json', 'sha256': '7652f0dd367bf73257f914ed30d2e92f840cf203915617f89f5c87360b239751'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-behavior-source-v1/source-teaching-semantics-v2.json', 'sha256': '59594c1f200802933638a281171f4d51a04625f75e12933913f4d81e35dfff46'}, {'path': '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-behavior-source-v1/source-terms-v1.json', 'sha256': '4daa1a57b7893b104af797729edf49260d249b5c0b3c4787659fdc48d634f7e3'}]
for p in PINS:assert hashlib.sha256(Path(p['path']).read_bytes()).hexdigest()==p['sha256']
ir,sem,terms=[json.loads(Path(p['path']).read_text())for p in PINS];assert sem['sourceIr']['sha256']==PINS[0]['sha256']
poses=[];indices={};domains={}
def intern(value,items,index):
 key=json.dumps(value,sort_keys=True,separators=(',',':'))
 if key not in index:index[key]=len(items);items.append(value)
 return index[key]
for k,d in ir['domains'].items():domains[k]=dict(frameCount=d['frameCount'],frames=[[intern(p,poses,indices)for p in f]for f in d['frames']])
rows=[];rowIndices={};frames=[]
for r in sem['rows']:
 def alpha(items):return max([p['color'][3]for p in items],default=0)
 row=dict(questionAlpha=r['questionAlpha'],targetAlpha=alpha(r['target']),wrongCompositeAlpha=alpha(r['wrongComposite']),correctOptionAlpha=alpha(r['correctOption']),optionLabelAlphas=[alpha(r['optionLabels'][l])for l in ['A','B','C','D']],helpVisible=r['helpVisible'],helpEmphasis=r['helpEmphasis'],comparisonVisible=alpha(r['comparisonPanel'])>0,reductionFormulaVisible=r['reductionFormulaVisible'],upperRightFractionVisible=r['upperRightFractionVisible'],upperLeftFractionVisible=r['upperLeftFractionVisible'],equivalenceEmphasis=r['equivalenceEmphasis'],emphasis=[dict(characterId=p['characterId'],depth=p['depth'],matrix=p['matrix'],alpha=p['color'][3])for p in r['staticTextInstances']if p['characterId']in [20,21,22,23,24]])
 frames.append(intern(row,rows,rowIndices))
assert len(domains)==20 and sum(d['frameCount']for d in domains.values())==638 and len(frames)==384
value=dict(animationId=ir['animationId'],sourceSha256=ir['sourceSha256'],fps=12,rootEntry=6,mainDomain='207',poses=poses,domains=domains,texts=[{k:t[k]for k in ['characterId','matrix','kind','runs']}for t in ir['texts']],teachingRows=rows,teachingFrames=frames)
outputs={R/'packages/demos/src/generated/nms-l02-p027-source-ir-v1.ts':'// Generated source-local structural queries; no AS execution. Never edit.\nimport type{P027SourceData}from"../nms-l02-p027-source-contract-v1";\nexport const P027_SOURCE_IR:P027SourceData = '+json.dumps(value,separators=(',',':'))+';\n',R/'packages/demos/src/generated/nms-l02-p027-terms-v1.ts':'// Generated exact bilingual source glossary entries; never edit.\nexport const P027_SOURCE_TERMS = '+json.dumps(terms,ensure_ascii=False,separators=(',',':'))+' as const;\n'}
for p,s in outputs.items():
 if '--check'in sys.argv:assert p.read_text()==s
 else:
  with p.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',poses=len(poses),teachingRows=len(rows),sourceFrames=638,teachingFrames=384,terms=len(terms))))
