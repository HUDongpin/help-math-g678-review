import pathlib,json,hashlib,sys
R=pathlib.Path(__file__).resolve().parents[1];T=pathlib.Path(sys.argv[1]);S=pathlib.Path(sys.argv[2]);ID='shared-nms002-l02-p039';C='g678-nms-l02-p039-native-percent-practice-current-js-v1';W=R/'migrations'/ID
def read(p):return json.loads(p.read_text())
def pin(p):
 p=pathlib.Path(p);assert p.is_file()and not p.is_symlink()and p.resolve()==p;before=p.stat();assert before.st_nlink==1;raw=p.read_bytes();after=p.stat();assert(before.st_ino,before.st_size,before.st_mtime_ns)==(after.st_ino,after.st_size,after.st_mtime_ns);return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(p,obj):
 p.parent.mkdir(parents=True,exist_ok=True);raw=json.dumps(obj,indent=2)+'\n'
 with p.open('x')as f:f.write(raw)
 return pin(p)
prior=read(T/'continuation169-progress-v1.json');assert pin(R/'packages/demos/private-current-js-registry.json')['sha256']==prior['registry']['sha256']
basePath=R/'catalog/product-bridge-calibrations/g678-nms-l02-p038-native-percent-current-js-v1-compile-v2.json';assert pin(basePath)['sha256']=='b49d7f0797fec0d5584a87638a2d7b5be47d0697156e0701a3d4891434021fd2';base=read(basePath)
for record in base['inputs']+base['outputs']:
 path=pathlib.Path(record['path']);assert pin(path if path.is_absolute()else R/path)==record,record['path']
source=pin(S/'G6-G8-shared/NMS002/L2/IN/L2IN24.swf');assert source['sha256']=='cb087b675e4ada79fb53d4a7f7368f69ed96abf6a71ea4c6e56afdaa683bd649';xml=base['sourceXml'];assert pin(S/xml['path'])['sha256']==xml['sha256']
paths={p for p in W.rglob('*')if p.is_file()};patterns=['packages/demos/src/nms-l02-p039-*','packages/demos/src/generated/nms-l02-p039-*','packages/demos/tests/nms-l02-p039-*','apps/web/components/*nms-l02-p039*','apps/web/lib/*nms-l02-p039*','apps/web/tests/nms-l02-p039-*']
for pattern in patterns:paths.update(p for p in R.glob(pattern)if p.is_file())
module=R/'packages/demos/src/modules/g678-nms-l02-native-percent-practice-p039.tsx';timeline=R/'packages/demos/src/timelines/g678-nms-l02-native-percent-practice-p039.ts';paths.update([module,timeline,R/'apps/web/app/[locale]/migration-status/g678-calibration'/ID/'page.tsx',R/'apps/web/app/flash-assets/g678-local'/ID/'source-audio/[domain]/route.ts'])
outputs=[pin(p)for p in sorted(paths)];inputs=[pin(basePath),pin(T/'continuation169-progress-v1.json')]
for name in ['nms-l02-p039-behavior-source-v1','nms-l02-p039-native-ir-v1','nms-l02-p039-source-tools-v1','nms-l02-p039-audio-plans-v1']:
 inputs.extend(pin(p)for p in sorted((T/name).rglob('*'))if p.is_file()and p.name!='.DS_Store')
for p in sorted(R.glob('scripts/*p039*')):
 if p.is_file():inputs.append(pin(p))
closure=read(T/'p039-runtime-metadata-v1/application-dependency-closure-prepared-v1.json')
for record in closure['files']:
 # This older manifest locates dependencies; bind CURRENT bytes, not its historical hashes.
 inputs.append(pin(R/record['path']))
for record in read(R/'catalog/typography-v1/g678-integration.json')['sharedFiles']:inputs.append(pin(R/record['path']))
for rel in ['apps/web/lib/g678-nms-l02-p038.server.ts','apps/web/lib/g678-nms-l02-p038-freeze-v1.ts','apps/web/lib/lesson-runtime-adapter.ts','apps/web/lib/load-animation-module.client.ts','apps/web/proxy.ts']:inputs.append(pin(R/rel))
inputs=list({p['path']:p for p in inputs}.values());spec=put(T/'p039-product-spec-v1.json',{'schemaVersion':1,'animationId':ID,'source':source,'sourceXml':xml,'inputs':inputs,'outputs':outputs,'registered':False,'scaleOutAuthorized':False})
runRoot=R/'work/g678-shared-page-factory'/(C+'-compile-v1');run=put(runRoot/'run-manifest.json',{'schemaVersion':1,'kind':'bounded-hybrid-native-percent-practice-v1','source':source,'sourceSpec':spec,'inputs':inputs,'outputs':outputs,'generatedBy':pin(pathlib.Path(__file__).resolve()),'scaleOutAuthorized':False})
member=put(runRoot/'members'/ID/'member-manifest.json',{'schemaVersion':1,'animationId':ID,'source':source,'sourceSpec':spec,'sourceRun':run,'inputs':inputs,'outputs':outputs,'originalRuntimeAccepted':False,'audioAccepted':False,'humanAccepted':False,'ownerAccepted':False,'strictComplete':False,'published':False})
artifacts={'kind':'maintained-dom-module-v1','module':pin(module),'timeline':pin(timeline),'memberManifest':member,'sourceRun':run};entry={'key':ID,'module':'./modules/g678-nms-l02-native-percent-practice-p039','maturity':'private-current-js','complexityLane':'behavior-heavy','artifacts':artifacts}
plan=read(T/'nms-l02-p039-audio-plans-v1/receipt.json');audio={s['domain']:{**s['source'],'contentType':'audio/mpeg'}for s in plan['streams']if s['nativeSelectable']};audio['230']={**plan['coach']['source'],'contentType':'audio/mpeg'}
page=json.loads(json.dumps(base['selectedPages'][0]));page.update(animationId=ID,sourceSha256=source['sha256'],globalPageOrdinal=39,sectionPageOrdinal=23,complexityLane='behavior-heavy',implementationLane='advanced-manual');page['runtime'].update(frameDomain='sprite-237',frameCount=579,scenario='source-practice',rendererBinding=artifacts)
packet={'schemaVersion':1,'calibrationId':C,'deploymentScope':'local-only','source':source,'sourceXml':xml,'sourceCatalog':base['sourceCatalog'],'sourceSpec':spec,'audio':audio,'entry':entry,'inputs':inputs+[spec],'outputs':outputs+[run,member],'selectedPages':[page],'productCalibrationPassed':False,'scaleOutAuthorized':False,'acceptanceEffects':{'originalRuntime':False,'audioAcceptance':False,'humanReview':False,'ownerAcceptance':False,'strictComplete':False,'publication':False}}
freeze=put(R/'catalog/product-bridge-calibrations'/(C+'-compile-v1.json'),packet)
p=R/'apps/web/lib/g678-nms-l02-p039-freeze-v1.ts'
with p.open('x')as f:f.write('// Exact local engineering candidate; acceptance remains separate.\nexport const NMS_L2_P039_FREEZE=Object.freeze('+json.dumps(freeze,indent=2)+');\n')
put(T/'p039-prepared-registration-v1.json',{'calibrationId':C,'deploymentScope':'local-only','freezeManifest':freeze['path'],'freezeManifestBytes':freeze['bytes'],'freezeManifestSha256':freeze['sha256'],'entries':[entry]})
for record in packet['inputs']+packet['outputs']:
 p=pathlib.Path(record['path']);assert pin(p if p.is_absolute()else R/p)==record
print(json.dumps({'status':'PASS-frozen-not-registered','freeze':freeze,'inputs':len(packet['inputs']),'outputs':len(packet['outputs'])}))
