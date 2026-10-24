import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {extractP058DisplayList} from './build-nms-l02-p058-display-list-v1.mjs';
import {P058_DISPLAY_EVENTS,P058_DISPLAY_SOURCE,P058_NESTED_BUTTONS} from
 '../packages/demos/src/generated/nms-l02-p058-display-list-v1.ts';
import {p058SourceSpriteFrame} from
 '../packages/demos/src/timelines/shared-nms002-l02-p058-display-list.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const xmlFile=path.join(root,'output/nms-l02-p058-source-20260927/extraction/swfmill.xml');
const generated=path.join(root,'packages/demos/src/generated/nms-l02-p058-display-list-v1.ts');
const receiptPath=path.join(root,'output/nms-l02-p058-source-20260927/display-list-generation-v1.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const layer=(frame,characterId)=>p058SourceSpriteFrame(frame).find(x=>x.characterId===characterId);

test('P058 generated display-list binds the exact sprite-37 source and visual operation inventory',()=>{
 assert.equal(P058_DISPLAY_SOURCE.sourceSwfSha256,
  'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57');
 assert.equal(P058_DISPLAY_SOURCE.sourceXmlSha256,
  '02f23df6e985f9855e8b9df7e392ee25a8c36f4239861509bc8908221b17ba90');
 assert.equal(P058_DISPLAY_SOURCE.sourceAuditSha256,
  'de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a');
 assert.equal(P058_DISPLAY_SOURCE.frameDomain,'sprite-37');
 assert.equal(P058_DISPLAY_SOURCE.frameCount,274);
 assert.deepEqual(P058_DISPLAY_SOURCE.stage,{width:800,height:600});
 assert.deepEqual(P058_DISPLAY_SOURCE.rootPlacement,
  {frame:6,depth:2,characterId:37,scaleX:1.000045776367188,scaleY:1,transX:7477,transY:5666});
 assert.equal(P058_DISPLAY_SOURCE.nestedSpriteCount,0);
 assert.equal(P058_DISPLAY_EVENTS.length,175);
 for(const [kind,count] of [['place',39],['update',129],['remove',7]])
  assert.equal(P058_DISPLAY_EVENTS.filter(event=>event.kind===kind).length,count);
 assert(P058_DISPLAY_EVENTS.every(event=>/^[a-f0-9]{64}$/u.test(event.sourceTagSha256)));
 assert.deepEqual(Object.keys(P058_NESTED_BUTTONS).map(Number),[22,27,28,29,30,33,36]);
 for(const value of Object.values(P058_NESTED_BUTTONS)){
  assert.equal(value.hitCharacterId,21);
  assert.match(value.sourceDefinitionSha256,/^[a-f0-9]{64}$/u);
  assert.match(value.hitDefinitionSha256,/^[a-f0-9]{64}$/u);
  assert(Object.values(value.hitTransform).every(Number.isFinite));
  assert.equal(value.hitAlpha256,256);
 }
});

test('all 274 frame snapshots are deterministic depth-ordered pinned character state',()=>{
 for(let frame=1;frame<=274;frame++){
  const layers=p058SourceSpriteFrame(frame);
  assert.deepEqual(layers,p058SourceSpriteFrame(frame));
  const depths=layers.map(x=>x.depth);
  assert.deepEqual(depths,[...depths].sort((a,b)=>a-b));
  assert.equal(new Set(depths).size,depths.length);
  for(const x of layers){
   assert(x.characterId>0&&x.alpha256>=0&&x.alpha256<=256);
   assert.match(x.sourceDefinitionSha256,/^[a-f0-9]{64}$/u);
   assert.match(x.placementTagSha256,/^[a-f0-9]{64}$/u);
   assert.match(x.stateTagSha256,/^[a-f0-9]{64}$/u);
   assert(Object.values(x.transform).every(Number.isFinite));
   if(x.sourceKind==='DefineButton2'){
    assert.equal(x.nestedHitCharacterId,21);
    assert.match(x.nestedHitDefinitionSha256,/^[a-f0-9]{64}$/u);
    assert(Object.values(x.nestedHitTransform).every(Number.isFinite));
    assert.equal(x.nestedHitAlpha256,256);
   }
  }
 }
 for(const invalid of [0,275,1.5,Number.NaN])
  assert.throws(()=>p058SourceSpriteFrame(invalid),RangeError);
});

test('source movement and alpha reveal phases retain distinct first and full frames',()=>{
 for(const id of [15,16,17]){
  assert.equal(layer(11,id),undefined);
  assert.equal(layer(12,id)?.alpha256,0);
  assert.equal(layer(21,id)?.alpha256,230);
  assert.equal(layer(22,id)?.alpha256,256);
  assert.notEqual(layer(12,id)?.transform.transY,layer(22,id)?.transform.transY);
 }
 for(const id of [18,19,20,22]){
  assert.equal(layer(102,id),undefined);
  assert.equal(layer(103,id)?.alpha256,0);
  assert.equal(layer(109,id)?.alpha256,219);
  assert.equal(layer(110,id)?.alpha256,256);
  assert.notEqual(layer(103,id)?.transform.transY,layer(110,id)?.transform.transY);
 }
 for(const id of [27,28,29,30]){
  assert.equal(layer(138,id),undefined);
  assert.equal(layer(139,id)?.alpha256,0);
  assert.equal(layer(145,id)?.alpha256,219);
  assert.equal(layer(146,id)?.alpha256,256);
  assert.deepEqual(layer(139,id)?.transform,layer(146,id)?.transform,
   'the four strategy buttons change alpha without a source matrix update');
 }
 for(const id of [31,32,33]){
  assert.equal(layer(236,id),undefined);
  assert.equal(layer(237,id)?.alpha256,0);
  assert.equal(layer(241,id)?.alpha256,205);
  assert.equal(layer(242,id)?.alpha256,256);
  assert.notEqual(layer(237,id)?.transform.transY,layer(242,id)?.transform.transY);
 }
});

test('second Show control lasts one frame while source emphasis flashes three times',()=>{
 assert.equal(layer(241,36),undefined);
 assert.deepEqual({depth:layer(242,36)?.depth,alpha:layer(242,36)?.alpha256},
  {depth:45,alpha:256});
 assert.equal(layer(243,36),undefined);
 assert.equal(layer(274,36),undefined);
 assert.equal(layer(242,33)?.alpha256,256);
 assert.equal(layer(243,33)?.alpha256,256,'persistent Show is a separate control');
 for(const frame of [242,244,246]){
  assert.equal(layer(frame,34)?.depth,43);
  assert.equal(layer(frame,35)?.depth,44);
 }
 for(const frame of [241,243,245,247,274]){
  assert.equal(layer(frame,34),undefined);
  assert.equal(layer(frame,35),undefined);
 }
 assert.deepEqual(p058SourceSpriteFrame(247),p058SourceSpriteFrame(274),
  'no source display-list change after final flash removal');
});

test('unknown visual operations, transform effects, and absent-depth updates fail closed',()=>{
 const xml=fs.readFileSync(xmlFile,'utf8');
 assert.equal(sha(Buffer.from(xml)),P058_DISPLAY_SOURCE.sourceXmlSha256);
 const marker='<DefineSprite objectID="37" frames="274">';
 const [prefix,body]=xml.split(marker);
 assert(body,'sprite body');
 const mutateBody=(before,after)=>{
  assert(body.includes(before),`source mutation target: ${before}`);
  return prefix+marker+body.replace(before,after);
 };
 assert.throws(()=>extractP058DisplayList(mutateBody(
  '<Transform transX="547" transY="3043"/>',
  '<Transform skewX="1" transX="547" transY="3043"/>')),
  /unsupported matrix/u);
 assert.throws(()=>extractP058DisplayList(mutateBody(
  '</PlaceObject2>','<clipActions/></PlaceObject2>')),
  /unsupported placement child/u);
 assert.throws(()=>extractP058DisplayList(mutateBody(
  '<PlaceObject2 replace="0" depth="3" objectID="2">',
  '<PlaceObject2 replace="1" depth="3" objectID="2">')),
  /replacement character|update absent depth/u);
 assert.throws(()=>extractP058DisplayList(xml.replace(marker,marker+'<PlaceObject3/>')),
  /unsupported visual operation/u);
 assert.throws(()=>extractP058DisplayList(xml.replace(marker,marker+'<DefineSprite objectID="999" frames="1">')),
  /no nested sprite timelines/u);
});

test('real source regeneration matches generated bytes and the generation receipt',t=>{
 if(process.env.HELP_MATH_G678_SOURCE_ROOT!==sourceRoot){t.skip('exact real source root required');return;}
 const before=sha(fs.readFileSync(generated));
 const run=spawnSync(process.execPath,['scripts/build-nms-l02-p058-display-list-v1.mjs','--check'],
  {cwd:root,env:process.env,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const result=JSON.parse(run.stdout.trim());
 assert.equal(result.sha256,before);
 assert.equal(sha(fs.readFileSync(generated)),before);
 const receipt=JSON.parse(fs.readFileSync(receiptPath,'utf8'));
 assert.equal(receipt.generated.sha256,before);
 assert.equal(receipt.sprite.events,175);
 assert.deepEqual(receipt.transientSecondShow,
  {characterId:36,depth:45,placedFrame:242,removedFrame:243});
});
