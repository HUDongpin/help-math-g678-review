async page => {
  await page.addInitScript(() => {
    const Native = window.AudioContext; window.p050Contexts = [];
    window.AudioContext = class extends Native {constructor(...args) {super(...args); window.p050Contexts.push(this);}};
  });
  const errors = []; page.on('pageerror', e => errors.push(String(e)));
  await page.goto('http://127.0.0.1:4350/player.html');
  await page.setViewportSize({width: 1100, height: 900});
  await page.waitForFunction(() => window.p050Snapshot?.ready);
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await page.waitForFunction(() => window.p050Snapshot.state.mainFrame >= 2);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  const prelude = await page.evaluate(() => window.p050Snapshot);
  if (!prelude.state.paused || prelude.state.mainFrame >= 4 || prelude.audio.streams.main.decodedSample !== 0)
    throw Error('main pre-onset hold failed');
  await page.locator('[data-p050-start]').focus(); await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.p050Snapshot.state.phase === 'question');
  await page.locator('[data-p050-directions-open]').click();
  if (await page.locator('[data-source-choice]:enabled').count()) throw Error('directions did not disable choices');
  const directions = await page.evaluate(() => ({snapshot: window.p050Snapshot,
    focused: document.activeElement?.hasAttribute('data-p050-directions-close')}));
  if (!directions.focused || directions.snapshot.audio.owner !== null) throw Error('directions focus/audio');
  await page.locator('[data-p050-native-v1]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-directions-v1.png'});
  await page.locator('[data-p050-directions-close]').click();
  const focusReturn = await page.evaluate(() => document.activeElement?.hasAttribute('data-p050-directions-open'));
  if (!focusReturn) throw Error('directions focus return');
  const answers = ['D','A','B','D','C','A','B','C','D','B'], rows = [], captures = new Set();
  for (let ordinal = 1; ordinal <= 10; ordinal++) {
    const state = await page.evaluate(() => window.p050Snapshot.state);
    if (state.phase !== 'question' || state.drawCount !== ordinal) throw Error('question transition');
    if (ordinal === 1) await page.locator('[data-p050-native-v1]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-first-question-v1.png'});
    await page.locator('[data-source-choice="'+answers[state.questionId-1]+'"]').focus(); await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.p050Snapshot.state.phase === 'correct-feedback' && window.p050Snapshot.visualClockRunning);
    if (ordinal === 10) await page.waitForFunction(() => (window.p050Snapshot.state.scoreAnimation?.frame ?? 0) >= 11);
    const after = await page.evaluate(() => window.p050Snapshot);
    if (after.state.score !== ordinal*10 || after.state.responses.length !== ordinal) throw Error('score/response drift');
    if (Object.values(after.audio.streams).filter(s => s.phase === 'playing').length !== 1) throw Error('overlapping source audio');
    if (!captures.has(after.state.feedback.spriteId)) {
      captures.add(after.state.feedback.spriteId);
      await page.locator('[data-p050-player] canvas').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-correct-'+after.state.feedback.spriteId+'-v1.png'});
    }
    rows.push({ordinal, question: state.questionId, feedback: after.state.feedback, score: after.state.score,
      scoreFrame: after.state.scoreAnimation?.frame ?? 1, audio: after.audio});
    await page.waitForFunction(n => window.p050Snapshot.state.drawCount === n+1 &&
      ['question','final'].includes(window.p050Snapshot.state.phase), ordinal, {timeout: 6000});
  }
  const final = await page.evaluate(() => window.p050Snapshot);
  if (final.state.score !== 100 || final.state.phase !== 'final' || final.audio.owner !== null || final.lessonCompleted)
    throw Error('Final state');
  await page.getByRole('button', {name:'EN / ES',exact:true}).click();
  await page.locator('[data-p050-player]').screenshot({path:'/Volumes/American Dream/hudongpin/g678-p050-native-browser-20261003-v1/player-final-es-v1.png'});
  await page.locator('[data-p050-start]').click();
  await page.waitForFunction(() => window.p050Snapshot.state.drawCount === 12);
  if ((await page.evaluate(() => window.p050Snapshot.state)).score !== 100) throw Error('Final Start silently reset');
  await page.locator('#mount').click();
  await page.waitForFunction(() => window.p050Contexts.length === 5 && window.p050Contexts.every(c => c.state === 'closed'));
  const cleanup = await page.evaluate(() => ({contexts:window.p050Contexts.map(c=>c.state),
    cleanupCalls:window.p050Cleanup,players:document.querySelectorAll('[data-p050-player]').length}));
  if (errors.length || await page.getByRole('alert').count()) throw Error(JSON.stringify(errors));
  return {kind:'p050-real-browser-correct-v1',pass:true,summary:'ten distinct questions, all correct, score100, three feedback streams, Final and cleanup',
    prelude,directions,focusReturn,rows,final,cleanup,errors,technicalPlayback:true,myLessonIntegration:false,
    originalRuntimeAccepted:false,listeningAccepted:false,registered:false};
}
