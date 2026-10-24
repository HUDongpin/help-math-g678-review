import assert from 'node:assert/strict';
import {p050Initial, p050Reduce, P050_ITEMS, type P050State} from '../packages/demos/src/nms-l02-p050-practice-v1';
const finish = (s: P050State) => p050Reduce(s, {type: 'finish', token: s.token});
function permutations(values: number[]): number[][] {
  return values.length ? values.flatMap((value, i) => permutations(values.filter((_, j) => j !== i)).map(rest => [value, ...rest])) : [[]];
}
let routes = 0, resets = 0;
for (const order of permutations(P050_ITEMS.map(x => x.id))) {
  let s = p050Initial();
  assert.equal(p050Reduce(s, {type: 'drop', item: 1, target: 1}), s);
  s = finish(s);
  for (const item of order) {
    const before = s;
    s = p050Reduce(s, {type: 'help', open: true});
    assert.equal(p050Reduce(s, {type: 'drop', item, target: item}), s);
    s = p050Reduce(s, {type: 'help', open: false});
    assert.deepEqual(s.solved, before.solved);
    for (const wrongTarget of [null, 99, ...P050_ITEMS.map(x => x.id).filter(x => x !== item)]) {
      s = p050Reduce(s, {type: 'drop', item, target: wrongTarget});
      assert.equal(s.phase, 'wrong-feedback');
      assert.deepEqual(s.solved, before.solved);
      assert.equal(finish(s), s);
      s = p050Reduce(s, {type: 'close-wrong'});
    }
    s = p050Reduce(s, {type: 'drop', item, target: item});
    assert.equal(s.phase, 'correct-feedback');
    assert.equal(p050Reduce(s, {type: 'drop', item, target: item}), s);
    assert.equal(p050Reduce(s, {type: 'help', open: true}), s);
    const reset = p050Reduce(s, {type: 'replay'});
    assert.deepEqual(reset.solved, []);
    assert.equal(reset.phase, 'intro');
    assert.equal(p050Reduce(reset, {type: 'finish', token: s.token}), reset);
    resets++;
    s = finish(s);
    assert.equal(s.phase, s.solved.length === 5 ? 'completion-feedback' : 'ready');
  }
  s = finish(s); assert.equal(s.phase, 'outro');
  s = finish(s); assert.equal(s.phase, 'complete');
  assert.equal(finish(s), s);
  assert.equal(s.solved.length, 5);
  routes++;
}
console.log(JSON.stringify({status: 'PASS', correctOrders: routes, replayLateCallbackCases: resets, wrongAttemptsPerRoute: 30, scope: 'Pure state transitions only; no renderer/audio/host acceptance.'}));
