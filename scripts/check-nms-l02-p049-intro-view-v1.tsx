import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {P049IntroView} from '../packages/demos/src/nms-l02-p049-intro-view-v1';
let cases=0;
for(const language of ['en','es'] as const)for(let frame=1;frame<=326;frame++){
 const html=renderToStaticMarkup(<P049IntroView {...{frame,language}}/>);
 const parts=frame<34?0:frame<37?1:frame<40?2:frame<43?3:frame<46?4:frame<49?5:6;
 assert.equal((html.match(/data-filled="true"/g)||[]).length,parts);
 assert.equal((html.match(/data-p049-cell=/g)||[]).length,10);
 const inputs=html.match(/<input [^>]+>/g)!;assert.equal(inputs.length,2);assert.ok(inputs.every(x=>x.includes('disabled')&&x.includes('readOnly')));
 assert.ok(inputs[0]!.includes(`value="${frame>=164?'6':''}"`));assert.ok(inputs[1]!.includes(`value="${frame>=174?'0':''}"`));
 assert.equal(html.includes('data-p049-demo-check="pressed"'),frame===183||frame===184);
 assert.ok(html.includes(language==='es'?'Pregunta 7':'Question 7'));cases++;
}
console.log(JSON.stringify({status:'PASS',cases,sourceRedParts:true,sourceDigitBoundaries:[164,174],sourcePressedFrames:[183,184],scope:'SSR main instructional view; live pointer geometry pending browser checks.'}));
