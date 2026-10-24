async (basePage) => {
 const context=await basePage.context().browser().newContext();const page=await context.newPage();try{
 await page.goto('http://127.0.0.1:4395/');
 const streams=[{"spriteId": 66, "sampleRate": 22050, "path": "/stream-66.mp3", "bytes": 207610, "sha256": "282b6789995e4d8a7294c967655b088199083a018acbcd95508fda9d8da8abec", "expectedSamples": 919872}, {"spriteId": "SA", "sampleRate": 48000, "path": "/sa.mp3", "bytes": 349104, "sha256": "ecb49b03d512aaca7dbdfd7d09e52230a237647c20b3bb1c1bc133ab7ddc5854"}];
 const result=await page.evaluate(async streams=>{
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');const measured=[];
 for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.path),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
 return {pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};},streams);
 return result;
 }finally{await context.close();}
}