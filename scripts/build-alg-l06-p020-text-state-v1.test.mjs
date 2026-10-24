import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const REPORT='migrations/shared-alg001-l06-p020/audit/text-state-v1/text-state-source-v1.json';

test('P020 text data is reproducible from the exact physical SWF and frozen source audit',()=>{
 const result=execFileSync(process.execPath,['scripts/build-alg-l06-p020-text-state-v1.mjs','--check'],
  {cwd:ROOT,encoding:'utf8'});
 assert.equal(JSON.parse(result).status,'verified');
 const source=JSON.parse(fs.readFileSync(path.join(ROOT,REPORT),'utf8'));
 assert.equal(source.sourceSwfSha256,
  '6d0df40af188c98b77a7419b89223c922200723ce106240a6d08e49891a5d25f');
 assert.equal(source.frameDomain,'sprite-162');assert.equal(source.frameCount,172);
 assert.deepEqual(source.table.rows.map(row=>[row.inputText,row.outputText]),
  [['2','3'],['3','5'],['5','-2'],['7','1']]);
 assert.deepEqual(source.options.map(row=>[row.option,row.value,row.sourceInstance,row.buttonId]),
  [['A','1','AnsBtn1',159],['B','-2','AnsBtn2',158],
   ['C','3','AnsBtn3',159],['D','5','AnsBtn4',159]]);
 assert.deepEqual(source.options.map(row=>[row.option,row.visibleSpans]),
  [['A',[[7,59]]],['B',[[7,172]]],['C',[[7,59]]],['D',[[7,59]]]]);
 assert.deepEqual(source.glossaryControls.map(row=>[row.key,row.firstCandidateFrame]),
  [['Input',7],['Function',7],['Output',7]]);
 assert.deepEqual(source.feedback.domains.filter(row=>row.kind==='wrong')
  .map(row=>[row.domain,row.titleSemanticFrame,row.acknowledgment.holdFrame,
   row.acknowledgment.buttonId]),
  [[65,16,23,60],[94,6,20,89],[80,9,21,74]]);
 assert.equal(source.policy.originalRuntimeAccepted,false);
});
