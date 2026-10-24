import fs from 'node:fs';import assert from 'node:assert/strict';import {chromium} from '@playwright/test';
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4386/');
 const measured=await page.evaluate(async()=>{const context=new AudioContext({sampleRate:44100});
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  try{const response=await fetch('/stream.mp3'),bytes=await response.arrayBuffer();if(response.status!==200||bytes.byteLength!==1219712||await hash(bytes)!=='eca77ae751726a8b10efb9ef5a33359a810ae089d658346a3253a92ced424b2a')throw Error('source-byte-identity');
   const audio=await context.decodeAudioData(bytes.slice(0));if(audio.sampleRate!==44100||audio.numberOfChannels!==1)throw Error('native-decoder-format');
   const pcm=new ArrayBuffer(audio.length*4),view=new DataView(pcm);let peak=0,sum=0;
   for(let i=0;i<audio.length;i++){const v=audio.getChannelData(0)[i];if(!Number.isFinite(v))throw Error('nonfinite');view.setFloat32(i*4,v,true);peak=Math.max(peak,Math.abs(v));sum+=v*v;}
   if(peak===0)throw Error('silent-source');await context.close();
   return{kind:'alg-l07-p006-native-decode-v1',pass:true,atUtc:new Date().toISOString(),userAgent:navigator.userAgent,sourceBytes:bytes.byteLength,sourceSha256:await hash(bytes),sampleRate:audio.sampleRate,channels:audio.numberOfChannels,decodedSamples:audio.length,duration:audio.duration,pcmSha256:await hash(pcm),peak,rms:Math.sqrt(sum/audio.length),contextClosed:context.state==='closed',listeningAccepted:false,originalRuntimeAccepted:false};
  }finally{if(context.state!=='closed')await context.close();}});
 assert(measured.pass&&measured.contextClosed);fs.writeFileSync('migrations/shared-alg001-l07-p006/native-v1/decode-native-v1.json',JSON.stringify(measured,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(measured));
}finally{await browser.close();}
