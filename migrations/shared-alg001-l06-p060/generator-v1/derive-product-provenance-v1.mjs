import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin} from '../../../lib/g678-admission-proof.mjs';
const R=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),ID='shared-alg001-l06-p060',M=`migrations/${ID}`;
const O=`work/g678-shared-page-factory/alg-l06-p060-maintained-native-v1-20261003-v1`,pin=p=>pinFile(R,p);
const model=readJsonPin(R,pin(`${M}/native-v1/source-model-v1.json`)),audio=readJsonPin(R,pin(`${M}/audio-v1/source-role-inventory-v1.json`));
assert.equal(model.sourceSha256,'3228fd031f09bc4f888e35328c4c3ffc1b7a85d430e62af77335fadcd3214832');assert.equal(model.questions.length,24);assert.equal(audio.assets.length,240);
const product=[`packages/demos/src/modules/${ID}.tsx`,`packages/demos/src/timelines/${ID}.ts`,...['source','state','audio','session','content','player'].map(n=>`packages/demos/src/alg-l06-p060-${n}-v1.${['content','player'].includes(n)?'tsx':'ts'}`),
 'packages/demos/src/generated/alg-l06-p060-native-v1.ts','packages/demos/src/generated/alg-l06-p060-measured-v1.ts',
 'packages/demos/src/g678-alg-l09-game-assessment.ts','packages/demos/src/g678-advanced-manual/contracts.ts','packages/demos/src/g678-advanced-manual/host-feedback-selector.ts','packages/demos/src/decoded-source-stream-transport.ts'];
const source={path:'G6-G8-shared/ALG001/L6/FQ/L6FQ02.swf',bytes:48994,sha256:model.sourceSha256};
const member={schemaVersion:1,artifactType:'g678-maintained-native-quiz-member-v1',animationId:ID,source,
 runtime:{stage:{width:800,height:600},fps:12,rootFrameCount:10,rootBeginFrame:6,frameDomain:'sprite-973',frameCount:69,livePlaybackEndFrame:1,questionCount:24,sessionQuestionCount:10},
 rendering:'Native React text, fractions and tables with source SVG graph paths. Source-frame readback follows quiz state.',
 sourceModel:pin(`${M}/native-v1/source-model-v1.json`),audioInventory:pin(`${M}/audio-v1/source-role-inventory-v1.json`),files:product.map(pin),currentJsRegistered:false,acceptance:false};
const encode=v=>Buffer.from(JSON.stringify(v,null,2)+'\n'),out=`${O}/members/${ID}/member-manifest.json`,bytes=encode(member);
assert(['--write','--check'].includes(process.argv[2]));
if(process.argv[2]==='--write'){fs.mkdirSync(path.dirname(path.join(R,out)),{recursive:true});fs.writeFileSync(path.join(R,out),bytes);}else assert.deepEqual(fs.readFileSync(path.join(R,out)),bytes);
const run={schemaVersion:1,artifactType:'g678-maintained-native-quiz-run-v1',animationId:ID,implementationLane:'advanced-manual-behavior-first',source,
 producer:pin(`${M}/generator-v1/derive-product-provenance-v1.mjs`),sourceExtraction:pin(`${M}/audit-v1/source-extraction-v1.json`),members:[pin(out)],
 nativeDerivation:pin(`${M}/native-v1/native-derivation-v1.json`),audioMeasurement:pin(`${M}/audit-v1/browser-decode-v1.json`),currentJsRegistered:false,acceptanceEffects:{originalRuntime:false,fidelity:false,audioListening:false,human:false,owner:false,strictComplete:false,release:false,publication:false}};
const runPath=`${O}/run-manifest.json`,rb=encode(run);if(process.argv[2]==='--write')fs.writeFileSync(path.join(R,runPath),rb);else assert.deepEqual(fs.readFileSync(path.join(R,runPath)),rb);
for(const p of member.files)readPin(R,p);console.log(JSON.stringify({member:pin(out),run:pin(runPath),registered:false}));
