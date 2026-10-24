#!/usr/bin/env node
/** Focused, real My Lesson keyboard, DPR and declared-font failure probe. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const ROUTE='/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1';
const RUNTIME='[data-p004-continuous-v1]';
const FONT_PATHS=new Set(['/fonts/lesson-v1/nunito-sans-variable.ttf',
  '/fonts/lesson-v1/fredoka-variable.ttf']);
const MATRIX=Object.freeze([
  {id:'en-desktop-dpr1-loaded',locale:'en',viewport:{width:1280,height:900},dpr:1,
    motion:'no-preference',blockFonts:false},
  {id:'en-desktop-dpr2-fallback',locale:'en',viewport:{width:1280,height:900},dpr:2,
    motion:'no-preference',blockFonts:true},
  {id:'es-mobile-dpr2-loaded',locale:'es',viewport:{width:390,height:844},dpr:2,
    motion:'reduce',blockFonts:false},
  {id:'es-mobile-dpr3-fallback',locale:'es',viewport:{width:390,height:844},dpr:3,
    motion:'reduce',blockFonts:true},
]);
const HASH=bytes=>createHash('sha256').update(bytes).digest('hex');
const REQUIRED_FILES=[
  'scripts/probe-alg-l06-p004-accessibility-v1.mjs',
  'apps/web/app/globals.css','apps/web/app/lesson-fonts.css',
  'apps/web/app/lesson-typography.css','apps/web/app/lesson-typography-host.css',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-alg001-l06-p004/candidate-v1/page.tsx',
  'apps/web/lib/g678-admission-activation.ts',
  'apps/web/components/private-audio-glossary-portal.tsx',
  'packages/demos/src/lesson-text-presentation.tsx',
  'packages/demos/src/lesson-text-snapshot.ts',
  'packages/demos/src/lesson-text-contract.ts',
  'packages/demos/src/contract.ts',
  'apps/web/public/fonts/lesson-v1/nunito-sans-variable.ttf',
  'apps/web/public/fonts/lesson-v1/fredoka-variable.ttf',
  'migrations/shared-alg001-l06-p004/audit/source-audit-v1.json',
  'migrations/shared-alg001-l06-p004/audit/semantic-pairs-v1.json',
  'migrations/shared-alg001-l06-p004/audit/equation-geometry-v1.json',
];
const PREFIXED_DIRECTORIES=[
  ['apps/web/components','g678-alg-l06-p004'],
  ['apps/web/lib','alg-l06-p004'],
  ['apps/web/tests','alg-l06-p004'],
  ['packages/demos/src','alg-l06-p004'],
  ['packages/demos/tests','alg-l06-p004'],
];
function pin(relative){
  assert(typeof relative==='string'&&!path.isAbsolute(relative)&&
    relative.split('/').every(part=>part&&part!=='.'&&part!=='..'),'bounded input path');
  const file=path.join(ROOT,relative);
  assert.equal(fs.realpathSync(file),file,`physical input: ${relative}`);
  const before=fs.lstatSync(file,{bigint:true});
  assert(before.isFile()&&before.nlink===1n&&before.size<=64n*1024n*1024n,
    `ordinary input: ${relative}`);
  const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
  assert(['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'].every(key=>
    before[key]===after[key]),`stable input: ${relative}`);
  return {path:relative,bytes:bytes.length,sha256:HASH(bytes)};
}
function currentInputs(){
  const files=new Set(REQUIRED_FILES);
  for(const [directory,prefix] of PREFIXED_DIRECTORIES){
    for(const name of fs.readdirSync(path.join(ROOT,directory)))
      if(name.startsWith(prefix)&&/\.(?:ts|tsx|css)$/.test(name))files.add(`${directory}/${name}`);
  }
  files.add('packages/demos/src/modules/shared-alg001-l06-p004.tsx');
  files.add('packages/demos/src/timelines/shared-alg001-l06-p004.ts');
  const activation=fs.readFileSync(path.join(ROOT,'apps/web/lib/g678-admission-activation.ts'),'utf8');
  const match=activation.match(/export const G678_ADMISSION_INDEX\s*=\s*(\{[\s\S]*?\})\s*as const;/u);
  assert(match,'reviewed active admission pointer');
  const activeIndex=JSON.parse(match[1]);
  assert.deepEqual(pin(activeIndex.path),activeIndex,'active index bytes');
  files.add(activeIndex.path);
  const index=JSON.parse(fs.readFileSync(path.join(ROOT,activeIndex.path),'utf8'));
  assert.deepEqual(pin(index.host.path),index.host,'active host bytes');
  files.add(index.host.path);
  const pins=[...files].sort().map(pin);
  const source=JSON.parse(fs.readFileSync(path.join(ROOT,
    'migrations/shared-alg001-l06-p004/audit/source-audit-v1.json'),'utf8'));
  assert.equal(source.animationId,'shared-alg001-l06-p004');
  assert.equal(source.source.sha256,'514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e');
  return {pins,activeIndex,host:index.host,source:source.source,
    scope:'focused P004 browser inputs; full production closure is independently checked'};
}
function currentMathBinding(){
  const code='import {p004SemanticText,P004_SEMANTIC_TEXT_BINDING} from '+
    '"./packages/demos/src/alg-l06-p004-semantic-text-v1.ts";'+
    'const rows=p004SemanticText(130).filter(row=>row.kind==="semanticMath");'+
    'console.log(JSON.stringify({version:P004_SEMANTIC_TEXT_BINDING.version,'+
    'sourceSwfSha256:P004_SEMANTIC_TEXT_BINDING.sourceSwfSha256,'+
    'rows:rows.map(row=>({id:row.id,text:row.text,ariaLabel:row.math?.ariaLabel}))}));';
  const binding=JSON.parse(execFileSync(process.execPath,
    ['--import','tsx','--input-type=module','-e',code],
    {cwd:ROOT,encoding:'utf8',maxBuffer:1024*1024}));
  assert.equal(binding.sourceSwfSha256,
    '514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e');
  assert.equal(binding.rows.length,1,'one current semantic math row at frame 130');
  assert(binding.rows[0].text&&binding.rows[0].ariaLabel&&binding.version,
    'current maintained math binding');
  return binding;
}
function argumentsForRun(argv){
  const mode=argv[0];assert(['--plan','--run'].includes(mode),'usage: --plan|--run');
  const pairs=new Map();
  for(let i=1;i<argv.length;i+=2){
    const key=argv[i],value=argv[i+1];
    assert(['--base-url','--output-dir'].includes(key)&&value&&!pairs.has(key),
      'usage: --plan|--run --base-url http://127.0.0.1:3331 --output-dir output/alg-l06-p004-accessibility-v1/<unique-slug>');
    pairs.set(key,value);
  }
  assert(pairs.size===2,'base URL and output directory required');
  const url=new URL(pairs.get('--base-url'));
  assert.equal(url.origin,'http://127.0.0.1:3331','local source-bound browser origin');
  assert(url.pathname==='/'&&!url.search&&!url.hash&&!url.username&&!url.password,
    'base URL must be origin only');
  const output=path.resolve(ROOT,pairs.get('--output-dir'));
  const prefix=path.join(ROOT,'output/alg-l06-p004-accessibility-v1')+path.sep;
  assert(output.startsWith(prefix)&&/^[a-z0-9-]+$/.test(path.basename(output)),
    'unique bounded evidence directory');
  return {mode,baseURL:url.origin,output};
}
async function tabTo(page,selector,limit=200){
  for(let steps=1;steps<=limit;steps++){
    await page.keyboard.press('Tab');
    const focus=await page.evaluate(selector=>{
      const element=document.activeElement;
      if(!(element instanceof HTMLElement)||!element.matches(selector)||
        !element.getClientRects().length)return null;
      const style=getComputedStyle(element);
      return {tag:element.tagName,role:element.getAttribute('role'),
        ariaLabel:element.getAttribute('aria-label'),focusVisible:element.matches(':focus-visible'),
        outlineStyle:style.outlineStyle,outlineWidth:style.outlineWidth,
        boxShadow:style.boxShadow};
    },selector);
    if(focus){assert(focus.focusVisible,`keyboard focus is not visibly marked: ${selector}`);
      return {steps,...focus};}
  }
  throw Error(`Tab did not reach ${selector} within ${limit} presses`);
}
async function settledLayout(page){
  await page.evaluate(async()=>{
    await document.fonts.ready;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  });
}
async function measure(page){
  const math=page.getByRole('math');
  await math.scrollIntoViewIfNeeded();
  await settledLayout(page);
  return math.evaluate(element=>{
    const rect=element.getBoundingClientRect();
    const nav=document.querySelector('.lesson-shell2__learning-nav')?.getBoundingClientRect();
    const text=getComputedStyle(element);
    const block=element.querySelector('.lesson-text-presentation__block');
    const blockStyle=block?getComputedStyle(block):null;
    const faceStatus=[...document.fonts].filter(face=>
      ['HELP Math Nunito Sans','HELP Math Fredoka'].includes(face.family))
      .map(face=>({family:face.family,status:face.status}));
    return {text:element.textContent?.trim(),ariaLabel:element.getAttribute('aria-label'),
      bounds:rect.toJSON(),navBottom:nav?.bottom??0,
      viewport:{width:innerWidth,height:innerHeight,dpr:devicePixelRatio},
      documentWidth:document.documentElement.scrollWidth,
      rootFontSize:getComputedStyle(document.documentElement).fontSize,
      fontFamily:text.fontFamily,fontSize:text.fontSize,
      blockFontFamily:blockStyle?.fontFamily??null,faceStatus,
      sourceFrame:document.querySelector('[data-p004-native-text]')?.getAttribute('data-p004-text-frame'),
      runtimeFrame:document.querySelector('[data-p004-continuous-v1] [data-flash-frame]')?.getAttribute('data-flash-frame')};
  });
}
function assertReadable(sample,cell,expected){
  assert.equal(sample.text,expected.text,`${cell}: current source-bound formula remains readable`);
  assert.equal(sample.ariaLabel,expected.ariaLabel,
    `${cell}: semantic math label`);
  assert(Number(sample.bounds.width)>0&&Number(sample.bounds.height)>0,
    `${cell}: nonzero semantic bounds`);
  assert(sample.documentWidth<=sample.viewport.width,`${cell}: no horizontal overflow`);
  assert(sample.bounds.top>=sample.navBottom-1&&
    sample.bounds.bottom<=sample.viewport.height+1,`${cell}: math is not covered`);
  assert.equal(sample.sourceFrame,sample.runtimeFrame,`${cell}: native/source frame agreement`);
}
function pngPin(file,viewport,dpr){
  const bytes=fs.readFileSync(file);
  assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a','PNG signature');
  const pixels={width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20)};
  assert.equal(pixels.width,viewport.width*dpr,'screenshot physical width reflects DPR');
  assert.equal(pixels.height,viewport.height*dpr,'screenshot physical height reflects DPR');
  return {path:path.relative(ROOT,file),bytes:bytes.length,sha256:HASH(bytes),pixels};
}
async function probeCell(browser,cell,baseURL,output,results,expected){
  const observation={id:cell.id,locale:cell.locale,viewport:cell.viewport,
    configuredDpr:cell.dpr,reducedMotion:cell.motion,fontMode:cell.blockFonts?'declared-font-requests-aborted':'normal',
    failedRequests:[],blockedFonts:[],externalRequests:[],responses:[],console:[],pageErrors:[]};
  results.push(observation);
  const context=await browser.newContext({viewport:cell.viewport,deviceScaleFactor:cell.dpr,
    reducedMotion:cell.motion,locale:cell.locale,serviceWorkers:'block'});
  let page;
  try{
    await context.route('**/*',async route=>{
      const url=new URL(route.request().url());
      if(url.protocol==='http:'||url.protocol==='https:'){
        if(url.origin!==baseURL){observation.externalRequests.push(url.href);
          await route.abort('blockedbyclient');return;}
        if(cell.blockFonts&&FONT_PATHS.has(url.pathname)){
          observation.blockedFonts.push(url.pathname);
          await route.abort('failed');return;}
      }
      await route.continue();
    });
    page=await context.newPage();
    page.on('pageerror',error=>observation.pageErrors.push(String(error)));
    page.on('console',message=>{
      if(['error','warning'].includes(message.type()))
        observation.console.push({type:message.type(),text:message.text(),url:message.location().url});
    });
    page.on('requestfailed',request=>observation.failedRequests.push({url:request.url(),
      error:request.failure()?.errorText??null}));
    page.on('response',response=>{
      if(response.status()>=400)observation.responses.push({url:response.url(),status:response.status()});
    });
    const response=await page.goto(`${baseURL}/${cell.locale}${ROUTE}`,
      {timeout:120000,waitUntil:'domcontentloaded'});
    assert.equal(response?.status(),200,'real My Lesson route');
    await page.locator(`${RUNTIME}[data-source-clock-ready="true"]`).waitFor({timeout:60000});
    observation.entry={status:response.status(),phase:await page.locator(RUNTIME).getAttribute('data-p004-probe-phase'),
      frame:await page.locator(`${RUNTIME} [data-flash-frame]`).getAttribute('data-flash-frame'),
      autoplay:await page.locator(RUNTIME).getAttribute('data-runtime-paused')};
    assert.deepEqual(observation.entry,{status:200,phase:'ready',frame:'1',autoplay:'true'},
      'entry starts ready and paused');
    const pauseButton='[data-responsive-focus-key="pause"]';
    observation.keyboardPlay=await tabTo(page,pauseButton);
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>Number(document.querySelector(
      '[data-p004-continuous-v1] [data-flash-frame]')?.getAttribute('data-flash-frame'))>=130,
    null,{timeout:30000});
    // A rerender can replace the control; return to it through Tab if focus moved.
    if(!await page.evaluate(selector=>document.activeElement?.matches(selector),pauseButton))
      observation.keyboardPause=await tabTo(page,pauseButton);
    await page.keyboard.press('Enter');
    await page.waitForFunction(()=>document.querySelector('[data-p004-continuous-v1]')
      ?.getAttribute('data-p004-probe-phase')==='paused',null,{timeout:10000});
    const heldFrame=await page.locator(`${RUNTIME} [data-flash-frame]`).getAttribute('data-flash-frame');
    observation.heldFrame=Number(heldFrame);
    assert(observation.heldFrame>=130&&observation.heldFrame<=831);
    const glossary='[data-p004-companion-occurrence="57@106"]';
    await page.locator(glossary).waitFor({timeout:10000});
    observation.keyboardGlossary=await tabTo(page,glossary);
    await page.keyboard.press('Enter');
    const dialog=page.locator('[role="dialog"][data-glossary-entry-id="input"]');
    await dialog.waitFor({timeout:10000});
    observation.dialog={label:await dialog.locator('h2').textContent(),
      focusedClose:await dialog.locator('button').evaluate(el=>el===document.activeElement)};
    assert(observation.dialog.focusedClose,'dialog focuses its close button');
    await page.keyboard.press('Enter');
    await dialog.waitFor({state:'detached',timeout:10000});
    await page.waitForFunction(selector=>document.activeElement?.matches(selector),glossary,
      {timeout:10000});
    observation.focusReturned=true;
    assert.equal(await page.locator(`${RUNTIME} [data-flash-frame]`).getAttribute('data-flash-frame'),
      heldFrame,'glossary preserves paused frame');
    assert.equal(await page.getByRole('math').count(),1);
    observation.normal=await measure(page);
    assertReadable(observation.normal,cell.id,expected);
    assert.equal(observation.normal.viewport.dpr,cell.dpr,'observed browser DPR');
    const screenshot=path.join(output,`${cell.id}-normal.png`);
    await page.screenshot({path:screenshot,fullPage:false});
    observation.normalScreenshot=pngPin(screenshot,cell.viewport,cell.dpr);
    await page.evaluate(()=>{document.documentElement.style.fontSize='200%';});
    await settledLayout(page);
    observation.enlarged=await measure(page);
    assertReadable(observation.enlarged,cell.id+'-200-percent',expected);
    assert.equal(observation.enlarged.runtimeFrame,heldFrame,'root font enlargement keeps state');
    const enlargedScreenshot=path.join(output,`${cell.id}-root-200.png`);
    await page.screenshot({path:enlargedScreenshot,fullPage:false});
    observation.enlargedScreenshot=pngPin(enlargedScreenshot,cell.viewport,cell.dpr);
    const blocked=new Set(observation.blockedFonts);
    if(cell.blockFonts){
      assert(blocked.size>0,'at least one declared font request was genuinely blocked');
      for(const item of observation.failedRequests){
        const url=new URL(item.url);
        assert(FONT_PATHS.has(url.pathname),'no unrelated failed request in fallback cell');
      }
    }else{
      assert.equal(blocked.size,0,'normal font cell did not block fonts');
      assert.deepEqual(observation.failedRequests,[],'normal cell has no failed requests');
    }
    assert.deepEqual(observation.externalRequests,[],'no external browser traffic');
    assert.deepEqual(observation.pageErrors,[],'no page errors');
    assert.deepEqual(observation.responses.filter(item=>item.url.includes('/flash-assets/')),[],
      'no failed lesson assets');
    observation.fontClaim='declared font fetch outcome and fallback layout observed; actual glyph attribution unestablished';
    observation.status='pass';
    return observation;
  }catch(error){
    observation.status='failed';observation.failure=String(error?.stack??error);
    if(page){
      try{
        const failureScreenshot=path.join(output,`${cell.id}-failure.png`);
        await page.screenshot({path:failureScreenshot,fullPage:false,timeout:10000});
        observation.failureScreenshot={path:path.relative(ROOT,failureScreenshot),
          bytes:fs.statSync(failureScreenshot).size,sha256:HASH(fs.readFileSync(failureScreenshot))};
      }catch(captureError){observation.failureCapture=String(captureError);}
    }
    throw error;
  }finally{await context.close();observation.contextClosed=true;}
}

const options=argumentsForRun(process.argv.slice(2));
const preparation={kind:'alg-l06-p004-accessibility-browser-v1',baseURL:options.baseURL,
  output:path.relative(ROOT,options.output),matrix:MATRIX,inputs:currentInputs(),
  currentMathBinding:currentMathBinding(),
  gate:'focused engineering browser evidence, no original-runtime/audio/human/Owner acceptance'};
if(options.mode==='--plan'){
  console.log(JSON.stringify({...preparation,status:'plan-no-browser'},null,2));
}else{
  fs.mkdirSync(options.output,{recursive:true});
  assert(!fs.existsSync(path.join(options.output,'result.json')),
    'unique output directory; preserve every earlier result');
  fs.copyFileSync(path.join(ROOT,'scripts/probe-alg-l06-p004-accessibility-v1.mjs'),
    path.join(options.output,'runner.mjs'),fs.constants.COPYFILE_EXCL);
  const receipt={...preparation,status:'running',startedAt:new Date().toISOString(),
    browserVersion:null,results:[],errors:[],browserClosed:false,inputsAfter:null,inputsStable:null,
    acceptanceEffects:{originalRuntime:false,audioListening:false,humanReview:false,
      ownerAcceptance:false,strictCompletion:false,publication:false}};
  let browser;
  try{
    browser=await chromium.launch({channel:'chrome',headless:true});
    receipt.browserVersion=browser.version();
    for(const cell of MATRIX)await probeCell(browser,cell,
      options.baseURL,options.output,receipt.results,receipt.currentMathBinding.rows[0]);
    receipt.status='pass';
  }catch(error){receipt.status='failed';receipt.errors.push(String(error?.stack??error));
    process.exitCode=1;
  }finally{
    if(browser){
      try{await browser.close();receipt.browserClosed=true;}
      catch(error){receipt.status='failed-browser-cleanup';
        receipt.errors.push(String(error?.stack??error));process.exitCode=1;}
    }
    try{
      receipt.inputsAfter=currentInputs();
      receipt.inputsStable=JSON.stringify(receipt.inputs.pins)===
        JSON.stringify(receipt.inputsAfter.pins);
      if(!receipt.inputsStable){receipt.status='failed-input-drift';process.exitCode=1;}
    }catch(error){receipt.status='failed-input-recheck';receipt.errors.push(String(error?.stack??error));
      process.exitCode=1;}
    receipt.finishedAt=new Date().toISOString();
    fs.writeFileSync(path.join(options.output,'result.json'),JSON.stringify(receipt,null,2)+'\n',
      {flag:'wx'});
    console.log(JSON.stringify({status:receipt.status,results:receipt.results.map(row=>row.id),
      errors:receipt.errors,inputsStable:receipt.inputsStable,browserClosed:receipt.browserClosed,
      receipt:path.join(options.output,'result.json')}));
  }
}
