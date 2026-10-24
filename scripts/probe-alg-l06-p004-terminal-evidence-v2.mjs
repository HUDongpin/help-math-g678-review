import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';

const slug=process.argv[2],locale=process.argv[3];
assert(/^[a-z0-9-]+$/.test(slug)&&['en','es'].includes(locale));
const out=`output/playwright/alg-l06-p004-terminal-v2/${slug}`;
fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(`${out}/result.json`));
const pin=file=>{const bytes=fs.readFileSync(file);return {path:file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};};
const inputs=()=>JSON.parse(execFileSync('node',['scripts/check-alg-l06-p004-candidate-production-v6.mjs','--plan'],{encoding:'utf8',maxBuffer:8e6})).inputs;
const receipt={kind:'p004-current-input-terminal-browser-evidence-v2',locale,status:'running',startedAt:new Date().toISOString(),inputsBefore:inputs(),runner:pin('scripts/probe-alg-l06-p004-terminal-evidence-v2.mjs'),observations:[],errors:[],responsesFailed:[],acceptanceEffect:'none'};
const build=JSON.parse(fs.readFileSync('output/alg-l06-p004-production-v6/build-receipt-v6.json'));
assert.deepEqual(receipt.inputsBefore,build.inputsAfter,'current production-tested input closure');
receipt.productionBuildReceipt=pin('output/alg-l06-p004-production-v6/build-receipt-v6.json');
receipt.browserExecution='fresh local Next development host, not production browser runtime';
const browser=await chromium.launch({channel:'chrome',headless:true});let page;
const root='[data-p004-continuous-v1]';
const control=k=>page.locator(`[data-responsive-focus-key="${k}"]:visible`).first();
const state=()=>page.locator(root).evaluate(el=>({frame:Number(el.querySelector('[data-flash-frame]').getAttribute('data-flash-frame')),phase:el.getAttribute('data-p004-probe-phase'),sa:el.getAttribute('data-p004-sa-phase'),selected:el.getAttribute('data-p004-sa-selected'),complete:el.getAttribute('data-runtime-playback-complete')}));
const wait=async(sa,phase,timeout=60000)=>page.waitForFunction(({sa,phase})=>{const e=document.querySelector('[data-p004-continuous-v1]');return e?.getAttribute('data-p004-sa-phase')===sa&&e?.getAttribute('data-p004-probe-phase')===phase;},{sa,phase},{timeout});
try {
 const viewport=locale==='es'?{width:390,height:844}:{width:1280,height:900};
 page=await browser.newPage({viewport,deviceScaleFactor:locale==='es'?2:1,reducedMotion:locale==='es'?'reduce':'no-preference'});
 receipt.browserVersion=browser.version();receipt.viewport=viewport;
 page.on('pageerror',e=>receipt.errors.push(String(e)));
 page.on('response',r=>{if(r.status()>=400)receipt.responsesFailed.push({url:r.url(),status:r.status()});});
 const response=await page.goto(`http://127.0.0.1:3331/${locale}/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1`,{timeout:120000});
 assert.equal(response.status(),200);await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
 assert.deepEqual(await state(),{frame:1,phase:'ready',sa:'idle',selected:'false',complete:'false'});
 const start=Date.now();await page.locator('[data-p004-sa-start]').click();
 await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')?.getAttribute('data-p004-sa-phase')==='playing');
 const held=await state();assert.equal(held.frame,1);assert(['ready','paused'].includes(held.phase));
 await wait('idle','playing');const natural=await state();
 assert.equal(natural.selected,'false');assert(Date.now()-start>=45000,'natural separate SA completion, no synthetic ended event');
 receipt.observations.push({label:'SA-natural-end-resumes-main',elapsedMs:Date.now()-start,...natural});
 await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')?.getAttribute('data-source-timeline-ended')==='true',null,{timeout:85000});
 const terminal=await state();assert.equal(terminal.frame,831);assert.equal(terminal.complete,'false');
 const nativeTerminal=await page.locator('[data-p004-native-text]').evaluate(el=>({
  frame:Number(el.getAttribute('data-p004-text-frame')),
  blocks:[...el.querySelectorAll('[data-p004-text-block]')].map(n=>n.getAttribute('data-p004-text-block')),
  text:el.textContent}));
 assert.equal(nativeTerminal.frame,831);
 assert(!nativeTerminal.blocks.some(id=>id.startsWith('equation-worked-')),'worked calculation retired at terminal');
 assert.equal(new Set(nativeTerminal.blocks).size,nativeTerminal.blocks.length);
 receipt.nativeTerminal=nativeTerminal;
 receipt.observations.push({label:'natural-main-terminal',...terminal});
 await page.locator('[data-p004-sa-start]').click();await wait('playing','timeline-ended');
 await page.locator('[data-p004-sa-return]').click();await wait('idle','timeline-ended');
 await page.waitForTimeout(350);assert.deepEqual(await state(),terminal);
 receipt.observations.push({label:'explicit-SA-return-preserves-terminal',...await state()});
 // The second SA run exercises natural completion while the main clock is terminal.
 const terminalStart=Date.now();await page.locator('[data-p004-sa-start]').click();await wait('playing','timeline-ended');
 await wait('idle','timeline-ended');assert(Date.now()-terminalStart>=45000);
 assert.deepEqual(await state(),terminal);receipt.observations.push({label:'natural-SA-end-preserves-terminal',elapsedMs:Date.now()-terminalStart,...await state()});
 const trigger=page.locator('[data-p004-companion-occurrence="57@106"]');await trigger.click();
 await page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor();
 await page.getByRole('button',{name:locale==='es'?'Cerrar glosario':'Close glossary',exact:true}).click();
 await page.waitForTimeout(250);assert(await trigger.evaluate(el=>el===document.activeElement));
 const geometry=await trigger.evaluate(el=>{const r=el.getBoundingClientRect(),nav=document.querySelector('.lesson-shell2__learning-nav')?.getBoundingClientRect();return {target:{x:r.x,y:r.y,width:r.width,height:r.height},nav:nav?{x:nav.x,y:nav.y,width:nav.width,height:nav.height}:null,viewport:{width:innerWidth,height:innerHeight},dpr:devicePixelRatio,overflow:document.documentElement.scrollWidth>innerWidth};});
 assert(!geometry.overflow);receipt.observations.push({label:'trusted-close-focus-return',geometry,...await state()});
 await page.screenshot({path:`${out}/focus-viewport.png`});receipt.screenshot=pin(`${out}/focus-viewport.png`);
 await control('replay').click();await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor();await page.waitForTimeout(250);
 assert.deepEqual(await state(),{frame:1,phase:'ready',sa:'idle',selected:'false',complete:'false'});
 assert.equal(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-frame'),'1');
 receipt.observations.push({label:'Replay-after-terminal-SA-clears-state',...await state()});
 assert.deepEqual(receipt.errors,[]);assert.deepEqual(receipt.responsesFailed,[]);receipt.status='pass';
}catch(e){receipt.status='failed';receipt.failure=String(e.stack??e);receipt.failureState=page?await state().catch(()=>null):null;process.exitCode=1;}
finally {
 await browser.close();receipt.browserClosed=true;receipt.inputsAfter=inputs();receipt.inputsStable=JSON.stringify(receipt.inputsAfter)===JSON.stringify(receipt.inputsBefore);
 if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}
 receipt.finishedAt=new Date().toISOString();fs.writeFileSync(`${out}/result.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:receipt.status,observations:receipt.observations,errors:receipt.errors,failure:receipt.failure,inputsStable:receipt.inputsStable,receipt:`${out}/result.json`}));
}
