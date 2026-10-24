#!/usr/bin/env node
/** Reproducible, source-only P062 intake. No renderer, scheduling, registry, or acceptance. */
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {readPin,sha256} from '../lib/g678-admission-proof.mjs';
import {parseEmbeddedAudioPayloads} from './build-g4-l3-embedded-audio-archive.mjs';

const SCRIPT=fileURLToPath(import.meta.url);
const ROOT=path.resolve(path.dirname(SCRIPT),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const OUTPUT='output/nms-l02-p062-source-20260928';
export const SWF=Object.freeze({path:'G6-G8-shared/NMS002/L2/TS/L2TS09.swf',bytes:564902,
 sha256:'5a075362f005aab68406d5fae2378f622a64520ec19e4b03b9ac9abbbd5faa50'});
export const LESSON_XML=Object.freeze({path:'G6-G8-shared/NMS002/L2/index.xml',bytes:12845,
 sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61'});
export const SPANISH_AUDIO=Object.freeze({path:'G6-G8-shared/NMS002/L2/SA/L2TS09.mp3',bytes:200592,
 sha256:'868b874f9b29d21036bb0b5330bed3bd52e3f4128635f087b95d8fdea77da48d'});
const STREAM_IDS=[85,138,150,178,192,209,230,256,288,302,315];
const ROOT_SCRIPT_FRAMES=[1,6];
const MAIN_SCRIPT_FRAMES=[384,523,650,766,815,816,834];
const PY_STRUCT=String.raw`import sys,json,collections,xml.etree.ElementTree as ET
r=ET.fromstring(sys.stdin.buffer.read()); h=r.find('Header'); tags=h.find('tags')
def counts(xs): return dict(sorted(collections.Counter(x.tag for x in xs).items()))
def events(xs):
 f=1; out=[]
 for x in xs:
  if x.tag in ('DoAction','PlaceObject2','FrameLabel'):
   d={'frame':f,'tag':x.tag,'attributes':x.attrib}
   if x.tag=='PlaceObject2':
    t=x.find('transform/Transform')
    if t is not None: d['transform']=t.attrib
   out.append(d)
  if x.tag=='ShowFrame': f+=1
 return out
sprites={}
for x in tags:
 if x.tag=='DefineSprite':
  t=x.find('tags');sprites[x.get('objectID')]={'frames':int(x.get('frames')),'directTagCounts':counts(t),'events':events(t) if x.get('objectID')=='315' else []}
print(json.dumps({'swfVersion':int(r.get('version')),'compressed':r.get('compressed')=='1',
 'fps':int(h.get('framerate')),'rootFrames':int(h.get('frames')),
 'stageTwips':h.find('size/Rectangle').attrib,'rootTagCounts':counts(tags),
 'rootEvents':events(tags),'sprites':sprites},sort_keys=True))`;
const PY_DOMAINS=String.raw`import sys,json,xml.etree.ElementTree as ET
r=ET.fromstring(sys.stdin.buffer.read()); root=r.find('Header/tags')
sprites={int(x.get('objectID')):x for x in root if x.tag=='DefineSprite'}
def scan(tags):
 frame=1; placements=[]; actions=[]; streams=[]
 for x in tags:
  if x.tag=='PlaceObject2' and x.get('objectID'):
   child=int(x.get('objectID'))
   if child in sprites: placements.append({'frame':frame,'spriteId':child,'depth':int(x.get('depth')),'name':x.get('name')})
  if x.tag=='DoAction': actions.append(frame)
  if x.tag in ('SoundStreamHead','SoundStreamBlock'): streams.append({'frame':frame,'tag':x.tag})
  if x.tag=='ShowFrame':frame+=1
 return {'frames':frame-1,'placements':placements,'actionFrames':actions,
         'soundStreamHeadFrames':[x['frame'] for x in streams if x['tag']=='SoundStreamHead'],
         'soundStreamBlockCount':sum(x['tag']=='SoundStreamBlock' for x in streams)}
domains={'root':scan(root)}
queue=[('root',None)]; seen={'root'}
while queue:
 name,parent=queue.pop(0)
 for p in domains[name]['placements']:
  child=p['spriteId']; key='sprite-'+str(child)
  if key not in seen:
   seen.add(key); domains[key]=scan(sprites[child].find('tags'))
   domains[key]['firstReachedFrom']={'parent':name,'frame':p['frame'],'depth':p['depth']}
   queue.append((key,name))
print(json.dumps({'definedSpriteCount':len(sprites),'reachableDomainCount':len(domains),
 'domains':domains},sort_keys=True))`;

function run(command,args,{input,maxBuffer=32*1024*1024}={}){
 const result=spawnSync(command,args,{input,maxBuffer,encoding:null});
 assert.equal(result.error,undefined,`${command} unavailable: ${result.error?.message}`);
 assert.equal(result.status,0,`${command} failed: ${result.stderr?.toString('utf8')}`);
 return result;
}
function assertPhysical(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'exact real AWS source root');
 for(const directory of [ROOT,SOURCE_ROOT]){
  assert.equal(fs.realpathSync(directory),directory,`physical directory: ${directory}`);
  assert(fs.lstatSync(directory).isDirectory(),`ordinary directory: ${directory}`);
 }
}
function assertToolVersions(){
 const swfmillVersion=run('swfmill',['--version']);
 assert.equal((swfmillVersion.stdout.toString('utf8')+swfmillVersion.stderr.toString('utf8')).trim(),'swfmill 0.3.6',
  'pinned swfmill version');
 assert(run('ffmpeg',['-version']).stdout.toString('utf8').startsWith('ffmpeg version 8.1.2 '),
  'pinned FFmpeg version');
 assert(run('ffprobe',['-version']).stdout.toString('utf8').startsWith('ffprobe version 8.1.2 '),
  'pinned FFprobe version');
}
function pinBytes(relative,bytes){return {path:relative,bytes:bytes.length,sha256:sha256(bytes)};}
function listRegular(directory){
 const result=[];
 function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name))){
  const file=path.join(dir,entry.name);
  if(entry.isDirectory())visit(file);
  else {assert(entry.isFile()&&!entry.isSymbolicLink(),`ordinary export: ${file}`);result.push(file);}
 }}
 visit(directory);return result;
}
export function resolveP062Placement(xml){
 const pages=[...xml.matchAll(/<Page\b([^>]*)>([^<]+)<\/Page>/gu)]
  .filter(match=>!xml.slice(xml.lastIndexOf('\n',match.index)+1,match.index).includes('<!--'));
 const chosen=pages.filter(match=>match[2]==='TS/L2TS09.swf');
 assert.equal(pages.length,64,'64 active lesson pages');
 assert.equal(chosen.length,1,'one exact P062 XML reference');
 const index=pages.indexOf(chosen[0]);
 const section=pages.slice(0,index+1).filter(match=>match[2].startsWith('TS/'));
 assert.equal(index+1,62,'P062 source-ordered page');
 assert.equal(section.length,8,'P062 eighth TS placement');
 return {lessonPageCount:pages.length,globalPageOrdinal:index+1,section:'TS',
  sectionPageOrdinal:section.length,reference:chosen[0][2],
  title:chosen[0][1].match(/\bTitle="([^"]*)"/u)?.[1]??null,
  previous:'shared-nms002-l02-p061',next:'shared-nms002-l02-p063',
  pairedFlaPresent:false};
}
function parseStructure(xmlBytes){
 const structure=JSON.parse(run('python3',['-c',PY_STRUCT],{input:xmlBytes}).stdout);
 assert.equal(structure.swfVersion,6);
 assert.equal(structure.compressed,true);
 assert.equal(structure.fps,12);
 assert.equal(structure.rootFrames,10);
 assert.deepStrictEqual(structure.stageTwips,{left:'0',right:'16000',top:'0',bottom:'12000'});
 const rootPlace=structure.rootEvents.filter(e=>e.tag==='PlaceObject2'&&e.attributes.objectID==='315');
 assert.equal(rootPlace.length,1);
 assert.equal(rootPlace[0].frame,6);
 assert.equal(rootPlace[0].attributes.depth,'3');
 assert.deepStrictEqual(rootPlace[0].transform,{transX:'8247',transY:'5658'});
 const rootScripts=structure.rootEvents.filter(e=>e.tag==='DoAction').map(e=>e.frame);
 assert.deepStrictEqual(rootScripts,ROOT_SCRIPT_FRAMES);
 const main=structure.sprites['315'];
 assert.equal(main.frames,837);
 assert.equal(main.directTagCounts.ShowFrame,837);
 assert.equal(main.directTagCounts.SoundStreamBlock,820);
 assert.deepStrictEqual(main.events.filter(e=>e.tag==='DoAction').map(e=>e.frame),MAIN_SCRIPT_FRAMES);
 assert.deepStrictEqual(STREAM_IDS.map(id=>structure.sprites[String(id)].directTagCounts.SoundStreamHead),
  Array(11).fill(1));
 return {...structure,rootTeachingPlacement:rootPlace[0],rootActionFrames:rootScripts,
  teachingSpriteId:315,teachingActionFrames:MAIN_SCRIPT_FRAMES};
}
function decodePayload(payload,stream){
 const rate=stream.head.sampleRateHz,channels=stream.head.channels;
 assert.equal(stream.head.format,'mp3');
 assert.equal(rate,22050);
 assert(channels===1||channels===2);
 const probe=JSON.parse(run('ffprobe',['-v','error','-count_frames','-select_streams','a:0',
  '-show_entries','stream=codec_name,sample_rate,channels,nb_read_frames,duration','-of','json','pipe:0'],
  {input:payload}).stdout);
 assert.equal(probe.streams?.length,1);
 assert.equal(probe.streams[0].codec_name,'mp3');
 assert.equal(Number(probe.streams[0].sample_rate),rate);
 assert.equal(probe.streams[0].channels,channels);
 const pcm=run('ffmpeg',['-v','error','-xerror','-i','pipe:0','-map','0:a:0','-f','s16le',
  '-acodec','pcm_s16le','-ac',String(channels),'-ar',String(rate),'pipe:1'],{input:payload}).stdout;
 assert.equal(pcm.length%(2*channels),0);
 const decodedSamples=pcm.length/(2*channels);
 assert.equal(decodedSamples,stream.totalBlockHeaderSampleCount,`full EOF samples ${stream.ownerDomainId}`);
 return {codec:'mp3',sampleRateHz:rate,channels,fullEofDecode:true,
  decodedSamples,decodedDurationSeconds:decodedSamples/rate,
  decodedPcmSha256:sha256(pcm),mp3FramesRead:Number(probe.streams[0].nb_read_frames),
  ffprobeDurationSeconds:Number(probe.streams[0].duration)};
}
function rawStream(stream,payloadPin){
 const blocks=stream.blocks.map((block,index)=>{
  assert.equal(block.blockIndex,index+1);
  assert.equal(block.localFrame,stream.blocks[0].localFrame+index,`contiguous ${stream.ownerDomainId} block frames`);
  const next=stream.blocks[index+1];
  assert.equal(block.payload.byteOffsetInStreamArchive+block.payload.byteLength,
   next?next.payload.byteOffsetInStreamArchive:payloadPin.bytes,`contiguous ${stream.ownerDomainId} bytes`);
  return {blockIndex:block.blockIndex,frame:block.localFrame,
   sourceTag:{globalOrdinal:block.globalTagOrdinal,ordinalInDomain:block.tagOrdinalInDomain,
    recordHeaderHex:block.swfTagRecordHeader.hex,bodyBytes:block.tagBodyBytes,
    bodySha256:block.tagBodySha256},wrapperHex:block.codecWrapperHeader.hex,
   declaredSamples:block.codecWrapperHeader.explicitSampleCount,
   signedSeekSamples:block.codecWrapperHeader.mp3SeekSamples,
   payload:{offset:block.payload.byteOffsetInStreamArchive,bytes:block.payload.byteLength,
    sha256:block.payload.sha256}};
 });
 return {ownerDomainId:stream.ownerDomainId,ownerDomainKind:stream.ownerDomainKind,
  headLocalFrame:stream.headLocalFrame,header:stream.head,blockCount:blocks.length,
  blockFrameRange:{first:blocks[0].frame,last:blocks.at(-1).frame,inclusive:true},
  declaredSamples:stream.totalBlockHeaderSampleCount,payload:payloadPin,
  emptyPayloadFrames:blocks.filter(b=>b.payload.bytes===0).map(b=>b.frame),
  negativeSeekBlocks:blocks.filter(b=>b.signedSeekSamples<0).map(b=>({frame:b.frame,seekSamples:b.signedSeekSamples})),
  blocks};
}

export function buildP062Source(){
 assertPhysical();
 assertToolVersions();
 const source=readPin(SOURCE_ROOT,SWF),xml=readPin(SOURCE_ROOT,LESSON_XML).toString();
 readPin(SOURCE_ROOT,SPANISH_AUDIO); // distinct inventory; never joined to any stream
 assert(!fs.existsSync(path.join(SOURCE_ROOT,'G6-G8-shared/NMS002/L2/TS/L2TS09.fla')),
  'no same-path FLA in real source root');
 for(const [language,relative] of [
  ['English','HELP_KEYTERMS/KT/XML/L2KTE01.xml'],
  ['Spanish','HELP_KEYTERMS/KT/XML/L2KTS01.xml'],
 ]){
  assert(xml.includes(`<${language}>${relative}</${language}>`),`exact ${language} lesson glossary reference`);
  assert(!fs.existsSync(path.join(SOURCE_ROOT,relative)),`named ${language} L2 glossary remains missing`);
 }
 const placement=resolveP062Placement(xml);
 const parsed=parseEmbeddedAudioPayloads(source);
 assert.deepStrictEqual(parsed.tagCounts,
  {DefineSound:0,SoundStreamHead:11,SoundStreamHead2:0,SoundStreamBlock:1142});
 assert.deepStrictEqual(parsed.soundStreams.map(s=>Number(s.ownerDomainId.slice(7))),STREAM_IDS);
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'nms-l02-p062-source-'));
 try{
  const swfPath=path.join(SOURCE_ROOT,SWF.path);
  const swfmillPath=path.join(temp,'swfmill.xml');
  const swfmill=run('swfmill',['swf2xml',swfPath,swfmillPath]);
  const swfmillBytes=fs.readFileSync(swfmillPath);
  const structure=parseStructure(swfmillBytes);
  const reachableFrameDomains=JSON.parse(run('python3',['-c',PY_DOMAINS],{input:swfmillBytes}).stdout);
  assert.equal(reachableFrameDomains.definedSpriteCount,20);
  assert.equal(reachableFrameDomains.domains.root.frames,10);
  assert.equal(reachableFrameDomains.domains['sprite-315'].frames,837);
  const ffdecDir=path.join(temp,'ffdec');
  const ffdec=run('ffdec',['-onerror','abort','-export','script,text',ffdecDir,swfPath]);
  assert(ffdec.stdout.toString().includes('JPEXS Free Flash Decompiler v.26.2.1'),
   'pinned FFDec 26.2.1 export');
  const outputs=new Map([[`${OUTPUT}/extraction/swfmill.xml`,swfmillBytes]]);
  outputs.set(`${OUTPUT}/frame-domain-audit.json`,Buffer.from(`${JSON.stringify({
   schemaVersion:1,kind:'nms-l02-p062-source-reachable-frame-domains-v1',source:SWF,
   ...reachableFrameDomains,originalRuntimeReachabilityEstablished:false,
  },null,2)}\n`));
  const ffdecPins=[];
  for(const file of listRegular(ffdecDir)){
   const relative=path.relative(ffdecDir,file).split(path.sep).join('/');
   const output=`${OUTPUT}/extraction/ffdec/${relative}`;
   const bytes=fs.readFileSync(file);
   outputs.set(output,bytes);ffdecPins.push(pinBytes(output,bytes));
  }
  const scripts=ffdecPins.filter(pin=>pin.path.includes('/scripts/'));
  const texts=ffdecPins.filter(pin=>pin.path.includes('/texts/'));
  assert.equal(scripts.length,60,'complete FFDec AS export');
  assert.equal(texts.length,72,'complete FFDec text export');
  for(const frame of ROOT_SCRIPT_FRAMES)
   assert(scripts.some(pin=>pin.path.endsWith(`/scripts/frame_${frame}/DoAction.as`)),`root AS frame ${frame}`);
  for(const frame of MAIN_SCRIPT_FRAMES)
   assert(scripts.some(pin=>pin.path.endsWith(`/scripts/DefineSprite_315/frame_${frame}/DoAction.as`)),
    `teaching AS frame ${frame}`);
  const rootFrame1=outputs.get(`${OUTPUT}/extraction/ffdec/scripts/frame_1/DoAction.as`).toString();
  const rootFrame6=outputs.get(`${OUTPUT}/extraction/ffdec/scripts/frame_6/DoAction.as`).toString();
  assert(rootFrame1.includes('_level0.InternalPreloader.gotoAndPlay("jump_check")')&&rootFrame1.includes('stop();'));
  assert.equal(rootFrame6.trim(),'stop();');
  const mainActions=MAIN_SCRIPT_FRAMES.map(frame=>{
   const pin=scripts.find(item=>item.path.endsWith(`/DefineSprite_315/frame_${frame}/DoAction.as`));
   const text=outputs.get(pin.path).toString();
   return {frame,pin,hasStop:/\bstop\(\);/u.test(text),scriptUtf8:text};
  });
  assert.deepStrictEqual(mainActions.filter(item=>item.hasStop).map(item=>item.frame),
   [384,523,650,766,815,834]);
  const buttonActions=scripts.filter(pin=>pin.path.includes('/DefineButton2_')).map(pin=>{
   const characterId=Number(pin.path.match(/DefineButton2_(\d+)/u)?.[1]);
   const text=outputs.get(pin.path).toString();
   return {characterId,keyAttribute:text.match(/_global\.KeyAttribute = "([^"]+)"/u)?.[1]??null,
    pin,scriptUtf8:text};
  }).sort((a,b)=>a.characterId-b.characterId);
  assert.equal(buttonActions.length,7);
  const glossaryKeys=buttonActions.map(item=>item.keyAttribute).filter(Boolean);
  assert.deepStrictEqual(glossaryKeys,[]);
  const textRecords=texts.map(pin=>({characterId:Number(pin.path.match(/\/texts\/(\d+)\.txt$/u)?.[1]),
   pin,textUtf8:outputs.get(pin.path).toString('utf8')})).sort((a,b)=>a.characterId-b.characterId);
  assert(textRecords.every(item=>Number.isInteger(item.characterId)));
  const rawStreams=[];const streamSummaries=[];
  for(const stream of parsed.soundStreams){
   const id=Number(stream.ownerDomainId.slice(7));
   const payload=Buffer.from(stream._payloadBytes);
   const output=`${OUTPUT}/extraction/audio/sprite-${id}.mp3`;
   const pin=pinBytes(output,payload);
   assert.equal(pin.sha256,stream.payload.sha256);
   outputs.set(output,payload);
   const raw=rawStream(stream,pin),decode=decodePayload(payload,stream);
   rawStreams.push(raw);
   const {blocks,...summary}=raw;
   streamSummaries.push({...summary,decode});
  }
  assert.equal(rawStreams.reduce((sum,stream)=>sum+stream.blockCount,0),1142);
  assert.equal(rawStreams.at(-1).ownerDomainId,'sprite-315');
  assert.equal(rawStreams.at(-1).blockCount,820);
  assert.deepStrictEqual(rawStreams.at(-1).blockFrameRange,{first:9,last:828,inclusive:true});
  const rawIndex={schemaVersion:1,kind:'nms-l02-p062-embedded-stream-raw-index-v1',
   animationId:'shared-nms002-l02-p062',status:'source-only-no-scheduling-policy',
   sourceRoot:SOURCE_ROOT,source:SWF,parserVersion:parsed.parserVersion,
   sourceBinary:parsed.source,tagCounts:parsed.tagCounts,
   streams:rawStreams,emptyBlockSilenceInserted:false,seekTrimApplied:false,
   originalRuntimeSynchronizationEstablished:false,audioListeningAccepted:false};
  const rawIndexBytes=Buffer.from(`${JSON.stringify(rawIndex,null,2)}\n`);
  outputs.set(`${OUTPUT}/audio-raw-index.json`,rawIndexBytes);
  const saProbe=JSON.parse(run('ffprobe',['-v','error','-select_streams','a:0',
   '-show_entries','stream=codec_name,sample_rate,channels,duration','-of','json',
   path.join(SOURCE_ROOT,SPANISH_AUDIO.path)]).stdout);
  assert.equal(saProbe.streams?.[0]?.codec_name,'mp3');
  const audit={schemaVersion:1,kind:'nms-l02-p062-source-static-audit-v1',
   animationId:'shared-nms002-l02-p062',status:'source-only-no-registration',
   sourceRoot:SOURCE_ROOT,source:SWF,sourceXml:LESSON_XML,placement,
   tools:{swfmill:'0.3.6',ffdec:'26.2.1',ffmpeg:'8.1.2',
    commands:['swfmill swf2xml <source> <temporary-output>',
     'ffdec -onerror abort -export script,text <temporary-output> <source>',
     'ffmpeg -v error -xerror -i pipe:0 -map 0:a:0 -f s16le -acodec pcm_s16le -ac <source-channels> -ar 22050 pipe:1'],
    swfmillStderr:swfmill.stderr.toString('utf8').trim()},
   sourceStructure:structure,reachableFrameDomains:pinBytes(`${OUTPUT}/frame-domain-audit.json`,
    outputs.get(`${OUTPUT}/frame-domain-audit.json`)),rootScripts:{frames:ROOT_SCRIPT_FRAMES,
    pins:scripts.filter(pin=>/\/scripts\/frame_(?:1|6)\/DoAction\.as$/u.test(pin.path))},
   teachingActions:mainActions,buttonActions,textRecords,
   audio:{tagCounts:parsed.tagCounts,streams:streamSummaries,
    rawIndex:pinBytes(`${OUTPUT}/audio-raw-index.json`,rawIndexBytes),
    separateLessonSa:{pin:SPANISH_AUDIO,codec:'mp3',sampleRateHz:Number(saProbe.streams[0].sample_rate),
     channels:saProbe.streams[0].channels,ffprobeDurationSeconds:Number(saProbe.streams[0].duration),
     sourceBinding:'lesson-index-only-not-spliced'},
    emptyBlockSilenceInserted:false,seekTrimApplied:false,
    originalRuntimeSynchronizationEstablished:false,listeningAccepted:false},
   glossary:{sourceKeys:glossaryKeys,
    lessonNamedEnglishBank:'HELP_KEYTERMS/KT/XML/L2KTE01.xml',
    lessonNamedSpanishBank:'HELP_KEYTERMS/KT/XML/L2KTS01.xml',
    namedL2BankFilesPresent:false,historicalHostBankBindingEstablished:false,
    lookupResultEstablished:false},
   extraction:{files:[...outputs.entries()].filter(([name])=>name.startsWith(`${OUTPUT}/extraction/`))
    .map(([name,bytes])=>pinBytes(name,bytes)).sort((a,b)=>a.path.localeCompare(b.path)),
    ffdecScriptCount:60,ffdecTextCount:72,audioPayloadCount:11},
   implementationLane:'behavior-heavy-source-first-advanced-manual',
   acceptanceEffects:{originalRuntimeFidelity:false,audioAccepted:false,humanReviewed:false,
    ownerAccepted:false,strictComplete:false,published:false}};
  const auditBytes=Buffer.from(`${JSON.stringify(audit,null,2)}\n`);
  outputs.set(`${OUTPUT}/source-audit.json`,auditBytes);
  const main=streamSummaries.at(-1);
  const readme=`# NMS002 L02 P062 source intake — 2026-09-28\n\n`+
   `This source-only receipt binds the real AWS SWF, lesson XML, separate SA inventory, all FFDec text/AS exports, swfmill XML, and 11 independently extracted embedded MP3 streams. It does not register or render P062.\n\n`+
   `The real \`${SWF.path}\` is ${SWF.bytes} bytes, SHA-256 \`${SWF.sha256}\`. Lesson XML places it once at page ${placement.globalPageOrdinal} (TS ${placement.sectionPageOrdinal}), title \`${placement.title}\`. No same-path FLA exists. The separate SA \`${SPANISH_AUDIO.path}\` is ${SPANISH_AUDIO.bytes} bytes, SHA-256 \`${SPANISH_AUDIO.sha256}\`; index-level binding only, never spliced or auto-started.\n\n`+
   `The SWF is CWS v6, 800 × 600 at 12 fps. Root frame 6 places sprite 315 at depth 3 and (8247,5658) twips. Root scripts are frames 1 and 6. Sprite 315 has 837 frames and action frames ${MAIN_SCRIPT_FRAMES.join(', ')}; its authored stops are at ${mainActions.filter(a=>a.hasStop).map(a=>a.frame).join(', ')}. FFDec 26.2.1 exported all 60 scripts and 72 text records. Every raw file and its text is hash-bound in [source-audit.json](source-audit.json). swfmill 0.3.6 emitted UnknownTag/nested-end warnings even though its XML parses; those warnings remain recorded in the audit and are not interpreted as runtime behavior.\n\n`+
   `There are 11 SoundStreamHead records and 1,142 source blocks: 820 in main sprite 315 (frames 9–828) and 322 across ten nested sprites. The main source-order MP3 payload is ${main.payload.bytes} bytes, SHA-256 \`${main.payload.sha256}\`; full-EOF FFmpeg decode produced ${main.decode.decodedSamples} ${main.decode.channels}-channel samples at ${main.decode.sampleRateHz} Hz. [audio-raw-index.json](audio-raw-index.json) retains all 1,142 block frame indices, source tag headers, declared samples, signed seeks, and payload offsets/hashes. Sprite 288 is stereo; the other ten streams are mono. Main frames 10 and 828 have empty payloads, and frame 828 carries seek -2239. Empty blocks are not treated as silence; no trimming or reclocking is selected.\n\n`+
   `Seven button scripts and eight main-timeline clip-action scripts are extracted. No source KeyAttribute or DoHyperLinks call appears in these 60 scripts; the page is a quiz and feedback interaction, not a demonstrated glossary page. Lesson XML names L2KTE01/L2KTS01, which are absent at their named real-source paths; no historical glossary bank association is claimed. These source-static exports do not establish the original host's interactions, audio synchronization, listening quality, Current-JS fidelity, human/Owner acceptance, strict completion, or publication.\n`;
  outputs.set(`${OUTPUT}/README.md`,Buffer.from(readme));
  return {outputs,audit,rawIndex};
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
}

export function applyP062Source(mode){
 assert(['--write','--check'].includes(mode),'use --write or --check');
 const built=buildP062Source();
 if(mode==='--write'){
  for(const name of built.outputs.keys())assert(!fs.existsSync(path.join(ROOT,name)),`existing P062 output: ${name}`);
  for(const [name,bytes] of built.outputs){
   const file=path.join(ROOT,name);fs.mkdirSync(path.dirname(file),{recursive:true});
   fs.writeFileSync(file,bytes,{flag:'wx'});
  }
 }else{
  for(const [name,bytes] of built.outputs)
   assert(fs.readFileSync(path.join(ROOT,name)).equals(bytes),`P062 output drift: ${name}`);
  const actual=listRegular(path.join(ROOT,OUTPUT))
   .map(file=>path.relative(ROOT,file).split(path.sep).join('/')).sort();
  assert.deepStrictEqual(actual,[...built.outputs.keys()].sort(),'no unpinned P062 output file');
 }
 return {status:'PASS',mode,source:SWF,extractionFiles:built.audit.extraction.files.length,
  scripts:built.audit.extraction.ffdecScriptCount,texts:built.audit.extraction.ffdecTextCount,
  streams:built.rawIndex.streams.length,blocks:built.rawIndex.streams.reduce((n,s)=>n+s.blockCount,0),
  outputs:[`${OUTPUT}/source-audit.json`,`${OUTPUT}/audio-raw-index.json`,`${OUTPUT}/README.md`]
   .map(name=>pinBytes(name,built.outputs.get(name))),
  registrationEffect:'none',acceptanceEffect:'none'};
}

if(process.argv[1]&&path.resolve(process.argv[1])===SCRIPT){
 try{
  assert(process.argv.length===3,'use --write or --check');
  process.stdout.write(`${JSON.stringify(applyP062Source(process.argv[2]))}\n`);
 }catch(error){process.stderr.write(`${error.stack??error}\n`);process.exitCode=1;}
}
