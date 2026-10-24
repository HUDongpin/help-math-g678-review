"""Preserve C1, apply the bounded P042 layout patch, and stage C2."""
from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]);E=T/'p042-c2-host-v1';B=T/'p042-c2-toolbar-recovery-v1';ID='shared-nms002-l02-p042';C='g678-nms-l02-p042-native-equivalent-practice-current-js-v1'
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);assert p.resolve()==p and not p.is_symlink();s=p.stat();assert s.st_nlink==1;b=p.read_bytes();a=p.stat();assert(s.st_ino,s.st_size,s.st_mtime_ns)==(a.st_ino,a.st_size,a.st_mtime_ns)
 return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
def put(p,d):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:f.write(json.dumps(d,indent=2)+'\n')
 return pin(p)
p1=R/'catalog/product-bridge-calibrations'/(C+'-compile-v2.json');assert pin(p1)['sha256']=='414f050b718be1e518f54e35cf774579b8ddfef83ea19be197dac3e8bb1f4d6e';old=read(p1)
for x in old['inputs']+old['outputs']:assert pin(resolve(x))==x,x['path']
reg=R/'packages/demos/private-current-js-registry.json';assert pin(reg)['sha256']=='eaff5eb2c52ee3b4cdfa1f233f43d5e4124d6f94f062030ec4b1cd0c3911e448';registry=read(reg)
css=R/'packages/demos/src/nms-l02-p042-presentation-v1.css';pointer=R/'apps/web/lib/g678-nms-l02-p042-freeze-v1.ts'
assert not B.exists();B.mkdir();recovery=[]
for p in [css,pointer,reg,*sorted((R/'packages/demos/src').glob('registry*.generated.ts'))]:
 dest=B/p.relative_to(R);dest.parent.mkdir(parents=True,exist_ok=True);dest.write_bytes(p.read_bytes());recovery.append({'original':pin(p),'recovery':pin(dest)})
recoveryPin=put(B/'receipt.json',{'priorFreeze':pin(p1),'files':recovery,'reason':'P042 narrow typography layout C2'})
patch=E/'candidate-toolbar-v3.css';css.write_text(css.read_text()+'\n'+patch.read_text())
inputs=[pin(resolve(x))for x in old['inputs']if x['path']!=old['sourceSpec']['path']]
inputs.extend([pin(p1),recoveryPin,pin(Path(__file__).resolve()),pin(patch),pin(E/'es-layout-v1.log'),pin(E/'es-layout-patch-v1.log')]);inputs=list({x['path']:x for x in inputs}.values())
art=old['entry']['artifacts'];excluded={art['sourceRun']['path'],art['memberManifest']['path']};outputs=[pin(resolve(x))for x in old['outputs']if x['path']not in excluded]
spec=read(resolve(old['sourceSpec']));spec.update(inputs=inputs,outputs=outputs);specPin=put(T/'p042-product-spec-v3.json',spec)
run=read(resolve(art['sourceRun']));run.update(inputs=inputs,outputs=outputs,sourceSpec=specPin,generatedBy=pin(Path(__file__).resolve()));root=R/'work/g678-shared-page-factory'/(C+'-compile-v3');runPin=put(root/'run-manifest.json',run)
member=read(resolve(art['memberManifest']));member.update(inputs=inputs,outputs=outputs,sourceSpec=specPin,sourceRun=runPin);memberPin=put(root/'members'/ID/'member-manifest.json',member)
art.update(sourceRun=runPin,memberManifest=memberPin);old['selectedPages'][0]['runtime']['rendererBinding']=art
old.update(inputs=inputs+[specPin],outputs=outputs+[runPin,memberPin],sourceSpec=specPin)
p2=R/'catalog/product-bridge-calibrations'/(C+'-compile-v3.json');f=put(p2,old)
pointer.write_text('// Exact local engineering candidate; acceptance remains separate.\nexport const NMS_L2_P042_FREEZE=Object.freeze('+json.dumps(f,indent=2)+');\n')
for cal in registry['calibrations']:
 if cal['calibrationId']==C:cal.update(freezeManifest=f['path'],freezeManifestBytes=f['bytes'],freezeManifestSha256=f['sha256'],entries=[old['entry']])
reg.write_text(json.dumps(registry,indent=2)+'\n')
for x in old['inputs']+old['outputs']:assert pin(resolve(x))==x,x['path']
put(T/'p042-toolbar-c3-staging-v1.json',{'freeze':f,'registry':pin(reg),'inputs':len(old['inputs']),'outputs':len(old['outputs']),'recovery':recoveryPin,'registeredRows':461,'admitted':460,'finalTypographyPassed':False})
print(json.dumps({'freeze':f,'inputs':len(old['inputs']),'outputs':len(old['outputs']),'status':'C3-staged-not-admitted'}))
