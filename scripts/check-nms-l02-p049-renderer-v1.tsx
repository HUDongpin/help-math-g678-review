import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {NmsL2P049Renderer} from '../packages/demos/src/nms-l02-p049-renderer-v1';
const cases:Array<[string,string,number]>=[['root','source-inspection',1],['root','source-inspection',6],['sprite-156','source-inspection',172],['sprite-156','question-1',327],['sprite-156','question-2',350],['sprite-156','question-3',370],['sprite-156','answer-3',371],['sprite-156','all-correct-outro',386],['sprite-156','all-correct-outro',390],['sprite-156','retry-outro',411],['sprite-156','retry-outro',435],['sprite-109','help-example',1],['sprite-131','hint-example',1],['sprite-72','correct-feedback',20],['sprite-74','second-wrong',27]];
let count=0;
for(const [frameDomain,scenario,frame]of cases)for(const lang of ['en','es'] as const){
 const html=renderToStaticMarkup(<NmsL2P049Renderer {...{frameDomain,scenario,frame,lang,seed:5,replay:2,traceId:'inspection',requirementId:'local-check',entryStateSha256:'a'.repeat(64)}}/>);
 assert.ok(html.includes(`data-flash-frame="${frame}"`));assert.ok(html.includes(`data-flash-frame-domain="${frameDomain}"`));assert.ok(html.includes('data-flash-replay="2"'));assert.ok(html.includes('data-source-alignment="candidate-not-accepted"'));
 if(frameDomain==='root'&&frame===1){assert.equal(html.includes('<input'),false);assert.equal(html.includes('p049-course-title'),false);}
 else {const inputs=html.match(/<input [^>]+>/g)!;assert.equal(inputs.length,2);assert.ok(inputs.every(x=>x.includes('disabled')));
  if((scenario==='answer-3'&&frame===371)||(scenario==='all-correct-outro'&&frame===386))assert.ok(inputs.every(x=>x.includes('value=""')));
  if(scenario==='all-correct-outro'&&frame===390){assert.ok(inputs[0]!.includes('value="9"'));assert.ok(inputs[1]!.includes('value="8"'));}
 }
 count++;
}
console.log(JSON.stringify({status:'PASS',cases:count,frameIdentity:true,rootBeforeEntryEmpty:true,thirdAnswerGap:true,sameViewsDisabled:true,scope:'SSR inspection; dialog opening effects and full static browser rendering pending.'}));
