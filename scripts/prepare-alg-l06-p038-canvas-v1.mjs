import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {lstatSync,mkdirSync,readFileSync,writeFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {normalizeSourceClipMasks} from './lib/g678-source-clip-masks-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const HERE=path.dirname(fileURLToPath(import.meta.url));
const CACHE='work/g678-shared-page-factory/alg-l06-p038-maintained-canvas-v1-20261001-v1';
const CANONICAL='migrations/shared-alg001-l06-p038/canvas-v1';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/IN/L6IN10.swf';
const RAW=path.join(ROOT,CACHE,'canvas-renderer-draft.js');
const RAW_METADATA=path.join(ROOT,CACHE,'canvas-metadata-v1.json');
const PLAN=path.join(ROOT,'migrations/shared-alg001-l06-p038/native-v1/source-clip-plan-v1.json');
const HELPER=path.join(ROOT,'scripts/lib/g678-source-clip-masks-v1.mjs');
const OUT=path.join(ROOT,CANONICAL,'canvas-renderer.js');
const RECEIPT=path.join(ROOT,CANONICAL,'mask-repair-manifest-v1.json');
const METADATA=path.join(ROOT,CANONICAL,'canvas-metadata-v1.json');
const PINS={
  swf:{bytes:125928,sha256:'bbd60a3b673fc54b3ea44a20943db33ea556532ddc14789a71aed4dadfe1e9de'},
  xml:{bytes:606070,sha256:'95329a959d3fbe70f4b227ea057618a3dfa4fe7591b49f03eb833a8d1af3fd14'},
  raw:{bytes:5570019,sha256:'49272ceb52504e3a1818b1377b4f63dc8d3a6071c39fdcc4bae3d3412dc239c6'},
  rawMetadata:{bytes:1220,sha256:'5791e7af8a1f794a09a07c665af3fb5776d4d57e60239525258a874ba0f43f0c'},
  plan:{bytes:74305,sha256:'96624d5d928d8b85303366bdeab9acfadf21397894d08182d47fc743f8db5f5b'},
  helper:{bytes:1604,sha256:'e064fb7cb98e66f08e5173bdfc756641b6a8ddae86f7e4dab02e90fdb3bbd70e'},
};
const PLACEMENTS=[
  {depth:80,clipDepth:85},{depth:86,clipDepth:94},
  {depth:95,clipDepth:97},{depth:98,clipDepth:103},
  {depth:104,clipDepth:106},{depth:107,clipDepth:112},
  {depth:113,clipDepth:115},{depth:116,clipDepth:118},
  {depth:119,clipDepth:124},{depth:125,clipDepth:130},
];
const RAW_FILL='ctx.fillStyle=tocolor(ctrans.apply([153,255,0,0.6901961]));';
const OPAQUE_FILL='ctx.fillStyle="rgba(0,0,0,1)";';

const hash=raw=>createHash('sha256').update(raw).digest('hex');
function pinned(raw,pin,label){
  assert.equal(raw.length,pin.bytes,`${label} bytes drift`);
  assert.equal(hash(raw),pin.sha256,`${label} hash drift`);
}
function readPinned(file,pin,label){
  const before=lstatSync(file,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,
    `${label} must be one physical regular file`);
  const raw=readFileSync(file),after=lstatSync(file,{bigint:true});
  assert.deepEqual([before.dev,before.ino,before.size,before.mtimeNs,before.ctimeNs,
    before.mode,before.nlink],[after.dev,after.ino,after.size,after.mtimeNs,
    after.ctimeNs,after.mode,after.nlink],`${label} changed while read`);
  pinned(raw,pin,label);return raw;
}
function xmlPlacements(xml){
  return [...xml.matchAll(/<PlaceObject[23]\s+[^>]*>/gu)].map(hit=>
    Object.fromEntries([...hit[0].matchAll(/([A-Za-z]+)="([^"]*)"/gu)]
      .map(attr=>[attr[1],attr[2]]))).filter(tag=>tag.objectID==='45')
    .map(tag=>({depth:Number(tag.depth),clipDepth:Number(tag.clipDepth)}));
}

/** The maintained helper must see every physical character-45 placement. */
export function deriveP038MaskSuccessor(raw,xml,plan){
  assert.equal(typeof raw,'string');assert.equal(typeof xml,'string');
  assert.equal(plan.animationId,'shared-alg001-l06-p038');
  assert.equal(plan.source.physicalSwf.sha256,PINS.swf.sha256);
  assert.deepEqual(plan.maskShape45.localRectTwips,
    {left:-1866,right:1866,top:-230,bottom:230});
  assert.deepEqual(plan.maskShape45.sourceFillRGBA,[153,255,0,176]);
  assert.equal(plan.maskShape45.solidRectangleGeometryVerified,true);
  assert.equal(plan.maskInstances.length,10);
  assert(plan.maskInstances.every(row=>row.objectId===45));
  const planned=plan.maskInstances.map(row=>({depth:row.depth,clipDepth:row.clipDepth}));
  assert.deepEqual(planned,PLACEMENTS,'ten source clip placements');
  assert.deepEqual(xmlPlacements(xml),PLACEMENTS,
    'fresh XML has exactly these ten shape45 placements');
  const successor=normalizeSourceClipMasks(raw,[{
    characterId:45,placements:PLACEMENTS,rawFill:RAW_FILL,
  }],xml);
  assert.notEqual(successor,raw);
  assert.equal(raw.split(RAW_FILL).length,2,'one authored shape45 fill');
  assert.equal(successor,raw.replace(RAW_FILL,OPAQUE_FILL),
    'only source mask fill may change');
  assert.equal(successor.split(OPAQUE_FILL).length,2,'one opaque mask fill');
  return {successor,placements:PLACEMENTS};
}

function saveExact(file,raw,check){
  const compare=()=>{
    const info=lstatSync(file,{bigint:true});
    assert(info.isFile()&&!info.isSymbolicLink()&&info.nlink===1n,
      `${path.basename(file)} must be one physical regular file`);
    assert.deepEqual(readFileSync(file),raw,`${path.basename(file)} drift`);
  };
  if(check){compare();return;}
  try{writeFileSync(file,raw,{flag:'wx'});}catch(error){
    if(error.code!=='EEXIST')throw error;
  }
  compare();
}

export function main(args=process.argv.slice(2)){
  assert(args.length===0||(args.length===1&&args[0]==='--check'),
    'usage: node prepare-p038-mask-successor.mjs [--check]');
  const check=args[0]==='--check';
  const generatorMode=check?'--check':'--write';
  execFileSync('python3',[path.join(HERE,'prepare-alg-l06-p038-ffdec-canvas-v1.py'),generatorMode],
    {cwd:ROOT,maxBuffer:16*1024*1024});
  execFileSync(process.execPath,[path.join(HERE,'prepare-alg-l06-p038-raw-canvas-v1.mjs'),generatorMode],
    {cwd:ROOT,maxBuffer:16*1024*1024});
  readPinned(SOURCE,PINS.swf,'physical SWF');
  const rawBytes=readPinned(RAW,PINS.raw,'raw Canvas');
  const rawMetadata=JSON.parse(readPinned(RAW_METADATA,PINS.rawMetadata,'raw metadata'));
  const planBytes=readPinned(PLAN,PINS.plan,'clip plan');
  readPinned(HELPER,PINS.helper,'maintained clip helper');
  const xmlBytes=execFileSync('swfmill',['-n','swf2xml',SOURCE,'stdout'],
    {maxBuffer:16*1024*1024});
  pinned(xmlBytes,PINS.xml,'fresh swfmill XML');
  const {successor,placements}=deriveP038MaskSuccessor(
    rawBytes.toString('utf8'),xmlBytes.toString('utf8'),JSON.parse(planBytes));
  const successorBytes=Buffer.from(successor,'utf8');
  const manifest={schemaVersion:1,kind:'p038-source-clip-mask-opaque-successor-v1',
    animationId:'shared-alg001-l06-p038',
    source:{physicalSwf:PINS.swf,swfmillXml:PINS.xml,
      rawCanvas:PINS.raw,clipPlan:PINS.plan,normalizer:PINS.helper},
    sourceShape:{characterId:45,solidRectangleTwips:{left:-1866,right:1866,
      top:-230,bottom:230},authoredFillRGBA:[153,255,0,176],
      authoredCanvasFill:RAW_FILL,sourceClipPlacements:placements},
    changedCanvasFill:OPAQUE_FILL,
    successor:{bytes:successorBytes.length,sha256:hash(successorBytes)},
    exactChange:'one shape45 source-only fill; all other raw Canvas bytes retained',
    sourceCanvasGlyphSuppression:'unchanged-default-preserve-all',
    browserVisualCalibration:false,originalRuntimeAccepted:false,
    currentJsRegistered:false,audioAccepted:false};
  const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
  assert.equal(rawMetadata.animationId,manifest.animationId);
  assert.equal(rawMetadata.assetSha256,PINS.raw.sha256);
  assert.equal(rawMetadata.sourceClipMasks.count,10);
  const metadata={...rawMetadata,assetSha256:manifest.successor.sha256,
    sourceClipMasks:{...rawMetadata.sourceClipMasks,
      sourceOnlyOpaqueMaskNormalization:true}};
  const metadataBytes=Buffer.from(JSON.stringify(metadata,null,2)+'\n');
  if(!check)mkdirSync(path.dirname(OUT),{recursive:true});
  const destination=lstatSync(path.dirname(OUT));
  assert(destination.isDirectory()&&!destination.isSymbolicLink(),
    'canonical Canvas directory must be physical');
  saveExact(OUT,successorBytes,check);
  saveExact(RECEIPT,manifestBytes,check);
  saveExact(METADATA,metadataBytes,check);
  console.log(JSON.stringify({status:'PASS',check,successor:manifest.successor,
    metadata:{bytes:metadataBytes.length,sha256:hash(metadataBytes)},
    maskPlacements:placements.length,originalFillPreservedInEvidence:true}));
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
