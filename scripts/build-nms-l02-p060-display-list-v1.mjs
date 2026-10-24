#!/usr/bin/env node
/** Source-locked P060 visual event extraction. It makes no runtime or fidelity claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelative='G6-G8-shared/NMS002/L2/TS/L2TS07.swf';
const sourceFile=path.join(sourceRoot,sourceRelative);
const sourceAudit='output/nms-l02-p060-source-20260927/source-audit.json';
const behaviorAudit='output/nms-l02-p060-behavior-20260927/source-behavior-v1.json';
const sourceXml='output/nms-l02-p060-source-20260927/extraction/swfmill.xml';
const generated='packages/demos/src/generated/nms-l02-p060-display-list-v1.ts';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const immutable={
 sourceSha:'80410162eebca2f85b9aaccec9c91c8d74250c0cba6051595579b4df206215c1',
 sourceAuditSha:'ab7eea1b04c185dd118240316a83361688dc301e73d0f973cbb3add76b79ef0d',
 behaviorAuditSha:'dc98a7606e3269c26364d3652a664e9006a712bffab5ac23cd19306871ec257c',
 xmlSha:'f5d1d7e2d151c049e3b7e96a9bdfa093fb3ef138be19744aa1fb071fd1754f78',
};
const domains=[391,139,190,388,104,205,217,245,258,275,296,322,354,368];

function readBound(file,expected,bytes){
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 if(bytes!==undefined)assert.equal(Number(before.size),bytes,file);
 const value=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 assert.equal(sha(value),expected,file);
 return value;
}
function attrs(tag){
 return Object.fromEntries([...tag.matchAll(/([A-Za-z][A-Za-z0-9]*)="([^"]*)"/gu)]
  .map(m=>[m[1],/^-?\d+(?:\.\d+)?(?:e[+-]?\d+)?$/iu.test(m[2])?Number(m[2]):m[2]]));
}
function only(value,keys,label){
 assert(Object.keys(value).every(key=>keys.includes(key)),`unsupported ${label}: ${JSON.stringify(value)}`);
}
function transform(element){
 const match=[...element.matchAll(/<Transform\b[^>]*\/>/gu)];
 assert(match.length<=1,'multiple transform elements');
 if(!match.length)return null;
 const v=attrs(match[0][0]);only(v,['scaleX','scaleY','skewX','skewY','transX','transY'],'transform');
 const result=[v.scaleX??1,v.scaleY??1,v.skewX??0,v.skewY??0,v.transX??0,v.transY??0];
 assert(result.every(Number.isFinite),'finite transform');
 return result;
}
function color(element){
 const match=[...element.matchAll(/<ColorTransform2\b[^>]*\/>/gu)];
 assert(match.length<=1,'multiple color transforms');
 if(!match.length)return null;
 const v=attrs(match[0][0]);
 only(v,['factorRed','factorGreen','factorBlue','factorAlpha','offsetRed','offsetGreen','offsetBlue','offsetAlpha'],'color');
 const result=[v.factorRed??256,v.factorGreen??256,v.factorBlue??256,v.factorAlpha??256,
  v.offsetRed??0,v.offsetGreen??0,v.offsetBlue??0,v.offsetAlpha??0];
 assert(result.every(Number.isFinite),'finite color');
 return result;
}
function spriteBody(xml,id){
 const open=new RegExp(`<DefineSprite objectID="${id}" frames="(\\d+)">`,'u').exec(xml);
 assert(open,`sprite ${id}`);
 const end=xml.indexOf('</DefineSprite>',open.index+open[0].length);
 assert(end>open.index,`sprite ${id} end`);
 const body=xml.slice(open.index+open[0].length,end);
 assert(!body.includes('<DefineSprite'),'nested sprite definition unsupported');
 return {frames:Number(open[1]),body};
}
/** All direct display operations are parsed, including alpha-zero hit regions. */
export function extractP060Domain(xml,id,sourceCounts){
 const {frames,body}=spriteBody(xml,id);assert.equal(frames,sourceCounts.frames,`sprite ${id} frame count`);
 for(const [tag,count] of Object.entries(sourceCounts.directTagCounts)){
  const actual=(body.match(new RegExp(`<${tag}(?:\\s|/|>)`,'gu'))??[]).length;
  assert.equal(actual,count,`sprite ${id} ${tag} count`);
 }
 assert.doesNotMatch(body,/<(?:PlaceObject3|RemoveObject|DefineSprite)\b/gu,`sprite ${id} unsupported visual tag`);
 let frame=1;const active=new Map(),events=[];
 const tokens=body.matchAll(/<(PlaceObject2|RemoveObject2|ShowFrame)\b[^>]*>/gu);
 for(const token of tokens){
  const [tag,kind]=token;
  if(kind==='ShowFrame'){frame++;continue;}
  const a=attrs(tag),depth=a.depth;
  assert(Number.isInteger(depth)&&depth>0&&frame<=frames,`sprite ${id} depth/frame`);
  if(kind==='RemoveObject2'){
   only(a,['depth'],'remove');assert(active.delete(depth),`sprite ${id} remove missing depth ${depth}`);
   events.push([frame,'r',depth]);continue;
  }
  only(a,['replace','depth','objectID','morph','name','hasClipActions','hasName','hasRatio','allflags1','allflags2','clipDepth'],'place');
  const selfClosing=tag.endsWith('/>');
  const close=selfClosing?token.index+tag.length:body.indexOf('</PlaceObject2>',token.index)+15;
  assert(close>token.index,`sprite ${id} place close`);
  const element=body.slice(token.index,close);
  const tr=transform(element),co=color(element);
  assert(a.replace===0||a.replace===1,`sprite ${id} replace mode`);
  if(a.replace===0){
   assert(!active.has(depth)&&Number.isInteger(a.objectID),`sprite ${id} conflicting place ${depth}`);
   active.set(depth,a.objectID);
   events.push([frame,'p',depth,a.objectID,a.name??null,tr,co,a.morph??null,a.clipDepth??null]);
  }else{
   assert(active.has(depth),`sprite ${id} update absent depth ${depth}`);
   if(a.objectID!==undefined)active.set(depth,a.objectID);
   events.push([frame,'u',depth,a.objectID??null,a.name??null,tr,co,a.morph??null,a.clipDepth??null]);
  }
 }
 assert.equal(frame-1,frames,`sprite ${id} ShowFrame count`);
 const count=sourceCounts.directTagCounts;
 assert.equal(events.filter(x=>x[1]!=='r').length,count.PlaceObject2??0,`sprite ${id} places`);
 assert.equal(events.filter(x=>x[1]==='r').length,count.RemoveObject2??0,`sprite ${id} removes`);
 return {frames,events};
}
function directText(audit){
 return Object.fromEntries(audit.textRecords.map(record=>{
  const p=path.join(root,record.pin.path),bytes=readBound(p,record.pin.sha256,record.pin.bytes);
  assert.equal(bytes.toString('utf8'),record.textUtf8,`text ${record.characterId}`);
  return [record.characterId,record.textUtf8];
 }));
}
export function buildP060DisplayList(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,'exact physical source root required');
 const stat=fs.lstatSync(sourceRoot);assert(stat.isDirectory()&&!stat.isSymbolicLink()&&fs.realpathSync(sourceRoot)===sourceRoot);
 const swf=readBound(sourceFile,immutable.sourceSha,577367);
 assert.equal(swf.subarray(0,3).toString('ascii'),'CWS');assert.equal(swf[3],6);
 const audit=JSON.parse(readBound(path.join(root,sourceAudit),immutable.sourceAuditSha).toString());
 const behavior=JSON.parse(readBound(path.join(root,behaviorAudit),immutable.behaviorAuditSha).toString());
 assert.equal(audit.source.sha256,immutable.sourceSha);assert.equal(audit.source.path,sourceRelative);
 assert.equal(audit.sourceStructure.teachingSpriteId,391);assert.equal(behavior.sourceCatalogRecord.mainFrames,721);
 assert.deepEqual(behavior.mainStopTransitions.map(s=>s.frame),[262,400,527,646,699,718]);
 const xml=readBound(path.join(root,sourceXml),immutable.xmlSha,8408981).toString();
 const domainEvents={};for(const id of domains)domainEvents[id]=extractP060Domain(xml,id,audit.sourceStructure.sprites[id]);
 const text=directText(audit);
 return {meta:{animationId:'shared-nms002-l02-p060',sourceSwfSha256:immutable.sourceSha,
  sourceAuditSha256:immutable.sourceAuditSha,behaviorAuditSha256:immutable.behaviorAuditSha,
  sourceXmlSha256:immutable.xmlSha,mainSpriteId:391,mainFrames:721,rootFrames:10,rootEntryFrame:6,
  fps:12,stage:{width:800,height:600},rootPlacementTwips:{x:8247,y:5658},
  authoredStops:[262,400,527,646,699,718],qualification:'source display timing only; no runtime/audio/visual acceptance'},
  domains:domainEvents,text};
}
export function renderP060DisplayList(value){
 return `// Generated by scripts/build-nms-l02-p060-display-list-v1.mjs; do not edit.\n`+
  `// Source-static visual events; no runtime, audio, or visual-fidelity acceptance.\n`+
  `export const P060_DISPLAY_META=${JSON.stringify(value.meta)} as const;\n`+
  `export type P060DomainId=${domains.map(id=>`'${id}'`).join('|')};\n`+
  `export type P060Event=readonly [number,'p'|'u'|'r',number,number?,(string|null)?,(readonly number[]|null)?,(readonly number[]|null)?,(number|null)?,(number|null)?];\n`+
  `export const P060_DISPLAY_DOMAINS=${JSON.stringify(value.domains)} as unknown as Record<P060DomainId,{frames:number;events:readonly P060Event[]}>;\n`+
  `export const P060_SOURCE_TEXT=${JSON.stringify(value.text)} as Record<number,string>;\n`+
  `export type P060SourceObject={depth:number;characterId:number;name:string|null;transform:readonly number[];color:readonly number[];morph:number|null;clipDepth:number|null};\n`+
  `export function p060SourceSnapshot(domain:P060DomainId,frame:number):P060SourceObject[]{\n`+
  ` const source=P060_DISPLAY_DOMAINS[domain]; if(!Number.isInteger(frame)||frame<1||frame>source.frames)throw Error('P060 source frame');\n`+
  ` const active=new Map<number,P060SourceObject>();for(const event of source.events){if(event[0]>frame)break;const depth=event[2];\n`+
  `  if(event[1]==='r'){active.delete(depth);continue;}\n`+
  `  if(event[1]==='p'){active.set(depth,{depth,characterId:event[3] as number,name:event[4] as string|null,transform:(event[5]??[1,1,0,0,0,0]) as readonly number[],color:(event[6]??[256,256,256,256,0,0,0,0]) as readonly number[],morph:event[7] as number|null,clipDepth:event[8] as number|null});continue;}\n`+
  `  const prior=active.get(depth);if(!prior)throw Error('P060 source depth');active.set(depth,{depth,characterId:(event[3]??prior.characterId) as number,name:(event[4]??prior.name) as string|null,transform:(event[5]??prior.transform) as readonly number[],color:(event[6]??prior.color) as readonly number[],morph:(event[7]??prior.morph) as number|null,clipDepth:(event[8]??prior.clipDepth) as number|null});\n`+
  ` }return [...active.values()].sort((a,b)=>a.depth-b.depth);}\n`+
  `export function p060SourceObjects(domain:P060DomainId,frame:number,characterId:number){return p060SourceSnapshot(domain,frame).filter(item=>item.characterId===characterId);}\n`;
}
function main(){
 const mode=process.argv[2];assert(['--write','--check','--dry-run'].includes(mode),'usage: --write|--check|--dry-run');
 const output=renderP060DisplayList(buildP060DisplayList());const target=path.join(root,generated);
 if(mode==='--write')fs.writeFileSync(target,output);
 if(mode==='--check')assert.equal(fs.readFileSync(target,'utf8'),output,'generated P060 source display drift');
 console.log(JSON.stringify({mode,path:generated,bytes:Buffer.byteLength(output),sha256:sha(Buffer.from(output))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
