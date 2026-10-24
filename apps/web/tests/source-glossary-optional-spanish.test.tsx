import assert from 'node:assert/strict';
import test from 'node:test';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {SourceGlossaryLessonRuntime,type SourceGlossaryRuntimeConfig} from '../components/source-glossary-lesson-runtime';
import type {LessonRuntimeAdapterProps} from '../lib/lesson-runtime-adapter';
import {P055_CONTROLS} from '../../../packages/demos/src/nms-l02-ts-pilot-text';
const props={uiLanguage:'en',paused:true,volume:1,labels:{unavailable:'Unavailable'},
 onRuntimePausedChange:()=>{},connectRuntimeControls:()=>()=>{}} as unknown as LessonRuntimeAdapterProps;
test('an unbound optional language track exposes no playback controls or eager resources',()=>{
 let attempts=0;
 const config:SourceGlossaryRuntimeConfig={page:P055_CONTROLS,
  loadModule:async()=>{attempts++;throw Error('no eager module');},
  createTransport:()=>{attempts++;throw Error('no eager transport');}};
 const html=renderToStaticMarkup(<SourceGlossaryLessonRuntime {...props} config={config}/>);
 assert(!html.includes('Optional Spanish audio'));
 assert(!html.includes('Play Spanish audio'));
 assert.equal(attempts,0);
});
test('bound consumers retain all explicit Spanish audio controls without an eager start',()=>{
 let attempts=0;
 const config:SourceGlossaryRuntimeConfig={page:P055_CONTROLS,
  loadModule:async()=>{throw Error('no eager module');},createTransport:()=>{throw Error('no eager transport');},
  createSpanish:()=>{attempts++;throw Error('no eager Spanish track');}};
 const html=renderToStaticMarkup(<SourceGlossaryLessonRuntime {...props} config={config}/>);
 for(const text of ['Optional Spanish audio','Play Spanish audio from start','Pause Spanish audio','Return to animation'])assert(html.includes(text));
 assert.equal(attempts,0);
});
