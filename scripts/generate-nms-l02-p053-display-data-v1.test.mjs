import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import test from 'node:test';
import {buildP053DisplayData,projectP053Scene,renderP053DisplayData,SCENE,OUTPUT}
 from './generate-nms-l02-p053-display-data-v1.mjs';
import {staticSourceFrame} from './build-nms-l02-p053-visual-scene-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;
const original=JSON.parse(fs.readFileSync(path.join(root,SCENE.path)));
const native=JSON.parse(fs.readFileSync(path.join(root,'migrations/shared-nms002-l02-p053/audit/native-display-product-v1.json')));
const scriptReads=new Map(native.extraction.scriptPins.map(pin=>[pin.path,
 fs.readFileSync(path.join(native.extraction.scriptsRoot,pin.path))]));
test('compact data preserves every source-domain display state including structural694',()=>{
 const data=buildP053DisplayData();assert.equal(data.domains.length,13);
 for(const domain of original.domains){
  const compact=data.domains.find(d=>d.id===domain.id);
  for(let i=0;i<domain.events.length;i++){
   assert.equal(compact.events[i].move,domain.events[i].move,'source move flag retained');
   assert.deepEqual(compact.events[i].clipActions,domain.events[i].clipActions,'source clip actions retained');
  }
  for(let frame=1;frame<=domain.declaredFrameCount;frame++)
   assert.deepEqual(staticSourceFrame(compact,frame),staticSourceFrame(domain,frame),`${domain.id}/${frame}`);
 }
 assert.deepEqual(data.definitions.texts,original.definitions.texts);
 assert(data.definitions.texts.find(t=>t.characterId===111).sourceText===null);
 assert(!data.definitions.shapes.some(s=>'sourceDefinitionXml' in s));
});
test('reviewed stop clocks bind eight exact scripts and preserve independent outcomes',()=>{
 const d=buildP053DisplayData();
 assert.equal(d.reviewedFrameActions.scriptPins.length,8);
 assert.deepEqual(d.reviewedFrameActions.stoppedChildFrames,
  {'sprite-119':1,'sprite-126':1,'sprite-130':1,'sprite-136':1,'sprite-186':1});
 assert.deepEqual(d.reviewedFrameActions.mainHeld,{frame:693,hideInstance:'Mc_Popup'});
 assert.equal(d.boundary.frame694NaturalPlaybackEstablished,false);
 assert.equal(d.boundary.dynamicText111Unresolved,true);
 assert.equal(d.boundary.popupCloseReceiverUnresolved,true);
 const altered=new Map(scriptReads);
 altered.set('DefineSprite_187/frame_693/DoAction.as',Buffer.from('play();'));
 assert.throws(()=>projectP053Scene(original,native,altered),/AssertionError/u);
 const unknown=structuredClone(original);
 unknown.domains.find(d=>d.id==='sprite-104').declaredFrameCount=2;
 assert.throws(()=>projectP053Scene(unknown,native,scriptReads),/child clock needs review/u);
});
test('generator is deterministic, exact-root-only and refuses to overwrite prepared data',()=>{
 const data=buildP053DisplayData(),bytes=renderP053DisplayData(data);
 assert(bytes.equals(renderP053DisplayData(buildP053DisplayData())));
 const env={...process.env,HELP_MATH_G678_SOURCE_ROOT:sourceRoot};
 const script='scripts/generate-nms-l02-p053-display-data-v1.mjs';
 const wrong=spawnSync(process.execPath,[script,'--plan'],{cwd:root,env:{...env,HELP_MATH_G678_SOURCE_ROOT:root},encoding:'utf8'});
 assert.notEqual(wrong.status,0);assert.match(wrong.stderr,/exact physical source root/u);
 const file=path.join(root,OUTPUT);
 if(fs.existsSync(file)){
  assert(fs.readFileSync(file).equals(bytes));
  const overwrite=spawnSync(process.execPath,[script,'--prepare'],{cwd:root,env,encoding:'utf8'});
  assert.notEqual(overwrite.status,0);assert.match(overwrite.stderr,/EEXIST/u);
  assert(fs.readFileSync(file).equals(bytes));
 }
});
