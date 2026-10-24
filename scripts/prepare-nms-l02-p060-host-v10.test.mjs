import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile,sha256} from '../lib/g678-admission-proof.mjs';
import {buildP060HostV10Plan,composeP060HostV10,HOST_V9,HOST_V10_PATH,
 P060_HOST_V10_ADDITIONS,P060_RUN,P060_SHARED_HOST_DEPENDENCY_PATHS}
 from './prepare-nms-l02-p060-host-v10.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseBytes=fs.readFileSync(path.join(root,HOST_V9.path));
const base=JSON.parse(baseBytes);
const syntheticPin=relative=>({path:relative,bytes:1,sha256:'0'.repeat(64)});
const additions=()=>P060_HOST_V10_ADDITIONS.map(syntheticPin);
const run=()=>({schemaVersion:1,animationId:'shared-nms002-l02-p060',
 method:'source-locked-public-tool-IR-and-maintained-DOM-state-machine',
 inputs:Array.from({length:216},(_,index)=>syntheticPin(`output/p060-test/input-${index}`)),
 outputs:Array.from({length:20},(_,index)=>syntheticPin(`output/p060-test/output-${index}`)),
 sharedDependencies:P060_SHARED_HOST_DEPENDENCY_PATHS.map(relative=>
  base.files.find(pin=>pin.path===relative)),
 acceptanceEffects:{authoritativeOriginalRuntime:false,fidelityAccepted:false,
  audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
  strictComplete:false,published:false}});

test('sealed host-v9 and all six P060 shared DOM dependencies have exact retained pins',()=>{
 assert.equal(baseBytes.length,HOST_V9.bytes);
 assert.equal(sha256(baseBytes),HOST_V9.sha256);
 assert.equal(base.files.length,95);
 assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,2);
 assert.equal(P060_RUN.path,
  'work/g678-shared-page-factory/g678-nms-l02-p060-conditional-host-current-js-v1/run-manifest.json');
 assert.equal(P060_RUN.bytes,63280);
 for(const relative of P060_SHARED_HOST_DEPENDENCY_PATHS){
  const old=base.files.find(pin=>pin.path===relative);
  assert(old,`sealed host-v9 dependency: ${relative}`);
  assert.deepEqual(pinFile(root,relative),old);
 }
});

test('host-v10 is append-only and preserves all five witness plus two successor transitions',()=>{
 const before=JSON.stringify(base);
 const host=composeP060HostV10(base,additions(),run());
 assert.equal(JSON.stringify(base),before,'predecessor document unchanged');
 assert.equal(host.files.length,108);
 assert.equal(host.transitions.length,5);
 assert.equal(host.successorTransitions.length,2);
 assert.deepEqual(host.transitions,base.transitions);
 assert.deepEqual(host.successorTransitions,base.successorTransitions);
 assert.deepEqual(host.predecessorHost,HOST_V9);
 assert.deepEqual(host.predecessor,base.predecessor);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V10_PATH,'catalog/nms-l02-admission-v1/host-v10.json');
 for(const old of base.files)
  assert.deepEqual(host.files.find(pin=>pin.path===old.path),old,
   `unchanged v9 member: ${old.path}`);
 const names=new Set(host.files.map(pin=>pin.path));
 assert(!names.has('apps/web/lib/nms-l02-p060-admission-activation.ts'));
 assert(!names.has('apps/web/components/nms-l02-p060-lesson-runtime-v1.tsx'));
 assert(!names.has('apps/web/lib/nms-l02-p060-descriptor-extension.ts'));
 assert(!names.has(P060_RUN.path));
});

test('host-v10 rejects extra or missing members, page overlap, and run/dependency drift',()=>{
 const good=additions(),originalRun=run();
 assert.throws(()=>composeP060HostV10(base,good.slice(1),originalRun),
  /complete P060 shared-host additions/u);
 assert.throws(()=>composeP060HostV10(base,[...good,syntheticPin('extra.ts')],originalRun),
  /complete P060 shared-host additions/u);
 const duplicate=structuredClone(good);duplicate[0]=syntheticPin(base.files[0].path);
 assert.throws(()=>composeP060HostV10(base,duplicate,originalRun),
  /exact P060 shared-host membership/u);
 const colliding=structuredClone(originalRun);
 colliding.inputs[0]=syntheticPin(good[0].path);
 assert.throws(()=>composeP060HostV10(base,good,colliding),
  /DOM page input\/output cannot enter host closure/u);
 const changedDependency=structuredClone(originalRun);
 changedDependency.sharedDependencies[0].sha256='f'.repeat(64);
 assert.throws(()=>composeP060HostV10(base,good,changedDependency),
  /exact pre-existing host pin/u);
 const wrongOrder=structuredClone(originalRun);
 wrongOrder.sharedDependencies.reverse();
 assert.throws(()=>composeP060HostV10(base,good,wrongOrder),
  /six exact shared dependency paths/u);
 const accepted=structuredClone(originalRun);
 accepted.acceptanceEffects.audioAccepted=true;
 assert.throws(()=>composeP060HostV10(base,good,accepted),
  /DOM run has no acceptance effect/u);
 const drift=structuredClone(base);
 drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP060HostV10(drift,good,originalRun),
  /exact sealed host-v9 document/u);
});

test('real plan rechecks predecessor pins and reports missing root-owned inputs without sealing',async()=>{
 const env=process.env;
 const prior=env.HELP_MATH_G678_SOURCE_ROOT;
 try {
  env.HELP_MATH_G678_SOURCE_ROOT=
   '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
  const plan=await buildP060HostV10Plan({root});
  assert.equal(plan.retainedFileCount,95);
  assert.equal(plan.retainedTransitionCount,5);
  assert.equal(plan.retainedSuccessorTransitionCount,2);
  assert.equal(plan.registeredPredecessorCount,58);
  assert.equal(plan.registrationEffect,'none');
  assert.equal(plan.acceptanceEffect,'none');
  assert(['NMS_L02_HOST_V10_WAITING_INPUTS','NMS_L02_HOST_V10_PLAN_ONLY'].includes(plan.status));
  if(plan.status==='NMS_L02_HOST_V10_WAITING_INPUTS'){
   assert(plan.pendingPaths.includes(P060_RUN.path)||
    plan.pendingPaths.includes('apps/web/lib/nms-l02-p060-admission.server.ts'));
  }else assert.equal(plan.hostPin.path,HOST_V10_PATH);
  assert.equal(fs.existsSync(path.join(root,HOST_V10_PATH)),false);
 }finally{
  if(prior===undefined)delete env.HELP_MATH_G678_SOURCE_ROOT;
  else env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
