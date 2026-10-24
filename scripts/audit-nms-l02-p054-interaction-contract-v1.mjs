import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const swf=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/GS/L2GS03.swf');
const audit='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5';
const xml=path.join(audit,'movie.xml');
const layout=path.join(root,'migrations/shared-nms002-l02-p054/audit/card-layout-v1.json');
const output=path.join(root,'migrations/shared-nms002-l02-p054/audit/interaction-contract-v1.json');
const expected={
 swf:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
 xml:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
 layout:'d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863',
 cardHandler:'f39b7bc9e865752b35736f6cd782efb4394c62f7ee19df3bc4daf76a5ec3e6cb',
};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function read(file,hash){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(hash)assert.equal(sha(bytes),hash,file);
 return bytes;
}
function action(file,markers){
 const bytes=read(file),source=bytes.toString('utf8');
 for(const marker of markers)assert.ok(source.includes(marker),`${file}: ${marker}`);
 return {path:file,sha256:sha(bytes),source};
}
function build(){
 const rootStat=fs.lstatSync(sourceRoot);
 assert.ok(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'source must be a real directory');
 assert.equal(read(swf,expected.swf).length,2077270);
 read(xml,expected.xml);
 const cards=JSON.parse(read(layout,expected.layout)).cards;
 assert.equal(cards.length,24);
 const scripts=path.join(audit,'scripts');
 const handlers=cards.map(card=>{
  const file=path.join(scripts,'DefineSprite_731',`frame_${card.sourceFrame}`,
   `PlaceObject2_${card.sourceCharacterId}_${card.sourceDepth}`,
   'CLIPACTIONRECORD on(release).as');
  const {sha256}=action(file,['_global.ansClickCount++','_global.chkMcName = tempName',
   'gotoAndStop(2)','_parent.disableMc()','_global.ansClickCount = 0',
   '_parent[splTempName[0] + "_2"]._currentframe == 2',
   '_parent[splTempName[0] + "_1"]._currentframe == 2',
   '_global.score += 10','_global.score -= 2',
   'Mc_Feed2.gotoAndPlay(2)','Mc_Feed1.gotoAndPlay(2)',
   'setInterval(fadeOut1,100)','setInterval(fadeOut2,100)']);
  assert.equal(sha256,expected.cardHandler,`${card.sourceInstanceName}: handler drift`);
  return {level:card.level,sourceFrame:card.sourceFrame,
   sourceInstanceName:card.sourceInstanceName,sourceCharacterId:card.sourceCharacterId,
   sourceDepth:card.sourceDepth,handlerSha256:sha256};
 });
 for(const frame of [2,4])assert.equal(handlers.filter(item=>item.sourceFrame===frame).length,12);
 const sprite=path.join(scripts,'DefineSprite_731');
 const entry=action(path.join(sprite,'frame_1','DoAction.as'),
  ['_global.quizSection = true','Mc_Popup._visible = false',
   'if(_global.gameLevel1)','else if(_global.gameLevel2)','gotoAndStop("Level1")']);
 const levels=[2,4].map(frame=>{
  const value=action(path.join(sprite,`frame_${frame}`,'DoAction.as'),
   ['_global.quizSection = true','_global.score = 0','_global.ansClickCount = 0',
    '_global.totAnsCount = 0','_global.chkMcName = ""',
    'Mc_Popup._visible = false','eval("Mc" + i + "_1").gotoAndStop(1)',
    'eval("Mc" + i + "_Img1")._visible = false']);
  return {sourceFrame:frame,sha256:value.sha256};
 });
 const correct=action(path.join(scripts,'DefineSprite_194','frame_27','DoAction.as'),
  ['_parent.enableMc()','_global.totAnsCount++','_global.totAnsCount >= 6',
   '_global.totAnsCount = 0','_global.quizSection = false','nextFrame()']);
 const wrong=action(path.join(scripts,'DefineSprite_208','frame_31','DoAction.as'),
  ['stop()','_parent.enableMc()']);
 assert.ok(!wrong.source.includes('totAnsCount')&&!wrong.source.includes('nextFrame()'));
 const buttons={};
 for(const id of [96,233,649,655,730]){
  const value=action(path.join(scripts,`DefineButton2_${id}`,'BUTTONCONDACTION on(release).as'),
   id===655?['gameLevel1','gameLevel2','gotoAndStop("Level1")','gotoAndStop("Level2")']:
   id===96?['this._visible = false']:['Mc_Popup._visible = true']);
  buttons[id]={sha256:value.sha256,
   sourceAction:id===655?'restart-selected-level':id===96?'hide-self':'show-popup'};
 }
 const levelSelectors=[];
 for(const frame of [3,5])for(const [id,depth,level] of [[661,337,1],[664,340,2]]){
  const value=action(path.join(sprite,`frame_${frame}`,`PlaceObject2_${id}_${depth}`,
   'CLIPACTIONRECORD on(release).as'),
   level===1?['_global.gameLevel1 = true','_global.gameLevel2 = false']:
    ['_global.gameLevel1 = false','_global.gameLevel2 = true']);
  levelSelectors.push({sourceFrame:frame,sourceCharacterId:id,level,sha256:value.sha256});
 }
 for(const frame of [3,5])action(path.join(sprite,`frame_${frame}`,'DoAction.as'),['stop()']);
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  sources:{swf:{path:swf,sha256:expected.swf},xml:{path:xml,sha256:expected.xml},
   cardLayout:{path:layout,sha256:expected.layout}},
  gameSpriteId:731,entryActionSha256:entry.sha256,levelInitialization:levels,
  cards:handlers,cardHandlerCount:handlers.length,cardHandlerSha256:expected.cardHandler,
  sourceRules:{firstClick:'increment answer click count, save card name, select frame 2',
   secondClick:'disable all 12 cards and reset answer click count before pair test',
   correct:'opposite side of same pair at frame 2; add 10; play correct feedback',
   incorrect:'otherwise reset first selected card to frame 1; subtract 2; play wrong feedback',
   scoreFloor:'no clamp in the 24 extracted card handlers',
   fade:'matched cards use source 100ms interval with alpha decrement 40; execution timing unverified'},
  feedback:{correct:{sourceSpriteId:194,terminalFrame:27,sha256:correct.sha256,
   afterSix:'reset completed-pair count; set quizSection false; nextFrame in feedback sprite'},
   wrong:{sourceSpriteId:208,terminalFrame:31,sha256:wrong.sha256,
    effect:'re-enable card controls without completed-pair increment'}},
  buttons,levelSelectors,
  status:'source-static-interaction-contract-only',
  unresolved:['Natural trace, score display, popup content and close semantics',
   'Whether feedback-sprite nextFrame advances any parent game or host state',
   'Original-runtime six-pair result, level switching, Replay, and page completion',
   'Source audio cue timing, listening acceptance, visual fidelity, and product integration'],
  currentJsRegistered:false,originalRuntimeAccepted:false,audioAccepted:false,
  humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p054-interaction-contract-v1.mjs [--check|--write|--stdout]');
 const result=build(),bytes=Buffer.from(`${JSON.stringify(result,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.deepEqual(read(output),bytes,'P054 interaction contract drift');
 if(mode==='--stdout')process.stdout.write(bytes);
 else process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  cards:result.cardHandlerCount,bytes:bytes.length,sha256:sha(bytes)})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {build};
