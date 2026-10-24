import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
test('P022 generator verifies source, six own-label gates, and source geometry',()=>{
 const run=spawnSync(process.execPath,['scripts/build-alg-l06-p022-text-state-v1.mjs','--check'],
  {cwd:root,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const state=JSON.parse(fs.readFileSync(path.join(root,
  'output/alg-l06-p022-native-text-v1/text-state-source-v1.json')));
 const audit=JSON.parse(fs.readFileSync(path.join(root,
  'output/alg-l06-p022-source-audit-v1/time-resolved-audit-v1.json')));
 assert.equal(state.sourceSwfSha256,audit.source.sha256);
 assert.deepEqual(state.glossaryControls.map(x=>[x.key,x.firstCandidateFrame]),
  [['Graph',8],['Function',17],['Representation',42],['Ordered pair',85],['Input',91],['Output',99]]);
 assert.equal(state.textInstances.length,87);
 assert.deepEqual(state.orderedPair.completePairSpans,[[361,422]]);
 assert.deepEqual(state.orderedPair.sourceTextIds,[65,64,59,62]);
 assert.equal(state.orderedPair.movingCopyInstanceIds.length,4);
 for(const input of state.inputs)assert.equal(sha(fs.readFileSync(path.join(root,input.path))),input.sha256);
 assert.equal(state.policy.originalRuntimeAccepted,false);
});
