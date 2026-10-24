import assert from 'node:assert/strict';
import{readFileSync,writeFileSync,mkdirSync}from'node:fs';
import{createHash}from'node:crypto';
import{execFileSync}from'node:child_process';
import{fileURLToPath}from'node:url';import path from'node:path';import{Script}from'node:vm';
import{buildSafeRuntime,validateAdapterAuditEvidence}from'../../../scripts/build-safe-ffdec-canvas-adapter.mjs';
import{normalizeSourceClipMasks}from'../../../scripts/lib/g678-source-clip-masks-v1.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..'),BASE=path.join(ROOT,'migrations/shared-alg001-l07-p002'),check=process.argv.includes('--check');
const sha=b=>createHash('sha256').update(b).digest('hex');
const pin=(p,h)=>{const b=readFileSync(path.join(ROOT,p));assert.equal(sha(b),h,p);return b;};
execFileSync('python3',[path.join(BASE,'generator-v1/derive-source-v1.py'),'--check'],{stdio:'pipe'});
execFileSync('python3',[path.join(BASE,'generator-v1/derive-canvas-spec-v1.py'),'--check'],{stdio:'pipe'});
const spec=JSON.parse(readFileSync(path.join(BASE,'canvas-v1/canvas-adapter-spec-v3.json')));
const scenario=JSON.parse(pin(spec.evidence.scenarioInventory,spec.evidence.scenarioInventorySha256));
const audio=JSON.parse(pin(spec.evidence.audioAudit,spec.evidence.audioAuditSha256));
validateAdapterAuditEvidence(spec,scenario,audio);
const {runtime,metadata}=buildSafeRuntime({helperSource:pin(spec.ffdecExport.helper,spec.ffdecExport.helperSha256).toString(),framesHtml:pin(spec.ffdecExport.framesHtml,spec.ffdecExport.framesHtmlSha256).toString(),spec});
const xml=readFileSync(path.join(BASE,'source-v1/movie.xml'),'utf8');
let successor=normalizeSourceClipMasks(runtime,[{characterId:1,placements:[{depth:1,clipDepth:131}],rawFill:'ctx.fillStyle=tocolor(ctrans.apply([0,102,255,0.2509804]));'}],xml);
const shift=`ctx.transform(1, 0, 0, 1, ${spec.timeline.stageRenderOffset.x}, ${spec.timeline.stageRenderOffset.y});`;
assert.equal(successor.split(shift).length,2,'one main native translation');
const scale=.9793701171875;successor=successor.replace(shift,`ctx.transform(${scale}, 0, 0, ${scale}, ${407.45*(1-scale)}, ${281.5*(1-scale)});\n        ${shift}`);
const rootHtml=readFileSync(path.join(BASE,'source-v1/canvas-export/frames/frames.html'),'utf8').replaceAll('\r\n','\n');
const start=rootHtml.indexOf('function shape456(ctx,ctrans,frame,ratio,time){'),end=rootHtml.indexOf('\n}',start)+2;assert(start>0&&end>start,'root border definition');
const border=rootHtml.slice(start,end);assert(!/image|document|eval|Function|http:|https:/u.test(border)&&border.includes('ctx.fillStyle=tocolor(ctrans.apply([54,107,231,1]));'),'exact source simple solid root border');
assert(!successor.includes('function shape456('),'border absent from main child export');
successor=successor.replace('SAFE_OBJECTS = Object.freeze({',border+'\n\nSAFE_OBJECTS = Object.freeze({');
const marker='    if (typeof targetCanvas.setAttribute === "function") {';assert.equal(successor.split(marker).length,2);
successor=successor.replace(marker,'    ctx.save();\n    ctx.transform(0.05,0,0,0.05,0,0);\n    shape456(ctx,new cxform(0,0,0,0,255,255,255,255),0,0,0);\n    ctx.restore();\n'+marker);
new Script(successor);
const output='migrations/shared-alg001-l07-p002/canvas-v1/canvas-renderer.js';
const manifest={schemaVersion:1,kind:'alg-l07-p002-root-composite-source-canvas-v1',animationId:spec.animationId,sourceSwfSha256:spec.source.swfSha256,
 renderer:{path:output,bytes:Buffer.byteLength(successor),sha256:sha(successor)},baseRuntimeSha256:sha(runtime),metadata,
 sourceMainRootMatrix:{scaleX:scale,scaleY:scale,x:407.45,y:281.5},rootLayers:{main452:'source Canvas including source nested artwork',offstage453:'not student-visible; its exact decoded string supplies native title',title455:'outlined title454 replaced by source-bound native title',border456:{sourceFunctionSha256:sha(border),retained:true}},
 maskNormalization:{characterId:1,sourceAlpha:64,placements:[{depth:1,clipDepth:131}],method:'scripts/lib/g678-source-clip-masks-v1.mjs exact opaque geometry stencil'},
 sourceGlyphPolicy:'Source Canvas glyphs preserved; Canvas is aria-hidden in native presentation to avoid duplicate screen-reader text.',
 audioRendered:false,originalRuntimeAccepted:false,fidelityAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
for(const [p,b]of[[output,successor],['migrations/shared-alg001-l07-p002/canvas-v1/canvas-manifest-v1.json',JSON.stringify(manifest,null,2)+'\n']]){
 const full=path.join(ROOT,p);if(check)assert.equal(readFileSync(full,'utf8'),b,p);else writeFileSync(full,b,{flag:'wx'});
}
console.log(JSON.stringify({pass:true,renderer:manifest.renderer,maskNormalization:manifest.maskNormalization,acceptance:false}));
