import {createHash} from 'node:crypto';
import {mkdir,readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE='output/nms-l02-ts-family-20260927/visual/source-text-ir.json';
const RUNTIME='output/nms-l02-ts-family-20260927/visual/canvas-renderer.js';
const TARGET='packages/demos/src/generated/nms-l02-p055-native-text.json';
const RECEIPT='output/nms-l02-host-successor-20260927/product/native-input-receipt.json';
const PINS={
 source:{path:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/TS/L2TS02.swf',bytes:149059,sha256:'8581db0c66f2b9640eb8ea244e22ec6831d0cb98d1fd9b3fb60b15bcc745758e'},
 text:{path:SOURCE,bytes:106339,sha256:'72f14b7e998611357389f40cc1e6083ec7ea60c55d00067b3709afed6844a49a'},
 runtime:{path:RUNTIME,bytes:930320,sha256:'47e796237e5520140a760175865f09c3f218ac942cf3cadc8fb9f56c38bd358d'},
};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const abs=p=>path.isAbsolute(p)?p:path.join(ROOT,p);
async function pinned(pin){const bytes=await readFile(abs(pin.path));
 if(bytes.length!==pin.bytes||sha(bytes)!==pin.sha256)throw Error(`P055 product input drift: ${pin.path}`);
 return bytes;
}
async function inspect(){
 await Promise.all([pinned(PINS.source),pinned(PINS.runtime)]);
 const bytes=await pinned(PINS.text),ir=JSON.parse(bytes.toString('utf8'));
 if(ir.schemaVersion!==1||ir.kind!=='nms-l02-ts-p055-source-static-text-v1'||
  ir.animationId!=='shared-nms002-l02-p055'||ir.sourceSwfSha256!==PINS.source.sha256||
  ir.frameDomain!=='sprite-26'||ir.frameCount!==351||ir.definitions?.length!==12||
  ir.instances?.length!==18||ir.retainedDynamicFields?.length!==1)throw Error('P055 product IR identity');
 const definitions=new Map(ir.definitions.map(d=>[d.characterId,d]));
 const ids=new Set();
 for(const d of ir.definitions){
  if(!Array.isArray(d.runs)||!d.runs.length||d.runs.some(r=>r.sourceTextId!==`character-${d.characterId}/run-${d.runs.indexOf(r)}`||typeof r.text!=='string'))
   throw Error('P055 source runs');
 }
 for(const i of ir.instances){
  if(ids.has(i.instanceId)||!definitions.has(i.characterId)||
   !new RegExp(`^sprite-26/depth-${i.depth}/generation-[1-9][0-9]*$`).test(i.instanceId)||
   i.firstFrame<1||i.lastFrameExclusive>352||i.firstFrame>=i.lastFrameExclusive||
   !i.poseSegments?.length)throw Error('P055 source instance');
  ids.add(i.instanceId);
 }
 return bytes;
}
export async function prepareP055ProductInputs({check=false}={}){
 const bytes=await inspect();
 const receipt={schemaVersion:1,kind:'nms-l02-p055-product-inputs-v1',animationId:'shared-nms002-l02-p055',
  source:PINS.source,textIr:PINS.text,canvasRuntime:PINS.runtime,
  generatedText:{path:TARGET,bytes:bytes.length,sha256:sha(bytes)},
  claimBoundary:{productCandidateOnly:true,registered:false,fidelityAccepted:false,audioAccepted:false,ownerAccepted:false}};
 const receiptBytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(check){
  if(!(await readFile(abs(TARGET))).equals(bytes)||!(await readFile(abs(RECEIPT))).equals(receiptBytes))
   throw Error('P055 generated product inputs drift');
 }else{
  await mkdir(path.dirname(abs(TARGET)),{recursive:true});
  await mkdir(path.dirname(abs(RECEIPT)),{recursive:true});
  await writeFile(abs(TARGET),bytes);
  await writeFile(abs(RECEIPT),receiptBytes);
 }
 return receipt;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 prepareP055ProductInputs({check:process.argv.includes('--check')}).then(receipt=>
  process.stdout.write(`${receipt.kind} ${receipt.generatedText.sha256} ${process.argv.includes('--check')?'checked':'written'}\n`))
  .catch(error=>{process.stderr.write(`${error.message}\n`);process.exitCode=1;});
}
