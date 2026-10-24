import {p043DecodeAudio} from '../packages/demos/src/nms-l02-p043-audio-decode-v1';
import { P043_AUDIO_PLANS } from '../packages/demos/src/generated/nms-l02-p043-audio-plan-v1';
import { type P043AudioDomain } from '../packages/demos/src/nms-l02-p043-audio-pcm-v1';
const output=document.querySelector('pre')!;
async function run(){
 const playback=new AudioContext({sampleRate:22050});const gain=playback.createGain();gain.gain.value=0;gain.connect(playback.destination);await playback.resume();const rows=[];
 try{for(const domain of Object.keys(P043_AUDIO_PLANS)as P043AudioDomain[]){
  const p=P043_AUDIO_PLANS[domain];const r=await fetch('/'+domain+(domain==='183'?'.wav':'.mp3'));const bytes=await r.arrayBuffer();const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');if(bytes.byteLength!==p.inputBytes||hash!==p.inputSha256)throw Error('SOURCE_'+domain);
  const buffer=await p043DecodeAudio(playback,domain,bytes,new AbortController().signal);const node=playback.createBufferSource();node.buffer=buffer;node.connect(gain);await new Promise<void>((resolve,reject)=>{node.onended=()=>{node.disconnect();resolve()};try{node.start(0,0,Math.min(.05,buffer.duration))}catch(e){reject(e)}});
  rows.push({domain,sourceHash:hash,decodedRate:buffer.sampleRate,decodedSamples:p.decodedSamples,preparedSamples:buffer.length,duration:buffer.duration,playbackRate:playback.sampleRate,sourceRateBufferScheduled:true});
 }Object.assign(window,{result:{status:'PASS',rows,qualification:'Gain zero; complete decode and short scheduling probe, not listening or full transport acceptance.'}});
 }catch(error){Object.assign(window,{result:{status:'FAIL',rows,error:String(error)}})}finally{gain.disconnect();await playback.close();output.textContent=JSON.stringify((window as unknown as {result:unknown}).result);}
}
document.querySelector('button')!.addEventListener('click',()=>void run());
