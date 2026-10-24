import assert from 'node:assert/strict';
import fs from 'node:fs';
import {p051ModuleFrame,P051_FRAME_DOMAINS,P051_SCENARIOS,P051_SOURCE_SHA256} from '../packages/demos/src/nms-l02-p051-frame-v1';
import type {RuntimeContext} from '../packages/demos/src/contract';
const query=(frame:number,frameDomain='sprite-257',scenario='source-inspection',extra:Partial<RuntimeContext>={})=>p051ModuleFrame(frame,{frame,frameDomain,scenario,lang:'en',seed:0,...extra});
const source=JSON.parse(fs.readFileSync(new URL('../migrations/shared-nms002-l02-p051/audit/structural-intake-v1.json',import.meta.url),'utf8'));
assert.equal(source.sourceSha256,P051_SOURCE_SHA256);
for(const [id,count]of Object.entries(P051_FRAME_DOMAINS)){
 const timeline=source.timelines.find((x:{timelineId:string})=>x.timelineId===id);
 assert.equal(timeline.declaredFrameCount,count);assert.equal(timeline.observedFrameCount,count);
}
for(const lang of ['en','es'] as const)for(let frame=1;frame<=503;frame++){
 const a=query(frame,'sprite-257','source-inspection',{lang,replay:7,seed:0xffffffff});
 assert.equal(a.mainFrame,frame);assert.equal(a.state.phase,frame<485?'intro':'ready');
 assert.equal(a.postStopInspection,frame>485);assert.equal(a.rootFrame,6);assert.equal(a.replay,7);
 assert.equal(a.queryKind,'deterministic-modern-inspection');assert.deepEqual(a,query(frame,'sprite-257','source-inspection',{lang,replay:7,seed:0xffffffff}));
}
for(let frame=1;frame<=10;frame++){const a=query(frame,'root');assert.equal(a.mainFrame,frame<6?null:1);assert.equal(a.rootFrame,frame);}
for(let frame=1;frame<=15;frame++){const a=query(frame,'sprite-248','wrong-feedback');assert.equal(a.state.phase,frame===1?'ready':'wrong-feedback');assert.deepEqual(a.state.solved,[]);assert.equal(a.state.activeItem,frame===1?null:1);}
for(let frame=1;frame<=20;frame++){const a=query(frame,'sprite-250','correct-feedback');assert.equal(a.state.phase,frame===1?'ready':'correct-feedback');assert.deepEqual(a.state.solved,frame===1?[]:[0]);}
for(let frame=1;frame<=25;frame++){const a=query(frame,'sprite-256','completion-feedback');assert.equal(a.state.phase,'completion-feedback');assert.deepEqual(a.state.solved,[0,2,3,5,8]);}
for(let frame=486;frame<=503;frame++){const a=query(frame,'sprite-257','all-correct-outro');assert.equal(a.state.phase,frame===503?'complete':'outro');assert.deepEqual(a.state.solved,[0,2,3,5,8]);assert.equal(a.postStopInspection,false);}
assert.equal(query(485,'sprite-257','practice').state.phase,'ready');
for(const [domain,count]of Object.entries(P051_FRAME_DOMAINS))for(const frame of [0,-1,count+1,NaN,Infinity,1.5])assert.throws(()=>query(frame,domain));
const allowed:Record<string,readonly string[]>={'source-inspection':['root','sprite-257'],practice:['sprite-257'],'wrong-feedback':['sprite-248'],'correct-feedback':['sprite-250'],'completion-feedback':['sprite-256'],'all-correct-outro':['sprite-257']};
for(const scenario of P051_SCENARIOS)for(const domain of Object.keys(P051_FRAME_DOMAINS))if(!allowed[scenario].includes(domain))assert.throws(()=>query(1,domain,scenario));
for(const frame of [1,484,486,503])assert.throws(()=>query(frame,'sprite-257','practice'));
for(const frame of [1,484,485])assert.throws(()=>query(frame,'sprite-257','all-correct-outro'));
for(const domain of ['sprite-177','sprite-189','sprite-217','sprite-228','sprite-252','sprite-35','__proto__',''])assert.throws(()=>query(1,domain));
for(const scenario of ['help-example','unknown',''])assert.throws(()=>query(1,'sprite-257',scenario));
for(const seed of [-1,0x100000000,NaN,Infinity,0.5])assert.throws(()=>query(1,'sprite-257','source-inspection',{seed}));
for(const replay of [-1,Number.MAX_SAFE_INTEGER+1,NaN,Infinity,0.5])assert.throws(()=>query(1,'sprite-257','source-inspection',{replay}));
for(const rootFrame of [0,1,7,NaN,Infinity,6.5])assert.throws(()=>query(1,'sprite-257','source-inspection',{rootFrame}));
assert.throws(()=>query(6,'root','source-inspection',{rootFrame:1}));assert.throws(()=>query(1,'sprite-257','source-inspection',{frame:2}));
assert.throws(()=>query(1,'sprite-257','source-inspection',{lang:'fr' as RuntimeContext['lang']}));
console.log(JSON.stringify({status:'PASS',mainLanguageQueries:1006,rootFrames:10,wrongFrames:15,correctFrames:20,completionFrames:25,outroFrames:18,sourceDomainsRechecked:5,scope:'Native inspection recipes and fail-closed identity; not original runtime execution.'}));
