import assert from 'node:assert/strict';
import test from 'node:test';
import {createTwoAttemptFeedbackQuiz,type TwoAttemptBinding,type TwoAttemptState,type TwoAttemptEvent} from './source-two-attempt-feedback-quiz-v1';
import {P041_SOURCE,P041_FEEDBACK,p041InitialState,p041Reduce,type P041State,type P041Event} from './alg-l06-p041-state-v1';
const binding:TwoAttemptBinding={mainSpriteId:169,quizFrame:P041_SOURCE.quizFrame,postQuizFrame:P041_SOURCE.postQuizFrame,
 mainLastFrame:P041_SOURCE.mainLastFrame,correctAnswer:3,answerCharacters:P041_SOURCE.answerCharacters,
 wrongFirst:P041_SOURCE.wrongFirst,wrongLater:P041_SOURCE.wrongLater,
 branches:Object.entries(P041_FEEDBACK).map(([id,b])=>({spriteId:Number(id),...b}))};
const common=['phase','mainFrame','mainTimelinePlaying','quizSection','quizTryCount','quizButtonsEnabled','wrongFeedText',
 'pendingHostCall','feedback','epoch','sourceToAudioAlignment','lessonCompleted'] as const;
const projection=(s:TwoAttemptState|P041State)=>Object.fromEntries(common.map(k=>[k,s[k]]));

test('two real source contracts: shared core agrees with frozen P041 on 21 retry/advance paths',()=>{
 for(const first of [1,2,3])for(const secondKind of ['wrong','right'] as const)for(const second of secondKind==='wrong'?[1,2,3]:[1,2,3,4]){
  const q=createTwoAttemptFeedbackQuiz(binding);let a=q.initialState(),b=p041InitialState();
  const run=(input:Omit<P041Event,'epoch'>,draw=1)=>{
   const aa=q.reduce(a,{...input,epoch:a.epoch} as TwoAttemptEvent,()=>draw),bb=p041Reduce(b,{...input,epoch:b.epoch} as P041Event,()=>draw);
   assert.equal(aa.accepted,bb.accepted);assert.deepEqual(aa.cleanup,bb.cleanup);a=aa.state;b=bb.state;assert.deepEqual(projection(a),projection(b));
  };
  run({type:'play'});run({type:'advance-main',frame:751} as P041Event);run({type:'pause'});run({type:'play'});run({type:'advance-main',frame:869} as P041Event);
  for(const [kind,index] of [['wrong',first],[secondKind,second]] as const){
   run({type:'choose',answer:kind==='wrong'?1:3} as P041Event);run({type:'resolve-host-feedback'},index);
   const spec=P041_FEEDBACK[a.feedback!.spriteId as keyof typeof P041_FEEDBACK];
   run({type:'pause'});run({type:'play'});
   if(spec.kind==='wrong'){
    for(let frame=3;frame<=spec.hold;frame++)run({type:'advance-feedback',frame,generation:a.feedback!.generation} as P041Event);
    run({type:'play'});run({type:'close-wrong',generation:a.feedback!.generation} as P041Event);
   }
   for(let frame=a.feedback!.frame+1;frame<=spec.terminal;frame++)run({type:'advance-feedback',frame,generation:a.feedback!.generation} as P041Event);
  }
  run({type:'advance-main',frame:753} as P041Event);run({type:'advance-main',frame:869} as P041Event);run({type:'replay'});run({type:'leave'});run({type:'play'});
 }
});

test('reject mismatched family contracts and do not observe later config mutation',()=>{
 assert.throws(()=>createTwoAttemptFeedbackQuiz({...binding,postQuizFrame:binding.quizFrame+2}));
 assert.throws(()=>createTwoAttemptFeedbackQuiz({...binding,branches:binding.branches.slice(1)}));
 assert.throws(()=>createTwoAttemptFeedbackQuiz({...binding,branches:binding.branches.map(b=>b.kind==='wrong'?{...b,closeJump:b.hold}:b)}));
 const mutable=structuredClone(binding),q=createTwoAttemptFeedbackQuiz(mutable);
 (mutable as {quizFrame:number}).quizFrame=1;assert.equal(q.binding.quizFrame,752);assert(Object.isFrozen(q.binding.branches[0]));
});
