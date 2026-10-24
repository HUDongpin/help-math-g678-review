import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {createServer} from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const source=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/GS/L2GS03.swf');
const ruffle=path.join(root,'node_modules/@ruffle-rs/ruffle');
const expectedSha256='06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const sourceStat=fs.lstatSync(sourceRoot);
assert.ok(sourceStat.isDirectory()&&!sourceStat.isSymbolicLink());
const swfStat=fs.lstatSync(source,{bigint:true});
assert.ok(swfStat.isFile()&&!swfStat.isSymbolicLink()&&swfStat.nlink===1n);
assert.equal(fs.realpathSync(source),source);
const swfBytes=fs.readFileSync(source);
assert.equal(swfBytes.length,2077270);
assert.equal(sha(swfBytes),expectedSha256);
const ruffleVersion=JSON.parse(fs.readFileSync(path.join(ruffle,'package.json'),'utf8')).version;
const allowed=new Set(fs.readdirSync(ruffle).filter(name=>
 name==='ruffle.js'||/^core\.ruffle\.[a-f0-9]+\.js$/u.test(name)||/^[a-f0-9]+\.wasm$/u.test(name)));
assert.ok(allowed.has('ruffle.js'));
const html=`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>P054 Ruffle forensic reference</title>
<style>html,body{margin:0;background:#20242a;color:#fff;font:16px system-ui}main{max-width:860px;margin:auto;padding:16px}#stage{width:800px;height:600px;background:#111}ruffle-player{width:800px;height:600px;display:block}small{display:block;margin:10px 0}</style>
<script src="/ruffle.js"></script></head><body><main>
<small>Forensic Ruffle reference only — not original-runtime, fidelity, audio, or acceptance evidence.</small>
<div id="stage"></div><p id="status" role="status">Loading source SWF…</p>
<script>
window.addEventListener('DOMContentLoaded',async()=>{
  try {
    const factory=window.RufflePlayer.newest();
    const player=factory.createPlayer();
    document.getElementById('stage').appendChild(player);
    await player.ruffle().load('/source.swf');
    document.getElementById('status').textContent='SWF loaded in forensic Ruffle runtime.';
  } catch(error) {
    document.getElementById('status').textContent='Ruffle load failed: '+String(error);
  }
});
</script></main></body></html>`;
const server=createServer((request,response)=>{
 const pathname=new URL(request.url??'/',`http://${request.headers.host??'127.0.0.1'}`).pathname;
 response.setHeader('Cache-Control','no-store');
 response.setHeader('Referrer-Policy','no-referrer');
 if(pathname==='/'){
  response.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
  response.end(html);
 }else if(pathname==='/source.swf'){
  response.writeHead(200,{'Content-Type':'application/x-shockwave-flash'});
  response.end(swfBytes);
 }else{
  const name=pathname.slice(1);
  if(!allowed.has(name)){
   response.writeHead(404,{'Content-Type':'text/plain'});
   response.end('Not found');
   return;
  }
  const file=path.join(ruffle,name),stat=fs.lstatSync(file);
  assert.ok(stat.isFile()&&!stat.isSymbolicLink());
  response.writeHead(200,{'Content-Type':name.endsWith('.wasm')?'application/wasm':'application/javascript'});
  fs.createReadStream(file).pipe(response);
 }
});
server.listen(0,'127.0.0.1',()=>{
 const address=server.address();
 assert.ok(address&&typeof address!=='string');
 process.stdout.write(`${JSON.stringify({url:`http://127.0.0.1:${address.port}/`,
  animationId:'shared-nms002-l02-p054',sourceSha256:expectedSha256,
  ruffleVersion,authority:'forensic-only',networkScope:'loopback-only'})}\n`);
});
