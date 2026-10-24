#!/usr/bin/env node
/** Source-only, reproducible audit for the preserved ALG001 L6 P013 SWF. */
import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = 'shared-alg001-l06-p013';
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourcePath = 'G6-G8-shared/ALG001/L6/VB/L6VB04.swf';
const sourceSha = '1be47750557385ef91c648fb87fdcde642d342caadc35da7a1f7a2d1fdb11d35';
const saPath = 'G6-G8-shared/ALG001/L6/SA/L6VB04.mp3';
const saSha = '2db938405bd646e4bf37e0b9cdf5438cc65451a2d4f7304c93dbc2b6653e8575';
const lessonXmlPath = 'G6-G8-shared/ALG001/L6/index.xml';
const lessonXmlSha = '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c';
const hostDir = '/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1';
const hostScriptPath = path.join(hostDir, 'scripts/scripts/frame_35/DoAction.as');
const hostObserverPath = path.join(hostDir, 'scripts/scripts/frame_50/PlaceObject2_743_130/CLIPACTIONRECORD onClipEvent(enterFrame).as');
const auditDir = path.join(project, 'migrations', id, 'audit', 'source-v1');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const pin = (relative, bytes) => ({path: relative, bytes: bytes.length, sha256: sha(bytes)});

function readLocked(file, expectedBytes, expectedSha) {
  assert.equal(fs.realpathSync(file), file, `physical path: ${file}`);
  const before = fs.lstatSync(file, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink(), `ordinary source: ${file}`);
  const bytes = fs.readFileSync(file);
  const after = fs.lstatSync(file, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink']) assert.equal(before[key], after[key], `${key}: ${file}`);
  if (expectedBytes !== undefined) assert.equal(bytes.length, expectedBytes, `bytes: ${file}`);
  if (expectedSha !== undefined) assert.equal(sha(bytes), expectedSha, `SHA-256: ${file}`);
  return bytes;
}

function readPublicToolExports() {
  const scratch = '/Volumes/American Dream/hudongpin';
  assert.equal(fs.realpathSync(scratch), scratch);
  const temporary = fs.mkdtempSync(path.join(scratch, 'p013-source-audit-'));
  try {
    const xmlPath = path.join(temporary, 'movie.xml');
    const scriptDir = path.join(temporary, 'scripts');
    execFileSync('swfmill', ['-n', 'swf2xml', path.join(sourceRoot, sourcePath), xmlPath], {maxBuffer: 1024 * 1024});
    execFileSync('ffdec', ['-onerror', 'abort', '-export', 'script', scriptDir,
      path.join(sourceRoot, sourcePath)], {maxBuffer: 1024 * 1024});
    const xml = fs.readFileSync(xmlPath);
    assert(xml.includes(Buffer.from('<DefineSprite objectID="140" frames="372">')));
    assert(xml.includes(Buffer.from('<FrameLabel label="begin">')));
    assert(xml.includes(Buffer.from('<Color red="184" green="216" blue="247"/>')));
    const scripts = {};
    function visit(dir) {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
        const file = path.join(dir, entry.name);
        assert(!entry.isSymbolicLink(), 'FFDec export symlink');
        if (entry.isDirectory()) visit(file);
        else {
          assert(entry.isFile());
          scripts[path.relative(scriptDir, file).split(path.sep).join('/')] =
            fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n').trim();
        }
      }
    }
    visit(scriptDir);
    assert.deepEqual(scripts, {
      'scripts/DefineButton2_131/BUTTONCONDACTION on(release).as':
        'on(release){\n   _global.KeyAttribute = "Input";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}',
      'scripts/DefineButton2_137/BUTTONCONDACTION on(release).as':
        'on(release){\n   _global.KeyAttribute = "Output";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}',
      'scripts/frame_1/DoAction.as': '_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();',
      'scripts/frame_6/DoAction.as': 'stop();',
    });
    const swfmillVersion = spawnSync('swfmill', ['--version'], {encoding: 'utf8'});
    assert.equal(swfmillVersion.status, 0);
    assert.equal((swfmillVersion.stdout + swfmillVersion.stderr).trim(), 'swfmill 0.3.6');
    const ffdecVersion = execFileSync('ffdec', ['-help'], {encoding: 'utf8', maxBuffer: 1024 * 1024}).split('\n')[0].trim();
    assert.equal(ffdecVersion, 'JPEXS Free Flash Decompiler v.26.2.1');
    const morphIds = [...xml.toString('utf8').matchAll(/<DefineMorphShape objectID="(\d+)"/g)]
      .map(match => Number(match[1]));
    assert.equal(morphIds.length, 5);
    return {xmlGzip: gzipSync(xml, {level: 9}), scripts, morphIds,
      toolVersions: {swfmill: 'swfmill 0.3.6', ffdec: ffdecVersion}};
  } finally {
    fs.rmSync(temporary, {recursive: true, force: true});
  }
}

function audit() {
  assert.equal(fs.realpathSync(sourceRoot), sourceRoot, 'real AWS root, not a compatibility symlink');
  const swf = readLocked(path.join(sourceRoot, sourcePath), 269912, sourceSha);
  const sa = readLocked(path.join(sourceRoot, saPath), 327936, saSha);
  const xml = readLocked(path.join(sourceRoot, lessonXmlPath), 13926, lessonXmlSha);
  assert(xml.includes(Buffer.from('<Page Title="Input and Output" RandomAudio="" BGText="">VB/L6VB04.swf</Page>')));
  assert(xml.includes(Buffer.from('<SubPageTitle EngSubTitleName="2. Input and Output" SpanSubTitleName="Entrada y salida" SubTitleButtonName="L6VB04">VB/L6VB04.swf</SubPageTitle>')));
  const catalogBytes = readLocked(path.join(project, 'catalog/g678-shared-catalog.v1.json'));
  const hits = JSON.parse(catalogBytes).lessons.flatMap(lesson => lesson.pages.map(page => ({lesson, page})))
    .filter(({page}) => page.animationId === id);
  assert.equal(hits.length, 1);
  const {lesson, page} = hits[0];
  assert.deepEqual([lesson.stableLessonKey, page.globalOrdinal, page.sectionCode, page.sectionPageOrdinal],
    ['shared-alg001-l06', 13, 'VB', 3]);
  assert.deepEqual([page.viewPath, page.sourceSha256, page.authoringEvidence, page.flaPath],
    [sourcePath, sourceSha, 'swf-only', null]);
  assert.deepEqual([page.audioCueCandidates.length, page.audioCueCandidates[0].viewPath,
    page.audioCueCandidates[0].sha256], [1, saPath, saSha]);

  const facts = parseSwfSourceFacts(swf);
  const text = collectSwfTextSourceCatalog(swf);
  const stream = extractTerminalStream(swf, 'sprite-140');
  assert.deepEqual([facts.header.signature, facts.header.version, facts.header.fps, facts.header.rootFrameCount],
    ['CWS', 6, 12, 10]);
  assert.deepEqual([facts.header.stage.width, facts.header.stage.height], [800, 600]);
  assert.deepEqual(facts.frameDomains.domains.map(domain => [domain.domainId,
    domain.declaredFrameCount, domain.observedShowFrameCount]), [['root', 10, 10], ['sprite-140', 372, 372]]);
  assert.equal(facts.actionScript.version, 'AS1/2');
  assert.deepEqual([text.summary.textDefinitions, text.summary.decodedRuns, text.summary.unresolvedRuns,
    text.summary.buttonDefinitions, text.summary.bitmapDefinitions, text.summary.unparsedTags],
  [9, 18, 0, 2, 1, 0]);
  const root = text.timelines.find(timeline => timeline.timelineId === 'root');
  const main = text.timelines.find(timeline => timeline.timelineId === 'sprite-140');
  assert(root && main);
  const mainPlacement = root.events.find(event => event.kind === 'place' && event.characterId === 140);
  assert.deepEqual([mainPlacement.frame, mainPlacement.depth, mainPlacement.name.text, mainPlacement.matrix],
    [6, 2, 'animation', [1, 0, 0, 1, 8248, 5666]]);
  assert.deepEqual(root.events.filter(event => event.kind === 'action-bytes').map(event => event.frame), [1, 6]);
  assert.equal(main.events.filter(event => event.kind === 'action-bytes').length, 0);
  const buttons = [
    {characterId: 131, key: 'Input', firstFrame: 258, depth: 8,
      actionSha256: '2f92a394bed054aeca4ae6ed57b238a04f5b3aa261270c980d5f00a82c8f19a5'},
    {characterId: 137, key: 'Output', firstFrame: 297, depth: 14,
      actionSha256: '1262eac21bf8a718d551c8d7b046220855f8f878214783cfdfb7d0c37f5ff5c7'},
  ];
  for (const button of buttons) {
    const definition = text.buttonDefinitions.find(item => item.characterId === button.characterId);
    const instance = main.instances.find(item => item.characterId === button.characterId);
    assert(definition && instance);
    assert.equal(definition.actions.sha256, button.actionSha256);
    assert.deepEqual([instance.firstFrame, instance.lastFrameExclusive, instance.depth],
      [button.firstFrame, 373, button.depth]);
  }
  const masks = main.events.filter(event => event.kind === 'place' && event.clipDepth)
    .map(({frame, depth, clipDepth, characterId}) => ({frame, depth, clipDepth, characterId}));
  assert.deepEqual(masks, [
    {frame: 258, depth: 5, clipDepth: 10, characterId: 127},
    {frame: 297, depth: 11, clipDepth: 16, characterId: 127},
  ]);
  assert.deepEqual([stream.heads.length, stream.heads[0].domain, stream.heads[0].frame,
    stream.blocks.length, stream.blocks[0].frame, stream.blocks.at(-1).frame],
  [1, 'sprite-140', 1, 368, 2, 372]);
  assert.equal(sha(stream.mp3), '3d646619b33b9e859aff68bf331f224158916aa9f4e99b16cdc910791c7d41c1');
  const frameSet = new Set(stream.blocks.map(block => block.frame));
  const gapFrames = Array.from({length: 371}, (_, index) => index + 2).filter(frame => !frameSet.has(frame));
  assert.deepEqual(gapFrames, [253, 254, 255]);
  const zeroByteBlocks = stream.blocks.filter(block => block.mp3Bytes === 0).map(block => block.frame);
  assert.deepEqual(zeroByteBlocks, [3, 161, 252]);
  const sourceAudioProbe = spawnSync('ffprobe', ['-v', 'error', '-show_entries',
    'stream=codec_name,sample_rate,channels', '-of', 'json', 'pipe:0'],
  {input: stream.mp3, encoding: 'utf8', maxBuffer: 1024 * 1024});
  assert.equal(sourceAudioProbe.status, 0);
  const probe = JSON.parse(sourceAudioProbe.stdout).streams?.[0];
  assert.deepEqual([probe.codec_name, probe.sample_rate, probe.channels], ['mp3', '22050', 1]);
  const saInfo = JSON.parse(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration:stream=codec_name,sample_rate,channels', '-of', 'json',
    path.join(sourceRoot, saPath)], {encoding: 'utf8', maxBuffer: 1024 * 1024}));
  assert.equal(Number(saInfo.format.duration), 23.424);

  const hostSwf = readLocked(path.join(hostDir, 'source.swf'), 689006,
    '275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9');
  const hostScript = readLocked(hostScriptPath, 104008,
    '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74');
  const hostObserver = readLocked(hostObserverPath, 61,
    '0f74c16ab4c673bd21f5d82f4c7bd77f2c003198d8870bda7764b3cd7699c035');
  const hostSource = hostScript.toString('utf8');
  assert(hostSource.includes('function DoHyperLinks()'));
  assert(hostSource.includes('_loc2_.KeyAttribute += "~English";'));
  assert(hostSource.includes('_loc1_.m_c.doGetSubLink(_loc2_.KeyAttribute);'));
  assert(hostSource.includes('_loc2_.Pause = true;'));
  assert(hostSource.includes('if(_root.animation_mc.animation._currentframe > 1 && _root.animation_mc.animation._currentframe >= _root.animation_mc.animation._totalframes)'));
  assert(hostSource.includes('_root.animation_mc.animation.stop();'));
  assert(hostObserver.toString('utf8').includes('_root.doCheckPrevAndNext();'));
  const tools = readPublicToolExports();

  const sourceText = text.textDefinitions.map(definition => ({characterId: definition.characterId,
    sourceTagSha256: definition.sourceTagSha256,
    text: definition.runs.map(run => run.text).join(''),
    placements: main.instances.filter(instance => instance.characterId === definition.characterId)
      .map(instance => ({firstFrame: instance.firstFrame, lastFrameExclusive: instance.lastFrameExclusive,
        depth: instance.depth}))}));
  const composition = {schemaVersion: 1, kind: 'alg-l06-p013-source-composition-v1',
    coordinateUnit: 'twips', pixelDivisor: 20, stage: {width: 800, height: 600, background: '#b8d8f7'},
    root: {declaredFrames: 10, events: root.events, instances: root.instances},
    main: {domainId: 'sprite-140', declaredFrames: 372, rootEntryFrame: 6,
      rootPlacement: mainPlacement, eventCount: main.events.length, instanceCount: main.instances.length,
      masks, morphCharacterIds: tools.morphIds,
      buttonInstances: buttons.map(button => ({...button,
        sourceInstance: main.instances.find(instance => instance.characterId === button.characterId)}))},
    text: sourceText, tagCounts: facts.tagCounts};
  const streamStructure = {schemaVersion: 1, kind: 'alg-l06-p013-source-stream-structure-v1',
    domain: 'sprite-140', heads: stream.heads, blocks: stream.blocks,
    firstBlockFrame: 2, lastBlockFrame: 372, gapFrames, zeroByteBlocks,
    totalDeclaredSamples: stream.blocks.reduce((total, block) => total + block.samples, 0),
    concatenatedMp3: {bytes: stream.mp3.length, sha256: sha(stream.mp3), persistedByThisAudit: false,
      codec: 'mp3', sampleRateHz: 22050, channels: 1},
    separateSA: {path: saPath, bytes: sa.length, sha256: saSha,
      durationMsByFfprobe: 23424, language: 'undetermined-by-machine-audit',
      trigger: 'separate optional product control; no auto-play from locale'},
    originalRuntimePlaybackAndListening: 'unobserved'};
  const hostDisposition = {schemaVersion: 1, kind: 'alg-l06-p013-host-glossary-disposition-v1',
    sourcePage: pin(sourcePath, swf), lessonXml: pin(lessonXmlPath, xml),
    oldHostSwf: pin(path.join(hostDir, 'source.swf'), hostSwf),
    oldHostFunctionScript: pin(hostScriptPath, hostScript), oldHostFrameObserver: pin(hostObserverPath, hostObserver),
    exactPageBinding: {section: 'VB', reference: 'VB/L6VB04.swf', globalOrdinal: 13,
      rootEntryFrame: 6, mainInstanceName: 'animation', mainDomain: 'sprite-140', mainFrameCount: 372},
    buttons: buttons.map(({characterId, key, firstFrame, depth, actionSha256}) =>
      ({characterId, sourceKeyAttribute: key, firstFrame, depth, actionSha256,
        event: 'release', sourceEffects: ['set _global.KeyAttribute', 'call _root.DoHyperLinks',
          'stop _root.animation_mc.animation']})),
    staticOldHost: {DoHyperLinks: ['if key-term lesson not OFF', 'pause host playback',
      'append ~English to KeyAttribute', 'call m_c.doGetSubLink'],
      terminal: 'on enterFrame, non-FQ active animation at or past totalFrames is stopped',
      actualLaunchObserved: false},
    modernDecisionBoundary: 'Map Input/Output to native semantic glossary and pause/close/resume lifecycle after browser tests; do not run old host or equate a source call with product behavior.'};
  const scripts = {schemaVersion: 1, kind: 'alg-l06-p013-public-tool-scripts-v1',
    sourceSwfSha256: sourceSha, toolVersions: tools.toolVersions, files: tools.scripts};
  const outputs = new Map([
    ['source-facts-v1.json', json(facts)], ['source-text-v1.json', json(text)],
    ['source-composition-v1.json', json(composition)],
    ['source-stream-structure-v1.json', json(streamStructure)],
    ['host-glossary-disposition-v1.json', json(hostDisposition)],
    ['public-tool-scripts-v1.json', json(scripts)],
    ['swfmill-v1.xml.gz', tools.xmlGzip],
  ]);
  const report = {schemaVersion: 1, kind: 'alg-l06-p013-source-audit-v1', animationId: id,
    assetId: `swf-${sourceSha}`, status: 'source-audit-only; not-rendered-or-registered',
    source: pin(sourcePath, swf), authoringEvidence: 'swf-only',
    catalog: {...pin('catalog/g678-shared-catalog.v1.json', catalogBytes),
      lessonKey: lesson.stableLessonKey, globalOrdinal: 13, section: 'VB', sectionPageOrdinal: 3},
    tools: tools.toolVersions,
    runtime: {header: facts.header, background: '#b8d8f7', actionScript: facts.actionScript,
      domains: facts.frameDomains.domains.map(domain => ({domainId: domain.domainId,
        declaredFrames: domain.declaredFrameCount, observedFrames: domain.observedShowFrameCount,
        rootReachable: domain.staticallyRootReachable, parentDomainIds: domain.parentDomainIds,
        fingerprintSha256: domain.domainFingerprintSha256})),
      tagCounts: facts.tagCounts, rootMainPlacement: mainPlacement},
    teaching: {sourceText, buttons: hostDisposition.buttons, masks,
      morphCharacterIds: tools.morphIds,
      sourceButtonsAreGlossaryCalls: true, buttonPlacementStartFrames: [258, 297],
      mainOwnDoActionCount: 0, sourceRootScripts: [1, 6]},
    audio: {mainStream: {domain: 'sprite-140', blocks: 368, firstFrame: 2, lastFrame: 372,
      gapFrames, zeroByteBlocks, mp3Sha256: sha(stream.mp3), sampleRateHz: 22050, channels: 1},
      separateSA: {path: saPath, bytes: sa.length, sha256: saSha, durationMsByFfprobe: 23424,
        acceptance: 'not-listened; source candidate only'}},
    legacyHost: {sourceScriptSha256: sha(hostScript), sourceObserverSha256: sha(hostObserver),
      glossary: 'DoHyperLinks routes KeyAttribute plus ~English through m_c.doGetSubLink and pauses host',
      conditionalTerminal: 'old host stops non-FQ animation at its totalFrames; original runtime unobserved'},
    lane: {classification: 'interactive-understood-candidate', automaticGenerationAuthorized: false,
      evidence: ['two fully extracted Input/Output release handlers', 'single root-reachable sprite',
        'no child DoAction', 'continuous stream and 5 morph tags require frame/audio handling'],
      nextImplementation: 'source-specific maintained Canvas producer plus explicit Input/Output glossary adapter and continuous audio clock; reuse P012/P010 only after source and host lifecycle checks'},
    capabilityBoundary: {extracted: ['timeline', 'text', 'buttons', 'root scripts', 'stream structure',
      'separate SA file', 'static old-host dispatch'],
      unassessed: ['actual old-host launch and natural interaction trace', 'full-frame visual fidelity',
        'audible source and Spanish listening', 'Replay/close/resume in real My Lesson',
        'human/Owner/strict/release/publication']},
    artifacts: [...outputs].map(([name, bytes]) => pin(`migrations/${id}/audit/source-v1/${name}`, bytes))};
  outputs.set('source-audit-v1.json', json(report));
  return outputs;
}

function main() {
  const check = process.argv.includes('--check');
  assert(process.argv.length <= 3 && (process.argv.length === 2 || check), 'Only --check is supported');
  const outputs = audit();
  if (!check) fs.mkdirSync(auditDir, {recursive: true});
  for (const [name, bytes] of outputs) {
    const target = path.join(auditDir, name);
    if (check) assert(fs.readFileSync(target).equals(bytes), `audit drift: ${name}`);
    else fs.writeFileSync(target, bytes);
  }
  console.log(`${check ? 'CHECK' : 'WROTE'} ${id} source audit: ${outputs.size} artifacts; SWF ${sourceSha}`);
}

main();
