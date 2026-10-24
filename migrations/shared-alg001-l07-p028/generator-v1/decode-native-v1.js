async (page) => {
 await page.goto('http://127.0.0.1:4398/');
 const streams = [{"spriteId": 50, "sampleRate": 22050, "url": "http://127.0.0.1:4398/stream-50.mp3", "bytes": 345670, "sha256": "2e3d64d94a1aa23f84ef28f877268aa6929eaecfdf750ae87d16f5a6c5856c88", "expectedSamples": 1531584}, {"spriteId": "SA", "sampleRate": 48000, "url": "http://127.0.0.1:4398/L7IN09.mp3", "bytes": 210672, "sha256": "7de47a10f643cb6d50439a76939585f1327e718d73acaf187bb00433d51dc83a"}];
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 return result;
}