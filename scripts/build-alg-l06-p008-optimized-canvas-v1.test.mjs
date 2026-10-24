import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {chromium} from 'playwright';
import {buildP008OptimizedCanvas} from './build-alg-l06-p008-optimized-canvas-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/alg-l06-p008-composed-canvas-v1/successor-v4';
const OPT='output/alg-l06-p008-optimized-canvas-v1/successor-v2';
const sha=x=>createHash('sha256').update(x).digest('hex');
const frames=[...Array.from({length:67},(_,index)=>790+index),1,20,448,500,636,789,857,938];

test('generator retains exact source semantics and immutable five-slot cache scope',()=>{
  const built=buildP008OptimizedCanvas();
  assert(readFileSync(path.join(ROOT,OPT,'canvas-renderer.js')).equals(built.runtime));
  assert(readFileSync(path.join(ROOT,OPT,'preview.html')).equals(built.preview));
  assert(readFileSync(path.join(ROOT,OPT,'optimized-manifest.json')).equals(built.manifest));
  const manifest=JSON.parse(built.manifest);
  assert.equal(manifest.cacheContract.maximumEntries,5);
  assert.deepEqual(manifest.cacheContract.exactColorTransform.mult,[256,256,256,192]);
  assert.equal(manifest.acceptanceEffects.runtimeProductChanged,false);
});

async function sample(browser,folder){
  const context=await browser.newContext();
  try{
    const page=await context.newPage();
    const url=pathToFileURL(path.join(ROOT,folder,'preview.html')).href+'?frame=1';
    await page.goto(url);
    await page.waitForFunction(()=>document.body.dataset.candidateReady==='true'||Boolean(document.body.dataset.candidateError),null,{timeout:30000});
    assert.equal(await page.evaluate(()=>document.body.dataset.candidateError??null),null);
    return await page.evaluate(async ({id,frames})=>{
      const asset=globalThis.HELP_MATH_CANVAS_ASSETS[id],canvas=document.querySelector('#stage');
      const renderOnly={first:[],warm:[]};
      for(const pass of ['first','warm'])for(let frame=790;frame<=856;frame++){
        const begin=performance.now();
        const state=asset.render(canvas,{frame,scenario:'source-static-frame',lang:'en',seed:0});
        renderOnly[pass].push({frame,reportedFrame:state.localFrame,ms:performance.now()-begin});
      }
      async function render(frame){
        const start=performance.now();
        const state=asset.render(canvas,{frame,scenario:'source-static-frame',lang:'en',seed:0});
        const ms=performance.now()-start;
        const pixels=canvas.getContext('2d').getImageData(0,0,800,600).data;
        const digest=await crypto.subtle.digest('SHA-256',pixels);
        const pixelSha256=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
        return {frame,reportedFrame:state.localFrame,ms,pixelSha256};
      }
      const first=[],warm=[];
      for(const frame of frames)first.push(await render(frame));
      for(const frame of frames)warm.push(await render(frame));
      return {renderOnly,first,warm};
    },{id:'shared-alg001-l06-p008',frames});
  }finally{await context.close();}
}

test('Chrome pixel SHA-256 agrees for every frame 790–856 and other source states',async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    const version=browser.version();
    const original=await sample(browser,BASE),optimized=await sample(browser,OPT);
    assert.equal(original.first.length,frames.length);
    assert.equal(optimized.first.length,frames.length);
    for(const pass of ['first','warm'])for(let index=0;index<frames.length;index++){
      const before=original[pass][index],after=optimized[pass][index];
      assert.equal(before.frame,frames[index]);assert.equal(after.frame,frames[index]);
      assert.equal(before.reportedFrame,frames[index]);assert.equal(after.reportedFrame,frames[index]);
      assert.equal(after.pixelSha256,before.pixelSha256,`pixel mismatch at frame ${frames[index]} ${pass}`);
    }
    const record={schemaVersion:1,kind:'alg-l06-p008-optimized-canvas-pixel-timing-v1',status:'diagnostic-only',
      browser:{channel:'chrome',version,headless:true},
      inputs:[BASE,OPT].map(folder=>{const p=path.join(folder,'canvas-renderer.js'),bytes=readFileSync(path.join(ROOT,p));
        return {path:p,bytes:bytes.length,sha256:sha(bytes)};}),
      method:'Identical 800×600 Canvas, Chrome file origin, ready() awaited by preview. First two 790–856 passes time synchronous render only, with no pixel readback. Two subsequent passes hash raw RGBA bytes on 75 frames; their render durations exclude readback/hash but may include effects of earlier passes.',
      frames,original,optimized,
      pixelEqual:true,acceptanceEffects:{productChanged:false,originalRuntime:false,performanceAccepted:false}};
    const target=path.join(ROOT,OPT,'pixel-timing-v2.json');
    if(existsSync(target)){
      const prior=JSON.parse(readFileSync(target));
      assert.deepEqual(prior.frames,frames);
      for(const pass of ['first','warm'])for(let i=0;i<frames.length;i++)
        assert.equal(prior.optimized[pass][i].pixelSha256,record.optimized[pass][i].pixelSha256);
    }else writeFileSync(target,`${JSON.stringify(record,null,2)}\n`,{flag:'wx'});
    const win=rows=>rows.filter(row=>row.frame>=850&&row.frame<=853).map(row=>row.ms);
    const avg=values=>values.reduce((sum,value)=>sum+value,0)/values.length;
    console.log(JSON.stringify({pixelFrames:frames.length,pixelEqual:true,chrome:version,
      renderFirst850to853:{before:avg(win(original.renderOnly.first)),after:avg(win(optimized.renderOnly.first))},
      renderWarm850to853:{before:avg(win(original.renderOnly.warm)),after:avg(win(optimized.renderOnly.warm))},
      receipt:target}));
  }finally{await browser.close();}
});
