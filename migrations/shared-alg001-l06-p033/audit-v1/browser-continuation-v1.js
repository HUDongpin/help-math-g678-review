async page=>{
 const check=(ok,s)=>{if(!ok)throw Error(s);},rows=[],errors=[];
 page.on('pageerror',e=>errors.push(String(e)));
 await page.goto('http://127.0.0.1:4353/player.html');await page.waitForSelector('[data-p033-ready=true]');
 const snap=()=>page.evaluate(()=>window.p033Runtime.snapshot());
 await page.locator('[data-p033-play]').click();await page.waitForFunction(()=>window.p033Snapshot.state.mainFrame>10);
 await page.locator('[data-p033-pause]').click();let frame=(await snap()).state.mainFrame;
 await page.waitForTimeout(200);check((await snap()).state.mainFrame===frame,'pause');
 await page.locator('[data-p033-play]').click();await page.waitForFunction(()=>window.p033Snapshot.state.phase==='quiz-held');
 for(const attempt of [1,2]){
  await page.locator('[data-source-choice=B] button').click();await page.waitForSelector('[data-p033-close]');
  // Real early Close, as soon as the source places the popup.
  let s=await snap();check(s.state.quizTryCount===attempt,'source attempt count');
  check(s.state.wrongFeedText.endsWith('Try again.')===(attempt===1),'first/later feedback strings');
  const id=s.state.feedback.spriteId,early=s.state.feedback.frame;
  await page.locator('[data-p033-close]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(a=>a===1?window.p033Snapshot.state.phase==='quiz-held':window.p033Snapshot.state.mainFrame>=53,attempt,{timeout:10000});
  rows.push({case:'early Close with keyboard',attempt,spriteId:id,clickedFrame:early,result:(await snap()).state.phase});
 }
 await page.waitForFunction(()=>window.p033Snapshot.state.mainFrame>=231,null,{timeout:25000});await page.locator('[data-p033-pause]').click();
 frame=(await snap()).state.mainFrame;
 for(const language of ['en','es']){
  if(language==='es')await page.locator('#locale').click();
  for(const [id,label]of [[180,language==='en'?'Set':'Conjunto'],[181,language==='en'?'Ordered pair':'Par ordenado'],[182,language==='en'?'Function':'Función'],[185,language==='en'?'Value':'Valor']]){
   const trigger=page.locator(`[data-source-glossary-id="${id}"]`);await trigger.focus();await page.keyboard.press('Enter');
   check(await page.getByRole('dialog',{name:label,exact:true}).count()===1,'dictionary '+language+' '+label);
   await page.locator('#glossary-close').click();check(await trigger.evaluate(e=>document.activeElement===e),'focus returned');
   check((await snap()).state.mainFrame===frame,'glossary source remains held');
  }
  rows.push({case:'four source dictionary entries and focus',language,frame});
 }
 await page.emulateMedia({reducedMotion:'reduce'});await page.evaluate(()=>document.documentElement.style.fontSize='20px');
 for(const width of [390,768,1360]){
  await page.setViewportSize({width,height:900});
  const layout=await page.locator('[data-p033-native]').evaluate(root=>{const box=root.getBoundingClientRect();return {width:innerWidth,root:box.width,overflow:document.documentElement.scrollWidth>innerWidth,font:getComputedStyle(root).fontSize,controls:[...root.querySelectorAll('button')].map(b=>({height:b.getBoundingClientRect().height,font:getComputedStyle(b).fontSize}))};});
  check(!layout.overflow&&layout.font==='20px'&&layout.controls.every(b=>b.height>=44&&b.font==='20px'),'responsive/rootfont '+width);
  rows.push({case:'ES responsive20px reduced-motion',...layout});
  await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p033-native-browser-20261003-v1/es-${width}-v1.png`,fullPage:true});
 }
 await page.locator('[data-p033-spanish]').click();await page.waitForFunction(()=>window.p033Snapshot.audio.selected?.phase==='playing');
 check((await snap()).spanishSelected,'explicit SA selection');await page.locator('[data-p033-pause]').click();
 const sample=(await snap()).audio.streams.sa.decodedSample;await page.waitForTimeout(180);check((await snap()).audio.streams.sa.decodedSample===sample,'SA pause');
 await page.locator('[data-p033-play]').click();await page.waitForFunction(()=>!window.p033Snapshot.spanishSelected,null,{timeout:18000});
 check((await snap()).state.mainFrame===frame&&!((await snap()).visualClockRunning),'SA EOF returns held lesson');
 rows.push({case:'actual SA pause resume EOF held return',frame});
 await page.locator('[data-p033-play]').click();await page.waitForFunction(()=>window.p033Snapshot.state.mainFrame===385,null,{timeout:17000});
 check((await snap()).state.phase==='engineering-end-held'&&(await snap()).lessonCompleted===false,'terminal does not finish lesson');
 await page.locator('[data-p033-replay]').click();check((await snap()).state.mainFrame===1&&(await snap()).state.quizTryCount===0,'Replay resets');
 check(errors.length===0,'browser errors '+errors.join(','));return {pass:true,rows,errors,originalRuntime:false,listeningAccepted:false};
}
