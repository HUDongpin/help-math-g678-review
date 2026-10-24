import assert from'node:assert/strict';import test from'node:test';
import{createSourceLoopingExitQuizV1}from'./source-looping-exit-quiz-v1';
import{ALG_L07_P026_SOURCE as SOURCE,p026InitialState,p026Reduce,type P026State,type P026Event,type P026Term,type P026FeedbackId}from'./alg-l07-p026-state-v1';
const shared=createSourceLoopingExitQuizV1<P026Term,P026FeedbackId>(SOURCE);
test('shared loop and exit-counter behavior equals unchanged P026 through every main/feedback frame and stale events',()=>{
 let transitions=0;
 for(const first of[1,2,3,4]as const)for(const second of[1,2,3,4]as const)for(let seed=0;seed<8;seed++){
  let a=p026InitialState(),b=shared.initialState();
  const go=(event:Omit<P026Event,'epoch'>)=>{const e={...event,epoch:a.epoch}as P026Event;a=p026Reduce(a,e);b=shared.reduce(b,e);assert.deepEqual(b,a);transitions++;
   const stale={type:'advance-main',frame:332,epoch:a.epoch-1}as const;assert.strictEqual(p026Reduce(a,stale),a);assert.strictEqual(shared.reduce(b,stale),b);};
  go({type:'play'});for(let frame=2;frame<=253;frame++)go({type:'advance-main',frame}as never);
  for(const term of['Slope','Linear function','Coefficient','Term','Equation']){go({type:'open-glossary',term}as never);go({type:'play'});go({type:'close-glossary'});}
  for(const answer of[first,second]){if(a.phase!=='quiz-held')break;go({type:'choose',answer,seed}as never);const branch=SOURCE.branches.find(v=>v.spriteId===a.feedback?.spriteId)!;
   const hold=branch.kind==='wrong'?branch.hold:branch.terminal;for(let frame=3;frame<=hold;frame++)go({type:'advance-feedback',frame}as never);
   if(branch.kind==='wrong'){go({type:'play'});go({type:'close-feedback'});for(let frame=branch.closeJump+1;frame<=branch.terminal;frame++)go({type:'advance-feedback',frame}as never);}}
  assert.equal(a.phase,'postquiz');for(let frame=254;frame<=333;frame++)go({type:'advance-main',frame}as never);assert.equal(a.cycle,1);assert.equal(a.mainFrame,1);
  go({type:'replay'});go({type:'play'});go({type:'pause'});go({type:'leave'});go({type:'replay'});assert.equal(a.phase,'left');
 }
 assert(transitions>45000);
});
