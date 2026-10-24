#!/usr/bin/env python3
"""Local P054 build/probe; preserve older physical builds and restore the shared link."""
import datetime, hashlib, json, os, pathlib, signal, socket, subprocess, sys, time
ROOT=pathlib.Path(__file__).resolve().parent.parent
if not __debug__:
 raise RuntimeError('Safety checks require ordinary Python execution')
BASE=ROOT/'output/nms-l02-p054-product-20260928/production-v3'
LOGICAL='apps/web/.next-alg-p001-production-scan'
P055='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
P057='/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2'
P058='/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2'
P060='/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1'
P061='/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3'
P062='/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1'
NEW='/Volumes/American Dream/hudongpin/g678-p054-product-build-output-20260928/next-output-v3'
LINK=ROOT/LOGICAL
assert LINK.is_symlink(),'Existing configured build link required'
OLD=os.readlink(LINK)
assert OLD==P055,'Exact original P055 build link required'
CONFIG=['apps/web/next-env.d.ts','apps/web/tsconfig.json','apps/web/next.config.ts']
# Resolve the exact negative-checker's inherited source closure before mutation.
probe_plan=json.loads(subprocess.check_output(['node','scripts/check-nms-l02-p054-product-production-v3.mjs','--plan'],cwd=ROOT,text=True))
INPUTS=list(dict.fromkeys(['scripts/build-and-probe-nms-l02-p054-product-v3.py',
 'scripts/generate-nms-l02-p054-product-host-v1.mjs',
 'packages/demos/tests/nms-l02-p054-product-board-v1.test.tsx',
 'apps/web/tests/nms-l02-p054-product-descriptor-v1.test.ts',
 'apps/web/tests/nms-l02-p054-lesson-runtime-v1.test.tsx',
 'apps/web/tests/g678-p054-local-candidate-boundary.test.mjs']+[p['path'] for p in probe_plan['inputs']]))
EXTRA_OLD=['/Volumes/American Dream/hudongpin/g678-p064-product-build-output-20260928/next-output-v1',
 '/Volumes/American Dream/hudongpin/g678-p064-formal-build-output-20260928/next-output-v1']
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
 assert not os.path.lexists(NEW),'Never overwrite an earlier P054 build'
 for p in CONFIG+INPUTS:assert (ROOT/p).is_file(),p
 old_builds=[pin(root+'/BUILD_ID') for root in [P055,P057,P058,P060,P061,P062]+EXTRA_OLD]
 print(json.dumps(dict(schemaVersion=1,kind='nms-l02-p054-product-build-plan-v1',
  logicalPath=LOGICAL,beforeTarget=P055,newPhysicalRoot=NEW,
  preservedBuildIds=old_builds,inputs=[pin(p) for p in INPUTS],
  config=[pin(p) for p in CONFIG],writesPerformed=False)))
 sys.exit(0)
assert not sys.argv[1:],'Usage: build-and-probe-nms-l02-p054-product-v3.py [--plan]'
assert str(LINK.resolve())==OLD
assert pathlib.Path(OLD).resolve()==pathlib.Path(OLD)
assert pathlib.Path(P057).resolve()==pathlib.Path(P057)
assert pathlib.Path(P058).resolve()==pathlib.Path(P058)
assert pathlib.Path(P055).resolve()==pathlib.Path(P055)
assert pathlib.Path(P060).resolve()==pathlib.Path(P060)
assert pathlib.Path(P061).resolve()==pathlib.Path(P061)
assert pathlib.Path(P062).resolve()==pathlib.Path(P062)
assert free(3331) and free(3332),'Stop the owned development server before this build; ports must be unused'
assert not os.path.lexists(NEW),'Never overwrite an earlier P054 build'
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
for name in ['production-build-v1.log','production-server-v1.log','build-receipt-v3.json','production-build-link-restoration-v1.json','production-build-intent-v1.json']:
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
extra_old_ids=[pin(p+'/BUILD_ID') for p in EXTRA_OLD]
for p in EXTRA_OLD:assert pathlib.Path(p).resolve()==pathlib.Path(p),'Physical retained P064 builds'
env=dict(os.environ)
selected=dict(NODE_ENV='production',NODE_OPTIONS='--max-old-space-size=12288',NEXT_TELEMETRY_DISABLED='1',HELP_MATH_ALG_P001_PRODUCTION_SCAN='1',HELP_MATH_G678_LOCAL_PREVIEW='true',HELP_MATH_G678_LOCAL_PREVIEW_BIND='127.0.0.1',HELP_MATH_G678_SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware',HELP_MATH_G678_CALIBRATION_PHASE='frozen16-continuous-audio-provisional-browser-qa',HELP_MATH_G678_P052_AUDIO_CANDIDATE='1')
env.update(selected)
intent=dict(schemaVersion=1,kind='nms-l02-p054-production-build-intent-v1',startedAt=now(),logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,oldBuildId=old_id,preservedP055BuildId=p055_id,preservedP057BuildId=p057_id,preservedP058BuildId=p058_id,preservedP060BuildId=p060_id,preservedP061BuildId=p061_id,preservedP062BuildId=p062_id,inputs=inputs,config=config_pins,dependencyLink=str(DEPENDENCY_LINK),dependencyTarget=DEPENDENCY_TARGET,dependencyRealRoot=str((ROOT/'node_modules').resolve()),sharpPackage=pin('node_modules/sharp/package.json'))
save(BASE/'production-build-intent-v1.json',intent)
for p,b in original.items():
 with (BASE/('production-backup-v1-'+pathlib.Path(p).name)).open('xb') as f:f.write(b)
record=dict(schemaVersion=1,kind='p054-local-production-build-v1',startedAt=now(),command=['npm','run','build','--workspace','@helpmath/web'],configBefore=config_pins,inputsBefore=inputs,selectedNonSecretEnvironment=selected)
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
 temporary=LINK.with_name(LINK.name+'.p054-'+label)
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
 save(BASE/'build-receipt-v3.json',record);build_ok=True
 with (BASE/'production-server-v1.log').open('x') as log:
  server=subprocess.Popen(['node','../../node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3332'],cwd=ROOT/'apps/web',env=env,stdout=log,stderr=subprocess.STDOUT)
  for _ in range(80):
   assert server.poll() is None,'Owned production server exited'
   if not free(3332):break
   time.sleep(.25)
  else:raise RuntimeError('Production server not ready')
  probe=subprocess.run(['node','scripts/check-nms-l02-p054-product-production-v3.mjs','--run','product-candidate-v1'],cwd=ROOT,env=env,timeout=360)
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
 restoration=dict(schemaVersion=1,kind='nms-l02-p054-production-build-link-restoration-v1',logicalPath=LOGICAL,beforeTarget=OLD,temporaryTarget=NEW,afterTarget=os.readlink(LINK) if LINK.is_symlink() else None,restored=restored,p054BuildId=pin(NEW+'/BUILD_ID') if pathlib.Path(NEW+'/BUILD_ID').is_file() else None,oldBuildIdBefore=old_id,oldBuildIdAfter=pin(OLD+'/BUILD_ID'),p055BuildIdBefore=p055_id,p055BuildIdAfter=pin(P055+'/BUILD_ID'),p057BuildIdBefore=p057_id,p057BuildIdAfter=pin(P057+'/BUILD_ID'),p058BuildIdBefore=p058_id,p058BuildIdAfter=pin(P058+'/BUILD_ID'),p060BuildIdBefore=p060_id,p060BuildIdAfter=pin(P060+'/BUILD_ID'),p061BuildIdBefore=p061_id,p061BuildIdAfter=pin(P061+'/BUILD_ID'),p062BuildIdBefore=p062_id,p062BuildIdAfter=pin(P062+'/BUILD_ID'),extraBuildIdsBefore=extra_old_ids,extraBuildIdsAfter=[pin(p+'/BUILD_ID') for p in EXTRA_OLD],buildSucceeded=build_ok,failure=failure,linkRestorationFailure=link_failure,configurationCleanupFailure=config_failure,finishedAt=now())
 save(BASE/'production-build-link-restoration-v1.json',restoration)
 if not build_ok:
  record['failure']=failure;record['finishedAt']=now()
  save(BASE/'production-build-failed-v1.json',record)
 assert restoration['oldBuildIdAfter']==old_id and restoration['p055BuildIdAfter']==p055_id and restoration['p057BuildIdAfter']==p057_id and restoration['p058BuildIdAfter']==p058_id and restoration['p060BuildIdAfter']==p060_id and restoration['p061BuildIdAfter']==p061_id and restoration['p062BuildIdAfter']==p062_id and restoration['extraBuildIdsAfter']==extra_old_ids and restored and config_failure is None and link_failure is None
print(json.dumps(dict(status='P054_LOCAL_PRODUCTION_BUILD_AND_DENIAL_CHECK_PASSED',restored=restored)))
