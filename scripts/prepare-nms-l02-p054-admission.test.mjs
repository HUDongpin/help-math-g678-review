import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';
import {assertP054HostPageOverlap,buildP054AdmissionPlan,buildP054Packet,
 P054_HOST_V15_PATH,verifyP054AdmissionPlan} from './prepare-nms-l02-p054-admission.mjs';
import * as S from '../lib/nms-l02-p054-proof-semantics-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const outputs=[S.P054_FREEZE_PATH,S.P054_FRAGMENT_PATH,S.P054_PROOF_PATH];
const snapshot=()=>outputs.map(relative=>fs.existsSync(path.join(root,relative))?
 fs.readFileSync(path.join(root,relative)):null);

test('P054 dry plan binds both source levels, 30 external pins and leaves registry/output unchanged',()=>{
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,S.P054_SOURCE_ROOT);
 const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
 const beforeRegistry=fs.readFileSync(registryPath),beforeOutputs=snapshot();
 const plan=buildP054AdmissionPlan({root});
 assert.deepStrictEqual(plan.packet.selectedPages[0].runtime,S.P054_RUNTIME);
 assert.equal(plan.packet.selectedPages[0].globalPageOrdinal,54);
 assert.equal(plan.packet.resources.externalPins.length,26);
 assert.equal(plan.proof.external.length,30);
 assert.equal(plan.packet.integrity.files.length,59);
 assert.equal(plan.proof.files.length,61);
 assert.equal(plan.projected.calibrations.flatMap(row=>row.entries).length,637);
 assert.equal(plan.packet.behavior.terminalOutcome,'terminal-unresolved');
 assert.equal(plan.packet.behavior.parentResultTransitionEstablished,false);
 assert(Object.values(plan.packet.acceptanceEffects).every(value=>value===false));
 const member=JSON.parse(fs.readFileSync(path.join(root,S.P054_MEMBER_PATH)));
 assert.deepStrictEqual(plan.packet.entry.artifacts.module,member.module);
 assert.deepStrictEqual(plan.packet.entry.artifacts.timeline,member.timeline);
 assert.deepStrictEqual(plan.packet.entry.artifacts.sourceRun,member.sourceRun);
 assert.deepStrictEqual(fs.readFileSync(registryPath),beforeRegistry);
 assert.deepStrictEqual(snapshot(),beforeOutputs);
 assert.throws(()=>verifyP054AdmissionPlan(plan,{witnessPath:'wrong',hostPath:P054_HOST_V15_PATH}),
  /exact executed predecessor witness/);
});

test('P054 page proof rejects an inherited host path collision',()=>{
 const page=[{path:'only-page',bytes:1,sha256:'a'.repeat(64)}];
 const host=[{path:'only-host',bytes:1,sha256:'b'.repeat(64)}];
 assert.equal(assertP054HostPageOverlap(page,host),true);
 assert.throws(()=>assertP054HostPageOverlap([...page,...host],host),
  /P054 page proof and shared host are disjoint/);
});

test('P054 packet cannot promote completion, legacy entry or gate acceptance',()=>{
 const member=JSON.parse(fs.readFileSync(path.join(root,S.P054_MEMBER_PATH)));
 const run=JSON.parse(fs.readFileSync(path.join(root,S.P054_RUN_PATH)));
 const packet=buildP054Packet({pins:[],artifacts:{kind:'maintained-dom-module-v1',
  module:member.module,timeline:member.timeline,sourceRun:member.sourceRun,
  memberManifest:{path:S.P054_MEMBER_PATH,bytes:1,sha256:'a'.repeat(64)}},
  run,externalPins:[...run.reveal,...run.audio.feedback].sort((a,b)=>a.path.localeCompare(b.path))});
 assert.equal(packet.behavior.hostPlaybackCompletion,false);
 assert.equal(packet.behavior.earlierP053EntryReachabilityEstablished,false);
 assert.equal(packet.resources.resultMusicActivated,false);
 assert(Object.values(packet.acceptanceEffects).every(value=>value===false));
 const bad=structuredClone(packet);bad.behavior.hostPlaybackCompletion=true;
 const freeze={path:S.P054_FREEZE_PATH,bytes:1,sha256:'a'.repeat(64)};
 const registration={calibrationId:S.P054_ADMISSION_CALIBRATION,deploymentScope:'local-only',
  freezeManifest:S.P054_FREEZE_PATH,freezeManifestBytes:1,
  freezeManifestSha256:'a'.repeat(64),entries:[bad.entry]};
 assert.throws(()=>S.validateP054AdmissionSemantics({...bad,freezeManifest:freeze},registration),
  /matching behavior and unresolved terminal/);
});

test('P054 admission refuses a compatibility source root before source reads',()=>{
 const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
 try{process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/compatibility-source';
  assert.throws(()=>buildP054AdmissionPlan({root}),/exact AWS source root/);
 }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
  else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});
