import React from 'react';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {P050_DECIMAL_NOTATION, P050_GLOSSARY} from '../packages/demos/src/generated/nms-l02-p050-glossary-v1';
import {P050GlossaryTerms} from '../packages/demos/src/nms-l02-p050-glossary-v1';
import {P050Feedback} from '../packages/demos/src/nms-l02-p050-feedback-v1';
import {P050_TEXT} from '../packages/demos/src/nms-l02-p050-text-v1';
import {p050Initial, type P050State} from '../packages/demos/src/nms-l02-p050-practice-v1';

const ready: P050State = {...p050Initial(), phase: 'ready', solved: [1, 5], token: 4, replay: 2};
const help: P050State = {...ready, helpOpen: true};
let events = 0;
const onEvent = () => { events += 1; };

for (const language of ['en', 'es'] as const) {
 const text = P050_TEXT[language];
 const closed = renderToStaticMarkup(<P050Feedback state={ready} language={language} onEvent={onEvent}><span data-p050-child="numberline"/></P050Feedback>);
 const open = renderToStaticMarkup(<P050Feedback state={help} language={language} onEvent={onEvent}><span data-p050-child="numberline"/></P050Feedback>);
 assert.equal(closed.includes('p050-glossary-terms'), false);
 assert.equal(open.includes(text.explanation), true);
 assert.equal(open.includes(text.example), true);
 assert.equal(open.includes('data-p050-child="numberline"'), true);
 assert.equal(open.includes(language === 'es' ? 'Términos clave' : 'Key terms'), true);
 const headingId = open.match(/<h4 id="([^"]+)"/);
 assert.ok(headingId);
 assert.ok(open.includes(`aria-labelledby="${headingId[1]}"`));
 const terms = renderToStaticMarkup(<P050GlossaryTerms language={language}/>);
 assert.equal(terms.includes('<dialog'), false);
 for (const entry of P050_GLOSSARY) {
  assert.equal(open.includes('data-p050-term="' + entry.id + '"'), true);
  assert.equal(open.includes(entry.labels[language]), true);
  assert.equal(terms.includes(entry.definitions[language]), false);
 }
 assert.equal(open.includes(P050_DECIMAL_NOTATION.es), false);
 assert.equal(open.includes('migrations/'), false);
 assert.equal(open.includes('/Volumes/'), false);
}
assert.equal(events, 0);
assert.equal(P050_GLOSSARY.length, 6);
assert.equal(P050_DECIMAL_NOTATION.es.includes('0.8'), true);
console.log(JSON.stringify({status:'PASS', terms:6, languages:['en','es'], events, scope:'SSR help membership and closed glossary markup only. Nested modal, focus, Escape, and browser layout were not run.'}));
