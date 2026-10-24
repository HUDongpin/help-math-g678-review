import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const ID='shared-alg001-l06-p040',REGISTRY='packages/demos/private-current-js-registry.json';
export const FREEZE='catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v6.json';
export const FRAGMENT=FREEZE.replace('.json','.fragment.json');
export const CANDIDATE='work/g678-shared-page-factory/frozen16-continuous-audio-v1/manifest.json';
export const WITNESS='catalog/product-bridge-calibrations/g678-current-js-379-v5-continuous-audio-registry-witness.json';
export const encode=v=>JSON.stringify(v,null,2)+'\n';
export const pin=(p,b)=>({path:p,bytes:Buffer.byteLength(b),sha256:createHash('sha256').update(b).digest('hex')});
export const read=async p=>{const b=await readFile(path.resolve(ROOT,p));return{...pin(p,b),buffer:b,value:p.endsWith('.json')?JSON.parse(b):undefined};};
export async function prepare({check=false}={}){
 const built=spawnSync(process.execPath,['scripts/build-frozen16-continuous-audio-module.mjs','--check'],{cwd:ROOT,encoding:'utf8'});assert.equal(built.status,0,built.stderr);
 const old=await read('catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v5.json');assert.equal(old.sha256,'62c02da1f889a013c92c31dacdd0276adaf00b0e9fb6f80ed213d7ae5428692b');
 const witness=await read(WITNESS);assert.equal(witness.sha256,'8cb4ce4a55a7fccd2c25f47d15124272eb09c421877998ac6759edbaea6ebbe2');
 const prior=witness.value.calibrations.find(c=>c.calibrationId==='g678-16-page-product-calibration-v1');assert.equal(prior.entries.length,379);
 const original=prior.entries.find(e=>e.key===ID),selected=old.value.selectedPages.find(p=>p.animationId===ID);assert(original&&selected);
 const sourceInput='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f/frozen16-audio-v1/shared-alg001-l06-p040/sprite-86-0.mp3';
 const source=await read(sourceInput);assert.equal(source.sha256,'bf6cbc0d490526ed4dec3b7566204cb22057a09a37be6fbe61d2367143caaaad');assert.equal(source.bytes,78260);
 const assetPath='work/g678-shared-page-factory/frozen16-continuous-audio-v1/source-stream.mp3',asset=pin(assetPath,source.buffer);
 const modulePath='packages/demos/src/modules/frozen16-continuous-audio-shared-alg001-l06-p040.tsx',module=await read(modulePath);
 const entry={...original,module:'./modules/frozen16-continuous-audio-shared-alg001-l06-p040',artifacts:{...original.artifacts,module:pin(modulePath,module.buffer)}};
 const paths=['packages/demos/src/continuous-source-stream-clock-candidate.ts','packages/demos/src/decoded-source-stream-transport.ts',
  'packages/demos/src/continuous-source-clock-attachment.ts','packages/demos/src/frozen-glossary-canvas-preparation.ts','packages/demos/src/source-static-canvas-candidate.tsx',
  'apps/web/components/continuous-source-clock-runtime.tsx','apps/web/components/continuous-source-clock-lesson-pilot.tsx','apps/web/components/descriptor-driven-whole-lesson-player.tsx',
  'apps/web/lib/lesson-runtime-adapter.ts','apps/web/lib/continuous-source-audio-access.ts','apps/web/proxy.ts',
  'apps/web/app/[locale]/migration-status/g678-calibration/[placementId]/page.tsx','apps/web/app/flash-assets/g678-local/[animationId]/source-stream.mp3/route.ts',
  'scripts/build-frozen16-continuous-audio-module.mjs','scripts/prepare-frozen16-continuous-audio-registration.mjs',original.artifacts.timeline.path,original.artifacts.runtime.path];
 const inputs=await Promise.all(paths.map(async p=>{const r=await read(p);return pin(p,r.buffer);}));
 const config=await read('packages/demos/src/timelines/frozen16-continuous-audio-shared-alg001-l06-p040.ts');
 const candidate={schemaVersion:1,kind:'registered-continuous-source-clock-candidate-v1',entry,sourceAsset:asset,sourceSha256:selected.sourceSha256,
  inputs:[pin(old.path,old.buffer),pin(WITNESS,witness.buffer),pin(source.path,source.buffer),...inputs],
  outputs:[pin(modulePath,module.buffer),pin(config.path,config.buffer),asset],
  acceptanceEffects:{productCalibrationPassed:false,scaleOutAuthorized:false,sourceAlignmentAccepted:false,audioAccepted:false,originalRuntimeAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false}};
 const candidateBytes=encode(candidate),candidatePin=pin(CANDIDATE,candidateBytes);
 const freeze=structuredClone(old.value);freeze.inputs.frozenContinuousAudioManifest=candidatePin;
 freeze.selectedPages=freeze.selectedPages.map(p=>p.animationId===ID?{...p,frozenContinuousAudio:{kind:candidate.kind,candidateManifest:candidatePin,entry,sourceAsset:asset,sourceAlignmentAccepted:false,audioAccepted:false}}:p);
 const freezeBytes=encode(freeze),freezePin=pin(FREEZE,freezeBytes),registry=structuredClone(witness.value);
 const calibration=registry.calibrations.find(c=>c.calibrationId===prior.calibrationId);
 Object.assign(calibration,{freezeManifest:FREEZE,freezeManifestBytes:freezePin.bytes,freezeManifestSha256:freezePin.sha256});calibration.entries=calibration.entries.map(e=>e.key===ID?entry:e);
 assert.deepEqual(calibration.entries.filter(e=>e.key!==ID),prior.entries.filter(e=>e.key!==ID));
 const registryBytes=encode(registry),fragment={schemaVersion:1,calibration,changedIds:[ID],preservedPageCount:378,candidate:candidatePin,proposedRegistry:pin(REGISTRY,registryBytes),acceptanceEffects:candidate.acceptanceEffects};
 const outputs=new Map([[assetPath,source.buffer],[CANDIDATE,candidateBytes],[FREEZE,freezeBytes],[FRAGMENT,encode(fragment)]]);
 for(const[p,b]of outputs)if(check)assert((await read(p)).buffer.equals(Buffer.from(b)),p);else await writeFile(path.join(ROOT,p),b,{flag:'wx'});
 return{freezePin,candidatePin,fragment,registry,registryBytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===2||process.argv.length===3&&process.argv[2]==='--check');prepare({check:process.argv[2]==='--check'}).then(p=>console.log(encode({freeze:p.freezePin,candidate:p.candidatePin,registry:p.fragment.proposedRegistry,activated:false}))).catch(e=>{console.error(e);process.exitCode=1;});
}
