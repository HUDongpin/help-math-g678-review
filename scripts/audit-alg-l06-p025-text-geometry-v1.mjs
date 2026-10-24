#!/usr/bin/env node
/** Source-only P025 frame-resolved ink, mask, and glossary-hit geometry. No AVM/browser claims. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(REPO,'output/alg-l06-p025-text-geometry-v1');
const SWF='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB18.swf';
const XML=path.join(REPO,'output/alg-l06-p025-source-audit-v1/source.xml');
const SOURCE_AUDIT=path.join(REPO,'output/alg-l06-p025-source-audit-v1/source-audit-v1.json');
const PINS=new Map([
 [SWF,'dcb6b709d71eada47053b50bcfcc1161dec5d1717ebca6cbf8463eb6863dbde6'],
 [XML,'66675e3889f6eafa999778ed8c3cdffdf2b9944cb30d26ee34e6db388002314a'],
 [SOURCE_AUDIT,'7cf5100ab451b501b069b9d8e39e1758410a20e2febbb94d46f585bba50aa8fe']
]);
const ID=[1,0,0,1,0,0], STAGE={left:0,right:16000,top:0,bottom:12000};
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const fmt=x=>Number(x.toFixed(3));
const rounded=b=>Object.fromEntries(Object.entries(b).map(([k,v])=>[k,fmt(v)]));
const bytes=j=>Buffer.from(JSON.stringify(j,null,2)+'\n');
function readPinned(file){
 assert.equal(fs.realpathSync(file),file,`physical source ${file}`);
 const before=fs.statSync(file,{bigint:true}),b=fs.readFileSync(file),after=fs.statSync(file,{bigint:true});
 for(const k of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])assert.equal(before[k],after[k],`stable ${file}`);
 assert.equal(before.nlink,1n);assert.equal(sha(b),PINS.get(file),`SHA ${file}`);return b;
}
function shape(xml,id,tag='DefineShape'){
 const block=new RegExp(`<${tag} objectID="${id}">([\\s\\S]*?)<\\/${tag}>`,'u').exec(xml)?.[1];
 assert(block,`shape ${id}`);
 const a=/<Rectangle left="(-?\d+)" right="(-?\d+)" top="(-?\d+)" bottom="(-?\d+)"\/>/u.exec(block);
 assert(a);const [left,right,top,bottom]=a.slice(1).map(Number);
 return {id,bounds:{left,right,top,bottom},xmlDefinitionSha256:sha(Buffer.from(block)),block};
}
function rectangle(s){
 const edges=/<edges>([\s\S]*?)<\/edges>/u.exec(s.block)?.[1];
 assert(edges&&/<Solid>/u.test(s.block)&&!/<CurveTo/u.test(edges));
 const start=/<ShapeSetup x="(-?\d+)" y="(-?\d+)" fillStyle1="1"\/>/u.exec(edges);
 assert(start);let x=Number(start[1]),y=Number(start[2]);const pts=[[x,y]];
 for(const [,dx,dy] of edges.matchAll(/<LineTo x="(-?\d+)" y="(-?\d+)"\/>/gu)){x+=Number(dx);y+=Number(dy);pts.push([x,y]);}
 assert.equal(pts.length,5);assert.deepEqual(pts.at(-1),pts[0]);
 assert.deepEqual(new Set(pts.slice(0,4).map(p=>p.join(','))),new Set([
  [s.bounds.left,s.bounds.top],[s.bounds.left,s.bounds.bottom],
  [s.bounds.right,s.bounds.top],[s.bounds.right,s.bounds.bottom]].map(p=>p.join(','))));
 return {id:s.id,bounds:s.bounds,xmlDefinitionSha256:s.xmlDefinitionSha256,filledRectangle:true};
}
function fontInk(xml){
 const fonts=new Map();
 for(const [,id,body] of xml.matchAll(/<DefineFont2 objectID="(\d+)"[^>]*>([\s\S]*?)<\/DefineFont2>/gu)){
  const glyphs=new Map();let index=0;
  for(const [,code,glyph] of body.matchAll(/<Glyph map="(\d+)">([\s\S]*?)<\/Glyph>/gu)){
   let x=0,y=0,minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
   const visit=(X,Y)=>{minX=Math.min(minX,X);maxX=Math.max(maxX,X);minY=Math.min(minY,Y);maxY=Math.max(maxY,Y);};
   for(const [,kind,attrs] of glyph.matchAll(/<(ShapeSetup|LineTo|CurveTo)\b([^>]*)\/>/gu)){
    const a=Object.fromEntries([...attrs.matchAll(/(\w+)="(-?\d+)"/gu)].map(([,k,v])=>[k,Number(v)]));
    if(kind==='ShapeSetup'){if('x'in a)x=a.x;if('y'in a)y=a.y;if('x'in a||'y'in a)visit(x,y);}
    else if(kind==='LineTo'){x+=a.x;y+=a.y;visit(x,y);}
    else {const cx=x+a.x1,cy=y+a.y1;visit(cx,cy);x=cx+a.x2;y=cy+a.y2;visit(x,y);}
   }
   glyphs.set(index++,{code:Number(code),bounds:Number.isFinite(minX)?
    {left:minX,right:maxX,top:minY,bottom:maxY}:null});
  }
  fonts.set(Number(id),glyphs);
 }
 return fonts;
}
function hull(items){const v=items.filter(Boolean);return v.length?{left:Math.min(...v.map(b=>b.left)),
 right:Math.max(...v.map(b=>b.right)),top:Math.min(...v.map(b=>b.top)),bottom:Math.max(...v.map(b=>b.bottom))}:null;}
function ink(text,fonts){
 let x=0,y=0,font=null,height=null;const runs=[];
 for(const run of text.runs){
  if(run.changed.xOffset)x=run.xOffsetTwips;if(run.changed.yOffset)y=run.yOffsetTwips;
  if(run.changed.font){font=run.fontId;height=run.fontHeightTwips;}
  const glyphs=[];
  for(const g of run.glyphs){const source=fonts.get(font)?.get(g.index);
   assert(source&&source.code===g.code,`font ${font} glyph ${g.index}`);
   const b=source.bounds,scale=height/1024;
   glyphs.push(b?{left:x+b.left*scale,right:x+b.right*scale,top:y+b.top*scale,bottom:y+b.bottom*scale}:null);
   x+=g.advanceTwips;
  }
  runs.push({text:run.text,color:run.colorRgba,bounds:hull(glyphs)});
 }
 return {bounds:hull(runs.map(r=>r.bounds)),runs};
}
function mul(p,c){const [a,b,d,e,x,y]=p,[A,B,D,E,X,Y]=c;
 return [a*A+d*B,b*A+e*B,a*D+d*E,b*D+e*E,a*X+d*Y+x,b*X+e*Y+y];}
function box(bounds,m){const {left,right,top,bottom}=bounds;
 const p=[[left,top],[right,top],[right,bottom],[left,bottom]].map(([x,y])=>
  [m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
 return {left:Math.min(...p.map(v=>v[0])),right:Math.max(...p.map(v=>v[0])),
  top:Math.min(...p.map(v=>v[1])),bottom:Math.max(...p.map(v=>v[1]))};}
const intersect=(a,b)=>({left:Math.max(a.left,b.left),right:Math.min(a.right,b.right),
 top:Math.max(a.top,b.top),bottom:Math.min(a.bottom,b.bottom)});
const area=b=>Math.max(0,b.right-b.left)*Math.max(0,b.bottom-b.top);
const inside=(outer,inner)=>outer.left<=inner.left+0.5&&outer.right>=inner.right-0.5&&
 outer.top<=inner.top+0.5&&outer.bottom>=inner.bottom-0.5;
const alpha=c=>c?Math.min(1,Math.max(0,(255*c.multiply[3]/c.divisor+c.add[3])/255)):1;
function intervals(frames){const out=[];for(const f of frames){const last=out.at(-1);
 if(last&&last.lastFrame+1===f)last.lastFrame=f;else out.push({firstFrame:f,lastFrame:f});}return out;}
const FIRST=arr=>arr.length?arr[0]:null;

export function audit(){
 const swf=readPinned(SWF),xmlBytes=readPinned(XML),sourceAuditBytes=readPinned(SOURCE_AUDIT);
 const sourceAudit=JSON.parse(sourceAuditBytes);
 assert.equal(sourceAudit.animationId,'shared-alg001-l06-p025');
 const xml=xmlBytes.toString('utf8'),catalog=collectSwfTextSourceCatalog(swf);
 assert.deepEqual([catalog.header.frameRate,catalog.summary.staticTextDefinitions,
  catalog.summary.dynamicFields,catalog.summary.unparsedTags],[12,8,0,0]);
 const root=catalog.timelines.find(t=>t.timelineId==='root');
 const main=catalog.timelines.find(t=>t.timelineId==='sprite-21');
 assert(root&&main&&main.declaredFrameCount===299&&main.observedFrameCount===299);
 const rootMain=root.events.find(e=>e.kind==='place'&&e.frame===6&&e.characterId===21);
 assert(rootMain&&rootMain.depth===2&&rootMain.matrix);
 const mask=rectangle(shape(xml,2)),hit=rectangle(shape(xml,6));
 assert.deepEqual(mask.bounds,{left:-3269,right:3270,top:-331,bottom:330});
 assert.deepEqual(hit.bounds,{left:-1518,right:1517,top:-205,bottom:204});
 const maskEvents=main.events.filter(e=>e.kind==='place'&&e.clipDepth!==undefined);
 assert.deepEqual(maskEvents.map(e=>[e.frame,e.characterId,e.depth,e.clipDepth]),
  [[2,2,1,10],[52,2,11,16]]);
 const fonts=fontInk(xml);
 const texts=new Map(catalog.textDefinitions.map(t=>[t.characterId,t]));
 const textInk=new Map([...texts].map(([id,t])=>[id,ink(t,fonts)]));
 const buttons=new Map(catalog.buttonDefinitions.map(b=>[b.characterId,b]));
 assert.deepEqual([...buttons.keys()],[7,8,9,16]);
 for(const button of buttons.values()){
  assert.equal(button.statePlacements.length,1);
  assert.equal(button.statePlacements[0].characterId,6);
  assert(button.statePlacements[0].states.hitTest&&button.actions.bytes>0);
 }
 const sourceKeys=new Map([[7,'Independent variable'],[8,'Function'],
  [9,'Input variable'],[16,'Domain']]);
 for(const [id,key] of sourceKeys){
  const raw=path.join(REPO,`output/alg-l06-p025-source-audit-v1/source-export/scripts/DefineButton2_${id}/BUTTONCONDACTION on(release).as`);
  const text=fs.readFileSync(raw,'utf8');
  const pin=sourceAudit.artifacts.find(a=>a.path===path.relative(REPO,raw).replace('output/alg-l06-p025-source-audit-v1/',''));
  assert(pin&&pin.sha256===sha(Buffer.from(text)));
  assert(text.includes(`_global.KeyAttribute = "${key}";`));
 }
 const active=new Map(),events=new Map(),frames=[];
 for(const e of main.events){const group=events.get(e.frame)??[];group.push(e);events.set(e.frame,group);}
 for(let frame=1;frame<=299;frame++){
  for(const e of events.get(frame)??[]){
   if(e.kind==='remove'){active.delete(e.depth);continue;}
   if(e.kind!=='place')continue;
   const prior=active.get(e.depth);
   if(e.move){assert(prior,`move ${frame}/${e.depth}`);
    active.set(e.depth,{...prior,instanceId:e.instanceId,
     characterId:e.characterId??prior.characterId,
     matrix:e.matrix??prior.matrix,
     colorTransform:e.colorTransform??prior.colorTransform,
     clipDepth:e.clipDepth??prior.clipDepth,
     sourceTagSha256:e.sourceTagSha256});}
   else active.set(e.depth,{instanceId:e.instanceId,characterId:e.characterId,
    depth:e.depth,matrix:e.matrix??ID,colorTransform:e.colorTransform??null,
    clipDepth:e.clipDepth??null,sourceTagSha256:e.sourceTagSha256});
  }
  const masks=[...active.values()].filter(x=>x.clipDepth!==null).map(x=>({
   characterId:x.characterId,depth:x.depth,clipDepth:x.clipDepth,
   bounds:box(mask.bounds,mul(rootMain.matrix,x.matrix)),matrix:x.matrix}));
  const rows=[];
  for(const item of [...active.values()].sort((a,b)=>a.depth-b.depth)){
   const t=texts.get(item.characterId),button=buttons.get(item.characterId);
   if(!t&&!button)continue;
   const parent=mul(rootMain.matrix,item.matrix);
   const applicable=masks.filter(m=>m.depth<item.depth&&item.depth<=m.clipDepth);
   const clip=applicable.reduce((value,m)=>intersect(value,m.bounds),STAGE);
   const effectiveAlpha=alpha(item.colorTransform);
   const geom=button?hit.bounds:t.boundsTwips;
   const bounds=box(geom,button?mul(parent,button.statePlacements[0].matrix):parent);
   const sourceInk=t?textInk.get(item.characterId):null;
   const textMatrix=t?mul(parent,t.matrix):null;
   const inkBounds=sourceInk?.bounds?box(sourceInk.bounds,textMatrix):null;
   const runs=sourceInk?.runs.map((run,index)=>{
    const bounds=run.bounds?box(run.bounds,textMatrix):null;
    return {index,text:run.text,color:run.color,bounds:bounds?rounded(bounds):null,
     complete:!!(bounds&&effectiveAlpha>=1-1e-9&&inside(clip,bounds))};
   })??null;
   rows.push({instanceId:item.instanceId,characterId:item.characterId,depth:item.depth,
    role:button?'glossary-hit':'static-text',text:t?.runs.map(r=>r.text).join('')??null,
    alpha:fmt(effectiveAlpha),sourceMatrix:item.matrix,
    compositeMatrix:button?mul(parent,button.statePlacements[0].matrix):
     t?mul(parent,t.matrix):parent,
    bounds:rounded(bounds),inkBounds:inkBounds?rounded(inkBounds):null,
    completeInk:!!(inkBounds&&effectiveAlpha>=1-1e-9&&inside(clip,inkBounds)),
    completeHit:!!(button&&effectiveAlpha>=1-1e-9&&inside(clip,bounds)),
    hitVisibleRatio:button?fmt(area(intersect(bounds,clip))/area(bounds)):null,
    masks:applicable.map(m=>({characterId:m.characterId,depth:m.depth,
     clipDepth:m.clipDepth,bounds:rounded(m.bounds)})),
    runs,sourceTagSha256:item.sourceTagSha256});
  }
  frames.push({frame,rows});
 }
 const row=(frame,characterId,depth)=>frames[frame-1].rows.find(r=>
  r.characterId===characterId&&r.depth===depth);
 const glossary=[
  {key:'Independent variable',buttonId:7,buttonDepth:4,textId:5,textDepth:3,runIndex:1},
  {key:'Function',buttonId:8,buttonDepth:6,textId:5,textDepth:3,runIndex:5},
  {key:'Input variable',buttonId:9,buttonDepth:8,textId:5,textDepth:3,runIndex:3},
  {key:'Domain',buttonId:16,buttonDepth:14,textId:15,textDepth:13,runIndex:1},
 ].map(binding=>{
  const samples=[];
  for(let frame=1;frame<=299;frame++){
   const button=row(frame,binding.buttonId,binding.buttonDepth),
    label=row(frame,binding.textId,binding.textDepth),run=label?.runs?.[binding.runIndex];
   if(!button||!label||!run)continue;
   assert.deepEqual(run.color,[0,0,204,255],`${binding.key} source blue run`);
   const overlap=run.bounds?area(intersect(button.bounds,run.bounds))/area(run.bounds):0;
   samples.push({frame,buttonInstanceId:button.instanceId,
    labelInstanceId:label.instanceId,buttonFullHit:button.completeHit,
    buttonHitVisibleRatio:button.hitVisibleRatio,blueRunComplete:run.complete,
    blueRunBounds:run.bounds,overlapRatio:fmt(overlap),
    sourceReady:button.completeHit&&run.complete&&overlap>=0.95});
  }
  const ready=samples.filter(s=>s.sourceReady).map(s=>s.frame);
  const buttonFrames=frames.filter(f=>f.rows.some(r=>r.characterId===binding.buttonId&&
   r.depth===binding.buttonDepth)).map(f=>f.frame);
  return {...binding,firstButtonPlacementFrame:buttonFrames[0]??null,
   firstFullHitFrame:samples.find(s=>s.buttonFullHit)?.frame??null,
   firstFullBlueRunFrame:samples.find(s=>s.blueRunComplete)?.frame??null,
   firstSourceReadyFrame:ready[0]??null,sourceReadyIntervals:intervals(ready),
   firstReadySample:samples.find(s=>s.sourceReady)??null,
   placementSample:samples.find(s=>s.frame===buttonFrames[0])??null,
   boundarySamples:[2,3,13,14,24,25,34,35,44,45,49,50,51,52,53,54,55,70,108,135,193,293,294,299]
    .map(frame=>samples.find(s=>s.frame===frame)).filter(Boolean)};
 });
 const staticInstances=catalog.timelines.find(t=>t.timelineId==='sprite-21').instances
  .filter(i=>texts.has(i.characterId)).map(instance=>{
   const complete=frames.filter(f=>f.rows.some(r=>r.instanceId===instance.instanceId&&
    r.completeInk)).map(f=>f.frame);
   return {instanceId:instance.instanceId,characterId:instance.characterId,
    text:texts.get(instance.characterId).runs.map(r=>r.text).join(''),
    placementFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive,
    firstCompleteInkFrame:complete[0]??null,completeInkIntervals:intervals(complete)};
  });
 const groups=[
  {name:'primary-definition',characterId:5,depth:3},
  {name:'domain-definition',characterId:15,depth:13},
 ].map(group=>{
  const full=frames.filter(f=>f.rows.some(r=>r.characterId===group.characterId&&
   r.depth===group.depth&&r.completeInk)).map(f=>f.frame);
  const first=row(full[0]??1,group.characterId,group.depth);
  return {...group,text:texts.get(group.characterId).runs.map(r=>r.text).join(''),
   firstCompleteInkFrame:full[0]??null,completeInkIntervals:intervals(full),
   firstCompleteSample:first??null};
 });
 const output={schemaVersion:1,kind:'alg-l06-p025-source-text-geometry-v1',
  source:{path:SWF,bytes:swf.length,sha256:sha(swf)},
  pins:{sourceXml:{path:path.relative(REPO,XML),bytes:xmlBytes.length,sha256:sha(xmlBytes)},
   sourceAudit:{path:path.relative(REPO,SOURCE_AUDIT),bytes:sourceAuditBytes.length,
    sha256:sha(sourceAuditBytes)},
   parser:{path:'scripts/lib/swf-text-source-catalog.mjs',
    sha256:sha(fs.readFileSync(path.join(REPO,'scripts/lib/swf-text-source-catalog.mjs')))}},
  method:'Per-frame PlaceObject2 depth state; root × main placement × TextMatrix or button hit matrix; source font glyph conservative Bézier control hull; exact rectangular source masks, stage clip and alpha; blue run complete + full hit + >=0.95 ink overlap. Static SWF geometry only.',
  rootPlacement:{frame:rootMain.frame,depth:rootMain.depth,matrix:rootMain.matrix,
   sourceTagSha256:rootMain.sourceTagSha256},
  shapes:{mask:{...mask,sourceTagSha256:catalog.shapeDefinitions.find(s=>s.characterId===2).sourceTagSha256},
   hit:{...hit,sourceTagSha256:catalog.shapeDefinitions.find(s=>s.characterId===6).sourceTagSha256}},
  masks:maskEvents.map(e=>({frame:e.frame,depth:e.depth,clipDepth:e.clipDepth,
   characterId:e.characterId,matrix:e.matrix,sourceTagSha256:e.sourceTagSha256})),
  textDefinitions:catalog.textDefinitions.map(t=>({characterId:t.characterId,
   text:t.runs?.map(r=>r.text).join('')??null,runs:t.runs?.map(r=>({text:r.text,color:r.colorRgba}))})),
  nativeGroups:groups,staticInstances,glossary,
  frameSamples:[1,2,3,13,14,24,25,34,35,44,45,49,50,51,52,53,54,55,70,108,135,193,293,294,299]
   .map(frame=>({frame,rows:frames[frame-1].rows})),
  limitations:{sourceGeometryCandidateOnly:true,conservativeGlyphControlHullNotPixels:true,
   maskedShapeFillNotPixelContainmentProof:true,sourceLabelReadinessNotOriginalClickTrace:true,
   originalRuntimeObserved:false,browserVisualObserved:false,
   sourceAudioTimingNotRetested:true,productAvailabilityUnchanged:true}};
 return new Map([['text-geometry-v1.json',bytes(output)],
  ['frame-states-v1.json',bytes({schemaVersion:1,sourceSwfSha256:sha(swf),
   frameDomain:'sprite-21',frames})]]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert(['--build','--check'].includes(mode)&&process.argv.length===3);
 const outputs=audit();if(mode==='--build')fs.mkdirSync(OUT,{recursive:true});
 for(const [name,b] of outputs){const target=path.join(OUT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(b),`drift ${name}`);
  else fs.writeFileSync(target,b);}
 console.log(JSON.stringify({status:mode==='--check'?'verified':'built',
  files:[...outputs].map(([name,b])=>({name,bytes:b.length,sha256:sha(b)}))}));
}
