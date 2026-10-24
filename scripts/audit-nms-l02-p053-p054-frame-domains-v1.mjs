import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const pages=[
 {id:'shared-nms002-l02-p053',sourceSha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf',
  sourceBytes:236774,xml:'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p053-source-audit-rjgSPq/movie.xml',
  xmlSha256:'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1',
  source:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS02.swf',
  expectedSprites:76},
 {id:'shared-nms002-l02-p054',sourceSha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
  sourceBytes:2077270,xml:'/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5/movie.xml',
  xmlSha256:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
  source:'/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf',
  expectedSprites:128},
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function stableRead(file,expectedHash,expectedBytes){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(expectedHash)assert.equal(sha(bytes),expectedHash,file);
 if(expectedBytes!==undefined)assert.equal(bytes.length,expectedBytes,file);
 return bytes;
}
function rootPlacements(file){
 const output=execFileSync('xmllint',['--nonet','--xpath',
  '/swf/Header/tags/PlaceObject2/@objectID',file],{encoding:'utf8',maxBuffer:1_000_000});
 return [...new Set([...output.matchAll(/objectID="(\d+)"/gu)].map(match=>Number(match[1])))];
}
function spriteGraph(xml,expectedCount){
 const sprites=new Map();
 for(const match of xml.matchAll(/<DefineSprite objectID="(\d+)" frames="(\d+)">/gu)){
  const id=Number(match[1]),frames=Number(match[2]);
  const start=match.index+match[0].length,end=xml.indexOf('</DefineSprite>',start);
  assert.ok(end>start,`sprite ${id} unterminated`);
  const body=xml.slice(start,end);
  const placed=[...new Set([...body.matchAll(/<PlaceObject(?:2|3)?\b[^>]*\bobjectID="(\d+)"[^>]*>/gu)]
   .map(item=>Number(item[1])))];
  const showFrames=(body.match(/<ShowFrame\s*\/>/gu)??[]).length;
  assert.equal(showFrames,frames,`sprite ${id} declared/show-frame mismatch`);
  assert.ok(!sprites.has(id),`duplicate sprite ${id}`);
  sprites.set(id,{id,frames,placed});
 }
 assert.equal(sprites.size,expectedCount,'SWF sprite inventory changed');
 return sprites;
}
function audit(page){
 const source=stableRead(page.source,page.sourceSha256,page.sourceBytes);
 const xml=stableRead(page.xml,page.xmlSha256).toString('utf8');
 const rootIds=rootPlacements(page.xml),sprites=spriteGraph(xml,page.expectedSprites);
 const parents=new Map(),visited=new Set(),queue=[];
 for(const id of rootIds)if(sprites.has(id)){
  queue.push(id);parents.set(id,new Set(['root']));
 }
 while(queue.length){
  const id=queue.shift();
  if(visited.has(id))continue;
  visited.add(id);
  for(const child of sprites.get(id).placed)if(sprites.has(child)){
   if(!parents.has(child))parents.set(child,new Set());
   parents.get(child).add(String(id));
   if(!visited.has(child))queue.push(child);
  }
 }
 const reachable=[...visited].sort((a,b)=>a-b).map(id=>({
  sourceCharacterId:id,frameCount:sprites.get(id).frames,
  placedFrom:[...parents.get(id)].sort(),
  childSpriteIds:sprites.get(id).placed.filter(child=>sprites.has(child)).sort((a,b)=>a-b),
  disposition:'static-placement-graph-only',
  runtimeReachabilityAccepted:false,
 }));
 const outside=[...sprites.keys()].filter(id=>!visited.has(id)).sort((a,b)=>a-b);
 return {schemaVersion:1,animationId:page.id,
  source:{path:page.source,bytes:source.length,sha256:page.sourceSha256},
  extraction:{path:page.xml,sha256:page.xmlSha256,tool:'swfmill 0.3.6'},
  rootFrameCount:10,rootPlacedCharacterIds:rootIds,
  totalDefinedSpriteCount:sprites.size,staticRootReachableSpriteCount:reachable.length,
  staticRootReachableSpriteDomains:reachable,
  notInStaticPlacementGraphSpriteIds:outside,
  limitations:['This graph includes placements in any declared source frame, not natural-trace reachability.',
   'Dynamic attachment, host loading, entry state, audio cues, and accepted original-runtime paths are not proven.',
   'Full frame-domain requirements and fidelity coverage remain pending.'],
  originalRuntimeAccepted:false,strictComplete:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p053-p054-frame-domains-v1.mjs [--check|--write|--stdout]');
 const summary=[];
 if(mode==='--write')for(const page of pages){
  const target=path.join(root,'migrations',page.id,'audit','frame-domain-static-graph-v1.json');
  assert.ok(!fs.existsSync(target),`${target} already exists`);
 }
 for(const page of pages){
  const value=audit(page);
  const target=path.join(root,'migrations',page.id,'audit','frame-domain-static-graph-v1.json');
  const bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
  if(mode==='--write')fs.writeFileSync(target,bytes,{flag:'wx'});
  if(mode==='--check')assert.deepEqual(stableRead(target),bytes,`${page.id} domain audit drift`);
  summary.push({animationId:page.id,reachable:value.staticRootReachableSpriteCount,
   defined:value.totalDefinedSpriteCount,bytes:bytes.length,sha256:sha(bytes),
   ...(mode==='--stdout'?{value}:{} )});
 }
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,summary},null,2)}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
