import {SourceLoopAudioSession,type SourceLoopSessionOptions,type SourceLoopClock,type SourceLoopSpanish} from './source-loop-audio-session-v1';
import {ALG_L07_P028_SOURCE as S,p028InitialState} from './alg-l07-p028-state-v1';
export type P028Clock=SourceLoopClock;
export type P028Spanish=SourceLoopSpanish;
export type P028SessionOptions=SourceLoopSessionOptions<50>;
export class P028Session extends SourceLoopAudioSession<50,never>{
 constructor(options:P028SessionOptions){super({mainId:50,clockPlan:S.clockPlan,sa:S.sa,initialState:p028InitialState,termsAtFrame:()=>[]},options);}
}
