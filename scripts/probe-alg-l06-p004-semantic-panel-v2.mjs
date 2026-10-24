import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const slug=process.argv[2];assert(/^[a-z0-9-]+$/.test(slug));
const out=`output/playwright/alg-l06-p004-semantic-panel-v2/${slug}`;
fs.mkdirSync(out,{recursive:true});assert(!fs.existsSync(`${out}/result.json`));
const pin=path=>{const b=fs.readFileSync(path);return {path,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const added=['packages/demos/src/alg-l06-p004-text-snapshot-v1.ts','packages/demos/src/alg-l06-p004-native-text-v1.tsx','scripts/probe-alg-l06-p004-semantic-panel-v2.mjs','packages/demos/src/alg-l06-p004-semantic-text-v1.ts','packages/demos/src/alg-l06-p004-text-occurrences-v2.ts','packages/demos/src/alg-l06-p004-text-occurrences-v2.generated.ts','migrations/shared-alg001-l06-p004/audit/equation-geometry-v1.json'];
const inputs=()=>{const rows=[...JSON.parse(execFileSync('node',['scripts/check-alg-l06-p004-candidate-production-v4.mjs','--plan'],{encoding:'utf8',maxBuffer:8e6})).inputs,...added.map(pin)];const unique=new Map();for(const row of rows){if(unique.has(row.path))assert.deepEqual(unique.get(row.path),row);unique.set(row.path,row);}return [...unique.values()].sort((a,b)=>a.path.localeCompare(b.path));};
const receipt={status:'running',inputsBefore:inputs(),results:[],errors:[],productionApplicability:'v4 production receipt is independently verified; browser evidence covers this declared current input set',acceptanceEffect:'none'};
fs.copyFileSync('scripts/probe-alg-l06-p004-semantic-panel-v2.mjs',`${out}/runner.mjs`);
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 for(const locale of (process.argv[3]==='es'?['es']:['en','es'])){
  const page=await browser.newPage({viewport:locale==='es'?{width:390,height:844}:{width:1280,height:900},reducedMotion:locale==='es'?'reduce':'no-preference'});
  page.on('pageerror',e=>receipt.errors.push(String(e)));
  const response=await page.goto(`http://127.0.0.1:3331/${locale}/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1`,{timeout:120000});assert.equal(response.status(),200);
  const root='[data-p004-continuous-v1]';await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
  const zeros=()=>page.locator('[data-p004-text-block]').evaluateAll(els=>els.filter(el=>el.textContent.trim()==='0').map(el=>el.getAttribute('data-source-instance-ids')));
  const initial=await zeros();assert.equal(initial.length,2);assert.notEqual(initial[0],initial[1]);assert.equal(await page.getByRole('math').count(),0);
  const control=k=>page.locator(`[data-responsive-focus-key="${k}"]:visible`).first();
  await control('pause').click();await page.waitForFunction(()=>Number(document.querySelector('[data-p004-continuous-v1] [data-flash-frame]')?.getAttribute('data-flash-frame'))>=130,null,{timeout:25000});
  const trigger=page.locator('[data-p004-companion-occurrence="57@106"]');await trigger.click();await page.locator('[role="dialog"][data-glossary-entry-id="input"]').waitFor();
  await page.getByRole('button',{name:locale==='es'?'Cerrar glosario':'Close glossary',exact:true}).click();await page.waitForTimeout(250);
  const math=page.getByRole('math');assert.equal(await math.textContent(),'M = $0.50 × C');assert.equal(await math.getAttribute('aria-label'),'M equals 0.50 dollars multiplied by C');
  assert(await trigger.evaluate(el=>el===document.activeElement));
  const frame=Number(await page.locator('[data-p004-continuous-v1] .runtime-stage[data-flash-frame]').getAttribute('data-flash-frame'));
  assert.equal(await page.locator(root).getAttribute('data-p004-probe-phase'),'paused');
  await math.scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${locale}-math.png`});
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const reflow=[];
  for(const width of [320,390,768,1280,1920]){
   await page.setViewportSize({width,height:900});
   for(const fontPercent of [100,200]){
    await page.evaluate(percent=>document.documentElement.style.fontSize=`${percent}%`,fontPercent);
    await page.evaluate(async()=>{await document.fonts.ready;await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));});
    // Allow the responsive host's own resize/scroll restoration to settle.
    await page.waitForTimeout(600);
    await math.evaluate(el=>el.scrollIntoView({block:'center',behavior:'instant'}));
    await page.waitForTimeout(200);
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const measurement=await math.evaluate(el=>{
     const r=el.getBoundingClientRect(),nav=document.querySelector('.lesson-shell2__learning-nav')?.getBoundingClientRect();
     return {x:r.x,y:r.y,width:r.width,height:r.height,navBottom:nav?.bottom??0,
      viewportHeight:innerHeight,documentWidth:document.documentElement.scrollWidth,overflowElements:[...document.querySelectorAll('body *')].map(node=>({node:node.tagName,class:node.className,text:node.textContent?.slice(0,200),parentClass:node.parentElement?.className,rect:node.getBoundingClientRect().toJSON()})).filter(row=>row.rect.width>0&&row.rect.right>innerWidth+1).slice(0,20),overflow:document.documentElement.scrollWidth>innerWidth,
      fontSize:getComputedStyle(el.firstElementChild).fontSize};
    });
    console.log(JSON.stringify({locale,viewportWidth:width,fontPercent,frame,documentWidth:measurement.documentWidth,overflow:measurement.overflow}));
    fs.writeFileSync(`${out}/${locale}-${width}-${fontPercent}-measurement.json`,JSON.stringify({viewportWidth:width,rootFontPercent:fontPercent,frame,...measurement},null,2));
    await page.screenshot({path:`${out}/${locale}-${width}-${fontPercent}.png`});
    assert.equal(measurement.overflow,false);
    assert(measurement.y>=measurement.navBottom&&measurement.y+measurement.height<=measurement.viewportHeight);
    assert.equal(Number(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-frame')),frame);
    reflow.push({viewportWidth:width,rootFontPercent:fontPercent,method:'root font enlargement, not browser zoom',...measurement});
   }
  }
  await page.evaluate(()=>document.documentElement.style.removeProperty('font-size'));
  await page.setViewportSize(locale==='es'?{width:390,height:844}:{width:1280,height:900});
  const firstSentence=page.locator('[data-p004-text-block="sprite-95/depth-84/generation-3"]');
  const secondSentence=page.locator('[data-p004-text-block="sprite-95/depth-94/generation-1"]');
  await control('pause').click();
  const reach=async target=>page.waitForFunction(target=>Number(document.querySelector('[data-p004-native-text]')?.getAttribute('data-p004-text-frame'))>=target,target,{timeout:60000});
  await reach(550);assert.equal(await firstSentence.count(),0);assert.equal(await secondSentence.count(),0);
  await reach(630);assert.equal(await firstSentence.count(),1);assert.equal(await secondSentence.count(),0);
  await reach(700);assert.equal(await firstSentence.count(),1);assert.equal(await secondSentence.count(),1);
  await control('pause').click();
  await control('replay').click();await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor();await page.waitForTimeout(200);
  assert.equal(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-replay'),'1');
  assert.equal(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-frame'),'1');
  assert.deepEqual(await zeros(),initial);assert.equal(await page.getByRole('math').count(),0);
  await control('previous').click();
  await page.locator('[data-p003-continuous-v2][data-source-clock-ready="true"]').waitFor({timeout:60000});
  await control('pause').click();
  await page.waitForFunction(()=>Number(document.querySelector('[data-p003-continuous-v2] .runtime-stage')?.getAttribute('data-flash-frame'))>=3);
  await control('next').click();
  await page.locator(`${root}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
  assert.equal(await page.locator('[data-p004-native-text]').getAttribute('data-p004-text-frame'),'1');
  assert.equal(await page.locator(root).getAttribute('data-p004-sa-selected'),'false');
  assert.deepEqual(await zeros(),initial);
  receipt.results.push({locale,predecessorPlaybackAndReturn:true,sourceMaskSentenceSequence:true,reflow,initialZeros:initial,heldFrame:frame,formula:'M = $0.50 × C',glossaryFocusReturned:true,ReplayRestoresSeparateSymbols:true,screenshot:pin(`${out}/${locale}-math.png`)});
  await page.close();
 }
 assert.deepEqual(receipt.errors,[]);receipt.status='pass';
}catch(e){receipt.status='failed';receipt.failure=String(e.stack??e);process.exitCode=1;}
finally{await browser.close();receipt.browserClosed=true;receipt.inputsAfter=inputs();receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===JSON.stringify(receipt.inputsAfter);if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}
 fs.writeFileSync(`${out}/result.json`,JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({status:receipt.status,results:receipt.results,failure:receipt.failure,inputsStable:receipt.inputsStable}));}

