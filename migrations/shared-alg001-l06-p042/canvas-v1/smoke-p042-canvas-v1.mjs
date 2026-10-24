#!/usr/bin/env node
/** Browser smoke of the canonical, unregistered P042 Canvas asset. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const SCRIPT=path.join(HERE,'canvas-renderer.js');
const OUT=path.join(HERE,'smoke-v1');
const SCRATCH='/Volumes/American Dream/hudongpin/g678-p042-task-tmp-20261002';
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const EXPECTED='8eebb94446a095f5219bc5b3b46f740179d92e8ee6260a6a5cfa2d9d34fae8f4';
const sha=b=>createHash('sha256').update(b).digest('hex');
const json=x=>Buffer.from(JSON.stringify(x,null,2)+'\n');
const cases=[
 {id:'main-278',frame:278,expectedPixel:'2f8e78ce'},
 {id:'main-279-hidden',frame:279,expectedPixel:'030a917a'},
 {id:'nmh-open',frame:279,nmhOpen:true,expectedPixel:'ed077088'},
 {id:'wrong4-022',frame:279,feedback:{spriteId:292,localFrame:22},expectedPixel:'c8d28d40'},
 {id:'right4-012',frame:279,feedback:{spriteId:239,localFrame:12},expectedPixel:'2a0659d0'}
];
const mode=process.argv[2];assert(['--write','--check'].includes(mode),'--write | --check');
assert.equal(sha(fs.readFileSync(SCRIPT)),EXPECTED);assert(fs.existsSync(CHROME)&&fs.existsSync(SCRATCH));
if(mode==='--write')fs.mkdirSync(OUT,{recursive:true});else assert(fs.existsSync(OUT));
const browser=await chromium.launch({headless:true,executablePath:CHROME,
 args:['--disable-background-networking','--disable-extensions','--no-first-run'],
 env:{...process.env,TMPDIR:SCRATCH,TMP:SCRATCH,TEMP:SCRATCH}});
const context=await browser.newContext({viewport:{width:800,height:600},deviceScaleFactor:1,
 locale:'en-US',reducedMotion:'reduce',serviceWorkers:'block'});
const page=await context.newPage(),errors=[],requests=[];
page.on('pageerror',e=>errors.push(String(e)));
page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`);});
page.on('request',r=>requests.push(r.url()));
try{
 await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body style="margin:0"><canvas id="stage" width="800" height="600"></canvas></body></html>');
 await page.addScriptTag({path:SCRIPT});
 await page.evaluate(()=>globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p042'].ready());
 const results=[];
 for(const item of cases){
  const pixels=await page.evaluate(request=>{
   const c=document.getElementById('stage'),asset=globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p042'];
   const state=asset.render(c,request),data=c.getContext('2d').getImageData(0,0,800,600).data;
   let nonBackground=0,hash=2166136261;
   for(let i=0;i<data.length;i+=4){
    const r=data[i],g=data[i+1],b=data[i+2],a=data[i+3];
    hash=Math.imul(hash^r,16777619);hash=Math.imul(hash^g,16777619);
    hash=Math.imul(hash^b,16777619);hash=Math.imul(hash^a,16777619);
    if(r!==184||g!==216||b!==247||a!==255)nonBackground++;
   }
   return {frame:state.localFrame,nmhOpen:state.nmhOpen,visibility:state.visibility,
    canvas:{width:c.width,height:c.height},nonBackgroundPixels:nonBackground,
    pixelFnv1a32:(hash>>>0).toString(16).padStart(8,'0'),
    dataFrame:c.getAttribute('data-flash-frame'),dataNmhOpen:c.getAttribute('data-p042-nmh-open')};
  },item);
  assert.equal(pixels.frame,item.frame);assert.equal(pixels.canvas.width,800);assert.equal(pixels.canvas.height,600);
  assert(pixels.nonBackgroundPixels>0);assert.equal(pixels.pixelFnv1a32,item.expectedPixel,`${item.id} reviewed pixels`);
  const png=path.join(OUT,`${item.id}.png`);
  if(mode==='--write')await page.locator('canvas').screenshot({path:png});
  else{
   const current=await page.locator('canvas').screenshot();
   assert.equal(sha(current),sha(fs.readFileSync(png)),`${item.id} PNG drift`);
  }
  const b=fs.readFileSync(png);results.push({id:item.id,request:{frame:item.frame,
   ...(item.nmhOpen?{nmhOpen:true}:{}),...(item.feedback?{feedback:item.feedback}:{})},
   pixels,png:{path:`smoke-v1/${item.id}.png`,bytes:b.length,sha256:sha(b)}});
 }
 const before=await page.evaluate(()=>{const c=document.getElementById('stage');return {frame:c.getAttribute('data-flash-frame'),png:c.toDataURL('image/png')};});
 await page.waitForTimeout(600);
 const after=await page.evaluate(()=>{const c=document.getElementById('stage');return {frame:c.getAttribute('data-flash-frame'),png:c.toDataURL('image/png')};});
 assert.deepEqual(after,before,'runaway autoplay');assert.deepEqual(errors,[],'browser errors');assert.deepEqual(requests,[],'unexpected request');
 const receipt={schemaVersion:1,kind:'p042-canonical-canvas-v1-chrome-smoke',animationId:'shared-alg001-l06-p042',
  candidate:{path:'migrations/shared-alg001-l06-p042/canvas-v1/canvas-renderer.js',
   bytes:fs.statSync(SCRIPT).size,sha256:EXPECTED},
  reviewedV2:{path:'output/g678-p042-canvas-visibility-v2-20261002/v2-draw-smoke.json',
   sha256:'dfd432c8eb229a326faa225c41cda4911312554e0d175af9e630b0af52d71f45'},
  environment:{browser:`Google Chrome ${browser.version()} headless via Playwright`,viewport:{width:800,height:600},
   deviceScaleFactor:1,scratch:SCRATCH},cases:results,errors,requests,
  runawayCheck:{delayMs:600,frameUnchanged:true,pixelsUnchanged:true},
  limitations:['Dynamic txtFeed not rendered; original-runtime pixels not compared.',
   'Mask/JPEG/morph appearance, AVM1, audio, host and My Lesson remain unverified.'],
  acceptanceEffects:{currentJsRegistered:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false}};
 const b=json(receipt),file=path.join(OUT,'canonical-chrome-smoke-v1.json');
 if(mode==='--write'&&!fs.existsSync(file))fs.writeFileSync(file,b,{flag:'wx'});
 assert.deepEqual(fs.readFileSync(file),b,'smoke receipt drift');
 console.log(JSON.stringify({mode,pass:true,cases:results.length,assetSha256:EXPECTED,receiptSha256:sha(b)}));
}finally{await browser.close();}
