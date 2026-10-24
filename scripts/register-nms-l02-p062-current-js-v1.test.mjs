import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile,REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {P062_SOURCE_ROOT} from '../lib/nms-l02-p062-admission-semantics.mjs';
import {replacePinnedFile,rollbackPinnedFiles} from './register-nms-l02-p062-current-js-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script='scripts/register-nms-l02-p062-current-js-v1.mjs';
const activation='apps/web/lib/nms-l02-p062-admission-activation.ts';
const targets=[REGISTRY,...DISPATCH,activation];
const required=[
 'catalog/nms-l02-admission-v1/host-v13.json',
 'work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json',
 'output/nms-l02-p062-product-20260928/browser/formal-candidate-v2/evidence.json',
 'output/nms-l02-p062-product-20260928/continuity/browser/formal-candidate-v1/root-v1/result.json',
 'output/nms-l02-p062-product-20260928/admission/production-build-intent-v1.json',
 'output/nms-l02-p062-product-20260928/admission/production-build-receipt-v1.json',
 'output/nms-l02-p062-product-20260928/production/formal-candidate-v1.json',
 'output/nms-l02-p062-product-20260928/admission/production-build-link-restoration-v1.json',
];
const run=(...args)=>spawnSync(process.execPath,[script,...args],{
 cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:P062_SOURCE_ROOT,NODE_ENV:'development'},
 encoding:'utf8',timeout:120000,maxBuffer:2*1024*1024});
const pins=()=>targets.map(relative=>pinFile(root,relative));

test('read-only P062 planning fails closed until every exact evidence input is sealed',()=>{
 const before=pins();
 const activationData=fs.readFileSync(path.join(root,activation),'utf8');
 const stage=activationData.match(/"stage": "(candidate|registered)"/u)?.[1];
 const present=required.every(relative=>fs.existsSync(path.join(root,relative)));
 const sealed=present&&[
  [required[2],'local-candidate-host-probe-passed-not-acceptance'],
  [required[3],'technical-pass-not-acceptance'],
  [required[5],null],[required[6],'technical-pass-not-deployment'],
 ].every(([relative,status])=>{
  try{const data=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
   return status===null?data.exitCode===0:data.status===status;
  }catch{return false;}
 });
 const result=run(stage==='registered'?'--check':'--plan');
 if(!stage||stage==='candidate'&&!sealed)assert.notEqual(result.status,0,
  'incomplete evidence must not pass a registration plan');
 else{
  assert.equal(result.status,0,result.stderr);
  const data=JSON.parse(result.stdout.trim());
  assert.equal(data.status,stage==='registered'?'P062_REGISTRATION_CHECKED_NOT_ACCEPTANCE':
   'P062_REGISTRATION_READY_NOT_WRITTEN');
  if(stage==='candidate'){
   assert.deepEqual(data.counts,{oldTotal:634,newTotal:635,oldShared:492,newShared:493,
    oldLesson:60,newLesson:61});
   assert.equal(data.registrationEffect,'none');assert.equal(data.acceptanceEffect,'none');
  }
 }
 assert.deepEqual(pins(),before,'read mode did not alter active registry, dispatch, or activation');
});

test('unsupported modes fail before mutation',()=>{
 const before=pins();
 for(const args of [['--apply'],['--plan','unexpected']]){
  const result=run(...args);assert.notEqual(result.status,0);
  assert.match(result.stderr,/exact mode|use --plan|Expected values to be strictly equal/u);
 }
 assert.deepEqual(pins(),before);
});

test('post-rename failure is tracked and only owned bytes are rolled back',()=>{
 const directory=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p062-register-')));
 try{
  const relative='target.txt',original=Buffer.from('original\n'),replacement=Buffer.from('replacement\n');
  fs.writeFileSync(path.join(directory,relative),original);
  const before=pinFile(directory,relative),after={path:relative,bytes:replacement.length,
   sha256:sha256(replacement)},modified=[];
  assert.throws(()=>replacePinnedFile(directory,relative,before,replacement,()=>{
   modified.push({relative,beforeBytes:original,after});throw Error('injected after rename');
  }),/injected after rename/u);
  assert.deepEqual(pinFile(directory,relative),after);
  assert.deepEqual(rollbackPinnedFiles(directory,modified),[{relative,status:'rolled-back'}]);
  assert.deepEqual(pinFile(directory,relative),before);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

test('rollback does not overwrite a concurrent change',()=>{
 const directory=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p062-register-')));
 try{
  const relative='target.txt',original=Buffer.from('original\n'),replacement=Buffer.from('replacement\n');
  fs.writeFileSync(path.join(directory,relative),original);
  const before=pinFile(directory,relative);
  replacePinnedFile(directory,relative,before,replacement);
  const after=pinFile(directory,relative);
  fs.writeFileSync(path.join(directory,relative),'third-party change\n');
  const drift=pinFile(directory,relative);
  const outcomes=rollbackPinnedFiles(directory,[{relative,beforeBytes:original,after}]);
  assert.equal(outcomes[0].status,'skipped');assert.deepEqual(pinFile(directory,relative),drift);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
