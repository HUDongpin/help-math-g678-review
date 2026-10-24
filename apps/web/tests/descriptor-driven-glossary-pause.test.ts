import assert from 'node:assert/strict';
import test from 'node:test';

import {
  resetDescriptorGlossaryPause,
  transitionDescriptorGlossaryPause,
} from '../lib/descriptor-driven-glossary-pause';

interface SeekRequest {
  readonly frame: number;
  readonly requestId: number;
}

test('a running animation pauses for glossary and resumes after close', () => {
  const opened = transitionDescriptorGlossaryPause<SeekRequest>({
    allowed: true,
    pageSessionId: 'page-1',
    paused: false,
    requestType: 'open-glossary',
    seekRequest: null,
    session: null,
  });
  assert.equal(opened.paused, true);
  assert.equal(opened.seekRequest, null);
  assert.deepEqual(opened.session, {
    pageSessionId: 'page-1',
    pausedBeforeOpen: false,
    seekRequestBeforeOpen: null,
  });

  const closed = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-1',
    paused: opened.paused,
    requestType: 'close-glossary',
    seekRequest: opened.seekRequest,
    session: opened.session,
  });
  assert.deepEqual(closed, {paused: false, seekRequest: null, session: null});
});

test('an inspected animation stays paused and preserves exact seek identity', () => {
  const inspected = Object.freeze({frame: 697, requestId: 11});
  const opened = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-3',
    paused: true,
    requestType: 'open-glossary',
    seekRequest: inspected,
    session: null,
  });
  const closed = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-3',
    paused: true,
    requestType: 'close-glossary',
    seekRequest: inspected,
    session: opened.session,
  });

  assert.equal(closed.paused, true);
  assert.strictEqual(closed.seekRequest, inspected);
  assert.equal(closed.session, null);
});

test('nested glossary opens retain the original pre-open playback snapshot', () => {
  const first = transitionDescriptorGlossaryPause<SeekRequest>({
    allowed: true,
    pageSessionId: 'page-2',
    paused: false,
    requestType: 'open-glossary',
    seekRequest: null,
    session: null,
  });
  const nested = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-2',
    paused: true,
    requestType: 'open-glossary',
    seekRequest: null,
    session: first.session,
  });

  assert.strictEqual(nested.session, first.session);
  const closed = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-2',
    paused: true,
    requestType: 'close-glossary',
    seekRequest: null,
    session: nested.session,
  });
  assert.equal(closed.paused, false);
});

test('blocked requests cannot create, replace, close, or resume a session', () => {
  const seekRequest = Object.freeze({frame: 130, requestId: 8});
  const session = Object.freeze({
    pageSessionId: 'page-1',
    pausedBeforeOpen: true,
    seekRequestBeforeOpen: seekRequest,
  });
  for (const requestType of ['open-glossary', 'close-glossary'] as const) {
    const result = transitionDescriptorGlossaryPause({
      allowed: false,
      pageSessionId: 'page-1',
      paused: true,
      requestType,
      seekRequest,
      session,
    });
    assert.equal(result.paused, true);
    assert.strictEqual(result.seekRequest, seekRequest);
    assert.strictEqual(result.session, session);
  }
});

test('a stale cross-page close cannot resume and reset clears all state', () => {
  const seekRequest = Object.freeze({frame: 994, requestId: 12});
  const staleSession = Object.freeze({
    pageSessionId: 'page-3',
    pausedBeforeOpen: false,
    seekRequestBeforeOpen: null,
  });
  const mismatchedClose = transitionDescriptorGlossaryPause({
    allowed: true,
    pageSessionId: 'page-4',
    paused: true,
    requestType: 'close-glossary',
    seekRequest,
    session: staleSession,
  });
  assert.equal(mismatchedClose.paused, true);
  assert.strictEqual(mismatchedClose.seekRequest, seekRequest);
  assert.equal(mismatchedClose.session, null);

  assert.deepEqual(resetDescriptorGlossaryPause<SeekRequest>(), {
    paused: false,
    seekRequest: null,
    session: null,
  });
});
