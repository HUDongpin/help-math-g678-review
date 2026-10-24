import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {prepareP055ProductInputs} from './prepare-nms-l02-p055-product-inputs.mjs';
import {nmsP055TextBinding,nmsP055TextSnapshot} from '../packages/demos/src/nms-l02-p055-native-text.ts';
import {nmsL02P055Module} from '../packages/demos/src/nms-l02-p055-module.tsx';
import {NMS_L02_P055_TIMELINE} from '../packages/demos/src/timelines/shared-nms002-l02-p055.ts';
import {validateLessonTextBinding} from '../packages/demos/src/lesson-text-snapshot.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const context=frame=>({frame,frameDomain:'sprite-26',rootFrame:6,scenario:'source-static-frame',lang:'en',seed:0,replay:0});

test('generated P055 text is exactly the pinned source IR',async()=>{
 const receipt=await prepareP055ProductInputs({check:true});
 assert.equal(receipt.generatedText.sha256,receipt.textIr.sha256);
 const source=await readFile(path.join(root,receipt.textIr.path));
 const generated=await readFile(path.join(root,receipt.generatedText.path));
 assert.ok(source.equals(generated));
});

test('binding retains every generation-specific placement and source run',()=>{
 validateLessonTextBinding(nmsP055TextBinding);
 assert.equal(nmsP055TextBinding.blocks.length,18);
 assert.equal(new Set(nmsP055TextBinding.blocks.map(x=>x.instance?.id)).size,18);
 assert.deepEqual(nmsP055TextBinding.blocks.filter(x=>x.id.includes('/depth-15/')).map(x=>x.instance?.path.at(-1)?.generation),[1,2,3,4,5,6]);
 assert.ok(nmsP055TextBinding.blocks.every(x=>x.sourceTextIds.length>0&&x.sourceTextIds.every(id=>/^character-\d+\/run-\d+$/.test(id))));
});

test('text projection follows source visibility, alpha and instance lifetimes',()=>{
 for(const frame of [1,84,114,115,116,123,145,158,216,351]){
  const snapshot=nmsP055TextSnapshot(context(frame));
  assert.equal(snapshot.status,'ready');
  assert.equal(snapshot.sourceSuppressionInstanceIds.length,snapshot.rows.length);
  assert.equal(snapshot.suppressedInstances.length,snapshot.rows.length);
  assert.ok(snapshot.rows.every(row=>row.alpha>=0&&row.alpha<=1));
  assert.deepEqual(snapshot,nmsP055TextSnapshot(context(frame)));
 }
 assert.equal(nmsP055TextSnapshot(context(1)).rows.some(x=>x.characterId===9),false);
 assert.equal(nmsP055TextSnapshot(context(84)).rows.some(x=>x.characterId===9),true);
 assert.equal(nmsP055TextSnapshot(context(114)).rows.some(x=>x.instanceId.endsWith('/generation-1')&&x.characterId===17),true);
 assert.equal(nmsP055TextSnapshot(context(115)).rows.some(x=>x.characterId===17),false);
 assert.equal(nmsP055TextSnapshot(context(216)).rows.some(x=>x.characterId===24),true);
 assert.match(nmsP055TextSnapshot(context(145)).rows.find(x=>x.characterId===20)?.text??'',/\n/);
 const blocked=nmsP055TextSnapshot({...context(84),rootFrame:5});
 assert.equal(blocked.status,'blocked');assert.equal(blocked.sourceSuppressionInstanceIds.length,0);
});

test('native module declares the real asset, root and terminal timeline semantics',()=>{
 assert.equal(NMS_L02_P055_TIMELINE.assetSource,
  '/migration-assets/nms-l02-ts-pilot/typography.js?sha256=47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d');
 assert.equal(nmsL02P055Module.key,'shared-nms002-l02-p055');
 assert.deepEqual(nmsL02P055Module.movie.stage,{width:800,height:600});
 assert.equal(nmsL02P055Module.movie.frameCount,351);
 assert.equal(nmsL02P055Module.runtime.frameCount,10);
 assert.deepEqual(nmsL02P055Module.runtime.frameDomains,[{id:'sprite-26',frameCount:351,fps:12,rootFrame:6}]);
 assert.equal(nmsL02P055Module.playbackEndFrameByDomain['root'],1);
 assert.equal(nmsL02P055Module.playbackEndFrameByDomain['sprite-26'],351);
 assert.equal(nmsL02P055Module.reducedMotionFrame,351);
 const first=nmsL02P055Module.getFrameState(1,context(1));
 const terminal=nmsL02P055Module.getFrameState(351,context(351));
 assert.deepEqual([first.status,first.frame,first.exportFrame,first.rootFrame],['ready',1,0,6]);
 assert.deepEqual([terminal.status,terminal.frame,terminal.exportFrame,terminal.rootFrame],['ready',351,350,6]);
 assert.equal(nmsL02P055Module.getFrameState(352,context(352)).frame,351);
 assert.equal(nmsL02P055Module.textPresentation.getSnapshot(terminal,context(351)).status,'ready');
});

test('native module blocks root, invalid domain, scenario, locale and unsupported source context',()=>{
 const rootState=nmsL02P055Module.getFrameState(10,{...context(10),frameDomain:'root',rootFrame:10,scenario:'root-unavailable'});
 assert.deepEqual([rootState.status,rootState.blocker,rootState.frame,rootState.exportFrame,rootState.rootFrame],
  ['blocked','root-baseline-unavailable',10,null,10]);
 const invalidDomain=nmsL02P055Module.getFrameState(100,{...context(100),frameDomain:'sprite-99'});
 assert.deepEqual([invalidDomain.status,invalidDomain.blocker,invalidDomain.frameDomain],
  ['blocked','unsupported-runtime-request','sprite-26']);
 assert.equal(nmsL02P055Module.getFrameState(84,{...context(84),scenario:'unknown'}).blocker,'unsupported-runtime-request');
 assert.equal(nmsL02P055Module.getFrameState(84,{...context(84),scenario:'root-unavailable'}).blocker,'frame-domain-scenario-mismatch');
 assert.equal(nmsL02P055Module.getFrameState(84,{...context(84),lang:'es'}).blocker,'spanish-visual-and-audio-unvalidated');
 assert.equal(nmsL02P055Module.getFrameState(84,{...context(84),rootFrame:5}).blocker,'unsupported-runtime-request');
 assert.equal(nmsL02P055Module.getFrameState(84,{...context(84),seed:1}).blocker,'unsupported-runtime-request');
 assert.equal(nmsL02P055Module.textPresentation.getSnapshot(rootState,{...context(10),frameDomain:'root',rootFrame:10,scenario:'root-unavailable'}).status,'blocked');
});
