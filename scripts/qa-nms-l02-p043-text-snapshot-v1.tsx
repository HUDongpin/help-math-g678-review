import * as React from 'react';
import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {P043Presentation} from '../packages/demos/src/nms-l02-p043-presentation-v1';
import {p043ModuleFrame,P043_FRAME_DOMAINS} from '../packages/demos/src/nms-l02-p043-frame-v1';
import {P043_TEXT_BINDING,p043TextSnapshot} from '../packages/demos/src/nms-l02-p043-text-v1';
const normalize=(s:string)=>s.replace(/&amp;/g,'&').replace(/&#x27;/g,"'").replace(/&quot;/g,'"').replace(/<!--.*?-->/g,'').replace(/<[^>]*>/g,'').replace(/\s+/g,' ').trim();
let cases=0,checks=0;
for(const lang of ['en','es'] as const)for(const [frameDomain,count] of Object.entries(P043_FRAME_DOMAINS)) {
  const completion=['sprite-143','sprite-171','sprite-183','sprite-204','sprite-232'].indexOf(frameDomain);
  const scenario=frameDomain==='root'||frameDomain==='sprite-250'?'source-inspection':frameDomain==='sprite-245'?'wrong-fraction-row1':frameDomain==='sprite-249'?'correct-fraction-row2':'four-matches-completion';
  for(let frame=1;frame<=count;frame++) {
    const state=p043ModuleFrame(frame,{frame,frameDomain,scenario,lang,seed:Math.max(0,completion)});
    const snap=p043TextSnapshot(state);assert.equal(snap.status,'ready');assert.deepEqual(snap.blockers,[]);
    const html=state.mainFrame===null?'':renderToStaticMarkup(<P043Presentation state={state.matching} frame={state.mainFrame} language={lang} completionDomain={state.completionDomain} interactive={false} onMatch={()=>{}} onCloseWrong={()=>{}}/>);
    const text=normalize(html);
    for(const block of snap.blocks.filter(b=>b.visible)) {
      // Accessible diagram descriptions live in aria-label rather than text nodes.
      const actual=block.id.startsWith('picture-description-')?normalize(html.replace(/<[^>]*>/g,tag=>{const m=tag.match(/aria-label="([^"]*)"/);return m?m[1]:'';})):text;
      assert.ok(actual.includes(normalize(block.text)),`${lang}/${frameDomain}/${frame}/${block.id}: ${block.text}`);checks++;
    }
    cases++;
  }
}
writeFileSync(process.argv[2],JSON.stringify({status:'PASS',cases,visibleTextChecks:checks,scope:'Server-rendered semantic text and aria descriptions for every declared source-local frame; modal showModal/focus/audio require separate actual browser evidence.'},null,2)+'\n');
writeFileSync(process.argv[3],JSON.stringify(P043_TEXT_BINDING,null,2)+'\n');
