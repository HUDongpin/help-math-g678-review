import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out='output/alg-l06-p004-substitution-capture-v1';
const canvasPath='output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js';
const sha=b=>createHash('sha256').update(b).digest('hex');
const bytes=fs.readFileSync(path.join(root,canvasPath));
assert.equal(sha(bytes),'6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8');
function write(name,b){const p=path.join(root,out,name);fs.mkdirSync(path.dirname(p),{recursive:true});
 if(fs.existsSync(p))assert.deepEqual(fs.readFileSync(p),b);else fs.writeFileSync(p,b,{flag:'wx'});
 return {path:`${out}/${name}`,bytes:b.length,sha256:sha(b)};}
const browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio']});
const errors=[],requests=[],frames=[];
try{
 const page=await browser.newPage({viewport:{width:800,height:600},deviceScaleFactor:1});
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
 await page.setContent('<canvas id="stage" width="800" height="600"></canvas><style>body{margin:0}</style>');
 await page.addScriptTag({content:bytes.toString()});
 await page.evaluate(()=>globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004'].ready());
 for(const frame of [306,307,310,313,314,315]){
  const state=await page.evaluate(frame=>globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004'].render(document.getElementById('stage'),{frame,scenario:'source-static-frame',lang:'en',seed:0}),frame);
  assert.equal(state.localFrame,frame);assert.equal(state.rootFrame,6);
  frames.push({frame,image:write(`frame-${frame}.png`,await page.locator('#stage').screenshot())});
 }
 assert.deepEqual(errors,[]);assert(requests.every(r=>r.startsWith('data:')));
 const result={kind:'p004-substitution-source-canvas-capture-v1',claimBoundary:'Generated safe Canvas only; no original runtime or acceptance',canvas:{path:canvasPath,bytes:bytes.length,sha256:sha(bytes)},browserVersion:browser.version(),frames,errors,requests};
 console.log(JSON.stringify(write('receipt.json',Buffer.from(JSON.stringify(result,null,2)+'\n'))));
}finally{await browser.close();}
