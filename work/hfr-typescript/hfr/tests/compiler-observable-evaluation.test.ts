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
const defineFunction = (name: string, body: Buffer) => {
  const size = Buffer.alloc(2); size.writeUInt16LE(body.length);
  return cat(op(0x9b, cat(Buffer.from(name), Buffer.from([0, 0, 0]), size)), body);
};
const ifSkip = (length: number) => { const b = Buffer.alloc(2); b.writeInt16LE(length); return op(0x9d, b); };
const shortCircuit = (left: number, and: boolean) => {
  const rhs = cat(pop, call('first'));
  return cat(push(left), op(0x4c), ...(and ? [op(0x12)] : []), ifSkip(rhs.length), rhs, trace, end);
};
type Case = {name: string; bytes: Buffer; log?: unknown[]; trace?: string[]};
const assemble = (...items: any[]) => {
  const offsets = new Map(); let offset = 0;
  for (const item of items) { if (typeof item === 'string') offsets.set(item, offset); else offset += Buffer.isBuffer(item) ? item.length : 5; }
  offset = 0;
  return cat(...items.flatMap(item => {
    if (typeof item === 'string') return [];
    const bytes = Buffer.isBuffer(item) ? item : (() => {const b=Buffer.alloc(2); b.writeInt16LE(offsets.get(item[1]) - offset - 5); return op(item[0], b);})();
    offset += bytes.length; return [bytes];
  }));
};
const cases: Case[] = [
  {name: 'stripped register-save fallback starts at retained bytecode offset', bytes: cat(defineFunction('savedRegisters', cat(push({reg:1},{reg:2}), push(1,2), get('count'), op(0x42), trace, store(2), pop, store(1), pop, end)), call('savedRegisters'), pop, end), trace: ['2,1']},
  {name: 'while evaluates condition getter on every iteration', bytes: assemble('top', get('loopCounter'), push(3), op(0x48), op(0x12), [0x9d, 'exit'], push('body'), trace, [0x99, 'top'], 'exit', end), log: ['loop:0','loop:1','loop:2','loop:3'], trace: ['body','body','body']},
  {name: 'do while evaluates condition getter after every body', bytes: assemble('top', push('body'), trace, get('loopCounter'), push(2), op(0x48), [0x9d, 'top'], end), log: ['loop:0','loop:1','loop:2'], trace: ['body','body','body']},
  {name: 'ternary only evaluates selected branch getter', bytes: assemble(get('condition'), [0x9d, 'yes'], get('keyObserved'), [0x99, 'after'], 'yes', get('coercer'), op(0x4a), 'after', trace, end), log: ['condition','valueOf'], trace:['4']},
  {name: 'literal ternary preserves condition getter once', bytes: assemble(get('condition'), [0x9d, 'yes'], push(10), [0x99, 'after'], 'yes', push(20), 'after', trace, end), log: ['condition'], trace:['20']},
  {name: 'WaitForFrame2 preserves consumed getter', bytes: cat(get('keyObserved'), op(0x8d, Buffer.from([0])), end), log: ['keyGetter']},
  {name: 'unterminated block preserves discarded coercion', bytes: cat(get('coercer'), store(1), pop, push({reg:1}), op(0x4a)), log: ['valueOf']},
  {name: 'variable name uses string-hint conversion', bytes: cat(get('coercer'), op(0x1c), trace, end), log: ['toString'], trace: ['7']},
  {name: 'member name uses string-hint conversion', bytes: cat(get('object'), get('coercer'), op(0x4e), trace, end), log: ['toString'], trace: ['8']},

  {name: 'null receiver still evaluates dynamic member key getter', bytes: cat(get('nil'), get('keyObserved'), op(0x4e), pop, end), log: ['keyGetter']},
  {name: 'undefined receiver still evaluates dynamic member key getter', bytes: cat(get('missing'), get('keyObserved'), op(0x4e), pop, end), log: ['keyGetter']},
  {name: 'discarded register ToNumber invokes valueOf', bytes: cat(get('coercer'), store(1), pop, push({reg: 1}), op(0x4a), pop, end), log: ['valueOf']},
  {name: 'discarded register Increment invokes valueOf', bytes: cat(get('coercer'), store(1), pop, push({reg: 1}), op(0x50), pop, end), log: ['valueOf']},
  {name: 'discarded register ToString invokes toString', bytes: cat(get('coercer'), store(1), pop, push({reg: 1}), op(0x4b), pop, end), log: ['toString']},
  {name: 'discarded register StringLength invokes toString', bytes: cat(get('coercer'), store(1), pop, push({reg: 1}), op(0x14), pop, end), log: ['toString']},
  {name: 'discarded register Add2 invokes valueOf', bytes: cat(get('coercer'), store(1), pop, push({reg: 1}, 1), op(0x47), pop, end), log: ['valueOf']},

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
    rt.page_.set('nil', null);
    let iteration = 0;
    rt.page_.define('loopCounter', undefined, {getter: rt.nat(() => { log.push(`loop:${iteration}`); return iteration++; })});
    rt.page_.define('condition', undefined, {getter: rt.nat(() => { log.push('condition'); return true; })});
    rt.page_.set('four', 7);

    rt.page_.define('keyObserved', undefined, {getter: rt.nat(() => {log.push('keyGetter'); return 'value';})});
    const coercer = new ASObject(rt, rt.ObjectProto);
    coercer.set('valueOf', rt.nat(() => {log.push('valueOf'); return 4;}));
    coercer.set('toString', rt.nat(() => {log.push('toString'); return 'four';}));
    rt.page_.set('coercer', coercer);

    const object = new ASObject(rt, rt.ObjectProto); object.set('value', 1); object.set('four', 8);
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
