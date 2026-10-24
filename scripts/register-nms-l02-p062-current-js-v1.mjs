#!/usr/bin/env node
/** One exact local P062 registry transaction. --plan and --check never write. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,registrySources,
  REGISTRY,DISPATCH,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {P062_ADMISSION_ID as ID,P062_ADMISSION_CALIBRATION as CALIBRATION,
  P062_SOURCE_ROOT as SOURCE_ROOT,P062_SOURCE as SOURCE,P062_XML as XML,
  P062_RUNTIME as RUNTIME,P062_MAIN_AUDIO as MAIN_AUDIO,
  validateP062ProofClosure} from '../lib/nms-l02-p062-admission-semantics.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p062-product-20260928';
const DIR=`${BASE}/registration`,RECEIPT=`${DIR}/receipt.json`;
const SELF='scripts/register-nms-l02-p062-current-js-v1.mjs';
const ACTIVATION='apps/web/lib/nms-l02-p062-admission-activation.ts';
const HOST='catalog/nms-l02-admission-v1/host-v13.json';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p062-v1.json';
const HOST_PIN={path:HOST,bytes:34025,sha256:'1966784839ef33426ccd4b7753cd8e691a4f78901a6182f349a77ab9a7e6e27b'};
const PROOF_PIN={path:PROOF,bytes:97811,sha256:'7939dfefe1191f9d6da937cc893fddce07944285395083917daaec058a41d4a9'};
const EVIDENCE={
  browser:`${BASE}/browser/formal-candidate-v2/evidence.json`,
  continuity:`${BASE}/continuity/browser/formal-candidate-v1/root-v1/result.json`,
  buildIntent:`${BASE}/admission/production-build-intent-v1.json`,
  build:`${BASE}/admission/production-build-receipt-v1.json`,
  production:`${BASE}/production/formal-candidate-v1.json`,
  restoration:`${BASE}/admission/production-build-link-restoration-v1.json`,
};
const LOGICAL_BUILD='apps/web/.next-alg-p001-production-scan';
const OLD_BUILD='/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output';
const NEW_BUILD='/Volumes/American Dream/hudongpin/g678-p062-build-output-20260928/next-output-v1';
const PRESERVED_BUILDS={old:OLD_BUILD,p055:OLD_BUILD,
 p057:'/Volumes/American Dream/hudongpin/g678-p057-build-output-20260927/next-output-v2',
 p058:'/Volumes/American Dream/hudongpin/g678-p058-build-output-20260927/next-output-v2',
 p060:'/Volumes/American Dream/hudongpin/g678-p060-build-output-20260927/next-output-v1',
 p061:'/Volumes/American Dream/hudongpin/g678-p061-build-output-20260928/next-output-v3'};
const TARGETS=[REGISTRY,...DISPATCH,ACTIVATION];
const COUNTS={oldTotal:634,newTotal:635,oldShared:492,newShared:493,oldLesson:60,newLesson:61};
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(a,b,label)=>assert.deepStrictEqual(a,b,label);
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const lesson=values=>values.filter(key=>/^shared-nms002-l02-p\d{3}$/u.test(key));
const noAcceptance=value=>{
  for(const key of ['originalRuntimeAccepted','originalRuntimeParityEstablished','audioListeningAccepted',
    'audioAccepted','humanAccepted','humanReviewed','ownerAccepted','strictComplete','published'])
    if(key in value)assert.equal(value[key],false,`unaccepted gate ${key}`);
};
function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical local worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local-only registration');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION));
 const source=bytes.toString();
 const marker='export const NMS_L02_P062_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return {data,bytes,source};
}
function projectedDescriptor(registered){
 const code=`import {nmsL02P062AdmissionDescriptor} from './apps/web/lib/nms-l02-p062-admission.server.ts';
 const result=nmsL02P062AdmissionDescriptor();
 if(result.registered!==${registered}||result.descriptor.pages.length!==64||
 result.descriptor.productBridge.registeredAnimationCount!==61||
 result.descriptor.pages[61].animationId!=='${ID}'||result.descriptor.glossary.length!==25)
 throw Error('P062 descriptor registration/placement/glossary mismatch');
 console.log(JSON.stringify({registered:result.registered,pages:result.descriptor.pages.length,
 registeredAnimationCount:result.descriptor.productBridge.registeredAnimationCount,
 glossaryCount:result.descriptor.glossary.length,placementId:result.descriptor.pages[61].animationId}));`;
 const run=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','--input-type=module','-e',code],
  {cwd:ROOT,env:{...process.env,NODE_ENV:'development'},encoding:'utf8',timeout:120000,maxBuffer:1024*1024});
 assert.equal(run.status,0,`P062 descriptor: ${run.stderr||run.error||run.stdout}`);
 return JSON.parse(run.stdout.trim().split('\n').at(-1));
}
function currentPin(pin,beforeTargets){
 if(beforeTargets?.has(pin.path))same(pin,beforeTargets.get(pin.path),`historical target ${pin.path}`);
 else if(pin.path===`${LOGICAL_BUILD}/BUILD_ID`){
  same({...pinFile(NEW_BUILD,'BUILD_ID'),path:pin.path},pin,'physical P062 BUILD_ID');
 }else if(path.isAbsolute(pin.path)){
  const roots=[SOURCE_ROOT,'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222',
   '/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1'];
  const root=roots.find(value=>pin.path.startsWith(`${value}/`));
  assert(root,`unlisted absolute evidence root: ${pin.path}`);
  assert.equal(fs.realpathSync(root),root,'physical external evidence root');
  same({...pinFile(root,path.relative(root,pin.path)),path:pin.path},pin,`external evidence ${pin.path}`);
 }else readPin(ROOT,pin);
}
function evidencePins(pins,beforeTargets,label,requireTransaction=true){
 assert(Array.isArray(pins)&&pins.length>0,`${label} input pins`);
 const seen=new Set();
 for(const pin of pins){assert(!seen.has(pin.path),`${label} duplicate ${pin.path}`);seen.add(pin.path);
  currentPin(pin,beforeTargets);}
 if(requireTransaction)for(const path of [REGISTRY,ACTIVATION,HOST,PROOF])
  assert(seen.has(path),`${label} missing ${path}`);
}
function evidenceDocument(relative){const pin=pinFile(ROOT,relative);return {pin,data:readJsonPin(ROOT,pin)};}
function validateBrowser(item,beforeTargets){
 const b=item.data;
 assert.equal(b.kind,'nms-l02-p062-formal-host-probe-plan-v2');
 assert.equal(b.animationId,ID);
 assert.equal(b.status,'local-candidate-host-probe-passed-not-acceptance');
 assert(b.formal===true&&b.formalReaderBound===true&&b.registeredPredecessorCount===60&&
  b.projectedRegisteredCount===61&&b.renderableCount===61&&b.activePageCount===64&&
  b.inputsUnchanged===true&&b.browserProcessExited===true&&b.cleanupErrors.length===0);
 for(const key of ['originalRuntimeParityEstablished','audioListeningAccepted','humanAccepted',
  'ownerAccepted','strictComplete','published'])assert.equal(b[key],false,`browser gate ${key}`);
 same(b.source,{...SOURCE,path:path.join(SOURCE_ROOT,SOURCE.path)},'browser source');
 same(b.sourceXml,{...XML,path:path.join(SOURCE_ROOT,XML.path)},'browser source XML');
 same(b.main,{rootFrames:10,frameDomain:'sprite-315',sourceFrames:837,
  authoredStops:[384,523,650,766,815,834]},'browser source frame domain');
 assert(b.sourceGlossaryControlsPresent===false&&b.sourceOccurrences.length===0&&b.authoredButtonCount===7);
 assert.equal(b.activation.stage,'candidate');same(b.activation.host,HOST_PIN);same(b.activation.page,PROOF_PIN);
 assert.equal(b.cases.length,2);
 same(b.cases.map(row=>({name:row.name,locale:row.locale,width:row.width,
  height:row.height,reduced:row.reduced,answers:row.answers})),[
   {name:'en-desktop',locale:'en',width:1440,height:900,reduced:false,answers:'wrong-then-right'},
   {name:'es-mobile-reduced',locale:'es',width:390,height:844,reduced:true,answers:'two-wrong'},
  ],'formal EN desktop and ES mobile reduced-motion cases');
 const plannedAudio=new Map(proofAudio().map(pin=>[path.basename(pin.path,'.mp3'),pin]));
 same(Object.keys(b.audioDomains).sort(),[...plannedAudio.keys()].sort(),'all eleven source audio domains');
 for(const [domain,plan] of Object.entries(b.audioDomains)){
  const source=plannedAudio.get(domain);
  assert(source&&source.bytes===plan.bytes&&source.sha256===plan.sha256&&
   plan.samples>0&&[1,2].includes(plan.channels),'source-bound audio plan');
 }
 for(const row of b.cases){
  assert(row.status==='local-candidate-host-probe-passed-not-acceptance'&&row.response.status===200&&
   row.ready===true&&row.errors.length===0&&row.warnings.length===0&&
   row.cleanupErrors.length===0,'formal case has no browser or cleanup errors');
  assert(row.requests.every(request=>request.allowed===true),'same-origin browser requests');
  for(const frame of RUNTIME.sourceStops.filter(value=>value!==834))
   assert(row.observations.some(state=>
   state.label===`stop-${frame}`&&state.frame===frame&&state.sourceGlossaryControls==='0'&&
   state.glossaryDialogCount===0),`source stop ${frame}`);
  const entry=row.observations.find(state=>state.label==='entry');
  const terminal=row.observations.find(state=>state.label==='terminal');
  assert(entry?.frame===1&&entry.audio.started===0&&entry.audio.active===0&&
   terminal?.frame===834&&terminal.paused==='true'&&terminal.audio.active===0&&
   terminal.audio.maxActive===1&&terminal.sourceGlossaryControls==='0'&&
   terminal.glossaryDialogCount===0,'source entry, terminal stop and single audio voice');
  assert(row.observations.some(state=>state.label==='picture-release'&&state.frame===650));
  assert(row.observations.some(state=>state.label==='calculator-release'&&state.frame===766));
  assert(row.observations.some(state=>state.label==='double-replay'&&state.replay===2&&state.audio.maxActive===1));
  assert(row.navigation?.target==='shared-nms002-l02-p061'&&row.navigation.availability==='registered'&&
   row.navigation.audioActive===0,'navigation cleans up audio');
  same(row.feedbackDomains,row.answers==='two-wrong'?['sprite-138','sprite-150']:
   ['sprite-138','sprite-256'],'source-backed branch');
  for(const screenshot of row.screenshots)readPin(ROOT,screenshot);
  const audio=new Map(Object.entries(b.audioDomains).map(([domain,pin])=>[domain,pin]));
  assert(row.assetResponses.some(asset=>asset.domain==='sprite-315'));
  for(const asset of row.assetResponses){const pin=audio.get(asset.domain);
   assert(pin&&asset.status===200&&asset.bytes===pin.bytes&&asset.sha256===pin.sha256&&
    asset.contentType==='audio/mpeg'&&asset.redirected===false,'browser source audio response');}
  for(const decoded of row.decodes){
   const matched=[...audio.values()].find(pin=>pin.sha256===decoded.sha256);
   assert(matched&&matched.samples===decoded.samples&&matched.channels===decoded.channels&&
    decoded.sampleRate===22050,'decoded source audio plan');
  }
  assert(row.decodes.some(decoded=>decoded.sha256===MAIN_AUDIO.sha256&&decoded.samples===1503936));
  noAcceptance(row);
 }
 same(b.inputsBefore,b.inputsAfter,'browser input stability');
 evidencePins(b.inputsBefore,beforeTargets,'browser');
 assert(b.inputsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p062-formal-host-v2.mjs'));
 noAcceptance(b);
}
function validateContinuity(item,beforeTargets){
 const c=item.data;
 assert.equal(c.kind,'nms-l02-p062-formal-candidate-browser-continuity-v1');
 assert.equal(c.status,'technical-pass-not-acceptance');
 assert(c.formal===true&&c.inputStable===true&&c.browserProcessExited===true&&
  c.cleanupErrors.length===0,'continuity stable process');
 for(const key of ['originalRuntimeAccepted','audioListeningAccepted','humanAccepted',
  'ownerAccepted','strictComplete','published'])assert.equal(c[key],false,`continuity gate ${key}`);
 same(c.order,['p062','p061','p060','p058','p056','p055','p052','p062'],'exact eight-page traversal');
 assert(c.cases.length===2);same(c.cases.map(row=>row.locale),['en','es']);
 for(const row of c.cases){
  assert(row.status==='technical-pass-not-acceptance'&&row.contextClose==='closed'&&
   row.responseStatus===200&&row.errors.length===0&&row.responseErrors.length===0&&
   row.scriptResourceObserved===true,'continuity case and actual predecessor script');
  for(const label of ['p062-entry','p061-entry','p060-entry','p058-source-controls',
   'p056-source-controls','p055-source-controls','p052-ready','p062-return','p062-final-paused'])
   assert(row.observations.some(state=>state.step===label),`continuity observation ${label}`);
  const p062States=row.observations.filter(state=>state.step.startsWith('p062-'));
  assert(p062States.every(state=>state.controls.length===0&&state.dialogs===0),
   'P062 has no glossary controls in continuity');
  assert(row.dialogs.length===4&&row.dialogs.every(dialog=>dialog.focusReturned===true),
   'four predecessor glossary focus returns');
  assert(row.audio.maxActive===1&&row.audio.active===0&&
   Object.values(row.audio.byPage).every(bucket=>bucket.active===0),'all page audio stopped');
  for(const asset of ['/migration-assets/nms-l02-p062/sprite-315.mp3',
   '/migration-assets/nms-l02-p061/sprite-315.mp3',
   '/migration-assets/nms-l02-p060/sprite-391.mp3'])
   assert(row.assets.some(item=>new URL(item.url).pathname===asset&&item.status===200&&
    item.redirected===false),`continuity source audio ${asset}`);
  assert(row.developmentUpdates.every(item=>!item.url.includes('.hot-update.')),
   'no continuity HMR resource');
 }
 same(c.inputPinsBefore,c.inputPinsAfter,'continuity inputs stable');
 evidencePins(c.inputPinsBefore,beforeTargets,'continuity');
 assert(c.inputPinsBefore.some(pin=>pin.path==='scripts/probe-nms-l02-p062-continuity-v1.mjs'));
 noAcceptance(c);
}
function proofAudio(){
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP062ProofClosure(proof);
 assert.equal(proof.packet.audio.payloads.length,11);
 for(const pin of proof.packet.audio.payloads)readPin(ROOT,pin);
 return proof.packet.audio.payloads;
}
function validateProduction(result,beforeTargets){
 const intent=result.buildIntent.data,build=result.build.data,p=result.production.data,r=result.restoration.data;
 assert(intent.schemaVersion===1&&intent.kind==='nms-l02-p062-production-build-intent-v1');
 assert.equal(intent.logicalPath,LOGICAL_BUILD);assert.equal(intent.beforeTarget,OLD_BUILD);
 assert.equal(intent.temporaryTarget,NEW_BUILD);
 assert(build.schemaVersion===1&&build.kind==='p062-local-production-build-v1'&&
  build.exitCode===0&&build.inputsStable===true&&build.configRestored===true);
 same(build.inputsBefore,build.inputsAfter,'build inputs unchanged');
 same(intent.inputs,build.inputsBefore,'intent build inputs');
 same(intent.config,build.configBefore,'intent build config');
 same(build.configBefore,build.configAfterRestore,'production config restored');
 evidencePins(build.inputsBefore,beforeTargets,'build');
 evidencePins(build.configAfterRestore,beforeTargets,'build config',false);
 assert(r.schemaVersion===1&&r.kind==='nms-l02-p062-production-build-link-restoration-v1'&&
  r.logicalPath===LOGICAL_BUILD&&r.beforeTarget===OLD_BUILD&&r.temporaryTarget===NEW_BUILD&&
  r.afterTarget===OLD_BUILD&&r.restored===true&&r.buildSucceeded===true&&r.failure===null&&
  r.linkRestorationFailure===null&&r.configurationCleanupFailure===null,'isolated build restoration');
 const logical=path.join(ROOT,LOGICAL_BUILD);
 assert(fs.lstatSync(logical).isSymbolicLink()&&fs.readlinkSync(logical)===OLD_BUILD&&
  fs.realpathSync(logical)===OLD_BUILD,'original build link restored');
 assert.equal(fs.realpathSync(NEW_BUILD),NEW_BUILD);
 const physicalId=pinFile(NEW_BUILD,'BUILD_ID');
 same({...physicalId,path:`${NEW_BUILD}/BUILD_ID`},r.p062BuildId,'P062 build ID preserved');
 same({...physicalId,path:`${LOGICAL_BUILD}/BUILD_ID`},build.buildId,'successful build ID');
 for(const [name,root] of Object.entries(PRESERVED_BUILDS)){
  assert.equal(fs.realpathSync(root),root,`physical preserved ${name} build`);
  const actual={...pinFile(root,'BUILD_ID'),path:`${root}/BUILD_ID`};
  same(r[`${name}BuildIdBefore`],actual,`preserved ${name} BUILD_ID before`);
  same(r[`${name}BuildIdAfter`],actual,`preserved ${name} BUILD_ID after`);
 }
 same(intent.oldBuildId,r.oldBuildIdBefore,'original build intent');
 for(const name of ['p055','p057','p058','p060','p061'])
  same(intent[`preserved${name.toUpperCase()}BuildId`],r[`${name}BuildIdBefore`],
   `preserved ${name} build intent`);
 const dependencyTarget=path.join(ROOT,'node_modules');
 assert.equal(intent.dependencyLink,path.join(path.dirname(NEW_BUILD),'node_modules'));
 assert.equal(intent.dependencyTarget,dependencyTarget);
 assert.equal(intent.dependencyRealRoot,fs.realpathSync(dependencyTarget));
 assert(fs.lstatSync(intent.dependencyLink).isSymbolicLink()&&
  fs.readlinkSync(intent.dependencyLink)===dependencyTarget&&
  fs.realpathSync(intent.dependencyLink)===intent.dependencyRealRoot,
  'source-bounded build dependency link');
 same(intent.sharpPackage,{...pinFile(intent.dependencyRealRoot,'sharp/package.json'),
  path:'node_modules/sharp/package.json'},'pinned sharp dependency');
 assert(p.schemaVersion===1&&p.kind==='nms-l02-p062-local-production-negative-v1'&&
  p.status==='technical-pass-not-deployment'&&p.origin==='http://127.0.0.1:3332'&&
  p.inputStable===true&&p.errors.length===0&&p.expectedCases===224&&p.results.length===224&&
  p.results.every(row=>row.status===404&&row.pass===true&&row.bodyBytes<1000&&
   row.redirected===false&&['GET','HEAD'].includes(row.method)),'local production denies private routes');
 assert.equal(new Set(p.results.map(row=>row.path)).size,56,'exact 56 route variants');
 same(p.inputsBefore,p.inputsAfter,'production input stability');
 evidencePins(p.inputsBefore,beforeTargets,'production');
 assert.equal(p.activation.stage,'candidate');same(p.activation.host,HOST_PIN);same(p.activation.page,PROOF_PIN);
 same(p.directoryBinding,{logicalPath:LOGICAL_BUILD,physicalRoot:NEW_BUILD,symlinkTarget:NEW_BUILD},
  'production exact physical build');
 assert.equal(p.buildLog,`${BASE}/admission/production-build-v1.log`);
 assert(p.inputsBefore.some(pin=>pin.path===p.buildLog));
 assert.equal(p.buildIdBefore,fs.readFileSync(path.join(NEW_BUILD,'BUILD_ID'),'utf8').trim());
 assert.equal(p.buildIdAfter,p.buildIdBefore);
 noAcceptance(p);
}
export function verifyP062RegistrationEvidence(beforeTargets){
 const documents=Object.fromEntries(Object.entries(EVIDENCE).map(([name,relative])=>
  [name,evidenceDocument(relative)]));
 validateBrowser(documents.browser,beforeTargets);
 validateContinuity(documents.continuity,beforeTargets);
 validateProduction(documents,beforeTargets);
 return Object.fromEntries(Object.entries(documents).map(([name,value])=>[name,value.pin]));
}
function expectedActivation(current){
 assert.equal(current.data.schemaVersion,1);assert.equal(current.data.stage,'candidate');
 same(current.data.host,HOST_PIN);same(current.data.page,PROOF_PIN);
 const matches=current.source.match(/"stage": "candidate"/gu)??[];
 assert.equal(matches.length,1,'one activation stage field');
 return Buffer.from(current.source.replace('"stage": "candidate"','"stage": "registered"'));
}
function planBase(){
 localOnly();const activation=readActivation();
 assert.equal(activation.data.stage,'candidate','candidate activation only');
 same(activation.data.host,HOST_PIN);same(activation.data.page,PROOF_PIN);
 const witness=activation.data.predecessor;readPin(ROOT,witness);
 same(pinFile(ROOT,HOST),HOST_PIN);same(pinFile(ROOT,PROOF),PROOF_PIN);
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP062ProofClosure(proof);
 assert.equal(proof.registration.calibrationId,CALIBRATION);assert.equal(proof.registration.entries.length,1);
 assert.equal(proof.registration.entries[0].key,ID);
 same(proof.packet.source,SOURCE);same(proof.packet.sourceXml,XML);
 same(proof.packet.selectedPages[0].runtime,RUNTIME);
 assert(proof.packet.sourceKeyAttributeCalls===0&&proof.packet.glossary.sourceControlCount===0&&
  proof.packet.glossary.generatedTerms===null,'zero P062 glossary controls');
 assert(Object.values(proof.packet.acceptanceEffects).every(value=>value===false));
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT),before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===CALIBRATION),'P062 not yet registered');
 assert(!keys(before).includes(ID),'P062 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 same({oldTotal:oldKeys.length,newTotal:newKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(newKeys).length,oldLesson:lesson(oldKeys).length,newLesson:lesson(newKeys).length},
 COUNTS,'one exact P062 registration');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[ID],'only P062 added');
 for(const row of before.calibrations)
  same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `predecessor calibration retained ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyP062RegistrationEvidence(beforeMap);
 const generated=registrySources(after);
 const nextBytes=[json(after),...generated.map(value=>Buffer.from(value)),expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,index)=>bytePin(relative,nextBytes[index]));
 const descriptor=projectedDescriptor(false);
 return {producer:pinFile(ROOT,SELF),proof:PROOF_PIN,host:HOST_PIN,witness,evidence,
  before,after,beforePins,afterPins,nextBytes,descriptor};
}
function snapshotName(relative){return `${DIR}/${path.basename(relative)}.before`;}
function journal(event){fs.appendFileSync(path.join(ROOT,DIR,'journal.jsonl'),JSON.stringify({at:new Date().toISOString(),...event})+'\n');}
function writeNew(relative,bytes){fs.writeFileSync(path.join(ROOT,relative),bytes,{flag:'wx',mode:0o444});}
export function replacePinnedFile(root,relative,before,bytes,onRenamed=()=>{}){
 same(pinFile(root,relative),before,`compare-and-swap ${relative}`);
 const tmp=path.join(root,path.dirname(relative),`.${path.basename(relative)}.p062-${process.pid}.tmp`);
 const fd=fs.openSync(tmp,'wx',0o644);
 try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}
 try{same(pinFile(root,relative),before,`last compare-and-swap ${relative}`);
  fs.renameSync(tmp,path.join(root,relative));onRenamed();}
 catch(error){try{fs.unlinkSync(tmp);}catch{}throw error;}
 same(pinFile(root,relative),bytePin(relative,bytes),`written ${relative}`);
}
export function rollbackPinnedFiles(root,records,report=()=>{}){
 const outcomes=[];
 for(const {relative,beforeBytes,after} of [...records].reverse()){
  try{same(pinFile(root,relative),after,`rollback own bytes only ${relative}`);
   replacePinnedFile(root,relative,after,beforeBytes);
   outcomes.push({relative,status:'rolled-back'});report({step:'rolled-back',relative});
  }catch(error){outcomes.push({relative,status:'skipped',reason:String(error.message)});
   report({step:'rollback-skipped',relative,reason:String(error.message)});}
 }
 return outcomes;
}
function rollback(modified,plan){
 return rollbackPinnedFiles(ROOT,modified.map(index=>({relative:TARGETS[index],
  beforeBytes:readPin(ROOT,{...plan.beforePins[index],path:snapshotName(TARGETS[index])}),
  after:plan.afterPins[index]})),journal);
}
function write(plan){
 assert(!fs.existsSync(path.join(ROOT,DIR)),'registration directory must be absent');
 fs.mkdirSync(path.join(ROOT,DIR));
 const snapshots=[];
 for(const pin of plan.beforePins){const relative=snapshotName(pin.path);
  writeNew(relative,readPin(ROOT,pin));const snapshot=pinFile(ROOT,relative);
  same({...snapshot,path:pin.path},pin,'exact predecessor snapshot');snapshots.push(snapshot);}
 const intent={schemaVersion:1,kind:'nms-l02-p062-registration-intent-v1',animationId:ID,
  producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,evidence:plan.evidence,
  before:plan.beforePins,after:plan.afterPins,snapshots,counts:COUNTS,
  sourceLanguage:'fixed-en',spanishPresentation:'English-source-fallback',
  glossarySource:'no-P062-source-glossary-controls;preserve-25-predecessor-terms',
  originalRuntime:false,audioAcceptance:false,humanReview:false,ownerAcceptance:false,
  strictComplete:false,publication:false};
 writeNew(`${DIR}/intent.json`,json(intent));journal({step:'prepared',intent:pinFile(ROOT,`${DIR}/intent.json`)});
 const modified=[];
 try{
  const fresh=planBase();same(fresh.evidence,plan.evidence,'evidence compare-and-swap');
  same(fresh.afterPins,plan.afterPins,'projected output compare-and-swap');
  TARGETS.forEach((relative,index)=>same(pinFile(ROOT,relative),plan.beforePins[index],`pre-write ${relative}`));
  for(let index=0;index<3;index++){
   replacePinnedFile(ROOT,TARGETS[index],plan.beforePins[index],plan.nextBytes[index],()=>modified.push(index));
   journal({step:'written',relative:TARGETS[index],pin:plan.afterPins[index]});}
  same(readRegistryTransaction(ROOT).registry,plan.after,'canonical registry/dispatch');
  replacePinnedFile(ROOT,ACTIVATION,plan.beforePins[3],plan.nextBytes[3],()=>modified.push(3));
  journal({step:'written',relative:ACTIVATION,pin:plan.afterPins[3]});
  const descriptor=projectedDescriptor(true);
  const receipt={schemaVersion:1,kind:'nms-l02-p062-local-registration-v1',
   status:'registered-local-current-js-not-acceptance',animationId:ID,
   producer:plan.producer,proof:plan.proof,host:plan.host,witness:plan.witness,
   evidence:plan.evidence,intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,
   snapshots,outputs:plan.afterPins,counts:COUNTS,descriptor,
   sourceLanguage:intent.sourceLanguage,spanishPresentation:intent.spanishPresentation,
   glossarySource:intent.glossarySource,originalRuntime:false,audioAcceptance:false,
   humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return {status:'P062_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
 }catch(error){journal({step:'failure',reason:String(error.message)});rollback(modified,plan);throw error;}
}
function check(){
 localOnly();const receipt=readJsonPin(ROOT,pinFile(ROOT,RECEIPT));
 assert.equal(receipt.kind,'nms-l02-p062-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 assert.equal(receipt.animationId,ID);same(receipt.counts,COUNTS);
 for(const key of ['originalRuntime','audioAcceptance','humanReview','ownerAcceptance','strictComplete','publication'])
  assert.equal(receipt[key],false);
 same(receipt.producer,pinFile(ROOT,SELF));same(receipt.proof,PROOF_PIN);same(receipt.host,HOST_PIN);
 readPin(ROOT,receipt.witness);same(receipt.intent.path,`${DIR}/intent.json`);
 const intent=readJsonPin(ROOT,receipt.intent);
 assert.equal(intent.kind,'nms-l02-p062-registration-intent-v1');
 for(const field of ['animationId','producer','proof','host','witness','evidence','counts','snapshots'])
  same(intent[field],receipt[field],`intent/receipt ${field}`);
 same(intent.before,receipt.before);same(intent.after,receipt.outputs);
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyP062RegistrationEvidence(historical),receipt.evidence,'historical evidence persists');
 for(let index=0;index<TARGETS.length;index++){
  const relative=TARGETS[index];same(receipt.snapshots[index].path,snapshotName(relative));
  same(pinFile(ROOT,relative),receipt.outputs[index],`registered output ${relative}`);
  same(bytePin(relative,readPin(ROOT,receipt.snapshots[index])),receipt.before[index],
   `predecessor preserved ${relative}`);
 }
 const transaction=readRegistryTransaction(ROOT),prior=JSON.parse(readPin(ROOT,receipt.snapshots[0]));
 const nowKeys=keys(transaction.registry),oldKeys=keys(prior);
 same({oldTotal:oldKeys.length,newTotal:nowKeys.length,oldShared:shared(oldKeys).length,
  newShared:shared(nowKeys).length,oldLesson:lesson(oldKeys).length,newLesson:lesson(nowKeys).length},
  COUNTS,'registered counts');
 const proof=readJsonPin(ROOT,PROOF_PIN);validateP062ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===CALIBRATION),proof.registration);
 for(const row of prior.calibrations)
  same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
   `retained calibration ${row.calibrationId}`);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,PROOF_PIN);same(activation.data.host,HOST_PIN);
 same(activation.data.predecessor,receipt.witness);
 same(projectedDescriptor(true),receipt.descriptor);
 return {status:'P062_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT)};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P062_REGISTRATION_READY_NOT_WRITTEN',producer:plan.producer,proof:plan.proof,
    evidence:plan.evidence,before:plan.beforePins,after:plan.afterPins,counts:COUNTS,
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
