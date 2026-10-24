import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware/G6-G8-shared/NMS002/L2';
const extractionRoot='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const mp3Sha256='c29ad5278f052df73d8cdc800b957f2c3645bc3cf2eeeea8858404b2dd41e008';
const pages=[
 {id:'shared-nms002-l02-p053',stem:'L2GS02',swfBytes:236774,
  swfSha256:'f42f6a4759759561035a7c97e7392241513d0410d69214af422425ef37523fdf',
  xml:`${extractionRoot}/p053-source-audit-rjgSPq/movie.xml`,
  xmlSha256:'058b9759e535ea6a861dd5d260a4648af146bfe1f0bcd45f9baee324be0635e1',
  streamIds:[187],blockCount:619},
 {id:'shared-nms002-l02-p054',stem:'L2GS03',swfBytes:2077270,
  swfSha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
  xml:`${extractionRoot}/p054-source-audit-gkoof5/movie.xml`,
  xmlSha256:'2fd8146fe801e80f13c497b4bcefcf4aa050fc6d75decb448424767c56034e46',
  streamIds:[194,208,648,729],blockCount:266},
];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
function stableRead(file,expectedHash,expectedBytes){
 const before=fs.lstatSync(file,{bigint:true});
 assert.ok(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n,file);
 assert.equal(fs.realpathSync(file),file,file);
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[key],after[key],file);
 if(expectedHash)assert.equal(sha(bytes),expectedHash,file);
 if(expectedBytes!==undefined)assert.equal(bytes.length,expectedBytes,file);
 return bytes;
}
function xpath(file,expression){
 return execFileSync('xmllint',['--nonet','--xpath',expression,file],
  {encoding:'utf8',maxBuffer:1_000_000}).trim();
}
function number(value,label){
 assert.match(value,/^\d+$/u,label);
 return Number(value);
}
function attributes(xml){
 return Object.fromEntries([...xml.matchAll(/([A-Za-z][\w]*)="([^"]*)"/gu)]
  .map(match=>[match[1],match[2]]));
}
function inspectStream(file,id){
 const selector=`//DefineSprite[@objectID="${id}"]/tags`;
 const measures=xpath(file,`concat(count(${selector}/SoundStreamHead),':',count(${selector}/SoundStreamBlock),':',count(${selector}/SoundStreamHead/preceding-sibling::ShowFrame)+1,':',count(${selector}/SoundStreamBlock[1]/preceding-sibling::ShowFrame)+1,':',count(${selector}/SoundStreamBlock[last()]/preceding-sibling::ShowFrame)+1)`)
  .split(':').map((item,index)=>number(item,`sprite ${id} measure ${index}`));
 const [headCount,blockCount,headFrame,firstBlockFrame,lastBlockFrame]=measures;
 assert.equal(headCount,1,`sprite ${id} stream head count`);
 assert.ok(blockCount>0&&headFrame<=firstBlockFrame&&firstBlockFrame<=lastBlockFrame,
  `sprite ${id} frame order`);
 const head=attributes(xpath(file,`${selector}/SoundStreamHead`).split('>')[0]);
 assert.equal(head.compression,'2',`sprite ${id} MP3 compression`);
 return {sourceCharacterId:id,headFrame,firstBlockFrame,lastBlockFrame,blockCount,
  head:{compressionCode:Number(head.compression),playbackRateCode:Number(head.playbackRate),
   playbackStereoCode:Number(head.playbackStereo),soundRateCode:Number(head.soundRate),
   soundStereoCode:Number(head.soundStereo),sampleSize:Number(head.sampleSize)},
  cueTiming:'structural-frame-range-only',spokenLanguage:'unverified',
  originalRuntimeAudible:false};
}
function inspect(page){
 const swf=`${sourceRoot}/GS/${page.stem}.swf`;
 const mp3=`${sourceRoot}/SA/${page.stem}.mp3`;
 stableRead(swf,page.swfSha256,page.swfBytes);
 stableRead(page.xml,page.xmlSha256);
 stableRead(mp3,mp3Sha256,763728);
 const ids=[...xpath(page.xml,'//SoundStreamHead/ancestor::DefineSprite/@objectID')
  .matchAll(/objectID="(\d+)"/gu)].map(match=>Number(match[1])).sort((a,b)=>a-b);
 assert.deepEqual(ids,page.streamIds,`${page.id} stream owner identity`);
 const streams=ids.map(id=>inspectStream(page.xml,id));
 const heads=number(xpath(page.xml,'count(//SoundStreamHead)'),'total heads');
 const blocks=number(xpath(page.xml,'count(//SoundStreamBlock)'),'total blocks');
 assert.equal(heads,streams.length);
 assert.equal(blocks,page.blockCount);
 assert.equal(streams.reduce((sum,item)=>sum+item.blockCount,0),blocks);
 const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_entries',
  'format=duration:stream=codec_name,sample_rate,channels','-of','json',mp3],
 {encoding:'utf8'}));
 assert.equal(probe.streams.length,1);
 const audio=probe.streams[0];
 assert.equal(audio.codec_name,'mp3');
 const durationMs=Math.round(Number(probe.format.duration)*1000);
 assert.ok(Number.isSafeInteger(durationMs)&&durationMs>0);
 return {schemaVersion:1,animationId:page.id,
  source:{path:swf,bytes:page.swfBytes,sha256:page.swfSha256},
  extraction:{path:page.xml,sha256:page.xmlSha256,tool:'swfmill 0.3.6'},
  embeddedStreams:streams,
  structuralTotals:{soundStreamHeadCount:heads,soundStreamBlockCount:blocks},
  lessonSaCandidate:{sourceFile:mp3,bytes:763728,sha256:mp3Sha256,
   format:'mp3',sampleRateHz:Number(audio.sample_rate),channels:audio.channels,
   durationMs,language:'undetermined',startSemantics:'unverified-original-host-trigger',
   stopAndReplaySemantics:'unverified',binding:'cataloged-lesson-SA-candidate'},
  limitations:['Static stream frame ranges do not prove natural playback or cue start/stop.',
   'Embedded MP3 payloads have not been decoded or listened to in an authorized original runtime.',
   'Identical SA MP3 bytes do not merge the two page placements or prove language/content.',
   'No audio cue is accepted; human listening and Owner review remain pending.'],
  originalRuntimeAccepted:false,audioAccepted:false,strictComplete:false};
}
function main(){
 const mode=process.argv[2]??'--check';
 assert.ok(['--check','--write','--stdout'].includes(mode)&&process.argv.length<=3,
  'usage: node scripts/audit-nms-l02-p053-p054-audio-structure-v1.mjs [--check|--write|--stdout]');
 if(mode==='--write')for(const page of pages){
  const target=path.join(root,'migrations',page.id,'audit','audio-structure-v1.json');
  assert.ok(!fs.existsSync(target),`${target} already exists`);
 }
 const summary=[];
 for(const page of pages){
  const result=inspect(page);
  const bytes=Buffer.from(`${JSON.stringify(result,null,2)}\n`);
  const target=path.join(root,'migrations',page.id,'audit','audio-structure-v1.json');
  if(mode==='--write')fs.writeFileSync(target,bytes,{flag:'wx'});
  if(mode==='--check')assert.deepEqual(stableRead(target),bytes,`${page.id} audio audit drift`);
  summary.push({animationId:page.id,streams:result.embeddedStreams.length,
   blocks:result.structuralTotals.soundStreamBlockCount,
   saDurationMs:result.lessonSaCandidate.durationMs,bytes:bytes.length,sha256:sha(bytes),
   ...(mode==='--stdout'?{value:result}:{})});
 }
 process.stdout.write(`${JSON.stringify({status:'PASS',mode,summary},null,2)}\n`);
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))main();
