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
const source=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/TS/L2TS04.swf');
const output=path.join(root,'packages/demos/src/generated/nms-l02-p057-display-list-v1.ts');
const SOURCE_SHA='9cc456a0af745dc31240b3a6d805e8e115c1c1c2725f851fca8e907a767820aa';
const XML_SHA='1f80986d0a4d0005162b74c3dcdba12003f8b62515e26440a8520bdc986a9d80';
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
 for(const characterId of [17,18,25,60,61,62,63]){
  const def=defs.get(characterId);
  assert.equal(def?.kind,'DefineButton2',`button definition ${characterId}`);
  const records=[...def.element.matchAll(/<Button\b[^>]*>/gu)];
  assert.equal(records.length,2,`button state records ${characterId}`);
  const hit=attributes(records[0][0]),terminator=attributes(records[1][0]);
  assert.deepEqual(Object.keys(terminator).sort(),['down','hitTest','over','up']);
  assert.equal(hit.hitTest,1);assert.equal(hit.objectID,16);assert.equal(hit.depth,1);
  assert.equal(defs.get(16)?.kind,'DefineShape','button hit shape');
  const close=def.element.indexOf('</Button>',records[0].index);
  assert(close>records[0].index,'button hit record end');
  const hitElement=def.element.slice(records[0].index,close+'</Button>'.length);
  const hitTransform=matrix(hitElement),hitAlpha256=alpha(hitElement);
  assert(hitTransform&&hitAlpha256===256,'supported nested hit transform and alpha');
  result[characterId]={sourceDefinitionSha256:def.sourceDefinitionSha256,
   hitCharacterId:16,hitDefinitionSha256:defs.get(16).sourceDefinitionSha256,
   hitTransform,hitAlpha256};
 }
 return result;
}
/** Parse every visual operation of the exact teaching sprite, failing closed on unknown tags. */
export function extractP057DisplayList(document){
 assert.equal((document.match(/<DefineSprite\b/gu)??[]).length,1,'no nested sprite timelines');
 const open=/<DefineSprite objectID="66" frames="328">/u.exec(document);
 assert(open,'P057 teaching sprite identity');
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
  assert(Number.isInteger(depth)&&depth>0&&frame<=328,`depth/frame ${tag}`);
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
 assert.equal(frame-1,328,'exact teaching ShowFrame count');
 assert.deepEqual({placements,updates,removals},{placements:117,updates:622,removals:6},'exact visual operation counts');
 assert.equal(events.length,745,'every visual operation represented');
 assert.equal((body.match(/<SoundStreamBlock\b/gu)??[]).length,324,'separate source sound blocks retained');
 assert.equal((body.match(/<SoundStreamHead\b/gu)??[]).length,1);
 assert.equal((body.match(/<End\s*\/>/gu)??[]).length,1);
 assert.doesNotMatch(body,/<(?:PlaceObject3?|RemoveObject|DefineSprite)\b/gu,'unsupported visual operation');
 const firstPlacement=characterId=>events.filter(e=>e.kind==='place'&&e.characterId===characterId)
  .map(e=>({frame:e.frame,depth:e.depth,morph:e.morph}));
 for(const [characterId,expected] of [[17,[{frame:5,depth:18,morph:4}]],
  [18,[{frame:5,depth:20,morph:4}]],[25,[{frame:67,depth:25,morph:66}]],
  [60,[{frame:97,depth:110,morph:96}]],[61,[{frame:97,depth:112,morph:96}]],
  [62,[{frame:97,depth:114,morph:96}]],[63,[{frame:97,depth:116,morph:96}]]])
  assert.deepEqual(firstPlacement(characterId),expected,`button placement ${characterId}`);
 return {events,buttons};
}
function xpath(xml,expression){return execFileSync('xmllint',['--nonet','--xpath',expression,xml],{encoding:'utf8'}).trim();}
export function buildP057DisplayList(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,'exact real source root required');
 const rootStat=fs.lstatSync(sourceRoot);
 assert(rootStat.isDirectory()&&!rootStat.isSymbolicLink()&&fs.realpathSync(sourceRoot)===sourceRoot,'physical source root');
 readBound(source,SOURCE_SHA,137055);
 const version=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(version.status,0);assert.match(version.stdout+version.stderr,/swfmill 0\.3\.6/u);
 const temporary=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p057-display-list-')));
 try{
  const xml=path.join(temporary,'movie.xml');execFileSync('swfmill',['swf2xml',source,xml]);
  const document=readBound(xml,XML_SHA,673565).toString('utf8');
  const domain='/swf/Header/tags/DefineSprite[@objectID="66"]/tags';
  assert.equal(xpath(xml,`count(${domain}/*)`),'1399','all direct sprite tags counted');
  for(const [tag,count] of Object.entries({PlaceObject2:739,RemoveObject2:6,
   ShowFrame:328,SoundStreamBlock:324,SoundStreamHead:1,End:1}))
   assert.equal(xpath(xml,`count(${domain}/${tag})`),String(count),`exact ${tag} count`);
  assert.equal(xpath(xml,'count(/swf/Header/tags/DefineSprite)'),'1','no nested sprite definition');
  const rootPlacement=xpath(xml,'/swf/Header/tags/PlaceObject2[@objectID="66"]');
  assert.match(rootPlacement,/<PlaceObject2 replace="0" depth="2" objectID="66" morph="5" name="animation">/u);
  assert.match(rootPlacement,/<Transform transX="7430" transY="5667"\/>/u);
  assert.equal(xpath(xml,'count(/swf/Header/tags/PlaceObject2[@objectID="66"]/preceding-sibling::ShowFrame)+1'),'6');
  assert.equal(xpath(xml,'/swf/Header/@framerate'),'framerate="12"');
  assert.equal(xpath(xml,'/swf/Header/@frames'),'frames="10"');
  const {events,buttons}=extractP057DisplayList(document);
  const metadata={animationId:'shared-nms002-l02-p057',sourceSwfSha256:SOURCE_SHA,
   sourceXmlSha256:XML_SHA,frameDomain:'sprite-66',frameCount:328,fps:12,
   rootFrameCount:10,rootPlacement:{frame:6,depth:2,characterId:66,transX:7430,transY:5667},
   eventCount:events.length,nestedSpriteCount:0,
   qualification:'source-static display-list and button-hit definitions only; no action, audio, or runtime parity'};
  return {metadata,events,buttons};
 }finally{fs.rmSync(temporary,{recursive:true});}
}
export function renderP057DisplayList({metadata,events,buttons}){
 return `// Generated by scripts/build-nms-l02-p057-display-list-v1.mjs; do not edit.\n`+
  `// Source-static display-list only; no runtime, audio, or acceptance claim.\n`+
  `export type P057DisplayEvent = Readonly<{frame:number;kind:'place'|'update'|'remove';depth:number;`+
  `characterId?:number;sourceKind?:string;sourceDefinitionSha256?:string;`+
  `transform?:Readonly<{scaleX:number;scaleY:number;transX:number;transY:number}>;`+
  `alpha256?:number;morph?:number;sourceTagSha256?:string}>;\n`+
  `export const P057_DISPLAY_SOURCE = ${JSON.stringify(metadata)} as const;\n`+
  `export const P057_NESTED_BUTTONS = ${JSON.stringify(buttons)} as const;\n`+
  `export const P057_DISPLAY_EVENTS: readonly P057DisplayEvent[] = ${JSON.stringify(events)};\n`;
}
function main(){
 const mode=process.argv[2]??'--check';
 assert(['--check','--write'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p057-display-list-v1.mjs [--check|--write]');
 const result=buildP057DisplayList(),bytes=Buffer.from(renderP057DisplayList(result));
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 else assert(fs.readFileSync(output).equals(bytes),'P057 display-list IR drift');
 console.log(JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  frames:328,events:result.events.length,bytes:bytes.length,sha256:sha(bytes)}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
