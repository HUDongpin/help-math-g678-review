#!/usr/bin/env node
/** Source-locked P008 root-frame-6 Canvas composition diagnostic. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Script} from 'node:vm';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
// Preserve earlier diagnostics: v1 lacked sprite507 in the allowlist; v2
// exposed FFDec's tiny raw root placement for that sprite in a real browser.
const OUT=path.join(ROOT,'output/alg-l06-p008-composed-canvas-v1/successor-v4');
const ID='shared-alg001-l06-p008';
const PINS=Object.freeze({
  main:{path:'output/alg-l06-p008-canvas-candidate-v2/canvas-renderer.js',sha256:'b38f619ca91d58c4ca9585a712156452664b26a911c17bdbabc36889ceba2cad'},
  mainManifest:{path:'output/alg-l06-p008-canvas-candidate-v2/candidate-manifest.json'},
  sourceFrames:{path:'migrations/shared-alg001-l06-p008/audit/canvas-v1/frames/frames.html',sha256:'fedd69136dd22cc6e252800bd166829bf478415784ebd255f5ab605f478b42ea'},
  composition:{path:'migrations/shared-alg001-l06-p008/audit/source-v1/source-composition-v1.json',sha256:'a738f4fa22abd482cbb4a5470a33c85f465f79ae1fd831b1c29466c4617016c7'},
  sourceAudit:{path:'migrations/shared-alg001-l06-p008/audit/source-v1/source-audit-v1.json',sha256:'e14303e47454761f2fc17b77b7eb6afc714354d50cfbd1bd151264a516db6de2'},
});
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(`${JSON.stringify(value,null,2)}\n`);
function readPinned(pin){
  const absolute=path.resolve(ROOT,pin.path);
  assert(absolute.startsWith(`${ROOT}${path.sep}`)&&realpathSync(absolute)===absolute,`physical scoped file: ${pin.path}`);
  const before=lstatSync(absolute,{bigint:true});
  assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary file: ${pin.path}`);
  const bytes=readFileSync(absolute),after=lstatSync(absolute,{bigint:true});
  for(const field of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[field],after[field],`stable file: ${pin.path}`);
  if(pin.sha256)assert.equal(sha(bytes),pin.sha256,`SHA drift: ${pin.path}`);
  return bytes;
}
function oneReplace(source,needle,replacement,label){
  const first=source.indexOf(needle);
  assert(first>=0&&source.indexOf(needle,first+needle.length)<0,`unique ${label}`);
  return source.slice(0,first)+replacement+source.slice(first+needle.length);
}
function extractFunction(source,name,nextName){
  const begin=source.indexOf(`function ${name}(`);
  const end=source.indexOf(nextName?`\nfunction ${nextName}(`:'\nvar frame = -1;',begin);
  assert(begin>=0&&end>begin,`source function ${name}`);
  assert(source.indexOf(`function ${name}(`,begin+1)<0,`unique function ${name}`);
  return source.slice(begin,end).trimEnd();
}
function verifyRootEvidence(composition,source){
  assert.equal(composition.root.declaredFrames,10);
  const places=composition.root.events.filter(event=>event.frame===6&&event.kind==='place');
  assert.deepEqual(places.map(event=>[event.depth,event.characterId,event.matrix?.[4],event.matrix?.[5]]),
    [[1,507,7390,5060],[502,508,2867,-3700],[503,510,8000,879],[505,511,0,0]]);
  assert.equal(places[0].name?.text,'animation');
  assert.equal(places[2].name?.text,'Mc_Page_Title');
  const frameSix=source.slice(source.indexOf('function main('));
  const block=frameSix.slice(frameSix.indexOf('case 5:'),frameSix.indexOf('case 6:'));
  assert.deepEqual([...block.matchAll(/place\("(sprite507|text508|sprite510|shape511)",canvas,ctx,\[([^\]]+)\]/gu)]
    .map(match=>[match[1],match[2].split(',').map(Number)]),[
      ['sprite507',[.05,0,0,.05,369.5,253]],
      ['text508',[.05,0,0,.05,143.35,-185]],
      ['sprite510',[.05,0,0,.05,400,43.95]],
      ['shape511',[.05,0,0,.05,0,0]],
    ],'FFDec root-frame-6 draw order and transforms');
  return places;
}

export function buildP008ComposedCanvas(){
  const inputs=Object.fromEntries(Object.entries(PINS).map(([key,pin])=>[key,readPinned(pin)]));
  const manifest=JSON.parse(inputs.mainManifest),audit=JSON.parse(inputs.sourceAudit);
  assert.equal(manifest.kind,'alg-l06-p008-main-domain-diagnostic-canvas-v1');
  assert(manifest.outputs.some(output=>output.name==='canvas-renderer.js'&&output.sha256===PINS.main.sha256));
  assert.equal(audit.source.sha256,'6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350');
  assert.equal(audit.header.rootFrameCount,10);
  const source=inputs.sourceFrames.toString().replace(/\r\n?/gu,'\n');
  const places=verifyRootEvidence(JSON.parse(inputs.composition),source);
  const rootBlock=source.slice(source.indexOf('function main('));
  const frameSix=rootBlock.slice(rootBlock.indexOf('case 5:'),rootBlock.indexOf('case 6:'));
  const decorationLines=frameSix.split('\n').filter(line=>/place\("(?:text508|sprite510|shape511)"/u.test(line));
  assert.equal(decorationLines.length,3,'exact source root decoration placements');
  const names=[['text508','shape509'],['shape509','sprite510'],['sprite510','shape511'],['shape511','main'],['main',null]];
  const functions=names.map(([name,next])=>extractFunction(source,name,next));
  assert(functions[2].includes('place("shape509"'),'title sprite includes source shape509');
  assert(functions[0].includes('font33(ctx,'),'offstage source text uses existing source font33');
  let runtime=inputs.main.toString();
  assert(runtime.includes('function font33(')&&runtime.includes('function sprite507('),'main diagnostic source definitions');
  runtime=oneReplace(runtime,'\nSAFE_OBJECTS = Object.freeze({',`\n${functions.join('\n\n')}\n\nSAFE_OBJECTS = Object.freeze({`,'source root definitions');
  runtime=oneReplace(runtime,'SAFE_OBJECTS = Object.freeze({\n',
    'SAFE_OBJECTS = Object.freeze({\n        "sprite507": sprite507,\n        "text508": text508,\n        "shape509": shape509,\n        "sprite510": sprite510,\n        "shape511": shape511,\n','root object allowlist');
  const oldDraw='ctx.transform(1, 0, 0, 1, -1070.85, -768);\n        sprite507(ctx, new cxform(0,0,0,0,255,255,255,255), state.exportFrame, 0, 0);';
  runtime=oneReplace(runtime,oldDraw,`${oldDraw}
        /* Main uses the reviewed v2 stage offset; raw FFDec root scaling is tiny.
         Root frame-6 layers below preserve the exported source transforms. */
        ctx.save();
        try {
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            var ctrans = new cxform(0,0,0,0,255,255,255,255);
            var time = state.exportFrame;
${decorationLines.map(line=>`            ${line.trim()}`).join('\n')}
        } finally { ctx.restore(); }`,
    'root-frame-6 decorations after maintained main draw');
  new Script(runtime);
  const preview=Buffer.from(`<!doctype html>\n<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><title>P008 composed Canvas diagnostic</title><style>body{margin:0;background:#172531;color:white;font:16px system-ui}main{width:min(100%,800px);margin:auto}canvas{display:block;width:100%;height:auto}p{padding:8px}</style></head><body><main><canvas id="stage" width="800" height="600" aria-label="P008 source root-frame-6 drawing diagnostic"></canvas><p id="status" role="status">Loading source drawing…</p></main><script src="./canvas-renderer.js"></script><script>(async()=>{try{const frame=Number(new URLSearchParams(location.search).get('frame')||'1');if(!Number.isSafeInteger(frame)||frame<1||frame>938)throw Error('invalid frame');const asset=globalThis.HELP_MATH_CANVAS_ASSETS?.['${ID}'];if(!asset)throw Error('asset missing');await asset.ready();const state=asset.render(document.getElementById('stage'),{frame,scenario:'source-static-frame',lang:'en',seed:0});document.getElementById('status').textContent='Root frame 6 composition · sprite frame '+state.localFrame+'/938 · source text retained · no acceptance';document.body.dataset.candidateReady='true';}catch(error){document.getElementById('status').textContent=String(error);document.body.dataset.candidateError=String(error);}})();</script></body></html>\n`);
  const script=readPinned({path:'scripts/build-alg-l06-p008-composed-canvas-v1.mjs'});
  const outputs=[['canvas-renderer.js',Buffer.from(runtime)],['preview.html',preview]];
  const record={schemaVersion:1,kind:'alg-l06-p008-root-composed-canvas-diagnostic-v1',animationId:ID,
    status:'unregistered-source-drawing-diagnostic',rootFrame:6,mainSpriteFrames:938,
    sourceDepthOrder:places.map(event=>({depth:event.depth,characterId:event.characterId,
      placementPixels:{x:event.matrix[4]/20,y:event.matrix[5]/20}})),
    rootFunctions:names.map(([name],index)=>({name,sha256:sha(functions[index])})),
    sourceTextDisposition:'All source text, vector title, and source bitmaps remain drawn; no native-text suppression.',
    drawBoundary:'Reviewed v2 stage-normalized sprite-507 main drawing, followed by exact FFDec root-frame-6 offstage-text/title/overlay transforms and depth order. Raw FFDec root sprite scale rendered tiny in Chrome; original-runtime placement unverified.',
    unresolved:['13 source bitmaps and 461 source shapes may contain text or masks; native replacement needs a source-object-level contract.',
      'No original Flash runtime comparison, audio playback/listening, accessibility replacement, registration, or acceptance.'],
    inputs:[...Object.entries(PINS).map(([key,pin])=>({key,path:pin.path,bytes:inputs[key].length,sha256:sha(inputs[key])})),
      {key:'builder',path:'scripts/build-alg-l06-p008-composed-canvas-v1.mjs',bytes:script.length,sha256:sha(script)}],
    outputs:outputs.map(([name,bytes])=>({name,bytes:bytes.length,sha256:sha(bytes)})),
    acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,fidelity:false,audio:false,human:false,owner:false,strictComplete:false,publication:false}};
  return {runtime:outputs[0][1],preview,manifest:json(record)};
}

function main(){
  const mode=process.argv[2];assert(process.argv.length===3&&['--build','--check'].includes(mode),
    'usage: build-alg-l06-p008-composed-canvas-v1.mjs --build|--check');
  if(mode==='--build')mkdirSync(OUT,{recursive:true});
  assert(realpathSync(OUT)===OUT&&lstatSync(OUT).isDirectory()&&!lstatSync(OUT).isSymbolicLink(),'physical output directory');
  const built=buildP008ComposedCanvas();
  const files=[['canvas-renderer.js',built.runtime],['preview.html',built.preview],['composed-manifest.json',built.manifest]];
  for(const [name,bytes] of files){
    const target=path.join(OUT,name);
    if(mode==='--check')assert(readFileSync(target).equals(bytes),`${name} drift`);
    else try{writeFileSync(target,bytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;assert(readFileSync(target).equals(bytes),`${name} drift`);}
  }
  console.log(JSON.stringify({status:mode==='--check'?'verified':'created',output:OUT,
    files:files.map(([name,bytes])=>({name,bytes:bytes.length,sha256:sha(bytes)}))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
