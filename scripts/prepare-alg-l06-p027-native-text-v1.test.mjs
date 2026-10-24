#!/usr/bin/env node
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {build} from './prepare-alg-l06-p027-native-text-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/alg-l06-p027-source-planning-20261001-v1';
const read=name=>fs.readFileSync(path.join(ROOT,name));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('physical SWF, source XML, FFDec text, and action hashes regenerate exact geometry',()=>{
 const result=execFileSync('node',['scripts/prepare-alg-l06-p027-native-text-v1.mjs','--check'],
  {cwd:ROOT,env:{...process.env,
   HELP_MATH_G678_SOURCE_ROOT:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware'},
   encoding:'utf8'});
 assert.equal(JSON.parse(result).mode,'--check');
 const receipt=JSON.parse(read('output/alg-l06-p027-native-text-v1/generation-receipt-v1.json'));
 for(const input of receipt.inputs){
  const bytes=read(input.path);assert.equal(bytes.length,input.bytes);
  assert.equal(sha(bytes),input.sha256,input.path);
 }
 for(const output of receipt.outputs){
  const bytes=read(output.path);assert.equal(bytes.length,output.bytes);
  assert.equal(sha(bytes),output.sha256,output.path);
 }
 assert.equal(receipt.sourceSwfSha256,
  '689318e75aac8740344e8ff119df34a288e7da24dc3dc0c62c0f22601666f984');
});

test('source glyph strings, colors, fonts, and placements stay source-owned',()=>{
 const model=JSON.parse(read('output/alg-l06-p027-native-text-v1/geometry-v1.json'));
 assert.equal(model.frameDomain,'sprite-46');assert.equal(model.mainFrameCount,770);
 assert.equal(model.rootFrameCount,10);assert.equal(model.rootEntryFrame,6);
 assert.equal(model.definitions.length,17);
 assert.equal(model.instances.filter(row=>model.definitions.some(def=>def.textId===row.objectId)).length,36);
 assert.equal(model.nativeCandidateTextInstanceIds.length,36);
 assert.equal(model.canvasSourceGlyphsPreserved,true);
 assert.equal(model.canvasInstanceSuppressionSupported,false);
 const text5=model.definitions.find(def=>def.textId===5);
 assert.equal(text5.text,'The vertical-line test is a way to see whether a graph is a function.');
 assert.deepEqual(text5.runs.filter(run=>run.colorRgb.join(',')==='0,0,204').map(run=>run.text),
  ['vertical-line test','graph','function']);
 const text15=model.definitions.find(def=>def.textId===15);
 assert.equal(text15.runs[1].text,'vertical line');
 assert.equal(text15.runs[1].glyphs.length,13);
 const text20=model.definitions.find(def=>def.textId===20);
 assert.equal(text20.runs[1].text,'point');
 for(const definition of model.definitions)for(const run of definition.runs){
  assert.equal(run.glyphs.map(g=>g.character).join(''),run.text);
  assert.equal(run.glyphs.reduce((sum,g)=>sum+g.advance,0),run.width);
  assert([4,24].includes(run.fontId));
 }
 const graphNumbers=model.definitions.filter(def=>[25,26,27,28,30,31,33,35].includes(def.textId));
 assert.equal(graphNumbers.length,8);
 assert(graphNumbers.every(def=>def.runs.every(run=>run.colorRgb.join(',')==='0,0,0')));
});

test('six exact source actions bind to their own blue glyph spans',()=>{
 const model=JSON.parse(read('output/alg-l06-p027-native-text-v1/geometry-v1.json'));
 const expected=new Map([
  ['Vertical-line test',[7,5,'vertical-line test',0]],['Function',[8,5,'function',0]],
  ['Graph',[9,5,'graph',0]],['Vertical',[16,15,'vertical',0]],
  ['Line',[17,15,'line',9]],['Point',[21,20,'point',0]],
 ]);
 assert.equal(model.glossary.length,6);
 for(const control of model.glossary){
  const [buttonId,textId,segment,start]=expected.get(control.key);
  assert.deepEqual([control.buttonId,control.label.textId,control.label.segment,
   control.label.glyphStart],[buttonId,textId,segment,start]);
  assert.equal(control.sourceActionSha256.length,64);
  assert(model.instances.some(row=>row.instanceId===control.instanceId&&row.objectId===buttonId));
  assert(model.instances.some(row=>row.instanceId===control.label.textInstanceId&&row.objectId===textId));
  assert.deepEqual(control.hitShapeBoundsTwips,[-1516,-581,-205,204]);
 }
 assert.deepEqual(model.maskShapeBoundsTwips,[-5839,5840,-330,330]);
 assert.deepEqual(model.instances.filter(row=>row.objectId===2&&row.clipDepth!==null)
  .map(row=>[row.depth,row.clipDepth]),[[1,10],[11,18],[19,24]]);
});

test('candidate source hash drift fails before generating a changed timeline',()=>{
 const plan=read(`${BASE}/source-plan-v1.json`),display=read(`${BASE}/source-display-list-v1.json`),
  xml=read(`${BASE}/source-structure.xml`);
 assert.throws(()=>build({planBytes:plan,displayBytes:display,
  xmlBytes:Buffer.from(xml.toString().replace('frames="770"','frames="771"'))}),
  /Expected values to be strictly equal/u);
});
