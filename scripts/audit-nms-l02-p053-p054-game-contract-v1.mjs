import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const evidenceRoot='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const members=Object.freeze({
 p053:Object.freeze({
  source:path.join(sourceRoot,'G6-G8-shared/NMS002/L2/GS/L2GS02.swf'),
  sourceBytes:236774,
  sourceSha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf',
  audit:path.join(evidenceRoot,'p053-source-audit-rjgSPq'),
  xmlSha256:'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1',
 }),
 p054:Object.freeze({
  source:path.join(sourceRoot,'G6-G8-shared/NMS002/L2/GS/L2GS03.swf'),
  sourceBytes:2077270,
  sourceSha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
  audit:path.join(evidenceRoot,'p054-source-audit-gkoof5'),
  xmlSha256:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
 }),
});
const digest=buffer=>createHash('sha256').update(buffer).digest('hex');
function canonicalFile(file,expectedSha256,expectedBytes){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file);
 const after=fs.lstatSync(file,{bigint:true});
 for(const field of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(after[field],before[field],file);
 if(expectedBytes!==undefined)assert.equal(bytes.length,expectedBytes,file);
 if(expectedSha256!==undefined)assert.equal(digest(bytes),expectedSha256,file);
 return bytes;
}
function sourceObjectBody(xml,objectId){
 const open=new RegExp(`<([A-Za-z][A-Za-z0-9_]*)\\b[^>]*\\bobjectID="${objectId}"[^>]*>`,'u').exec(xml);
 assert.ok(open,`source character ${objectId} absent`);
 const bodyStart=open.index+open[0].length;
 const bodyEnd=xml.indexOf(`</${open[1]}>`,bodyStart);
 assert.ok(bodyEnd>=bodyStart,`source character ${objectId} unterminated`);
 return xml.slice(bodyStart,bodyEnd);
}
function textIdsFor(xml,objectId,textIds){
 const seen=new Set(),found=[];
 function visit(id){
  if(seen.has(id))return;
  seen.add(id);
  if(textIds.has(id))found.push(id);
  const body=sourceObjectBody(xml,id);
  for(const placement of body.matchAll(/<PlaceObject2\b[^>]*\bobjectID="(\d+)"[^>]*>/gu))visit(Number(placement[1]));
 }
 visit(objectId);
 return found;
}
function normalizedText(buffer){return buffer.toString('utf8').replace(/\r\n?/gu,'\n')
 .replace(/\s*--- RECORDSEPARATOR ---\s*/gu,' ').replace(/\s+/gu,' ').trim();}
function findCardRows(xml,textRoot){
 const available=new Set(fs.readdirSync(textRoot).filter(name=>/^\d+\.txt$/u.test(name))
  .map(name=>Number(name.slice(0,-4))));
 const parent=sourceObjectBody(xml,731);
 const placements=[...parent.matchAll(/<PlaceObject2\b[^>]*\bobjectID="(\d+)"[^>]*\bname="(Mc[1-6]_[12])"[^>]*>/gu)];
 assert.equal(placements.length,24,'exact two-level card placement count');
 const rows=placements.map(([_,character,name],index)=>{
  const sourceCharacterId=Number(character),match=name.match(/^Mc([1-6])_([12])$/u);
  const level=sourceCharacterId<600?1:2;
  const ids=textIdsFor(xml,sourceCharacterId,available);
  assert.ok(ids.length>0,`${name}:${sourceCharacterId} has no source text`);
  const sourceTexts=ids.map(id=>{
   const file=path.join(textRoot,`${id}.txt`),bytes=canonicalFile(file);
   return {id,sha256:digest(bytes),value:normalizedText(bytes)};
  });
  return {level,placementOrder:index%12+1,sourceInstanceName:name,sourceCharacterId,
   pairId:Number(match[1]),side:Number(match[2]),sourceTexts};
 });
 for(const level of [1,2]){
  const own=rows.filter(row=>row.level===level);
  assert.equal(own.length,12,`level ${level} card count`);
  for(let pairId=1;pairId<=6;pairId++)for(const side of [1,2])
   assert.equal(own.filter(row=>row.pairId===pairId&&row.side===side).length,1,
    `level ${level} pair ${pairId} side ${side}`);
 }
 return rows.sort((a,b)=>a.level-b.level||a.pairId-b.pairId||a.side-b.side);
}
function verifyActions(audit){
 const scripts=path.join(audit,'scripts','DefineSprite_731');
 const count={};
 for(const frame of [2,4]){
  const directory=path.join(scripts,`frame_${frame}`);
  const placements=fs.readdirSync(directory).filter(name=>name.startsWith('PlaceObject2_'));
  assert.equal(placements.length,12,`frame ${frame} card scripts`);
  for(const placement of placements){
   const script=fs.readFileSync(path.join(directory,placement,'CLIPACTIONRECORD on(release).as'),'utf8');
   for(const marker of ['_global.ansClickCount++','_global.score += 10','_global.score -= 2',
    '_parent.disableMc()','Mc_Feed1.gotoAndPlay(2)','Mc_Feed2.gotoAndPlay(2)'])
    assert.ok(script.includes(marker),`${placement}: missing ${marker}`);
  }
  count[`frame${frame}`]=placements.length;
 }
 const entry=fs.readFileSync(path.join(scripts,'frame_1','DoAction.as'),'utf8');
 for(const marker of ['_global.gameLevel1','_global.gameLevel2','gotoAndStop("Level1")',
  'gotoAndStop("Level2")'])assert.ok(entry.includes(marker),`P054 entry ${marker}`);
 const correct=fs.readFileSync(path.join(audit,'scripts','DefineSprite_194','frame_27','DoAction.as'),'utf8');
 const wrong=fs.readFileSync(path.join(audit,'scripts','DefineSprite_208','frame_31','DoAction.as'),'utf8');
 for(const marker of ['_parent.enableMc()','_global.totAnsCount++',
  '_global.totAnsCount >= 6','_global.quizSection = false'])
  assert.ok(correct.includes(marker),`correct-feedback terminal missing ${marker}`);
 assert.ok(wrong.includes('_parent.enableMc()'),'wrong-feedback reenable missing');
 return {cardHandlers:count,scoreCorrect:10,scoreWrong:-2,
  correctFeedbackFrame:27,wrongFeedbackFrame:31,pairsForTerminal:6};
}
function verifyController(audit){
 const root=path.join(audit,'scripts','DefineSprite_187');
 const scripts=[
  path.join(root,'frame_1','PlaceObject2_136_24','CLIPACTIONRECORD on(release).as'),
  path.join(root,'frame_693','PlaceObject2_136_43','CLIPACTIONRECORD on(release).as'),
 ].map(file=>fs.readFileSync(file,'utf8'));
 assert.ok(scripts[0].includes('_root.doNeedMoreHelp("L7GS03",1)'));
 assert.ok(scripts[1].includes('_root.doNeedMoreHelp("L2GS03",1,6)'));
 assert.ok(scripts.every(script=>script.includes('gameLevel1')&&script.includes('gameLevel2')));
 return {earlyTarget:'L7GS03',selectLevelTarget:'L2GS03',
  selectLevelFrame:693,earlierTargetReachability:'unresolved'};
}
function main(){
 const mode=process.argv[2]??'--stdout';
 assert.ok(['--stdout','--write','--check'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p053-p054-game-contract-v1.mjs [--stdout|--write|--check]');
 assert.ok(fs.lstatSync(sourceRoot).isDirectory()&&!fs.lstatSync(sourceRoot).isSymbolicLink());
 const source={};
 for(const [name,member] of Object.entries(members)){
  const bytes=canonicalFile(member.source,member.sourceSha256,member.sourceBytes);
  const xml=canonicalFile(path.join(member.audit,'movie.xml'),member.xmlSha256).toString('utf8');
  source[name]={sourceBytes:bytes.length,sourceSha256:member.sourceSha256,
   xmlSha256:member.xmlSha256,xml};
 }
 const p053=source.p053.xml,p054=source.p054.xml;
 assert.match(p053,/<DefineSprite objectID="187" frames="694">/u);
 assert.match(p054,/<DefineSprite objectID="731" frames="5">/u);
 const cards=findCardRows(p054,path.join(members.p054.audit,'texts'));
 const result={schemaVersion:1,sourceRoot,source:{
  p053:{bytes:source.p053.sourceBytes,sha256:source.p053.sourceSha256,
   xmlSha256:source.p053.xmlSha256},
  p054:{bytes:source.p054.sourceBytes,sha256:source.p054.sourceSha256,
   xmlSha256:source.p054.xmlSha256}},
  controller:verifyController(members.p053.audit),
  matching:{sourceSpriteId:731,levels:2,pairsPerLevel:6,
   cardCount:cards.length,actions:verifyActions(members.p054.audit),cards},
  currentJsRegistered:false,originalRuntimeAccepted:false,audioAccepted:false,
  humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
 const output=path.join(projectRoot,'catalog','product-bridge-calibrations',
  'g678-nms-l02-p053-p054-game-contract-v1.json');
 const payload=Buffer.from(`${JSON.stringify(result,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,payload,{flag:'wx'});
 if(mode==='--check')assert.deepEqual(canonicalFile(output),payload,'game contract changed');
 if(mode==='--stdout')process.stdout.write(payload);
 else process.stdout.write(`${JSON.stringify({status:'PASS',mode,
  output:path.relative(projectRoot,output),bytes:payload.length,sha256:digest(payload),
  cards:cards.length})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {findCardRows,textIdsFor,verifyActions,verifyController};
