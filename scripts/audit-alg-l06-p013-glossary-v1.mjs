#!/usr/bin/env node
/** Read-only source/host/product crosswalk; writes only the P013 glossary audit on --write. */
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {isDeepStrictEqual} from 'node:util';
import {pinFile,readJsonPin,readPin} from '../lib/g678-admission-proof.mjs';
import {resolveSourceGlossary} from './build-g678-alg-l11-instructional-successor-glossary.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
assert(!process.env.VERCEL&&!process.env.VERCEL_ENV,'local source audit only');
Object.assign(process.env,{NODE_ENV:'development',HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT,
 HELP_MATH_G678_LOCAL_PREVIEW:'1',HELP_MATH_G678_LOCAL_PREVIEW_BIND:'127.0.0.1'});
const OUTPUT='migrations/shared-alg001-l06-p013/audit/glossary-v1/input-output-crosswalk-v1.json';
const P013_SOURCE={path:'migrations/shared-alg001-l06-p013/audit/source-v1/source-audit-v1.json',
 bytes:12299,sha256:'ec5707528c5ebc3f0992aec542c6eace1a3eebaa8256cc3d5aebfc7f037078af'};
const P013_HOST={path:'migrations/shared-alg001-l06-p013/audit/source-v1/host-glossary-disposition-v1.json',
 bytes:2848,sha256:'b7fe4460532e53fa9e2302056d99b9afc0ec49107fede9b09f9794f0c2c23d43'};
const P013_SCRIPTS={path:'migrations/shared-alg001-l06-p013/audit/source-v1/public-tool-scripts-v1.json',
 bytes:816,sha256:'e9dc01a4017ba546017a1bbe7efeb61949cc2ecf707d2318a3dd9fc14baa6602'};
const P013_COMPOSITION={path:'migrations/shared-alg001-l06-p013/audit/source-v1/source-composition-v1.json',
 bytes:10877,sha256:'9882183b44543dfbd2615e15cd204f91e1e5e7928b3e99e0a15b298baa17b637'};
const P004_GLOSSARY={path:'migrations/shared-alg001-l06-p004/audit/source-glossary-v1.json',
 bytes:15869,sha256:'0cb0789f117db00855a5be1c1123121cdd64b7eba03b2f64ddce3d7f81f999e0'};
const EXPECTED=[{id:'input',key:'Input',buttonId:131,firstFrame:258,depth:8,
 actionSha256:'2f92a394bed054aeca4ae6ed57b238a04f5b3aa261270c980d5f00a82c8f19a5'},
 {id:'output',key:'Output',buttonId:137,firstFrame:297,depth:14,
 actionSha256:'1262eac21bf8a718d551c8d7b046220855f8f878214783cfdfb7d0c37f5ff5c7'}];
const productFields=({id,sourceKeyAttribute,labels,definitions,source})=>
 ({id,sourceKeyAttribute,labels,definitions,source});
function same(actual,expected,label){assert.deepEqual(actual,expected,label);}
function external(pin){return readPin(path.dirname(pin.path),{...pin,path:path.basename(pin.path)});}

async function build(){
 const source=readJsonPin(ROOT,P013_SOURCE),host=readJsonPin(ROOT,P013_HOST),
  scripts=readJsonPin(ROOT,P013_SCRIPTS),composition=readJsonPin(ROOT,P013_COMPOSITION),
  p004Audit=readJsonPin(ROOT,P004_GLOSSARY);
 same(source.animationId,'shared-alg001-l06-p013','P013 identity');
 same(source.status,'source-audit-only; not-rendered-or-registered','P013 gate');
 same(source.catalog.globalOrdinal,13,'source order');
 same(source.catalog.section,'VB','source section');
 same(source.catalog.sectionPageOrdinal,3,'source VB ordinal');
 same(host.sourcePage,source.source,'same P013 SWF');
 same(host.lessonXml,{path:'G6-G8-shared/ALG001/L6/index.xml',bytes:13926,
  sha256:'9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c'},
  'P013 lesson XML');
 same(scripts.sourceSwfSha256,source.source.sha256,'same P013 script source');
 readPin(SOURCE_ROOT,source.source);
 const xml=readPin(SOURCE_ROOT,host.lessonXml).toString('utf8');
 assert(xml.includes('<English>HELP_KEYTERMS/KT/XML/L1KTE01.xml</English>')&&
  xml.includes('<Spanish>HELP_KEYTERMS/KT/XML/L1KTS01.xml</Spanish>'),
  'Lesson 6 exact dictionary references');
 assert(xml.includes('<Page Title="Input and Output" RandomAudio="" BGText="">VB/L6VB04.swf</Page>'),
  'P013 exact XML placement');
 const oldHostScript=external(host.oldHostFunctionScript).toString('utf8');
 external(host.oldHostSwf);external(host.oldHostFrameObserver);
 const oldFunction=oldHostScript.match(/function DoHyperLinks\(\)[\s\S]*?\r?\n\}\r?\n/u)?.[0];
 assert(oldFunction,'old host DoHyperLinks exists');
 for(const expression of [/dtfKTLesson\.text\.toUpperCase\(\) != "OFF"/u,
  /_loc2_\.Pause = true/u,/_loc2_\.Play = false/u,
  /_loc2_\.KeyAttribute \+= "~English"/u,
  /m_c\.doGetSubLink\(_loc2_\.KeyAttribute\)/u])
  assert(expression.test(oldFunction),'old host branch changed');
 assert(oldFunction.indexOf('KeyAttribute += "~English"')<
  oldFunction.indexOf('doGetSubLink(_loc2_.KeyAttribute)'),
  'old host key suffix precedes lookup');
 same(source.teaching.buttons,host.buttons,'source/host button binding');
 const buttonRows=[];
 for(const wanted of EXPECTED){
  const button=host.buttons.find(row=>row.characterId===wanted.buttonId);
  same({id:wanted.id,key:button.sourceKeyAttribute,buttonId:button.characterId,
   firstFrame:button.firstFrame,depth:button.depth,actionSha256:button.actionSha256},
   wanted,'P013 exact button');
  const actionPath=`scripts/DefineButton2_${wanted.buttonId}/BUTTONCONDACTION on(release).as`;
  const action=scripts.files[actionPath];
  same(action,`on(release){\n   _global.KeyAttribute = "${wanted.key}";\n`+
   '   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}',
   'exact FFDec release action');
  const instance=composition.main.buttonInstances.find(row=>row.characterId===wanted.buttonId);
  same({key:instance.key,firstFrame:instance.firstFrame,depth:instance.depth,
   actionSha256:instance.actionSha256},
   {key:wanted.key,firstFrame:wanted.firstFrame,depth:wanted.depth,
    actionSha256:wanted.actionSha256},
   'source composition button identity');
  same(instance.sourceInstance.timelineId,'sprite-140','source button domain');
  same(instance.sourceInstance.characterId,wanted.buttonId,'source button character');
  same(instance.sourceInstance.depth,wanted.depth,'source button depth');
  same(instance.sourceInstance.lastFrameExclusive,373,'button persists through frame 372');
  same(instance.sourceInstance.firstFrame,wanted.firstFrame,'button placement start');
  buttonRows.push({characterId:wanted.buttonId,sourceKeyAttribute:wanted.key,
   firstFrame:wanted.firstFrame,depth:wanted.depth,actionSha256:wanted.actionSha256,
   sourceEffects:button.sourceEffects,
   decompiledAction:action,buttonWindow:{fromFrame:wanted.firstFrame,
    lastFrameExclusive:instance.sourceInstance.lastFrameExclusive}});
 }
 same(p004Audit.dictionaries.en.path,
  '/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI/L1KTE01.xml',
  'English legacy bank');
 same(p004Audit.dictionaries.es.path,
  '/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI/L1KTS01.xml',
  'Spanish legacy bank');
 const banks={en:external(p004Audit.dictionaries.en).toString('utf8'),
  es:external(p004Audit.dictionaries.es).toString('utf8')};
 const dictionarySource={en:{assetId:'G678L1KTE01.xml',
   path:'HELP_KEYTERMS/KT/XML/L1KTE01.xml',sha256:p004Audit.dictionaries.en.sha256},
  es:{assetId:'G678L1KTS01.xml',
   path:'HELP_KEYTERMS/KT/XML/L1KTS01.xml',sha256:p004Audit.dictionaries.es.sha256}};
 const resolved=resolveSourceGlossary(banks,EXPECTED.map(row=>row.key),dictionarySource);
 same(resolved.map(row=>row.id),EXPECTED.map(row=>row.id),'two distinct term IDs');
 const {algL6P004FormalDescriptor}=await import('../apps/web/lib/alg-l06-p004-formal-admission-v1.server.ts');
 const {algL6P008FormalDescriptor}=await import('../apps/web/lib/alg-l06-p008-formal-admission-v1.server.ts');
 const p004=algL6P004FormalDescriptor(),p008=algL6P008FormalDescriptor();
 same(p004.productBridge.registeredAnimationCount,21,'P004 formal baseline');
 same(p008.productBridge.registeredAnimationCount,22,'P008 formal baseline');
 same(p008.glossary,p004.glossary,'P008 retains P004 glossary values');
 const terms=resolved.map((row,index)=>{
  const fromAudit=p004Audit.entries.filter(entry=>entry.id===row.id&&
   entry.sourceKeyAttribute===EXPECTED[index].key);
  same(fromAudit.length,1,'one exact P004 dictionary entry');
  const entry=fromAudit[0];
  same(entry.canonicalDictionaryKey,EXPECTED[index].key,'exact dictionary key');
  same(entry.lookup,{kind:'exact-literal',from:EXPECTED[index].key,
   to:EXPECTED[index].key,genericCaseNormalizationAllowed:false},
   'no case folding or conceptual alias');
  same(productFields(entry),productFields(row),'P004 audit versus raw bilingual XML');
  same(entry.sourceEntrySha256,row.sourceEntrySha256,'raw XML fragment hashes');
  same(entry.extractionLfNormalizedEntrySha256,
   row.extractionLfNormalizedEntrySha256,'normalized fragment hashes');
  const formal004=p004.glossary.filter(item=>item.id===row.id),
   formal008=p008.glossary.filter(item=>item.id===row.id);
  same(formal004.length,1,'P004 has one term');
  same(formal008.length,1,'P008 has one term');
  same(formal004[0],productFields(row),'P004 formal term equals old bank');
  same(formal008[0],formal004[0],'P008 formal term unchanged');
  return {buttonId:EXPECTED[index].buttonId,sourceKeyAttribute:EXPECTED[index].key,
   canonicalDictionaryKey:entry.canonicalDictionaryKey,
   entryId:row.id,labels:row.labels,definitions:row.definitions,
   source:row.source,sourceEntrySha256:row.sourceEntrySha256,
   extractionLfNormalizedEntrySha256:row.extractionLfNormalizedEntrySha256,
   formalP004AndP008Equal:true};
 });
 assert(!isDeepStrictEqual(terms[0].definitions,terms[1].definitions),
  'Input and Output are separate definitions');
 const artifact={schemaVersion:1,kind:'alg-l06-p013-input-output-glossary-crosswalk-v1',
  scope:'static-source-and-existing-formal-descriptor-only',animationId:source.animationId,
  status:'source-crosswalk-only; no P013 renderer, registration, runtime or acceptance',
  inputs:{p013Source:P013_SOURCE,p013Host:P013_HOST,p013Scripts:P013_SCRIPTS,
   p013Composition:P013_COMPOSITION,
   p013Swf:source.source,lessonXml:host.lessonXml,
   oldHostSwf:host.oldHostSwf,oldHostFunctionScript:host.oldHostFunctionScript,
   oldHostFrameObserver:host.oldHostFrameObserver,p004Glossary:P004_GLOSSARY,
   dictionaryBanks:p004Audit.dictionaries,
   formalDescriptorCode:['apps/web/lib/alg-l06-p004-descriptor-extension-v1.ts',
    'apps/web/lib/alg-l06-p004-formal-admission-v1.server.ts',
    'apps/web/lib/alg-l06-p008-descriptor-extension-v1.ts',
    'apps/web/lib/alg-l06-p008-formal-admission-v1.server.ts'].map(file=>pinFile(ROOT,file))},
  sourcePlacement:{globalOrdinal:13,section:'VB',sectionPageOrdinal:3,
   sourceReference:'VB/L6VB04.swf',mainFrameDomain:'sprite-140',mainFrameCount:372},
  sourceButtons:buttonRows,oldHostStaticPath:{keyTermsOffSkipsDoHyperLinks:true,
   enabledBranchPauses:true,appendsKeySuffix:'~English',calls:'m_c.doGetSubLink',
   actualLaunchObserved:false},
  dictionaryReference:{en:'HELP_KEYTERMS/KT/XML/L1KTE01.xml',
   es:'HELP_KEYTERMS/KT/XML/L1KTS01.xml'},terms,
  reusable:{exactInputAndOutputTermIdsAlreadyInP004AndP008:true,
   bilingualLabelsDefinitionsAndRawEntryHashesMatchSource:true,
   newDefinitionOrConceptAliasRequired:false},
  gaps:['P013 old-host launch, selected key-term setting and lookup result unobserved',
   'P013 glossary close/continue, Replay, keyboard and mobile lifecycle unobserved',
   'P013 maintained renderer, My Lesson adapter and Current-JS registration absent',
   'No runtime evidence that Spanish UI selects a Spanish old-host definition',
   'P004 lowercase output has an explicit alias; P013 emits uppercase Output and does not use it'],
  acceptanceEffects:{authoritativeOriginalRuntime:false,fidelityAccepted:false,
   audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
   strictComplete:false,published:false}};
 return Buffer.from(`${JSON.stringify(artifact,null,2)}\n`);
}

const mode=process.argv[2];
assert(['--write','--check'].includes(mode)&&process.argv.length===3,
 'usage: node --conditions=react-server --import tsx scripts/audit-alg-l06-p013-glossary-v1.mjs --write|--check');
const bytes=await build(),target=path.join(ROOT,OUTPUT);
if(mode==='--write'){
 mkdirSync(path.dirname(target),{recursive:true});
 writeFileSync(target,bytes,{flag:'wx'});
}else same(readFileSync(target),bytes,'P013 glossary audit reproducibility');
process.stdout.write(`${JSON.stringify({path:OUTPUT,bytes:bytes.length,mode})}\n`);
