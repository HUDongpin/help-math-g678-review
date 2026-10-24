#!/usr/bin/env node
/** P010 source-locked native text state. Structural evidence, not runtime parity. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gunzipSync} from 'node:zlib';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/RW/L6RW09.swf';
const SHA='96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14';
const SOURCE='migrations/shared-alg001-l06-p010/audit/source-v1';
const OUTPUT='migrations/shared-alg001-l06-p010/audit/text-state-v1';
const GENERATED='packages/demos/src/generated/alg-l06-p010-text-state-v1.ts';
const INPUTS=['source-audit-v1.json','source-text-v1.json','source-composition-v1.json',
  'public-tool-scripts-v1.json','swfmill-v1.xml.gz'].map(name=>`${SOURCE}/${name}`);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const bytes=file=>fs.readFileSync(path.join(ROOT,file));
const pin=file=>({path:file,bytes:bytes(file).length,sha256:hash(bytes(file))});
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const at=(object,id)=>{const found=object.find(item=>item.characterId===id);assert(found,`character ${id}`);return found;};

const EQUATION_DEPTHS=[9,8,7,6,5,4,3,10,2];
const TABLE_CUPS=[20,21,22,23,24,25];
const TABLE_MONEY=[26,27,28,29,30,31];
const GRAPH_CUPS=[33,34,35,36,37,38];
const GRAPH_MONEY=[39,40,41,42,43,44,45];

function shapeBounds(xml,id){
  const match=xml.match(new RegExp('<DefineShape(?:2|3|4)? objectID="'+id+'">\\s*<bounds>\\s*'
    +'<Rectangle left="(-?\\d+)" right="(-?\\d+)" top="(-?\\d+)" bottom="(-?\\d+)"'));
  assert(match,`shape ${id} source bounds`);
  return {left:+match[1],right:+match[2],top:+match[3],bottom:+match[4]};
}
function sourceState(){
  assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
  assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
  const swfPath=path.join(SOURCE_ROOT,SWF),stat=fs.lstatSync(swfPath);
  assert(stat.isFile()&&!stat.isSymbolicLink(),'ordinary source SWF');
  const swf=fs.readFileSync(swfPath);
  assert.equal(swf.length,114334);assert.equal(hash(swf),SHA);
  const audit=JSON.parse(bytes(INPUTS[0])),text=JSON.parse(bytes(INPUTS[1]));
  const composition=JSON.parse(bytes(INPUTS[2])),scripts=JSON.parse(bytes(INPUTS[3]));
  const xml=gunzipSync(bytes(INPUTS[4])).toString('utf8');
  assert.equal(audit.kind,'alg-l06-p010-source-audit-v1');
  assert.equal(audit.source.sha256,SHA);assert.equal(text.sourceSha256,SHA);
  assert.equal(audit.sourceText.definitionCount,42);
  for(const file of INPUTS.slice(1)){
    const fromAudit=audit.outputPins.find(p=>p.path===file);
    assert(fromAudit,`source audit pin ${file}`);assert.deepEqual(pin(file),fromAudit);
  }
  assert.equal(composition.main.domainId,'sprite-52');
  assert.equal(composition.main.declaredFrames,303);
  assert.equal(composition.main.rootEntryFrame,6);
  assert.deepEqual(composition.main.rootPlacement.matrix,[1,0,0,1,7390,5060]);
  assert.equal(text.summary.decodedRuns,44);assert.equal(text.summary.unresolvedRuns,0);
  assert.equal(scripts.sourceButtonAction.actionSha256,
    '549555e0e21a60e887e614e7ff3b03592d8a7f577c5ec25e6601f039050f49c8');
  assert.deepEqual([scripts.sourceButtonAction.sourceKey,scripts.sourceButtonAction.hostAPI,
    scripts.sourceButtonAction.sourceStopTarget],
    ['Function','DoHyperLinks','_root.animation_mc.animation']);
  const definitions=text.textDefinitions.map(def=>({characterId:def.characterId,
    text:def.runs?.map(run=>run.text).join('')??'',boundsTwips:def.boundsTwips,
    sourceTagSha256:def.sourceTagSha256}));
  assert.equal(definitions.length,42);
  const expected=new Map([[2,'Functions'],[4,'C'],[5,'0'],[6,'5'],[7,'.'],[8,'$'],
    [9,'='],[10,'M'],[12,'x'],[14,'Money '],[15,'Made '],[16,'(M)'],
    [17,'Lemonade '],[18,'Cups Sold '],[19,'(C)'],[49,'What are functions, and how are they used?'],
    [53,'Understanding Functions: Real World Activity']]);
  for(const [id,value] of expected)assert.equal(at(definitions,id).text,value,`source text ${id}`);
  const main=text.timelines.find(t=>t.timelineId==='sprite-52');assert(main);
  const event=new Map(main.events.map(e=>[e.eventId,e]));
  const textIds=new Set(definitions.map(def=>def.characterId));
  const instances=main.instances.filter(i=>textIds.has(i.characterId)).map(i=>({
    characterId:i.characterId,instanceId:i.instanceId,depth:i.depth,
    firstFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive,
    updates:i.updates.map(id=>{const e=event.get(id);assert(e);return {
      frame:e.frame,matrix:e.matrix??null,
      alphaMultiply:e.colorTransform?.multiply?.[3]??null,
      alphaAdd:e.colorTransform?.add?.[3]??null,
      sourceTagSha256:e.sourceTagSha256};}),
  }));
  assert.equal(instances.length,42);
  const byDepth=depth=>{const i=instances.find(x=>x.depth===depth);assert(i,`depth ${depth}`);return i;};
  const textAtDepth=depth=>at(definitions,byDepth(depth).characterId).text;
  assert.equal(EQUATION_DEPTHS.map(textAtDepth).join(''),'M=$0.50xC');
  assert.equal([12,13,14].map(textAtDepth).join(''),'Money Made (M)');
  assert.equal([15,16,17].map(textAtDepth).join(''),'Lemonade Cups Sold (C)');
  assert.deepEqual(TABLE_CUPS.map(id=>at(definitions,id).text),['20','30','40','50','60','70']);
  assert.deepEqual(TABLE_MONEY.map(id=>at(definitions,id).text),
    ['$10.00','$15.00','$20.00','$25.00','$30.00','$35.00']);
  assert.deepEqual(GRAPH_CUPS.map(id=>at(definitions,id).text),
    ['20','40','60','80','100','120']);
  assert.deepEqual(GRAPH_MONEY.map(id=>at(definitions,id).text),
    ['$0','$20','$40','$60','$80','$100','$120']);
  const maskInstance=main.instances.find(i=>i.characterId===47&&i.depth===30);
  assert(maskInstance&&maskInstance.firstFrame===268&&maskInstance.lastFrameExclusive===304);
  const maskPlacement=event.get(maskInstance.createdByEventId);
  assert.equal(maskPlacement.clipDepth,33);
  const mask={characterId:47,depth:30,clipDepth:33,
    sourceShapeTagSha256:at(text.shapeDefinitions,47).sourceTagSha256,
    boundsTwips:shapeBounds(xml,47),firstFrame:maskInstance.firstFrame,
    lastFrameExclusive:maskInstance.lastFrameExclusive,
    updates:maskInstance.updates.map(id=>{const e=event.get(id);assert(e.matrix);return {
      frame:e.frame,matrix:e.matrix,sourceTagSha256:e.sourceTagSha256};})};
  assert.equal(mask.updates.length,30);assert.equal(mask.updates.at(-1).frame,297);
  assert.equal(byDepth(32).characterId,49);assert.equal(byDepth(32).firstFrame,268);
  const button=main.instances.find(i=>i.characterId===51);
  assert(button&&button.depth===49&&button.firstFrame===268&&button.lastFrameExclusive===304);
  const sourceButton=at(text.buttonDefinitions,51);
  assert.equal(sourceButton.statePlacements.length,1);
  assert.equal(sourceButton.statePlacements[0].states.hitTest,true);
  assert.equal(sourceButton.statePlacements[0].states.up,false);
  const root=text.timelines.find(t=>t.timelineId==='root');assert(root);
  const offstage=root.instances.find(i=>i.characterId===53);
  const rootEvent=root.events.find(e=>e.eventId===offstage.createdByEventId);
  assert(rootEvent.matrix[5]+at(definitions,53).boundsTwips.bottom<0,
    'outlined source title text is offstage');
  const title=text.timelines.find(t=>t.timelineId==='sprite-55');assert(title);
  assert(title.instances.some(i=>i.characterId===54&&i.firstFrame===1));
  assert(root.instances.some(i=>i.characterId===55&&i.firstFrame===6));
  assert(at(text.shapeDefinitions,54).sourceTagSha256);
  return {schemaVersion:1,animationId:'shared-alg001-l06-p010',sourceSwfSha256:SHA,
    frameDomain:'sprite-52',frameCount:303,rootFrame:6,
    rootMatrix:composition.main.rootPlacement.matrix,
    stageTwips:{left:0,right:16000,top:0,bottom:12000},definitions,instances,mask,
    groups:{headingDepths:[1],equationDepths:EQUATION_DEPTHS,
      tableHeaderCupDepths:[15,16,17],tableHeaderMoneyDepths:[12,13,14],
      tableCupDepths:[18,19,20,21,22,23],tableMoneyDepths:[24,25,26,27,28,29],
      graphCupDepths:[35,36,37,38,39,40],graphMoneyDepths:[41,42,43,44,45,46,47],
      questionDepths:[32]},
    semanticText:{equation:'M = $0.50 x C',
      tableCupHeader:'Lemonade Cups Sold (C)',tableMoneyHeader:'Money Made (M)',
      question:at(definitions,49).text},
    button:{characterId:51,firstFrame:268,lastFrameExclusive:304,sourceKey:'Function',
      sourceActionSha256:sourceButton.actions.sha256,sourceVisualState:'hit-test-only',
      hostApi:'DoHyperLinks',actualHostEffect:'unresolved'},
    questionReadableFromFrame:mask.updates.at(-1).frame,
    offstageTitle:{characterId:53,text:at(definitions,53).text,
      sourceShapeIds:[54],visibility:'offstage',renderedSourceRole:'outlined-shape-54'},
    policy:{language:'source-en-only',alphaZeroHidden:true,
      question:'native full sentence waits until final source mask update; conservative text bounds remain partially clipped',
      sourceButton:'native visible Function action represents the authored hit-only control',
      originalRuntimeAccepted:false}};
}

const RUNTIME=String.raw`
export type P010TextVisibility='hidden'|'partial'|'full';
type Rect={left:number;right:number;top:number;bottom:number};
const active=(f:number,a:number,b:number)=>f>=a&&f<b;
function rect(b:Rect,m:readonly number[]):Rect {
 const points=[[b.left,b.top],[b.right,b.top],[b.left,b.bottom],[b.right,b.bottom]]
  .map(([x,y])=>[m[0]*x+m[2]*y+m[4],m[1]*x+m[3]*y+m[5]]);
 return {left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),
  top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
}
const intersects=(a:Rect,b:Rect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
const contains=(a:Rect,b:Rect)=>b.left>=a.left&&b.right<=a.right&&b.top>=a.top&&b.bottom<=a.bottom;
function maskAt(frame:number):Rect|null {
 const mask=P010_TEXT_STATE_SOURCE.mask;
 if(!active(frame,mask.firstFrame,mask.lastFrameExclusive))return null;
 const last=mask.updates.filter(u=>u.frame<=frame).at(-1);
 return last?rect(mask.boundsTwips,last.matrix):null;
}
export function p010TextState(frame:number){
 if(!Number.isInteger(frame)||frame<1||frame>P010_TEXT_STATE_SOURCE.frameCount)
  throw new RangeError('P010_TEXT_FRAME_OUT_OF_RANGE');
 const source=P010_TEXT_STATE_SOURCE;
 const definition=new Map(source.definitions.map(d=>[d.characterId,d]));
 const stage:Rect={left:-source.rootMatrix[4],right:source.stageTwips.right-source.rootMatrix[4],
  top:-source.rootMatrix[5],bottom:source.stageTwips.bottom-source.rootMatrix[5]};
 const clip=maskAt(frame);
 const instances=source.instances.map(i=>{
  const d=definition.get(i.characterId)!;
  let matrix:readonly number[]|null=null,alpha=0;
  if(active(frame,i.firstFrame,i.lastFrameExclusive))for(const u of i.updates){
   if(u.frame>frame)break;
   if(u.matrix)matrix=u.matrix;
   if(u.alphaMultiply!==null)alpha=Math.max(0,Math.min(1,
    (u.alphaMultiply+(u.alphaAdd??0))/256));
   else if(u.frame===i.firstFrame)alpha=1;
  }
  const bounds=matrix?rect(d.boundsTwips,matrix):null;
  const limits:Rect[]=[stage];
  if(clip&&i.depth>source.mask.depth&&i.depth<=source.mask.clipDepth)limits.push(clip);
  let visibility:P010TextVisibility='hidden';
  if(bounds&&alpha>0&&limits.every(limit=>intersects(bounds,limit)))
   visibility=alpha===1&&limits.every(limit=>contains(limit,bounds))?'full':'partial';
  return {characterId:i.characterId,depth:i.depth,instanceId:i.instanceId,
   text:d.text,sourceTextId:'character-'+i.characterId,sourceBoundsTwips:bounds,
   alpha,visibility};
 });
 const byDepth=new Map(instances.map(i=>[i.depth,i]));
 const select=(depths:readonly number[])=>depths.map(depth=>byDepth.get(depth)!);
 const group=(depths:readonly number[],text:string)=>{
  const members=select(depths);
  const visibility:P010TextVisibility=members.every(m=>m.visibility==='full')?'full':
   members.some(m=>m.visibility!=='hidden')?'partial':'hidden';
  return {text,visibility,semanticVisible:visibility==='full',
   sourceTextIds:members.map(m=>m.sourceTextId),instanceIds:members.map(m=>m.instanceId),
   sourceAlpha:members.map(m=>m.alpha)};
 };
 const heading=group(source.groups.headingDepths,'Functions');
 const equation=group(source.groups.equationDepths,source.semanticText.equation);
 const tableHeaders={cups:group(source.groups.tableHeaderCupDepths,source.semanticText.tableCupHeader),
  money:group(source.groups.tableHeaderMoneyDepths,source.semanticText.tableMoneyHeader)};
 const tableRows=source.groups.tableCupDepths.map((cupDepth,index)=>{
  const cups=group([cupDepth],byDepth.get(cupDepth)!.text);
  const moneyDepth=source.groups.tableMoneyDepths[index];
  const money=group([moneyDepth],byDepth.get(moneyDepth)!.text);
  return {id:'row-'+index,cups,money,semanticVisible:tableHeaders.cups.semanticVisible&&
   tableHeaders.money.semanticVisible&&cups.semanticVisible&&money.semanticVisible};
 });
 const graph={cups:select(source.groups.graphCupDepths).map(m=>group([m.depth],m.text)),
  money:select(source.groups.graphMoneyDepths).map(m=>group([m.depth],m.text))};
 const rawQuestion=group(source.groups.questionDepths,source.semanticText.question);
 const question={...rawQuestion,
  semanticVisible:frame>=source.questionReadableFromFrame&&rawQuestion.visibility!=='hidden',
  disposition:'modern readable sentence after final authored mask update' as const};
 const functionControl={sourceCharacterId:source.button.characterId,sourceKey:source.button.sourceKey,
  sourceVisualState:source.button.sourceVisualState,
  available:active(frame,source.button.firstFrame,source.button.lastFrameExclusive)&&
   heading.semanticVisible};
 return {animationId:source.animationId,sourceSwfSha256:source.sourceSwfSha256,
  frameDomain:source.frameDomain,rootFrame:source.rootFrame,frame,instances,
  heading,equation,tableHeaders,tableRows,graph,question,functionControl,
  languagePolicy:'source-en-only' as const};
}
`;
const SOURCE_TYPE=String.raw`
type P010Rect={left:number;right:number;top:number;bottom:number};
type P010Source={schemaVersion:number;animationId:string;sourceSwfSha256:string;
 frameDomain:string;frameCount:number;rootFrame:number;rootMatrix:number[];stageTwips:P010Rect;
 definitions:Array<{characterId:number;text:string;boundsTwips:P010Rect;sourceTagSha256:string}>;
 instances:Array<{characterId:number;instanceId:string;depth:number;firstFrame:number;
  lastFrameExclusive:number;updates:Array<{frame:number;matrix:number[]|null;
  alphaMultiply:number|null;alphaAdd:number|null;sourceTagSha256:string}>}>;
 mask:{characterId:number;depth:number;clipDepth:number;boundsTwips:P010Rect;
  firstFrame:number;lastFrameExclusive:number;updates:Array<{frame:number;matrix:number[];sourceTagSha256:string}>};
 groups:{headingDepths:number[];equationDepths:number[];tableHeaderCupDepths:number[];
  tableHeaderMoneyDepths:number[];tableCupDepths:number[];tableMoneyDepths:number[];
  graphCupDepths:number[];graphMoneyDepths:number[];questionDepths:number[]};
 semanticText:{equation:string;tableCupHeader:string;tableMoneyHeader:string;question:string};
 button:{characterId:number;firstFrame:number;lastFrameExclusive:number;sourceKey:'Function';
  sourceActionSha256:string;sourceVisualState:string;hostApi:string;actualHostEffect:string};
 questionReadableFromFrame:number;offstageTitle:{characterId:number;text:string;
  sourceShapeIds:number[];visibility:string;renderedSourceRole:string};
 policy:Record<string,string|boolean>};
`;
function outputs(){
  const source=sourceState();
  const generated=Buffer.from('/* Generated by scripts/build-alg-l06-p010-text-state-v1.mjs. Do not edit. */\n'
    +SOURCE_TYPE+'\nexport const P010_TEXT_STATE_SOURCE:P010Source=JSON.parse('
    +JSON.stringify(JSON.stringify(source))+');\n'+RUNTIME);
  const audit={schemaVersion:1,kind:'alg-l06-p010-text-state-audit-v1',
    animationId:source.animationId,sourceSwfSha256:SHA,
    inputs:INPUTS.map(pin),sourceSwf:{path:path.join(SOURCE_ROOT,SWF),bytes:114334,sha256:SHA},
    output:{path:GENERATED,bytes:generated.length,sha256:hash(generated)},
    semanticReveal:{headingFull:29,equationFull:148,tableFull:167,graphFull:198,
      questionMaskStarts:268,questionReadableFrom:source.questionReadableFromFrame,
      functionControlPlaced:source.button.firstFrame},
    limits:['Source placement, alpha, bounds and one authored mask only; no original-runtime parity.',
      'Full native question sentence waits for the last mask update, a modern readability decision.',
      'Function button was hit-test-only in the SWF; the native visible control is a modern accessible presentation.',
      'Source language English only; Spanish route uses marked English fallback.']};
  return new Map([[GENERATED,generated],
    [`${OUTPUT}/source-ir-v1.json`,json(source)],
    [`${OUTPUT}/text-state-audit-v1.json`,json(audit)]]);
}
export {outputs as p010TextStateOutputs};
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  assert(process.argv.length===3&&['--write','--check'].includes(process.argv[2]),
    'Usage: --write | --check');
  const generated=outputs();
  for(const [relative,content] of generated){const target=path.join(ROOT,relative);
    if(process.argv[2]==='--write'&&!fs.existsSync(target)){
      fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,content,{flag:'wx'});
    }
    assert.deepEqual(fs.readFileSync(target),content,`immutable P010 text state ${relative}`);
  }
  console.log(JSON.stringify({status:'P010_SOURCE_TEXT_STATE_VERIFIED_NOT_ADMITTED',
    outputs:[...generated].map(([name,data])=>({path:name,bytes:data.length,sha256:hash(data)}))}));
}
