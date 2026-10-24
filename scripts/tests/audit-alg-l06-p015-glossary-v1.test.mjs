import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {buildP015GlossaryAudit,parseP015GlossaryRelease} from '../audit-alg-l06-p015-glossary-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const output='migrations/shared-alg001-l06-p015/audit/glossary-v1/six-term-crosswalk-v1.json';

test('P015 exact release grammar preserves key, host call and unconditional stop order',()=>{
  const valid='on(release){\n   _global.KeyAttribute = "Function";\n'+
    '   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}\n';
  assert.equal(parseP015GlossaryRelease(valid),'Function');
  assert.throws(()=>parseP015GlossaryRelease(valid.replace('Function','function')),
    /exact glossary release key/u);
  assert.throws(()=>parseP015GlossaryRelease(valid.replace(
    '   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();',
    '   _root.animation_mc.animation.stop();\n   _root.DoHyperLinks();')),
    /exact glossary release sequence/u);
  assert.throws(()=>parseP015GlossaryRelease(valid.replace(
    '   _root.animation_mc.animation.stop();\n','')),
    /exact glossary release sequence/u);
});

test('P015 source actions bind six distinct dictionary entries and explicit-only separate SA',()=>{
  const audit=buildP015GlossaryAudit();
  const expected=[['Function',36,164,4],['Value',37,164,6],['Relation',38,164,8],
    ['Rule',45,271,14],['Input',46,271,16],['Output',47,271,18]];
  assert.deepEqual(audit.sourceButtons.map(row=>[
    row.sourceKeyAttribute,row.characterId,row.firstFrame,row.depth]),expected);
  assert(audit.sourceButtons.every(row=>row.lastFrameExclusive===915));
  assert.deepEqual(audit.terms.map(row=>row.sourceKeyAttribute),expected.map(row=>row[0]));
  assert.equal(new Set(audit.terms.map(row=>row.id)).size,6);
  for(const term of audit.terms){
    assert(term.labels.en&&term.labels.es&&term.definitions.en&&term.definitions.es);
    assert(term.sourceEntrySha256.en&&term.sourceEntrySha256.es);
    assert.equal(term.exactP004SourceEntryReuse,true);
  }
  assert.equal(audit.separateSpanishAudio.explicitSourceTrigger,
    'indexMI button273 on(release) calls doPlaySpanishAudio');
  assert.equal(audit.separateSpanishAudio.localeEsAutoplayEvidence,false);
  assert.equal(audit.oldHostStaticPath.actualLaunchObserved,false);
  assert.equal(audit.acceptanceEffects.currentJsRegistered,false);
  assert.equal(audit.acceptanceEffects.audio,false);
});

test('P015 frozen glossary audit reproduces byte-for-byte from the physical source',()=>{
  const result=JSON.parse(execFileSync('node',['scripts/audit-alg-l06-p015-glossary-v1.mjs','--check'],
    {cwd:root,encoding:'utf8'}));
  assert.equal(result.output.path,output);
  assert.equal(readFileSync(path.join(root,output)).length,result.output.bytes);
});
