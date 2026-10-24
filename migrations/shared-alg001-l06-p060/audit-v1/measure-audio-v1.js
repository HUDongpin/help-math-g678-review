async page => {
 const browser = await page.evaluate(async () => {
  const manifest=await(await fetch('/audio-manifest.json')).json(),context=new AudioContext({sampleRate:44100}),rows=[];
  const sha=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
  try {for(const a of manifest){
   const res=await fetch('/audio/'+a.id);if(!res.ok)throw Error('fetch '+a.id);const b=await res.arrayBuffer();if(b.byteLength!==a.bytes||await sha(b)!==a.sha256)throw Error('source '+a.id);
   const d=await context.decodeAudioData(b.slice(0));if(d.sampleRate!==44100)throw Error('rate');
   const pcm=new ArrayBuffer(d.length*d.numberOfChannels*4),view=new DataView(pcm);let peak=0,sum=0;
   for(let c=0;c<d.numberOfChannels;c++)for(let i=0;i<d.length;i++){const v=d.getChannelData(c)[i];if(!Number.isFinite(v))throw Error('nonfinite');peak=Math.max(peak,Math.abs(v));sum+=v*v;view.setFloat32((c*d.length+i)*4,v,true);}
   if(peak===0)throw Error('silence '+a.id);rows.push({...a,sampleRate:d.sampleRate,channels:d.numberOfChannels,decodedSamples:d.length,duration:d.duration,pcmSha256:await sha(pcm),peak,rms:Math.sqrt(sum/(d.length*d.numberOfChannels))});
  }} finally {await context.close();}
  return {pass:true,userAgent:navigator.userAgent,contextClosed:context.state==='closed',sampleRate:44100,rows};
 });
 for(let id=1;id<=24;id++){await page.evaluate(id=>window.drawQuestion(id),id);await page.locator('#myCanvas').screenshot({path:`/Volumes/American Dream/hudongpin/g678-p060-source-browser-20261003-v1/source-q${id}-v1.png`});}
 return {kind:'p060-browser-decode-and-source-drawing-v1',...browser,sourceScreenshots:24,originalRuntime:false,acceptance:false};
}
