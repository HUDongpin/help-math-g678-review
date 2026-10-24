async page => {
 const rows=[],errors=[],requests=[];const check=(ok,message)=>{if(!ok)throw Error(message);};
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(r.url().includes('/audio/'))requests.push(r.url().split('/audio/')[1]);});
 await page.addInitScript(()=>{window.p033Contexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...a){super(...a);window.p033Contexts.push(this);}};});
 await page.goto('http://127.0.0.1:4353/player.html');
 const snap=()=>page.evaluate(()=>window.p033Runtime.snapshot());
 const waitPhase=phase=>page.waitForFunction(p=>window.p033Snapshot?.state.phase===p,phase,{timeout:15000});
 for(const kind of ['wrong','right'])for(let seed=0;seed<(kind==='wrong'?3:4);seed++){
  if(await page.locator('#seed').inputValue()!==String(seed))await page.locator('#seed').selectOption(String(seed));
  else await page.locator('[data-p033-replay]').click();
  await page.waitForSelector('[data-p033-ready=true]');
  check((await snap()).state.mainFrame===1,'starts held at1');
  await page.locator('[data-p033-play]').click();await waitPhase('quiz-held');
  check((await snap()).state.mainFrame===52,'authored stop52');
  await page.locator('[data-p033-play]').click();check((await snap()).state.mainFrame===52,'play cannot cross source stop');
  await page.locator(`[data-source-choice=${kind==='wrong'?'B':'A'}] button`).click();
  await page.waitForFunction(()=>window.p033Snapshot?.audio.selected?.phase==='playing');
  let s=await snap(),id=s.state.feedback.spriteId;
  check(id===(kind==='wrong'?[147,161,175]:[78,119,46,111])[seed],'selected source branch');
  if(kind==='wrong'){
   await waitPhase('wrong-feedback-held');s=await snap();
   check(s.state.feedback.frame===[22,23,20][seed],'correct wrong hold');
   check(s.state.wrongFeedText.endsWith('Try again.'),'first-wrong text');
   await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p033-native-browser-20261003-v1/wrong-${id}-held-v1.png`,fullPage:true});
   await page.locator('[data-p033-close]').click();await waitPhase('quiz-held');
   s=await snap();check(s.state.mainFrame===52&&s.state.quizTryCount===1,'first wrong retry');
  }else{
   await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p033-native-browser-20261003-v1/right-${id}-playing-v1.png`,fullPage:true});
   await page.waitForFunction(()=>window.p033Snapshot?.state.mainFrame>=53,null,{timeout:10000});
   await page.locator('[data-p033-pause]').click();s=await snap();check(s.state.feedback===null&&s.state.mainFrame>=53,'right resumes parent');
  }
  rows.push({kind,seed,spriteId:id,result:s.state.phase,mainFrame:s.state.mainFrame,tryCount:s.state.quizTryCount});
 }
 check(!requests.includes('sa'),'no locale or feedback-triggered SA');
 await page.locator('#mount').click();await page.waitForFunction(()=>window.p033Contexts.every(c=>c.state==='closed'));
 check(errors.length===0,'browser errors '+errors.join(','));
 return {pass:true,kind:'p033-real-player-seven-feedback-branches-v1',rows,requests,errors,contexts:await page.evaluate(()=>window.p033Contexts.map(c=>({rate:c.sampleRate,state:c.state}))),originalRuntime:false,listeningAccepted:false};
}
