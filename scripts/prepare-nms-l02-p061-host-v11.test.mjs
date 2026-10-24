import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {pinFile,sha256} from '../lib/g678-admission-proof.mjs';
import {buildP061HostV11Plan,composeP061HostV11,HOST_V10,HOST_V11_PATH,
 P061_HOST_V11_ADDITIONS,P061_RUN,P061_SHARED_HOST_DEPENDENCY_PATHS}
 from './prepare-nms-l02-p061-host-v11.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const baseBytes=fs.readFileSync(path.join(root,HOST_V10.path));
const base=JSON.parse(baseBytes);
const syntheticPin=relative=>({path:relative,bytes:1,sha256:'0'.repeat(64)});
const additions=()=>P061_HOST_V11_ADDITIONS.map(syntheticPin);
const run=()=>({schemaVersion:1,animationId:'shared-nms002-l02-p061',
 method:'source-locked-public-tool-IR-and-maintained-DOM-state-machine',
 inputs:[...Array.from({length:178},(_,index)=>syntheticPin(`output/p061-test/input-${index}`)),
  base.files.find(pin=>pin.path==='scripts/build-g4-l3-embedded-audio-archive.mjs')],
 outputs:Array.from({length:22},(_,index)=>syntheticPin(`output/p061-test/output-${index}`)),
 sharedDependencies:P061_SHARED_HOST_DEPENDENCY_PATHS.map(relative=>
  base.files.find(pin=>pin.path===relative)),
 acceptanceEffects:{authoritativeOriginalRuntime:false,fidelityAccepted:false,
  audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
  strictComplete:false,published:false}});

test('sealed host-v10 retains the six exact shared dependencies',()=>{
 assert.equal(baseBytes.length,HOST_V10.bytes);
 assert.equal(sha256(baseBytes),HOST_V10.sha256);
 assert.equal(base.files.length,108);
 assert.equal(base.transitions.length,5);
 assert.equal(base.successorTransitions.length,2);
 assert.equal(P061_RUN.bytes,55412);
 for(const relative of P061_SHARED_HOST_DEPENDENCY_PATHS){
  const old=base.files.find(pin=>pin.path===relative);
  assert(old,`sealed dependency: ${relative}`);
  assert.deepEqual(pinFile(root,relative),old);
 }
});

test('host-v11 only appends reviewed P061 host members',()=>{
 const before=JSON.stringify(base);
 const host=composeP061HostV11(base,additions(),run());
 assert.equal(JSON.stringify(base),before);
 assert.equal(host.files.length,122);
 assert.deepEqual(host.transitions,base.transitions);
 assert.deepEqual(host.successorTransitions,base.successorTransitions);
 assert.deepEqual(host.predecessorHost,HOST_V10);
 assert.equal(host.acceptanceEffect,'none');
 assert.equal(HOST_V11_PATH,'catalog/nms-l02-admission-v1/host-v11.json');
 for(const old of base.files)
  assert.deepEqual(host.files.find(pin=>pin.path===old.path),old);
 const names=new Set(host.files.map(pin=>pin.path));
 assert(!names.has('apps/web/lib/nms-l02-p061-admission-activation.ts'));
 assert(!names.has('apps/web/components/nms-l02-p061-lesson-runtime-v1.tsx'));
 assert(!names.has('apps/web/lib/nms-l02-p061-descriptor-extension.ts'));
 assert(!names.has(P061_RUN.path));
});

test('host-v11 rejects membership, page, dependency, and acceptance drift',()=>{
 const good=additions(),originalRun=run();
 assert.throws(()=>composeP061HostV11(base,good.slice(1),originalRun),
  /complete P061 shared-host additions/u);
 assert.throws(()=>composeP061HostV11(base,[...good,syntheticPin('extra.ts')],originalRun),
  /complete P061 shared-host additions/u);
 const duplicate=structuredClone(good);duplicate[0]=syntheticPin(base.files[0].path);
 assert.throws(()=>composeP061HostV11(base,duplicate,originalRun),
  /exact P061 shared-host membership/u);
 const colliding=structuredClone(originalRun);colliding.inputs[0]=syntheticPin(good[0].path);
 assert.throws(()=>composeP061HostV11(base,good,colliding),
  /only exact inherited compiler may overlap/u);
 const mutatedTool=structuredClone(originalRun);mutatedTool.inputs.at(-1).sha256='f'.repeat(64);
 assert.throws(()=>composeP061HostV11(base,good,mutatedTool),
  /only exact inherited compiler may overlap/u);
 const absentTool=structuredClone(originalRun);
 absentTool.inputs[178]=syntheticPin('output/p061-test/replaced-inherited-tool');
 assert.throws(()=>composeP061HostV11(base,good,absentTool),
  /only exact inherited compiler may overlap/u);
 const changedDependency=structuredClone(originalRun);
 changedDependency.sharedDependencies[0].sha256='f'.repeat(64);
 assert.throws(()=>composeP061HostV11(base,good,changedDependency),
  /exact pre-existing host pin/u);
 const wrongOrder=structuredClone(originalRun);wrongOrder.sharedDependencies.reverse();
 assert.throws(()=>composeP061HostV11(base,good,wrongOrder),
  /six exact shared dependency paths/u);
 const accepted=structuredClone(originalRun);accepted.acceptanceEffects.audioAccepted=true;
 assert.throws(()=>composeP061HostV11(base,good,accepted),
  /DOM run has no acceptance effect/u);
 const drift=structuredClone(base);drift.files[0].sha256='0'.repeat(64);
 assert.throws(()=>composeP061HostV11(drift,good,originalRun),
  /exact sealed host-v10 document/u);
});

test('real plan checks predecessor and never writes host-v11',async()=>{
 const prior=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{
  process.env.HELP_MATH_G678_SOURCE_ROOT=
   '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
  const target=path.join(root,HOST_V11_PATH);
  const before=fs.existsSync(target)?fs.readFileSync(target):null;
  const plan=await buildP061HostV11Plan({root});
  assert.equal(plan.retainedFileCount,108);
  assert.equal(plan.retainedTransitionCount,5);
  assert.equal(plan.retainedSuccessorTransitionCount,2);
  assert.equal(plan.registeredPredecessorCount,59);
  assert.equal(plan.registrationEffect,'none');
  assert.equal(plan.acceptanceEffect,'none');
  assert(['NMS_L02_HOST_V11_WAITING_INPUTS','NMS_L02_HOST_V11_PLAN_ONLY'].includes(plan.status));
  if(plan.status==='NMS_L02_HOST_V11_WAITING_INPUTS')assert(plan.pendingPaths.length>0);
  else assert.equal(plan.hostPin.path,HOST_V11_PATH);
  assert.deepEqual(fs.existsSync(target)?fs.readFileSync(target):null,before);
 }finally{
  if(prior===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=prior;
 }
});
