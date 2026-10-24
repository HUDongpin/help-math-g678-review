import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {chromium} from 'playwright';
import {buildP015Canvas} from './build-alg-l06-p015-canvas-v1.mjs';

process.env.HELP_MATH_G678_SOURCE_ROOT =
  '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const built = buildP015Canvas();
const manifest = JSON.parse(built.manifest);
const runtime = built.runtime.toString();
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('P015 maintained source drawing preserves two domains, source objects and six clips', () => {
  assert(readFileSync('output/alg-l06-p015-canvas-v1/canvas-renderer.js').equals(built.runtime));
  assert(readFileSync('packages/demos/src/generated/alg-l06-p015-canvas-v1.ts').equals(built.metadata));
  assert.deepEqual(manifest.sourceDepthOrder, [{depth: 1, characterId: 1},
    {depth: 2, characterId: 270}]);
  assert.deepEqual(manifest.sourceClipMasks.map(mask => [mask.frame, mask.characterId]),
    [[164, 31], [271, 31], [350, 31], [732, 260], [778, 263], [873, 267]]);
  assert.equal(manifest.sourceMorphCharacterIds.length, 10);
  assert.deepEqual(manifest.sourceGlyphRendering,
    {definitions: 15, dynamicFields: 0, preserved: true,
      nativeBinding: 'semantic-flow-companion', canvasAriaHiddenByHost: true});
  for (const id of [36, 37, 38, 45, 46, 47])
    assert(runtime.includes(`"button${id}": button${id}`));
  assert(runtime.includes('"morphshape59": morphshape59'));
  assert(runtime.includes('"shape1": shape1'));
  assert(runtime.includes('ctx.fillStyle="rgba(0,0,0,1)";'));
  assert(runtime.includes('var drawingCanvas = document.createElement("canvas")'));
  assert(runtime.includes('targetCtx.drawImage(drawingCanvas, 0, 0)'));
  assert(Object.values(manifest.acceptanceEffects).every(value => value === false));
  assert.deepEqual(manifest.outputs.map(output => output.sha256),
    [sha(built.runtime), sha(built.metadata)]);
});

test('P015 browser Canvas seeks exact main frames without stale clip state', async () => {
  const browser = await chromium.launch({headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
  try {
    const page = await browser.newPage({viewport: {width: 800, height: 600}});
    await page.setContent('<canvas id="stage" width="800" height="600"></canvas>');
    await page.addScriptTag({content: runtime});
    const result = await page.evaluate(async () => {
      const asset = globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p015'];
      await asset.ready();
      const canvas = document.getElementById('stage');
      const renders = [];
      for (const frame of [1, 164, 249, 332, 392, 741, 778, 816, 828, 880, 892, 914, 164]) {
        const state = asset.render(canvas, {frame, scenario: 'source-static-frame',
          lang: 'en', seed: 0});
        renders.push({frame, data: canvas.toDataURL('image/png'),
          stateFrame: state.localFrame, domain: state.frameDomain,
          root: state.rootFrame, attr: canvas.getAttribute('data-flash-frame'),
          attrDomain: canvas.getAttribute('data-flash-frame-domain')});
      }
      const rejected = [];
      for (const request of [{frame: 0}, {frame: 915}, {frame: 1.5},
        {frame: 120, lang: 'es'}, {frame: 120, scenario: 'execute-as'}]) {
        try { asset.resolveFrameState(request); rejected.push(false); }
        catch { rejected.push(true); }
      }
      return {renders, rejected, metadata: asset.metadata};
    });
    assert.deepEqual([result.metadata.stage.width, result.metadata.stage.height,
      result.metadata.fps], [800, 600, 12]);
    for (const item of result.renders)
      assert.deepEqual([item.stateFrame, item.domain, item.root, item.attr, item.attrDomain],
        [item.frame, 'sprite-270', 6, String(item.frame), 'sprite-270']);
    assert.equal(result.renders[1].data, result.renders.at(-1).data,
      'rendering frame 164 after distant masks must be byte-identical');
    assert.notEqual(result.renders[0].data, result.renders[5].data,
      'source title and machine state changes across the timeline');
    assert.notEqual(result.renders[5].data, result.renders[7].data,
      'source numerical transform becomes visible');
    assert(result.rejected.every(Boolean), 'out-of-domain and AVM1 requests reject');
  } finally {
    await browser.close();
  }
});
