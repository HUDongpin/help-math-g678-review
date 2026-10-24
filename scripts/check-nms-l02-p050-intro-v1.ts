import assert from 'node:assert/strict';
import {p050Intro} from '../packages/demos/src/nms-l02-p050-intro-v1';
for (let frame = 1; frame <= 208; frame++) {
  const objects = p050Intro(frame).objects;
  assert.equal(new Set(objects.map(x => x.depth)).size, objects.length);
  for (const object of objects) {
    assert.notEqual(Number(object.characterId), 55);
    assert.ok(object.alpha >= 0 && object.alpha <= 1);
    assert.equal(object.stageMatrix[4], object.matrix[4] + 8288);
    assert.equal(object.stageMatrix[5], object.matrix[5] + 5666);
  }
  const demo = objects.find(x => x.characterId === 40);
  if (frame >= 127) {assert.equal(demo?.matrix[4], 1787); assert.equal(demo?.matrix[5], -672);}
  if (frame >= 120) assert.equal(demo?.depth, 53);
}
for (const invalid of [0, 209, 1.5, NaN, Infinity]) assert.throws(() => p050Intro(invalid));
console.log(JSON.stringify({status: 'PASS', frames: 208, demoMovement: [120, 127], demoHeldThrough: 208, metadataExcluded: true, scope: 'Source direct display state; renderer and nested playback pending.'}));
