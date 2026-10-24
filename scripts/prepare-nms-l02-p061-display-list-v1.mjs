#!/usr/bin/env node
/** Source-locked P061 visual event extraction. It makes no runtime or fidelity claim. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sourceRelative='G6-G8-shared/NMS002/L2/TS/L2TS08.swf';
const sourceFile=path.join(sourceRoot,sourceRelative);
const sourceAudit='output/nms-l02-p061-source-20260927/source-audit.json';
const behaviorAudit='output/nms-l02-p061-behavior-20260927/source-behavior-v1.json';
const sourceXml='output/nms-l02-p061-source-20260927/extraction/swfmill.xml';
const generated='packages/demos/src/generated/nms-l02-p061-display-list-v1.ts';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const immutable={
 sourceSha:'4712cc077841cc0d16ea63c0c10827b933a0904a80eef010ec8f04eed5ffa50a',
 sourceAuditSha:'1fa1927e77f31138e9608d4acaab2dc66fba170022326211e5f4c159c95ae859',
 behaviorAuditSha:'e3e52d68dbb2c901cf056a95cb073a031181c20dba7b3a7f90002652f998441e',
 xmlSha:'47dc12c2058196b3c77efeadbe63a1b637444eaf76b492ee9f6a9b3f684f9ba0',
};
const domains=[15,44,46,87,111,118,134,146,174,179,188,194,202,205,226,252,284,298,314,315];
const receipt='output/nms-l02-p061-display-20260927/receipt.json';

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
export function extractP061Domain(xml,id,sourceCounts){
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
function directText(audit,xml){
 const text={},bounds={};
 for(const record of audit.textRecords){
  const p=path.join(root,record.pin.path),bytes=readBound(p,record.pin.sha256,record.pin.bytes);
  assert.equal(bytes.toString('utf8'),record.textUtf8,`text ${record.characterId}`);
  const body=xml.match(new RegExp(`<DefineText objectID="${record.characterId}">([\\s\\S]*?)<\\/DefineText>`,'u'))?.[1];
  assert(body,`DefineText ${record.characterId}`);
  const rectangle=body.match(/<bounds>\s*<Rectangle\b([^>]*)\/>\s*<\/bounds>/u);
  assert(rectangle,`DefineText bounds ${record.characterId}`);
  const box=attrs(rectangle[1]);only(box,['left','right','top','bottom'],'text bounds');
  assert(['left','right','top','bottom'].every(key=>Number.isFinite(box[key])),`text bounds ${record.characterId}`);
  const matrix=transform(body.match(/<transform>([\s\S]*?)<\/transform>/u)?.[1]??'');
  text[record.characterId]=record.textUtf8;
  bounds[record.characterId]={twips:[box.left,box.top,box.right,box.bottom],transform:matrix??[1,1,0,0,0,0]};
 }
 assert.equal(Object.keys(text).length,audit.sourceStructure.rootTagCounts.DefineText,'all source text records');
 return {text,bounds};
}
export function buildP061DisplayList(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,'exact physical source root required');
 const stat=fs.lstatSync(sourceRoot);assert(stat.isDirectory()&&!stat.isSymbolicLink()&&fs.realpathSync(sourceRoot)===sourceRoot);
 const swf=readBound(sourceFile,immutable.sourceSha,585741);
 assert.equal(swf.subarray(0,3).toString('ascii'),'CWS');assert.equal(swf[3],6);
 const audit=JSON.parse(readBound(path.join(root,sourceAudit),immutable.sourceAuditSha).toString());
 const behavior=JSON.parse(readBound(path.join(root,behaviorAudit),immutable.behaviorAuditSha).toString());
 assert.equal(audit.source.sha256,immutable.sourceSha);assert.equal(audit.source.path,sourceRelative);
 assert.equal(audit.sourceStructure.teachingSpriteId,315);assert.equal(behavior.sourceDomain.mainFrames,882);
 assert.deepEqual(behavior.mainStopTransitions.map(s=>s.frame),[435,573,700,817,860,879]);
 assert.deepEqual(domains.map(String),Object.keys(audit.sourceStructure.sprites),'complete sprite inventory');
 const xml=readBound(path.join(root,sourceXml),immutable.xmlSha,7956891).toString();
 const domainEvents={};for(const id of domains)domainEvents[id]=extractP061Domain(xml,id,audit.sourceStructure.sprites[id]);
 const {text,bounds}=directText(audit,xml);
 const rootPlacements=audit.sourceStructure.rootEvents.filter(event=>event.tag==='PlaceObject2').map(event=>({
  frame:event.frame,depth:Number(event.attributes.depth),characterId:Number(event.attributes.objectID),
  name:event.attributes.name??null,morph:Number(event.attributes.morph??0),
  transform:[1,1,0,0,Number(event.transform?.transX??0),Number(event.transform?.transY??0)],
 }));
 assert.deepEqual(rootPlacements.map(row=>[row.frame,row.depth,row.characterId]),[[6,1,15],[6,3,315],[6,332,316]]);
 return {meta:{animationId:'shared-nms002-l02-p061',sourceSwfSha256:immutable.sourceSha,
  sourceAuditSha256:immutable.sourceAuditSha,behaviorAuditSha256:immutable.behaviorAuditSha,
  sourceXmlSha256:immutable.xmlSha,mainSpriteId:315,mainFrames:882,rootFrames:10,rootEntryFrame:6,
  fps:12,stage:{width:800,height:600},rootPlacementTwips:{x:8247,y:5658},
  rootPlacements,authoredStops:[435,573,700,817,860,879],
  qualification:'source display timing only; no runtime/audio/visual acceptance'},
  domains:domainEvents,text,bounds};
}
export function renderP061DisplayList(value){
 return `// Generated by scripts/prepare-nms-l02-p061-display-list-v1.mjs; do not edit.\n`+
  `// Source-static visual events; no runtime, audio, or visual-fidelity acceptance.\n`+
  `export const P061_DISPLAY_META=${JSON.stringify(value.meta)} as const;\n`+
  `export type P061DomainId=${domains.map(id=>`'${id}'`).join('|')};\n`+
  `export type P061Event=readonly [number,'p'|'u'|'r',number,number?,(string|null)?,(readonly number[]|null)?,(readonly number[]|null)?,(number|null)?,(number|null)?];\n`+
  `export const P061_DISPLAY_DOMAINS=${JSON.stringify(value.domains)} as unknown as Record<P061DomainId,{frames:number;events:readonly P061Event[]}>;\n`+
  `export const P061_SOURCE_TEXT=${JSON.stringify(value.text)} as Record<number,string>;\n`+
  `export const P061_SOURCE_TEXT_BOUNDS=${JSON.stringify(value.bounds)} as Record<number,{twips:readonly [number,number,number,number];transform:readonly number[]}>;\n`+
  `export type P061SourceObject={depth:number;characterId:number;name:string|null;transform:readonly number[];color:readonly number[];morph:number|null;clipDepth:number|null};\n`+
  `export function p061SourceSnapshot(domain:P061DomainId,frame:number):P061SourceObject[]{\n`+
  ` const source=P061_DISPLAY_DOMAINS[domain]; if(!Number.isInteger(frame)||frame<1||frame>source.frames)throw Error('P061 source frame');\n`+
  ` const active=new Map<number,P061SourceObject>();for(const event of source.events){if(event[0]>frame)break;const depth=event[2];\n`+
  `  if(event[1]==='r'){active.delete(depth);continue;}\n`+
  `  if(event[1]==='p'){active.set(depth,{depth,characterId:event[3] as number,name:event[4] as string|null,transform:(event[5]??[1,1,0,0,0,0]) as readonly number[],color:(event[6]??[256,256,256,256,0,0,0,0]) as readonly number[],morph:event[7] as number|null,clipDepth:event[8] as number|null});continue;}\n`+
  `  const prior=active.get(depth);if(!prior)throw Error('P061 source depth');active.set(depth,{depth,characterId:(event[3]??prior.characterId) as number,name:(event[4]??prior.name) as string|null,transform:(event[5]??prior.transform) as readonly number[],color:(event[6]??prior.color) as readonly number[],morph:(event[7]??prior.morph) as number|null,clipDepth:(event[8]??prior.clipDepth) as number|null});\n`+
  ` }return [...active.values()].sort((a,b)=>a.depth-b.depth);}\n`+
  `export function p061SourceObjects(domain:P061DomainId,frame:number,characterId:number){return p061SourceSnapshot(domain,frame).filter(item=>item.characterId===characterId);}\n`;
}
function main(){
 const mode=process.argv[2];assert(['--write','--check','--dry-run'].includes(mode),'usage: --write|--check|--dry-run');
 const output=renderP061DisplayList(buildP061DisplayList());const target=path.join(root,generated);
 if(mode==='--write'){
  assert(!fs.existsSync(target)&&!fs.existsSync(path.join(root,receipt)),'new P061 display outputs only');
  fs.writeFileSync(target,output,{flag:'wx'});
  const receiptValue={schemaVersion:1,kind:'nms-l02-p061-source-display-generation-v1',
   generator:{path:path.relative(root,fileURLToPath(import.meta.url)),sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url)))},
   source:{path:sourceRelative,sha256:immutable.sourceSha},sourceAudit:{path:sourceAudit,sha256:immutable.sourceAuditSha},
   sourceXml:{path:sourceXml,sha256:immutable.xmlSha},behaviorAudit:{path:behaviorAudit,sha256:immutable.behaviorAuditSha},
   output:{path:generated,bytes:Buffer.byteLength(output),sha256:sha(Buffer.from(output))},
   domains:domains.length,textRecords:Object.keys(buildP061DisplayList().text).length,
   registrationEffect:false,acceptanceEffect:false};
  fs.mkdirSync(path.dirname(path.join(root,receipt)),{recursive:true});
  fs.writeFileSync(path.join(root,receipt),JSON.stringify(receiptValue,null,2)+'\n',{flag:'wx'});
 }
 if(mode==='--check')assert.equal(fs.readFileSync(target,'utf8'),output,'generated P061 source display drift');
 console.log(JSON.stringify({mode,path:generated,bytes:Buffer.byteLength(output),sha256:sha(Buffer.from(output))}));
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
