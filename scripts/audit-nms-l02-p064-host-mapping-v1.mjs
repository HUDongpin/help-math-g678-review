import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workspace = path.resolve(import.meta.dirname, '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const hostAudit = '/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f/canonical-indexmi-host-audit-v1';
const hostSha = '275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9';
const hostScriptSha = '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74';
const bindingSha = 'fe51eaf89a3df121c7cfe487a1f3358daa6630b2f295d59bc6723768c07aa57c';
const p064Sha = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const mediaSha = '60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58';
const questionIrSha = 'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350';
const p064AudioSha = '8787dc38222cbe83a192eabc0ac7d8734408abba0ef7da5434a6e85c6c0c68b9';
const outputRelative = 'migrations/shared-nms002-l02-p064/audit/host-audio-static-mapping-v1.json';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const readPinned = (filename, expected) => {
  const bytes = fs.readFileSync(filename);
  assert.equal(sha(bytes), expected, `Source drift: ${filename}`);
  return bytes;
};
const requireTwice = (text, expression, label) =>
  assert.equal((text.match(expression) ?? []).length, 2, `Both host branches must preserve ${label}`);

const mode = process.argv[2];
assert.ok(mode === '--build' || mode === '--check', 'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact real source root required');
assert.ok(fs.lstatSync(sourceRoot).isDirectory() && fs.realpathSync(sourceRoot) === sourceRoot,
  'Source root must be a real directory');
const p064Relative = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
readPinned(path.join(sourceRoot, p064Relative), p064Sha);
const binding = JSON.parse(readPinned(path.join(hostAudit, 'source-binding.json'), bindingSha));
assert.equal(binding.source.pathDisplay, 'NewHelpProgram/HELP_COURSES/indexMI.swf');
assert.equal(binding.source.sha256, hostSha);
assert.equal(binding.source.bytes, 689006);
assert.match(binding.scope, /no shell renderer or original-runtime execution/);
assert.equal(sha(readPinned(binding.casPath, hostSha)), hostSha);
readPinned(path.join(hostAudit, 'source.swf'), hostSha);
const mediaRelative = 'migrations/shared-nms002-l02-p064/audit/audio-source-candidates-v1.json';
const media = JSON.parse(readPinned(path.join(workspace, mediaRelative), mediaSha));
const questionIrRelative = 'migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json';
const ir = JSON.parse(readPinned(path.join(workspace, questionIrRelative), questionIrSha));
const p064AudioRelative = 'migrations/shared-nms002-l02-p064/audit/host-audio-lifecycle-v1.json';
readPinned(path.join(workspace, p064AudioRelative), p064AudioSha);
assert.equal(ir.questions.length, 35);
for (const [index, question] of ir.questions.entries()) {
  assert.equal(question.questionId, index + 1);
  assert.equal(question.questionFrame, index + 2);
}
assert.equal(media.sourceMediaRows.length, 350);
for (const folder of ['EA', 'SA']) {
  for (let question = 1; question <= 35; question++) {
    for (const suffix of ['', 'A', 'B', 'C', 'D']) {
      assert.equal(media.sourceMediaRows.filter(row =>
        row.relativePath === `G6-G8-shared/NMS002/L2/FQ/${folder}/Q${question}${suffix}.mp3`).length, 1);
    }
  }
}

const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'g678-p064-indexmi-audio-'));
try {
  const result = spawnSync('ffdec', ['-export', 'script', temporary, path.join(hostAudit, 'source.swf')],
    {encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr || 'FFDec host export failed');
  assert.match(result.stdout, /JPEXS Free Flash Decompiler v\.26\.2\.1/);
  const scriptRelative = 'scripts/frame_35/DoAction.as';
  const script = readPinned(path.join(temporary, scriptRelative), hostScriptSha).toString('utf8');
  assert.match(script, /animation_mc\.loadMovie\(_loc2_\.playSwfFileName,1\)/);
  const questionStart = script.indexOf('function doPlayFQQuestionAudio(');
  const answerStart = script.indexOf('function doPlayFQAnswerAudio(');
  const answerEnd = script.indexOf('function showWrongFeed(', answerStart);
  assert.ok(questionStart >= 0 && answerStart > questionStart && answerEnd > answerStart);
  const question = script.slice(questionStart, answerStart);
  const answer = script.slice(answerStart, answerEnd);
  for (const [body, label] of [[question, 'question'], [answer, 'answer']]) {
    requireTwice(body, /"Q" \+ Number\(_root\.animation_mc\.animation\._currentframe - 1\)\.toString\(\)/g,
      `${label} frame-derived Qn`);
    requireTwice(body, /_global\.playSwfFileName\.split\("\/"\)/g, `${label} loaded SWF directory`);
    requireTwice(body, /\/EA\//g, `${label} EA folder`);
    requireTwice(body, /\/SA\//g, `${label} SA folder`);
  }
  assert.equal((question.match(/strFQTempLabel \+ "\.mp3"/g) ?? []).length, 4,
    'Both question playback branches must map EN/SP to Qn.mp3');
  requireTwice(answer, /strTempQAName = eval\(strFQMc\)\._name/g, 'option instance name');
  requireTwice(answer, /Number\(strTempQAName\.substring\(strTempQAName\.length - 1,strTempQAName\.length\)\)/g,
    'option number from name suffix');
  for (const [number, letter] of [[1, 'A'], [2, 'B'], [3, 'C'], [4, 'D']]) {
    requireTwice(answer, new RegExp(`case ${number}:\\s+strQALabel = "${letter}"`, 'g'), `${number} to ${letter}`);
  }
  requireTwice(answer, /strQAFName = strFQTempLabel \+ strQALabel \+ "\.mp3"/g,
    'QnA-D filename');
  const report = {
    schemaVersion: 1,
    kind: 'g678-p064-static-indexmi-host-audio-mapping-v1',
    authority: 'hash-bound-two-swf-static-source-only-not-original-runtime-or-deployed-host',
    animationId: 'shared-nms002-l02-p064',
    pageSource: {relativePath: p064Relative, sha256: p064Sha},
    hostSource: {pathDisplay: binding.source.pathDisplay, sha256: hostSha,
      sourceBindingSha256: bindingSha, exportedScript: {relativePath: scriptRelative, sha256: hostScriptSha}},
    inputs: {questionIr: {relativePath: questionIrRelative, sha256: questionIrSha},
      mediaIndex: {relativePath: mediaRelative, sha256: mediaSha},
      pageAudioContract: {relativePath: p064AudioRelative, sha256: p064AudioSha}},
    staticMapping: {
      pageQuestionFrames: 'Q1-Q35 occupy main-sprite frames 2-36',
      hostQuestionNumber: 'current main-sprite frame minus one',
      hostOptionLetter: {'Mc_Quiz_Audio_1': 'A', 'Mc_Quiz_Audio_2': 'B',
        'Mc_Quiz_Audio_3': 'C', 'Mc_Quiz_Audio_4': 'D'},
      hostLanguageFolders: {EN: 'EA', SP: 'SA'},
      hostDirectory: 'directory of the loaded page SWF',
      filesPresentInHashBoundIndex: {questions: 70, options: 280},
    },
    unresolved: ['whether this indexMI byte sequence was the deployed P064 host',
      'effective lesson audio flags and control reachability', 'actual file requests and audio timing',
      'spoken language, listening, and Replay acceptance', 'modern UI/host integration and privacy-safe result handling'],
  };
  const rendered = JSON.stringify(report, null, 2) + '\n';
  const output = path.join(workspace, outputRelative);
  if (mode === '--build') fs.writeFileSync(output, rendered, {flag: 'wx'});
  else assert.equal(fs.readFileSync(output, 'utf8'), rendered, 'P064 host mapping contract drift');
  console.log(JSON.stringify({status: 'PASS', mode, output, sha256: sha(rendered)}));
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
