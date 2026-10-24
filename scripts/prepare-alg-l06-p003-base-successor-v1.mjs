#!/usr/bin/env node
/** Preserve the failed base guard and admit the exact historical module names. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,uniquePins,verifyHostVersion,readPageProof,readRegistryTransaction} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
const root=fs.realpathSync(fileURLToPath(new URL('..',import.meta.url)));
const indexPin={path:'catalog/g678-admission-v1/index-v17.json',bytes:2150,sha256:'a592875b781ced6c50fe128f3f1a50b36cf120dd19f88d0f4c1722efe54caef4'};
const file='apps/web/lib/alg-l06-p003-formal-base-v1.server.ts';
const snapshotPath='output/alg-l06-p003-audio-alignment-20260928/formal-v1/base-fix/rejected-formal-base-v1.server.ts';
assert.equal(process.argv[2],'--prepare');
const index=readJsonPin(root,indexPin),host=verifyHostVersion(root,index.host);
const row=index.pages.find(p=>p.animationId==='shared-alg001-l06-p003'),proof=readJsonPin(root,row.proof);
const old=proof.files.find(p=>p.path===file),snapshot=pinFile(root,snapshotPath),current=pinFile(root,file);
assert.equal(old.sha256,'6e6e43d334fac6419cacd4e4b56994cf4fca9f31d15ded689a87b22b2e47b0a0');
assert.deepEqual({...snapshot,path:file},old);
assert.equal(current.sha256,'8a50eeabe8cc64dc414c1faa3afaf5ef5d63ed99bb810a0cd394e4f94ef7a4e9');
const before=readPin(root,snapshot).toString(),after=readPin(root,current).toString();
assert.equal(before.replace("c.deploymentScope==='local-only'&&e.module===`./modules/${e.key}`,'canonical local module'",
 "c.deploymentScope==='local-only'&&(e.key!==ID||e.module===`./modules/${ID}`),'P003 canonical local module'"),after);
const write=(file,value)=>{const bytes=Buffer.from(JSON.stringify(value,null,2)+'\n');fs.writeFileSync(path.join(root,file),bytes,{flag:'wx'});return pinFile(root,file);};
const nextProof=write('catalog/g678-admission-v1/shared-alg001-l06-p003-base-successor-v2.json',{
 ...proof,previousProof:row.proof,files:proof.files.filter(pin=>pin.path!==file),
 hostInputTransition:'Canonical module key required for P003; historical registrations retain their exact frozen module names.'});
const nextHost=write('catalog/g678-admission-v1/host-v18.json',{...host,previous:index.host,
 files:uniquePins([...host.files,current,snapshot]),
 legacyInputTransitions:[...host.legacyInputTransitions,{original:old,current,snapshot}]});
const nextIndex={...index,host:nextHost,pages:index.pages.map(p=>p===row?{...p,proof:nextProof}:p)};
const nextIndexPin=write('catalog/g678-admission-v1/index-v18.json',nextIndex);
const transaction=readRegistryTransaction(root),registry=upsertPrivateCurrentJsCalibration(transaction.registry,proof.registration);
for(const p of nextIndex.pages)readPageProof(root,p.proof,verifyHostVersion(root,nextHost),{...transaction,registry});
console.log(JSON.stringify({status:'roundtrip-passed-not-registered',index:nextIndexPin,proof:nextProof,current,snapshot}));
