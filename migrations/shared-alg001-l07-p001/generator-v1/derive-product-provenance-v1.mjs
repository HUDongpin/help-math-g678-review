import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin} from '../../../lib/g678-admission-proof.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const id='shared-alg001-l07-p001',migration=`migrations/${id}`;
const output='work/g678-shared-page-factory/alg-l07-p001-maintained-native-v1-20261003-v1';
const pin=p=>pinFile(root,p),model=readJsonPin(root,pin(`${migration}/native-v1/source-model-v1.json`));
assert.equal(model.animationId,id);assert.equal(model.source.sha256,
 'cef7d8d01efa3a8cc1f2a6d6e6334213c23892e0375bdac72624fd6979c16821');
assert.equal(model.frameCount,138);assert.equal(model.stream.pin.sha256,
 '6ac6c824b8877f0365fb3ee878b2ba08e5015c44aa5e33fa3e9acc19dbe2e856');
const files=[`packages/demos/src/modules/${id}.tsx`,`packages/demos/src/timelines/${id}.ts`,
 'packages/demos/src/generated/alg-l07-p001-source-v1.ts',
 ...['state-v1.ts','session-v1.ts','presentation-v1.tsx','player-v1.tsx','v1.css','v1.css.d.ts']
  .map(name=>`packages/demos/src/alg-l07-p001-${name}`)];
const source={path:'G6-G8-shared/ALG001/L7/IR/L7IR01.swf',bytes:72497,sha256:model.source.sha256};
const member={schemaVersion:1,artifactType:'g678-maintained-native-introduction-member-v1',
 animationId:id,source,runtime:{stage:model.stage,fps:12,rootFrameCount:10,
 rootBeginFrame:6,frameDomain:'sprite-142',frameCount:138,playbackMode:'loop'},
 rendering:'Native React source-text title with extracted frame-by-frame fade and scale; source MP3 stream stays separate.',
 sourceModel:pin(`${migration}/native-v1/source-model-v1.json`),
 audioMeasurement:pin(`${migration}/audit-v1/decode-v1.json`),files:files.map(pin),
 currentJsRegistered:false,acceptance:false};
const encode=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const memberPath=`${output}/members/${id}/member-manifest.json`;
const action=process.argv[2];assert(['--write','--check'].includes(action));
const writeOrCheck=(name,value)=>{const bytes=encode(value),absolute=path.join(root,name);
 if(action==='--write'){fs.mkdirSync(path.dirname(absolute),{recursive:true});fs.writeFileSync(absolute,bytes);}
 else assert.deepEqual(fs.readFileSync(absolute),bytes);};
writeOrCheck(memberPath,member);
const run={schemaVersion:1,artifactType:'g678-maintained-native-introduction-run-v1',
 animationId:id,implementationLane:'advanced-manual-behavior-first',source,
 producer:pin(`${migration}/generator-v1/derive-product-provenance-v1.mjs`),
 sourceGenerator:pin(`${migration}/generator-v1/derive-source-v1.py`),
 productGenerator:pin(`${migration}/generator-v1/derive-product-v1.py`),
 members:[pin(memberPath)],sourceModel:member.sourceModel,
 audioMeasurement:member.audioMeasurement,currentJsRegistered:false,
 acceptanceEffects:{originalRuntime:false,fidelity:false,audioListening:false,
  human:false,owner:false,strictComplete:false,release:false,publication:false}};
const runPath=`${output}/run-manifest.json`;writeOrCheck(runPath,run);
for(const file of member.files)readPin(root,file);
console.log(JSON.stringify({member:pin(memberPath),run:pin(runPath),registered:false}));
