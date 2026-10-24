import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {buildP053VisualScene,deriveP053VisualScene,staticSourceFrame,
 P053_NATIVE_IR,P053_OUTPUT,P053_SOURCE_RELATIVE,P053_SOURCE_ROOT,P053_XML}
 from './build-nms-l02-p053-visual-scene-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const script=path.join(root,'scripts/build-nms-l02-p053-visual-scene-v1.mjs');
const output=path.join(root,P053_OUTPUT);
const env={...process.env,HELP_MATH_G678_SOURCE_ROOT:P053_SOURCE_ROOT};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const source=fs.readFileSync(path.join(P053_SOURCE_ROOT,P053_SOURCE_RELATIVE));
const catalog=collectSwfTextSourceCatalog(source);
const native=JSON.parse(fs.readFileSync(path.join(root,P053_NATIVE_IR),'utf8'));
const xml=fs.readFileSync(P053_XML,'utf8');

test('physical source scene closes all placed visual symbols and separate clocks',()=>{
 process.env.HELP_MATH_G678_SOURCE_ROOT=P053_SOURCE_ROOT;
 const scene=buildP053VisualScene();
 assert.equal(scene.kind,'nms-l02-p053-visual-scene-source-v1');
 assert.equal(scene.source.sha256,sha(source));
 assert.equal(scene.source.fps,12);
 assert.deepEqual(scene.rootPlacement,{rootFrame:6,depth:3,characterId:187,
  instanceId:'root/depth-3/generation-1',matrix:[1,0,0,1,8248,5666],rootInterval:[6,11]});
 assert.deepEqual([scene.mainFrameDomain.declaredFrames,scene.mainFrameDomain.heldFrame,
  scene.mainFrameDomain.nextDeclaredFrame,
  scene.mainFrameDomain.nextFrameAutoReachedEstablished],[694,693,694,false]);
 assert.deepEqual(scene.summary,{rootReachableSpriteDomains:12,sourceShapeDefinitions:68,
  placedShapeDefinitions:48,placedBitmapDefinitions:0,placedTextDefinitions:37,
  buttonDefinitions:1,mainEvents:1017,mainInstances:160,mainClipDepthSpans:8});
 const ids=new Set([
  ...scene.definitions.shapes,...scene.definitions.bitmaps,...scene.definitions.texts,
  ...scene.definitions.sprites,...scene.definitions.buttons,
 ].map(item=>item.characterId));
 for(const domain of scene.domains)for(const instance of domain.instances)
  assert(ids.has(instance.characterId),`${domain.id} placed character ${instance.characterId}`);
 for(const shape of scene.definitions.shapes){
  assert.equal(sha(shape.sourceDefinitionXml),shape.xmlFragmentSha256,
   `exact vector geometry ${shape.characterId}`);
  assert(shape.geometryCounts.lines+shape.geometryCounts.curves>0);
 }
 assert(scene.boundary.childClocksNotSynchronized);
 assert(scene.boundary.clipDepthSemanticsNotRendered);
 assert(scene.boundary.actionScriptVisibilityNotExecuted);
 assert(scene.boundary.earlyStartNaturalReachabilityEstablished===false);
 assert(scene.boundary.lateStartP054HostHandoffEstablished===false);
});

test('source frames retain early/late Start generations, alpha, masks and held popup',()=>{
 const scene=deriveP053VisualScene(catalog,native,xml);
 const rootDomain=scene.domains.find(item=>item.id==='root');
 const main=scene.domains.find(item=>item.id==='sprite-187');
 assert(!staticSourceFrame(rootDomain,5).some(item=>item.characterId===187));
 assert(staticSourceFrame(rootDomain,6).some(item=>item.characterId===187&&item.depth===3));
 const early=scene.sourceMarkers.earlyStart.instanceId;
 assert.equal(staticSourceFrame(main,1).find(item=>item.instanceId===early)
  .colorTransform.multiply[3],0);
 assert.equal(staticSourceFrame(main,6).find(item=>item.instanceId===early)
  .colorTransform.multiply[3],256);
 assert(!staticSourceFrame(main,7).some(item=>item.instanceId===early));
 for(const frame of [174,221,277,436,492,535,586,615])
  assert(main.masks.some(item=>item.firstFrame===frame&&item.clipDepth>item.depth),
   `source mask begins at ${frame}`);
 assert(!staticSourceFrame(main,692).some(item=>item.instanceId===
  scene.sourceMarkers.laterStart.instanceId));
 assert(staticSourceFrame(main,693).some(item=>item.instanceId===
  scene.sourceMarkers.laterStart.instanceId));
 assert(staticSourceFrame(main,693).some(item=>item.instanceId===
  scene.sourceMarkers.popup.instanceId));
 assert(!staticSourceFrame(main,694).some(item=>item.instanceId===
  scene.sourceMarkers.popup.instanceId));
 assert(staticSourceFrame(main,694).some(item=>item.instanceId===
  scene.sourceMarkers.laterStart.instanceId));
 assert.throws(()=>staticSourceFrame(main,695),/source frame domain/);
});

test('missing source geometry or native text and source-root drift fail closed',()=>{
 const original=xml.match(/<DefineShape3\b[^>]*\bobjectID="(\d+)"[^>]*>/u);
 assert(original,'shape definition fixture');
 const used=deriveP053VisualScene(catalog,native,xml).definitions.shapes
  .find(item=>item.kind==='DefineShape3');
 const missing=xml.replace(new RegExp(`<DefineShape3\\b[^>]*\\bobjectID="${used.characterId}"[^>]*>`,'u'),
  '<DefineShape3 objectID="9999">');
 assert.throws(()=>deriveP053VisualScene(catalog,native,missing),
  new RegExp(`one XML DefineShape3 ${used.characterId}`));
 const noText=structuredClone(native);
 noText.textDefinitions=noText.textDefinitions.filter(item=>item.characterId!==178);
 assert.throws(()=>deriveP053VisualScene(catalog,noText,xml),/native source text 178/);
 const wrong=spawnSync(process.execPath,[script,'--plan'],
  {env:{...env,HELP_MATH_G678_SOURCE_ROOT:root},encoding:'utf8'});
 assert.notEqual(wrong.status,0);
 assert.match(wrong.stderr,/exact real G6-G8 source root required/);
});

test('byte-exact --check and exclusive --prepare preserve the generated audit',()=>{
 const before=fs.readFileSync(output),digest=sha(before);
 const check=spawnSync(process.execPath,[script,'--check'],{env,encoding:'utf8'});
 assert.equal(check.status,0,check.stderr);
 const receipt=JSON.parse(check.stdout);
 assert.equal(receipt.status,'PASS');
 assert.equal(receipt.output.sha256,digest);
 assert.equal(receipt.output.bytes,before.length);
 const overwrite=spawnSync(process.execPath,[script,'--prepare'],{env,encoding:'utf8'});
 assert.notEqual(overwrite.status,0,'existing source audit is immutable');
 assert.match(overwrite.stderr,/EEXIST/);
 assert.equal(sha(fs.readFileSync(output)),digest);
});
