import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.join(root,'migrations/shared-nms002-l02-p054');
const graph=path.join(workspace,'audit/frame-domain-static-graph-v1.json');
const game=path.join(workspace,'audit/game-display-list-v1.json');
const cards=path.join(workspace,'audit/card-layout-v1.json');
const output=path.join(workspace,'audit/frame-domain-disposition.json');
const expected={graph:'541c11e12dd93c2819084f9ac57e8149947f3d7cdc1dc285735244d48697fb93',
 game:'8887c62a93824e851b2b6bba3779742ba43143b5c8e38b47c49b81c04fa6c40c',
 cards:'d34c6f2b89a99f110138c07b9b108ab96afa56db294a085a68a670d2cb034863'};
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
function build(){
 const sourceGraph=JSON.parse(read(graph,expected.graph));
 const display=JSON.parse(read(game,expected.game));
 const cardLayout=JSON.parse(read(cards,expected.cards));
 assert.equal(sourceGraph.totalDefinedSpriteCount,128);
 assert.equal(sourceGraph.staticRootReachableSpriteCount,65);
 assert.equal(display.rootPlacement.sourceFrame,6);
 const cardById=new Map(cardLayout.cards.map(card=>[card.sourceCharacterId,card]));
 const sites=new Map();
 let prior=new Map(),siteCount=0;
 for(const frame of display.frames){
  const current=new Map(frame.layers.map(layer=>[layer.depth,layer.sourceTagSha256]));
  for(const layer of frame.layers){
   if(prior.get(layer.depth)===layer.sourceTagSha256)continue;
   const id=layer.sourceCharacterId;
   if(!sites.has(id))sites.set(id,[]);
   sites.get(id).push({parentFrameDomainId:'sprite-731',sourceFrame:frame.frame,
    depth:layer.depth,sourceInstanceName:layer.sourceInstanceName});
   siteCount++;
  }
  prior=current;
 }
 assert.equal(siteCount,display.placementEventCount);
 const roles=new Map([[731,'two-level-game-controller'],[194,'correct-feedback'],
  [208,'wrong-feedback'],[648,'level-1-result-content'],[729,'level-2-result-content'],
  [101,'popup-content'],[227,'score-display']]);
 const domains=[{frameDomainId:'root',sourceCharacterId:null,
  sourceFrames:sourceGraph.rootFrameCount,placedFrom:[],placementSites:[],
  sourceRole:'preloader-and-page-entry',staticPlacementGraphMember:true,
  disposition:'unresolved',runtimeReachabilityAccepted:false,
  rawLocalFramesQueryable:false,originalNaturalTraceAccepted:false}];
 for(const row of sourceGraph.staticRootReachableSpriteDomains){
  const id=row.sourceCharacterId,card=cardById.get(id);
  const placementSites=id===731?[{parentFrameDomainId:'root',sourceFrame:6,depth:3,
   sourceInstanceName:''}]:sites.get(id)??[];
  domains.push({frameDomainId:`sprite-${id}`,sourceCharacterId:id,
   sourceFrames:row.frameCount,placedFrom:row.placedFrom,
   placementSites,sourceRole:card?`level-${card.level}-card-${card.sourceInstanceName}`:
    roles.get(id)??'static-graph-role-unreviewed',
   staticPlacementGraphMember:true,disposition:'unresolved',
   runtimeReachabilityAccepted:false,rawLocalFramesQueryable:false,
   originalNaturalTraceAccepted:false});
 }
 assert.equal(domains.length,66);
 const outside=sourceGraph.notInStaticPlacementGraphSpriteIds.map(id=>({
  frameDomainId:`sprite-${id}`,sourceCharacterId:id,
  staticPlacementGraphMember:false,dynamicOrButtonStateReachability:'unresolved',
  disposition:'unresolved'}));
 assert.equal(outside.length,63);
 assert.equal(cardLayout.cards.filter(card=>
  domains.some(domain=>domain.sourceCharacterId===card.sourceCharacterId)).length,24);
 for(const id of [194,208,648,729,731])
  assert.ok(domains.some(domain=>domain.sourceCharacterId===id),`important domain ${id}`);
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  sourceSha256:sourceGraph.source.sha256,
  inputs:{staticGraph:{path:graph,sha256:expected.graph},
   gameDisplayList:{path:game,sha256:expected.game},
   cardLayout:{path:cards,sha256:expected.cards}},
  totalDefinedSpriteCount:128,staticPlacementGraphDomainCount:66,
  outsideStaticPlacementGraphCount:outside.length,domains,
  outsideStaticPlacementGraph:outside,
  status:'source-static-enumeration-with-unresolved-runtime-dispositions',
  limitations:['Static placement in any declared source frame is not a natural runtime trace.',
   'Button-state and dynamically attached sprites may be absent from the static placement graph.',
   'No root-reachable domain has a final accepted runtime/fidelity disposition; strict acceptance remains blocked.'],
  originalRuntimeAccepted:false,strictComplete:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p054-frame-domain-disposition-v1.mjs [--check|--write|--stdout]');
 const value=build(),bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.ok(read(output).equals(bytes),'frame-domain disposition drift');
 if(mode==='--stdout')process.stdout.write(bytes);
 else process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  domains:value.staticPlacementGraphDomainCount,outside:value.outsideStaticPlacementGraphCount,
  bytes:bytes.length,sha256:sha(bytes)})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {build};
