async (page) => {
 await page.goto('http://127.0.0.1:4396/');
 const streams = [{"spriteId": 16, "sampleRate": 22050, "url": "http://127.0.0.1:4396/stream-16.mp3", "bytes": 83200, "sha256": "8ecc358df06edbb8992fdc4da03f6aa58afa0e12af0a583f4e3f7bb9fdc55f57", "expectedSamples": 368640}, {"spriteId": "SA", "sampleRate": 48000, "url": "http://127.0.0.1:4396/L7IN06.mp3", "bytes": 224112, "sha256": "b018c3035c865b4c7908095f87d4f3fd53c6f534eca4ccb6d438018a9cf298e5"}];
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 return result;
}