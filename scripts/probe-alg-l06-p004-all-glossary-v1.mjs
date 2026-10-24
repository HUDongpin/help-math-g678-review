#!/usr/bin/env node
/** Real My Lesson, natural-playback check of all nine P004 glossary occurrences. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ORIGIN='http://127.0.0.1:3331';
const ROUTE='/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1';
const RUNTIME='[data-p004-continuous-v1]';
const OUTPUT='output/alg-l06-p004-all-glossary-v1';
const AUDIT='migrations/shared-alg001-l06-p004/audit/source-glossary-v1.json';
const OCCURRENCE_AUDIT='migrations/shared-alg001-l06-p004/audit/button-occurrences-v1.json';
const TABLE='packages/demos/src/alg-l06-p004-hit-regions.generated.ts';
const GROUPS=Object.freeze([
 {frame:130,ids:['57@106']},
 {frame:198,ids:['59@110']},
 {frame:520,ids:['79@85','80@87','81@89']},
 {frame:700,ids:['79@95','84@97','85@99','86@101']},
]);
const SOURCE_SHA='514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function pin(relative){
 assert(!path.isAbsolute(relative)&&relative.split('/').every(part=>part&&part!=='.'&&part!=='..'));
 const absolute=path.join(ROOT,relative);
 assert.equal(fs.realpathSync(absolute),absolute,`physical input ${relative}`);
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary input ${relative}`);
 const bytes=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])
  assert.equal(before[key],after[key],`stable input ${relative}:${key}`);
 return {path:relative,bytes:bytes.length,sha256:sha(bytes)};
}
function sourceExpectations(){
 const audit=JSON.parse(fs.readFileSync(path.join(ROOT,AUDIT),'utf8'));
 const occurrences=JSON.parse(fs.readFileSync(path.join(ROOT,OCCURRENCE_AUDIT),'utf8'));
 const text=fs.readFileSync(path.join(ROOT,TABLE),'utf8');
 const match=text.match(/^export const P004_HIT_REGIONS = (\[[\s\S]*\]) as const;\s*$/m);
 assert(match,'generated maintained occurrence table');
 const table=JSON.parse(match[1]);
 assert.equal(audit.kind,'alg-l06-p004-source-glossary-v1');
 assert.equal(audit.sourceSwf.sha256,SOURCE_SHA);
 assert.equal(occurrences.kind,'alg-l06-p004-button-occurrence-audit-v1');
 assert.equal(occurrences.frameDomain,'sprite-95');
 assert.equal(occurrences.frames,831);
 assert.equal(table.length,9);
 assert.deepEqual(table.map(row=>row.occurrenceId),GROUPS.flatMap(group=>group.ids));
 const expected=GROUPS.map(group=>({frame:group.frame,rows:group.ids.map(id=>{
  const row=table.find(item=>item.occurrenceId===id);
  assert(row&&row.firstFrame<=group.frame&&group.frame<=row.lastFrame,id);
  const button=occurrences.buttons.find(item=>item.buttonId===row.buttonId);
  assert(button&&button.keyAttribute===row.keyAttribute,id);
  assert(button.sourceVisibleFrameRanges.some(([first,last])=>first<=group.frame&&group.frame<=last),id);
  const entries=audit.entries.filter(item=>item.occurrenceIds.includes(id));
  assert.equal(entries.length,1,`one audit glossary entry for ${id}`);
  const entry=entries[0];
  assert.equal(entry.sourceKeyAttribute,row.keyAttribute,id);
  assert(entry.buttonIds.includes(row.buttonId),id);
  assert.equal(entry.id,entry.canonicalDictionaryKey.toLowerCase(),id);
  return {occurrenceId:id,buttonId:row.buttonId,depth:row.depth,
   firstFrame:row.firstFrame,lastFrame:row.lastFrame,keyAttribute:row.keyAttribute,
   entryId:entry.id,canonicalDictionaryKey:entry.canonicalDictionaryKey,
   labels:entry.labels,definitions:entry.definitions,source:entry.source};
 })}));
 const lower=expected.flatMap(group=>group.rows).find(row=>row.occurrenceId==='86@101');
 assert.equal(lower.keyAttribute,'output');
 assert.equal(lower.canonicalDictionaryKey,'Output');
 return {sourceSwf:audit.sourceSwf,groups:expected};
}
function currentInputs(){
 const plan=JSON.parse(execFileSync(process.execPath,
  ['scripts/check-alg-l06-p004-candidate-production-v6.mjs','--plan'],
  {cwd:ROOT,encoding:'utf8',maxBuffer:8e6}));
 assert.equal(plan.kind,'alg-l06-p004-candidate-production-plan-v6');
 assert.equal(plan.routeCount,137);assert.equal(plan.expectedCases,1644);
 assert.equal(plan.writesPerformed,false);
 const map=new Map(plan.inputs.map(item=>[item.path,item]));
 for(const file of [AUDIT,OCCURRENCE_AUDIT,TABLE,
  'scripts/probe-alg-l06-p004-all-glossary-v1.mjs']){
  const actual=pin(file),prior=map.get(file);
  if(prior)assert.deepEqual(prior,actual,`production closure drift ${file}`);
  map.set(file,actual);
 }
 return [...map.values()].sort((a,b)=>a.path.localeCompare(b.path));
}
const args=process.argv.slice(2);
assert(args.length===1&&args[0]==='--plan'||args.length===2&&args[0]==='--run'&&
 /^[a-z0-9][a-z0-9-]{0,63}$/u.test(args[1]),
 'Usage: --plan | --run <unique-slug>');
const expectations=sourceExpectations();
const inputsBefore=currentInputs();
if(args[0]==='--plan'){
 console.log(JSON.stringify({schemaVersion:1,kind:'alg-l06-p004-all-glossary-plan-v1',
  origin:ORIGIN,route:ROUTE,sourceSwf:expectations.sourceSwf,
  locales:['en','es'],groups:expectations.groups.map(group=>({frame:group.frame,
   occurrences:group.rows.map(row=>({id:row.occurrenceId,key:row.keyAttribute,entryId:row.entryId}))})),
  occurrenceCount:9,inputs:inputsBefore,writesPerformed:false}));
}else{
 const relative=`${OUTPUT}/${args[1]}`;
 const out=path.join(ROOT,relative);
 assert(!fs.existsSync(out),'unique immutable output directory');
 fs.mkdirSync(out,{recursive:true});
 const receipt={schemaVersion:1,kind:'alg-l06-p004-all-glossary-browser-v1',
  status:'running',startedAt:new Date().toISOString(),origin:ORIGIN,route:ROUTE,
  sourceSwf:expectations.sourceSwf,inputsBefore,locales:[],errors:[],acceptanceEffect:'none'};
 let browser;
 try{
  browser=await chromium.launch({channel:'chrome',headless:true});
  for(const locale of ['en','es']){
   const result={locale,occurrences:[],pageErrors:[],failedRequests:[],replay:null};
   receipt.locales.push(result);
   const page=await browser.newPage({viewport:locale==='es'?{width:390,height:844}:{width:1280,height:900},
    reducedMotion:locale==='es'?'reduce':'no-preference'});
   try{
    page.on('pageerror',error=>result.pageErrors.push(String(error)));
    page.on('response',response=>{if(response.status()>=400)
     result.failedRequests.push({status:response.status(),url:response.url()});});
    const response=await page.goto(`${ORIGIN}/${locale}${ROUTE}`,{timeout:120000});
    assert.equal(response.status(),200);
    await page.locator(`${RUNTIME}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
    const state=()=>page.locator(RUNTIME).evaluate(el=>({
     phase:el.getAttribute('data-p004-probe-phase'),
     frame:Number(el.querySelector('[data-flash-frame]')?.getAttribute('data-flash-frame')),
     glossary:el.getAttribute('data-p004-glossary-open'),
     run:el.getAttribute('data-source-audio-run'),
     visible:Number(el.getAttribute('data-source-control-count'))}));
    const control=key=>page.locator(`[data-responsive-focus-key="${key}"]:visible`).first();
    assert.deepEqual(await state(),{phase:'ready',frame:1,glossary:'false',run:'none',visible:0});
    assert.equal(await page.locator('[data-p004-companion-occurrence]').count(),0);
    await control('pause').click(); // Real My Lesson Play; no seek or frame injection.
    await page.waitForFunction(selector=>document.querySelector(selector)?.getAttribute('data-p004-probe-phase')==='playing',
     RUNTIME,{timeout:30000});
    const firstRun=(await state()).run;
    assert(firstRun&&firstRun!=='none','one source audio run');
    for(const group of expectations.groups){
     await page.waitForFunction(({selector,frame})=>Number(document.querySelector(`${selector} [data-flash-frame]`)
      ?.getAttribute('data-flash-frame'))>=frame,{selector:RUNTIME,frame:group.frame},{timeout:120000});
     for(const expected of group.rows){
      const trigger=page.locator(`[data-p004-companion-occurrence="${expected.occurrenceId}"]`);
      await trigger.waitFor({state:'visible'});
      assert.equal(await trigger.getAttribute('data-source-key-attribute'),expected.keyAttribute);
      assert.equal((await trigger.textContent())?.trim(),expected.labels[locale]);
      const before=await state();
      assert(before.frame>=group.frame&&before.frame>=expected.firstFrame&&before.frame<=expected.lastFrame,
       `natural visible frame for ${expected.occurrenceId}`);
      assert([firstRun,'none'].includes(before.run),'source stream or natural postroll');
      await trigger.click();
      const dialog=page.locator(`[role="dialog"][data-glossary-entry-id="${expected.entryId}"]`);
      await dialog.waitFor({state:'visible'});
      assert.equal(await dialog.getAttribute('data-source-key-attribute'),expected.keyAttribute);
      assert.equal(await dialog.getAttribute('data-source-sha256'),expected.source[locale].sha256);
      assert.equal(await dialog.getAttribute('data-glossary-storage'),'memory-only');
      const title=dialog.locator('h2');
      assert.equal(await title.textContent(),expected.labels[locale]);
      assert.equal(await dialog.getAttribute('aria-labelledby'),await title.getAttribute('id'));
      assert.deepEqual((await dialog.locator('p').allTextContents()).map(s=>s.trim()),
       [locale==='es'?'Glosario':'Glossary',expected.definitions[locale]]);
      const opened=await state();
      assert.equal(opened.phase,'paused');assert.equal(opened.glossary,'true');
      assert([firstRun,'none'].includes(opened.run));
      await page.waitForTimeout(250);
      assert.equal((await state()).frame,opened.frame,'dialog holds source frame');
      await dialog.getByRole('button',{name:locale==='es'?'Cerrar glosario':'Close glossary',exact:true}).click();
      await dialog.waitFor({state:'detached'});
      await page.waitForFunction(selector=>document.activeElement?.matches(selector),
       `[data-p004-companion-occurrence="${expected.occurrenceId}"]`,{timeout:10000});
      const closed=await state();
      assert.equal(closed.phase,'paused');assert.equal(closed.glossary,'false');
      assert.equal(closed.frame,opened.frame,'close remains paused');
      assert([firstRun,'none'].includes(closed.run));
      result.occurrences.push({occurrenceId:expected.occurrenceId,buttonId:expected.buttonId,
       depth:expected.depth,sourceKeyAttribute:expected.keyAttribute,
       canonicalDictionaryKey:expected.canonicalDictionaryKey,entryId:expected.entryId,
       label:expected.labels[locale],definition:expected.definitions[locale],
       frameBefore:before.frame,frameOpened:opened.frame,frameClosed:closed.frame,
       focusReturned:true,sourceRun:closed.run});
      await control('pause').click(); // Explicit resume after this occurrence.
      await page.waitForFunction(({selector,frame})=>{
       const el=document.querySelector(selector);
       return el?.getAttribute('data-p004-probe-phase')==='playing'&&
        Number(el.querySelector('[data-flash-frame]')?.getAttribute('data-flash-frame'))>frame;
      },{selector:RUNTIME,frame:closed.frame},{timeout:30000});
      assert([firstRun,'none'].includes((await state()).run),'source stream or natural postroll');
     }
    }
    assert.equal(result.occurrences.length,9);
    await control('replay').click();
    await page.waitForFunction(selector=>{
     const el=document.querySelector(selector);
     return el?.getAttribute('data-source-clock-ready')==='true'&&
      Number(el.querySelector('[data-flash-frame]')?.getAttribute('data-flash-frame'))===1&&
      el.getAttribute('data-source-control-count')==='0'&&
      document.querySelectorAll('[data-p004-companion-occurrence]').length===0;
    },RUNTIME,{timeout:30000});
    const replay=await state();
    assert.equal(replay.frame,1);assert.equal(replay.visible,0);
    assert.equal(replay.glossary,'false');
    assert.equal(await page.locator('[data-p004-companion-occurrence]').count(),0);
    assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(),0);
    result.replay={frame:replay.frame,visibleOccurrences:replay.visible,
     futureCompanionButtons:0,glossaryOpen:replay.glossary};
    assert.deepEqual(result.pageErrors,[]);assert.deepEqual(result.failedRequests,[]);
   }finally{await page.close();}
  }
  receipt.status='technical-pass-not-original-runtime-or-listening';
 }catch(error){receipt.status='failed';receipt.errors.push(String(error?.stack??error));process.exitCode=1;}
 finally{
  if(browser)await browser.close();
  receipt.browserClosed=Boolean(browser);
  try{receipt.inputsAfter=currentInputs();receipt.inputsStable=JSON.stringify(receipt.inputsBefore)===
   JSON.stringify(receipt.inputsAfter);if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}}
  catch(error){receipt.status='failed-input-check';receipt.errors.push(String(error?.stack??error));process.exitCode=1;}
  receipt.finishedAt=new Date().toISOString();
  fs.writeFileSync(path.join(out,'result.json'),JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});
  console.log(JSON.stringify({status:receipt.status,receipt:`${relative}/result.json`,
   locales:receipt.locales.map(item=>({locale:item.locale,occurrences:item.occurrences.length,
    replay:item.replay})),inputsStable:receipt.inputsStable,errors:receipt.errors}));
 }
}
