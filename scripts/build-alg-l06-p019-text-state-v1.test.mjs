import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT=path.resolve(import.meta.dirname,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));

test('P019 generated source state is reproducible from exact physical SWF and frozen time audit',()=>{
  const result=JSON.parse(execFileSync(process.execPath,
    ['scripts/build-alg-l06-p019-text-state-v1.mjs','--check'],
    {cwd:ROOT,encoding:'utf8'}));
  assert.equal(result.mode,'--check');
  assert.equal(result.textInstances,38);
  const report=JSON.parse(read('migrations/shared-alg001-l06-p019/audit/text-state-v1/text-state-source-v1.json'));
  assert.equal(report.sourceSwfSha256,
    'df8be172fd738ec4fca7bca02b0f166c88676f062170e6cee7b3a1081a91adec');
  assert.deepEqual(report.inputs.map(item=>[item.path,item.sha256]),[
    ['output/alg-l06-p019-source-audit-v1/time-resolved-audit-v1.json',
      'bfc110b15850c17cb78c874da171c2a0635b4db1ed3c2f27a0a05013cf510dc1'],
    ['output/alg-l06-p019-source-audit-v1/frame-states-v1.json',
      'ad4913b2ac3f2086c5bc5d335bb3ebd4e8356d2782df5b13e0b1b776b04fd990']]);
  for(const input of report.inputs)assert.equal(sha(read(input.path)),input.sha256);
  assert.deepEqual(report.tableRows.map(row=>[row.inputText,row.outputText,
    row.firstCompletePairFrame]),[['2','3',171],['3','5',175],['5','-2',178],['7','1',182]]);
  assert.equal(report.policy.originalRuntimeAccepted,false);
});
