import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build,makeModel} from './prepare-alg-l06-p026-native-text-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=path.join(root,'output/alg-l06-p026-behavior-ir-v1');
const source=()=>({
 ir:JSON.parse(fs.readFileSync(path.join(base,'behavior-ir-v1.json'))),
 display:JSON.parse(fs.readFileSync(path.join(base,'source-display-list-v1.json'))),
 xml:fs.readFileSync(path.join(base,'source-structure.xml'),'utf8'),
});

test('generated geometry and projection reproduce pinned source input',()=>{
 for(const [relative,body] of build())assert.equal(fs.readFileSync(path.join(root,relative),'utf8'),body,relative);
 const {ir,display,xml}=source();const model=makeModel(ir,display,xml);
 assert.equal(model.definitions.length,31);
 assert.equal(model.instances.filter(row=>model.definitions.some(def=>def.textId===row.objectId)).length,47);
 assert.equal(model.glossary.length,20);
 assert.deepEqual([...new Set(model.glossary.map(row=>row.key))],
  ['Independent variable','Function','Input variable','Domain','Dependent variable','Output variable','Range']);
 assert.deepEqual(model.instances.filter(row=>row.objectId===18&&row.clipDepth!==null).map(row=>[row.depth,row.clipDepth]),[[15,24],[25,30]]);
});

test('source drift and action or blue-run contradiction fail closed',()=>{
 const {ir,display,xml}=source();
 const changed=Buffer.from(JSON.stringify({...display,buttonIds:[8,9,10]}));
 assert.throws(()=>build({displayBytes:changed}),/sha256|displayList|equal/u);
 const wrongAction=structuredClone(ir);
 wrongAction.glossary[1].actionsInOrder[2]='_root.animation_mc.animation.play()';
 assert.throws(()=>makeModel(wrongAction,display,xml),/deep-equal/u);
 const wrongInk=structuredClone(display);
 wrongInk.textDefinitions.find(row=>row.textId===20).runs.find(row=>row.text==='dependent variable').colorRgb=[0,0,0];
 assert.throws(()=>makeModel(ir,wrongInk,xml),/own blue run/u);
});
