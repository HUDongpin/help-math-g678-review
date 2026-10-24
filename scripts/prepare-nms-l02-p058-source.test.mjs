import assert from 'node:assert/strict';
import test from 'node:test';
import {checkP058SourceIntake} from './prepare-nms-l02-p058-source.mjs';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
test('P058 source audit checks the exact physical source and all extracted pins',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
 const result=checkP058SourceIntake();
 assert.equal(result.extractionFiles,27);
 assert.equal(result.source.sha256,'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57');
 assert.equal(result.registrationEffect,'none');
});
test('P058 audit rejects a compatibility source root',()=>{
 const old=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>checkP058SourceIntake(),/exact physical source root/u);
 }finally{if(old===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=old;}
});
