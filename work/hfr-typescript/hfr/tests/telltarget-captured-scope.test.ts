// Independent expected traces for both executors; matching shared failures cannot pass.
import assert from 'node:assert/strict';
import test from 'node:test';
import {transformSync} from 'esbuild';
import {ASFunction} from '../runtime/avm';
import {Runtime} from '../runtime/display';
import {makeHelpers} from '../runtime/helpers';
import {decompileBlock} from '../compiler/decompile.mjs';

// Same byte assembly and generated-code execution pattern as compiler-evaluation.ts.
const op = (code: number, payload = Buffer.alloc(0)) => code < 0x80 ? Buffer.from([code]) : Buffer.concat([Buffer.from([code, payload.length & 255, payload.length >> 8]), payload]);
const cat = (...bytes: Buffer[]) => Buffer.concat(bytes);
const push = (...values: (string | number)[]) => op(0x96, cat(...values.map(value => {
  if (typeof value === 'string') return cat(Buffer.from([0]), Buffer.from(value), Buffer.from([0]));
  const bytes = Buffer.alloc(5); bytes[0] = 7; bytes.writeInt32LE(value, 1); return bytes;
})));
const get = (name: string) => cat(push(name), op(0x1c));

for (const targetOpcode of ['SetTarget', 'SetTarget2'] as const) {
  const target = (name: string) => targetOpcode === 'SetTarget'
    ? op(0x8b, cat(Buffer.from(name), Buffer.from([0])))
    : cat(push(name), op(0x20));
  for (const lowering of ['structured', 'fallback'] as const) {
    const bytes = cat(
      target('_root'), push('counter', 0), op(0x1d),
      // Four explicit steps keep a broken read from hanging the test in a loop.
      ...Array.from({length: 4}, () => cat(
        get('counter'), op(0x26), push('counter'), get('counter'), op(0x50), op(0x1d),
      )),
      target(''), push('resetMarker', 7), op(0x1d),
      // A dynamic array count selects the existing explicit-stack compiler lane.
      ...(lowering === 'fallback' ? [get('count'), op(0x42), op(0x17)] : []),
      op(0),
    );
    for (const mode of ['bytecode', 'typescript'] as const) {
      test(`${targetOpcode} ${lowering} ${mode} reads the counter outside captured scope`, () => {
        const data: any = {source: {swfVersion: 6}, stage: {fps: 12, width: 800, height: 600}, dictionary: {}, root: {frameCount: 1, frames: [[]], labels: {}}, exports: {}, streams: []};
        const rt = new Runtime(data, {}); rt.helpers = makeHelpers(rt); rt.loadPage();
        rt.page_.set('count', 0);
        const fn = new ASFunction(rt, {
          name: 'counterFixture', params: [], scope: [rt.Global, rt.page_], target: rt.page_,
        });
        const {ctx, act} = rt.prepareCall(fn, rt.page_, [], null);
        assert.deepEqual(ctx.scope, [rt.Global, rt.page_, act]);
        assert.equal(ctx.scope.includes(rt.shell), false);
        const translated = decompileBlock(bytes, 0);
        assert.equal(translated.fallbacks > 0, lowering === 'fallback');
        if (mode === 'bytecode') rt.exec(bytes, ctx, 6);
        else {
          const raw = `const {${[...translated.helpers].join(',')}} = h; ${translated.code}`;
          const js = transformSync(raw, {loader: 'ts'}).code;
          new Function('$', '$$', 'h', js)(rt.helpers.scope(ctx), rt.helpers.wrap(act), rt.helpers);
        }
        assert.deepEqual(rt.errors, []);
        assert.deepEqual(rt.hostLog.filter(row => row[1] === 'trace').map(row => row[2]), ['0', '1', '2', '3']);
        assert.equal(rt.shell.get('counter'), 4);
        assert.equal(rt.page_.hasOwn('counter'), false);
        assert.equal(act.hasOwn('counter'), false);
        assert.equal(rt.page_.get('resetMarker'), 7);
        assert.equal(rt.shell.hasOwn('resetMarker'), false);
      });
    }
  }
}
