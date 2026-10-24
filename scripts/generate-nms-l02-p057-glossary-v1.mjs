#!/usr/bin/env node
/** Conditional identified-host L1 data. The lesson-declared L2 banks remain unresolved. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,sha256} from '../lib/g678-admission-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BANK_ROOT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const OUT='output/nms-l02-p057-glossary-20260927';
const TERMS='packages/demos/src/generated/nms-l02-p057-terms-v1.ts';
const ID='shared-nms002-l02-p057';
const SWF={path:'G6-G8-shared/NMS002/L2/TS/L2TS04.swf',bytes:137055,sha256:'9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const BANKS={en:{path:'L1KTE01.xml',bytes:345838,sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'},
 es:{path:'L1KTS01.xml',bytes:344456,sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'}};
const BUTTONS=[
 [17,'Solve','solve','f76c13ce6f90e077f716580e1f8349b40adcf7e54959e5a380af1c619bdd5be8'],
 [18,'Problem','problem','0e7c1b6fc97a014da68ee2763e0ec61e72034709c5d9579d0d4cdfec2ef245e4'],
 [25,'Strategies','strategies','eaef840530fbeb0b311d1fb387523713acd1995fbb89f56dc989f87fe8a5d723'],
 [60,'Equation','equation','0b89848d79d735127115901984f60c2c8c2996f9561d150573068e496601ed4b'],
 [61,'Pattern','pattern','3439addefa5360b32ee5f1b6e103a76b12db1f1681a3584ac3dff4ed482355db'],
 [62,'Table','table','ebe5121cf5eee9349a2921629ad89ffa40819e4e6ee707d9bea8a07142282dbd'],
 [63,'Simple / Simpler / Simplest','simple-simpler-simplest','97018ac8502cfcf22006ea74db1fc42dfe334964dd810b5b30785c1361ff0476'],
];
const normalize=s=>s.replaceAll('&nbsp;',' ').replaceAll('\u00a0',' ').replace(/\s+/gu,' ').trim();
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});

/** Select by the exact authored ScreenkeyTerm, not an invented XML tag or filename. */
export function extractP057Bank(xml){
 const openings=[...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>/gu)];
 assert.equal(openings.length,659,'complete identified-host bank opening inventory');
 // The EN bank has three unrelated mismatched closing tags. Require complete
 // exact opening/closing pairs for every selected key; never repair the source.
 const rows=[...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>([\s\S]*?)<\/\1>/gu)]
  .map(match=>({match,attrs:Object.fromEntries([...match[2].matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/gu)]
   .map(attribute=>[attribute[1],attribute[2]]))}));
 return BUTTONS.map(([,key,id])=>{
  assert.equal(openings.filter(match=>match[2].includes(`ScreenkeyTerm="${key}"`)).length,1,`source opening key: ${key}`);
  const matches=rows.filter(row=>row.attrs.ScreenkeyTerm===key);
  assert.equal(matches.length,1,`exact source key multiplicity: ${key}`);
  const {match,attrs}=matches[0],labels=match[1].split('~LNG~').map(s=>s.replaceAll('~',' '));
  const definitions=match[3].split('~LNG~').map(normalize);
  assert.equal(labels.length,2);assert.equal(definitions.length,2);
  assert.equal(labels[0],key,'source English label');
  assert(definitions.every(Boolean)&&labels.every(Boolean),'complete bilingual text');
  assert.equal(openings.filter(row=>row[1].split('~LNG~')[1]===match[1].split('~LNG~')[1]).length,1,'Spanish host lookup label');
  assert.equal(attrs.ExFileName,key==='Simple / Simpler / Simplest'?'Simple_simpler_simplest.swf':`${key}.swf`);
  return {id,sourceKeyAttribute:key,labels:{en:labels[0],es:labels[1]},
   definitions:{en:definitions[0],es:definitions[1]},sourceEntrySha256:sha256(Buffer.from(match[0])),
   legacyCompanionReferences:{exampleSwf:attrs.ExFileName,subLinksEn:attrs.SubLinkEng,subLinksEs:attrs.SubLinkSpan}};
 });
}
export function buildP057Glossary(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 readPin(SOURCE_ROOT,SWF);
 const xml=readPin(SOURCE_ROOT,XML).toString();
 assert.equal([...xml.matchAll(/<Page\b[^>]*>TS\/L2TS04\.swf<\/Page>/gu)].length,1);
 for(const name of ['L2KTE01.xml','L2KTS01.xml'])assert(xml.includes(`HELP_KEYTERMS/KT/XML/${name}`));
 // Reuse the frozen host-selection evidence, while rechecking each physical host input.
 const priorPath='output/nms-l02-p056-source-intake-20260927/glossary/p056-conditional-l1-host-bank.json';
 const priorPin=pinFile(ROOT,priorPath),prior=JSON.parse(readPin(ROOT,priorPin));
 assert.equal(priorPin.sha256,'7e8aa4a172d2fd0052b968735ab6629ad3b5107ca9e60b9c6e73ac9f4d78f747');
 assert.equal(prior.sourceSelection,'identified-indexMI-export-literal-L1-bank-path');
 const hostInputs={};
 for(const name of ['hostSwf','hostFrame35','hostFrame50']){
  const spec=prior.inputs[name];readPin(path.dirname(spec.path),{...spec,path:path.basename(spec.path)});hostInputs[name]=spec;
 }
 const actions=BUTTONS.map(([characterId,key,,hash])=>{
  const relative=`output/nms-l02-p057-source-20260927/extraction/ffdec/scripts/DefineButton2_${characterId}/BUTTONCONDACTION on(release).as`;
  const pin=pinFile(ROOT,relative);assert.equal(pin.sha256,hash);
  const action=readPin(ROOT,pin).toString().replaceAll('\r\n','\n');
  assert.equal(action,`on(release){\n   _global.KeyAttribute = "${key}";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}\n`);
  return {characterId,key,pin};
 });
 const banks=Object.fromEntries(Object.entries(BANKS).map(([locale,pin])=>[locale,extractP057Bank(readPin(BANK_ROOT,pin).toString())]));
 const terms=banks.en.map((en,index)=>{
  const es=banks.es[index];
  for(const field of ['id','sourceKeyAttribute','labels','definitions','legacyCompanionReferences'])
   assert.deepEqual(en[field],es[field],`bank cross-check ${en.id}/${field}`);
  return {id:en.id,sourceKeyAttribute:en.sourceKeyAttribute,labels:en.labels,definitions:en.definitions,
   sourceEntrySha256:{en:en.sourceEntrySha256,es:es.sourceEntrySha256},
   source:Object.fromEntries(Object.entries(BANKS).map(([locale,pin])=>[locale,
    {assetId:`G678${pin.path}`,path:`HELP_KEYTERMS/KT/XML/${pin.path}`,sha256:pin.sha256}]))};
 });
 return {schemaVersion:1,kind:'nms-l02-p057-conditional-identified-host-l1-glossary-v1',animationId:ID,
  status:'conditional-modern-host-data-candidate',sourceSelection:prior.sourceSelection,
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  sourceRoot:SOURCE_ROOT,source:SWF,lessonXml:XML,bankRoot:BANK_ROOT,banks:BANKS,hostSelectionEvidence:priorPin,
  hostInputs,actions,terms,registrationEffect:false,acceptanceEffect:false};
}
export function generateP057Glossary(check=false){
 const candidate=buildP057Glossary(),candidatePath=`${OUT}/conditional-bank.json`,candidateBytes=json(candidate);
 const disposition={status:candidate.status,sourceSelection:candidate.sourceSelection,
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  candidateSha256:sha256(candidateBytes)};
 const termsBytes=Buffer.from('// Generated by scripts/generate-nms-l02-p057-glossary-v1.mjs. Do not edit.\n'+
  '// Conditional L1 bank selection; lesson L2 banks and original lookup remain unverified.\n'+
  `export const P057_GLOSSARY_SOURCE_DISPOSITION=${JSON.stringify(disposition,null,2)} as const;\n`+
  `export const P057_SOURCE_TERMS=${JSON.stringify(candidate.terms,null,2)} as const;\n`+
  'export type P057SourceTerm=typeof P057_SOURCE_TERMS[number];\n'+
  'export const p057SourceTerm=(id:string):P057SourceTerm|undefined=>P057_SOURCE_TERMS.find(term=>term.id===id);\n');
 const outputs=[{path:candidatePath,bytes:candidateBytes},{path:TERMS,bytes:termsBytes}];
 outputs.push({path:`${OUT}/receipt.json`,bytes:json({schemaVersion:1,kind:'p057-conditional-glossary-generation-v1',
  generator:pinFile(ROOT,path.relative(ROOT,SCRIPT)),outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),
  registrationEffect:false,acceptanceEffect:false})});
 if(!check)for(const output of outputs)assert(!fs.existsSync(path.join(ROOT,output.path)),'new outputs only');
 for(const output of outputs){
  if(check)assert.deepEqual(readPin(ROOT,pinFile(ROOT,output.path)),output.bytes,`generated drift ${output.path}`);
  else {fs.mkdirSync(path.dirname(path.join(ROOT,output.path)),{recursive:true});fs.writeFileSync(path.join(ROOT,output.path),output.bytes,{flag:'wx'});}
 }
 return {status:check?'P057_GLOSSARY_CHECKED':'P057_GLOSSARY_GENERATED',outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),registrationEffect:false,acceptanceEffect:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'use --write | --check');
 console.log(JSON.stringify(generateP057Glossary(process.argv[2]==='--check')));
}
