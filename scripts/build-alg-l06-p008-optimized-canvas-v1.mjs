#!/usr/bin/env node
/** P008 diagnostic successor: source-bounded shape480 transformed-image cache. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync,mkdirSync,readFileSync,realpathSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Keep the passing shape480-only experiment and its pixel/timing receipt.
const OUT=path.join(ROOT,'output/alg-l06-p008-optimized-canvas-v1/successor-v2');
const ID='shared-alg001-l06-p008';
const PINS=Object.freeze({
  runtime:{path:'output/alg-l06-p008-composed-canvas-v1/successor-v4/canvas-renderer.js',sha256:'6bee67fa24900e148ad6babc1c82dbd66760aed42166cba7caa04667649e1d5c'},
  manifest:{path:'output/alg-l06-p008-composed-canvas-v1/successor-v4/composed-manifest.json',sha256:'17ff29a344a91780fba429aa3f4ae44c9b299f2ad1320e634d46a314d0e1a33d'},
  preview:{path:'output/alg-l06-p008-composed-canvas-v1/successor-v4/preview.html',sha256:'249dacf267db5944328abf6228428ef0da0b89026b0ac650f772a1336098db59'},
  sourceFrames:{path:'migrations/shared-alg001-l06-p008/audit/canvas-v1/sprites/DefineSprite_507/frames.html',sha256:'5aa4f4dbd4e77bf0f440e1795d0168e34b2a01598079bf72329472d54ce0e403'},
});
const sha=value=>createHash('sha256').update(value).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
function readPinned(pin){
  const absolute=path.resolve(ROOT,pin.path);
  assert(absolute.startsWith(`${ROOT}${path.sep}`)&&realpathSync(absolute)===absolute,`physical file: ${pin.path}`);
  const before=lstatSync(absolute,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file: ${pin.path}`);
  const bytes=readFileSync(absolute),after=lstatSync(absolute,{bigint:true});
  for(const field of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[field],after[field],`stable file: ${pin.path}`);
  assert.equal(sha(bytes),pin.sha256,`SHA drift: ${pin.path}`);
  return bytes;
}
function replaceOne(source,needle,replacement,label){
  const at=source.indexOf(needle);
  assert(at>=0&&source.indexOf(needle,at+needle.length)<0,`unique ${label}`);
  return source.slice(0,at)+replacement+source.slice(at+needle.length);
}
function sourceShape(source,name){
  const normalized=source.replace(/\r\n?/gu,'\n');
  const begin=normalized.indexOf(`function ${name}(`),end=normalized.indexOf('\nfunction ',begin+1);
  assert(begin>=0&&end>begin,`source ${name}`);
  const fn=normalized.slice(begin,end).trimEnd();
  return fn;
}

export function buildP008OptimizedCanvas(){
  const bytes=Object.fromEntries(Object.entries(PINS).map(([name,pin])=>[name,readPinned(pin)]));
  const parent=JSON.parse(bytes.manifest);
  assert.equal(parent.kind,'alg-l06-p008-root-composed-canvas-diagnostic-v1');
  assert(parent.outputs.some(item=>item.name==='canvas-renderer.js'&&item.sha256===PINS.runtime.sha256));
  const original=bytes.runtime.toString();
  const shapes=Object.fromEntries(['shape480','shape483','shape484']
    .map(name=>[name,sourceShape(bytes.sourceFrames.toString(),name)]));
  for(const [name,shape] of Object.entries(shapes))assert(original.includes(shape),`${name} in composed asset matches source bytes`);
  const expectedCalls={shape480:[3,2],shape483:[13,21],shape484:[13,25,25,21]};
  for(const [name,ids] of Object.entries(expectedCalls)){
    assert.deepEqual([...shapes[name].matchAll(/ctrans\.applyToImage\(imageObj(\d+)\)/gu)].map(match=>Number(match[1])),ids);
    assert.equal((shapes[name].match(/ctx\.createPattern\(fimg,"repeat"\)/gu)||[]).length,ids.length);
    assert((shapes[name].match(/ctx\.fillRect\(-16384,-16384,32768,32768\)/gu)||[]).length>=ids.length,
      `${name} retains the source pattern fills`);
  }
  for(const id of [2,3,13,21,25])assert.equal(original.split(`imageObj${id}.src=`).length-1,1,`imageObj${id} assigned only at source initialization`);
  // The source's exact frame-853 placements merge identity 255 multipliers with
  // (256,256,256,192). This is *not* isEmpty() and must retain pixel processing.
  for(const name of Object.keys(expectedCalls))assert(original.includes(`place("${name}",canvas,ctx,`)&&
    original.includes('ctrans.merge(new cxform(0,0,0,0,256,256,256,192))'),`source alpha-192 ${name} placement`);
  const helper=`var P008_SOURCE_BITMAP_CACHE = [null,null,null,null,null];
function p008CachedSourceBitmap(transform,image,slot){
    var exactSource = [imageObj3,imageObj2,imageObj13,imageObj21,imageObj25][slot];
    if (image !== exactSource || !image.complete || image.naturalWidth < 1 ||
        transform.r_add !== 0 || transform.g_add !== 0 || transform.b_add !== 0 || transform.a_add !== 0 ||
        transform.r_mult !== 256 || transform.g_mult !== 256 || transform.b_mult !== 256 || transform.a_mult !== 192) {
        return transform.applyToImage(image);
    }
    var cached = P008_SOURCE_BITMAP_CACHE[slot];
    if (cached !== null) return cached;
    cached = transform.applyToImage(image);
    P008_SOURCE_BITMAP_CACHE[slot] = cached;
    return cached;
}`;
  const slots={3:0,2:1,13:2,21:3,25:4};
  let runtime=original;
  for(const [name,shape] of Object.entries(shapes)){
    const optimizedShape=shape.replace(/ctrans\.applyToImage\(imageObj(\d+)\)/gu,(match,id)=>{
      assert(Object.hasOwn(slots,id),`bounded source image ${id}`);
      return `p008CachedSourceBitmap(ctrans,imageObj${id},${slots[id]})`;
    });
    runtime=replaceOne(runtime,shape,`${name==='shape480'?`${helper}\n\n`:''}${optimizedShape}`,`source ${name} transformation`);
  }
  assert(runtime.includes('function p008CachedSourceBitmap('));
  new Script(runtime);
  const outputRuntime=Buffer.from(runtime),outputPreview=bytes.preview;
  const script=readFileSync(fileURLToPath(import.meta.url));
  const outputs=[{name:'canvas-renderer.js',bytes:outputRuntime.length,sha256:sha(outputRuntime)},
    {name:'preview.html',bytes:outputPreview.length,sha256:sha(outputPreview)}];
  const manifest=json({schemaVersion:1,kind:'alg-l06-p008-bounded-bitmap-cache-diagnostic-v2',animationId:ID,
    status:'unregistered-optimized-canvas-diagnostic',
    cacheContract:{symbols:['shape480','shape483','shape484'],embeddedImages:['imageObj3','imageObj2','imageObj13','imageObj21','imageObj25'],maximumEntries:5,
      exactColorTransform:{add:[0,0,0,0],mult:[256,256,256,192]},
      fallback:'Unmatched image or transform calls the unmodified cxform.applyToImage.',
      immutableSource:'Only five embedded image objects; the three source shapes use their transformed results as repeating-pattern inputs.'},
    sourceShapeSha256:Object.fromEntries(Object.entries(shapes).map(([name,shape])=>[name,sha(shape)])),
    inputs:[...Object.entries(PINS).map(([name,pin])=>({name,path:pin.path,bytes:bytes[name].length,sha256:pin.sha256})),
      {name:'generator',path:'scripts/build-alg-l06-p008-optimized-canvas-v1.mjs',bytes:script.length,sha256:sha(script)}],
    outputs,acceptanceEffects:{runtimeProductChanged:false,currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false,publication:false}});
  return {runtime:outputRuntime,preview:outputPreview,manifest};
}
function main(){
  const mode=process.argv[2];assert(process.argv.length===3&&['--build','--check'].includes(mode),
    'usage: build-alg-l06-p008-optimized-canvas-v1.mjs --build|--check');
  if(mode==='--build')mkdirSync(OUT,{recursive:true});
  assert(realpathSync(OUT)===OUT&&lstatSync(OUT).isDirectory()&&!lstatSync(OUT).isSymbolicLink(),'physical output directory');
  const result=buildP008OptimizedCanvas();
  const files=[['canvas-renderer.js',result.runtime],['preview.html',result.preview],['optimized-manifest.json',result.manifest]];
  for(const [name,content] of files){const target=path.join(OUT,name);
    if(mode==='--check')assert(readFileSync(target).equals(content),`${name} drift`);
    else try{writeFileSync(target,content,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;assert(readFileSync(target).equals(content),`${name} drift`);}}
  console.log(JSON.stringify({status:mode==='--check'?'verified':'created',output:OUT,
    files:files.map(([name,content])=>({name,bytes:content.length,sha256:sha(content)}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
