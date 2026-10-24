import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { CHOICES, GLOSSARY_BUTTONS, initialP042State, reduceP042 } from './state-machine-v2.mjs';

const step = (state, event) => reduceP042(state, event);
const hold = () => step(initialP042State(), { type: 'HOLD_279', epoch: 1 }).state;

function completeWrong(state, choice) {
  const started = step(state, { type: 'ANSWER', choice });
  const token = started.state.feedbackToken;
  const held = step(started.state, { type: 'WRONG_FEEDBACK_HOLD_22', token });
  const closed = step(held.state, { type: 'CLOSE_WRONG_FEEDBACK', token });
  const ended = step(closed.state, { type: 'WRONG_FEEDBACK_END_31', token });
  return { started, held, closed, ended, token };
}

test('native source binds A=−3 right and B/C/D wrong to exact instances', () => {
  const native = JSON.parse(readFileSync(new URL('../native-v1/native-model-v1.json', import.meta.url)));
  assert.equal(native.quiz.holdFrame, 279);
  for (const placement of native.quiz.answerPlacements) {
    const label = placement.sourceStageLetter.text;
    const draft = CHOICES[label];
    assert.equal(placement.sourceStageLabelBindingAccepted, true);
    assert.equal(placement.browserHitParityAccepted, false);
    assert.equal(placement.instance, draft.instance);
    assert.equal(placement.buttonId, draft.buttonId);
    assert.equal(placement.branch, draft.branch);
    assert.equal(Number(placement.sourceStageValue.text.replace('–', '-')), draft.value);
  }
});

test('frame 279 stops, zeros attempts, and hides NMH popup', () => {
  const { state, effects } = step(initialP042State(), { type: 'HOLD_279', epoch: 1 });
  assert.equal(state.phase, 'quiz');
  assert.equal(state.frame, 279);
  assert.equal(state.quizTryCount, 0);
  assert.equal(state.quizSection, true);
  assert.equal(state.popupVisible, false);
  assert.equal(state.audioOwner, null);
  assert.ok(effects.some(x => x.type === 'timeline:stop' && x.frame === 279));
});

test('wrong feedback pauses at 22 and cannot reach count increment until nested Close', () => {
  const started = step(hold(), { type: 'ANSWER', choice: 'B' });
  const token = started.state.feedbackToken;
  assert.equal(started.state.phase, 'feedbackWrongPlaying');
  assert.equal(started.effects.find(x => x.type === 'feedback:seekPlay').spriteId, 292);
  assert.equal(started.effects.find(x => x.type === 'feedback:seekPlay').wrongText,
    'Substitute –2 for x in the equation. Try again.');
  assert.equal(step(started.state, { type: 'WRONG_FEEDBACK_END_31', token }).state, started.state);
  const held = step(started.state, { type: 'WRONG_FEEDBACK_HOLD_22', token });
  assert.equal(held.state.phase, 'wrongFeedbackPopup');
  assert.equal(held.state.feedbackFrame, 22);
  assert.equal(held.state.wrongFeedPopupVisible, true);
  assert.equal(held.state.audioOwner, null);
  assert.equal(held.state.quizTryCount, 0);
  assert.equal(step(held.state, { type: 'WRONG_FEEDBACK_END_31', token }).state, held.state);
  assert.equal(step(held.state, { type: 'FEEDBACK_END', token }).state, held.state);
  const closed = step(held.state, { type: 'CLOSE_WRONG_FEEDBACK', token });
  assert.equal(closed.state.phase, 'feedbackWrongTail');
  assert.equal(closed.state.feedbackFrame, 23);
  assert.equal(closed.state.wrongFeedPopupVisible, false);
  assert.deepEqual(closed.effects[0], { type: 'feedback:seekPlay', spriteId: 292, frame: 23, token });
  assert.deepEqual(closed.effects[1], {
    type: 'answerClips:reset', instances: ['AnsBtn1', 'AnsBtn2', 'AnsBtn3', 'AnsBtn4'], frame: 1,
  });
  const ended = step(closed.state, { type: 'WRONG_FEEDBACK_END_31', token });
  assert.equal(ended.state.phase, 'quiz');
  assert.equal(ended.state.quizTryCount, 1);
  assert.equal(ended.state.quizEnabled, true);
});

test('two wrong answers each require Close, then continue at 280 and reset tries', () => {
  const first = completeWrong(hold(), 'C');
  assert.equal(first.ended.state.phase, 'quiz');
  assert.equal(first.ended.state.quizTryCount, 1);
  assert.equal(first.started.effects.find(x => x.type === 'feedback:seekPlay').wrongText,
    'Substitute –2 for x in the equation.  Try again.');
  const second = completeWrong(first.ended.state, 'D');
  assert.equal(second.started.effects.find(x => x.type === 'feedback:seekPlay').wrongText,
    'Substitute –2 for x in the equation.');
  assert.equal(second.held.state.quizTryCount, 1);
  assert.equal(second.ended.state.phase, 'continuing');
  assert.equal(second.ended.state.frame, 280);
  assert.equal(second.ended.state.quizSection, false);
  assert.equal(second.ended.state.quizTryCount, 0);
  assert.ok(second.ended.effects.some(x => x.type === 'timeline:seekPlay' && x.frame === 280));
  assert.equal(second.ended.effects.some(x => x.type === 'host:enableQuizButton'), false);
});

test('right after one wrong retains quizTryCount=1 through continuation and end', () => {
  const afterWrong = completeWrong(hold(), 'B').ended.state;
  const right = step(afterWrong, { type: 'ANSWER', choice: 'A' });
  const token = right.state.feedbackToken;
  assert.equal(right.state.phase, 'feedbackRightPlaying');
  assert.equal(right.effects.find(x => x.type === 'feedback:seekPlay').spriteId, 239);
  assert.equal(step(right.state, { type: 'WRONG_FEEDBACK_HOLD_22', token }).state, right.state);
  assert.equal(step(right.state, { type: 'CLOSE_WRONG_FEEDBACK', token }).state, right.state);
  const ended = step(right.state, { type: 'RIGHT_FEEDBACK_END_25', token });
  assert.equal(ended.state.phase, 'continuing');
  assert.equal(ended.state.quizSection, false);
  assert.equal(ended.state.quizTryCount, 1);
  assert.ok(ended.effects.some(x => x.type === 'timeline:seekPlay' && x.frame === 280));
  const last = step(ended.state, { type: 'FRAME_400', epoch: 1 });
  assert.equal(last.state.phase, 'ended');
  assert.equal(last.state.quizTryCount, 1);
});

test('direct right from zero tries continues without wrong feedback popup', () => {
  const right = step(hold(), { type: 'ANSWER', choice: 'A' });
  const ended = step(right.state, { type: 'RIGHT_FEEDBACK_END_25', token: right.state.feedbackToken });
  assert.equal(ended.state.quizTryCount, 0);
  assert.equal(ended.state.phase, 'continuing');
  assert.equal(ended.state.wrongFeedPopupVisible, false);
});

test('NMH popup and Close preserve attempts and block answer while visible', () => {
  const afterWrong = completeWrong(hold(), 'B').ended.state;
  const opened = step(afterWrong, { type: 'OPEN_NMH' });
  assert.equal(opened.state.phase, 'popup');
  assert.equal(opened.state.popupVisible, true);
  assert.equal(opened.state.quizEnabled, false);
  assert.equal(step(opened.state, { type: 'ANSWER', choice: 'A' }).state, opened.state);
  const closed = step(opened.state, { type: 'CLOSE_NMH' });
  assert.equal(closed.state.phase, 'quiz');
  assert.equal(closed.state.popupVisible, false);
  assert.equal(closed.state.quizTryCount, 1);
  assert.equal(closed.state.quizEnabled, true);
});

test('nested glossary 135–143 is inaccessible until Mc_Popup is opened', () => {
  assert.equal(GLOSSARY_BUTTONS[135], 'Substitute');
  assert.equal(GLOSSARY_BUTTONS[143], 'Output');
  const held = hold();
  assert.equal(step(held, { type: 'GLOSSARY', buttonId: 135 }).state, held);
  const popup = step(held, { type: 'OPEN_NMH' }).state;
  const result = step(popup, { type: 'GLOSSARY', buttonId: 135 });
  assert.equal(result.state.phase, 'hostGlossary');
  assert.deepEqual(result.effects.find(x => x.type === 'host:DoHyperLinks'),
    { type: 'host:DoHyperLinks', keyAttribute: 'Substitute' });
  assert.ok(result.effects.some(x => x.type === 'timeline:stop'));
});

test('main glossary 152–154 needs source frame 2 or later and no NMH overlay', () => {
  const atOne = initialP042State();
  assert.equal(step(atOne, { type: 'GLOSSARY', buttonId: 153 }).state, atOne);
  const atTwo = step(atOne, { type: 'MAIN_FRAME', epoch: 1, frame: 2 }).state;
  const result = step(atTwo, { type: 'GLOSSARY', buttonId: 153 });
  assert.equal(result.state.glossaryTerm, 'Function');
  const popup = step(hold(), { type: 'OPEN_NMH' }).state;
  assert.equal(step(popup, { type: 'GLOSSARY', buttonId: 153 }).state, popup);
  assert.equal(step(hold(), { type: 'GLOSSARY', buttonId: 153 }).state.phase, 'hostGlossary');
});

test('Replay and navigation revoke paused feedback, stale close and audio callbacks', () => {
  const started = step(hold(), { type: 'ANSWER', choice: 'B' });
  const token = started.state.feedbackToken;
  const staleAudio = started.state.audioOwner;
  const paused = step(started.state, { type: 'WRONG_FEEDBACK_HOLD_22', token });
  const replay = step(paused.state, { type: 'REPLAY' });
  assert.equal(replay.state.phase, 'playing');
  assert.equal(replay.state.epoch, 2);
  assert.equal(replay.state.quizTryCount, 0);
  assert.ok(replay.effects.some(x => x.type === 'audio:cancelAll'));
  assert.equal(step(replay.state, { type: 'CLOSE_WRONG_FEEDBACK', token }).state, replay.state);
  assert.equal(step(replay.state, { type: 'WRONG_FEEDBACK_END_31', token }).state, replay.state);
  assert.equal(step(replay.state, { type: 'AUDIO_COMPLETE', owner: staleAudio }).state, replay.state);
  assert.equal(step(replay.state, { type: 'HOLD_279', epoch: 1 }).state, replay.state);
  const away = step(replay.state, { type: 'NAVIGATE_AWAY' });
  assert.equal(away.state.phase, 'disposed');
  assert.equal(away.state.audioOwner, null);
  assert.ok(away.effects.some(x => x.type === 'host:cleanup'));
  assert.equal(step(away.state, { type: 'REPLAY' }).state, away.state);
});
