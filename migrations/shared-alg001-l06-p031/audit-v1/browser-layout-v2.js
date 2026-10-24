async (page) => {
  const rows = [], errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('http://127.0.0.1:4351/player.html');
  await page.waitForSelector('[data-p031-ready=true]');
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.evaluate(() => {document.documentElement.style.fontSize = '20px';});
  for (const [frame, count, formula] of [[102, 0, null], [103, 1, null], [245, 2, null], [246, 3, null],
    [294, 4, 'V ='], [320, 5, 'V = 0.5F'], [361, 6, 'V = 0.5F'], [421, 7, 'V = 0.5F']]) {
    await page.evaluate(f => window.p031Runtime.inspectFrame(f), frame);
    await page.waitForFunction(f => document.querySelector('[data-p031-player]').getAttribute('data-p031-frame') === String(f), frame);
    if (await page.locator('[data-p031-native] > p [data-source-text-id]').count() !== count) throw Error('source reveal ' + frame);
    if (formula && (await page.locator('[data-source-text-group="14,15"]').innerText()).trim() !== formula) throw Error('inline source equation ' + frame);
    rows.push({frame, sourceTextCount: count, formula});
  }
  for (const language of ['en', 'es']) {
    if (language === 'es') await page.locator('#locale').click();
    for (const width of [390, 768, 1360]) {
      await page.setViewportSize({width, height: 900});
      await page.evaluate(() => window.p031Runtime.inspectFrame(1611));
      await page.waitForFunction(() => document.querySelector('[data-p031-player]').getAttribute('data-p031-frame') === '1611');
      const metrics = await page.evaluate(() => {
        const canvas = document.querySelector('canvas'), box = canvas.getBoundingClientRect();
        const equation = document.querySelector('[data-source-text-group="14,15"]');
        return {width: innerWidth, scroll: document.documentElement.scrollWidth, canvas: [box.width, box.height],
          equation: equation.textContent, lines: equation.getBoundingClientRect().height / parseFloat(getComputedStyle(equation).lineHeight),
          buttons: [...document.querySelectorAll('[data-p031-player] button')].map(button => ({height: button.getBoundingClientRect().height, font: getComputedStyle(button).fontSize})),
          source: [canvas.width, canvas.height], snapshot: {frame: window.p031Runtime.snapshot().frame, selected: window.p031Runtime.snapshot().selected}};
      });
      if (metrics.scroll > width + 1 || Math.abs(metrics.canvas[1] - .75 * metrics.canvas[0]) > 1 ||
          metrics.equation !== 'V = 0.5F' || metrics.lines > 1.05 || metrics.buttons.some(button => button.height < 44 || button.font !== '20px')) throw Error('layout metrics ' + JSON.stringify(metrics));
      await page.screenshot({path: '/Volumes/American Dream/hudongpin/g678-p031-native-browser-20261003-v1/' + language + '-' + width + '-v2.png', fullPage: true});
      rows.push({language, ...metrics});
    }
  }
  await page.locator('#mount').click();
  await page.waitForFunction(() => window.p031Cleanup === 1 && window.p031Contexts.every(c => c.state === 'closed'));
  if (errors.length) throw Error(errors.join(';'));
  return {pass: true, kind: 'p031-native-layout-v2', rows, errors, contexts: await page.evaluate(() => window.p031Contexts.map(c => c.state)),
    actualMyLesson: false, registered: false, originalRuntimeAccepted: false};
}
