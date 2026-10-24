#!/usr/bin/env node
/** Source-bound engineering assets; no audio onset or listening acceptance. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const packet='output/alg-l06-p034-audio-domain-planning-20261001-v1';
const out='migrations/shared-alg001-l06-p034/audio-source-v1';
const sha=b=>createHash('sha256').update(b).digest('hex');
function readPinned(base,pin){
 const file=path.resolve(base,pin.path);assert(file.startsWith(base+path.sep));
 assert.equal(fs.realpathSync(file),file);
 const before=fs.lstatSync(file,{bigint:true});assert(before.isFile()&&before.nlink===1n);
 const b=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const k of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[k],after[k]);
 assert.equal(b.length,pin.bytes);assert.equal(sha(b),pin.sha256);return b;
}
const planBytes=readPinned(root,{path:`${packet}/audio-domain-plan-v1.json`,bytes:6600,sha256:'6313a14683f3a23e1c3e98963bb87659f8d17d38583b09c97de01a31c1c24bf5'});
const plan=JSON.parse(planBytes);
const mode=process.argv[2];assert(['--write','--check'].includes(mode)&&process.argv.length===3);
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot);
assert.equal(fs.realpathSync(sourceRoot),sourceRoot);
readPinned(sourceRoot,plan.physicalSwf);readPinned(sourceRoot,plan.physicalLessonXml);
const main=readPinned(root,plan.main.asset),schedule=readPinned(root,plan.main.schedule);
const sa=readPinned(sourceRoot,plan.optionalSpanishAudio.source);
assert(sa.equals(readPinned(root,plan.optionalSpanishAudio.asset)));
const decodePin={path:`${packet}/browser-decode-chromium-v1.json`,bytes:1386,sha256:'e938383da2d84012a0f87da418485a5b0d70c1badf705687ba74254b2cbfaeb2'};
const decode=readPinned(root,decodePin);
const header='cue_id,language,source_file,sha256,start_frame,start_frame_domain_id,start_semantics,duration_ms,format,channels,sample_rate_hz,source_character_id,notes\n';
const csv=header+`main-1,en,audio-source-v1/main-source-v1.mp3,${plan.main.asset.sha256},1,sprite-40,source ledger contains frames198-226 with no blocks and frame197 seek-2300; decoded onset mapping unresolved,${741312/22050*1000},MP3,1,22050,40,no listening or original-runtime alignment acceptance\n`
 +`separate-sa,es,audio-source-v1/separate-sa-source-v1.mp3,${plan.optionalSpanishAudio.source.sha256},,separate-sa,explicit user trigger only; no locale autoplay or main splice,${1504512/48000*1000},MP3,1,48000,,source-SA role; listening and linguistic acceptance unresolved\n`;
const files=[['main-source-v1.mp3',main],['main-block-schedule-v1.json',schedule],['separate-sa-source-v1.mp3',sa],['browser-decode-v1.json',decode]].map(([name,b])=>({path:`${out}/${name}`,bytes:b}));
files.push({path:'migrations/shared-alg001-l06-p034/audio-inventory.csv',bytes:Buffer.from(csv)});
const receipt={schemaVersion:1,kind:'p034-maintained-source-audio-assets-v1',source:plan.physicalSwf,sourceSA:plan.optionalSpanishAudio.source,
 inputs:[{path:'scripts/prepare-alg-l06-p034-audio-source-v1.mjs',bytes:fs.statSync(fileURLToPath(import.meta.url)).size,sha256:sha(fs.readFileSync(fileURLToPath(import.meta.url)))},
 {path:`${packet}/audio-domain-plan-v1.json`,bytes:planBytes.length,sha256:sha(planBytes)},plan.main.asset,plan.main.schedule,decodePin],
 outputs:files.map(f=>({path:f.path,bytes:f.bytes.length,sha256:sha(f.bytes)})),
 sourceFrameToBrowserPcmAlignmentAccepted:false,negativeSeekRuntimeEffect:'unresolved',optionalSpanishPolicy:'explicit-only-separate',
 acceptanceEffects:{registration:false,playback:false,listening:false,originalRuntime:false,fidelity:false,human:false,owner:false,strictCompletion:false,publication:false}};
files.push({path:`${out}/asset-receipt-v1.json`,bytes:Buffer.from(JSON.stringify(receipt,null,2)+'\n')});
for(const f of files){const name=path.join(root,f.path);if(mode==='--check')assert(fs.readFileSync(name).equals(f.bytes),`drift ${f.path}`);else{fs.mkdirSync(path.dirname(name),{recursive:true});fs.writeFileSync(name,f.bytes);}}
console.log(JSON.stringify({status:mode==='--check'?'verified':'written',files:receipt.outputs,alignment:'unresolved',sa:'explicit-only'}));
