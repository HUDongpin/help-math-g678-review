import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {pinFile,readPin} from '../lib/g678-admission-proof.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE={path:'G6-G8-shared/ALG001/L6/RW/L6RW09.swf',bytes:114334,
 sha256:'96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14'};
const OUT='migrations/shared-alg001-l06-p010/audit/canvas-v1';
const receiptPath=OUT+'/extraction-receipt.json';
function inventory(dir){return fs.readdirSync(path.join(ROOT,dir),{withFileTypes:true})
 .sort((a,b)=>a.name.localeCompare(b.name)).flatMap(d=>{
  assert(!d.isSymbolicLink());const p=dir+'/'+d.name;
  return d.isDirectory()?inventory(p):p===receiptPath?[]:[pinFile(ROOT,p)];
 });}
assert(['--export','--check'].includes(process.argv[2])&&process.argv.length===3);
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT);
readPin(SOURCE_ROOT,SOURCE);
if(process.argv[2]==='--check'){
 const receipt=JSON.parse(fs.readFileSync(path.join(ROOT,receiptPath)));
 assert.deepEqual(receipt.source,SOURCE);assert.deepEqual(receipt.files,inventory(OUT));
 console.log(JSON.stringify({status:'verified',files:receipt.files.length}));
}else{
 const help=execFileSync('ffdec',['-help','export'],{encoding:'utf8',maxBuffer:2e6});
 assert(help.includes('v.26.2.1')&&help.includes('sprite:canvas'));
 fs.mkdirSync(path.join(ROOT,OUT));
 fs.writeFileSync(path.join(ROOT,OUT,'help.txt'),help,{flag:'wx'});
 const args=['-config','packJavaScripts=false','-onerror','abort','-format',
  'frame:canvas,sprite:canvas','-export','frame,sprite',path.join(ROOT,OUT),path.join(SOURCE_ROOT,SOURCE.path)];
 const log=execFileSync('ffdec',args,{encoding:'utf8',maxBuffer:4e6,timeout:180000});
 fs.writeFileSync(path.join(ROOT,OUT,'export.log'),log,{flag:'wx'});readPin(SOURCE_ROOT,SOURCE);
 const files=inventory(OUT);assert(files.some(p=>p.path.endsWith('DefineSprite_52/frames.html')));
 fs.writeFileSync(path.join(ROOT,receiptPath),JSON.stringify({schemaVersion:1,
  animationId:'shared-alg001-l06-p010',tool:'FFDec26.2.1',command:['ffdec',...args],
  source:SOURCE,files,acceptanceEffects:'none'},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({status:'exported',files:files.length}));
}
