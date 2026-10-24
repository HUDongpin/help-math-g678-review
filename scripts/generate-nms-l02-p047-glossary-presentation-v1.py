from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];p=R/'migrations/shared-nms002-l02-p047/audit/source-glossary-v1.json';b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='b3355b03b548d45d1b6b93e8ac7aa5558c12bbc94b3b415f3771418e22b16f71';s=json.loads(b)
text='// Source-bound definitions from the recovered technical index; original host lookup unverified.\nexport const P047_GLOSSARY = '+json.dumps([{'id':e['id'],'labels':e['labels'],'definitions':e['definitions']}for e in s['entries']],ensure_ascii=False,separators=(',',':'))+' as const;\n';dest=R/'packages/demos/src/generated/nms-l02-p047-glossary-v1.ts'
if '--check'in sys.argv:assert dest.read_text()==text
elif dest.exists():assert dest.read_text()==text
else:dest.write_text(text)
print('PASS five source-bound glossary entries')
