from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
R=Path(__file__).resolve().parents[1];p=Path('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p027-native-ir-v2/source-ir.json');assert hashlib.sha256(p.read_bytes()).hexdigest()=='7652f0dd367bf73257f914ed30d2e92f840cf203915617f89f5c87360b239751'
ir=json.loads(p.read_text());suppressed=[1,2,6,8,10,11,13,19,25,26,28,30,32,34,46,47,48,49,51,52,53,54,56,72,95,110,186,188,196,197,201,204,205,206]
art={k:v for k,v in ir['art'].items()if int(k)not in suppressed}
for key in ['84','92']:
 a=art[key];root=E.fromstring('<svg>'+a['body']+'</svg>');paths=list(root.iter('path'));assert len(paths)==9
 for item in paths[7:9]:root.remove(item)
 a['body']=''.join(E.tostring(n,encoding='unicode')for n in root)
for a in art.values():
 a.pop('source');assert '<text'not in a['body']and '<animate'not in a['body']and '<script'not in a['body']
value=dict(art=art,images=ir['images'],maskGeometry=ir['maskGeometry'],suppressedShapeIds=suppressed)
s='// Generated source feedback art. Teaching text/math and controls are native. Never edit.\nimport type{P027ArtData}from"../nms-l02-p027-source-contract-v1";\nexport const P027_ART:P027ArtData = '+json.dumps(value,separators=(',',':'))+';\n';out=R/'packages/demos/src/generated/nms-l02-p027-art-ir-v1.ts'
if '--check'in sys.argv:assert out.read_text()==s
else:
 with out.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',retainedShapes=len(art),bitmaps=len(ir['images']),suppressed=len(suppressed))))
