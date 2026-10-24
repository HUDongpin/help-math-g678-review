import test from 'node:test';
import assert from 'node:assert/strict';
import {NextURL} from 'next/dist/server/web/next-url';
import {CONTINUOUS_AUDIO_PATH,CONTINUOUS_AUDIO_PHASE,isContinuousSourceAudioRequest} from '../lib/continuous-source-audio-access';
const env={NODE_ENV:'development',HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1',HELP_MATH_G678_CALIBRATION_PHASE:CONTINUOUS_AUDIO_PHASE};
const make=()=>({url:new URL('http://127.0.0.1:3326'+CONTINUOUS_AUDIO_PATH+'?sha256='+'a'.repeat(64)),headers:new Headers({'sec-fetch-site':'same-origin','sec-fetch-mode':'cors','sec-fetch-dest':'empty','referer':'http://127.0.0.1:3326/en/migration-status/g678-calibration/shared-alg001-l06-p001'})});
test('exact private audio fetch allows source-ordered navigation within the same lesson',()=>{assert.equal(isContinuousSourceAudioRequest(make(),env),true);const request=make();request.headers.set('referer',request.headers.get('referer')!.replace('/en/','/es/'));assert.equal(isContinuousSourceAudioRequest(request,env),true);});
test('production, provider, other phase, other source and remote requests stay closed',()=>{
 for(const delta of [{NODE_ENV:'production'},{VERCEL_ENV:'preview'},{HELP_MATH_G678_CALIBRATION_PHASE:'frozen16-prepared-glossary-provisional-browser-qa'},{HELP_MATH_G678_LOCAL_PREVIEW_BIND:'0.0.0.0'}])assert.equal(isContinuousSourceAudioRequest(make(),{...env,...delta}),false);
 for(const url of ['https://127.0.0.1:3326'+CONTINUOUS_AUDIO_PATH,'http://example.org'+CONTINUOUS_AUDIO_PATH,'http://127.0.0.1:3326'+CONTINUOUS_AUDIO_PATH.replace('p040','p041')])assert.equal(isContinuousSourceAudioRequest({...make(),url:new URL(url)},env),false);
});
test('cross-origin, another lesson, media navigation, missing metadata and range requests stay closed',()=>{
 for(const [key,value] of [['sec-fetch-site','cross-site'],['sec-fetch-mode','navigate'],['sec-fetch-dest','audio'],['origin','http://localhost:3326'],['referer','http://127.0.0.1:3326/en/migration-status/g678-calibration/shared-alg001-l05-p001'],['range','bytes=0-10']]){const request=make();request.headers.set(key,value);assert.equal(isContinuousSourceAudioRequest(request,env),false);}
 for(const key of ['referer','sec-fetch-site','sec-fetch-mode','sec-fetch-dest']){const request=make();request.headers.delete(key);assert.equal(isContinuousSourceAudioRequest(request,env),false);}
});
test('real NextURL loopback normalization uses the actual Host without accepting another host or port',()=>{
 const request=make();request.url=new NextURL(request.url.href) as unknown as URL;assert.equal(request.url.hostname,'localhost');request.headers.set('host','127.0.0.1:3326');
 assert.equal(isContinuousSourceAudioRequest(request,env),true);
 for(const host of ['example.org:3326','127.0.0.1:7777','localhost:3326']){request.headers.set('host',host);assert.equal(isContinuousSourceAudioRequest(request,env),false);}
});

test('each of the eleven exact audio members is bound to its own source-ordered lesson',()=>{
 const ids=['shared-alg001-l01-p001','shared-alg001-l06-p040','shared-dat001-l01-p001','shared-dat001-l03-p030','shared-nms002-l01-p001','shared-dat001-l07-p025','shared-geo001-l02-p020','shared-geo001-l07-p040','shared-nms002-l05-p040','shared-nms002-l02-p020','shared-geo001-l01-p001'];
 for(const id of ids)for(const refererId of ids){
  const request=make();request.url=new URL('http://127.0.0.1:3326/flash-assets/g678-local/'+id+'/source-stream.mp3');
  request.headers.set('referer','http://127.0.0.1:3326/en/migration-status/g678-calibration/'+refererId);
  assert.equal(isContinuousSourceAudioRequest(request,env),id===refererId,id+' from '+refererId);
 }
});
