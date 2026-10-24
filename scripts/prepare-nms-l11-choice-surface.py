"""Derive source hit rectangles and exact glossary intervals for the NMS surface."""
import hashlib,importlib.util,json,re,xml.etree.ElementTree as E
from pathlib import Path
R=Path(__file__).resolve().parent.parent;B=Path('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f');O=R/'work/g678-shared-page-factory/nms-l11-choice-surface-v1';pins={}
def read(p):
 p=Path(p);b=p.read_bytes();pins[str(p)]={'path':str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()};return b
contract=json.loads(read(B/'interactive-source-audit-v1/nms-l11-contract.json'));x=E.fromstring(read(contract['sourceXml']['path']));assert pins[contract['sourceXml']['path']]==contract['sourceXml'];defs={int(n.get('objectID')):n for n in x.iter() if n.tag.startswith('Define') and n.tag not in ('DefineFontName','DefineFontInfo','DefineFontInfo2') and n.get('objectID')}
canvasPackage=json.loads(read(R/'work/g678-shared-page-factory/nms-l11-interactive-canvas-v1/manifest.json'));asset=next(p for p in canvasPackage['outputs'] if p['path'].endswith('/canvas-renderer.js'));code=read(asset['path']).decode();assert pins[asset['path']]==asset
assert 'ctx.transform(1,0,0,1,598.95,220.15);' in code and 'ctx.transform(1, 0, 0, 1, -186.55000000000007, 63.150000000000006);' in code
# Matrix [a,b,c,d,tx,ty], directly composing authored twips before the Canvas stage normalization.
def matrix(n):
 t=n.find('transform/Transform');a={} if t is None else t.attrib
 return [float(a.get('scaleX',1)),float(a.get('skewY',0)),float(a.get('skewX',0)),float(a.get('scaleY',1)),float(a.get('transX',0)),float(a.get('transY',0))]
def mult(a,b):return [a[0]*b[0]+a[2]*b[1],a[1]*b[0]+a[3]*b[1],a[0]*b[2]+a[2]*b[3],a[1]*b[2]+a[3]*b[3],a[0]*b[4]+a[2]*b[5]+a[4],a[1]*b[4]+a[3]*b[5]+a[5]]
def rect(id,m):
 n=defs[id];r=n.find('bounds/Rectangle');assert r is not None,(id,n.tag);a={k:float(v) for k,v in r.attrib.items()};corners=[(m[0]*px+m[2]*py+m[4],m[1]*px+m[3]*py+m[5]) for px in [a['left'],a['right']] for py in [a['top'],a['bottom']]];return min(x for x,y in corners),min(y for x,y in corners),max(x for x,y in corners),max(y for x,y in corners)
def hit(id,m):
 boxes=[rect(int(n.get('objectID')),mult(m,matrix(n))) for n in defs[id].find('buttons') if n.get('objectID') and n.get('hitTest')=='1'];assert boxes,id;l,t,r,b=min(v[0] for v in boxes),min(v[1] for v in boxes),max(v[2] for v in boxes),max(v[3] for v in boxes);assert 0<=l<r<=800 and 0<=t<b<=600,(id,l,t,r,b);return {'x':l,'y':t,'width':r-l,'height':b-t}
base=[.05,0,0,.05,412.4,283.3];main=defs[260];popup=defs[39]
def placement(parent,char):
 n=[t for t in parent.find('tags') if t.tag.startswith('PlaceObject') and t.get('objectID')==str(char)];assert len(n)==1,(char,len(n));return n[0]
popupMatrix=mult(base,matrix(placement(main,39)));answer=[]
for a in contract['question']['answers']:answer.append({**a,'hitBounds':hit(a['sourceCharacterId'],mult(base,matrix(placement(main,a['sourceCharacterId']))))})
helpHit=hit(40,mult(base,matrix(placement(main,40))));closeHit=hit(38,mult(popupMatrix,matrix(placement(popup,38))))
helper=R/'scripts/audit-g678-frozen16-glossary.py';read(helper);spec=importlib.util.spec_from_file_location('gl',helper);mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);mainRanges,_=mod.button_ranges(main,{51,52});popupRanges,_=mod.button_ranges(popup,{12,13,14,26,27,28});glossary=[]
for g in contract['glossary']:
 char=g['sourceCharacterId'];nested=g['parent']=='popup-39';ranges=popupRanges[char] if nested else mainRanges[char];glossary.append({**g,'entryId':re.sub('[^a-z0-9]+','-',g['sourceKeyAttribute'].lower()).strip('-'),'ranges':ranges,'hitBounds':hit(char,mult(popupMatrix if nested else base,matrix(placement(popup if nested else main,char))))})
config={'animationId':contract['animationId'],'sourceSwfSha256':contract['source']['sha256'],'assetSource':'/flash-assets/g678-local/'+contract['animationId']+'/canvas-renderer.js','assetSha256':asset['sha256'],'answers':answer,'helpHitBounds':helpHit,'closeHelpHitBounds':closeHit,'glossary':glossary,'question':contract['question'],'hint':contract['hint']};read(__file__);outputs={'config.json':(json.dumps(config,ensure_ascii=False,indent=2)+'\n').encode()};manifest={'status':'source-derived-choice-surface-config','source':contract['source'],'sourceCanvas':asset,'inputs':list(pins.values()),'outputs':[{'path':str(O/k),'bytes':len(v),'sha256':hashlib.sha256(v).hexdigest()} for k,v in outputs.items()],'registered':False,'productCalibrationPassed':False};outputs['manifest.json']=(json.dumps(manifest,indent=2)+'\n').encode();O.mkdir()
for k,v in outputs.items():
 with (O/k).open('xb') as f:f.write(v)
print(json.dumps({'output':str(O),'answers':len(answer),'glossary':len(glossary),'help':helpHit,'close':closeHit,'mainRanges':mainRanges}))
