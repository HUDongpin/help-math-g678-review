#!/usr/bin/env node
/** Source-locked P064 quiz DOM run/member. Only --prepare writes new artifacts. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin,uniquePins,sha256} from '../lib/g678-admission-proof.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';

const SCRIPT=fileURLToPath(import.meta.url),ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-nms002-l02-p064';
const CALIBRATION='g678-nms-l02-p064-source-quiz-current-js-v1';
const RUN_ROOT=`work/g678-shared-page-factory/${CALIBRATION}`;
const RUN=`${RUN_ROOT}/run-manifest.json`;
const MEMBER=`${RUN_ROOT}/members/${ID}/member-manifest.json`;
const MODULE=`packages/demos/src/modules/${ID}.tsx`;
const TIMELINE=`packages/demos/src/timelines/${ID}.ts`;
const SOURCE={path:'G6-G8-shared/NMS002/L2/FQ/L2FQ02.swf',bytes:55392,
 sha256:'f655f05d7be5576503a66f52909b322bd3fce3e7b51a7fcda52291f755bf346c'};
const XML={path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'};
const AUDIT='migrations/shared-nms002-l02-p064/audit';
const SOURCE_QUIZ=`${AUDIT}/source-quiz-contract-v1.json`;
const QUESTION_IR=`${AUDIT}/question-content-ir-v1.json`;
const DISPLAY=`${AUDIT}/active-display-list-v1.json`;
const AUDIO_INDEX=`${AUDIT}/audio-source-candidates-v1.json`;
const DISPOSITION='output/nms-l02-p064-product-20260928/admission/source-risk-disposition-v1.json';
const PRESENTATION='packages/demos/src/nms-l02-p064-presentation-data-v1.ts';
const REVIEWED_PINS=[
 {path:SOURCE_QUIZ,bytes:2285,sha256:'943270c7fdeefd4226e5f13a9d2679cf277c9415efbe8b5e979798cd12a537e5'},
 {path:QUESTION_IR,bytes:408932,sha256:'ecc84d6053005e5d34f9f1dd615144a6a1c5638bf650bf572ff071f42169c350'},
 {path:DISPLAY,bytes:663633,sha256:'34f152e4a002b38931c57f9be29c1759a48da232a400c4544a4f34d1be51deb8'},
 {path:AUDIO_INDEX,bytes:109156,sha256:'60937f89ba02f67723dc534d5e6316517e82325053d3bacafe903c28b1510e58'},
 {path:PRESENTATION,bytes:247635,sha256:'518c44531318be4295f26afce53336e27c07f4799459b8d317f41a209dd8cc0e'},
 {path:DISPOSITION,bytes:5357,sha256:'63cd525e03459441dee7278fc29096cd053ebc879b61e90a9bd1500b83b7b4f1'},
];
const SOURCE_INPUTS=[
 `${AUDIT}/source-quiz-contract-v1.json`,QUESTION_IR,DISPLAY,AUDIO_INDEX,
 `${AUDIT}/source-text-reconciliation-v1.json`,
 `${AUDIT}/host-audio-static-mapping-v1.json`,
 `${AUDIT}/host-audio-lifecycle-v1.json`,
 `${AUDIT}/HANDOFF_SOURCE_RISK_2026-09-24.md`,
 `${AUDIT}/HANDOFF_HOST_SCORE_2026-09-24.md`,
 `${AUDIT}/HANDOFF_SOURCE_TEXT_2026-09-24.md`,
 `${AUDIT}/HANDOFF_HOST_AUDIO_2026-09-24.md`,
 'migrations/shared-nms002-l02-p064/migration.json',
 'migrations/shared-nms002-l02-p064/MIGRATION_BRIEF.md',
 'migrations/shared-nms002-l02-p064/ACCEPTANCE_CHECKLIST.md',
 DISPOSITION,
];
const PRODUCT_INPUTS=[
 'packages/demos/src/nms-l02-p064-product-module-v1.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.tsx',
 'packages/demos/src/nms-l02-p064-quiz-candidate.css',
 'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts',
 PRESENTATION,
 'packages/demos/src/nms-l02-p064-presentation-types-v1.ts',
 'packages/demos/src/nms-l02-p064-source-risk-candidate.ts',
 'packages/demos/src/nms-l02-p064-host-score-candidate.ts',
 'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx',
];
const PRODUCT_TESTS=[
 'packages/demos/tests/nms-l02-p064-product-module-v1.test.tsx',
 'packages/demos/tests/nms-l02-p064-presentation-candidate-v1.test.tsx',
 'packages/demos/tests/nms-l02-p064-question-content-ir-v1.test.ts',
 'packages/demos/tests/nms-l02-p064-quiz-state-candidate.test.ts',
 'packages/demos/tests/nms-l02-p064-source-text-reconciliation-v1.test.ts',
 'packages/demos/tests/nms-l02-p064-host-score-candidate.test.ts',
 'packages/demos/tests/nms-l02-p064-audio-candidates-v1.test.ts',
 'apps/web/tests/nms-l02-p064-lesson-runtime-v1.test.tsx',
];
const PRODUCER_INPUTS=[
 'scripts/audit-nms-l02-p064-quiz-v1.mjs',
 'scripts/build-nms-l02-p064-question-ir-v1.py',
 'scripts/build-nms-l02-p064-active-display-v1.py',
 'scripts/audit-nms-l02-p064-audio-candidates-v1.mjs',
 'scripts/build-nms-l02-p064-presentation-data-v1.mjs',
 'scripts/audit-nms-l02-p064-host-mapping-v1.mjs',
 'scripts/audit-nms-l02-p064-host-audio-v1.mjs',
 'scripts/prepare-nms-l02-p064-dom-artifacts-v1.mjs',
 'scripts/prepare-nms-l02-p064-dom-artifacts-v1.test.mjs',
];
const GENERATOR_CHECKS=[
 ['scripts/audit-nms-l02-p064-quiz-v1.mjs',SOURCE_QUIZ],
 ['scripts/build-nms-l02-p064-question-ir-v1.py',QUESTION_IR],
 ['scripts/build-nms-l02-p064-active-display-v1.py',DISPLAY],
 ['scripts/audit-nms-l02-p064-audio-candidates-v1.mjs',AUDIO_INDEX],
 ['scripts/build-nms-l02-p064-presentation-data-v1.mjs',PRESENTATION],
 ['scripts/audit-nms-l02-p064-host-mapping-v1.mjs',`${AUDIT}/host-audio-static-mapping-v1.json`],
 ['scripts/audit-nms-l02-p064-host-audio-v1.mjs',`${AUDIT}/host-audio-lifecycle-v1.json`],
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
function sourceEvidence(root){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real source root');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT,'physical source root');
 assert(fs.lstatSync(SOURCE_ROOT).isDirectory()&&!fs.lstatSync(SOURCE_ROOT).isSymbolicLink());
 const source=absolutePin(SOURCE.path,SOURCE),xml=absolutePin(XML.path,XML);
 for(const pin of REVIEWED_PINS)exact(root,pin);
 const xmlText=fs.readFileSync(xml.path,'utf8');
 assert.match(xmlText,/<Page Title="Page 1" RandomAudio="" BGText="" Navigation="OFF">FQ\/L2FQ02\.swf<\/Page>/u,
  'exact active FQ section ordinal two source XML placement');
 const contract=JSON.parse(readPin(root,pinFile(root,SOURCE_QUIZ)));
 const ir=JSON.parse(readPin(root,pinFile(root,QUESTION_IR)));
 const display=JSON.parse(readPin(root,pinFile(root,DISPLAY)));
 const audio=JSON.parse(readPin(root,pinFile(root,AUDIO_INDEX)));
 const disposition=JSON.parse(readPin(root,pinFile(root,DISPOSITION)));
 assert.equal(contract.animationId,ID);assert.equal(contract.scripts.mainSpriteId,1258);
 assert.equal(contract.scripts.totalExported,159);
 assert.equal(contract.scripts.correctOptionHandlers,35);
 assert.equal(contract.scripts.wrongOptionHandlers,105);
 assert.equal(contract.quiz.bankSize,35);assert.equal(contract.quiz.drawCount,10);
 assert.equal(contract.quiz.optionCount,4);
 assert.equal(contract.source.sha256,SOURCE.sha256);
 assert.equal(ir.animationId,ID);assert.equal(ir.mainSprite.symbolId,1258);
 assert.equal(ir.mainSprite.frames,90);assert.equal(ir.questions.length,35);
 assert.equal(ir.sourceQuizContractSha256,pinFile(root,SOURCE_QUIZ).sha256);
 assert.equal(display.animationId,ID);assert.equal(display.questions.length,35);
 assert.equal(display.questionContentIrSha256,pinFile(root,QUESTION_IR).sha256);
 assert.equal(audio.animationId,ID);assert.equal(audio.sourceMediaRows.length,350);
 assert.equal(audio.questionContentIrSha256,pinFile(root,QUESTION_IR).sha256);
 for(const item of [ir,display,audio])assert.equal(item.source.sha256,SOURCE.sha256);
 assert.equal(disposition.animationId,ID);
 assert.equal(disposition.kind,'nms-l02-p064-local-current-js-source-risk-disposition-v1');
 same(disposition.acceptanceEffects,ACCEPTANCE,'reviewed independent acceptance gates');
 same(disposition.riskCases.map(row=>row.id),[
  'q5-dynamic-fields','q10-option-d-review-lookup',
  'q21-option-c-review-lookup','q23-option-c-review-lookup'],
 'source-specific risk disposition');
 assert.equal(disposition.riskCases[0].sourceDefaultForEach,'0');
 assert.equal(disposition.riskCases[0].originalRuntimeValueAndVisibilityEstablished,false);
 assert.equal(disposition.riskCases[1].feedbackFieldLookup,'missing-in-static-source');
 assert.equal(disposition.postReview.originalHostExitEstablished,false);
 assert.equal(disposition.postReview.currentJsPageReviewAutomaticallyGranted,false);
 assert.equal(disposition.productCalibrationPassed,false);
 assert.equal(disposition.scaleOutAuthorized,false);
 const audioPins=audio.sourceMediaRows.map(row=>{
  assert(/^(?:EA|SA)$/u.test(row.folderCode)&&Number.isInteger(row.questionId)&&
   row.questionId>=1&&row.questionId<=35&&
   /^(?:question|option)$/u.test(row.role)&&
   (row.role==='question'?row.option===null:/^[A-D]$/u.test(row.option))&&
   row.relativePath===`G6-G8-shared/NMS002/L2/FQ/${row.folderCode}/Q${row.questionId}${row.option??''}.mp3`,
   'exact source audio inventory row');
  return absolutePin(row.relativePath,{bytes:row.bytes,sha256:row.sha256});
 });
 assert.equal(new Set(audioPins.map(pin=>pin.path)).size,350);
 return{source,xml,contract,ir,display,audio,disposition,audioPins};
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
 walk(absolute);
 assert(entries.includes(`${relative}/evidence.json`)&&entries.length>=3,
  'completed immutable browser evidence');
 return entries.sort((a,b)=>a.localeCompare(b));
}
function sourceScripts(sourcePin,contract){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'p064-dom-source-as-'));
 try{
  const command=spawnSync('ffdec',['-export','script',dir,sourcePin.path],
   {encoding:'utf8',timeout:180000,maxBuffer:4*1024*1024});
  assert.equal(command.status,0,`FFDec P064 script export: ${command.stderr??command.error}`);
  assert.match(command.stdout,/JPEXS Free Flash Decompiler v\.26\.2\.1/u);
  const scripts=[];
  function walk(current){for(const entry of fs.readdirSync(current,{withFileTypes:true})){
   const child=path.join(current,entry.name);
   assert(!entry.isSymbolicLink(),'exported script link');
   if(entry.isDirectory())walk(child);
   else{assert(entry.isFile()&&child.endsWith('.as'),'only ActionScript exports');
    const relative=path.relative(dir,child);assert(boundedRelative(relative));
    const bytes=fs.readFileSync(child);
    scripts.push({exportPath:relative,bytes:bytes.length,sha256:sha256(bytes)});}
  }}
  walk(path.join(dir,'scripts'));
  scripts.sort((a,b)=>a.exportPath.localeCompare(b.exportPath));
  assert.equal(scripts.length,159,'every exported ActionScript file');
  const selected=[
   ['DefineSprite_1258/frame_1/DoAction.as','mainFrameOneSha256'],
   ['DefineSprite_17/frame_2/DoAction.as','resultFrameTwoSha256'],
   ['DefineButton2_58/BUTTONCONDACTION on(release).as','englishAudioButtonSha256'],
   ['DefineButton2_52/BUTTONCONDACTION on(release).as','spanishAudioButtonSha256'],
   ['DefineButton2_607/BUTTONCONDACTION on(release).as','reviewButtonSha256'],
  ];
  for(const [name,key] of selected){
   const row=scripts.find(item=>item.exportPath===`scripts/${name}`);
   assert(row&&row.sha256===contract.scripts[key],`exact exported ${name}`);
  }
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
 assert.equal(product.status,0,`P064 maintained product tests: ${String(product.stderr??'').slice(0,1500)} ${String(product.stdout??'').slice(-3000)} ${String(product.error??'')}`);
 return{generatorChecks,validationChecks:[{tests:PRODUCT_TESTS.map(item=>pinFile(root,item)),
  mode:'TSX_TSCONFIG_PATH=apps/web/tsconfig.json node --import tsx --test',exitCode:0}]};
}
function canonicalSources(){
 const module=Buffer.from('"use client";\n\nimport {nmsL02P064ProductModuleV1, P064_SOURCE} from "../nms-l02-p064-product-module-v1";\n\nexport {P064_SOURCE};\nconst animationModule = Object.freeze({...nmsL02P064ProductModuleV1, maturity: "private-current-js" as const});\nexport default animationModule;\n');
 const timeline=Buffer.from(`/** Source-locked quiz metadata; no generic frame playback or host completion. */\nexport const SHARED_NMS002_L02_P064_SOURCE = Object.freeze(${JSON.stringify({
  calibrationId:CALIBRATION,animationId:ID,source:SOURCE,sourceXml:XML,
  stage:{width:800,height:600},fps:12,rootFrames:10,rootPlacementFrame:6,
  frameDomain:'sprite-1258',sourceFrameCount:90,questionFrameRange:[2,36],
  reviewEntryFrame:38,reviewFrameRange:[55,89],
  questionBankSize:35,selectedQuestionCount:10,optionCount:4,
  sourceTimelineSeekAvailable:false,genericFrameCompletionAvailable:false,
  hostExitResolved:false,originalRuntimeParityEstablished:false,
  audioAccepted:false,humanReviewed:false,ownerAccepted:false,
},null,2)} as const);\n`);
 return{module,timeline};
}
function registryProjection(root,artifacts){
 const registry=JSON.parse(readPin(root,pinFile(root,'packages/demos/private-current-js-registry.json')));
 const existing=registry.calibrations.flatMap(row=>row.entries.filter(item=>item.key===ID));
 assert.equal(existing.length,0,'P064 remains unregistered while preparing DOM artifacts');
 const fragment={calibrationId:CALIBRATION,deploymentScope:'local-only',
  freezeManifest:`catalog/product-bridge-calibrations/${CALIBRATION}.json`,
  freezeManifestBytes:1,freezeManifestSha256:'0'.repeat(64),
  entries:[{key:ID,module:`./modules/${ID}`,maturity:'private-current-js',
   complexityLane:'behavior-heavy',artifacts}]};
 const projected=upsertPrivateCurrentJsCalibration(registry,fragment);
 assert(projected.calibrations.some(row=>row.calibrationId===CALIBRATION));
 return true;
}
export function buildP064DomArtifactPlan({root=ROOT}={}){
 assert.equal(fs.realpathSync(root),root,'physical worktree');
 assert(process.env.NODE_ENV!=='production'&&!process.env.VERCEL&&!process.env.VERCEL_ENV,
  'local engineering only');
 const source=sourceEvidence(root),generated=canonicalSources();
 const browserFolders=[
  'output/nms-l02-p064-product-20260928/browser/candidate-v4',
  'output/nms-l02-p064-product-20260928/browser-review-branches/candidate-v1',
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
 const sourceActionScripts=sourceScripts(source.source,source.contract);
 const checks=runChecks(root);
 for(const check of checks.generatorChecks){
  same(inputs.find(pin=>pin.path===check.producer.path),check.producer,'producer in own closure');
  same(inputs.find(pin=>pin.path===check.output.path),check.output,'generated source in own closure');
 }
 const externalEvidence=uniquePins([source.source,source.xml,...source.audioPins]);
 const outputs=uniquePins(planned);
 const runManifest={schemaVersion:1,kind:'nms-l02-p064-maintained-dom-source-run-v1',
  animationId:ID,method:'source-locked-FFDec-swfmill-IR-and-maintained-DOM-quiz-state',
  complexityLane:'behavior-heavy',sourceRoot:SOURCE_ROOT,source:SOURCE,sourceXml:XML,
  sourceStructure:{stage:{width:800,height:600},fps:12,rootFrameCount:10,
   rootBeginFrame:6,frameDomain:'sprite-1258',sourceFrameCount:90,
   questionFrameRange:[2,36],reviewEntryFrame:38,reviewFrameRange:[55,89],
   sourceFrameIntrospectionOnly:true,sourceTimelineSeekAvailable:false,
   genericFrameCompletionAvailable:false,hostExitResolved:false,
   originalRuntimeParityEstablished:false},
  sourceQuiz:{contract:pinFile(root,SOURCE_QUIZ),questionIr:pinFile(root,QUESTION_IR),
   displayList:pinFile(root,DISPLAY),presentation:pinFile(root,PRESENTATION),
   bankSize:35,drawCount:10,optionCount:4,sourceActionScripts},
  behavior:{disposition:pinFile(root,DISPOSITION),
   sourceRiskModule:pinFile(root,'packages/demos/src/nms-l02-p064-source-risk-candidate.ts'),
   quizState:pinFile(root,'packages/demos/src/nms-l02-p064-quiz-state-candidate.ts'),
   quizComponent:pinFile(root,'packages/demos/src/nms-l02-p064-quiz-candidate.tsx'),
   hostScore:pinFile(root,'packages/demos/src/nms-l02-p064-host-score-candidate.ts'),
   runtimeAdapter:pinFile(root,'apps/web/components/nms-l02-p064-lesson-runtime-v1.tsx'),
   productModule:pinFile(root,'packages/demos/src/nms-l02-p064-product-module-v1.tsx'),
   browserMain:pinFile(root,`${browserFolders[0]}/evidence.json`),
   browserReviewBranches:pinFile(root,`${browserFolders[1]}/evidence.json`),
   postReviewHostExitResolved:false,hostPlaybackCompletion:false,
   deterministicSelectionOriginalRngParity:false},
  audio:{sourceIndex:pinFile(root,AUDIO_INDEX),sourceCandidates:source.audioPins.length,
   acceptedCueCount:0,sourceAlignmentAccepted:false,listeningAccepted:false,
   localeAutoPlayback:false,originalHostAssociationEstablished:false},
  sourceKeyAttributeCalls:0,glossary:[],
  externalEvidence,generatorChecks:checks.generatorChecks,
  validationChecks:checks.validationChecks,inputs,outputs,sharedDependencies,
  productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:ACCEPTANCE};
 const runBytes=json(runManifest),runPin=bytePin(RUN,runBytes);
 const memberManifest={schemaVersion:1,kind:'nms-l02-p064-maintained-dom-member-v1',
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
export function prepareP064DomArtifacts(plan){
 assert(plan.outputs.every(item=>!fs.existsSync(path.join(plan.root,item.path))),
  'immutable DOM artifacts already exist; use --check');
 for(const item of plan.outputs){
  const file=path.join(plan.root,item.path);fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,item.bytes,{flag:'wx'});
  same(pinFile(plan.root,item.path),bytePin(item.path,item.bytes),'written DOM artifact');
 }
 return{status:'P064_DOM_ARTIFACTS_PREPARED_UNREGISTERED',artifacts:plan.artifacts,
  registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
}
export function checkP064DomArtifacts(plan){
 for(const item of plan.outputs)same(readPin(plan.root,bytePin(item.path,item.bytes)),item.bytes,
  `${item.path} manifest drift`);
 return{status:'P064_DOM_ARTIFACTS_CHECKED_UNREGISTERED',artifacts:plan.artifacts,
  registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
}
if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3&&['--plan','--prepare','--check'].includes(process.argv[2]),
   'use --plan, --prepare or --check');
  const plan=buildP064DomArtifactPlan();
  const result=process.argv[2]==='--prepare'?prepareP064DomArtifacts(plan):
   process.argv[2]==='--check'?checkP064DomArtifacts(plan):
   {status:'P064_DOM_ARTIFACTS_PLAN_UNREGISTERED',artifacts:plan.artifacts,
    inputCount:plan.runManifest.inputs.length,outputCount:plan.runManifest.outputs.length,
    sharedDependencyCount:plan.runManifest.sharedDependencies.length,
    sourceActionScriptCount:plan.runManifest.sourceQuiz.sourceActionScripts.length,
    externalEvidenceCount:plan.runManifest.externalEvidence.length,
    registryShapeAccepted:true,registrationEffect:'none',acceptanceEffect:'none'};
  console.log(JSON.stringify(result));
 }catch(error){console.error(error.stack??error);process.exitCode=1;}
}
