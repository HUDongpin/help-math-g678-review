"""Readable P057 projection: retain source table, equations, and authored help comparison."""
from pathlib import Path
import hashlib,json,sys,re
M=Path(__file__).resolve().parents[1];R=M.parents[1];E=Path('/Volumes/American Dream/hudongpin/g678-p057-source-extraction-20261003-v1/ffdec-export')
raw=(M/'native-v1/source-model-v1.json').read_bytes();digest=hashlib.sha256(raw).hexdigest();assert digest=='82d884431bcdf4d231546fa743e6f7696028422aa0ea5c3f183119e34528fdbf';m=json.loads(raw)
ids=[18,162,163,165,166,168,169,171,172,*range(174,182),192,235,236,*range(238,248),263,264,265,275,276,277,*range(282,295)]
texts={str(i):m['texts'][str(i)]['text']for i in ids};b=(E/'texts/291.txt').read_bytes();records=b.decode().split('--- RECORDSEPARATOR ---');lines=[x.strip()for x in records]
normalize=lambda s:re.sub(r'\s+','',s)
assert normalize(''.join(records))==normalize(texts['291']);assert len(lines)==4
assert lines[-1]=='y = 18 + 5   11';assert texts['292']=='='and texts['293']=='/'
# Separately placed = and / glyphs form the authored not-equal sign. Its final 11
# is retained exactly; do not silently change it to the table's x=9 output 41.
lines[-1]='y = 18 + 5 ≠ 11'
ranges={}
for i in m['domains']['312']['instances']:
 if i['objectId']not in ids:continue
 ranges.setdefault(str(i['objectId']),[]).extend([[r['firstFrame'],r['lastFrame']]for r in i['runs']if r['color']['factor']['Alpha']+r['color']['offset']['Alpha']>0])
for i in m['domains']['312']['instances']:
 if i['objectId']in[158,159,160]:assert all((r['matrixTwips']['transX']+m['rootMatrixTwips']['transX'])/20>800 for r in i['runs'])
data={'sourceSha256':m['sourceSha256'],'sourceModelSha256':digest,'texts':texts,'mainTextRanges':ranges,'helpEquationLines':lines,'helpEquationTextIds':[291,292,293],'helpEquationSourceSha256':hashlib.sha256(b).hexdigest(),'excludedOffstageAngleTexts':[158,159,160],'sourceHelpComparisonRetained':True}
code='// Generated from pinned P057 source text and lifetimes. Do not hand-edit.\nexport const P057_NATIVE_SOURCE = '+json.dumps(data,ensure_ascii=False,indent=2)+' as const;\n'
p=R/'packages/demos/src/generated/alg-l06-p057-native-v1.ts';assert sys.argv[1:]in[['--write'],['--check']]
if sys.argv[1]=='--write':p.write_text(code)
else:assert p.read_text()==code
print(json.dumps({'status':'PASS','texts':len(texts),'sha256':hashlib.sha256(code.encode()).hexdigest()}))
