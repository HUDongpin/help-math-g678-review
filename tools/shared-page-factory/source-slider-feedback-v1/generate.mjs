import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
const directory=fileURLToPath(new URL('.',import.meta.url));
const profiles=JSON.parse(fs.readFileSync(directory+'profiles.json'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const rows=[];
for(const profile of profiles){
 const raw=fs.readFileSync(profile.sourceModel),model=JSON.parse(raw),v=profile.values;
 assert.equal(sha(raw),profile.sourceModelSha256);assert.equal(model.source.sha256,profile.sourceSha256);
 assert.equal(model.mainSpriteId,v.MAIN_ID);assert.equal(model.mainFrameCount,v.LAST);assert.equal(model.quizFrame,v.QUIZ);assert.equal(model.forcedAnswerFrame,v.FORCED);assert.equal(model.feedbackSpriteId,v.FEEDBACK_ID);assert.equal(model.feedbackLastFrame,v.FEEDBACK_LAST);assert.equal(model.slider.initialText,v.INITIAL);assert(model.submit.source.includes('"'+v.CORRECT+'"'));assert.equal(v.AFTER_LAST,v.LAST+1);
 for(const name of ['state-v1.ts','session-v1.ts','player-v1.tsx']){
  const template=fs.readFileSync(directory+name+'.template','utf8');
  const output=template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{assert(key in v,key);return String(v[key]);});assert(!output.includes('{{'));
  const path='packages/demos/src/alg-l07-'+profile.page+'-'+name;
  // Existing admitted consumer bytes are compared, never silently replaced.
  if(process.argv.includes('--check')||fs.existsSync(path))assert.equal(fs.readFileSync(path,'utf8'),output,path);else fs.writeFileSync(path,output,{flag:'wx'});
  rows.push({page:profile.page,path,bytes:Buffer.byteLength(output),sha256:sha(output),templateSha256:sha(template)});
 }
}
console.log(JSON.stringify({pass:true,consumers:profiles.map(p=>p.page),rows},null,2));
