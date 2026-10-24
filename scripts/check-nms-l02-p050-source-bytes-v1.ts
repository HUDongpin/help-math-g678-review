import assert from 'node:assert/strict';
import {realpathSync,mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readP050CandidateAudio} from '../apps/web/lib/nms-l02-p050-source-bytes';
import {P050_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p050-audio-plan-v1';
const workspace=process.cwd(),source='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
for(const [domain,plan] of Object.entries(P050_AUDIO_PLANS))assert.equal(readP050CandidateAudio(workspace,source,domain).bytes.length,plan.inputBytes);
assert.throws(()=>readP050CandidateAudio(workspace,source,'93'));
const temporary=realpathSync(mkdtempSync(join(tmpdir(),'p050-audio-verification-')));
try{
 const audit=join(temporary,'migrations/shared-nms002-l02-p050/audit');mkdirSync(audit,{recursive:true});
 for(const name of ['source-input.swf','sprite-88-source-stream-v1.mp3'])copyFileSync(join(workspace,'migrations/shared-nms002-l02-p050/audit',name),join(audit,name));
 assert.equal(readP050CandidateAudio(temporary,source,'88').contentType,'audio/mpeg');
 const audio=join(audit,'sprite-88-source-stream-v1.mp3'),original=readFileSync(audio),changed=Buffer.from(original);changed[100]^=1;writeFileSync(audio,changed);
 assert.throws(()=>readP050CandidateAudio(temporary,source,'88'),/HASH/);
 writeFileSync(audio,original.subarray(1));assert.throws(()=>readP050CandidateAudio(temporary,source,'88'),/SIZE/);
 rmSync(audio);symlinkSync(join(workspace,'migrations/shared-nms002-l02-p050/audit/sprite-88-source-stream-v1.mp3'),audio);
 assert.throws(()=>readP050CandidateAudio(temporary,source,'88'),/SYMLINK/);
}finally{rmSync(temporary,{recursive:true,force:true});}
console.log('PASS:3 real source-bound streams; corrupt/truncated/symlink/unselected input rejected; originals untouched');
