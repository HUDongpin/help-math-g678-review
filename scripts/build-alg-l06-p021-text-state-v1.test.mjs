import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
test('P021 generator verifies frozen source and deterministic text IR',()=>{
 const run=spawnSync(process.execPath,['scripts/build-alg-l06-p021-text-state-v1.mjs','--check'],
  {cwd:root,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const state=JSON.parse(fs.readFileSync(path.join(root,
  'migrations/shared-alg001-l06-p021/audit/text-state-v1/text-state-source-v1.json')));
 const audit=JSON.parse(fs.readFileSync(path.join(root,
  'output/alg-l06-p021-source-audit-v1/time-resolved-audit-v1.json')));
 assert.equal(state.sourceSwfSha256,audit.source.sha256);
 assert.deepEqual(state.glossaryControls.map(x=>[x.key,x.firstCandidateFrame]),
  [['Set',12],['Function',20],['Value',25],['Ordered pair',62],['Input',69],['Output',77]]);
 assert.deepEqual(state.tableRows.map(x=>[x.inputText,x.outputText,x.firstCompletePairFrame]),
  [['2','3',204],['3','5',204],['5','-2',204],['7','1',204]]);
 assert.deepEqual(state.orderedPairs.map(x=>[x.inputText,x.outputText,x.firstCompletePairFrame]),
  [['2','3',346],['3','5',356],['5','-2',366],['7','1',376]]);
 for(const input of state.inputs)assert.equal(sha(fs.readFileSync(path.join(root,input.path))),input.sha256);
 for(const pair of state.orderedPairs){
  assert.equal(pair.sourceInstanceIds.length,4);
  assert.deepEqual(pair.completePairSpans,[[pair.firstCompletePairFrame,377]]);
 }
 assert.equal(state.policy.originalRuntimeAccepted,false);
});
