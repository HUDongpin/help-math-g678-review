import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const ROOT=path.resolve(import.meta.dirname,'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(ROOT,relative));

test('P018 generated state is reproducible from v2 audit and exact physical source',()=>{
  const result=JSON.parse(execFileSync(process.execPath,
    ['scripts/build-alg-l06-p018-text-state-v1.mjs','--check'],
    {cwd:ROOT,encoding:'utf8'}));
  assert.equal(result.mode,'--check');
  assert.equal(result.textInstances,38);
  const report=JSON.parse(read('migrations/shared-alg001-l06-p018/audit/text-state-v1/text-state-source-v1.json'));
  assert.equal(report.sourceSwfSha256,
    '400f0cdcb574864c7e9e2208f986e91f26e10f796623b6ea41d80a59310e167a');
  assert.deepEqual(report.inputs.map(item=>[item.path,item.sha256]),[
    ['output/alg-l06-p018-source-audit-v1/time-resolved-audit-v2.json',
      '6a8e289b3f4ce2c635cff61ae8b950596272d6ff835c3fae0ec6a8f1dfd66e79'],
    ['output/alg-l06-p018-source-audit-v1/frame-states-v2.json',
      'b03f44b01075da419444ba8e11b27ee2bff2352369d7d5da3b599b1fdeadf9b0']]);
  for(const input of report.inputs)assert.equal(sha(read(input.path)),input.sha256);
  const secondEvaluate=report.glossaryControls.find(control=>
    control.sourceButtonInstanceId==='sprite-32/depth-22/generation-1');
  assert.equal(secondEvaluate?.sourceLabelTextId,27);
  assert.equal(secondEvaluate?.firstCandidateFrame,324);
});
