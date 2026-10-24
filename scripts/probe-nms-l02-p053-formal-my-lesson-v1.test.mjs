import assert from 'node:assert/strict';
import {mkdtemp,rm} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {test} from 'node:test';
import {packetForSemantics,parseArgs,plan,readFormalInputTexts,run}
 from './probe-nms-l02-p053-formal-my-lesson-v1.mjs';
import {plan as productPlan} from './probe-nms-l02-p053-product-my-lesson-v1.mjs';

test('formal browser mode is explicit and output slug is bounded',()=>{
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','fresh-a1','candidate']),
  {mode:'run',slug:'fresh-a1',phase:'candidate'});
 assert.deepEqual(parseArgs(['--run','fresh-r1','registered']),
  {mode:'run',slug:'fresh-r1',phase:'registered'});
 for(const args of [[],['--run','fresh'],['--run','fresh','ready'],
  ['--run','../existing','candidate'],['--run','Fresh','registered'],
  ['--run','fresh','candidate','extra']])assert.throws(()=>parseArgs(args),/Usage/u);
});

test('formal plans bind the same product behavior and distinct candidate/registered host claims',async()=>{
 const product=productPlan(),candidate=plan('candidate'),registered=plan('registered');
 assert.deepEqual(await run(['--plan']),candidate);
 for(const item of [candidate,registered]){
  assert.equal(item.formal,true);
  assert.equal(item.route,
   'http://127.0.0.1:3331/{en|es}/migration-status/g678-calibration/shared-nms002-l02-p053');
  assert.deepEqual(item.cases,product.cases);
  assert.deepEqual(item.externalInputs,product.externalInputs);
  assert(product.inputPaths.every(file=>item.inputPaths.includes(file)));
  assert.equal(new Set(item.inputPaths).size,item.inputPaths.length);
  for(const file of ['catalog/nms-l02-admission-v1/host-v16.json',
   'work/g678-workflow/candidates/shared-nms002-l02-p053-v1.json',
   'lib/nms-l02-p053-reviewed-seal-v1.mjs',
   'work/g678-shared-page-factory/g678-nms-l02-p053-source-directions-current-js-v1/run-manifest.json',
   'packages/demos/private-current-js-registry.json'])assert(item.inputPaths.includes(file),file);
  assert.equal(item.renderableCount,64);
  assert.equal(item.activePageCount,64);
 }
 assert.equal(candidate.expectedMarker,'formal-candidate');
 assert.equal(candidate.registeredCount,63);
 assert.equal(candidate.unregisteredCandidateCount,1);
 assert.equal(registered.expectedMarker,'registered');
 assert.equal(registered.registeredCount,64);
 assert.equal(registered.unregisteredCandidateCount,0);
 assert.notEqual(candidate.outputRoot,registered.outputRoot);
 assert.throws(()=>plan('published'),/explicit formal phase/u);
});

test('formal preflight resolves its evidence paths from the supplied root and binds freeze to semantics',async()=>{
 const temporary=await mkdtemp(path.join(os.tmpdir(),'p053-formal-preflight-'));
 try{await assert.rejects(()=>readFormalInputTexts(temporary),error=>
  error.code==='ENOENT'&&error.path.startsWith(temporary)&&
  error.name!=='ReferenceError');}
 finally{await rm(temporary,{recursive:true,force:true});}
 const packet=Object.freeze({calibrationId:'p053',freezeManifest:'untrusted-packet-value'});
 const freeze=Object.freeze({path:'reviewed-freeze',bytes:5,sha256:'a'.repeat(64)});
 assert.deepEqual(packetForSemantics({packet,freeze}),
  {calibrationId:'p053',freezeManifest:freeze});
 assert.equal(packet.freezeManifest,'untrusted-packet-value','input remains unchanged');
});
