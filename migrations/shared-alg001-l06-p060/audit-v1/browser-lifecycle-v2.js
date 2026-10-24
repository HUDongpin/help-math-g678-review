async page => {
 await page.goto('http://127.0.0.1:4361/');await page.waitForFunction(()=>window.snap?.quiz?.phase==='question');const rows=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const action of ['answer','replay','pause','language','leave']){
  await page.evaluate(()=>{window.setPause(false);window.setLocale('es');window.remountQuiz();window.controls?.replay();});await page.waitForFunction(()=>window.snap.quiz.phase==='question'&&!window.snap.paused);await page.locator('.p060-audio-controls select').selectOption('es');await page.waitForFunction(()=>window.snap.language==='es');
  let held,release;const gate=new Promise(r=>release=r);let enteredResolve;const entered=new Promise(r=>enteredResolve=r);
  const handler=async route=>{const response=await route.fetch();held={status:response.status(),bytes:(await response.body()).length};enteredResolve();await gate;try{await route.fulfill({response});}catch{}};
  await page.route('**/audio/**',handler);await page.locator('[data-audio-choice="question"]').click();await entered;
  if(!held||held.status!==200||held.bytes<=0)throw Error('not exact held media');
  if(await page.evaluate(()=>window.snap.audio.phase)!=='loading')throw Error('not pending');
  const before=await page.evaluate(()=>({replay:window.snap.quiz.replay,responses:window.snap.quiz.responses.length,contexts:window.contexts.length,requests:window.requests.length}));
  if(action==='answer')await page.locator('[data-choice="B"]').click();
  if(action==='replay')await page.getByRole('button',{name:'Host Replay',exact:true}).click();
  if(action==='pause')await page.getByRole('button',{name:'Host pause',exact:true}).click();
  if(action==='language')await page.getByRole('combobox',{name:'Idioma del audio'}).selectOption('en');
  if(action==='leave')await page.getByRole('button',{name:'Host leave / return',exact:true}).click();
  release();await page.unroute('**/audio/**',handler);await page.waitForFunction(()=>window.contexts.every(c=>c.state==='closed'));
  await page.waitForTimeout(100);const after=await page.evaluate(()=>({phase:window.snap.audio.phase,id:window.snap.audio.assetId,replay:window.snap.quiz.replay,responses:window.snap.quiz.responses.length,contexts:window.contexts.map(c=>c.state),requests:window.requests.length}));
  if(after.requests!==before.requests||after.contexts.some(s=>s!=='closed'))throw Error('late media revived');
  if(action!=='leave'&&(after.phase!=='idle'||after.id!==null))throw Error('late owner');
  if(action==='answer'&&after.responses!==1)throw Error('answer missing');if(action==='replay'&&after.replay!==before.replay+1)throw Error('Replay missing');
  rows.push({action,held,before,after});
 }
 await page.evaluate(()=>window.remountQuiz());await page.waitForSelector('.p060-quiz');
 // Return must create a fresh untouched quiz and leave the old recordings closed.
 if(await page.evaluate(()=>window.snap.quiz.responses.length)!==0)throw Error('return not reset');
 await page.locator('[data-audio-choice="A"]').click();await page.waitForFunction(()=>window.snap.audio.phase==='playing');
 await page.evaluate(()=>window.unmountQuiz());await page.waitForFunction(()=>window.contexts.every(c=>c.state==='closed'));
 rows.push({action:'return-and-playing-dispose',contexts:await page.evaluate(()=>window.contexts.map(c=>c.state))});
 if(errors.length)throw Error(errors.join('\n'));return {pass:true,rows,errors,requests:await page.evaluate(()=>window.requests.length),contexts:await page.evaluate(()=>window.contexts.length)};
}
