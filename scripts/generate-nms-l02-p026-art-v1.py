from pathlib import Path
import json,hashlib,re,xml.etree.ElementTree as E,sys
R=Path(__file__).resolve().parents[1];p=Path('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l02-p026-native-ir-v2/source-ir.json');b=p.read_bytes();assert hashlib.sha256(b).hexdigest()=='afe9ced14aa6d78eaf5396e0a5668631bfe77171087478c358a3018f6f714484'
ir=json.loads(b);out={}
for i in [4,27,32,34,52,54,56,71,73,75,77]:
 a=ir['art'][str(i)];source=Path(a['source']['path']);raw=source.read_bytes();assert hashlib.sha256(raw).hexdigest()==a['source']['sha256'];e=E.fromstring(raw);g=e.find('{http://www.w3.org/2000/svg}g');m=[float(x)for x in re.findall(r'[-+]?(?:\d*\.\d+|\d+)',g.get('transform'))];assert m[:4]==[1,0,0,1]and len(m)==6;assert not a['morphs']and not a['elementMorphs']and not a['elementTransforms'];assert '<script'not in a['body']and 'data:'not in a['body'];out[str(i)]=dict(body=a['body'],viewBox=[-m[4],-m[5],float(e.get('width').removesuffix('px')),float(e.get('height').removesuffix('px'))])
s='// Generated source illustrations; never edit. Native text/math are separate.\nexport const P026_ART:Readonly<Record<string,{readonly body:string;readonly viewBox:readonly number[]}>> = '+json.dumps(out,separators=(',',':'))+';\n';target=R/'packages/demos/src/generated/nms-l02-p026-art-v1.ts'
if '--check'in sys.argv:assert target.read_text()==s
else:
 with target.open('x')as f:f.write(s)
print(json.dumps(dict(status='PASS',shapes=len(out))))
