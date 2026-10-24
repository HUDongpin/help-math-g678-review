import assert from 'node:assert/strict';import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import path from'node:path';import{fileURLToPath}from'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export const REGISTRY='packages/demos/private-current-js-registry.json',WITNESS='catalog/product-bridge-calibrations/g678-current-js-379-v16-nms-hover-registry-witness.json',FREEZE='catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v18.json',FRAGMENT=FREEZE.replace('.json','.fragment.json'),CANDIDATE='work/g678-shared-page-factory/frozen16-ten-audio-v2/manifest.json',CHANGED_IDS=['shared-nms002-l02-p020'];
export const encode=v=>JSON.stringify(v,null,2)+'\n',pin=(p,b)=>({path:p,bytes:Buffer.byteLength(b),sha256:createHash('sha256').update(b).digest('hex')});
export const read=async p=>{const buffer=await readFile(path.resolve(ROOT,p));return {...pin(p,buffer),buffer,value:p.endsWith('.json')?JSON.parse(buffer):undefined};};
export async function prepare({check=false}={}){
 const base=await read('catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v5.json');assert.equal(base.sha256,'62c02da1f889a013c92c31dacdd0276adaf00b0e9fb6f80ed213d7ae5428692b');
 const prior=await read('catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v16.json');assert.equal(prior.sha256,'4e5e0f900d343301d7cf695b888332637616295039b338d11cb3c0917cb17391');
 const witness=await read(WITNESS);assert.equal(witness.sha256,'394448431c52eb9bb0447fa38b1857080daab2536b6bc5a04978f3a1882ab2d1');
 const old=await read('work/g678-shared-page-factory/frozen16-nine-audio-v2/manifest.json');assert.equal(old.sha256,'19d11267ea7b7a90666f9a599dfdc761bfd230b743cec872339bb9dac82b6f69');
 const nms=await read('work/g678-shared-page-factory/nms-l02-hover-audio-package-v3/manifest.json');assert.equal(nms.sha256,'fc64725d97a7b354a61cbb9787105f007d48ab34054093ec4d0ec7fab5ec9ede');
 const registry=structuredClone(witness.value),cal=registry.calibrations.find(c=>c.calibrationId==='g678-16-page-product-calibration-v1');assert.equal(cal.entries.length,379);
 const members=structuredClone(old.value.members),inputs=[base,prior,witness,old,nms].map(r=>pin(r.path,r.buffer)),outputs=[];
 assert.deepEqual(cal.entries.find(e=>e.key===CHANGED_IDS[0]),nms.value.predecessorEntry);
 members.push({entry:nms.value.entry,sourceAsset:nms.value.sourceAsset,sourceSha256:nms.value.source.sha256,plan:nms.value.plan,hoverSourcePackage:pin(nms.path,nms.buffer)});members.sort((a,b)=>a.entry.key.localeCompare(b.entry.key));assert.equal(members.length,10);
 for(const m of members){if(m.entry.key!==CHANGED_IDS[0])assert.deepEqual(cal.entries.find(e=>e.key===m.entry.key),m.entry);
  for(const p of [m.entry.artifacts.module,m.entry.artifacts.timeline,m.entry.artifacts.runtime,m.sourceAsset,m.plan]){const r=await read(p.path);assert.equal(r.bytes,p.bytes);assert.equal(r.sha256,p.sha256);outputs.push(p);}}
 const extra=['scripts/prepare-frozen16-ten-audio-registration-v2.mjs','apps/web/components/nms-l02-hover-audio-runtime.tsx','apps/web/components/nms-l02-registered-audio-runtime.tsx','packages/demos/src/nms-l02-hover-candidate.tsx',nms.value.config.path];
 for(const file of [...new Set([...old.value.inputs.map(p=>p.path),...extra])]){const r=await read(file);inputs.push(pin(file,r.buffer));}
 const effects={productCalibrationPassed:false,scaleOutAuthorized:false,sourceAlignmentAccepted:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,released:false,published:false};
 const candidate={schemaVersion:1,kind:'frozen16-ten-audio-v1',members,nmsHoverPackage:pin(nms.path,nms.buffer),inputs,outputs,acceptanceEffects:effects};
 const cb=encode(candidate),cp=pin(CANDIDATE,cb),freeze=structuredClone(base.value);freeze.inputs.frozenContinuousAudioManifest=cp;
 const selected=freeze.selectedPages.find(p=>p.animationId===CHANGED_IDS[0]);const before=structuredClone(selected);const g=nms.value.config.value.glossary;
 selected.frozenNmsHover={before,package:pin(nms.path,nms.buffer),controls:nms.value.config.value.controls};
 selected.runtime.canvasRenderer={...nms.value.entry.artifacts.runtime,url:before.runtime.canvasRenderer.url};
 selected.presentation={pageInteractionCompanionTargetIdSuffix:'nms-l02-hover-controls'};
 selected.glossaryEntries=[{id:g.entryId,sourceKeyAttribute:g.sourceKeyAttribute,labels:g.labels,definitions:g.definitions,source:freeze.selectedPages.find(p=>p.animationId==='shared-dat001-l03-p030').glossaryEntries[0].source}];
 for(const p of freeze.selectedPages){const m=members.find(m=>m.entry.key===p.animationId);if(m)p.frozenContinuousAudio={kind:candidate.kind,candidateManifest:cp,...m,sourceAlignmentAccepted:false,audioAccepted:false};}
 const fb=encode(freeze),fp=pin(FREEZE,fb);cal.entries=cal.entries.map(e=>members.find(m=>m.entry.key===e.key)?.entry??e);Object.assign(cal,{freezeManifest:FREEZE,freezeManifestBytes:fp.bytes,freezeManifestSha256:fp.sha256});
 const registryBytes=encode(registry),fragment={schemaVersion:1,calibration:cal,changedIds:CHANGED_IDS,dependencyAffectedIds:members.map(m=>m.entry.key),preservedPageCount:378,candidate:cp,proposedRegistry:pin(REGISTRY,registryBytes),acceptanceEffects:effects};
 for(const [p,b] of [[CANDIDATE,cb],[FREEZE,fb],[FRAGMENT,encode(fragment)]]){const current=await read(p).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(check||current)assert(current&&current.buffer.equals(Buffer.from(b)),p);else{await mkdir(path.dirname(path.join(ROOT,p)),{recursive:true});await writeFile(path.join(ROOT,p),b,{flag:'wx'});}}
 return {freezePin:fp,candidatePin:cp,fragment,registry,registryBytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert(process.argv.length===2||process.argv.length===3&&process.argv[2]==='--check');const p=await prepare({check:process.argv[2]==='--check'});console.log(encode({freeze:p.freezePin,candidate:p.candidatePin,registry:p.fragment.proposedRegistry,activated:false}));}
