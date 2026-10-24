#!/usr/bin/env python3
"""Resume only the missing source-root probe against the immutable formal build."""
import datetime, hashlib, json, os, pathlib, signal, socket, subprocess, time
ROOT=pathlib.Path(__file__).resolve().parent.parent
BASE=ROOT/'output/nms-l02-p054-product-20260928/admission'
LOGICAL='apps/web/.next-alg-p001-production-scan'
LINK=ROOT/LOGICAL
OLD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output'
NEW='/Volumes/American Dream/hudongpin/g678-p054-formal-build-output-20260928/next-output-v1'
def pin(p):
 b=(ROOT/p).read_bytes();return dict(path=p,bytes=len(b),sha256=hashlib.sha256(b).hexdigest())
def read(name):return json.loads((BASE/name).read_text())
def rel(name):return str((BASE/name).relative_to(ROOT))
def save(name,data):
 with (BASE/name).open('x') as f:json.dump(data,f,indent=2);f.write('\n')
def verify(items):
 for p in items:
  current=pin(NEW+'/BUILD_ID') if p['path']==LOGICAL+'/BUILD_ID' else pin(p['path'])
  assert {**current,'path':p['path']}==p,p['path']
def free():
 with socket.socket() as s:
  try:s.bind(('127.0.0.1',3332));return True
  except OSError:return False
def switch(expected,target):
 temp=LINK.with_name(LINK.name+'.p054-resume')
 assert not os.path.lexists(temp)
 assert LINK.is_symlink() and os.readlink(LINK)==expected
 temp.symlink_to(target)
 try:
  assert LINK.is_symlink() and os.readlink(LINK)==expected
  os.replace(temp,LINK)
 finally:
  if temp.is_symlink() and os.readlink(temp)==target:temp.unlink()
 assert os.readlink(LINK)==target
assert __debug__
prior=read('formal-production-build-link-restoration-v1.json')
build=read('formal-production-build-receipt-v1.json')
intent=read('formal-production-build-intent-v1.json')
assert prior['failure']=='Port must be free before owned production server'
assert prior['restored'] and prior['buildSucceeded']
assert prior['linkRestorationFailure'] is None and prior['configurationCleanupFailure'] is None
assert prior['beforeTarget']==OLD and prior['afterTarget']==OLD and prior['temporaryTarget']==NEW
assert build['exitCode']==0 and build['inputsStable'] and build['configRestored']
assert intent['inputs']==build['inputsBefore']==build['inputsAfter']
assert intent['config']==build['configBefore']==build['configAfterRestore']
verify(build['inputsAfter']);verify(build['configAfterRestore'])
verify([prior['p054FormalBuildId'],prior['oldBuildIdBefore'],prior['oldBuildIdAfter']]+prior['extraBuildIdsBefore']+prior['extraBuildIdsAfter'])
for key in ['p055','p057','p058','p060','p061','p062']:
 assert prior[key+'BuildIdBefore']==prior[key+'BuildIdAfter']
 verify([prior[key+'BuildIdAfter']])
assert LINK.is_symlink() and os.readlink(LINK)==OLD and str(LINK.resolve())==OLD
assert pathlib.Path(NEW).resolve()==pathlib.Path(NEW)
assert pathlib.Path(intent['dependencyLink']).is_symlink()
assert os.readlink(intent['dependencyLink'])==intent['dependencyTarget']
assert str(pathlib.Path(intent['dependencyLink']).resolve())==intent['dependencyRealRoot']
verify([intent['sharpPackage']])
unset=rel('production-isolation-formal-candidate-v1-unset.json')
assert prior['probeReceipts']==[pin(unset)]
u=json.loads((ROOT/unset).read_text())
assert u['status']=='technical-pass-not-deployment' and u['sourceMode']=='unset'
assert len(u['results'])==1920 and u['errors']==[] and all(r['pass'] for r in u['results'])
verify(u['inputsAfter'])
for name in ['formal-production-resume-intent-v1.json','formal-production-server-real-root-resume-v1.log','formal-production-build-link-restoration-v2.json','production-isolation-formal-candidate-v1-real-root.json']:
 assert not (BASE/name).exists(),name
assert free(),'Port must be free before recovery'
selected=build['selectedNonSecretEnvironment']
assert selected['HELP_MATH_G678_SOURCE_ROOT']=='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'
env=dict(os.environ);env.update(selected)
recovery=dict(kind='nms-l02-p054-production-resume-v1',startedAt=datetime.datetime.now(datetime.timezone.utc).isoformat(),script=pin('scripts/resume-nms-l02-p054-production-v1.py'),priorRestoration=pin(rel('formal-production-build-link-restoration-v1.json')),build=pin(rel('formal-production-build-receipt-v1.json')),intent=pin(rel('formal-production-build-intent-v1.json')),unset=pin(unset),reason='Resume missing real-root probe after transient port availability failure; no rebuild or source changes.')
save('formal-production-resume-intent-v1.json',recovery)
server=None;changed=False;failure=None;probes=[pin(unset)]
try:
 switch(OLD,NEW);changed=True
 with (BASE/'formal-production-server-real-root-resume-v1.log').open('x') as log:
  server=subprocess.Popen(['node','../../node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port','3332'],cwd=ROOT/'apps/web',env=env,stdout=log,stderr=subprocess.STDOUT,start_new_session=True)
  for _ in range(80):
   assert server.poll() is None,'Owned production server exited'
   if not free():break
   time.sleep(.25)
  else:raise RuntimeError('Production server not ready')
  run=subprocess.run(['node','scripts/probe-nms-l02-p054-production-isolation-v1.mjs','--run','formal-candidate-v1','real-root'],cwd=ROOT,env=env,timeout=900)
  assert run.returncode==0
  real=rel('production-isolation-formal-candidate-v1-real-root.json');p=json.loads((ROOT/real).read_text())
  assert p['status']=='technical-pass-not-deployment' and p['sourceMode']=='real-root'
  assert len(p['results'])==1920 and p['errors']==[] and all(r['pass'] for r in p['results'])
  assert p['inputsBefore']==p['inputsAfter'];verify(p['inputsAfter']);probes.append(pin(real))
except BaseException as error:
 failure=str(error);raise
finally:
 if server is not None and server.poll() is None:
  os.killpg(server.pid,signal.SIGTERM)
  try:server.wait(timeout=10)
  except subprocess.TimeoutExpired:os.killpg(server.pid,signal.SIGKILL);server.wait(timeout=10)
 if changed:switch(NEW,OLD)
 verify(build['inputsAfter']);verify(build['configAfterRestore'])
 verify([prior['p054FormalBuildId'],prior['oldBuildIdAfter']]+prior['extraBuildIdsAfter'])
 for key in ['p055','p057','p058','p060','p061','p062']:verify([prior[key+'BuildIdAfter']])
 assert LINK.is_symlink() and os.readlink(LINK)==OLD
 result={**prior,'kind':'nms-l02-p054-formal-production-build-link-restoration-v2','failure':failure,'probeReceipts':probes,'recovery':recovery,'recoveryIntent':pin(rel('formal-production-resume-intent-v1.json')),'finishedAt':datetime.datetime.now(datetime.timezone.utc).isoformat()}
 save('formal-production-build-link-restoration-v2.json',result)
print(json.dumps(dict(status='P054_TWO_MODE_RECOVERED',probeReceipts=probes,restored=True)))
