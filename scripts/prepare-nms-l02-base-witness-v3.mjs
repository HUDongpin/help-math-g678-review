#!/usr/bin/env node
/** Record the real, unmodified 379-page base execution and its physical inputs. */
import {createHash} from 'node:crypto';
import {existsSync,lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';
import {isDeepStrictEqual} from 'node:util';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const output=path.join(root,'output/nms-l02-host-successor-20260927/predecessor');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const PHASE='frozen16-continuous-audio-provisional-browser-qa';
const FREEZE={path:'catalog/product-bridge-calibrations/g678-current-js-379-page-registration-v26.json',bytes:2650947,sha256:'21bde88b4beabe7ce6ea4f01c61e5c1a98b1d60dd8c5d6e0be9db48d569cf825'};
let exactSystemPaths=new Set();
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(file,bytes)=>({path:file,bytes:bytes.length,sha256:sha(bytes)});
function demand(ok,label){if(!ok)throw Error(`NMS_BASE_WITNESS:${label}`);}
function physical(file){
  const before=lstatSync(file,{bigint:true});
  demand(before.isFile()&&before.nlink===1n&&realpathSync(file)===file,`physical:${file}`);
  const bytes=readFileSync(file),after=lstatSync(file,{bigint:true});
  demand(['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'].every(k=>before[k]===after[k]),`stable:${file}`);
  return bytes;
}
function absolute(p){
  const file=p.startsWith('G6-G8-shared/')?path.resolve(SOURCE_ROOT,p):path.resolve(root,p);
  demand(file.startsWith(root+path.sep)||file.startsWith(SOURCE_ROOT+path.sep)||
    file.startsWith('/Volumes/WestWorld/HELP MATH Related Files/Private Recovery Containers/2026-08-25-BOULDER-LEARNING-AWS-S3-EMERGENCY-V1'+path.sep)||
    file.startsWith('/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f'+path.sep)||
    file.startsWith('/Volumes/WestWorld/HELP MATH 2.0/node_modules'+path.sep)||
    exactSystemPaths.has(file),`scope:${p}`);
  return file;
}
function relativeOrAbsolute(file){return file.startsWith(root+path.sep)?path.relative(root,file):file;}
function checked(p){const b=physical(absolute(p.path));demand(b.length===p.bytes&&sha(b)===p.sha256,`pin-drift:${p.path}`);return b;}
function writeExact(name,bytes){
  const file=path.join(output,name);demand(file.startsWith(output+path.sep),`output:${name}`);
  mkdirSync(path.dirname(file),{recursive:true});
  if(existsSync(file))demand(physical(file).equals(bytes),`output-drift:${name}`);
  else writeFileSync(file,bytes,{flag:'wx',mode:0o444});
  return pin(path.relative(root,file),bytes);
}

demand(process.env.HELP_MATH_G678_SOURCE_ROOT===SOURCE_ROOT,'exact-source-env');
demand(process.env.HELP_MATH_G678_CALIBRATION_PHASE===PHASE,'exact-local-phase');
demand(process.env.NODE_ENV!=='production','production-denied');
const freeze=JSON.parse(checked(FREEZE));
const {g678PartialCalibrationSnapshot,g678CalibrationFingerprintDependencies,G678_CALIBRATION_FREEZE_PATH}=await import('../apps/web/lib/g678-calibration-product-bridge.server.ts');
const glossaryAuthority=await import('../apps/web/lib/g678-frozen16-thirteen-source-audio-v2-authority.server.ts');
const repairAuthority=await import('../apps/web/lib/g678-nms-l01-p044-live-clock-authority.server.ts');
const p042=await import('../apps/web/lib/g678-nms-l01-p042-companion-authority.server.ts');
const p044=await import('../apps/web/lib/g678-nms-l01-p044-authority.server.ts');
const typography=await import('../apps/web/lib/g678-typography-host-successor.server.ts');
demand(G678_CALIBRATION_FREEZE_PATH===FREEZE.path,'selected-frozen-base');
const glossary=glossaryAuthority.readFrozenGlossaryPackage(root);
const repair=repairAuthority.readG678P044RepairPackage(root);
const repaired=repairAuthority.validateG678P044RepairAuthority({...repair,freeze:glossary.predecessor});
const repairHostPins=typography.resolveTypographyHostClosurePins(root,repaired.physicalPins);
for(const p of repairHostPins)p044.readG678P044PhysicalPin(root,p);
const p042Authority=p042.readG678P042FileBinding(root,p042.G678_P042_AUTHORITY);
const p042Base=p042.readG678P042FileBinding(root,p042.G678_P042_BASE);
const p042Readable=p042.readG678P042FileBinding(root,p042.G678_P042_READABLE);
const p042Predecessor=p042.readG678P042FileBinding(root,p042.G678_P042_PREDECESSOR);
const p044Predecessor=p044.readG678P044FileBinding(root,p044.G678_P044_PREDECESSOR);
const p042Validated=p042.validateG678P042CompanionAuthority({authority:p042Authority,baseCandidate:p042Base,
  readableCandidate:p042Readable,predecessorFreeze:p042Predecessor,freeze:p044Predecessor.value});
const p042PhysicalPins=p042.g678P042PhysicalClosurePins(root,p042Validated);
const p042HostPins=typography.resolveTypographyHostClosurePins(root,p042PhysicalPins);
for(const p of p042HostPins)p042.readG678P042PhysicalPin(root,p);
exactSystemPaths=new Set(p042HostPins.filter(p=>p.path.startsWith('/')&&!p.path.startsWith('/Volumes/')).map(p=>p.path));

const all=new Map(),categories=new Map(),historical=new Map();
function add(p,category){
  demand(typeof p.path==='string'&&Number.isSafeInteger(p.bytes)&&p.bytes>=0&&/^[a-f0-9]{64}$/u.test(p.sha256),`shape:${category}`);
  const key=JSON.stringify([p.path,p.bytes,p.sha256]);
  if(!all.has(key))all.set(key,{path:p.path,bytes:p.bytes,sha256:p.sha256});
  const list=categories.get(key)??new Set();list.add(category);categories.set(key,list);
  const versions=historical.get(p.path)??new Set();versions.add(key);historical.set(p.path,versions);
}
function walk(value,category){
  if(Array.isArray(value)){for(const item of value)walk(item,category);return;}
  if(!value||typeof value!=='object')return;
  if(typeof value.path==='string'&&Number.isSafeInteger(value.bytes)&&/^[a-f0-9]{64}$/u.test(value.sha256))add(value,category);
  for(const nested of Object.values(value))walk(nested,category);
}
add(FREEZE,'frozen-base');walk(freeze,'frozen-base-recursive');
for(const p of repairHostPins)add(p,'p044-effective-host-closure');
for(const p of p042HostPins)add(p,'p042-effective-host-closure');
const glossaryPaths=[...new Set(glossary.physicalPaths)].sort();
for(const file of glossaryPaths){const p=relativeOrAbsolute(file),bytes=physical(absolute(p));add(pin(p,bytes),'frozen-glossary-effective-closure');}
const fingerprintPaths=g678CalibrationFingerprintDependencies(freeze);
for(const p of fingerprintPaths)add(pin(p,physical(absolute(p))),'base-fingerprint-dependency');
const typographyPaths=typography.typographyHostFingerprintPaths(root);
for(const file of typographyPaths){const p=relativeOrAbsolute(file);add(pin(p,physical(absolute(p))),'typography-host-fingerprint');}
const selection=freeze.inputs.selectionAuthorities;
demand(Array.isArray(selection),'selection-authorities');
const browser=freeze.inputs.browserProductEvidence;
for(const entry of [...selection,browser])if(entry?.path){const p=entry.path;add(pin(p,physical(absolute(p))),'base-direct-authority');}
for(const p of repaired.historicalWitnesses)add(p,'p044-read-only-historical-witness');

// esbuild supplies an inspectable static import graph; actual execution below
// uses the original TypeScript reader through tsx, never this compiled graph.
const code=await build({entryPoints:[path.join(root,'apps/web/lib/g678-calibration-product-bridge.server.ts')],
  bundle:true,write:false,platform:'node',format:'esm',target:'node24',packages:'external',metafile:true,
  plugins:[{name:'server-only-scan',setup(builder){
    builder.onResolve({filter:/^server-only$/},()=>({path:'server-only',namespace:'server-only-empty'}));
    builder.onLoad({filter:/.*/,namespace:'server-only-empty'},()=>({contents:'export {};',loader:'js'}));
  }}]});
const codeFiles=Object.keys(code.metafile.inputs).filter(p=>p!=='server-only-empty:server-only');
for(const p of codeFiles){const file=path.resolve(root,p);demand(file.startsWith(root+path.sep),`code-graph-scope:${p}`);const relative=path.relative(root,file);add(pin(relative,physical(file)),'static-reader-code-graph');}
for(const p of ['packages/demos/src/registry.local-only.metadata.generated.ts','packages/demos/src/registry.local-only.generated.ts',
  'packages/demos/package.json','apps/web/package.json','package.json','apps/web/tsconfig.json'])
  add(pin(p,physical(absolute(p))),'external-package-binding');

const conflicts=[...historical].filter(([,versions])=>versions.size>1).map(([name,versions])=>({path:name,versions:[...versions].map(key=>all.get(key))}));
demand(conflicts.length===0,`unresolved-effective-path-conflicts:${conflicts.map(x=>x.path).join(',')}`);
const pins=[...all.values()].sort((a,b)=>a.path.localeCompare(b.path));
const systemPaths=pins.filter(p=>p.path.startsWith('/')&&!p.path.startsWith('/Volumes/')).map(p=>p.path);
demand(systemPaths.length===exactSystemPaths.size&&systemPaths.every(p=>exactSystemPaths.has(p)),
  `unexpected-system-pins:${systemPaths.filter(p=>!exactSystemPaths.has(p)).join(',')}`);
for(const p of pins)checked(p);
const snapshot=g678PartialCalibrationSnapshot();
demand(snapshot.status==='ready'&&snapshot.error===null&&snapshot.descriptors.length===44&&
  snapshot.registeredPlacementCount===379&&snapshot.frozenCalibrationPlacementCount===2282&&
  snapshot.registrationStatus==='private-current-js-calibration-partial','base-output-contract');
const matches=snapshot.descriptors.filter(d=>d.course.moduleCode==='NMS002'&&d.course.lesson===2);
demand(matches.length===1&&matches[0].pages.length===64&&matches[0].productBridge.registeredAnimationCount===5,
  'exact-nms-l02-base');
const nms=matches[0];
for(const p of pins)checked(p);
const nmsCompact=Buffer.from(JSON.stringify(nms));
const allCompact=Buffer.from(JSON.stringify(snapshot.descriptors));
const undefinedOwnProperties=[];
let undefinedCount=0;
function auditUndefined(value){if(!value||typeof value!=='object')return;
  for(const [key,nested] of Object.entries(value)){if(nested===undefined){demand(key==='runtimeEvidenceBoundary','unexpected-undefined-own-key');undefinedCount++;}
    else auditUndefined(nested);}}
auditUndefined(snapshot);
for(const [descriptorIndex,descriptor] of snapshot.descriptors.entries()){
  const pageIndices=descriptor.pages.flatMap((page,pageIndex)=>
    Object.hasOwn(page,'runtimeEvidenceBoundary')&&page.runtimeEvidenceBoundary===undefined?[pageIndex]:[]);
  if(pageIndices.length)undefinedOwnProperties.push({descriptorIndex,pageIndices});
}
demand(undefinedCount===1903&&undefinedOwnProperties.reduce((n,item)=>n+item.pageIndices.length,0)===undefinedCount,
  'complete-bounded-undefined-ledger');
const restored=JSON.parse(JSON.stringify(snapshot));
for(const item of undefinedOwnProperties)for(const pageIndex of item.pageIndices)
  restored.descriptors[item.descriptorIndex].pages[pageIndex].runtimeEvidenceBoundary=undefined;
demand(isDeepStrictEqual(snapshot,restored),'exact-json-plus-ledger-restoration');
const ledgerFile=writeExact('base-witness-v3/undefined-own-properties.json',
  Buffer.from(JSON.stringify({schemaVersion:1,kind:'nms-l02-base-undefined-own-property-ledger-v1',
    property:'runtimeEvidenceBoundary',count:undefinedCount,descriptors:undefinedOwnProperties},null,2)+'\n'));
const descriptorFile=writeExact('base-witness-v3/nms-l02-base-descriptor.json',Buffer.from(JSON.stringify(nms,null,2)+'\n'));
const snapshotCompact=Buffer.from(JSON.stringify(snapshot));
const snapshotFile=writeExact('base-witness-v3/full-base-snapshot.json',Buffer.from(JSON.stringify(snapshot,null,2)+'\n'));
const closureFile=writeExact('base-witness-v3/base-closure.json',Buffer.from(JSON.stringify({schemaVersion:1,
  kind:'nms-l02-live-base-effective-closure-v1',pins,categories:Object.fromEntries([...categories].map(([key,set])=>[key,[...set].sort()])),
  auditCounts:{freezeRecursive:[...categories.values()].filter(set=>set.has('frozen-base-recursive')).length,
    glossaryPhysical:glossaryPaths.length,p044Effective:repairHostPins.length,p042Effective:p042HostPins.length,
    fingerprint:fingerprintPaths.length,typographyFingerprint:typographyPaths.length,staticReaderCode:codeFiles.length,
    unionPins:pins.length},conflicts},null,2)+'\n'));
const scriptBytes=physical(fileURLToPath(import.meta.url));
const predecessorWitness={path:'output/nms-l02-host-successor-20260927/predecessor/base-witness-v2/base-witness.json',bytes:3744,sha256:'9222705bbee9dd99e9ee6fbd68d1fc4f0326a1e593e4709d9ee7cb5c36ea53d8'};
checked(predecessorWitness);
const witness={schemaVersion:1,kind:'nms-l02-live-base-descriptor-witness-v3',predecessorWitness,execution:{method:'unmodified-live-root-reader',
  entry:'g678PartialCalibrationSnapshot',root,sourceRoot:SOURCE_ROOT,phase:PHASE,nodeEnv:'development',
  reader:{path:'apps/web/lib/g678-calibration-product-bridge.server.ts',...pin('',physical(path.join(root,'apps/web/lib/g678-calibration-product-bridge.server.ts'))),path:'apps/web/lib/g678-calibration-product-bridge.server.ts'},
  script:pin(path.relative(root,fileURLToPath(import.meta.url)),scriptBytes),
  observed:{status:snapshot.status,error:snapshot.error,descriptorCount:snapshot.descriptors.length,
    registeredPlacementCount:snapshot.registeredPlacementCount,frozenCalibrationPlacementCount:snapshot.frozenCalibrationPlacementCount,
    registrationStatus:snapshot.registrationStatus,calibrationId:snapshot.calibrationId,
    runtimeAssetCount:snapshot.runtimeAssets.length,maintainedDomRendererCount:snapshot.maintainedDomRenderers.length,
    sharedHostSuccessor:snapshot.sharedHostSuccessor}},
  baseFreeze:FREEZE,closure:closureFile,descriptor:descriptorFile,snapshot:snapshotFile,undefinedOwnProperties:ledgerFile,
  fullSnapshot:{bytes:snapshotCompact.length,sha256:sha(snapshotCompact)},
  fullDescriptorArray:{bytes:allCompact.length,sha256:sha(allCompact)},
  selectedDescriptor:{animationId:'NMS002-L02',pages:nms.pages.length,registered:nms.productBridge.registeredAnimationCount,
    bytes:nmsCompact.length,sha256:sha(nmsCompact)},
  qualifications:['Only the 379-page base was executed live; the P005–P052 successor chain has not yet been executed with this witness.',
    'Effective physical input pins and code graph are rechecked before and after base execution; historical predecessor variants remain separate pinned evidence.',
    'The exact 1,903 own undefined runtimeEvidenceBoundary properties are restored from a pinned bounded ledger; deepStrictEqual to the real in-memory snapshot passed in this producer.',
    'Current-JS registration is distinct from original runtime, fidelity, audio, human and Owner acceptance.'],
  acceptanceEffects:{originalRuntime:false,fidelity:false,audioAcceptance:false,humanReview:false,ownerAcceptance:false,strictComplete:false,publication:false}};
const witnessFile=writeExact('base-witness-v3/base-witness.json',Buffer.from(JSON.stringify(witness,null,2)+'\n'));
process.stdout.write(JSON.stringify({witness:witnessFile,closure:closureFile,descriptor:descriptorFile,snapshot:snapshotFile,ledger:ledgerFile,
  unionPins:pins.length,conflicts:conflicts.length,fullDescriptorArray:witness.fullDescriptorArray,
  selectedDescriptor:witness.selectedDescriptor,auditCounts:JSON.parse(checked(closureFile)).auditCounts})+'\n');
