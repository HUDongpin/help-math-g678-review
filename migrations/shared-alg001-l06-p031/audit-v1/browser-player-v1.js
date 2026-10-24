async (page) => {
  const rows = [], errors = [], requests = [];
  const check = (condition, message) => {if (!condition) throw Error(message);};
  page.on('pageerror', error => errors.push(String(error)));
  page.on('request', request => {if (request.url().includes('/audio/')) requests.push(request.url().split('/audio/')[1]);});
  await page.addInitScript(() => {
    window.p031Contexts = [];
    const Original = window.AudioContext;
    window.AudioContext = class extends Original {constructor(...args) {super(...args); window.p031Contexts.push(this);}};
  });
  await page.goto('http://127.0.0.1:4351/player.html');
  await page.waitForSelector('[data-p031-ready=true]');
  const snapshot = () => page.evaluate(() => window.p031Runtime.snapshot());
  const inspect = async frame => {
    check(await page.evaluate(f => window.p031Runtime.inspectFrame(f), frame), 'inspect ' + frame);
    await page.waitForFunction(f => document.querySelector('[data-p031-player]').getAttribute('data-p031-frame') === String(f), frame);
  };
  check((await snapshot()).frame === 1 && requests.join(',') === 'main', 'initial held and no Spanish auto request');
  await page.locator('[data-p031-play]').click();
  await page.waitForFunction(() => window.p031Snapshot.frame >= 8);
  await page.locator('[data-p031-pause]').click();
  let held = (await snapshot()).frame;
  await page.waitForTimeout(250);
  check((await snapshot()).frame === held, 'main pause holds');
  rows.push({case: 'main play/pause', frame: held});
  for (const [frame, narrative, glossary, options, buttons] of [
    [102, 0, 0, 0, 0], [103, 1, 0, 0, 0], [245, 2, 0, 0, 0], [246, 3, 2, 0, 0],
    [420, 6, 2, 0, 0], [421, 7, 3, 0, 0], [513, 7, 3, 0, 0], [514, 7, 3, 5, 0],
    [1609, 7, 3, 5, 0], [1610, 7, 3, 5, 5], [1611, 7, 3, 5, 0],
  ]) {
    await inspect(frame);
    check(await page.locator('[data-p031-native] > p').count() === narrative, 'narrative ' + frame);
    check(await page.locator('[data-source-glossary-id]').count() === glossary, 'glossary ' + frame);
    check(await page.locator('[data-source-choice]').count() === options, 'options ' + frame);
    check(await page.locator('[data-source-button-id]').count() === buttons, 'buttons ' + frame);
    rows.push({case: 'source boundary', frame, narrative, glossary, options, buttons});
  }
  await inspect(421);
  for (const key of ['Function', 'Calculate', 'Domain']) {
    const trigger = page.locator('[data-source-glossary-id]').filter({hasText: key});
    await trigger.click();
    const dialog = page.getByRole('dialog');
    check((await dialog.innerText()).length > 30, 'source definition ' + key);
    check((await snapshot()).frame === 421, 'glossary holds main');
    await page.locator('#glossary-close').click();
    check(await trigger.evaluate(element => document.activeElement === element), 'glossary focus return');
    rows.push({case: 'EN glossary and focus', key});
  }
  await inspect(1610);
  await page.locator('[data-source-button-id="87"]').click();
  let answer = JSON.parse(await page.locator('#unresolved-answer').innerText());
  check(answer.choice === 'A' && answer.status === 'unresolved-host-request' && answer.selectedFeedback === null, 'unresolved A preserved');
  await page.locator('[data-source-button-id="86"]').click();
  answer = JSON.parse(await page.locator('#unresolved-answer').innerText());
  check(answer.choice === 'B' && answer.globals.quizTryCount === 1 && answer.calls[1] === 'showWrongFeed', 'wrong request source globals');
  await page.locator('[data-p031-replay]').click();
  check((await snapshot()).frame === 1 && (await snapshot()).globals.quizTryCount === 0, 'Replay resets globals/frame');
  rows.push({case: 'terminal source requests remain unresolved, Replay clears page globals'});
  await inspect(1609);
  await page.locator('[data-p031-play]').click();
  await page.waitForFunction(() => window.p031Snapshot.main.phase === 'timeline-ended');
  check((await snapshot()).frame === 1611 && await page.locator('[data-source-button-id]').count() === 0, 'no invented stop at1610');
  await inspect(421);
  await page.locator('[data-p031-spanish]').click();
  await page.waitForFunction(() => window.p031Snapshot.spanish.phase === 'playing');
  check((await snapshot()).frame === 421, 'Spanish holds visual main');
  await page.locator('[data-p031-pause]').click();
  let spanish = (await snapshot()).spanish.decodedSample;
  await page.waitForTimeout(180);
  check((await snapshot()).spanish.decodedSample === spanish, 'Spanish pause');
  await page.locator('[data-p031-play]').click();
  await page.waitForFunction(() => window.p031Snapshot.spanish.phase === 'buffer-ended', {timeout: 30000});
  check((await snapshot()).selected === 'main' && (await snapshot()).frame === 421, 'Spanish EOF returns held main');
  await page.locator('[data-p031-play]').click();
  await page.waitForFunction(() => window.p031Snapshot.frame > 421);
  await page.locator('[data-p031-replay]').click();
  check((await snapshot()).frame === 1, 'Replay after Spanish EOF');
  rows.push({case: 'explicit Spanish, pause/resume, native EOF and main continuation', spanishRequests: requests.filter(x => x === 'sa').length});
  await page.locator('#locale').click();
  check((await snapshot()).frame === 1 && (await snapshot()).main.phase === 'ready', 'ES locale does not autoplay');
  await inspect(421);
  for (const label of ['Función', 'Calcular', 'Dominio']) {
    const key = {Función: 'Function', Calcular: 'Calculate', Dominio: 'Domain'}[label];
    await page.locator('[data-source-glossary-id]').filter({hasText: key}).click();
    check(await page.getByRole('dialog', {name: label}).count() === 1, 'ES glossary ' + label);
    await page.locator('#glossary-close').click();
  }
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.evaluate(() => {document.documentElement.style.fontSize = '20px';});
  for (const width of [390, 768, 1360]) {
    await page.setViewportSize({width, height: 900});
    await inspect(1611);
    const metrics = await page.evaluate(() => {
      const canvas = document.querySelector('canvas'), box = canvas.getBoundingClientRect();
      return {width: innerWidth, scroll: document.documentElement.scrollWidth, canvas: [box.width, box.height],
        source: [canvas.width, canvas.height], native: document.querySelector('[data-p031-native]').getBoundingClientRect().width};
    });
    check(metrics.scroll <= width + 1 && Math.abs(metrics.canvas[1] - metrics.canvas[0] * .75) < 1, 'responsive picture ratio');
    check(metrics.source.join(',') === '800,600' && metrics.native <= width + 1, 'source and native width');
    await page.screenshot({path: '/Volumes/American Dream/hudongpin/g678-p031-native-browser-20261003-v1/es-' + width + '-v1.png', fullPage: true});
    rows.push({case: 'ES responsive reduced motion 20px', ...metrics});
  }
  await page.locator('#mount').click();
  await page.waitForFunction(() => window.p031Cleanup === 1 && window.p031Contexts.every(c => c.state === 'closed'));
  check(errors.length === 0, 'no browser page errors: ' + errors.join(';'));
  check(requests.every(id => ['main', 'sa'].includes(id)), 'no unresolved feedback audio requested');
  return {pass: true, kind: 'p031-unregistered-fixture-browser-v1', rows, requests,
    contexts: await page.evaluate(() => window.p031Contexts.map(c => c.state)), errors,
    actualMyLesson: false, registered: false, hostFeedbackResolved: false, listeningAccepted: false};
}
