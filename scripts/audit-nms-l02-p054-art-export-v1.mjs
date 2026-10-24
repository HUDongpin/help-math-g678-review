import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const source='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf';
const sourceSha256='06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8';
const exported='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-art-assets-oM5UHV';
const output=path.join(root,'migrations/shared-nms002-l02-p054/audit/art-export-v1.json');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function regularBytes(file,expectedSha256){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(after[key],before[key],file);
 if(expectedSha256)assert.equal(sha(bytes),expectedSha256,file);
 return bytes;
}
function visit(dir,relative,rows){
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  assert.ok(!entry.isSymbolicLink(),entry.name);
  const next=path.join(dir,entry.name),name=relative?relative+'/'+entry.name:entry.name;
  if(entry.isDirectory())visit(next,name,rows);
  else{
   assert.ok(entry.isFile(),name);
   const bytes=regularBytes(next);
   rows.push({file:name,bytes:bytes.length,sha256:sha(bytes)});
  }
 }
}
function audit(){
 regularBytes(source,sourceSha256);
 const stat=fs.lstatSync(exported);
 assert.ok(stat.isDirectory()&&!stat.isSymbolicLink());
 assert.equal(fs.realpathSync(exported),exported);
 const rows=[];
 visit(exported,'',rows);
 rows.sort((a,b)=>a.file<b.file?-1:a.file>b.file?1:0);
 const expected={shapes:519,images:12,buttons:5};
 const counts={shapes:0,images:0,buttons:0};
 for(const row of rows){
  const category=row.file.split('/')[0];
  assert.ok(Object.hasOwn(expected,category),row.file);
  counts[category]++;
  assert.ok(row.bytes>0,row.file);
 }
 assert.deepEqual(counts,expected);
 assert.equal(rows.length,536);
 const inventoryBytes=Buffer.from(rows.map(row=>`${row.file}\t${row.bytes}\t${row.sha256}`).join('\n')+'\n');
 return {schemaVersion:1,animationId:'shared-nms002-l02-p054',
  source:{path:source,bytes:2077270,sha256:sourceSha256},
  export:{root:exported,tool:'FFDec 26.2.1',
   formats:['shape:svg','button:svg_combined','image:png'],
   count:rows.length,counts,totalBytes:rows.reduce((sum,row)=>sum+row.bytes,0),
   checksumSetSha256:sha(inventoryBytes),items:rows},
  sourceArtPreserved:true,productionAssetPromotionApproved:false,
  originalRuntimeAccepted:false,visualFidelityAccepted:false,
  limitations:['Exported vectors and images are unreviewed source material, not app assets.',
   'Card-specific shape/depth/hit-area closure and dynamic reveal frames remain unmapped.',
   'No original-runtime comparison, human visual review, or release acceptance is implied.']};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p054-art-export-v1.mjs [--check|--write|--stdout]');
 if(mode==='--write')assert.ok(!fs.existsSync(output),`${output} already exists`);
 const value=audit(),bytes=Buffer.from(`${JSON.stringify(value,null,2)}\n`);
 if(mode==='--write')fs.writeFileSync(output,bytes,{flag:'wx'});
 if(mode==='--check')assert.deepEqual(regularBytes(output),bytes,'art export inventory drift');
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,
  output:path.relative(root,output),count:value.export.count,counts:value.export.counts,
  totalBytes:value.export.totalBytes,checksumSetSha256:value.export.checksumSetSha256,
  manifestBytes:bytes.length,manifestSha256:sha(bytes)},null,2)}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
