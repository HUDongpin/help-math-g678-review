import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const R=process.cwd(),O='output/alg-l06-p033-source-planning-20261001-v1',M='migrations/shared-alg001-l06-p033';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=(p,digest)=>{const b=fs.readFileSync(p);if(digest)assert.equal(sha(b),digest,p);return b;};
const plan=JSON.parse(read(`${O}/source-plan-v1.json`,'8d3feaabd38f66bb4428fc6e249c3ebacfaece89552fed49a6429a30c0d96490'));
const list=JSON.parse(read(`${O}/source-display-list-v1.json`,'0e8191837e8d7725c8e88f3c2ff94f07fb0c40b13d52ff8fcc6ace2e7a1a6a7d'));
const swf=read(`${M}/source-v1/L6IN05.swf`,'fb11fd842f3f0948cf5b00bf3b7b63bde86f0af9bf41bb2f9e3a762a1daad071');
for(const script of list.scripts){const raw=read(`${O}/${script.path}`,script.sha256);assert.equal(raw.length,script.bytes);}
const action=(p)=>read(`${O}/source-export/scripts/${p}`).toString();
assert.equal(action('DefineSprite_190/frame_52/DoAction.as').replace(/\s/g,''),'stop();_global.quizSection=true;_global.quizTryCount=0;');
assert.equal(action('DefineSprite_190/frame_53/DoAction.as').replace(/\s/g,''),'_global.quizSection=false;');
const wrong=action('DefineButton2_19/BUTTONCONDACTION on(release).as');
assert(wrong.includes('_global.quizTryCount++;'));const strings=[...wrong.matchAll(/_global.WrongFeed = "([^"]+)"/g)].map(x=>x[1]);assert.equal(strings.length,2);
const branches=plan.feedbackDomains.map(b=>{const entry={spriteId:b.spriteId,kind:b.kind,index:b.variant,terminal:b.frames};
 const terminal=action(`DefineSprite_${b.spriteId}/frame_${b.frames}/DoAction.as`).replace(/\s/g,'');
 if(b.kind==='right'){assert.equal(terminal,'stop();_root.disableQuizButton();_global.quizSection=false;this.gotoAndStop(1);_parent.play();');return entry;}
 assert.equal(terminal,'stop();_root.enableQuizButton();this.gotoAndStop(1);if(_global.quizTryCount>=2){_global.quizTryCount=0;_global.quizSection=false;_parent.play();}');
 assert.equal(b.namedPopup.length,1);const popup=b.namedPopup[0];assert.equal(popup.presentSpans.length,1);const [first,hold]=popup.presentSpans[0];
 const sid=popup.objectId,close=list.sprites[sid].instances.find(x=>x.kind==='button'&&list.buttonDefinitions.some(b=>b.id===x.objectId));assert(close);
 const bid=close.objectId,script=action(`DefineButton2_${bid}/BUTTONCONDACTION on(release).as`);const jump=Number(script.match(/_parent.gotoAndPlay\((\d+)\)/)?.[1]);assert.equal(jump,hold+1);assert(script.includes('i <= 4'));assert.equal(action(`DefineSprite_${b.spriteId}/frame_${hold}/DoAction.as`).trim(),'stop();');
 return {...entry,hold,closePlacementFirst:first,closeButton:bid,closeJump:jump};});
assert.deepEqual(branches.map(b=>b.spriteId),[78,119,46,111,147,161,175]);
const binding={mainSpriteId:190,quizFrame:52,postQuizFrame:53,mainLastFrame:385,correctAnswer:1,answerCharacters:{1:20,2:19,3:19,4:19},wrongFirst:strings[0],wrongLater:strings[1],branches};
const code=`// Generated from the pinned P033 source plan and exact page actions. Do not hand-edit.\nimport type {TwoAttemptBinding} from '../source-two-attempt-feedback-quiz-v1';\nexport const P033_BEHAVIOR_SOURCE=${JSON.stringify({sourceSha256:sha(swf),sourcePlanSha256:sha(read(`${O}/source-plan-v1.json`)),binding},null,2)} as const satisfies {sourceSha256:string;sourcePlanSha256:string;binding:TwoAttemptBinding};\n`;
const out='packages/demos/src/generated/alg-l06-p033-behavior-v1.ts';assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write')fs.writeFileSync(out,code,{flag:'wx'});else assert.equal(read(out).toString(),code);
console.log(JSON.stringify({status:'PASS',path:out,bytes:Buffer.byteLength(code),sha256:sha(code),branches:branches.length}));
