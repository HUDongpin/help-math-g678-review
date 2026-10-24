from pathlib import Path
import json,hashlib,sys
R=Path(__file__).resolve().parents[1];T=Path(sys.argv[1]);S=Path('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware');ID='shared-nms002-l02-p043';C='g678-nms-l02-p043-native-matching-current-js-v1';W=R/'migrations'/ID
def read(p):return json.loads(p.read_text())
def pin(p):
 p=Path(p);assert p.resolve()==p and p.is_file()and not p.is_symlink();a=p.stat();assert a.st_nlink==1;b=p.read_bytes();z=p.stat();assert(a.st_ino,a.st_size,a.st_mtime_ns)==(z.st_ino,z.st_size,z.st_mtime_ns);return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
def put(p,d):
 p.parent.mkdir(parents=True,exist_ok=True)
 with p.open('x')as f:f.write(json.dumps(d,indent=2)+'\n')
 return pin(p)
def resolve(x):
 p=Path(x['path']);return p if p.is_absolute()else R/p
basePath=R/'catalog/product-bridge-calibrations/g678-nms-l02-p042-native-equivalent-practice-current-js-v1-compile-v3.json';assert pin(basePath)['sha256']=='db20c5a81c88826e081a7755e7b06ce1c63b674b5a56790f1131e0bde92b0dcd';base=read(basePath)
for x in base['inputs']+base['outputs']:assert pin(resolve(x))==x
source=pin(S/'G6-G8-shared/NMS002/L2/TI/L2TI02.swf');assert source['sha256']=='a6a13838f1301d7665dd4f8a96c561fd3ef23e90ffeaf6e433909d26cc419528';xml=base['sourceXml'];assert pin(S/xml['path'])['sha256']==xml['sha256']
paths=set(p for p in W.rglob('*')if p.is_file());patterns=['packages/demos/src/nms-l02-p043-*','packages/demos/src/generated/nms-l02-p043-*','packages/demos/tests/nms-l02-p043-*','apps/web/components/*nms-l02-p043*','apps/web/lib/*nms-l02-p043*','apps/web/tests/nms-l02-p043-*']
for pattern in patterns:paths.update(p for p in R.glob(pattern)if p.is_file())
module=R/'packages/demos/src/modules/g678-nms-l02-native-matching-p043.tsx';timeline=R/'packages/demos/src/timelines/g678-nms-l02-native-matching-p043.ts';paths.update([module,timeline,R/'apps/web/app/[locale]/migration-status/g678-calibration'/ID/'page.tsx',R/'apps/web/app/flash-assets/g678-local'/ID/'source-audio/[domain]/route.ts']);outputs=[pin(p)for p in sorted(paths)]
inputs=[pin(basePath),source,pin(S/xml['path']),pin(T/'continuation250-progress-v1.json')]
for p in sorted(R.glob('scripts/*p043*')):
 if p.is_file():inputs.append(pin(p))
for x in read(R/'catalog/typography-v1/g678-integration.json')['sharedFiles']:inputs.append(pin(R/x['path']))
for rel in ['apps/web/lib/g678-nms-l02-p042.server.ts','apps/web/lib/g678-nms-l02-p042-freeze-v1.ts','apps/web/lib/lesson-runtime-adapter.ts','apps/web/lib/load-animation-module.client.ts','apps/web/proxy.ts','apps/web/lib/g678-preview-policy.ts','apps/web/lib/continuous-source-audio-access.ts']:inputs.append(pin(R/rel))
inputs=list({x['path']:x for x in inputs}.values());spec=put(T/'p043-product-spec-v1.json',{'schemaVersion':1,'animationId':ID,'source':source,'sourceXml':xml,'inputs':inputs,'outputs':outputs,'registered':False,'scaleOutAuthorized':False})
root=R/'work/g678-shared-page-factory'/(C+'-compile-v1');run=put(root/'run-manifest.json',{'schemaVersion':1,'kind':'bounded-native-matching-v1','source':source,'sourceSpec':spec,'inputs':inputs,'outputs':outputs,'generatedBy':pin(Path(__file__).resolve()),'scaleOutAuthorized':False});member=put(root/'members'/ID/'member-manifest.json',{'schemaVersion':1,'animationId':ID,'source':source,'sourceSpec':spec,'sourceRun':run,'inputs':inputs,'outputs':outputs,'originalRuntimeAccepted':False,'audioAccepted':False,'humanAccepted':False,'ownerAccepted':False,'strictComplete':False,'published':False});art={'kind':'maintained-dom-module-v1','module':pin(module),'timeline':pin(timeline),'memberManifest':member,'sourceRun':run};entry={'key':ID,'module':'./modules/g678-nms-l02-native-matching-p043','maturity':'private-current-js','complexityLane':'behavior-heavy','artifacts':art};page=base['selectedPages'][0];page.update(animationId=ID,sourceSha256=source['sha256'],globalPageOrdinal=43,sectionCode='TI',sectionPageOrdinal=1,complexityLane='behavior-heavy');page['runtime'].update(frameDomain='sprite-250',frameCount=225,scenario='source-inspection',rendererBinding=art)
audio={x['domain'].split('-')[1]:{**pin(R/x['source']['path']),'contentType':'audio/wav' if x['domain']=='sprite-183' else 'audio/mpeg'} for x in read(W/'audit/source-pcm-inventory-v1.json')['streams'] if x['domain']!='sprite-247'};packet={'schemaVersion':1,'calibrationId':C,'deploymentScope':'local-only','source':source,'sourceXml':xml,'sourceCatalog':base['sourceCatalog'],'sourceSpec':spec,'audio':audio,'entry':entry,'inputs':inputs+[spec],'outputs':outputs+[run,member],'selectedPages':[page],'productCalibrationPassed':False,'scaleOutAuthorized':False,'acceptanceEffects':base['acceptanceEffects']};f=put(R/'catalog/product-bridge-calibrations'/(C+'-compile-v1.json'),packet)
p=R/'apps/web/lib/g678-nms-l02-p043-freeze-v1.ts'
with p.open('x')as h:h.write('// Exact local engineering candidate; independent acceptance pending.\nexport const NMS_L2_P043_FREEZE=Object.freeze('+json.dumps(f,indent=2)+');\n')
put(T/'p043-prepared-registration-v1.json',{'calibrationId':C,'deploymentScope':'local-only','freezeManifest':f['path'],'freezeManifestBytes':f['bytes'],'freezeManifestSha256':f['sha256'],'entries':[entry]})
for x in packet['inputs']+packet['outputs']:assert pin(resolve(x))==x
print(json.dumps({'freeze':f,'inputs':len(packet['inputs']),'outputs':len(packet['outputs']),'registered':False}))
