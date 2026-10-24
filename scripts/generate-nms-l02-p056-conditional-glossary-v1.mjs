#!/usr/bin/env node
/** P056-only conditional identified-host L1 glossary data. This does not
 * recover the lesson-declared L2 banks or verify the historical host lookup. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const ID='shared-nms002-l02-p056';
const OUT='output/nms-l02-p056-source-intake-20260927/glossary';
const CANDIDATE=`${OUT}/p056-conditional-l1-host-bank.json`;
const TERMS='packages/demos/src/generated/nms-l02-p056-terms-v1.ts';
const CONTROLS='packages/demos/src/nms-l02-p056-product-controls-v1.ts';
const RECEIPT=`${OUT}/p056-conditional-glossary-receipt.json`;
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BANK_ROOT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const HOST_ROOT='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1/scripts/scripts';
const CAS_ROOT='/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1/objects/sha256';
const PINS=Object.freeze({
 swf:{path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/TS/L2TS03.swf`,bytes:100959,sha256:'a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be'},
 xml:{path:`${SOURCE_ROOT}/G6-G8-shared/NMS002/L2/index.xml`,bytes:12845,sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'},
 en:{path:`${BANK_ROOT}/L1KTE01.xml`,bytes:345838,sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b',reference:'HELP_KEYTERMS/KT/XML/L1KTE01.xml',assetId:'G678L1KTE01.xml'},
 es:{path:`${BANK_ROOT}/L1KTS01.xml`,bytes:344456,sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407',reference:'HELP_KEYTERMS/KT/XML/L1KTS01.xml',assetId:'G678L1KTS01.xml'},
 hostSwf:{path:`${CAS_ROOT}/27/275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9`,bytes:689006,sha256:'275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9',logicalPath:'NewHelpProgram/HELP_COURSES/indexMI.swf'},
 hostFrame35:{path:`${HOST_ROOT}/frame_35/DoAction.as`,bytes:104008,sha256:'380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74'},
 hostFrame50:{path:`${HOST_ROOT}/frame_50/DoAction.as`,bytes:1622,sha256:'d267b54cf74f3aae4167e8bcbc1f803df3228630869d089dee53abbd3b162483'},
 organizeAction:{path:'migrations/shared-nms002-l02-p056/audit/ffdec-26.2.1/scripts/DefineButton2_16/BUTTONCONDACTION on(release).as',bytes:123,sha256:'3c8d24c6004268559632a1b6e61b7413f050930c7c294770af72f03c630d76ff'},
 informationAction:{path:'migrations/shared-nms002-l02-p056/audit/ffdec-26.2.1/scripts/DefineButton2_17/BUTTONCONDACTION on(release).as',bytes:126,sha256:'0b1df7b90fc817c04082cc0aa91b1b7e3992aebefc6bee520774ff1471396a4f'},
 revealAudit:{path:'migrations/shared-nms002-l02-p056/audit/BUTTON_REVEAL_SOURCE_V1.md',bytes:2947,sha256:'0e01bbad2eecb5c45270626b622f194b03b67b0d7f24687fa1359162e77e3155'},
 behavior:{path:'packages/demos/src/timelines/shared-nms002-l02-p056-source-behavior.ts',bytes:5289,sha256:'211a4751a2072f88026f545a54f8880d238c294aa4300965d35268a0338624d2'},
 ts03Audit:{path:'catalog/g678-ts03-family-audit-v1.json',bytes:333425,sha256:'f707cce06d4bac82e99f1b5c6a36256b95d1a8e87dc7a83f5dd1690314fa32a1'},
 l1Recovery:{path:'catalog/g678-ts03-l1-keyterm-recovery-v1.json',bytes:24586,sha256:'bbdaeac52ba12f6de8cd5672aa3b8a50d276fc0579246155dc58b692200085ae'},
 hostBindingAudit:{path:'output/nms-l02-ts-family-20260927/glossary-dependency/HOST_KEYTERM_BINDING_AUDIT_2026-09-27.md',sha256:'24df5b094ae8444b413f1c0c9657466a466d753404b0d5a80de11974a4723b33'},
});
const KEYS=Object.freeze(['Organize','Information']);
const ENTRY_SHA=Object.freeze({
 Organize:{en:'55e57e6e4131d676da8fe0974773431ba9fe4c021e7d8ad3cd7561eee6c569e0',
  es:'01f359cb7b3f3fba673f9d725703ac10479d2ef7c6ce9dc8f20b62507df00348'},
 Information:{en:'737c4fde8c8b03a70f1cb4503c6ff363449f70d4a114e3ce1d4eef90ea0407de',
  es:'18d394d2af1aebee060ea783ce1f95977fba5d10a3ffbe1d2c8444f7023e659a'},
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const pinBytes=(p,bytes)=>({path:p,bytes:bytes.length,sha256:sha(bytes)});
function exact(spec){
 const file=path.isAbsolute(spec.path)?spec.path:path.join(ROOT,spec.path);
 assert.equal(fs.realpathSync(file),file,`physical input ${spec.path}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&before.nlink===1n,`ordinary input ${spec.path}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 assert(['dev','ino','size','mtimeNs','ctimeNs','mode'].every(k=>before[k]===after[k]),`stable input ${spec.path}`);
 assert.equal(bytes.length,spec.bytes??bytes.length,`bytes ${spec.path}`);
 assert.equal(sha(bytes),spec.sha256,`SHA ${spec.path}`);
 return bytes;
}
const normalize=value=>value.replaceAll('&nbsp;',' ').replaceAll('\u00a0',' ').replace(/\s+/gu,' ').trim();
function bankRows(xml){
 const rows=[...xml.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>/gu)].map(match=>{
  const [en,es]=match[1].split('~LNG~');
  assert(en&&es,'bilingual bank label');
  return {en:en.replaceAll('~',' ').toLowerCase(),es:es.replaceAll('~',' ').toLowerCase(),
   key:/ScreenkeyTerm="([^"]+)"/u.exec(match[2])?.[1]??null};
 });
 assert.equal(rows.length,659,'complete identified L1 bank');
 return rows;
}
function entry(xml,key){
 const re=new RegExp(`<${key}~LNG~([^\\s>]+)\\s+([^>]*)>([\\s\\S]*?)<\\/${key}~LNG~\\1>`,'gu');
 const matches=[...xml.matchAll(re)];
 assert.equal(matches.length,1,`${key} entry multiplicity`);
 const match=matches[0],attrs=Object.fromEntries([...match[2].matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/gu)]
  .map(value=>[value[1],value[2]]));
 const definitions=match[3].split('~LNG~');
 assert.equal(definitions.length,2,`${key} bilingual definitions`);
 assert.equal(attrs.ScreenkeyTerm,key,`${key} source key`);
 assert.equal(attrs.ExFileName,`${key}.swf`,`${key} companion stem`);
 return {id:key.toLowerCase(),sourceKeyAttribute:key,labels:{en:key,es:match[1]},
  definitions:{en:normalize(definitions[0]),es:normalize(definitions[1])},
  sourceEntrySha256:sha(match[0]),extractionLfNormalizedEntrySha256:sha(match[0].replaceAll('\r\n','\n')),
  legacyCompanionReferences:{subLinksEn:attrs.SubLinkEng.split('~').filter(Boolean),
   subLinksEs:attrs.SubLinkSpan.split('~').filter(Boolean),exampleSwf:attrs.ExFileName}};
}
export function extractP056Terms(enXml,esXml,prior){
 const banks={en:enXml,es:esXml},rows={en:bankRows(enXml),es:bankRows(esXml)};
 return KEYS.map(key=>{
  const versions=Object.fromEntries(Object.entries(banks).map(([locale,xml])=>{
   const selected=entry(xml,key);
   assert.equal(rows[locale].filter(row=>row.key===key).length,1,`${locale} ${key} exact source key`);
   assert.equal(rows[locale].filter(row=>row.en===selected.labels.en.toLowerCase()).length,1,
    `${locale} ${key} English host label`);
   assert.equal(rows[locale].filter(row=>row.es===selected.labels.es.toLowerCase()).length,1,
    `${locale} ${key} Spanish host label`);
   return [locale,selected];
  }));
  for(const field of ['id','sourceKeyAttribute','labels','definitions','legacyCompanionReferences'])
   assert.deepStrictEqual(versions.en[field],versions.es[field],`${key} bank cross-check ${field}`);
  const expected=prior.terms.find(term=>term.sourceKeyAttribute===key);
  assert(expected,`${key} TS03 recovery cross-check`);
  for(const field of ['id','labels','definitions','legacyCompanionReferences'])
   assert.deepStrictEqual(versions.en[field],expected[field],`${key} prior ${field}`);
  assert.deepStrictEqual({en:versions.en.sourceEntrySha256,es:versions.es.sourceEntrySha256},
   expected.sourceEntrySha256,`${key} raw source entry SHA`);
  return {id:versions.en.id,sourceKeyAttribute:key,labels:versions.en.labels,
   definitions:versions.en.definitions,
   source:{en:{assetId:PINS.en.assetId,path:PINS.en.reference,sha256:PINS.en.sha256},
    es:{assetId:PINS.es.assetId,path:PINS.es.reference,sha256:PINS.es.sha256}},
   sourceEntrySha256:{en:versions.en.sourceEntrySha256,es:versions.es.sourceEntrySha256},
   extractionLfNormalizedEntrySha256:{en:versions.en.extractionLfNormalizedEntrySha256,
    es:versions.es.extractionLfNormalizedEntrySha256}};
 });
}
const CONTROLS_DATA={animationId:ID,sourceSha256:PINS.swf.sha256,frameDomain:'sprite-24',frameCount:234,
 controls:[
  {id:'sprite-24/depth-16/generation-1',entryId:'organize',sourceKeyAttribute:'Organize',characterId:16,firstFrame:17,lastFrameExclusive:235,label:'Organize'},
  {id:'sprite-24/depth-18/generation-1',entryId:'information',sourceKeyAttribute:'Information',characterId:17,firstFrame:17,lastFrameExclusive:235,label:'information'},
 ]};
const POLICY={sourceFirstPlacedFrame:9,sourceFirstFullyOpaqueFrame:17,modernInteractiveFirstFrame:17,
 lastFrameExclusive:235,decision:'modern-controls-available-only-at-full-source-opacity',
 historicalHitTestingVerified:false,originalHostLookupVerified:false};
export function projectP056Glossary(candidate){
 assert.equal(candidate?.schemaVersion,1);
 assert.equal(candidate.kind,'nms-l02-p056-conditional-identified-host-l1-glossary-v1');
 assert.equal(candidate.animationId,ID);
 assert.equal(candidate.status,'conditional-modern-host-data-candidate');
 assert.equal(candidate.sourceSelection,'identified-indexMI-export-literal-L1-bank-path');
 assert.deepStrictEqual(candidate.inputs,PINS);
 for(const key of ['originalL2XmlResolved','historicalHostAssociationEstablished','originalRuntimeLookupVerified'])
  assert.equal(candidate[key],false,key);
 assert.deepStrictEqual(candidate.lessonXmlDeclaredBanks,{en:'HELP_KEYTERMS/KT/XML/L2KTE01.xml',
  es:'HELP_KEYTERMS/KT/XML/L2KTS01.xml',recovered:false});
 assert.deepStrictEqual(candidate.controls,CONTROLS_DATA,'P056 source-depth controls');
 assert.deepStrictEqual(candidate.controlPolicy,POLICY,'source placement and modern interaction policy');
 assert.deepStrictEqual(candidate.terms.map(term=>term.sourceKeyAttribute),KEYS);
 for(const [index,term] of candidate.terms.entries()){
  assert.equal(term.id,KEYS[index].toLowerCase(),`${KEYS[index]} lookup id`);
  assert.deepStrictEqual(term.source,{en:{assetId:PINS.en.assetId,path:PINS.en.reference,sha256:PINS.en.sha256},
   es:{assetId:PINS.es.assetId,path:PINS.es.reference,sha256:PINS.es.sha256}});
  assert.deepStrictEqual(term.sourceEntrySha256,ENTRY_SHA[KEYS[index]],`${KEYS[index]} raw bank entry`);
  assert.equal(term.labels.en,KEYS[index],`${KEYS[index]} English label`);
  assert(term.labels.es&&term.definitions.en&&term.definitions.es,`${KEYS[index]} bilingual content`);
 }
 return {terms:candidate.terms,controls:candidate.controls,controlPolicy:candidate.controlPolicy,
  disposition:{status:candidate.status,sourceSelection:candidate.sourceSelection,
   originalL2XmlResolved:false,historicalHostAssociationEstablished:false,
   originalRuntimeLookupVerified:false}};
}
export function buildP056ConditionalGlossary(){
 const inputs=Object.fromEntries(Object.entries(PINS).map(([name,spec])=>[name,exact(spec)]));
 const xml=inputs.xml.toString('utf8');
 assert.match(xml,/<English>HELP_KEYTERMS\/KT\/XML\/L2KTE01\.xml<\/English>/u);
 assert.match(xml,/<Spanish>HELP_KEYTERMS\/KT\/XML\/L2KTS01\.xml<\/Spanish>/u);
 assert.equal([...xml.matchAll(/<Page\b[^>]*>TS\/L2TS03\.swf<\/Page>/gu)].length,1,'one active P056 XML page');
 const host35=inputs.hostFrame35.toString('utf8'),host50=inputs.hostFrame50.toString('utf8');
 assert.match(host35,/function doInitKeyTerms\(\)[\s\S]*?KeyTermVar = _loc2_\.xmlPath \+ "XML\/L1KTE01\.xml";/u);
 assert.match(host35,/KeyTermVar = _loc2_\.xmlPath \+ "XML\/L1KTS01\.xml";/u);
 assert.match(host35,/KeyAttribute \+= "~English";/u);
 assert.match(host50,/_root\.doInitKeyTerms\(\);/u);
 for(const [name,key] of [['organizeAction','Organize'],['informationAction','Information']]){
  const script=inputs[name].toString('utf8');
  assert.match(script,new RegExp(`_global\\.KeyAttribute = "${key}";`,'u'));
  assert.match(script,/_root\.DoHyperLinks\(\);[\s\S]*_root\.animation_mc\.animation\.stop\(\);/u);
 }
 const audit=JSON.parse(inputs.ts03Audit),record=audit.records.find(item=>item.sourceSha256===PINS.swf.sha256);
 assert(record?.placements.some(item=>item.animationId===ID),'TS03 source placement');
 assert.equal(record.structure.mainFrameDomain,'sprite-24');
 assert.equal(record.structure.mainFrameCount,234);
 assert.deepStrictEqual(record.structure.buttonCharacterIds,[16,17]);
 assert.equal(record.structure.buttonFirstFrame,9);
 assert.equal(record.generationAuthorized,false);
 const recovery=JSON.parse(inputs.l1Recovery);
 assert(recovery.eligibility.blocked.some(item=>item.animationId===ID),'lesson L2 source remains blocked in L1 family audit');
 const terms=extractP056Terms(inputs.en.toString('utf8'),inputs.es.toString('utf8'),recovery);
 const candidate={schemaVersion:1,kind:'nms-l02-p056-conditional-identified-host-l1-glossary-v1',
  animationId:ID,status:'conditional-modern-host-data-candidate',
  sourceSelection:'identified-indexMI-export-literal-L1-bank-path',
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,
  originalRuntimeLookupVerified:false,sourceAudioOrVisualAcceptance:false,
  lessonXmlDeclaredBanks:{en:'HELP_KEYTERMS/KT/XML/L2KTE01.xml',
   es:'HELP_KEYTERMS/KT/XML/L2KTS01.xml',recovered:false},
  inputs:PINS,terms,controls:CONTROLS_DATA,controlPolicy:POLICY,
  limits:['Identified host static L1-bank path only; lesson L2 banks remain unrecovered.',
   'Full opacity at frame 17 is a modern interaction decision, not historical hit-test proof.',
   'No original lookup, source-audio selection, Current-JS registration, fidelity, human or Owner acceptance, strict completion, or publication.']};
 projectP056Glossary(candidate);
 return candidate;
}
export function renderP056GlossaryProducts(candidate){
 const projection=projectP056Glossary(candidate),candidateBytes=json(candidate),candidatePin=pinBytes(CANDIDATE,candidateBytes);
 const disposition={...projection.disposition,candidateSha256:candidatePin.sha256};
 const termsBytes=Buffer.from('// Generated by scripts/generate-nms-l02-p056-conditional-glossary-v1.mjs. Do not edit.\n'+
  '// Conditional identified-host L1 data; the lesson L2 banks and original lookup remain unresolved.\n'+
  `export const P056_GLOSSARY_SOURCE_DISPOSITION = ${JSON.stringify(disposition,null,2)} as const;\n`+
  `export const P056_SOURCE_TERMS = ${JSON.stringify(projection.terms,null,2)} as const;\n`+
  'export type P056SourceTerm = typeof P056_SOURCE_TERMS[number];\n'+
  'export function p056SourceTerm(id: string): P056SourceTerm | undefined {\n'+
  '  return P056_SOURCE_TERMS.find(term => term.id === id);\n}\n');
 const controlBytes=Buffer.from('// Generated by scripts/generate-nms-l02-p056-conditional-glossary-v1.mjs. Do not edit.\n'+
  '// Source buttons place at frame 9; modern controls enable at full opacity on frame 17.\n'+
  "import type {SourceGlossaryControlPage} from './source-glossary-controls';\n"+
  `export const P056_CONTROL_POLICY = ${JSON.stringify(projection.controlPolicy,null,2)} as const;\n`+
  `export const P056_CONTROLS: SourceGlossaryControlPage = ${JSON.stringify(projection.controls,null,2)};\n`);
 return {candidateBytes,termsBytes,controlBytes,candidatePin,
  termsPin:pinBytes(TERMS,termsBytes),controlsPin:pinBytes(CONTROLS,controlBytes)};
}
export function generateP056ConditionalGlossary({check=false}={}){
 const candidate=buildP056ConditionalGlossary();
 const rendered=renderP056GlossaryProducts(candidate);
 const self=fs.readFileSync(SCRIPT);
 const receipt={schemaVersion:1,kind:'nms-l02-p056-conditional-glossary-product-receipt-v1',
  animationId:ID,status:'conditional-modern-host-data-candidate',
  generator:pinBytes(path.relative(ROOT,SCRIPT),self),
  candidate:rendered.candidatePin,terms:rendered.termsPin,controls:rendered.controlsPin,
  sourceFirstPlacedFrame:9,modernInteractiveFirstFrame:17,
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  registrationEffect:false,acceptanceEffect:false};
 const outputs=[{path:CANDIDATE,bytes:rendered.candidateBytes},
  {path:TERMS,bytes:rendered.termsBytes},{path:CONTROLS,bytes:rendered.controlBytes},
  {path:RECEIPT,bytes:json(receipt)}];
 if(!check)for(const output of outputs)
  assert(!fs.existsSync(path.join(ROOT,output.path)),`${output.path} already exists; use --check`);
 for(const output of outputs){
  const target=path.join(ROOT,output.path);
  if(check)assert.deepStrictEqual(fs.readFileSync(target),output.bytes,`${output.path} generated drift`);
  else {fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,output.bytes,{flag:'wx'});}
 }
 return {checked:check,outputs:outputs.map(output=>pinBytes(output.path,output.bytes)),
  status:candidate.status,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--prepare','--check'].includes(process.argv[2]),
   'usage: generate-nms-l02-p056-conditional-glossary-v1.mjs --prepare|--check');
  process.stdout.write(`${JSON.stringify(generateP056ConditionalGlossary({check:process.argv[2]==='--check'}))}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
