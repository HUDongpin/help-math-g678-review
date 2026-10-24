#!/usr/bin/env node
/** One exact, local P056 registry transaction. Planning never writes files. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile, readPin, readJsonPin, readRegistryTransaction, registrySources,
  REGISTRY, DISPATCH, sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
import {P056_ADMISSION_ID, P056_ADMISSION_CALIBRATION, P056_SOURCE_ROOT,
  validateP056ProofClosure} from '../lib/nms-l02-p056-admission-semantics.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const BASE='output/nms-l02-p056-product-20260927';
const DIR=`${BASE}/registration`;
const RECEIPT=`${DIR}/receipt.json`;
const ACTIVATION='apps/web/lib/nms-l02-p056-admission-activation.ts';
const PROOF='work/g678-workflow/candidates/shared-nms002-l02-p056-v1.json';
const HOST='catalog/nms-l02-admission-v1/host-v6.json';
const EVIDENCE={browser:`${BASE}/browser/formal-candidate-v1/evidence.json`,
 natural:`${BASE}/natural-end/formal-candidate-v2/evidence.json`,
 continuity:`${BASE}/continuity/browser/formal-candidate-v1/result.json`,
 build:`${BASE}/admission/production-build-receipt-v1.json`,
 production:`${BASE}/production/candidate-v2.json`};
const TARGETS=[REGISTRY,...DISPATCH,ACTIVATION];
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const keys=registry=>registry.calibrations.flatMap(row=>row.entries.map(entry=>entry.key));
const shared=values=>values.filter(key=>/^shared-(?:nms002|geo001|alg001|dat001)-l\d{2}-p\d{3}$/u.test(key));
const same=(left,right,label)=>assert.deepStrictEqual(left,right,label);

function localOnly(){
 assert.equal(fs.realpathSync(ROOT),ROOT,'physical local worktree');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,P056_SOURCE_ROOT,'exact real source root');
 assert.equal(fs.realpathSync(P056_SOURCE_ROOT),P056_SOURCE_ROOT,'physical source root');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,'local transaction only');
}
function readActivation(){
 const bytes=readPin(ROOT,pinFile(ROOT,ACTIVATION));
 const source=bytes.toString();
 const marker='export const NMS_L02_P056_ADMISSION:NmsL02AdmissionActivation|null=';
 assert(source.includes(marker),'exact activation export');
 const data=JSON.parse(source.slice(source.indexOf(marker)+marker.length).trim().replace(/;$/u,''));
 return {data,bytes,source};
}
function serverDescriptor(expectedRegistered){
 const code=`import {nmsL02P056AdmissionDescriptor} from './apps/web/lib/nms-l02-p056-admission.server.ts';
const result=nmsL02P056AdmissionDescriptor();
if(result.registered!==${expectedRegistered} || result.descriptor.pages.length!==64 ||
 result.descriptor.productBridge.registeredAnimationCount!==56) throw Error('P056 descriptor transaction mismatch');
if(result.descriptor.pages[55].animationId!=='${P056_ADMISSION_ID}') throw Error('P056 descriptor placement');
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
  else if(pin.path==='apps/web/.next-alg-p001-production-scan/BUILD_ID') continue;
  else readPin(ROOT,pin);
 }
 return pins;
}
function checkBuildDirectory(binding,buildIdPin){
 assert(binding&&binding.logicalPath==='apps/web/.next-alg-p001-production-scan','exact build directory');
 assert.equal(binding.physicalRoot,'/Volumes/American Dream/hudongpin/g678-p055-build-output-20260927/next-output');
 assert.equal(binding.symlinkTarget,binding.physicalRoot,'bound symlink target');
 const link=path.join(ROOT,binding.logicalPath);
 assert(fs.lstatSync(link).isSymbolicLink(),'build output is expected symlink');
 assert.equal(fs.readlinkSync(link),binding.symlinkTarget,'build symlink unchanged');
 assert.equal(fs.realpathSync(link),binding.physicalRoot,'physical build directory');
 assert.equal(buildIdPin.path,`${binding.logicalPath}/BUILD_ID`,'exact logical BUILD_ID');
 const physical=pinFile(binding.physicalRoot,'BUILD_ID');
 same({...physical,path:buildIdPin.path},buildIdPin,'physical BUILD_ID bytes');
 return readPin(binding.physicalRoot,physical).toString().trim();
}
/** Validate the real evidence and its exact pre-transaction input closure. */
export function verifyP056RegistrationEvidence(beforeTargets){
 const result=Object.fromEntries(Object.entries(EVIDENCE).map(([name,relative])=>[name,verifiedEvidencePin(relative)]));
 const b=result.browser.data;
 assert.equal(b.kind,'nms-l02-p056-candidate-host-probe-plan-v1');
 assert.equal(b.status,'candidate-host-functional-probe-passed-not-acceptance');
 assert(b.passed===true&&b.expectedStage==='candidate'&&b.inputsUnchanged===true&&b.browserProcessExited===true);
 assert(Array.isArray(b.records)&&b.records.length===6&&b.records.every(row=>row.status===b.status));
 assert(Array.isArray(b.cases)&&b.cases.length===6&&b.cleanupErrors.length===0);
 same(b.inputs,b.inputsAfter,'candidate browser inputs unchanged');checkInputPins(b.inputs,beforeTargets);
 const n=result.natural.data;
 assert.equal(n.status,'natural-end-candidate-probe-passed-not-acceptance');
 assert(n.inputsUnchanged===true&&n.sourceUnchanged===true&&n.browserProcessExited===true);
 assert(n.errors.length===0&&n.warnings.length===0&&n.cleanupErrors.length===0);
 same(n.inputsBefore,n.inputsAfter,'natural-end inputs unchanged');checkInputPins(n.inputsBefore,beforeTargets);
 assert.equal(sha256(fs.readFileSync(n.sourcePin.path)),n.sourcePin.sha256,'natural-end physical source');
 readPin(ROOT,n.audioPin);
 const c=result.continuity.data;
 assert.equal(c.kind,'nms-l02-p056-predecessor-resource-browser-continuity-v1');
 assert.equal(c.status,'technical-pass-not-acceptance');
 assert(c.inputStable===true&&c.browserProcessExited===true&&c.cleanupErrors.length===0);
 assert(c.cases.length===2&&c.cases.every(row=>row.status==='technical-pass-not-acceptance'));
 checkInputPins(c.inputPins,beforeTargets);
 const build=result.build.data;
 assert.equal(build.kind,'p056-local-production-build-v1');
 assert(build.exitCode===0&&build.inputsStable===true&&build.configRestored===true);
 same(build.inputsBefore,build.inputsAfter,'build inputs unchanged');
 same(build.configBefore,build.configAfterRestore,'build configuration restored');
 checkInputPins(build.inputsBefore,beforeTargets);checkInputPins(build.configAfterRestore,beforeTargets);
 const p=result.production.data;
 assert.equal(p.kind,'nms-l02-p056-local-production-negative-v1');
 assert.equal(p.status,'technical-pass-not-deployment');
 assert(p.inputStable===true&&p.expectedCases===60&&p.errors.length===0);
 assert(p.results.length===60&&p.results.every(row=>row.status===404&&row.pass===true&&
  row.bodyBytes<1000&&row.redirected===false&&['GET','HEAD'].includes(row.method)));
 same(p.inputsBefore,p.inputsAfter,'production inputs unchanged');
 checkInputPins(p.inputsBefore,beforeTargets);
 assert.equal(p.buildLog,`${BASE}/admission/production-build-v1.log`,'exact successful build log');
 assert(p.inputsBefore.some(pin=>pin.path===p.buildLog),'production pins build log');
 same(p.activation.stage,'candidate','production exercised candidate activation');
 const buildId=checkBuildDirectory(p.directoryBinding,build.buildId);
 assert.equal(p.buildIdBefore,buildId);assert.equal(p.buildIdAfter,buildId);
 const prodBuildId=p.inputsBefore.find(pin=>pin.path===build.buildId.path);
 same(prodBuildId,build.buildId,'production uses exact successful BUILD_ID');
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
 same(proofPin,pinFile(ROOT,PROOF),'immutable P056 proof');
 same(hostPin,pinFile(ROOT,HOST),'immutable host-v6');readPin(ROOT,witnessPin);
 const proof=readJsonPin(ROOT,proofPin);validateP056ProofClosure(proof);
 assert.equal(proof.animationId,P056_ADMISSION_ID);
 assert.equal(proof.registration.calibrationId,P056_ADMISSION_CALIBRATION);
 assert.equal(proof.registration.entries.length,1);
 assert.equal(proof.registration.entries[0].key,P056_ADMISSION_ID);
 assert(Object.values(proof.packet.acceptanceEffects).every(value=>value===false),'acceptance remains false');
 readPin(ROOT,proof.freeze);
 for(const pin of proof.files)readPin(ROOT,pin);
 for(const external of proof.external)readPin(external.root,external.pin);
 const transaction=readRegistryTransaction(ROOT);
 const before=transaction.registry;
 assert(!before.calibrations.some(row=>row.calibrationId===P056_ADMISSION_CALIBRATION),'P056 absent');
 assert(!keys(before).includes(P056_ADMISSION_ID),'P056 key absent');
 const after=upsertPrivateCurrentJsCalibration(before,proof.registration);
 const oldKeys=keys(before),newKeys=keys(after);
 assert(oldKeys.length===629&&newKeys.length===630,'exact local page count');
 assert(shared(oldKeys).length===487&&shared(newKeys).length===488,'exact shared page count');
 same(newKeys.filter(key=>!oldKeys.includes(key)),[P056_ADMISSION_ID],'one new key');
 for(const row of before.calibrations)same(after.calibrations.find(item=>item.calibrationId===row.calibrationId),row,
  `preserve old calibration ${row.calibrationId}`);
 const beforePins=TARGETS.map(relative=>pinFile(ROOT,relative));
 const beforeMap=new Map(beforePins.map(pin=>[pin.path,pin]));
 const evidence=verifyP056RegistrationEvidence(beforeMap);
 const dispatch=registrySources(after);
 const nextBytes=[json(after),...dispatch.map(value=>Buffer.from(value)),expectedActivation(activation)];
 const afterPins=TARGETS.map((relative,i)=>bytePin(relative,nextBytes[i]));
 const candidateDescriptor=serverDescriptor(false);
 return {proof:proofPin,host:hostPin,witness:witnessPin,before,beforePins,after,afterPins,nextBytes,
  evidence,candidateDescriptor};
}
function snapshotName(relative){return `${DIR}/${path.basename(relative)}.before`;}
function journal(event){fs.appendFileSync(path.join(ROOT,DIR,'journal.jsonl'),JSON.stringify({at:new Date().toISOString(),...event})+'\n');}
function writeNew(relative,bytes){fs.writeFileSync(path.join(ROOT,relative),bytes,{flag:'wx',mode:0o444});}
export function replacePinnedFile(root,relative,before,bytes,onRenamed=()=>{}){
 same(pinFile(root,relative),before,`compare-and-swap ${relative}`);
 const tmp=path.join(root,path.dirname(relative),`.${path.basename(relative)}.p056-${process.pid}.tmp`);
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
 const intent={schemaVersion:1,kind:'nms-l02-p056-registration-intent-v1',animationId:P056_ADMISSION_ID,
  proof:plan.proof,host:plan.host,witness:plan.witness,evidence:plan.evidence,
  before:plan.beforePins,after:plan.afterPins,snapshots,counts:{oldTotal:629,newTotal:630,oldShared:487,newShared:488},
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
  const receipt={schemaVersion:1,kind:'nms-l02-p056-local-registration-v1',status:'registered-local-current-js-not-acceptance',
   animationId:P056_ADMISSION_ID,proof:plan.proof,host:plan.host,witness:plan.witness,evidence:plan.evidence,
   intent:pinFile(ROOT,`${DIR}/intent.json`),before:plan.beforePins,snapshots,outputs:plan.afterPins,
   counts:intent.counts,descriptor,originalRuntime:false,audioAcceptance:false,humanReview:false,
   ownerAcceptance:false,strictComplete:false,publication:false};
  journal({step:'ready-to-commit'});writeNew(RECEIPT,json(receipt));
  return {status:'P056_REGISTERED_LOCAL_CURRENT_JS_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
 }catch(error){journal({step:'failure',reason:String(error.message)});rollback(modified,plan);throw error;}
}
function check(){
 localOnly();
 const receipt=readJsonPin(ROOT,pinFile(ROOT,RECEIPT));
 assert.equal(receipt.kind,'nms-l02-p056-local-registration-v1');
 assert.equal(receipt.status,'registered-local-current-js-not-acceptance');
 same(receipt.counts,{oldTotal:629,newTotal:630,oldShared:487,newShared:488},'receipt counts');
 assert(['originalRuntime','audioAcceptance','humanReview','ownerAcceptance','strictComplete','publication'].every(k=>receipt[k]===false));
 readPin(ROOT,receipt.proof);readPin(ROOT,receipt.host);readPin(ROOT,receipt.witness);
 const intent=readJsonPin(ROOT,receipt.intent);
 same(intent.before,receipt.before);same(intent.after,receipt.outputs);same(intent.snapshots,receipt.snapshots);
 same(intent.proof,receipt.proof);same(intent.host,receipt.host);same(intent.witness,receipt.witness);
 same(intent.evidence,receipt.evidence,'exact intent evidence');
 const historical=new Map(receipt.before.map(pin=>[pin.path,pin]));
 same(verifyP056RegistrationEvidence(historical),receipt.evidence,'exact pre-registration evidence');
 for(let i=0;i<TARGETS.length;i++){
  same(pinFile(ROOT,TARGETS[i]),receipt.outputs[i],`registered output ${TARGETS[i]}`);
  const snapshot=readPin(ROOT,receipt.snapshots[i]);
  same(bytePin(TARGETS[i],snapshot),receipt.before[i],`preserved input ${TARGETS[i]}`);
 }
 const transaction=readRegistryTransaction(ROOT);
 const beforeRegistry=JSON.parse(readPin(ROOT,receipt.snapshots[0]));
 assert(keys(transaction.registry).length===630&&shared(keys(transaction.registry)).length===488);
 assert(keys(beforeRegistry).length===629&&shared(keys(beforeRegistry)).length===487);
 const proof=readJsonPin(ROOT,receipt.proof);validateP056ProofClosure(proof);
 same(transaction.registry.calibrations.find(row=>row.calibrationId===P056_ADMISSION_CALIBRATION),proof.registration);
 for(const row of beforeRegistry.calibrations)same(transaction.registry.calibrations.find(item=>item.calibrationId===row.calibrationId),row);
 const activation=readActivation();assert.equal(activation.data.stage,'registered');
 same(activation.data.page,receipt.proof);same(activation.data.host,receipt.host);
 same(activation.data.predecessor,receipt.witness);
 const descriptor=serverDescriptor(true);same(descriptor,receipt.descriptor);
 return {status:'P056_REGISTRATION_CHECKED_NOT_ACCEPTANCE',receipt:pinFile(ROOT,RECEIPT),descriptor};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{
  assert.equal(process.argv.length,3,'use --plan | --write | --check');
  const mode=process.argv[2];assert(['--plan','--write','--check'].includes(mode),'exact mode');
  const result=mode==='--check'?check():(()=>{const plan=planBase();return mode==='--plan'?
   {status:'P056_REGISTRATION_READY_NOT_WRITTEN',proof:plan.proof,evidence:plan.evidence,
    before:plan.beforePins,after:plan.afterPins,counts:{oldTotal:629,newTotal:630,oldShared:487,newShared:488},
    registrationEffect:'none',acceptanceEffect:'none'}:write(plan);})();
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
