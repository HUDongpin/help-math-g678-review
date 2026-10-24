#!/usr/bin/env node
/** Reproducible, source-only P008 audit. No runtime, listening, or acceptance claim. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SWF='G6-G8-shared/ALG001/L6/RW/L6RW07.swf';
const SHA='6ea847e4682f9581cd72ee4a2fd8a177c9584cbf7a53ab8a2421e1ee0f012350';
const ID='shared-alg001-l06-p008';
const OUT=path.join(ROOT,'migrations',ID,'audit','source-v1');
const SCRATCH='/Volumes/American Dream/hudongpin';
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const json=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const pin=(name,bytes)=>({name,bytes:bytes.length,sha256:hash(bytes)});

function filesIn(directory,base=directory){
 const result=[];
 for(const entry of fs.readdirSync(directory,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
  const absolute=path.join(directory,entry.name);
  assert(!entry.isSymbolicLink(),`unexpected export symlink: ${absolute}`);
  if(entry.isDirectory())result.push(...filesIn(absolute,base));
  else {assert(entry.isFile());result.push({name:path.relative(base,absolute).split(path.sep).join('/'),bytes:fs.readFileSync(absolute)});}
 }
 return result;
}

function sourceRead(){
 assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,SOURCE_ROOT,'real AWS source root required');
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const absolute=path.join(SOURCE_ROOT,SWF);
 assert.equal(fs.realpathSync(absolute),absolute);
 const before=fs.statSync(absolute,{bigint:true});
 assert.equal(before.mode&0o222n,0n,'source is read-only');
 const bytes=fs.readFileSync(absolute);
 assert.equal(bytes.length,2805364);assert.equal(hash(bytes),SHA);
 const after=fs.statSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','ctimeNs'])assert.equal(before[key],after[key],`stable source ${key}`);
 return bytes;
}

function publicExtraction(swf){
 assert(fs.existsSync(SCRATCH)&&fs.realpathSync(SCRATCH)===SCRATCH,'physical scratch root');
 const temporary=fs.mkdtempSync(path.join(SCRATCH,'g678-p008-source-audit-'));
 try{
  const xmlPath=path.join(temporary,'movie.xml'),ffdecPath=path.join(temporary,'ffdec');
  // Tools read the frozen source in place; all generated files stay on American Dream.
  execFileSync('swfmill',['-n','swf2xml',swf,xmlPath],{stdio:'pipe',maxBuffer:1024*1024});
  execFileSync('ffdec',['-onerror','abort','-export','script,image,shape,text',ffdecPath,swf],
   {stdio:'pipe',maxBuffer:1024*1024});
  const xml=fs.readFileSync(xmlPath);
  assert(xml.includes(Buffer.from('<Header framerate="12" frames="10">')));
  for(const [id,frames] of [[20,22],[194,22],[507,938],[510,1]])
   assert(xml.includes(Buffer.from(`<DefineSprite objectID="${id}" frames="${frames}">`)));
  const entries=filesIn(ffdecPath);
  const counts=Object.fromEntries(['scripts','images','shapes','texts'].map(kind=>
   [kind,entries.filter(entry=>entry.name.startsWith(`${kind}/`)).length]));
  assert.deepEqual(counts,{scripts:3,images:13,shapes:461,texts:30});
  const scriptMap=Object.fromEntries(entries.filter(e=>e.name.startsWith('scripts/'))
   .map(e=>[e.name,e.bytes.toString('utf8').replace(/\r\n/g,'\n').trim()]));
  assert.deepEqual(scriptMap,{
   'scripts/DefineSprite_507/frame_938/DoAction.as':'stop();',
   'scripts/frame_1/DoAction.as':'_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();',
   'scripts/frame_6/DoAction.as':'stop();',
  });
  const manifest=entries.map(entry=>pin(entry.name,entry.bytes));
  // Deterministic compressed archive avoids committing 77 MB of individual SVGs.
  const archive=gzipSync(Buffer.from(JSON.stringify({format:'path-and-base64-v1',
   files:entries.map(entry=>({path:entry.name,base64:entry.bytes.toString('base64')}))})+'\n'),{level:9});
  const xmlArchive=gzipSync(xml,{level:9});
  return {manifest,counts,scriptMap,archive,xmlArchive,
   swfmillVersion:execFileSync('swfmill',['--version'],{encoding:'utf8'}).trim(),
   ffdecVersion:execFileSync('ffdec',['-help'],{encoding:'utf8',maxBuffer:1024*1024}).split('\n')[0].trim()};
 }finally{fs.rmSync(temporary,{recursive:true,force:true});}
}

export function auditP008(){
 const source=sourceRead(),facts=parseSwfSourceFacts(source),text=collectSwfTextSourceCatalog(source);
 assert.equal(facts.header.fps,12);assert.equal(facts.header.rootFrameCount,10);
 assert.deepEqual(facts.frameDomains.domains.map(d=>[d.domainId,d.declaredFrameCount]),
  [['root',10],['sprite-20',22],['sprite-194',22],['sprite-507',938],['sprite-510',1]]);
 assert.equal(facts.actionScript.version,'AS1/2');
 assert.equal(facts.tagCounts.DefineText,30);assert.equal(text.summary.shapeDefinitions,461);
 assert.equal(text.summary.bitmapDefinitions,13);assert.equal(text.summary.buttonDefinitions,0);
 const root=text.timelines.find(d=>d.timelineId==='root');
 const main=text.timelines.find(d=>d.timelineId==='sprite-507');
 const rootPlaces=root.events.filter(e=>e.kind==='place');
 assert.equal(rootPlaces.length,4);
 assert.deepEqual(rootPlaces.map(e=>[e.frame,e.depth,e.characterId,e.matrix]),[
  [6,1,507,[1,0,0,1,7390,5060]],
  [6,502,508,[1,0,0,1,2867,-3700]],
  [6,503,510,[1,0,0,1,8000,879]],
  [6,505,511,[1,0,0,1,0,0]],
 ]);
 const masks=main.events.filter(e=>e.kind==='place'&&e.clipDepth!==undefined).map(event=>{
  const instance=main.instances.find(i=>i.instanceId===event.instanceId);
  assert(instance);
  return {event,instance};
 });
 assert.deepEqual(masks.map(({event,instance})=>
  [event.frame,event.depth,event.characterId,event.clipDepth,instance.lastFrameExclusive]),
  [[1,1,1,498,939],[791,388,428,403,854]]);
 const nested=main.instances.filter(i=>[20,194].includes(i.characterId));
 assert.deepEqual(nested.map(i=>[i.characterId,i.depth,i.firstFrame,i.lastFrameExclusive]),
  [[20,56,1,19],[20,73,449,464],[194,318,636,646],[20,73,936,939]]);
 const stream=extractTerminalStream(source,'sprite-507');
 assert.equal(stream.blocks.length,911);assert.equal(stream.blocks[0].frame,19);
 assert.equal(stream.blocks.at(-1).frame,938);
 assert.equal(stream.mp3.length,377130);
 assert.deepEqual(stream.actions.map(a=>[a.domain,a.frame,a.bytes,a.sha256]),[
  ['root',1,73,'8230b64765b935120a08654ce7e74ecfc3eaa3f00b90379acca03918e38dd9ac'],
  ['root',6,2,'0a6361b3a802f55cd5ae06101c88a1e216320fe11cc0cfe1d791eed08a1200fd'],
  ['sprite-507',938,2,'0a6361b3a802f55cd5ae06101c88a1e216320fe11cc0cfe1d791eed08a1200fd']]);
 const catalogPath='catalog/g678-shared-catalog.v1.json',catalogBytes=fs.readFileSync(path.join(ROOT,catalogPath));
 const matching=JSON.parse(catalogBytes).lessons.flatMap(l=>l.pages.map(p=>({l,p}))).filter(x=>x.p.animationId===ID);
 assert.equal(matching.length,1);const {l:lesson,p:page}=matching[0];
 assert.equal(page.viewPath,SWF);assert.equal(page.sourceSha256,SHA);
 assert.equal(page.globalOrdinal,8);assert.equal(page.sectionCode,'RW');assert.equal(page.sectionPageOrdinal,7);
 const sa=page.audioCueCandidates;assert.equal(sa.length,1);
 const saBytes=fs.readFileSync(path.join(SOURCE_ROOT,sa[0].viewPath));
 assert.equal(hash(saBytes),sa[0].sha256);
 const extracted=publicExtraction(path.join(SOURCE_ROOT,SWF));
 const composition={schemaVersion:1,kind:'alg-l06-p008-source-composition-v1',
  coordinateUnit:'twips',pixelDivisor:20,
  root:{declaredFrames:10,events:root.events,instances:root.instances},
  main:{domainId:'sprite-507',declaredFrames:938,rootEntryFrame:6,
   rootPlacement:rootPlaces.find(e=>e.characterId===507),
   masks,nestedSprites:nested.map(instance=>({instance,
    placement:main.events.find(e=>e.eventId===instance.createdByEventId)})),
   eventCount:main.events.length,instanceCount:main.instances.length},
  otherDomains:text.timelines.filter(d=>!['root','sprite-507'].includes(d.timelineId))
   .map(d=>({timelineId:d.timelineId,declaredFrameCount:d.declaredFrameCount,
    events:d.events,instances:d.instances}))};
 const audio={schemaVersion:1,kind:'alg-l06-p008-source-stream-v1',
  domainId:'sprite-507',heads:stream.heads,actions:stream.actions,blocks:stream.blocks,
  mp3:pin('source-stream-v1.mp3',stream.mp3),
  gapFrames:Array.from({length:938-19+1},(_,i)=>i+19).filter(f=>!stream.blocks.some(b=>b.frame===f)),
  negativeSeekFrames:stream.blocks.filter(b=>b.seek<0).map(b=>b.frame),
  audibleAlignmentAccepted:false};
 const outputs=new Map([
  ['source-facts-v1.json',json(facts)],['source-text-v1.json',json(text)],
  ['source-composition-v1.json',json(composition)],['source-stream-v1.json',json(audio)],
  ['source-stream-v1.mp3',stream.mp3],
  ['swfmill-v1.xml.gz',extracted.xmlArchive],['ffdec-export-v1.json.gz',extracted.archive],
  ['ffdec-export-manifest-v1.json',json({schemaVersion:1,kind:'alg-l06-p008-ffdec-extraction-v1',
   format:'path-and-base64-v1',counts:extracted.counts,files:extracted.manifest,
   scripts:extracted.scriptMap})],
 ]);
 const report={schemaVersion:1,kind:'alg-l06-p008-source-audit-v1',animationId:ID,
  source:{root:SOURCE_ROOT,path:SWF,bytes:source.length,sha256:SHA},
  catalog:{path:catalogPath,bytes:catalogBytes.length,sha256:hash(catalogBytes),
   lessonKey:lesson.stableLessonKey,globalOrdinal:page.globalOrdinal,
   sectionCode:page.sectionCode,sectionPageOrdinal:page.sectionPageOrdinal},
  tools:{swfmill:extracted.swfmillVersion,ffdec:extracted.ffdecVersion,
   structuralParser:'parseSwfSourceFacts',textParser:'collectSwfTextSourceCatalog'},
  header:facts.header,frameDomains:facts.frameDomains.domains.map(d=>({
   domainId:d.domainId,declaredFrames:d.declaredFrameCount,observedFrames:d.observedShowFrameCount,
   rootReachable:d.staticallyRootReachable,parents:d.parentDomainIds})),
  actionScript:{...facts.actionScript,decompiled:extracted.scriptMap},tagCounts:facts.tagCounts,
  textDefinitions:text.textDefinitions.map(d=>({characterId:d.characterId,
   text:d.runs?.map(r=>r.text).join('')??d.initialText?.text??null})),
  masks:masks.map(({event,instance})=>({characterId:event.characterId,depth:event.depth,
   clipDepth:event.clipDepth,firstFrame:instance.firstFrame,lastFrameExclusive:instance.lastFrameExclusive})),
  nestedSprites:nested.map(i=>({characterId:i.characterId,depth:i.depth,
   firstFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive})),
  audio:{embedded:audio.mp3,blockCount:stream.blocks.length,
   firstBlockFrame:stream.blocks[0].frame,lastBlockFrame:stream.blocks.at(-1).frame,
   gapFrames:audio.gapFrames,negativeSeekFrames:audio.negativeSeekFrames,
   optionalSpanish:{path:sa[0].viewPath,bytes:saBytes.length,sha256:hash(saBytes),
    status:'catalog-candidate-only'}},
  ffdecExportCounts:extracted.counts,
  outputs:[...outputs].map(([name,bytes])=>pin(name,bytes)),
  claimBoundary:'Public-tool source structure only; no original runtime, audio listening, human/Owner, fidelity, registration or publication acceptance.'};
 outputs.set('source-audit-v1.json',json(report));
 assert([...outputs.values()].reduce((sum,bytes)=>sum+bytes.length,0)<100_000_000,
  'compact persisted source audit under 100 MB');
 return outputs;
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--prepare','--check'].includes(process.argv[2]),
  'Usage: --prepare | --check');
 const outputs=auditP008();
 if(process.argv[2]==='--prepare')fs.mkdirSync(OUT,{recursive:true});
 for(const [name,bytes] of outputs){const target=path.join(OUT,name);
  if(process.argv[2]==='--prepare'&&!fs.existsSync(target))fs.writeFileSync(target,bytes,{flag:'wx'});
  assert.deepEqual(fs.readFileSync(target),bytes,`immutable source audit: ${name}`);
 }
 console.log(JSON.stringify({status:'P008_SOURCE_STRUCTURAL_AUDIT_VERIFIED_NOT_REGISTERED',
  outputs:[...outputs].map(([name,bytes])=>pin(name,bytes))}));
}
