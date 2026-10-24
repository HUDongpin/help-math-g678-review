import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P051PracticeView} from '../packages/demos/src/nms-l02-p051-practice-view-v1';
import {P051_ITEMS,p051Initial,p051Reduce} from '../packages/demos/src/nms-l02-p051-practice-v1';
import {P051_TEXT} from '../packages/demos/src/nms-l02-p051-text-v1';
let cases=0;
for(const language of ['en','es'] as const){
 let state=p051Reduce(p051Initial(),{type:'finish',token:0});
 const render=()=>renderToStaticMarkup(<P051PracticeView state={state} language={language} interactive={false} onEvent={()=>{}}/>);
 let html=render();
 assert.deepEqual([...html.matchAll(/data-p051-item="(\d+)"/g)].map(x=>Number(x[1])),P051_ITEMS.map(x=>x.id));
 assert.deepEqual([...html.matchAll(/data-p051-target="(\d+)"/g)].map(x=>Number(x[1])),[0,2,3,5,8]);
 for(const fraction of ['1/10','1/5','1/4','3/4','7/8'])assert.ok(html.includes(`aria-label="${fraction}"`));
 for(const item of P051_ITEMS.filter(x=>x.fraction===null)){
  state=p051Reduce(state,{type:'drop',item:item.id,target:0});html=render();assert.ok(/<dialog[^>]*open=""/.test(html));assert.ok(html.includes(P051_TEXT[language].coach));assert.equal((html.match(/<li>/g)||[]).length,4);
  state=p051Reduce(state,{type:'close-wrong'});assert.equal(state.phase,'ready');cases++;
 }
 for(const item of P051_ITEMS.filter(x=>x.fraction!==null)){
  state=p051Reduce(state,{type:'drop',item:item.id,target:item.id});html=render();assert.ok(!html.includes(`data-p051-item="${item.id}"`));assert.ok(html.includes(P051_TEXT[language].correct));state=p051Reduce(state,{type:'finish',token:state.token});cases++;
 }
 assert.equal(state.phase,'completion-feedback');state=p051Reduce(state,{type:'replay'});html=render();assert.equal((html.match(/data-p051-item=/g)||[]).length,9);cases++;
}
console.log(JSON.stringify({status:'pass',cases,scope:'SSR content, source item order, five fractions, distractor feedback, solved removal and replay; browser interaction/focus not tested'}));
