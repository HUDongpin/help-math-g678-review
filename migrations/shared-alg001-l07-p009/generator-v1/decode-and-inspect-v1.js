async (page) => {
 const streams = __STREAMS__;
 const result = await page.evaluate(async streams => {
  const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  const measured=[];
  for(const s of streams){const c=new AudioContext({sampleRate:s.sampleRate});try{const r=await fetch(s.url),bytes=await r.arrayBuffer();if(r.status!==200||bytes.byteLength!==s.bytes||await hash(bytes)!==s.sha256)throw Error('source mismatch');const b=await c.decodeAudioData(bytes.slice(0));if(b.numberOfChannels!==1||b.sampleRate!==s.sampleRate||s.expectedSamples&&b.length!==s.expectedSamples)throw Error('decoder mismatch');const out=new ArrayBuffer(b.length*4),v=new DataView(out);let peak=0;for(let i=0;i<b.length;i++){const n=b.getChannelData(0)[i];if(!Number.isFinite(n))throw Error('nonfinite');v.setFloat32(i*4,n,true);peak=Math.max(peak,Math.abs(n));}if(!peak)throw Error('silent');await c.close();measured.push({spriteId:s.spriteId,sourceBytes:bytes.byteLength,sourceSha256:s.sha256,sampleRate:b.sampleRate,channels:b.numberOfChannels,decodedSamples:b.length,pcmSha256:await hash(out),peak,contextClosed:c.state==='closed',userAgent:navigator.userAgent});}finally{if(c.state!=='closed')await c.close();}}
  return{pass:true,streams:measured,sourceAlignmentAccepted:false,listeningAccepted:false};
 },streams);
 await page.setViewportSize({width:1050,height:950});
 await page.setContent('<!DOCTYPE html><body style="font:18px sans-serif;background:white;display:grid;grid-template-columns:1fr 1fr;gap:20px">'+[9,17,53,24,30,31,49,52].map(id=>'<section style="border:1px solid #aaa;padding:12px"><h2>Source shape '+id+'</h2><img style="max-width:100%;min-height:45px;max-height:180px" src="http://127.0.0.1:4389/ffdec-shapes/shapes/'+id+'.svg"></section>').join('')+'</body>');
 await page.locator('img').evaluateAll(xs=>Promise.all(xs.map(x=>x.decode())));
 await page.screenshot({path:__SCREENSHOT__,fullPage:true});return result;
}
