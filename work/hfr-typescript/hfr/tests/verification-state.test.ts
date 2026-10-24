import assert from "node:assert/strict";
import test from "node:test";
import { ASArray, ASFunction, ASObject } from "../runtime/avm";
import { MovieClip, Runtime } from "../runtime/display";
import { snapshotState, createStateTrace, runtimeDiagnostics } from "../tools/verification-state";

function runtime() {
  const rt = new Runtime({ source: { swfVersion: 6 }, stage: { fps: 12 }, dictionary: {}, root: { frameCount: 1, frames: [[]], labels: {} }, exports: {}, streams: [] } as any);
  rt.loadPage(); return rt;
}

test("deep globals, arrays and page properties affect the observation", () => {
  const a = runtime(), b = runtime();
  for (const rt of [a, b]) {
    const nested = new ASObject(rt).define("scores", new ASArray(rt, [1, 2]));
    rt.Global.define("nested", nested); rt.page_.define("hiddenScore", 7, { dontEnum: true });
  }
  assert.equal(snapshotState(a), snapshotState(b));
  b.Global.get("nested").get("scores").a[1] = 3;
  assert.notEqual(snapshotState(a), snapshotState(b));
  b.Global.get("nested").get("scores").a[1] = 2;
  b.page_.set("hiddenScore", 8);
  assert.notEqual(snapshotState(a), snapshotState(b));
});

test("cycles and function captures/aliases are deterministic without comparing code", () => {
  const a = runtime(), b = runtime();
  for (const rt of [a, b]) {
    const obj = new ASObject(rt).define("value", 2); obj.define("self", obj);
    const fn = new ASFunction(rt, { name: "f", params: [{ name: "x", reg: 0 }], scope: [obj], target: rt.page_ });
    if (rt === a) fn.body = new Uint8Array([0]); else fn.compiled = () => undefined;
    rt.page_.define("f", fn).define("alias", fn).define("cycle", obj);
  }
  assert.equal(snapshotState(a), snapshotState(b));
  assert.equal(snapshotState(a), snapshotState(a));
  b.page_.get("cycle").set("value", 3);
  assert.notEqual(snapshotState(a), snapshotState(b));
  b.page_.get("cycle").set("value", 2);
  b.page_.set("alias", new ASFunction(b, { name: "f", params: [{ name: "x", reg: 0 }], scope: [b.page_.get("cycle")], target: b.page_ }));
  assert.notEqual(snapshotState(a), snapshotState(b));
});

test("tellTarget variable reads the current target when the captured scope does not contain it", () => {
  const rt = runtime();
  const other = new MovieClip(rt, rt.MovieClipProto, { kind: "sprite", frameCount: 1, frames: [[]] }, rt.page_, 5, "other", -1);
  const ctx = { scope: [rt.Global, rt.page_], target: other, origTarget: rt.page_, thisObj: undefined, regs: [], pool: null, fn: null };
  rt.page_.set("kept", 3);
  other.set("kept", 9);
  assert.equal(rt.getVariable(ctx, "kept"), 3);
  assert.equal(rt.getVariable(ctx, "missing"), undefined);
  rt.setVariable(ctx, "i", 0);
  assert.equal(rt.getVariable(ctx, "i"), 0);
  rt.setVariable(ctx, "i", 10);
  assert.equal(rt.getVariable(ctx, "i"), 10);
  assert.equal(rt.page_.get("i"), undefined);
});

test("snapshots do not execute ActionScript accessors", () => {
  const rt = runtime(); let calls = 0;
  const getter = new ASFunction(rt, { name: "read", params: [], native: () => { calls++; return 1; } });
  rt.Global.define("secret", undefined, { getter });
  snapshotState(rt); snapshotState(rt); assert.equal(calls, 0);
});

test("sparse arrays and special numeric values are distinct", () => {
  const a = runtime(), b = runtime();
  a.page_.define("array", new ASArray(a, new Array(1)));
  b.page_.define("array", new ASArray(b, [undefined]));
  assert.notEqual(snapshotState(a), snapshotState(b));
  for (const [left, right] of [[NaN, null], [-0, 0], [Infinity, -Infinity]]) {
    a.page_.set("array", left); b.page_.set("array", right);
    assert.notEqual(snapshotState(a), snapshotState(b));
  }
});

test("subpixel transforms and playing state are observed", () => {
  const a = runtime(), b = runtime(); b.page_.m.tx += 0.01;
  assert.notEqual(snapshotState(a), snapshotState(b));
  b.page_.m.tx = a.page_.m.tx; b.page_.playing = !a.page_.playing;
  assert.notEqual(snapshotState(a), snapshotState(b));
});

test("trajectory rejects a transient divergence even when final state converges", () => {
  const a = runtime(), b = runtime(), ta = createStateTrace(), tb = createStateTrace();
  ta.record(a, "load"); tb.record(b, "load");
  a.page_.define("score", 1); b.page_.define("score", 2);
  ta.record(a, "tick"); tb.record(b, "tick");
  a.page_.set("score", 0); b.page_.set("score", 0);
  assert.equal(ta.record(a, "tick"), tb.record(b, "tick"));
  assert.notEqual(ta.digest(), tb.digest());
  assert.notEqual(ta.steps[1].stateSha256, tb.steps[1].stateSha256);
});

test("unsupported raw JavaScript functions fail closed", () => {
  const rt = runtime(); rt.page_.define("raw", () => 1);
  assert.throws(() => snapshotState(rt), /unsupported raw function/);
});

test("matching missing calls and notes remain unclean diagnostics", () => {
  const a = runtime(), b = runtime();
  assert.equal(runtimeDiagnostics(a).clean, true);
  for (const rt of [a, b]) {
    rt.missing.shell.set("unknownShellCall", 1);
    rt.missing.builtin.set("unknownBuiltin", 2);
    rt.missing.content.set("unknownContent", 3);
    rt.note("missingCharacter", "999");
  }
  assert.equal(snapshotState(a), snapshotState(b));
  assert.equal(runtimeDiagnostics(a).clean, false);
  b.missing.content.set("unknownContent", 4);
  assert.notEqual(snapshotState(a), snapshotState(b));
});
