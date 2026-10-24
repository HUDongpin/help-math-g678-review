import assert from 'node:assert/strict';
import test from 'node:test';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import type {AnimationModule, AnimationRendererProps, RendererPlaybackReport} from '../../../packages/demos/src/contract';
import {consumeRendererReport, EMPTY_RENDERER_COMPLETION, playbackStateFromReport, rendererClockedBlocker, rendererClockPaused} from '../components/renderer-clocked-policy';
import {RendererClockedRuntime} from '../components/renderer-clocked-runtime';

const report: RendererPlaybackReport = {frame: 1, frameCount: 10, frameDomain: 'sprite-209', fps: 12, settled: false, complete: false, lessonFinished: false, narration: 'idle'};
let renderedProps: AnimationRendererProps | undefined;
const module: AnimationModule = {key: 'shared-nms002-l07-p027', clock: 'renderer', maturity: 'private-current-js',
  movie: {stage: {width: 800, height: 600}, fps: 12, frameCount: 10, durationMs: 833},
  runtime: {stage: {width: 800, height: 600}, fps: 12, frameCount: 6, durationMs: 500, frameDomains: [{id: 'sprite-209', frameCount: 10, fps: 12}]},
  scenarios: [{id: 'hfr', label: 'HFR candidate'}], audioCues: [],
  Renderer: (props) => {renderedProps = props; return createElement('canvas', {'data-renderer-fixture': 'true'});},
  getFrameState: () => {throw new Error('renderer-clocked host must not use getFrameState');},
};

test('unknown environment, hidden tabs and reduced motion hold the clock', () => {
  assert.equal(rendererClockPaused(false, undefined, undefined), true);
  assert.equal(rendererClockPaused(false, false, undefined), true);
  assert.equal(rendererClockPaused(false, false, false), false);
  assert.equal(rendererClockPaused(false, true, false), true);
  assert.equal(rendererClockPaused(false, false, true), true);
  assert.equal(rendererClockPaused(true, false, false), true);
});

test('settled or last-frame reports do not imply source completion', () => {
  for (const value of [report, {...report, settled: true}, {...report, frame: 10}]) {
    const result = consumeRendererReport(value, true, false, EMPTY_RENDERER_COMPLETION, module)!;
    assert.equal(result.emitComplete, false);
    assert.equal(result.emitLessonFinished, false);
  }
});

test('completion is once per run and Replay resets the complete and lesson-finished ledger', () => {
  const value = {...report, complete: true, lessonFinished: true};
  const first = consumeRendererReport(value, true, false, EMPTY_RENDERER_COMPLETION, module)!;
  assert.equal(first.emitComplete, true);
  assert.equal(first.emitLessonFinished, true);
  const repeated = consumeRendererReport(value, true, false, first.ledger, module)!;
  assert.equal(repeated.emitComplete, false);
  assert.equal(repeated.emitLessonFinished, false);
  const replay = consumeRendererReport(value, true, false, EMPTY_RENDERER_COMPLETION, module)!;
  assert.equal(replay.emitComplete, true);
  assert.equal(replay.emitLessonFinished, true);
});

test('pause does not consume a future source-completion signal', () => {
  const held = consumeRendererReport({...report, complete: true}, true, true, EMPTY_RENDERER_COMPLETION, module)!;
  assert.equal(held.emitComplete, false);
  assert.deepEqual(held.ledger, EMPTY_RENDERER_COMPLETION);
  assert.equal(consumeRendererReport({...report, complete: true}, true, false, held.ledger, module)!.emitComplete, true);
});

test('invalid frame reports fail closed and audio gating is reflected to shell', () => {
  for (const value of [{...report, frame: NaN}, {...report, frame: 0}, {...report, frame: 11},
    {...report, frameCount: Infinity}, {...report, fps: 0}, {...report, frameDomain: ''}]) {
    assert.equal(playbackStateFromReport(value, true, module), null);
    assert.equal(consumeRendererReport({...value, complete: true}, true, false, EMPTY_RENDERER_COMPLETION, module), null);
  }
  const muted = playbackStateFromReport({...report, narration: 'playing'}, false, module)!;
  assert.equal(muted.audioAvailable, false);
  assert.equal(muted.narration, 'unavailable');
  assert.equal(muted.seekAvailable, false);
  assert.equal(muted.transportMode, 'none');
});

test('renderer clock refuses unsupported deterministic capture and host timeline contracts', () => {
  assert.equal(rendererClockedBlocker(module, {}, undefined), null);
  for (const query of [{capture: '1'}, {frame: '1'}, {entryStateSha256: 'a'.repeat(64)},
    {requirementId: 'sample'}, {trace: 'default'}, {duplicateCaptureIdentity: true}]) {
    assert.equal(rendererClockedBlocker(module, query, undefined), 'deterministic-capture-not-supported');
  }
  assert.equal(rendererClockedBlocker(module, {frameDomain: 'sprite-209'}, undefined), null);
  assert.equal(rendererClockedBlocker(module, {frameDomain: 'sprite-999'}, undefined), 'requested-domain-not-supported');
  assert.equal(rendererClockedBlocker({...module, interactiveStops: [{} as never]}, {}, undefined), 'host-timeline-contract-not-supported');
  assert.equal(rendererClockedBlocker({...module, interactiveSeek: {} as never}, {}, undefined), 'host-timeline-contract-not-supported');
  assert.equal(rendererClockedBlocker({...module, authoredTimelineControls: [{} as never]}, {}, undefined), 'host-timeline-contract-not-supported');
  assert.equal(rendererClockedBlocker({...module, textPresentation: {} as never}, {}, undefined), 'typography-clock-contract-not-supported');
  assert.equal(rendererClockedBlocker(module, {}, {}), 'loaded-swf-composition-not-supported');
});

test('first render holds playback and forwards distinct UI, visual and audio language', () => {
  const html = renderToStaticMarkup(createElement(RendererClockedRuntime, {
    animationId: module.key, animationModule: module, query: {lang: 'en', scenario: 'hfr', seed: '42'},
    labels: {unavailable: 'Unavailable', replay: 'Replay', reduced: 'Reduced'}, audioLanguage: 'es', uiLanguage: 'en',
    volume: 0.4, presentation: 'legacy-shell', pageInteractionCompanionTargetId: 'companion', pageInteractionStageTargetId: 'stage',
  }));
  assert.ok(html.includes('data-runtime-clock="renderer"'));
  assert.ok(html.includes('data-runtime-input-held="true"'));
  assert.equal(renderedProps!.paused, true);
  assert.equal(renderedProps!.audioEnabled, false);
  assert.equal(renderedProps!.lang, 'en');
  assert.equal(renderedProps!.audioLanguage, 'es');
  assert.equal(renderedProps!.uiLanguage, 'en');
  assert.equal(renderedProps!.volume, 0.4);
  assert.equal(renderedProps!.seed, 42);
  assert.equal(renderedProps!.pageInteractionCompanionTargetId, 'companion');
  assert.equal(renderedProps!.pageInteractionStageTargetId, 'stage');
});

test('capture rejection does not mount renderer or borrow a capture identity', () => {
  renderedProps = undefined;
  const html = renderToStaticMarkup(createElement(RendererClockedRuntime, {
    animationId: module.key, animationModule: module, query: {capture: '1'},
    labels: {unavailable: 'Unavailable', replay: 'Replay', reduced: 'Reduced'},
  }));
  assert.ok(html.includes('deterministic-capture-not-supported'));
  assert.equal(renderedProps, undefined);
});

test('reports must match the declared root or child domain count and FPS exactly', () => {
  assert.ok(playbackStateFromReport(report, true, module));
  assert.ok(playbackStateFromReport({...report, frameDomain: 'root', frameCount: 6}, true, module));
  for (const invalid of [{...report, frameDomain: 'stream:209'}, {...report, frameCount: 6},
    {...report, fps: 24}, {...report, frameDomain: 'root'}, {...report, frameDomain: 'sprite-999'}]) {
    assert.equal(playbackStateFromReport(invalid, true, module), null);
  }
});

test('prepared native presentation mounts its actual renderer and retains independent language channels', async () => {
  const {prepareG678LessonTypography} = await import('../lib/g678-lesson-typography-presentation');
  let prepared = 0;
  const binding = {schemaVersion: 1 as const, version: 'native-fixture', placementId: module.key, animationId: module.key,
    sourceSwfSha256: 'a'.repeat(64), template: 'explanation' as const,
    blocks: [{id: 'body', sourceTextIds: ['character-1'], role: 'body' as const, language: 'en' as const, readingOrder: 0, valueSource: 'source-static' as const}]};
  const native = {...module, Renderer: () => {throw new Error('Legacy renderer must not mount for an opted-in native presentation');},
    textPresentation: {schemaVersion: 1 as const, binding,
      prepare: async () => {prepared++;},
      Renderer: (props: AnimationRendererProps) => {renderedProps = props; return createElement('p', {'data-actual-native-renderer': 'true'}, 'Native fixture words');},
      getSnapshot: () => {throw new Error('The renderer owns the live snapshot, not a host frame=1 call');}}};
  const ready = await prepareG678LessonTypography(native, false);
  assert.equal(prepared, 1);
  assert.equal(rendererClockedBlocker(ready!, {lang: 'es'}, undefined), null);
  const html = renderToStaticMarkup(createElement(RendererClockedRuntime, {
    animationId: module.key, animationModule: ready!, query: {lang: 'es'},
    audioLanguage: 'es', uiLanguage: 'es', labels: {unavailable: 'Unavailable', replay: 'Replay', reduced: 'Reduced'},
  }));
  assert.ok(html.includes('data-actual-native-renderer="true"'));
  assert.ok(html.includes('Native fixture words'));
  assert.ok(html.includes('data-spanish-translation="missing"'));
  assert.equal(renderedProps!.lang, 'en');
  assert.equal(renderedProps!.audioLanguage, 'es');
  assert.equal(renderedProps!.uiLanguage, 'es');
  await assert.rejects(() => prepareG678LessonTypography({...native,
    textPresentation: {...native.textPresentation, binding: {...binding, animationId: 'wrong-source'}}}, false), /not source-bound/u);
  assert.equal(prepared, 1, 'mismatched binding must fail before assets prepare or renderer mount');
});
