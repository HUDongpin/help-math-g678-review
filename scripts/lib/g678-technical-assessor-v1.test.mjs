import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {PNG} from 'pngjs';
import {assessPage, assessCatalog} from './g678-technical-assessor-v1.mjs';
import {fixture} from './g678-technical-assessor-fixture-v1.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
function setup(t) {const root = fs.mkdtempSync(path.join(directory, '.test-')); t.after(() => fs.rmSync(root, {recursive: true, force: true})); return fixture(root);}
function reject(name, mutate, code) {test(name, t => {const f = setup(t); mutate(f); const result = assessPage(f); assert.notEqual(result.status, 'pass'); assert.ok(result.issues.some(i => i.code === code), JSON.stringify(result.issues));});}

test('all six complete source-bound cells pass from raw state, never from caller passed flags', t => {
  const f = setup(t); f.raw.passed = false; for (const c of f.raw.cells) c.passed = false;
  const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues)); assert.equal(result.cellResults.length, 6); assert.deepEqual(result.localeGaps, []);
  assert.equal(assessCatalog({expectedAnimationIds: [f.contract.animationId], pages: [f], root: f.root}).exitCode, 0);
});
reject('passed true with no browser records cannot pass', f => {f.raw = {passed: true};}, 'raw-source-identity-mismatch');
reject('missing one locale/viewport cell stays not-run', f => {f.raw.cells.pop();}, 'required-cell-not-run');
reject('duplicate matrix cells cannot satisfy six configurations', f => {f.raw.cells[5] = structuredClone(f.raw.cells[4]);}, 'duplicate-cell-record');
reject('320/root16 cannot replace required enlarged text', f => {f.raw.cells[2].config = {...f.raw.cells[2].config, rootFontPx: 16};}, 'actual-cell-configuration-mismatch');
reject('claimed config does not replace measured viewport', f => {delete f.raw.cells[0].documents[0].samples[0].viewport;}, 'sample-viewport-not-measured-or-mismatched');
reject('empty source SHA cannot fall through defaults', f => {f.raw.source = {...f.raw.source, sha256: ''};}, 'raw-source-identity-mismatch');
reject('source files must match retained hashes', f => {fs.appendFileSync(path.join(f.root, 'synthetic.swf'), 'drift');}, 'artifact-read-or-hash-failed');
reject('preflight/postflight input mismatch fails', f => {f.raw.postflightPins = [];}, 'input-drift-or-incomplete-preflight-postflight');
reject('expectations cannot change without new contract binding', f => {f.contract.terminal.frame = 99;}, 'contract-file-content-mismatch');
reject('null minimum duration is unsupported, never zero', f => {f.contract.terminal.minimumDurationMs = null;}, 'source-terminal-predicate-required');
reject('unknown branch cannot receive a page pass', f => {f.contract.interactions.unknowns = ['unresolved script'];}, 'interactions-unknowns');
reject('omitted error logs fail', f => {delete f.raw.cells[0].networkErrors;}, 'networkErrors-missing-or-nonempty');
reject('console/resource errors are not suppressed', f => {f.raw.cells[0].networkErrors.push({status: 404, url: '/audio.mp3'});}, 'networkErrors-missing-or-nonempty');
reject('raw log clearing cannot hide retained errors', f => {f.raw.cells[0].logPin = f.put('tampered-logs.json', {errors: [], consoleErrors: ['runtime error'], networkErrors: [], cleanupErrors: []});}, 'retained-logs-differ-from-observations');
reject('parent-frame-only observations cannot prove playback', f => {for (const s of f.raw.cells[0].documents[0].samples) s.source.observedFrom = 'parent-frame';}, 'real-source-state-required');
reject('blocked renderer cannot pass even with final frame', f => {f.raw.cells[0].documents[0].samples[2].render.status = 'blocked';}, 'actual-current-renderer-not-ready');
reject('seek to end cannot manufacture a natural pass', f => {f.raw.cells[0].documents[0].events.push({sequence: 8, atMs: 700, type: 'seek', playerId: 'en-desktop-player-0', trusted: true, forced: false, synthetic: false});}, 'seek-or-synthetic-completion');
reject('synthetic source mutations fail independently of final state', f => {f.raw.cells[0].documents[0].samples[2].observer.sourceStateWritten = true;}, 'nonpassive-or-unknown-observer');
reject('last frame without intermediate source state fails', f => {f.raw.cells[0].documents[0].samples[1].source.tick = 0;}, 'natural-intermediate-state-missing');
reject('fabricated elapsed duration does not replace source ticks', f => {f.raw.cells[0].documents[0].samples[2].source.tick = 0;}, 'natural-duration-or-source-ticks-missing');
reject('missing branch remains not-run', f => {f.raw.cells[0].flows = f.raw.cells[0].flows.filter(x => x.kind !== 'interaction');}, 'required-branch-not-run');
reject('wrong source outcome fails despite successful click', f => {f.raw.cells[0].documents[0].samples[1].source.count = 0;}, 'source-branch-outcome-mismatch');
reject('forced or synthetic interactions do not count', f => {f.raw.cells[0].documents[0].events[1].forced = true;}, 'trusted-branch-input-missing');
reject('desktop pointer cannot substitute for required touch flow', f => {f.raw.cells[1].documents[0].events[1].pointerType = 'mouse';}, 'trusted-branch-input-missing');
reject('Replay must retire old owner', f => {f.raw.cells[0].flows.find(x => x.kind === 'replay').retired.activeAudio = 1;}, 'replay-old-owner-not-retired');
reject('Replay must run naturally under new owner', f => {f.raw.cells[0].flows = f.raw.cells[0].flows.filter(x => !(x.kind === 'natural-playback' && x.before === 4));}, 'fresh-replay-natural-playback-not-run');
reject('old Replay audio cannot satisfy fresh owner', f => {f.raw.cells[0].mediaChecks[1].playerId = f.raw.cells[0].mediaChecks[0].playerId;}, 'actual-output-window-not-recorded');
reject('extra old-owner output cannot hide alongside valid fresh audio', f => {f.raw.cells[0].mediaChecks.push({...f.raw.cells[0].mediaChecks[0], startMs: 1400, endMs: 2200});}, 'unbound-stale-or-outside-playback-audio');
reject('source preload or audio running status cannot replace actual output', f => {f.raw.cells[0].mediaChecks = [{passed: true, status: 'playing'}];}, 'actual-output-window-not-recorded');
reject('actual capture file alone is insufficient', f => {delete f.raw.cells[0].mediaChecks[0].match;}, 'actual-output-source-match-missing-or-insufficient');
reject('silent actual output fails', f => {f.raw.cells[0].mediaChecks[0].rms = 0;}, 'audible-duration-samples-or-rms-insufficient');
reject('undersized source match window fails', f => {f.raw.cells[0].mediaChecks[0].match.comparedSamples = 10;}, 'actual-output-source-match-missing-or-insufficient');
reject('wrong audio source identity fails', f => {f.raw.cells[0].mediaChecks[0].match.sourceSha256 = '0'.repeat(64);}, 'actual-output-source-match-missing-or-insufficient');
reject('narrow overflow fails', f => {f.raw.cells[2].layoutChecks[0].rootScrollWidth = 600;}, 'document-overflow-or-unmeasured-layout');
reject('narrow overlay obscuring a control fails', f => {f.raw.cells[2].layoutChecks[0].targets[0].obscuredPixels = 100;}, 'target-unreachable-clipped-or-obscured');
reject('branch screenshot must match its observed state', f => {f.raw.cells[0].layoutChecks[1].sampleSequence = 1;}, 'layout-labelled-state-mismatch');
reject('a parent screenshot cannot substitute for stage output', f => {f.raw.cells[0].screenshots[0].scope = 'page';}, 'actual-state-stage-image-missing');
reject('blank PNG fails despite supplied pixelStats/passed', f => {const png = new PNG({width: 20, height: 20}); png.data.fill(255); const pin = f.put('blank.png', PNG.sync.write(png)); f.raw.cells[0].screenshots[0].pin = pin; f.raw.cells[0].screenshots[0].pixelStats = {nonBackgroundPixels: 9999};}, 'stage-image-blank-or-insufficient');
reject('unapproved English fallback fails', f => {f.raw.cells[3].languages.visual = 'en';}, 'language-mismatch-or-unapproved-fallback');
reject('not-required needs source justification', f => {f.contract.audio = {status: 'not-required', unknowns: [], sourcePin: f.contract.source, reason: ''};}, 'audio-not-required-needs-exact-source');
reject('required keyboard variants cannot be silently skipped', f => {
  f.contract.interactions.inputVariants = [{id: 'pointer', inputTypes: ['pointerdown', 'pointerup']}, {id: 'enter', inputTypes: ['keydown', 'click'], key: 'Enter'}];
  for (const c of f.raw.cells) for (const flow of c.flows.filter(x => x.kind === 'interaction')) flow.variantId = 'pointer';
}, 'required-branch-not-run');
reject('a prose input requirement is not an executable complete matrix', f => {f.contract.interactions.inputVariantsRequired = ['keyboard Enter and Space'];}, 'declared-input-variants-need-executable-contract');
reject('one interaction outcome cannot be reused as two input variants', f => {
  f.contract.interactions.inputVariants = [{id: 'one', inputTypes: ['pointerdown', 'pointerup']}, {id: 'two', inputTypes: ['pointerdown', 'pointerup']}];
  for (const c of f.raw.cells) {const flow = c.flows.find(x => x.kind === 'interaction'); flow.variantId = 'one'; c.flows.push({...flow, variantId: 'two'});}
}, 'input-variants-reuse-one-outcome');
reject('same audio file cannot substitute another source PCM subrange', f => {
  for (const cue of f.contract.audio.cues) Object.assign(cue, {sourcePCM: cue.source, sourceFirstDecodedSample: 100, sourceEndDecodedSample: 38500, sampleRate: 48000, channels: 2});
}, 'source-pcm-subrange-mismatch');
reject('source silent window cannot be silently omitted', f => {f.contract.audio.expectedSilentWindows = [{id: 'gap', startPlaybackSeconds: 0.15, endPlaybackSeconds: 0.19, maximumRms: 0.0001}];}, 'required-silence-window-not-recorded');
reject('declared source content cannot be skipped because PNG is nonblank', f => {f.contract.contentAssertions = [{id: 'title', stateId: 'terminal', selector: '[data-title]', text: 'Exact source title', sourcePin: f.contract.source}];}, 'required-source-content-not-observed');
reject('declared public pause/resume cannot be silently skipped', f => {f.contract.interactions.hostControlsAdditional = ['pause', 'play'];}, 'public-pause-resume-not-run');
reject('declared navigation cannot be silently skipped', f => {
  f.contract.interactions.hostControlsAdditional = ['next']; f.contract.navigation = {next: {animationId: 'shared-nms002-l01-p002', sourcePin: f.contract.source}};
}, 'public-navigation-not-run');

test('modal-state layout targets may replace intentionally covered background controls', t => {
  const f = setup(t); f.contract.layout.targetIdsByState = {'correct-feedback': ['dialog']};
  for (const c of f.raw.cells) {const target = c.layoutChecks[1].targets[0]; target.id = target.hitTargetId = 'dialog';}
  f.saveContract(); const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues));
});
test('source content matches only retained visible innerText tied to the state', t => {
  const f = setup(t); f.contract.contentAssertions = [{id: 'title', stateId: 'terminal', selector: '[data-title]', text: 'Exact source title', sourcePin: f.contract.source}];
  for (const c of f.raw.cells) c.contentChecks = [{assertionId: 'title', stateId: 'terminal', selector: '[data-title]', sampleSequence: 3, method: 'innerText', text: 'Main idea\nExact source title', rect: {width: 200, height: 30}, computed: {display: 'block', visibility: 'visible', opacity: 1}}];
  f.saveContract(); assert.equal(assessPage(f).status, 'pass');
  f.raw.cells[0].contentChecks[0].computed.opacity = 0;
  assert.ok(assessPage(f).issues.some(i => i.code === 'required-source-content-mismatch-or-hidden'));
});
test('actual silence reports are measured, bound, and independently reject audible leakage', t => {
  const f = setup(t); f.contract.audio.expectedSilentWindows = [{id: 'gap', startPlaybackSeconds: 0.15, endPlaybackSeconds: 0.19, maximumRms: 0.0001}];
  for (const c of f.raw.cells) {
    c.silenceChecks = [0, 1].map(replay => {
      const m = {windowId: 'gap', playerId: `${c.cellId}-player-${replay}`, replay, source: f.contract.source, capture: c.mediaChecks[replay].capture,
        sourcePlaybackStartSeconds: 0.15, sourcePlaybackEndSeconds: 0.19, startMs: (replay ? 1200 : 0) + 150, endMs: (replay ? 1200 : 0) + 190,
        sampleRate: 48000, sampleCount: 1920, channels: 2, rms: 0.00001};
      const {windowId, playerId, replay: r, ...report} = m; m.analysis = {tool: 'unit-test-only', report: f.put(`${c.cellId}/silence-${replay}.json`, report)}; return m;
    });
  }
  f.saveContract(); assert.equal(assessPage(f).status, 'pass');
  f.raw.cells[0].silenceChecks[0].rms = 0.5;
  assert.ok(assessPage(f).issues.some(i => i.code === 'source-silence-output-window-failed'));
});
test('public Pause freezes source and owned audio; Play must advance the same owner', t => {
  const f = setup(t); f.contract.interactions.hostControlsAdditional = ['pause', 'play', 'replay'];
  for (const c of f.raw.cells) {
    const d = c.documents[0], previous = d.samples.at(-1);
    for (const [sequence, atMs, tick, paused] of [[7, 2400, 11, false], [8, 2500, 12, true], [9, 2800, 12, true], [10, 2900, 13, false]]) d.samples.push({...structuredClone(previous), sequence, atMs, source: {...previous.source, tick}, host: {paused}, media: {runningOwnedOutputs: paused ? 0 : 1}});
    d.events.push({sequence: 8, atMs: 2450, type: 'click', playerId: previous.identity.playerId, trusted: true, forced: false, synthetic: false}, {sequence: 9, atMs: 2850, type: 'click', playerId: previous.identity.playerId, trusted: true, forced: false, synthetic: false});
    c.flows.push({kind: 'pause-resume', before: 7, paused: 8, held: 9, resumed: 10, eventSequences: [8, 9]});
  }
  f.saveContract(); assert.equal(assessPage(f).status, 'pass');
  f.raw.cells[0].documents[0].samples[8].source.tick++;
  assert.ok(assessPage(f).issues.some(i => i.code === 'public-pause-resume-state-failed'));
});

test('source-backed no interactions/no audio is allowed without inventing missing work', t => {
  const f = setup(t), sourcePin = f.contract.source;
  f.contract.interactions = {status: 'not-required', sourcePin, unknowns: [], reason: 'Synthetic fixture source has no interactions', cases: []};
  f.contract.audio = {status: 'not-required', sourcePin, unknowns: [], reason: 'Synthetic fixture source is silent', cues: []};
  f.contract.layout.requiredStateIds = ['initial', 'terminal'];
  for (const cell of f.raw.cells) {cell.languages.audio = null; cell.mediaChecks = []; cell.flows = cell.flows.filter(f => f.kind !== 'interaction');}
  f.saveContract();
  const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues));
});
test('authorized English fallback stays visible as locale gap', t => {
  const f = setup(t);
  f.contract.authorizedEnglishFallback = {locale: 'es', channels: ['visual'], reason: 'Synthetic authorization test only', authorizationPin: f.put('authorization.txt', 'UNIT TEST ONLY explicit scoped Owner instruction')};
  for (const cell of f.raw.cells.filter(c => c.config.locale === 'es')) cell.languages.visual = 'en';
  f.saveContract();
  const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues)); assert.equal(result.localeGaps.length, 3);
});
test('source-proved static pages require observed dwell but do not invent source ticks or Play', t => {
  const f = setup(t), sourcePin = f.contract.source;
  f.contract.terminal.kind = 'static'; f.contract.terminal.frame = 1; f.contract.terminal.expectedState = f.contract.terminal.initialState;
  f.contract.interactions = {status: 'not-required', sourcePin, unknowns: [], reason: 'Synthetic static no-input source', cases: []};
  f.contract.audio = {status: 'not-required', sourcePin, unknowns: [], reason: 'Synthetic silent source', cues: []};
  f.contract.layout.requiredStateIds = ['initial', 'terminal'];
  for (const cell of f.raw.cells) {
    cell.languages.audio = null; cell.mediaChecks = []; cell.flows = cell.flows.filter(f => f.kind !== 'interaction');
    for (const f of cell.flows.filter(f => f.kind === 'natural-playback')) f.eventSequences = [];
    for (const s of cell.documents[0].samples) {s.source.frame = 1; s.source.tick = 0; s.source.count = 0;}
  }
  f.saveContract(); const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues));
});
test('catalog rejects duplicate/wrong IDs, absent pages and nonzero failure state', t => {
  const f = setup(t), args = {expectedAnimationIds: [f.contract.animationId], root: f.root};
  for (const pages of [[f, f], [], [{...f, contract: {...f.contract, animationId: 'shared-nms002-l01-p002'}}]]) assert.equal(assessCatalog({...args, pages}).exitCode, 1);
  assert.equal(assessCatalog({...args, expectedAnimationIds: [], pages: []}).exitCode, 1);
  f.raw.cells.pop(); assert.equal(assessCatalog({...args, pages: [f]}).exitCode, 1);
});
test('malformed collections produce findings rather than passing or crashing', t => {
  const f = setup(t); f.raw.cells[0].documents[0].samples = [null];
  assert.equal(assessPage(f).status, 'fail');
  assert.equal(assessCatalog({expectedAnimationIds: {}, pages: {}, root: f.root}).exitCode, 1);
});

reject('the six main cells cannot replace fixed supplements', f => {f.raw.supplements = [];}, 'required-supplement-not-run');
reject('one DPR2 observation cannot claim DPR3', f => {f.raw.supplements.find(s => s.id === 'dpr-3').after.viewport.dpr = 2;}, 'supplement-required-transition-missing');
reject('supplement cannot reload the page to claim same-state continuity', f => {f.raw.supplements[0].after.identity.playerId = 'replacement';}, 'supplement-source-continuity-failed');
reject('supplement cannot leak owned audio during static layout inspection', f => {f.raw.supplements[0].after.media.runningOwnedOutputs = 1;}, 'supplement-media-continuity-failed');
reject('font fallback requires actual glyph font observations', f => {f.raw.supplements.find(s => s.id === 'font-fallback').fontObservations = [];}, 'actual-page-font-observation-missing');
reject('supplement cannot borrow a neighboring page report', f => {f.raw.supplements[0].animationId = 'shared-nms002-l01-p002';}, 'supplement-claim-or-input-binding-mismatch');

test('same-state targets may be reached by scrolling while preserving one owner', t => {
  const f = setup(t); f.contract.layout.targetIds = ['stage', 'below-fold'];
  for (const c of f.raw.cells) {
    const second = c.layoutChecks.map(l => ({...structuredClone(l), targets: [{...structuredClone(l.targets[0]), id: 'below-fold', hitTargetId: 'below-fold'}]}));
    c.layoutChecks.push(...second);
    c.screenshots.push(...c.screenshots.map(s => ({...s, scope: 'target', targetId: 'below-fold'})));
  }
  f.saveContract(); assert.equal(assessPage(f).status, 'pass');
  f.contract.layout.simultaneousGroups = {terminal: [['stage', 'below-fold']]}; f.saveContract();
  assert.ok(assessPage(f).issues.some(i => i.code === 'source-relation-group-not-simultaneously-visible'));
});
test('native Replay may reuse DOM and AudioContext while creating new source nodes and a verified run epoch', t => {
  const f = setup(t); f.contract.rendererFamily = 'native-canvas';
  for (const c of f.raw.cells) {
    for (const s of c.documents[0].samples) {
      s.identity.ownerKind = 'surface-run'; s.identity.surfaceId = s.render.surfaceId; s.identity.runEpoch = s.identity.replay; s.identity.runToken = `source-stage:${s.identity.replay}`; delete s.identity.leaseToken;
      s.source.observedFrom = 'renderer-state'; s.source.tickKind = 'observed-committed-paint'; s.render.rendererFamily = 'native-canvas';
    }
    c.flows.find(f => f.kind === 'replay').retired = {kind: 'surface-run', playerId: `${c.cellId}-player-0`, runEpoch: 0, sourceNodeIds: ['source-old'], activeSourceNodes: 0, pendingMediaStarts: 0};
    for (const m of c.mediaChecks) m.sourceNodeIds = [m.replay === 0 ? 'source-old' : 'source-new'];
  }
  f.saveContract(); const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues));
  f.raw.cells[0].mediaChecks[1].sourceNodeIds = ['source-old'];
  assert.ok(assessPage(f).issues.some(i => i.code === 'native-replay-audio-source-node-ownership-missing-or-stale'));
});
test('public Next requires exact destination pixels and retirement, not a navigation boolean', t => {
  const f = setup(t), destination = 'shared-nms002-l01-p002';
  f.contract.interactions.hostControlsAdditional = ['next']; f.contract.navigation = {next: {animationId: destination, sourcePin: f.contract.source}};
  for (const c of f.raw.cells) {
    const playerId = `${c.cellId}-player-1`;
    c.documents[0].events.push({sequence: 8, atMs: 2300, type: 'click', action: 'next', playerId, trusted: true, forced: false, synthetic: false});
    c.navigationChecks = [{action: 'next', before: 6, eventSequence: 8, observedAtMs: 2350, actualDestinationAnimationId: destination,
      renderer: {animationId: destination, status: 'ready', surfaceId: 'destination-stage'}, screenshot: {scope: 'stage', surfaceId: 'destination-stage', pin: c.screenshots[0].pin},
      retired: {playerId, activeAudio: 0, activeTimers: 0, hasRuntime: false, connected: false}}];
  }
  f.saveContract(); const result = assessPage(f); assert.equal(result.status, 'pass', JSON.stringify(result.issues));
  f.raw.cells[0].navigationChecks[0].actualDestinationAnimationId = 'wrong';
  assert.ok(assessPage(f).issues.some(i => i.code === 'navigation-destination-or-trusted-input-failed'));
});
test('same-page supplement records can be reused only with identical claim and actual input pins', t => {
  const f = setup(t), s = f.raw.supplements[0], recordPin = f.put('reusable-supplement.json', s);
  f.raw.supplements[0] = {id: s.id, locale: s.locale, stateId: s.stateId, reuse: {recordPin}};
  assert.equal(assessPage(f).status, 'pass');
  f.raw.supplements[0].reuse.recordPin = f.put('wrong-reuse.json', {...s, inputPins: []});
  assert.ok(assessPage(f).issues.some(i => i.code === 'supplement-claim-or-input-binding-mismatch'));
});
