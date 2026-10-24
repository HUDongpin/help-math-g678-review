import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {P051OutroView} from '../packages/demos/src/nms-l02-p051-outro-view-v1';
for(const language of ['en','es'] as const)for(const complete of [false,true]){
 const html=renderToStaticMarkup(<P051OutroView language={language} complete={complete}/>);
 for(const fraction of ['1/10','1/5','1/4','3/4','7/8'])assert.ok(html.includes(`aria-label="${fraction}"`));
 for(const decimal of ['0.1','0.2','0.25','0.75','0.875'])assert.ok(html.includes(`<td>${decimal}</td>`));
 assert.equal((html.match(/<tr>/g)||[]).length,6);
 assert.ok(!html.includes('<button'));assert.ok(!html.includes('<dialog'));
 assert.ok(!html.includes('Correct!!!'));assert.ok(!html.includes('¡¡¡Correcto!!!'));
}
console.log(JSON.stringify({status:'PASS',cases:4,scope:'Five retained source targets, removed practice and feedback controls; not original runtime.'}));
