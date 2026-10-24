import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildP014BehaviorAudit, operate, validateP014BehaviorAudit,
} from '../audit-alg-l06-p014-behavior-v1.mjs';

test('P014 source audit reproduces exact pinned source and conditional host mapping', () => {
  const audit = buildP014BehaviorAudit();
  assert.equal(validateP014BehaviorAudit(audit), true);
  assert.equal(audit.oldHost.exactP014LaunchObserved, false);
  assert.deepEqual(audit.oldHost.apis.showRightFeed.targets,
    ['sprite-115', 'sprite-156', 'sprite-83', 'sprite-148']);
  assert.deepEqual(audit.oldHost.apis.showWrongFeed.targets,
    ['sprite-173', 'sprite-187', 'sprite-28']);
  assert.equal(operate('--check').status, 'source-audit-checked');
});

test('P014 behavior validation rejects false original-runtime and source claims', () => {
  const audit = buildP014BehaviorAudit();
  assert.throws(() => validateP014BehaviorAudit({
    ...audit, oldHost: {...audit.oldHost, exactP014LaunchObserved: true},
  }), assert.AssertionError);
  assert.throws(() => validateP014BehaviorAudit({
    ...audit, mainQuizHold: {...audit.mainQuizHold, frame: 119},
  }), assert.AssertionError);
});
