async (basePage) => {
 const context=await basePage.context().browser().newContext();const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4392/');
 const streams = [{"spriteId": 101, "sampleRate": 22050, "url": "http://127.0.0.1:4392/stream-101.mp3", "bytes": 79430, "sha256": "5e8a7c8c4c71922813a2f487f7716bc0437e83dc2f9bee589b4bb487c35064b4", "expectedSamples": 351936}, {"spriteId": "SA", "sampleRate": 48000, "url": "http://127.0.0.1:4392/sa.mp3", "bytes": 198912, "sha256": "0053ea54e2f9a03a34072a4f74e8d4544264b51ef9822328d2b92f84f422fbc2"}];
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 return result;
}finally{await context.close();}
}
