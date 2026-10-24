import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P051PracticeView} from '../packages/demos/src/nms-l02-p051-practice-view-v1';
import {p051Initial,p051Reduce} from '../packages/demos/src/nms-l02-p051-practice-v1';
let cases=0;
for(const language of ['en','es'] as const){
 const ready=p051Reduce(p051Initial(),{type:'finish',token:0});
 for(const state of [ready,p051Reduce(ready,{type:'drop',item:1,target:0})]){
  const render=(interactive:boolean,modalSuspended:boolean)=>renderToStaticMarkup(<P051PracticeView state={state} language={language} interactive={interactive} modalSuspended={modalSuspended} onEvent={()=>{}}/>);
  const active=render(true,false),nested=render(true,true),staticView=render(false,false);
  // Client modal lifetime must never be replaced with declarative non-modal open merely because a glossary is active.
  assert.ok(!/<dialog[^>]*open=/.test(active));assert.ok(!/<dialog[^>]*open=/.test(nested));
  if(state.phase==='wrong-feedback')assert.ok(/<dialog[^>]*open=/.test(staticView));
  const options=[...nested.matchAll(/<button[^>]*data-p051-item="\d+"[^>]*>/g)].map(m=>m[0]);
  assert.equal(options.length,9);assert.ok(options.every(b=>b.includes('disabled=""')));
  if(state.phase==='ready')assert.ok([...active.matchAll(/<button[^>]*data-p051-item="\d+"[^>]*>/g)].every(m=>!m[0].includes('disabled=""')));
  cases++;
 }
}
console.log(JSON.stringify({passed:true,cases,scope:'SSR nested suspension contract; actual modal/focus verified by browser-v2'}));
