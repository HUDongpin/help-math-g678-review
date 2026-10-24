#!/usr/bin/env node
/** Exact source-static display-list extraction. No runtime or audio claim. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const source=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/TS/L2TS05.swf');
const output=path.join(root,'packages/demos/src/generated/nms-l02-p058-display-list-v1.ts');
const timeline=path.join(root,'packages/demos/src/timelines/shared-nms002-l02-p058-display-list.ts');
const auditPath=path.join(root,'output/nms-l02-p058-source-20260927/source-audit.json');
const receiptPath=path.join(root,'output/nms-l02-p058-source-20260927/display-list-generation-v1.json');
const SOURCE_SHA='fc26d0a7049db6b8ce5532cfbed1fcb380c75e503d9c7cb7974bea73b8505d57';
const XML_SHA='02f23df6e985f9855e8b9df7e392ee25a8c36f4239861509bc8908221b17ba90';
const AUDIT_SHA='de06df9ad2434071d8470d14694e2c79543ae5515fdd43df30f1f4809639047a';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

function readBound(file,expected,size){
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 if(size!==undefined)assert.equal(Number(before.size),size,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 assert.equal(sha(bytes),expected,file);
 return bytes;
}
function attributes(tag){
 return Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
  .map(match=>[match[1],/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu.test(match[2])?Number(match[2]):match[2]]));
}
function exactAttributes(values,allowed,label){
 assert(Object.keys(values).every(key=>allowed.includes(key)),`unsupported ${label} attribute`);
}
function matrix(element){
 const matches=[...element.matchAll(/<Transform\b[^>]*\/>/gu)];
 assert(matches.length<=1,'one direct transform');
 if(!matches.length)return undefined;
 const values=attributes(matches[0][0]);
 exactAttributes(values,['scaleX','scaleY','transX','transY'],'matrix');
 const result={scaleX:values.scaleX??1,scaleY:values.scaleY??1,
  transX:values.transX??0,transY:values.transY??0};
 assert(Object.values(result).every(Number.isFinite),'finite matrix');
 return result;
}
function alpha(element){
 const matches=[...element.matchAll(/<ColorTransform2\b[^>]*\/>/gu)];
 assert(matches.length<=1,'one direct color transform');
 if(!matches.length)return undefined;
 const values=attributes(matches[0][0]);
 exactAttributes(values,['factorRed','factorGreen','factorBlue','factorAlpha'],'color transform');
 for(const key of ['factorRed','factorGreen','factorBlue'])assert.equal(values[key]??256,256,`unsupported ${key}`);
 const result=values.factorAlpha??256;
 assert(Number.isInteger(result)&&result>=0&&result<=256,'source alpha factor');
 return result;
}
function definitions(document){
 const found=new Map();
 for(const match of document.matchAll(/<(Define[A-Za-z0-9]+)\b[^>]*\bobjectID="(\d+)"[^>]*>/gu)){
  const kind=match[1],characterId=Number(match[2]);
  assert(!found.has(characterId),`duplicate character ${characterId}`);
  const close=document.indexOf(`</${kind}>`,match.index+match[0].length);
  assert(close>match.index,`definition end ${characterId}`);
  const element=document.slice(match.index,close+kind.length+3);
  found.set(characterId,{kind,element,sourceDefinitionSha256:sha(Buffer.from(element))});
 }
 return found;
}
function nestedButtons(defs){
 const result={};
 for(const characterId of [22,27,28,29,30,33,36]){
  const def=defs.get(characterId);
  assert.equal(def?.kind,'DefineButton2',`button definition ${characterId}`);
  const records=[...def.element.matchAll(/<Button\b[^>]*>/gu)];
  assert.equal(records.length,2,`button state records ${characterId}`);
  const hit=attributes(records[0][0]),terminator=attributes(records[1][0]);
  assert.deepEqual(Object.keys(terminator).sort(),['down','hitTest','over','up']);
  assert.equal(hit.hitTest,1);assert.equal(hit.objectID,21);assert.equal(hit.depth,1);
  assert.equal(defs.get(21)?.kind,'DefineShape','button hit shape');
  const close=def.element.indexOf('</Button>',records[0].index);
  assert(close>records[0].index,'button hit record end');
  const hitElement=def.element.slice(records[0].index,close+'</Button>'.length);
  const hitTransform=matrix(hitElement),hitAlpha256=alpha(hitElement);
  assert(hitTransform&&hitAlpha256===256,'supported nested hit transform and alpha');
  result[characterId]={sourceDefinitionSha256:def.sourceDefinitionSha256,
   hitCharacterId:21,hitDefinitionSha256:defs.get(21).sourceDefinitionSha256,
   hitTransform,hitAlpha256};
 }
 return result;
}
/** Parse every visual operation of the exact teaching sprite, failing closed on unknown tags. */
export function extractP058DisplayList(document){
 assert.equal((document.match(/<DefineSprite\b/gu)??[]).length,1,'no nested sprite timelines');
 const open=/<DefineSprite objectID="37" frames="274">/u.exec(document);
 assert(open,'P058 teaching sprite identity');
 const end=document.indexOf('</DefineSprite>',open.index+open[0].length);
 assert(end>open.index,'teaching sprite end');
 const body=document.slice(open.index+open[0].length,end);
 const defs=definitions(document),buttons=nestedButtons(defs),active=new Map(),events=[];
 // A direct-child tag count below independently closes the operation inventory.
 const tokens=[...body.matchAll(/<PlaceObject2\b[^>]*>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu)];
 let frame=1,placements=0,updates=0,removals=0;
 for(const token of tokens){
  const tag=token[0];
  if(tag.startsWith('<ShowFrame')){frame++;continue;}
  const fields=attributes(tag),depth=fields.depth;
  assert(Number.isInteger(depth)&&depth>0&&frame<=274,`depth/frame ${tag}`);
  if(tag.startsWith('<RemoveObject2')){
   exactAttributes(fields,['depth'],'remove');
   assert(active.delete(depth),`remove absent depth ${depth} frame ${frame}`);
   events.push({frame,kind:'remove',depth,sourceTagSha256:sha(Buffer.from(tag))});removals++;continue;
  }
  exactAttributes(fields,['replace','depth','objectID','morph'],'placement');
  const close=body.indexOf('</PlaceObject2>',token.index);
  assert(close>token.index,'placement end');
  const element=body.slice(token.index,close+'</PlaceObject2>'.length);
  const visualChildren=[...element.matchAll(/<(transform|colorTransform)>/gu)].map(item=>item[1]);
  assert(visualChildren.length<=2&&new Set(visualChildren).size===visualChildren.length,'one supported transform/color');
  const inner=element.slice(tag.length,-'</PlaceObject2>'.length)
   .replace(/<transform>\s*<Transform\b[^>]*\/>\s*<\/transform>/gu,'')
   .replace(/<colorTransform>\s*<ColorTransform2\b[^>]*\/>\s*<\/colorTransform>/gu,'').trim();
  assert.equal(inner,'','unsupported placement child or nested visual effect');
  const transform=matrix(element),alpha256=alpha(element);
  if(fields.replace===0){
   assert(Number.isInteger(fields.objectID)&&!active.has(depth)&&transform,
    `placement overlap or missing character/transform ${depth} frame ${frame}`);
   const definition=defs.get(fields.objectID);
   assert(definition&&definition.kind!=='DefineSprite',`unsupported nested character ${fields.objectID}`);
   active.set(depth,fields.objectID);
   events.push({frame,kind:'place',depth,characterId:fields.objectID,sourceKind:definition.kind,
    sourceDefinitionSha256:definition.sourceDefinitionSha256,transform,alpha256:alpha256??256,
    ...(fields.morph===undefined?{}:{morph:fields.morph}),
    sourceTagSha256:sha(Buffer.from(element))});placements++;
  }else{
   assert.equal(fields.replace,1,`unsupported placement mode frame ${frame}`);
   assert.equal(fields.objectID,undefined,`replacement character frame ${frame}`);
   assert.equal(fields.morph,undefined,`update morph frame ${frame}`);
   assert(active.has(depth)&&(transform||alpha256!==undefined),`update absent depth ${depth} frame ${frame}`);
   events.push({frame,kind:'update',depth,...(transform?{transform}:{}),
    ...(alpha256===undefined?{}:{alpha256}),sourceTagSha256:sha(Buffer.from(element))});updates++;
  }
 }
 assert.equal(frame-1,274,'exact teaching ShowFrame count');
 assert.deepEqual({placements,updates,removals},{placements:39,updates:129,removals:7},'exact visual operation counts');
 assert.equal(events.length,175,'every visual operation represented');
 assert.equal((body.match(/<SoundStreamBlock\b/gu)??[]).length,265,'separate source sound blocks retained');
 assert.equal((body.match(/<SoundStreamHead\b/gu)??[]).length,1);
 assert.equal((body.match(/<End\s*\/>/gu)??[]).length,1);
 assert.doesNotMatch(body,/<(?:PlaceObject3?|RemoveObject|DefineSprite)\b/gu,'unsupported visual operation');
 const firstPlacement=characterId=>events.filter(e=>e.kind==='place'&&e.characterId===characterId)
  .map(e=>({frame:e.frame,depth:e.depth,morph:e.morph}));
 for(const [characterId,expected] of [[22,[{frame:103,depth:23,morph:102}]],
  [27,[{frame:139,depth:30,morph:138}]],[28,[{frame:139,depth:32,morph:138}]],
  [29,[{frame:139,depth:34,morph:138}]],[30,[{frame:139,depth:36,morph:138}]],
  [33,[{frame:237,depth:41,morph:236}]],[36,[{frame:242,depth:45,morph:241}]]])
  assert.deepEqual(firstPlacement(characterId),expected,`button placement ${characterId}`);
 const button36=events.filter(event=>event.depth===45);
 assert.deepEqual(button36.map(({frame,kind})=>({frame,kind})),
  [{frame:242,kind:'place'},{frame:243,kind:'remove'}],
  'second Show button has one source frame only');
 for(const [depth,frames] of [[43,[242,243,244,245,246,247]],[44,[242,243,244,245,246,247]]])
  assert.deepEqual(events.filter(event=>event.depth===depth).map(event=>event.frame),frames,
   `flashing emphasis depth ${depth}`);
 return {events,buttons};
}
function xpath(xml,expression){return execFileSync('xmllint',['--nonet','--xpath',expression,xml],{encoding:'utf8'}).trim();}
export function buildP058DisplayList(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,'exact real source root required');
 const rootStat=fs.lstatSync(sourceRoot);
 assert(rootStat.isDirectory()&&!rootStat.isSymbolicLink()&&fs.realpathSync(sourceRoot)===sourceRoot,'physical source root');
 const sourceBytes=readBound(source,SOURCE_SHA,113754);
 assert.equal(sourceBytes.subarray(0,3).toString('ascii'),'CWS','compressed Flash source');
 assert.equal(sourceBytes[3],6,'exact SWF version');
 const audit=JSON.parse(readBound(auditPath,AUDIT_SHA,22193).toString('utf8'));
 assert.equal(audit.kind,'nms-l02-p058-source-static-audit-v1');
 assert.equal(audit.source.sha256,SOURCE_SHA);
 assert.equal(audit.source.bytes,113754);
 assert.equal(audit.sourceStructure.rootSprite.characterId,37);
 assert.equal(audit.sourceStructure.teachingFrameCount,274);
 assert.deepEqual(audit.sourceStructure.spriteTagCounts,
  {SoundStreamHead:1,PlaceObject2:168,ShowFrame:274,SoundStreamBlock:265,RemoveObject2:7,End:1});
 const version=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(version.status,0);assert.match(version.stdout+version.stderr,/swfmill 0\.3\.6/u);
 const temporary=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p058-display-list-')));
 try{
  const xml=path.join(temporary,'movie.xml');execFileSync('swfmill',['swf2xml',source,xml]);
  const document=readBound(xml,XML_SHA,489044).toString('utf8');
  const domain='/swf/Header/tags/DefineSprite[@objectID="37"]/tags';
  assert.equal(xpath(xml,`count(${domain}/*)`),'716','all direct sprite tags counted');
  for(const [tag,count] of Object.entries({PlaceObject2:168,RemoveObject2:7,
   ShowFrame:274,SoundStreamBlock:265,SoundStreamHead:1,End:1}))
   assert.equal(xpath(xml,`count(${domain}/${tag})`),String(count),`exact ${tag} count`);
  assert.equal(xpath(xml,'count(/swf/Header/tags/DefineSprite)'),'1','no nested sprite definition');
  const rootPlacement=xpath(xml,'/swf/Header/tags/PlaceObject2[@objectID="37"]');
  assert.match(rootPlacement,/<PlaceObject2 replace="0" depth="2" objectID="37" morph="5" name="animation">/u);
  assert.match(rootPlacement,/<Transform scaleX="1.000045776367188" scaleY="1.000000000000000" transX="7477" transY="5666"\/>/u);
  assert.equal(xpath(xml,'count(/swf/Header/tags/PlaceObject2[@objectID="37"]/preceding-sibling::ShowFrame)+1'),'6');
  assert.equal(xpath(xml,'/swf/Header/@framerate'),'framerate="12"');
  assert.equal(xpath(xml,'/swf/Header/@frames'),'frames="10"');
  assert.equal(xpath(xml,'/swf/@version'),'version="6"');
  assert.equal(xpath(xml,'/swf/Header/size/Rectangle/@right'),'right="16000"');
  assert.equal(xpath(xml,'/swf/Header/size/Rectangle/@bottom'),'bottom="12000"');
  const {events,buttons}=extractP058DisplayList(document);
  const metadata={animationId:'shared-nms002-l02-p058',sourceSwfSha256:SOURCE_SHA,
   sourceXmlSha256:XML_SHA,sourceAuditSha256:AUDIT_SHA,frameDomain:'sprite-37',frameCount:274,fps:12,
   stage:{width:800,height:600},rootFrameCount:10,
   rootPlacement:{frame:6,depth:2,characterId:37,scaleX:1.000045776367188,scaleY:1,transX:7477,transY:5666},
   eventCount:events.length,nestedSpriteCount:0,
   qualification:'source-static display-list and button-hit definitions only; no action, audio, or runtime parity'};
  return {metadata,events,buttons};
 }finally{fs.rmSync(temporary,{recursive:true});}
}
export function renderP058DisplayList({metadata,events,buttons}){
 return `// Generated by scripts/build-nms-l02-p058-display-list-v1.mjs; do not edit.\n`+
  `// Source-static display-list only; no runtime, audio, or acceptance claim.\n`+
  `export type P058DisplayEvent = Readonly<{frame:number;kind:'place'|'update'|'remove';depth:number;`+
  `characterId?:number;sourceKind?:string;sourceDefinitionSha256?:string;`+
  `transform?:Readonly<{scaleX:number;scaleY:number;transX:number;transY:number}>;`+
  `alpha256?:number;morph?:number;sourceTagSha256?:string}>;\n`+
  `export const P058_DISPLAY_SOURCE = ${JSON.stringify(metadata)} as const;\n`+
  `export const P058_NESTED_BUTTONS = ${JSON.stringify(buttons)} as const;\n`+
  `export const P058_DISPLAY_EVENTS: readonly P058DisplayEvent[] = ${JSON.stringify(events)};\n`;
}
function main(){
 const mode=process.argv[2]??'--check';
 assert(['--check','--write'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p058-display-list-v1.mjs [--check|--write]');
 const result=buildP058DisplayList(),bytes=Buffer.from(renderP058DisplayList(result));
 const pin=file=>({path:path.relative(root,file),bytes:fs.statSync(file).size,sha256:sha(fs.readFileSync(file))});
 const receipt={schemaVersion:1,kind:'nms-l02-p058-display-list-generation-v1',
  status:'source-static-only-no-registration',animationId:'shared-nms002-l02-p058',
  sourceRoot,source:{path:'G6-G8-shared/NMS002/L2/TS/L2TS05.swf',bytes:113754,sha256:SOURCE_SHA},
  extractedXml:{path:'output/nms-l02-p058-source-20260927/extraction/swfmill.xml',
   bytes:489044,sha256:XML_SHA},sourceAudit:pin(auditPath),
  generator:pin(fileURLToPath(import.meta.url)),timeline:pin(timeline),
  generated:{path:path.relative(root,output),bytes:bytes.length,sha256:sha(bytes)},
  sprite:{characterId:37,frameCount:274,fps:12,rootBeginFrame:6,
   placements:39,updates:129,removals:7,events:175},
  transientSecondShow:{characterId:36,depth:45,placedFrame:242,removedFrame:243},
  qualification:'source-static display-list only; button actions, audio, original runtime, fidelity, and acceptance unestablished'};
 const receiptBytes=Buffer.from(JSON.stringify(receipt,null,2)+'\n');
 if(mode==='--write'){
  assert(!fs.existsSync(output)&&!fs.existsSync(receiptPath),'new outputs only');
  fs.writeFileSync(output,bytes,{flag:'wx'});
  try{fs.writeFileSync(receiptPath,receiptBytes,{flag:'wx'});}
  catch(error){if(fs.readFileSync(output).equals(bytes))fs.unlinkSync(output);throw error;}
 }else{
  assert(fs.readFileSync(output).equals(bytes),'P058 display-list IR drift');
  assert(fs.readFileSync(receiptPath).equals(receiptBytes),'P058 display-list receipt drift');
 }
 console.log(JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  receipt:path.relative(root,receiptPath),frames:274,events:result.events.length,
  bytes:bytes.length,sha256:sha(bytes)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
