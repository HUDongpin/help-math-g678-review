import fs from'node:fs';import crypto from'node:crypto';import assert from'node:assert/strict';import{fileURLToPath}from'node:url';
const directory=fileURLToPath(new URL('.',import.meta.url)),base=fileURLToPath(new URL('../source-slider-feedback-v1/',import.meta.url)),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const basePins={"profiles.json": "1ae823fce9b25bb6092c37dd5577a354c5959078129fe03d2e3196bb92770fb1", "state-v1.ts.template": "a78f8406ad37ad76b759bee39970e4fe677cfa39cb14eb86ccee26a6cbfecd84", "session-v1.ts.template": "ff95d81c4cd5a59b0ef1024aac8642600848905615ee56fb522fb28249649a03", "player-v1.tsx.template": "aa5298a920a16fbda7204b5dea2bb7f15b61682349c4735f07166f5c027f68e2"};for(const[n,h]of Object.entries(basePins))assert.equal(sha(fs.readFileSync(base+n)),h,n);
const previous=JSON.parse(fs.readFileSync(base+'profiles.json')).map(p=>({...p,values:{...p.values,SLOPE_AFTER_ADVANCE:`e.frame>=${p.values.FORCED}?'${p.values.CORRECT}':s.slope`}})),profiles=[...previous,...JSON.parse(fs.readFileSync(directory+'profiles.json'))],rows=[];
const needle="e.frame>={{FORCED}}?'{{CORRECT}}':s.slope";
for(const profile of profiles){
 const raw=fs.readFileSync(profile.sourceModel),m=JSON.parse(raw),v=profile.values;assert.equal(sha(raw),profile.sourceModelSha256);assert.equal(m.source.sha256,profile.sourceSha256);assert.equal(m.mainSpriteId,v.MAIN_ID);assert.equal(m.mainFrameCount,v.LAST);assert.equal(m.quizFrame,v.QUIZ);assert.equal(m.forcedAnswerFrame,v.FORCED);assert.equal(m.feedbackSpriteId,v.FEEDBACK_ID);assert.equal(m.feedbackLastFrame,v.FEEDBACK_LAST);assert.equal(m.slider.initialText,v.INITIAL);assert(m.submit.source.includes('"'+v.CORRECT+'"'));assert.equal(v.AFTER_LAST,v.LAST+1);
 if(profile.page==='p014'){assert.equal(v.FORCED,null);assert.equal(v.SLOPE_AFTER_ADVANCE,'s.slope');assert.deepEqual(m.timelines.find(t=>t.timelineId==='sprite-78').events.filter(e=>e.kind==='action-bytes').map(e=>e.frame),[1,84]);assert.equal(m.visibleAnswerFrame,87);assert.equal(m.texts.find(t=>t.characterId===66).text,'–1');}
 for(const name of['state-v1.ts','session-v1.ts','player-v1.tsx']){
  let template=fs.readFileSync(base+name+'.template','utf8');if(name==='state-v1.ts'){assert.equal(template.split(needle).length,2);template=template.replace(needle,'{{SLOPE_AFTER_ADVANCE}}');}
  const output=template.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{assert(key in v,key);return String(v[key]);});assert(!output.includes('{{'));
  const path='packages/demos/src/alg-l07-'+profile.page+'-'+name;
  if(process.argv.includes('--check')||fs.existsSync(path))assert.equal(fs.readFileSync(path,'utf8'),output,path);else fs.writeFileSync(path,output,{flag:'wx'});
  rows.push({page:profile.page,path,bytes:Buffer.byteLength(output),sha256:sha(output),baseTemplateSha256:basePins[name+'.template']});
 }
}
console.log(JSON.stringify({pass:true,consumers:profiles.map(p=>p.page),previousConsumersByteIdentical:true,scope:'Single source-proven no-assignment variation, previous fixed v1 inputs retained. No historical evidence renewal.',rows},null,2));
