import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const audit='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5';
const xml=path.join(audit,'movie.xml');
const inputs={
 xml:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
 contract:'6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205',
 layout:'d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863',
 art:'b715b175badc1edfcdf5df81ef7c388ea7e0b2eaac99656c28c74d1762e91974',
};
const files={contract:path.join(root,'catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json'),
 layout:path.join(root,'migrations/shared-nms002-l02-p054/audit/card-layout-v1.json'),
 art:path.join(root,'migrations/shared-nms002-l02-p054/audit/art-export-v1.json')};
const output=path.join(root,'migrations/shared-nms002-l02-p054/audit/card-display-list-v1.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function read(file,expected){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(expected)assert.equal(sha(bytes),expected,file);
 return bytes;
}
function attr(text,name){
 const value=new RegExp(`\\b${name}="([^"]*)"`,'u').exec(text)?.[1];
 assert.ok(value!==undefined,`${name} absent`);
 return value;
}
function numericAttributes(text){
 return Object.fromEntries([...text.matchAll(/([A-Za-z][\w]*)="(-?\d+(?:\.\d+)?)"/gu)]
  .map(match=>[match[1],Number(match[2])]));
}
function extractSprite(document,id,defs,resources,artByFile,textById){
 const open=new RegExp(`<DefineSprite objectID="${id}" frames="(\\d+)">`,'u').exec(document);
 assert.ok(open,`card sprite ${id} missing`);
 const end=document.indexOf('</DefineSprite>',open.index+open[0].length);
 assert.ok(end>open.index,`card sprite ${id} unterminated`);
 const body=document.slice(open.index+open[0].length,end);
 const active=new Map(),frames=[];
 for(const token of body.matchAll(/<PlaceObject2\b[^>]*>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu)){
  const tag=token[0];
  if(tag.startsWith('<PlaceObject2')){
   const depth=Number(attr(tag,'depth')),sourceCharacterId=Number(attr(tag,'objectID'));
   const kind=defs.get(sourceCharacterId);
   assert.ok(kind==='DefineText'||/^DefineShape\d*$/u.test(kind??''),
    `unsupported card resource ${sourceCharacterId}:${kind}`);
   const close=body.indexOf('</PlaceObject2>',token.index);
   assert.ok(close>token.index);
   const inside=body.slice(token.index,close);
   const transform=/<Transform\b([^>]*)\/>/u.exec(inside);
   assert.ok(transform,`card ${id} depth ${depth} missing transform`);
   if(kind==='DefineText'){
    const text=textById.get(sourceCharacterId);
    assert.ok(text,`card text ${sourceCharacterId} not in frozen math contract`);
    read(path.join(audit,'texts',`${sourceCharacterId}.txt`),text.sha256);
    resources.set(sourceCharacterId,{sourceCharacterId,kind:'text',value:text.value,
     sourceTextSha256:text.sha256});
   }else{
    const file=`shapes/${sourceCharacterId}.svg`,art=artByFile.get(file);
    assert.ok(art,`source shape ${file} missing from FFDec export`);
    resources.set(sourceCharacterId,{sourceCharacterId,kind:'shape',file,
     exportedSha256:art.sha256});
   }
   active.set(depth,{depth,sourceCharacterId,transform:numericAttributes(transform[1])});
  }else if(tag.startsWith('<RemoveObject2')){
   const depth=Number(attr(tag,'depth'));
   assert.ok(active.delete(depth),`card ${id} removed absent depth ${depth}`);
  }else{
   frames.push({frame:frames.length+1,layers:[...active.values()].sort((a,b)=>a.depth-b.depth)});
  }
 }
 assert.equal(frames.length,Number(open[1]),`card ${id} frame count`);
 assert.equal(frames.length,5,`card ${id} unexpected state count`);
 return frames;
}
function build(){
 execFileSync('xmllint',['--nonet','--noout',xml],{maxBuffer:1000});
 const document=read(xml,inputs.xml).toString('utf8');
 const contract=JSON.parse(read(files.contract,inputs.contract));
 const layout=JSON.parse(read(files.layout,inputs.layout));
 const art=JSON.parse(read(files.art,inputs.art));
 const defs=new Map([...document.matchAll(/<(Define[A-Za-z0-9]+)\b[^>]*\bobjectID="(\d+)"/gu)]
  .map(match=>[Number(match[2]),match[1]]));
 const artByFile=new Map(art.export.items.map(item=>[item.file,item]));
 const textById=new Map();
 for(const card of contract.matching.cards)for(const text of card.sourceTexts){
  const old=textById.get(text.id);
  if(old)assert.deepEqual(old,text);
  else textById.set(text.id,text);
 }
 const resources=new Map();
 const cards=layout.cards.map(placement=>{
  const math=contract.matching.cards.find(card=>card.level===placement.level&&
   card.sourceCharacterId===placement.sourceCharacterId);
  assert.ok(math&&math.sourceInstanceName===placement.sourceInstanceName);
  const frames=extractSprite(document,placement.sourceCharacterId,defs,resources,artByFile,textById);
  const frameTextIds=new Set(frames.flatMap(frame=>frame.layers.map(layer=>layer.sourceCharacterId))
   .filter(id=>defs.get(id)==='DefineText'));
  assert.deepEqual([...frameTextIds].sort((a,b)=>a-b),
   math.sourceTexts.map(text=>text.id).sort((a,b)=>a-b));
  return {level:placement.level,pairId:math.pairId,side:math.side,
   sourceInstanceName:math.sourceInstanceName,sourceCharacterId:placement.sourceCharacterId,
   frames};
 });
 assert.equal(cards.length,24);
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  inputs:{xml:{path:xml,sha256:inputs.xml},mathContract:{path:files.contract,sha256:inputs.contract},
   cardLayout:{path:files.layout,sha256:inputs.layout},artExport:{path:files.art,sha256:inputs.art}},
  cardCount:cards.length,cardFrameCount:5,
  resources:[...resources.values()].sort((a,b)=>a.sourceCharacterId-b.sourceCharacterId),cards,
  status:'source-static-card-state-ir-only',productionRendererRegistered:false,
  limitations:['Only card sprites are represented; game background, popup, score, reveal, and sound are outside this IR.',
   'Frame states are source display-list states, not a natural-input or original-runtime trace.',
   'Source SVGs are external unreviewed exports; this artifact does not promote them into the product.']};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p054-card-display-list-v1.mjs [--check|--write|--stdout]');
 if(mode==='--write')assert.ok(!fs.existsSync(output),`${output} already exists`);
 const result=build(),bytes=Buffer.from(`${JSON.stringify(result,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.deepEqual(read(output),bytes,'card display-list IR drift');
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  cards:result.cardCount,framesPerCard:result.cardFrameCount,
  resources:result.resources.length,bytes:bytes.length,sha256:sha(bytes)},null,2)}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
