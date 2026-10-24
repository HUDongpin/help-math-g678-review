import assert from 'node:assert/strict';
import {guardedReplacement} from './activate-g678-frozen16-glossary-registration.mjs';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROOT,REGISTRY,FREEZE as NEXT_FREEZE,FRAGMENT as NEXT_FRAGMENT,WITNESS,CANDIDATE as CANDIDATES,CHANGED_IDS as IDS,prepare,read,pin as bind,encode} from './prepare-frozen16-twelve-source-audio-registration-v2.mjs';
import {GENERATED_OUTPUTS,expectedScopedRegistryOutputs,readBoundActivationFile} from './activate-g678-alg-l11-feedback-host-score-registration.mjs';
import {buildRegistrySources} from '../packages/demos/scripts/generate-registry.mjs';

export const RECEIPT='catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v24.activation.json';
const BASE='work/g678-shared-page-factory/frozen16-twelve-source-audio-registration-activation-v2';
const TARGETS=[REGISTRY,GENERATED_OUTPUTS.localOnly,GENERATED_OUTPUTS.localOnlyMetadata];
const EFFECTS={productCalibrationPassed:false,scaleOutAuthorized:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
const descriptor=({path,bytes,sha256})=>({path,bytes,sha256});
async function exact(root,states){for(const[file,bytes]of states)assert((await readBoundActivationFile(root,file)).buffer.equals(bytes),`Concurrent target drift: ${file}`);}

export async function activate({check=false}={}){
  const plan=await prepare({check:true});
  const files=[NEXT_FREEZE,NEXT_FRAGMENT,CANDIDATES,WITNESS,
    'apps/web/lib/g678-frozen16-twelve-source-audio-v2-authority.server.ts','apps/web/lib/g678-calibration-product-bridge.server.ts',
    'packages/demos/src/frozen-calibration-glossary-candidate.tsx','scripts/prepare-frozen16-twelve-source-audio-registration-v2.mjs',
    'scripts/activate-frozen16-twelve-source-audio-registration-v2.mjs',
    'scripts/activate-g678-frozen16-glossary-registration.mjs','packages/demos/src/frozen-glossary-canvas-preparation.ts'];
  const pins=await Promise.all(files.map(async f=>descriptor(await readBoundActivationFile(ROOT,f))));
  const verify=async()=>{for(const p of pins)await readBoundActivationFile(ROOT,p.path,p);await prepare({check:true});};
  const currentRegistry=await readBoundActivationFile(ROOT,REGISTRY);
  const outputs=Object.fromEntries(await Promise.all(Object.entries(GENERATED_OUTPUTS).map(async([k,p])=>[k,(await readBoundActivationFile(ROOT,p)).buffer])));
  if(check){
    assert(currentRegistry.buffer.equals(Buffer.from(plan.registryBytes)),'Registry not the exact prepared successor');
    const generated=await buildRegistrySources();
    for(const[k,b]of Object.entries(outputs))assert.equal(b.toString(),generated[k]);
    const receipt=await read(RECEIPT);assert.deepEqual(receipt.value.changedIds,IDS);await verify();
    return{checked:true,registered:379,changedDependencies:12,moduleEntriesChanged:1,publicFilesWritten:0};
  }
  assert.equal(currentRegistry.sha256,'9bb1b882004a4f9d62463e58c1c3246918b9b20acb2cd26d7a2198227ece7c63');
  const prior=JSON.parse(currentRegistry.buffer);
  assert.deepEqual(outputs,expectedScopedRegistryOutputs(prior,outputs));
  const proposed=expectedScopedRegistryOutputs(plan.registry,outputs);
  const before=new Map([[REGISTRY,currentRegistry.buffer],...Object.entries(GENERATED_OUTPUTS).map(([k,p])=>[p,outputs[k]])]);
  const after=new Map([[REGISTRY,Buffer.from(plan.registryBytes)],...Object.entries(GENERATED_OUTPUTS).map(([k,p])=>[p,proposed[k]])]);
  assert.equal(prior.calibrations.length,plan.registry.calibrations.length);
  const old=prior.calibrations.find(c=>c.calibrationId==='g678-16-page-product-calibration-v1');
  const changed=plan.fragment.calibration.entries.filter(e=>JSON.stringify(e)!==JSON.stringify(old.entries.find(p=>p.key===e.key))).map(e=>e.key).sort();
  assert.deepEqual(changed,IDS);
  assert.deepEqual(prior.calibrations.filter(c=>c!==old),plan.registry.calibrations.filter(c=>c.calibrationId!==old.calibrationId));
  const postflight=async()=>{const generated=await buildRegistrySources();for(const[k,b]of Object.entries(proposed))assert.equal(b.toString(),generated[k]);};
  const transaction=await guardedReplacement({root:ROOT,before,after,targets:TARGETS,recovery:BASE,verify,postflight});
  const receipt={schemaVersion:1,status:'local-twelve-source-audio-registered-product-calibration-pending',createdAt:new Date().toISOString(),
    registrationCount:379,changedIds:IDS,moduleEntriesChanged:1,preservedPageCount:378,otherCalibrationsUnchanged:true,publicFilesWritten:0,inputBindings:pins,
    proposed:[...after].map(([p,b])=>bind(p,b)),transaction,acceptanceEffects:EFFECTS,
    limitations:['Replacements are recoverable and drift-checked; this is not filesystem content-CAS against uncoordinated writers.','Actual My Lesson browser calibration and source audio remain separate.']};
  await writeFile(path.join(ROOT,RECEIPT),encode(receipt),{flag:'wx'});
  return{registered:379,changedDependencies:12,moduleEntriesChanged:1,preserved:378,receipt:bind(RECEIPT,encode(receipt)),publicFilesWritten:0};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]));
  activate({check:process.argv[2]==='--check'}).then(r=>console.log(encode(r))).catch(e=>{console.error(e);process.exitCode=1;});
}
