#!/usr/bin/env python3
"""Local P058 build/probe; preserve older physical builds and restore the shared link."""
import datetime, hashlib, json, os, pathlib, signal, socket, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE=ROOT/'output/nms-l02-p058-product-20260927/admission'
LOGICAL='apps/web/.next-alg-p001-production-scan'
OLD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
P057='/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2'
NEW='/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v1'
LINK=ROOT/LOGICAL
CONFIG=['apps/web/next-env.d.ts','apps/web/tsconfig.json','apps/web/next.config.ts']
INPUTS=['scripts/build-and-probe-nms-l02-p058-production-v1.py',
 'scripts/check-nms-l02-p058-production-negative-v1.mjs',
 'apps/web/lib/nms-l02-p058-admission-activation.ts',
 'apps/web/lib/nms-l02-p058-admission.server.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p058/page.tsx',
 'apps/web/components/g678-nms-l02-p058-candidate-lesson-v1.generated.tsx',
 'apps/web/components/nms-l02-p058-lesson-runtime-v1.tsx',
 'apps/web/lib/nms-l02-p058-assets.server.ts',
 'apps/web/app/migration-assets/nms-l02-p058/[asset]/route.ts',
 'catalog/nms-l02-admission-v1/host-v8.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p058-v1.json',
 'output/nms-l02-p058-product-20260927/admission/host-v8-seal-receipt.json',
 'output/nms-l02-p058-product-20260927/admission/page-prepare-receipt.json',
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
assert os.readlink(LINK)==OLD and str(LINK.resolve())==OLD
assert pathlib.Path(OLD).resolve()==pathlib.Path(OLD)
assert pathlib.Path(P057).resolve()==pathlib.Path(P057)
assert free(3331) and free(3332),'Stop the owned development server before this build; ports must be unused'
assert not pathlib.Path(NEW).exists(),'Never overwrite an earlier P058 build'
DEPENDENCY_LINK=pathlib.Path(NEW).parent/'node_modules'
DEPENDENCY_TARGET=str(ROOT/'node_modules')
assert not os.path.lexists(DEPENDENCY_LINK),'Dependency link must be new'
assert (ROOT/'node_modules/sharp/package.json').is_file(),'Existing sharp package required'
for p in CONFIG+INPUTS:assert (ROOT/p).is_file(),p
BASE.mkdir(parents=True,exist_ok=True)
for name in ['production-build-v1.log','production-server-v1.log','production-build-receipt-v1.json','production-build-link-restoration-v1.json','production-build-intent-v1.json']:
 assert not (BASE/name).exists(),name
original={p:(ROOT/p).read_bytes() for p in CONFIG}
config_pins=[pin(p) for p in CONFIG]
inputs=[pin(p) for p in INPUTS]
old_id=pin(OLD+'/BUILD_ID')
p057_id=pin(P057+'/BUILD_ID')
env=dict(os.environ)
selected=dict(NODE_ENV='production',NODE_OPTIONS='--max-old-space-size=12288',NEXT_TELEMETRY_DISABLED='1',HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',HELP_MATH_G678_LOCAL_PREVIEW='true',HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware',HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
env.update(selected)
intent=dict(schemaVersion=1,kind='nms-l02-p058-production-build-intent-v1',startedAt=now(),logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,oldBuildId=old_id,preservedP057BuildId=p057_id,inputs=inputs,config=config_pins,dependencyLink=str(DEPENDENCY_LINK),dependencyTarget=DEPENDENCY_TARGET,dependencyRealRoot=str((ROOT/'node_modules').resolve()),sharpPackage=pin('node_modules/sharp/package.json'))
save(BASE/'production-build-intent-v1.json',intent)
for p,b in original.items():
 with (BASE/('production-backup-v1-'+pathlib.Path(p).name)).open('xb') as f:f.write(b)
record=dict(schemaVersion=1,kind='p058-local-production-build-v1',startedAt=now(),command=['npm','run','build','--workspace','@helpmath/web'],configBefore=config_pins,inputsBefore=inputs,selectedNonSecretEnvironment=selected)
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
 temporary=LINK.with_name(LINK.name+'.p058-'+label)
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
 DEPENDENCY_LINK.symlink_to(DEPENDENCY_TARGET)
 assert DEPENDENCY_LINK.resolve()==(ROOT/'node_modules').resolve()
 assert os.readlink(LINK)==OLD
 switch_link(OLD,NEW,'switch');changed=True
 with (BASE/'production-build-v1.log').open('x') as log:
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
 save(BASE/'production-build-receipt-v1.json',record);build_ok=True
 with (BASE/'production-server-v1.log').open('x') as log:
  server=subprocess.Popen(['node','../../node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3332'],cwd=ROOT/'apps/web',env=env,stdout=log,stderr=subprocess.STDOUT)
  for _ in range(80):
   assert server.poll() is None,'Owned production server exited'
   if not free(3332):break
   time.sleep(.25)
  else:raise RuntimeError('Production server not ready')
  probe=subprocess.run(['node','scripts/check-nms-l02-p058-production-negative-v1.mjs','--run','formal-candidate-v1'],cwd=ROOT,env=env,timeout=360)
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
 restoration=dict(schemaVersion=1,kind='nms-l02-p058-production-build-link-restoration-v1',logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,afterTarget=os.readlink(LINK) if LINK.is_symlink() else None,restored=restored,p058BuildId=pin(NEW+'/BUILD_ID') if pathlib.Path(NEW+'/BUILD_ID').is_file() else None,oldBuildIdBefore=old_id,oldBuildIdAfter=pin(OLD+'/BUILD_ID'),p057BuildIdBefore=p057_id,p057BuildIdAfter=pin(P057+'/BUILD_ID'),buildSucceeded=build_ok,failure=failure,linkRestorationFailure=link_failure,configurationCleanupFailure=config_failure,finishedAt=now())
 save(BASE/'production-build-link-restoration-v1.json',restoration)
 if not build_ok:
  record['failure']=failure;record['finishedAt']=now()
  save(BASE/'production-build-failed-v1.json',record)
 assert restoration['oldBuildIdAfter']==old_id and restoration['p057BuildIdAfter']==p057_id and restored and config_failure is None and link_failure is None
print(json.dumps(dict(status='P058_LOCAL_PRODUCTION_BUILD_AND_DENIAL_CHECK_PASSED',restored=restored)))
