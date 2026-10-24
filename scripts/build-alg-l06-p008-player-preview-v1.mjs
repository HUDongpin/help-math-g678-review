/** Local integration fixture; it neither registers P008 nor supplies a My Lesson route. */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const relative='output/alg-l06-p008-player-preview-v1';
const out=path.join(root,relative);
assert(!fs.existsSync(out),'preserve existing preview; inspect before creating a successor');
const resources=[
 ['output/alg-l06-p008-composed-canvas-v1/successor-v4/canvas-renderer.js','canvas-renderer.js','6bee67fa24900e148ad6babc1c82dbd66760aed42166cba7caa04667649e1d5c'],
 ['migrations/shared-alg001-l06-p008/audit/audio-v1/continuous-source-v1.mp3','main.mp3','ab14ce47d0f98c841213b222f27e7bc44587ba27849048ed1dd16bd41c2eabe2'],
];
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
for(const [p,,digest]of resources)assert.equal(sha(fs.readFileSync(path.join(root,p))),digest);
fs.mkdirSync(out,{recursive:true});
for(const [p,name]of resources)fs.copyFileSync(path.join(root,p),path.join(out,name));
const entry=`import React from 'react';
import {createRoot} from 'react-dom/client';
import {P008PlayerV1} from '../../packages/demos/src/alg-l06-p008-player-v1';
const asset=globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p008'];
window.p008Contexts=[];window.p008Snapshots=[];
const createContext=()=>{const c=new AudioContext({sampleRate:22050,latencyHint:'interactive'});window.p008Contexts.push(c);return c;};
const loadAudio=async signal=>{const r=await fetch('./main.mp3',{signal});if(!r.ok)throw Error('source-audio-response');return r.arrayBuffer();};
const onSnapshot=s=>{window.p008LastSnapshot=s;if(window.p008Snapshots.at(-1)?.phase!==s.phase)window.p008Snapshots.push(s);};
const root=createRoot(document.getElementById('player'));
const mount=()=>root.render(React.createElement(P008PlayerV1,{asset,loadAudio,createContext,onSnapshot,language:'en',reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches}));
document.getElementById('unmount').onclick=()=>root.render(null);
document.getElementById('mount').onclick=mount;mount();`;
fs.writeFileSync(path.join(out,'entry.tsx'),entry);
await build({entryPoints:[path.join(out,'entry.tsx')],outfile:path.join(out,'player.js'),bundle:true,format:'iife',platform:'browser',jsx:'automatic',define:{'process.env.NODE_ENV':'"production"'}});
fs.writeFileSync(path.join(out,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>P008 local player integration fixture</title><style>*{box-sizing:border-box}body{margin:0;padding:12px;background:#e7eff5;font:16px system-ui}main{max-width:800px;margin:auto}button{font:inherit;padding:.5em;margin:.25em}</style><main><div id="player"></div><aside aria-label="Engineering fixture lifecycle"><button id="unmount">Unmount fixture</button><button id="mount">Mount fixture</button></aside></main><script src="canvas-renderer.js"></script><script src="player.js"></script></html>');
const inputs=['scripts/build-alg-l06-p008-player-preview-v1.mjs','packages/demos/src/alg-l06-p008-player-v1.tsx','packages/demos/src/alg-l06-p008-clock-v1.ts','packages/demos/src/alg-l06-p008-native-text-v1.tsx','packages/demos/src/alg-l06-p008-text-state-v1.generated.ts','packages/demos/src/alg-l06-p008-audio-schedule-v1.ts','packages/demos/src/decoded-source-stream-transport.ts',...resources.map(r=>r[0]),...fs.readdirSync(out).map(f=>relative+'/'+f)];
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({kind:'p008-local-player-integration-fixture',myLesson:false,registered:false,files:inputs.map(p=>{const b=fs.readFileSync(path.join(root,p));return {path:p,bytes:b.length,sha256:sha(b)};})},null,2)+'\n');
console.log(JSON.stringify({output:relative,kind:'local-fixture-not-My-Lesson'}));
