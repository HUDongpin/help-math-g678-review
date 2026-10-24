from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p046/audit/source-glossary-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='ca53cf14e88852baa9292f7bc85d4e8f90ab44f5e17e8072758a7123e9857456';s=json.loads(b)
text='// Source-bound definitions from the recovered technical index; original host lookup unverified.\nexport const P046_GLOSSARY = '+json.dumps([{'id':e['id'],'labels':e['labels'],'definitions':e['definitions']}for e in s['entries']],ensure_ascii=False,separators=(',',':'))+' as const;\n';dest=R/'packages/demos/src/generated/nms-l02-p046-glossary-v1.ts'
if '--check'in sys.argv:assert dest.read_text()==text
elif dest.exists():assert dest.read_text()==text
else:dest.write_text(text)
print('PASS five source-bound glossary entries')
