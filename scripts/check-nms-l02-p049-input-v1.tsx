import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {P049DecimalGrid} from '../packages/demos/src/nms-l02-p049-grid-v1';
import {P049DecimalInput} from '../packages/demos/src/nms-l02-p049-input-v1';
import {p049Initial,type P049State} from '../packages/demos/src/nms-l02-p049-practice-v1';
let grids=0,views=0;
for(const language of ['en','es'] as const)for(const total of [10,100] as const)for(let parts=0;parts<=total;parts++){
 const html=renderToStaticMarkup(<P049DecimalGrid {...{parts,total,language}}/>);
 assert.equal((html.match(/data-p049-cell=/g)||[]).length,total);assert.equal((html.match(/data-filled="true"/g)||[]).length,parts);
 const cells=[...html.matchAll(/data-p049-cell="(\d+)" data-filled="(true|false)"/g)];
 for(const [,index,filled]of cells){const i=Number(index);assert.equal(filled==='true',(total===10?i:(i%10)*10+Math.floor(i/10))<parts);}
 grids++;
}
for(const language of ['en','es'] as const)for(const question of [0,1,2] as const)for(const phase of ['ready','correct-feedback','wrong-feedback','answer-transition','outro','complete'] as const){
 const state:P049State={...p049Initial(),phase,question,digits:['x','']};
 const frame=phase==='ready'?[327,350,370][question]!:435;
 const html=renderToStaticMarkup(<P049DecimalInput {...{state,frame,language}} onEvent={()=>{}}/>);
 assert.equal((html.match(/<input /g)||[]).length,2);assert.equal(html.includes('maxLength'),false);assert.equal(html.includes('type="number"'),false);
 const inputs=html.match(/<input [^>]+>/g)!;assert.ok(inputs.every(x=>x.includes('disabled')===(phase!=='ready')));
 assert.equal((html.match(/data-filled="true"/g)||[]).length,[8,37,98][question]);views++;
}
for(const question of [0,1,2] as const){
 const boundary=[328,351,390][question]!;
 const state:P049State={...p049Initial(),phase:'answer-transition',question,digits:['x','y']};
 const before=renderToStaticMarkup(<P049DecimalInput state={state} frame={boundary-1} onEvent={()=>{}}/>);
 const after=renderToStaticMarkup(<P049DecimalInput state={state} frame={boundary} onEvent={()=>{}}/>);
 if(question===2){assert.equal(before.includes('value="x"'),false);assert.equal((before.match(/value=""/g)||[]).length,2);}else assert.ok(before.includes('value="x"'));
 assert.equal(after.includes('value="x"'),false);
}
for(const flag of ['helpOpen','hintOpen'] as const){const state={...p049Initial(),phase:'ready' as const,[flag]:true};const html=renderToStaticMarkup(<P049DecimalInput state={state} frame={327} onEvent={()=>{}}/>);assert.ok(html.match(/<input [^>]+>/g)!.every(x=>x.includes('disabled')));}
console.log(JSON.stringify({status:'PASS',gridCases:grids,viewCases:views,revealBoundaries:[328,351,390],unrestrictedTextFields:true,modalInputGating:true,scope:'SSR structure and source count checks; browser input/layout pending.'}));
