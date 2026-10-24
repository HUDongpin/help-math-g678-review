#!/usr/bin/env node
/** Source-locked P054 matching DOM run/member. Only --prepare writes new artifacts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {validateP054SourceInventory,validateP054ResourcePins,P054_AUDIO_ROOT,P054_AUDIO_MANIFEST,P054_MOVIE_XML,
 P054_REVIEWED_SOURCE_PINS,P054_FEEDBACK} from '../lib/nms-l02-p054-admission-semantics.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-nms002-l02-p054';
const CALIBRATION='g678-nms-l02-p054-source-matching-current-js-v1';
const RUN_ROOT=`work/g678-shared-page-factory/${CALIBRATION}`;
const RUN=`${RUN_ROOT}/run-manifest.json`;
const MEMBER=`${RUN_ROOT}/members/${ID}/member-manifest.json`;
const MODULE=`packages/demos/src/modules/${ID}.tsx`;
const TIMELINE=`packages/demos/src/timelines/${ID}.ts`;
const SOURCE={path:'G6-G8-shared/NMS002/L2/GS/L2GS03.swf',bytes:2077270,
 sha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIT='migrations/shared-nms002-l02-p054/audit';
const DISPOSITION='output/nms-l02-p054-product-20260928/admission/source-risk-disposition-v1.json';
const REVIEWED_PINS=[
  {
    "path": "catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json",
    "bytes": 12324,
    "sha256": "6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/interaction-contract-v1.json",
    "bytes": 10154,
    "sha256": "7472962f3e1ca32219dafd000a3f9bbcc6b90865cb0ca7d7f3b79d5265cc03b4"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/card-layout-v1.json",
    "bytes": 9042,
    "sha256": "d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/card-display-list-v1.json",
    "bytes": 93561,
    "sha256": "c2e18b123f43e16890548f4be5d38613b022c55c6e2b090cf663dd6d07c62343"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/game-display-list-v1.json",
    "bytes": 32997,
    "sha256": "8887c62a93824e851b2b6bba3779742ba43143b5c8e38b47c49b81c04fa6c40c"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/art-export-v1.json",
    "bytes": 87084,
    "sha256": "b715b175badc1edfcdf5df81ef7c388ea7e0b2eaac99656c28c74d1762e91974"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/audio-structure-v1.json",
    "bytes": 3622,
    "sha256": "0e1b96f79f08d636bdf1aeb5650901b2e43ac091f72c3c36e594b3e3354a3871"
  },
  {
    "path": "migrations/shared-nms002-l02-p054/audit/indexmi-host-binding-v1.json",
    "bytes": 4543,
    "sha256": "83e502b8d081398d0f49673d4207b614183df90af2446d40b92bb79d85f00b5b"
  },
  {
    "path": "output/nms-l02-p054-product-20260928/PRODUCT_BEHAVIOR_DISPOSITION_V1.md",
    "bytes": 3170,
    "sha256": "6292691e7431ade09c63368e331a04d8c8add38fb6338f24c39e034270963990"
  },
  {
    "path": "output/nms-l02-p054-product-20260928/admission/source-risk-disposition-v1.json",
    "bytes": 3998,
    "sha256": "f037e4a9da8ad7a74a9427395a13963f135ff5068b8ed43061bd96ade18098b2"
  }
];
const SOURCE_INPUTS=[
  "catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json",
  "migrations/shared-nms002-l02-p054/audit/interaction-contract-v1.json",
  "migrations/shared-nms002-l02-p054/audit/card-layout-v1.json",
  "migrations/shared-nms002-l02-p054/audit/card-display-list-v1.json",
  "migrations/shared-nms002-l02-p054/audit/game-display-list-v1.json",
  "migrations/shared-nms002-l02-p054/audit/art-export-v1.json",
  "migrations/shared-nms002-l02-p054/audit/audio-structure-v1.json",
  "migrations/shared-nms002-l02-p054/audit/indexmi-host-binding-v1.json",
  "output/nms-l02-p054-product-20260928/PRODUCT_BEHAVIOR_DISPOSITION_V1.md",
  "output/nms-l02-p054-product-20260928/admission/source-risk-disposition-v1.json"
];
const PRODUCT_INPUTS=[
  "packages/demos/src/nms-l02-p054-product-module-v1.tsx",
  "packages/demos/src/nms-l02-p054-product-board-v1.tsx",
  "packages/demos/src/nms-l02-p054-board-candidate.css",
  "packages/demos/src/nms-l02-p054-matching-state-candidate.ts",
  "packages/demos/src/generated/nms-l02-p054-cards-v1.ts",
  "packages/demos/src/nms-l02-p054-reveal-v1.ts",
  "packages/demos/src/nms-l02-p054-feedback-audio-v1.ts",
  "packages/demos/src/nms-l02-p054-feedback-audio-loader.ts",
  "apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx"
];
const PRODUCT_TESTS=[
  "packages/demos/tests/nms-l02-p054-product-module-v1.test.tsx",
  "packages/demos/tests/nms-l02-p054-product-board-v1.test.tsx",
  "packages/demos/tests/nms-l02-p054-matching-state-candidate.test.ts",
  "packages/demos/tests/nms-l02-p054-interaction-contract-v1.test.ts",
  "packages/demos/tests/nms-l02-p054-card-layout-v1.test.ts",
  "packages/demos/tests/nms-l02-p054-card-display-list-v1.test.ts",
  "packages/demos/tests/nms-l02-p054-game-display-list-v1.test.ts",
  "packages/demos/tests/nms-l02-p054-audio-stream-extraction-v1.test.ts",
  "apps/web/tests/nms-l02-p054-lesson-runtime-v1.test.tsx"
];
const PRODUCER_INPUTS=[
  "scripts/audit-nms-l02-p054-interaction-contract-v1.mjs",
  "scripts/build-nms-l02-p054-card-display-list-v1.mjs",
  "scripts/build-nms-l02-p054-game-display-list-v1.mjs",
  "scripts/build-nms-l02-p054-card-data-v1.mjs",
  "scripts/extract-nms-l02-p054-audio-v1.py",
  "scripts/prepare-nms-l02-p054-dom-artifacts-v1.mjs",
  "scripts/prepare-nms-l02-p054-dom-artifacts-v1.test.mjs",
  "lib/nms-l02-p054-admission-semantics.mjs",
  "lib/nms-l02-p054-admission-semantics.test.mjs"
];
const GENERATOR_CHECKS=[
  [
    "scripts/audit-nms-l02-p054-interaction-contract-v1.mjs",
    "migrations/shared-nms002-l02-p054/audit/interaction-contract-v1.json"
  ],
  [
    "scripts/build-nms-l02-p054-card-display-list-v1.mjs",
    "migrations/shared-nms002-l02-p054/audit/card-display-list-v1.json"
  ],
  [
    "scripts/build-nms-l02-p054-game-display-list-v1.mjs",
    "migrations/shared-nms002-l02-p054/audit/game-display-list-v1.json"
  ],
  [
    "scripts/build-nms-l02-p054-card-data-v1.mjs",
    "packages/demos/src/generated/nms-l02-p054-cards-v1.ts"
  ]
];
const SHARED_DEPENDENCIES=[
 'packages/demos/src/contract.ts',
 'packages/demos/src/lesson-host-contract.ts',
 'apps/web/lib/lesson-runtime-adapter.ts',
 'apps/web/components/animation-runtime.tsx',
 'apps/web/tsconfig.json',
 'lib/g678-admission-proof.mjs',
 'scripts/private-current-js-registry.mjs',
];
const ACCEPTANCE={authoritativeOriginalRuntime:false,fidelityAccepted:false,
 audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,
 strictComplete:false,published:false};
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(a,b,label)=>assert.deepStrictEqual(a,b,label);
const boundedRelative=p=>typeof p==='string'&&!path.isAbsolute(p)&&!p.includes('..')&&!p.includes('\\');
const exact=(root,pin)=>{same(pinFile(root,pin.path),pin,`exact ${pin.path}`);return readPin(root,pin);};

function absolutePin(relative,expected){
 assert(boundedRelative(relative),'bounded physical source path');
 const file=path.join(SOURCE_ROOT,relative);
 assert.equal(fs.realpathSync(file),file,`real source file ${relative}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.size<=64n*1024n*1024n,
  `ordinary source file ${relative}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 assert(['dev','ino','mode','size','mtimeNs','ctimeNs'].every(key=>before[key]===after[key]),
  `stable source file ${relative}`);
 const pin=bytePin(file,bytes);
 if(expected)same(pin,{...expected,path:file},`exact source ${relative}`);
 return pin;
}
function externalPin(file){const p=pinFile(path.dirname(file),path.basename(file));return {...p,path:file};}
export function sourceEvidence(root){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical source root');
 assert(fs.lstatSync(SOURCE_ROOT).isDirectory()&&!fs.lstatSync(SOURCE_ROOT).isSymbolicLink());
 const source=absolutePin(SOURCE.path,SOURCE),xml=absolutePin(XML.path,XML);
 for(const pin of REVIEWED_PINS)exact(root,pin);
 const audits=Object.fromEntries(Object.entries(P054_REVIEWED_SOURCE_PINS)
  .filter(([key])=>key!=='disposition').map(([key,pin])=>[key,JSON.parse(exact(root,pin))]));
 const movie=externalPin(P054_MOVIE_XML.path);same(movie,P054_MOVIE_XML,'movie XML');
 const audioManifestPin=externalPin(P054_AUDIO_MANIFEST.path);
 assert.equal(audioManifestPin.sha256,P054_AUDIO_MANIFEST.sha256);
 const audioManifest=JSON.parse(readPin(path.dirname(audioManifestPin.path),{...audioManifestPin,path:path.basename(audioManifestPin.path)}));
 validateP054SourceInventory({...audits,audioManifest});
 const audioPins=P054_FEEDBACK.map(row=>{same(externalPin(row.audio.path),row.audio,'feedback bytes');return row.audio;});
 const revealPins=[];
 for(const level of [1,2])for(let order=1;order<=12;order++){
  const shape=(level===1?108:668)+order*2;
  const item=audits.art.export.items.find(row=>row.file===`shapes/${shape}.svg`);
  const expected={path:path.join(audits.art.export.root,item.file),bytes:item.bytes,sha256:item.sha256};
  same(externalPin(expected.path),expected,'source reveal bytes');revealPins.push(expected);
 }
 assert.equal(new Set(revealPins.map(row=>row.path)).size,24);
 validateP054ResourcePins({art:audits.art,audioManifest,resourcePins:uniquePins([...revealPins,...audioPins])});
 const disposition=JSON.parse(exact(root,REVIEWED_PINS.find(row=>row.path===DISPOSITION)));
 same(disposition.acceptanceEffects,ACCEPTANCE,'reviewed independent gates');
 assert.equal(disposition.behavior.terminalPhase,'terminal-unresolved');
 assert.equal(disposition.behavior.hostCompletion,false);
 assert.equal(disposition.behavior.finalQuizScoring,false);
 return{source,xml,audits,movie,audioManifestPin,audioPins,revealPins,disposition};
}
function walkEvidence(root,relative){
 const absolute=path.join(root,relative),entries=[];
 assert.equal(fs.realpathSync(absolute),absolute,'physical browser evidence folder');
 function walk(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  assert(!entry.isSymbolicLink(),'no browser evidence symlink');
  const child=path.join(dir,entry.name);
  if(entry.isDirectory())walk(child);
  else{assert(entry.isFile(),'ordinary browser evidence');
   const candidate=path.relative(root,child);
   assert(boundedRelative(candidate));entries.push(candidate);}
 }}
 const receipt=JSON.parse(readPin(root,pinFile(root,`${relative}/result.json`)));
 assert.equal(receipt.status,'technical-pass-not-acceptance','successful browser evidence');
 assert.equal(receipt.inputStable,true);assert.equal(receipt.browserProcessExited,true);
 same(receipt.cleanupErrors,[],'clean browser shutdown');
 assert.equal(receipt.cases.length,2);
 assert(receipt.cases.every(row=>row.status==='technical-pass-not-acceptance'),'both locales passed');
 walk(absolute);
 assert(entries.includes(`${relative}/result.json`)&&entries.length>=3,
  'completed immutable browser evidence');
 return entries.sort((a,b)=>a.localeCompare(b));
}
function sourceScripts(sourcePin){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'p054-dom-source-as-'));
 const retained='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5';
 try{
  const command=spawnSync('ffdec',['-export','script',dir,sourcePin.path],
   {encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
  assert.equal(command.status,0,`FFDec P054 script export: ${command.stderr??command.error}`);
  assert.match(command.stdout,/JPEXS Free Flash Decompiler v\.26\.2\.1/u);
  const scripts=[];
  function walk(current){for(const entry of fs.readdirSync(current,{withFileTypes:true})){
   const child=path.join(current,entry.name);assert(!entry.isSymbolicLink(),'exported script link');
   if(entry.isDirectory())walk(child);
   else{assert(entry.isFile()&&child.endsWith('.as'),'only ActionScript exports');
    const relative=path.relative(dir,child);assert(boundedRelative(relative));
    const bytes=fs.readFileSync(child),original=pinFile(retained,relative);
    same({bytes:bytes.length,sha256:sha256(bytes)},
     {bytes:original.bytes,sha256:original.sha256},'fresh export matches retained script');
    scripts.push({exportPath:relative,bytes:bytes.length,sha256:sha256(bytes)});}
  }}
  walk(path.join(dir,'scripts'));scripts.sort((a,b)=>a.exportPath.localeCompare(b.exportPath));
  assert.equal(scripts.length,110,'every exported ActionScript file');
  return scripts;
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
function runChecks(root){
 const generatorChecks=GENERATOR_CHECKS.map(([producer,output])=>{
  const python=producer.endsWith('.py');
  const run=spawnSync(python?'python3':process.execPath,
   [path.join(root,producer),'--check'],{cwd:root,
    env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT},
    encoding:'utf8',timeout:240000,maxBuffer:2*1024*1024});
  assert.equal(run.status,0,`${producer} --check: ${String(run.stderr??run.error??'').slice(0,1500)}`);
  return{producer:pinFile(root,producer),output:pinFile(root,output),
   mode:'--check',exitCode:0};
 });
 const product=spawnSync(process.execPath,['--import','tsx','--test',...PRODUCT_TESTS],
  {cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT,
   TSX_TSCONFIG_PATH:path.join(root,'apps/web/tsconfig.json')},
   encoding:'utf8',timeout:240000,maxBuffer:2*1024*1024});
 assert.equal(product.status,0,`P054 maintained product tests: ${String(product.stderr??'').slice(0,1500)} ${String(product.stdout??'').slice(-3000)} ${String(product.error??'')}`);
 return{generatorChecks,validationChecks:[{tests:PRODUCT_TESTS.map(item=>pinFile(root,item)),
  mode:'TSX_TSCONFIG_PATH=apps/web/tsconfig.json node --import tsx --test',exitCode:0}]};
}
export function canonicalSources(){
 const module=Buffer.from('"use client";\n\nimport {nmsL02P054ProductModuleV1, P054_SOURCE} from "../nms-l02-p054-product-module-v1";\n\nexport {P054_SOURCE};\nconst animationModule = Object.freeze({...nmsL02P054ProductModuleV1, maturity: "private-current-js" as const});\nexport default animationModule;\n');
 const timeline=Buffer.from(`/** Source-locked matching metadata; no generic frame playback or completion. */\nexport const SHARED_NMS002_L02_P054_SOURCE = Object.freeze(${JSON.stringify({
  calibrationId:CALIBRATION,animationId:ID,source:SOURCE,sourceXml:XML,
  stage:{width:800,height:600},fps:12,rootFrames:10,rootPlacementFrame:6,
  frameDomain:'sprite-731',sourceFrameCount:5,levelFrames:[2,4],levelCount:2,
  cardsPerLevel:12,pairsPerLevel:6,correctDelta:10,wrongDelta:-2,scoreFloor:null,
  sourceTimelineSeekAvailable:false,genericFrameCompletionAvailable:false,
  terminalOutcome:'terminal-unresolved',hostExitResolved:false,
  originalRuntimeParityEstablished:false,audioAccepted:false,humanReviewed:false,ownerAccepted:false,
 },null,2)} as const);\n`);
 return{module,timeline};
}
function registryProjection(root,artifacts){
 const registry=JSON.parse(readPin(root,pinFile(root,'packages/demos/private-current-js-registry.json')));
 const existing=registry.calibrations.flatMap(row=>row.entries.filter(item=>item.key===ID));
 assert.equal(existing.length,0,'P054 remains unregistered while preparing DOM artifacts');
 const fragment={calibrationId:CALIBRATION,deploymentScope:'local-only',
  freezeManifest:`catalog/product-bridge-calibrations/${CALIBRATION}.json`,
  freezeManifestBytes:1,freezeManifestSha256:'0'.repeat(64),
  entries:[{key:ID,module:`./modules/${ID}`,maturity:'private-current-js',
   complexityLane:'behavior-heavy',artifacts}]};
 const projected=upsertPrivateCurrentJsCalibration(registry,fragment);
 assert(projected.calibrations.some(row=>row.calibrationId===CALIBRATION));
 return true;
}
export function buildP054DomArtifactPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering only');
 const source=sourceEvidence(root),generated=canonicalSources();
 const browserFolders=[
  'output/nms-l02-p054-product-20260928/browser/product-candidate-v1/product-candidate-v4',
  'output/nms-l02-p054-product-20260928/browser/pending-media-v2/candidate-v3',
 ];
 const browserPaths=browserFolders.flatMap(relative=>walkEvidence(root,relative));
 const ownPaths=[...SOURCE_INPUTS,...PRODUCT_INPUTS,...PRODUCT_TESTS,...PRODUCER_INPUTS,
  ...browserPaths];
 const planned=[bytePin(MODULE,generated.module),bytePin(TIMELINE,generated.timeline)];
 for(const pin of planned)if(fs.existsSync(path.join(root,pin.path)))
  same(pinFile(root,pin.path),pin,`existing canonical ${pin.path}`);
 const inputs=uniquePins([...ownPaths.map(item=>pinFile(root,item)),...planned]);
 const sharedDependencies=uniquePins(SHARED_DEPENDENCIES.map(item=>pinFile(root,item)));
 assert(sharedDependencies.every(pin=>!inputs.some(item=>item.path===pin.path)),
  'page-owned and host-owned paths disjoint');
 const sourceActionScripts=sourceScripts(source.source);
 const checks=runChecks(root);
 for(const check of checks.generatorChecks){
  same(inputs.find(pin=>pin.path===check.producer.path),check.producer,'producer in own closure');
  same(inputs.find(pin=>pin.path===check.output.path),check.output,'generated source in own closure');
 }
 const externalEvidence=uniquePins([source.source,source.xml,source.movie,source.audioManifestPin,...source.audioPins,...source.revealPins]);
 const outputs=uniquePins(planned);
 const runManifest={schemaVersion:1,kind:'nms-l02-p054-maintained-dom-source-run-v1',
  animationId:ID,method:'source-locked-FFDec-swfmill-IR-and-maintained-DOM-matching-state',
  complexityLane:'behavior-heavy',sourceRoot:SOURCE_ROOT,source:SOURCE,sourceXml:XML,
  sourceStructure:{stage:{width:800,height:600},fps:12,rootFrameCount:10,
   rootBeginFrame:6,frameDomain:'sprite-731',sourceFrameCount:5,levelFrames:[2,4],
   sourceFrameIntrospectionOnly:true,sourceTimelineSeekAvailable:false,
   genericFrameCompletionAvailable:false,hostExitResolved:false,originalRuntimeParityEstablished:false},
  sourceMatching:{levelCount:2,cardsPerLevel:12,pairsPerLevel:6,sourceActionScripts,
   audits:REVIEWED_PINS.filter(row=>row.path!==DISPOSITION)},
  behavior:{disposition:pinFile(root,DISPOSITION),
   matchingState:pinFile(root,'packages/demos/src/nms-l02-p054-matching-state-candidate.ts'),
   board:pinFile(root,'packages/demos/src/nms-l02-p054-product-board-v1.tsx'),
   runtimeAdapter:pinFile(root,'apps/web/components/nms-l02-p054-lesson-runtime-v1.tsx'),
   productModule:pinFile(root,'packages/demos/src/nms-l02-p054-product-module-v1.tsx'),
   browserMain:pinFile(root,`${browserFolders[0]}/result.json`),
   browserPendingMedia:pinFile(root,`${browserFolders[1]}/result.json`),
   terminalOutcome:'terminal-unresolved',hostPlaybackCompletion:false,finalQuizScoring:false},
  audio:{manifest:source.audioManifestPin,feedback:source.audioPins,
   acceptedCueCount:0,sourceAlignmentAccepted:false,listeningAccepted:false,
   localeAutoPlayback:false,resultAudioActivated:false,spanishAudioActivated:false},
  reveal:source.revealPins,sourceKeyAttributeCalls:0,glossary:[],
  externalEvidence,generatorChecks:checks.generatorChecks,
  validationChecks:checks.validationChecks,inputs,outputs,sharedDependencies,
  productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:ACCEPTANCE};
 const runBytes=json(runManifest),runPin=bytePin(RUN,runBytes);
 const memberManifest={schemaVersion:1,kind:'nms-l02-p054-maintained-dom-member-v1',
  animationId:ID,rendererBindingKind:'maintained-dom-module-v1',source:SOURCE,
  sourceXml:XML,sourceRun:runPin,module:planned[0],timeline:planned[1],
  inputs,outputs,externalEvidence,sharedDependencies,
  productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:ACCEPTANCE};
 const memberBytes=json(memberManifest),memberPin=bytePin(MEMBER,memberBytes);
 const artifacts={kind:'maintained-dom-module-v1',module:planned[0],timeline:planned[1],
  memberManifest:memberPin,sourceRun:runPin};
 assert(registryProjection(root,artifacts));
 return{root,runManifest,memberManifest,artifacts,registryShapeAccepted:true,
  outputs:[{path:MODULE,bytes:generated.module},{path:TIMELINE,bytes:generated.timeline},
   {path:RUN,bytes:runBytes},{path:MEMBER,bytes:memberBytes}]};
}
export function prepareP054DomArtifacts(plan){
 assert(plan.outputs.every(item=>!fs.existsSync(path.join(plan.root,item.path))),
  'immutable DOM artifacts already exist; use --check');
 for(const item of plan.outputs){
  const file=path.join(plan.root,item.path);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,item.bytes,{flag:'wx'});
  same(pinFile(plan.root,item.path),bytePin(item.path,item.bytes),'written DOM artifact');
 }
 return{status:'P054_DOM_ARTIFACTS_PREPARED_UNREGISTERED',artifacts:plan.artifacts,
  registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
}
export function checkP054DomArtifacts(plan){
 for(const item of plan.outputs)same(readPin(plan.root,bytePin(item.path,item.bytes)),item.bytes,
  `${item.path} manifest drift`);
 return{status:'P054_DOM_ARTIFACTS_CHECKED_UNREGISTERED',artifacts:plan.artifacts,
  registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--prepare','--check'].includes(process.argv[2]),
   'use --plan, --prepare or --check');
  const plan=buildP054DomArtifactPlan();
  const result=process.argv[2]==='--prepare'?prepareP054DomArtifacts(plan):
   process.argv[2]==='--check'?checkP054DomArtifacts(plan):
   {status:'P054_DOM_ARTIFACTS_PLAN_UNREGISTERED',artifacts:plan.artifacts,
    inputCount:plan.runManifest.inputs.length,outputCount:plan.runManifest.outputs.length,
    sharedDependencyCount:plan.runManifest.sharedDependencies.length,
    sourceActionScriptCount:plan.runManifest.sourceMatching.sourceActionScripts.length,
    externalEvidenceCount:plan.runManifest.externalEvidence.length,
    registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
