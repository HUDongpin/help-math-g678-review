import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P051IntroView} from '../packages/demos/src/nms-l02-p051-intro-view-v1';
import {p051IntroScene} from '../packages/demos/src/nms-l02-p051-intro-scene-v1';
import {P051_TEXT} from '../packages/demos/src/nms-l02-p051-text-v1';
let cases=0;
for(const language of ['en','es'] as const)for(const reducedMotion of [false,true])for(let frame=1;frame<=484;frame++){
 const html=renderToStaticMarkup(<P051IntroView frame={frame} language={language} reducedMotion={reducedMotion}/>),scene=p051IntroScene(frame);
 assert.ok(html.includes(P051_TEXT[language].question));assert.ok(html.includes(P051_TEXT[language].instruction));
 for(const id of [57,60,65,66,67,69,70,71,72,76,78,80,82,84,86,87,89]){
  const tag=html.match(new RegExp(`<[^>]*data-p051-source-text="${id}"[^>]*>`))?.[0];assert.ok(tag,`${frame}:${id}`);
  const opacity=Number(tag.match(/opacity:([^;" ]+)/)?.[1]);assert.equal(opacity,scene.find(x=>x.characterId===id)?.alpha??0,`${frame}:${id}`);
 }
 for(const fraction of ['1/10','1/5','1/4','3/4','7/8'])assert.ok(html.includes(`aria-label="${fraction}"`));
 assert.equal((html.match(/class="p051-intro-card/g)??[]).length,9);
 assert.ok(!html.includes('Coach_audio'));assert.ok(!html.includes('Hurricane'));
 const demo=scene.find(x=>x.characterId===74&&x.path.includes('/sprite-119/'))??scene.find(x=>x.characterId===74);
 const p=Number(html.match(/data-p051-demo-progress="([^"]+)/)?.[1]);assert.equal(p,demo?Math.max(0,Math.min(1,(4385-demo.matrix[4]!)/3695)):0);
 cases++;
}
for(const [frame,decimal,row] of [[80,74,-1],[87,76,-1],[92,78,-1],[97,80,-1],[102,82,-1],[107,89,-1],[112,84,-1],[117,86,-1],[122,87,-1],[126,'',0],[129,'',1],[134,'',2],[136,'',2],[141,'',3],[146,'',4]] as const){const html=renderToStaticMarkup(<P051IntroView frame={frame}/>);assert.ok(html.includes(`data-p051-red-decimal="${decimal}"`));assert.ok(html.includes(`data-p051-red-row="${row}"`));}
const borderEvidence=[];
for(const frame of [11,12,16,21,22]){
 const html=renderToStaticMarkup(<P051IntroView frame={frame}/>),source=p051IntroScene(frame);
 const tags=[...html.matchAll(/<span class="p051-intro-target-border"[^>]*>/g)].map(m=>m[0]);
 assert.equal(tags.length,5);const opacity=source.find(x=>x.characterId===64)?.alpha??0;
 for(const tag of tags)assert.ok(tag.includes(`opacity:${opacity}`));
 for(const id of [67,69,70,71,72,74]){const tag=html.match(new RegExp(`<[^>]*data-p051-source-text="${id}"[^>]*>`))?.[0];assert.ok(tag);assert.equal(Number(tag.match(/opacity:([^;" ]+)/)?.[1]),source.find(x=>x.characterId===id)?.alpha??0);}
 borderEvidence.push({frame,opacity,borders:tags.length,independentTextAlpha:true});
}
console.log(JSON.stringify({borderEvidence}));
console.log(JSON.stringify({pass:true,cases,scope:'SSR source visibility, fraction semantics and demo progress; browser layout and pointer positioning remain unverified'}));
