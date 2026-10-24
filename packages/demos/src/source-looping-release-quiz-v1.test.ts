import assert from'node:assert/strict';import test from'node:test';
import{createSourceLoopingReleaseQuizV1}from'./source-looping-release-quiz-v1';
import{ALG_L07_P023_SOURCE as SOURCE,p023InitialState,p023Reduce,type P023State,type P023Event,type P023Term,type P023FeedbackId}from'./alg-l07-p023-state-v1';
const shared=createSourceLoopingReleaseQuizV1<P023Term,P023FeedbackId>(SOURCE);
test('shared loop and release-counter behavior equals unchanged P023 through every main/feedback frame and stale events',()=>{
 let transitions=0;
 for(const first of[1,2,3,4]as const)for(const second of[1,2,3,4]as const)for(let seed=0;seed<8;seed++){
  let a=p023InitialState(),b=shared.initialState();
  const go=(event:Omit<P023Event,'epoch'>)=>{const e={...event,epoch:a.epoch}as P023Event;a=p023Reduce(a,e);b=shared.reduce(b,e);assert.deepEqual(b,a);transitions++;
   const stale={type:'advance-main',frame:302,epoch:a.epoch-1}as const;assert.strictEqual(p023Reduce(a,stale),a);assert.strictEqual(shared.reduce(b,stale),b);};
  go({type:'play'});for(let frame=2;frame<=144;frame++)go({type:'advance-main',frame}as never);
  for(const term of['Linear function','Term','Constant','Equation']){go({type:'open-glossary',term}as never);go({type:'play'});go({type:'close-glossary'});}
  for(const answer of[first,second]){if(a.phase!=='quiz-held')break;go({type:'choose',answer,seed}as never);const branch=SOURCE.branches.find(v=>v.spriteId===a.feedback?.spriteId)!;
   const hold=branch.kind==='wrong'?branch.hold:branch.terminal;for(let frame=3;frame<=hold;frame++)go({type:'advance-feedback',frame}as never);
   if(branch.kind==='wrong'){go({type:'play'});go({type:'close-feedback'});for(let frame=branch.closeJump+1;frame<=branch.terminal;frame++)go({type:'advance-feedback',frame}as never);}}
  assert.equal(a.phase,'postquiz');for(let frame=145;frame<=303;frame++)go({type:'advance-main',frame}as never);assert.equal(a.cycle,1);assert.equal(a.mainFrame,1);
  go({type:'replay'});go({type:'play'});go({type:'pause'});go({type:'leave'});go({type:'replay'});assert.equal(a.phase,'left');
 }
 assert(transitions>40000);
});
