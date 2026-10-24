import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';
import {generateP055Terms, productBytes, projectP055Product} from './generate-nms-l02-p055-terms-v1.mjs';

const candidatePath = new URL('../output/nms-l02-host-successor-20260927/glossary/p055-conditional-l1-host-bank.json', import.meta.url);

test('P055 product projects the exact conditional glossary data with typed lookups', async () => {
  const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));
  const {terms, disposition} = projectP055Product(candidate);
  assert.deepEqual(terms.map(term => term.id), ['restate', 'question', 'problem']);
  assert.deepEqual(terms.map(term => term.labels.es), ['Replantear', 'Pregunta', 'Problema']);
  assert.equal(disposition.originalL2XmlResolved, false);
  assert.equal(disposition.historicalHostAssociationEstablished, false);
  assert.equal(disposition.originalRuntimeLookupVerified, false);
  const {bytes} = await productBytes();
  assert.deepEqual(bytes, await readFile(new URL('../packages/demos/src/generated/nms-l02-p055-terms-v1.ts', import.meta.url)));
  await generateP055Terms({check: true});
});

test('P055 product projection refuses unqualified L2 or duplicate host lookup assertions', async () => {
  const candidate = JSON.parse(await readFile(candidatePath, 'utf8'));
  assert.throws(() => projectP055Product({...candidate, originalL2XmlResolved: true}));
  const changed = structuredClone(candidate);
  changed.terms[1].matching.englishHostLabelOccurrences = 2;
  assert.throws(() => projectP055Product(changed));
  const wrongSource = structuredClone(candidate);
  wrongSource.terms[2].source.en.sha256 = '0'.repeat(64);
  assert.throws(() => projectP055Product(wrongSource));
});
