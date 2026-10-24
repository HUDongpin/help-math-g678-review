import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {parseArgs,plan} from './probe-nms-l02-p054-pending-media-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('pending media probe is limited to two real P054 levels and Replay/navigation cancellation',()=>{
 const p=plan();
 assert.equal(p.formal,false);assert.equal(p.animationId,'shared-nms002-l02-p054');
 assert.deepEqual(p.cases.map(item=>[item.locale,item.level,item.width,item.reducedMotion]),
  [['en',1,1440,'no-preference'],['es',2,390,'reduce']]);
 assert(p.checks.some(check=>check.includes('host Replay aborts both pending requests')));
 assert(p.checks.some(check=>check.includes('pending navigation to registered P064')));
 assert.equal(new Set(p.inputPaths).size,p.inputPaths.length);
 assert.deepEqual(parseArgs(['--plan']),{mode:'plan'});
 assert.deepEqual(parseArgs(['--run','pending-v1']),{mode:'run',slug:'pending-v1'});
 assert.throws(()=>parseArgs(['--run','../escape']),/Usage/u);
});

test('pending media inputs and the two physical source streams retain exact hashes',async()=>{
 const p=plan();
 const source=await readFile(p.source.path);
 assert.deepEqual({bytes:source.length,sha256:sha(source)},
  {bytes:p.source.bytes,sha256:p.source.sha256});
 const root='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-audio-streams-v1';
 for(const [kind,item] of Object.entries(p.feedbackAudio)){
  const bytes=await readFile(path.join(root,`sprite-${item.sprite}-source-stream-v1.mp3`));
  assert.deepEqual({bytes:bytes.length,sha256:sha(bytes)},
   {bytes:item.bytes,sha256:item.sha256},kind);
 }
 for(const relative of p.inputPaths)
  await readFile(path.isAbsolute(relative)?relative:path.join(ROOT,relative));
});
