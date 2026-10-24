import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const sourceRoot = '/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const relativeSource = 'G6-G8-shared/NMS002/L2/GS/L2GS02.swf';
const sourceSha256 = 'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf';
const catalogSha256 = '4b92f48d2416025e423aefb70ecd5873212fe697da3af6e2322a527f1733eb9e';
const hash = value => createHash('sha256').update(value).digest('hex');

assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT, sourceRoot,
  'P053 requires the exact real G6-G8 source root');
const rootStat = fs.lstatSync(sourceRoot);
assert.ok(rootStat.isDirectory() && !rootStat.isSymbolicLink());
assert.equal(fs.realpathSync(sourceRoot), sourceRoot);
const sourcePath = path.join(sourceRoot, relativeSource);
const before = fs.lstatSync(sourcePath, {bigint: true});
assert.ok(before.isFile() && !before.isSymbolicLink());
const source = fs.readFileSync(sourcePath);
const after = fs.lstatSync(sourcePath, {bigint: true});
for (const key of ['dev', 'ino', 'size', 'mtimeNs', 'mode']) {
  assert.equal(before[key], after[key], `P053 source changed during read: ${key}`);
}
assert.equal(hash(source), sourceSha256);
const catalog = collectSwfTextSourceCatalog(source);
assert.equal(hash(JSON.stringify(catalog)), catalogSha256);
assert.equal(catalog.summary.textDefinitions, 39);
assert.equal(catalog.summary.unparsedTags, 0);

const timelines = new Map(catalog.timelines.map(timeline => [timeline.timelineId, timeline]));
const texts = new Map(catalog.textDefinitions.map(definition => [definition.characterId, definition]));
function exactText(id, expected) {
  const definition = texts.get(id);
  assert.ok(definition, `P053 text ${id} missing`);
  assert.equal(definition.runs.map(run => run.text).join(''), expected);
}
function placements(timelineId, characterId) {
  const timeline = timelines.get(timelineId);
  assert.ok(timeline, `P053 timeline ${timelineId} missing`);
  return timeline.instances.filter(instance => instance.characterId === characterId);
}
function onePlacement(timelineId, characterId, firstFrame) {
  const matches = placements(timelineId, characterId);
  assert.equal(matches.length, 1, `${timelineId}: ${characterId} placement count`);
  assert.equal(matches[0].firstFrame, firstFrame);
  return matches[0];
}

// Static placement closure is deliberately weaker than executed AVM1 reachability.
const reachable = new Set(['root']);
const queue = ['root'];
while (queue.length) {
  const timelineId = queue.shift();
  for (const instance of timelines.get(timelineId).instances) {
    const child = `sprite-${instance.characterId}`;
    if (timelines.has(child) && !reachable.has(child)) {
      reachable.add(child);
      queue.push(child);
    }
  }
}
onePlacement('root', 187, 6);
assert.ok(reachable.has('sprite-104'));
assert.ok(!reachable.has('sprite-17'));
assert.equal(catalog.timelines.flatMap(timeline =>
  timeline.instances.filter(instance => instance.characterId === 17)).length, 0);
assert.equal(catalog.buttonDefinitions.flatMap(button =>
  button.statePlacements.filter(placement => placement.characterId === 17)).length, 0);

exactText(15, 'When you are ready to play, choose a level and then click Start to beginthe Inequalities Match Game. ');
onePlacement('sprite-17', 15, 1);
exactText(103, 'When you are ready to play, choose a level and then click Start to begin the Fractions, Decimals, and Percents Match Game. ');
onePlacement('sprite-104', 103, 1);
onePlacement('sprite-187', 104, 693);
exactText(102, 'For each correct match you get 10 points added to your score.  For each incorrect match 2 points are subtracted from your score. ');
onePlacement('sprite-104', 102, 1);
for (const [id, frame] of [[142, 174], [143, 221], [145, 277], [171, 436],
  [173, 492], [174, 535], [178, 586], [180, 615]]) {
  onePlacement('sprite-187', id, frame);
}
exactText(178, 'Fractions, Decimals, and Percents Match Game. ');

console.log(JSON.stringify({status: 'PASS', animationId: 'shared-nms002-l02-p053',
  sourceSha256, catalogSha256, staticReachableSprites: reachable.size,
  staleInequalitiesTextId: 15, staleTextSpritePlaced: false,
  popupSpriteFirstPlacedAt: 693, popupTitleTextId: 103,
  mainGameTitleTextId: 178, runtimeVisibilityEstablished: false}));
