async page => page.evaluate(async()=>{
 const context=new AudioContext({sampleRate:22050});
 const hash=async b=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',b))].map(x=>x.toString(16).padStart(2,'0')).join('');
 try{
  const bytes=await(await fetch('/stream.mp3')).arrayBuffer();
  if(bytes.byteLength!==57070||await hash(bytes)!=='6ac6c824b8877f0365fb3ee878b2ba08e5015c44aa5e33fa3e9acc19dbe2e856')throw Error('source bytes');
  const decoded=await context.decodeAudioData(bytes.slice(0));
  const pcm=new ArrayBuffer(decoded.length*decoded.numberOfChannels*4),view=new DataView(pcm);let sum=0,peak=0;
  for(let c=0;c<decoded.numberOfChannels;c++)for(let i=0;i<decoded.length;i++){
   const v=decoded.getChannelData(c)[i];if(!Number.isFinite(v))throw Error('nonfinite');sum+=v*v;peak=Math.max(peak,Math.abs(v));view.setFloat32((c*decoded.length+i)*4,v,true);
  }
  if(peak===0)throw Error('silent');await context.close();
  return {kind:'alg-l07-p001-native-decode-v1',pass:true,at:new Date().toISOString(),userAgent:navigator.userAgent,
   sourceBytes:bytes.byteLength,sourceSha256:await hash(bytes),sampleRate:decoded.sampleRate,channels:decoded.numberOfChannels,
   decodedSamples:decoded.length,duration:decoded.duration,pcmSha256:await hash(pcm),peak,rms:Math.sqrt(sum/(decoded.length*decoded.numberOfChannels)),
   contextClosed:context.state==='closed',listeningAccepted:false,originalRuntimeAccepted:false};
 }finally{if(context.state!=='closed')await context.close();}
})
