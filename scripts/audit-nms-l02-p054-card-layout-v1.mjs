import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const swf='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf';
const xml='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5/movie.xml';
const swfSha256='06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8';
const xmlSha256='2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46';
const contractFile=path.join(root,'catalog/product-bridge-calibrations/g678-nms-l02-p053-p054-game-contract-v1.json');
const contractSha256='6d492f48cc2df39ca1636d5f9cde8f7529493eb3770c1d47c690a3c84b8aa205';
const output=path.join(root,'migrations/shared-nms002-l02-p054/audit/card-layout-v1.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function stableRead(file,expectedSha256,expectedBytes){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(expectedSha256)assert.equal(sha(bytes),expectedSha256,file);
 if(expectedBytes!==undefined)assert.equal(bytes.length,expectedBytes,file);
 return bytes;
}
function numberAttr(text,name){
 const value=new RegExp(`\\b${name}="(-?\\d+)"`,'u').exec(text)?.[1];
 assert.ok(value!==undefined,`${name} missing`);
 return Number(value);
}
function layout(){
 stableRead(swf,swfSha256,2077270);
 const document=stableRead(xml,xmlSha256).toString('utf8');
 const contract=JSON.parse(stableRead(contractFile,contractSha256).toString('utf8'));
 const rootPlacement=execFileSync('xmllint',['--nonet','--xpath',
  '/swf/Header/tags/PlaceObject2[@objectID="731"]',xml],
 {encoding:'utf8',maxBuffer:10_000});
 const rootPlace=/<PlaceObject2\b([^>]*)\bobjectID="731"[^>]*>\s*<transform>\s*<Transform([^>]*)\/>/u.exec(rootPlacement);
 assert.ok(rootPlace,'root placement of game sprite 731 missing');
 assert.equal(numberAttr(rootPlace[1],'depth'),3);
 assert.match(rootPlace[0],/name="animation"/u);
 const rootTwips={x:numberAttr(rootPlace[2],'transX'),y:numberAttr(rootPlace[2],'transY')};
 const start=document.indexOf('<DefineSprite objectID="731" frames="5">');
 assert.ok(start>=0,'game sprite 731 missing');
 const end=document.indexOf('</DefineSprite>',start);
 assert.ok(end>start,'game sprite 731 unterminated');
 const body=document.slice(start,end);
 const matches=[...body.matchAll(/<PlaceObject2\b([^>]*)\bname="(Mc[1-6]_[12])"[^>]*>\s*<transform>\s*<Transform([^>]*)\/>/gu)];
 assert.equal(matches.length,24,'two levels must have twelve card placements each');
 const cards=matches.map((match,index)=>{
  const sourceFrame=(body.slice(0,match.index).match(/<ShowFrame\s*\/>/gu)??[]).length+1;
  assert.ok(sourceFrame===2||sourceFrame===4,`card placed outside a level frame: ${sourceFrame}`);
  const level=sourceFrame===2?1:2,placementOrder=index%12+1;
  assert.equal(level,index<12?1:2,'source level placement order changed');
  const id=numberAttr(match[1],'objectID'),depth=numberAttr(match[1],'depth');
  const name=match[2],localTwips={x:numberAttr(match[3],'transX'),y:numberAttr(match[3],'transY')};
  const frozen=contract.matching.cards.find(card=>card.level===level&&card.placementOrder===placementOrder);
  assert.ok(frozen&&frozen.sourceInstanceName===name&&frozen.sourceCharacterId===id,
   `layout does not match frozen math card ${level}:${placementOrder}`);
  return {level,sourceFrame,placementOrder,sourceInstanceName:name,sourceCharacterId:id,
   sourceDepth:depth,localTwips,stagePx:{x:(rootTwips.x+localTwips.x)/20,
    y:(rootTwips.y+localTwips.y)/20}};
 });
 for(const level of [1,2]){
  const own=cards.filter(card=>card.level===level);
  assert.equal(own.length,12);
  assert.equal(new Set(own.map(card=>card.sourceDepth)).size,12);
  assert.ok(own.every(card=>card.stagePx.x>=0&&card.stagePx.x<800&&
   card.stagePx.y>=0&&card.stagePx.y<600));
 }
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  source:{swf,swfSha256,xml,xmlSha256,mathContract:contractFile,
   mathContractSha256:contractSha256},
  stage:{width:800,height:600,twipsPerPixel:20},
  rootGameSprite:{sourceCharacterId:731,rootDepth:3,translationTwips:rootTwips,
   translationPx:{x:rootTwips.x/20,y:rootTwips.y/20}},
  cards,layoutAuthority:'source-static-placement-matrices-only',
  limitations:['Card translation points are not card bounds or hit areas.',
   'The instruction popup may cover the grid; natural visibility and interaction are unverified.',
   'Shape geometry, masks, filters, text rendering, and terminal reveal remain to be audited.',
   'No original-runtime fidelity, audio, human, Owner, or strict acceptance is implied.'],
  originalRuntimeAccepted:false,strictComplete:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p054-card-layout-v1.mjs [--check|--write|--stdout]');
 if(mode==='--write')assert.ok(!fs.existsSync(output),`${output} already exists`);
 const value=layout(),bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.deepEqual(stableRead(output),bytes,'card layout changed');
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  cards:value.cards.length,bytes:bytes.length,sha256:sha(bytes),
  ...(mode==='--stdout'?{value}:{})},null,2)}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
