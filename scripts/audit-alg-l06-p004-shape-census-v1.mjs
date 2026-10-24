/** P004 source-locked shape census and isolated safe-Canvas review captures.
 * Run: node scripts/audit-alg-l06-p004-shape-census-v1.mjs --plan|--capture|--check
 * Structural classes only. No SWF execution, teaching-role decision or acceptance.
 */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import zlib from 'node:zlib';
import {chromium} from 'playwright';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT='output/alg-l06-p004-shape-census-v1';
const SOURCE='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/ALG001/L6/RW/L6RW04.swf';
const CATALOG='migrations/shared-alg001-l06-p004/audit/source-text-v1.json';
const CANVAS='output/alg-l06-p004-canvas-candidate-v1/canvas-renderer.js';
const FFDEC='migrations/shared-alg001-l06-p004/audit/ffdec-26.2.1-canvas-v1/frames/frames.html';
const EXPECTED=new Map([
 [SOURCE,'514867e794dbc86059a452c5f1091cabfabf73e6f7918d0d28d9cf7ee604573e'],
 [CATALOG,'c6f15d46da49019e359a44f407cb0577f7cfb6a7a0c1b68ab06d43084aa3adc6'],
 [CANVAS,'6b6f124262c8b90517151ea77eee43a30843c170211d4cd76404e584c876c2d8'],
 [FFDEC,'43c29757f738bf0d11e44263f7eb25caacaca5036898a59be2d48ec2e26ad7d6'],
]);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const file=p=>path.isAbsolute(p)?p:path.join(ROOT,p);
function pin(p){const bytes=fs.readFileSync(file(p));return {path:p,bytes:bytes.length,sha256:sha(bytes)};}
function exact(p,bytes){const target=file(p);fs.mkdirSync(path.dirname(target),{recursive:true});
 if(fs.existsSync(target))assert.deepEqual(fs.readFileSync(target),bytes,`immutable output: ${p}`);
 else fs.writeFileSync(target,bytes,{flag:'wx'});return pin(p);}
function json(p,value){return exact(p,Buffer.from(JSON.stringify(value,null,2)+'\n'));}

function rect(payload,byteOffset){let bit=byteOffset*8;
 const read=n=>{let value=0;for(let i=0;i<n;i++){
  value=value*2+((payload[bit>>3]>>(7-(bit&7)))&1);bit++;
 }return value;};
 const width=read(5);assert(width>=1&&width<=31,`shape RECT width ${width}`);
 const signed=()=>{const value=read(width);return value>=2**(width-1)?value-2**width:value;};
 const [left,right,top,bottom]=[signed(),signed(),signed(),signed()];
 assert(left<=right&&top<=bottom,'ordered source RECT');
 return {boundsTwips:{left,right,top,bottom},nextByte:Math.ceil(bit/8)};
}
function union(a,b){return {left:Math.min(a.left,b.left),right:Math.max(a.right,b.right),
 top:Math.min(a.top,b.top),bottom:Math.max(a.bottom,b.bottom)};}

function census(){const sourceBytes=fs.readFileSync(SOURCE),catalogBytes=fs.readFileSync(file(CATALOG)),
  canvasBytes=fs.readFileSync(file(CANVAS)),ffdecBytes=fs.readFileSync(file(FFDEC));
 const pins=[SOURCE,CATALOG,CANVAS,FFDEC].map(pin);
 for(const item of pins)assert.equal(item.sha256,EXPECTED.get(item.path),`source drift: ${item.path}`);
 const catalog=JSON.parse(catalogBytes.toString());
 assert.equal(catalog.sourceSha256,pins[0].sha256);
 assert.deepEqual(collectSwfTextSourceCatalog(sourceBytes),catalog,'current SWF structural decode');
 assert.equal(catalog.shapeDefinitions.length,49,'exact P004 source shape count');
 assert.equal(sourceBytes.toString('ascii',0,3),'CWS');
 const uncompressed=Buffer.concat([sourceBytes.subarray(0,8),zlib.inflateSync(sourceBytes.subarray(8))]);
 assert.equal(uncompressed.length,sourceBytes.readUInt32LE(4),'declared uncompressed SWF length');
 const rows=catalog.shapeDefinitions.map(definition=>{
  const offset=definition.sourceTagOffset,header=uncompressed.readUInt16LE(offset),code=header>>6;
  const long=(header&63)===63,headerBytes=long?6:2;
  const length=long?uncompressed.readUInt32LE(offset+2):header&63;
  const payload=uncompressed.subarray(offset+headerBytes,offset+headerBytes+length);
  assert.equal(payload.length,length,`complete shape tag ${definition.characterId}`);
  assert.equal(payload.readUInt16LE(0),definition.characterId,'exact shape ID at source tag');
  assert.equal(code,definition.tagName==='Tag46'?46:
   ({DefineShape:2,DefineShape2:22,DefineShape3:32})[definition.tagName],
   `exact source tag code ${definition.characterId}`);
  const tagHash=sha(Buffer.concat([Buffer.from([code&255,code>>8]),payload]));
  assert.equal(tagHash,definition.sourceTagSha256,`exact source tag hash ${definition.characterId}`);
  const first=rect(payload,2),last=code===46?rect(payload,first.nextByte):null;
  const boundsTwips=last?union(first.boundsTwips,last.boundsTwips):first.boundsTwips;
  const uses=catalog.timelines.flatMap(timeline=>timeline.instances
   .filter(instance=>instance.characterId===definition.characterId)
   .map(instance=>({timelineId:timeline.timelineId,instanceId:instance.instanceId,
    firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive})));
  const buttonStateUses=catalog.buttonDefinitions.flatMap(button=>button.statePlacements
   .filter(placement=>placement.characterId===definition.characterId)
   .map(placement=>({buttonCharacterId:button.characterId,states:placement.states,depth:placement.depth})));
  return {characterId:definition.characterId,tagName:definition.tagName,
   sourceTagOffset:offset,sourceTagSha256:tagHash,tagBytes:headerBytes+length,
   definitionClass:code===46?'morph-vector':'static-vector',
   canvasObjectKey:code===46?`morphshape${definition.characterId}`:`shape${definition.characterId}`,
   startBoundsTwips:first.boundsTwips,endBoundsTwips:last?.boundsTwips??null,boundsTwips,
   boundsPixels:{left:boundsTwips.left/20,right:boundsTwips.right/20,
    top:boundsTwips.top/20,bottom:boundsTwips.bottom/20},
   timelineUses:uses,buttonStateUses,teachingRole:'unclassified'};
 });
 assert.equal(new Set(rows.map(row=>row.characterId)).size,49);
 assert.deepEqual(rows.filter(row=>row.definitionClass==='morph-vector').map(row=>row.characterId),[46,49,66]);
 return {pins,rows,canvasBytes,ffdecBytes};
}

function originalFunction(source,name){const beginning=source.indexOf(`function ${name}(`);
 assert(beginning>=0,`original FFDec function ${name}`);
 const ending=source.indexOf('\nfunction ',beginning+1);
 assert(ending>beginning,`complete FFDec function ${name}`);
 return source.slice(beginning,ending);
}

function captureSpec(row){const W=420,H=300,pad=24,b=row.boundsTwips;
 const width=Math.max(1,b.right-b.left),height=Math.max(1,b.bottom-b.top);
 const scale=Math.min((W-2*pad)/width,(H-2*pad)/height);
 return {width:W,height:H,scale,translateX:(W-(b.left+b.right)*scale)/2,
  translateY:(H-(b.top+b.bottom)*scale)/2,ratio:0};
}
const AUDIT_INSERT=`
global.__P004_SHAPE_CENSUS_V1 = Object.freeze({
 keys: Object.freeze([...Object.keys(SAFE_OBJECTS).filter(key => /^(morphshape|shape)\\d+$/.test(key)),"shape56","shape97","shape99"]),
 draw: function(target,key,spec){
  var drawing=SAFE_OBJECTS[key]||EXTRA_SHAPE_OBJECTS[key];if(typeof drawing!=="function")throw Error("unknown safe shape "+key);
  var ctx=target.getContext("2d");if(!ctx._matrix)enhanceContext(ctx);
  var prior=canvas;canvas=target;ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,target.width,target.height);
  ctx.save();try{
   ctx.setTransform(spec.scale,0,0,spec.scale,spec.translateX,spec.translateY);
   drawing(ctx,new cxform(0,0,0,0,255,255,255,255),0,spec.ratio,0);
  }finally{ctx.restore();canvas=prior;}
  var pixels=ctx.getImageData(0,0,target.width,target.height).data,count=0,
   left=target.width,top=target.height,right=-1,bottom=-1;
  for(var y=0;y<target.height;y++)for(var x=0;x<target.width;x++){
   if(pixels[(y*target.width+x)*4+3]===0)continue;
   count++;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);
  }
  return {nontransparentPixels:count,rasterBounds:count?{left,right,top,bottom}:null};
 }
});
`;

async function capture(){const {pins,rows,canvasBytes,ffdecBytes}=census();
 const browser=await chromium.launch({channel:'chrome',headless:true,
  args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
 const errors=[],requests=[],images=[],supplemental=[];
 try{const page=await browser.newPage({viewport:{width:800,height:600},deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('request',request=>requests.push(request.url()));
  await page.setContent('<!doctype html><html><body style="margin:0"><canvas id="isolated" width="420" height="300"></canvas><canvas id="checker" width="1680" height="2310"></canvas><canvas id="white" width="1680" height="2310"></canvas></body></html>');
  const source=canvasBytes.toString();
  const marker='registry["shared-alg001-l06-p004"] = Object.freeze({metadata: METADATA, ready: ready, resolveFrameState: resolveFrameState, render: render});';
  assert.equal(source.split(marker).length,2,'single safe Canvas registry insertion point');
  const ffdec=ffdecBytes.toString(),original97=originalFunction(ffdec,'shape97'),
   original99=originalFunction(ffdec,'shape99');
  const extras=`${original97}\n${original99}\nvar EXTRA_SHAPE_OBJECTS = Object.freeze({shape56,shape97,shape99});\n`;
  await page.addScriptTag({content:source.replace(marker,extras+AUDIT_INSERT+'\n'+marker)});
  await page.evaluate(async()=>globalThis.HELP_MATH_CANVAS_ASSETS['shared-alg001-l06-p004'].ready());
  const keys=await page.evaluate(()=>globalThis.__P004_SHAPE_CENSUS_V1.keys);
  assert.deepEqual([...keys].sort(),rows.map(row=>row.canvasObjectKey).sort(),
   'source shape definitions exactly equal safe Canvas shape functions');
  for(let index=0;index<rows.length;index++){
   const row=rows[index],spec=captureSpec(row);
   const result=await page.evaluate(({row,spec,index})=>{
    const canvas=document.getElementById('isolated');
    const diagnostic=globalThis.__P004_SHAPE_CENSUS_V1.draw(canvas,row.canvasObjectKey,spec);
    for(const [name,color] of [['checker',null],['white','#fff']]){
     const sheet=document.getElementById(name),ctx=sheet.getContext('2d');
     const column=index%7,line=Math.floor(index/7),x=column*240,y=line*330;
     ctx.fillStyle='#f1f4f8';ctx.fillRect(x,y,240,330);
     ctx.fillStyle='#172841';ctx.font='bold 15px sans-serif';
     ctx.fillText(`shape ${row.characterId} · ${row.definitionClass==='morph-vector'?'morph':'static'}`,x+10,y+22);
     ctx.font='11px monospace';ctx.fillText(row.sourceTagSha256.slice(0,16),x+10,y+40);
     ctx.fillStyle=color??'#fff';ctx.fillRect(x+10,y+50,220,250);
     if(!color){ctx.fillStyle='#e0e4e9';for(let cy=0;cy<250;cy+=20)for(let cx=0;cx<220;cx+=20)
      if(((cx+cy)/20)%2===0)ctx.fillRect(x+10+cx,y+50+cy,20,20);}
     ctx.drawImage(canvas,x+10,y+50,220,Math.round(300*220/420));
     ctx.fillStyle='#596a80';ctx.font='11px sans-serif';
     ctx.fillText(`${Math.round((row.boundsTwips.right-row.boundsTwips.left)/20)} × ${Math.round((row.boundsTwips.bottom-row.boundsTwips.top)/20)} px source`,x+10,y+317);
    }
    return {png:canvas.toDataURL('image/png').split(',')[1],diagnostic};
   },{row,spec,index});
   const image=exact(`${OUT}/shapes/shape-${String(row.characterId).padStart(3,'0')}.png`,Buffer.from(result.png,'base64'));
   images.push({characterId:row.characterId,definitionClass:row.definitionClass,
    captureSpec:spec,diagnostic:result.diagnostic,image});
   if(row.definitionClass==='morph-vector')for(const ratio of [32768,65535]){
    const extra=await page.evaluate(({row,spec,ratio})=>{
     const canvas=document.getElementById('isolated');
     const diagnostic=globalThis.__P004_SHAPE_CENSUS_V1.draw(canvas,row.canvasObjectKey,{...spec,ratio});
     return {png:canvas.toDataURL('image/png').split(',')[1],diagnostic};
    },{row,spec,ratio});
    const image=exact(`${OUT}/morph-diagnostics/shape-${String(row.characterId).padStart(3,'0')}-ratio-${ratio}.png`,Buffer.from(extra.png,'base64'));
    supplemental.push({characterId:row.characterId,ratio,diagnostic:extra.diagnostic,image});
   }
  }
  const sheets={};for(const name of ['checker','white']){
   const data=await page.evaluate(name=>document.getElementById(name).toDataURL('image/png').split(',')[1],name);
   sheets[name]=exact(`${OUT}/contact-sheet-${name}-v1.png`,Buffer.from(data,'base64'));
  }
  assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith('data:')));
  const report={schemaVersion:1,kind:'alg-l06-p004-source-shape-census-v1',
   claimBoundary:'Source-tag geometry and isolated generated safe Canvas only; no AVM1 execution, original runtime, semantic role, fidelity, audio or acceptance claim.',
   sourcePins:pins,browser:{name:'Chrome',version:browser.version()},
   coordinateMethod:'Decompressed CWS DefineShape RECT twips; morph start/end union; isolated vector fit with 24px padding to 420x300 canvas.',
   definitionCount:rows.length,rows,isolatedCaptures:images,morphDiagnostics:supplemental,
   contactSheets:sheets,errors,requests};
  const manifest=json(`${OUT}/census-v1.json`,report);
  console.log(JSON.stringify({manifest,shapeCount:images.length,morphDiagnostics:supplemental.length,
   contactSheets:sheets,nontransparent:images.filter(item=>item.diagnostic.nontransparentPixels>0).length}));
 }finally{await browser.close();}
}

async function morphSheet(){const {pins}=census();
 const manifestPath=`${OUT}/census-v1.json`,report=JSON.parse(fs.readFileSync(file(manifestPath),'utf8'));
 assert.deepEqual(report.sourcePins,pins);assert.equal(report.morphDiagnostics.length,6);
 const sourceImages=report.morphDiagnostics.map(item=>({characterId:item.characterId,
  ratio:item.ratio,pin:item.image,png:fs.readFileSync(file(item.image.path)).toString('base64')}));
 for(const item of sourceImages)assert.deepEqual(pin(item.pin.path),item.pin);
 const browser=await chromium.launch({channel:'chrome',headless:true,
  args:['--mute-audio','--autoplay-policy=document-user-activation-required']});
 const errors=[],requests=[],sheets={};
 try{const page=await browser.newPage({viewport:{width:800,height:600},deviceScaleFactor:1});
  page.on('pageerror',error=>errors.push(String(error)));
  page.on('request',request=>requests.push(request.url()));
  await page.setContent('<!doctype html><html><body><canvas id="sheet" width="1260" height="760"></canvas></body></html>');
  for(const background of ['checker','white']){
   const result=await page.evaluate(async({background,sourceImages})=>{
    const canvas=document.getElementById('sheet'),ctx=canvas.getContext('2d');
    ctx.fillStyle='#e9edf2';ctx.fillRect(0,0,canvas.width,canvas.height);
    for(let index=0;index<sourceImages.length;index++){
     const item=sourceImages[index],column=index%3,row=Math.floor(index/3),x=column*420,y=row*380;
     ctx.fillStyle='#172841';ctx.font='bold 18px sans-serif';
     ctx.fillText(`shape ${item.characterId} · ratio ${item.ratio}`,x+16,y+28);
     ctx.fillStyle='#fff';ctx.fillRect(x+16,y+46,388,286);
     if(background==='checker'){
      ctx.fillStyle='#dce1e7';for(let cy=0;cy<286;cy+=22)for(let cx=0;cx<388;cx+=22)
       if(((cx+cy)/22)%2===0)ctx.fillRect(x+16+cx,y+46+cy,22,22);
     }
     const image=new Image();image.src='data:image/png;base64,'+item.png;
     await image.decode();ctx.drawImage(image,x+16,y+52,388,277);
     ctx.fillStyle='#52667d';ctx.font='12px monospace';
     ctx.fillText(item.pin.sha256.slice(0,24),x+16,y+355);
    }
    return canvas.toDataURL('image/png').split(',')[1];
   },{background,sourceImages});
   sheets[background]=exact(`${OUT}/morph-diagnostics/contact-sheet-${background}-v1.png`,Buffer.from(result,'base64'));
  }
  assert.deepEqual(errors,[]);assert(requests.every(url=>url.startsWith('data:')));
  const supplement={schemaVersion:1,kind:'alg-l06-p004-morph-background-diagnostics-v1',
   mainCensus:pin(manifestPath),sourcePins:pins,sourceImages:sourceImages.map(({characterId,ratio,pin})=>({characterId,ratio,pin})),
   sheets,errors,requests,claimBoundary:'Readable composite of six existing morph midpoint/end captures; no new source role or fidelity claim.'};
  console.log(JSON.stringify({receipt:json(`${OUT}/morph-diagnostics/supplement-v1.json`,supplement),sheets}));
 }finally{await browser.close();}
}

function check(){const {pins,rows}=census();
 const report=JSON.parse(fs.readFileSync(file(`${OUT}/census-v1.json`),'utf8'));
 assert.deepEqual(report.sourcePins,pins);assert.deepEqual(report.rows,rows);
 assert.equal(report.definitionCount,49);assert.equal(report.isolatedCaptures.length,49);
 assert.equal(report.morphDiagnostics.length,6);
 for(const item of [...report.isolatedCaptures,...report.morphDiagnostics])
  assert.deepEqual(pin(item.image.path),item.image,`capture pin ${item.image.path}`);
 for(const item of Object.values(report.contactSheets))assert.deepEqual(pin(item.path),item);
 assert.deepEqual(report.errors,[]);assert(report.requests.every(url=>url.startsWith('data:')));
 const supplementPath=`${OUT}/morph-diagnostics/supplement-v1.json`;
 if(fs.existsSync(file(supplementPath))){const supplement=JSON.parse(fs.readFileSync(file(supplementPath),'utf8'));
  assert.deepEqual(supplement.mainCensus,pin(`${OUT}/census-v1.json`));
  assert.deepEqual(supplement.sourcePins,pins);assert.equal(supplement.sourceImages.length,6);
  for(const source of supplement.sourceImages)assert.deepEqual(pin(source.pin.path),source.pin);
  for(const sheet of Object.values(supplement.sheets))assert.deepEqual(pin(sheet.path),sheet);
  assert.deepEqual(supplement.errors,[]);assert(supplement.requests.every(url=>url.startsWith('data:')));
 }
 console.log(JSON.stringify({status:'source-locked-census-present-not-classified',
  manifest:pin(`${OUT}/census-v1.json`),shapeCount:49,
  nontransparent:report.isolatedCaptures.filter(item=>item.diagnostic.nontransparentPixels>0).length}));
}
const mode=process.argv[2];assert(['--plan','--capture','--morph-sheet','--check'].includes(mode)&&process.argv.length===3,
 'Usage: --plan | --capture | --morph-sheet | --check');
if(mode==='--plan'){const {pins,rows}=census();console.log(JSON.stringify({status:'source-locked-plan',
 sourcePins:pins,definitionCount:rows.length,rows,writesPerformed:false}));}
else if(mode==='--capture')await capture();else if(mode==='--morph-sheet')await morphSheet();else check();
