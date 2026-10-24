import assert from 'node:assert/strict';
import {p049Initial,p049Reduce,p049AnswerMatches,p049OutroStart,p049TransitionFrames,P049_ANSWER_DIGITS,type P049State} from '../packages/demos/src/nms-l02-p049-practice-v1.ts';
const finish = (s:P049State) => p049Reduce(s,{type:'phase-finished',token:s.token});
const answer = (s:P049State, digits:readonly [string,string]) => p049Reduce(p049Reduce(s,{type:'input',field:0,value:digits[0]}),{type:'input',field:1,value:digits[1]});
assert.equal(p049AnswerMatches(0,['8','']),true);
assert.equal(p049AnswerMatches(0,['8','0']),true);
for(const digits of [['08','0'],['8 ','0'],['8','00'],['0.8',''],['',''],['8',' ']] as const)assert.equal(p049AnswerMatches(0,digits),false);
assert.deepEqual([0,1,2].map(q=>p049TransitionFrames(q as 0|1|2)),[[328,350],[351,370],[371,385]]);
let routes=0;const states:P049State[]=[];
// Each question is correct immediately, correct after one error, or advances after two errors.
for(let path=0;path<27;path++) {
  let s=finish(p049Initial()),remaining=path,expectedCorrect=0;
  for(let question=0;question<3;question++) {
    assert.equal(s.phase,'ready');assert.equal(s.question,question);assert.deepEqual(s.digits,['','']);assert.equal(s.wrongAttempts,0);
    const result=remaining%3;remaining=Math.floor(remaining/3);
    if(result>0){
      s=p049Reduce(s,{type:'submit'});states.push(s);assert.equal(s.hintOpen,true);
      assert.equal(p049Reduce(s,{type:'input',field:0,value:'8'}),s);
      assert.equal(finish(s),s); // First audio return cannot advance or dismiss source hint.
      const stale=s.token;s=p049Reduce(s,{type:'close-hint'});assert.equal(s.phase,'ready');
      assert.equal(p049Reduce(s,{type:'phase-finished',token:stale}),s);
    }
    if(result===2){
      s=p049Reduce(s,{type:'submit'});assert.equal(s.hintOpen,false);assert.equal(s.wrongAttempts,2);states.push(s);s=finish(s);
    }else{
      s=answer(s,P049_ANSWER_DIGITS[s.question]);s=p049Reduce(s,{type:'submit'});states.push(s);
      assert.equal(s.correctCount,expectedCorrect); // Counter changes at feedback completion, not submit.
      s=finish(s);expectedCorrect++;
    }
    assert.equal(s.phase,'answer-transition');assert.equal(s.correctCount,expectedCorrect);states.push(s);s=finish(s);
  }
  assert.equal(s.phase,'outro');assert.equal(p049OutroStart(s),expectedCorrect===3?386:411);states.push(s);
  s=finish(s);assert.equal(s.phase,'complete');states.push(s);assert.equal(finish(s),s);routes++;
}
let help=finish(p049Initial());help=answer(help,['8','']);const held=p049Reduce(help,{type:'help',open:true});
assert.equal(p049Reduce(held,{type:'submit'}),held);assert.equal(p049Reduce(held,{type:'input',field:1,value:'9'}),held);
assert.deepEqual(p049Reduce(held,{type:'help',open:false}).digits,['8','']);states.push(held,p049Initial());
for(const s of states){const reset=p049Reduce(s,{type:'replay'});assert.deepEqual(reset,p049Initial(s.replay+1,s.token+1));assert.equal(p049Reduce(reset,{type:'phase-finished',token:s.token}),reset);}
console.log(JSON.stringify({status:'PASS',routes,replayStates:states.length,sourceAnswers:['0.8/0.80','0.37','0.98'],outroStarts:[386,411],scope:'Native reducer source-contract tests only; no runtime fidelity or registration.'}));
