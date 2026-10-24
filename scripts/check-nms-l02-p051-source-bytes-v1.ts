import assert from 'node:assert/strict';
import {realpathSync,mkdtempSync,mkdirSync,copyFileSync,readFileSync,writeFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readP051CandidateAudio} from '../apps/web/lib/nms-l02-p051-source-bytes';
import {P051_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p051-audio-plan-v1';
const workspace=process.cwd(),source='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
for(const [domain,plan] of Object.entries(P051_AUDIO_PLANS))assert.equal(readP051CandidateAudio(workspace,source,domain).bytes.length,plan.inputBytes);
assert.throws(()=>readP051CandidateAudio(workspace,source,'252'));
const temporary=realpathSync(mkdtempSync(join(tmpdir(),'p051-audio-verification-')));
try{
 const audit=join(temporary,'migrations/shared-nms002-l02-p051/audit');mkdirSync(audit,{recursive:true});
 for(const name of ['source-input.swf','sprite-248-source-stream-v1.mp3'])copyFileSync(join(workspace,'migrations/shared-nms002-l02-p051/audit',name),join(audit,name));
 assert.equal(readP051CandidateAudio(temporary,source,'248').contentType,'audio/mpeg');
 const audio=join(audit,'sprite-248-source-stream-v1.mp3'),original=readFileSync(audio),changed=Buffer.from(original);changed[100]^=1;writeFileSync(audio,changed);
 assert.throws(()=>readP051CandidateAudio(temporary,source,'248'),/HASH/);
 writeFileSync(audio,original.subarray(1));assert.throws(()=>readP051CandidateAudio(temporary,source,'248'),/SIZE/);
 rmSync(audio);symlinkSync(join(workspace,'migrations/shared-nms002-l02-p051/audit/sprite-248-source-stream-v1.mp3'),audio);
 assert.throws(()=>readP051CandidateAudio(temporary,source,'248'),/SYMLINK/);
 const rootAlias=join(temporary,'workspace-link');symlinkSync(workspace,rootAlias);assert.throws(()=>readP051CandidateAudio(rootAlias,source,'248'),/ROOT/);
 const sourceAlias=join(temporary,'source-link');symlinkSync(source,sourceAlias);assert.throws(()=>readP051CandidateAudio(workspace,sourceAlias,'248'),/ROOT/);
 assert.throws(()=>readP051CandidateAudio(workspace,temporary,'248'));
 rmSync(audio);writeFileSync(audio,original);const swf=join(audit,'source-input.swf'),swfBytes=readFileSync(swf);swfBytes[100]^=1;rmSync(swf);writeFileSync(swf,swfBytes);assert.throws(()=>readP051CandidateAudio(temporary,source,'248'),/HASH/);
}finally{rmSync(temporary,{recursive:true,force:true});}
console.log('PASS:3 real source-bound streams; corrupt/truncated/symlink/unselected input rejected; originals untouched');
