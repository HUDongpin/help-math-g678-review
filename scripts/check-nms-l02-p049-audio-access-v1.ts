import assert from 'node:assert/strict';
import {P049_AUDIO_SOURCES,isNmsL2P049AudioRequest} from '../apps/web/lib/nms-l02-p049-audio-access';
import {CONTINUOUS_AUDIO_PHASE} from '../apps/web/lib/continuous-source-audio-access';
const env={NODE_ENV:'development',HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1',HELP_MATH_G678_CALIBRATION_PHASE:CONTINUOUS_AUDIO_PHASE};
const base='http://127.0.0.1:3343';let positives=0,negatives=0;
for(const [domain,pin]of Object.entries(P049_AUDIO_SOURCES)){
 const request={method:'GET',url:new URL(base+pin.path+'?sha256='+pin.sha256),headers:new Headers({host:'127.0.0.1:3343',referer:base+'/en/migration-status/g678-calibration/shared-nms002-l02-p049','sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty'})};
 assert.equal(isNmsL2P049AudioRequest(request,domain,env),true);positives++;
 const badHeaders=[['range','bytes=0-1'],['origin','https://example.org'],['referer',base+'/en/migration-status/g678-calibration/shared-nms002-l01-p049'],['host','evil.example'],['x-forwarded-host','evil.example'],['sec-fetch-site','cross-site'],['sec-fetch-mode','no-cors'],['sec-fetch-dest','audio']];
 for(const [name,value]of badHeaders){const headers=new Headers(request.headers);headers.set(name!,value!);assert.equal(isNmsL2P049AudioRequest({...request,headers},domain,env),false);negatives++;}
 for(const url of [base+pin.path+'?sha256=bad',base+pin.path+'?sha256='+pin.sha256+'&sha256='+pin.sha256,'https://127.0.0.1:3343'+pin.path+'?sha256='+pin.sha256,base+pin.path+'/extra?sha256='+pin.sha256]){assert.equal(isNmsL2P049AudioRequest({...request,url:new URL(url)},domain,env),false);negatives++;}
 for(const e of [{...env,NODE_ENV:'production'},{...env,VERCEL_ENV:'preview'},{...env,HELP_MATH_G678_LOCAL_PREVIEW:'0'},{...env,HELP_MATH_G678_CALIBRATION_PHASE:'wrong'}]){assert.equal(isNmsL2P049AudioRequest(request,domain,e),false);negatives++;}
 assert.equal(isNmsL2P049AudioRequest({...request,method:'POST'},domain,env),false);negatives++;
 assert.equal(isNmsL2P049AudioRequest(request,'999',env),false);negatives++;
}
console.log(JSON.stringify({status:'PASS',positives,negatives,scope:'Pure local source-audio request guards; actual HTTP route not yet created.'}));
