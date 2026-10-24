import assert from 'node:assert/strict';
import {isNmsL2P051AudioRequest,P051_AUDIO_SOURCES} from '../apps/web/lib/nms-l02-p051-audio-access';
const env={NODE_ENV:'development',HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1',HELP_MATH_G678_CALIBRATION_PHASE:'frozen16-continuous-audio-provisional-browser-qa'};
let positive=0,negative=0;
for(const [domain,source]of Object.entries(P051_AUDIO_SOURCES)){
 const headers=new Headers({host:'127.0.0.1:3231',referer:'http://127.0.0.1:3231/en/migration-status/g678-calibration/shared-nms002-l02-p051','sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'});
 const request={method:'GET',url:new URL(`http://localhost:3231${source.path}?sha256=${source.sha256}`),headers};
 assert.equal(isNmsL2P051AudioRequest(request,domain,env),true,'Next normalized URL preserves actual Host origin');positive++;
 for(const [key,value]of [['host','localhost:3231'],['host','example.com:3231'],['host','127.0.0.1:9999'],['referer','http://localhost:3231/en/migration-status/g678-calibration/shared-nms002-l02-p051'],['origin','http://127.0.0.1:9999'],['x-forwarded-host','example.com'],['sec-fetch-site','cross-site']]){
  const changed=new Headers(headers);changed.set(key,value);
  assert.equal(isNmsL2P051AudioRequest({...request,headers:changed},domain,env),false,key);negative++;
 }
 for(const value of ['http://localhost:9999','http://example.com:3231','https://localhost:3231']){
  assert.equal(isNmsL2P051AudioRequest({...request,url:new URL(value+source.path+'?sha256='+source.sha256)},domain,env),false);negative++;
 }
}
console.log(JSON.stringify({passed:true,positive,negative,scope:'Normalized loopback URL only; actual Host/Referer/Origin remain bound'}));
