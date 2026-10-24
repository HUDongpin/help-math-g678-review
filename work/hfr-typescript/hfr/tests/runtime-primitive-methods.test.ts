import assert from 'node:assert/strict';
import test from 'node:test';
import {Runtime} from '../runtime/display';
import {ASArray, ASObject} from '../runtime/avm';
import {makeHelpers} from '../runtime/helpers';
import {decompileBlock} from '../compiler/decompile.mjs';
import {transformSync} from '/Volumes/WestWorld/HELP MATH 2.0/node_modules/esbuild/lib/main.js';

const op = (code: number, payload = Buffer.alloc(0)) => code < 0x80 ? Buffer.from([code]) : Buffer.concat([Buffer.from([code, payload.length & 255, payload.length >> 8]), payload]);
const cat = (...xs: Buffer[]) => Buffer.concat(xs);
const push = (...values: (string | number | undefined | null)[]) => op(0x96, cat(...values.map(v => {
  if (v === undefined) return Buffer.from([3]);
  if (v === null) return Buffer.from([2]);
  if (typeof v === 'string') return cat(Buffer.from([0]), Buffer.from(v), Buffer.from([0]));
  const bytes = Buffer.alloc(5); bytes[0] = 7; bytes.writeInt32LE(v, 1); return bytes;
})));
const get = (name: string) => cat(push(name), op(0x1c));
const method = (receiver: string, name: string | undefined | null | {dynamic: string}, args: (string | number | undefined)[] = []) => cat(
  push('result', ...args.slice().reverse(), args.length), get(receiver),
  typeof name === 'object' && name !== null ? get(name.dynamic) : push(name),
  op(0x52), op(0x1d), op(0),
);
function run(bytes: Buffer, compiled: boolean, configure?: (rt: Runtime) => void, version = 6) {
  const data: any = {source: {swfVersion: version}, stage: {fps: 12, width: 800, height: 600}, dictionary: {}, root: {frameCount: 1, frames: [[]], labels: {}}, exports: {}, streams: []};
  const rt = new Runtime(data, {}); rt.helpers = makeHelpers(rt); rt.loadPage(); configure?.(rt);
  if (compiled) {
    const translated = decompileBlock(bytes, 0);
    const js = transformSync(`const {${[...translated.helpers].join(',')}} = h; ${translated.code}`, {loader: 'ts'}).code;
    new Function('$', '$$', 'h', js)(rt.helpers.scope(rt.timelineCtx(rt.page_)), rt.helpers.wrap(rt.page_), rt.helpers);
  } else rt.exec(bytes, rt.timelineCtx(rt.page_), version);
  assert.deepEqual(rt.errors, []);
  return rt;
}
for (const [label, name] of [['normal split', 'split'], ['AVM1 case-insensitive split', 'SPLIT'], ['dynamic split', {dynamic: 'methodName'}]] as const) {
  test(`${label} returns a real ActionScript array with working prototype`, () => {
    for (const compiled of [false, true]) {
      const rt = run(method('source', name, ['~']), compiled, rt => { rt.page_.set('source', 'one~two'); rt.page_.set('methodName', 'split'); });
      const result = rt.page_.get('result');
      assert.ok(result instanceof ASArray, `${compiled ? 'TypeScript' : 'bytecode'} must retain the ASArray type`);
      assert.equal(result.proto, rt.ArrayProto);
      assert.deepEqual(result.a, ['one', 'two']);
      assert.equal(rt.getMember(result, 'length'), 2);
      assert.equal(rt.callMethod(result, 'push', ['three'], null), 3);
      assert.deepEqual(result.a, ['one', 'two', 'three']);
      const sliced = rt.callMethod(result, 'slice', [1], null);
      assert.ok(sliced instanceof ASArray); assert.deepEqual(sliced.a, ['two', 'three']);
    }
  });
}
test('undefined split separator keeps AVM array result', () => {
  for (const compiled of [false, true]) {
    const rt = run(method('source', 'split', [undefined]), compiled, rt => rt.page_.set('source', 'one~two'));
    const result = rt.page_.get('result'); assert.ok(result instanceof ASArray); assert.deepEqual(result.a, ['one~two']);
  }
});
test('named method retains the receiver and argument order', () => {
  for (const compiled of [false, true]) {
    const rt = run(method('receiver', 'inspect', ['first', 'second']), compiled, rt => {
      const receiver = new ASObject(rt, rt.ObjectProto);
      receiver.set('inspect', rt.nat((self, args) => { assert.equal(self, receiver); assert.deepEqual(args, ['first', 'second']); return 'ok'; }));
      rt.page_.set('receiver', receiver);
    });
    assert.equal(rt.page_.get('result'), 'ok');
  }
});
for (const name of [undefined, null, '']) {
  test(`unnamed CallMethod (${String(name)}) calls function with undefined receiver`, () => {
    for (const compiled of [false, true]) {
      const rt = run(method('callable', name, [7]), compiled, rt => {
        rt.page_.set('callable', rt.nat((self, args) => { assert.equal(self, undefined); assert.deepEqual(args, [7]); return 9; }));
      });
      assert.equal(rt.page_.get('result'), 9);
    }
  });
}
test('dynamic empty method name retains unnamed call semantics', () => {
  for (const compiled of [false, true]) {
    const rt = run(method('callable', {dynamic: 'methodName'}, [7]), compiled, rt => {
      rt.page_.set('methodName', '');
      rt.page_.set('callable', rt.nat((self, args) => { assert.equal(self, undefined); assert.deepEqual(args, [7]); return 9; }));
    });
    assert.equal(rt.page_.get('result'), 9);
  }
});
test('undefined receiver returns undefined', () => {
  for (const compiled of [false, true]) assert.equal(run(method('absent', 'split', ['~']), compiled).page_.get('result'), undefined);
});
test('number primitive uses ActionScript Number prototype', () => {
  for (const compiled of [false, true]) assert.equal(run(method('source', 'TOSTRING', [16]), compiled, rt => rt.page_.set('source', 255)).page_.get('result'), 'ff');
});
test('SWF7 keeps case-sensitive method lookup', () => {
  for (const compiled of [false, true]) assert.equal(run(method('source', 'SPLIT', ['~']), compiled, rt => rt.page_.set('source', 'one~two'), 7).page_.get('result'), undefined);
});
test('missing variable and method calls retain diagnostic evidence', () => {
  for (const compiled of [false, true]) {
    const missingFunction = run(cat(push(0, 'missingFunction'), op(0x3d), op(0x17), op(0)), compiled);
    assert.equal(missingFunction.missing.content.get('missingFunction'), 1);
    const missingMethod = run(method('receiver', 'missingMethod'), compiled, rt => rt.page_.set('receiver', new ASObject(rt, rt.ObjectProto)));
    assert.equal(missingMethod.missing.content.get('missingMethod'), 1);
    const absentReceiver = run(method('absent', 'absentReceiverMethod'), compiled);
    assert.equal(absentReceiver.missing.content.get('absentReceiverMethod'), 1);
  }
});
