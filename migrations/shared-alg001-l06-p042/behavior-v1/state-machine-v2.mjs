// Output-only P042 behavior draft v2. Effects are requests to a future host adapter.
// This module never plays audio, changes the registry, or calls a host API.

export const CHOICES = Object.freeze({
  A: Object.freeze({ instance: 'AnsBtn2', value: -3, buttonId: 171, branch: 'right' }),
  B: Object.freeze({ instance: 'AnsBtn1', value: 3, buttonId: 169, branch: 'wrong' }),
  C: Object.freeze({ instance: 'AnsBtn3', value: 10, buttonId: 170, branch: 'wrong' }),
  D: Object.freeze({ instance: 'AnsBtn4', value: 25, buttonId: 170, branch: 'wrong' }),
});

export const GLOSSARY_BUTTONS = Object.freeze({
  135: 'Substitute', 136: 'Input', 137: 'Value', 140: 'Simplify',
  141: 'Expression', 142: 'Calculate', 143: 'Output', 152: 'Output',
  153: 'Function', 154: 'Input',
});

const NMH_GLOSSARY_BUTTONS = new Set([135, 136, 137, 140, 141, 142, 143]);
const MAIN_GLOSSARY_BUTTONS = new Set([152, 153, 154]);

const WRONG_TEXT = 'Substitute –2 for x in the equation.';

export function initialP042State(epoch = 1) {
  return {
    epoch, phase: 'playing', frame: 1, quizSection: false, quizTryCount: 0,
    selected: null, feedback: null, feedbackToken: null, feedbackFrame: null, serial: 0,
    popupVisible: false, closeVisible: false, quizEnabled: false, nmhEnabled: true,
    wrongFeedPopupVisible: false,
    glossaryTerm: null, audioOwner: `main:${epoch}:1`,
  };
}

const unchanged = (state) => ({ state, effects: [] });
const transition = (state, effects) => ({ state, effects });

export function reduceP042(state, event) {
  if (!state || !event || typeof event.type !== 'string') throw new TypeError('state and event required');
  if (state.phase === 'disposed') return unchanged(state);

  if (event.type === 'REPLAY') {
    const next = initialP042State(state.epoch + 1);
    return transition(next, [
      { type: 'audio:cancelAll' }, { type: 'timeline:seekPlay', frame: 1 },
      { type: 'audio:intent', owner: next.audioOwner },
    ]);
  }
  if (event.type === 'NAVIGATE_AWAY') {
    return transition({ ...state, phase: 'disposed', quizSection: false, quizEnabled: false,
      nmhEnabled: false, popupVisible: false, closeVisible: false, audioOwner: null,
      wrongFeedPopupVisible: false, feedbackToken: null, feedback: null, feedbackFrame: null }, [
      { type: 'audio:cancelAll' }, { type: 'timeline:stop' }, { type: 'host:cleanup' },
    ]);
  }
  if (event.type === 'AUDIO_COMPLETE') {
    if (!event.owner || event.owner !== state.audioOwner) return unchanged(state);
    return transition({ ...state, audioOwner: null }, []);
  }

  // Buttons 152–154 are placed on main sprite 341 from frame 2 onward.
  if (event.type === 'MAIN_FRAME') {
    if (event.epoch !== state.epoch || !Number.isInteger(event.frame)) return unchanged(state);
    if (state.phase === 'playing' && event.frame >= 2 && event.frame <= 278)
      return transition({ ...state, frame: event.frame }, []);
    if (state.phase === 'continuing' && event.frame >= 280 && event.frame <= 399)
      return transition({ ...state, frame: event.frame }, []);
    return unchanged(state);
  }

  if (event.type === 'HOLD_279') {
    if (state.phase !== 'playing' || event.epoch !== state.epoch) return unchanged(state);
    return transition({ ...state, phase: 'quiz', frame: 279, quizSection: true,
      quizTryCount: 0, selected: null, feedback: null, feedbackToken: null, feedbackFrame: null,
      popupVisible: false, closeVisible: false, quizEnabled: true, nmhEnabled: true,
      wrongFeedPopupVisible: false,
      audioOwner: null }, [
      { type: 'timeline:stop', frame: 279 }, { type: 'audio:cancelAll' },
      { type: 'host:enableQuizButton' },
    ]);
  }
  if (event.type === 'OPEN_NMH') {
    if (state.phase !== 'quiz' || !state.nmhEnabled) return unchanged(state);
    return transition({ ...state, phase: 'popup', nmhEnabled: false,
      quizEnabled: false, popupVisible: true, closeVisible: true }, [
      { type: 'host:disableQuizButton' },
    ]);
  }
  if (event.type === 'CLOSE_NMH') {
    if (state.phase !== 'popup') return unchanged(state);
    return transition({ ...state, phase: 'quiz', nmhEnabled: true,
      quizEnabled: true, popupVisible: false, closeVisible: false }, [
      { type: 'host:enableQuizButton' },
    ]);
  }
  if (event.type === 'ANSWER') {
    if (state.phase !== 'quiz' || !state.quizEnabled || !CHOICES[event.choice]) return unchanged(state);
    const choice = CHOICES[event.choice];
    const token = `${state.epoch}:${state.serial + 1}`;
    const wrongText = choice.branch === 'wrong'
      ? WRONG_TEXT + (state.quizTryCount === 1 ? '' : choice.buttonId === 170 ? '  Try again.' : ' Try again.')
      : null;
    const audioOwner = `feedback:${token}`;
    return transition({ ...state,
      phase: choice.branch === 'wrong' ? 'feedbackWrongPlaying' : 'feedbackRightPlaying',
      selected: event.choice, feedback: choice.branch, feedbackToken: token,
      feedbackFrame: 2, serial: state.serial + 1, wrongFeedPopupVisible: false,
      quizEnabled: false, nmhEnabled: false, audioOwner }, [
      { type: 'host:disableQuizButton' },
      { type: 'audio:cancelAll' },
      { type: 'feedback:seekPlay', spriteId: choice.branch === 'wrong' ? 292 : 239,
        frame: 2, token, wrongText },
      { type: 'audio:intent', owner: audioOwner },
    ]);
  }
  if (event.type === 'WRONG_FEEDBACK_HOLD_22') {
    if (state.phase !== 'feedbackWrongPlaying' || event.token !== state.feedbackToken) return unchanged(state);
    return transition({ ...state, phase: 'wrongFeedbackPopup', feedbackFrame: 22,
      wrongFeedPopupVisible: true, audioOwner: null }, [
      { type: 'feedback:stop', spriteId: 292, frame: 22 }, { type: 'audio:cancelAll' },
    ]);
  }
  if (event.type === 'CLOSE_WRONG_FEEDBACK') {
    if (state.phase !== 'wrongFeedbackPopup' || event.token !== state.feedbackToken) return unchanged(state);
    const owner = `feedbackTail:${event.token}`;
    return transition({ ...state, phase: 'feedbackWrongTail', feedbackFrame: 23,
      wrongFeedPopupVisible: false, audioOwner: owner }, [
      { type: 'feedback:seekPlay', spriteId: 292, frame: 23, token: event.token },
      { type: 'answerClips:reset', instances: ['AnsBtn1', 'AnsBtn2', 'AnsBtn3', 'AnsBtn4'], frame: 1 },
      { type: 'audio:intent', owner },
    ]);
  }
  if (event.type === 'WRONG_FEEDBACK_END_31' || event.type === 'RIGHT_FEEDBACK_END_25') {
    const wrong = event.type === 'WRONG_FEEDBACK_END_31';
    if (state.phase !== (wrong ? 'feedbackWrongTail' : 'feedbackRightPlaying') ||
        event.token !== state.feedbackToken) return unchanged(state);
    const count = wrong ? state.quizTryCount + 1 : state.quizTryCount;
    const done = !wrong || count >= 2;
    const nextOwner = done ? `main:${state.epoch}:${state.serial + 1}` : null;
    const next = { ...state, phase: done ? 'continuing' : 'quiz', frame: done ? 280 : 279,
      quizSection: !done, quizTryCount: wrong && done ? 0 : count,
      feedback: null, feedbackToken: null, feedbackFrame: null,
      wrongFeedPopupVisible: false, nmhEnabled: !done,
      quizEnabled: !done, audioOwner: nextOwner };
    const effects = [{ type: 'audio:cancelAll' }];
    if (wrong) {
      // Source enables the quiz before reset and count increment. On second
      // wrong, suppress that transient host enable while the parent resumes.
      if (!done) effects.push({ type: 'host:enableQuizButton' });
      effects.push({ type: 'feedback:reset', spriteId: 292, frame: 1 });
    } else {
      effects.push({ type: 'host:disableQuizButton' },
        { type: 'timeline:seekPlay', frame: 280 },
        { type: 'feedback:reset', spriteId: 239, frame: 1 });
    }
    if (done) {
      if (wrong) effects.push({ type: 'timeline:seekPlay', frame: 280 });
      effects.push({ type: 'audio:intent', owner: nextOwner });
    }
    return transition(next, effects);
  }
  if (event.type === 'FRAME_280') {
    if (state.phase !== 'continuing' || event.epoch !== state.epoch) return unchanged(state);
    return transition({ ...state, frame: 280, quizSection: false }, []);
  }
  if (event.type === 'FRAME_400') {
    if (state.phase !== 'continuing' || event.epoch !== state.epoch) return unchanged(state);
    return transition({ ...state, phase: 'ended', frame: 400, audioOwner: null }, [
      { type: 'timeline:stop', frame: 400 }, { type: 'audio:cancelAll' },
    ]);
  }
  if (event.type === 'GLOSSARY') {
    const term = GLOSSARY_BUTTONS[event.buttonId];
    if (!term) return unchanged(state);
    const inNmhPopup = NMH_GLOSSARY_BUTTONS.has(event.buttonId) && state.phase === 'popup' && state.popupVisible;
    const onMain = MAIN_GLOSSARY_BUTTONS.has(event.buttonId) &&
      ['playing', 'quiz', 'continuing'].includes(state.phase) && state.frame >= 2;
    if (!inNmhPopup && !onMain) return unchanged(state);
    return transition({ ...state, phase: 'hostGlossary', glossaryTerm: term,
      audioOwner: null, quizEnabled: false }, [
      { type: 'audio:cancelAll' }, { type: 'timeline:stop' },
      { type: 'host:DoHyperLinks', keyAttribute: term },
    ]);
  }
  return unchanged(state);
}
