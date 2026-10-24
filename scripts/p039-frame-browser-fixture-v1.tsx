import * as React from 'react';import{createRoot}from'react-dom/client';
import animationModule from'../packages/demos/src/modules/g678-nms-l02-native-percent-practice-p039';
import{P039_SCENARIOS}from'../packages/demos/src/nms-l02-p039-frame-v1';
const cases=[{frameDomain:'root',frame:5,scenario:'source-practice'},{frameDomain:'root',frame:6,scenario:'source-practice'},
 ...[1,11,34,61,134,400,514,535,545].map(frame=>({frameDomain:'sprite-237',frame,scenario:'source-practice'})),
 ...P039_SCENARIOS.map(s=>({frameDomain:'sprite-237',frame:546,scenario:s.id})),
 {frameDomain:'sprite-237',frame:547,scenario:'corrected-reveal-25'},{frameDomain:'sprite-237',frame:579,scenario:'source-practice'},
 {frameDomain:'sprite-223',frame:3,scenario:'source-practice'},{frameDomain:'sprite-227',frame:15,scenario:'wrong-second'},
 {frameDomain:'sprite-228',frame:35,scenario:'corrected-reveal-25'},{frameDomain:'sprite-234',frame:13,scenario:'correct-25'}];
const Renderer=animationModule.Renderer;
createRoot(document.getElementById('root')!).render(<main>{(['en','es']as const).flatMap(lang=>cases.map((c,index)=>{const context={...c,lang,seed:3,replay:2},state=animationModule.getFrameState(c.frame,context),text=animationModule.textPresentation!.getSnapshot(state);return <article key={lang+index} data-case={lang+'-'+index} data-expect={JSON.stringify(text.blocks)}><h1>{lang} {c.frameDomain} / {c.frame} / {c.scenario}</h1><Renderer {...context}/></article>;}))}</main>);
void animationModule.textPresentation!.prepare!().then(()=>document.documentElement.dataset.moduleReady='true').catch(()=>document.documentElement.dataset.moduleReady='failed');
