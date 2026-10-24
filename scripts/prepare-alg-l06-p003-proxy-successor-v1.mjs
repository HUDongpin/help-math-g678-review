#!/usr/bin/env node
/** Preserve failed v16 and old P006 proof; account explicitly for P003 proxy guards. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readRegistryTransaction,readPageProof,verifyHostVersion,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const indexPin={path:'catalog/g678-admission-v1/index-v16.json',bytes:2131,sha256:'348339a6e67a79da6a533c746af63e19135fb326f998c886b2082d073e4d402e'};
const BASE='output/alg-l06-p003-audio-alignment-20260928/formal-v1/proxy-successor';
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(file,bytes)=>({path:file,bytes:bytes.length,sha256:sha256(bytes)});
const write=(file,bytes)=>{const target=path.join(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target))assert.deepEqual(readPin(root,bytePin(file,bytes)),bytes);
 else fs.writeFileSync(target,bytes,{flag:'wx'});return pinFile(root,file);};
assert.equal(process.argv[2],'--prepare');assert.equal(process.argv.length,3);
const index=readJsonPin(root,indexPin);
assert.equal(index.pages.length,7);
const host=verifyHostVersion(root,index.host),row=index.pages.find(p=>p.animationId==='shared-alg001-l12-p006');
const proof=readJsonPin(root,row.proof),old=proof.files.find(p=>p.path==='apps/web/proxy.ts');
assert.deepEqual(old,{path:'apps/web/proxy.ts',bytes:14057,sha256:'74f44ae3b2d7298ff3201709f12dd64a4eacb2352abb6e7a7b241f750b62dbd2'});
const current=pinFile(root,old.path);assert.equal(current.sha256,'fb9a05759fe45c21b218516273c5880b0320762bd86c131f532075a31a99d181');
let prior=readPin(root,current).toString();
const additions=[
 "import {isP003OptionalSpanishRequest,P003_OPTIONAL_SPANISH_PATH} from './lib/alg-l06-p003-optional-spanish-access-v1';\n",
 "import {isP003ContinuousHostSearch} from './lib/alg-l06-p003-local-audio-request-v1';\n",
 "import {isP003ContinuousSourceRequest} from './lib/alg-l06-p003-continuous-source-access-v2';\n",
 "  if (pathname === '/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2')\n    return ['GET', 'HEAD'].includes(request.method) && isP003ContinuousHostSearch(request.nextUrl.searchParams, true) && isG678LocalPreviewRequestUrl(request.nextUrl);\n",
 "  if(pathname===P003_OPTIONAL_SPANISH_PATH)return isP003OptionalSpanishRequest({method:request.method,url:request.nextUrl,headers:request.headers});\n",
 "  if (pathname === '/flash-assets/g678-local/shared-alg001-l06-p003/continuous-source-v2')\n    return isP003ContinuousSourceRequest({method: request.method, url: request.nextUrl, headers: request.headers});\n",
 "normalizedLocaleFree === '/migration-status/g678-calibration/shared-alg001-l06-p003/continuous-v2' || ",
];
for(const addition of additions){assert.equal(prior.split(addition).length,2);prior=prior.replace(addition,'');}
assert.deepEqual(bytePin(old.path,Buffer.from(prior)),old,'hash-proven exact predecessor reconstruction');
const snapshot=write(`${BASE}/recovered-proxy-predecessor.ts`,Buffer.from(prior));
const successor={...proof,previousProof:row.proof,
 hostInputTransition:'P003-only proxy guards; historical packet and registration unchanged',
 files:proof.files.filter(pin=>pin.path!==old.path)};
const successorPin=write('catalog/g678-admission-v1/shared-alg001-l12-p006-proxy-successor-v2.json',json(successor));
const nextHost={...host,previous:index.host,
 files:uniquePins([...host.files,current,snapshot]),
 legacyInputTransitions:[...host.legacyInputTransitions,{original:old,current,snapshot}]};
const hostPin=write('catalog/g678-admission-v1/host-v17.json',json(nextHost));
const nextIndex={...index,host:hostPin,pages:index.pages.map(p=>p===row?{...p,proof:successorPin}:p)};
const nextIndexPin=write('catalog/g678-admission-v1/index-v17.json',json(nextIndex));
const transaction=readRegistryTransaction(root);
const p003=readJsonPin(root,index.pages.find(p=>p.animationId==='shared-alg001-l06-p003').proof);
const projected={...transaction,registry:upsertPrivateCurrentJsCalibration(transaction.registry,p003.registration)};
for(const p of nextIndex.pages)readPageProof(root,p.proof,verifyHostVersion(root,hostPin),projected);
const receipt={kind:'p003-proxy-history-successor-v1',status:'common-reader-roundtrip-passed-not-registered',
 originalProof:row.proof,successor:successorPin,originalProxy:old,currentProxy:current,snapshot,
 recovery:'exact inverse of seven P003-only additions, verified against prior frozen byte count and SHA-256',
 retainedFailedIndex:pinFile(root,indexPin.path),index:nextIndexPin,
 originalPacketAndRegistrationUnchanged:true,registered:false};
write(`${BASE}/receipt.json`,json(receipt));console.log(JSON.stringify(receipt));
