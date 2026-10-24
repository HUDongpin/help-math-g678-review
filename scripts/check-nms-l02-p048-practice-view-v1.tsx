import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P048PracticeView} from '../packages/demos/src/nms-l02-p048-practice-view-v1';
import {p048Initial,p048Reduce as step} from '../packages/demos/src/nms-l02-p048-practice-v1';
let s=p048Initial();s=step(s,{type:'intro-finished',token:s.token});const ready=s;const first=step(s,{type:'submit'});s=step(first,{type:'close-feedback'});const second=step(s,{type:'submit'});const reveal=step(second,{type:'close-feedback'});
for(const language of ['en','es'] as const)for(const state of [ready,first,second,reveal]){
 const html=renderToStaticMarkup(<P048PracticeView state={state} language={language} onEvent={()=>{}}/>);
 assert.equal((html.match(/<dialog/g)||[]).length,2);assert.equal((html.match(/data-p048-cell=/g)||[]).length,200);
 assert.equal((html.match(/data-filled="true"/g)||[]).length,23+state.value);
 assert.ok(html.includes(language==='en'?'Hundredths':'Centésimas'));
 if(state.attempts>=2)assert.ok(html.includes(language==='en'?'Sorry.':'Lo siento.'));
}
console.log(JSON.stringify({passed:true,renderCases:8,helpGridFill:23,scope:'SSR content only; dialog effects, focus and real browser operation pending.'}));
