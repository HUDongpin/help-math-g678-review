async page=>{
 const rows=[],errors=[];page.on('pageerror',e=>errors.push(String(e)));
 for(const action of ['replay','leave']){
  await page.goto('http://127.0.0.1:4353/player.html');await page.waitForSelector('[data-p033-ready=true]');
  let release,arrived=false,finished=false;const gate=new Promise(r=>release=r);
  await page.route('**/audio/sa',async route=>{
   const real=await route.fetch(),body=await real.body();if(real.status()!==200||body.length!==173040)throw Error('source body');
   arrived=true;await gate;try{await route.fulfill({response:real,body});}catch{}finished=true;
  });
  await page.locator('button[data-p033-spanish]').click();
  for(let i=0;i<100&&!arrived;i++)await page.waitForTimeout(25);
  if(!arrived||!await page.evaluate(()=>window.p033Runtime.snapshot().spanishLoading))throw Error('pending not reached');
  await page.locator(action==='replay'?'[data-p033-replay]':'#mount').click();release();
  for(let i=0;i<100&&!finished;i++)await page.waitForTimeout(25);
  if(!finished)throw Error('response release');await page.waitForTimeout(250);
  if(action==='replay'){
   const s=await page.evaluate(()=>window.p033Runtime.snapshot());
   if(s.state.mainFrame!==1||s.spanishSelected||s.spanishLoading||s.audio.streams.sa?.phase==='playing')throw Error('stale SA');
   await page.locator('[data-p033-play]').click();await page.waitForFunction(()=>window.p033Snapshot.state.mainFrame>=3);
   await page.locator('#mount').click();
  }
  await page.waitForFunction(()=>window.p033Cleanup===1&&window.p033Contexts.every(c=>c.state==='closed'));
  rows.push({action,realSourceBytes:173040,contexts:await page.evaluate(()=>window.p033Contexts.map(c=>c.state)),stalePlayback:false});
  await page.unroute('**/audio/sa');
 }
 if(errors.length)throw Error(errors.join(';'));return {pass:true,rows,errors,actualMyLesson:false,registered:false};
}
