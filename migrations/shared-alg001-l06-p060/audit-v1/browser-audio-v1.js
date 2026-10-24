async page => {
 await page.goto('http://127.0.0.1:4361/');await page.waitForFunction(()=>window.snap?.quiz?.phase==='question');const rows=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));
 const state=()=>page.evaluate(()=>({snap:window.snap,requests:window.requests.map(r=>r.id),contexts:window.contexts.map(c=>c.state)}));
 if((await state()).requests.length)throw Error('autoplay');
 for(const language of ['en','es']){
  await page.getByRole('combobox',{name:'Audio language'}).selectOption(language);await page.waitForFunction(l=>window.snap.language===l,language);
  const question=Number(await page.locator('[data-p060-question]').getAttribute('data-p060-question'));
  for(const choice of ['question','A','B','C','D']){
   await page.locator(`[data-audio-choice="${choice}"]`).click();await page.waitForFunction(()=>window.snap.audio.phase==='playing');
   const s=await state(),expected=`${language}-Q${question}${choice==='question'?'':choice}`;
   if(s.snap.audio.assetId!==expected||s.requests.at(-1)!==expected)throw Error('source role');
   if(s.contexts.filter(s=>s!=='closed').length!==1)throw Error('multiple live contexts');
   rows.push({language,choice,id:expected,phase:s.snap.audio.phase,transport:s.snap.audio.transport.phase,contexts:s.contexts});
  }
 }
 // The original source widget uses stop/unload. Host pause stops; resuming the
 // quiz does not automatically start any question or answer recording.
 await page.getByRole('button',{name:'Host pause',exact:true}).click();await page.waitForFunction(()=>window.snap.paused&&window.contexts.every(c=>c.state==='closed'));
 const count=await page.evaluate(()=>window.requests.length);await page.getByRole('button',{name:'Host pause',exact:true}).click();await page.waitForTimeout(120);
 if(await page.evaluate(()=>window.requests.length)!==count)throw Error('resume autoplay');
 await page.locator('[data-audio-choice="D"]').click();await page.waitForFunction(()=>window.snap.audio.phase==='playing');
 // Real shortest option plays naturally to EOF; this cannot answer or complete.
 await page.waitForFunction(()=>window.snap.audio.transport?.phase==='buffer-ended',{},{timeout:30000});
 if(await page.evaluate(()=>window.snap.quiz.responses.length)!==0)throw Error('EOF answered');
 rows.push({step:'natural-EOF',state:await state()});
 await page.locator('[data-audio-choice="question"]').click();await page.waitForFunction(()=>window.snap.audio.phase==='playing');
 await page.locator('[data-choice="A"]').click();await page.waitForFunction(()=>window.snap.quiz.responses.length===1&&window.contexts.every(c=>c.state==='closed'));
 rows.push({step:'answer-closes-recording',state:await state()});
 await page.evaluate(()=>window.unmountQuiz());await page.waitForFunction(()=>window.contexts.every(c=>c.state==='closed'));
 if(errors.length)throw Error(errors.join('\n'));return {pass:true,rows,errors,requests:await page.evaluate(()=>window.requests.length),contexts:await page.evaluate(()=>window.contexts.length)};
}
