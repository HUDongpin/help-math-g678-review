import assert from 'node:assert/strict';
import React from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/node_modules/react/index.js';
import {renderToStaticMarkup} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/node_modules/react-dom/server.node.js';
import {P047IntroView} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-intro-view-v1';
import {P047PracticeView} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-practice-view-v1';
import {p047ModuleFrame} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-frame-v1';
import {p047TextSnapshot} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-text-v1';
import {p047Initial,p047FinishPhase,p047Select,p047Drop,p047Help,P047_CARDS} from '/Volumes/WestWorld/HELP MATH 2.0-g678-implementation/packages/demos/src/nms-l02-p047-practice-v1';
const finish=s=>p047FinishPhase(s,s.phaseToken),normalize=s=>s.replace(/<[^>]*>/g,'').replace(/&quot;/g,'"').replace(/&#x27;/g,"'").replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();let cases=0;
const props={onSelect(){},onDrop(){},onCancel(){},onHelp(){}};
for(const language of ['en','es'])for(const reducedMotion of [false,true]){
 for(let frame=1;frame<140;frame++){
  const state=p047ModuleFrame(frame,{frame,frameDomain:'sprite-81',scenario:'source-inspection',lang:language,seed:0}),snapshot=p047TextSnapshot(state,{reducedMotion});
  const html=renderToStaticMarkup(React.createElement(P047IntroView,{frame,language,reducedMotion,interactive:false}));
  const fractions=[...html.matchAll(/aria-label="(\d+\/\d+)"/g)].map(x=>x[1]);const expected=snapshot.blocks.filter(b=>b.visible&&b.id.startsWith('intro-fraction-')).map(b=>b.text);assert.deepEqual(fractions,expected);
  const paragraphs=[...html.matchAll(/<p(?: [^>]*)?>([\s\S]*?)<\/p>/g)].map(m=>normalize(m[1]));
  for(const id of ['instruction','guidance','watch','term-cue']){const b=snapshot.blocks.find(b=>b.id===id);if(b.visible)assert(paragraphs.includes(normalize(b.text)),id+':'+frame);}
  cases++;
 }
 const base=p047ModuleFrame(140,{frame:140,frameDomain:'sprite-81',scenario:'source-inspection',lang:language,seed:0});let state=finish(p047Initial());
 for(let n=0;n<=4;n++){
  const snapshot=p047TextSnapshot({...base,state});const html=renderToStaticMarkup(React.createElement(P047PracticeView,{...props,state,language}));
  const cardMarkup=[...html.matchAll(/<button[^>]*data-p047-card="(\d+)"[^>]*>/g)].map(m=>({id:m[1],hidden:m[0].includes('hidden=""')}));assert.equal(cardMarkup.filter(c=>!c.hidden).length,4-n);
  for(const c of cardMarkup)assert.equal(!c.hidden,snapshot.blocks.find(b=>b.id==='card-'+c.id).visible);
  assert.equal((html.match(/data-p047-help-step=/g)||[]).length,7);assert.equal((html.match(/aria-label="7\/8"/g)||[]).length,3);
  cases++;if(n<4){const c=P047_CARDS[n];state=finish(p047Drop(p047Select(state,c.id),c.tick));}
 }
}
console.log(JSON.stringify({status:'PASS',cases,scope:'SSR markup comparison of intro fraction sequence/prose and practice card visibility/help geometry. Browser modal visibility, geometry and glossary verified separately.'}));
