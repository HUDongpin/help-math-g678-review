import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const assets = {
  main: ['assets/source-stream-363-main.mp3', 22050],
  right6: ['assets/source-stream-110-right6.mp3', 22050],
  right1: ['assets/source-stream-150-right1.mp3', 22050],
  right4: ['assets/source-stream-191-right4.mp3', 22050],
  right5: ['assets/source-stream-242-right5.mp3', 22050],
  wrong1: ['assets/source-stream-299-wrong1.mp3', 22050],
  wrong2: ['assets/source-stream-337-wrong2.mp3', 22050],
  wrong3: ['assets/source-stream-362-wrong3.mp3', 22050],
  sa: ['source-v1/L6IN03.mp3', 48000],
};
const html = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex"><title>P031 local source inspection</title>
<style>body{margin:0;font:16px Arial;background:white}canvas{display:block}pre{white-space:pre-wrap}</style>
<canvas id="stage" width="800" height="600"></canvas><pre id="result"></pre>
<script src="/canvas.js"></script><script>
const asset=HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p031'];
window.draw=async request=>{await asset.ready();const result=asset.render(document.getElementById('stage'),request);document.getElementById('result').textContent=JSON.stringify(result,null,2);return result;};
window.ready=window.draw({frame:1611});
const inputs=${JSON.stringify(assets)};
const digest=async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),x=>x.toString(16).padStart(2,'0')).join('');
window.measure=async()=>{
  const result={kind:'p031-chromium-decoded-audio-v1',userAgent:navigator.userAgent,createdAt:new Date().toISOString(),bindings:{},alignmentAccepted:false,listeningAccepted:false};
  for(const [id,[file,rate]] of Object.entries(inputs)){
    const response=await fetch('/audio/'+id);if(!response.ok)throw Error('audio HTTP '+response.status);
    const bytes=await response.arrayBuffer(),sourceSha256=await digest(bytes);
    const context=new AudioContext({sampleRate:rate});
    try{
      const decoded=await context.decodeAudioData(bytes.slice(0));
      const pcm=new ArrayBuffer(decoded.length*decoded.numberOfChannels*4),view=new DataView(pcm);
      for(let ch=0;ch<decoded.numberOfChannels;ch++)for(let i=0;i<decoded.length;i++){
        const sample=decoded.getChannelData(ch)[i];if(!Number.isFinite(sample))throw Error('nonfinite PCM');
        view.setFloat32((ch*decoded.length+i)*4,sample,true);
      }
      result.bindings[id]={file,sourceBytes:bytes.byteLength,sourceSha256,sampleRate:decoded.sampleRate,channels:decoded.numberOfChannels,decodedSamples:decoded.length,pcmSha256:await digest(pcm)};
    }finally{await context.close();}
  }
  return result;
};
</script></html>`;
const server = http.createServer((request, response) => {
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Robots-Tag', 'noindex');
  if (request.method !== 'GET') {response.writeHead(405).end(); return;}
  if (request.url === '/') {response.setHeader('Content-Type', 'text/html'); response.end(html); return;}
  if (request.url === '/player.html') {
    response.setHeader('Content-Type', 'text/html');
    response.end('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>P031 local player</title><style>body{margin:0;font:16px Arial}#root{max-width:800px}</style><div id="root"></div><script src="/canvas.js"></script><script src="/player.js"></script></html>'); return;
  }
  if (request.url === '/player.js') {
    response.setHeader('Content-Type', 'text/javascript');
    fs.createReadStream('/Volumes/American Dream/hudongpin/g678-p031-native-browser-20261003-v1/player-bundle.js').pipe(response); return;
  }
  const id = request.url?.startsWith('/audio/') ? request.url.slice(7) : '';
  const file = request.url === '/canvas.js' ? '/Volumes/American Dream/hudongpin/g678-p031-canvas-20261003-v1/canvas-renderer-draft.js' : Object.hasOwn(assets, id) ? assets[id][0] : null;
  if (!file) {response.writeHead(404).end(); return;}
  response.setHeader('Content-Type', file.endsWith('.js') ? 'text/javascript' : file.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg');
  fs.createReadStream(path.resolve(root, file)).pipe(response);
});
server.listen(4351, '127.0.0.1', () => console.log({pid:process.pid,origin:'http://127.0.0.1:4351',scope:'P031 Canvas and nine exact audio files'}));
