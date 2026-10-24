import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const workspace = path.resolve(import.meta.dirname, '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const relativeSwf = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const swfSha256 = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const indexRelative = 'migrations/shared-nms002-l02-p064/audit/audio-source-candidates-v1.json';
const indexSha256 = '60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58';
const output = path.join(workspace,
  'migrations/shared-nms002-l02-p064/audit/host-audio-lifecycle-v1.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const scripts = {
  englishButton: ['DefineButton2_58/BUTTONCONDACTION on(release).as',
    '8bbeee06a2f6f663596208db1822c70c1b96e8c3034be27327169ac1f2e2a45e'],
  spanishButton: ['DefineButton2_52/BUTTONCONDACTION on(release).as',
    'a2e4af1cd1fa0b238c8cc73348d24070857ef9e3db12862551437bef99cf397d'],
  audioControls: ['DefineSprite_67/frame_1/DoAction.as',
    'fbfa67d478fcdcd7ea8241930c25e0e508dca10ef67a6dd5f0850f0d43d7daad'],
  quizState: ['DefineSprite_1258/frame_1/DoAction.as',
    '480d21cd236fb63365d4db7b5dc14777c0ec854191c91e052f40d7ee7427ff04'],
  result: ['DefineSprite_17/frame_2/DoAction.as',
    '6bc233ce1b89ed3819951a8836b0dd0d7ea8cb2e5d15e8646c3f6b95ac9dbc66'],
  reviewButton: ['DefineButton2_607/BUTTONCONDACTION on(release).as',
    'd51b52523ac0e44edbc12fd740c8156c95f1359a0873b10ac8d22fe729d41829'],
};

function readScript(exportRoot, [relative, expectedSha]) {
  const bytes = fs.readFileSync(path.join(exportRoot, 'scripts', relative));
  assert.equal(sha(bytes), expectedSha, `P064 source script drift: ${relative}`);
  return bytes.toString('utf8');
}

function assertMediaIndex() {
  const bytes = fs.readFileSync(path.join(workspace, indexRelative));
  assert.equal(sha(bytes), indexSha256, 'P064 source-media index drift');
  const index = JSON.parse(bytes.toString('utf8'));
  assert.equal(index.animationId, 'shared-nms002-l02-p064');
  assert.equal(index.source.sha256, swfSha256);
  assert.equal(index.sourceMediaRows.length, 350);
  let questions = 0;
  let options = 0;
  for (const folder of ['EA', 'SA']) {
    for (let question = 1; question <= 35; question++) {
      const rows = index.sourceMediaRows.filter(row =>
        row.folderCode === folder && row.questionId === question);
      assert.equal(rows.length, 5);
      for (const [role, option, suffix] of [
        ['question', null, ''], ['option', 'A', 'A'], ['option', 'B', 'B'],
        ['option', 'C', 'C'], ['option', 'D', 'D'],
      ]) {
        const row = rows.find(value => value.role === role && value.option === option);
        assert.ok(row);
        assert.equal(row.relativePath, `G6-G8-shared/NMS002/L2/FQ/${folder}/Q${question}${suffix}.mp3`);
        if (role === 'question') questions++;
        else options++;
      }
    }
  }
  return {questions, options};
}

const mode = process.argv[2];
assert.ok(mode === '--build' || mode === '--check', 'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact real source root required');
assert.ok(fs.lstatSync(sourceRoot).isDirectory() && fs.realpathSync(sourceRoot) === sourceRoot,
  'Source root must be a real directory');
const swf = path.join(sourceRoot, relativeSwf);
assert.ok(fs.lstatSync(swf).isFile() && fs.realpathSync(swf) === swf);
const swfBytes = fs.readFileSync(swf);
assert.equal(swfBytes.length, 55392);
assert.equal(sha(swfBytes), swfSha256);
const media = assertMediaIndex();
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'g678-p064-host-audio-'));
try {
  const exportResult = spawnSync('ffdec', ['-export', 'script', temporary, swf], {
    encoding: 'utf8', maxBuffer: 4 * 1024 * 1024,
  });
  assert.equal(exportResult.status, 0, exportResult.stderr || 'FFDec export failed');
  assert.match(exportResult.stdout, /JPEXS Free Flash Decompiler v\.26\.2\.1/);
  const text = Object.fromEntries(Object.entries(scripts).map(([key, entry]) =>
    [key, readScript(temporary, entry)]));
  for (const [button, language] of [['englishButton', 'EN'], ['spanishButton', 'SP']]) {
    assert.match(text[button], /this\._name == "Mc_Quiz_Audio"/);
    assert.ok(text[button].includes(`doPlayFQQuestionAudio(this,"${language}")`));
    assert.ok(text[button].includes(`doPlayFQAnswerAudio(this,"${language}")`));
  }
  for (const flag of ['dtfFinalQuizAudio', 'dtfFinalQuizSpanishAudio',
    'dtfFinalQuizAnswerAudio', 'dtfFinalQuizAnswerSpanishAudio']) {
    assert.ok(text.audioControls.includes(flag), `Missing source audio flag ${flag}`);
  }
  assert.match(text.audioControls, /Mc_Quiz_Audio_" \+ i/);
  assert.match(text.audioControls, /while\(i <= 4\)/);
  assert.match(text.quizState, /Mc_Finish\.gotoAndStop\(2\)/);
  assert.match(text.quizState, /_global\.reviewCount == parseInt\(_global\.totalQuestionsCount\)/);
  assert.match(text.quizState, /_global\.reviewCount > parseInt\(_global\.totalQuestionsCount\)/);
  assert.match(text.quizState, /_root\.setBookMark\(\)/);
  assert.match(text.quizState, /_root\.doCloseApp\(\)/);
  assert.match(text.quizState, /getURL\(strURL,""\)/);
  assert.match(text.result, /_root\.QuizReport_URL/);
  assert.equal((text.result.match(/_root\.Send_Quiz_Report_Mc\.gotoAndPlay\(2\)/g) ?? []).length, 2);
  assert.match(text.reviewButton, /doGetReview\(\)/);
  const report = {
    schemaVersion: 1,
    kind: 'g678-p064-static-host-audio-lifecycle-v1',
    authority: 'source-script-and-media-index-only-not-original-runtime',
    animationId: 'shared-nms002-l02-p064',
    source: {relativePath: relativeSwf, bytes: swfBytes.length, sha256: swfSha256},
    tool: {name: 'FFDec', version: '26.2.1'},
    scripts: Object.fromEntries(Object.entries(scripts).map(([key, [relativePath, digest]]) =>
      [key, {relativePath, sha256: digest}])),
    mediaIndex: {relativePath: indexRelative, sha256: indexSha256,
      questionCandidates: media.questions, optionCandidates: media.options,
      hostFileMappingVerified: false},
    staticFindings: {
      questionAudio: 'EN/SP button branch calls host doPlayFQQuestionAudio',
      optionAudio: 'same button scripts call host doPlayFQAnswerAudio for non-question controls',
      optionControls: 'four per question, gated by external host audio flags',
      resultReport: 'result frame constructs legacy report and starts host report movie twice',
      reviewExit: 'review count above ten unloads and calls legacy bookmark/close or URL path',
    },
    unresolved: ['host function bodies and MP3 mapping', 'effective host audio flags',
      'original-runtime natural trace and cue timing', 'spoken language and listening',
      'modern privacy-safe score/progress decision', 'post-review host navigation'],
  };
  const rendered = JSON.stringify(report, null, 2) + '\n';
  if (mode === '--build') fs.writeFileSync(output, rendered, {flag: 'wx'});
  else assert.equal(fs.readFileSync(output, 'utf8'), rendered, 'P064 host-audio contract drift');
  console.log(JSON.stringify({status: 'PASS', mode, output, sha256: sha(rendered)}));
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
