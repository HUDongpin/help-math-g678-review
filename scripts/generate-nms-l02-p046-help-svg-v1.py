from pathlib import Path
import json,hashlib,xml.etree.ElementTree as E,sys
R=Path(__file__).resolve().parents[1];A=R/'migrations/shared-nms002-l02-p046/audit';source=json.loads((A/'shape-export-inventory-v1.json').read_text());assert source['sourceSha256']=='c82da2eb14e6db6fbb876e795edd8a8ebc1e890a52d9e7b1b1f5e66153b8cb62';row=next(s for s in source['shapes']if s['characterId']==22);p=R/row['path'];raw=p.read_bytes();assert hashlib.sha256(raw).hexdigest()==row['sha256'];root=E.fromstring(raw);allowed={'svg','g','path','defs','linearGradient','radialGradient','stop'};attrs={'width','height','viewBox','id','transform','d','fill','fill-rule','stroke','stroke-width','stroke-linecap','stroke-linejoin','offset','stop-color','stop-opacity','gradientUnits','gradientTransform','spreadMethod','x1','y1','x2','y2','cx','cy','r','fx','fy'}
for el in root.iter():
 el.tag=el.tag.split('}')[-1];assert el.tag in allowed
 for key in list(el.attrib):
  if key.startswith('{https://www.free-decompiler.com/flash}'):del el.attrib[key];continue
  assert key in attrs,(el.tag,key);value=el.attrib[key];assert 'url('not in value or value.startswith('url(#')and value.endswith(')')
ids=[el.get('id')for el in root.iter()if el.get('id')];markup=''.join(E.tostring(el,encoding='unicode')for el in root)
for ident in ids:markup=markup.replace('id="'+ident+'"','id="__P046_HELP__'+ident+'"').replace('#'+ident+')','#__P046_HELP__'+ident+')')
asset={'width':float(root.get('width').removesuffix('px')),'height':float(root.get('height').removesuffix('px')),'markup':markup};out=R/'packages/demos/src/generated/nms-l02-p046-help-svg-v1.ts';text='// Generated from exact source shape22; do not edit.\nexport const P046_HELP_SVG='+json.dumps(asset,separators=(',',':'))+' as const;\n'
if out.exists()or '--check'in sys.argv:assert out.read_text()==text
else:out.write_text(text)
print(json.dumps({'sourceSvgSha256':row['sha256'],'width':asset['width'],'height':asset['height'],'gradientIds':len(ids)}))
