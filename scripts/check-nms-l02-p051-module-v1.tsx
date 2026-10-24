import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import animationModule from '../packages/demos/src/modules/g678-nms-l02-native-fraction-match-p051';
import {isP051RuntimeModule} from '../apps/web/lib/nms-l02-p051-runtime-access';
const Renderer=animationModule.Renderer;
assert.equal(isP051RuntimeModule(animationModule),true);
assert.equal(animationModule.runtime?.frameCount,10);
assert.equal(animationModule.textPresentation?.playbackEndFrameByDomain?.['sprite-257'],485);
let renders=0;
for(const lang of ['en','es'] as const)for(const frame of [1,12,22,80,126,226,284,344,350,383,389,484,485,503]){
 const props={frame,frameDomain:'sprite-257',scenario:'source-inspection',lang,seed:17,replay:3};
 const html=renderToStaticMarkup(<Renderer {...props}/>);
 assert.ok(html.includes(`data-flash-frame="${frame}"`));assert.ok(html.includes('data-flash-root-frame="6"'));
 assert.ok(html.includes('data-flash-replay="3"'));assert.ok(html.includes(`data-flash-language="${lang}"`));
 assert.equal(html.includes('data-post-stop-inspection="true"'),frame>485);
 const state=animationModule.getFrameState(frame,props),snapshot=animationModule.textPresentation!.getSnapshot(state);
 assert.equal(snapshot.status,'ready');assert.equal(snapshot.identity.frame,frame);renders++;
}
const wrong=renderToStaticMarkup(<Renderer frame={2} frameDomain="sprite-248" scenario="wrong-feedback" lang="en" seed={0}/>);
assert.ok(wrong.includes('open=""'));assert.ok(wrong.includes('Enter the top number of the fraction.'));
assert.ok(wrong.includes('data-p051-term="fraction"'));assert.ok(!wrong.includes('data-p051-intro-frame'));
const complete=renderToStaticMarkup(<Renderer frame={503} frameDomain="sprite-257" scenario="all-correct-outro" lang="es" seed={0}/>);
assert.ok(complete.includes('data-p051-outro="complete"'));
assert.ok(!complete.includes('data-p051-item='));assert.ok(!complete.includes('<dialog'));
const absent=renderToStaticMarkup(<Renderer frame={5} frameDomain="root" scenario="source-inspection" lang="en" seed={0}/>);
assert.ok(!absent.includes('<h2'));assert.ok(!absent.includes('<button'));
assert.throws(()=>renderToStaticMarkup(<Renderer frame={486} frameDomain="sprite-257" scenario="practice" lang="en" seed={0}/>),/P051_QUERY_ENTRY/);
console.log(JSON.stringify({status:'PASS',keyFrameRenders:renders,feedbackAndTerminal:true,moduleScope:'Unregistered private candidate, not My Lesson or acceptance'}));
