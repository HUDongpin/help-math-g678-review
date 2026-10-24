import assert from 'node:assert/strict';
import test from 'node:test';
import type {AnimationInteractiveStop, AnimationInteractiveStopResolutionIntent} from '../src/contract';
import {resolveInteractiveStopResolutionPolicy} from '../src/runtime';

const stop: AnimationInteractiveStop = {id: 'source-assessment-finished', frameDomain: 'sprite-quiz',
  stopFrame: 1, resumeFrame: 69, resolution: 'explicit-source-control-finished',
  completionDisposition: 'blocked-while-unresolved', requiresHostInteractiveStop: true,
  strictAcceptanceEffect: 'none'};
const intent: AnimationInteractiveStopResolutionIntent = {stopId: stop.id, frameDomain: stop.frameDomain,
  resolution: stop.resolution, source: 'maintained-source-derived-interaction'};
const context = {activeStopId: stop.id, resolvedStopIds: []};

test('legacy stop resolutions preserve their existing reset-by-default contract', () => {
  assert.deepEqual(resolveInteractiveStopResolutionPolicy([stop], intent, context),
    {accepted: true, stopId: stop.id, resumeFrame: 69, blocker: null});
});

test('only a validated active module declaration can retain result state on resume', () => {
  const retained = {...stop, rendererStateOnResume: 'preserve' as const};
  assert.deepEqual(resolveInteractiveStopResolutionPolicy([retained], intent, context),
    {accepted: true, stopId: stop.id, resumeFrame: 69, blocker: null, rendererStateOnResume: 'preserve'});
  for (const options of [{...context, activeStopId: 'another-stop'}, {...context, resolvedStopIds: [stop.id]}]) {
    const decision = resolveInteractiveStopResolutionPolicy([retained], intent, options);
    assert.equal(decision.accepted, false);
    assert.equal('rendererStateOnResume' in decision, false);
  }
  const spoofed = {...intent, rendererStateOnResume: 'preserve'} as AnimationInteractiveStopResolutionIntent;
  assert.equal('rendererStateOnResume' in resolveInteractiveStopResolutionPolicy([stop], spoofed, context), false);
});

test('malformed retention declarations fail closed rather than changing lifecycle', () => {
  const invalid = {...stop, rendererStateOnResume: 'restore-from-storage'} as unknown as AnimationInteractiveStop;
  assert.deepEqual(resolveInteractiveStopResolutionPolicy([invalid], intent, context),
    {accepted: false, stopId: null, resumeFrame: null, blocker: 'interactive-stop-resolution-contract-mismatch'});
});
