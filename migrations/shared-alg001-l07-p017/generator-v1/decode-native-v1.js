async (basePage) => {
 const context=await basePage.context().browser().newContext();const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4392/');
 const streams = [{"spriteId": 94, "sampleRate": 22050, "url": "http://127.0.0.1:4392/stream-94.mp3", "bytes": 2860, "sha256": "eda4c91d416c0f17b76f846c98aa09e6a7359bb54d7cf6851ea19d0528d2c4a4", "expectedSamples": 12672}, {"spriteId": 99, "sampleRate": 22050, "url": "http://127.0.0.1:4392/stream-99.mp3", "bytes": 103090, "sha256": "e07bc5cdf95455e45f2e545a8e4151e7a1ca5f892dc990d814f28714cc8b6bc8", "expectedSamples": 456768}, {"spriteId": "SA", "sampleRate": 48000, "url": "http://127.0.0.1:4392/sa.mp3", "bytes": 178416, "sha256": "81bab0980fbd0ae1cbb9f54a4742782874616dfb434605f556cc8c422a63b560"}];
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 return result;
}finally{await context.close();}
}
