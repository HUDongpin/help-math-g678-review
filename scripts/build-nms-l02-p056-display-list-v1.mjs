import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const source=path.join(sourceRoot,'G6-G8-shared/NMS002/L2/TS/L2TS03.swf');
const output=path.join(root,'packages/demos/src/generated/nms-l02-p056-display-list-v1.ts');
const sourceSha256='a1872d6c20987340889c1077d6720cbfe046faa3b5228164987e0834f3c639be';
const xmlSha256='622750694506d4498891795b79b22385f45dfe84d7693f27ef78cc977335b3da';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

function readBound(file,expected){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 assert.equal(sha(bytes),expected,file);
 return bytes;
}
function attributes(tag){
 return Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
  .map(match=>[match[1],/^-?\d+(?:\.\d+)?$/u.test(match[2])?Number(match[2]):match[2]]));
}
function matrix(element){
 const tag=/<Transform\b[^>]*\/>/u.exec(element)?.[0];
 if(!tag)return undefined;
 const values=attributes(tag);
 assert.ok(Object.keys(values).every(key=>['scaleX','scaleY','transX','transY'].includes(key)));
 return {scaleX:values.scaleX??1,scaleY:values.scaleY??1,
  transX:values.transX??0,transY:values.transY??0};
}
function alpha(element){
 const tag=/<ColorTransform2\b[^>]*\/>/u.exec(element)?.[0];
 if(!tag)return undefined;
 const values=attributes(tag);
 assert.ok(Object.keys(values).every(key=>
  ['factorRed','factorGreen','factorBlue','factorAlpha'].includes(key)));
 for(const key of ['factorRed','factorGreen','factorBlue'])assert.equal(values[key]??256,256,key);
 return values.factorAlpha??256;
}
function extract(document){
 const open=/<DefineSprite objectID="24" frames="(\d+)">/u.exec(document);
 assert.ok(open&&Number(open[1])===234,'P056 teaching sprite identity changed');
 const end=document.indexOf('</DefineSprite>',open.index+open[0].length);
 assert.ok(end>open.index);
 const body=document.slice(open.index+open[0].length,end);
 const definitions=new Map([...document.matchAll(/<(Define[A-Za-z0-9]+)\b[^>]*\bobjectID="(\d+)"/gu)]
  .map(match=>[Number(match[2]),match[1]]));
 const active=new Map(),events=[];
 let frame=1,placements=0,removals=0,updates=0;
 for(const token of body.matchAll(/<PlaceObject2\b[^>]*>|<RemoveObject2\b[^>]*\/>|<ShowFrame\s*\/>/gu)){
  const tag=token[0];
  if(tag.startsWith('<ShowFrame')){frame++;continue;}
  const fields=attributes(tag),depth=fields.depth;
  assert.ok(Number.isInteger(depth)&&depth>0&&frame<=234,tag);
  if(tag.startsWith('<RemoveObject2')){
   assert.ok(active.delete(depth),`P056 remove absent depth ${depth} frame ${frame}`);
   events.push({frame,kind:'remove',depth});removals++;continue;
  }
  const close=body.indexOf('</PlaceObject2>',token.index);
  assert.ok(close>token.index);
  const element=body.slice(token.index,close+'</PlaceObject2>'.length);
  const transform=matrix(element),alpha256=alpha(element);
  if(fields.replace===0){
   assert.ok(Number.isInteger(fields.objectID)&&!active.has(depth)&&transform,
    `P056 invalid placement depth ${depth} frame ${frame}`);
   const sourceKind=definitions.get(fields.objectID);
   assert.ok(sourceKind,`P056 undefined character ${fields.objectID}`);
   active.set(depth,fields.objectID);
   events.push({frame,kind:'place',depth,characterId:fields.objectID,sourceKind,
    transform,alpha256:alpha256??256,
    ...(fields.morph===undefined?{}:{morph:fields.morph}),
    sourceTagSha256:sha(Buffer.from(element))});placements++;
  }else{
   assert.equal(fields.replace,1,`P056 unexpected PlaceObject2 mode frame ${frame}`);
   assert.equal(fields.objectID,undefined,`P056 replacement character frame ${frame}`);
   assert.ok(active.has(depth)&&(transform||alpha256!==undefined),
    `P056 update absent depth ${depth} frame ${frame}`);
   events.push({frame,kind:'update',depth,
    ...(transform?{transform}:{}),...(alpha256===undefined?{}:{alpha256}),
    sourceTagSha256:sha(Buffer.from(element))});updates++;
  }
 }
 assert.equal(frame-1,234,'P056 ShowFrame count changed');
 assert.deepEqual({placements,updates,removals},{placements:26,updates:76,removals:6});
 assert.equal(events.length,108);
 assert.equal((body.match(/<SoundStreamBlock\b/gu)??[]).length,230);
 assert.doesNotMatch(body,/<(?:PlaceObject3?|RemoveObject)\b/gu,
  'unhandled P056 display operation');
 return events;
}
function build(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,
  'exact real G6-G8 source root required');
 const rootStat=fs.lstatSync(sourceRoot);
 assert.ok(rootStat.isDirectory()&&!rootStat.isSymbolicLink(),'source root must be a real directory');
 assert.equal(readBound(source,sourceSha256).length,100959);
 const version=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(version.status,0);
 assert.match(version.stdout+version.stderr,/swfmill 0\.3\.6/u);
 const temporary=fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(),'p056-display-list-')));
 try{
  const xml=path.join(temporary,'movie.xml');
  execFileSync('swfmill',['swf2xml',source,xml]);
  const document=readBound(xml,xmlSha256).toString('utf8');
  const rootPlacement=execFileSync('xmllint',['--nonet','--xpath',
   '/swf/Header/tags/PlaceObject2[@objectID="24"]',xml],{encoding:'utf8'});
  assert.match(rootPlacement,/<PlaceObject2 replace="0" depth="2" objectID="24"/u);
  assert.match(rootPlacement,/<Transform transX="8248" transY="5666"\/>/u);
  assert.equal(execFileSync('xmllint',['--nonet','--xpath',
   'count(/swf/Header/tags/PlaceObject2[@objectID="24"]/preceding-sibling::ShowFrame)+1',xml],
   {encoding:'utf8'}).trim(),'6');
  const events=extract(document);
  const metadata={animationId:'shared-nms002-l02-p056',sourceSwfSha256:sourceSha256,
   sourceXmlSha256:xmlSha256,frameDomain:'sprite-24',frameCount:234,
   rootPlacement:{frame:6,depth:2,characterId:24,transX:8248,transY:5666},
   eventCount:events.length};
  return {metadata,events};
 }finally{fs.rmSync(temporary,{recursive:true});}
}
function render({metadata,events}){
 return `// Generated by scripts/build-nms-l02-p056-display-list-v1.mjs; do not edit.\n`+
  `// Source-static display-list IR only; not runtime, audio, or Current-JS acceptance.\n`+
  `export type P056DisplayEvent = Readonly<{frame:number;kind:'place'|'update'|'remove';depth:number;`+
  `characterId?:number;sourceKind?:string;transform?:Readonly<{scaleX:number;scaleY:number;transX:number;transY:number}>;`+
  `alpha256?:number;morph?:number;sourceTagSha256?:string}>;\n`+
  `export const P056_DISPLAY_SOURCE = ${JSON.stringify(metadata)} as const;\n`+
  `export const P056_DISPLAY_EVENTS: readonly P056DisplayEvent[] = ${JSON.stringify(events)};\n`;
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p056-display-list-v1.mjs [--check|--write]');
 const result=build(),bytes=Buffer.from(render(result));
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 else assert.ok(fs.readFileSync(output).equals(bytes),'P056 display-list IR drift');
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  frames:result.metadata.frameCount,events:result.events.length,bytes:bytes.length,sha256:sha(bytes)})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {build,render};
