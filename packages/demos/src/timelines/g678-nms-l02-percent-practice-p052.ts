import type {RuntimeContext} from '../contract';
import type {P052CaptureScenario} from '../nms-l02-p052-capture-state-v1';
import {p052BoundCapture,type P052CaptureIdentityRequest} from '../nms-l02-p052-capture-identity-v1';
export {P052_AUDIO_SOURCE_SHA256 as SOURCE_SWF_SHA} from '../generated/nms-l02-p052-runtime-audio-v1';
/** Pure candidate timeline. Complete capture identity remains mandatory. */
export function p052ModuleCapture(frame:number,context:RuntimeContext){
 if(context.frame!==frame||context.frameDomain!=='sprite-350'||context.rootFrame!==6
  ||(context.replay!==undefined&&context.replay!==0))throw Error('P052_MODULE_CAPTURE_CONTEXT');
 const request:P052CaptureIdentityRequest={frame,frameDomain:'sprite-350',rootFrame:6,
  scenario:context.scenario as P052CaptureScenario,language:context.lang,seed:context.seed,
  requirementId:context.requirementId??'',traceId:context.traceId??'',entryStateSha256:context.entryStateSha256??''};
 return {...p052BoundCapture(request),request};
}
export {p052ModuleCapture as getFrameState};
