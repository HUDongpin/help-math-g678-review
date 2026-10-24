import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelativePath = 'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf';
const sourceSha256 = 'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c';
const output = path.join(root, 'migrations/shared-nms002-l02-p064/audit/source-quiz-contract-v1.json');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

function script(directory, relativePath) {
  const bytes = fs.readFileSync(path.join(directory, 'scripts', relativePath));
  return {text: bytes.toString('utf8'), sha256: sha(bytes)};
}

function listScripts(directory) {
  return fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? listScripts(target) : [target];
  }).filter(file => file.endsWith('.as'));
}

function numberedValues(text, variable, prefix) {
  const match = text.match(new RegExp(`_global\\.${variable} = \\[([^\\]]+)\\];`));
  assert.ok(match, `${variable} is missing`);
  const values = [...match[1].matchAll(new RegExp(`"${prefix}(\\d+)(?:Opt([1-4]))?"`, 'g'))];
  assert.equal(values.length, 35, `${variable} needs 35 entries`);
  assert.ok(values.every((value, index) => Number(value[1]) === index + 1), `${variable} order changed`);
  return values.map(value => value[2] ? Number(value[2]) : Number(value[1]));
}

function derive(exportRoot) {
  const main = script(exportRoot, 'DefineSprite_1258/frame_1/DoAction.as');
  const result = script(exportRoot, 'DefineSprite_17/frame_2/DoAction.as');
  const englishAudio = script(exportRoot, 'DefineButton2_58/BUTTONCONDACTION on(release).as');
  const spanishAudio = script(exportRoot, 'DefineButton2_52/BUTTONCONDACTION on(release).as');
  const review = script(exportRoot, 'DefineButton2_607/BUTTONCONDACTION on(release).as');
  const answers = numberedValues(main.text, 'arrayAnswer', 'A');
  numberedValues(main.text, 'quizLabelArray', 'Q');
  numberedValues(main.text, 'revLabelArray', 'R');
  assert.match(main.text, /_global\.totalQuestionsCount = 10;/);
  assert.match(main.text, /random\(_global\.quizLabelArray\.length\)/);
  assert.match(main.text, /_global\.quizLabelArray\.splice\(_global\.tempQNo,1\)/);
  assert.match(main.text, /_global\.revLabelArray\.splice\(_global\.tempQNo,1\)/);
  assert.match(main.text, /_global\.arrayReview\.push\(_global\.revLabelArray\[_global\.tempQNo\]\)/);
  assert.match(main.text, /gotoAndStop\(_global\.arrayReview\[_global\.reviewCount - 1\]\)/);
  assert.match(main.text, /Mc_Finish\.gotoAndStop\(2\)/);
  assert.match(main.text, /_root\.Report_URL/);
  assert.match(main.text, /getURL\(strURL,""\)/);
  assert.match(result.text, /_root\.Send_Quiz_Report_Mc\.gotoAndPlay\(2\)/);
  assert.match(result.text, /_root\.QuizReport_URL/);
  assert.match(result.text, /Student_ID/);
  assert.match(englishAudio.text, /doPlayFQQuestionAudio\(this,"EN"\)/);
  assert.match(spanishAudio.text, /doPlayFQQuestionAudio\(this,"SP"\)/);
  assert.match(review.text, /doGetReview\(\)/);

  const all = listScripts(path.join(exportRoot, 'scripts'));
  const optionHandlers = all.filter(file => file.includes('DefineSprite_1258') && file.includes('/PlaceObject2_') && file.includes('on(release)'));
  let correct = 0;
  let wrong = 0;
  for (const file of optionHandlers) {
    const body = fs.readFileSync(file, 'utf8');
    if (!body.includes('_global.arrayResponseAnswer.push(this._name)') || !body.includes('_parent.doGetRandomQuiz()')) continue;
    if (body.includes('_global.arrayCorrectAnswer.push(this._name)')) correct++;
    else if (body.includes('_global.arrayWrongAnswer.push(this._name)')) wrong++;
  }
  assert.equal(correct, 35, 'one correct handler per source question');
  assert.equal(wrong, 105, 'three wrong handlers per source question');
  return {
    schemaVersion: 1,
    animationId: 'shared-nms002-l02-p064',
    source: {relativePath: sourceRelativePath, bytes: 55392, sha256: sourceSha256},
    tool: {name: 'FFDec', version: '26.2.1'},
    scripts: {
      mainSpriteId: 1258, mainFrameOneSha256: main.sha256,
      resultSpriteId: 17, resultFrameTwoSha256: result.sha256,
      englishAudioButtonSha256: englishAudio.sha256,
      spanishAudioButtonSha256: spanishAudio.sha256,
      reviewButtonSha256: review.sha256,
      totalExported: all.length, correctOptionHandlers: correct, wrongOptionHandlers: wrong,
    },
    quiz: {bankSize: 35, drawCount: 10, optionCount: 4, selection: 'random-index-without-replacement',
      correctOptions: answers,
      gradeBands: [
        {minCorrect: 0, maxCorrect: 3, label: 'Unsatisfactory'},
        {minCorrect: 4, maxCorrect: 6, label: 'Partially Proficient'},
        {minCorrect: 7, maxCorrect: 8, label: 'Proficient'},
        {minCorrect: 9, maxCorrect: 10, label: 'Advanced'},
      ]},
    boundaries: {
      reviewOrder: 'selected-question-order',
      hostQuestionAudio: 'EN-and-SP-buttons-call-external-host; answer-audio-unresolved',
      legacyQuizReport: 'source-calls-external-host; not-authorized-for-modern-execution',
      legacyBookmarkAndClose: 'source-calls-external-host-or-getURL; not-authorized-for-modern-execution',
      completion: 'unresolved-original-host-natural-trace-required',
    },
  };
}

const mode = process.argv[2];
assert.ok(mode === '--build' || mode === '--check', 'Use --build or --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot, 'Exact G6-G8 source root required');
assert.ok(fs.lstatSync(sourceRoot).isDirectory() && fs.realpathSync(sourceRoot) === sourceRoot, 'Source root must be real');
const source = path.join(sourceRoot, sourceRelativePath);
assert.ok(fs.lstatSync(source).isFile(), 'Source SWF must be a file');
const sourceBytes = fs.readFileSync(source);
assert.equal(sourceBytes.length, 55392);
assert.equal(sha(sourceBytes), sourceSha256);
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'g678-p064-quiz-'));
try {
  const result = spawnSync('ffdec', ['-export', 'script', temporary, source], {encoding: 'utf8', maxBuffer: 4 * 1024 * 1024});
  assert.equal(result.status, 0, result.stderr || 'FFDec export failed');
  assert.match(result.stdout, /JPEXS Free Flash Decompiler v\.26\.2\.1/);
  const contract = JSON.stringify(derive(temporary), null, 2) + '\n';
  if (mode === '--build') fs.writeFileSync(output, contract, {flag: 'wx'});
  else assert.equal(fs.readFileSync(output, 'utf8'), contract, 'P064 source contract drift');
  console.log(JSON.stringify({status: 'PASS', mode, output, sha256: sha(contract)}));
} finally {
  fs.rmSync(temporary, {recursive: true, force: true});
}
