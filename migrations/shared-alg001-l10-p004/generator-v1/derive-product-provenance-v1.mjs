/** Physical maintained-product provenance for the exact P004 source candidate.
 * Requires actual independently reviewed My Lesson evidence. Never registers a page. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin,uniquePins} from '../../../lib/g678-admission-proof.mjs';
import {validateP004CandidateEvidence} from '../../../lib/alg-l10-p004-admission-semantics-v1.mjs';
const ROOT='/Volumes/WestWorld/HELP MATH 2.0-g678-implementation';
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const ID='shared-alg001-l10-p004';
const RUN='work/g678-shared-page-factory/alg-l10-p004-maintained-real-world-20261008-final-v1';
const PRODUCER='migrations/'+ID+'/generator-v1/derive-product-provenance-v1.mjs';
const SOURCE={"path":"G6-G8-shared/ALG001/L10/RW/L10RW04.swf","bytes":259356,"sha256":"5ac9be9459e12bdc6552d53a66b67ceb645633d2fe57522639a043d28180f5b2"};
const MODELS={"sourceModel":{"path":"output/g678-alg-l10-p004-product-repair-20261008-v2/source-model-v2.json","bytes":167276,"sha256":"cead74c2e8a4642fe3475f0d044d465febdf2b8d3a2bc26597eefb20fb4b9570"},"nativeBinding":{"path":"output/g678-alg-l10-p004-player-preparation-20261008-v1/native-binding-v2.json","bytes":5813,"sha256":"82a5b0d1ec56c2c41755c7c75fe33a74e67443811f4f023d4c97aadf85d80d95"},"readingPreparation":{"path":"output/g678-alg-l10-p004-reading-preparation-20261008-v1/preparation-manifest-v1.json","bytes":10106,"sha256":"4281777d760903d2f5e159fa5dfb8370d6730fb387d3e6a2e200ca8708291be7"}};
const RUNTIME_FILES=["packages/demos/src/modules/shared-alg001-l10-p004.tsx","packages/demos/src/timelines/shared-alg001-l10-p004.ts","packages/demos/src/alg-l10-p004-state-v1.ts","packages/demos/src/alg-l10-p004-v1.css","packages/demos/src/alg-l10-p004-v1.css.d.ts","packages/demos/src/alg-l10-p004-source-model-v1.ts","packages/demos/src/alg-l10-p004-presentation-v1.tsx","packages/demos/src/generated/alg-l10-p004-source-v1.ts","packages/demos/src/alg-l10-p004-player-v2.tsx","packages/demos/src/alg-l10-p004-session-v2.ts","packages/demos/src/alg-l10-p004-playback-v2.ts","packages/demos/src/alg-l10-p004-playback-v1.ts","packages/demos/src/alg-l10-p004-player-v1.css","packages/demos/src/alg-l10-p004-player-v1.css.d.ts","apps/web/components/g678-alg-l10-p004-runtime-v1.tsx","apps/web/components/g678-alg-l10-p004-host-lesson-v1.tsx"];
const ACCEPTANCE={originalRuntime:false,fidelity:false,listening:false,human:false,owner:false,fullTypography:false,fullAccessibility:false,performance:false,strict:false,release:false,publication:false,deployment:false};
export function buildP004ProductProvenance({root,mode,candidateEvidence}){
 assert.equal(root,ROOT);assert(['--write','--check'].includes(mode));
 assert.equal(fs.realpathSync(root),root,'physical root');
 assert.equal(candidateEvidence.path,'migrations/'+ID+'/audit-v1/mylesson-candidate-verified-v1.json');
 validateP004CandidateEvidence(root,candidateEvidence);
 readPin(sourceRoot,SOURCE);
 const sourceModel=readJsonPin(root,MODELS.sourceModel),native=readJsonPin(root,MODELS.nativeBinding),reading=readJsonPin(root,MODELS.readingPreparation);
 assert.deepEqual(sourceModel.source,{...SOURCE,path:sourceRoot+'/'+SOURCE.path});
 assert.deepEqual([sourceModel.product.animationId,sourceModel.product.sourceSha256,sourceModel.product.mainFrameDomain,sourceModel.product.mainFrameCount,sourceModel.product.rootFrameCount,sourceModel.product.rootEntryFrame,sourceModel.product.fps],[ID,SOURCE.sha256,'sprite-60',609,10,6,12]);
 assert.equal(sourceModel.repair.sourceBytesChanged,false);
 assert(native.nativeAudioIdentityMeasured===true&&native.wrapperExecutionPass===false&&native.listeningAccepted===false&&native.originalRuntimeAccepted===false,'actual recovered decode with original wrapper failure preserved');
 assert.deepEqual(reading.narrativeBoundaries,[{characterId:29,frame:76},{characterId:36,frame:173},{characterId:40,frame:349},{characterId:44,frame:386},{characterId:47,frame:589}]);
 const files=uniquePins(RUNTIME_FILES.map(p=>pinFile(root,p)));assert.equal(files.length,16);
 const member={schemaVersion:1,artifactType:'g678-maintained-real-world-p004-member-v1',animationId:ID,source:SOURCE,
  runtime:{stage:{width:800,height:600},fps:12,rootFrameCount:10,rootBeginFrame:6,frameDomain:'sprite-60',frameCount:609,playbackMode:'once',terminalFrame:609,hostPlaybackCompletion:false},
  rendering:'Source-derived SVG artwork and maintained source-timed reading, six source-owned glossary buttons, two embedded-stream runs, and explicit separate Spanish pause-and-return.',
  ...MODELS,files,currentJsRegistered:false,acceptance:false};
 const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n');
 if(mode==='--write')for(const p of [RUN+'/members/'+ID+'/member-manifest.json',RUN+'/run-manifest.json']){
  try {fs.lstatSync(path.join(root,p));assert.fail('provenance destination already exists '+p);}
  catch(error){if(error.code!=='ENOENT')throw error;}
 }
 const put=(p,value)=>{const bytes=encode(value),absolute=path.join(root,p);
  if(mode==='--write'){fs.mkdirSync(path.dirname(absolute),{recursive:true});assert.equal(fs.realpathSync(path.dirname(absolute)),path.dirname(absolute));const fd=fs.openSync(absolute,'wx');try{fs.writeFileSync(fd,bytes);fs.fsyncSync(fd);}finally{fs.closeSync(fd);}}
  else assert.deepEqual(fs.readFileSync(absolute),bytes,'reproducible physical provenance '+p);
  return pinFile(root,p);
 };
 const memberPin=put(RUN+'/members/'+ID+'/member-manifest.json',member);
 const run={schemaVersion:1,artifactType:'g678-maintained-real-world-p004-run-v1',animationId:ID,implementationLane:'advanced-manual',source:SOURCE,
  producer:pinFile(root,PRODUCER),members:[memberPin],...MODELS,candidateEvidence,currentJsRegistered:false,acceptance:false,acceptanceEffects:ACCEPTANCE};
 const runPin=put(RUN+'/run-manifest.json',run);
 for(const p of files)readPin(root,p);for(const p of Object.values(MODELS))readPin(root,p);readPin(root,candidateEvidence);
 return {member:memberPin,run:runPin,registered:false,mode};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [mode,flag,p,sha]=process.argv.slice(2);assert.equal(process.argv.slice(2).length,4);assert.equal(flag,'--candidate-evidence');assert(/^[a-f0-9]{64}$/.test(sha));
 const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');assert.equal(root,ROOT);
 const candidateEvidence=pinFile(root,p);assert.equal(candidateEvidence.sha256,sha);
 console.log(JSON.stringify(buildP004ProductProvenance({root,mode,candidateEvidence})));
}
