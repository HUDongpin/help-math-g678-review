import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const slug=process.argv[2];assert(/^[a-z0-9-]+$/.test(slug));
const out=`output/alg-l06-p004-formal-sa-return-v2/${slug}`;
fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(`${out}/result.json`));
const inputs=()=>JSON.parse(execFileSync(process.execPath,['scripts/check-alg-l06-p004-candidate-production-v8.mjs','--plan'],{encoding:'utf8',maxBuffer:8e6})).inputs;
const pin=path=>{const b=fs.readFileSync(path);return {path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const receipt={status:'running',productionVerification:'independent successor build required; exact current input plan checked',steps:[],errors:[],acceptanceEffect:'none',inputsBefore:inputs(),runner:pin('scripts/probe-alg-l06-p004-formal-sa-return-v2.mjs')};
assert.deepEqual(receipt.inputsBefore,JSON.parse(fs.readFileSync('output/alg-l06-p004-admission-v1/production-v8-plan.json')).inputs);
const browser=await chromium.launch({channel:'chrome',headless:true});let page;
const root='[data-p004-continuous-v1]';
const control=k=>page.locator(`[data-responsive-focus-key="${k}"]:visible`).first();
const state=()=>page.locator(root).evaluate(el=>({frame:Number(el.querySelector('[data-flash-frame]').getAttribute('data-flash-frame')),phase:el.getAttribute('data-p004-probe-phase'),sa:el.getAttribute('data-p004-sa-phase'),selected:el.getAttribute('data-p004-sa-selected')}));
try {
 page=await browser.newPage({viewport:{width:1280,height:900}});page.on('pageerror',e=>receipt.errors.push(String(e)));
 await page.goto('http://127.0.0.1:3331/en/migration-status/g678-calibration/shared-alg001-l06-p004/continuous-v1');
 await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
 await control('pause').click();await page.waitForFunction(()=>Number(document.querySelector('[data-p004-continuous-v1] [data-flash-frame]').getAttribute('data-flash-frame'))>=10);
 await page.locator('[data-p004-sa-start]').click();await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]').getAttribute('data-p004-sa-phase')==='playing');
 const held=await state();assert.equal(held.phase,'paused');
 await page.locator('[data-p004-sa-return]').click();await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]').getAttribute('data-p004-probe-phase')==='playing');
 await page.waitForTimeout(250);const resumed=await state();assert(resumed.frame>held.frame);assert.equal(resumed.selected,'false');receipt.steps.push({label:'SA-return-resumes-retained-main',held,resumed});
 await control('replay').click();await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor();
 let release;const delayed=new Promise(r=>{release=r;});let interceptedResolve;const intercepted=new Promise(r=>{interceptedResolve=r;});
 await page.route('**/shared-alg001-l06-p004/optional-spanish-audio-v1?*',async route=>{interceptedResolve();await delayed;await route.continue().catch(()=>{});});
 await page.locator('[data-p004-sa-start]').click();
 let interceptionTimeout;
 try{await Promise.race([intercepted,new Promise((_,reject)=>{interceptionTimeout=setTimeout(()=>reject(Error('SA request was not intercepted')),15000);})]);}
 finally{clearTimeout(interceptionTimeout);}
 assert.equal((await state()).sa,'loading');
 await control('previous').click();await page.locator('[data-p003-continuous-v2][data-source-clock-ready="true"]').waitFor({timeout:60000});release();
 await page.waitForTimeout(300);assert.equal(await page.locator(root).count(),0);assert.equal(await page.locator('[data-p003-continuous-v2]').getAttribute('data-p003-probe-phase'),'ready');
 await page.unroute('**/shared-alg001-l06-p004/optional-spanish-audio-v1?*');await control('next').click();await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
 const fresh=await state();assert.deepEqual(fresh,{frame:1,phase:'ready',sa:'idle',selected:'false'});receipt.steps.push({label:'navigation-cancels-delayed-SA-new-page-stays-idle',...fresh});
 assert.deepEqual(receipt.errors,[]);receipt.status='pass';
}catch(e){receipt.status='failed';receipt.failure=String(e.stack??e);process.exitCode=1;}
finally{await browser.close();receipt.browserClosed=true;receipt.inputsAfter=inputs();receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}fs.writeFileSync(`${out}/result.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:receipt.status,steps:receipt.steps,errors:receipt.errors,failure:receipt.failure,inputsStable:receipt.inputsStable,receipt:`${out}/result.json`}));}
