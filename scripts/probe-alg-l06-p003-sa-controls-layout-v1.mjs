import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='http://127.0.0.1:3331';
const ROUTE='/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2';
const slug=process.argv[2];assert(/^[a-z0-9-]+$/u.test(slug??''));
const out=path.join(ROOT,'output/alg-l06-p003-audio-alignment-20260928/sa-controls-layout-v1',slug);
await mkdir(path.dirname(out),{recursive:true});await mkdir(out);
const files=['scripts/probe-alg-l06-p003-sa-controls-layout-v1.mjs','apps/web/components/g678-alg-l06-p003-continuous-runtime-v2.tsx','apps/web/components/g678-alg-l06-p003-host-runtime.module.css'];
async function pins(){return Promise.all(files.map(async p=>({path:p,sha256:createHash('sha256').update(await readFile(path.join(ROOT,p))).digest('hex')})));}
const result={startedAt:new Date().toISOString(),inputsBefore:await pins(),cases:[],errors:[],acceptanceEffect:'none'};
let browser;
try{
 browser=await chromium.launch({channel:'chrome',headless:true,args:['--mute-audio','--autoplay-policy=document-user-activation-required']});result.browserVersion=browser.version();
 for(const [locale,width] of [['en',1440],['es',390],['es',320]]){
  const c={locale,width,errors:[],geometry:[]};const context=await browser.newContext({viewport:{width,height:1000},serviceWorkers:'block'});const page=await context.newPage();page.setDefaultTimeout(30000);
  await context.route('**/*',r=>new URL(r.request().url()).origin===BASE?r.continue():r.abort());
  page.on('pageerror',e=>c.errors.push(String(e)));page.on('console',m=>{if(m.type()==='error')c.errors.push(m.text());});
  try{
   await page.goto(`${BASE}/${locale}${ROUTE}`);await page.locator('[data-source-clock-ready="true"]').waitFor();
   const start=page.locator('[data-p003-sa-start]');await start.focus();await page.keyboard.press('Enter');
   await page.locator('[data-p003-sa-phase="playing"]').waitFor();
   await page.keyboard.press('Tab');
   const back=page.locator('[data-p003-sa-return]');assert.equal(await back.evaluate(e=>e===document.activeElement),true);
   for(const locator of [start,back])c.geometry.push(await locator.evaluate(e=>{const r=e.getBoundingClientRect(),s=getComputedStyle(e);return {left:r.left,right:r.right,height:r.height,width:r.width,border:s.borderTopWidth,outline:s.outlineWidth,focused:e===document.activeElement};}));
   assert(c.geometry.every(g=>g.left>=0&&g.right<=width+1&&g.height>=44&&g.border==='2px'));
   assert(c.geometry[1].outline==='3px');
   await back.locator('..').screenshot({path:path.join(out,`${locale}-${width}-sa-controls.png`)});
   await page.screenshot({path:path.join(out,`${locale}-${width}-page.png`),fullPage:true});
   await page.keyboard.press('Enter');await page.locator('[data-p003-sa-selected="false"][data-p003-probe-phase="playing"]').waitFor();
   assert.deepEqual(c.errors,[]);c.status='passed';
  }catch(error){c.status='failed';c.failure=String(error?.stack??error);}
  finally{await context.close();c.contextClosed=true;result.cases.push(c);}
 }
}catch(error){result.errors.push(String(error?.stack??error));}
finally{if(browser){await browser.close();result.browserDisconnected=!browser.isConnected();}result.inputsAfter=await pins();result.inputsStable=JSON.stringify(result.inputsBefore)===JSON.stringify(result.inputsAfter);result.status=result.inputsStable&&result.errors.length===0&&result.cases.length===3&&result.cases.every(c=>c.status==='passed')?'technical-layout-pass-not-human-review':'failed';result.finishedAt=new Date().toISOString();await writeFile(path.join(out,'result.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(result));if(result.status==='failed')process.exitCode=1;}
