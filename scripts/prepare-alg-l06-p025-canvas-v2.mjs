#!/usr/bin/env node
/** Source-derived successor adds two audited, native-owned paragraph guards. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {Script} from 'node:vm';
import {fileURLToPath} from 'node:url';
import {buildP025Canvas} from './prepare-alg-l06-p025-canvas-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT='output/alg-l06-p025-canvas-v2';
const NATIVE='output/alg-l06-p025-native-text-v1/text-state-source-v1.json';
const SHA='a36a65777d4beb3b5d0db19a7c78dcdc40522eb44b6f856e932d8bf03f5ac83b';
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=(name)=>{const b=fs.readFileSync(path.join(ROOT,name));return {path:name,bytes:b.length,sha256:sha(b)};};
const replace=(body,old,next)=>{assert.equal(body.split(old).length,2,'exact generator insertion');return body.replace(old,next);};
export function build(){
 const nativeBytes=fs.readFileSync(path.join(ROOT,NATIVE));assert.equal(sha(nativeBytes),SHA);
 const native=JSON.parse(nativeBytes);assert.equal(native.frameCount,299);
 const ids=[5,15];const ranges=Object.fromEntries(ids.map(id=>[id,native.nativeGroups.find(g=>g.characterId===id).completeInkIntervals.map(i=>[i.firstFrame,i.lastFrame])]));
 assert.deepEqual(ranges,{5:[[50,299]],15:[[295,299]]});
 for(const f of native.frames)assert.deepEqual(f.candidateSuppressibleSourceTextIds,ids.filter(id=>ranges[id].some(([a,b])=>f.frame>=a&&f.frame<=b)));
 const base=buildP025Canvas();assert.equal(sha(base.script),'22a432197944d782a5c4a93b6569d135ce1c15f4e520bb4be3b5d5ba4f8262d0');
 let runtime=base.script.toString();
 for(const id of ids)runtime=replace(runtime,`function text${id}(ctx,ctrans,frame,ratio,time){`,
  `function text${id}(ctx,ctrans,frame,ratio,time){\n    if (P025_SUPPRESS_TEXT_IDS && P025_SUPPRESS_TEXT_IDS.has(${id})) return;`);
 const state=`var P025_SUPPRESS_TEXT_IDS = null;
var P025_SUPPRESSION_RANGES = deepFreeze(${JSON.stringify(ranges)});
var P025_METADATA = deepFreeze(Object.assign({}, METADATA, {sourceGlyphRendering:{
 auditedStaticTextIds:[5,15],suppressTextIdsSupported:true,eligibleFrameRanges:P025_SUPPRESSION_RANGES,
 unownedSourceTextFallback:true,dynamicSuppressionSupported:false}}));
function resolveP025State(request){
 var state=resolveFrameState(request),requested=request.suppressTextIds===undefined?[]:request.suppressTextIds;
 if(!Array.isArray(requested))throw new Error('P025 suppression must be an array');
 var previous=0;
 requested.forEach(function(id){
  if(!Number.isSafeInteger(id)||id<=previous||!Object.prototype.hasOwnProperty.call(P025_SUPPRESSION_RANGES,id)||
   !P025_SUPPRESSION_RANGES[id].some(function(span){return state.localFrame>=span[0]&&state.localFrame<=span[1];}))
   throw new Error('P025 suppression outside source/native ownership');
  previous=id;
 });
 return Object.freeze(Object.assign({},state,{suppressedSourceTextIds:Object.freeze(requested.slice())}));
}
`;
 runtime=replace(runtime,'function render(targetCanvas, request) {',state+'\nfunction render(targetCanvas, request) {');
 runtime=replace(runtime,'var state = resolveFrameState(request);','var state = resolveP025State(request);');
 runtime=replace(runtime,'    try {\n        var ctrans = new cxform',
  '    var previousSuppression = P025_SUPPRESS_TEXT_IDS;\n    try {\n        P025_SUPPRESS_TEXT_IDS = new Set(state.suppressedSourceTextIds);\n        var ctrans = new cxform');
 runtime=replace(runtime,'        canvas = previousCanvas;\n    }',
  '        canvas = previousCanvas;\n        P025_SUPPRESS_TEXT_IDS = previousSuppression;\n    }');
 runtime=replace(runtime,'metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState, render: render',
  'metadata: P025_METADATA, ready: ready, resolveFrameState: resolveP025State, render: render');
 new Script(runtime);
 const bytes=Buffer.from(runtime),metadata={...JSON.parse(base.metadata),assetSha256:sha(bytes),
  sourceGlyphRendering:{definitions:8,preserved:true,suppressTextIdsSupported:true,
   auditedStaticTextIds:ids,eligibleFrameRanges:ranges,unownedSourceTextFallback:true,
   nativeBinding:'matching source-complete paragraph instances only'}};
 const manifest={schemaVersion:1,kind:'alg-l06-p025-maintained-native-canvas-v2',animationId:native.animationId,
  inputs:[pin('scripts/prepare-alg-l06-p025-canvas-v2.mjs'),pin('scripts/prepare-alg-l06-p025-canvas-v1.mjs'),pin(NATIVE),
   pin('output/alg-l06-p025-canvas-v1/canvas-manifest.json')],
  outputs:[{path:OUT+'/canvas-renderer.js',bytes:bytes.length,sha256:sha(bytes)}],
  suppression:metadata.sourceGlyphRendering,acceptanceEffects:{currentJsRegistered:false,originalRuntime:false,
   fidelity:false,listening:false,human:false,owner:false,strictComplete:false,publication:false}};
 return [[OUT+'/canvas-renderer.js',bytes],[OUT+'/canvas-metadata-v2.json',Buffer.from(JSON.stringify(metadata,null,2)+'\n')],
  [OUT+'/canvas-manifest-v2.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n')]];
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(['--write','--check'].includes(process.argv[2]));
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});const outputs=build();
 for(const [name,body] of outputs){const file=path.join(ROOT,name);
  if(process.argv[2]==='--check'||fs.existsSync(file))assert(fs.readFileSync(file).equals(body),name+' drift');
  else fs.writeFileSync(file,body,{flag:'wx'});
 }console.log(JSON.stringify({status:process.argv[2],outputs:outputs.map(([name,b])=>({path:name,bytes:b.length,sha256:sha(b)}))}));
}
