#!/usr/bin/env node
/** Reproducible public-tool P024 drawing export. No AVM1 or source mutation. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE='G6-G8-shared/ALG001/L6/VB/L6VB17.swf';
const PIN={path:SOURCE,bytes:462836,sha256:'e36c6c293f1e620f82fa84d57a1b91fd0a977d24d365772126f87333ce359d05'};
const OUT='output/alg-l06-p024-canvas-v1';
const XML=`${OUT}/source.xml`, EXPORT=`${OUT}/source-export`, PCODE=`${OUT}/source-pcode`;
const RECEIPT=`${OUT}/source-export-receipt.json`;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function physical(base,relative){
 const file=path.resolve(base,relative);
 assert(file.startsWith(`${base}${path.sep}`)&&fs.realpathSync(file)===file,`physical ${relative}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${relative}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${relative}: ${key}`);
 return bytes;
}
function walk(directory){
 return fs.readdirSync(path.join(ROOT,directory),{withFileTypes:true})
  .sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(entry=>{
   assert(!entry.isSymbolicLink(),'no source-export symlink');
   const name=`${directory}/${entry.name}`;
   return entry.isDirectory()?walk(name):[pin(name,physical(ROOT,name))];
  });
}
function versions(){
 const ffdec=execFileSync('ffdec',['-help','export'],{encoding:'utf8',maxBuffer:2e6});
 assert(ffdec.includes('v.26.2.1')&&ffdec.includes('sprite:canvas')&&
  ffdec.includes('script:pcodehex'),'FFDec 26.2.1 contract');
 const mill=spawnSync('swfmill',['--version'],{encoding:'utf8'});
 assert.equal(mill.status,0);
 assert(`${mill.stdout}${mill.stderr}`.includes('swfmill 0.3.6'),'swfmill 0.3.6 contract');
 return {ffdec:'JPEXS Free Flash Decompiler v.26.2.1',swfmill:'swfmill 0.3.6'};
}
function exportMissing(){
 const source=path.join(SOURCE_ROOT,SOURCE);
 fs.mkdirSync(path.join(ROOT,OUT),{recursive:true});
 if(!fs.existsSync(path.join(ROOT,XML)))
  execFileSync('swfmill',['-n','swf2xml',source,path.join(ROOT,XML)],{maxBuffer:2e6});
 if(!fs.existsSync(path.join(ROOT,EXPORT))){
  fs.mkdirSync(path.join(ROOT,EXPORT),{recursive:true});
  execFileSync('ffdec',['-config','packJavaScripts=false','-onerror','abort',
   '-format','frame:canvas,sprite:canvas','-export','frame,sprite',
   path.join(ROOT,EXPORT),source],{maxBuffer:2e6});
  execFileSync('ffdec',['-onerror','abort','-export','script',
   path.join(ROOT,EXPORT),source],{maxBuffer:2e6});
 }
 if(!fs.existsSync(path.join(ROOT,PCODE))){
  fs.mkdirSync(path.join(ROOT,PCODE),{recursive:true});
  execFileSync('ffdec',['-onerror','abort','-format','script:pcodehex',
   '-export','script',path.join(ROOT,PCODE),source],{maxBuffer:2e6});
 }
}
function expectedReceipt(tools){
 const xml=physical(ROOT,XML).toString();
 assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>\n<swf version="6" compressed="1">'));
 assert(xml.includes('<DefineSprite objectID="208" frames="381">'));
 assert.equal([...xml.matchAll(/<DefineSprite objectID="/gu)].length,13);
 assert.equal([...xml.matchAll(/<DefineMorphShape objectID="/gu)].length,61);
 const files=[pin(XML,Buffer.from(xml)),...walk(EXPORT),...walk(PCODE)]
  .sort((a,b)=>a.path.localeCompare(b.path,'en'));
 const drawing=files.filter(f=>f.path.endsWith('/canvas.js')||f.path.endsWith('/frames.html'));
 const scripts=files.filter(f=>f.path.startsWith(`${EXPORT}/scripts/`));
 const pcodes=files.filter(f=>f.path.startsWith(`${PCODE}/scripts/`));
 assert.equal(drawing.length,28,'root + 13 sprite Canvas pairs');
 assert.equal(scripts.length,42,'42 AS exports');
 assert.equal(pcodes.length,42,'42 P-code exports');
 for(const sprite of [2,46,65,69,80,83,94,97,123,155,188,196,208]){
  assert(files.some(f=>f.path===`${EXPORT}/sprites/DefineSprite_${sprite}/canvas.js`));
  assert(files.some(f=>f.path===`${EXPORT}/sprites/DefineSprite_${sprite}/frames.html`));
 }
 for(const sprite of [69,83,97,123,155,188,196,208]){
  const frames=physical(ROOT,`${EXPORT}/sprites/DefineSprite_${sprite}/frames.html`).toString();
  assert(frames.includes(`function sprite${sprite}(ctx,ctrans,frame,ratio,time)`),
   `sprite-${sprite} Canvas definition`);
 }
 return {schemaVersion:1,kind:'alg-l06-p024-physical-source-canvas-export-v1',
  animationId:'shared-alg001-l06-p024',
  source:{...PIN,root:SOURCE_ROOT},tools,commands:[
   ['swfmill','-n','swf2xml',`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`,XML],
   ['ffdec','-config','packJavaScripts=false','-onerror','abort','-format',
    'frame:canvas,sprite:canvas','-export','frame,sprite',EXPORT,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
   ['ffdec','-onerror','abort','-export','script',EXPORT,
    `$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
   ['ffdec','-onerror','abort','-format','script:pcodehex','-export','script',
    PCODE,`$HELP_MATH_G678_SOURCE_ROOT/${SOURCE}`],
  ],files,drawingSymbols:[208,69,83,97,123,155,188,196],
  swfmillWarning:'UnknownTag/DefineSprite end-position warnings; binary parser cross-check required',
  acceptanceEffects:{originalRuntime:false,fidelity:false,listening:false,human:false,owner:false}};
}
function main(){
 const mode=process.argv[2];
 assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write | --check');
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real physical AWS root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const source=physical(SOURCE_ROOT,SOURCE);
 assert.equal(source.length,PIN.bytes);assert.equal(sha(source),PIN.sha256);
 const tools=versions();
 if(mode==='--write')exportMissing();
 const receipt=expectedReceipt(tools),bytes=Buffer.from(`${JSON.stringify(receipt,null,2)}\n`);
 const target=path.join(ROOT,RECEIPT);
 if(mode==='--write'&&!fs.existsSync(target))fs.writeFileSync(target,bytes,{flag:'wx'});
 else assert(fs.readFileSync(target).equals(bytes),'source export receipt drift');
 console.log(JSON.stringify({status:mode==='--check'?'verified':'written',
  exportFiles:receipt.files.length,drawingFiles:28,receipt:pin(RECEIPT,bytes)}));
}
main();
