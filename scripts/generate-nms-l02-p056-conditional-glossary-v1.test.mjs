import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {
 buildP056ConditionalGlossary,
 extractP056Terms,
 generateP056ConditionalGlossary,
 projectP056Glossary,
 renderP056GlossaryProducts,
} from './generate-nms-l02-p056-conditional-glossary-v1.mjs';

const candidate=buildP056ConditionalGlossary();

test('binds exact P056 keys to conditional identified-host L1 data',()=>{
 const projected=projectP056Glossary(candidate);
 assert.deepEqual(projected.terms.map(term=>term.id),['organize','information']);
 assert.deepEqual(projected.terms.map(term=>term.labels.es),['Organizar','Información']);
 assert.equal(projected.terms[0].definitions.en,'To organize means to put into order; to arrange in a desired pattern.');
 assert.equal(projected.terms[1].definitions.es,'Colección de datos o hechos. Por ejemplo: José tiene 15 años. José tiene un teléfono celular.');
 assert.equal(projected.disposition.originalL2XmlResolved,false);
 assert.equal(projected.disposition.historicalHostAssociationEstablished,false);
 assert.equal(projected.disposition.originalRuntimeLookupVerified,false);
 assert.deepEqual(candidate.lessonXmlDeclaredBanks,{
  en:'HELP_KEYTERMS/KT/XML/L2KTE01.xml',es:'HELP_KEYTERMS/KT/XML/L2KTS01.xml',recovered:false,
 });
});

test('source placement and modern interaction availability remain distinct',()=>{
 const projected=projectP056Glossary(candidate);
 assert.deepEqual(projected.controls.controls.map(control=>({
  id:control.id,entryId:control.entryId,sourceKeyAttribute:control.sourceKeyAttribute,
  characterId:control.characterId,firstFrame:control.firstFrame,lastFrameExclusive:control.lastFrameExclusive,
 })),[
  {id:'sprite-24/depth-16/generation-1',entryId:'organize',sourceKeyAttribute:'Organize',characterId:16,firstFrame:17,lastFrameExclusive:235},
  {id:'sprite-24/depth-18/generation-1',entryId:'information',sourceKeyAttribute:'Information',characterId:17,firstFrame:17,lastFrameExclusive:235},
 ]);
 assert.equal(projected.controlPolicy.sourceFirstPlacedFrame,9);
 assert.equal(projected.controlPolicy.sourceFirstFullyOpaqueFrame,17);
 assert.equal(projected.controlPolicy.modernInteractiveFirstFrame,17);
 assert.equal(projected.controlPolicy.historicalHitTestingVerified,false);
});

test('rejects source bank drift, ambiguous entries, and promotion claims',()=>{
 const en=readFileSync(candidate.inputs.en.path,'utf8');
 const es=readFileSync(candidate.inputs.es.path,'utf8');
 const prior=JSON.parse(readFileSync(new URL(`../${candidate.inputs.l1Recovery.path}`,import.meta.url),'utf8'));
 assert.deepEqual(extractP056Terms(en,es,prior).map(term=>term.id),['organize','information']);
 assert.throws(()=>extractP056Terms(en.replace('To organize&nbsp;means','To reorganize&nbsp;means'),es,prior),/cross-check/);
 assert.throws(()=>extractP056Terms(en.replace('</Organize~LNG~Organizar>','</Organize~LNG~Organizar><Organize~LNG~Organizar ScreenkeyTerm="Organize" ExFileName="Organize.swf"></Organize~LNG~Organizar>'),es,prior),/complete identified L1 bank|multiplicity/);
 assert.throws(()=>projectP056Glossary({...candidate,originalL2XmlResolved:true}),/originalL2XmlResolved/);
 const wrongEntry=structuredClone(candidate);
 wrongEntry.terms[0].sourceEntrySha256.en='0'.repeat(64);
 assert.throws(()=>projectP056Glossary(wrongEntry),/raw bank entry/);
 const wrongControl=structuredClone(candidate);
 wrongControl.controls.controls[0].firstFrame=9;
 assert.throws(()=>projectP056Glossary(wrongControl),/source-depth controls/);
});

test('generated products are deterministic and check-only is read-only',()=>{
 const rendered=renderP056GlossaryProducts(candidate);
 const checked=generateP056ConditionalGlossary({check:true});
 assert.equal(checked.checked,true);
 for(const pin of checked.outputs){
  const actual=readFileSync(new URL(`../${pin.path}`,import.meta.url));
  assert.equal(actual.length,pin.bytes);
  const key=pin.path.endsWith('/p056-conditional-l1-host-bank.json')?'candidateBytes':
   pin.path.endsWith('/nms-l02-p056-terms-v1.ts')?'termsBytes':
   pin.path.endsWith('/nms-l02-p056-product-controls-v1.ts')?'controlBytes':null;
  if(key)assert.deepEqual(actual,rendered[key]);
 }
 assert.throws(()=>generateP056ConditionalGlossary(),/already exists/);
});
