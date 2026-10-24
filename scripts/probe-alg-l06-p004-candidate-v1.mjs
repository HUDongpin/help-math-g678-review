import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
const spanish=process.argv[3]==='es';
const slug=process.argv[2];assert(/^[a-z0-9-]+$/.test(slug));
const out=path.resolve('output/alg-l06-p004-host-probes-v1',slug);fs.mkdirSync(out,{recursive:true});
assert(!fs.existsSync(path.join(out,'result.json')));
const receipt={status:'running',steps:[],errors:[],failedRequests:[],acceptanceEffect:'none'};
const browser=await chromium.launch({channel:'chrome',headless:true});
const control=(p,key)=>p.locator(`[data-responsive-focus-key="${key}"]:visible`).first();
const runtime='[data-p004-continuous-v1="true"]';
let page;
try{
 page=await browser.newPage({viewport:{width:spanish?390:1280,height:spanish?844:900},reducedMotion:spanish?'reduce':'no-preference'});
 page.on('pageerror',e=>receipt.errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400)receipt.failedRequests.push({status:r.status(),url:r.url()});});
 const response=await page.goto(`http://127.0.0.1:3331/${spanish?'es':'en'}/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1`,{timeout:120000});
 assert.equal(response.status(),200);
 await page.locator(`${runtime}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
 const state=()=>page.locator(runtime).evaluate(el=>({phase:el.getAttribute('data-p004-probe-phase'),frame:Number(el.querySelector('[data-flash-frame]').getAttribute('data-flash-frame')),sa:el.getAttribute('data-p004-sa-phase'),selected:el.getAttribute('data-p004-sa-selected'),glossary:el.getAttribute('data-p004-glossary-open')}));
 const initial=await state();assert.equal(initial.frame,1);assert.equal(initial.phase,'ready');assert.equal(initial.sa,'idle');receipt.steps.push({label:'no-autoplay',...initial});
 await control(page,'pause').click();
 await page.waitForFunction(()=>Number(document.querySelector('[data-p004-continuous-v1] [data-flash-frame]')?.getAttribute('data-flash-frame'))>=130,null,{timeout:25000});
 const trigger=page.locator('[data-p004-companion-occurrence="57@106"]');await trigger.click();
 await page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor();
 const held=await state();assert.equal(held.phase,'paused');assert.equal(held.glossary,'true');
 await page.waitForTimeout(350);assert.equal((await state()).frame,held.frame);
 await page.getByRole('button',{name:spanish?'Cerrar glosario':'Close glossary',exact:true}).click();
 await page.waitForTimeout(300);assert.equal((await state()).frame,held.frame);assert.equal((await state()).phase,'paused');assert(await trigger.evaluate(el=>el===document.activeElement));receipt.steps.push({label:'glossary-close-held-focus-restored',...await state()});
 await page.locator('[data-p004-sa-start]').click();
 await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')?.getAttribute('data-p004-sa-phase')==='playing',null,{timeout:30000});
 assert.equal((await state()).frame,held.frame);await trigger.click();await page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor();
 assert.equal((await state()).sa,'paused');await page.getByRole('button',{name:spanish?'Cerrar glosario':'Close glossary',exact:true}).click();
 await page.waitForTimeout(250);assert.equal((await state()).sa,'paused');receipt.steps.push({label:'glossary-pauses-separate-sa',...await state()});
 await control(page,'replay').click();await page.locator(`${runtime}[data-source-clock-ready="true"]`).waitFor();
 await page.waitForTimeout(250);assert.equal((await state()).frame,1);assert.equal((await state()).selected,'false');receipt.steps.push({label:'replay-clears-all',...await state()});
 await control(page,'previous').click();
 await page.locator('[data-p003-continuous-v2="true"][data-source-clock-ready="true"]').waitFor({timeout:60000});
 await control(page,'pause').click();await page.waitForTimeout(300);
 assert.equal(await page.locator('[data-p003-continuous-v2]').getAttribute('data-p003-probe-phase'),'playing');
 await control(page,'next').click();await page.locator(`${runtime}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
 assert.equal((await state()).frame,1);receipt.steps.push({label:'P003-previous-play-next',...await state()});
 if(spanish){
  await control(page,'pause').click();
  await page.waitForFunction(()=>Number(document.querySelector('[data-p004-continuous-v1] [data-flash-frame]')?.getAttribute('data-flash-frame'))>=616,null,{timeout:70000});
  await control(page,'pause').click();
  const all=page.locator('[data-p004-companion-occurrence]');assert.equal(await all.count(),9);
  for(let i=0;i<9;i++){
   const button=all.nth(i);const occurrence=await button.getAttribute('data-p004-companion-occurrence');
   await button.click();await page.locator('[role="dialog"][data-glossary-entry-id]').waitFor();
   const selected=await state();assert.equal(selected.phase,'paused');
   await page.getByRole('button',{name:'Cerrar glosario',exact:true}).click();
   await page.waitForTimeout(80);assert.equal((await state()).frame,selected.frame);
   receipt.steps.push({label:`es-occurrence-${occurrence}`,...await state()});
  }
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await control(page,'pause').click();
  await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')?.getAttribute('data-source-timeline-ended')==='true',null,{timeout:25000});
  assert.equal((await state()).frame,831);
  assert.equal(await page.locator(runtime).getAttribute('data-runtime-playback-complete'),'false');
  receipt.steps.push({label:'natural-terminal-no-lesson-completion',...await state()});
 }
 await page.screenshot({path:path.join(out,'final.png'),fullPage:true});
 assert.deepEqual(receipt.errors,[]);assert.deepEqual(receipt.failedRequests,[]);receipt.status='pass';
}catch(e){receipt.status='failed';receipt.failure=String(e.stack??e);if(page)await page.screenshot({path:path.join(out,'failed.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}
finally{await browser.close();receipt.browserClosed=true;fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify(receipt));}
