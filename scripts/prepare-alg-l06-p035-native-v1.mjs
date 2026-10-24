#!/usr/bin/env node
/** Bind checked P035 source geometry to maintained product paths byte-for-byte. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const OUT='migrations/shared-alg001-l06-p035/native-v1';
const TEXT_STAGE='output/alg-l06-p035-native-text-preparation-v1';
const INTERACTION_STAGE='output/alg-l06-p035-native-interaction-preparation-v1';
const sources=[
 {from:`${TEXT_STAGE}/native-geometry-v1.json`,to:`${OUT}/native-geometry-v1.json`,
  sha256:'71f315ad5fdcfe5c09b23c35dbb1415bdfb9cb9a018e7f5b91ce0f31d681120c'},
 {from:`${INTERACTION_STAGE}/interaction-geometry-v1.json`,to:`${OUT}/interaction-geometry-v1.json`,
  sha256:'791243174222442878ae5438874724063300dd57637f5d56b0084091de81945b'}
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const pin=(name,bytes)=>({path:name,bytes:bytes.length,sha256:sha(bytes)});
function read(relative){
 const file=path.resolve(ROOT,relative);
 assert(file.startsWith(ROOT+path.sep)&&fs.realpathSync(file)===file,`physical ${relative}`);
 const before=fs.lstatSync(file,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,`ordinary ${relative}`);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[key],after[key],`stable ${relative}:${key}`);
 return bytes;
}
const mode=process.argv[2];
assert(process.argv.length===3&&['--write','--check'].includes(mode));
execFileSync('python3',[`${TEXT_STAGE}/prepare-native-text.py`,'--check'],
 {cwd:ROOT,stdio:'pipe',timeout:120000});
execFileSync(process.execPath,['--import','tsx',`${INTERACTION_STAGE}/prepare-interaction.mjs`,'--check'],
 {cwd:ROOT,stdio:'pipe',timeout:120000});
const inputs=[];
for(const name of [
 `${TEXT_STAGE}/prepare-native-text.py`,`${TEXT_STAGE}/generation-receipt-v1.json`,
 `${INTERACTION_STAGE}/prepare-interaction.mjs`,`${INTERACTION_STAGE}/generation-receipt-v1.json`,
 'scripts/prepare-alg-l06-p035-native-v1.mjs']) inputs.push(pin(name,read(name)));
const outputs=[];
for(const entry of sources){
 const bytes=read(entry.from);
 assert.equal(sha(bytes),entry.sha256,`source geometry drift ${entry.from}`);
 inputs.push(pin(entry.from,bytes));
 if(mode==='--write')fs.writeFileSync(path.resolve(ROOT,entry.to),bytes);
 else assert.deepEqual(read(entry.to),bytes,`product geometry drift ${entry.to}`);
 outputs.push(pin(entry.to,bytes));
}
const receipt=Buffer.from(JSON.stringify({schemaVersion:1,kind:'p035-maintained-native-source-binding-v1',
 status:'source-pinned-unregistered',inputs,outputs,
 acceptanceEffects:{registration:false,originalRuntime:false,audio:false,
  listening:false,human:false,owner:false,strictComplete:false,publication:false}},null,2)+'\n');
const receiptPath=`${OUT}/product-generation-receipt-v1.json`;
if(mode==='--write')fs.writeFileSync(path.resolve(ROOT,receiptPath),receipt);
else assert.deepEqual(read(receiptPath),receipt,'native product receipt drift');
console.log(JSON.stringify({mode,outputs,receipt:pin(receiptPath,receipt)}));
