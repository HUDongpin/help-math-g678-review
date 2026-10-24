#!/usr/bin/env node
/** P055 page-only admission preparation. The host, predecessor, registry and
 * activation remain independent. --dry-run never writes; --prepare needs an
 * explicit current host and executed predecessor witness. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,readRegistryTransaction,sha256,uniquePins} from '../lib/g678-admission-proof.mjs';
import {verifyNmsL02Predecessor,verifyNmsL02PageProof} from '../lib/nms-l02-successor-proof.mjs';
import {
 P055_ADMISSION_ID as ID,P055_ADMISSION_CALIBRATION as CALIBRATION,
 P055_SOURCE_ROOT as SOURCE_ROOT,P055_SOURCE,P055_XML,P055_RUNTIME,P055_TEXT_IR,
 P055_MAIN_AUDIO,P055_AUDIO_INDEX,P055_GLOSSARY_CANDIDATE,P055_GLOSSARY_PRODUCT,
 P055_ACCEPTANCE_KEYS,P055_PAGE_INPUT_PATHS,P055_EXTERNAL_EXPECTED,
 validateP055AdmissionSemantics,validateP055ProofClosure,
} from '../lib/nms-l02-p055-admission-semantics.mjs';
import {upsertPrivateCurrentJsCalibration} from './private-current-js-registry.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HOST_CONTRACT='nms-l02-source-bound-host-v1';
const FREEZE=`catalog/product-bridge-calibrations/${CALIBRATION}.json`;
const FRAGMENT=`catalog/product-bridge-calibrations/${CALIBRATION}.fragment.json`;
const CANDIDATE=`work/g678-workflow/candidates/${ID}-v1.json`;
const CANONICAL_RUNTIME=`work/g678-shared-page-factory/${CALIBRATION}/members/${ID}/canvas-renderer.js`;
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const demand=(value,reason)=>assert(value,`NMS_L02_P055_PREPARE: ${reason}`);
const pinBytes=(relative,bytes)=>({path:relative,bytes:bytes.length,sha256:sha256(bytes)});


function physicalRoot(root,expected){
 demand(root===expected&&fs.realpathSync(root)===root&&fs.lstatSync(root).isDirectory()&&
  !fs.lstatSync(root).isSymbolicLink(),`physical source root ${expected}`);
}
function pinnedInputs(root){
 demand(new Set(P055_PAGE_INPUT_PATHS).size===P055_PAGE_INPUT_PATHS.length,'unique page path list');
 const forbidden=[
  'packages/demos/src/source-linear-audio.ts',
  'apps/web/components/source-glossary-lesson-runtime.tsx',
  'apps/web/lib/nms-l02-ts-pilot-assets.server.ts',
  'lib/nms-l02-successor-proof.mjs',
  'packages/demos/private-current-js-registry.json',
 ];
 demand(P055_PAGE_INPUT_PATHS.every(relative=>!forbidden.includes(relative)&&
  !relative.includes('..')&&!path.isAbsolute(relative)),'page ownership only');
 return uniquePins(P055_PAGE_INPUT_PATHS.map(relative=>pinFile(root,relative)));
}
function verifyEvidence(root,pins){
 const get=relative=>{const result=pins.find(pin=>pin.path===relative);demand(result,`page input ${relative}`);return result;};
 for(const expected of [P055_RUNTIME,P055_TEXT_IR,P055_MAIN_AUDIO,P055_AUDIO_INDEX,
   P055_GLOSSARY_CANDIDATE,P055_GLOSSARY_PRODUCT])
  assert.deepStrictEqual(get(expected.path),expected,`exact resource ${expected.path}`);
 const review=readJsonPin(root,get('output/nms-l02-host-successor-20260927/product/source-admission-review.json'));
 demand(review.animationId===ID&&review.calibrationId===CALIBRATION&&review.sourceRoot===SOURCE_ROOT,
  'source admission review identity');
 assert.deepStrictEqual(review.source,P055_SOURCE,'reviewed source SWF');
 assert.deepStrictEqual(review.sourceXml,P055_XML,'reviewed lesson XML');
 assert.deepStrictEqual(review.nativeVisual.runtime,P055_RUNTIME,'reviewed native drawing');
 assert.deepStrictEqual(review.nativeVisual.textIr,P055_TEXT_IR,'reviewed native text');
 assert.deepStrictEqual(review.embeddedMainAudio.mp3,P055_MAIN_AUDIO,'reviewed main audio');
 assert.deepStrictEqual(review.embeddedMainAudio.structure,P055_AUDIO_INDEX,'reviewed audio structure');
 demand(review.xmlPlacement?.activePageCount===64&&review.xmlPlacement.globalPageOrdinal===55&&
  review.xmlPlacement.sectionCode==='TS'&&review.xmlPlacement.sectionPageOrdinal===1&&
  review.xmlPlacement.sourceOccurrence===55&&review.xmlPlacement.pageValue==='TS/L2TS02.swf',
  'exact source XML occurrence');
 demand(review.embeddedMainAudio.firstBlockFrame===5&&review.embeddedMainAudio.lastBlockFrame===351&&
  review.embeddedMainAudio.blockCount===347&&
  JSON.stringify(review.embeddedMainAudio.emptyPayloadBlockFrames)==='[6]'&&
  review.embeddedMainAudio.decodedSamples===637056&&
  review.embeddedMainAudio.sourceAlignmentAccepted===false&&
  review.embeddedMainAudio.listeningAccepted===false,'audited main audio timing');
 demand(review.glossaryDisposition.originalL2XmlResolved===false&&
  review.glossaryDisposition.historicalHostAssociationEstablished===false&&
  review.glossaryDisposition.originalRuntimeLookupVerified===false,'conditional L1 glossary only');
 demand(review.claimBoundary?.sourceStructuralEvidenceOnly===true&&
  Object.entries(review.claimBoundary).filter(([key])=>key!=='sourceStructuralEvidenceOnly')
   .every(([,value])=>value===false),'review grants no downstream acceptance');
 const visual=readJsonPin(root,get('output/nms-l02-ts-family-20260927/visual/source-native-visual-receipt.json'));
 demand(visual.animationId===ID&&visual.source.sha256===P055_SOURCE.sha256&&
  visual.frameDomain==='sprite-26'&&visual.frameCount===351&&
  visual.sourceButtons?.map(button=>button.key).join(',')==='Restate,Question,Problem',
  'visual source controls');
 demand(['registered','sourceActionScriptExecuted','glossaryContentResolved','audioAccepted',
  'originalRuntimeAccepted','visualFidelityAccepted','humanAccepted','ownerAccepted',
  'strictComplete','published'].every(key=>visual[key]===false),
  'native receipt grants no acceptance');
 const audio=readJsonPin(root,P055_AUDIO_INDEX);
 demand(audio.animationId===ID&&audio.blockCount===347&&audio.firstBlockFrame===5&&
  audio.lastBlockFrame===351&&audio.declaredBlockHeaderSamples===637056&&
  audio.decode?.decodedSamples===637056&&audio.mp3?.sha256===P055_MAIN_AUDIO.sha256,
  'embedded audio stream receipt');
 demand(['sourceAlignmentAccepted','listeningAccepted','originalRuntimeAccepted','audioAccepted']
  .every(key=>audio.qualifications?.[key]===false),'audio remains unaccepted');
 const glossary=readJsonPin(root,P055_GLOSSARY_CANDIDATE);
 demand(glossary.animationId===ID&&glossary.status==='conditional-modern-host-data-candidate'&&
  glossary.originalL2XmlResolved===false&&glossary.historicalHostAssociationEstablished===false&&
  glossary.originalRuntimeLookupVerified===false&&
  glossary.terms?.map(term=>term.id).join(',')==='restate,question,problem',
  'qualified glossary source candidate');
 const native=readJsonPin(root,get('output/nms-l02-host-successor-20260927/product/native-input-receipt.json'));
 demand(native.animationId===ID&&native.generatedText?.sha256===get('packages/demos/src/generated/nms-l02-p055-native-text.json').sha256,
  'generated native text input receipt');
 demand(native.claimBoundary?.productCandidateOnly===true&&
  ['registered','fidelityAccepted','audioAccepted','ownerAccepted']
   .every(key=>native.claimBoundary[key]===false),'native input receipt grants no acceptance');
 return {review,visual,audio,glossary};
}

export function buildP055Packet({pins,preparedRuntime}){
 const get=relative=>{const result=pins.find(pin=>pin.path===relative);demand(result,`page input ${relative}`);return result;};
 const entry={key:ID,module:`./modules/${ID}`,maturity:'private-current-js',
  complexityLane:'interactive-understood',artifacts:{
   module:get(`packages/demos/src/modules/${ID}.tsx`),
   timeline:get(`packages/demos/src/timelines/${ID}.ts`),runtime:preparedRuntime,
  }};
 const packet={schemaVersion:1,calibrationId:CALIBRATION,sourceRoot:SOURCE_ROOT,
  scope:'private-engineering',deploymentScope:'local-only',source:P055_SOURCE,sourceXml:P055_XML,
  selectedPages:[{animationId:ID,placementId:ID,assetId:`swf-${P055_SOURCE.sha256}`,
   stableLessonKey:'shared-nms002-l02',sourceSha256:P055_SOURCE.sha256,
   moduleCode:'NMS002',lessonNumber:2,globalPageOrdinal:55,sourceOccurrence:55,
   sectionCode:'TS',sectionPageOrdinal:1,complexityLane:'interactive-understood',
   runtime:{stage:{width:800,height:600},rootFrameCount:10,rootBeginFrame:6,
    frameDomain:'sprite-26',frameCount:351,livePlaybackEndFrame:351,fps:12,
    language:'fixed-en',scenario:'source-static-frame',seed:'0',renderScale:2,
    canvas:{width:1600,height:1200},canvasRenderer:{...preparedRuntime,
     url:`/migration-assets/nms-l02-ts-pilot/typography.js?sha256=${P055_RUNTIME.sha256}`}}}],
  entry,visual:{runtime:preparedRuntime,nativeRuntime:P055_RUNTIME,textIr:P055_TEXT_IR,
   unresolvedDynamicTextCharacterIds:[11],originalRuntimeValidated:false},
  audio:{main:P055_MAIN_AUDIO,structure:P055_AUDIO_INDEX,
   structureFacts:{firstFrame:5,lastFrame:351,blockCount:347,emptyFrames:[6],
    decodedSamples:637056,sampleRate:22050,channels:1,
    sourceAlignmentAccepted:false,listeningAccepted:false}},
  glossary:{candidate:P055_GLOSSARY_CANDIDATE,candidateSha256:P055_GLOSSARY_CANDIDATE.sha256,
   product:P055_GLOSSARY_PRODUCT,sourceSelection:'identified-indexMI-export-literal-L1-bank-path',
   originalL2XmlResolved:false,historicalHostAssociationEstablished:false,
   originalRuntimeLookupVerified:false,
   lessonXmlDeclaredBanks:{en:'HELP_KEYTERMS/KT/XML/L2KTE01.xml',
    es:'HELP_KEYTERMS/KT/XML/L2KTS01.xml'},
   controls:[
    {id:'sprite-26/depth-11/generation-1',entryId:'Restate',characterId:15,firstFrame:84,lastFrameExclusive:352,sourceKeyAttribute:'Restate'},
    {id:'sprite-26/depth-13/generation-1',entryId:'Question',characterId:16,firstFrame:84,lastFrameExclusive:352,sourceKeyAttribute:'Question'},
    {id:'sprite-26/depth-18/generation-1',entryId:'Problem',characterId:22,firstFrame:145,lastFrameExclusive:352,sourceKeyAttribute:'Problem'},
   ],terms:[{id:'restate',sourceKeyAttribute:'Restate'},
    {id:'question',sourceKeyAttribute:'Question'},{id:'problem',sourceKeyAttribute:'Problem'}],
   stopPath:'animation_mc.animation',closePolicy:'remain-paused'},
  integrity:{scope:'single-NMS-L02-P055-source-and-implementation',completeTransitiveClosure:false,
   qualification:'P055 page source, native drawing, embedded audio and conditional L1 glossary are page-owned; generic modern host and registry are independently versioned.',
   files:uniquePins([...pins,preparedRuntime])},
  acceptanceEffects:Object.fromEntries(P055_ACCEPTANCE_KEYS.map(key=>[key,false])),
  productCalibrationPassed:false,scaleOutAuthorized:false};
 return {packet,entry};
}

function externalPins(sourceRoot){
 physicalRoot(sourceRoot,SOURCE_ROOT);
 const roots=[...new Set(P055_EXTERNAL_EXPECTED.map(item=>item.root))];
 for(const root of roots)physicalRoot(root,root);
 for(const item of P055_EXTERNAL_EXPECTED)
  assert.deepStrictEqual(pinFile(item.root,item.pin.path),item.pin,
   `external physical source ${item.pin.path}`);
 return [...P055_EXTERNAL_EXPECTED].sort((a,b)=>a.root.localeCompare(b.root)||a.pin.path.localeCompare(b.pin.path));
}

/** Every output is planned in memory. The still-pending host/witness are not
 * prerequisites for source-only dry-run, but are mandatory for writes/checks. */
export function buildP055AdmissionPlan({root=ROOT,sourceRoot=process.env.HELP_MATH_G678_SOURCE_ROOT}={}){
 demand(fs.realpathSync(root)===root,'physical worktree');
 demand(!process.env.VERCEL&&!process.env.VERCEL_ENV&&process.env.NODE_ENV!=='production',
  'local engineering only');
 const external=externalPins(sourceRoot),pins=pinnedInputs(root);
 verifyEvidence(root,pins);
 const nativeBytes=readPin(root,P055_RUNTIME);
 const preparedRuntime={path:CANONICAL_RUNTIME,bytes:nativeBytes.length,sha256:sha256(nativeBytes)};
 assert.deepStrictEqual([preparedRuntime.bytes,preparedRuntime.sha256],
  [P055_RUNTIME.bytes,P055_RUNTIME.sha256],'canonical runtime native byte identity');
 if(fs.existsSync(path.join(root,CANONICAL_RUNTIME)))
  assert.deepStrictEqual(pinFile(root,CANONICAL_RUNTIME),preparedRuntime,'existing canonical runtime');
 const {packet,entry}=buildP055Packet({pins,preparedRuntime});
 const freezeBytes=json(packet),freezePin=pinBytes(FREEZE,freezeBytes);
 const fragment={calibrationId:CALIBRATION,deploymentScope:'local-only',
  freezeManifest:FREEZE,freezeManifestBytes:freezePin.bytes,
  freezeManifestSha256:freezePin.sha256,entries:[entry]};
 validateP055AdmissionSemantics({...packet,freezeManifest:freezePin},fragment);
 const transaction=readRegistryTransaction(root);
 const existing=transaction.registry.calibrations.find(item=>item.calibrationId===CALIBRATION);
 if(existing)assert.deepStrictEqual(existing,fragment,'existing P055 registry must equal plan');
 const projected=upsertPrivateCurrentJsCalibration(transaction.registry,fragment);
 assert(projected.calibrations.some(item=>item.calibrationId===CALIBRATION),
  'real private registry validator accepts canonical P055 fragment');
 const fragmentBytes=json(fragment),fragmentPin=pinBytes(FRAGMENT,fragmentBytes);
 const files=uniquePins([...packet.integrity.files,freezePin,fragmentPin]);
 const proof={schemaVersion:1,kind:'nms-l02-page-proof-v1',hostContract:HOST_CONTRACT,
  animationId:ID,freeze:freezePin,packet,registration:fragment,files,external};
 validateP055ProofClosure(proof);
 const candidateBytes=json(proof),candidatePin=pinBytes(CANDIDATE,candidateBytes);
 const outputs=[{path:CANONICAL_RUNTIME,bytes:nativeBytes},
  {path:FREEZE,bytes:freezeBytes},{path:FRAGMENT,bytes:fragmentBytes},
  {path:CANDIDATE,bytes:candidateBytes}];
 return {root,packet,fragment,freezePin,fragmentPin,candidatePin,files,external,
  outputs,transaction,projected,inputCount:pins.length};
}

function boundPin(root,relative){
 demand(typeof relative==='string'&&!path.isAbsolute(relative)&&!relative.includes('..')&&
  relative.endsWith('.json'),'bounded host/witness path');
 return pinFile(root,relative);
}
function verifiedPredecessor(plan,{hostPath,witnessPath}){
 demand(hostPath&&witnessPath,'explicit --host and --witness required');
 const hostPin=boundPin(plan.root,hostPath),witnessPin=boundPin(plan.root,witnessPath);
 const predecessor=verifyNmsL02Predecessor(plan.root,witnessPin,hostPin);
 demand(predecessor.host.contract===HOST_CONTRACT,'exact successor host contract');
 const hostPaths=new Set(predecessor.host.files.map(pin=>pin.path));
 demand(plan.files.every(pin=>!hostPaths.has(pin.path)),
  'page-owned files must not overlap current shared host');
 return {predecessor,hostPin,witnessPin};
}
function readBack(plan,predecessor){
 const projected={...predecessor,transaction:{...predecessor.transaction,registry:plan.projected}};
 const proof=verifyNmsL02PageProof(plan.root,pinFile(plan.root,CANDIDATE),projected,
  validateP055AdmissionSemantics,validateP055ProofClosure);
 assert.deepStrictEqual(proof.packet,plan.packet,'serialized P055 packet roundtrip');
 assert.deepStrictEqual(proof.registration,plan.fragment,'serialized registration roundtrip');
 return pinFile(plan.root,CANDIDATE);
}
function writeExclusive(root,output){
 const target=path.join(root,output.path);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,output.bytes,{flag:'wx'});
 assert.deepStrictEqual(pinFile(root,output.path),pinBytes(output.path,output.bytes),
  `immutable output readback ${output.path}`);
}
export function prepareP055Admission(plan,boundary){
 const {predecessor}=verifiedPredecessor(plan,boundary);
 demand(plan.outputs.every(output=>!fs.existsSync(path.join(plan.root,output.path))),
  'all immutable outputs must be absent');
 for(const output of plan.outputs)writeExclusive(plan.root,output);
 const candidate=readBack(plan,predecessor);
 return {status:'P055_CANDIDATE_PREPARED_NOT_REGISTERED',candidate,
  outputs:plan.outputs.map(output=>pinFile(plan.root,output.path)),
  registrationEffect:'none',acceptanceEffect:'none'};
}
export function checkP055Admission(plan,boundary){
 const {predecessor}=verifiedPredecessor(plan,boundary);
 for(const output of plan.outputs)
  assert.deepStrictEqual(readPin(plan.root,pinBytes(output.path,output.bytes)),output.bytes,
   `immutable planned output ${output.path}`);
 const candidate=readBack(plan,predecessor);
 return {status:'P055_CANDIDATE_CHECKED',candidate,
  registrationEffect:'none',acceptanceEffect:'none'};
}
export function main(argv=process.argv.slice(2)){
 demand(argv.length>=1&&['--dry-run','--prepare','--check'].includes(argv[0]),
  'use --dry-run, --prepare or --check');
 const mode=argv[0],args=argv.slice(1),boundary={};
 if(mode==='--dry-run')demand(args.length===0,'dry-run has no host arguments');
 else{
  demand(args.length===4&&args[0]==='--host'&&args[2]==='--witness',
   'use --host <relative-json> --witness <relative-json>');
  boundary.hostPath=args[1];boundary.witnessPath=args[3];
 }
 const plan=buildP055AdmissionPlan();
 const result=mode==='--prepare'?prepareP055Admission(plan,boundary):
  mode==='--check'?checkP055Admission(plan,boundary):
   {status:'P055_SOURCE_AND_REGISTRY_PROJECTION_VERIFIED_NOT_WRITTEN',
    inputCount:plan.inputCount,externalCount:plan.external.length,
    outputPins:plan.outputs.map(output=>pinBytes(output.path,output.bytes)),
    registrationEffect:'none',acceptanceEffect:'none'};
 process.stdout.write(`${JSON.stringify(result)}\n`);
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{main();}catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
