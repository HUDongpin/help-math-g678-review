#!/usr/bin/env node
/** P053 source-locked DOM run/member planner. Browser/admission evidence is a later gate. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-nms002-l02-p053';
const CALIBRATION='g678-nms-l02-p053-source-directions-current-js-v1';
const RUN_ROOT=`work/g678-shared-page-factory/${CALIBRATION}`;
const RUN=`${RUN_ROOT}/run-manifest.json`;
const MEMBER=`${RUN_ROOT}/members/${ID}/member-manifest.json`;
const MODULE=`packages/demos/src/modules/${ID}.tsx`;
const TIMELINE=`packages/demos/src/timelines/${ID}.ts`;
const SOURCE={path:'G6-G8-shared/NMS002/L2/GS/L2GS02.swf',bytes:236774,
 sha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIT_ROOT='migrations/shared-nms002-l02-p053/audit';
const SOURCE_AUDITS=Object.freeze({
 native:{path:`${AUDIT_ROOT}/native-display-product-v1.json`,bytes:358217,sha256:'2c00b045bf3153ac5f6aadcc197674aca9f368354d85ffbe6bb620854c039151'},
 visual:{path:`${AUDIT_ROOT}/visual-scene-v1.json`,bytes:1565440,sha256:'b22a2e71c920e425d397a0070338ef9d66e714fff31df8959d9115878fbe8ea7'},
 shape:{path:`${AUDIT_ROOT}/shape-art-v1.json`,bytes:53546,sha256:'32a3896deed3819ad724c79170de6149c1e83c3dfd536974b3b42d12348b5e40'},
 stream:{path:`${AUDIT_ROOT}/source-stream-product-v1.json`,bytes:2385,sha256:'5106b1751eb3e40575cb0daad40e4e40563e087fe6da536f283de799d50cc3da'},
 graph:{path:`${AUDIT_ROOT}/frame-domain-static-graph-v1.json`,bytes:4685,sha256:'8ad79c29aedcb0553b571ed8f20f8f826b7a5feba15c770d2a433f27a40ff3aa'},
 host:{path:`${AUDIT_ROOT}/host-navigation-resolution-v1.json`,bytes:5555,sha256:'4082197b15ee072fcbbbff594c5a92ceaf19c039964fa3d8cd58cb83a3536332'},
 audioStructure:{path:`${AUDIT_ROOT}/audio-structure-v1.json`,bytes:2186,sha256:'2468bc4e992701c7fee12a5b52566dcf4653dcb965a474f2d041927c8a5d7d56'},
 gameContract:{path:'catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json',bytes:12324,sha256:'6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205'},
});
const OWN_INPUTS=Object.freeze([
 'packages/demos/src/nms-l02-p053-controller-candidate.ts',
 'packages/demos/src/nms-l02-p053-player-state-v1.ts',
 'packages/demos/src/nms-l02-p053-display-state-v1.ts',
 'packages/demos/src/nms-l02-p053-source-scene-v1.tsx',
 'packages/demos/src/nms-l02-p053-readable-directions-v1.tsx',
 'packages/demos/src/nms-l02-p053-host-navigation-v1.ts',
 'packages/demos/src/nms-l02-p053-source-audio-loader.ts',
 'packages/demos/src/generated/nms-l02-p053-display-data-v1.ts',
 'packages/demos/src/generated/nms-l02-p053-shape-art-v1.ts',
 'apps/web/components/nms-l02-p053-lesson-runtime-v1.tsx',
 'scripts/generate-nms-l02-p053-display-data-v1.mjs',
 'scripts/build-nms-l02-p053-shape-art-v1.mjs',
 'scripts/build-nms-l02-p053-visual-scene-v1.mjs',
 'scripts/audit-nms-l02-p053-native-display-v1.mjs',
 'scripts/extract-nms-l02-p053-source-stream-v1.mjs',
 'scripts/prepare-nms-l02-p053-dom-artifacts-v1.mjs',
 'scripts/prepare-nms-l02-p053-dom-artifacts-v1.test.mjs',
]);
/** Host-v16 owns these mutable route/descriptor/resource bindings after activation. */
export const P053_DEFERRED_HOST_PATHS=Object.freeze([
 'apps/web/components/nms-l02-p053-game-handoff-runtime-v1.tsx',
 'apps/web/components/nms-l02-p053-host-v1.css',
 'apps/web/components/g678-nms-l02-p053-product-lesson-v1.generated.tsx',
 'apps/web/components/g678-nms-l02-candidate-player.generated.tsx',
 'apps/web/lib/nms-l02-p053-product-descriptor-v1.ts',
 'apps/web/lib/nms-l02-p053-product-candidate.server.ts',
 'apps/web/lib/nms-l02-p053-product-host.production-stub.tsx',
 'apps/web/lib/nms-l02-p053-source-audio-access.ts',
 'apps/web/lib/nms-l02-p053-source-audio.server.ts',
 'apps/web/lib/nms-l02-p053-game-resource-access.ts',
 'apps/web/app/[locale]/migration-status/g678-calibration/shared-nms002-l02-p053/page.tsx',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/source-audio/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/reveal/[level]/[order]/route.ts',
 'apps/web/app/flash-assets/g678-local/shared-nms002-l02-p053/game/feedback-audio/[kind]/route.ts',
 'apps/web/tests/nms-l02-p053-product-descriptor-v1.test.ts',
 'apps/web/tests/nms-l02-p053-source-audio-access.test.ts',
 'apps/web/tests/nms-l02-p053-source-audio.server-test.ts',
 'apps/web/tests/nms-l02-p053-game-resource-access.test.ts',
 'apps/web/tests/nms-l02-p053-local-media-policy.test.mjs',
 'scripts/generate-nms-l02-p053-product-host-v1.mjs',
 'scripts/generate-nms-l02-p053-product-host-v1.test.mjs',
]);
const UNIT_TESTS=Object.freeze([
 'packages/demos/tests/nms-l02-p053-controller-candidate.test.ts',
 'packages/demos/tests/nms-l02-p053-display-state-v1.test.ts',
 'packages/demos/tests/nms-l02-p053-player-state-v1.test.ts',
 'packages/demos/tests/nms-l02-p053-host-navigation-v1.test.ts',
 'packages/demos/tests/nms-l02-p053-source-audio-loader.test.ts',
 'packages/demos/tests/nms-l02-p053-source-scene-v1.test.tsx',
 'packages/demos/tests/nms-l02-p053-readable-directions-v1.test.tsx',
 'apps/web/tests/nms-l02-p053-lesson-runtime-v1.test.tsx',
]);
const BROWSER_TEST='packages/demos/tests/nms-l02-p053-source-audio-native-fetch.browser-test.ts';
const SOURCE_TESTS=Object.freeze([
 'scripts/audit-nms-l02-p053-native-display-v1.test.mjs',
 'scripts/build-nms-l02-p053-visual-scene-v1.test.mjs',
 'scripts/build-nms-l02-p053-shape-art-v1.test.mjs',
 'scripts/generate-nms-l02-p053-display-data-v1.test.mjs',
 'scripts/extract-nms-l02-p053-source-stream-v1.test.mjs',
]);
const CHECKS=Object.freeze([
 ['scripts/audit-nms-l02-p053-native-display-v1.mjs',SOURCE_AUDITS.native.path],
 ['scripts/build-nms-l02-p053-visual-scene-v1.mjs',SOURCE_AUDITS.visual.path],
 ['scripts/build-nms-l02-p053-shape-art-v1.mjs',SOURCE_AUDITS.shape.path],
 ['scripts/generate-nms-l02-p053-display-data-v1.mjs','packages/demos/src/generated/nms-l02-p053-display-data-v1.ts'],
 ['scripts/extract-nms-l02-p053-source-stream-v1.mjs',SOURCE_AUDITS.stream.path],
]);
const SHARED_DEPENDENCIES=Object.freeze([
 'packages/demos/src/contract.ts',
 'packages/demos/src/lesson-host-contract.ts',
 'apps/web/lib/lesson-runtime-adapter.ts',
 'apps/web/components/animation-runtime.tsx',
 'apps/web/tsconfig.json',
 'lib/g678-admission-proof.mjs',
 'scripts/private-current-js-registry.mjs',
]);
const ACCEPTANCE=Object.freeze({authoritativeOriginalRuntime:false,fidelityAccepted:false,
 audioAccepted:false,humanVisualAccepted:false,ownerAccepted:false,strictComplete:false,published:false});
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const bytePin=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});
const same=(a,b,label)=>assert.deepStrictEqual(a,b,label);
const bounded=p=>typeof p==='string'&&!path.isAbsolute(p)&&!p.includes('..')&&!p.includes('\\');
function pinned(root,pin){same(pinFile(root,pin.path),pin,`pin ${pin.path}`);return readPin(root,pin);}
function externalPin(file){assert(path.isAbsolute(file));const pin=pinFile(path.dirname(file),path.basename(file));return {...pin,path:file};}

/** Exact current source and retained technical exports; no browser or original-runtime inference. */
export function sourceEvidence(root=ROOT){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical AWS root');
 assert(fs.lstatSync(SOURCE_ROOT).isDirectory()&&!fs.lstatSync(SOURCE_ROOT).isSymbolicLink());
 const source=externalPin(path.join(SOURCE_ROOT,SOURCE.path));same(source,{...SOURCE,path:source.path},'source SWF');
 const xml=externalPin(path.join(SOURCE_ROOT,XML.path));same(xml,{...XML,path:xml.path},'lesson XML');
 const audits=Object.fromEntries(Object.entries(SOURCE_AUDITS).map(([key,pin])=>[key,JSON.parse(pinned(root,pin))]));
 assert.equal(audits.native.animationId,ID);assert.equal(audits.native.source.sha256,SOURCE.sha256);
 assert.equal(audits.native.extraction.scriptPins.length,59,'all native AVM1 source pins');
 assert.equal(audits.visual.mainFrameDomain.heldFrame,693);
 assert.equal(audits.visual.mainFrameDomain.nextFrameAutoReachedEstablished,false);
 assert.equal(audits.shape.export.rawExportedShapeCount,68);
 assert.equal(audits.shape.export.consumedShapeCount,48);
 assert.equal(audits.shape.shapes.length,48);
 assert.equal(audits.stream.stream.blockCount,619);
 assert.equal(audits.stream.stream.lastBlockFrame,694);
 assert.equal(audits.stream.decode.fullEofDecode,true);
 assert.equal(audits.stream.limits.audioListeningAccepted,false);
 assert.equal(audits.stream.limits.originalRuntimeAccepted,false);
 assert.equal(audits.host.lessonXml.sha256,XML.sha256);
 assert.deepStrictEqual(audits.host.lessonXml.gsPagesInOrder,['GS/L2GS02.swf','GS/L2GS03.swf']);
 assert.equal(audits.host.originalRuntimeAccepted,false);
 const movie=externalPin(audits.native.extraction.movieXml.path);
 assert.equal(movie.sha256,'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1');
 const scriptRoot=audits.native.extraction.scriptsRoot;
 assert(scriptRoot.startsWith('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/'));
 const scripts=audits.native.extraction.scriptPins.map(pin=>{
  assert(bounded(pin.path));const found=externalPin(path.join(scriptRoot,pin.path));
  same({bytes:found.bytes,sha256:found.sha256},{bytes:pin.bytes,sha256:pin.sha256},`AVM1 ${pin.path}`);
  return found;
 });
 const shapeRoot=audits.shape.export.externalExportRoot;
 assert(shapeRoot.startsWith('/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/'));
 const shapes=audits.shape.export.rawFiles.map(pin=>{
  assert(bounded(pin.path));const found=externalPin(path.join(shapeRoot,pin.path));
  same({bytes:found.bytes,sha256:found.sha256},{bytes:pin.bytes,sha256:pin.sha256},`shape ${pin.path}`);
  return found;
 });
 same(audits.shape.shapes.map(item=>item.rawExport.path),
  audits.shape.shapes.map(item=>`${item.characterId}.svg`),'48 consumed shape identities');
 const mp3=externalPin(audits.stream.externalFiles.mp3.path);
 const rawIndex=externalPin(audits.stream.externalFiles.rawIndex.path);
 same(mp3,audits.stream.externalFiles.mp3,'full source-order MP3');
 same(rawIndex,audits.stream.externalFiles.rawIndex,'raw block map');
 const hostBinding=externalPin(audits.host.hostBinding.path);
 assert.equal(hostBinding.sha256,audits.host.hostBinding.sha256);
 const retainedHost='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1';
 const hostScripts=Object.values(audits.host.hostScripts).map(item=>{
  assert(bounded(item.relativeToExtraction));const found=externalPin(path.join(retainedHost,item.relativeToExtraction));
  assert.equal(found.sha256,item.sha256);return found;
 });
 const externalEvidence=uniquePins([source,xml,movie,...scripts,...shapes,mp3,rawIndex,hostBinding,...hostScripts]);
 return{source,xml,audits,movie,scripts,shapes,mp3,rawIndex,hostBinding,hostScripts,externalEvidence};
}

/** Metadata-only canonical registration module; actual interaction stays in the My Lesson adapter. */
export function canonicalSources(){
 const module=Buffer.from(`'use client';\n\nimport React from 'react';\nimport type {AnimationModule,AnimationRendererProps,RuntimeContext} from '../contract';\nimport {P053SourceScene} from '../nms-l02-p053-source-scene-v1';\n\nexport const P053_SOURCE=Object.freeze({animationId:'${ID}',relativePath:'${SOURCE.path}',bytes:${SOURCE.bytes},sha256:'${SOURCE.sha256}',stage:{width:800,height:600},fps:12,rootFrames:10,rootPlacementFrame:6,mainSpriteId:187,mainFrames:694,heldFrame:693});\nexport function p053ProductFrameState(frame:number,context:RuntimeContext){\n const supported=Number.isSafeInteger(frame)&&frame>=1&&frame<=693&&context.frame===frame&&\n  context.frameDomain==='sprite-187'&&context.rootFrame===6&&context.scenario==='source-directions-v1'&&\n  context.lang==='en'&&context.seed===0;\n return Object.freeze({animationId:P053_SOURCE.animationId,sourceSwfSha256:P053_SOURCE.sha256,\n  status:supported?'source-static-candidate' as const:'blocked' as const,frame,\n  originalRuntimeParityEstablished:false as const,audioSynchronizationEstablished:false as const,\n  hostCompletion:false as const});\n}\nfunction Renderer(props:AnimationRendererProps){\n const state=p053ProductFrameState(props.frame,props);\n return state.status==='blocked'?<section data-p053-module-status="blocked"/>:\n  <div data-p053-module-status="source-static-candidate"><P053SourceScene frame={props.frame}/></div>;\n}\nconst stage=Object.freeze({width:800,height:600});\nconst animationModule:AnimationModule<ReturnType<typeof p053ProductFrameState>>=Object.freeze({\n key:P053_SOURCE.animationId,movie:{stage,fps:12,frameCount:10,durationMs:10000/12},\n runtime:{stage,fps:12,frameCount:10,durationMs:10000/12,defaultFrameDomain:'sprite-187',\n  frameDomains:[{id:'sprite-187',frameCount:694,fps:12,rootFrame:6}]},\n playbackMode:'once',playbackEndFrameByDomain:{root:6,'sprite-187':693},\n scenarios:[{id:'source-directions-v1',label:'Source directions; maintained host owns controls'}],\n defaultScenarioByFrameDomain:{'sprite-187':'source-directions-v1'},audioCues:[],\n maturity:'private-current-js',Renderer,getFrameState:p053ProductFrameState,\n});\nexport default animationModule;\n`);
 const timeline=Buffer.from(`/** Source-static timing metadata. Audio duration does not define the visual clock. */\nexport const SHARED_NMS002_L02_P053_SOURCE = Object.freeze(${JSON.stringify({
  calibrationId:CALIBRATION,animationId:ID,source:SOURCE,sourceXml:XML,
  stage:{width:800,height:600},fps:12,rootFrames:10,rootPlacementFrame:6,
  frameDomain:'sprite-187',sourceFrameCount:694,maintainedHeldFrame:693,
  sourceAudioBlockCount:619,sourceAudioLastBlockFrame:694,
  sourceTimelineSeekAvailable:false,originalRuntimeParityEstablished:false,
  originalAudioSynchronizationEstablished:false,popupCloseReceiverResolved:false,
  originalHostNavigationObserved:false,hostCompletion:false,audioAccepted:false,
  humanReviewed:false,ownerAccepted:false,
 },null,2)} as const);\n`);
 return{module,timeline};
}

function freshScripts(source,native){
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'p053-dom-as-'));
 try{
  const run=spawnSync('ffdec',['-export','script',scratch,source.path],
   {encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
  assert.equal(run.status,0,`fresh FFDec script export: ${String(run.stderr??run.error).slice(0,1200)}`);
  assert.match(run.stdout,/JPEXS Free Flash Decompiler v\.26\.2\.1/u);
  const base=path.join(scratch,'scripts'),actual=[];
  const walk=dir=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const file=path.join(dir,entry.name);assert(!entry.isSymbolicLink());
   if(entry.isDirectory())walk(file);
   else{assert(entry.isFile()&&file.endsWith('.as'));const relative=path.relative(base,file);
    assert(bounded(relative));const bytes=fs.readFileSync(file);
    actual.push({path:relative,bytes:bytes.length,sha256:sha256(bytes)});}
  }};walk(base);
  actual.sort((a,b)=>a.path.localeCompare(b.path));
  same(actual,native.extraction.scriptPins,'all 59 fresh AVM1 scripts equal retained extraction');
  return actual;
 }finally{fs.rmSync(scratch,{recursive:true,force:true});}
}

function runChecks(root){
 const generatorChecks=CHECKS.map(([producer,output])=>{
  const result=spawnSync(process.execPath,[path.join(root,producer),'--check'],
   {cwd:root,env:{...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT},
    encoding:'utf8',timeout:240000,maxBuffer:3*1024*1024});
  assert.equal(result.status,0,`${producer} --check: ${String(result.stderr??result.error).slice(0,1800)}`);
  return{producer:pinFile(root,producer),output:pinFile(root,output),mode:'--check',exitCode:0};
 });
 const env={...process.env,HELP_MATH_G678_SOURCE_ROOT:SOURCE_ROOT,
  TSX_TSCONFIG_PATH:path.join(root,'apps/web/tsconfig.json')};
 const tests=[...SOURCE_TESTS,...UNIT_TESTS];
 const validationChecks=[(()=>{
  const result=spawnSync(process.execPath,['--import','tsx','--test',...tests],
   {cwd:root,env,encoding:'utf8',timeout:240000,maxBuffer:4*1024*1024});
  assert.equal(result.status,0,`P053 source/product tests: ${String(result.stderr??'').slice(0,1800)} ${String(result.stdout??'').slice(-3000)} ${String(result.error??'')}`);
  return{tests:tests.map(item=>pinFile(root,item)),mode:'node --import tsx --test',exitCode:0};
 })()];
 return{generatorChecks,validationChecks,browserTestPin:pinFile(root,BROWSER_TEST)};
}

export function buildP053DomArtifactPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering only');
 const evidence=sourceEvidence(root),generated=canonicalSources();
 const planned=[bytePin(MODULE,generated.module),bytePin(TIMELINE,generated.timeline)];
 for(const pin of planned)if(fs.existsSync(path.join(root,pin.path)))
  same(pinFile(root,pin.path),pin,`existing canonical ${pin.path}`);
 const checks=runChecks(root),scripts=freshScripts(evidence.source,evidence.audits.native);
 const ownPaths=[...Object.values(SOURCE_AUDITS).map(pin=>pin.path),...OWN_INPUTS,
  ...UNIT_TESTS,...SOURCE_TESTS,BROWSER_TEST];
 assert(P053_DEFERRED_HOST_PATHS.every(item=>!ownPaths.includes(item)),
  'mutable host path excluded from DOM inputs');
 const inputs=uniquePins([...ownPaths.map(item=>pinFile(root,item)),...planned]);
 const sharedDependencies=uniquePins(SHARED_DEPENDENCIES.map(item=>pinFile(root,item)));
 assert(sharedDependencies.every(pin=>!inputs.some(item=>item.path===pin.path)),
  'page-owned and shared host paths disjoint');
 for(const check of checks.generatorChecks){
  same(inputs.find(pin=>pin.path===check.producer.path),check.producer,'generator in closure');
  same(inputs.find(pin=>pin.path===check.output.path),check.output,'generated output in closure');
 }
 const runManifest={schemaVersion:1,kind:'nms-l02-p053-maintained-dom-source-run-v1',
  animationId:ID,method:'source-locked-FFDec-swfmill-IR-and-maintained-DOM-directions-state',
  complexityLane:'behavior-heavy',sourceRoot:SOURCE_ROOT,source:SOURCE,sourceXml:XML,
  sourceStructure:{stage:{width:800,height:600},fps:12,rootFrameCount:10,rootBeginFrame:6,
   frameDomain:'sprite-187',sourceFrameCount:694,maintainedHeldFrame:693,
   sourceFrameIntrospectionOnly:true,genericFrameCompletionAvailable:false,
   originalRuntimeParityEstablished:false},
  sourceActions:{freshScripts:scripts,earlyStartBasename:'L7GS03',lateStartBasename:'L2GS03',
   popupCloseReceiverResolved:false},
  behavior:{controller:pinFile(root,'packages/demos/src/nms-l02-p053-controller-candidate.ts'),
   player:pinFile(root,'packages/demos/src/nms-l02-p053-player-state-v1.ts'),
   scene:pinFile(root,'packages/demos/src/nms-l02-p053-source-scene-v1.tsx'),
   runtimeAdapter:pinFile(root,'apps/web/components/nms-l02-p053-lesson-runtime-v1.tsx'),
   audioLoader:pinFile(root,'packages/demos/src/nms-l02-p053-source-audio-loader.ts'),
   hostNavigation:pinFile(root,'packages/demos/src/nms-l02-p053-host-navigation-v1.ts'),
   browserEvidence:'separate-formal-page-proof-not-in-this-dom-run',
   hostPlaybackCompletion:false},
  audio:{source:evidence.mp3,rawIndex:evidence.rawIndex,blockCount:619,
   firstBlockFrame:4,lastBlockFrame:694,decodedSamples:1135296,
   acceptedCueCount:0,sourceAlignmentAccepted:false,listeningAccepted:false,
   independentUserTriggeredFullMp3:true,localeAutoPlayback:false,spanishAudioActivated:false},
  shapes:{exported:68,consumed:48,rawExports:evidence.shapes},
  sourceKeyAttributeCalls:0,glossary:[],externalEvidence:evidence.externalEvidence,
  generatorChecks:checks.generatorChecks,validationChecks:checks.validationChecks,
  browserTestPin:checks.browserTestPin,browserTestExecutedInDomPlan:false,
  deferredHostPaths:P053_DEFERRED_HOST_PATHS,
  inputs,outputs:uniquePins(planned),sharedDependencies,
  completeTransitiveClosure:false,productCalibrationPassed:false,scaleOutAuthorized:false,
  acceptanceEffects:ACCEPTANCE};
 const runBytes=json(runManifest),runPin=bytePin(RUN,runBytes);
 const memberManifest={schemaVersion:1,kind:'nms-l02-p053-maintained-dom-member-v1',
  animationId:ID,rendererBindingKind:'maintained-dom-module-v1',source:SOURCE,sourceXml:XML,
  sourceRun:runPin,module:planned[0],timeline:planned[1],inputs,outputs:uniquePins(planned),
  externalEvidence:evidence.externalEvidence,sharedDependencies,
  productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:ACCEPTANCE};
 const memberBytes=json(memberManifest),memberPin=bytePin(MEMBER,memberBytes);
 const artifacts={kind:'maintained-dom-module-v1',module:planned[0],timeline:planned[1],
  memberManifest:memberPin,sourceRun:runPin};
 return{root,runManifest,memberManifest,artifacts,evidence,
  outputs:[{path:MODULE,bytes:generated.module},{path:TIMELINE,bytes:generated.timeline},
   {path:RUN,bytes:runBytes},{path:MEMBER,bytes:memberBytes}]};
}

export function prepareP053DomArtifacts(plan){
 assert(plan.outputs.every(item=>!fs.existsSync(path.join(plan.root,item.path))),
  'immutable DOM artifacts already exist; use --check');
 for(const item of plan.outputs){
  const file=path.join(plan.root,item.path);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,item.bytes,{flag:'wx'});
  same(pinFile(plan.root,item.path),bytePin(item.path,item.bytes),'written DOM artifact');
 }
 return{status:'P053_DOM_ARTIFACTS_PREPARED_UNREGISTERED',artifacts:plan.artifacts,
  registrationEffect:'none',acceptanceEffect:'none'};
}
export function checkP053DomArtifacts(plan){
 for(const item of plan.outputs)same(readPin(plan.root,bytePin(item.path,item.bytes)),item.bytes,
  `${item.path} manifest drift`);
 return{status:'P053_DOM_ARTIFACTS_CHECKED_UNREGISTERED',artifacts:plan.artifacts,
  registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--prepare','--check'].includes(process.argv[2]),
   'use --plan, --prepare or --check');
  const plan=buildP053DomArtifactPlan();
  const result=process.argv[2]==='--prepare'?prepareP053DomArtifacts(plan):
   process.argv[2]==='--check'?checkP053DomArtifacts(plan):
   {status:'P053_DOM_ARTIFACTS_PLAN_UNREGISTERED',artifacts:plan.artifacts,
    inputCount:plan.runManifest.inputs.length,outputCount:plan.runManifest.outputs.length,
    externalEvidenceCount:plan.runManifest.externalEvidence.length,
    sourceActionScriptCount:plan.runManifest.sourceActions.freshScripts.length,
    registrationEffect:'none',acceptanceEffect:'none'};
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
