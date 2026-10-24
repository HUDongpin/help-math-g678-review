import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {Script,createContext} from 'node:vm';
import {chromium} from 'playwright';
import {buildCandidate} from './build-alg-l06-p004-canvas-v1.mjs';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const built=buildCandidate(SOURCE),spec=JSON.parse(built.spec),manifest=JSON.parse(built.manifest);
const runtime=built.runtime.toString();
test('source placement, complete asset closure and all three mask geometries remain bound',()=>{
 assert.equal(spec.animationId,'shared-alg001-l06-p004');
 assert.deepEqual(spec.timeline.root.placementTwips,{x:7390,y:5060});
 assert.deepEqual(spec.ffdecExport.exportInternalTranslation,{x:422.2,y:545.8});
 assert.equal(spec.timeline.local.frameCount,831);assert.equal(spec.timeline.local.timelineId,'sprite-95');
 assert.deepEqual([spec.ffdecExport.expectedPlacedFunctionCount,spec.ffdecExport.expectedFontFunctionCount,spec.ffdecExport.embeddedImageVariableCount],[81,5,7]);
 for(const id of [1,22,76]){
  const start=runtime.indexOf(`function shape${id}(`),end=runtime.indexOf('\n}',start);
  assert(start>=0);assert(runtime.slice(start,end).includes('ctx.fillStyle="rgba(0,0,0,1)";'));
 }
 assert(Object.values(manifest.acceptance).every(v=>v===false));
 assert(!runtime.includes('setInterval('));assert(!runtime.includes('eval('));
 for(const [name,bytes] of [['adapter-spec.json',built.spec],['canvas-renderer.js',built.runtime],['preview.html',built.preview]]){
  const pin=manifest.outputs.find(x=>x.name===name);assert.equal(pin.bytes,bytes.length);assert.equal(pin.sha256,createHash('sha256').update(bytes).digest('hex'));
 }
});
test('frame state covers 1..831 and rejects unsupported frame, language and scenario',()=>{
 const context=createContext({document:{createElement(kind){assert.equal(kind,'img');return {};}}});
 new Script(runtime).runInContext(context);
 const asset=context.HELP_MATH_CANVAS_ASSETS[spec.animationId];
 for(let frame=1;frame<=831;frame++){
  const state=asset.resolveFrameState({frame,scenario:'source-static-frame',lang:'en',seed:0});
  assert.equal(state.localFrame,frame);assert.equal(state.exportFrame,frame-1);assert.equal(state.rootFrame,6);
  assert.equal(state.audioRendered,false);assert.equal(state.interactiveStateResolved,false);
 }
 for(const frame of [0,832,1.5])assert.throws(()=>asset.resolveFrameState({frame,lang:'en'}));
 assert.throws(()=>asset.resolveFrameState({frame:1,lang:'es'}));
 assert.throws(()=>asset.resolveFrameState({frame:1,scenario:'execute-as',lang:'en'}));
 assert.throws(()=>buildCandidate(undefined));
});
test('actual browser draws all 831 source frames with embedded images and masks, no external requests',async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
  const page=await browser.newPage(),errors=[],requests=[];
  page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>requests.push(r.url()));
  await page.setContent('<canvas id="stage" width="800" height="600"></canvas>');
  await page.addScriptTag({content:runtime});
  const result=await page.evaluate(async()=>{
   const asset=globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004'];await asset.ready();
   const canvas=document.getElementById('stage');let state;
   for(let frame=1;frame<=831;frame++)state=asset.render(canvas,{frame,scenario:'source-static-frame',lang:'en',seed:0});
   const pixels=canvas.getContext('2d').getImageData(0,0,800,600).data;
   return {frame:state.localFrame,domain:canvas.dataset.flashFrameDomain,nonBackground:pixels.some((value,index)=>index%4===0&&value!==184)};
  });
  assert.deepEqual(result,{frame:831,domain:'sprite-95',nonBackground:true});assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith('data:')));
 }finally{await browser.close();}
});
