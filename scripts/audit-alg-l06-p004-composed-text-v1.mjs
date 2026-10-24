/** Isolated current-Canvas composed-frame capture; it never executes the SWF/AVM1 or a My Lesson host. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync, writeFileSync, mkdirSync, existsSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = 'output/alg-l06-p004-composed-text-v1';
const canvasPath = 'output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js';
const riskPath = 'migrations/shared-alg001-l06-p004/audit/text-risks-v1.json';
const sourceTextPath = 'migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const sourcePath = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const frames = [1, 92, 93, 130, 195, 507, 508, 509, 600, 610, 611, 612, 613,
  614, 615, 683, 684, 685, 686, 700, 831];
const expected = {
  source: '514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e',
  canvas: '6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8',
  sourceText: 'c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6',
  risks: 'e742449a874529449a7e4a7bc5233d3514795a3acf39d050765ca06e3888cd00',
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const bytes = name => readFileSync(path.isAbsolute(name) ? name : path.join(root, name));
function pin(name, expectedSha) {
  const data = bytes(name), actual = {path: name, bytes: data.length, sha256: sha(data)};
  if (expectedSha) assert.equal(actual.sha256, expectedSha, `${name} drift`);
  return actual;
}
function exact(relative, data) {
  const file = path.join(root, relative); mkdirSync(path.dirname(file), {recursive: true});
  if (existsSync(file)) assert.deepEqual(readFileSync(file), data, `${relative} drift`);
  else writeFileSync(file, data, {flag: 'wx'});
}
function inputs() {
  const source = pin(sourcePath, expected.source), canvas = pin(canvasPath, expected.canvas);
  const sourceText = pin(sourceTextPath, expected.sourceText), risks = pin(riskPath, expected.risks);
  const catalog = JSON.parse(bytes(sourceTextPath));
  const risk = JSON.parse(bytes(riskPath));
  assert.equal(catalog.sourceSha256, source.sha256);
  assert.equal(risk.animationId, 'shared-alg001-l06-p004');
  assert.deepEqual(catalog.timelines.map(row => [row.timelineId, row.declaredFrameCount]),
    [['root', 10], ['sprite-95', 831], ['sprite-98', 1]]);
  const masks = catalog.timelines.flatMap(row => row.events.filter(event => event.clipDepth !== undefined))
    .map(event => ({frame: event.frame, instanceId: event.instanceId, depth: event.depth,
      clipDepth: event.clipDepth, characterId: event.characterId,
      sourceTagSha256: event.sourceTagSha256}));
  assert.deepEqual(masks.map(row => row.frame), [1, 1, 1, 508, 614]);
  const bitmapRisk = risk.rows.find(row => row.id === 'bitmap-embedded-text');
  assert(bitmapRisk && bitmapRisk.observations.length === 7);
  return {pins: [source, canvas, sourceText, risks], catalog, masks,
    bitmapShapes: bitmapRisk.shapeBitmapRefs};
}
function frameEvidence(frame, catalog) {
  const current = catalog.timelines.find(row => row.timelineId === 'sprite-95');
  const maskInstances = current.instances.filter(item => item.firstFrame <= frame && frame < item.lastFrameExclusive &&
    [1, 22, 76].includes(item.characterId));
  const textIds = new Set(catalog.textDefinitions.map(row => row.characterId));
  const sourceTextInstances = catalog.timelines.flatMap(row => row.instances.filter(item =>
    textIds.has(item.characterId) && item.firstFrame <= (row.timelineId === 'root' ? 6 : frame) &&
    (row.timelineId === 'root' ? 6 : frame) < item.lastFrameExclusive)).map(item => item.instanceId);
  return {sourceTextInstances, maskInstanceIds: maskInstances.map(item => item.instanceId)};
}
async function capture() {
  const input = inputs(), sourceCode = bytes(canvasPath).toString('utf8');
  const browser = await chromium.launch({channel: 'chrome', headless: true,
    args: ['--mute-audio', '--autoplay-policy=document-user-activation-required']});
  const errors = [], requests = [], records = [];
  try {
    const page = await browser.newPage({viewport: {width: 820, height: 620}, deviceScaleFactor: 1});
    page.on('pageerror', error => errors.push(String(error)));
    page.on('request', request => requests.push(request.url()));
    await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="stage" width="800" height="600"></canvas></body></html>');
    await page.addScriptTag({content: sourceCode});
    await page.evaluate(async () => {
      const asset = globalThis.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p004'];
      if (!asset) throw Error('P004 asset absent');
      await asset.ready();
    });
    const canvas = page.locator('#stage');
    for (const frame of frames) {
      const state = await page.evaluate(frame => {
        const canvas = document.getElementById('stage');
        const state = globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004']
          .render(canvas, {frame, scenario: 'source-static-frame', lang: 'en', seed: 0});
        const pixels = canvas.getContext('2d').getImageData(0, 0, 800, 600).data;
        let nonBackground = 0;
        for (let index = 0; index < pixels.length; index += 4)
          if (pixels[index] !== 184 || pixels[index + 1] !== 216 || pixels[index + 2] !== 247) nonBackground++;
        return {localFrame: state.localFrame, rootFrame: state.rootFrame,
          frameDomain: canvas.dataset.flashFrameDomain, nonBackgroundPixels: nonBackground};
      }, frame);
      assert.equal(state.localFrame, frame);
      assert.equal(state.rootFrame, 6);
      assert.equal(state.frameDomain, 'sprite-95');
      assert(state.nonBackgroundPixels > 0);
      const file = `${output}/frames/frame-${String(frame).padStart(3, '0')}.png`;
      const screenshot = await canvas.screenshot();
      exact(file, screenshot);
      records.push({frame, state, screenshot: pin(file), ...frameEvidence(frame, input.catalog)});
    }
    assert.deepEqual(errors, []);
    assert(requests.every(url => url.startsWith('data:')), 'unexpected external request');
    const receipt = {schemaVersion: 1, kind: 'alg-l06-p004-isolated-composed-canvas-capture-v1',
      animationId: 'shared-alg001-l06-p004', scope: 'Local offscreen Chromium of exact source-bound safe Canvas export; no original Flash runtime, AVM1, My Lesson host, audio, visual parity or acceptance.',
      browser: {name: 'Chrome', version: browser.version()}, sourcePins: input.pins,
      maskSources: input.masks, bitmapShapeSources: input.bitmapShapes,
      sourceFrameDomain: 'sprite-95', sourceFrameCount: 831, rootEntryFrame: 6,
      frames: records, errors, requests, originalRuntimeAccepted: false,
      nativeTypographyComplete: false, visualAccepted: false};
    const report = `${output}/capture-v1.json`;
    const data = Buffer.from(`${JSON.stringify(receipt, null, 2)}\n`);
    exact(report, data);
    console.log(JSON.stringify({report: pin(report), frames: records.length}));
  } finally { await browser.close(); }
}
function check() {
  const input = inputs();
  const receipt = JSON.parse(bytes(`${output}/capture-v1.json`));
  assert.deepEqual(receipt.sourcePins, input.pins);
  assert.deepEqual(receipt.maskSources, input.masks);
  assert.deepEqual(receipt.bitmapShapeSources, input.bitmapShapes);
  assert.deepEqual(receipt.frames.map(row => row.frame), frames);
  for (const row of receipt.frames) {
    assert.deepEqual(pin(row.screenshot.path), row.screenshot);
    assert.deepEqual(frameEvidence(row.frame, input.catalog),
      {sourceTextInstances: row.sourceTextInstances, maskInstanceIds: row.maskInstanceIds});
    assert.equal(row.state.localFrame, row.frame);
  }
  assert.deepEqual(receipt.errors, []);
  assert(receipt.requests.every(url => url.startsWith('data:')));
  const review = JSON.parse(bytes(`${output}/visual-review-v1.json`));
  assert.deepEqual(review.captureReceipt, pin(`${output}/capture-v1.json`));
  for (const row of review.reviewedFrames) {
    const captured = receipt.frames.find(item => item.frame === row.frame);
    assert(captured, `unreviewed frame ${row.frame}`);
    assert.equal(row.sha256, captured.screenshot.sha256, `review screenshot ${row.frame} drift`);
    assert(row.observation.length > 30);
  }
  const sourceEvents = input.catalog.timelines.flatMap(row => row.events);
  for (const anchor of [review.sourceAnchors.firstSentence, review.sourceAnchors.secondSentence]) {
    const text = sourceEvents.find(event => event.instanceId === anchor.textInstanceId &&
      event.frame === anchor.textPlacedFrame);
    assert(text);
    assert.equal(text.characterId, anchor.textCharacterId);
    assert.equal(text.sourceTagSha256, anchor.textPlacementTagSha256);
    assert.deepEqual(text.matrix, anchor.textMatrixTwips);
    const maskEvents = sourceEvents.filter(event => event.instanceId === anchor.maskInstanceId);
    assert.equal(maskEvents[0].frame, anchor.maskFirstFrame);
    assert.equal(maskEvents[0].clipDepth, anchor.clipDepth);
    assert.equal(maskEvents[0].matrix[0], anchor.maskFirstScaleX);
    assert.equal(maskEvents.at(-1).frame, anchor.maskLastUpdateFrame);
    assert.equal(maskEvents.at(-1).matrix[0], anchor.maskLastScaleX);
    assert.equal(maskEvents.at(-1).sourceTagSha256, anchor.maskLastTagSha256);
    assert.equal(anchor.reviewedFullSentenceThreshold, anchor.maskLastUpdateFrame);
  }
  assert.deepEqual(review.nativeFullSentencePolicyCandidate,
    {text78Frame: 611, text83Frame: 684,
      basis: 'Last source mask-matrix updates plus visually inspected stable full-sentence Canvas frames; conservative modern whole-sentence reveal only, without progressive glyph parity',
      notAnImplementedRuntimeChange: true});
  assert.equal(review.claimBoundary.originalFlashRuntimeObserved, false);
  console.log(JSON.stringify({report: pin(`${output}/capture-v1.json`),
    review: pin(`${output}/visual-review-v1.json`), frames: receipt.frames.length}));
}
if (process.argv[2] === '--capture') await capture();
else if (process.argv[2] === '--check') check();
else throw Error('Use --capture or --check');
