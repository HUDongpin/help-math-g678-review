import assert from 'node:assert/strict';
import test from 'node:test';
import type {AnimationAuthoredTimelineControl,
  AnimationAuthoredTimelineControlIntent} from '../src/contract';
import {resolveAuthoredTimelineControlPolicy} from '../src/runtime';

const controls: readonly AnimationAuthoredTimelineControl[] = [
  {id: 'repeat-directions', frameDomain: 'sprite-116',
    sourceFrameRanges: [{first: 1, last: 6}], targetFrame: 11,
    playback: 'play', sourceLabel: 'RepeatDirection'},
  {id: 'skip-directions', frameDomain: 'sprite-116',
    sourceFrameRanges: [{first: 7, last: 604}], targetFrame: 605,
    playback: 'stop', sourceLabel: 'SelectLevel'},
];
const context = {frameDomain: 'sprite-116', frame: 1, frameCount: 606,
  paused: false, capture: false};
const intent: AnimationAuthoredTimelineControlIntent = {
  controlId: 'repeat-directions', frameDomain: 'sprite-116', input: 'mouse',
  source: 'maintained-source-authored-control',
};

test('authored buttons resolve exact declared source targets and playback', () => {
  assert.deepEqual(resolveAuthoredTimelineControlPolicy(controls, intent, context),
    {accepted: true, reason: 'authored-control-accepted', frame: 11, resume: true});
  assert.deepEqual(resolveAuthoredTimelineControlPolicy(controls,
    {...intent, controlId: 'skip-directions', input: 'keyboard'},
    {...context, frame: 604}), {accepted: true,
    reason: 'authored-control-accepted', frame: 605, resume: false});
});

test('authored buttons reject undeclared, inactive, paused or captured actions', () => {
  for (const value of [{...context, paused: true}, {...context, capture: true},
    {...context, frame: 7}, {...context, frame: 0}, {...context, frame: NaN},
    {...context, frameDomain: 'root'}, {...context, frameCount: 10}]) {
    assert.equal(resolveAuthoredTimelineControlPolicy(controls, intent, value).accepted, false);
  }
  assert.equal(resolveAuthoredTimelineControlPolicy([], intent, context).accepted, false);
  assert.equal(resolveAuthoredTimelineControlPolicy([...controls, controls[0]],
    intent, context).accepted, false);
  for (const invalid of [{...intent, controlId: 'other'}, {...intent, targetFrame: 605},
    {...intent, input: 'native-range-change'}, {...intent, source: 'legacy-script'}]) {
    assert.equal(resolveAuthoredTimelineControlPolicy(controls,
      invalid as AnimationAuthoredTimelineControlIntent, context).accepted, false);
  }
});

test('authored declarations cannot escape the active domain or frame bounds', () => {
  for (const changed of [{...controls[0], targetFrame: 0},
    {...controls[0], targetFrame: 607}, {...controls[0], sourceLabel: ''},
    {...controls[0], sourceFrameRanges: []},
    {...controls[0], sourceFrameRanges: [{first: 0, last: 6}]},
    {...controls[0], sourceFrameRanges: [{first: 1, last: 607}]}]) {
    assert.equal(resolveAuthoredTimelineControlPolicy([changed], intent, context).accepted, false);
  }
});
