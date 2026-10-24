async (page) => {
 await page.goto('http://127.0.0.1:4394/');
 const streams = [{"spriteId": 37, "sampleRate": 22050, "url": "http://127.0.0.1:4394/stream-37.mp3", "bytes": 137670, "sha256": "552310961b35dd39184f3fd84067ecbeb85c38f44a72ccb5fb11ce7dd637467e", "expectedSamples": 609984}, {"spriteId": "SA", "sampleRate": 48000, "url": "http://127.0.0.1:4394/L7IN03.mp3", "bytes": 276864, "sha256": "c5b19ffb6ed0e61faa53b8f796665220f923beabe6d20ffd82c3a10374299712"}];
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 return result;
}