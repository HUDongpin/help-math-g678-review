import fs from 'node:fs';import crypto from 'node:crypto';import assert from 'node:assert/strict';
import {collectSwfTextSourceCatalog} from '../../../scripts/lib/swf-text-source-catalog.mjs';
const B='migrations/shared-alg001-l07-p007',OLD='migrations/shared-alg001-l07-p006/audit-v1/l7-p007-p009-compatibility-v1';
const read=p=>fs.readFileSync(p),sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const pin=p=>({path:p,bytes:read(p).length,sha256:sha(read(p))});
const audit=JSON.parse(read(OLD+'/compatibility-v1.json')).pages[0],source=audit.identity;
assert.equal(sha(read(source.path)),source.sha256);assert.equal(sha(read(source.readOnlyCopy)),source.sha256);
for(const row of [...audit.sourceScripts,...audit.sourceTexts])assert.deepEqual(pin(row.file.path),row.file);
for(const row of audit.sourceEvidence)assert.deepEqual(pin(row.path),row);
const put=(p,bytes)=>{if(process.argv.includes('--check')||fs.existsSync(p))assert.deepEqual(read(p),Buffer.from(bytes));else fs.writeFileSync(p,bytes,{flag:'wx'});};
put(B+'/source-v1/L7VB02.swf',read(source.path));put(B+'/source-v1/index.xml',read('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L7/index.xml'));
const catalog=collectSwfTextSourceCatalog(read(source.path));
const timelines=catalog.timelines.map(t=>{const live=new Map(),frames=[];for(let frame=1;frame<=t.declaredFrameCount;frame++){
 for(const e of t.events.filter(e=>e.frame===frame)){if(e.kind==='remove')live.delete(e.depth);else if(e.kind==='place'){
 const p=e.move?{...live.get(e.depth)}:{matrix:[1,0,0,1,0,0],depth:e.depth,placedFrame:frame};
 for(const key of ['characterId','matrix','colorTransform','ratio','name','clipDepth','instanceId'])if(key in e)p[key]=e[key];assert(p.characterId);live.set(e.depth,p);}}
 frames.push([...live.values()].map(p=>({...p})));}
 return {...t,frames};});
const main=timelines.find(t=>t.timelineId==='sprite-228');assert.equal(main.declaredFrameCount,173);assert.deepEqual(main.events.filter(e=>e.kind==='action-bytes').map(e=>e.frame),[109]);
const range=(id,domain='sprite-228')=>{const out=[];for(const [i,poses]of timelines.find(t=>t.timelineId===domain).frames.entries())if(poses.some(p=>p.characterId===id)){if(out.at(-1)?.[1]===i)out.at(-1)[1]=i+1;else out.push([i+1,i+1]);}return out;};
const hostOld=JSON.parse(read('migrations/shared-alg001-l06-p041/behavior-v1/conditional-host-resolution-v1.json'));
const host={swf:hostOld.inputs.hostSwf,frame35:hostOld.inputs.hostFrame35ActionScript,frame49:hostOld.inputs.hostFrame49ActionScript};
for(const row of Object.values(host))assert.deepEqual(pin(row.path),row);
const xml=read(B+'/source-v1/index.xml').toString();assert(xml.includes('VB/L7VB02.swf')&&xml.includes('HELP_COURSES/ALG001/ALG001.jpg'));
const hostScript=read(host.frame35.path).toString();for(const token of ['function showWrongFeed()','intMc_Name = random(3);','function showRightFeed()','intMc_Name = random(4);','gotoAndPlay(2);'])assert(hostScript.includes(token));
const branches=[{spriteId:119,kind:'wrong',index:1,hold:23,close:116,closeJump:24,terminal:28},{spriteId:98,kind:'wrong',index:2,hold:22,close:87,closeJump:23,terminal:28},{spriteId:67,kind:'wrong',index:3,hold:20,close:62,closeJump:21,terminal:29},{spriteId:145,kind:'right',index:1,terminal:31},{spriteId:177,kind:'right',index:2,terminal:25},{spriteId:224,kind:'right',index:3,terminal:32},{spriteId:210,kind:'right',index:4,terminal:27}].map(b=>({...b,...(b.kind==='wrong'?{closeRanges:range(b.close,'sprite-'+b.spriteId)}:{})}));
for(const b of branches){const script=audit.sourceScripts.find(x=>x.file.path.endsWith(`DefineSprite_${b.spriteId}/frame_${b.terminal}/DoAction.as`)).source;assert(script.includes('_parent.play();'));if(b.kind==='wrong')assert(script.includes('_global.quizTryCount++;'));}
const model={schemaVersion:1,animationId:source.animationId,source:pin(source.path),priorAudit:pin(OLD+'/compatibility-v1.json'),xml:pin(B+'/source-v1/index.xml'),stage:{width:800,height:600},fps:12,rootFrameCount:10,mainSpriteId:228,mainFrameCount:173,quizFrame:109,postQuizFrame:110,correctAnswer:2,answerCharacters:{1:41,2:40,3:41,4:41},branches,
 conditionalHost:{...host,staticBinding:'same ALG001 course image, exact named feedback instances and matching page callbacks',historicalLaunchObserved:false,selection:'random3+1 wrong / random4+1 right; x5; gotoAndPlay2; only indices1..4 selected; Mc_Right_Feed5 duplicate is unreachable by selector'},
 behavior:{wrongIncrement:'feedback-terminal-after-close-exit',wrongFirst:'The graph of a linear function is a straight line. Try again.',wrongLater:'The graph of a linear function is a straight line. ',end:'ordinary173-to1 wrap, next109 resets quiz',replay:'full modern page reset; independent original-host acceptance',loopDoesNotCompleteLesson:true},
 glossary:audit.glossary.map(g=>({...g,characterId:Number(g.script.path.match(/DefineButton2_(\d+)/)[1]),frameRanges:range(Number(g.script.path.match(/DefineButton2_(\d+)/)[1]))})),
 texts:catalog.textDefinitions.map(t=>({...t,text:t.runs?.map(r=>r.text).join('')??t.initialText??'',mainFrameRanges:range(t.characterId)})),timelines,
 reusedEvidence:[...audit.sourceEvidence,...audit.sourceScripts.map(s=>s.file)],streams:audit.streams,originalRuntimeAccepted:false,registryModified:false};
put(B+'/native-v1/source-model-v1.json',JSON.stringify(model,null,2)+'\n');
put(B+'/source-v1/source-text-catalog-v1.json',JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({pass:true,timelines:timelines.length,branches,glossary:model.glossary.map(g=>({term:g.term,ranges:g.frameRanges})),texts:model.texts.filter(t=>t.mainFrameRanges.length).map(t=>({id:t.characterId,text:t.text,ranges:t.mainFrameRanges})),root:timelines.find(t=>t.timelineId==='root').events.filter(e=>e.kind==='place')},null,2));
