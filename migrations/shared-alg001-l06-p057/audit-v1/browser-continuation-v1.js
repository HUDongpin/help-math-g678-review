async page=>{
 const rows=[],errors=[],check=(ok,msg)=>{if(!ok)throw Error(msg);};page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4357/player.html');await page.waitForSelector('[data-p057-ready=true]');await page.locator('#locale').click();
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>document.documentElement.style.fontSize='20px');await page.setViewportSize({width:390,height:900});
 const snap=()=>page.evaluate(()=>window.p057Runtime.snapshot());await page.locator('[data-p057-play]').click();
 for(const [i,n]of [313,481,629,788].entries()){
  await page.waitForFunction(n=>window.p057Snapshot?.state.mainFrame===n,n,{timeout:35000});
  await page.locator(i<2?`[data-p057-step="${i+1}"]`:'[data-p057-continue]').focus();await page.keyboard.press('Enter');
 }
 await page.waitForFunction(()=>window.p057Snapshot?.state.phase==='quiz-held',null,{timeout:15000});
 for(const key of ['Equation','Function','Function table','Input','Output']){
  const trigger=page.locator(`[data-p057-glossary="${key}"]`).first();await trigger.click();check(await page.getByRole('dialog').count()===1,'ES glossary');
  const text=await page.getByRole('dialog').innerText();await page.locator('#glossary-close').click();check(await trigger.evaluate(e=>e===document.activeElement),'ES focus');rows.push({glossary:key,text:text.slice(0,150)});
 }
 await page.locator('button[data-p057-spanish]').click();await page.waitForFunction(()=>window.p057Snapshot?.audio.owner==='sa'&&window.p057Snapshot.audio.selected?.phase==='playing');
 const before=(await snap()).state.mainFrame;await page.waitForFunction(()=>window.p057Snapshot?.spanishSelected===false,null,{timeout:15000});check((await snap()).state.mainFrame===before,'SA EOF holds animation');rows.push({spanish:'explicit EOF returned held',frame:before});
 for(const width of [390,768,1360]){
  await page.setViewportSize({width,height:1000});await page.evaluate(()=>scrollTo(0,0));
  const sizes=await page.locator('[data-p057-native]').evaluate(e=>({root:parseFloat(getComputedStyle(document.documentElement).fontSize),overflow:document.documentElement.scrollWidth>innerWidth+1,buttons:[...e.querySelectorAll('button')].map(b=>({height:b.getBoundingClientRect().height,font:parseFloat(getComputedStyle(b).fontSize)}))}));
  check(sizes.root===20&&!sizes.overflow&&sizes.buttons.every(b=>b.height>=44&&b.font>=20),'20px native metrics '+width);
  // Use a viewport capture after settling its height, avoiding fullPage raster stitching.
  for(let i=0;i<3;i++){await page.setViewportSize({width,height:await page.evaluate(()=>document.documentElement.scrollHeight)});await page.waitForTimeout(100);}
  await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p057-native-browser-20261003-v1/es-${width}-20px-v1.png`,fullPage:false});rows.push({width,...sizes});
 }
 await page.locator('#mount').click();check(errors.length===0,'errors '+errors.join(','));return {pass:true,kind:'p057-es-glossary-spanish-responsive-v1',rows,errors,listeningAccepted:false};
}
