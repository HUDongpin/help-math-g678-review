async page => {
 const rows=[],errors=[],requests=[],contexts=[];const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(r.url().includes('/audio/'))requests.push(r.url().split('/audio/')[1]);});
 await page.addInitScript(()=>{window.p057Contexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...a){super(...a);window.p057Contexts.push(this);}};});
 for(let seed=0;seed<4;seed++){
  await page.goto('http://127.0.0.1:4357/player.html');if(seed)await page.locator('#seed').selectOption(String(seed));
  await page.waitForSelector('[data-p057-ready=true]',{timeout:20000});await page.locator('[data-p057-play]').click();
  for(const [i,target]of [313,481,629,788].entries()){
   await page.waitForFunction(n=>window.p057Snapshot?.state.mainFrame===n,target,{timeout:35000});
   await page.locator(i<2?`[data-p057-step="${i+1}"]`:'[data-p057-continue]').click();
  }
  await page.waitForFunction(()=>window.p057Snapshot?.state.phase==='quiz-held',null,{timeout:15000});
  for(const kind of ['wrong','right']){
   await page.locator(`[data-p057-choice=${kind==='wrong'?'B':'D'}]`).click();
   await page.waitForFunction(()=>window.p057Snapshot?.audio.selected?.phase==='playing',null,{timeout:5000});
   let s=await page.evaluate(()=>window.p057Runtime.snapshot()),id=s.state.feedback.spriteId;
   check(id===(kind==='wrong'?[157,117,129,157]:[93,52,105,77])[seed],'source branch selection');
   if(id===129||id===52)await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p057-native-browser-20261003-v1/feedback-${id}-v1.png`,fullPage:false});
   if(kind==='wrong')await page.waitForFunction(()=>window.p057Snapshot?.state.phase==='quiz-held',null,{timeout:7000});
   else await page.waitForFunction(()=>window.p057Snapshot?.state.mainFrame>=840,null,{timeout:7000});
   s=await page.evaluate(()=>window.p057Runtime.snapshot());check(s.state.quizTryCount===1,'wrong once then right preserves count');
   rows.push({seed,kind,spriteId:id,phase:s.state.phase,mainFrame:s.state.mainFrame,tryCount:s.state.quizTryCount});
  }
  await page.locator('#mount').click();await page.waitForFunction(()=>window.p057Contexts.every(c=>c.state==='closed'));
  contexts.push(await page.evaluate(()=>window.p057Contexts.map(c=>({rate:c.sampleRate,state:c.state}))));
 }
 check(!requests.includes('sa')&&!requests.includes('233'),'only active embedded streams');check(errors.length===0,'errors '+errors.join(','));
 check(new Set(rows.map(r=>r.spriteId)).size===7,'all seven distinct feedback branches');
 return {pass:true,kind:'p057-real-player-seven-feedback-branches-v1',rows,requests,errors,contexts,originalRuntime:false,listeningAccepted:false};
}
