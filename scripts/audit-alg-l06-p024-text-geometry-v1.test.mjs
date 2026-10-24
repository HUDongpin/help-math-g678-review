import assert from 'node:assert/strict';
import {test} from 'node:test';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {audit} from './audit-alg-l06-p024-text-geometry-v1.mjs';

const script=fileURLToPath(new URL('./audit-alg-l06-p024-text-geometry-v1.mjs',import.meta.url));
const cwd=path.dirname(path.dirname(script));
const evidence=()=>JSON.parse(audit().get('text-geometry-v1.json').toString());

test('the pinned physical SWF yields deterministic output',()=>{
 const first=audit().get('text-geometry-v1.json');
 assert(first.equals(audit().get('text-geometry-v1.json')));
 const run=JSON.parse(execFileSync(process.execPath,[script,'--check'],{cwd,encoding:'utf8'}));
 assert.equal(run.status,'verified');
 assert.equal(run.files[0].bytes,first.length);
});

test('shared first-line glossary gates wait for full blue ink despite earlier hits',()=>{
 const e=evidence();assert.deepEqual(e.glossary.slice(0,4).map(g=>g.firstPlacementFrame),[2,2,2,2]);
 assert.deepEqual(e.glossary.slice(0,4).map(g=>g.firstFullHitFrame),[7,7,7,7]);
 assert.deepEqual(e.glossary.slice(0,4).map(g=>g.firstSourceReadyFrame),[7,7,7,7]);
 assert(e.glossary.slice(0,4).every(g=>g.firstSourceReadySample.overlapRatio>=0.95));
});

test('mask wipe delays Function table hit and glyph gate, and question complete ink',()=>{
 const e=evidence(),functionTable=e.glossary[4];
 assert.equal(functionTable.firstPlacementFrame,67);
 assert.equal(functionTable.firstSourceReadyFrame,80);
 assert.equal(functionTable.frameSamples.find(s=>s.frame===67).labelFull,false);
 assert.equal(functionTable.frameSamples.find(s=>s.frame===80).buttonFullHit,true);
 assert.equal(e.tableParagraph.firstCompleteInkFrame,109);
 assert.equal(e.question.firstCompleteInkFrame,142);
 assert.equal(e.question.maskFrames.find(s=>s.frame===140).question.completeInk,false);
 assert.equal(e.question.maskFrames.find(s=>s.frame===153).question.completeInk,true);
 assert.deepEqual(e.glossary.slice(5).map(g=>[g.key,g.firstSourceReadyFrame]),
  [['Function in table paragraph',109],['Range in question',134]]);
 assert(e.glossary[6].firstSourceReadyFrame<e.question.firstCompleteInkFrame);
});

test('table candidate includes source outline and ordered row geometry',()=>{
 const e=evidence(),t=e.table.firstCompleteSnapshot;
 assert.equal(e.table.firstCompleteGeometryFrame,7);
 assert.deepEqual(t.rows.map(r=>r.text),['Input','Output','1','10','100','–1','0','1']);
 for(const r of t.rows){assert(r.inkBounds.left>=t.outlineBounds.left);
  assert(r.inkBounds.right<=t.outlineBounds.right);}
 assert(t.rows[0].inkBounds.right<t.rows[1].inkBounds.left);
 assert(t.rows[2].inkBounds.right<t.rows[5].inkBounds.left);
 assert(t.rows[3].inkBounds.bottom<t.rows[4].inkBounds.top);
});
