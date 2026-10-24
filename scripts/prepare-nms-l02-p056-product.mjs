#!/usr/bin/env node
/** Hash-bound receipt for the maintained, unregistered P056 product adapter. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstat,mkdir,readFile,realpath,writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE_REL='G6-G8-shared/NMS002/L2/TS/L2TS03.swf';
const XML_REL='G6-G8-shared/NMS002/L2/index.xml';
const SOURCE_SHA='a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be';
const XML_SHA='550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61';
const INTAKE='output/nms-l02-p056-source-intake-20260927/source-intake.json';
const OUTPUT='output/nms-l02-p056-product-20260927/native/product-source-receipt.json';
const PRODUCT_FILES=Object.freeze([
  'packages/demos/src/nms-l02-p056-product-renderer-v1.tsx',
  'packages/demos/src/nms-l02-p056-product-module-v1.tsx',
  'packages/demos/src/nms-l02-p056-product-text-v1.ts',
  'packages/demos/tests/nms-l02-p056-product-v1.test.tsx',
  'scripts/prepare-nms-l02-p056-product.mjs',
  'scripts/prepare-nms-l02-p056-product.test.mjs',
]);
const EXISTING_INPUTS=Object.freeze([
  'packages/demos/src/generated/nms-l02-p056-display-list-v1.ts',
  'packages/demos/src/generated/nms-l02-p056-symbol-art-v1.ts',
  'packages/demos/src/generated/nms-l02-p056-audio-blocks-v1.ts',
  'packages/demos/src/nms-l02-p056-semantic-view-v1.tsx',
  'packages/demos/src/timelines/shared-nms002-l02-p056-display-list.ts',
  'packages/demos/src/timelines/shared-nms002-l02-p056-svg.ts',
  'packages/demos/src/timelines/shared-nms002-l02-p056-source-behavior.ts',
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>JSON.stringify(value,null,2)+'\n';

async function physicalFile(full){
  assert.equal(await realpath(full),full,`P056 symlink or moved path: ${full}`);
  const before=await lstat(full,{bigint:true});
  assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`P056 nonordinary file: ${full}`);
  const bytes=await readFile(full),after=await lstat(full,{bigint:true});
  for(const key of ['dev','ino','mode','size','mtimeNs','ctimeNs','nlink'])assert.equal(before[key],after[key],`P056 changed file: ${full}`);
  return bytes;
}
async function pin(relative){const bytes=await physicalFile(path.join(ROOT,relative));
  return{path:relative,bytes:bytes.length,sha256:sha(bytes)};}

export function validateP056SourceIntake(intake){
  assert.equal(intake.schemaVersion,1);assert.equal(intake.kind,'nms-l02-p056-read-only-source-intake-v1');
  assert.equal(intake.animationId,'shared-nms002-l02-p056');
  assert.equal(intake.sourceRoot,SOURCE_ROOT);
  assert.deepEqual({path:intake.source.path,bytes:intake.source.bytes,sha256:intake.source.sha256},
    {path:SOURCE_REL,bytes:100959,sha256:SOURCE_SHA});
  assert.deepEqual({path:intake.lessonXml.path,bytes:intake.lessonXml.bytes,sha256:intake.lessonXml.sha256,
    globalOrdinal:intake.lessonXml.globalOrdinal,sectionCode:intake.lessonXml.sectionCode,
    sectionPageOrdinal:intake.lessonXml.sectionPageOrdinal},
    {path:XML_REL,bytes:12845,sha256:XML_SHA,globalOrdinal:56,sectionCode:'TS',sectionPageOrdinal:2});
  assert.deepEqual({stage:intake.sourceStructure.stage,fps:intake.sourceStructure.fps,
    rootFrameCount:intake.sourceStructure.rootFrameCount,rootBeginFrame:intake.sourceStructure.rootBeginFrame,
    mainFrameDomain:intake.sourceStructure.mainFrameDomain,mainFrameCount:intake.sourceStructure.mainFrameCount,
    buttonCharacterIds:intake.sourceStructure.buttonCharacterIds,buttonKeys:intake.sourceStructure.buttonKeys},
    {stage:{width:800,height:600},fps:12,rootFrameCount:10,rootBeginFrame:6,
      mainFrameDomain:'sprite-24',mainFrameCount:234,buttonCharacterIds:[16,17],buttonKeys:['Organize','Information']});
  assert.equal(intake.lessonXml.declaredKeyTermBanks.recovered,false);
  assert.equal(intake.audio.embeddedMp3.sha256,'6ab63ac96194356d22da4335ce4ff121964044fc5dab27cc79b33fa22e2fc811');
  assert.equal(intake.audio.embeddedMp3.role,'private-source-evidence-not-product-asset');
  assert.ok(Object.values(intake.acceptanceEffects).every(value=>value===false));
  return intake;
}

export async function buildP056ProductManifest(){
  const rootStat=await lstat(SOURCE_ROOT);assert.ok(rootStat.isDirectory()&&!rootStat.isSymbolicLink());
  assert.equal(await realpath(SOURCE_ROOT),SOURCE_ROOT);
  const intakePin=await pin(INTAKE),intake=validateP056SourceIntake(JSON.parse(await readFile(path.join(ROOT,INTAKE),'utf8')));
  const swf=await physicalFile(path.join(SOURCE_ROOT,SOURCE_REL));
  const xml=await physicalFile(path.join(SOURCE_ROOT,XML_REL));
  assert.deepEqual({bytes:swf.length,sha256:sha(swf)},{bytes:100959,sha256:SOURCE_SHA});
  assert.deepEqual({bytes:xml.length,sha256:sha(xml)},{bytes:12845,sha256:XML_SHA});
  const audioPin=await pin(intake.audio.embeddedMp3.path);
  assert.deepEqual({bytes:audioPin.bytes,sha256:audioPin.sha256},
    {bytes:intake.audio.embeddedMp3.bytes,sha256:intake.audio.embeddedMp3.sha256});
  const existingInputs=await Promise.all(EXISTING_INPUTS.map(pin));
  for(const expected of intake.existingCandidateArtifacts){
    const actual=existingInputs.find(file=>file.path===expected.path);
    assert.ok(actual&&actual.sha256===expected.sha256,`P056 existing source projection drift: ${expected.path}`);
  }
  const productFiles=await Promise.all(PRODUCT_FILES.map(pin));
  return Object.freeze({schemaVersion:1,kind:'nms-l02-p056-native-product-source-receipt-v1',
    animationId:intake.animationId,stage:'unregistered-maintained-product-adapter',
    sourceRoot:SOURCE_ROOT,source:{...intake.source,path:path.join(SOURCE_ROOT,SOURCE_REL)},
    lessonXml:{path:path.join(SOURCE_ROOT,XML_REL),bytes:xml.length,sha256:sha(xml),
      globalOrdinal:56,sectionCode:'TS',sectionPageOrdinal:2},
    sourceStructure:intake.sourceStructure,
    audio:{...intake.audio.embeddedMp3,physicalEvidence:audioPin,
      productUrl:null,transportConfigured:false},
    glossary:{keys:['Organize','Information'],originalL2BanksRecovered:false,
      historicalHostLookupVerified:false,hostControlsConfigured:false},
    intake:intakePin,existingInputs,productFiles,
    renderer:{export:'NmsL02P056ProductRendererV1',moduleExport:'nmsL02P056ProductModule',
      textSnapshotExport:'p056ProductTextSnapshotV1',inlineSvg:true,
      readinessHook:'data-canvas-status',language:'fixed-source-English-with-ES-disclosure'},
    acceptanceEffects:{currentJsRegistered:false,originalRuntimeFidelity:false,audioAccepted:false,
      humanReviewed:false,ownerAccepted:false,strictComplete:false,published:false}});
}

export async function prepareP056Product(mode){
  assert.ok(['--dry-run','--write','--check'].includes(mode),'Use --dry-run, --write, or --check');
  const manifest=await buildP056ProductManifest(),bytes=Buffer.from(json(manifest)),target=path.join(ROOT,OUTPUT);
  if(mode==='--write'){await mkdir(path.dirname(target),{recursive:true});await writeFile(target,bytes,{flag:'wx'});}
  if(mode==='--check')assert.deepEqual(await readFile(target),bytes,'P056 product receipt differs from current source and code');
  return{status:mode==='--dry-run'?'P056_PRODUCT_PREPARED':mode==='--write'?'P056_PRODUCT_RECEIPT_WRITTEN':'P056_PRODUCT_RECEIPT_VERIFIED',
    output:OUTPUT,bytes:bytes.length,sha256:sha(bytes),sourceSha256:SOURCE_SHA,
    productFileCount:manifest.productFiles.length,existingInputCount:manifest.existingInputs.length};
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))
  prepareP056Product(process.argv[2]).then(value=>console.log(json(value))).catch(error=>{console.error(error);process.exitCode=1;});
