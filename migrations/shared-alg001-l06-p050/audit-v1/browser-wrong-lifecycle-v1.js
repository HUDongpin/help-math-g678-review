async page => {
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(String(e)));
  page.on('request',r=>{if(r.url().includes('/audio/'))requests.push(r.url());});
  await page.goto('http://127.0.0.1:4350/player.html');
  await page.setViewportSize({width:390,height:844});
  await page.evaluate(()=>document.documentElement.style.fontSize='20px');
  await page.waitForFunction(()=>window.p050Snapshot?.ready);
  await page.getByRole('button',{name:'EN / ES',exact:true}).click();
  if(requests.some(u=>u.endsWith('/sa')))throw Error('Spanish locale loaded SA without an action');
  await page.locator('[data-p050-skip]').click();
  if((await page.evaluate(()=>window.p050Snapshot.state)).phase!=='begin')throw Error('Skip drew a question');
  await page.locator('[data-p050-start]').click();
  await page.waitForFunction(()=>window.p050Snapshot.state.phase==='question');
  const before=await page.evaluate(()=>window.p050Snapshot.state);
  await page.locator('[data-p050-native-v1]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-mobile-20px-v1.png'});
  const layout=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,
    labels:[...document.querySelectorAll('[data-p050-graph] span')].map(e=>({font:getComputedStyle(e).fontSize,
      within:e.getBoundingClientRect().left>=e.parentElement.getBoundingClientRect().left-1&&e.getBoundingClientRect().right<=e.parentElement.getBoundingClientRect().right+1}))}));
  if(layout.scrollWidth>layout.width||layout.labels.some(x=>parseFloat(x.font)<20||!x.within))throw Error('mobile native graph layout');
  const answers=['D','A','B','D','C','A','B','C','D','B'];
  const wrong=answers[before.questionId-1]==='A'?'B':'A';
  await page.locator('[data-source-choice="'+wrong+'"]').focus();await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.p050Snapshot.state.phase==='wrong-held',{}, {timeout:6000});
  const held=await page.evaluate(()=>({snapshot:window.p050Snapshot,
    focused:document.activeElement?.hasAttribute('data-p050-wrong-close')}));
  if(!held.focused||held.snapshot.state.feedback.frame!==23||held.snapshot.state.score!==0||held.snapshot.audio.owner!==null)throw Error('wrong hold/focus');
  await page.locator('[data-p050-player] canvas').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-wrong-canvas-v1.png'});
  await page.locator('[data-p050-wrong-popup]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-wrong-native-v1.png'});
  await page.keyboard.press('Enter');
  await page.waitForFunction(()=>window.p050Snapshot.state.drawCount===2);
  const afterWrong=await page.evaluate(()=>window.p050Snapshot);
  if(afterWrong.state.questionId===before.questionId||afterWrong.state.score!==0)throw Error('wrong response retried or deducted');
  const second=afterWrong.state.questionId;
  await page.locator('[data-source-choice="'+answers[second-1]+'"]').click();
  await page.waitForFunction(()=>window.p050Snapshot.state.phase==='correct-feedback'&&window.p050Snapshot.visualClockRunning);
  await page.getByRole('button',{name:'Audio en español',exact:true}).click();
  await page.waitForFunction(()=>window.p050Snapshot.audio.owner==='sa'&&!window.p050Snapshot.spanishLoading);
  const spanish=await page.evaluate(()=>window.p050Snapshot);
  if(!spanish.state.paused||spanish.state.phase!=='correct-feedback'||spanish.visualClockRunning)throw Error('SA source hold');
  if(Object.values(spanish.audio.streams).filter(s=>s.phase==='playing').length!==1)throw Error('SA audio overlap');
  await page.getByRole('button',{name:'Volver a la animación',exact:true}).click();
  const returned=await page.evaluate(()=>window.p050Snapshot);
  await page.waitForTimeout(250);
  const later=await page.evaluate(()=>window.p050Snapshot);
  if(JSON.stringify(returned.state)!==JSON.stringify(later.state)||later.visualClockRunning||later.audio.owner!==null)throw Error('SA return auto-resumed');
  await page.getByRole('button',{name:'Repetir',exact:true}).click();
  const replay=await page.evaluate(()=>window.p050Snapshot);
  if(replay.state.score!==0||replay.state.mainFrame!==1||replay.state.responses.length||replay.visualClockRunning)throw Error('Replay incomplete');
  await page.setViewportSize({width:1100,height:900});
  await page.evaluate(()=>document.documentElement.style.fontSize='16px');
  await page.locator('[data-p050-start]').click();
  await page.waitForFunction(()=>window.p050Snapshot.state.phase==='question');
  await page.locator('[data-p050-native-v1]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-question-two-columns-v1.png'});
  await page.getByRole('button',{name:'Audio en español',exact:true}).click();
  await page.waitForFunction(()=>window.p050Snapshot.audio.owner==='sa'&&!window.p050Snapshot.spanishLoading);
  await page.locator('#mount').click();
  await page.waitForFunction(()=>window.p050Contexts.length===6&&window.p050Contexts.every(c=>c.state==='closed'));
  const cleanup=await page.evaluate(()=>({contexts:window.p050Contexts.map(c=>c.state),cleanupCalls:window.p050Cleanup,
    players:document.querySelectorAll('[data-p050-player]').length}));
  if(errors.length||await page.getByRole('alert').count())throw Error(JSON.stringify(errors));
  return {kind:'p050-wrong-spanish-lifecycle-browser-v1',pass:true,
    summary:'ES locale silent; mobile20px; keyboard wrong Close; explicit SA; held return; Replay; six contexts closed',
    before,layout,held,afterWrong,spanish,returned,replay,cleanup,requests,errors,
    myLessonIntegration:false,originalRuntimeAccepted:false,listeningAccepted:false,registered:false};
}
