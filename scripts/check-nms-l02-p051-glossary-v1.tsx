import assert from 'node:assert/strict';
import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {P051_GLOSSARY} from '../packages/demos/src/generated/nms-l02-p051-glossary-v1';
import {P051Glossary,P051_GLOSSARY_SCOPES} from '../packages/demos/src/nms-l02-p051-glossary-v1';
assert.equal(P051_GLOSSARY.length,4);
for(const language of ['en','es'] as const)for(const scope of ['main','wrong'] as const){
 const html=renderToStaticMarkup(<P051Glossary language={language} scope={scope} onOpen={()=>{throw Error('SSR_OPEN')}} onClose={()=>{throw Error('SSR_CLOSE')}}/>);
 assert.equal((html.match(/aria-haspopup="dialog"/g)||[]).length,2);
 for(const id of P051_GLOSSARY_SCOPES[scope])assert.ok(html.includes(P051_GLOSSARY.find(x=>x.id===id)!.labels[language]));
 assert.ok(!html.includes('<dialog'));assert.ok(!html.includes('See Equivalent'));
 const hidden=renderToStaticMarkup(<P051Glossary language={language} scope={scope} visibleIds={[]} onOpen={()=>{}} onClose={()=>{}}/>);assert.ok(!hidden.includes('<button'));
 const disabled=renderToStaticMarkup(<P051Glossary language={language} scope={scope} disabled onOpen={()=>{}} onClose={()=>{}}/>);assert.equal((disabled.match(/disabled=""/g)||[]).length,2);
}
assert.ok(P051_GLOSSARY.find(x=>x.id==='equivalent-decimal')!.definitions.en.includes('½'));
assert.ok(P051_GLOSSARY.find(x=>x.id==='equivalent-decimal')!.definitions.es.includes('0,5'));
console.log('PASS: four bilingual scope renderings, visibility/disabled contracts, source half entity and comma preserved. Browser modal lifecycle not tested here.');
