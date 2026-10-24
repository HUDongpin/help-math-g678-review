import pathlib,json,hashlib,sys
R=pathlib.Path(__file__).resolve().parents[1];T=pathlib.Path(sys.argv[1]);S=pathlib.Path(sys.argv[2]);D=T/'p039-runtime-metadata-v1';ID='shared-nms002-l02-p039'
def read(p):return json.loads(p.read_text())
def pin(p):
 assert p.is_file()and not p.is_symlink();a=p.stat();raw=p.read_bytes();z=p.stat();assert(a.st_size,a.st_mtime_ns)==(z.st_size,z.st_mtime_ns);return {'path':str(p.relative_to(R))if p.is_relative_to(R)else str(p),'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()}
def put(p,v):
 data=json.dumps(v,indent=2)+'\n'
 if p.exists():assert p.read_text()==data,'Prepared output drift: '+str(p)
 else:p.write_text(data)
 return pin(p)
meta=read(D/'import-metafile.json');files=[];toolchain=[];nodeRoot=(R/'node_modules').resolve()
for rel,info in meta['inputs'].items():
 if 'node_modules' in pathlib.Path(rel).parts:
  dependency=(R/rel).resolve();assert dependency.is_relative_to(nodeRoot);toolchain.append(pin(dependency));continue
 p=R/rel;assert p.resolve().is_relative_to(R.resolve());record=pin(p)
 if not rel.endswith('.css'):assert record['bytes']==info['bytes'],rel
 files.append(record)
extra=['packages/demos/src/timelines/g678-nms-l02-native-percent-practice-p039.ts','apps/web/app/lesson-fonts.css','apps/web/public/fonts/lesson-v1/nunito-sans-variable.ttf','apps/web/public/fonts/lesson-v1/fredoka-variable.ttf','package-lock.json']
for rel in extra:files.append(pin(R/rel))
files=list({x['path']:x for x in files}.values());runtime=read(D/'runtime.json');assert runtime['animationId']==ID and runtime['runtime']['defaultFrameDomain']=='sprite-237'
registry=pin(R/'packages/demos/private-current-js-registry.json');assert registry['sha256']==read(T/'continuation167-progress-v1.json')['registry']['sha256']
closure=put(D/'application-dependency-closure-prepared-v1.json',{'schemaVersion':1,'animationId':ID,'kind':'current-application-import-closure-preparation','collectorMetafile':pin(D/'import-metafile.json'),'collectorBundle':pin(D/'collector.cjs'),'runtimeMetadata':pin(D/'runtime.json'),'files':files,'toolchainDependencies':toolchain,'cssTreatment':'CSS omitted only for Node metadata collection; original CSS bytes pinned here and separately browser-verified.','thirdPartyScope':'Verified shared Node dependencies are recorded separately from application files; package-lock also pinned.','completeReleaseClosure':False,'missing':['Official server packet/descriptor/routes','My Lesson host adapter changes','Final typography/check evidence and protected candidate freeze'],'registrationEffect':'none'})
W=R/'migrations'/ID;source=pin(S/'G6-G8-shared/NMS002/L2/IN/L2IN24.swf');xml=pin(S/'G6-G8-shared/NMS002/L2/index.xml');assert source['sha256']==runtime['source']['sourceSwfSha256']
inputs=[source,xml,pin(D/'runtime.json'),closure,pin(W/'audit/source-specification-v1.json'),pin(W/'audit/native-behavior-decisions-v1.json'),pin(T/'nms-l02-p039-audio-plans-v1/receipt.json'),pin(T/'continuation166-progress-v1.json'),pin(T/'continuation167-progress-v1.json')]
outputs=files+[pin(W/p)for p in ['migration.json','MIGRATION_BRIEF.md','asset-inventory.csv','audio-inventory.csv']]
run=put(D/'source-run-prepared-v1.json',{'schemaVersion':1,'kind':'bounded-native-percent-practice-preparation','animationId':ID,'source':source,'sourceXml':xml,'inputs':inputs,'outputs':outputs,'generatedBy':pin(pathlib.Path(__file__).resolve()),'stage':'preparation-only','registered':False,'scaleOutAuthorized':False})
member=put(D/'member-manifest-prepared-v1.json',{'schemaVersion':1,'animationId':ID,'source':source,'sourceXml':xml,'sourceRun':run,'inputs':inputs,'outputs':outputs,'runtime':runtime['runtime'],'scenarios':runtime['scenarios'],'placement':{'moduleCode':'NMS002','lessonNumber':2,'globalPageOrdinal':39,'sectionCode':'IN','sectionPageOrdinal':23,'title':'Percent Practice'},'implementationLane':'advanced-manual','complexityLane':'behavior-heavy','stage':'preparation-only','registered':False,'originalRuntimeAccepted':False,'fidelityAccepted':False,'audioAccepted':False,'humanAccepted':False,'ownerAccepted':False,'strictComplete':False,'published':False})
# Recheck every recorded application and source pin immediately after writing.
for record in inputs+outputs:
 p=pathlib.Path(record['path']);p=p if p.is_absolute()else R/p;assert pin(p)==record
print(json.dumps({'status':'PASS-preparation-only','applicationAndAssetPins':len(files),'member':member,'sourceRun':run,'registryUnchanged':True}))
