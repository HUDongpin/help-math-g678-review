import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {buildP055ConditionalGlossary, extractP055Terms, prepareP055ConditionalGlossary} from './prepare-nms-l02-ts-glossary.mjs';

const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const readBanks = async () => Promise.all(['L1KTE01.xml', 'L1KTS01.xml'].map(name => readFile(`${sourceRoot}/${name}`, 'utf8')));

test('P055 conditional candidate is pinned to exact source, host, and duplicate-free bilingual entries', async () => {
  const candidate = await buildP055ConditionalGlossary();
  assert.deepEqual(candidate.terms.map(term => term.sourceKeyAttribute), ['Restate', 'Question', 'Problem']);
  assert.deepEqual(candidate.terms.map(term => term.labels.es), ['Replantear', 'Pregunta', 'Problema']);
  assert.deepEqual(candidate.terms.map(term => term.definitions.en), [
    'To repeat again; to say again',
    'A problem to solve. For example: Find the mean of this set of numbers {1, 2, 5, 10}',
    'A question to solve or answer. For example: Evaluate the equation y = 2x + 3',
  ]);
  assert.equal(candidate.originalL2XmlResolved, false);
  assert.equal(candidate.historicalHostAssociationEstablished, false);
  assert.equal(candidate.originalRuntimeLookupVerified, false);
  assert.deepEqual(candidate.terms.map(term => term.matching.englishHostLabelOccurrences), [1, 1, 1]);
  await prepareP055ConditionalGlossary({check: true});
});

test('candidate rejects duplicate host labels and cross-bank definition drift', async () => {
  const [en, es] = await readBanks();
  assert.ok(en.includes('<Y-intercept~LNG~Intersección~y '));
  assert.throws(() => extractP055Terms(en.replace('<Y-intercept~LNG~Intersección~y ', '<Restate~LNG~Replantear '), es), /English host lookup uniqueness/u);
  assert.throws(() => extractP055Terms(en, es.replace('To repeat again; to say again', 'To repeat once')), /cross-bank definitions/u);
});
