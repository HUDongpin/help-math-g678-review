import fs from'node:fs';import assert from'node:assert/strict';import{chromium}from'@playwright/test';
const B='migrations/shared-alg001-l07-p007',streams=JSON.parse(fs.readFileSync(B+'/native-v1/streams-v1.json'));
const browser=await chromium.launch({channel:'chrome',headless:true});const measured=[];
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:4387/');for(const stream of streams){
 const m=await page.evaluate(async expected=>{const context=new AudioContext({sampleRate:22050});
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  try{const r=await fetch('/stream-'+expected.spriteId+'.mp3'),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==expected.sourceBytes||await hash(bytes)!==expected.sourceSha256)throw Error('source-mismatch');
   const b=await context.decodeAudioData(bytes.slice(0));if(b.sampleRate!==22050||b.numberOfChannels!==1||b.length!==expected.decodedSamplesCandidate)throw Error('decode-mismatch');
   const pcm=new ArrayBuffer(b.length*4),v=new DataView(pcm);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(peak===0)throw Error('silent');await context.close();
   return{spriteId:expected.spriteId,sourceBytes:bytes.byteLength,sourceSha256:await hash(bytes),sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(pcm),peak,contextClosed:context.state==='closed',userAgent:navigator.userAgent};
  }finally{if(context.state!=='closed')await context.close();}},stream);assert(m.contextClosed);measured.push(m);}
 const result={at:new Date().toISOString(),pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};fs.writeFileSync(B+'/native-v1/decode-native-v1.json',JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({pass:true,streams:measured.length}));
}finally{await browser.close();}
