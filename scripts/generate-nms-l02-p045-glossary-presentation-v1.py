from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p045/audit/source-glossary-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='5fbcf7828cd6c3203500b5c2beaa825a1a12d2886ae289dca9b7875c9a5de9e5';s=json.loads(b)
text='// Source-bound definitions from the recovered technical index; original host lookup unverified.\nexport const P045_GLOSSARY = '+json.dumps([{'id':e['id'],'labels':e['labels'],'definitions':e['definitions']}for e in s['entries']],ensure_ascii=False,separators=(',',':'))+' as const;\n';dest=R/'packages/demos/src/generated/nms-l02-p045-glossary-v1.ts'
if '--check'in sys.argv:assert dest.read_text()==text
elif dest.exists():assert dest.read_text()==text
else:dest.write_text(text)
print('PASS six source-bound glossary entries')
