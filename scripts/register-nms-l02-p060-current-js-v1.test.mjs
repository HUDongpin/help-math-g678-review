import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {pinFile,REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {P060_SOURCE_ROOT} from '../lib/nms-l02-p060-admission-semantics.mjs';
import {replacePinnedFile,rollbackPinnedFiles} from './register-nms-l02-p060-current-js-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script='scripts/register-nms-l02-p060-current-js-v1.mjs';
const activation='apps/web/lib/nms-l02-p060-admission-activation.ts';
const targets=[REGISTRY,...DISPATCH,activation];
const run=(...args)=>spawnSync(process.execPath,['--import','tsx',script,...args],{
 cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:P060_SOURCE_ROOT,NODE_ENV:'development'},
 encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
const pins=()=>targets.map(relative=>pinFile(root,relative));

test('P060 read mode verifies actual transaction without changing any target',()=>{
 const before=pins();
 const source=fs.readFileSync(path.join(root,activation),'utf8');
 const stage=source.match(/"stage": "(candidate|registered)"/u)?.[1];
 const required=[
  'catalog/nms-l02-admission-v1/host-v10.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p060-v1.json',
  'output/nms-l02-p060-product-20260927/browser/formal-candidate-v3/evidence.json',
  'output/nms-l02-p060-product-20260927/continuity/browser/formal-candidate-v1/root-v1/result.json',
  'output/nms-l02-p060-product-20260927/admission/production-build-intent-v1.json',
  'output/nms-l02-p060-product-20260927/admission/production-build-receipt-v1.json',
  'output/nms-l02-p060-product-20260927/production/formal-candidate-v1.json',
  'output/nms-l02-p060-product-20260927/admission/production-build-link-restoration-v1.json',
 ];
 const present=required.every(relative=>fs.existsSync(path.join(root,relative)));
 const expectedStatuses=[
  [required[2],'local-candidate-host-probe-passed-not-acceptance'],
  [required[3],'technical-pass-not-acceptance'],
  [required[5],undefined],
  [required[6],'technical-pass-not-deployment'],
 ];
 const evidenceReady=present&&expectedStatuses.every(([relative,status])=>{
  try {const data=JSON.parse(fs.readFileSync(path.join(root,relative),'utf8'));
   return status===undefined?data.exitCode===0:data.status===status;
  }catch{return false;}
 });
 if(stage!=='registered'&&(!stage||!evidenceReady)){
  const pending=run('--plan');
  assert.notEqual(pending.status,0,'unsealed P060 transaction must fail closed');
  assert.deepEqual(pins(),before,'unsealed planning does not alter any target');
  return;
 }
 const result=run(stage==='candidate'?'--plan':'--check');
 assert.equal(result.status,0,result.stderr);
 const data=JSON.parse(result.stdout.trim());
 assert.equal(data.status,stage==='candidate'?'P060_REGISTRATION_READY_NOT_WRITTEN':
  'P060_REGISTRATION_CHECKED_NOT_ACCEPTANCE');
 if(stage==='candidate'){
  assert.deepEqual(data.counts,{oldTotal:632,newTotal:633,oldShared:490,newShared:491,
   oldLesson:58,newLesson:59});
  assert.equal(data.registrationEffect,'none');
  assert.equal(data.acceptanceEffect,'none');
 }
 assert.deepEqual(pins(),before,'read mode does not alter registry, dispatch, or activation');
});

test('an invalid mode and extra arguments fail before mutation',()=>{
 const before=pins();
 for(const args of [['--apply'],['--plan','unexpected']]){
  const result=run(...args);
  assert.notEqual(result.status,0);
  assert.match(result.stderr,/exact mode|use --plan|Expected values to be strictly equal/u);
 }
 assert.deepEqual(pins(),before);
});

test('a failure immediately after rename is tracked and restores only our bytes',()=>{
 const directory=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p060-register-')));
 try{
  const relative='target.txt',original=Buffer.from('original bytes\n'),replacement=Buffer.from('p060 replacement\n');
  fs.writeFileSync(path.join(directory,relative),original);
  const before=pinFile(directory,relative),after={path:relative,bytes:replacement.length,
   sha256:sha256(replacement)};
  const modified=[];
  assert.throws(()=>replacePinnedFile(directory,relative,before,replacement,()=>{
   modified.push({relative,beforeBytes:original,after});throw Error('injected after rename');
  }),/injected after rename/u);
  assert.deepEqual(modified,[{relative,beforeBytes:original,after}]);
  assert.deepEqual(pinFile(directory,relative),after);
  assert.deepEqual(rollbackPinnedFiles(directory,modified),[{relative,status:'rolled-back'}]);
  assert.deepEqual(pinFile(directory,relative),before);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});

test('rollback refuses to overwrite an unrelated post-rename change',()=>{
 const directory=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p060-register-')));
 try{
  const relative='target.txt',original=Buffer.from('original bytes\n'),replacement=Buffer.from('p060 replacement\n');
  fs.writeFileSync(path.join(directory,relative),original);
  const before=pinFile(directory,relative);
  replacePinnedFile(directory,relative,before,replacement);
  const after=pinFile(directory,relative);
  fs.writeFileSync(path.join(directory,relative),'independent edit\n');
  const drift=pinFile(directory,relative);
  const outcomes=rollbackPinnedFiles(directory,[{relative,beforeBytes:original,after}]);
  assert.equal(outcomes[0].status,'skipped');
  assert.deepEqual(pinFile(directory,relative),drift);
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
});
