#!/usr/bin/env node
/** Reproducible, source-only audit of the shipped ALG001 L6 P015 SWF. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {walkBinarySwf} from './audit-alg-l06-p014-source-v1.mjs';

const PROJECT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_ROOT = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID = 'shared-alg001-l06-p015';
const SWF = 'G6-G8-shared/ALG001/L6/VB/L6VB06.swf';
const SWF_SHA = 'd0f395f5410353733b42ae29198caa86fae6b6eebd0e2a71830a203d969868b1';
const AUDIT = path.join(PROJECT, 'migrations', ID, 'audit', 'source-v1');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const pin = (name, bytes) => ({path: name, bytes: bytes.length, sha256: sha(bytes)});

function readPhysical(file, expected) {
  assert.equal(fs.realpathSync(file), file, `physical path: ${file}`);
  const before = fs.lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink(), `ordinary file: ${file}`);
  const bytes = fs.readFileSync(file);
  const after = fs.lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink'])
    assert.equal(before[key], after[key], `stable source ${key}: ${file}`);
  if (expected) {
    assert.equal(bytes.length, expected.bytes, `source bytes: ${file}`);
    assert.equal(sha(bytes), expected.sha256, `source SHA: ${file}`);
  }
  return bytes;
}
function run(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 16 * 1024 * 1024});
  assert.equal(result.error, undefined, `${command}: ${result.error?.message}`);
  assert.equal(result.status, 0, `${command}: ${result.stderr}`);
  return result;
}
function exportPublicTools() {
  const scratch = fs.mkdtempSync(path.join(AUDIT, '.source-export-'));
  try {
    const xmlFile = path.join(scratch, 'movie.xml');
    const scriptsDir = path.join(scratch, 'scripts');
    const xmlRun = run('swfmill', ['-n', 'swf2xml', path.join(SOURCE_ROOT, SWF), xmlFile]);
    const xml = fs.readFileSync(xmlFile);
    const xmlCounts = JSON.parse(run('python3', ['-c',
      'import collections,json,sys,xml.etree.ElementTree as E\nroot=E.parse(sys.argv[1]).getroot()\nprint(json.dumps({"root":root.tag,"counts":dict(sorted(collections.Counter(x.tag for x in root.iter()).items()))}))',
      xmlFile]).stdout);
    run('ffdec', ['-onerror', 'abort', '-export', 'script', scriptsDir, path.join(SOURCE_ROOT, SWF)]);
    const scripts = [];
    function visit(dir) {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
        assert(!entry.isSymbolicLink(), 'FFDec script export symlink');
        const location = path.join(dir, entry.name);
        if (entry.isDirectory()) visit(location);
        else {
          assert(entry.isFile(), 'FFDec script export ordinary file');
          const bytes = fs.readFileSync(location);
          scripts.push({...pin(path.relative(scriptsDir, location).split(path.sep).join('/'), bytes), text: bytes.toString('utf8')});
        }
      }
    }
    visit(scriptsDir);
    const swfmillVersion = run('swfmill', ['--version']);
    const ffdecVersion = run('ffdec', ['-help']).stdout.split('\n')[0].trim();
    assert.equal((swfmillVersion.stdout + swfmillVersion.stderr).trim(), 'swfmill 0.3.6');
    assert.equal(ffdecVersion, 'JPEXS Free Flash Decompiler v.26.2.1');
    return {xml, xmlCounts, xmlStderr: xmlRun.stderr, scripts,
      versions: {swfmill: 'swfmill 0.3.6', ffdec: ffdecVersion, xmlParser: 'python xml.etree.ElementTree'}};
  } finally {
    fs.rmSync(scratch, {recursive: true, force: true});
  }
}

export function auditP015Source() {
  assert.equal(fs.realpathSync(SOURCE_ROOT), SOURCE_ROOT, 'real physical AWS root');
  fs.mkdirSync(AUDIT, {recursive: true});
  const source = readPhysical(path.join(SOURCE_ROOT, SWF), {bytes: 559546, sha256: SWF_SHA});
  const catalogBytes = readPhysical(path.join(PROJECT, 'catalog/g678-shared-catalog.v1.json'));
  const catalogMatches = JSON.parse(catalogBytes).lessons.flatMap(lesson =>
    lesson.pages.map(page => ({lesson, page}))).filter(({page}) => page.animationId === ID);
  assert.equal(catalogMatches.length, 1);
  const {lesson, page} = catalogMatches[0];
  assert.deepEqual([lesson.stableLessonKey, page.globalOrdinal, page.sectionCode,
    page.sectionPageOrdinal, page.viewPath, page.sourceSha256, page.authoringEvidence, page.flaPath],
  ['shared-alg001-l06', 15, 'VB', 5, SWF, SWF_SHA, 'swf-only', null]);
  const facts = parseSwfSourceFacts(source);
  const text = collectSwfTextSourceCatalog(source);
  const binary = walkBinarySwf(source);
  assert.deepEqual([facts.header.signature, facts.header.version, facts.header.fps,
    facts.header.stage.width, facts.header.stage.height, facts.header.rootFrameCount],
  ['CWS', 6, 12, 800, 600, 10]);
  assert.equal(facts.header.uncompressedSha256, binary.uncompressed.sha256);
  assert.equal(facts.actionScript.version, 'AS1/2');
  assert.deepEqual(binary.domains.map(domain => [domain.domain, domain.declaredFrames, domain.observedShowFrames]),
    [['root', 10, 10], ['sprite-270', 914, 914]]);
  assert.deepEqual([binary.actions.length, binary.buttons.length, binary.morphs.length,
    binary.streams.filter(stream => stream.code === 18).length,
    binary.streams.filter(stream => stream.code === 19).length, binary.trailers.length],
  [2, 6, 10, 1, 879, 0]);
  assert.deepEqual([text.summary.textDefinitions, text.summary.dynamicFields,
    text.summary.unparsedTags], [15, 0, 0]);
  const root = text.timelines.find(timeline => timeline.timelineId === 'root');
  const main = text.timelines.find(timeline => timeline.timelineId === 'sprite-270');
  assert(root && main);
  const mainPlacement = root.events.find(event => event.kind === 'place' && event.characterId === 270);
  assert.deepEqual([mainPlacement.frame, mainPlacement.depth, mainPlacement.name.text, mainPlacement.matrix],
    [6, 2, 'animation', [1, 0, 0, 1, 8248, 5666]]);
  const masks = text.timelines.flatMap(timeline => timeline.events
    .filter(event => event.kind === 'place' && event.clipDepth !== undefined)
    .map(event => ({domain: timeline.timelineId, frame: event.frame, depth: event.depth,
      clipDepth: event.clipDepth, characterId: event.characterId})));
  assert.equal(masks.length, 6);
  const tools = exportPublicTools();
  assert.equal(tools.xmlCounts.root, 'swf');
  assert.equal(tools.xmlStderr, '', 'swfmill warnings require explicit reconciliation');
  const tagNames = {0: 'End', 1: 'ShowFrame', 2: 'DefineShape', 9: 'SetBackgroundColor',
    11: 'DefineText', 12: 'DoAction', 18: 'SoundStreamHead', 19: 'SoundStreamBlock',
    21: 'DefineBitsJPEG2', 22: 'DefineShape2', 24: 'UnknownTag', 26: 'PlaceObject2',
    28: 'RemoveObject2', 32: 'DefineShape3', 34: 'DefineButton2', 39: 'DefineSprite',
    43: 'FrameLabel', 46: 'DefineMorphShape', 48: 'DefineFont2'};
  assert.deepEqual(Object.keys(binary.counts), Object.keys(tagNames), 'all binary tag kinds reconciled');
  for (const [code, name] of Object.entries(tagNames))
    assert.equal(tools.xmlCounts.counts[name] ?? 0, binary.counts[code] ?? 0,
      `XML versus binary tag count: ${name}`);
  assert.equal(tools.scripts.length, 8);
  const glossaryWords = new Map([[36, 'Function'], [37, 'Value'],
    [38, 'Relation'], [45, 'Rule'], [46, 'Input'], [47, 'Output']]);
  const buttonActionBindings = [...glossaryWords].map(([characterId, key]) => {
    const file = tools.scripts.find(item => item.path ===
      `scripts/DefineButton2_${characterId}/BUTTONCONDACTION on(release).as`);
    assert(file, `source button action ${characterId}`);
    assert(file.text.includes(`_global.KeyAttribute = "${key}";`), `source glossary key ${key}`);
    assert(file.text.includes('_root.DoHyperLinks();'), `source host glossary call ${key}`);
    assert(file.text.includes('_root.animation_mc.animation.stop();'), `source main stop ${key}`);
    return {characterId, key, trigger: 'on(release)',
      hostCall: '_root.DoHyperLinks()', mainPlaybackEffect: 'stop',
      actionSource: {path: file.path, bytes: file.bytes, sha256: file.sha256}};
  });
  for (const [frame, snippet] of [[1, '_level0.InternalPreloader.gotoAndPlay("jump_check");'],
    [6, 'stop();']]) {
    const file = tools.scripts.find(item => item.path === `scripts/frame_${frame}/DoAction.as`);
    assert(file?.text.includes(snippet), `root frame ${frame} action`);
  }
  const composition = {schemaVersion: 1, kind: 'alg-l06-p015-source-composition-v1',
    stage: {width: 800, height: 600, background: '#b8d8f7', fps: 12},
    root: {declaredFrames: 10, events: root.events, instances: root.instances},
    main: {domainId: 'sprite-270', declaredFrames: 914, rootEntryFrame: 6,
      rootPlacement: mainPlacement, events: main.events, instances: main.instances},
    allDomains: facts.frameDomains.domains.map(domain => ({domainId: domain.domainId,
      declaredFrames: domain.declaredFrameCount, observedFrames: domain.observedShowFrameCount,
      rootReachable: domain.staticallyRootReachable, parentDomainIds: domain.parentDomainIds,
      fingerprintSha256: domain.domainFingerprintSha256})),
    masks, morphs: binary.morphs, buttonActionBindings,
    buttons: text.buttonDefinitions.map(button => ({...button,
      placements: text.timelines.flatMap(timeline => timeline.instances
        .filter(instance => instance.characterId === button.characterId)
        .map(instance => ({domain: timeline.timelineId, firstFrame: instance.firstFrame,
          lastFrameExclusive: instance.lastFrameExclusive, depth: instance.depth})))})),
    tagCounts: facts.tagCounts};
  const boundary = {schemaVersion: 1, kind: 'alg-l06-p015-binary-boundary-v1',
    sourceSwfSha256: SWF_SHA, uncompressed: binary.uncompressed,
    domains: binary.domains, tagCountsByCode: binary.counts,
    actions: binary.actions, buttons: binary.buttons, morphs: binary.morphs,
    streams: binary.streams, trailers: binary.trailers,
    xmlReconciliation: {wellFormed: true, warnings: tools.xmlStderr,
      everyBinaryTagKindAndCountMatched: true, allDomainsEndAndShowFramesMatched: true,
      bytesAfterAnyEnd: 0, sourceAudioBlockCountThroughEnd: 879}};
  const scripts = {schemaVersion: 1, kind: 'alg-l06-p015-ffdec-scripts-v1',
    sourceSwfSha256: SWF_SHA, toolVersion: tools.versions.ffdec, files: tools.scripts};
  const outputs = new Map([
    ['source-facts-v1.json', json(facts)], ['source-text-v1.json', json(text)],
    ['source-composition-v1.json', json(composition)],
    ['binary-boundary-v1.json', json(boundary)],
    ['public-tool-scripts-v1.json', json(scripts)],
    ['swfmill-v1.xml.gz', gzipSync(tools.xml, {level: 9})],
  ]);
  const report = {schemaVersion: 1, kind: 'alg-l06-p015-source-audit-v1',
    animationId: ID, assetId: `swf-${SWF_SHA}`,
    status: 'source-audit-only; not-rendered-or-registered',
    generator: pin('scripts/audit-alg-l06-p015-source-v1.mjs', readPhysical(fileURLToPath(import.meta.url))),
    parserDependencies: ['scripts/build-g4-l3-machine-source-audits.mjs',
      'scripts/lib/swf-text-source-catalog.mjs', 'scripts/audit-alg-l06-p014-source-v1.mjs']
      .map(name => pin(name, readPhysical(path.join(PROJECT, name)))),
    source: pin(SWF, source), authoringEvidence: 'swf-only', flaPath: null,
    catalog: {...pin('catalog/g678-shared-catalog.v1.json', catalogBytes),
      stableLessonKey: lesson.stableLessonKey, globalOrdinal: 15, section: 'VB', sectionPageOrdinal: 5},
    tools: tools.versions,
    runtime: {header: facts.header, actionScript: facts.actionScript,
      domainCount: 2, mainDomain: 'sprite-270', mainFrames: 914,
      rootMainPlacement: mainPlacement, sourceTagCounts: facts.tagCounts},
    hostInteractions: {rootFrame1: 'InternalPreloader.gotoAndPlay("jump_check"); stop',
      rootFrame6: 'stop', glossaryButtons: buttonActionBindings,
      legacyHostCallImplementedByCanvas: false},
    complexity: {lane: 'interactive-understood; source-bound maintained adapter candidate',
      evidence: ['two AVM1 timeline action tags', 'six glossary button actions',
        '914-frame main domain', 'ten morph definitions', 'six source clip masks',
        '879 embedded audio blocks'], factoryScaleOutAuthorized: false},
    capabilityBoundary: {sourceStructureExtracted: true, xmlCompleteThroughEnd: true,
      actionScriptExecuted: false, originalRuntimeObserved: false, audioListened: false,
      humanReviewed: false, ownerAccepted: false, strictComplete: false, lessonPublished: false},
    artifacts: [...outputs].map(([name, bytes]) =>
      pin(`migrations/${ID}/audit/source-v1/${name}`, bytes))};
  outputs.set('source-audit-v1.json', json(report));
  return outputs;
}

function main() {
  const mode = process.argv[2];
  assert(process.argv.length === 3 && ['--build', '--check'].includes(mode),
    'usage: audit-alg-l06-p015-source-v1.mjs --build|--check');
  const outputs = auditP015Source();
  for (const [name, bytes] of outputs) {
    const target = path.join(AUDIT, name);
    if (mode === '--check') assert(fs.readFileSync(target).equals(bytes), `audit drift: ${name}`);
    else fs.writeFileSync(target, bytes);
  }
  console.log(JSON.stringify({status: mode === '--check' ? 'verified' : 'built',
    files: [...outputs].map(([name, bytes]) => pin(`migrations/${ID}/audit/source-v1/${name}`, bytes))}));
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
