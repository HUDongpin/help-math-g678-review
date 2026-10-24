import assert from 'node:assert/strict';
import {isP050RuntimeModule,isP050RuntimeScope,P050_RUNTIME_ID} from '../apps/web/lib/nms-l02-p050-runtime-access';
import {isNmsL2P050AudioRequest} from '../apps/web/lib/nms-l02-p050-audio-access';
import {P050_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p050-audio-plan-v1';
import {P050_FRAME_DOMAINS,P050_SOURCE_SHA256} from '../packages/demos/src/nms-l02-p050-frame-v1';
const env={NODE_ENV:'development',HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1',HELP_MATH_G678_CALIBRATION_PHASE:'frozen16-continuous-audio-provisional-browser-qa'};
const props={audioEnabled:true,animationId:P050_RUNTIME_ID,moduleKey:P050_RUNTIME_ID,query:{capture:'0',frameDomain:'sprite-94',scenario:'source-inspection',lang:'en'}};
assert.ok(isP050RuntimeScope(props,env));
for(const patch of [{NODE_ENV:'production'},{VERCEL_ENV:'preview'}])assert.equal(isP050RuntimeScope(props,{...env,...patch}),false);
assert.equal(isP050RuntimeScope({...props,query:{...props.query,capture:'1'}},env),false);
const candidate={key:P050_RUNTIME_ID,maturity:'private-current-js',textPresentation:{Renderer:()=>null},runtime:{defaultFrameDomain:'sprite-94',frameCount:10,fps:12,frameDomains:Object.entries(P050_FRAME_DOMAINS).map(([id,frameCount])=>({id,frameCount,...(id==='root'?{}:{rootFrame:6})}))},privateP050NumberLine:{version:1,sourceSwfSha256:P050_SOURCE_SHA256,audio:P050_AUDIO_PLANS}};
assert.ok(isP050RuntimeModule(candidate));assert.equal(isP050RuntimeModule({...candidate,key:'wrong'}),false);
assert.equal(isP050RuntimeModule({...candidate,privateP050NumberLine:{...candidate.privateP050NumberLine,sourceSwfSha256:'0'.repeat(64)}}),false);
for(const [domain,audio] of Object.entries(P050_AUDIO_PLANS)){
 const url=new URL(`http://127.0.0.1:3343/flash-assets/g678-local/${P050_RUNTIME_ID}/source-audio/${domain}?sha256=${audio.inputSha256}`);
 const headers=new Headers({host:'127.0.0.1:3343',referer:`http://127.0.0.1:3343/en/migration-status/g678-calibration/${P050_RUNTIME_ID}`,'sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'});
 assert.ok(isNmsL2P050AudioRequest({method:'GET',url,headers},domain,env));
 for(const [key,value] of [['range','bytes=0-1'],['sec-fetch-site','cross-site'],['referer','http://example.com/']]){const altered=new Headers(headers);altered.set(key,value);assert.equal(isNmsL2P050AudioRequest({method:'GET',url,headers:altered},domain,env),false);}
 url.searchParams.set('sha256','bad');assert.equal(isNmsL2P050AudioRequest({method:'GET',url,headers},domain,env),false);
}
assert.equal(isNmsL2P050AudioRequest({method:'GET',url:new URL('http://localhost'),headers:new Headers()},'93',env),false);
console.log('PASS: candidate identity, private scope,3 audio source policies and negative requests');
