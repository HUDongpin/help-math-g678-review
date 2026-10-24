#!/usr/bin/env node
/** Reproducible, source-only audit of the shipped ALG001 L6 P014 SWF. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync, inflateSync} from 'node:zlib';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const project = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const id = 'shared-alg001-l06-p014';
const root = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const swfPath = 'G6-G8-shared/ALG001/L6/VB/L6VB05.swf';
const sourceSha = 'aed0f7755d4f691cefcc28c815acc6b9d083fdfaae88ff385f22d3b32ba07603';
const lessonXmlPath = 'G6-G8-shared/ALG001/L6/index.xml';
const saPath = 'G6-G8-shared/ALG001/L6/SA/L6VB05.mp3';
const discoveryPath = 'output/alg-l06-p014-discovery-v1/discovery-v1.json';
const auditDir = path.join(project, 'migrations', id, 'audit', 'source-v1');
const outputDir = path.join(project, 'output', 'alg-l06-p014-source-v1');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);
const pin = (location, bytes) => ({path: location, bytes: bytes.length, sha256: sha(bytes)});

function locked(location, expected) {
  assert.equal(fs.realpathSync(location), location, `physical path: ${location}`);
  const before = fs.lstatSync(location, {bigint: true});
  assert(before.isFile() && !before.isSymbolicLink(), `ordinary file: ${location}`);
  const bytes = fs.readFileSync(location);
  const after = fs.lstatSync(location, {bigint: true});
  for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'nlink'])
    assert.equal(before[key], after[key], `input drift ${key}: ${location}`);
  if (expected) {
    assert.equal(bytes.length, expected.bytes, `byte count: ${location}`);
    assert.equal(sha(bytes), expected.sha256, `SHA-256: ${location}`);
  }
  return bytes;
}

function run(command, args) {
  const result = spawnSync(command, args, {encoding: 'utf8', maxBuffer: 8 * 1024 * 1024});
  assert.equal(result.error, undefined, `${command}: ${result.error?.message}`);
  assert.equal(result.status, 0, `${command}: ${result.stderr}`);
  return result;
}

/** This walker checks container boundaries and retains bytes after a nested End. */
export function walkBinarySwf(source) {
  assert.equal(source.toString('ascii', 0, 3), 'CWS');
  const bytes = Buffer.concat([Buffer.from('FWS'), source.subarray(3, 8), inflateSync(source.subarray(8))]);
  assert.equal(bytes.length, source.readUInt32LE(4), 'declared uncompressed bytes');
  const rectBytes = Math.ceil((5 + 4 * (bytes[8] >> 3)) / 8);
  const tagStart = 8 + rectBytes + 4;
  const domains = [], tags = [], actions = [], buttons = [], morphs = [], streams = [], trailers = [];
  const counts = new Map();
  function scan(start, end, domain, declaredFrames, nesting) {
    assert(nesting <= 64, 'sprite recursion limit');
    let at = start, frame = 1, ended = false;
    while (at < end) {
      const offset = at;
      assert(at + 2 <= end, `truncated tag header ${domain}`);
      const packed = bytes.readUInt16LE(at); at += 2;
      const code = packed >> 6;
      let length = packed & 63;
      if (length === 63) {
        assert(at + 4 <= end, `truncated extended tag length ${domain}`);
        length = bytes.readUInt32LE(at); at += 4;
      }
      const bodyStart = at, bodyEnd = at + length;
      assert(bodyEnd <= end, `tag ${code} exceeds ${domain} container`);
      const body = bytes.subarray(bodyStart, bodyEnd);
      tags.push({domain, frame, code, offset, bodyStart, bodyEnd, bytes: bodyEnd - offset});
      counts.set(code, (counts.get(code) ?? 0) + 1);
      if (code === 39) {
        assert(length >= 4, 'truncated DefineSprite');
        scan(bodyStart + 4, bodyEnd, `sprite-${body.readUInt16LE(0)}`, body.readUInt16LE(2), nesting + 1);
      }
      if (code === 12) actions.push({domain, frame, offset, bytes: length,
        payloadSha256: sha(body), payloadHex: body.toString('hex')});
      if (code === 34) buttons.push({domain, frame, offset, characterId: body.readUInt16LE(0),
        sourceTagSha256: sha(bytes.subarray(offset, bodyEnd)), sourceTagBytes: bodyEnd - offset,
        sourceTagHex: bytes.subarray(offset, bodyEnd).toString('hex')});
      if (code === 46) morphs.push({domain, frame, offset, characterId: body.readUInt16LE(0),
        sourceTagSha256: sha(bytes.subarray(offset, bodyEnd))});
      if ([18, 19, 45].includes(code)) streams.push({domain, frame, offset, code,
        payloadBytes: length, payloadSha256: sha(body)});
      at = bodyEnd;
      if (code === 1) frame++;
      if (code === 0) {ended = true; break;}
    }
    assert(ended, `missing End tag: ${domain}`);
    assert.equal(frame - 1, declaredFrames, `ShowFrame count: ${domain}`);
    const record = {domain, declaredFrames, observedShowFrames: frame - 1,
      firstTagOffset: start, endTagEndOffset: at, containerEndOffset: end,
      trailingBytesAfterEnd: end - at};
    domains.push(record);
    if (at < end) {
      const tail = bytes.subarray(at, end);
      const mpeg2Layer3SyncOffsets = [];
      for (let index = 0; index + 4 <= tail.length; index++)
        if (tail.readUInt32BE(index) === 0xfff350c0) mpeg2Layer3SyncOffsets.push(at + index);
      trailers.push({domain, startOffset: at, endOffset: end, bytes: tail.length,
        sha256: sha(tail), nonzeroBytes: tail.reduce((count, byte) => count + Number(byte !== 0), 0),
        first64Hex: tail.subarray(0, 64).toString('hex'), last32Hex: tail.subarray(-32).toString('hex'),
        mpeg2Layer3SyncOffsets});
    }
  }
  scan(tagStart, bytes.length, 'root', bytes.readUInt16LE(tagStart - 2), 0);
  const offsetOwner = offset => {
    if (offset < 0 || offset >= bytes.length) return {kind: 'outside-uncompressed-file'};
    const trailer = trailers.find(item => item.startOffset <= offset && offset < item.endOffset);
    if (trailer) return {kind: 'bytes-after-End', domain: trailer.domain,
      startOffset: trailer.startOffset, endOffset: trailer.endOffset};
    const candidates = tags.filter(tag => tag.offset <= offset && offset < tag.bodyEnd)
      .sort((a, b) => (a.bodyEnd - a.offset) - (b.bodyEnd - b.offset));
    const tag = candidates[0];
    return tag ? {kind: 'parsed-tag', domain: tag.domain, frame: tag.frame,
      code: tag.code, tagOffset: tag.offset, tagEndOffset: tag.bodyEnd} : {kind: 'unclassified-header'};
  };
  return {uncompressed: {bytes: bytes.length, sha256: sha(bytes), firstTagOffset: tagStart},
    domains: domains.sort((a, b) => a.domain === 'root' ? -1 : b.domain === 'root' ? 1 :
      Number(a.domain.slice(7)) - Number(b.domain.slice(7))),
    counts: Object.fromEntries([...counts].sort(([a], [b]) => a - b)),
    actions, buttons, morphs, streams, trailers, tags, offsetOwner};
}

function publicExports(source, discovery) {
  fs.mkdirSync(outputDir, {recursive: true});
  const scratch = fs.mkdtempSync(path.join(outputDir, '.scratch-'));
  try {
    const xmlFile = path.join(scratch, 'movie.xml');
    const scriptsDir = path.join(scratch, 'scripts');
    const swfmill = run('swfmill', ['-n', 'swf2xml', path.join(root, swfPath), xmlFile]);
    const xml = fs.readFileSync(xmlFile);
    assert.equal(sha(xml), discovery.tools.exports.swfmillXml.sha256,
      'fresh swfmill output must equal discovery bytes');
    const xmlInspection = run('python3', ['-c', `import collections,json,sys,xml.etree.ElementTree as E\nroot=E.parse(sys.argv[1]).getroot()\ncounts=collections.Counter(x.tag for x in root.iter())\nprint(json.dumps({'root':root.tag,'counts':dict(sorted(counts.items()))}))`, xmlFile]);
    const xmlStructure = JSON.parse(xmlInspection.stdout);
    run('ffdec', ['-onerror', 'abort', '-export', 'script', scriptsDir, path.join(root, swfPath)]);
    const scripts = [];
    function visit(dir) {
      for (const entry of fs.readdirSync(dir, {withFileTypes: true}).sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
        const location = path.join(dir, entry.name);
        assert(!entry.isSymbolicLink(), 'FFDec export symlink');
        if (entry.isDirectory()) visit(location);
        else {
          assert(entry.isFile(), 'FFDec export ordinary file');
          const bytes = fs.readFileSync(location);
          scripts.push({...pin(path.relative(scriptsDir, location).split(path.sep).join('/'), bytes),
            text: bytes.toString('utf8')});
        }
      }
    }
    visit(scriptsDir);
    const original = discovery.tools.exports.ffdecScripts;
    assert.equal(scripts.length, original.length, 'FFDec script count');
    for (const item of scripts) {
      const matched = original.find(prior => prior.path === `ffdec-scripts/${item.path}`);
      assert(matched, `missing discovery script ${item.path}`);
      assert.deepEqual([item.bytes, item.sha256], [matched.bytes, matched.sha256],
        `fresh FFDec export: ${item.path}`);
    }
    const swfmillVersion = run('swfmill', ['--version']);
    const ffdecVersion = run('ffdec', ['-help']).stdout.split('\n')[0].trim();
    const ffdecDump = run('ffdec', ['-dumpSWF', path.join(root, swfPath)]);
    assert.equal((swfmillVersion.stdout + swfmillVersion.stderr).trim(), 'swfmill 0.3.6');
    assert.equal(ffdecVersion, 'JPEXS Free Flash Decompiler v.26.2.1');
    const dumpLines = ffdecDump.stdout.split('\n');
    const findDumpLine = (offset, fragment) => {
      const line = dumpLines.find(value => value.startsWith(`${offset}:`) && value.includes(fragment));
      assert(line, `FFDec dump missing ${offset} ${fragment}`);
      return line;
    };
    const ffdecBoundaryLines = [findDumpLine('000188eb', 'SoundStreamBlock'),
      findDumpLine('000188f5', 'ShowFrame'), findDumpLine('00018a7b', 'DefineMorphShape')];
    return {xml, xmlStructure, swfmillStderr: swfmill.stderr, scripts,
      ffdecDump: Buffer.from(ffdecDump.stdout), ffdecBoundaryLines,
      versions: {swfmill: 'swfmill 0.3.6', ffdec: ffdecVersion, pythonXmlParser: 'xml.etree.ElementTree'}};
  } finally {
    fs.rmSync(scratch, {recursive: true, force: true});
  }
}

function audit() {
  assert.equal(fs.realpathSync(root), root, 'real AWS source root required');
  const swf = locked(path.join(root, swfPath), {bytes: 566603, sha256: sourceSha});
  const lessonXml = locked(path.join(root, lessonXmlPath),
    {bytes: 13926, sha256: '9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'});
  const sa = locked(path.join(root, saPath),
    {bytes: 136080, sha256: 'b506e9e83e9716ed9c57d358f3f6664b5e3b8d8735d94ea4acb57449e148592d'});
  const catalogBytes = locked(path.join(project, 'catalog/g678-shared-catalog.v1.json'));
  const discoveryBytes = locked(path.join(project, discoveryPath));
  const discovery = JSON.parse(discoveryBytes);
  assert.equal(discovery.physicalSource.swf.sha256, sourceSha);
  const matches = JSON.parse(catalogBytes).lessons.flatMap(lesson => lesson.pages.map(page => ({lesson, page})))
    .filter(({page}) => page.animationId === id);
  assert.equal(matches.length, 1);
  const {lesson, page} = matches[0];
  assert.deepEqual([lesson.stableLessonKey, page.globalOrdinal, page.sectionCode,
    page.sectionPageOrdinal, page.viewPath, page.sourceSha256, page.authoringEvidence, page.flaPath],
  ['shared-alg001-l06', 14, 'VB', 4, swfPath, sourceSha, 'swf-only', null]);
  assert(lessonXml.includes(Buffer.from('VB/L6VB05.swf')));
  const facts = parseSwfSourceFacts(swf);
  const text = collectSwfTextSourceCatalog(swf);
  const binary = walkBinarySwf(swf);
  assert.deepEqual([facts.header.signature, facts.header.version, facts.header.fps,
    facts.header.stage.width, facts.header.stage.height, facts.header.rootFrameCount],
  ['CWS', 6, 12, 800, 600, 10]);
  assert.equal(binary.uncompressed.sha256, facts.header.uncompressedSha256);
  assert.equal(facts.actionScript.version, 'AS1/2');
  assert.deepEqual([facts.frameDomains.domains.length, binary.domains.length,
    binary.actions.length, binary.buttons.length, binary.morphs.length], [14, 14, 31, 7, 62]);
  assert.deepEqual(binary.domains.map(domain => [domain.domain,
    domain.declaredFrames, domain.observedShowFrames]),
    facts.frameDomains.domains.map(domain => [domain.domainId,
      domain.declaredFrameCount, domain.observedShowFrameCount]));
  assert.deepEqual(text.summary.dynamicFields, 3);
  assert.equal(text.summary.unparsedTags, 0);
  const rootTimeline = text.timelines.find(timeline => timeline.timelineId === 'root');
  const mainTimeline = text.timelines.find(timeline => timeline.timelineId === 'sprite-227');
  assert(rootTimeline && mainTimeline);
  const mainPlacement = rootTimeline.events.find(event => event.kind === 'place' && event.characterId === 227);
  assert.deepEqual([mainPlacement.frame, mainPlacement.depth, mainPlacement.name.text, mainPlacement.matrix],
    [6, 3, 'animation', [1, 0, 0, 1, 8248, 5666]]);
  assert.equal(mainTimeline.declaredFrameCount, 449);
  const sourceMasks = text.timelines.flatMap(timeline => timeline.events
    .filter(event => event.kind === 'place' && event.clipDepth !== undefined)
    .map(event => ({domain: timeline.timelineId, frame: event.frame, depth: event.depth,
      clipDepth: event.clipDepth, characterId: event.characterId})));
  assert.equal(sourceMasks.length, 3);
  const trailing = text.timelines.filter(timeline => timeline.trailingAfterEnd !== null);
  assert.deepEqual(trailing.map(timeline => [timeline.timelineId,
    timeline.trailingAfterEnd.bytes, timeline.trailingAfterEnd.allZero]), [['sprite-83', 386, false]]);
  assert.equal(binary.trailers.length, 1);
  assert.deepEqual([binary.trailers[0].domain, binary.trailers[0].startOffset,
    binary.trailers[0].endOffset, binary.trailers[0].bytes], ['sprite-83', 100601, 100987, 386]);
  assert.deepEqual(binary.trailers[0].mpeg2Layer3SyncOffsets, [100727, 100857]);
  assert.equal(binary.trailers[0].sha256,
    'd14a608f74eab33aa50401e45f0226b845a8b29aa02417254d15dc8675accaa0');
  assert.equal(binary.trailers[0].nonzeroBytes, 17);
  const sprite83LastStream = binary.streams.filter(stream => stream.domain === 'sprite-83').at(-1);
  assert.deepEqual([sprite83LastStream.frame, sprite83LastStream.offset,
    sprite83LastStream.payloadBytes], [31, 100587, 4]);
  const tools = publicExports(swf, discovery);
  assert.equal(tools.xmlStructure.root, 'swf');
  const comparedNames = {0: 'End', 1: 'ShowFrame', 2: 'DefineShape', 9: 'SetBackgroundColor',
    11: 'DefineText', 12: 'DoAction', 18: 'SoundStreamHead', 19: 'SoundStreamBlock',
    22: 'DefineShape2', 24: 'UnknownTag', 26: 'PlaceObject2', 28: 'RemoveObject2', 32: 'DefineShape3',
    34: 'DefineButton2', 35: 'DefineBitsJPEG3', 37: 'DefineEditText', 39: 'DefineSprite',
    43: 'FrameLabel', 46: 'DefineMorphShape', 48: 'DefineFont2'};
  for (const [code, name] of Object.entries(comparedNames))
    assert.equal(tools.xmlStructure.counts[name] ?? 0, binary.counts[code] ?? 0,
      `swfmill versus binary tag count: ${name}`);
  assert.equal(Object.keys(comparedNames).length, Object.keys(binary.counts).length,
    'every binary tag kind has an XML count disposition');
  assert.equal(Object.values(binary.counts).reduce((a, b) => a + b, 0),
    Object.values(facts.tagCounts).reduce((a, b) => a + b, 0));
  const warningLines = tools.swfmillStderr.trim().split('\n');
  assert.equal(warningLines.length, 3);
  assert(warningLines[0].startsWith('WARNING: end of tag UnknownTag'));
  assert(warningLines[1].startsWith('WARNING: end of tag DefineSprite'));
  assert.equal(warningLines[2], 'WARNING: reached EOF while reading SWF');
  const warningOffsets = warningLines.slice(0, 2).map(line =>
    [...line.matchAll(/@(\d+)/g)].map(match => Number(match[1])));
  assert.deepEqual(warningOffsets, [[687692, 5868279], [5868279, 100979]]);
  const warningReconciliation = {swfmillExitCode: 0, stderr: tools.swfmillStderr,
    warnings: warningLines.map((line, index) => ({line,
      offsets: (warningOffsets[index] ?? []).map(offset => ({offset, binaryOwner: binary.offsetOwner(offset)}))})),
    xmlWellFormed: true, xmlTagCountsMatchBinaryThroughEnd: true,
    xmlIncludesAllBinaryBytes: false,
    unresolvedBinaryTail: binary.trailers,
    ffdecTagDump: {pin: pin('migrations/shared-alg001-l06-p014/audit/source-v1/ffdec-tag-dump-v1.txt',
      tools.ffdecDump), boundaryLines: tools.ffdecBoundaryLines,
      treatment: 'FFDec lists sprite-83 frame31 SoundStreamBlock (4-byte payload) and ShowFrame, then resumes at next root DefineMorphShape at uncompressed offset 100987. It does not classify the 386-byte trailer as an action or audio tag.'},
    taggedAudioTraversal: {soundStreamHeadCount: binary.streams.filter(stream =>
      stream.code === 18 || stream.code === 45).length,
      soundStreamBlockCount: binary.streams.filter(stream => stream.code === 19).length,
      sprite83FinalTaggedBlock: sprite83LastStream,
      trailerAppendedToAudio: false,
      interpretation: 'All declared SoundStreamBlock tags through each End are traversed. Sprite-83 frame31 block has four metadata bytes and no tagged MP3 payload. Two MPEG2 Layer-III-looking sync headers 130 bytes apart appear in untagged trailing bytes; they are not automatically playable authored audio.'},
    disposition: 'The XML is usable only for tags through each End. Sprite-83 contains 386 bytes with 17 nonzero bytes after its End inside the DefineSprite container; XML and FFDec tag lists omit them. Do not infer complete source or audio semantics from those exports.'};
  assert.deepEqual([warningReconciliation.taggedAudioTraversal.soundStreamHeadCount,
    warningReconciliation.taggedAudioTraversal.soundStreamBlockCount], [8, 624]);
  const main = facts.frameDomains.domains.find(domain => domain.domainId === 'sprite-227');
  const summary = {schemaVersion: 1, kind: 'alg-l06-p014-source-composition-v1',
    stage: {width: 800, height: 600, background: '#b8d8f7', fps: 12},
    root: {declaredFrames: 10, events: rootTimeline.events, instances: rootTimeline.instances},
    main: {domainId: 'sprite-227', declaredFrames: 449, rootEntryFrame: 6,
      rootPlacement: mainPlacement, events: mainTimeline.events, instances: mainTimeline.instances,
      masks: sourceMasks.filter(mask => mask.domain === 'sprite-227')},
    allDomains: facts.frameDomains.domains.map(domain => ({domainId: domain.domainId,
      declaredFrames: domain.declaredFrameCount, observedFrames: domain.observedShowFrameCount,
      rootReachable: domain.staticallyRootReachable, parentDomainIds: domain.parentDomainIds,
      fingerprintSha256: domain.domainFingerprintSha256})),
    masks: sourceMasks, morphs: binary.morphs,
    buttons: text.buttonDefinitions.map(button => ({...button,
      placements: text.timelines.flatMap(timeline => timeline.instances
        .filter(instance => instance.characterId === button.characterId)
        .map(instance => ({domain: timeline.timelineId, firstFrame: instance.firstFrame,
          lastFrameExclusive: instance.lastFrameExclusive, depth: instance.depth})))})),
    dynamicFields: text.textDefinitions.filter(definition => definition.kind === 'dynamic-field'),
    tagCounts: facts.tagCounts};
  const raw = {schemaVersion: 1, kind: 'alg-l06-p014-binary-boundary-v1',
    sourceSwfSha256: sourceSha, uncompressed: binary.uncompressed,
    domains: binary.domains, tagCountsByCode: binary.counts,
    actions: binary.actions, buttons: binary.buttons, morphs: binary.morphs,
    streams: binary.streams, trailers: binary.trailers,
    warningReconciliation};
  const scripts = {schemaVersion: 1, kind: 'alg-l06-p014-ffdec-scripts-v1',
    sourceSwfSha256: sourceSha, toolVersion: tools.versions.ffdec, files: tools.scripts};
  const outputs = new Map([
    ['source-facts-v1.json', json(facts)],
    ['source-text-v1.json', json(text)],
    ['source-composition-v1.json', json(summary)],
    ['binary-boundary-v1.json', json(raw)],
    ['public-tool-scripts-v1.json', json(scripts)],
    ['ffdec-tag-dump-v1.txt', tools.ffdecDump],
    ['swfmill-v1.xml.gz', gzipSync(tools.xml, {level: 9})],
  ]);
  const report = {schemaVersion: 1, kind: 'alg-l06-p014-source-audit-v1',
    animationId: id, assetId: `swf-${sourceSha}`,
    status: 'source-audit-only; not-rendered-or-registered',
    generator: pin('scripts/audit-alg-l06-p014-source-v1.mjs',
      locked(fileURLToPath(import.meta.url))),
    parsers: [
      pin('scripts/build-g4-l3-machine-source-audits.mjs',
        locked(path.join(project, 'scripts/build-g4-l3-machine-source-audits.mjs'))),
      pin('scripts/lib/swf-text-source-catalog.mjs',
        locked(path.join(project, 'scripts/lib/swf-text-source-catalog.mjs'))),
    ],
    source: pin(swfPath, swf), authoringEvidence: 'swf-only', flaPath: null,
    catalog: {...pin('catalog/g678-shared-catalog.v1.json', catalogBytes),
      stableLessonKey: lesson.stableLessonKey, globalOrdinal: 14, section: 'VB', sectionPageOrdinal: 4},
    lessonXml: pin(lessonXmlPath, lessonXml), separateSaCandidate: pin(saPath, sa),
    discovery: pin(discoveryPath, discoveryBytes), tools: tools.versions,
    runtime: {header: facts.header, actionScript: facts.actionScript,
      domainCount: binary.domains.length, mainDomain: main.domainId,
      mainFrames: main.declaredFrameCount, rootMainPlacement: mainPlacement,
      sourceTagCounts: facts.tagCounts},
    complexity: {lane: 'behavior-heavy; advanced-manual candidate',
      evidence: ['31 AVM1 DoAction tags across nested domains', 'seven button definitions',
        'three dynamic fields', '62 morph definitions', 'eight embedded stream domains',
        'three source masks', 'unresolved 386-byte sprite-83 tail'],
      factoryScaleOutAuthorized: false},
    warningReconciliation,
    capabilityBoundary: {sourceStructureExtracted: true,
      xmlCompleteStructuralEvidence: false, originalRuntimeObserved: false,
      audioListened: false, humanReviewed: false, ownerAccepted: false,
      strictComplete: false, lessonPublished: false},
    artifacts: [...outputs].map(([name, bytes]) =>
      pin(`migrations/${id}/audit/source-v1/${name}`, bytes))};
  outputs.set('source-audit-v1.json', json(report));
  const result = {schemaVersion: 1, kind: 'alg-l06-p014-source-audit-result-v1',
    source: report.source, status: report.status,
    audit: pin(`migrations/${id}/audit/source-v1/source-audit-v1.json`, outputs.get('source-audit-v1.json')),
    warning: 'swfmill XML omits 386 nonzero bytes after sprite-83 End; use binary-boundary-v1.json',
    next: 'Source-grounded branch/option, audio, Canvas and real-host work remain separate; no registration or acceptance.'};
  return {outputs, result};
}

function main() {
  const check = process.argv.includes('--check');
  assert(process.argv.length === (check ? 3 : 2) && (!check || process.argv[2] === '--check'),
    'only --check is supported');
  const {outputs, result} = audit();
  if (!check) fs.mkdirSync(auditDir, {recursive: true});
  for (const [name, bytes] of outputs) {
    const target = path.join(auditDir, name);
    if (check) assert(fs.readFileSync(target).equals(bytes), `audit drift: ${name}`);
    else fs.writeFileSync(target, bytes);
  }
  const resultPath = path.join(outputDir, 'source-audit-result-v1.json');
  const resultBytes = json(result);
  if (check) assert(fs.readFileSync(resultPath).equals(resultBytes), 'result drift');
  else fs.writeFileSync(resultPath, resultBytes);
  console.log(`${check ? 'CHECK' : 'WROTE'} ${id}: ${outputs.size} source artifacts; XML tail unresolved`);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
