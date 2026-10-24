import assert from 'node:assert/strict';
import {isP051RuntimeModule,isP051RuntimeScope,P051_RUNTIME_ID} from '../apps/web/lib/nms-l02-p051-runtime-access';
import {P051_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p051-audio-plan-v1';
import {P051_FRAME_DOMAINS,P051_SOURCE_SHA256} from '../packages/demos/src/nms-l02-p051-frame-v1';
const env={NODE_ENV:'development'};
const props={audioEnabled:true,animationId:P051_RUNTIME_ID,moduleKey:P051_RUNTIME_ID,query:{capture:'0',frameDomain:'sprite-257',scenario:'source-inspection',lang:'en'}};
assert.ok(isP051RuntimeScope(props,env));
for(const patch of [{NODE_ENV:'production'},{VERCEL_ENV:'preview'},{VERCEL_ENV:'production'}])assert.equal(isP051RuntimeScope(props,{...env,...patch}),false);
for(const patch of [{audioEnabled:false},{animationId:'other'},{moduleKey:'other'}])assert.equal(isP051RuntimeScope({...props,...patch},env),false);
for(const patch of [{capture:'1'},{capture:true},{capture:1},{frameDomain:'root'},{scenario:'practice'},{lang:'es'}])assert.equal(isP051RuntimeScope({...props,query:{...props.query,...patch}},env),false);
const candidate={key:P051_RUNTIME_ID,maturity:'private-current-js',textPresentation:{Renderer:()=>null},runtime:{defaultFrameDomain:'sprite-257',frameCount:10,fps:12,frameDomains:Object.entries(P051_FRAME_DOMAINS).map(([id,frameCount])=>({id,frameCount,...(id==='root'?{}:{rootFrame:6})}))},privateP051FractionMatch:{version:1,sourceSwfSha256:P051_SOURCE_SHA256,audio:P051_AUDIO_PLANS}};
assert.ok(isP051RuntimeModule(candidate));
for(const patch of [{key:'other'},{maturity:'stable'},{textPresentation:{Renderer:null}},{runtime:{...candidate.runtime,fps:24}},{runtime:{...candidate.runtime,frameCount:503}},{runtime:{...candidate.runtime,defaultFrameDomain:'root'}},{privateP051FractionMatch:{...candidate.privateP051FractionMatch,sourceSwfSha256:'0'.repeat(64)}},{privateP051FractionMatch:{...candidate.privateP051FractionMatch,version:2}},{privateP051FractionMatch:{...candidate.privateP051FractionMatch,audio:{}}}])assert.equal(isP051RuntimeModule({...candidate,...patch}),false);
for(const domain of candidate.runtime.frameDomains){for(const change of ['count','rootFrame','duplicate','missing']){const ds=candidate.runtime.frameDomains.map(d=>({...d}));const index=ds.findIndex(d=>d.id===domain.id);if(change==='count')ds[index].frameCount++;if(change==='rootFrame'){if(domain.id==='root')continue;ds[index].rootFrame=7;}if(change==='duplicate')ds.push({...domain});if(change==='missing')ds.splice(index,1);assert.equal(isP051RuntimeModule({...candidate,runtime:{...candidate.runtime,frameDomains:ds}}),false);}}
const audio=JSON.parse(JSON.stringify(P051_AUDIO_PLANS));audio['257'].segments[0].outputStart++;assert.equal(isP051RuntimeModule({...candidate,privateP051FractionMatch:{...candidate.privateP051FractionMatch,audio}}),false);
for(const value of [null,undefined,{},5,'module'])assert.equal(isP051RuntimeModule(value),false);
console.log('PASS: P051 runtime scope, source/audio identity, every frame-domain count/rootFrame/duplicate/missing mutation and malformed modules');
