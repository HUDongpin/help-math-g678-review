#!/usr/bin/env node
/** Reproducible public-tool extraction only. No AVM1 execution or renderer claim. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB15.swf';
const SOURCE_BYTES=135254;
const SOURCE_SHA='a5868c68164c6401d2d79a8548f60f0d62401ca14f01f0494ef8ae6fd0e2d7c1';
const HERE='output/alg-l06-p022-canvas-v1';
const XML=`${HERE}/source.xml`,EXPORT=`${HERE}/source-export`,PCODE=`${HERE}/source-pcode`;
const RECEIPT=`${HERE}/source-export-receipt.json`;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function readPhysical(base,name){
 const file=path.resolve(base,name);
 assert(file.startsWith(`${base}${path.sep}`)&&fs.realpathSync(file)===file,`physical ${name}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${name}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const field of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(after[field],before[field],`stable ${name}:${field}`);
 return bytes;
}
function walk(directory){
 const result=[];
 for(const entry of fs.readdirSync(path.join(ROOT,directory),{withFileTypes:true}).sort(
   (a,b)=>a.name.localeCompare(b.name,'en'))){
  assert(!entry.isSymbolicLink(),'export symlink');
  const name=`${directory}/${entry.name}`;
  if(entry.isDirectory())result.push(...walk(name));
  else{assert(entry.isFile(),'export ordinary file');result.push(pin(name,readPhysical(ROOT,name)));}
 }
 return result;
}
function versions(){
 const ffdec=execFileSync('ffdec',['-help','export'],{encoding:'utf8',maxBuffer:2e6});
 assert(ffdec.includes('v.26.2.1')&&ffdec.includes('sprite:canvas')&&
  ffdec.includes('script:pcodehex'),'FFDec26.2.1 formats');
 const mill=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(mill.status,0);assert(`${mill.stdout}${mill.stderr}`.includes('swfmill 0.3.6'));
 return {ffdec:'JPEXS Free Flash Decompiler v.26.2.1',swfmill:'swfmill 0.3.6'};
}
function receipt(toolVersions){
 const xml=readPhysical(ROOT,XML);
 assert(xml.toString().startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<swf version="6" compressed="1">'),
  'CWS6 source XML');
 const files=[pin(XML,xml),...walk(EXPORT),...walk(PCODE)]
  .sort((a,b)=>a.path.localeCompare(b.path,'en'));
 assert(files.some(f=>f.path===`${EXPORT}/frames/canvas.js`),'root Canvas export');
 assert(files.some(f=>f.path===`${EXPORT}/sprites/DefineSprite_67/canvas.js`),
  'main sprite67 Canvas export');
 assert(files.some(f=>f.path.startsWith(`${EXPORT}/scripts/`)&&f.path.endsWith('.as')),
  'ActionScript source export');
 assert(files.some(f=>f.path.startsWith(`${PCODE}/scripts/`)&&f.path.endsWith('.pcode')),
  'P-code hex export');
 return {schemaVersion:1,kind:'alg-l06-p022-physical-source-export-v1',
  animationId:'shared-alg001-l06-p022',
  source:{path:SOURCE,bytes:SOURCE_BYTES,sha256:SOURCE_SHA,root:SOURCE_ROOT},
  tools:toolVersions,commands:[
   ['swfmill','-n','swf2xml',`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,XML],
   ['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
    'frame:canvas,sprite:canvas','-export','frame,sprite',EXPORT,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
   ['ffdec','-onerror','abort','-export','script',EXPORT,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
   ['ffdec','-onerror','abort','-format','script:pcodehex','-export','script',PCODE,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
  ],files,status:'static source extraction only; AVM1 branches, original runtime and acceptance unresolved'};
}
const mode=process.argv[2];assert(['--write','--check'].includes(mode),'--write | --check');
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real physical AWS source root');
assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
const source=readPhysical(SOURCE_ROOT,SOURCE);
assert.equal(source.length,SOURCE_BYTES);assert.equal(sha(source),SOURCE_SHA);
const toolVersions=versions();
if(mode==='--write'){
 const sourcePath=path.join(SOURCE_ROOT,SOURCE);
 const xml=path.join(ROOT,XML),exportPath=path.join(ROOT,EXPORT),pcodePath=path.join(ROOT,PCODE);
 if(!fs.existsSync(xml))execFileSync('swfmill',['-n','swf2xml',sourcePath,xml],{maxBuffer:2e6});
 if(!fs.existsSync(exportPath)){
  fs.mkdirSync(exportPath,{recursive:true});
  execFileSync('ffdec',['-config','packJavaScripts=false','-onerror','abort',
   '-format','frame:canvas,sprite:canvas','-export','frame,sprite',exportPath,sourcePath],{maxBuffer:2e6});
  execFileSync('ffdec',['-onerror','abort','-export','script',exportPath,sourcePath],{maxBuffer:2e6});
 }
 if(!fs.existsSync(pcodePath)){
  fs.mkdirSync(pcodePath,{recursive:true});
  execFileSync('ffdec',['-onerror','abort','-format','script:pcodehex',
   '-export','script',pcodePath,sourcePath],{maxBuffer:2e6});
 }
}
const value=receipt(toolVersions),bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
const receiptPath=path.join(ROOT,RECEIPT);
if(mode==='--write'&&!fs.existsSync(receiptPath))fs.writeFileSync(receiptPath,bytes,{flag:'wx'});
else assert(fs.readFileSync(receiptPath).equals(bytes),'source export receipt drift');
console.log(JSON.stringify({status:'source-export-verified',files:value.files.length,
 source:value.source,receipt:pin(RECEIPT,bytes)}));
