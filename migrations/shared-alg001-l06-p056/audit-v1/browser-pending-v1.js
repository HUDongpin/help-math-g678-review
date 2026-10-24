async page=>{
 const browser=page.context().browser(),context=await browser.newContext(),p=await context.newPage(),rows=[];
 const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 await p.addInitScript(()=>{window.p056Contexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...a){super(...a);window.p056Contexts.push(this);}};});
 try{for(const action of ['replay','leave']){
  await p.goto('http://127.0.0.1:4356/player.html');await p.waitForSelector('[data-p056-ready=true]');
  let release,arrived;const blocked=new Promise(r=>release=r),captured=new Promise(r=>arrived=r);
  await p.route('**/audio/sa',async route=>{const response=await route.fetch(),body=await response.body();check(body.length===109536,'real SA bytes');arrived();await blocked;try{await route.fulfill({response,body});}catch{/* aborted fetch is expected */}});
  await p.locator('button[data-p056-spanish]').click();await captured;
  check(await p.evaluate(()=>window.p056Snapshot.spanishLoading),'pending SA loading');
  await p.locator(action==='replay'?'[data-p056-replay]':'#mount').click();release();await p.waitForTimeout(200);
  if(action==='replay'){
   const s=await p.evaluate(()=>window.p056Runtime.snapshot());check(s.state.mainFrame===1&&!s.spanishSelected&&!s.spanishLoading&&!s.visualClockRunning,'Replay invalidates SA');
   await p.locator('#mount').click();
  }
  await p.waitForFunction(()=>window.p056Contexts.every(c=>c.state==='closed'));
  rows.push({action,actualSaBytes:109536,allOwnedContextsClosed:true,lateCallbackDidNotPlay:true});await p.unroute('**/audio/sa');
 }
 return {pass:true,kind:'p056-real-SA-pending-lifecycle-v1',rows,originalRuntime:false,listeningAccepted:false};
 }finally{await context.close();}
}
