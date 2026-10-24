import assert from 'node:assert/strict';
import {p049TextSnapshot,P049_TEXT_BINDING} from '../packages/demos/src/nms-l02-p049-text-v1';
import {p049ModuleFrame} from '../packages/demos/src/nms-l02-p049-frame-v1';
const seen=new Set<string>();let queries=0;
function check(domain:string,scenario:string,frame:number,lang:'en'|'es',glossary?:any){
 const state=p049ModuleFrame(frame,{frame,frameDomain:domain,scenario,lang,seed:5,replay:2}),snapshot=p049TextSnapshot(state,{glossary});
 assert.equal(snapshot.status,'ready');assert.deepEqual(snapshot.blockers,[]);assert.equal(snapshot.blocks.length,58);
 assert.equal(snapshot.identity.frameDomain,domain);assert.equal(snapshot.identity.language,lang);assert.equal(snapshot.identity.replay,2);
 for(const block of snapshot.blocks){assert.equal(block.language,lang);if(block.visible){assert.ok(block.text.length);seen.add(block.id);}}
 queries++;return snapshot;
}
for(const lang of ['en','es'] as const){
 for(let frame=1;frame<=435;frame++)check('sprite-156','source-inspection',frame,lang);
 for(let frame=1;frame<=10;frame++){const s=check('root','source-inspection',frame,lang);if(frame<6)assert.equal(s.blocks.some(b=>b.visible),false);}
 for(const [scenario,frame]of [['question-2',350],['question-3',370],['answer-1',328],['answer-2',351],['answer-3',385],['all-correct-outro',390],['all-correct-outro',435]] as const)check('sprite-156',scenario,frame,lang);
 check('sprite-72','correct-feedback',2,lang);check('sprite-74','first-wrong',2,lang);
 for(const [domain,scenario,terms]of [['sprite-109','help-example',['decimal','place-value','tenth','hundredth']],['sprite-131','hint-example',['decimal','fraction','power','whole','equivalent']]] as const){check(domain,scenario,1,lang);for(const term of terms)check(domain,scenario,1,lang,term);}
 for(const frame of [172,173]){const s=check('sprite-156','source-inspection',frame,lang);assert.equal(s.blocks.find(b=>b.id==='demo-tenths')!.text,'6');assert.equal(s.blocks.find(b=>b.id==='demo-hundredths')!.visible,false);}
 const gap=check('sprite-156','answer-3',385,lang);assert.equal(gap.blocks.find(b=>b.id==='tenths-value')!.visible,false);assert.equal(gap.blocks.find(b=>b.id==='hundredths-value')!.visible,false);
 const reveal=check('sprite-156','all-correct-outro',390,lang);assert.equal(reveal.blocks.find(b=>b.id==='tenths-value')!.text,'9');assert.equal(reveal.blocks.find(b=>b.id==='hundredths-value')!.text,'8');
}
assert.deepEqual([...seen].sort(),P049_TEXT_BINDING.blocks.map(b=>b.id).sort());
const first=p049ModuleFrame(172,{frame:172,frameDomain:'sprite-156',scenario:'source-inspection',lang:'en',seed:0});assert.throws(()=>p049TextSnapshot(first,{glossary:'whole'}),/GLOSSARY_STATE/);
console.log(JSON.stringify({status:'PASS',queries,roles:seen.size,rootHidden:true,digitDepthSwap:true,thirdAnswerGap:true,glossaryStateGated:true}));
