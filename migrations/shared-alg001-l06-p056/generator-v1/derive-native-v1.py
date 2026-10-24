"""Compact native text projection of the pinned source display list."""
from pathlib import Path
import hashlib,json,sys
M=Path(__file__).resolve().parents[1];R=M.parents[1];E=Path('/Volumes/American Dream/hudongpin/g678-p056-source-extraction-20261003-v1/ffdec-export')
raw=(M/'native-v1/source-model-v1.json').read_bytes();assert hashlib.sha256(raw).hexdigest()=='e41e8877a173cf62bbdb5356b273c61bdd78ac07841c813123d82927fd1eab98';m=json.loads(raw)
ids=[19,165,166,168,169,171,172,174,175,183,226,227,234,235,236,237,238,255,256,257,259,260,261,262,263,264,265,266,276,279,286]
texts={str(i):m['texts'][str(i)]['text'] for i in ids}
# FFDec record boundaries preserve the four authored equations; verify every glyph
# against the independently decoded XML text before adding line breaks.
b=(E/'texts/286.txt').read_bytes();lines=[x.strip() for x in b.decode().split('--- RECORDSEPARATOR ---')];assert ''.join(lines)==texts['286'];assert len(lines)==4
ranges={}
for i in m['domains']['305']['instances']:
 id=i['objectId']
 if id not in ids:continue
 runs=[[r['firstFrame'],r['lastFrame']] for r in i['runs'] if r['color']['factor']['Alpha']+r['color']['offset']['Alpha']>0]
 ranges.setdefault(str(id),[]).extend(runs)
# These old angle-template strings are entirely beyond the 800px stage. They do
# not belong in the readable projection, even though their symbols are reachable.
for i in m['domains']['305']['instances']:
 if i['objectId'] in [161,162,163]:
  assert all((r['matrixTwips']['transX']+m['rootMatrixTwips']['transX'])/20>800 for r in i['runs'])
data={'sourceSha256':m['sourceSha256'],'sourceModelSha256':hashlib.sha256(raw).hexdigest(),'texts':texts,'mainTextRanges':ranges,'helpEquationLines':lines,'helpEquationSourceSha256':hashlib.sha256(b).hexdigest(),'excludedOffstageAngleTexts':[161,162,163]}
code='// Generated from pinned source text and alpha lifetimes; do not hand-edit.\nexport const P056_NATIVE_SOURCE = '+json.dumps(data,ensure_ascii=False,indent=2)+' as const;\n'
p=R/'packages/demos/src/generated/alg-l06-p056-native-v1.ts'
assert sys.argv[1:] in [['--write'],['--check']]
if sys.argv[1]=='--write':p.write_text(code)
else:assert p.read_text()==code
print(json.dumps({'status':'PASS','texts':len(texts),'equationLines':len(lines),'excludedOffstage':[161,162,163]}))
