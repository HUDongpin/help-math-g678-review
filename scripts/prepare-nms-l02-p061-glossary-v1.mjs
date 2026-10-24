#!/usr/bin/env node
/** P061 glossary from exact page actions and a conditional, identified MI host bank. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,sha256} from '../lib/g678-admission-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const BANK_ROOT='/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI';
const OUT='output/nms-l02-p061-glossary-20260927';
const TERMS='packages/demos/src/generated/nms-l02-p061-terms-v1.ts';
const ID='shared-nms002-l02-p061';
const SWF={path:'G6-G8-shared/NMS002/L2/TS/L2TS08.swf',bytes:585741,
 sha256:'4712cc077841cc0d16ea63c0c10827b933a0904a80eef010ec8f04eed5ffa50a'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIT={path:'output/nms-l02-p061-source-20260927/source-audit.json',bytes:197114,
 sha256:'1fa1927e77f31138e9608d4acaab2dc66fba170022326211e5f4c159c95ae859'};
const SOURCE_XML={path:'output/nms-l02-p061-source-20260927/extraction/swfmill.xml',bytes:7956891,
 sha256:'47dc12c2058196b3c77efeadbe63a1b637444eaf76b492ee9f6a9b3f684f9ba0'};
const HOST_AUDIT={path:'output/nms-l02-p060-host-contract-20260927/host-contract-audit.json',bytes:9573,
 sha256:'dac05d6a35be8087a2162b5e94c812fd4c172f4f60d24d8d40e4b2c2be12ea32'};
const BANKS={en:{path:'L1KTE01.xml',bytes:345838,
 sha256:'14d454f4c1c1a6f0939fb80b454fd3e22890eabb4a730c6bfa7efa1d9a2e5e5b'},
 es:{path:'L1KTS01.xml',bytes:344456,
 sha256:'3b437b42e75536fa8b4f110325e366c27fbe10a871439d4797650cda4238b407'}};
const KEYS=[
 {characterId:96,key:'Equivalent decimal',id:'equivalent-decimal'},
 {characterId:303,key:'Express',id:'express'},
 {characterId:304,key:'Denominator',id:'denominator'},
 {characterId:305,key:'Percent',id:'percent'},
 {characterId:306,key:'Equivalent fraction',id:'equivalent-fraction'},
 {characterId:307,key:'Decimal fraction',id:'decimal-fraction'},
];
const same=(actual,expected,label)=>assert.deepStrictEqual(actual,expected,label);
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});

function absolutePin(spec){
 assert(path.isAbsolute(spec.path),'physical host path required');
 const stat=fs.lstatSync(spec.path);
 assert(stat.isFile()&&!stat.isSymbolicLink(),'physical host source must be an ordinary file');
 assert.equal(fs.realpathSync(spec.path),spec.path,'physical host source real path');
 const current={...pinFile(path.dirname(spec.path),path.basename(spec.path)),path:spec.path};
 same(current,spec,'physical host source byte identity');
}

const decodeEntities=text=>text.replace(/&(?:#(x[0-9a-f]+|[0-9]+)|(nbsp|quot|amp|apos|lt|gt));/giu,
 (_,numeric,name)=>{
  if(name)return ({nbsp:' ',quot:'"',amp:'&',apos:"'",lt:'<',gt:'>'})[name.toLowerCase()];
  const point=numeric[0].toLowerCase()==='x'?Number.parseInt(numeric.slice(1),16):Number(numeric);
  assert(Number.isInteger(point)&&point>0&&point<=0x10ffff&&!(point>=0xd800&&point<=0xdfff),
   'valid bank character entity');
  return String.fromCodePoint(point);
 });
function plain(text){
 const decoded=decodeEntities(text).replaceAll('\u00a0',' ');
 assert(!/&(?:[A-Za-z]+|#[xX]?[0-9a-fA-F]+);/u.test(decoded),'unknown selected entry entity');
 return decoded.replace(/\s+/gu,' ').trim();
}
const labelParts=tag=>{
 const parts=tag.split('~LNG~');assert.equal(parts.length,2,'bilingual entry label');
 return {en:parts[0].replaceAll('~',' '),es:parts[1].replaceAll('~',' ')};
};

/** The MI bank is not well-formed XML globally; require complete selected rows. */
export function extractP061Bank(bankText){
 const openings=[...bankText.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>/gu)];
 assert.equal(openings.length,659,'complete identified MI bank opening inventory');
 const complete=[...bankText.matchAll(/<([A-Za-z][^<>\s]*~LNG~[^<>\s]+)\s+([^<>]*)>([\s\S]*?)<\/\1>/gu)];
 return KEYS.map(({key,id})=>{
  const englishMatches=opening=>labelParts(opening[1]).en.toLowerCase()===key.toLowerCase();
  const opened=openings.filter(englishMatches);
  assert.equal(opened.length,1,`unique parsed English opening label: ${key}`);
  const selected=complete.filter(englishMatches);
  assert.equal(selected.length,1,`exact complete parsed English label: ${key}`);
  const match=selected[0],labels=labelParts(match[1]);
  const spanishMatches=openings.filter(opening=>
   labelParts(opening[1]).es.toLowerCase()===labels.es.toLowerCase());
  assert(spanishMatches.length>=1,`parsed Spanish label present: ${key}`);
  const attrs=Object.fromEntries([...match[2].matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/gu)]
   .map(attribute=>[attribute[1],attribute[2]]));
  const definitions=match[3].split('~LNG~').map(plain);
  assert.equal(definitions.length,2,`bilingual definition: ${key}`);
  assert(labels.en&&labels.es&&definitions.every(Boolean),`nonempty bilingual entry: ${key}`);
  assert.equal(attrs.ScreenkeyTerm,{
   'Equivalent decimal':'Equivalent Decimal',
   'Equivalent fraction':'Equivalent Fraction',
   'Decimal fraction':'Decimal Fraction',
  }[key]??key,
   `ScreenkeyTerm is recorded, not used as the host lookup key: ${key}`);
  assert(attrs.ExFileName,'companion source reference');
  return {id,sourceKeyAttribute:key,hostLookupLabel:labels.en,
   hostLookupNormalization:'parsed-English-label.toLowerCase()',
   spanishLabelOpeningCount:spanishMatches.length,
   screenkeyTermAttribute:attrs.ScreenkeyTerm,labels,
   definitions:{en:definitions[0],es:definitions[1]},
   rawEntry:{bytes:Buffer.byteLength(match[0]),sha256:sha256(Buffer.from(match[0]))},
   legacyCompanionReferences:{exampleSwf:attrs.ExFileName,subLinksEn:attrs.SubLinkEng,
    subLinksEs:attrs.SubLinkSpan}};
 });
}

/** Source display-list placement, not proof of alpha, hit-testing or original runtime. */
export function extractP061Occurrences(sourceXml){
 const wanted=new Map(KEYS.map(row=>[row.characterId,row]));
 const occurrences=[];
 for(const [spriteId,frames,parentCondition] of [
  [111,21,'main-700-Mc_box1-revealed'],
  [314,1,'main-860-hint-popup-visible'],
  [315,882,'main-source-placement'],
 ]){
  const body=sourceXml.match(new RegExp(`<DefineSprite objectID="${spriteId}" frames="${frames}">([\\s\\S]*?)<\\/DefineSprite>`,'u'))?.[1];
  assert(body,`pinned source sprite ${spriteId}`);
  const active=new Map();let frame=1;
  for(const token of body.matchAll(/<(ShowFrame|PlaceObject2|RemoveObject2)\b([^>]*)>/gu)){
   const [,tag,attributes]=token,depth=Number(attributes.match(/\bdepth="(\d+)"/u)?.[1]);
   if(tag==='ShowFrame'){frame++;continue;}
   assert(Number.isInteger(depth),`display depth in sprite ${spriteId}`);
   if(tag==='PlaceObject2'){
    const objectId=Number(attributes.match(/\bobjectID="(\d+)"/u)?.[1]);
    if(!Number.isInteger(objectId))continue; // transform-only update
    const previous=active.get(depth);
    if(previous?.wanted){previous.occurrence.lastFrameExclusive=frame;previous.occurrence.exit='replaced';}
    const row=wanted.get(objectId);
    const occurrence={id:`sprite-${spriteId}/depth-${depth}/generation-${occurrences.filter(x=>x.spriteId===spriteId&&x.depth===depth).length+1}`,
     spriteId,depth,characterId:objectId,entryId:row?.id??null,
     sourceKeyAttribute:row?.key??null,firstPlacedFrame:frame,
     lastFrameExclusive:null,exit:null,parentVisibleCondition:parentCondition,
     sourcePlacementOnly:true};
    active.set(depth,{wanted:!!row,occurrence});
    if(row)occurrences.push(occurrence);
   }else{
    const previous=active.get(depth);
    if(previous?.wanted){previous.occurrence.lastFrameExclusive=frame;previous.occurrence.exit='removed';}
    active.delete(depth);
   }
  }
  assert.equal(frame,frames+1,`complete frame domain sprite ${spriteId}`);
  for(const current of active.values())if(current.wanted){
   current.occurrence.lastFrameExclusive=frames+1;current.occurrence.exit='through-end';
  }
 }
 assert.equal(occurrences.length,7,'all seven source glossary button occurrences');
 same(occurrences.map(row=>[row.spriteId,row.characterId,row.depth,row.firstPlacedFrame,row.lastFrameExclusive]),[
  [111,96,12,1,22],
  [314,303,11,1,2],[314,304,13,1,2],[314,305,15,1,2],
  [314,306,17,1,2],[314,307,19,1,2],
  [315,96,131,701,883],
 ],'P061 source placement windows');
 return occurrences;
}

export function buildP061Glossary(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 assert(fs.lstatSync(SOURCE_ROOT).isDirectory()&&!fs.lstatSync(SOURCE_ROOT).isSymbolicLink(),
  'source root must be a physical directory');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'source root real path');
 same(pinFile(SOURCE_ROOT,SWF.path),SWF,'real P061 SWF');
 const lesson=readPin(SOURCE_ROOT,XML).toString();
 assert.equal([...lesson.matchAll(/<Page\b[^>]*>TS\/L2TS08\.swf<\/Page>/gu)].length,1,'P061 lesson placement');
 for(const file of ['L2KTE01.xml','L2KTS01.xml']){
  assert(lesson.includes(`HELP_KEYTERMS/KT/XML/${file}`),'lesson-declared L2 bank');
  assert(!fs.existsSync(path.join(SOURCE_ROOT,'HELP_KEYTERMS/KT/XML',file)),'declared L2 bank unresolved');
 }
 const audit=JSON.parse(readPin(ROOT,AUDIT));
 assert.equal(audit.kind,'nms-l02-p061-source-static-audit-v1');
 assert.equal(audit.animationId,ID);same(audit.source,SWF,'P061 source audit SWF');
 same(audit.sourceXml,XML,'P061 source audit lesson XML');
 same(audit.glossary.sourceKeys,KEYS.map(row=>row.key),'all authored P061 glossary keys');
 assert.equal(audit.glossary.namedL2BankFilesPresent,false);
 assert.equal(audit.glossary.historicalHostBankBindingEstablished,false);
 assert.equal(audit.glossary.lookupResultEstablished,false);
 const host=JSON.parse(readPin(ROOT,HOST_AUDIT));
 assert.equal(host.kind,'nms-l02-p060-identified-host-static-contract-v1');
 assert.equal(host.host.bindingToP060Established,false);
 assert.equal(host.glossaryIfIdentifiedHostServedP060.hostAppendedSuffix,'~English');
 assert.equal(host.glossaryIfIdentifiedHostServedP060.usesScreenkeyTermAttribute,false);
 assert.equal(host.glossaryIfIdentifiedHostServedP060.pageKey,'Decimal fraction');
 assert.equal(host.glossaryIfIdentifiedHostServedP060.searchKey,
  'parsed English or Spanish bank label, case-insensitive');
 absolutePin(host.host.physicalCasObject);absolutePin(host.host.exportedScriptPins.frame35);
 const sourceXml=readPin(ROOT,SOURCE_XML).toString();
 const occurrences=extractP061Occurrences(sourceXml);
 const actions=KEYS.map(({characterId,key,id})=>{
  const matching=audit.buttonActions.filter(row=>row.characterId===characterId);
  assert.equal(matching.length,1,`source button ${characterId}`);
  const action=matching[0];assert.equal(action.keyAttribute,key);
  const body=readPin(ROOT,action.pin).toString().replaceAll('\r\n','\n');
  assert.equal(body,`on(release){\n   _global.KeyAttribute = "${key}";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}\n`,
   `source glossary operations ${characterId}`);
  return {id,characterId,sourceKeyAttribute:key,actionPin:action.pin};
 });
 assert.equal(audit.buttonActions.filter(row=>row.keyAttribute!==null).length,6,'six authored glossary actions');
 const banks=Object.fromEntries(Object.entries(BANKS).map(([locale,pin])=>{
  same(host.glossaryIfIdentifiedHostServedP060.l1BankEvidence[locale==='en'?0:1].pin,
   {path:path.join(BANK_ROOT,pin.path),bytes:pin.bytes,sha256:pin.sha256},`host ${locale} bank pin`);
  return [locale,extractP061Bank(readPin(BANK_ROOT,pin).toString())];
 }));
 const terms=banks.en.map((en,index)=>{
  const es=banks.es[index];
  for(const field of ['id','sourceKeyAttribute','hostLookupLabel','hostLookupNormalization',
   'spanishLabelOpeningCount','screenkeyTermAttribute','labels','definitions','legacyCompanionReferences'])
   same(en[field],es[field],`paired L1 bank term ${en.id}/${field}`);
  return {id:en.id,sourceKeyAttribute:en.sourceKeyAttribute,
   hostLookup:{field:'parsed English label',normalization:'toLowerCase',
    key:en.sourceKeyAttribute.toLowerCase(),selectedLabel:en.hostLookupLabel,
    screenkeyTermAttribute:en.screenkeyTermAttribute,
    screenkeyTermUsedForSelection:false,spanishLabelOpeningCount:en.spanishLabelOpeningCount},
   labels:en.labels,definitions:en.definitions,
   rawEntry:{en:en.rawEntry,es:es.rawEntry},
   legacyCompanionReferences:en.legacyCompanionReferences,
   conditionalBanks:{en:BANKS.en,es:BANKS.es}};
 });
 return {schemaVersion:1,kind:'nms-l02-p061-conditional-identified-host-l1-glossary-v1',
  animationId:ID,status:'conditional-modern-host-data-candidate',
  sourceSelection:'identified-indexMI-parsed-English-label-case-insensitive',
  originalL2XmlResolved:false,historicalHostAssociationEstablished:false,
  originalRuntimeLookupVerified:false,modernSelectionByScreenkeyTerm:false,
  conditionalModernLabelResolutionReviewed:true,sourceRoot:SOURCE_ROOT,
  source:SWF,lessonXml:XML,sourceAudit:AUDIT,sourceExtractionXml:SOURCE_XML,
  identifiedHostContractFromP060:HOST_AUDIT,hostSourceInputs:{swf:host.host.physicalCasObject,
   frame35:host.host.exportedScriptPins.frame35},
  bankRoot:BANK_ROOT,banks:BANKS,actions,occurrences,terms,
  occurrenceBoundary:'Source display-list placement windows only; alpha, hit area and original-runtime visibility remain separate.',
  registrationEffect:false,acceptanceEffect:false};
}

export function prepareP061Glossary(check=false){
 const candidate=buildP061Glossary(),candidatePath=`${OUT}/conditional-bank.json`;
 const candidateBytes=json(candidate),disposition={status:candidate.status,
  sourceSelection:candidate.sourceSelection,originalL2XmlResolved:false,
  historicalHostAssociationEstablished:false,originalRuntimeLookupVerified:false,
  modernSelectionByScreenkeyTerm:false,conditionalModernLabelResolutionReviewed:true,
  candidateSha256:sha256(candidateBytes)};
 const termsBytes=Buffer.from('// Generated by scripts/prepare-nms-l02-p061-glossary-v1.mjs. Do not edit.\n'+
  '// Conditional MI L1 parsed-label lookup; L2 bank and historical host association unresolved.\n'+
  `export const P061_GLOSSARY_SOURCE_DISPOSITION=${JSON.stringify(disposition,null,2)} as const;\n`+
  `export const P061_SOURCE_TERMS=${JSON.stringify(candidate.terms,null,2)} as const;\n`+
  `export const P061_SOURCE_BUTTON_OCCURRENCES=${JSON.stringify(candidate.occurrences,null,2)} as const;\n`+
  'export type P061SourceTerm=typeof P061_SOURCE_TERMS[number];\n'+
  'export const p061SourceTerm=(id:string):P061SourceTerm|undefined=>P061_SOURCE_TERMS.find(term=>term.id===id);\n');
 const outputs=[{path:candidatePath,bytes:candidateBytes},{path:TERMS,bytes:termsBytes}];
 outputs.push({path:`${OUT}/receipt.json`,bytes:json({schemaVersion:1,
  kind:'p061-conditional-glossary-generation-v1',generator:pinFile(ROOT,path.relative(ROOT,SCRIPT)),
  sourceAudit:AUDIT,sourceXml:SOURCE_XML,identifiedHostContractFromP060:HOST_AUDIT,
  bankPins:BANKS,outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),
  registrationEffect:false,acceptanceEffect:false})});
 if(!check)for(const output of outputs)assert(!fs.existsSync(path.join(ROOT,output.path)),'new outputs only');
 for(const output of outputs){
  if(check)assert.deepStrictEqual(readPin(ROOT,pinFile(ROOT,output.path)),output.bytes,
   `generated drift ${output.path}`);
  else{fs.mkdirSync(path.dirname(path.join(ROOT,output.path)),{recursive:true});
   fs.writeFileSync(path.join(ROOT,output.path),output.bytes,{flag:'wx'});}
 }
 return {status:check?'P061_GLOSSARY_CHECKED':'P061_GLOSSARY_GENERATED',
  outputs:outputs.map(o=>pinBytes(o.path,o.bytes)),registrationEffect:false,acceptanceEffect:false};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),'use --write | --check');
 console.log(JSON.stringify(prepareP061Glossary(process.argv[2]==='--check')));
}
