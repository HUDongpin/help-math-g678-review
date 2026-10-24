import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import animationModule from '../packages/demos/src/modules/g678-nms-l02-native-number-line-p047';
import type {RuntimeContext} from '../packages/demos/src/contract';
let checks=0;
for(const lang of ['en','es']as const)for(const domain of animationModule.runtime!.frameDomains!){
 const scenario=animationModule.defaultScenarioByFrameDomain![domain.id];
 for(const frame of [1,domain.frameCount]){
  const context={frame,frameDomain:domain.id,rootFrame:domain.id==='root'?frame:6,scenario,lang,seed:0}as RuntimeContext;
  const state=animationModule.getFrameState(frame,context),snapshot=animationModule.textPresentation!.getSnapshot(state);
  assert.equal(snapshot.status,'ready');assert.equal(snapshot.blocks.length,68);
  const html=renderToStaticMarkup(React.createElement(animationModule.Renderer,context));
  assert(html.includes('data-animation-id="shared-nms002-l02-p047"'));
  assert(html.includes(`data-flash-frame-domain="${domain.id}"`));
  if(domain.id==='root'&&frame<6)assert(!html.includes('Question 5'));
  checks++;
 }
}
assert.equal(animationModule.textPresentation!.playbackEndFrameByDomain!['sprite-81'],140);
assert.equal(animationModule.runtime!.defaultFrameDomain,'sprite-81');
console.log(JSON.stringify({status:'PASS',domainLanguageBoundaryChecks:checks,registered:false}));
