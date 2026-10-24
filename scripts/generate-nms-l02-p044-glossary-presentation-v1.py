from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p044/audit/source-glossary-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='ce501ba4a90d8398c790a77d3498bd4591d6a82d9ecd593f92e021db2e3be97f';s=json.loads(b)
text='// Source-bound definitions from the recovered technical index; original host lookup unverified.\nexport const P044_GLOSSARY = '+json.dumps([{'id':e['id'],'labels':e['labels'],'definitions':e['definitions']}for e in s['entries']],ensure_ascii=False,separators=(',',':'))+' as const;\n';dest=R/'packages/demos/src/generated/nms-l02-p044-glossary-v1.ts'
if '--check'in sys.argv:assert dest.read_text()==text
elif dest.exists():assert dest.read_text()==text
else:dest.write_text(text)
print('PASS two source-bound glossary entries')
