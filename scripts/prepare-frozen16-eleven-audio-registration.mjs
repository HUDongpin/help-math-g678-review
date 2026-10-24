import assert from 'node:assert/strict';import{readFile,writeFile,mkdir}from'node:fs/promises';import{createHash}from'node:crypto';import path from'node:path';import{fileURLToPath}from'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');const TASK='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f';
export const REGISTRY='packages/demos/private-current-js-registry.json',WITNESS='catalog/product-bridge-calibrations/g678-current-js-379-v19-geo-intro-registry-witness.json',FREEZE='catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v20.json',FRAGMENT=FREEZE.replace('.json','.fragment.json'),CANDIDATE='work/g678-shared-page-factory/frozen16-eleven-audio-v1/manifest.json',CHANGED_IDS=['shared-geo001-l01-p001'];
export const encode=v=>JSON.stringify(v,null,2)+'\n',pin=(p,b)=>({path:p,bytes:Buffer.byteLength(b),sha256:createHash('sha256').update(b).digest('hex')});
export const read=async p=>{const buffer=await readFile(path.resolve(ROOT,p));return {...pin(p,buffer),buffer,value:p.endsWith('.json')?JSON.parse(buffer):undefined};};
export async function prepare({check=false}={}){
 const prior=await read('catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v19.json');assert.equal(prior.sha256,'fa836ddb91c321a4dda87593bc48e91342d392db52feb55a001f9ec5854d47ba');
 const witness=await read(WITNESS);assert.equal(witness.sha256,'4af0fd3d20d811726e67d38c3b902d431b64c0702d3bf48611373d08ee6b052a');
 const old=await read('work/g678-shared-page-factory/frozen16-ten-audio-v3/manifest.json');assert.equal(old.sha256,'f2c8c59a240e7bb4b1082f1902addc5535c7e44ab9ac430b5778b5529964d904');
 const geo=await read('work/g678-shared-page-factory/geo-l01-intro-audio-v1/manifest.json');assert.equal(geo.sha256,'dd7db1a0c0bcbe5e6c129dabdcf6a614feb064e6ec218a09b53ffabc06d7ca31');
 const audit=await read(TASK+'/geo-intro-source-audit-v1/receipt.json');assert.equal(audit.value.status,'source-page-linkage-audit-passed');
 const registry=structuredClone(witness.value),cal=registry.calibrations.find(c=>c.calibrationId==='g678-16-page-product-calibration-v1');assert.equal(cal.entries.length,379);assert.deepEqual(cal.entries.find(e=>e.key===CHANGED_IDS[0]),geo.value.predecessorEntry);
 const members=structuredClone(old.value.members);for(const m of members)assert.deepEqual(cal.entries.find(e=>e.key===m.entry.key),m.entry);
 members.push({entry:geo.value.entry,sourceAsset:geo.value.sourceAsset,sourceSha256:geo.value.source.sha256,plan:geo.value.plan,sourceCorrectionPackage:pin(geo.path,geo.buffer)});members.sort((a,b)=>a.entry.key.localeCompare(b.entry.key));assert.equal(members.length,11);
 const inputs=[prior,witness,old,geo,audit].map(r=>pin(r.path,r.buffer)),outputs=[];
 for(const m of members)for(const p of [m.entry.artifacts.module,m.entry.artifacts.timeline,m.entry.artifacts.runtime,m.sourceAsset,m.plan]){const r=await read(p.path);assert.equal(r.bytes,p.bytes);assert.equal(r.sha256,p.sha256);outputs.push(p);}
 for(const file of [...new Set([...old.value.inputs.map(p=>p.path),'scripts/prepare-frozen16-eleven-audio-registration.mjs','scripts/prepare-geo-l01-intro-audio-module.mjs',TASK+'/geo-intro-source-audit-v1/xml-crosscheck.json',TASK+'/geo-l01-main-decoder-v1/receipt.json'])]){const r=await read(file);inputs.push(pin(file,r.buffer));}
 const effects={productCalibrationPassed:false,scaleOutAuthorized:false,sourceAlignmentAccepted:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,released:false,published:false};
 const candidate={schemaVersion:1,kind:'frozen16-eleven-audio-v1',members,nmsHoverPackage:old.value.nmsHoverPackage,geoIntroPackage:pin(geo.path,geo.buffer),inputs,outputs,acceptanceEffects:effects};
 const cb=encode(candidate),cp=pin(CANDIDATE,cb),freeze=structuredClone(prior.value);freeze.inputs.frozenContinuousAudioManifest=cp;
 const selected=freeze.selectedPages.find(p=>p.animationId===CHANGED_IDS[0]),before=structuredClone(selected);
 selected.frozenGeoIntro={before,sourceAudit:pin(audit.path,audit.buffer),package:pin(geo.path,geo.buffer),unusedPageControlsRemoved:true,modernHostControlsPreserved:true};
 selected.complexityLane='low';selected.adapterFamily='intro-script-free-child-with-unplaced-media-linkages';selected.implementation.kind='source-static-current-js-candidate';selected.runtimeEvidenceBoundary.runtimeKind='source-static-current-js-candidate';
 delete selected.runtime.interactiveSeek;selected.runtime.companionDomains=[];
 selected.productBlockers=selected.productBlockers.filter(b=>!['source-fui-linkage-placement-unproven','feedback-and-embedded-audio-not-accepted'].includes(b)).concat(['geo-intro-audio-my-lesson-calibration-pending','source-audio-listening-and-language-acceptance-pending','original-runtime-terminal-and-source-audio-alignment-not-accepted']);
 for(const p of freeze.selectedPages){const m=members.find(m=>m.entry.key===p.animationId);if(m)p.frozenContinuousAudio={kind:candidate.kind,candidateManifest:cp,...m,sourceAlignmentAccepted:false,audioAccepted:false};}
 const fb=encode(freeze),fp=pin(FREEZE,fb);cal.entries=cal.entries.map(e=>members.find(m=>m.entry.key===e.key)?.entry??e);Object.assign(cal,{freezeManifest:FREEZE,freezeManifestBytes:fp.bytes,freezeManifestSha256:fp.sha256});
 const registryBytes=encode(registry),fragment={schemaVersion:1,calibration:cal,changedIds:CHANGED_IDS,dependencyAffectedIds:members.map(m=>m.entry.key),preservedPageCount:378,candidate:cp,proposedRegistry:pin(REGISTRY,registryBytes),acceptanceEffects:effects};
 for(const[p,b]of[[CANDIDATE,cb],[FREEZE,fb],[FRAGMENT,encode(fragment)]]){const existing=await read(p).catch(e=>{if(e.code==='ENOENT')return null;throw e;});if(check||existing)assert(existing&&existing.buffer.equals(Buffer.from(b)),p);else{await mkdir(path.dirname(path.join(ROOT,p)),{recursive:true});await writeFile(path.join(ROOT,p),b,{flag:'wx'});}}
 return{freezePin:fp,candidatePin:cp,fragment,registry,registryBytes};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){assert(process.argv.length===2||process.argv.length===3&&process.argv[2]==='--check');const p=await prepare({check:process.argv[2]==='--check'});console.log(encode({freeze:p.freezePin,candidate:p.candidatePin,registry:p.fragment.proposedRegistry,activated:false}));}
