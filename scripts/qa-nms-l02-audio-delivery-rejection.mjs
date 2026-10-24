import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {chromium} from 'playwright';
const BASE='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f',ROOT=process.cwd(),OUT=BASE+'/nms-l02-delivery-rejection-v1';
const pin=(path,bytes)=>({path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
const files=[BASE+'/nms-l02-hover-audio-runtime-v2/fixture.js',ROOT+'/work/g678-shared-page-factory/nms-l02-hover-candidate-v2/config.json',ROOT+'/work/g678-shared-page-factory/nms-l02-hover-candidate-v2/canvas-renderer.js',BASE+'/frozen16-audio-v1/shared-nms002-l02-p020/sprite-69-0.mp3'];
const bytes=await Promise.all(files.map(p=>readFile(p))),config=JSON.parse(bytes[1]);const pins=files.map((p,i)=>pin(p,bytes[i]));
await mkdir(OUT);const report={status:'running',inputBindings:pins,records:[],scope:'Candidate runtime delivery rejection before native decode/playback; not server route policy verification',registered:false,productCalibrationPassed:false};
const browser=await chromium.launch({headless:true});
try{
 for(const mode of ['wrong-length','corrupt-body','redirect']){
  const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();const unexpected=[];
  await page.addInitScript(()=>{const Native=window.AudioContext;window.createdContexts=0;window.AudioContext=new Proxy(Native,{construct(T,args){window.createdContexts++;return new T(...args);}});});
  await context.route('**/*',r=>{const u=new URL(r.request().url());
   if(u.origin==='http://127.0.0.1:3338'&&u.pathname==='/')return r.fulfill({contentType:'text/html',body:'<!doctype html><div id="root"></div><script src="/fixture.js"></script>'});
   if(u.origin==='http://127.0.0.1:3338'&&u.pathname==='/fixture.js')return r.fulfill({contentType:'text/javascript',body:bytes[0]});
   if(u.origin==='http://127.0.0.1:3338'&&u.pathname===config.assetSource&&u.searchParams.get('sha256')===config.assetSha256)return r.fulfill({contentType:'text/javascript',body:bytes[2]});
   if(u.origin==='http://127.0.0.1:3338'&&u.pathname.endsWith('/source-stream.mp3')){
    if(mode==='redirect')return r.fulfill({status:302,headers:{location:'/must-not-follow'},body:''});
    const body=Buffer.from(bytes[3]);if(mode==='corrupt-body')body[10]^=1;
    return r.fulfill({contentType:'audio/mpeg',headers:{'content-length':String(mode==='wrong-length'?body.length-1:body.length)},body});
   }unexpected.push(u.href);return r.abort();});
  await page.goto('http://127.0.0.1:3338/',{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>document.querySelector('[data-source-clock-runtime]')?.dataset.sourceClockPhase==='failed');
  const result=await page.locator('[data-source-clock-runtime]').evaluate(n=>({...n.dataset,createdContexts:window.createdContexts}));assert.equal(result.sourceClockReady,'false');assert.equal(result.createdContexts,0);assert.deepEqual(unexpected,[]);
  report.records.push({mode,rejected:true,...result,unexpectedRequests:unexpected});await context.close();
 }
 for(const p of pins)assert.deepEqual(pin(p.path,await readFile(p.path)),p);report.inputsUnchanged=true;report.status='passed';
}finally{await browser.close();await writeFile(OUT+'/receipt.json',JSON.stringify(report,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:report.status,cases:report.records.length,output:OUT}));}
