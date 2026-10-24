async (page) => {
  const rows = [], errors = [];
  page.on('pageerror', e => errors.push(String(e)));
  for (const action of ['replay', 'leave']) {
    await page.goto('http://127.0.0.1:4351/player.html');
    await page.waitForSelector('[data-p031-ready=true]');
    let release, arrived = false, finished = false;
    const gate = new Promise(resolve => {release = resolve;});
    await page.route('**/audio/sa', async route => {
      const real = await route.fetch();
      if (real.status() !== 200) throw Error('source Spanish body unavailable');
      const body = await real.body();
      if (body.length !== 299040) throw Error('Spanish response size');
      arrived = true;
      await gate;
      try {await route.fulfill({response: real, body});} catch { /* Client deliberately aborted. */ }
      finished = true;
    });
    await page.locator('[data-p031-spanish]').click();
    for (let i = 0; i < 100 && !arrived; i++) await page.waitForTimeout(25);
    if (!arrived || !await page.evaluate(() => window.p031Runtime.snapshot().spanishLoading)) throw Error('real pending source fetch not reached');
    if (action === 'replay') await page.locator('[data-p031-replay]').click();
    else await page.locator('#mount').click();
    release();
    for (let i = 0; i < 100 && !finished; i++) await page.waitForTimeout(25);
    if (!finished) throw Error('intercepted response not released');
    await page.waitForTimeout(250);
    if (action === 'replay') {
      const s = await page.evaluate(() => window.p031Runtime.snapshot());
      if (s.frame !== 1 || s.selected !== 'main' || s.spanishLoading || s.spanish.phase === 'playing') throw Error('stale Spanish started after Replay');
      await page.locator('[data-p031-play]').click();
      await page.waitForFunction(() => window.p031Snapshot.frame >= 3);
      await page.locator('#mount').click();
    }
    await page.waitForFunction(() => window.p031Cleanup === 1 && window.p031Contexts.every(c => c.state === 'closed'));
    const contexts = await page.evaluate(() => window.p031Contexts.map(c => c.state));
    rows.push({action, realSourceBytes: 299040, contexts, stalePlayback: false});
    await page.unroute('**/audio/sa');
  }
  if (errors.length) throw Error(errors.join(';'));
  return {pass: true, kind: 'p031-pending-spanish-lifecycle-v1', rows, errors, actualMyLesson: false, registered: false};
}
