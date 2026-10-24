import assert from 'node:assert/strict';
import {isNmsL2P051AudioRequest,P051_AUDIO_SOURCES} from '../apps/web/lib/nms-l02-p051-audio-access';
import {CONTINUOUS_AUDIO_PHASE} from '../apps/web/lib/continuous-source-audio-access';
const env={NODE_ENV:'development',HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1',HELP_MATH_G678_CALIBRATION_PHASE:CONTINUOUS_AUDIO_PHASE};
const headers=new Headers({host:'127.0.0.1:3343',referer:'http://127.0.0.1:3343/en/migration-status/g678-calibration/shared-nms002-l02-p051','sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'});
for(const [domain,source]of Object.entries(P051_AUDIO_SOURCES)){
 const request={method:'GET',url:new URL('http://127.0.0.1:3343'+source.path+'?sha256='+source.sha256),headers};
 assert.equal(isNmsL2P051AudioRequest(request,domain,env),true);
 for(const patch of [{NODE_ENV:'production'},{VERCEL_ENV:'preview'},{HELP_MATH_G678_LOCAL_PREVIEW:'0'},{HELP_MATH_G678_LOCAL_PREVIEW_BIND:'0.0.0.0'},{HELP_MATH_G678_CALIBRATION_PHASE:'wrong'}])assert.equal(isNmsL2P051AudioRequest(request,domain,{...env,...patch}),false);
 for(const [key,value] of [['range','bytes=0-1'],['sec-fetch-site','cross-site'],['sec-fetch-mode','navigate'],['sec-fetch-dest','audio'],['origin','https://example.com'],['host','localhost:3343'],['referer','http://127.0.0.1:3343/unrelated']]){const h=new Headers(headers);h.set(key,value);assert.equal(isNmsL2P051AudioRequest({...request,headers:h},domain,env),false);}
 for(const value of [request.url.href.replace(source.sha256,'0'.repeat(64)),request.url.href+'&extra=1',request.url.href.replace('http:','https:'),request.url.href.replace('127.0.0.1','example.com')])assert.equal(isNmsL2P051AudioRequest({...request,url:new URL(value)},domain,env),false);
 assert.equal(isNmsL2P051AudioRequest({...request,method:'POST'},domain,env),false);
 assert.equal(isNmsL2P051AudioRequest(request,'252',env),false);
}
console.log('PASS: three exact local audio requests; production, remote, malformed, cross-site, range, identity and unselected domain rejected');
