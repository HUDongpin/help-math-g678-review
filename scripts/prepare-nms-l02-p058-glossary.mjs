#!/usr/bin/env node
/** P058 conditional identified-host L1 data; the lesson-declared L2 banks remain unresolved. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,sha256} from '../lib/g678-admission-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BANK_ROOT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const OUT='output/nms-l02-p058-glossary-20260927';
const TERMS='packages/demos/src/generated/nms-l02-p058-terms-v1.ts';
const ID='shared-nms002-l02-p058';
const SWF={path:'G6-G8-shared/NMS002/L2/TS/L2TS05.swf',bytes:113754,
 sha256:'fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIT={path:'output/nms-l02-p058-source-20260927/source-audit.json',bytes:22193,
 sha256:'de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a'};
const BANKS={en:{path:'L1KTE01.xml',bytes:345838,
 sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'},
 es:{path:'L1KTS01.xml',bytes:344456,
 sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'}};
const HOST_EVIDENCE={path:'output/nms-l02-p056-source-intake-20260927/glossary/p056-conditional-l1-host-bank.json',
 bytes:8247,sha256:'7e8aa4a172d2fd0052b968735ab6629ad3b5107ca9e60b9c6e73ac9f4d78f747'};
const KEYS=[
 ['Strategies','strategies'],['Equation','equation'],['Pattern','pattern'],
 ['Simple / Simpler / Simplest','simple-simpler-simplest'],['Table','table'],['Show','show'],
];
const BUTTONS=[
 {characterId:22,key:'Strategies',depth:23,firstPlacedFrame:103,firstPlacedAlpha256:0,firstFullyOpaqueFrame:110,lastFrameExclusive:275,removedFrames:[]},
 {characterId:27,key:'Equation',depth:30,firstPlacedFrame:139,firstPlacedAlpha256:0,firstFullyOpaqueFrame:146,lastFrameExclusive:275,removedFrames:[]},
 {characterId:28,key:'Pattern',depth:32,firstPlacedFrame:139,firstPlacedAlpha256:0,firstFullyOpaqueFrame:146,lastFrameExclusive:275,removedFrames:[]},
 {characterId:29,key:'Simple / Simpler / Simplest',depth:34,firstPlacedFrame:139,firstPlacedAlpha256:0,firstFullyOpaqueFrame:146,lastFrameExclusive:275,removedFrames:[]},
 {characterId:30,key:'Table',depth:36,firstPlacedFrame:139,firstPlacedAlpha256:0,firstFullyOpaqueFrame:146,lastFrameExclusive:275,removedFrames:[]},
 {characterId:33,key:'Show',depth:41,firstPlacedFrame:237,firstPlacedAlpha256:0,firstFullyOpaqueFrame:242,lastFrameExclusive:275,removedFrames:[]},
 {characterId:36,key:'Show',depth:45,firstPlacedFrame:242,firstPlacedAlpha256:256,firstFullyOpaqueFrame:242,lastFrameExclusive:243,removedFrames:[243]},
];
const normalize=s=>s.replaceAll('&nbsp;',' ').replaceAll('\u00a0',' ').replace(/\s+/gu,' ').trim();
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(a,b,label)=>assert.deepStrictEqual(a,b,label);

/** The identified MI host banks contain 659 openings; select only exact paired keys. */
export function extractP058Bank(xml){
 const openings=[...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>/gu)];
 assert.equal(openings.length,659,'complete identified-host bank opening inventory');
 // Three unrelated EN closing tags are mismatched. Selected rows must still be exact complete pairs.
 const rows=[...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>([\s\S]*?)<\/\1>/gu)]
  .map(match=>({match,attrs:Object.fromEntries([...match[2].matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/gu)]
   .map(attribute=>[attribute[1],attribute[2]]))}));
 return KEYS.map(([key,id])=>{
  assert.equal(openings.filter(match=>match[2].includes(`ScreenkeyTerm="${key}"`)).length,1,
   `source opening key: ${key}`);
  const matches=rows.filter(row=>row.attrs.ScreenkeyTerm===key);
  assert.equal(matches.length,1,`exact complete source key: ${key}`);
  const {match,attrs}=matches[0],labels=match[1].split('~LNG~').map(s=>s.replaceAll('~',' '));
  const definitions=match[3].split('~LNG~').map(normalize);
  assert.equal(labels.length,2);assert.equal(definitions.length,2);
  assert.equal(labels[0],key,'exact English source label');
  assert(labels.every(Boolean)&&definitions.every(Boolean),'complete bilingual text');
  const sameSpanishLabel=openings.filter(row=>row[1].split('~LNG~')[1]===match[1].split('~LNG~')[1]);
  if(key==='Show'){
   same(sameSpanishLabel.map(row=>row[2].match(/ScreenkeyTerm="([^"]+)"/u)?.[1]).sort(),
    ['Display','Show'],'Show shares Spanish label with Display');
  }else assert.equal(sameSpanishLabel.length,1,'unique Spanish host lookup label');
  assert.equal(attrs.ExFileName,key==='Simple / Simpler / Simplest'?
   'Simple_simpler_simplest.swf':`${key}.swf`,'source companion reference');
  return {id,sourceKeyAttribute:key,labels:{en:labels[0],es:labels[1]},
   definitions:{en:definitions[0],es:definitions[1]},sourceEntrySha256:sha256(Buffer.from(match[0])),
   spanishLabelCollisionWith:key==='Show'?['Display']:[],
   legacyCompanionReferences:{exampleSwf:attrs.ExFileName,subLinksEn:attrs.SubLinkEng,
    subLinksEs:attrs.SubLinkSpan}};
 });
}
function readExternal(spec){
 assert(path.isAbsolute(spec.path),'host source physical path');
 const root=path.dirname(spec.path),relative=path.basename(spec.path);
 same({...pinFile(root,relative),path:spec.path},{path:spec.path,bytes:spec.bytes,sha256:spec.sha256},
  'identified host source input');
}
export function buildP058Glossary(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 same({path:SWF.path,bytes:SWF.bytes,sha256:SWF.sha256},pinFile(SOURCE_ROOT,SWF.path),'real P058 SWF');
 const xml=readPin(SOURCE_ROOT,XML).toString();
 assert.equal([...xml.matchAll(/<Page\b[^>]*>TS\/L2TS05\.swf<\/Page>/gu)].length,1,'P058 source placement');
 for(const name of ['L2KTE01.xml','L2KTS01.xml']){
  assert(xml.includes(`HELP_KEYTERMS/KT/XML/${name}`),'lesson-declared L2 bank');
  assert(!fs.existsSync(path.join(SOURCE_ROOT,'HELP_KEYTERMS/KT/XML',name)),'declared L2 bank remains unresolved');
 }
 const audit=JSON.parse(readPin(ROOT,AUDIT));
 assert.equal(audit.kind,'nms-l02-p058-source-static-audit-v1');
 assert.equal(audit.animationId,ID);same(audit.source,SWF,'source audit SWF');
 same(audit.sourceXml,XML,'source audit lesson XML');
 assert.equal(audit.glossary.declaredL2BankFilesFoundAtExactAwsRoot,false);
 assert.equal(audit.glossary.historicalHostAssociationEstablished,false);
 assert.equal(audit.glossary.originalRuntimeLookupVerified,false);
 assert.equal(audit.glossary.duplicateShowButtonsHaveDifferentTimelineIntervals,true);
 same(audit.buttonActions.map(({actionPin,...item})=>item),
  BUTTONS.map(({key,...item})=>({sourceKeyAttribute:key,...item})),'seven source button windows');
 same(new Set(audit.uniqueGlossaryKeys),new Set(KEYS.map(([key])=>key)),'six exact authored keys');
 const actions=audit.buttonActions.map(action=>{
  const pin=action.actionPin;readPin(ROOT,pin);
  const body=readPin(ROOT,pin).toString().replaceAll('\r\n','\n');
  assert.equal(body,`on(release){\n   _global.KeyAttribute = "${action.sourceKeyAttribute}";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}\n`,
   `button ${action.characterId} authored operations`);
  const entryId=KEYS.find(([key])=>key===action.sourceKeyAttribute)?.[1];assert(entryId);
  return {id:`sprite-37/depth-${action.depth}/generation-1`,entryId,
   sourceKeyAttribute:action.sourceKeyAttribute,characterId:action.characterId,depth:action.depth,
   firstPlacedFrame:action.firstPlacedFrame,firstPlacedAlpha256:action.firstPlacedAlpha256,
   firstFullyOpaqueFrame:action.firstFullyOpaqueFrame,lastFrameExclusive:action.lastFrameExclusive,
   removedFrames:action.removedFrames,actionPin:pin};
 });
 assert.equal(actions.filter(action=>action.entryId==='show').length,2,'two distinct Show occurrences');
 const prior=JSON.parse(readPin(ROOT,HOST_EVIDENCE));
 assert.equal(prior.sourceSelection,'identified-indexMI-export-literal-L1-bank-path');
 const hostInputs={};
 for(const [oldName,auditName] of [['hostSwf','candidateSwf'],['hostFrame35','frame35'],['hostFrame50','frame50']]){
  const spec=prior.inputs[oldName],current=audit.glossary.identifiedHostSource[auditName];
  readExternal(spec);
  same({path:spec.path,bytes:spec.bytes,sha256:spec.sha256},current,`P058 audit host ${auditName}`);
  hostInputs[oldName]=spec;
 }
 const banks=Object.fromEntries(Object.entries(BANKS).map(([locale,pin])=>{
  same(audit.glossary.identifiedHostL1Banks[locale].pin,pin,`P058 audited ${locale} bank`);
  return [locale,extractP058Bank(readPin(BANK_ROOT,pin).toString())];
 }));
 const terms=banks.en.map((en,index)=>{
  const es=banks.es[index];
  for(const field of ['id','sourceKeyAttribute','labels','definitions','spanishLabelCollisionWith','legacyCompanionReferences'])
   same(en[field],es[field],`bank cross-check ${en.id}/${field}`);
  return {id:en.id,sourceKeyAttribute:en.sourceKeyAttribute,labels:en.labels,definitions:en.definitions,
   sourceEntrySha256:{en:en.sourceEntrySha256,es:es.sourceEntrySha256},
   spanishLabelCollisionWith:en.spanishLabelCollisionWith,
   source:Object.fromEntries(Object.entries(BANKS).map(([locale,pin])=>[locale,
    {assetId:`G678${pin.path}`,path:`HELP_KEYTERMS/KT/XML/${pin.path}`,sha256:pin.sha256}]))};
 });
 return {schemaVersion:1,kind:'nms-l02-p058-conditional-identified-host-l1-glossary-v1',animationId:ID,
  status:'conditional-modern-host-data-candidate',sourceSelection:prior.sourceSelection,
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  historicalSpanishLabelLookupResolved:false,modernSelectionByExactScreenkeyTerm:true,
  sourceRoot:SOURCE_ROOT,source:SWF,lessonXml:XML,sourceAudit:AUDIT,bankRoot:BANK_ROOT,banks:BANKS,
  hostSelectionEvidence:HOST_EVIDENCE,hostInputs,actions,terms,registrationEffect:false,acceptanceEffect:false};
}
export function prepareP058Glossary(check=false){
 const candidate=buildP058Glossary(),candidatePath=`${OUT}/conditional-bank.json`,candidateBytes=json(candidate);
 const disposition={status:candidate.status,sourceSelection:candidate.sourceSelection,
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  historicalSpanishLabelLookupResolved:false,modernSelectionByExactScreenkeyTerm:true,
  candidateSha256:sha256(candidateBytes)};
 const termsBytes=Buffer.from('// Generated by scripts/prepare-nms-l02-p058-glossary.mjs. Do not edit.\n'+
  '// Conditional L1 bank selection; lesson L2 banks and original lookup remain unverified.\n'+
  `export const P058_GLOSSARY_SOURCE_DISPOSITION=${JSON.stringify(disposition,null,2)} as const;\n`+
  `export const P058_SOURCE_TERMS=${JSON.stringify(candidate.terms,null,2)} as const;\n`+
  `export const P058_SOURCE_BUTTON_OCCURRENCES=${JSON.stringify(candidate.actions,null,2)} as const;\n`+
  'export type P058SourceTerm=typeof P058_SOURCE_TERMS[number];\n'+
  'export const p058SourceTerm=(id:string):P058SourceTerm|undefined=>P058_SOURCE_TERMS.find(term=>term.id===id);\n');
 const outputs=[{path:candidatePath,bytes:candidateBytes},{path:TERMS,bytes:termsBytes}];
 outputs.push({path:`${OUT}/receipt.json`,bytes:json({schemaVersion:1,kind:'p058-conditional-glossary-generation-v1',
  generator:pinFile(ROOT,path.relative(ROOT,SCRIPT)),sourceAudit:AUDIT,
  outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),registrationEffect:false,acceptanceEffect:false})});
 if(!check)for(const output of outputs)assert(!fs.existsSync(path.join(ROOT,output.path)),'new outputs only');
 for(const output of outputs){
  if(check)same(readPin(ROOT,pinFile(ROOT,output.path)),output.bytes,`generated drift ${output.path}`);
  else {fs.mkdirSync(path.dirname(path.join(ROOT,output.path)),{recursive:true});
   fs.writeFileSync(path.join(ROOT,output.path),output.bytes,{flag:'wx'});}
 }
 return {status:check?'P058_GLOSSARY_CHECKED':'P058_GLOSSARY_GENERATED',
  outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),registrationEffect:false,acceptanceEffect:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'use --write | --check');
 console.log(JSON.stringify(prepareP058Glossary(process.argv[2]==='--check')));
}
