async page => {
 const rows=[],errors=[],requests=[];const check=(ok,msg)=>{if(!ok)throw Error(msg);};
 page.on('pageerror',e=>errors.push(String(e)));page.on('request',r=>{if(r.url().includes('/audio/'))requests.push(r.url().split('/audio/')[1]);});
 await page.addInitScript(()=>{window.p056Contexts=[];const Base=window.AudioContext;window.AudioContext=class extends Base{constructor(...a){super(...a);window.p056Contexts.push(this);}};});
 await page.goto('http://127.0.0.1:4356/player.html');await page.waitForSelector('[data-p056-ready=true]',{timeout:20000});
 const snap=()=>page.evaluate(()=>window.p056Runtime.snapshot());
 const frame=n=>page.waitForFunction(n=>window.p056Snapshot?.state.mainFrame===n,n,{timeout:35000});
 const phase=n=>page.waitForFunction(n=>window.p056Snapshot?.state.phase===n,n,{timeout:10000});
 check((await snap()).state.mainFrame===1,'initial frame1');await page.locator('[data-p056-play]').click();
 for(const [i,target]of [273,441,590,748].entries()){
  await frame(target);let s=await snap();check(s.state.phase==='step-held','step hold');check(!s.visualClockRunning,'step clock stopped');
  await page.locator('[data-p056-play]').click();check((await snap()).state.mainFrame===target,'Play cannot bypass hold');
  if(i>=2){
   const cursor=s.audio.streams.main.decodedSample;await page.locator(`[data-p056-step="${i+1}"]`).click();
   await page.waitForFunction(()=>window.p056Snapshot?.state.stepBox?.frame===15,null,{timeout:5000});s=await snap();
   check(s.state.mainFrame===target,'box does not advance main');check(s.audio.streams.main.decodedSample===cursor,'box is silent; main sample held');
   check(!s.visualClockRunning,'box15 authored hold');
   await page.screenshot({path:`/Volumes/American Dream/hudongpin/g678-p056-native-browser-20261003-v1/player-step${i+1}-v1.png`,fullPage:true});
   if(i===3){await page.locator('[data-p056-glossary=Table]').click();check(await page.getByRole('dialog').count()===1,'box glossary');await page.locator('#glossary-close').click();check(await page.locator('[data-p056-glossary=Table]').evaluate(e=>e===document.activeElement),'box glossary focus returns');}
   await page.locator('[data-p056-close-box]').focus();await page.keyboard.press('Enter');
   await page.waitForFunction(()=>window.p056Snapshot?.state.stepBox?.frame===1&&window.p056Snapshot.state.stepBox.sourceStopped,null,{timeout:5000});
   check((await snap()).state.mainFrame===target,'Close keeps parent held');check(await page.locator(`[data-p056-step="${i+1}"]`).evaluate(e=>e===document.activeElement),'box focus return');
   await page.locator('[data-p056-continue]').click();
  }else await page.locator(`[data-p056-step="${i+1}"]`).click();
  rows.push({step:i+1,sourceHold:target,box:i>=2?'opened-closed-held-continued':null});
 }
 await frame(801);check((await snap()).state.quizButtonsEnabled,'final answers enabled');
 await page.locator('[data-p056-help]').click();check((await snap()).state.helpVisible,'function popup open');
 check(await page.locator('[data-p056-help-panel]').innerText().then(t=>t.includes('y = 4(3) – 7')&&!t.includes('angle')),'function help equations');
 for(const key of ['Function','Relation','Value','Evaluate','Substitute','Equation','Solve']){
  await page.locator(`[data-p056-glossary=${key}]`).click();check(await page.getByRole('dialog').count()===1,'dictionary '+key);await page.locator('#glossary-close').click();
  check(await page.locator(`[data-p056-glossary=${key}]`).evaluate(e=>e===document.activeElement),'dictionary focus '+key);
 }
 await page.screenshot({path:'/Volumes/American Dream/hudongpin/g678-p056-native-browser-20261003-v1/player-help-v1.png',fullPage:true});
 await page.locator('[data-p056-close-help]').click();check(await page.locator('[data-p056-help]').evaluate(e=>e===document.activeElement),'help focus return');rows.push({help:'function',glossary:7});
 for(let attempt=1;attempt<=2;attempt++){
  await page.locator('[data-p056-choice=A]').click();await page.waitForFunction(()=>window.p056Snapshot?.audio.selected?.phase==='playing');
  let s=await snap();const id=s.state.feedback.spriteId;check(s.state.quizTryCount===attempt-1,'counter unchanged on click');
  if(attempt===1){await phase('quiz-held');s=await snap();check(s.state.quizTryCount===1,'first wrong terminal retry');}
  else{await page.waitForFunction(()=>window.p056Snapshot?.state.mainFrame>=802,null,{timeout:10000});s=await snap();check(s.state.quizTryCount===0,'second wrong resets');}
  rows.push({attempt,spriteId:id,result:s.state.phase,mainFrame:s.state.mainFrame});
 }
 await phase('engineering-end-held');check((await snap()).state.mainFrame===818,'engineering terminal');check(!(await snap()).lessonCompleted,'no completion claim');
 check(!requests.includes('sa'),'Spanish Audio stays explicit');check(!requests.includes('223'),'inactive clip audio never requested');
 await page.locator('[data-p056-replay]').click();check((await snap()).state.mainFrame===1,'Replay1');await page.locator('#mount').click();
 await page.waitForFunction(()=>window.p056Contexts.every(c=>c.state==='closed'));check(errors.length===0,'errors '+errors.join(','));
 return {pass:true,kind:'p056-real-player-walkthrough-v1',rows,requests,errors,contexts:await page.evaluate(()=>window.p056Contexts.map(c=>({rate:c.sampleRate,state:c.state}))),originalRuntime:false,listeningAccepted:false};
}
