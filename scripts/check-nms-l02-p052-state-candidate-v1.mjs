import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {p052WrongCue} from '../packages/demos/src/nms-l02-p052-state-v1.ts';
import {p052WrongBranch} from './lib/nms-l02-p052-audio-windows-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pin=relative=>{const file=path.resolve(root,relative),b=fs.readFileSync(file);return {path:relative,bytes:b.length,sha256:createHash('sha256').update(b).digest('hex')};};
const inputs=['packages/demos/src/nms-l02-p052-state-v1.ts','packages/demos/tests/nms-l02-p052-state-v1.test.ts',
 'migrations/shared-nms002-l02-p052/audit/NATIVE_BEHAVIOR_CONTRACT_V1.md','scripts/lib/nms-l02-p052-audio-windows-v1.mjs'].map(pin);
let branches=0;for(let seed=0;seed<128;seed++)for(let attempt=0;attempt<32;attempt++){assert.equal(p052WrongCue(seed,attempt),p052WrongBranch(seed,attempt));branches++;}
const out=fs.mkdtempSync('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p052-state-check-');
const calls=[['source',process.execPath,['scripts/check-nms-l02-p052-intake-v1.mjs']],
 ['state',path.join(root,'node_modules/.bin/tsx'),['--test','packages/demos/tests/nms-l02-p052-state-v1.test.ts']],
 ['types',process.execPath,['node_modules/typescript/bin/tsc','--noEmit','--strict','--target','ES2022','--module','ESNext','--moduleResolution','bundler','--types','node','--esModuleInterop','--skipLibCheck','packages/demos/src/nms-l02-p052-state-v1.ts','packages/demos/tests/nms-l02-p052-state-v1.test.ts']]];
const checks=[];
for(const [name,command,args]of calls){const r=spawnSync(command,args,{cwd:root,encoding:'utf8',timeout:60000,maxBuffer:2*1024*1024});const log=path.join(out,name+'.log');fs.writeFileSync(log,(r.stdout??'')+(r.stderr??''),{flag:'wx'});checks.push({name,command,args,exitCode:r.status,log:pin(log)});assert.equal(r.status,0,log);}
for(const p of inputs)assert.deepEqual(pin(p.path),p);
const result={status:'UNREGISTERED_STATE_KERNEL_PASS',inputs,checks,branchAgreementCases:branches,
 claim:'11 state tests including101 initial answers and10100 retry combinations; targeted strict TypeScript only. No renderer, product admission, browser/session, original-runtime or acceptance claim.'};
fs.writeFileSync(path.join(out,'receipt.json'),JSON.stringify(result,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({status:result.status,out,checks:checks.length,branchAgreementCases:branches}));
