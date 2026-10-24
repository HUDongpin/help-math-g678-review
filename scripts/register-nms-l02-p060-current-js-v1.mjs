#!/usr/bin/env node
/** One exact, local P060 registry transaction. Planning never writes files. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile, readPin, readJsonPin, readRegistryTransaction, registrySources,
  REGISTRY, DISPATCH, sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {P060_ADMISSION_ID, P060_ADMISSION_CALIBRATION, P060_SOURCE_ROOT,P060_SOURCE,P060_XML,P060_MAIN_AUDIO,P060_AUDIO,
  validateP060ProofClosure} from '../lib/nms-l02-p060-admission-semantics.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p060-product-20260927';
const DIR=`${BASE}/registration`;
const RECEIPT=`${DIR}/receipt.json`;
const ACTIVATION='apps/web/lib/nms-l02-p060-admission-activation.ts';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p060-v1.json';
const PROOF_PIN={path:PROOF,bytes:121846,
 sha256:'7e408e17b13e5d96bef72919f9f132a4718ed9be9578663709f108496e823acd'};
const SELF='scripts/register-nms-l02-p060-current-js-v1.mjs';
const HOST='catalog/nms-l02-admission-v1/host-v10.json';
const HOST_PIN={path:HOST,bytes:26722,
 sha256:'2a54a89fbd1793ad0f596a51183aa42e120f80581f22a0ec66a125810263ac54'};
const EVIDENCE={browser:`${BASE}/browser/formal-candidate-v3/evidence.json`,
 continuity:`${BASE}/continuity/browser/formal-candidate-v1/root-v1/result.json`,
 buildIntent:`${BASE}/admission/production-build-intent-v1.json`,
 build:`${BASE}/admission/production-build-receipt-v1.json`,
 production:`${BASE}/production/formal-candidate-v1.json`,
 restoration:`${BASE}/admission/production-build-link-restoration-v1.json`};
const LOGICAL_BUILD='apps/web/.next-alg-p001-production-scan';
const ORIGINAL_BUILD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output';
const PRESERVED_P057_BUILD='/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2';
const PRESERVED_P058_BUILD='/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2';
const P060_BUILD='/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1';
const TARGETS=[REGISTRY,...DISPATCH,ACTIVATION];
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
const same=(left,right,label)=>assert.deepStrictEqual(left,right,label);

function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical local worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P060_SOURCE_ROOT,'exact real source root');
 assert.equal(fs.realpathSync(P060_SOURCE_ROOT),P060_SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local transaction only');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION));
 const source=bytes.toString();
 const marker='export const NMS_L02_P060_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return {data,bytes,source};
}
function serverDescriptor(expectedRegistered){
 const code=`import {nmsL02P060AdmissionDescriptor} from './apps/web/lib/nms-l02-p060-admission.server.ts';
const result=nmsL02P060AdmissionDescriptor();
if(result.registered!==${expectedRegistered} || result.descriptor.pages.length!==64 ||
 result.descriptor.productBridge.registeredAnimationCount!==59) throw Error('P060 descriptor transaction mismatch');
if(result.descriptor.pages[59].animationId!=='${P060_ADMISSION_ID}') throw Error('P060 descriptor placement');
console.log(JSON.stringify({registered:result.registered,pages:result.descriptor.pages.length,
 registeredAnimationCount:result.descriptor.productBridge.registeredAnimationCount}));`;
 const run=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','--input-type=module','-e',code],
  {cwd:ROOT,env:{...process.env,NODE_ENV:'development'},encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 assert.equal(run.status,0,`server descriptor: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function verifiedEvidencePin(relative){const pin=pinFile(ROOT,relative);return {pin,data:readJsonPin(ROOT,pin)};}
function checkInputPins(pins,beforeTargets){
 assert(Array.isArray(pins)&&pins.length>0,'evidence input pins');
 const seen=new Set();
 for(const pin of pins){
  assert(!seen.has(pin.path),`duplicate evidence input ${pin.path}`);seen.add(pin.path);
  if(beforeTargets?.has(pin.path)) same(pin,beforeTargets.get(pin.path),`historical transaction input ${pin.path}`);
  else if(pin.path===`${LOGICAL_BUILD}/BUILD_ID`){
   const physical=pinFile(P060_BUILD,'BUILD_ID');
   same({...physical,path:pin.path},pin,'temporary logical BUILD_ID bound to P060 physical build');
  }
  else if(path.isAbsolute(pin.path)){
   const source=[P060_SOURCE,P060_XML].find(item=>
    pin.path===path.join(P060_SOURCE_ROOT,item.path));
   assert(source,`unlisted absolute evidence input ${pin.path}`);
   assert.equal(fs.realpathSync(P060_SOURCE_ROOT),P060_SOURCE_ROOT,'physical source root');
   same({...pinFile(P060_SOURCE_ROOT,source.path),path:pin.path},
    {...source,path:pin.path},'exact allowed source input');
   same(pin,{...source,path:pin.path},'evidence pins exact allowed source input');
  }
  else readPin(ROOT,pin);
 }
 return pins;
}
function requireTransactionInputs(pins,label){
 const paths=new Set(pins.map(pin=>pin.path));
 for(const path of [REGISTRY,ACTIVATION,HOST,PROOF])
  assert(paths.has(path),`${label} omits exact transaction input ${path}`);
}
function checkBuildDirectory(binding,buildIdPin,restoration){
 assert(binding&&binding.logicalPath===LOGICAL_BUILD,'exact build directory');
 assert.equal(binding.physicalRoot,P060_BUILD,'production used P060 physical build');
 assert.equal(binding.symlinkTarget,P060_BUILD,'production temporary symlink target');
 assert.equal(restoration.schemaVersion,1,'restoration schema');
 assert.equal(restoration.kind,'nms-l02-p060-production-build-link-restoration-v1');
 assert.equal(restoration.logicalPath,LOGICAL_BUILD);
 assert.equal(restoration.beforeTarget,ORIGINAL_BUILD);
 assert.equal(restoration.temporaryTarget,P060_BUILD);
 assert.equal(restoration.afterTarget,ORIGINAL_BUILD);
 assert.equal(restoration.restored,true);
 assert.equal(restoration.buildSucceeded,true);
 assert.equal(restoration.failure,null);
 assert.equal(restoration.linkRestorationFailure,null);
 assert.equal(restoration.configurationCleanupFailure,null);
 const link=path.join(ROOT,LOGICAL_BUILD);
 assert(fs.lstatSync(link).isSymbolicLink(),'build output is expected symlink');
 assert.equal(fs.readlinkSync(link),ORIGINAL_BUILD,'original logical build link restored');
 assert.equal(fs.realpathSync(link),ORIGINAL_BUILD,'original physical build directory');
 assert.equal(fs.realpathSync(ORIGINAL_BUILD),ORIGINAL_BUILD,'original physical build directory');
 assert.equal(fs.realpathSync(P060_BUILD),P060_BUILD,'P060 physical build directory');
 const physical=pinFile(P060_BUILD,'BUILD_ID');
 same({...physical,path:`${P060_BUILD}/BUILD_ID`},restoration.p060BuildId,
  'restoration pins exact P060 BUILD_ID');
 const oldPhysical=pinFile(ORIGINAL_BUILD,'BUILD_ID');
 same({...oldPhysical,path:`${ORIGINAL_BUILD}/BUILD_ID`},restoration.oldBuildIdBefore,
  'restoration pins original BUILD_ID before temporary binding');
 same(restoration.oldBuildIdAfter,restoration.oldBuildIdBefore,
  'restoration preserved original BUILD_ID');
 assert.equal(fs.realpathSync(PRESERVED_P057_BUILD),PRESERVED_P057_BUILD,'P057 physical build preserved');
 same({...pinFile(PRESERVED_P057_BUILD,'BUILD_ID'),path:`${PRESERVED_P057_BUILD}/BUILD_ID`},
  restoration.p057BuildIdBefore,'preserved P057 BUILD_ID before P060 build');
 same(restoration.p057BuildIdAfter,restoration.p057BuildIdBefore,
  'P060 restoration preserved P057 BUILD_ID');
 assert.equal(fs.realpathSync(PRESERVED_P058_BUILD),PRESERVED_P058_BUILD,'P058 physical build preserved');
 same({...pinFile(PRESERVED_P058_BUILD,'BUILD_ID'),path:`${PRESERVED_P058_BUILD}/BUILD_ID`},
  restoration.p058BuildIdBefore,'preserved P058 BUILD_ID before P060 build');
 same(restoration.p058BuildIdAfter,restoration.p058BuildIdBefore,
  'P060 restoration preserved P058 BUILD_ID');
 if(buildIdPin.path===`${LOGICAL_BUILD}/BUILD_ID`)
  same({...physical,path:buildIdPin.path},buildIdPin,'physical BUILD_ID bytes');
 else same(physical,buildIdPin,'physical BUILD_ID bytes');
 return readPin(P060_BUILD,physical).toString().trim();
}
/** Validate source-backed browser, continuity, build and production evidence before mutation. */
export function verifyP060RegistrationEvidence(beforeTargets){
 const result={browser:verifiedEvidencePin(EVIDENCE.browser)};
 const b=result.browser.data;
 assert.equal(b.kind,'nms-l02-p060-natural-host-probe-plan-v1');
 assert.equal(b.animationId,P060_ADMISSION_ID);
 assert.equal(b.status,'local-candidate-host-probe-passed-not-acceptance');
 assert(b.stage==='proof-backed-local-candidate'&&b.formal===true&&b.registeredPredecessorCount===58&&
  b.projectedRegisteredCount===59&&b.renderableCount===59&&b.activePageCount===64&&
  b.inputsUnchanged===true&&b.browserProcessExited===true&&b.cleanupErrors.length===0);
 assert(['originalRuntimeParityEstablished','audioListeningAccepted','humanAccepted','ownerAccepted',
  'strictComplete','published'].every(key=>b[key]===false),'browser leaves acceptance gates open');
 same(b.source,{...P060_SOURCE,path:path.join(P060_SOURCE_ROOT,P060_SOURCE.path)},'browser physical source');
 same(b.sourceXml,{...P060_XML,path:path.join(P060_SOURCE_ROOT,P060_XML.path)},'browser physical XML');
 same(b.main,{frameDomain:'sprite-391',sourceFrames:721,authoredStops:[262,400,527,646,699,718]},
  'source main domain and authored stops');
 same(b.cases.map(row=>[row.name,row.locale,row.width,row.height,row.reduced]),[
  ['en-desktop','en',1440,900,false],['es-desktop','es',1440,900,false],
  ['en-mobile','en',390,844,false],['es-mobile','es',390,844,false],
  ['en-desktop-reduced','en',1440,900,true],['es-mobile-reduced','es',390,844,true]],
 'six EN/ES desktop/mobile/reduced cases');
 assert.equal(b.sourceOccurrences.length,16,'all source glossary occurrences');
 const proof=readJsonPin(ROOT,pinFile(ROOT,PROOF));
 const controls=proof.packet.glossary.controlPolicy.controls;
 const sortedTriples=rows=>rows.map(row=>[row.id,row.entry??row.entryId,row.key??row.sourceKeyAttribute])
  .sort((left,right)=>left[0].localeCompare(right[0]));
 same(sortedTriples(b.sourceOccurrences),sortedTriples(controls),'exact 16 source control identities');
 const audioByDomain=new Map(P060_AUDIO.payloads.map(pin=>[path.basename(pin.path,'.mp3'),pin]));
 assert.equal(audioByDomain.size,11,'eleven source MP3 domains');
 for(const [domain,pin] of audioByDomain){
  const planned=b.audioDomains[domain];
  assert(planned&&planned.bytes===pin.bytes&&planned.sha256===pin.sha256&&
   Number.isSafeInteger(planned.samples)&&planned.samples>0,'source audio domain '+domain);
 }
 same(b.applicableFeedback,['sprite-205','sprite-217','sprite-245','sprite-354',
  'sprite-296','sprite-275','sprite-322'],'seven feedback domains qualified by source');
 assert.equal(b.cases.length,6);
 for(const row of b.cases){
  assert(row.status===b.status&&row.response?.status===200&&row.errors.length===0&&
   row.warnings.length===0&&row.cleanupErrors.length===0&&row.requests.every(request=>request.allowed),
   `browser case ${row.name}`);
  assert.equal(row.observations.find(item=>item.label==='entry')?.languagePolicy,
   row.locale==='es'?'english-source-fallback':'english-source','qualified source language');
  same(row.dialogs.map(dialog=>[dialog.id,dialog.entry,dialog.key]),
   b.sourceOccurrences.map(item=>[item.id,item.entry,item.key]),'all sixteen glossary dialogs');
  assert(row.dialogs.every(dialog=>/^[a-f0-9]{64}$/u.test(dialog.sourceSha256)),
   'source-bound glossary definitions');
  for(const frame of [262,400,527,646,699])
   assert(row.observations.some(item=>item.label===`stop-${frame}`&&item.frame===frame),
    `natural source stop ${frame}`);
  const terminal=row.observations.find(item=>item.label==='terminal');
  const entry=row.observations.find(item=>item.label==='entry');
  assert(terminal?.frame===718&&terminal.paused==='true'&&terminal.audio.active===0&&
   terminal.audio.maxActive===1&&terminal.overflow===false,'natural terminal and audio lifecycle');
  assert(Number.isFinite(entry?.at)&&Number.isFinite(terminal.at)&&
   terminal.at-entry.at>45000&&terminal.at-entry.at<300000,
   'bounded real-time authored main playback');
  assert(row.observations.some(item=>item.label==='picture-release'&&item.frame===527&&item.audio.active===0));
  assert(row.observations.some(item=>item.label==='calculator-release'&&item.frame===646&&item.audio.active===0));
  assert(row.observations.some(item=>item.label==='double-replay'&&item.replay===2&&item.audio.maxActive===1));
  assert(row.navigation?.target==='shared-nms002-l02-p059'&&
   row.navigation.availability==='registered'&&row.navigation.audioActive===0);
  same(row.feedbackDomains,row.answers==='two-wrong'?['sprite-205','sprite-217']:
   ['sprite-205','sprite-322'],'source-backed default answer branch');
  const reached=new Set(row.assetResponses.map(asset=>asset.domain));
  assert(reached.has('sprite-391'));
  for(const asset of row.assetResponses){
   const pin=audioByDomain.get(asset.domain);
   assert(pin&&asset.status===200&&asset.bytes===pin.bytes&&asset.sha256===pin.sha256&&
    asset.contentType==='audio/mpeg'&&asset.redirected===false,'actual browser audio response');
  }
  for(const decoded of row.decodes){
   const planned=Object.entries(b.audioDomains).find(([,value])=>value.sha256===decoded.sha256);
   assert(planned&&reached.has(planned[0])&&decoded.samples===planned[1].samples&&
    decoded.channels===planned[1].channels&&decoded.sampleRate===22050,'actual WebAudio decode');
  }
  assert(row.decodes.some(decoded=>decoded.sha256===P060_MAIN_AUDIO.sha256));
  for(const screenshot of row.screenshots)readPin(ROOT,screenshot);
 }
 same(b.inputsBefore,b.inputsAfter,'candidate browser inputs unchanged');checkInputPins(b.inputsBefore,beforeTargets);
 requireTransactionInputs(b.inputsBefore,'formal browser');
 assert(b.inputsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p060-formal-host-v1.mjs'),
  'formal browser probe source pinned');
 for(const [name,relative] of Object.entries(EVIDENCE))if(name!=='browser')
  result[name]=verifiedEvidencePin(relative);
 const c=result.continuity.data;
 assert.equal(c.kind,'nms-l02-p060-formal-candidate-browser-continuity-v1');
 assert.equal(c.status,'technical-pass-not-acceptance');
 assert(c.formal===true&&c.inputStable===true&&c.browserProcessExited===true&&
  c.cleanupErrors.length===0,'continuity input and browser closure');
 assert(['originalRuntimeAccepted','audioListeningAccepted','humanAccepted','ownerAccepted',
  'strictComplete','published'].every(key=>c[key]===false),'continuity leaves acceptance gates open');
 assert(c.cases.length===2&&c.cases.map(row=>row.locale).join(',')==='en,es'&&
  c.cases.every(row=>row.status==='technical-pass-not-acceptance'&&
   row.responseStatus===200&&row.contextClose==='closed'&&row.scriptResourceObserved===true&&
   row.assets.some(asset=>new URL(asset.url).pathname==='/migration-assets/nms-l02-p060/sprite-391.mp3'&&asset.status===200)&&
   row.errors.length===0),'EN/ES predecessor continuity');
 same(c.inputPinsBefore,c.inputPinsAfter,'continuity inputs unchanged');
 checkInputPins(c.inputPinsBefore,beforeTargets);
 requireTransactionInputs(c.inputPinsBefore,'EN/ES continuity');
 assert(c.inputPinsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p060-continuity-v1.mjs'),
  'continuity probe source pinned');
 const build=result.build.data,intent=result.buildIntent.data,restoration=result.restoration.data;
 assert.equal(intent.schemaVersion,1);assert.equal(intent.kind,'nms-l02-p060-production-build-intent-v1');
 assert.equal(intent.logicalPath,LOGICAL_BUILD);assert.equal(intent.beforeTarget,ORIGINAL_BUILD);
 assert.equal(intent.temporaryTarget,P060_BUILD);
 same(intent.oldBuildId,restoration.oldBuildIdBefore,'original build ID');
 same(intent.preservedP057BuildId,restoration.p057BuildIdBefore,'P057 build ID');
 same(intent.preservedP058BuildId,restoration.p058BuildIdBefore,'P058 build ID');
 const dependencyLink=path.join(path.dirname(P060_BUILD),'node_modules');
 const dependencyTarget=path.join(ROOT,'node_modules');
 assert.equal(intent.dependencyLink,dependencyLink);assert.equal(intent.dependencyTarget,dependencyTarget);
 assert.equal(intent.dependencyRealRoot,fs.realpathSync(dependencyTarget));
 assert(fs.lstatSync(dependencyLink).isSymbolicLink()&&
  fs.readlinkSync(dependencyLink)===dependencyTarget&&fs.realpathSync(dependencyLink)===intent.dependencyRealRoot);
 const dependencyRoot='/Volumes/WestWorld/HELP MATH 2.0/node_modules';
 assert.equal(intent.dependencyRealRoot,dependencyRoot,'reviewed physical dependency root');
 same(intent.sharpPackage,{...pinFile(dependencyRoot,'sharp/package.json'),
  path:'node_modules/sharp/package.json'},'build dependency pin from exact physical root');
 assert.equal(build.kind,'p060-local-production-build-v1');
 assert(build.exitCode===0&&build.inputsStable===true&&build.configRestored===true);
 same(intent.inputs,build.inputsBefore,'build inputs');same(intent.config,build.configBefore,'build configs');
 same(build.inputsBefore,build.inputsAfter,'build stable');same(build.configBefore,build.configAfterRestore,'config restored');
 checkInputPins(build.inputsBefore,beforeTargets);checkInputPins(build.configAfterRestore,beforeTargets);
 requireTransactionInputs(build.inputsBefore,'production build');
 assert.equal(build.selectedNonSecretEnvironment.NODE_ENV,'production');
 assert.equal(build.selectedNonSecretEnvironment.HELP_MATH_ALG_P001_PRODUCTION_SCAN,'1');
 const p=result.production.data;
 assert.equal(p.kind,'nms-l02-p060-local-production-negative-v1');
 assert.equal(p.status,'technical-pass-not-deployment');assert.equal(p.origin,'http://127.0.0.1:3332');
 assert(p.inputStable===true&&p.expectedCases===112&&p.errors.length===0&&p.results.length===112&&
  p.results.every(row=>row.status===404&&row.pass===true&&row.bodyBytes<1000&&row.redirected===false&&
   ['GET','HEAD'].includes(row.method)));
 const routes=new Map();for(const row of p.results){
  const modes=routes.get(row.path)??new Set();modes.add(`${row.method}:${row.headersMode}`);routes.set(row.path,modes);
 }
 assert.equal(routes.size,28,'six page and twenty-two resource routes');
 for(const modes of routes.values())same([...modes].sort(),
  ['GET:anonymous','GET:candidate-shaped-request','HEAD:anonymous','HEAD:candidate-shaped-request'].sort(),
  'four negative requests per route');
 same(p.inputsBefore,p.inputsAfter,'production inputs unchanged');checkInputPins(p.inputsBefore,beforeTargets);
 requireTransactionInputs(p.inputsBefore,'production negative');
 assert.equal(p.buildLog,`${BASE}/admission/production-build-v1.log`);
 assert(p.inputsBefore.some(pin=>pin.path===p.buildLog));
 assert.equal(p.activation.stage,'candidate');
 same(p.activation.host,pinFile(ROOT,HOST),'production host-v10');same(p.activation.page,pinFile(ROOT,PROOF),'production page proof');
 same(p.inputsBefore.find(pin=>pin.path==='scripts/check-nms-l02-p060-production-negative-v1.mjs'),
  pinFile(ROOT,'scripts/check-nms-l02-p060-production-negative-v1.mjs'),'production checker pinned');
 const buildId=checkBuildDirectory(p.directoryBinding,build.buildId,restoration);
 assert.equal(p.buildIdBefore,buildId);assert.equal(p.buildIdAfter,buildId);
 const physicalBuildId=pinFile(P060_BUILD,'BUILD_ID');
 same({...physicalBuildId,path:`${LOGICAL_BUILD}/BUILD_ID`},
  p.inputsBefore.find(pin=>pin.path===`${LOGICAL_BUILD}/BUILD_ID`),'physical production BUILD_ID');
 same(build.buildId,p.inputsBefore.find(pin=>pin.path===`${LOGICAL_BUILD}/BUILD_ID`),'successful build ID');
 same(p.inputsBefore.find(pin=>pin.path===EVIDENCE.build),result.build.pin,'production pins build receipt');
 return Object.fromEntries(Object.entries(result).map(([name,item])=>[name,item.pin]));
}
function expectedActivation(current){
 assert.equal(current.data.schemaVersion,1);assert.equal(current.data.stage,'candidate');
 assert.equal(current.data.host.path,HOST);assert.equal(current.data.page.path,PROOF);
 const matches=current.source.match(/"stage": "candidate"/gu)??[];
 assert.equal(matches.length,1,'one bounded stage field');
 return Buffer.from(current.source.replace('"stage": "candidate"','"stage": "registered"'));
}
function planBase(){
 localOnly();
 const activation=readActivation();
 assert(activation.data&&activation.data.stage==='candidate','exact P060 candidate activation required');
 const proofPin=activation.data.page,hostPin=activation.data.host,witnessPin=activation.data.predecessor;
 same(proofPin,PROOF_PIN,'exact reviewed P060 proof');
 same(proofPin,pinFile(ROOT,PROOF),'immutable P060 proof');
 same(hostPin,HOST_PIN,'exact sealed host-v10');
 same(hostPin,pinFile(ROOT,HOST),'immutable host-v10');readPin(ROOT,witnessPin);
 const proof=readJsonPin(ROOT,proofPin);validateP060ProofClosure(proof);
 assert.equal(proof.files.length,227,'exact page proof closure');
 assert.equal(proof.animationId,P060_ADMISSION_ID);
 assert.equal(proof.registration.calibrationId,P060_ADMISSION_CALIBRATION);
 assert.equal(proof.registration.entries.length,1);
 assert.equal(proof.registration.entries[0].key,P060_ADMISSION_ID);
 same(proof.packet.source,P060_SOURCE,'source-bound P060 registration');
 same(proof.packet.sourceXml,P060_XML,'source-bound lesson XML');
 same(proof.packet.audio.main,P060_MAIN_AUDIO,'source embedded audio pin');
 assert.equal(proof.packet.selectedPages[0].runtime.frameCount,721,'sprite-391 frame count');
 assert.equal(proof.packet.selectedPages[0].runtime.language,'fixed-en');
 assert.equal(proof.packet.glossary.sourceSelection,'identified-indexMI-parsed-English-label-case-insensitive');
 assert(proof.packet.glossary.originalL2XmlResolved===false&&
  proof.packet.glossary.historicalHostAssociationEstablished===false&&
  proof.packet.glossary.originalRuntimeLookupVerified===false,'conditional modern glossary only');
 assert(Object.values(proof.packet.acceptanceEffects).every(value=>value===false),'acceptance remains false');
 readPin(ROOT,proof.freeze);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT);
 const before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===P060_ADMISSION_CALIBRATION),'P060 absent');
 assert(!keys(before).includes(P060_ADMISSION_ID),'P060 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 assert(oldKeys.length===632&&newKeys.length===633,'exact local page count');
 assert(shared(oldKeys).length===490&&shared(newKeys).length===491,'exact shared page count');
 assert(lesson(oldKeys).length===58&&lesson(newKeys).length===59,
  'exact NMS L02 registration count');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[P060_ADMISSION_ID],'one new key');
 for(const row of before.calibrations)same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
  `preserve old calibration ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyP060RegistrationEvidence(beforeMap);
 const dispatch=registrySources(after);
 const nextBytes=[json(after),...dispatch.map(value=>Buffer.from(value)),expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,i)=>bytePin(relative,nextBytes[i]));
 const candidateDescriptor=serverDescriptor(false);
 return {producer:pinFile(ROOT,SELF),proof:proofPin,host:hostPin,witness:witnessPin,
  before,beforePins,after,afterPins,nextBytes,
  evidence,candidateDescriptor};
}
function snapshotName(relative){return `${DIR}/${path.basename(relative)}.before`;}
function journal(event){fs.appendFileSync(path.join(ROOT,DIR,'journal.jsonl'),JSON.stringify({at:new Date().toISOString(),...event})+'\n');}
function writeNew(relative,bytes){fs.writeFileSync(path.join(ROOT,relative),bytes,{flag:'wx',mode:0o444});}
export function replacePinnedFile(root,relative,before,bytes,onRenamed=()=>{}){
 same(pinFile(root,relative),before,`compare-and-swap ${relative}`);
 const tmp=path.join(root,path.dirname(relative),`.${path.basename(relative)}.p060-${process.pid}.tmp`);
 const fd=fs.openSync(tmp,'wx',0o644);
 try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
 try{same(pinFile(root,relative),before,`last compare-and-swap ${relative}`);fs.renameSync(tmp,path.join(root,relative));onRenamed();}
 catch(error){try{fs.unlinkSync(tmp);}catch{}throw error;}
 same(pinFile(root,relative),bytePin(relative,bytes),`written ${relative}`);
}
export function rollbackPinnedFiles(root,records,report=()=>{}){
 const outcomes=[];
 for(const {relative,beforeBytes,after} of [...records].reverse()){
  try{
   same(pinFile(root,relative),after,`rollback own bytes only ${relative}`);
   replacePinnedFile(root,relative,after,beforeBytes);
   outcomes.push({relative,status:'rolled-back'});report({step:'rolled-back',relative});
  }catch(error){
   outcomes.push({relative,status:'skipped',reason:String(error.message)});
   report({step:'rollback-skipped',relative,reason:String(error.message)});
  }
 }
 return outcomes;
}
function rollback(modified,plan){
 const records=modified.map(index=>({relative:TARGETS[index],
  beforeBytes:readPin(ROOT,{...plan.beforePins[index],path:snapshotName(TARGETS[index])}),
  after:plan.afterPins[index]}));
 return rollbackPinnedFiles(ROOT,records,journal);
}
function write(plan){
 assert(!fs.existsSync(path.join(ROOT,DIR)),'registration directory must be absent');
 fs.mkdirSync(path.join(ROOT,DIR));
 const snapshots=[];
 for(const pin of plan.beforePins){
  const relative=snapshotName(pin.path);
  writeNew(relative,readPin(ROOT,pin));
  const snapshot=pinFile(ROOT,relative);
  same({...snapshot,path:pin.path},pin,'exact pre-state snapshot');
  snapshots.push(snapshot);
 }
 const intent={schemaVersion:1,kind:'nms-l02-p060-registration-intent-v1',animationId:P060_ADMISSION_ID,
  producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,evidence:plan.evidence,
  before:plan.beforePins,after:plan.afterPins,snapshots,
  counts:{oldTotal:632,newTotal:633,oldShared:490,newShared:491,oldLesson:58,newLesson:59},
  sourceLanguage:'fixed-en',spanishPresentation:'English-source-fallback',
  glossarySource:'conditional-identified-host-L1-not-historical-L2',
  originalRuntime:false,audioAcceptance:false,humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false};
 writeNew(`${DIR}/intent.json`,json(intent));
 journal({step:'prepared',intent:pinFile(ROOT,`${DIR}/intent.json`)});
 const modified=[];
 try{
  // Evidence and mutable transaction bytes are checked again after snapshots.
  const fresh=planBase();
  same(fresh.evidence,plan.evidence,'evidence compare-and-swap');
  same(fresh.afterPins,plan.afterPins,'projected outputs compare-and-swap');
  TARGETS.forEach((relative,i)=>same(pinFile(ROOT,relative),plan.beforePins[i],`pre-write ${relative}`));
  for(let i=0;i<3;i++){
   replacePinnedFile(ROOT,TARGETS[i],plan.beforePins[i],plan.nextBytes[i],()=>modified.push(i));
   journal({step:'written',relative:TARGETS[i],pin:plan.afterPins[i]});
  }
  const tx=readRegistryTransaction(ROOT);same(tx.registry,plan.after,'canonical registry and dispatch');
  replacePinnedFile(ROOT,ACTIVATION,plan.beforePins[3],plan.nextBytes[3],()=>modified.push(3));
  journal({step:'written',relative:ACTIVATION,pin:plan.afterPins[3]});
  const descriptor=serverDescriptor(true);
  const receipt={schemaVersion:1,kind:'nms-l02-p060-local-registration-v1',status:'registered-local-current-js-not-acceptance',
   animationId:P060_ADMISSION_ID,producer:plan.producer,proof:plan.proof,host:plan.host,
   witness:plan.witness,evidence:plan.evidence,
   intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,snapshots,outputs:plan.afterPins,
   counts:intent.counts,descriptor,sourceLanguage:intent.sourceLanguage,
   spanishPresentation:intent.spanishPresentation,glossarySource:intent.glossarySource,
   originalRuntime:false,audioAcceptance:false,humanReview:false,
   ownerAcceptance:false,strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return {status:'P060_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
 }catch(error){journal({step:'failure',reason:String(error.message)});rollback(modified,plan);throw error;}
}
function check(){
 localOnly();
 const receipt=readJsonPin(ROOT,pinFile(ROOT,RECEIPT));
 assert.equal(receipt.kind,'nms-l02-p060-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,P060_ADMISSION_ID);
 assert.equal(receipt.producer.path,SELF);assert.equal(receipt.proof.path,PROOF);
 assert.equal(receipt.host.path,HOST);
 same(receipt.counts,{oldTotal:632,newTotal:633,oldShared:490,newShared:491,
  oldLesson:58,newLesson:59},'receipt counts');
 assert(receipt.sourceLanguage==='fixed-en'&&receipt.spanishPresentation==='English-source-fallback'&&
  receipt.glossarySource==='conditional-identified-host-L1-not-historical-L2');
 assert(['originalRuntime','audioAcceptance','humanReview','ownerAcceptance','strictComplete','publication'].every(k=>receipt[k]===false));
 readPin(ROOT,receipt.producer);readPin(ROOT,receipt.proof);readPin(ROOT,receipt.host);
 readPin(ROOT,receipt.witness);
 assert.equal(receipt.intent.path,`${DIR}/intent.json`,'exact transaction intent path');
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p060-registration-intent-v1');
 assert.equal(intent.animationId,P060_ADMISSION_ID);
 same(intent.counts,receipt.counts,'intent and receipt counts');
 same([intent.sourceLanguage,intent.spanishPresentation,intent.glossarySource],
  [receipt.sourceLanguage,receipt.spanishPresentation,receipt.glossarySource],
  'source-language qualification');
 same(intent.before,receipt.before);same(intent.after,receipt.outputs);same(intent.snapshots,receipt.snapshots);
 same(intent.proof,receipt.proof);same(intent.host,receipt.host);same(intent.witness,receipt.witness);
 same(intent.producer,receipt.producer,'reviewed registration producer');
 same(intent.evidence,receipt.evidence,'exact intent evidence');
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyP060RegistrationEvidence(historical),receipt.evidence,'exact pre-registration evidence');
 for(let i=0;i<TARGETS.length;i++){
  assert.equal(receipt.snapshots[i].path,snapshotName(TARGETS[i]),'exact snapshot target');
  same(pinFile(ROOT,TARGETS[i]),receipt.outputs[i],`registered output ${TARGETS[i]}`);
  const snapshot=readPin(ROOT,receipt.snapshots[i]);
  same(bytePin(TARGETS[i],snapshot),receipt.before[i],`preserved input ${TARGETS[i]}`);
 }
 const transaction=readRegistryTransaction(ROOT);
 const beforeRegistry=JSON.parse(readPin(ROOT,receipt.snapshots[0]));
 assert(keys(transaction.registry).length===633&&shared(keys(transaction.registry)).length===491);
 assert(keys(beforeRegistry).length===632&&shared(keys(beforeRegistry)).length===490);
 assert(lesson(keys(transaction.registry)).length===59&&lesson(keys(beforeRegistry)).length===58);
 const proof=readJsonPin(ROOT,receipt.proof);validateP060ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===P060_ADMISSION_CALIBRATION),proof.registration);
 for(const row of beforeRegistry.calibrations)same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,receipt.proof);same(activation.data.host,receipt.host);
 same(activation.data.predecessor,receipt.witness);
 const descriptor=serverDescriptor(true);same(descriptor,receipt.descriptor);
 return {status:'P060_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P060_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,proof:plan.proof,
    evidence:plan.evidence,before:plan.beforePins,after:plan.afterPins,
    counts:{oldTotal:632,newTotal:633,oldShared:490,newShared:491,oldLesson:58,newLesson:59},
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
