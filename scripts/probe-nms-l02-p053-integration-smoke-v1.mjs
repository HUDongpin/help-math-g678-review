import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';
const out='output/nms-l02-p053-product-20260928/browser';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const result={startedAt:new Date().toISOString(),scope:'candidate integration smoke only',cases:[],failure:null};
try{
 for(const locale of ['en','es']){
  const page=await browser.newPage({viewport:locale==='en'?{width:1280,height:900}:{width:390,height:844}});
  const errors=[],resources=[];page.on('pageerror',e=>errors.push(e.stack??e.message));
  page.on('response',r=>{if(r.url().includes('/flash-assets/g678-local/shared-nms002-l02-p05'))resources.push({url:r.url(),status:r.status()});});
  await page.goto(`http://127.0.0.1:3331/${locale}/migration-status/g678-calibration/shared-nms002-l02-p053`,{timeout:120000});
  const stage=page.locator('.p053-host');await stage.waitFor({timeout:120000});
  assert.equal(await stage.getAttribute('data-p053-frame'),'1');
  assert.equal(await stage.getAttribute('data-p053-audio'),'idle');assert.equal(resources.length,0);
  await stage.getByRole('button',{name:locale==='en'?'Listen to English directions':'Escuchar instrucciones en inglés'}).click();
  await page.locator('.p053-host[data-p053-audio="playing"]').waitFor({timeout:30000});
  assert.equal(await stage.getAttribute('data-p053-playing'),'false');
  await stage.getByRole('button',{name:locale==='en'?'Stop audio':'Detener audio',exact:true}).click();
  await stage.locator('[data-p053-control="mcL2"]').click();
  await stage.locator('[data-p053-control="mcStart"]').click();
  await page.locator('.p053-host[data-p053-level="none"][data-p053-frame="1"]').waitFor();
  await page.getByRole('button',{name:locale==='en'?'Play animation':'Reproducir animación',exact:true}).click();
  await stage.locator('[data-p053-control="mcSkip"]').waitFor();
  await stage.locator('[data-p053-control="mcSkip"]').click();
  await page.locator('.p053-host[data-p053-frame="693"]').waitFor();
  await stage.locator('[data-p053-control="mcL2"]').click();
  await stage.locator('[data-p053-control="mcStart"]').click();
  const board=page.locator('.p054-board[data-p054-level="2"]');await board.waitFor({timeout:120000});
  await page.locator('.p054-board[data-p054-audio-status="ready"]').waitFor({timeout:60000});
  await board.locator('[data-source-instance="Mc1_1"]').click();
  await board.locator('[data-source-instance="Mc1_2"]').click();
  await page.locator('.p054-board[data-p054-matched-pairs="1"][data-p054-phase="selecting"]').waitFor({timeout:20000});
  await page.waitForFunction(()=>[...document.querySelectorAll('.p054-board img')].every(i=>i.complete&&i.naturalWidth>0));
  await page.screenshot({path:`${out}/${locale}-handoff-smoke.png`,fullPage:true});
  assert.deepEqual(errors,[]);assert(resources.every(r=>r.status===200));
  result.cases.push({locale,resources,errors,level:await board.getAttribute('data-p054-level'),score:await board.getAttribute('data-p054-score')});
  await page.close();
 }
}catch(e){result.failure={message:e.message,stack:e.stack};process.exitCode=1;}
finally{await browser.close();result.endedAt=new Date().toISOString();await writeFile(`${out}/integration-smoke-v1.json`,JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result));}
