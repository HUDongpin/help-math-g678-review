#!/usr/bin/env node
/** One exact, local P058 registry transaction. Planning never writes files. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile, readPin, readJsonPin, readRegistryTransaction, registrySources,
  REGISTRY, DISPATCH, sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {P058_ADMISSION_ID, P058_ADMISSION_CALIBRATION, P058_SOURCE_ROOT,P058_SOURCE,P058_XML,P058_MAIN_AUDIO,
  validateP058ProofClosure} from '../lib/nms-l02-p058-admission-semantics.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p058-product-20260927';
const DIR=`${BASE}/registration`;
const RECEIPT=`${DIR}/receipt.json`;
const ACTIVATION='apps/web/lib/nms-l02-p058-admission-activation.ts';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p058-v1.json';
const SELF='scripts/register-nms-l02-p058-current-js-v1.mjs';
const HOST='catalog/nms-l02-admission-v1/host-v9.json';
const EVIDENCE={browser:`${BASE}/browser/formal-candidate-v2/evidence.json`,
 natural:`${BASE}/natural-end/formal-candidate-v2/evidence.json`,
 continuity:`${BASE}/continuity/browser/formal-candidate-v3/result.json`,
 buildIntent:`${BASE}/admission/production-build-intent-v2.json`,
 build:`${BASE}/admission/production-build-receipt-v2.json`,
 production:`${BASE}/production/formal-candidate-v2.json`,
 restoration:`${BASE}/admission/production-build-link-restoration-v2.json`};
const LOGICAL_BUILD='apps/web/.next-alg-p001-production-scan';
const ORIGINAL_BUILD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output';
const PRESERVED_P057_BUILD='/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2';
const P058_BUILD='/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2';
const TARGETS=[REGISTRY,...DISPATCH,ACTIVATION];
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
const same=(left,right,label)=>assert.deepStrictEqual(left,right,label);

function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical local worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P058_SOURCE_ROOT,'exact real source root');
 assert.equal(fs.realpathSync(P058_SOURCE_ROOT),P058_SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local transaction only');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION));
 const source=bytes.toString();
 const marker='export const NMS_L02_P058_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return {data,bytes,source};
}
function serverDescriptor(expectedRegistered){
 const code=`import {nmsL02P058AdmissionDescriptor} from './apps/web/lib/nms-l02-p058-admission.server.ts';
const result=nmsL02P058AdmissionDescriptor();
if(result.registered!==${expectedRegistered} || result.descriptor.pages.length!==64 ||
 result.descriptor.productBridge.registeredAnimationCount!==58) throw Error('P058 descriptor transaction mismatch');
if(result.descriptor.pages[57].animationId!=='${P058_ADMISSION_ID}') throw Error('P058 descriptor placement');
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
   const physical=pinFile(P058_BUILD,'BUILD_ID');
   same({...physical,path:pin.path},pin,'temporary logical BUILD_ID bound to P058 physical build');
  }
  else if(path.isAbsolute(pin.path)){
   const source=[P058_SOURCE,P058_XML].find(item=>
    pin.path===path.join(P058_SOURCE_ROOT,item.path));
   assert(source,`unlisted absolute evidence input ${pin.path}`);
   assert.equal(fs.realpathSync(P058_SOURCE_ROOT),P058_SOURCE_ROOT,'physical source root');
   same({...pinFile(P058_SOURCE_ROOT,source.path),path:pin.path},
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
 assert.equal(binding.physicalRoot,P058_BUILD,'production used P058 physical build');
 assert.equal(binding.symlinkTarget,P058_BUILD,'production temporary symlink target');
 assert.equal(restoration.schemaVersion,1,'restoration schema');
 assert.equal(restoration.kind,'nms-l02-p058-production-build-link-restoration-v1');
 assert.equal(restoration.logicalPath,LOGICAL_BUILD);
 assert.equal(restoration.beforeTarget,ORIGINAL_BUILD);
 assert.equal(restoration.temporaryTarget,P058_BUILD);
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
 assert.equal(fs.realpathSync(P058_BUILD),P058_BUILD,'P058 physical build directory');
 const physical=pinFile(P058_BUILD,'BUILD_ID');
 same({...physical,path:`${P058_BUILD}/BUILD_ID`},restoration.p058BuildId,
  'restoration pins exact P058 BUILD_ID');
 const oldPhysical=pinFile(ORIGINAL_BUILD,'BUILD_ID');
 same({...oldPhysical,path:`${ORIGINAL_BUILD}/BUILD_ID`},restoration.oldBuildIdBefore,
  'restoration pins original BUILD_ID before temporary binding');
 same(restoration.oldBuildIdAfter,restoration.oldBuildIdBefore,
  'restoration preserved original BUILD_ID');
 assert.equal(fs.realpathSync(PRESERVED_P057_BUILD),PRESERVED_P057_BUILD,'P057 physical build preserved');
 same({...pinFile(PRESERVED_P057_BUILD,'BUILD_ID'),path:`${PRESERVED_P057_BUILD}/BUILD_ID`},
  restoration.p057BuildIdBefore,'preserved P057 BUILD_ID before P058 build');
 same(restoration.p057BuildIdAfter,restoration.p057BuildIdBefore,
  'P058 restoration preserved P057 BUILD_ID');
 if(buildIdPin.path===`${LOGICAL_BUILD}/BUILD_ID`)
  same({...physical,path:buildIdPin.path},buildIdPin,'physical BUILD_ID bytes');
 else same(physical,buildIdPin,'physical BUILD_ID bytes');
 return readPin(P058_BUILD,physical).toString().trim();
}
/** Validate the real evidence and its exact pre-transaction input closure. */
export function verifyP058RegistrationEvidence(beforeTargets){
 const result=Object.fromEntries(Object.entries(EVIDENCE).map(([name,relative])=>[name,verifiedEvidencePin(relative)]));
 const b=result.browser.data;
 assert.equal(b.kind,'nms-l02-p058-candidate-host-probe-plan-v1');
 assert.equal(b.animationId,P058_ADMISSION_ID);
 assert.equal(b.sourceSwfSha256,P058_SOURCE.sha256);
 assert.equal(b.status,'candidate-host-functional-probe-passed-not-acceptance');
 assert(b.passed===true&&b.stage==='unregistered-probe'&&b.formal===false&&
  b.inputsUnchanged===true&&b.browserProcessExited===true);
 same(b.cases.map(row=>[row.name,row.locale,row.width,row.height,row.reduced]),[
  ['en-desktop','en',1440,900,false],['es-desktop','es',1440,900,false],
  ['en-mobile','en',390,844,false],['es-mobile','es',390,844,false],
  ['en-desktop-reduced','en',1440,900,true],
  ['es-mobile-reduced','es',390,844,true]],'six EN/ES desktop/mobile/reduced cases');
 assert(b.frames.includes(242)&&b.frames.includes(243)&&b.frames.includes(274),
  'double Show and terminal boundary frames');
 same(b.terms.map(row=>[row.id,row.entry,row.key,row.firstFrame,row.placedFrame,
  row.lastFrameExclusive??275]),[
   ['sprite-37/depth-23/generation-1','strategies','Strategies',110,103,275],
   ['sprite-37/depth-30/generation-1','equation','Equation',146,139,275],
   ['sprite-37/depth-32/generation-1','pattern','Pattern',146,139,275],
   ['sprite-37/depth-34/generation-1','simple-simpler-simplest','Simple / Simpler / Simplest',146,139,275],
   ['sprite-37/depth-36/generation-1','table','Table',146,139,275],
   ['sprite-37/depth-41/generation-1','show','Show',242,237,275],
   ['sprite-37/depth-45/generation-1','show','Show',242,242,243],
  ],'seven occurrence source boundaries');
 assert(Array.isArray(b.records)&&b.records.length===6&&b.records.every(row=>
  row.status===b.status&&row.response.status===200&&row.ready===true&&row.formal===false&&
  row.dialogs.length===7&&new Set(row.dialogs.map(dialog=>dialog.id)).size===7&&
  row.dialogs.filter(dialog=>dialog.entry==='show').length===2&&
  row.dialogs.every((dialog,index)=>dialog.id===b.terms[index].id&&
   dialog.entry===b.terms[index].entry&&dialog.key===b.terms[index].key)&&
  row.observations.find(item=>item.label==='frame-242')?.controls.length===7&&
  row.observations.find(item=>item.label==='frame-243')?.controls.length===6&&
  row.observations.find(item=>item.label==='frame-274')?.controls.length===6&&
  row.audioResponses?.some(audio=>audio.status===200&&audio.bytes===P058_MAIN_AUDIO.bytes&&
   audio.sha256===P058_MAIN_AUDIO.sha256)&&row.nextPage?.animationId==='shared-nms002-l02-p059'&&
  row.errors.length===0&&row.warnings.length===0&&row.requests.every(request=>request.allowed)));
 assert(Array.isArray(b.cases)&&b.cases.length===6&&b.cleanupErrors.length===0);
 same(b.inputsBefore,b.inputsAfter,'candidate browser inputs unchanged');checkInputPins(b.inputsBefore,beforeTargets);
 requireTransactionInputs(b.inputsBefore,'formal browser');
 assert(b.inputsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p058-formal-host-v2.mjs'),
  'formal browser probe source pinned');
 const n=result.natural.data;
 assert.equal(n.kind,'nms-l02-p058-natural-end-browser-probe-v1');
 same(n.sourcePin,{path:path.join(P058_SOURCE_ROOT,P058_SOURCE.path),bytes:P058_SOURCE.bytes,
  sha256:P058_SOURCE.sha256},'natural exact source SWF');
 same(n.audioPin,P058_MAIN_AUDIO,'natural exact source audio');
 assert.equal(n.status,'natural-end-candidate-probe-passed-not-acceptance');
 assert(n.formal===false&&n.response.status===200&&n.ready===true&&
  n.inputsUnchanged===true&&n.sourceUnchanged===true&&n.browserProcessExited===true);
 assert(n.errors.length===0&&n.warnings.length===0&&n.cleanupErrors.length===0);
 assert(n.elapsedToTerminalMs>18000&&n.elapsedToTerminalMs<35000,'natural 274-frame wall time');
 const terminal=n.observations.find(row=>row.label==='natural-terminal');
 assert(terminal?.frame===274&&terminal.phase==='ended'&&terminal.audio.active===0&&
  terminal.controls.length===6,'source terminal with six lasting controls');
 assert(n.dialogs.length===6&&new Set(n.dialogs.map(row=>row.entry)).size===6,
  'six unique terminal glossary dialogs; second Show was transient');
 assert(n.audioReceipts.length>0&&n.audioReceipts.every(row=>row.status===200&&
  row.bytes===P058_MAIN_AUDIO.bytes&&row.sha256===P058_MAIN_AUDIO.sha256),
  'verified P058 natural-play audio response');
 same(n.inputsBefore,n.inputsAfter,'natural-end inputs unchanged');checkInputPins(n.inputsBefore,beforeTargets);
 requireTransactionInputs(n.inputsBefore,'formal natural end');
 assert(n.inputsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p058-formal-natural-end-v2.mjs'),
  'formal natural-end probe source pinned');
 assert.equal(sha256(fs.readFileSync(n.sourcePin.path)),n.sourcePin.sha256,'natural-end physical source');
 readPin(ROOT,n.audioPin);
 const c=result.continuity.data;
 assert.equal(c.kind,'nms-l02-p058-predecessor-resource-browser-continuity-v1');
 assert.equal(c.status,'technical-pass-not-acceptance');
 assert(c.formal===false&&c.inputStable===true&&c.browserProcessExited===true&&
  c.cleanupErrors.length===0,'continuity input and browser closure');
 assert(c.cases.length===2&&c.cases.map(row=>row.locale).join(',')==='en,es'&&
  c.cases.every(row=>row.status==='technical-pass-not-acceptance'&&row.responseStatus===200&&
   row.ready===true&&row.formal===false&&row.contextClose==='closed'&&row.dialogs.length===2&&
   ['p058-main.mp3','p056-main.mp3','p055-typography.js','p055-main.mp3','p052-sprite-350.mp3']
    .every(name=>row.assets.some(asset=>asset.name===name&&asset.status===200))),
  'EN/ES predecessor navigation and exact source resources');
 checkInputPins(c.inputPins,beforeTargets);
 requireTransactionInputs(c.inputPins,'EN/ES continuity');
 assert(c.inputPins.some(pin=>pin.path==='scripts/probe-nms-l02-p058-predecessors-v2.mjs'),
  'continuity probe source pinned');
 const build=result.build.data;
 const intent=result.buildIntent.data;
 assert.equal(intent.schemaVersion,1);
 assert.equal(intent.kind,'nms-l02-p058-production-build-intent-v1');
 assert.equal(intent.logicalPath,LOGICAL_BUILD);
 assert.equal(intent.beforeTarget,ORIGINAL_BUILD);
 assert.equal(intent.temporaryTarget,P058_BUILD);
 same(intent.oldBuildId,result.restoration.data.oldBuildIdBefore,'build intent old BUILD_ID');
 same(intent.preservedP057BuildId,result.restoration.data.p057BuildIdBefore,
  'build intent preserved P057 BUILD_ID');
 const dependencyLink=path.join(path.dirname(P058_BUILD),'node_modules');
 const dependencyTarget=path.join(ROOT,'node_modules');
 assert.equal(intent.dependencyLink,dependencyLink);
 assert.equal(intent.dependencyTarget,dependencyTarget);
 assert.equal(intent.dependencyRealRoot,fs.realpathSync(dependencyTarget));
 assert(fs.lstatSync(dependencyLink).isSymbolicLink(),'new build dependency link');
 assert.equal(fs.readlinkSync(dependencyLink),dependencyTarget,'exact dependency link target');
 assert.equal(fs.realpathSync(dependencyLink),intent.dependencyRealRoot,'dependency link physical root');
 const sharpPath=path.join(ROOT,'node_modules/sharp/package.json');
 assert.equal(fs.realpathSync(sharpPath),path.join(intent.dependencyRealRoot,'sharp/package.json'));
 const sharpBefore=fs.lstatSync(sharpPath,{bigint:true});
 assert(sharpBefore.isFile()&&sharpBefore.nlink===1n&&sharpBefore.size<1024n*1024n,
  'bounded ordinary sharp package');
 const sharpBytes=fs.readFileSync(sharpPath);
 const sharpAfter=fs.lstatSync(sharpPath,{bigint:true});
 assert(['dev','ino','size','mtimeNs','ctimeNs','nlink'].every(key=>sharpBefore[key]===sharpAfter[key]),
  'stable sharp package read');
 same(intent.sharpPackage,{path:'node_modules/sharp/package.json',bytes:sharpBytes.length,
  sha256:sha256(sharpBytes)},'exact sharp package build input');
 assert.equal(build.kind,'p058-local-production-build-v1');
 assert(build.exitCode===0&&build.inputsStable===true&&build.configRestored===true);
 same(intent.inputs,build.inputsBefore,'build intent input pins');
 same(intent.config,build.configBefore,'build intent configuration pins');
 assert.equal(build.selectedNonSecretEnvironment.NODE_ENV,'production');
 assert.equal(build.selectedNonSecretEnvironment.HELP_MATH_ALG_P001_PRODUCTION_SCAN,'1');
 same(build.inputsBefore,build.inputsAfter,'build inputs unchanged');
 same(build.configBefore,build.configAfterRestore,'build configuration restored');
 checkInputPins(build.inputsBefore,beforeTargets);checkInputPins(build.configAfterRestore,beforeTargets);
 requireTransactionInputs(build.inputsBefore,'production build');
 const p=result.production.data;
 assert.equal(p.kind,'nms-l02-p058-local-production-negative-v1');
 assert.equal(p.status,'technical-pass-not-deployment');
 assert.equal(p.origin,'http://127.0.0.1:3332');
 assert(p.inputStable===true&&p.expectedCases===68&&p.errors.length===0);
 assert(p.results.length===68&&p.results.every(row=>row.status===404&&row.pass===true&&
  row.bodyBytes<1000&&row.redirected===false&&['GET','HEAD'].includes(row.method)));
 const routes=new Map();
 for(const row of p.results){
  const cases=routes.get(row.path)??new Set();
  cases.add(`${row.method}:${row.headersMode}`);routes.set(row.path,cases);
 }
 assert.equal(routes.size,17,'six page and eleven resource routes');
 for(const cases of routes.values())same([...cases].sort(),
  ['GET:anonymous','GET:candidate-shaped-request','HEAD:anonymous','HEAD:candidate-shaped-request'],
  'four negative request modes per route');
 same(p.inputsBefore,p.inputsAfter,'production inputs unchanged');
 checkInputPins(p.inputsBefore,beforeTargets);
 requireTransactionInputs(p.inputsBefore,'production negative');
 assert.equal(p.buildLog,`${BASE}/admission/production-build-v2.log`,'exact successful build log');
 assert(p.inputsBefore.some(pin=>pin.path===p.buildLog),'production pins build log');
 same(p.activation.stage,'candidate','production exercised candidate activation');
 same(p.activation.host,pinFile(ROOT,HOST),'production host-v9 binding');
 same(p.activation.page,pinFile(ROOT,PROOF),'production P058 page binding');
 same(p.inputsBefore.find(pin=>pin.path==='scripts/check-nms-l02-p058-production-negative-v2.mjs'),
  pinFile(ROOT,'scripts/check-nms-l02-p058-production-negative-v2.mjs'),'production script pinned');
 const restoration=result.restoration.data;
 const buildId=checkBuildDirectory(p.directoryBinding,build.buildId,restoration);
 assert.equal(p.buildIdBefore,buildId);assert.equal(p.buildIdAfter,buildId);
 const prodBuildId=p.inputsBefore.find(pin=>pin.path===`${LOGICAL_BUILD}/BUILD_ID`);
 const physicalBuildId=pinFile(P058_BUILD,'BUILD_ID');
 same({...physicalBuildId,path:`${LOGICAL_BUILD}/BUILD_ID`},prodBuildId,
  'production uses exact P058 physical BUILD_ID');
 if(build.buildId.path===`${LOGICAL_BUILD}/BUILD_ID`)same(build.buildId,prodBuildId,'successful build ID');
 else same(build.buildId,physicalBuildId,'successful physical build ID');
 same(p.inputsBefore.find(pin=>pin.path===EVIDENCE.build),result.build.pin,'production pins successful build receipt');
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
 const proofPin=activation.data.page,hostPin=activation.data.host,witnessPin=activation.data.predecessor;
 same(proofPin,pinFile(ROOT,PROOF),'immutable P058 proof');
 same(hostPin,pinFile(ROOT,HOST),'immutable host-v9');readPin(ROOT,witnessPin);
 const proof=readJsonPin(ROOT,proofPin);validateP058ProofClosure(proof);
 assert.equal(proof.files.length,68,'exact page proof closure');
 assert.equal(proof.animationId,P058_ADMISSION_ID);
 assert.equal(proof.registration.calibrationId,P058_ADMISSION_CALIBRATION);
 assert.equal(proof.registration.entries.length,1);
 assert.equal(proof.registration.entries[0].key,P058_ADMISSION_ID);
 same(proof.packet.source,P058_SOURCE,'source-bound P058 registration');
 same(proof.packet.sourceXml,P058_XML,'source-bound lesson XML');
 same(proof.packet.audio.main,P058_MAIN_AUDIO,'source embedded audio pin');
 assert.equal(proof.packet.selectedPages[0].runtime.frameCount,274,'sprite-37 frame count');
 assert(Object.values(proof.packet.acceptanceEffects).every(value=>value===false),'acceptance remains false');
 readPin(ROOT,proof.freeze);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT);
 const before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===P058_ADMISSION_CALIBRATION),'P058 absent');
 assert(!keys(before).includes(P058_ADMISSION_ID),'P058 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 assert(oldKeys.length===631&&newKeys.length===632,'exact local page count');
 assert(shared(oldKeys).length===489&&shared(newKeys).length===490,'exact shared page count');
 assert(lesson(oldKeys).length===57&&lesson(newKeys).length===58,
  'exact NMS L02 registration count');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[P058_ADMISSION_ID],'one new key');
 for(const row of before.calibrations)same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
  `preserve old calibration ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyP058RegistrationEvidence(beforeMap);
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
 const tmp=path.join(root,path.dirname(relative),`.${path.basename(relative)}.p058-${process.pid}.tmp`);
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
 const intent={schemaVersion:1,kind:'nms-l02-p058-registration-intent-v1',animationId:P058_ADMISSION_ID,
  producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,evidence:plan.evidence,
  before:plan.beforePins,after:plan.afterPins,snapshots,
  counts:{oldTotal:631,newTotal:632,oldShared:489,newShared:490,oldLesson:57,newLesson:58},
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
  const receipt={schemaVersion:1,kind:'nms-l02-p058-local-registration-v1',status:'registered-local-current-js-not-acceptance',
   animationId:P058_ADMISSION_ID,producer:plan.producer,proof:plan.proof,host:plan.host,
   witness:plan.witness,evidence:plan.evidence,
   intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,snapshots,outputs:plan.afterPins,
   counts:intent.counts,descriptor,originalRuntime:false,audioAcceptance:false,humanReview:false,
   ownerAcceptance:false,strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return {status:'P058_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
 }catch(error){journal({step:'failure',reason:String(error.message)});rollback(modified,plan);throw error;}
}
function check(){
 localOnly();
 const receipt=readJsonPin(ROOT,pinFile(ROOT,RECEIPT));
 assert.equal(receipt.kind,'nms-l02-p058-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,P058_ADMISSION_ID);
 assert.equal(receipt.producer.path,SELF);assert.equal(receipt.proof.path,PROOF);
 assert.equal(receipt.host.path,HOST);
 same(receipt.counts,{oldTotal:631,newTotal:632,oldShared:489,newShared:490,
  oldLesson:57,newLesson:58},'receipt counts');
 assert(['originalRuntime','audioAcceptance','humanReview','ownerAcceptance','strictComplete','publication'].every(k=>receipt[k]===false));
 readPin(ROOT,receipt.producer);readPin(ROOT,receipt.proof);readPin(ROOT,receipt.host);
 readPin(ROOT,receipt.witness);
 assert.equal(receipt.intent.path,`${DIR}/intent.json`,'exact transaction intent path');
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p058-registration-intent-v1');
 assert.equal(intent.animationId,P058_ADMISSION_ID);
 same(intent.counts,receipt.counts,'intent and receipt counts');
 same(intent.before,receipt.before);same(intent.after,receipt.outputs);same(intent.snapshots,receipt.snapshots);
 same(intent.proof,receipt.proof);same(intent.host,receipt.host);same(intent.witness,receipt.witness);
 same(intent.producer,receipt.producer,'reviewed registration producer');
 same(intent.evidence,receipt.evidence,'exact intent evidence');
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyP058RegistrationEvidence(historical),receipt.evidence,'exact pre-registration evidence');
 for(let i=0;i<TARGETS.length;i++){
  assert.equal(receipt.snapshots[i].path,snapshotName(TARGETS[i]),'exact snapshot target');
  same(pinFile(ROOT,TARGETS[i]),receipt.outputs[i],`registered output ${TARGETS[i]}`);
  const snapshot=readPin(ROOT,receipt.snapshots[i]);
  same(bytePin(TARGETS[i],snapshot),receipt.before[i],`preserved input ${TARGETS[i]}`);
 }
 const transaction=readRegistryTransaction(ROOT);
 const beforeRegistry=JSON.parse(readPin(ROOT,receipt.snapshots[0]));
 assert(keys(transaction.registry).length===632&&shared(keys(transaction.registry)).length===490);
 assert(keys(beforeRegistry).length===631&&shared(keys(beforeRegistry)).length===489);
 assert(lesson(keys(transaction.registry)).length===58&&lesson(keys(beforeRegistry)).length===57);
 const proof=readJsonPin(ROOT,receipt.proof);validateP058ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===P058_ADMISSION_CALIBRATION),proof.registration);
 for(const row of beforeRegistry.calibrations)same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,receipt.proof);same(activation.data.host,receipt.host);
 same(activation.data.predecessor,receipt.witness);
 const descriptor=serverDescriptor(true);same(descriptor,receipt.descriptor);
 return {status:'P058_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P058_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,proof:plan.proof,
    evidence:plan.evidence,before:plan.beforePins,after:plan.afterPins,
    counts:{oldTotal:631,newTotal:632,oldShared:489,newShared:490,oldLesson:57,newLesson:58},
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
