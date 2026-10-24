import fs from'node:fs';import crypto from'node:crypto';import assert from'node:assert/strict';import{execFileSync}from'node:child_process';
const base='tools/shared-page-factory/source-slider-feedback-v1/',directory='tools/shared-page-factory/source-slider-feedback-v3/',sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const old=JSON.parse(execFileSync(process.execPath,['migrations/shared-alg001-l07-p017/generator-v1/derive-shared-behavior-v1.mjs','--check'],{encoding:'utf8'}));assert(old.pass);assert.equal(old.newConsumer,'p017');
const allRows=[];
for(const p of JSON.parse(fs.readFileSync(directory+'profiles.json'))){
 const raw=fs.readFileSync(p.sourceModel),m=JSON.parse(raw),v=p.values;
 assert.equal(sha(raw),p.sourceModelSha256);assert.equal(m.source.sha256,p.sourceSha256);
 assert.deepEqual([m.mainSpriteId,m.mainFrameCount,m.quizFrame,m.forcedAnswerFrame,m.feedbackSpriteId,m.feedbackLastFrame,m.slider.initialText],[v.MAIN_ID,v.LAST,v.QUIZ,null,v.FEEDBACK_ID,v.FEEDBACK_LAST,v.INITIAL]);
 assert.equal(v.AFTER_LAST,v.LAST+1);assert(m.submit.source.includes('"'+v.CORRECT+'"'));
 assert.deepEqual([m.slider.minimumX,m.slider.maximumX,m.slider.step,m.slider.formula],[-70,130,1,'Math.round(this._x / 10 - 3)']);
 assert.deepEqual(m.timelines.find(t=>t.timelineId==='sprite-'+v.MAIN_ID).events.filter(e=>e.kind==='action-bytes').map(e=>e.frame),[1,v.QUIZ]);
 if(p.page==='p018'){assert.deepEqual([m.visibleAnswerFrame,m.inputSourceLastFrame,m.drawSourceLastFrame,m.feedbackAssignmentFrame],[125,124,361,2]);assert(m.sourceScripts.some(s=>s.source==='txtFeed.text = _global.WrongFeed;\r\n'));}
const pins={'state-v1.ts':'a78f8406ad37ad76b759bee39970e4fe677cfa39cb14eb86ccee26a6cbfecd84','session-v1.ts':'ff95d81c4cd5a59b0ef1024aac8642600848905615ee56fb522fb28249649a03','player-v1.tsx':'aa5298a920a16fbda7204b5dea2bb7f15b61682349c4735f07166f5c027f68e2'},rows=[];
const replace=(s,a,b)=>{assert.equal(s.split(a).length,2,a);return s.replace(a,b);};
for(const[n,h]of Object.entries(pins)){
 let t=fs.readFileSync(base+n+'.template','utf8');assert.equal(sha(t),h);
 if(n==='state-v1.ts'){t=replace(t,"e.frame>={{FORCED}}?'{{CORRECT}}':s.slope",'s.slope');t=replace(t,'Math.max(-150,Math.min(50,x))','Math.max(-70,Math.min(130,x))');t=replace(t,'Math.round((bounded/10+5)*10)/10','Math.round(bounded/10-3)');}
 if(n==='session-v1.ts')t=replace(t,'x:10*(value-5)','x:10*(value+3)');
 if(n==='player-v1.tsx')t=replace(t,"'source-slope'","'source-intercept'");
 const out=t.replace(/\{\{([A-Z_]+)\}\}/g,(_,key)=>{assert(key in v,key);return String(v[key]);});assert(!out.includes('{{'));const path='packages/demos/src/alg-l07-'+p.page+'-'+n;if(process.argv.includes('--check')||fs.existsSync(path))assert.equal(fs.readFileSync(path,'utf8'),out);else fs.writeFileSync(path,out,{flag:'wx'});rows.push({path,bytes:Buffer.byteLength(out),sha256:sha(out),templateSha256:h});
}
allRows.push({page:p.page,rows});}
console.log(JSON.stringify({pass:true,consumers:['p017','p018'],previousConsumersByteIdentical:true,existingConsumersVerified:old,scope:'Shared source-proven integer mapping, inverse-input and no-assignment transform; page profiles retain distinct lifetimes and popup timing.',rows:allRows},null,2));
