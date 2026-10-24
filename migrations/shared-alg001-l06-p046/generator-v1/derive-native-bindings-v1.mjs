import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const source = new URL('../native-v1/source-model-v1.json', import.meta.url);
const raw = fs.readFileSync(source);
const sha256 = createHash('sha256').update(raw).digest('hex');
assert.equal(sha256, '0ab3cce9ece208aae74dd0a8ecc380c2fe1a6c2ea19a4d4ce0cc8ab816f7d682');
const m = JSON.parse(raw);
const partners = [22, 23, 26, 24, 25];
const rows = [...m.drags].sort((a, b) => a.targetOriginPx[1] - b.targetOriginPx[1]).map((drag, i) => {
  const missing = drag.targetOriginPx[0] < 250 ? 'input' : 'output';
  const givenTextId = partners[i];
  const given = m.texts[givenTextId].text;
  const number = text => Number(text.replace('–', '-'));
  const x = number(missing === 'input' ? drag.value : given);
  const y = number(missing === 'output' ? drag.value : given);
  assert.equal(y, 3 * x - 5);
  return {id: drag.id, missing, given, givenTextId, answer: drag.value,
    answerTextId: drag.textId, sourceInstance: drag.sourceInstance, targetInstance: drag.targetInstance};
});
const text = id => ({textId: id, text: m.texts[id].text});
const binding = {schemaVersion: 1, animationId: m.animationId, sourceModelSha256: sha256,
  sourceSwfSha256: m.assetId.slice(4), question: text(11), equation: text(33),
  inputLabel: text(20), outputLabel: text(21), retry: text(57),
  bank: [...m.drags].sort((a, b) => a.sourceOriginPx[1] - b.sourceOriginPx[1])
    .map(({id, value, textId}) => ({id, value, textId})), rows,
  help: [76, 77, 78, 79].map(text), glossary: m.glossary,
  languagePolicy: 'English source content; Spanish UI and exact dictionary definitions are separate',
  geometryPolicy: 'Native semantic table; source positions and boxes remain in source-model-v1.json'};
const bytes = JSON.stringify(binding, null, 2) + '\n';
const out = new URL('../native-v1/native-bindings-v1.json', import.meta.url);
assert.equal(process.argv.length, 3);
if (process.argv[2] === '--write') fs.writeFileSync(out, bytes, {flag: 'wx'});
else {assert.equal(process.argv[2], '--check'); assert.equal(fs.readFileSync(out, 'utf8'), bytes);}
console.log({mode: process.argv[2], rows: rows.length, sha256: createHash('sha256').update(bytes).digest('hex')});
