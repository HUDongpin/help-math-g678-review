import React from 'react';import assert from 'node:assert/strict';import {renderToStaticMarkup} from 'react-dom/server';import {P048IntroView} from '../packages/demos/src/nms-l02-p048-intro-view-v1';import {p048Intro} from '../packages/demos/src/nms-l02-p048-intro-v1';
let cases=0,active=0;for(const language of ['en','es'] as const)for(let frame=220;frame<=310;frame++){
 const state=p048Intro(frame),expected=state.objects.filter(o=>[407,408,409,412].includes(o.characterId)&&o.alpha>0).map(o=>o.characterId);const html=renderToStaticMarkup(<P048IntroView frame={frame} language={language}/>);
 for(const id of [407,408,409]){const marked=html.includes(`data-p048-cue="${id}" class="p048-cue-active"`);assert.equal(marked,expected.includes(id));if(marked)active++;}
 assert.equal((html.match(/p048-cue-active/g)||[]).length,new Set(expected).size);cases++;
}console.log(JSON.stringify({passed:true,cases,activeTermCases:active,scope:'Source-selected cue state to SSR matching; visual prominence and pointer path pending.'}));
