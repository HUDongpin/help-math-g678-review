from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p043/audit/source-glossary-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='739cca88e3c3600d31ea483162ac0fc3f685838d7340809841b0bb32b8b9f0ff';s=json.loads(b)
text='// Source-bound definitions from the recovered technical index; original host lookup unverified.\nexport const P043_GLOSSARY = '+json.dumps([{'id':e['id'],'labels':e['labels'],'definitions':e['definitions']}for e in s['entries']],ensure_ascii=False,separators=(',',':'))+' as const;\n';dest=R/'packages/demos/src/generated/nms-l02-p043-glossary-v1.ts'
if '--check'in sys.argv:assert dest.read_text()==text
elif dest.exists():assert dest.read_text()==text
else:dest.write_text(text)
print('PASS six source-bound glossary entries')
