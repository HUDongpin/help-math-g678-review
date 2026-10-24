import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import test from 'node:test';
import {extractP057DisplayList} from './build-nms-l02-p057-display-list-v1.mjs';
import {P057_DISPLAY_EVENTS,P057_DISPLAY_SOURCE,P057_NESTED_BUTTONS} from
 '../packages/demos/src/generated/nms-l02-p057-display-list-v1.ts';
import {p057SourceSpriteFrame} from
 '../packages/demos/src/timelines/shared-nms002-l02-p057-display-list.ts';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const xmlFile=path.join(root,'output/nms-l02-p057-source-20260927/extraction/swfmill.xml');
const generated=path.join(root,'packages/demos/src/generated/nms-l02-p057-display-list-v1.ts');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('P057 generated display-list is exact source-static sprite-66 data',()=>{
 assert.equal(P057_DISPLAY_SOURCE.sourceSwfSha256,
  '9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa');
 assert.equal(P057_DISPLAY_SOURCE.sourceXmlSha256,
  '1f80986d0a4d0005162b74c3dcdba12003f8b62515e26440a8520bdc986a9d80');
 assert.equal(P057_DISPLAY_SOURCE.frameDomain,'sprite-66');
 assert.equal(P057_DISPLAY_SOURCE.frameCount,328);
 assert.deepEqual(P057_DISPLAY_SOURCE.rootPlacement,
  {frame:6,depth:2,characterId:66,transX:7430,transY:5667});
 assert.equal(P057_DISPLAY_SOURCE.nestedSpriteCount,0);
 assert.equal(P057_DISPLAY_EVENTS.length,745);
 for(const [kind,count] of [['place',117],['update',622],['remove',6]])
  assert.equal(P057_DISPLAY_EVENTS.filter(event=>event.kind===kind).length,count);
 assert(P057_DISPLAY_EVENTS.every(event=>/^[a-f0-9]{64}$/u.test(event.sourceTagSha256)));
 assert.deepEqual(Object.keys(P057_NESTED_BUTTONS).map(Number),[17,18,25,60,61,62,63]);
 for(const value of Object.values(P057_NESTED_BUTTONS)){
  assert.equal(value.hitCharacterId,16);
  assert.match(value.sourceDefinitionSha256,/^[a-f0-9]{64}$/u);
  assert.match(value.hitDefinitionSha256,/^[a-f0-9]{64}$/u);
  assert(Object.values(value.hitTransform).every(Number.isFinite));
  assert.equal(value.hitAlpha256,256);
 }
});

test('every source frame resolves ordered, pinned character state',()=>{
 for(let frame=1;frame<=328;frame++){
  const layers=p057SourceSpriteFrame(frame);
  assert.deepEqual(layers,p057SourceSpriteFrame(frame),'deterministic frame');
  const depths=layers.map(layer=>layer.depth);
  assert.deepEqual(depths,[...depths].sort((a,b)=>a-b));
  assert.equal(new Set(depths).size,depths.length);
  for(const layer of layers){
   assert(layer.characterId>0&&layer.alpha256>=0&&layer.alpha256<=256);
   assert.match(layer.sourceDefinitionSha256,/^[a-f0-9]{64}$/u);
   assert.match(layer.placementTagSha256,/^[a-f0-9]{64}$/u);
   assert.match(layer.stateTagSha256,/^[a-f0-9]{64}$/u);
   assert(Object.values(layer.transform).every(Number.isFinite));
   if(layer.sourceKind==='DefineButton2'){
    assert.equal(layer.nestedHitCharacterId,16);
    assert.match(layer.nestedHitDefinitionSha256,/^[a-f0-9]{64}$/u);
    assert(Object.values(layer.nestedHitTransform).every(Number.isFinite));
    assert.equal(layer.nestedHitAlpha256,256);
   }
  }
 }
 for(const invalid of [0,329,1.5,Number.NaN])
  assert.throws(()=>p057SourceSpriteFrame(invalid),RangeError);
});

test('button reveals and word-building stage retain the exact visual boundaries',()=>{
 const alpha=(frame,id)=>p057SourceSpriteFrame(frame).find(layer=>layer.characterId===id)?.alpha256;
 for(const id of [17,18]){
  assert.equal(alpha(4,id),undefined);assert.equal(alpha(5,id),0);
  assert.equal(alpha(11,id),219);assert.equal(alpha(12,id),256);
 }
 assert.equal(alpha(66,25),undefined);assert.equal(alpha(67,25),0);
 assert.equal(alpha(76,25),230);assert.equal(alpha(77,25),256);
 for(const id of [60,61,62,63]){
  assert.equal(alpha(96,id),undefined);assert.equal(alpha(97,id),0);
  assert.equal(alpha(102,id),213);assert.equal(alpha(103,id),256);
 }
 const newAt97=P057_DISPLAY_EVENTS.filter(event=>event.frame===97&&event.kind==='place');
 assert.equal(newAt97.length,87);
 assert.equal(newAt97.filter(event=>event.sourceKind==='DefineText').length,80);
 assert.equal(newAt97.filter(event=>event.sourceKind==='DefineButton2').length,4);
 assert.equal(P057_DISPLAY_EVENTS.filter(event=>event.frame===103&&event.kind==='update').length,87);
});

test('unsupported transform, child operation, nested sprite and absent-depth update fail closed',()=>{
 const xml=fs.readFileSync(xmlFile,'utf8');
 assert.equal(sha(Buffer.from(xml)),P057_DISPLAY_SOURCE.sourceXmlSha256);
 const marker='<DefineSprite objectID="66" frames="328">';
 const [prefix,body]=xml.split(marker);
 assert(body,'sprite body');
 assert.throws(()=>extractP057DisplayList(prefix+marker+body.replace(
  '<Transform transX="0" transY="0"/>',
  '<Transform skewX="1" transX="0" transY="0"/>')),/unsupported matrix/u);
 assert.throws(()=>extractP057DisplayList(prefix+marker+body.replace(
  '</PlaceObject2>','<clipActions/></PlaceObject2>')),
  /unsupported placement child/u);
 assert.throws(()=>extractP057DisplayList(xml.replace(marker,marker+'<DefineSprite objectID="999" frames="1">')),
  /no nested sprite timelines/u);
 assert.throws(()=>extractP057DisplayList(prefix+marker+body.replace(
  '<PlaceObject2 replace="0" depth="2" objectID="2">',
  '<PlaceObject2 replace="1" depth="2" objectID="2">')),
  /replacement character|update absent depth/u);
});

test('real source and swfmill regenerate the exact generated bytes',t=>{
 if(process.env.HELP_MATH_G678_SOURCE_ROOT!==sourceRoot){t.skip('exact real source root required');return;}
 const before=sha(fs.readFileSync(generated));
 const run=spawnSync(process.execPath,['scripts/build-nms-l02-p057-display-list-v1.mjs','--check'],
  {cwd:root,env:process.env,encoding:'utf8'});
 assert.equal(run.status,0,run.stderr);
 const result=JSON.parse(run.stdout.trim());
 assert.equal(result.sha256,before);
 assert.equal(sha(fs.readFileSync(generated)),before);
});
