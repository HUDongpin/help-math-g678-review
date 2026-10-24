// AVM1 execution-order regressions. Each expected trace is specified independently
// of the generated source; both the interpreter and generated TS must match it.
import assert from 'node:assert/strict';
import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {Runtime} from '../runtime/display';
import {ASObject} from '../runtime/avm';
import {makeHelpers} from '../runtime/helpers';
import {decompileBlock} from '../compiler/decompile.mjs';

const esbuildPath = process.argv[2];
const reportPath = process.argv[3];
if (!esbuildPath || !reportPath) throw new Error('Usage: tsx tests/compiler-evaluation.ts <esbuild main.js> <report.json>');
const {transformSync} = await import(pathToFileURL(esbuildPath).href);
const op = (code: number, payload = Buffer.alloc(0)) => code < 0x80 ? Buffer.from([code]) : Buffer.concat([Buffer.from([code, payload.length & 255, payload.length >> 8]), payload]);
const cat = (...xs: Buffer[]) => Buffer.concat(xs);
const push = (...values: (string | number | {reg: number})[]) => op(0x96, cat(...values.map(v => {
  if (typeof v === 'string') return cat(Buffer.from([0]), Buffer.from(v), Buffer.from([0]));
  if (typeof v === 'object') return Buffer.from([4, v.reg]);
  const bytes = Buffer.alloc(5); bytes[0] = 7; bytes.writeInt32LE(v, 1); return bytes;
})));
const get = (name: string) => cat(push(name), op(0x1c));
const member = (name: string) => cat(get('object'), push(name), op(0x4e));
const call = (name: string) => cat(push(0, name), op(0x3d));
const trace = op(0x26), pop = op(0x17), end = op(0);
const store = (r: number) => op(0x87, Buffer.from([r]));
const ifSkip = (length: number) => { const b = Buffer.alloc(2); b.writeInt16LE(length); return op(0x9d, b); };
const shortCircuit = (left: number, and: boolean) => {
  const rhs = cat(pop, call('first'));
  return cat(push(left), op(0x4c), ...(and ? [op(0x12)] : []), ifSkip(rhs.length), rhs, trace, end);
};
type Case = {name: string; bytes: Buffer; log?: unknown[]; trace?: string[]};
const cases: Case[] = [
  {name: 'call arguments preserve instruction order', bytes: cat(call('first'), call('second'), push(2, 'consume'), op(0x3d), pop, end), log: ['first', 'second', ['consume', 2, 1]]},
  {name: 'method arguments preserve order and receiver', bytes: cat(call('first'), call('second'), push(2), get('object'), push('consume'), op(0x52), pop, end), log: ['first', 'second', ['method', true, 2, 1]]},
  {name: 'constructor arguments preserve order', bytes: cat(call('first'), call('second'), push(2, 'Ctor'), op(0x40), pop, end), log: ['first', 'second', ['construct', 2, 1]]},
  {name: 'member constructor arguments preserve order', bytes: cat(call('first'), call('second'), push(2), get('object'), push('Ctor'), op(0x53), pop, end), log: ['first', 'second', ['construct', 2, 1]]},
  {name: 'array element evaluation order and value order', bytes: cat(call('first'), call('second'), push(2), op(0x42), trace, end), log: ['first', 'second'], trace: ['2,1']},
  {name: 'discarded array retains element side effects', bytes: cat(call('first'), call('second'), push(2), op(0x42), pop, end), log: ['first', 'second']},
  {name: 'object initializer evaluation order', bytes: cat(push('a'), call('first'), push('b'), call('second'), push(2), op(0x43), push('a'), op(0x4e), trace, end), log: ['first', 'second'], trace: ['1']},
  {name: 'stack variable is captured before write', bytes: cat(get('x'), push('x', 2), op(0x1d), trace, end), trace: ['1']},
  {name: 'stack member is captured before write', bytes: cat(member('value'), get('object'), push('value', 2), op(0x4f), trace, end), trace: ['1']},
  {name: 'stack register is captured before write', bytes: cat(push(1), store(1), pop, push({reg: 1}), push(2), store(1), pop, trace, end), trace: ['1']},
  {name: 'variable survives mutating call', bytes: cat(get('x'), call('mutate'), op(0x47), trace, end), log: ['mutate'], trace: ['4']},
  {name: 'member survives mutating call', bytes: cat(member('value'), call('mutate'), op(0x47), trace, end), log: ['mutate'], trace: ['4']},
  {name: 'legacy And evaluates false RHS', bytes: cat(push(0), call('first'), op(0x10), trace, end), log: ['first'], trace: ['false']},
  {name: 'legacy Or evaluates true RHS', bytes: cat(push(1), call('first'), op(0x11), trace, end), log: ['first'], trace: ['true']},
  {name: 'legacy operands preserve left to right order', bytes: cat(call('first'), call('second'), op(0x10), trace, end), log: ['first', 'second'], trace: ['true']},
  {name: 'jump based And skips RHS', bytes: shortCircuit(0, true), trace: ['0']},
  {name: 'jump based Or skips RHS', bytes: shortCircuit(1, false), trace: ['1']},
  {name: 'jump based And enters RHS', bytes: shortCircuit(1, true), log: ['first'], trace: ['1']},
  {name: 'jump based Or enters RHS', bytes: shortCircuit(0, false), log: ['first'], trace: ['1']},
  {name: 'duplicate member getter executes once', bytes: cat(member('observed'), op(0x4c), trace, trace, end), log: ['getter'], trace: ['7', '7']},
  {name: 'discarded member getter still executes', bytes: cat(member('observed'), pop, end), log: ['getter']},
  {name: 'stack swap does not swap evaluation order', bytes: cat(call('first'), call('second'), op(0x4d), op(0x47), trace, end), log: ['first', 'second'], trace: ['3']},
  {name: 'duplicate mutable variable keeps original value', bytes: cat(get('x'), op(0x4c), push('x', 2), op(0x1d), trace, trace, end), trace: ['1', '1']},
  {name: 'fallback array uses ActionScript array model', bytes: cat(push(1, 2), get('count'), op(0x42), push('length'), op(0x4e), trace, end), trace: ['2']},
];
const results = [];
for (const fixture of cases) {
  const translated = decompileBlock(fixture.bytes, 0);
  const runs = [];
  for (const mode of ['bytecode', 'typescript']) {
    const data: any = {source: {swfVersion: 6}, stage: {fps: 12, width: 800, height: 600}, dictionary: {}, root: {frameCount: 1, frames: [[]], labels: {}}, exports: {}, streams: []};
    const rt = new Runtime(data, {}); rt.helpers = makeHelpers(rt); rt.loadPage();
    const log: unknown[] = [];
    const object = new ASObject(rt, rt.ObjectProto); object.set('value', 1);
    object.define('observed', undefined, {getter: rt.nat(() => { log.push('getter'); return 7; })});
    rt.page_.set('object', object); rt.page_.set('x', 1); rt.page_.set('count', 2);
    for (const [name, value] of [['first', 1], ['second', 2]] as const) rt.page_.set(name, rt.nat(() => { log.push(name); return value; }));
    rt.page_.set('consume', rt.nat((_self, args) => { log.push(['consume', ...args]); return 0; }));
    object.set('consume', rt.nat((self, args) => { log.push(['method', self === object, ...args]); return 0; }));
    rt.page_.set('mutate', rt.nat(() => { log.push('mutate'); rt.page_.set('x', 9); object.set('value', 9); return 3; }));
    const ctor = rt.nat(() => undefined, args => { log.push(['construct', ...args]); return new ASObject(rt, rt.ObjectProto); });
    rt.page_.set('Ctor', ctor); object.set('Ctor', ctor);
    let thrown: string | null = null;
    try {
      if (mode === 'bytecode') rt.exec(fixture.bytes, rt.timelineCtx(rt.page_), 6);
      else {
        const raw = `const { ${[...translated.helpers].join(',')} } = h; ${translated.code}`;
        const js = transformSync(raw, {loader: 'ts'}).code;
        new Function('$', '$$', 'h', js)(rt.helpers.scope(rt.timelineCtx(rt.page_)), rt.helpers.wrap(rt.page_), rt.helpers);
      }
    } catch (error) { thrown = String(error); }
    runs.push({mode, log, trace: rt.hostLog.filter(row => row[1] === 'trace').map(row => row[2]), errors: rt.errors, thrown});
  }
  const expected = {log: fixture.log ?? [], trace: fixture.trace ?? [], errors: [], thrown: null};
  let passed = true, error = '';
  try { for (const {mode, ...actual} of runs) assert.deepEqual(actual, expected, mode); }
  catch (failure) { passed = false; error = String(failure); }
  results.push({name: fixture.name, passed, bytecodeHex: fixture.bytes.toString('hex'), expected, runs, generated: translated.code, fallbackBodies: translated.fallbacks, error});
  console.log(`${passed ? 'PASS' : 'FAIL'} ${fixture.name}`);
}
const report = {schema: 'hfr-compiler-evaluation/1', generatedAt: new Date().toISOString(), summary: {cases: results.length, passed: results.filter(x => x.passed).length}, results};
mkdirSync(dirname(reportPath), {recursive: true}); writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
if (report.summary.passed !== report.summary.cases) process.exitCode = 1;
