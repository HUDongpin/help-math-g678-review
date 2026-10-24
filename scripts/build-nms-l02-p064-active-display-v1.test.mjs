import assert from 'node:assert/strict';
import {execFileSync, spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const output = new URL('../migrations/shared-nms002-l02-p064/audit/active-display-list-v1.json', import.meta.url);
const script = new URL('./build-nms-l02-p064-active-display-v1.py', import.meta.url);
const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const manifest = JSON.parse(readFileSync(output, 'utf8'));
const sha = bytes => createHash('sha256').update(bytes).digest('hex');

test('source-locked active display list regenerates exactly', () => {
  const result = JSON.parse(execFileSync('python3', [fileURLToPath(script), '--check'], {
    encoding: 'utf8', env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: sourceRoot},
  }));
  assert.equal(result.status, 'PASS');
  assert.equal(result.sha256, sha(readFileSync(output)));
  assert.equal(result.questions, 35);
});

test('generator refuses overwrite and compatibility source root', () => {
  const before = sha(readFileSync(output));
  const existing = spawnSync('python3', [fileURLToPath(script), '--build'], {
    encoding: 'utf8', env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: sourceRoot},
  });
  assert.notEqual(existing.status, 0);
  assert.match(existing.stderr, /FileExistsError/);
  assert.equal(sha(readFileSync(output)), before);
  const compatibility = spawnSync('python3', [fileURLToPath(script), '--check'], {
    encoding: 'utf8', env: {...process.env, HELP_MATH_G678_SOURCE_ROOT: '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/source-assets/g678'},
  });
  assert.notEqual(compatibility.status, 0);
  assert.match(compatibility.stderr, /exact real source root required/);
  assert.equal(sha(readFileSync(output)), before);
});

test('all question/review frames retain source options and frame identity', () => {
  assert.equal(manifest.authority, 'static-swf-display-list-only');
  assert.equal(manifest.questions.length, 35);
  const ir = JSON.parse(readFileSync(new URL('../migrations/shared-nms002-l02-p064/audit/question-content-ir-v1.json', import.meta.url)));
  for (const [index, question] of manifest.questions.entries()) {
    assert.equal(question.questionId, index + 1);
    assert.equal(question.questionFrame, index + 2);
    assert.equal(question.reviewFrame, index + 55);
    const names = ir.questions[index].options.map(option => option.instance.name);
    for (const name of names) {
      assert.equal(question.activePlacements.filter(placement => placement.name === name).length, 1,
        `Q${index + 1} missing source option ${name}`);
    }
    assert.ok(question.reviewActivePlacements.length > 0);
  }
});

test('ten delta-silent questions inherit a live source prompt', () => {
  const inherited = manifest.questions.filter(question =>
    question.inheritedPlacements.some(placement => placement.rawText && !placement.name));
  assert.deepEqual(inherited.map(question => question.questionId),
    [2, 3, 5, 6, 12, 13, 15, 16, 18, 19]);
  for (const question of inherited) {
    assert.ok(question.activePlacements.some(placement =>
      placement.rawText && !placement.name && placement.originFrame < question.questionFrame));
  }
  assert.equal(manifest.questions[1].activePlacements.find(placement => placement.symbolId === 22)?.originFrame, 2);
  assert.equal(manifest.questions[17].activePlacements.find(placement => placement.symbolId === 301)?.originFrame, 18);
});

test('move-only updates change the retained number-line label position', () => {
  const at = questionId => manifest.questions[questionId - 1].activePlacements
    .find(placement => placement.symbolId === 103);
  assert.equal(at(5).transform.transX, '1218');
  assert.equal(at(6).transform.transX, '2038');
  assert.equal(at(18).transform.transX, '-2082');
  assert.equal(at(19).transform.transX, '-422');
  assert.deepEqual([at(5), at(6), at(18), at(19)].map(placement => placement.originFrame),
    [5, 5, 18, 18]);
});

test('matrixless character replacements retain the prior depth transform', () => {
  assert.equal(manifest.mainSprite.matrixlessReplacements, 151);
  const at = (questionId, symbolId) => manifest.questions[questionId - 1].activePlacements
    .find(placement => placement.symbolId === symbolId);
  const q2Graphic = at(2, 70);
  assert.equal(q2Graphic.transformInheritedFromSymbolId, 23);
  assert.deepEqual(q2Graphic.transform, at(1, 23).transform);
  const q15Prompt = at(15, 260);
  assert.equal(q15Prompt.transformInheritedFromSymbolId, 214);
  assert.equal(q15Prompt.transform.transX, '-5835');
  assert.equal(q15Prompt.transform.transY, '-1804');
});
