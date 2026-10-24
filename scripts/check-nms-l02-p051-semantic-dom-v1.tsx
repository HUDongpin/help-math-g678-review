import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {parseFragment} from 'parse5';
import {p051ModuleFrame} from '../packages/demos/src/nms-l02-p051-frame-v1';
import {p051TextSnapshot} from '../packages/demos/src/nms-l02-p051-text-snapshot-v1';
import {P051IntroView} from '../packages/demos/src/nms-l02-p051-intro-view-v1';
import {P051PracticeView} from '../packages/demos/src/nms-l02-p051-practice-view-v1';
import {P051OutroView} from '../packages/demos/src/nms-l02-p051-outro-view-v1';
import {P051Glossary,type P051GlossaryId} from '../packages/demos/src/nms-l02-p051-glossary-v1';
import {p051IntroScene} from '../packages/demos/src/nms-l02-p051-intro-scene-v1';
import {P051_TEXT} from '../packages/demos/src/nms-l02-p051-text-v1';
import {p051Initial,p051Reduce} from '../packages/demos/src/nms-l02-p051-practice-v1';
type Node={nodeName:string;value?:string;attrs?:{name:string;value:string}[];childNodes?:Node[]};
const normalized=(s:string)=>s.replace(/\u00ad/g,'').replace(/\s+/g,' ').trim();
function semanticText(html:string){
 const values:string[]=[];
 function walk(n:Node){
  const a=Object.fromEntries((n.attrs??[]).map(x=>[x.name,x.value]));
  if(a['aria-hidden']==='true'||'hidden'in a||(n.nodeName==='dialog'&&!('open'in a))||/(?:^|;)opacity:0(?:;|$)/.test(a.style??'')||/visibility:hidden/.test(a.style??''))return;
  if(n.nodeName==='#text'){const s=normalized(n.value??'');if(s)values.push(s);return;}
  if(a.role==='math'){assert.ok(a['aria-label']);values.push(normalized(a['aria-label']));return;}
  // Target controls expose an accessible instruction in addition to solved text.
  // Headings already contain their own normalized text: do not count an alias twice.
  if(a['aria-label']&&n.nodeName!=='th')values.push(normalized(a['aria-label']));
  for(const child of n.childNodes??[])walk(child);
 }
 walk(parseFragment(html) as unknown as Node);return values.sort();
}
type State=ReturnType<typeof p051ModuleFrame>;
function markup(s:State,reducedMotion:boolean){
 if(s.mainFrame===null)return '';
 const language=s.language,intro=s.state.phase==='intro',outro=['outro','complete'].includes(s.state.phase);
 const scene=p051IntroScene(Math.min(s.mainFrame,484));
 const visibleIds:readonly P051GlossaryId[]=intro?scene.filter(o=>o.alpha>0&&(o.characterId===62||o.characterId===63)).map(o=>o.characterId===62?'equivalent-decimal':'column'):['equivalent-decimal','column'];
 const noop=()=>{};
 return renderToStaticMarkup(<div>
  {!intro&&<p>{P051_TEXT[language].title}</p>}
  <P051Glossary language={language} scope="main" visibleIds={visibleIds} onOpen={noop} onClose={noop}/>
  {intro?<P051IntroView frame={s.mainFrame} language={language} reducedMotion={reducedMotion}/>:outro?<P051OutroView language={language} complete={s.state.phase==='complete'}/>:<P051PracticeView state={s.state} language={language} interactive={false} onEvent={noop} wrongGlossary={<P051Glossary language={language} scope="wrong" onOpen={noop} onClose={noop}/>}/>}
 </div>);
}
const failures:unknown[]=[];let cases=0;
assert.deepEqual(semanticText('<p>1/4</p><p>1/4</p>'),['1/4','1/4']);
assert.deepEqual(semanticText('<p aria-hidden="true">hidden</p><p style="opacity:0">hidden</p><dialog>hidden</dialog>'),[]);
assert.deepEqual(semanticText('<span role="math" aria-label="1/4"><span aria-hidden="true">1</span><span aria-hidden="true">4</span></span>'),['1/4']);
function check(s:State,reduced=false){
 const expected=p051TextSnapshot(s).blocks.filter(b=>b.visible).map(b=>normalized(b.text)).filter(Boolean).sort();
 const actual=semanticText(markup(s,reduced));cases++;
 if(JSON.stringify(expected)!==JSON.stringify(actual)){
  const diff=(a:string[],b:string[])=>{const rest=[...b];return a.filter(v=>{const i=rest.indexOf(v);if(i<0)return true;rest.splice(i,1);return false;});};
  failures.push({language:s.language,frame:s.frame,phase:s.state.phase,solved:s.state.solved,reduced,missing:diff(expected,actual),extra:diff(actual,expected)});
 }
}
for(const lang of ['en','es'] as const){
 for(let frame=1;frame<=10;frame++)check(p051ModuleFrame(frame,{frame,frameDomain:'root',scenario:'source-inspection',lang,seed:0}));
 for(let frame=1;frame<=484;frame++)for(const reduced of [false,true])check(p051ModuleFrame(frame,{frame,frameDomain:'sprite-257',scenario:'source-inspection',lang,seed:0}),reduced);
 for(let mask=0;mask<32;mask++){
  let state=p051Reduce(p051Initial(),{type:'finish',token:0});
  for(const [bit,id] of [0,2,3,5,8].entries())if(mask&(1<<bit)){
   state=p051Reduce(state,{type:'drop',item:id,target:id});
   check({...p051ModuleFrame(485,{frame:485,frameDomain:'sprite-257',scenario:'practice',lang,seed:0}),state});
   state=p051Reduce(state,{type:'finish',token:state.token});
  }
  const s={...p051ModuleFrame(485,{frame:485,frameDomain:'sprite-257',scenario:'practice',lang,seed:0}),state};check(s);
  if(state.phase==='ready')for(const item of [1,4,6,7])check({...s,state:p051Reduce(state,{type:'drop',item,target:0})});
 }
 for(let frame=486;frame<=503;frame++)check(p051ModuleFrame(frame,{frame,frameDomain:'sprite-257',scenario:'all-correct-outro',lang,seed:0}));
}
console.log(JSON.stringify({passed:failures.length===0,cases,failedCases:failures.length,failures:failures.slice(0,20),scope:'Bidirectional SSR visible/native-label text multiset across every intro frame and solved subset; excludes selected-option hook state and open portal dialogs; not browser or original-runtime equivalence'},null,2));
if(failures.length)process.exitCode=1;
