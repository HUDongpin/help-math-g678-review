import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const read=n=>JSON.parse(fs.readFileSync(path.join(dir,n))),sha=b=>createHash('sha256').update(b).digest('hex');
const identity=read('source-identity-v1.json'),exports=read('ffdec-export-v1.json');
function verify(p){const f=path.isAbsolute(p.path)?p.path:path.join(root,p.path),b=fs.readFileSync(f);assert.equal(b.length,p.bytes,f);assert.equal(sha(b),p.sha256,f);}
verify(identity.source);verify(identity.preservedCopy);for(const f of exports.files)verify(f);
const xml=fs.readFileSync(path.join(exports.output,'source.xml'),'utf8');
const sprites=new Map([...xml.matchAll(/^    <item type="DefineSpriteTag"[^>]*spriteId="(\d+)"[^>]*>([\s\S]*?)^    <\/item>/gm)].map(m=>[`sprite-${m[1]}`,m[2]]));
const streams=read('source-audio-streams-v1.json').streams,results=[];
assert.equal((xml.match(/type="SoundStreamHead(?:2)?Tag"/g)||[]).length,streams.length);
for(const stream of streams){
 verify(stream.encoded);const body=sprites.get(stream.domain);assert.ok(body);
 const blocks=[...body.matchAll(/type="SoundStreamBlockTag"[^>]*streamSoundData="([0-9a-f]+)"/g)].map(m=>Buffer.from(m[1],'hex'));
 assert.equal(blocks.length,stream.blocks.length);
 assert.equal(sha(Buffer.concat(blocks.map(b=>b.subarray(4)))),stream.encoded.sha256);
 const f=path.join(root,stream.encoded.path);
 const probe=spawnSync('ffprobe',['-v','error','-show_entries','stream=codec_name,sample_rate,channels','-of','json',f],{encoding:'utf8'});
 assert.equal(probe.status,0,probe.stderr);const info=JSON.parse(probe.stdout).streams;assert.equal(info.length,1);
 assert.equal(info[0].codec_name,'mp3');assert.equal(Number(info[0].sample_rate),stream.head.sampleRateHz);assert.equal(info[0].channels,stream.head.channels);
 const decode=spawnSync('ffmpeg',['-v','error','-xerror','-i',f,'-f','null','-'],{encoding:'utf8'});
 assert.equal(decode.status,0,decode.stderr);
 results.push({domain:stream.domain,xmlByteMatch:true,fullStreamDecode:true,codec:info[0]});
}
const script=(name)=>fs.readFileSync(path.join(exports.output,'as/scripts',name),'utf8');
const main=script('DefineSprite_350/frame_115/DoAction.as'),done=script('DefineButton2_310/BUTTONCONDACTION on(release).as'),reset=script('DefineButton2_307/BUTTONCONDACTION on(release).as');
assert.match(main,/drawGrid\(11,11\)/);assert.match(main,/_global\.mcDragX = -224\.95/);
assert.match(done,/txtChr_1\.text == "7"/);assert.match(done,/txtChr_2\.text == "5"/);
assert.match(done,/_global\.tryCount\+\+/);assert.match(done,/_global\.tryCount == 1/);assert.doesNotMatch(reset,/tryCount/);
const drag=script('DefineSprite_350/frame_115/PlaceObject2_297_13/CLIPACTIONRECORD onClipEvent(enterFrame).as');
assert.match(drag,/Math\.round\(\(this\._x \/ 50 \+ 5\) \* 64 \/ 3\) \+ 34/);
const value=x=>Math.round((x/50+5)*64/3)+34;
assert.equal(value(-329),0);assert.equal(value(-95),100);assert.equal(value(-224.95),45);
assert.equal(value(-153.90625),75);
const result={status:'PASS',animationId:identity.animationId,sourceSha256:identity.source.sha256,
 exportFilesVerified:exports.files.length,streams:results,
 behaviorAssertions:12,revealThumbFormulaValue:45,target:75,
 qualification:'Structural source/hash checks and full MP3 decode only; no original runtime, listening, implementation, human, Owner, strict completion or publication acceptance.'};
if(process.argv.includes('--record')){
 const file=path.join(dir,'intake-check-v2.json'),data=JSON.stringify(result,null,2)+'\n';
 if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),data);else fs.writeFileSync(file,data,{flag:'wx'});
}
console.log(JSON.stringify(result));
