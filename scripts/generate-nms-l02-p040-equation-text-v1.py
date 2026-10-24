from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p040/audit/source-text-catalog-v1.json';b=p.read_bytes();d=json.loads(b);records=[]
for t in d['textDefinitions']:
 if t['characterId']<32:continue
 assert t['matrix']==[1,0,0,1,0,0]and len(t['runs'])==1;r=t['runs'][0];assert r['fontHeightTwips']==360 and r['yOffsetTwips']==340
 records.append({'characterId':t['characterId'],'text':r['text'],'x':r.get('xOffsetTwips')or 0,'baseline':r['yOffsetTwips'],'fontHeight':r['fontHeightTwips'],'color':r['colorRgba'],'advance':sum(g['advanceTwips']for g in r['glyphs'])})
s='// Generated from the P040 source text catalog; do not edit.\nexport const P040_EQUATION_TEXT = '+json.dumps(records,separators=(',',':'))+' as const;\n';out=R/'packages/demos/src/generated/nms-l02-p040-equation-text-v1.ts'
if '--check'in sys.argv:assert out.read_text()==s
else:
 with out.open('x')as f:f.write(s)
print(json.dumps({'records':len(records),'sourceCatalogSha256':hashlib.sha256(b).hexdigest()}))
