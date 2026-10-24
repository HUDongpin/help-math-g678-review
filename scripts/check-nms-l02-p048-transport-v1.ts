import assert from 'node:assert/strict';
import {P048AudioTransport} from '../packages/demos/src/nms-l02-p048-audio-transport-v1';
async function main(){
 const starts:number[][]=[],nodes:any[]=[];let closes=0,reads=0;
 const context:any={currentTime:0,destination:{},createGain:()=>({gain:{value:0},connect(){},disconnect(){}}),resume:async()=>{},close:async()=>{closes++;},createBufferSource:()=>{const node={buffer:null,onended:null,connect(){},disconnect(){},stop(){},start(...args:number[]){starts.push(args);}};nodes.push(node);return node;}};
 const transport=new P048AudioTransport({context:()=>context,read:async()=>{reads++;return new ArrayBuffer(1);},decode:async()=>({length:100000,sampleRate:22050} as AudioBuffer)});
 const window={domain:'442' as const,start:1838,end:36562};
 assert.equal(await transport.play(window),true);context.currentTime=.5;transport.pause();assert.equal(transport.snapshot().elapsed,.5);assert.equal(await transport.resume(),true);assert.equal(starts[1]![1],(1838+11025)/22050);assert.equal(reads,1);await transport.resume();assert.equal(starts.length,2);transport.stop();assert.equal(transport.snapshot().window,null);await transport.close();await transport.close();assert.equal(closes,1);assert.equal(await transport.play(window),false);
 let resolveRead!:(value:ArrayBuffer)=>void;let aborted=false;let decodes=0;
 const late=new P048AudioTransport({context:()=>context,read:async(_d,signal)=>{signal.addEventListener('abort',()=>aborted=true);return new Promise(r=>resolveRead=r);},decode:async()=>{decodes++;return {length:100000} as AudioBuffer;}});
 const pending=late.play(window);await late.close();resolveRead(new ArrayBuffer(1));assert.equal(await pending,false);assert.equal(aborted,true);assert.equal(decodes,0);assert.equal(starts.length,2);
 let resolveDecode!:(value:AudioBuffer)=>void;
 const lateDecode=new P048AudioTransport({context:()=>context,read:async()=>new ArrayBuffer(1),decode:()=>new Promise(r=>resolveDecode=r)});
 const loading=lateDecode.play(window);await Promise.resolve();lateDecode.stop();resolveDecode({length:100000} as AudioBuffer);assert.equal(await loading,false);assert.equal(starts.length,2);await lateDecode.close();
 console.log(JSON.stringify({passed:true,pauseResumeOffset:true,cacheReuse:true,duplicateResumeNoRestart:true,lateReadCancelled:true,lateDecodeCancelled:true,idempotentClose:true,scope:'Injected audio-context lifecycle tests; real playback pending.'}));
}
void main();
