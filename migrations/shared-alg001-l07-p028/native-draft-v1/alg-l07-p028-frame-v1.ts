import type {RuntimeContext} from './contract';
import type {LessonTextBinding} from './lesson-text-contract';
import {buildLessonTextSnapshot} from './lesson-text-snapshot';
import {ALG_L07_P028_SOURCE as S,p028InitialState,p028Visual,type P028State} from './alg-l07-p028-state-v1';
export const P028_DOMAINS=Object.freeze([{id:'root',frameCount:10},{id:'sprite-50',frameCount:837,rootFrame:6}]);
export const P028_MOVIE=Object.freeze({stage:Object.freeze({width:800,height:600}),fps:12,frameCount:10,durationMs:10000/12});
export const P028_DEFAULTS=Object.freeze({'root':'source-two-point-line','sprite-50':'source-two-point-line'});
export const P028_TEXT_BINDING:LessonTextBinding=Object.freeze({schemaVersion:1,version:'alg-l07-p028-native-source-v1',animationId:S.animationId,placementId:S.animationId,sourceSwfSha256:S.sourceSha256,template:'complex-figure',blocks:Object.freeze([
 {id:'course-title',sourceTextIds:[],sourceShapeIds:[1],role:'heading',language:'en',readingOrder:0,valueSource:'source-static'}as const,
 {id:'activity-title',sourceTextIds:[],sourceShapeIds:[1],role:'title',language:'en',readingOrder:1,valueSource:'source-static'}as const,
 ...S.graph.labels.map((g,i)=>({id:`graph-label-${g.sourceDepth}`,sourceTextIds:[g.sourceTextId],role:'label' as const,language:'en' as const,readingOrder:i+2,valueSource:'maintained-page-state' as const})),
 ...[19,20,33,32,45,49].map((id,i)=>({id:`text-${id}`,sourceTextIds:[`character-${id}`],role:'body' as const,language:'en' as const,readingOrder:i+29,valueSource:'maintained-page-state' as const})),
 {id:'first-x-emphasis',sourceTextIds:[],sourceShapeIds:[21],role:'body',language:'en',readingOrder:35,valueSource:'maintained-page-state'}as const,
 {id:'first-y-emphasis',sourceTextIds:['character-23'],sourceShapeIds:[22],role:'body',language:'en',readingOrder:36,valueSource:'maintained-page-state'}as const,
 {id:'second-x-emphasis',sourceTextIds:['character-35','character-18'],sourceShapeIds:[34,36],role:'body',language:'en',readingOrder:37,valueSource:'maintained-page-state'}as const,
 {id:'second-y-emphasis',sourceTextIds:['character-38','character-40'],sourceShapeIds:[37,39],role:'body',language:'en',readingOrder:38,valueSource:'maintained-page-state'}as const,
 ])});
export function p028View(state:P028State,context:RuntimeContext,ready=true){
 const visual=p028Visual(state.mainFrame),values:Record<string,{text:string;visible:boolean}>={};
 const set=(id:string,text:string,visible=true)=>values[id]={text,visible:ready&&visible};
 set('course-title','Linear and Nonlinear Functions:');set('activity-title','Instruction');
 S.graph.labels.forEach(g=>set(`graph-label-${g.sourceDepth}`,g.text,visual.graphAlpha>0));
 set('text-19',S.equation,visual.equationAlpha>0);set('text-20',S.firstCalculation.join('\n'),visual.firstCalculationAlpha>0);set('text-33',S.secondCalculation.join('\n'),visual.secondCalculationAlpha>0);
 for(const id of [32,45,49]){const a=visual.annotations.find(a=>a.sourceCharacterId===id);set(`text-${id}`,a?.text??'',Boolean(a&&a.alpha>0));}
 set('first-x-emphasis','2',visual.firstXEmphasis);set('first-y-emphasis','1',visual.firstYEmphasis);set('second-x-emphasis','0',visual.secondXEmphasis);set('second-y-emphasis','–5',visual.secondYEmphasis);
 const frameDomain=context.frameDomain??'sprite-50',rootFrame=frameDomain==='root'?context.frame:6;
 const sourceTextIds=[...new Set(P028_TEXT_BINDING.blocks.filter(b=>values[b.id]?.visible).flatMap(b=>b.sourceTextIds))];
 return Object.freeze({animationId:S.animationId,state,ready,visual,values,frame:context.frame,frameDomain,rootFrame,scenario:context.scenario,language:context.lang,seed:context.seed,replay:context.replay??0,traceId:context.traceId??'',requirementId:context.requirementId??'',entryStateSha256:context.entryStateSha256??'',sourceTextIds:Object.freeze(sourceTextIds),textSnapshot:buildLessonTextSnapshot(P028_TEXT_BINDING,{...context,frameDomain,rootFrame},values)});
}
export function algL07P028Frame(frame:number,context:RuntimeContext={frame,frameDomain:'sprite-50',scenario:'source-two-point-line',lang:'en',seed:0}){
 const domain=context.frameDomain??'sprite-50',spec=P028_DOMAINS.find(d=>d.id===domain);
 if(!spec||!Number.isSafeInteger(frame)||frame<1||frame>spec.frameCount||context.scenario!=='source-two-point-line'||!['en','es'].includes(context.lang)||!Number.isSafeInteger(context.seed)||context.seed<0||context.seed>4294967295||!Number.isSafeInteger(context.replay??0)||(context.replay??0)<0)throw Error('invalid-p028-frame-identity');
 return p028View({...p028InitialState(),mainFrame:domain==='sprite-50'?frame:1,replay:context.replay??0},{...context,frame,frameDomain:domain},domain!=='root'||frame>=6);
}
export type P028View=ReturnType<typeof p028View>;
