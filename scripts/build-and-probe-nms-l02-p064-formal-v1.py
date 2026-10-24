#!/usr/bin/env python3
"""Formal P064 local build/probe; preserve every older physical build and link."""
import datetime, hashlib, json, os, pathlib, signal, socket, subprocess, sys, time
ROOT=pathlib.Path(__file__).resolve().parent.parent
if not __debug__:
 raise RuntimeError('Safety checks require ordinary Python execution')
BASE=ROOT/'output/nms-l02-p064-product-20260928/admission'
LOGICAL='apps/web/.next-alg-p001-production-scan'
P055='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
P057='/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2'
P058='/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2'
P060='/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1'
P061='/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3'
P062='/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1'
P064_PRODUCT='/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1'
NEW='/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1'
LINK=ROOT/LOGICAL
assert LINK.is_symlink(),'Existing configured build link required'
OLD=os.readlink(LINK)
assert OLD==P055,'Exact original P055 build link required'
CONFIG=['apps/web/next-env.d.ts','apps/web/tsconfig.json','apps/web/next.config.ts']
INPUTS=['scripts/build-and-probe-nms-l02-p064-formal-v1.py',
 'scripts/check-nms-l02-p064-formal-v1.mjs',
 'scripts/check-nms-l02-p064-formal-v1.test.mjs',
 'scripts/build-and-probe-nms-l02-p064-product-v1.py',
 'scripts/check-nms-l02-p064-product-v1.mjs',
 'scripts/check-nms-l02-p064-product-v1.test.mjs',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p064/page.tsx',
 'apps/web/lib/nms-l02-p064-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p064-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p064-candidate-descriptor-v1.ts',
 'apps/web/components/g678-nms-l02-p064-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p064-question-audio-access.ts',
 'apps/web/lib/nms-l02-p064-question-audio-response.ts',
 'apps/web/lib/nms-l02-p064-question-audio-source.ts',
 'apps/web/lib/nms-l02-p064-question-audio.production-stub.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/question-audio/[folder]/[question]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p064/option-audio/[folder]/[question]/[option]/route.ts',
 'apps/web/components/nms-l02-p056-host-v1.css',
 'apps/web/components/nms-l02-p057-host-v1.css',
 'apps/web/components/nms-l02-p058-host-v1.css',
 'apps/web/components/nms-l02-p060-host-v1.css',
 'apps/web/components/nms-l02-p061-host-v1.css',
 'apps/web/components/nms-l02-p062-host-v1.css',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 'packages/demos/src/nms-l02-p064-presentation-data-v1.ts',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/modules/shared-nms002-l02-p064.tsx',
 'packages/demos/src/timelines/shared-nms002-l02-p064.ts',
 'apps/web/lib/nms-l02-p064-admission.server.ts',
 'apps/web/lib/nms-l02-p064-admission-activation.ts',
 'apps/web/lib/nms-l02-p064-descriptor-extension.ts',
 'lib/nms-l02-p064-admission-semantics-v1.mjs',
 'lib/nms-l02-p064-admission-semantics-v1.test.mjs',
 'scripts/prepare-nms-l02-p064-admission.mjs',
 'scripts/prepare-nms-l02-p064-admission.test.mjs',
 'work/g678-shared-page-factory/g678-nms-l02-p064-source-quiz-current-js-v1/run-manifest.json',
 'work/g678-shared-page-factory/g678-nms-l02-p064-source-quiz-current-js-v1/members/shared-nms002-l02-p064/member-manifest.json',
 'catalog/product-bridge-calibrations/g678-nms-l02-p064-source-quiz-current-js-v1.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p064-v1.json',
 'output/nms-l02-p064-product-20260928/admission/host-v14-seal-receipt.json',
 'output/nms-l02-p064-product-20260928/admission/page-prepare-receipt.json',
 'output/nms-l02-p064-product-20260928/admission/production-build-receipt-v1.json',
 'output/nms-l02-p064-product-20260928/production/formal-candidate-v1.json',
 'catalog/nms-l02-admission-v1/host-v13.json',
 'catalog/nms-l02-admission-v1/host-v14.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',
 'output/nms-l02-p062-product-20260928/admission/host-v13-seal-receipt.json',
 'output/nms-l02-p062-product-20260928/admission/page-prepare-receipt.json',
 'packages/demos/private-current-js-registry.json']
def now():return datetime.datetime.now(datetime.timezone.utc).isoformat()
def pin(p):
 b=(ROOT/p).read_bytes();return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def save(p,obj):
 with p.open('x') as f:json.dump(obj,f,indent=2);f.write('\n')
def free(port):
 with socket.socket() as s:
  try:s.bind(('127.0.0.1',port));return True
  except OSError:return False
if sys.argv[1:]==['--plan']:
 assert LINK.is_symlink() and os.readlink(LINK)==P055,'Exact original build link required'
 assert not os.path.lexists(NEW),'Never overwrite an earlier formal P064 build'
 missing=[p for p in CONFIG+INPUTS if not (ROOT/p).is_file()]
 old_builds=[pin(root+'/BUILD_ID') for root in [P055,P057,P058,P060,P061,P062,P064_PRODUCT]]
 print(json.dumps(dict(schemaVersion=1,kind='nms-l02-p064-formal-build-plan-v1',
  logicalPath=LOGICAL,beforeTarget=P055,newPhysicalRoot=NEW,
  preservedBuildIds=old_builds,inputs=[pin(p) for p in INPUTS if p not in missing],
  missingInputs=missing,ready=len(missing)==0,
  config=[pin(p) for p in CONFIG],writesPerformed=False)))
 sys.exit(0)
assert not sys.argv[1:],'Usage: build-and-probe-nms-l02-p064-formal-v1.py [--plan]'
assert str(LINK.resolve())==OLD
assert pathlib.Path(OLD).resolve()==pathlib.Path(OLD)
assert pathlib.Path(P057).resolve()==pathlib.Path(P057)
assert pathlib.Path(P058).resolve()==pathlib.Path(P058)
assert pathlib.Path(P055).resolve()==pathlib.Path(P055)
assert pathlib.Path(P060).resolve()==pathlib.Path(P060)
assert pathlib.Path(P061).resolve()==pathlib.Path(P061)
assert pathlib.Path(P062).resolve()==pathlib.Path(P062)
assert pathlib.Path(P064_PRODUCT).resolve()==pathlib.Path(P064_PRODUCT)
assert free(3331) and free(3332),'Stop the owned development server before this build; ports must be unused'
assert not os.path.lexists(NEW),'Never overwrite an earlier formal P064 build'
DEPENDENCY_LINK=pathlib.Path(NEW).parent/'node_modules'
DEPENDENCY_TARGET=str(ROOT/'node_modules')
assert (ROOT/'node_modules/sharp/package.json').is_file(),'Existing sharp package required'
for p in CONFIG+INPUTS:assert (ROOT/p).is_file(),p
assert not DEPENDENCY_LINK.parent.is_symlink(),'Physical build parent required'
if not os.path.lexists(DEPENDENCY_LINK):
 DEPENDENCY_LINK.parent.mkdir(parents=True,exist_ok=True)
 assert DEPENDENCY_LINK.parent.resolve()==DEPENDENCY_LINK.parent,'Physical dependency-link parent'
 DEPENDENCY_LINK.symlink_to(DEPENDENCY_TARGET)
assert DEPENDENCY_LINK.is_symlink() and os.readlink(DEPENDENCY_LINK)==DEPENDENCY_TARGET,'Exact dependency link required'
assert DEPENDENCY_LINK.resolve()==(ROOT/'node_modules').resolve(),'Dependency link physical target'
BASE.mkdir(parents=True,exist_ok=True)
for name in ['formal-production-build-v1.log','formal-production-server-v1.log','formal-production-build-receipt-v1.json','formal-production-build-link-restoration-v1.json','formal-production-build-intent-v1.json']:
 assert not (BASE/name).exists(),name
original={p:(ROOT/p).read_bytes() for p in CONFIG}
config_pins=[pin(p) for p in CONFIG]
inputs=[pin(p) for p in INPUTS]
old_id=pin(OLD+'/BUILD_ID')
p057_id=pin(P057+'/BUILD_ID')
p058_id=pin(P058+'/BUILD_ID')
p055_id=pin(P055+'/BUILD_ID')
p060_id=pin(P060+'/BUILD_ID')
p061_id=pin(P061+'/BUILD_ID')
p062_id=pin(P062+'/BUILD_ID')
p064_product_id=pin(P064_PRODUCT+'/BUILD_ID')
env=dict(os.environ)
selected=dict(NODE_ENV='production',NODE_OPTIONS='--max-old-space-size=12288',NEXT_TELEMETRY_DISABLED='1',HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',HELP_MATH_G678_LOCAL_PREVIEW='true',HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware',HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
env.update(selected)
intent=dict(schemaVersion=1,kind='nms-l02-p064-formal-production-build-intent-v1',startedAt=now(),logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,oldBuildId=old_id,preservedP055BuildId=p055_id,preservedP057BuildId=p057_id,preservedP058BuildId=p058_id,preservedP060BuildId=p060_id,preservedP061BuildId=p061_id,preservedP062BuildId=p062_id,preservedP064ProductBuildId=p064_product_id,inputs=inputs,config=config_pins,dependencyLink=str(DEPENDENCY_LINK),dependencyTarget=DEPENDENCY_TARGET,dependencyRealRoot=str((ROOT/'node_modules').resolve()),sharpPackage=pin('node_modules/sharp/package.json'))
save(BASE/'formal-production-build-intent-v1.json',intent)
for p,b in original.items():
 with (BASE/('formal-production-backup-v1-'+pathlib.Path(p).name)).open('xb') as f:f.write(b)
record=dict(schemaVersion=1,kind='p064-formal-local-production-build-v1',startedAt=now(),command=['npm','run','build','--workspace','@helpmath/web'],configBefore=config_pins,inputsBefore=inputs,selectedNonSecretEnvironment=selected)
def restore_config():
 restored=[]
 for p,b in original.items():
  current=(ROOT/p).read_bytes()
  if current!=b:
   assert p=='apps/web/next-env.d.ts','Unexpected configuration mutation'
   expected=b.replace(b'./.next-current-js-candidate-qa/dev/types/',b'./.next-alg-p001-production-scan/types/')
   assert current==expected,'Unknown generated next-env change; preserve for inspection'
   assert (ROOT/p).read_bytes()==current
   (ROOT/p).write_bytes(b);restored.append(p)
 return restored
def switch_link(expected,target,label):
 temporary=LINK.with_name(LINK.name+'.p064-'+label)
 assert not os.path.lexists(temporary),'Temporary link exists'
 assert LINK.is_symlink() and os.readlink(LINK)==expected
 temporary.symlink_to(target)
 try:
  assert LINK.is_symlink() and os.readlink(LINK)==expected,'Concurrent link mutation'
  os.replace(temporary,LINK)
 finally:
  if temporary.is_symlink() and os.readlink(temporary)==target:temporary.unlink()
 assert os.readlink(LINK)==target
server=None;changed=False;build_ok=False;failure=None
try:
 pathlib.Path(NEW).mkdir(parents=True,exist_ok=False)
 assert DEPENDENCY_LINK.is_symlink() and os.readlink(DEPENDENCY_LINK)==DEPENDENCY_TARGET
 assert DEPENDENCY_LINK.resolve()==(ROOT/'node_modules').resolve()
 assert os.readlink(LINK)==OLD
 switch_link(OLD,NEW,'switch');changed=True
 with (BASE/'formal-production-build-v1.log').open('x') as log:
  run=subprocess.Popen(record['command'],cwd=ROOT,env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  try:run.wait(timeout=900)
  except BaseException:
   os.killpg(run.pid,signal.SIGTERM)
   try:run.wait(timeout=10)
   except subprocess.TimeoutExpired:os.killpg(run.pid,signal.SIGKILL);run.wait(timeout=10)
   raise
 record['exitCode']=run.returncode
 record['configAfterBuild']=[pin(p) for p in CONFIG]
 record['restoredConfig']=restore_config()
 record['configAfterRestore']=[pin(p) for p in CONFIG]
 record['configRestored']=record['configAfterRestore']==config_pins
 record['inputsAfter']=[pin(p) for p in INPUTS]
 record['inputsStable']=record['inputsAfter']==inputs
 assert run.returncode==0 and record['configRestored'] and record['inputsStable']
 record['dependencyBinding']={key:intent[key] for key in ['dependencyLink','dependencyTarget','dependencyRealRoot','sharpPackage']}
 record['buildId']={**pin(NEW+'/BUILD_ID'),'path':LOGICAL+'/BUILD_ID'}
 record['finishedAt']=now()
 save(BASE/'formal-production-build-receipt-v1.json',record);build_ok=True
 with (BASE/'formal-production-server-v1.log').open('x') as log:
  server=subprocess.Popen(['node','../../node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3332'],cwd=ROOT/'apps/web',env=env,stdout=log,stderr=subprocess.STDOUT)
  for _ in range(80):
   assert server.poll() is None,'Owned production server exited'
   if not free(3332):break
   time.sleep(.25)
  else:raise RuntimeError('Production server not ready')
  probe=subprocess.run(['node','scripts/check-nms-l02-p064-formal-v1.mjs','--run','formal-admission-candidate-v1'],cwd=ROOT,env=env,timeout=900)
  assert probe.returncode==0,'Production negative check failed'
except BaseException as error:
 failure=str(error)
 raise
finally:
 if server is not None and server.poll() is None:
  server.terminate()
  try:server.wait(timeout=10)
  except subprocess.TimeoutExpired:server.kill();server.wait(timeout=10)
 restored=LINK.is_symlink() and os.readlink(LINK)==OLD
 link_failure=None
 try:
  if changed or (LINK.is_symlink() and os.readlink(LINK)==NEW):
   assert LINK.is_symlink() and os.readlink(LINK)==NEW,'Link changed concurrently; do not overwrite'
   switch_link(NEW,OLD,'restore');restored=os.readlink(LINK)==OLD
 except Exception as error:link_failure=str(error)
 config_failure=None
 try:restore_config()
 except Exception as error:config_failure=str(error)
 restoration=dict(schemaVersion=1,kind='nms-l02-p064-formal-production-build-link-restoration-v1',logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,afterTarget=os.readlink(LINK) if LINK.is_symlink() else None,restored=restored,p064FormalBuildId=pin(NEW+'/BUILD_ID') if pathlib.Path(NEW+'/BUILD_ID').is_file() else None,oldBuildIdBefore=old_id,oldBuildIdAfter=pin(OLD+'/BUILD_ID'),p055BuildIdBefore=p055_id,p055BuildIdAfter=pin(P055+'/BUILD_ID'),p057BuildIdBefore=p057_id,p057BuildIdAfter=pin(P057+'/BUILD_ID'),p058BuildIdBefore=p058_id,p058BuildIdAfter=pin(P058+'/BUILD_ID'),p060BuildIdBefore=p060_id,p060BuildIdAfter=pin(P060+'/BUILD_ID'),p061BuildIdBefore=p061_id,p061BuildIdAfter=pin(P061+'/BUILD_ID'),p062BuildIdBefore=p062_id,p062BuildIdAfter=pin(P062+'/BUILD_ID'),p064ProductBuildIdBefore=p064_product_id,p064ProductBuildIdAfter=pin(P064_PRODUCT+'/BUILD_ID'),buildSucceeded=build_ok,failure=failure,linkRestorationFailure=link_failure,configurationCleanupFailure=config_failure,finishedAt=now())
 save(BASE/'formal-production-build-link-restoration-v1.json',restoration)
 if not build_ok:
  record['failure']=failure;record['finishedAt']=now()
  save(BASE/'formal-production-build-failed-v1.json',record)
 assert restoration['oldBuildIdAfter']==old_id and restoration['p055BuildIdAfter']==p055_id and restoration['p057BuildIdAfter']==p057_id and restoration['p058BuildIdAfter']==p058_id and restoration['p060BuildIdAfter']==p060_id and restoration['p061BuildIdAfter']==p061_id and restoration['p062BuildIdAfter']==p062_id and restoration['p064ProductBuildIdAfter']==p064_product_id and restored and config_failure is None and link_failure is None
print(json.dumps(dict(status='P064_FORMAL_LOCAL_PRODUCTION_BUILD_AND_DENIAL_CHECK_PASSED',restored=restored)))
