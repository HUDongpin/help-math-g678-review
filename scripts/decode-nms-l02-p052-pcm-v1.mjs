import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex');
const sourceBytes=fs.readFileSync(path.join(dir,'source-audio-streams-v1.json')),source=JSON.parse(sourceBytes);
assert.equal(source.sourceSha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const decoder='/opt/homebrew/bin/ffmpeg',decoderBytes=fs.readFileSync(fs.realpathSync(decoder));
const rows=[];
for(const s of source.streams){
 const input=path.join(root,s.encoded.path),encoded=fs.readFileSync(input);assert.equal(sha(encoded),s.encoded.sha256);assert.equal(encoded.length,s.encoded.bytes);
 const args=['-v','error','-nostdin','-xerror','-i',input,'-map','0:a:0','-c:a','pcm_f32le','-f','f32le','pipe:1'];
 const result=spawnSync(decoder,args,{maxBuffer:8*1024*1024});assert.equal(result.status,0,result.stderr?.toString());
 const pcm=result.stdout;assert.ok(pcm.length>0&&pcm.length%4===0);let peak=0,power=0,nonzero=0;
 for(let i=0;i<pcm.length;i+=4){const v=pcm.readFloatLE(i);assert.ok(Number.isFinite(v));peak=Math.max(peak,Math.abs(v));power+=v*v;if(v!==0)nonzero++;}
 const name=`${s.domain}-source-pcm-v1.f32le`,file=path.join(dir,name);
 if(fs.existsSync(file))assert.deepEqual(fs.readFileSync(file),pcm);else if(process.argv.includes('--check'))throw Error(`Missing ${file}`);else fs.writeFileSync(file,pcm,{flag:'wx'});
 rows.push({domain:s.domain,source:s.encoded,pcm:{path:path.relative(root,file),bytes:pcm.length,sha256:sha(pcm)},
  format:'f32le',sampleRate:s.head.sampleRateHz,channels:s.head.channels,samples:pcm.length/4,seconds:pcm.length/4/s.head.sampleRateHz,
  peak,rms:Math.sqrt(power/(pcm.length/4)),nonzeroSamples:nonzero,sourceLatencySeek:s.head.latencySeek,sourceSampleCount:s.sourceSampleCount,
  scheduling:'Untrimmed whole decoded stream; source latency/seek scheduling remains a separate contract.',command:args});
}
const obj={schemaVersion:1,sourceSha256:source.sourceSha256,sourceInventorySha256:sha(sourceBytes),streams:rows,
 decoder:{path:fs.realpathSync(decoder),bytes:decoderBytes.length,sha256:sha(decoderBytes)},
 policy:'Decode whole source MP3; no resampling, encoded-byte cue splitting, normalization or silence replacement.',audioAccepted:false,originalRuntimeAccepted:false};
const file=path.join(dir,'source-pcm-inventory-v1.json'),data=JSON.stringify(obj,null,2)+'\n';
if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${file}`);else fs.writeFileSync(file,data,{flag:'wx'});
console.log(JSON.stringify({status:'PASS',streams:rows.map(r=>({domain:r.domain,samples:r.samples,seconds:r.seconds,nonzero:r.nonzeroSamples})),audioAccepted:false}));
