#!/usr/bin/env node
/** Real Chrome P057-host continuity for the P056/P055/P052 predecessor resources. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
import {P052_AUDIO_PLANS} from '../packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'http://127.0.0.1:3331';
const OUTPUT = path.join(ROOT, 'output/nms-l02-p057-product-20260927/continuity/browser');
const P057 = 'shared-nms002-l02-p057';
const P056 = 'shared-nms002-l02-p056';
const P055 = 'shared-nms002-l02-p055';
const P052 = 'shared-nms002-l02-p052';
const HOST = '[data-lesson-player][data-current-animation-id]';
const P057_RUNTIME = `[data-pair-page="${P057}"]`;
const P056_RUNTIME = `[data-pair-page="${P056}"]`;
const P055_RUNTIME = `[data-pair-page="${P055}"]`;
const P052_RUNTIME = `[data-source-percent-practice-runtime="${P052}"]`;
const PREFIX = '/migration-assets/nms-l02-p056-predecessors/';
const P057_AUDIO_PATH = '/migration-assets/nms-l02-p057/main.mp3';
const P056_AUDIO_PATH = '/migration-assets/nms-l02-p056/main.mp3';
const MAIN_PINS = Object.freeze({
  [P057_AUDIO_PATH]: {bytes: 134290,
    sha256: 'c87ebf7d1117a616ebddd6b3530a7b19c50dfd885bc5e2734817657da026c2dc', contentType: 'audio/mpeg'},
  [P056_AUDIO_PATH]: {bytes: 95290,
    sha256: '6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811', contentType: 'audio/mpeg'},
});
const P056_TERMS = Object.freeze([
  {entry: 'organize', id: 'sprite-24/depth-16/generation-1', key: 'Organize', label: 'Organize'},
  {entry: 'information', id: 'sprite-24/depth-18/generation-1', key: 'Information', label: 'information'},
]);
const P055_PINS = Object.freeze({
  'p055-typography.js': {bytes: 930320,
    sha256: '47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d', contentType: 'text/javascript; charset=utf-8'},
  'p055-main.mp3': {bytes: 143780,
    sha256: 'ca2a80e75f1fc25d4ff0696af4cc1ccfcec87a1518bbc88eda998b855865a20b', contentType: 'audio/mpeg'},
});
const INPUTS = Object.freeze([
  'scripts/probe-nms-l02-p057-predecessors-v1.mjs',
  'apps/web/lib/nms-l02-p057-admission-activation.ts',
  'apps/web/lib/nms-l02-p057-admission.server.ts',
  'apps/web/lib/nms-l02-p057-descriptor-extension.ts',
  'apps/web/lib/nms-l02-p057-candidate-descriptor-v1.ts',
  'catalog/nms-l02-admission-v1/host-v7.json',
  'work/g678-workflow/candidates/shared-nms002-l02-p057-v1.json',
  'apps/web/components/g678-nms-l02-p057-candidate-lesson-v1.generated.tsx',
  'apps/web/components/nms-l02-p057-lesson-runtime-v1.tsx',
  'apps/web/lib/nms-l02-p057-assets.server.ts',
  'apps/web/app/migration-assets/nms-l02-p057/[asset]/route.ts',
  'apps/web/components/nms-l02-p057-host-v1.css',
  'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p057/page.tsx',
  'packages/demos/src/generated/nms-l02-p057-terms-v1.ts',
  'output/nms-l02-p057-audio-20260927/embedded-source-stream-v1.mp3',
  'output/nms-l02-p057-source-20260927/source-audit.json',
  'apps/web/lib/nms-l02-p056-admission-activation.ts',
  'apps/web/lib/nms-l02-p056-admission.server.ts',
  'apps/web/lib/nms-l02-p056-descriptor-extension.ts',
  'work/g678-workflow/candidates/shared-nms002-l02-p056-v1.json',
  'apps/web/components/nms-l02-p056-lesson-runtime-v1.tsx',
  'apps/web/lib/nms-l02-p056-assets.server.ts',
  'apps/web/app/migration-assets/nms-l02-p056/[asset]/route.ts',
  'packages/demos/src/nms-l02-p056-product-controls-v1.ts',
  'packages/demos/src/modules/shared-nms002-l02-p056.tsx',
  'migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3',
  'apps/web/lib/nms-l02-source-resource-host.ts',
  'apps/web/lib/g678-preview-policy.ts',
  'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'packages/demos/src/source-linear-audio.ts',
  'apps/web/components/nms-l02-p055-for-p056-runtime-v1.generated.tsx',
  'packages/demos/src/nms-l02-p055-for-p056-assets-v1.generated.ts',
  'packages/demos/src/nms-l02-p055-for-p056-renderer-v1.generated.tsx',
  'packages/demos/src/nms-l02-p055-for-p056-module-v1.generated.tsx',
  'apps/web/components/nms-l02-p052-source-runtime-p056-v1.tsx',
  'packages/demos/src/nms-l02-p052-player-p056-v1.tsx',
  'packages/demos/src/nms-l02-p052-browser-controller-p056-v1.ts',
  'packages/demos/src/nms-l02-p052-audio-loader-p056-v1.ts',
  'apps/web/lib/nms-l02-p056-predecessor-assets.server.ts',
  'apps/web/lib/nms-l02-p052-source-bytes.ts',
  'apps/web/app/migration-assets/nms-l02-p056-predecessors/[asset]/route.ts',
  'apps/web/lib/nms-l02-ts-pilot-assets.server.ts',
  'packages/demos/src/generated/nms-l02-p052-runtime-audio-v1.ts',
]);
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => JSON.stringify(value, null, 2) + '\n';
async function bounded(operation, label, ms = 6000) {
  let timer;
  try {return await Promise.race([operation, new Promise((_, reject) => {
    timer = setTimeout(() => reject(Error(`Probe timeout: ${label}`)), ms);
  })]);} finally {clearTimeout(timer);}
}
const assetPath = url => {
  const pathname = new URL(url).pathname;
  return pathname.startsWith(PREFIX) || pathname === P057_AUDIO_PATH || pathname === P056_AUDIO_PATH;
};

async function pins() {
  return Promise.all(INPUTS.map(async relative => {
    const bytes = await readFile(path.join(ROOT, relative));
    return {path: relative, bytes: bytes.length, sha256: sha256(bytes)};
  }));
}
function expected(name) {
  if (Object.hasOwn(P055_PINS, name)) return P055_PINS[name];
  const match = name.match(/^p052-(sprite-(?:8|318|327|347|349|350))\.mp3$/u);
  if (!match || !Object.hasOwn(P052_AUDIO_PLANS, match[1])) throw Error(`Unlisted asset ${name}`);
  const plan = P052_AUDIO_PLANS[match[1]];
  return {bytes: plan.inputBytes, sha256: plan.inputSha256, contentType: 'audio/mpeg'};
}
async function verifyResponse(response) {
  const url = new URL(response.url());
  const name = url.pathname === P057_AUDIO_PATH ? 'p057-main.mp3' :
    url.pathname === P056_AUDIO_PATH ? 'p056-main.mp3' : url.pathname.slice(PREFIX.length);
  const pin = MAIN_PINS[url.pathname] ?? expected(name);
  assert.equal(url.origin, ORIGIN);
  assert.equal(url.search, `?sha256=${pin.sha256}`);
  assert.equal(response.status(), 200, `${name} status`);
  assert.equal(response.headers()['content-type'], pin.contentType);
  assert.equal(Number(response.headers()['content-length']), pin.bytes);
  const body = await response.body();
  assert.equal(body.length, pin.bytes);
  assert.equal(sha256(body), pin.sha256);
  return {name, path: url.pathname, status: response.status(), bytes: body.length, sha256: pin.sha256};
}
function traceInit() {
  const trace = {active: 0, maxActive: 0, byPage: {}, events: []};
  Object.defineProperty(window, '__P057_PREDECESSOR_AUDIO_TRACE', {value: trace});
  const proto = AudioBufferSourceNode.prototype, start = proto.start, stop = proto.stop;
  const ownership = new WeakMap();
  const page = () => document.querySelector('[data-lesson-player][data-current-animation-id]')?.getAttribute('data-current-animation-id') ?? 'unknown';
  const bucket = id => trace.byPage[id] ??= {active: 0, started: 0, stopped: 0};
  const finish = node => {
    const id = ownership.get(node); if (!id) return;
    ownership.delete(node); trace.active--; trace.byPage[id].active--; trace.byPage[id].stopped++;
    trace.events.push({kind: 'stop', page: id});
  };
  proto.start = function (...args) {
    const value = start.apply(this, args);
    if (!ownership.has(this)) {
      const id = page(); ownership.set(this, id);
      trace.active++; trace.maxActive = Math.max(trace.maxActive, trace.active);
      bucket(id).active++; bucket(id).started++;
      trace.events.push({kind: 'start', page: id});
      this.addEventListener('ended', () => finish(this), {once: true});
    }
    return value;
  };
  proto.stop = function (...args) {const value = stop.apply(this, args); finish(this); return value;};
}
async function observation(page, step) {
  return {step, ...await page.evaluate(() => {
    const host = document.querySelector('[data-lesson-player][data-current-animation-id]');
    const p057 = document.querySelector('[data-pair-page="shared-nms002-l02-p057"]');
    const p056 = document.querySelector('[data-pair-page="shared-nms002-l02-p056"]');
    const p055 = document.querySelector('[data-pair-page="shared-nms002-l02-p055"]');
    const p052 = document.querySelector('[data-source-percent-practice-runtime="shared-nms002-l02-p052"]');
    return {animationId: host?.getAttribute('data-current-animation-id'),
      rendererAvailability: host?.getAttribute('data-renderer-availability'),
      p057Ready: p057?.getAttribute('data-pair-ready'),
      p057Phase: p057?.getAttribute('data-pair-audio-phase'),
      p056Ready: p056?.getAttribute('data-pair-ready'),
      p056Phase: p056?.getAttribute('data-pair-audio-phase'),
      p056Frame: p056?.getAttribute('data-pair-frame'),
      p056Controls: [...(p056?.querySelectorAll('button[data-source-instance-id]') ?? [])].map(button => ({
        id: button.getAttribute('data-source-instance-id'),
        key: button.getAttribute('data-source-key-attribute'),
        label: button.textContent?.trim(), disabled: button.disabled,
        width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height})),
      p055Ready: p055?.getAttribute('data-pair-ready'),
      p055Canvas: p055?.querySelector('[data-canvas-status]')?.getAttribute('data-canvas-status'),
      p055AudioPhase: p055?.getAttribute('data-pair-audio-phase'),
      p055Controls: [...(p055?.querySelectorAll('button[data-source-instance-id]') ?? [])].map(button => ({
        label: button.textContent?.trim(), width: button.getBoundingClientRect().width,
        height: button.getBoundingClientRect().height,
        fontSize: getComputedStyle(button).fontSize})),
      p052Mounted: !!p052, p052Phase: p052?.querySelector('.p052-player')?.getAttribute('data-p052-player-phase'),
      p052Failure: document.querySelector('[data-p052-failure]')?.getAttribute('data-p052-failure'),
      alerts: [...document.querySelectorAll('[role="alert"]')].map(x => x.textContent?.trim()).filter(Boolean),
      audioTrace: window.__P057_PREDECESSOR_AUDIO_TRACE};
  })};
}
async function clickKey(page, key) {
  const button = page.locator(`button[data-responsive-focus-key="${key}"]:visible`).first();
  await button.scrollIntoViewIfNeeded(); await button.click();
}
async function selectPage(page, id) {
  await clickKey(page, 'map');
  await page.locator(`button[data-placement-id="${id}"]`).click();
  await page.locator(`${HOST}[data-current-animation-id="${id}"]`).waitFor();
}
async function waitAudioStarted(page, id, previous) {
  await page.waitForFunction(({id, previous}) =>
    (window.__P057_PREDECESSOR_AUDIO_TRACE.byPage[id]?.started ?? 0) > previous,
  {id, previous}, {timeout: 30000});
}
async function waitAudioStopped(page, id) {
  await page.waitForFunction(id =>
    (window.__P057_PREDECESSOR_AUDIO_TRACE.byPage[id]?.active ?? 0) === 0,
  id, {timeout: 30000});
}
async function checkLocale(browser, locale, output) {
  const record = {locale, status: 'running', step: 'setup', responseStatus: null,
    ready: false, formal: false, observations: [], assets: [], errors: [], requests: []};
  const context = await browser.newContext({viewport: {width: 1440, height: 900},
    locale: locale === 'es' ? 'es-ES' : 'en-US', reducedMotion: 'reduce', serviceWorkers: 'block'});
  await context.addInitScript(traceInit);
  const page = await context.newPage(); page.setDefaultTimeout(30000);
  const responseChecks = [];
  page.on('pageerror', error => record.errors.push(error.message));
  page.on('console', message => {if (message.type() === 'error') record.errors.push(message.text());});
  page.on('request', request => {if (assetPath(request.url())) {
    const url = new URL(request.url());
    const name = url.pathname === P057_AUDIO_PATH ? 'p057-main.mp3' :
      url.pathname === P056_AUDIO_PATH ? 'p056-main.mp3' : url.pathname.slice(PREFIX.length);
    record.requests.push({name, origin: url.origin,
      search: url.search, method: request.method(), resourceType: request.resourceType()});
  }});
  page.on('response', response => {if (assetPath(response.url())) responseChecks.push(
    verifyResponse(response).then(value => ({ok: true, value}), error => ({ok: false, error: error.message})));});
  try {
    record.step = 'open-p057';
    const response = await page.goto(`${ORIGIN}/${locale}/migration-status/g678-calibration/${P057}`,
      {waitUntil: 'domcontentloaded', timeout: 90000});
    record.responseStatus = response?.status() ?? null;
    assert.equal(record.responseStatus, 200);
    assert.equal(await page.locator('main[data-p057-current-js]').getAttribute('data-p057-current-js'),
      'unregistered-probe');
    await page.locator(`${HOST}[data-current-animation-id="${P057}"]`).waitFor();
    await page.locator(`${P057_RUNTIME}[data-pair-ready="true"]`).waitFor({timeout: 45000});
    record.ready = true;
    let state = await observation(page, record.step); record.observations.push(state);
    assert.equal(state.p057Ready, 'true');
    assert.equal(state.audioTrace.active, 0, 'P057 entry has no autoplay');
    record.step = 'p057-replay-then-map-p056';
    await clickKey(page, 'replay'); await waitAudioStarted(page, P057, 0);
    await selectPage(page, P056);
    await page.locator(`${P056_RUNTIME}[data-pair-ready="true"]`).waitFor({timeout: 45000});
    await waitAudioStopped(page, P057);
    state = await observation(page, record.step); record.observations.push(state);
    assert.deepEqual(state.alerts, []); assert.equal(state.rendererAvailability, 'registered');
    assert.equal(state.p056Ready, 'true');
    assert.deepEqual(state.p056Controls.map(({id, key, label, disabled}) => ({id, key, label, disabled})),
      P056_TERMS.map(({id, key, label}) => ({id, key, label, disabled: false})));
    assert.ok(state.p056Controls.every(button => button.width >= 44 && button.height >= 44),
      'P056 source glossary controls need 44×44 targets');
    record.step = 'p056-replay-and-glossary';
    let started = state.audioTrace.byPage[P056]?.started ?? 0;
    await clickKey(page, 'replay'); await waitAudioStarted(page, P056, started);
    record.dialogs = [];
    for (const term of P056_TERMS) {
      const button = page.locator(`${P056_RUNTIME} button[data-source-instance-id="${term.id}"]`);
      assert.equal(await button.isDisabled(), false);
      await button.click();
      const dialog = page.locator(`[role="dialog"][data-glossary-entry-id="${term.entry}"]`);
      await dialog.waitFor();
      assert.equal(await dialog.getAttribute('data-source-key-attribute'), term.key);
      assert.match(await dialog.getAttribute('data-source-sha256'), /^[a-f0-9]{64}$/u);
      await waitAudioStopped(page, P056);
      record.dialogs.push({entry: term.entry, key: term.key,
        sourceSha256: await dialog.getAttribute('data-source-sha256')});
      await dialog.getByRole('button', {name: locale === 'es' ? 'Cerrar y continuar' : 'Close and continue', exact: true}).click();
      await dialog.waitFor({state: 'detached'});
      await page.waitForFunction(selector => document.activeElement === document.querySelector(selector),
        `${P056_RUNTIME} button[data-source-instance-id="${term.id}"]`);
    }
    assert.equal(record.dialogs.length, 2);
    record.step = 'map-p055';
    await selectPage(page, P055);
    await page.locator(`${P055_RUNTIME}[data-pair-ready="true"]`).waitFor({timeout: 45000});
    await page.locator(`${P055_RUNTIME} [data-canvas-status="ready"]`).waitFor({timeout: 45000});
    state = await observation(page, record.step); record.observations.push(state);
    assert.deepEqual(state.alerts, []); assert.equal(state.rendererAvailability, 'registered');
    assert.ok(state.p055Controls.length >= 3 && state.p055Controls.every(button =>
      button.width >= 44 && button.height >= 44), 'P055 glossary targets must be at least 44×44 px');
    await page.screenshot({path: path.join(output, `${locale}-p055-ready.png`), fullPage: true});
    record.step = 'p055-play-replay-pause';
    started = state.audioTrace.byPage[P055]?.started ?? 0;
    await clickKey(page, 'pause'); await waitAudioStarted(page, P055, started);
    started = (await observation(page, 'p055-playing')).audioTrace.byPage[P055]?.started ?? 0;
    await clickKey(page, 'replay'); await waitAudioStarted(page, P055, started);
    await clickKey(page, 'pause'); await waitAudioStopped(page, P055);
    state = await observation(page, record.step); record.observations.push(state);
    assert.deepEqual(state.alerts, []);
    assert.ok((state.audioTrace.byPage[P055]?.started ?? 0) >= 2);
    await page.screenshot({path: path.join(output, `${locale}-p055-after-replay.png`), fullPage: true});
    record.step = 'map-p052';
    await selectPage(page, P052);
    await page.locator(P052_RUNTIME).waitFor({timeout: 45000});
    await page.locator(`${P052_RUNTIME} .p052-player[data-p052-audio-loading="false"]`).waitFor({timeout: 45000});
    state = await observation(page, record.step); record.observations.push(state);
    assert.deepEqual(state.alerts, []); assert.ok(!state.p052Failure);
    assert.equal(state.audioTrace.byPage[P055]?.active ?? 0, 0);
    await page.screenshot({path: path.join(output, `${locale}-p052-ready.png`), fullPage: true});
    record.step = 'p052-replay-play-pause';
    // The host may carry its playing state into a new placement. Pause that
    // inherited activation before testing explicit Replay and Play.
    if ((state.audioTrace.byPage[P052]?.active ?? 0) > 0) {
      await clickKey(page, 'pause'); await waitAudioStopped(page, P052);
    }
    await clickKey(page, 'replay');
    state = await observation(page, 'p052-after-replay'); record.observations.push(state);
    if ((state.audioTrace.byPage[P052]?.active ?? 0) > 0) {
      await clickKey(page, 'pause'); await waitAudioStopped(page, P052);
    }
    started = state.audioTrace.byPage[P052]?.started ?? 0;
    await clickKey(page, 'pause'); await waitAudioStarted(page, P052, started);
    state = await observation(page, 'p052-playing'); record.observations.push(state);
    assert.deepEqual(state.alerts, []); assert.ok(!state.p052Failure);
    await page.screenshot({path: path.join(output, `${locale}-p052-playing.png`), fullPage: true});
    await clickKey(page, 'pause'); await waitAudioStopped(page, P052);
    record.step = 'return-p057';
    await selectPage(page, P057);
    await page.locator(`${P057_RUNTIME}[data-pair-ready="true"]`).waitFor({timeout: 45000});
    await page.waitForFunction(() => window.__P057_PREDECESSOR_AUDIO_TRACE.active === 0);
    state = await observation(page, record.step); record.observations.push(state);
    assert.deepEqual(state.alerts, []); assert.equal(state.audioTrace.byPage[P055]?.active ?? 0, 0);
    assert.equal(state.audioTrace.byPage[P052]?.active ?? 0, 0);
    assert.equal(state.audioTrace.byPage[P056]?.active ?? 0, 0);
    assert.equal(state.audioTrace.byPage[P057]?.active ?? 0, 0);
    assert.equal(await page.locator('[role="dialog"][data-glossary-entry-id]').count(), 0);
    const results = await Promise.all(responseChecks);
    assert.deepEqual(results.filter(item => !item.ok), [], 'All predecessor responses must match exact bytes');
    record.assets.push(...results.map(item => item.value));
    for (const name of ['p057-main.mp3', 'p056-main.mp3', 'p055-typography.js', 'p055-main.mp3', 'p052-sprite-350.mp3'])
      assert.ok(record.assets.some(item => item.name === name), `Missing real ${name} response`);
    assert.ok(record.requests.length >= 5 && record.requests.every(item =>
      item.origin === ORIGIN && item.method === 'GET'));
    assert.deepEqual(record.errors, []);
    record.status = 'technical-pass-not-acceptance';
  } catch (error) {
    record.status = 'failed'; record.failure = {step: record.step, message: error.message, stack: error.stack};
    record.observations.push(await observation(page, 'failure').catch(() => ({step: 'failure'})));
    await page.screenshot({path: path.join(output, `${locale}-failure.png`), fullPage: true}).catch(() => {});
  } finally {
    const close = await Promise.race([context.close().then(() => 'closed', error => `error:${error.message}`),
      new Promise(resolve => setTimeout(() => resolve('timeout'), 5000))]);
    record.contextClose = close;
    await writeFile(path.join(output, `${locale}-record.json`), json(record), {flag: 'wx'});
  }
  return record;
}

const [slug] = process.argv.slice(2);
assert.ok(process.argv.length === 3 && /^[a-z0-9][a-z0-9-]{0,63}$/u.test(slug ?? ''),
  'Usage: node --import tsx scripts/probe-nms-l02-p057-predecessors-v1.mjs <unique-slug>');
const output = path.join(OUTPUT, slug);
await mkdir(OUTPUT, {recursive: true}); await mkdir(output);
const before = await pins();
for (const [relative, expected] of [
  ['output/nms-l02-p057-audio-20260927/embedded-source-stream-v1.mp3', MAIN_PINS[P057_AUDIO_PATH]],
  ['migrations/shared-nms002-l02-p056/audit/embedded-source-stream-v1.mp3', MAIN_PINS[P056_AUDIO_PATH]],
]) {
  const pin = before.find(item => item.path === relative);
  assert.deepEqual({bytes: pin?.bytes, sha256: pin?.sha256},
    {bytes: expected.bytes, sha256: expected.sha256}, `${relative} exact source audio`);
}
const result = {schemaVersion: 1, kind: 'nms-l02-p057-predecessor-resource-browser-continuity-v1',
  origin: ORIGIN, status: 'running', formal: false, startedAt: new Date().toISOString(), inputPins: before, cases: []};
let server, browser;
result.cleanupErrors = [];
try {
  server = await chromium.launchServer({channel: 'chrome', headless: true, host: '127.0.0.1'});
  browser = await chromium.connect(server.wsEndpoint());
  for (const locale of ['en', 'es']) result.cases.push(await checkLocale(browser, locale, output));
} catch (error) {result.failure = {message: error.message};}
finally {
  if (browser) await bounded(browser.close(), 'browser disconnect')
    .catch(error => result.cleanupErrors.push(error.message));
  if (server) {
    try {await bounded(server.close(), 'owned browser process close', 10000);
      result.browserProcessCleanup = 'closed';}
    catch (error) {
      result.browserProcessCloseNote = error.message;
      try {await bounded(server.kill(), 'owned browser process kill', 10000);
        result.browserProcessCleanup = 'terminated-after-close-timeout';}
      catch (killError) {
        result.browserProcessKillNote = killError.message;
        // BrowserServer may finish process exit before its transport shutdown
        // promise settles. Require the owned ChildProcess exit, retain both facts.
        if (server.process().exitCode !== null || server.process().signalCode !== null)
          result.browserProcessCleanup = 'process-exit-confirmed-after-kill-promise-timeout';
        else result.cleanupErrors.push(killError.message);
      }
    }
    result.browserProcessExited = server.process().exitCode !== null || server.process().signalCode !== null;
    if (!result.browserProcessExited) result.cleanupErrors.push('Owned browser process exit unverified');
  }
}
result.finishedAt = new Date().toISOString();
const after = await pins();
result.inputStable = JSON.stringify(before) === JSON.stringify(after);
result.status = !result.failure && result.inputStable && result.browserProcessExited === true &&
  result.cleanupErrors.length === 0 && result.cases.length === 2 &&
  result.cases.every(item => item.status === 'technical-pass-not-acceptance' && item.contextClose === 'closed' &&
    item.responseStatus === 200 && item.ready === true && item.formal === false)
  ? 'technical-pass-not-acceptance' : 'failed';
await writeFile(path.join(output, 'result.json'), json(result), {flag: 'wx'});
console.log(json({status: result.status, inputStable: result.inputStable,
  cases: result.cases.map(item => ({locale: item.locale, status: item.status,
    failure: item.failure && {step: item.failure.step, message: item.failure.message},
    assets: item.assets.map(asset => asset.name)})), output: path.join(output, 'result.json')}));
process.exit(result.status === 'failed' ? 1 : 0);
