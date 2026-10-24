import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {chromium} from 'playwright';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
const hash=b=>createHash('sha256').update(b).digest('hex');
assert.equal(process.argv.length,6);assert.equal(process.argv[2],'--candidate');assert.match(process.argv[3],/^v[1-9][0-9]*$/);assert.equal(process.argv[4],'--run');assert.match(process.argv[5],/^v[1-9][0-9]*$/);
const dir=path.join(ROOT,`work/g678-shared-page-factory/nms-l02-hover-candidate-${process.argv[3]}`);
const output=path.join(BASE,`nms-l02-hover-canvas-${process.argv[5]}`);
const manifest=JSON.parse(await readFile(path.join(dir,'manifest.json'))),config=JSON.parse(await readFile(path.join(dir,'config.json')));
const bindings=[...manifest.inputs,...manifest.outputs];
for(const p of bindings){const b=await readFile(p.path);assert.equal(b.length,p.bytes);assert.equal(hash(b),p.sha256);}
const original=await readFile(manifest.originalCanvas.path,'utf8'),candidate=await readFile(path.join(dir,'canvas-renderer.js'),'utf8');
// Independent oracle changes only exported placement-call frame arguments. The candidate changes sprite entry dispatch.
const ids=config.controls.map(c=>c.sourceCharacterId);let count=0,grandchildren=0;
let oracle=original.replace(new RegExp(`(place\\("sprite(${ids.join('|')})",canvas,ctx,\\[[^\\]]+\\],ctrans,1,)\\([0-2]\\+time\\)%[23](,148,time\\);)`,'g'),(_,start,id,end)=>{count++;return `${start}(global.__ORACLE_TARGETS.includes(${id}) ? 1 : 0)${end}`;});
assert.equal(count,36);
oracle=oracle.replace(/(place\("sprite(?:40|66)",canvas,ctx,\[[^\]]+\],ctrans,1,)\([0-2]\+time\)%2(,0,time\);)/g,(_,start,end)=>{grandchildren++;return `${start}0${end}`;});assert.equal(grandchildren,6);
await mkdir(output);
const receipt={status:'running',scope:'Current-JS source-expression comparison, not original-runtime fidelity',candidate:manifest.outputs[0],
  original:manifest.originalCanvas,oracle:{method:'Exact placement-call frame argument replacement',controlledCalls:count,stoppedGrandchildCalls:grandchildren,sha256:hash(oracle)},
  records:[],rejectedInputs:[],requests:[],inputBindings:bindings,
  acceptanceEffects:{productCalibrationPassed:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,registered:false}};
let browser;
try{
 browser=await chromium.launch({headless:true});receipt.browserVersion=browser.version();
 const ctx=await browser.newContext({viewport:{width:840,height:650},serviceWorkers:'block'});
 await ctx.route('**/*',r=>{receipt.requests.push(r.request().url());return r.abort();});
 const pages=await Promise.all([ctx.newPage(),ctx.newPage()]);
 for(let i=0;i<pages.length;i++){
  await pages[i].setContent('<style>body{margin:0}</style><canvas width="800" height="600"></canvas>');
  await pages[i].addScriptTag({content:i===0?candidate:oracle});
  await pages[i].evaluate(async id=>{await window.HELP_MATH_CANVAS_ASSETS[id].ready();},config.animationId);
 }
 const cases=[...[1,5,75,148].map(frame=>({frame,ids:[]})),...[149,150,151].flatMap(frame=>[[],...ids.map(id=>[id]),[37,68]].map(ids=>({frame,ids})))];
 for(const item of cases){
  const pixels=[];
  for(let i=0;i<pages.length;i++){
   pixels.push(await pages[i].evaluate(({item,id})=>{
    window.__ORACLE_TARGETS=item.ids;
    const c=document.querySelector('canvas');
    const state=window.HELP_MATH_CANVAS_ASSETS[id].render(c,{frame:item.frame,lang:'en',scenario:'source-static-frame',seed:0,hoverCharacterIds:item.ids});
    return {url:c.toDataURL(),state};
   },{item,id:config.animationId}));
  }
  assert.equal(pixels[0].url,pixels[1].url,`Source-expression pixels differ: ${JSON.stringify(item)}`);
  assert.deepEqual(pixels[0].state.hoverCharacterIds,[...item.ids].sort((a,b)=>a-b));
  receipt.records.push({...item,pixelsEqual:true,pngSha256:hash(Buffer.from(pixels[0].url.split(',')[1],'base64'))});
  if(item.frame===151&&item.ids.length<=1){await pages[0].locator('canvas').screenshot({path:path.join(output,`frame151-${item.ids[0]??'default'}.png`)});}
 }
 for(const kind of ['unknown','duplicate','noninteger','early','null','sparse']){
  const rejection=await pages[0].evaluate(({kind,id})=>{
   let ids={unknown:[999],duplicate:[30,30],noninteger:[30.1],early:[30],null:null,sparse:Array(1)}[kind];
   try{window.HELP_MATH_CANVAS_ASSETS[id].resolveFrameState({frame:kind==='early'?148:151,hoverCharacterIds:ids});return false;}catch(e){return e.message==='invalid-source-hover-state';}
  },{kind,id:config.animationId});receipt.rejectedInputs.push({kind,rejected:rejection});assert.equal(rejection,true,`Invalid ${kind} input accepted`);
 }
 assert.deepEqual(receipt.requests,[]);
 for(const p of bindings){const b=await readFile(p.path);assert.equal(hash(b),p.sha256);}
 receipt.inputsUnchanged=true;receipt.status='passed';
} catch(e){receipt.status='failed';receipt.failure=e.stack;throw e;}
finally{if(browser)await browser.close();await writeFile(path.join(output,'receipt.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:receipt.status,cases:receipt.records.length,rejections:receipt.rejectedInputs,output}));}
