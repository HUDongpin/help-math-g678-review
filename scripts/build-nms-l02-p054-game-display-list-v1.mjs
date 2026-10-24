import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.join(root,'migrations/shared-nms002-l02-p054');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const source=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/GS/L2GS03.swf');
const audit='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5';
const xml=path.join(audit,'movie.xml');
const layout=path.join(workspace,'audit/card-layout-v1.json');
const interaction=path.join(workspace,'audit/interaction-contract-v1.json');
const output=path.join(workspace,'audit/game-display-list-v1.json');
const expected={source:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
 xml:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
 layout:'d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863',
 interaction:'7472962f3e1ca32219dafd000a3f9bbcc6b90865cb0ca7d7f3b79d5265cc03b4'};
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
function attributes(tag){
 return Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
  .map(match=>[match[1],/^-?\d+(?:\.\d+)?$/u.test(match[2])?Number(match[2]):match[2]]));
}
function spriteBody(document,id){
 const open=new RegExp(`<DefineSprite objectID="${id}" frames="(\\d+)">`,'u').exec(document);
 assert.ok(open,`sprite ${id} missing`);
 const start=open.index+open[0].length,end=document.indexOf('</DefineSprite>',start);
 assert.ok(end>start,`sprite ${id} unterminated`);
 return {declaredFrames:Number(open[1]),body:document.slice(start,end)};
}
function controllerFrames(document){
 const {declaredFrames,body}=spriteBody(document,731);
 assert.equal(declaredFrames,5);
 const definitions=new Map([...document.matchAll(/<(Define[A-Za-z0-9]+)\b[^>]*\bobjectID="(\d+)"/gu)]
  .map(match=>[Number(match[2]),match[1]]));
 const active=new Map(),frames=[],placementEvents=[],removalEvents=[];
 let frame=1;
 for(const token of body.matchAll(/<PlaceObject2\b[^>]*>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu)){
  const tag=token[0];
  if(tag.startsWith('<PlaceObject2')){
   const fields=attributes(tag),depth=fields.depth,id=fields.objectID;
   assert.ok(Number.isInteger(depth)&&Number.isInteger(id),tag);
   assert.equal(fields.replace,0,`unexpected replacement at frame ${frame} depth ${depth}`);
   assert.ok(!active.has(depth),`occupied depth ${depth} at frame ${frame}`);
   const end=body.indexOf('</PlaceObject2>',token.index);
   assert.ok(end>token.index);
   const element=body.slice(token.index,end+'</PlaceObject2>'.length);
   const matrix=/<Transform\b[^>]*\/>/u.exec(element);
   assert.ok(matrix,`frame ${frame} depth ${depth} missing transform`);
   const kind=definitions.get(id);
   assert.ok(kind,`source character ${id} missing`);
   const layer={depth,sourceCharacterId:id,sourceKind:kind,
    sourceInstanceName:typeof fields.name==='string'?fields.name:'',
    transform:attributes(matrix[0]),sourceTagSha256:sha(Buffer.from(element))};
   active.set(depth,layer);
   placementEvents.push({frame,...layer});
  }else if(tag.startsWith('<RemoveObject2')){
   const depth=attributes(tag).depth;
   assert.ok(active.delete(depth),`remove absent depth ${depth} at frame ${frame}`);
   removalEvents.push({frame,depth});
  }else{
   frames.push({frame,layers:[...active.values()].sort((a,b)=>a.depth-b.depth)});
   frame++;
  }
 }
 assert.equal(frames.length,declaredFrames);
 assert.equal(placementEvents.length,69);
 assert.equal(removalEvents.length,60);
 return {frames,placementEvents,removalEvents};
}
function build(){
 const rootStat=fs.lstatSync(sourceRoot);
 assert.ok(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'source root must be a real directory');
 assert.equal(read(source,expected.source).length,2077270);
 const document=read(xml,expected.xml).toString('utf8');
 const cardLayout=JSON.parse(read(layout,expected.layout));
 const actions=JSON.parse(read(interaction,expected.interaction));
 const rootElement=execFileSync('xmllint',['--nonet','--xpath',
  '/swf/Header/tags/PlaceObject2[@objectID="731"]',xml],{encoding:'utf8',maxBuffer:4096});
 const rootFrame=Number(execFileSync('xmllint',['--nonet','--xpath',
  'count(/swf/Header/tags/PlaceObject2[@objectID="731"]/preceding-sibling::ShowFrame)+1',xml],
 {encoding:'utf8',maxBuffer:100}));
 assert.equal(rootFrame,6);
 assert.match(rootElement,/depth="3" objectID="731"/u);
 assert.match(rootElement,/transX="8268" transY="5686"/u);
 const {frames,placementEvents,removalEvents}=controllerFrames(document);
 for(const card of cardLayout.cards){
  const placed=placementEvents.find(item=>item.frame===card.sourceFrame&&
   item.depth===card.sourceDepth&&item.sourceCharacterId===card.sourceCharacterId);
  assert.ok(placed,`missing ${card.sourceInstanceName}`);
  assert.equal(placed.sourceInstanceName,card.sourceInstanceName);
 }
 assert.equal(actions.cardHandlerCount,24);
 for(const [frame,id] of [[3,648],[5,729]])
  assert.ok(frames[frame-1].layers.some(item=>item.sourceCharacterId===id),
   `result sprite ${id} absent from frame ${frame}`);
 for(const frame of [2,4]){
  const names=new Set(frames[frame-1].layers.map(item=>item.sourceInstanceName));
  for(const name of ['Mc_Feed2','Mc_Feed1','Mc_Score','BtnRepeat'])
   assert.ok(names.has(name),`frame ${frame} missing ${name}`);
 }
 const controllerActions=[1,2,3,4,5].map(frame=>{
  const file=path.join(audit,'scripts/DefineSprite_731',`frame_${frame}`,'DoAction.as');
  const bytes=read(file),text=bytes.toString('utf8');
  assert.ok(text.includes('stop()'),`frame ${frame} missing stop`);
  if(frame>1)assert.ok(!text.includes('nextFrame()')&&!text.includes('gotoAndStop(3)')&&
   !text.includes('gotoAndStop(5)'),`unexpected controller result navigation ${frame}`);
  return {frame,path:file,sha256:sha(bytes)};
 });
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  inputs:{source:{path:source,sha256:expected.source},xml:{path:xml,sha256:expected.xml},
   cardLayout:{path:layout,sha256:expected.layout},
   interactionContract:{path:interaction,sha256:expected.interaction}},
  rootPlacement:{sourceFrame:rootFrame,sourceDepth:3,sourceCharacterId:731,
   translationTwips:{x:8268,y:5686}},
  controllerSpriteId:731,controllerFrameCount:5,
  placementEventCount:placementEvents.length,removalEventCount:removalEvents.length,
  frames,controllerActions,
  sourceStaticFinding:'Frames 2/4 hold the two card games; frames 3/5 hold distinct result sprites and level selectors. No controller-frame DoAction directly advances from game to result.',
  status:'source-static-game-display-list-only',
  limitations:['Frame snapshots describe SWF placements after ShowFrame, not original-runtime visual or interactive state.',
   'Child timelines, button states, popup, score, fades, audio, and host-driven navigation require separate traces.',
   'No evidence here proves game-to-result transition, Replay, page completion, or product registration.'],
  currentJsRegistered:false,originalRuntimeAccepted:false,visualFidelityAccepted:false,
  audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p054-game-display-list-v1.mjs [--check|--write|--stdout]');
 const value=build(),bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.ok(read(output).equals(bytes),'game display-list drift');
 if(mode==='--stdout')process.stdout.write(bytes);
 else process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  frames:value.controllerFrameCount,placements:value.placementEventCount,
  removals:value.removalEventCount,bytes:bytes.length,sha256:sha(bytes)})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {build};
