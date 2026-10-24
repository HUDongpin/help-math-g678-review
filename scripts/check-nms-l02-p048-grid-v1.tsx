import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P048HundredGrid} from '../packages/demos/src/nms-l02-p048-grid-v1';
import {P048DecimalInput} from '../packages/demos/src/nms-l02-p048-input-v1';
import {p048Initial,p048Reduce} from '../packages/demos/src/nms-l02-p048-practice-v1';
let cases=0;
for(const language of ['en','es'] as const)for(const byColumn of [false,true])for(let value=0;value<=100;value++){
 const html=renderToStaticMarkup(<P048HundredGrid value={value} language={language} byColumn={byColumn}/>);
 assert.equal((html.match(/data-p048-cell=/g)||[]).length,100);assert.equal((html.match(/data-filled="true"/g)||[]).length,value);assert.ok(html.includes('role="img"'));cases++;
}
let s=p048Initial();s=p048Reduce(s,{type:'intro-finished',token:s.token});
for(const helpOpen of [false,true]){const html=renderToStaticMarkup(<P048DecimalInput state={{...s,helpOpen}} onEvent={()=>{}}/>);assert.equal((html.match(/disabled=""/g)||[]).length,helpOpen?3:0);assert.ok(html.includes('step="1"'));}
console.log(JSON.stringify({passed:true,gridCases:cases,disabledInputStates:2,scope:'SSR count/markup checks; browser interaction and visual layout pending.'}));
