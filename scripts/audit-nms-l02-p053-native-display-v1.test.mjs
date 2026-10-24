import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';

import {buildP053NativeDisplay,deriveP053NativeDisplay,validateP053XmlCounts} from './audit-nms-l02-p053-native-display-v1.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

test('physical P053 source yields bounded reachable native text and controller associations',()=>{
  const {ir,json,markdown}=buildP053NativeDisplay();
  assert.equal(JSON.parse(json).source.sha256,ir.source.sha256);
  assert.equal(ir.source.rootMainPlacement.rootFrame,6);
  assert.equal(ir.source.mainFrames,694);
  assert.deepEqual(ir.summary.unplacedDefinitionIds,[14,15]);
  assert.equal(ir.summary.reachableTextDefinitions,37);
  assert.equal(ir.extraction.scriptPins.length,59);
  assert.equal(ir.textDefinitions.some(t=>t.characterId===15),false);
  assert.deepEqual(ir.excludedUnplacedTextDefinitions.map(t=>t.characterId),[14,15]);
  assert.equal(ir.textDefinitions.find(t=>t.characterId===103).visibilityClass,'static-placement-reachable-runtime-visibility-unestablished');
  assert.equal(ir.textDefinitions.find(t=>t.characterId===111).runtimeValueResolved,false);
  const main=ir.domains.find(d=>d.id==='sprite-187');
  const early=main.placements.find(p=>p.characterId===136&&p.firstFrame===1);
  const late=main.placements.find(p=>p.characterId===136&&p.firstFrame===693);
  assert.deepEqual([early.depth,early.lastFrameExclusive],[24,7]);
  assert.match(early.endSourceTagSha256,/^[a-f0-9]{64}$/);
  assert.deepEqual(early.stateEvents.map(e=>e.colorTransform?.multiply[3]),[0,51,102,154,205,256]);
  assert.deepEqual([late.depth,late.lastFrameExclusive],[43,695]);
  const popup=main.placements.find(p=>p.characterId===104&&p.firstFrame===693);
  assert.deepEqual([popup.depth,popup.lastFrameExclusive],[47,694]);
  assert(main.frameLabels.some(x=>x.label==='RepeatDirection'&&x.frame===3));
  assert(main.frameLabels.some(x=>x.label==='SelectLevel'&&x.frame===693));
  const popupDomain=ir.domains.find(d=>d.id==='sprite-104');
  assert(popupDomain.placements.some(p=>p.characterId===103));
  assert(ir.buttonStates.find(b=>b.characterId===101).placements.some(p=>p.characterId===7));
  assert.equal(ir.boundary.scriptAlphaVisibilityNavigationInterpreted,false);
  assert.match(markdown,/this\._visible = false/);
});

test('XML domain mismatch fails closed',()=>{
  assert.throws(()=>validateP053XmlCounts({rootFrames:10,sprites:76,mainFrames:693,staticText:38,dynamicText:1,popupFrames:1,rootMainPlacement:1}),/structural agreement/);
});

test('script inventory and static placement drift fail closed',()=>{
  const {ir}=buildP053NativeDisplay();
  const source=fs.readFileSync('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS02.swf');
  const catalog=collectSwfTextSourceCatalog(source);
  const scripts=structuredClone(ir.extraction.scriptPins);
  scripts[0].sha256='0'.repeat(64);
  assert.throws(()=>deriveP053NativeDisplay(catalog,scripts,ir.extraction.movieXml.counts),/script inventory drift/);
  scripts[0].sha256=ir.extraction.scriptPins[0].sha256;
  catalog.timelines.find(t=>t.timelineId==='sprite-187').instances.find(i=>i.characterId===178).firstFrame=585;
  assert.throws(()=>deriveP053NativeDisplay(catalog,scripts,ir.extraction.movieXml.counts),/Expected values to be strictly equal/);
});
