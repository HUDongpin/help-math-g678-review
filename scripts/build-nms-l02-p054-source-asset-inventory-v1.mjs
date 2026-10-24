import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const workspace=path.join(root,'migrations/shared-nms002-l02-p054');
const output=path.join(workspace,'asset-inventory.csv');
const swf='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2/GS/L2GS03.swf';
const audit='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/p054-source-audit-gkoof5';
const expected={swf:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
 xml:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
 art:'b715b175badc1edfcdf5df81ef7c388ea7e0b2eaac99656c28c74d1762e91974',
 card:'c2e18b123f43e16890548f4be5d38613b022c55c6e2b090cf663dd6d07c62343'};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function read(file,hash){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(hash)assert.equal(sha(bytes),hash,file);
 return bytes;
}
const columns=['asset_id','swf_character_id','library_symbol','type','source_file',
 'source_frame','exported_file','sha256','format','dimensions_or_bounds',
 'font_glyphs','transformation','confidence','license_or_provenance','notes'];
const cell=value=>`"${String(value??'').replaceAll('"','""')}"`;
function build(){
 const sourceRoot=path.dirname(path.dirname(path.dirname(path.dirname(swf))));
 const stat=fs.lstatSync(sourceRoot);
 assert.ok(stat.isDirectory()&&!stat.isSymbolicLink(),'source root must be a real directory');
 assert.equal(read(swf,expected.swf).length,2077270);
 read(path.join(audit,'movie.xml'),expected.xml);
 const art=JSON.parse(read(path.join(workspace,'audit/art-export-v1.json'),expected.art));
 const card=JSON.parse(read(path.join(workspace,'audit/card-display-list-v1.json'),expected.card));
 assert.equal(art.export.count,536);
 const cardIds=new Set(card.resources.map(item=>item.sourceCharacterId));
 const rows=[];
 for(const item of art.export.items){
  const shape=/^shapes\/(\d+)\.svg$/u.exec(item.file);
  const image=/^images\/(\d+)\.png$/u.exec(item.file);
  const button=/^buttons\/DefineButton2_(\d+)\/combined\.svg$/u.exec(item.file);
  assert.ok(shape||image||button,`unexpected source asset ${item.file}`);
  const id=Number((shape??image??button)[1]);
  const exported=path.join(art.export.root,item.file);
  const fileStat=fs.lstatSync(exported);
  assert.ok(fileStat.isFile()&&!fileStat.isSymbolicLink()&&fileStat.nlink===1,exported);
  assert.equal(fileStat.size,item.bytes,exported);
  const kind=shape?'shape':image?'image':'button';
  rows.push({asset_id:`source-${kind}-${id}`,swf_character_id:id,library_symbol:'',
   type:shape?'vector':kind,source_file:swf,source_frame:'',exported_file:exported,
   sha256:item.sha256,format:image?'png':'svg',dimensions_or_bounds:'',font_glyphs:'',
   transformation:`FFDec 26.2.1 ${kind} export`,confidence:'verified-static-export',
   license_or_provenance:'owner-provided',
   notes:cardIds.has(id)?'Source card display-list resource; not product-approved.':
    'Source export; runtime use and visual fidelity unresolved; not product-approved.'});
 }
 const textDirectory=path.join(audit,'texts');
 const textFiles=fs.readdirSync(textDirectory).filter(name=>/^\d+\.txt$/u.test(name));
 assert.equal(textFiles.length,51,'exact FFDec text export count');
 for(const name of textFiles){
  const id=Number(name.slice(0,-4));
  const exported=path.join(textDirectory,name),bytes=read(exported);
  rows.push({asset_id:`source-text-${id}`,swf_character_id:id,library_symbol:'',
   type:'text',source_file:swf,source_frame:'',exported_file:exported,
   sha256:sha(bytes),format:'txt',dimensions_or_bounds:'',font_glyphs:'',
   transformation:'FFDec 26.2.1 text export',confidence:'verified-static-export',
   license_or_provenance:'owner-provided',
   notes:cardIds.has(id)?'Exact card text resource; typography and product use pending.':
    'Source text export; language, glyphs and runtime use unresolved.'});
 }
 assert.equal(rows.length,587);
 assert.equal(new Set(rows.map(row=>row.asset_id)).size,rows.length);
 assert.equal(rows.filter(row=>cardIds.has(row.swf_character_id)).length,cardIds.size);
 rows.sort((a,b)=>a.swf_character_id-b.swf_character_id||a.asset_id.localeCompare(b.asset_id));
 const csv=columns.join(',')+'\n'+rows.map(row=>columns.map(key=>cell(row[key])).join(',')).join('\n')+'\n';
 return {bytes:Buffer.from(csv),rows,cardResourceCount:cardIds.size};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/build-nms-l02-p054-source-asset-inventory-v1.mjs [--check|--write|--stdout]');
 const result=build();
 if(mode==='--write')fs.writeFileSync(output,result.bytes,{flag:'wx'});
 if(mode==='--check')assert.ok(read(output).equals(result.bytes),'P054 source asset inventory drift');
 if(mode==='--stdout')process.stdout.write(result.bytes);
 else process.stdout.write(`${JSON.stringify({status:'PASS',mode,output:path.relative(root,output),
  rows:result.rows.length,cardResources:result.cardResourceCount,
  bytes:result.bytes.length,sha256:sha(result.bytes)})}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();

export {build};
