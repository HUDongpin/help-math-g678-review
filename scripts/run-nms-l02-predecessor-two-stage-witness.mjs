#!/usr/bin/env node
/** Execute P052->P005 old-byte readers with an independently verified live base. */
import {createHash} from 'node:crypto';
import {copyFileSync, existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {spawnSync} from 'node:child_process';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.join(root,'output/nms-l02-host-successor-20260927/predecessor');
const closurePin={path:'output/nms-l02-host-successor-20260927/predecessor/closure-v2.json',bytes:3588391,sha256:'b6343f0f02714e7c3febf05eaf7133e8d9b3465e880d593986710f3a84f6c8f5'};
const providerManifestPin={path:'output/nms-l02-host-successor-20260927/predecessor/reader-two-stage-v2/manifest.json',bytes:3101,sha256:'99901ef53e015aef61c7dd3cac84554acc59c0200ac4d187eb733220fbd6c9de'};
const baseWitnessPin={path:'output/nms-l02-host-successor-20260927/predecessor/base-witness-v3/base-witness.json',bytes:4179,sha256:'0da30031642bba4aec395369c671a55f8186371e294b2a9bed11a8386215ac62'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(p,bytes)=>({path:p,bytes:bytes.length,sha256:sha(bytes)});
function demand(ok,label){if(!ok)throw Error(`NMS_ORIGINAL_WITNESS:${label}`);}
function physical(file){
  const before=lstatSync(file,{bigint:true});
  demand(before.isFile()&&before.nlink===1n&&realpathSync(file)===file,`physical:${file}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','mode','nlink'].every(k=>before[k]===after[k]),`stable:${file}`);
  return bytes;
}
function readPin(p,base=root){
  const file=path.resolve(base,p.path),bytes=physical(file);
  demand(bytes.length===p.bytes&&sha(bytes)===p.sha256,`pin:${p.path}`);
  return bytes;
}
function writeExact(name,bytes){
  const file=path.join(out,name);demand(file.startsWith(`${out}${path.sep}`),`output:${name}`);
  mkdirSync(path.dirname(file),{recursive:true});
  if(existsSync(file))demand(physical(file).equals(bytes),`output-drift:${name}`);
  else writeFileSync(file,bytes,{flag:'wx',mode:0o444});
  return pin(path.relative(root,file),bytes);
}
const closure=JSON.parse(readPin(closurePin));
demand(closure.schemaVersion===1&&closure.kind==='nms-l02-predecessor-closure-v2'&&closure.descriptorWitnessStatus==='ready-for-original-execution'&&closure.inventory.packetCount===49&&closure.inventory.unionPinCount===14333&&closure.unresolved.length===0&&closure.mixedVersionPaths.length===0&&closure.recovered.length===4,'closure-shape');
const snapshots=new Map(closure.recovered.map(item=>[item.original.path,item]));
const originalReader=closure.unionPins.find(p=>p.path==='apps/web/lib/g678-nms-l02-p052.server.ts');
demand(originalReader,'original-reader-pin');
readPin(originalReader);
const provider=JSON.parse(readPin(providerManifestPin)),baseWitness=JSON.parse(readPin(baseWitnessPin));
demand(provider.schemaVersion===1&&provider.kind==='nms-l02-p005-two-stage-provider-v2'&&
  provider.scope==='compile-only-reviewed-two-stage'&&provider.entry.sha256===originalReader.sha256&&
  provider.baseWitness.sha256===baseWitnessPin.sha256&&baseWitness.kind==='nms-l02-live-base-descriptor-witness-v3',
  'provider-and-base-witness');
for(const p of [provider.transformedReader,provider.bundle,provider.helper,provider.predecessorManifest,
  baseWitness.closure,baseWitness.snapshot,baseWitness.descriptor,baseWitness.undefinedOwnProperties,
  baseWitness.execution.script,baseWitness.execution.reader])readPin(p);
const registrySubset=JSON.parse(readPin(closure.registration.subset));
demand(registrySubset.length===54,'registration-subset-54');
const liveRegistryPath='packages/demos/private-current-js-registry.json';
const liveRegistry=JSON.parse(physical(path.join(root,liveRegistryPath)));
demand(liveRegistry.schemaVersion===2&&liveRegistry.registryScope==='private-engineering','live-registry-shape');
const registrationFreezeByPath=new Map();
for(const selected of registrySubset){
  const matches=liveRegistry.calibrations.flatMap(calibration=>calibration.entries.filter(entry=>entry.key===selected.entry.key).map(entry=>({calibration,entry})));
  demand(matches.length===1,`live-registration:${selected.entry.key}`);
  const {calibration,entry}=matches[0];
  demand(JSON.stringify(entry)===JSON.stringify(selected.entry)&&calibration.calibrationId===selected.calibrationId&&calibration.freezeManifest===selected.freezeManifest,`registration-subset-match:${selected.entry.key}`);
  const bytes=physical(path.join(root,calibration.freezeManifest));
  const filePin=pin(calibration.freezeManifest,bytes);
  demand(filePin.bytes===calibration.freezeManifestBytes&&filePin.sha256===calibration.freezeManifestSha256,`registration-freeze:${selected.entry.key}`);
  const prior=registrationFreezeByPath.get(filePin.path);
  demand(!prior||(prior.bytes===filePin.bytes&&prior.sha256===filePin.sha256),`registration-freeze-conflict:${filePin.path}`);
  registrationFreezeByPath.set(filePin.path,filePin);
}
const registrationFreezePins=[...registrationFreezeByPath.values()].sort((a,b)=>a.path.localeCompare(b.path));

const tempParent=realpathSync(tmpdir());
const temporary=mkdtempSync(path.join(tempParent,'nms-l02-two-stage-witness-'));
let copyCount=0,copyBytes=0;
const support=[];
function copyPin(p,sourceFile){
  demand(!path.isAbsolute(p.path)&&!p.path.split(path.sep).includes('..'),`copy-scope:${p.path}`);
  const bytes=physical(sourceFile);
  demand(bytes.length===p.bytes&&sha(bytes)===p.sha256,`source-pin:${p.path}`);
  const dest=path.join(temporary,p.path);
  demand(dest.startsWith(`${temporary}${path.sep}`),`dest:${p.path}`);
  mkdirSync(path.dirname(dest),{recursive:true});
  if(existsSync(dest))demand(readPin(p,temporary).equals(bytes),`copy-conflict:${p.path}`);
  else{copyFileSync(sourceFile,dest);readPin(p,temporary);copyCount++;copyBytes+=bytes.length;}
}
try{
  for(const p of closure.unionPins){
    if(path.isAbsolute(p.path))continue;
    const recovered=snapshots.get(p.path);
    if(recovered){
      demand(recovered.original.bytes===p.bytes&&recovered.original.sha256===p.sha256,`recovered-pin:${p.path}`);
      readPin(recovered.snapshot);
    }
    copyPin(p,path.join(root,recovered?recovered.snapshot.path:p.path));
  }
  for(const item of closure.packetChain){
    const p=item.packet;
    readPin(p);
    copyPin(p,path.join(root,p.path));
  }
  // getWorkspaceRoot uses animations.json as a root marker. It is not a NMS packet pin.
  const markerPath='catalog/animations.json';
  const markerBytes=physical(path.join(root,markerPath));
  const marker=pin(markerPath,markerBytes);support.push(marker);
  copyPin(marker,path.join(root,markerPath));
  const catalogPin=closure.unionPins.find(p=>p.path==='catalog/g678-shared-catalog.v1.json');
  demand(catalogPin&&readPin(catalogPin),'relative-source-catalog');
  support.push(catalogPin);
  for(const freezePin of registrationFreezePins)copyPin(freezePin,path.join(root,freezePin.path));
  const readerUrl=pathToFileURL(path.join(root,provider.bundle.path)).href;
  const childCode=`process.chdir(${JSON.stringify(temporary)}); const {nmsL2P052Descriptor}=await import(${JSON.stringify(readerUrl)}); const descriptor=nmsL2P052Descriptor(); process.stdout.write('NMS_DESCRIPTOR_JSON:'+JSON.stringify(descriptor)+'\\n');`;
  const command=['node','--conditions=react-server','--import','tsx','--input-type=module','-e','<pinned inline descriptor call importing reviewed two-stage bundle>'];
  const env={...process.env,NODE_ENV:'development',HELP_MATH_G678_SOURCE_ROOT:closure.sourceRoot,HELP_MATH_G678_CALIBRATION_PHASE:'frozen16-continuous-audio-provisional-browser-qa'};
  delete env.VERCEL_ENV;
  const child=spawnSync(process.execPath,['--conditions=react-server','--import','tsx','--input-type=module','-e',childCode],{cwd:root,env,encoding:'utf8',maxBuffer:16*1024*1024,timeout:120000});
  const line=child.stdout?.split('\n').find(item=>item.startsWith('NMS_DESCRIPTOR_JSON:'));
  if(child.status!==0||!line){
    const attempted={schemaVersion:1,kind:'nms-l02-two-stage-descriptor-attempt-v1',closure:closurePin,reader:originalReader,
      provider:providerManifestPin,baseWitness:baseWitnessPin,command,copyCount,copyBytes,support,registrationFreezePins,
      exitCode:child.status,signal:child.signal,stderr:(child.stderr??'').slice(0,12000),stdout:(child.stdout??'').slice(0,12000)};
    const attemptedPin=writeExact('two-stage-execution-attempt-v1.json',Buffer.from(`${JSON.stringify(attempted,null,2)}\n`));
    process.stderr.write(`${JSON.stringify({status:'failed',attempt:attemptedPin,exitCode:child.status,stderr:attempted.stderr.slice(0,1800)})}\n`);
    process.exitCode=1;
  }else{
    const descriptor=JSON.parse(line.slice('NMS_DESCRIPTOR_JSON:'.length));
    demand(descriptor?.course?.moduleCode==='NMS002'&&descriptor.course.lesson===2&&descriptor.course.activePageCount===64&&descriptor.pages?.length===64&&descriptor.productBridge?.registeredAnimationCount===54,'descriptor-64-54');
    const registered=descriptor.pages.filter(page=>page.rendererAvailability?.kind==='registered').map(page=>page.animationId);
    demand(registered.length===54&&new Set(registered).size===54,'registered-54-unique');
    const expectedIds=registrySubset.map(item=>item.entry.key);
    demand(expectedIds.length===54&&registered.every(id=>expectedIds.includes(id)),'registered-subset-exact');
    const sourceCatalog=JSON.parse(readPin(support.find(p=>p.path==='catalog/g678-shared-catalog.v1.json')));
    const sourceLesson=sourceCatalog.lessons.filter(lesson=>lesson.moduleCode==='NMS002'&&lesson.lessonNumber===2);
    demand(sourceLesson.length===1&&sourceLesson[0].pages.length===64,'source-lesson-64');
    for(let i=0;i<64;i++){
      const actual=descriptor.pages[i],source=sourceLesson[0].pages[i];
      demand(actual.animationId===source.animationId&&actual.globalPageOrdinal===source.globalOrdinal&&actual.source.assetId===source.assetId,`source-order:${i}`);
    }
    demand(descriptor.pages[45].rendererAvailability.kind==='registered'&&descriptor.pages[45].rendererAvailability.runtimeQuery.frameDomain==='sprite-205'&&descriptor.pages[54].rendererAvailability.kind==='unavailable','p046-p055-boundary');
    const descriptorBytes=Buffer.from(`${JSON.stringify(descriptor,null,2)}\n`);
    const descriptorPin=writeExact('descriptor-two-stage-v1.json',descriptorBytes);
    const runnerPin=pin('scripts/run-nms-l02-predecessor-two-stage-witness.mjs',physical(fileURLToPath(import.meta.url)));
    const producerPin=pin('scripts/prepare-nms-l02-predecessor-witness.mjs',physical(path.join(root,'scripts/prepare-nms-l02-predecessor-witness.mjs')));
    for(const freezePin of registrationFreezePins)readPin(freezePin);
    const witness={schemaVersion:1,kind:'nms-l02-predecessor-descriptor-witness-v1',closure:closurePin,descriptor,
      descriptorFile:descriptorPin,originalReader,registrationFreezePins,baseWitness:baseWitnessPin,
      execution:{command,method:'physical-isolated-copy-reviewed-two-stage',providerManifest:providerManifestPin,
        readerBundle:provider.bundle,helper:provider.helper,sourceRoot:closure.sourceRoot,copyCount,copyBytes,
        readerExitCode:child.status,support,runnerScript:runnerPin,producerScript:producerPin},
      acceptanceEffects:{originalRuntime:false,audioAcceptance:false,humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false}};
    const witnessPin=writeExact('descriptor-witness-two-stage-v1.json',Buffer.from(`${JSON.stringify(witness,null,2)}\n`));
    process.stdout.write(`${JSON.stringify({status:'passed',witness:witnessPin,descriptor:descriptorPin,copyCount,copyBytes})}\n`);
  }
}finally{rmSync(temporary,{recursive:true,force:true});}
