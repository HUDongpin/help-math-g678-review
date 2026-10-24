#!/usr/bin/env node
/** Output-only P043 Canvas NMH visibility correction from source actions. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createContext, Script} from 'node:vm';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../../..');
const INPUT = 'migrations/shared-alg001-l06-p043/regenerated-v1/canvas/canvas-renderer-draft.js';
const SOURCE = 'migrations/shared-alg001-l06-p043/behavior-v1/source-actions';
const ACTIONS = {
  mainStart: `${SOURCE}/DefineSprite_342/frame_1/DoAction.as`,
  quizHold: `${SOURCE}/DefineSprite_342/frame_62/DoAction.as`,
  nmhOpen: `${SOURCE}/DefineButton2_147/BUTTONCONDACTION on(release).as`,
  nmhClose: `${SOURCE}/DefineButton2_176/BUTTONCONDACTION on(release).as`,
  wrongRelease: `${SOURCE}/DefineButton2_165/BUTTONCONDACTION on(release).as`,
  rightRelease: `${SOURCE}/DefineButton2_166/BUTTONCONDACTION on(release).as`,
  wrongHold: `${SOURCE}/DefineSprite_307/frame_23/DoAction.as`,
  wrongClose: `${SOURCE}/DefineButton2_301/BUTTONCONDACTION on(release).as`,
};
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const json = value => Buffer.from(JSON.stringify(value, null, 2) + '\n');
const read = file => fs.readFileSync(path.resolve(ROOT, file));
function replaceOnce(source, needle, replacement, label) {
  const at = source.indexOf(needle);
  assert(at >= 0 && source.indexOf(needle, at + needle.length) < 0, `unique ${label}`);
  return source.slice(0, at) + replacement + source.slice(at + needle.length);
}

function build() {
  const input = read(INPUT);
  assert.equal(sha(input),
    'b310d4a5fb9a7ae6c7822d5d9211d4eb9e5acb33ac9149d225f04dd9c2161c14');
  const actionBytes = Object.fromEntries(Object.entries(ACTIONS)
    .map(([key, file]) => [key, read(file)]));
  const a = Object.fromEntries(Object.entries(actionBytes)
    .map(([key, bytes]) => [key, bytes.toString().replace(/\r\n?/gu, '\n')]));
  assert.equal(a.mainStart,
    'Mc_Popup._visible = false;\nCloseBtn._visible = false;\n');
  assert(a.quizHold.includes('stop();') &&
    a.quizHold.includes('Mc_Popup._visible = false;'));
  assert(a.nmhOpen.includes('Mc_Popup._visible = true;') &&
    a.nmhOpen.includes('CloseBtn._visible = true;'));
  assert(a.nmhClose.includes('Mc_Popup._visible = false;') &&
    a.nmhClose.includes('CloseBtn._visible = false;'));
  assert(a.wrongRelease.includes('Mc_Wrong_Feed4.gotoAndPlay(2);'));
  assert(a.rightRelease.includes('Mc_Right_Feed4.gotoAndPlay(2);'));
  assert.equal(a.wrongHold, 'stop();\n');
  assert(a.wrongClose.includes('_parent.gotoAndPlay(24);'));
  let runtime = input.toString();
  const guard = '    var nmhOpen = request.nmhOpen === undefined ? false : request.nmhOpen;\n' +
    '    if (typeof nmhOpen !== "boolean" || (nmhOpen && (frame !== 62 || selectedFeedback !== null))) throw new Error("NMH open requires quiz frame 62 without feedback");\n    ';
  runtime = replaceOnce(runtime, '    return Object.freeze({\n        frameDomain:',
    guard + 'return Object.freeze({\n        frameDomain:', 'NMH validation');
  runtime = replaceOnce(runtime, '        feedback: selectedFeedback\n    });',
    '        feedback: selectedFeedback,\n        nmhOpen: nmhOpen,\n        visibility: Object.freeze({nmhPopup:nmhOpen?"open":"hidden",wrongFeedbackPopup:selectedFeedback&&selectedFeedback.spriteId===307&&selectedFeedback.localFrame>=16&&selectedFeedback.localFrame<=23?"open":"hidden"})\n    });',
    'source visibility');
  for (const name of ['sprite146', 'button176']) {
    const regex = new RegExp(`(^[ \\t]*)place\\("${name}"[^\\n]+\\);`, 'gm');
    let count = 0;
    runtime = runtime.replace(regex, (line, indent) => {
      count++;
      return `${indent}if (P043_NMH_OPEN) ${line.trim()}`;
    });
    assert.equal(count, 1, `one held-quiz ${name} placement`);
  }
  runtime = replaceOnce(runtime, 'var P043_FEEDBACK = null;',
    'var P043_FEEDBACK = null;\nvar P043_NMH_OPEN = false;', 'NMH draw state');
  runtime = replaceOnce(runtime, '    var previousFeedback = P043_FEEDBACK;',
    '    var previousFeedback = P043_FEEDBACK;\n    var previousNmhOpen = P043_NMH_OPEN;',
    'NMH draw scope');
  runtime = replaceOnce(runtime, '    P043_FEEDBACK = state.feedback;',
    '    P043_FEEDBACK = state.feedback;\n    P043_NMH_OPEN = state.nmhOpen;',
    'NMH draw assignment');
  runtime = replaceOnce(runtime, '        P043_FEEDBACK = previousFeedback;',
    '        P043_FEEDBACK = previousFeedback;\n        P043_NMH_OPEN = previousNmhOpen;',
    'NMH cleanup');
  runtime = replaceOnce(runtime,
    '        targetCanvas.setAttribute("data-p043-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");',
    '        targetCanvas.setAttribute("data-p043-feedback-frame", state.feedback ? String(state.feedback.localFrame) : "none");\n        targetCanvas.setAttribute("data-p043-nmh-open", String(state.nmhOpen));',
    'NMH readback');
  assert(!/\beval\s*\(|\bFunction\s*\(|\b(?:setInterval|setTimeout|requestAnimationFrame)\s*\(|\bfetch\s*\(/u.test(runtime));
  new Script(runtime, {filename: 'p043-canvas-visibility-v2.js'});
  const context = createContext({document: {createElement: kind => {
    assert.equal(kind, 'img');
    return {complete: false, naturalWidth: 0};
  }}});
  new Script(runtime).runInContext(context, {timeout: 30000});
  const asset = context.HELP_MATH_CANVAS_ASSETS?.['shared-alg001-l06-p043'];
  assert(asset);
  assert.equal(asset.resolveFrameState({frame: 62}).visibility.nmhPopup, 'hidden');
  assert.equal(asset.resolveFrameState({frame: 62, nmhOpen: true}).visibility.nmhPopup, 'open');
  assert.equal(asset.resolveFrameState({frame: 62,
    feedback: {spriteId: 307, localFrame: 23}}).visibility.wrongFeedbackPopup, 'open');
  assert.equal(asset.resolveFrameState({frame: 62,
    feedback: {spriteId: 202, localFrame: 31}}).visibility.wrongFeedbackPopup, 'hidden');
  assert.throws(() => asset.resolveFrameState({frame: 61, nmhOpen: true}), /NMH open/u);
  assert.throws(() => asset.resolveFrameState({frame: 62, nmhOpen: true,
    feedback: {spriteId: 307, localFrame: 23}}), /NMH open/u);
  const bytes = Buffer.from(runtime);
  const receipt = json({kind: 'p043-output-only-canvas-visibility-v2',
    status: 'unregistered-source-state-draft',
    animationId: 'shared-alg001-l06-p043',
    input: {path: INPUT, bytes: input.length, sha256: sha(input)},
    sourceActions: Object.entries(ACTIONS).map(([key, file]) => ({key, path: file,
      bytes: actionBytes[key].length, sha256: sha(actionBytes[key])})),
    sourceRule: {default: 'main frames 1 and 62 hide Mc_Popup and CloseBtn',
      open: 'button147 shows both', close: 'button176 hides both',
      feedback: 'wrong165/right166 start feedback4 at 2; wrong4 holds23, Close301 jumps24'},
    flags: {nmhOpen: 'boolean default false; true only at frame62 without feedback',
      feedback: 'source-selected right4 or wrong4 at frame62',
      wrongFeedbackPopup: 'derived open only on wrong4 frames16..23'},
    output: {path: 'output/g678-p043-player-integration-preparation-20261002-v1/canvas-renderer-visibility-v2.js',
      bytes: bytes.length, sha256: sha(bytes)},
    unresolved: ['Native EditText303 geometry needs browser calibration.',
      'Original-runtime pixel and audio alignment remain unverified.',
      'No AVM1 or host actions are executed by the Canvas asset.'],
    gates: {currentJsRegistered: false, fidelityAccepted: false,
      audioAccepted: false, strictComplete: false}});
  return new Map([
    ['canvas-renderer-visibility-v2.js', bytes],
    ['visibility-source-receipt-v2.json', receipt],
  ]);
}

const mode = process.argv[2];
assert(['--plan', '--write', '--check'].includes(mode), '--plan | --write | --check');
const outputs = build();
for (const [name, bytes] of outputs) {
  const file = path.resolve(ROOT, 'migrations/shared-alg001-l06-p043/regenerated-v1/canvas', name);
  if (mode === '--write' && !fs.existsSync(file))
    fs.writeFileSync(file, bytes, {flag: 'wx'});
  if (mode !== '--plan') assert.deepEqual(fs.readFileSync(file), bytes, `${name} drift`);
}
console.log(JSON.stringify({mode,
  outputs: Object.fromEntries([...outputs].map(([name, bytes]) =>
    [name, {bytes: bytes.length, sha256: sha(bytes)}]))}));
