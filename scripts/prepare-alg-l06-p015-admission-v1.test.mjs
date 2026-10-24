import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readJsonPin} from '../lib/g678-admission-proof.mjs';
import {buildPlan,operate,FRAGMENT_PATH} from './prepare-alg-l06-p015-admission-v1.mjs';
import * as S from '../lib/alg-l06-p015-admission-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
function currentPredecessorPin(){
 const source=fs.readFileSync(path.join(root,'apps/web/lib/g678-admission-activation.ts'),'utf8');
 const pin=JSON.parse(source.slice(source.indexOf('=')+1,source.lastIndexOf(' as const;')));
 const index=readJsonPin(root,pin);
 return index.pages.some(page=>page.animationId===S.ID)?null:pin;
}
function withSourceRoot(run){
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 process.env.HELP_MATH_G678_SOURCE_ROOT=S.SOURCE_ROOT;
 try{return run();}finally{
  if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;
 }
}

test('P015 --plan binds exact prior proofs and creates no candidate outputs',t=>withSourceRoot(()=>{
 const previousIndexPin=currentPredecessorPin();
 if(!previousIndexPin){t.skip('P015 already admitted; no predecessor plan');return;}
 const before=[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH].map(relative=>
  fs.existsSync(path.join(root,relative)));
 const plan=buildPlan({previousIndexPin}),result=operate('--plan',{previousIndexPin});
 assert.equal(plan.index.pages.length,12);
 assert.equal(result.status,'planned-not-written');
 assert.equal(result.previousProofsUnchanged.length,12);
 assert.equal(result.registrationChanged,false);
 assert.equal(result.activationChanged,false);
 assert.equal(result.runtimeMemberMaterialized,true);
 assert.deepEqual(result.outputs.map(x=>x.path),[S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH]);
 assert.deepEqual([S.FREEZE_PATH,FRAGMENT_PATH,S.PROOF_PATH].map(relative=>
  fs.existsSync(path.join(root,relative))),before);
}));

test('P015 preparation rejects stale host pin, wrong source root and premature check',t=>withSourceRoot(()=>{
 const previousIndexPin=currentPredecessorPin();
 if(!previousIndexPin){t.skip('P015 already admitted; no predecessor plan');return;}
 assert.throws(()=>buildPlan({previousIndexPin:{...previousIndexPin,sha256:'0'.repeat(64)}}));
 if(!fs.existsSync(path.join(root,S.PROOF_PATH)))
  assert.throws(()=>operate('--check',{previousIndexPin}),/missing prepared artifact/u);
 process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-real-source';
 assert.throws(()=>buildPlan({previousIndexPin}),/real source root/u);
}));
