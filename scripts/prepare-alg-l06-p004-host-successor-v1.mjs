#!/usr/bin/env node
/** Compose the exact P004 local resource/route host successor. No registration. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,readJsonPin,readPageProof,readRegistryTransaction,sha256,uniquePins}
 from '../lib/g678-admission-proof.mjs';

const ROOT=fs.realpathSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'));
const INDEX={path:'catalog/g678-admission-v1/index-v18.json',bytes:2168,
 sha256:'deedd0fc11cdd9ffbba8a90b8c78de89351600648ac77c85332e660080ec8ec7'};
const HOST={path:'catalog/g678-admission-v1/host-v18.json',bytes:60668,
 sha256:'4a37297f2a35606a26670879557d379543a5049bc9a730e2217fb1654b958546'};
const ACTIVATION={path:'apps/web/lib/g678-admission-activation.ts',bytes:291,
 sha256:'abc52b4b4a154e8906e411c1ad4828b0a6348efa2eacdd6ee23c3c63ea368977'};
const SNAPSHOT_ROOT='output/alg-l06-p004-host-successor-v1/predecessor';
const CHANGED=Object.freeze([
 {path:'apps/web/proxy.ts',snapshot:`${SNAPSHOT_ROOT}/proxy-v18.ts`},
 {path:'apps/web/next.config.ts',snapshot:`${SNAPSHOT_ROOT}/next-config-v18.ts`},
]);
const SNAPSHOTS=Object.freeze([
 [INDEX,`${SNAPSHOT_ROOT}/index-v18.json`],
 [HOST,`${SNAPSHOT_ROOT}/host-v18.json`],
 [ACTIVATION,`${SNAPSHOT_ROOT}/activation-v18.ts`],
]);
const ADDITIONS=Object.freeze([
 'apps/web/lib/alg-l06-p004-local-request-v1.ts',
 'apps/web/lib/alg-l06-p004-predecessor-request-v1.ts',
 'apps/web/lib/alg-l06-p004-candidate-v1.server.ts',
 'apps/web/lib/alg-l06-p004-resources-v1.server.ts',
 'apps/web/lib/alg-l06-p004-predecessor-resources-v1.server.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/canvas-v1/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/continuous-source-v1/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/optional-spanish-audio-v1/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/canvas/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/main/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-alg001-l06-p004/predecessor/spanish/route.ts',
]);
const HOST_OUTPUT='catalog/g678-admission-v1/host-v19.json';
const INDEX_OUTPUT='catalog/g678-admission-v1/index-v19.json';
const RECEIPT_OUTPUT='output/alg-l06-p004-host-successor-v1/host-v19-receipt.json';
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytesPin=(file,bytes)=>({path:file,bytes:bytes.length,sha256:sha256(bytes)});
const equal=(a,b)=>assert.deepEqual(a,b);
const uniquePaths=rows=>{assert.equal(new Set(rows.map(x=>x.path)).size,rows.length);return rows;};
function readSnapshot(expected,snapshot){
 const pin=pinFile(ROOT,snapshot),bytes=readPin(ROOT,pin);
 assert.equal(pin.bytes,expected.bytes);assert.equal(pin.sha256,expected.sha256);
 equal(bytes,readPin(ROOT,expected));return pin;
}
function writeNew(file,bytes){
 const target=path.join(ROOT,file);fs.mkdirSync(path.dirname(target),{recursive:true});
 try{fs.writeFileSync(target,bytes,{flag:'wx'});}catch(error){
  if(error?.code!=='EEXIST')throw error;
  equal(readPin(ROOT,bytesPin(file,bytes)),bytes);
 }
 return pinFile(ROOT,file);
}
function plan(){
 for(const [original,snapshot] of SNAPSHOTS)readSnapshot(original,snapshot);
 const index=readJsonPin(ROOT,INDEX),oldHost=readJsonPin(ROOT,HOST);
 equal(index.host,HOST);
 assert.equal(index.schemaVersion,1);assert.equal(index.kind,'g678-admission-index-v1');
 assert.equal(index.pages.length,7);
 assert.equal(oldHost.kind,'g678-admission-host-v1');
 assert.equal(oldHost.contract,'source-native-current-js-v1');
 equal(uniquePins(oldHost.files),oldHost.files);
 const originalPins=new Map(oldHost.files.map(pin=>[pin.path,pin]));
 const changed=[];
 for(const item of CHANGED){
  const original=originalPins.get(item.path);
  assert(original,`v18 input missing: ${item.path}`);
  const snapshot=pinFile(ROOT,item.snapshot);
  assert.equal(snapshot.bytes,original.bytes);
  assert.equal(snapshot.sha256,original.sha256);
  const current=pinFile(ROOT,item.path);
  assert.notEqual(current.sha256,original.sha256,`no reviewed delta: ${item.path}`);
  changed.push({original,current,snapshot});
 }
 for(const pin of oldHost.files){
  if(CHANGED.some(item=>item.path===pin.path))continue;
  readPin(ROOT,pin);
 }
 const additions=ADDITIONS.map(file=>{
  assert(!originalPins.has(file),`already inherited host input: ${file}`);
  return pinFile(ROOT,file);
 });
 uniquePaths(additions);for(const pin of additions)readPin(ROOT,pin);
 const transitions=oldHost.legacyInputTransitions.map(transition=>{
  const replacement=changed.find(x=>x.original.path===transition.original.path);
  if(!replacement)return transition;
  equal(transition.current,replacement.original);
  readPin(ROOT,transition.snapshot);
  return {...transition,current:replacement.current};
 });
 for(const item of changed){
  assert.equal(transitions.filter(x=>x.original.path===item.original.path).length,1,
   `exact existing legacy transition: ${item.original.path}`);
 }
 const files=uniquePins([
  ...oldHost.files.map(pin=>changed.find(x=>x.original.path===pin.path)?.current??pin),
  ...changed.map(x=>x.snapshot),...additions,
 ]);
 assert.equal(files.length,oldHost.files.length+changed.length+additions.length);
 for(const pin of oldHost.files){
  const successor=files.find(item=>item.path===pin.path);
  equal(successor,changed.find(x=>x.original.path===pin.path)?.current??pin);
 }
 const host={...oldHost,previous:HOST,files,
  legacyInputTransitions:transitions,
  successorInputTransitions:[...(oldHost.successorInputTransitions??[]),...changed]};
 const hostBytes=json(host),hostPin=bytesPin(HOST_OUTPUT,hostBytes);
 const nextIndex={...index,host:hostPin},indexBytes=json(nextIndex),indexPin=bytesPin(INDEX_OUTPUT,indexBytes);
 const activationBytes=Buffer.from(`// Reviewed split-proof activation. Generated by the admission build, not a page renderer.\nexport const G678_ADMISSION_INDEX = ${JSON.stringify(indexPin,null,2)} as const;\n`);
 const nextActivation=bytesPin(ACTIVATION.path,activationBytes);
 const transaction=readRegistryTransaction(ROOT);
 const registryKeys=transaction.registry.calibrations.flatMap(c=>c.entries.map(e=>e.key));
 assert.equal(registryKeys.length,639);assert(!registryKeys.includes('shared-alg001-l06-p004'));
 // The common reader accepts a composed host value before its immutable file exists.
 for(const page of index.pages)readPageProof(ROOT,page.proof,host,transaction);
 const result={kind:'alg-l06-p004-host-successor-plan-v1',status:'all-seven-prior-proofs-roundtrip',
  predecessor:{index:INDEX,host:HOST,activation:ACTIVATION},changed,
  addedHostInputs:additions,retainedHostInputs:oldHost.files.length-changed.length,
  host:hostPin,index:indexPin,activation:nextActivation,registryEntries:registryKeys.length,
  registeredP004:false,registeredPageProofs:index.pages.length};
 return {result,hostBytes,indexBytes,activationBytes};
}
const mode=process.argv[2];assert(['--plan','--write'].includes(mode)&&process.argv.length===3);
const {result,hostBytes,indexBytes,activationBytes}=plan();
if(mode==='--plan')console.log(JSON.stringify(result,null,2));
else{
 // Recheck CAS immediately before writes. New manifests are immutable; the
 // activation is the only existing target and is changed last.
 equal(pinFile(ROOT,ACTIVATION.path),ACTIVATION);
 const host=writeNew(HOST_OUTPUT,hostBytes),index=writeNew(INDEX_OUTPUT,indexBytes);
 equal(host,result.host);equal(index,result.index);
 const temp=path.join(ROOT,`${ACTIVATION.path}.p004-host-v19-${process.pid}.tmp`);
 try{
  fs.writeFileSync(temp,activationBytes,{flag:'wx'});
  equal(pinFile(ROOT,ACTIVATION.path),ACTIVATION);
  fs.renameSync(temp,path.join(ROOT,ACTIVATION.path));
 }finally{if(fs.existsSync(temp))fs.unlinkSync(temp);}
 equal(pinFile(ROOT,ACTIVATION.path),result.activation);
 const receipt=writeNew(RECEIPT_OUTPUT,json({...result,status:'active-seven-prior-proofs-roundtrip'}));
 console.log(JSON.stringify({...result,receipt},null,2));
}
