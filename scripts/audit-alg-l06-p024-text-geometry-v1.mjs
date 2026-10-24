#!/usr/bin/env node
/** Source-only P024 glyph, table, mask, and glossary-hit geometry. No AVM/browser claims. */
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const REPO=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT=path.join(REPO,'output/alg-l06-p024-text-geometry-v1');
const SWF='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/VB/L6VB17.swf';
const XML=path.join(REPO,'output/alg-l06-p024-intake-recon-v1/source.xml');
const INTAKE=path.join(REPO,'output/alg-l06-p024-intake-recon-v1/intake-recon-v1.json');
const BEHAVIOR=path.join(REPO,'output/alg-l06-p024-behavior-audit-v1/behavior-audit-v1.json');
const NATIVE=path.join(REPO,'output/alg-l06-p024-native-text-v1/text-state-source-v1.json');
const PINS=new Map([
 [SWF,'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05'],
 [XML,'b675b6466ca678e1ab3d7693ce2c60c91e1939d1f802075d9b41a5a198c6d013'],
 [INTAKE,'37db86c5cff44619f5a5e8f681a24dc55040447d0ec51127b92af071a8df4882'],
 [BEHAVIOR,'ea5f12623231299c2c8b310db63732e86a3eae88037b0467db624c9925fd49f8'],
 [NATIVE,'fe27c245d012df7740daf26fec68a53d84bd1bf8bba55635aa80233699146796']
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
 const swf=readPinned(SWF),xmlBytes=readPinned(XML),intake=readPinned(INTAKE),behavior=readPinned(BEHAVIOR),native=readPinned(NATIVE);
 const xml=xmlBytes.toString('utf8'),catalog=collectSwfTextSourceCatalog(swf);
 assert.deepEqual([catalog.header.frameRate,catalog.summary.staticTextDefinitions,catalog.summary.dynamicFields,catalog.summary.unparsedTags],[12,40,3,0]);
 const main=catalog.timelines.find(t=>t.timelineId==='sprite-208'),root=catalog.timelines.find(t=>t.timelineId==='root');
 assert(main&&root&&main.declaredFrameCount===381&&main.observedFrameCount===381);
 const rootMain=root.events.find(e=>e.kind==='place'&&e.frame===6&&e.characterId===208);
 assert(rootMain&&rootMain.depth===3);
 const mask=rectangle(shape(xml,35)),hit=rectangle(shape(xml,6)),outline=shape(xml,11,'DefineShape2');
 assert.deepEqual(mask.bounds,{left:-3269,right:3270,top:-331,bottom:330});
 const maskEvents=main.events.filter(e=>e.kind==='place'&&e.clipDepth!==undefined);
 assert.deepEqual(maskEvents.map(e=>[e.frame,e.characterId,e.depth,e.clipDepth]),[[67,35,11,18],[124,35,19,24]]);
 const textDefs=new Map(catalog.textDefinitions.filter(t=>t.runs).map(t=>[t.characterId,t]));
 const fonts=fontInk(xml);
 const inkDefs=new Map([...textDefs].map(([id,t])=>[id,ink(t,fonts)]));
 const buttons=new Map(catalog.buttonDefinitions.filter(b=>[7,8,9,10,38].includes(b.characterId)).map(b=>[b.characterId,b]));
 assert.equal(buttons.size,5);for(const b of buttons.values()){
  assert.equal(b.statePlacements.length,1);assert.equal(b.statePlacements[0].characterId,6);
  assert(b.statePlacements[0].states.hitTest&&b.actions.bytes>0);
 }
 const active=new Map(),events=new Map(),frames=[];
 for(const e of main.events){const list=events.get(e.frame)??[];list.push(e);events.set(e.frame,list);}
 for(let frame=1;frame<=381;frame++){
  for(const e of events.get(frame)??[]){
   if(e.kind==='remove'){active.delete(e.depth);continue;}if(e.kind!=='place')continue;
   const prior=active.get(e.depth);
   if(e.move){assert(prior,`move ${frame}/${e.depth}`);active.set(e.depth,{...prior,
    instanceId:e.instanceId,characterId:e.characterId??prior.characterId,
    matrix:e.matrix??prior.matrix,colorTransform:e.colorTransform??prior.colorTransform,
    clipDepth:e.clipDepth??prior.clipDepth,sourceTagSha256:e.sourceTagSha256});}
   else active.set(e.depth,{instanceId:e.instanceId,characterId:e.characterId,depth:e.depth,
    matrix:e.matrix??ID,colorTransform:e.colorTransform??null,clipDepth:e.clipDepth??null,
    sourceTagSha256:e.sourceTagSha256});
  }
  const masks=[...active.values()].filter(x=>x.clipDepth!==null).map(x=>({id:x.characterId,
   depth:x.depth,clipDepth:x.clipDepth,bounds:box(mask.bounds,mul(rootMain.matrix,x.matrix)),matrix:x.matrix}));
  const rows=[];
  for(const item of [...active.values()].sort((a,b)=>a.depth-b.depth)){
   const t=textDefs.get(item.characterId),b=buttons.get(item.characterId);
   if(!t&&!b&&item.characterId!==11)continue;
   const parent=mul(rootMain.matrix,item.matrix),applicable=masks.filter(m=>m.depth<item.depth&&item.depth<=m.clipDepth);
   const clip=applicable.reduce((v,m)=>intersect(v,m.bounds),STAGE),effectiveAlpha=alpha(item.colorTransform);
   const geom=b?hit.bounds:item.characterId===11?outline.bounds:t.boundsTwips;
   const bounds=box(geom,b?mul(parent,b.statePlacements[0].matrix):parent);
   const sourceInk=t?inkDefs.get(item.characterId):null;
   const inkMatrix=t?mul(parent,t.matrix):null;
   const inkBounds=sourceInk?.bounds?box(sourceInk.bounds,inkMatrix):null;
   const runs=sourceInk?.runs.map(run=>({text:run.text,color:run.color,
    bounds:run.bounds?box(run.bounds,inkMatrix):null,
    full:!!(run.bounds&&effectiveAlpha>=1-1e-9&&inside(clip,box(run.bounds,inkMatrix)))}));
   rows.push({id:item.instanceId,characterId:item.characterId,depth:item.depth,
    role:b?'glossary-hit':item.characterId===11?'table-outline':'text',
    text:t?.runs.map(r=>r.text).join('')??null,alpha:fmt(effectiveAlpha),
    bounds:rounded(bounds),inkBounds:inkBounds?rounded(inkBounds):null,
    completeInk:!!(inkBounds&&effectiveAlpha>=1-1e-9&&inside(clip,inkBounds)),
    completeHit:!!(b&&effectiveAlpha>=1-1e-9&&inside(clip,bounds)),
    hitVisibleRatio:b?fmt(area(intersect(bounds,clip))/area(bounds)):null,
    completeBounds:effectiveAlpha>=1-1e-9&&inside(clip,bounds),
    masks:applicable.map(m=>({id:m.id,depth:m.depth,clipDepth:m.clipDepth,bounds:rounded(m.bounds)})),
    runs,sourceTagSha256:item.sourceTagSha256});
  }
  frames.push({frame,rows});
 }
 const at=(frame,depth)=>frames[frame-1].rows.find(r=>r.depth===depth);
 const ready=(key,buttonDepth,labelDepth,runText)=>{
  const samples=[];
  for(const {frame,rows} of frames){const b=rows.find(r=>r.depth===buttonDepth),l=rows.find(r=>r.depth===labelDepth);
   const run=l?.runs?.find(r=>r.text===runText&&JSON.stringify(r.color)==='[0,0,204,255]');
   if(!b||!l||!run)continue;
   const overlap=run.bounds?area(intersect(b.bounds,run.bounds))/area(run.bounds):0;
   samples.push({frame,buttonId:b.id,labelId:l.id,buttonHitRatio:b.hitVisibleRatio,
    buttonFullHit:b.completeHit,
    labelFull:run.full,blueInkBounds:run.bounds?rounded(run.bounds):null,
    overlapRatio:fmt(overlap),sourceReady:b.completeHit&&run.full&&overlap>=0.95});
  }
  const sourceReady=samples.filter(s=>s.sourceReady).map(s=>s.frame);
  return {key,buttonDepth,labelDepth,runText,firstPlacementFrame:FIRST(samples.map(s=>s.frame)),
   firstFullHitFrame:FIRST(samples.filter(s=>s.buttonFullHit).map(s=>s.frame)),
   firstFullBlueInkFrame:FIRST(samples.filter(s=>s.labelFull).map(s=>s.frame)),
   firstSourceReadyFrame:FIRST(sourceReady),sourceReadyIntervals:intervals(sourceReady),
   firstSourceReadySample:samples.find(s=>s.sourceReady)??null,
   placementSample:samples[0],frameSamples:[2,3,6,7,8,67,68,79,80,100,124,130,141,142,154,381].map(f=>samples.find(s=>s.frame===f)).filter(Boolean)};
 };
 const glossary=[ready('Range',3,2,'range'),ready('Function',5,2,'function'),
  ready('Output',7,2,'outputs'),ready('Set',9,2,'set'),ready('Function table',14,13,'function table'),
  ready('Function in table paragraph',16,13,'function'),ready('Range in question',22,21,'range ')];
 const tableDepths=[27,28,29,30,31,32,33,34],tableTexts=['Input','Output','1','10','100','–1','0','1'];
 function table(frame){const rows=tableDepths.map(d=>at(frame,d)),border=at(frame,26);
  if(!rows.every((r,i)=>r?.text===tableTexts[i]&&r.completeInk)||!border?.completeBounds)return null;
  const [input,output,...numbers]=rows,[a,b,c,d,e,f]=numbers;
  const pair=(x,y)=>x.inkBounds.right<y.inkBounds.left&&
   Math.min(x.inkBounds.bottom,y.inkBounds.bottom)>Math.max(x.inkBounds.top,y.inkBounds.top);
  const vertical=x=>x.every((r,i)=>i===0||x[i-1].inkBounds.bottom<r.inkBounds.top);
  if(!(pair(input,output)&&pair(a,d)&&pair(b,e)&&pair(c,f)&&
   vertical([input,a,b,c])&&vertical([output,d,e,f])&&
   rows.every(r=>inside(border.bounds,r.inkBounds))))return null;
  return {frame,outlineBounds:border.bounds,rows:rows.map(r=>({depth:r.depth,text:r.text,inkBounds:r.inkBounds}))};
 }
 const tableFrames=frames.map(({frame})=>table(frame)).filter(Boolean);
 const paragraphFrames=frames.filter(({frame})=>at(frame,13)?.characterId===37&&at(frame,13).completeInk).map(x=>x.frame);
 const questionFrames=frames.filter(({frame})=>at(frame,21)?.characterId===41&&at(frame,21).completeInk).map(x=>x.frame);
 const source={schemaVersion:1,kind:'alg-l06-p024-native-text-geometry-v1',
  source:{path:SWF,bytes:swf.length,sha256:sha(swf)},
  pins:{xml:{path:path.relative(REPO,XML),sha256:sha(xmlBytes)},
   intake:{path:path.relative(REPO,INTAKE),sha256:sha(intake)},
   behavior:{path:path.relative(REPO,BEHAVIOR),sha256:sha(behavior)},
   native:{path:path.relative(REPO,NATIVE),sha256:sha(native)},
   parser:{path:'scripts/lib/swf-text-source-catalog.mjs',sha256:sha(fs.readFileSync(path.join(REPO,'scripts/lib/swf-text-source-catalog.mjs')))}},
  method:'Per-frame PlaceObject2 depth state, root×main×TextMatrix embedded-font conservative Bézier control hull, exact solid-rectangle mask and hit shapes, stage clip, source alpha, full label ink plus full hit and >=0.95 overlap. Static SWF geometry only.',
  rootPlacement:{frame:rootMain.frame,depth:rootMain.depth,matrix:rootMain.matrix,sourceTagSha256:rootMain.sourceTagSha256},
  shapes:{mask:{...mask,sourceTagSha256:catalog.shapeDefinitions.find(s=>s.characterId===35).sourceTagSha256},
   hit:{...hit,sourceTagSha256:catalog.shapeDefinitions.find(s=>s.characterId===6).sourceTagSha256},
   tableOutline:{id:11,bounds:outline.bounds,xmlDefinitionSha256:outline.xmlDefinitionSha256,
    sourceTagSha256:catalog.shapeDefinitions.find(s=>s.characterId===11).sourceTagSha256,
    geometry:'source filled two-column, three-row Shape2 with stroke; static bounding envelope'}},
  masks:maskEvents.map(e=>({frame:e.frame,depth:e.depth,clipDepth:e.clipDepth,
   characterId:e.characterId,matrix:e.matrix,sourceTagSha256:e.sourceTagSha256})),
  glossary,table:{firstCompleteGeometryFrame:tableFrames[0]?.frame??null,
   completeGeometryIntervals:intervals(tableFrames.map(x=>x.frame)),firstCompleteSnapshot:tableFrames[0]??null,
   evidenceRule:'source depths 26–34; all eight full-ink texts inside full-alpha Shape2 outline; left/right x pairing and successive non-overlapping rows'},
  tableParagraph:{text:'This function table shows every input and output for a function. ',depth:13,
   firstCompleteInkFrame:paragraphFrames[0]??null,completeInkIntervals:intervals(paragraphFrames)},
  question:{text:'What is the range of the function? ',depth:21,
   firstCompleteInkFrame:questionFrames[0]??null,completeInkIntervals:intervals(questionFrames),
   maskFrames:[124,125,130,140,153,154].map(frame=>({frame,
    question:at(frame,21),mask:at(frame,21)?.masks}))},
  sourceFrameSamples:[2,7,67,68,79,80,100,109,123,124,130,134,140,141,142,153,154,208,381].map(frame=>({frame,
   rows:frames[frame-1].rows.filter(r=>[11,13,14,19,21,22,26,27,28,29,30,31,32,33,34].includes(r.depth))})),
  limits:{sourceGeometryCandidateOnly:true,inkHullNotRenderedPixels:true,tableOutlineBoundsNotRenderedPathProof:true,
   avmClickNotObserved:true,originalRuntimeNotObserved:true,browserVisualNotObserved:true,
   feedbackDomainsNotAuditedHere:true,productAvailabilityNotChanged:true}};
 return new Map([['text-geometry-v1.json',bytes(source)]]);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const mode=process.argv[2];assert(['--build','--check'].includes(mode)&&process.argv.length===3);
 const outputs=audit();if(mode==='--build')fs.mkdirSync(OUT,{recursive:true});
 for(const [name,b] of outputs){const target=path.join(OUT,name);
  if(mode==='--check')assert(fs.readFileSync(target).equals(b),`drift ${name}`);
  else fs.writeFileSync(target,b);}
 console.log(JSON.stringify({status:mode==='--check'?'verified':'built',files:[...outputs].map(([name,b])=>({name,bytes:b.length,sha256:sha(b)}))}));
}
