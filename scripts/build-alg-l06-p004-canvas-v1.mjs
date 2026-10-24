#!/usr/bin/env node
/** Reproducible drawing-only candidate for the exact P004 SWF. No registration. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';
import {buildSafeRuntime} from './build-safe-ffdec-canvas-adapter.mjs';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = 'G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const SWF_SHA = '514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e';
const AUDIT_DIR = path.join(ROOT,'migrations/shared-alg001-l06-p004/audit');
const FRAMES = `${AUDIT_DIR}/ffdec-26.2.1-canvas-v1/sprites/DefineSprite_95/frames.html`;
const HELPER = `${AUDIT_DIR}/ffdec-26.2.1-canvas-v1/sprites/DefineSprite_95/canvas.js`;
const XML = `${AUDIT_DIR}/movie-root-verified.xml`;
const SHA = Object.freeze({
  audit: '89b22426969a3f288f1aef6043aed050d9eb6e4e8d092b45532e89a52ff37180',
  facts: 'e555ea29848adf198cdb2835c18f1c262728d9fe1e1ae7d1562a9194d06d1228',
  frames: '645bffe80214232b6ff774d2272b570e7e5bd23b169a0baf8587b58399485c64',
  helper: '78256220d01fba044341283703c3923a1ff8ff29499c51f65ab4e6ac825ccb93',
  xml: 'e4c1ac33596cac6b97491c6d74417ddd8edfebb8197b12f680fdaa2cf8e5b187',
});
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');

function readPinned(file, expected) {
  assert.equal(realpathSync(file), file, `physical file: ${file}`);
  const before = lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink() && before.nlink === 1n, `ordinary file: ${file}`);
  const bytes = readFileSync(file), after = lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink']) assert.equal(before[key], after[key], `stable file: ${file}`);
  assert.equal(sha(bytes), expected, `input hash drift: ${file}`);
  return bytes;
}

export function buildCandidate(sourceRoot) {
  assert.equal(sourceRoot,'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware');
  assert(typeof sourceRoot === 'string' && path.isAbsolute(sourceRoot) &&
    realpathSync(sourceRoot) === sourceRoot && lstatSync(sourceRoot).isDirectory() &&
    !lstatSync(sourceRoot).isSymbolicLink(), 'real source root');
  const swf = readPinned(path.join(sourceRoot, SOURCE), SWF_SHA);
  assert.equal(swf.length, 1115626);
  const audit = JSON.parse(readPinned(`${AUDIT_DIR}/source-audit-v1.json`, SHA.audit));
  const extractionFile=`${AUDIT_DIR}/ffdec-26.2.1-canvas-v1/extraction-receipt.json`;
  const extraction=JSON.parse(readPinned(extractionFile,'20fd429fe2f43b82a6ee66c521df1a2aa04e5ef72f199fa71f826e641e793701'));
  assert.equal(extraction.source.sha256,SWF_SHA);
  for(const pin of extraction.files){const bytes=readPinned(path.join(ROOT,pin.path),pin.sha256);assert.equal(bytes.length,pin.bytes);}
  const geometryFile=`${AUDIT_DIR}/button-geometry-v1.json`;
  const geometry=JSON.parse(readPinned(geometryFile,'9c0828219194322961a118fbe44274ef70a78335edc036d17e518ccbb77eee49'));
  assert.equal(geometry.occurrences.length,9);assert.deepEqual(geometry.rootTranslationTwips,[7390,5060]);
  assert.equal(geometry.xmlSha256,SHA.xml);
  const facts = JSON.parse(readPinned(`${AUDIT_DIR}/source-facts-v1.json`, SHA.facts));
  assert.equal(audit.source.sha256, SWF_SHA);
  assert.equal(audit.acceptance.currentJsRegistered, false);
  assert.deepEqual(audit.frameDomains.domains.map(d => [d.domainId, d.declaredFrameCount]), [['root', 10], ['sprite-95', 831], ['sprite-98', 1]]);
  assert.equal(audit.buttons,8,'eight distinct button definitions; nine occurrences audited separately');
  const main = facts.frameDomains.domains.find(d => d.domainId === 'sprite-95');
  assert(main && main.declaredFrameCount === 831 && main.scriptTagCount === 1);
  assert.deepEqual(main.placedSpriteIds, []);
  const sourceXml = readPinned(XML, SHA.xml).toString();
  assert(sourceXml.includes('<PlaceObject2 replace="0" depth="1" objectID="95" morph="5" name="animation">\n        <transform>\n          <Transform transX="7390" transY="5060"/>'));
  const frames = readPinned(FRAMES, SHA.frames).toString();
  const helper = readPinned(HELPER, SHA.helper).toString();
  const canvas = frames.match(/<canvas\s+id="myCanvas"\s+width="(\d+)"\s+height="(\d+)"/u);
  const header = frames.match(/function sprite95\(ctx,ctrans,frame,ratio,time\)\{\s*ctx.save\(\);\s*ctx.transform\(1,0,0,1,([-0-9.]+),([-0-9.]+)\);\s*var clips = \[\];\s*var frame_cnt = (\d+);/u);
  assert(canvas && header && Number(header[3]) === 831);
  const definitionEnd = frames.indexOf('\nvar frame = -1;');
  assert(definitionEnd > 0);
  const definitions = frames.slice(0, definitionEnd);
  const placed = [...new Set([...definitions.matchAll(/place\("([A-Za-z_$][A-Za-z0-9_$]*)"/gu)].map(m => m[1]))].sort();
  const fonts = [...definitions.matchAll(/function\s+(font\d+)\(ctx,ch,textColor\)\{/gu)].map(m => m[1]);
  const images = [...definitions.matchAll(/var\s+(imageObj\d+)\s*=\s*document.createElement\("img"\);\s*\1.src="data:image\/(?:PNG|JPEG);base64,[A-Za-z0-9+/=]+";/gu)].map(m => m[1]);
  assert.deepEqual([placed.length, fonts.length, images.length], [81, 5, 7]);
  const internal = {x: Number(header[1]), y: Number(header[2])};
  assert.deepEqual(internal, {x: 422.2, y: 545.8});
  const offset = {x: 369.5 - internal.x, y: 253 - internal.y};
  const spec = {
    schemaVersion: 1, animationId: 'shared-alg001-l06-p004', finalAnimationId: audit.animationId,
    classification: 'unregistered-source-locked-canvas-drawing-candidate-v1', title: 'Understanding Functions: Real World Activity',
    source: {swf: `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`, swfBytes: swf.length, swfSha256: SWF_SHA},
    evidence: {scenarioInventory: `${AUDIT_DIR}/source-audit-v1.json`, scenarioInventorySha256: SHA.audit,
      audioAudit: `${AUDIT_DIR}/source-audit-v1.json`, audioAuditSha256: SHA.audit},
    ffdecExport: {tool: 'JPEXS Free Flash Decompiler 26.2.1 Canvas export', helper: HELPER, helperSha256: SHA.helper,
      helperBytes: Buffer.byteLength(helper), framesHtml: FRAMES, framesHtmlSha256: SHA.frames, framesHtmlBytes: Buffer.byteLength(frames),
      targetSpriteObjectId: 95, targetSpriteFunction: 'sprite95', exportCanvas: {width: Number(canvas[1]), height: Number(canvas[2])},
      exportInternalTranslation: internal, expectedPlacedFunctionCount: placed.length, expectedPlacedFunctionsSha256: sha(JSON.stringify(placed)),
      expectedFontFunctionCount: fonts.length, expectedFontFunctionsSha256: sha(JSON.stringify(fonts)),
      embeddedImageVariableCount: images.length, embeddedImageVariablesSha256: sha(JSON.stringify(images))},
    timeline: {fps: 12, stage: {width: 800, height: 600, backgroundColor: '#b8d8f7'},
      root: {frameCount: 10, preloaderStopFrame: 1, beginFrame: 6, beginLabel: 'begin', placementName: 'animation',
        placementDepth: '1', placementTwips: {x: 7390, y: 5060}, placementPixels: {x: 369.5, y: 253}},
      local: {timelineId: 'sprite-95', frameCount: 831, livePlaybackEndFrame: 831, playbackMode: 'once', publicFrameIndexing: 'one-indexed'},
      stageRenderOffset: offset},
    runtimeContract: {kind: 'structural-local-frame', scenarios: ['source-static-frame'], defaultScenario: 'source-static-frame',
      supportedLanguages: ['en'], seedMapping: 'fixed-zero-no-source-randomness-executed', blockedLocalFrameRanges: [],
      currentCanonicalFrameDomainDispositionAsserted: false,
      unresolved: ['Drawing only: no ActionScript, button activation, source audio or Spanish playback is executed.',
        'Nine source button occurrences require the separately maintained DOM interaction state.',
        'Source text modernization, original-runtime visual comparison and downstream acceptance remain pending.']},
    output: {script: 'canvas-renderer.js', manifest: 'candidate-manifest.json', spec: 'adapter-spec.json', globalRegistry: 'HELP_MATH_CANVAS_ASSETS'},
    strictAcceptanceEffect: 'none',
  };
  const generated = buildSafeRuntime({helperSource: helper, framesHtml: frames, spec:{...spec,animationId:`course-${spec.animationId}`}}).runtime.replaceAll('course-shared-alg001-l06-p004','shared-alg001-l06-p004');
  const runtime = normalizeSourceClipMasks(generated, [
    {characterId:1,placements:[{depth:1,clipDepth:118}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,102,255,0.2509804]));'},
    {characterId:22,placements:[{depth:70,clipDepth:73},{depth:75,clipDepth:78}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([153,51,102,1]));'},
    {characterId:76,placements:[{depth:82,clipDepth:91},{depth:92,clipDepth:103}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,0,204,0.27058825]));'},
  ],sourceXml);
  new Script(runtime);
  const preview = Buffer.from(`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,">\n<title>P004 source drawing candidate — not accepted</title>\n<style>body{margin:0;background:#192836;color:white;font:16px system-ui}main{width:min(100%,800px);margin:auto}canvas{display:block;width:100%;height:auto}p{padding:8px}</style></head>\n<body><main><canvas id="stage" width="800" height="600" aria-label="Source drawing candidate for Understanding Functions: Real World Activity"></canvas><p id="status" role="status">Loading unregistered drawing candidate…</p></main>\n<script src="./canvas-renderer.js"></script><script>\n(async()=>{try{const frame=Number(new URLSearchParams(location.search).get('frame')||'1');if(!Number.isSafeInteger(frame)||frame<1||frame>831)throw Error('invalid frame');const asset=globalThis.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p004'];if(!asset)throw Error('drawing asset missing');await asset.ready();const state=asset.render(document.getElementById('stage'),{frame,scenario:'source-static-frame',lang:'en',seed:0});document.getElementById('status').textContent='Unregistered drawing-only candidate · frame '+state.localFrame+'/831 · no audio or acceptance';document.body.dataset.candidateReady='true';}catch(error){document.getElementById('status').textContent=String(error);document.body.dataset.candidateError=String(error);}})();\n</script></body></html>\n`);
  const specBytes = json(spec), runtimeBytes = Buffer.from(runtime);
  return {spec: specBytes, runtime: runtimeBytes, preview, manifest: json({schemaVersion: 1, animationId: audit.animationId,
    status: 'unregistered-drawing-only-candidate', sourceSha256: SWF_SHA, inputs: [
      {path: SOURCE, sha256: SWF_SHA}, {path: geometryFile,sha256:sha(readFileSync(geometryFile))},
      {path:extractionFile,sha256:sha(readFileSync(extractionFile))},
      {path:`${AUDIT_DIR}/source-facts-v1.json`,sha256:SHA.facts}, {path: `${AUDIT_DIR}/source-audit-v1.json`, sha256: SHA.audit},
      {path: FRAMES, sha256: SHA.frames}, {path: HELPER, sha256: SHA.helper}, {path: XML, sha256: SHA.xml},
      {path: 'scripts/build-safe-ffdec-canvas-adapter.mjs', sha256: sha(readFileSync(path.join(ROOT,'scripts/build-safe-ffdec-canvas-adapter.mjs')))},
      {path: 'scripts/build-alg-l06-p004-canvas-v1.mjs', sha256: sha(readFileSync(fileURLToPath(import.meta.url)))},
      {path: 'scripts/lib/g678-source-clip-masks-v1.mjs', sha256: sha(readFileSync(path.join(ROOT, 'scripts/lib/g678-source-clip-masks-v1.mjs')))},
    ], outputs: [{name: 'adapter-spec.json', bytes: specBytes.length, sha256: sha(specBytes)},
      {name: 'canvas-renderer.js', bytes: runtimeBytes.length, sha256: sha(runtimeBytes)},
      {name: 'preview.html', bytes: preview.length, sha256: sha(preview)}],
    acceptance: audit.acceptance, unresolved: spec.runtimeContract.unresolved})};
}

function main() {
  const args = process.argv.slice(2);
  assert(args.length===1&&['--build','--check'].includes(args[0]),'usage: script --build|--check');
  const check=args[0]==='--check';
  const output=path.join(ROOT,'output/alg-l06-p004-canvas-candidate-v1');
  if(!check)mkdirSync(output,{recursive:true});
  assert.equal(realpathSync(output),output);assert(lstatSync(output).isDirectory());
  const built = buildCandidate(process.env.HELP_MATH_G678_SOURCE_ROOT);
  const files = [['adapter-spec.json', built.spec], ['canvas-renderer.js', built.runtime], ['preview.html', built.preview], ['candidate-manifest.json', built.manifest]];
  for (const [name, bytes] of files) {
    const target = path.join(output, name);
    if (check) assert(readFileSync(target).equals(bytes), `${name} drifted`);
    else try {writeFileSync(target, bytes, {flag: 'wx'});}
    catch (error) {if (error.code !== 'EEXIST') throw error; assert(readFileSync(target).equals(bytes), `${name} drifted`);}
  }
  console.log(JSON.stringify({status: check ? 'verified' : 'created', output,
    files: files.map(([name, bytes]) => ({name, bytes: bytes.length, sha256: sha(bytes)}))}));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
