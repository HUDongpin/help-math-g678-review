import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {pinFile,readJsonPin,readPin} from '../lib/g678-admission-proof.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='shared-alg001-l06-p025';
const SOURCE='output/alg-l06-p025-canvas-v2/canvas-renderer.js';
const SOURCE_MANIFEST='output/alg-l06-p025-canvas-v2/canvas-manifest-v2.json';
const STAGE='work/g678-shared-page-factory/alg-l06-p025-maintained-canvas-v2-20260930-v1';
const RUNTIME=`${STAGE}/members/${ID}/canvas-renderer.js`;
const MANIFEST=`${STAGE}/stage-manifest-v1.json`;
const RECEIPT='output/alg-l06-p025-canonical-stage-v1/staging-receipt-v1.json';
const EXPECTED={bytes:909190,sha256:'a3fd0f401fa32779ddff8fc41bc423d458b2ea2a929c44a43fbe3446dc5082f9'};
const manifestPin=pinFile(ROOT,SOURCE_MANIFEST);
const canvas=readJsonPin(ROOT,manifestPin);
assert.equal(canvas.animationId,ID);
assert.deepEqual(canvas.outputs,[{path:SOURCE,...EXPECTED}]);
const source=pinFile(ROOT,SOURCE);
assert.deepEqual(source,{path:SOURCE,...EXPECTED});
const producer=pinFile(ROOT,'scripts/stage-alg-l06-p025-canvas-v2.mjs');
const staged={path:RUNTIME,...EXPECTED};
const stageManifest={schemaVersion:1,kind:'alg-l06-p025-canonical-canvas-stage-v1',animationId:ID,
  source,sourceManifest:manifestPin,producer,staged,
  rule:'exact immutable copy of maintained generated Canvas bytes; no edits to generated script',
  registration:false,originalRuntimeAccepted:false,strictComplete:false,publication:false};
const stageManifestBytes=Buffer.from(JSON.stringify(stageManifest,null,2)+'\n');
function receipt(manifest){
 return {schemaVersion:1,kind:'alg-l06-p025-canonical-canvas-stage-receipt-v1',animationId:ID,
  source,staged,manifest,bytesUnchanged:true,registration:false,
  originalRuntimeAccepted:false,strictComplete:false,publication:false};
}
function check(){
 const actual=pinFile(ROOT,RUNTIME);
 assert.deepEqual(actual,staged);
 assert(readPin(ROOT,source).equals(readPin(ROOT,actual)),'full source/staged byte identity');
 assert(fs.readFileSync(path.join(ROOT,MANIFEST)).equals(stageManifestBytes),'deterministic immutable manifest');
 const actualManifest=pinFile(ROOT,MANIFEST),expectedReceipt=Buffer.from(JSON.stringify(receipt(actualManifest),null,2)+'\n');
 assert(fs.readFileSync(path.join(ROOT,RECEIPT)).equals(expectedReceipt),'deterministic immutable receipt');
 return {status:'checked',source,staged,manifest:actualManifest,receipt:pinFile(ROOT,RECEIPT),bytesUnchanged:true};
}
const mode=process.argv[2];
assert(['--stage','--check'].includes(mode),'--stage | --check');
if(mode==='--stage'){
 assert(!fs.existsSync(path.join(ROOT,RUNTIME))&&!fs.existsSync(path.join(ROOT,MANIFEST))&&
  !fs.existsSync(path.join(ROOT,RECEIPT)),'immutable stage must be new');
 fs.mkdirSync(path.dirname(path.join(ROOT,RUNTIME)),{recursive:true});
 fs.mkdirSync(path.dirname(path.join(ROOT,RECEIPT)),{recursive:true});
 fs.writeFileSync(path.join(ROOT,RUNTIME),readPin(ROOT,source),{flag:'wx'});
 assert.deepEqual(pinFile(ROOT,RUNTIME),staged);
 fs.writeFileSync(path.join(ROOT,MANIFEST),stageManifestBytes,{flag:'wx'});
 const actualManifest=pinFile(ROOT,MANIFEST);
 fs.writeFileSync(path.join(ROOT,RECEIPT),JSON.stringify(receipt(actualManifest),null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({...check(),status:'staged'}));
}else console.log(JSON.stringify(check()));
