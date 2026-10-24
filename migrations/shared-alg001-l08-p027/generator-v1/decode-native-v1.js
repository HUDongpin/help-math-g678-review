async (basePage) => {
 const context=await basePage.context().browser().newContext();const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4396/');
 const streams=[{"spriteId": 41, "sampleRate": 22050, "path": "/stream-41.mp3", "bytes": 291720, "sha256": "fa7289d1e1ee53997ddbf3201f4c5f32444c9bc219984fae451327b10f959dde", "expectedSamples": 1292544}, {"spriteId": "SA", "sampleRate": 48000, "path": "/sa.mp3", "bytes": 266448, "sha256": "1c97275b20fd92b9a25fee8449a47f61ce18798f2561274b9560a9437d20c6ca"}];
 const result=await page.evaluate(async streams=>{
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');const measured=[];
 for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.path),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
 return {pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};},streams);
 return result;
 }finally{await context.close();}
}