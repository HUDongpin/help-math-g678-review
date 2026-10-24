#!/usr/bin/env node
/** Reproducible public-tool structural audit of the preserved P010 SWF. */
import assert from 'node:assert/strict';
import {execFileSync,spawnSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {gzipSync} from 'node:zlib';
import {parseSwfSourceFacts} from './build-g4-l3-machine-source-audits.mjs';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
import {extractTerminalStream} from './prepare-g678-terminal-source-v1.mjs';

const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const ID='shared-alg001-l06-p010';
const SOURCE_ROOT='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const SOURCE_PATH='G6-G8-shared/ALG001/L6/RW/L6RW09.swf';
const SOURCE_SHA='96552f567037f39868d01b1ba77311858caf2efcdb141ef64ed0878a6c48ce14';
const SA_PATH='G6-G8-shared/ALG001/L6/SA/L6RW09.mp3';
const SA_SHA='903c1bd16cebf9f1ceda0d9b8a47905cae20f380bb857fa33fc855a6db350275';
const XML_PATH='G6-G8-shared/ALG001/L6/index.xml';
const XML_SHA='9f3753a17e5e271d7bc63a1bdf8cd5237f19770bae3f5c7364cabcb62c84ce2c';
const HOST_DIR='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222/nms-l01-p009-host-source-v1';
const HOST_SHA='275499325edb24daed95952b207d2dd4ed83056ebac54cd0bc911673058086c9';
const WORKSPACE=path.join(ROOT,'migrations',ID);
const AUDIT=path.join(WORKSPACE,'audit','source-v1');
const SHA=bytes=>createHash('sha256').update(bytes).digest('hex');
const JSON_BYTES=value=>Buffer.from(JSON.stringify(value,null,2)+'\n');
const PIN=(name,bytes)=>({path:name,bytes:bytes.length,sha256:SHA(bytes)});
const sourceAbsolute=path.join(SOURCE_ROOT,SOURCE_PATH);

function sourceFile(relative,expectedBytes,expectedSha){
 const absolute=path.join(SOURCE_ROOT,relative);
 assert.equal(fs.realpathSync(absolute),absolute,'physical source path');
 const before=fs.lstatSync(absolute,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&(before.mode&0o222n)===0n,'frozen ordinary source');
 const bytes=fs.readFileSync(absolute),after=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mode','mtimeNs','nlink'])assert.equal(before[key],after[key]);
 assert.equal(bytes.length,expectedBytes);assert.equal(SHA(bytes),expectedSha);
 return bytes;
}
function pinnedOrdinary(file,expectedBytes,expectedSha){
 assert.equal(fs.realpathSync(file),file,'physical ordinary evidence path');
 const before=fs.lstatSync(file,{bigint:true});assert(before.isFile()&&!before.isSymbolicLink());
 const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs','nlink'])assert.equal(before[key],after[key]);
 assert.equal(bytes.length,expectedBytes);assert.equal(SHA(bytes),expectedSha);return bytes;
}

function publicTools(){
 const scratch='/Volumes/American Dream/hudongpin';
 assert.equal(fs.realpathSync(scratch),scratch,'physical scratch volume');
 const directory=fs.mkdtempSync(path.join(scratch,'p010-source-audit-'));
 try{
  const xmlFile=path.join(directory,'movie.xml'),scriptsDir=path.join(directory,'scripts');
  execFileSync('swfmill',['-n','swf2xml',sourceAbsolute,xmlFile],{maxBuffer:1024*1024});
  execFileSync('ffdec',['-onerror','abort','-export','script',scriptsDir,sourceAbsolute],{maxBuffer:1024*1024});
  const xml=fs.readFileSync(xmlFile);
  for(const [id,frames] of [[52,303],[55,1]])
   assert(xml.includes(Buffer.from(`<DefineSprite objectID="${id}" frames="${frames}">`)));
  const scripts={};
  function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en'))){
   const file=path.join(dir,entry.name);
   assert(!entry.isSymbolicLink(),'no FFDec export symlinks');
   if(entry.isDirectory())visit(file);
   else {assert(entry.isFile());scripts[path.relative(scriptsDir,file).split(path.sep).join('/')]=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n').trim();}
  }}visit(scriptsDir);
  assert.deepEqual(scripts,{
   'scripts/DefineButton2_51/BUTTONCONDACTION on(release).as':
    'on(release){\n   _global.KeyAttribute = "Function";\n   _root.DoHyperLinks();\n   _root.animation_mc.animation.stop();\n}',
   'scripts/frame_1/DoAction.as':'_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();',
   'scripts/frame_6/DoAction.as':'stop();',
  });
  const swfmillVersion=spawnSync('swfmill',['--version'],{encoding:'utf8'});
  assert.equal(swfmillVersion.status,0);
  return {xmlGzip:gzipSync(xml,{level:9}),scripts,
   versions:{swfmill:(swfmillVersion.stdout+swfmillVersion.stderr).trim(),
    ffdec:execFileSync('ffdec',['-help'],{encoding:'utf8',maxBuffer:1024*1024}).split('\n')[0].trim()}};
 }finally{fs.rmSync(directory,{recursive:true,force:true});}
}

function csv(rows){return rows.map(row=>row.map(value=>'"'+String(value??'').replaceAll('"','""')+'"').join(',')).join('\n')+'\n';}
function range(a,b){return Array.from({length:b-a+1},(_,i)=>a+i);}
function requirement(domain,count,language){
 const entryState=domain==='root'?{kind:'initial-load',language}:
  {kind:'root-begin',rootFrame:6,domainFrame:1,language};
 return {requirementId:`req-default-${domain}-${language}`,scenario:'default',frameDomainId:domain,
  traceId:`default-${domain}-${language}`,language,seed:'0',requiredRange:{firstFrame:1,lastFrame:count},
  entryState,entryStateSha256:SHA(Buffer.from(JSON.stringify(entryState))),
  baselineAuthorityRequirement:'original-runtime-frame-accurate',baselineAuthority:'unresolved',
  status:'pending',capturedFrameCount:0,missingFrames:range(1,count),
  baselineCaptureManifest:'',baselineCaptureManifestSha256:'',captureManifest:'',
  captureManifestSha256:'',metricsFile:'',metricsSha256:''};
}

export function auditP010(){
 assert.equal(fs.realpathSync(SOURCE_ROOT),SOURCE_ROOT);
 const swf=sourceFile(SOURCE_PATH,114334,SOURCE_SHA),sa=sourceFile(SA_PATH,301056,SA_SHA);
 const lessonXml=sourceFile(XML_PATH,13926,XML_SHA);
 assert(lessonXml.includes(Buffer.from('<Page Title="Page 9" RandomAudio="" BGText="">RW/L6RW09.swf</Page>')));
 assert(lessonXml.includes(Buffer.from('<Section SName="RW" SNumber="2"')));
 const hostSwf=pinnedOrdinary(path.join(HOST_DIR,'source.swf'),689006,HOST_SHA);
 const hostFunctionsPath=path.join(HOST_DIR,'scripts/scripts/frame_35/DoAction.as');
 const hostObserverPath=path.join(HOST_DIR,
  'scripts/scripts/frame_50/PlaceObject2_743_130/CLIPACTIONRECORD onClipEvent(enterFrame).as');
 const hostFunctions=pinnedOrdinary(hostFunctionsPath,104008,
  '380cd6581859d0ba9814833f1102b08282198713cf30b5230ce2da76c3e27a74').toString('utf8');
 const hostObserver=pinnedOrdinary(hostObserverPath,61,
  '0f74c16ab4c673bd21f5d82f4c7bd77f2c003198d8870bda7764b3cd7699c035').toString('utf8');
 assert(hostFunctions.includes('function doCheckPrevAndNext()'));
 assert(hostFunctions.includes('if(_root.animation_mc.animation._currentframe > 1 && _root.animation_mc.animation._currentframe >= _root.animation_mc.animation._totalframes)'));
 assert(hostFunctions.includes('_root.animation_mc.animation.stop();'));
 assert(hostFunctions.includes('if(_global.playSwfFileName.indexOf("FQ02") == -1 && _global.playSwfFileName.indexOf("FQ03") == -1)'));
 assert(hostObserver.includes('_root.doCheckPrevAndNext();'));
 const catalogBytes=fs.readFileSync(path.join(ROOT,'catalog/g678-shared-catalog.v1.json'));
 const matches=JSON.parse(catalogBytes).lessons.flatMap(lesson=>lesson.pages.map(page=>({lesson,page})))
  .filter(({page})=>page.animationId===ID);
 assert.equal(matches.length,1);const {lesson,page}=matches[0];
 assert.equal(page.globalOrdinal,10);assert.equal(page.sectionCode,'RW');
 assert.equal(page.sectionPageOrdinal,9);assert.equal(page.viewPath,SOURCE_PATH);
 assert.equal(page.sourceSha256,SOURCE_SHA);assert.equal(page.authoringEvidence,'swf-only');
 assert.equal(page.audioCueCandidates.length,1);assert.equal(page.audioCueCandidates[0].viewPath,SA_PATH);
 assert.equal(page.audioCueCandidates[0].sha256,SA_SHA);
 const facts=parseSwfSourceFacts(swf),text=collectSwfTextSourceCatalog(swf),stream=extractTerminalStream(swf,'sprite-52');
 assert.equal(facts.header.signature,'CWS');assert.equal(facts.header.version,6);
 assert.equal(facts.header.fps,12);assert.equal(facts.header.rootFrameCount,10);
 assert.deepEqual(facts.header.stage,{xMinTwips:0,xMaxTwips:16000,yMinTwips:0,yMaxTwips:12000,width:800,height:600});
 assert.deepEqual(facts.frameDomains.domains.map(d=>[d.domainId,d.declaredFrameCount,d.observedShowFrameCount]),
  [['root',10,10],['sprite-52',303,303],['sprite-55',1,1]]);
 assert.equal(facts.actionScript.version,'AS1/2');
 assert.equal(text.summary.textDefinitions,42);assert.equal(text.summary.decodedRuns,44);
 assert.equal(text.summary.unresolvedRuns,0);assert.equal(text.summary.shapeDefinitions,8);
 assert.equal(text.summary.bitmapDefinitions,0);assert.equal(text.summary.buttonDefinitions,1);
 assert.equal(text.summary.unparsedTags,0);
 const root=text.timelines.find(t=>t.timelineId==='root');
 const main=text.timelines.find(t=>t.timelineId==='sprite-52');
 const title=text.timelines.find(t=>t.timelineId==='sprite-55');
 assert.deepEqual(root.events.filter(e=>e.kind==='place').map(e=>[e.frame,e.depth,e.characterId,e.matrix]),[
  [6,1,52,[1,0,0,1,7390,5060]],[6,51,53,[1,0,0,1,2867,-3700]],
  [6,52,55,[1,0,0,1,8000,879]],[6,54,56,[1,0,0,1,0,0]]]);
 assert.deepEqual(main.events.filter(e=>e.kind==='action-bytes'),[],'no main DoAction/terminal stop');
 assert.deepEqual(root.events.filter(e=>e.kind==='action-bytes').map(e=>e.frame),[1,6]);
 const button=text.buttonDefinitions[0],buttonInstance=main.instances.find(i=>i.characterId===51);
 assert.equal(button.characterId,51);assert.equal(button.actions.sha256,
  '549555e0e21a60e887e614e7ff3b03592d8a7f577c5ec25e6601f039050f49c8');
 assert.deepEqual([buttonInstance.firstFrame,buttonInstance.lastFrameExclusive,buttonInstance.depth],[268,304,49]);
 const maskEvent=main.events.find(e=>e.kind==='place'&&e.characterId===47);
 assert.deepEqual([maskEvent.frame,maskEvent.depth,maskEvent.clipDepth],[268,30,33]);
 const question=main.instances.find(i=>i.characterId===49);
 assert.deepEqual([question.firstFrame,question.lastFrameExclusive,question.depth],[268,304,32]);
 assert.equal(stream.blocks.length,300);assert.equal(stream.blocks[0].frame,4);
 assert.equal(stream.blocks.at(-1).frame,303);assert.equal(stream.mp3.length,124280);
 assert.equal(SHA(stream.mp3),'f5c71e9d066a0d2ce37be7afd20c3d1f8182b5c2c7b6a06a38c131074093fa89');
 assert.deepEqual(stream.actions.map(a=>[a.domain,a.frame]),[['root',1],['root',6]]);
 const extracted=publicTools();
 const toolsVersion={swfmill:'swfmill 0.3.6',ffdec:'JPEXS Free Flash Decompiler v.26.2.1'};
  // swfmill emits its version on stderr. The exact installed versions are asserted below.
  assert.equal(extracted.versions.swfmill,toolsVersion.swfmill);
  assert.equal(extracted.versions.ffdec,toolsVersion.ffdec);
 const positions=[
  [2,24,29,'Functions title'],[4,144,148,'equation'],[14,163,167,'table'],
  [33,194,198,'graph axes']];
 const fades=positions.map(([id,first,full,role])=>{
  const instance=main.instances.find(i=>i.characterId===id);
  const events=main.events.filter(e=>e.instanceId===instance.instanceId);
  assert.equal(instance.firstFrame,first);assert.equal(events[0].colorTransform.multiply[3],0);
  assert.equal(events.at(-1).frame,full);assert.equal(events.at(-1).colorTransform.multiply[3],256);
  return {role,characterId:id,firstPlacedFrame:first,firstFullAlphaFrame:full,
   alphaDivisor:256,alphaEvents:events.map(e=>({frame:e.frame,alpha:e.colorTransform.multiply[3]}))};
 });
 const composition={schemaVersion:1,kind:'alg-l06-p010-source-composition-v1',coordinateUnit:'twips',pixelDivisor:20,
  root:{declaredFrames:10,events:root.events,instances:root.instances},
  main:{domainId:'sprite-52',declaredFrames:303,rootEntryFrame:6,
   rootPlacement:root.events.find(e=>e.kind==='place'&&e.characterId===52),
   eventCount:main.events.length,instanceCount:main.instances.length,
   mask:{placement:maskEvent,instance:main.instances.find(i=>i.instanceId===maskEvent.instanceId),
    clippedQuestionInstance:question},button:{definition:button,instance:buttonInstance},fades},
  title:{domainId:'sprite-55',declaredFrames:1,events:title.events,instances:title.instances}};
 const sourceStream={schemaVersion:1,kind:'alg-l06-p010-source-stream-structure-v1',domain:'sprite-52',
  heads:stream.heads,blocks:stream.blocks,actions:stream.actions,
  concatenatedMp3:{bytes:stream.mp3.length,sha256:SHA(stream.mp3),persistedByThisAudit:false},
  firstBlockFrame:4,lastBlockFrame:303,
  gapFrames:range(4,303).filter(frame=>!stream.blocks.some(block=>block.frame===frame)),
  listeningAccepted:false};
 const scripts={schemaVersion:1,kind:'alg-l06-p010-public-tool-scripts-v1',
  sourceSwfSha256:SOURCE_SHA,toolVersions:toolsVersion,files:extracted.scripts,
  sourceButtonAction:{characterId:51,actionSha256:button.actions.sha256,
   hostAPI:'DoHyperLinks',sourceKey:'Function',sourceStopTarget:'_root.animation_mc.animation',
   event:'release',runtimeEffectEstablished:false}};
 const hostTerminal={schemaVersion:1,kind:'alg-l06-p010-conditional-host-terminal-rule-v1',
  status:'verified-static-old-host-algorithm-and-page-eligibility; actual-launch-unobserved',
  hostSource:PIN(path.join(HOST_DIR,'source.swf'),hostSwf),
  hostFunctionScript:PIN(hostFunctionsPath,Buffer.from(hostFunctions)),
  hostFrameObserver:PIN(hostObserverPath,Buffer.from(hostObserver)),
  lessonXml:PIN(path.join(SOURCE_ROOT,XML_PATH),lessonXml),
  sourcePage:PIN(sourceAbsolute,swf),
  pageBinding:{xmlSection:'RW',xmlSectionNumber:2,xmlPageTitle:'Page 9',
   xmlPageReference:'RW/L6RW09.swf',rootFrame:6,mainInstanceName:'animation',mainDomain:'sprite-52',
   declaredMainFrameCount:303,nonFq:true},
  algorithm:{caller:'onClipEvent(enterFrame) -> _root.doCheckPrevAndNext()',
   branch:'playSwfFileName excludes FQ02 and FQ03',
   condition:'animation currentFrame > 1 and currentFrame >= totalFrames',
   effect:'animation.stop()',
   sourcePageOwnStop:false},
  limits:['Static host/page association does not prove that the original host actually launched this page.',
   'Conditional host stop at 303 is source-supported; standalone SWF end behavior is not established.',
   'No original-runtime timing or terminal capture is established.']};
 const outputs=new Map([
  ['source-facts-v1.json',JSON_BYTES(facts)],['source-text-v1.json',JSON_BYTES(text)],
  ['source-composition-v1.json',JSON_BYTES(composition)],
  ['source-stream-structure-v1.json',JSON_BYTES(sourceStream)],
  ['public-tool-scripts-v1.json',JSON_BYTES(scripts)],
  ['conditional-host-terminal-v1.json',JSON_BYTES(hostTerminal)],
  ['swfmill-v1.xml.gz',extracted.xmlGzip],
 ]);
 const report={schemaVersion:1,kind:'alg-l06-p010-source-audit-v1',animationId:ID,
  source:{path:SOURCE_PATH,bytes:swf.length,sha256:SOURCE_SHA,authoring:'swf-only'},
  catalog:{path:'catalog/g678-shared-catalog.v1.json',bytes:catalogBytes.length,
   sha256:SHA(catalogBytes),lessonKey:lesson.stableLessonKey,globalOrdinal:10,sectionCode:'RW',sectionPageOrdinal:9},
  tools:toolsVersion,header:facts.header,tagCounts:facts.tagCounts,
  frameDomains:facts.frameDomains.domains.map(d=>({domainId:d.domainId,declaredFrames:d.declaredFrameCount,
   observedFrames:d.observedShowFrameCount,rootReachableByStaticPlacements:d.staticallyRootReachable,
   parentDomainIds:d.parentDomainIds,fingerprintSha256:d.domainFingerprintSha256})),
  rootMain:{entryFrame:6,mainDomain:'sprite-52',rootFrame1:'preloader call and stop',
  rootFrame6:'begin label, main placement and root stop',
   mainDeclaredEndFrame:303,mainTerminalStopDeclared:false,
   oldHostConditionalTerminalStop:'indexMI doCheckPrevAndNext stops main at totalFrames when active non-FQ page',
   originalRuntimeExecution:'unobserved'},
  sourceText:{definitionCount:42,decodedRuns:44,unresolvedRuns:0,fadeBoundaries:fades,
   closingQuestion:{characterId:49,firstPlacedFrame:268,maskCharacterId:47,maskDepth:30,clipDepth:33}},
  button:{characterId:51,firstFrame:268,lastFrame:303,actionSha256:button.actions.sha256,
   sourceKey:'Function',hostAPI:'DoHyperLinks',sourceStopTarget:'_root.animation_mc.animation',
   actualHostEffect:'unresolved'},
  audio:{embedded:{blockCount:300,firstFrame:4,lastFrame:303,mp3Bytes:stream.mp3.length,
   concatenatedSha256:SHA(stream.mp3)},separateSaCandidate:{path:SA_PATH,bytes:sa.length,sha256:SA_SHA,
   relationship:'catalog-candidate-only; no locale autoplay or splice authority'}},
  outputPins:[...outputs].map(([name,bytes])=>PIN(`migrations/${ID}/audit/source-v1/${name}`,bytes)),
  gates:{sourceStructure:'verified',oldHostTerminalAlgorithm:'verified-static-conditional',
   naturalHostTerminal:'unobserved',glossaryRuntime:'unresolved',
   authoredVisualVisibility:'unresolved',originalRuntime:false,audioListening:false,
   humanVisualReview:false,ownerReview:false,strictComplete:false,published:false},
  claimBoundary:'Public-tool source structure only; no original-runtime behavior, audio listening, fidelity, human/Owner acceptance or registration.'};
 outputs.set('source-audit-v1.json',JSON_BYTES(report));
 const disposition={schemaVersion:1,animationId:ID,status:'source-structural-disposition-only',
  sourceSwfSha256:SOURCE_SHA,
  evidence:Object.fromEntries(['source-facts-v1.json','source-text-v1.json','source-composition-v1.json']
   .map(name=>[name.replace('-v1.json',''),PIN(`migrations/${ID}/audit/source-v1/${name}`,outputs.get(name))])),
  domains:facts.frameDomains.domains.map(domain=>{
   const timeline=text.timelines.find(t=>t.timelineId===domain.domainId);
   return {frameDomainId:domain.domainId,sourceFrameCount:domain.declaredFrameCount,
    observedShowFrameCount:domain.observedShowFrameCount,
    rootReachableByStaticPlacements:domain.staticallyRootReachable,
    parentFrameDomainIds:domain.parentDomainIds,
    sourcePlacements:text.timelines.flatMap(parent=>parent.instances.filter(i=>
     domain.spriteId!==null&&i.characterId===domain.spriteId).map(i=>({parentTimelineId:parent.timelineId,
      sourceInstanceId:i.instanceId,firstFrame:i.firstFrame,lastFrameExclusive:i.lastFrameExclusive,depth:i.depth}))),
    sourceEventCount:timeline.events.length,disposition:'separate-declared-source-frame-domain',
    originalRuntimeEstablished:false};
  }),
  rootMainRelation:{rootEntryFrame:6,mainDomainId:'sprite-52',
   sourceTransformTwips:[1,0,0,1,7390,5060],rootStopsAtFrame:6,
   mainSourceStopFrame:null,mainDeclaredEndFrame:303,
   endBehavior:'conditional indexMI host stop at 303 source-supported; standalone end and actual old-host execution unobserved',
   hostEvidence:PIN(`migrations/${ID}/audit/source-v1/conditional-host-terminal-v1.json`,
    outputs.get('conditional-host-terminal-v1.json'))},
  limits:['Static root reachability does not prove natural playback.',
   'The button source calls the historical DoHyperLinks host; actual dialog and pause/return need product checks.',
   'Question is placed under a moving mask; placement alone does not prove visibility.',
   'Original runtime, listening, human review and acceptance are separate.']};
 const meta=new Map([['audit/frame-domain-disposition.json',JSON_BYTES(disposition)]]);
 const migration=JSON.parse(fs.readFileSync(path.join(WORKSPACE,'migration.json')));
 migration.confidence='partial';migration.classification={collection:'G6-G8-shared',grade:'middle/shared',
  lesson:6,section:'RW',page:9,domain:'algebra',knowledgePoint:{en:'',es:''},titleRaw:'Page 9',
  titleDisplay:'Understanding Functions: Real World Activity',status:'resolved',
  evidence:['catalog/g678-shared-catalog.v1.json','migrations/shared-alg001-l06-p010/audit/source-v1/source-audit-v1.json']};
 migration.runtime={...migration.runtime,actionScriptVersion:'AS1/AS2',complexity:'interactive-understood',
  fonts:text.fonts.filter(f=>f.name?.text).map(f=>f.name.text),
  scripts:['root:1 preloader gotoAndPlay(jump_check), stop','root:6 stop',
   'indexMI host conditional doCheckPrevAndNext stops main at declared last frame',
   'button51 on(release): KeyAttribute Function; DoHyperLinks; animation stop'],
  externalDependencies:['historical InternalPreloader host adapter','historical DoHyperLinks glossary adapter',
   'separate optional SA/L6RW09.mp3','indexMI conditional terminal host rule']};
 migration.audit={...migration.audit,assetsRequired:true,assetsNotRequiredReason:'',
  masks:[{domainId:'sprite-52',characterId:47,depth:30,clipDepth:33,firstFrame:268,lastFrame:303}],
  morphs:[],filters:[],networkCalls:[]};
 migration.scenarios=[{id:'default',kind:'linear-with-glossary',
  description:'Source main timeline, 268 Function button; source end/loop semantics unresolved.',reachable:true}];
 migration.audio={...migration.audio,required:true,reasonNotRequired:'',languages:[],cues:[]};
 migration.toolVersions={...migration.toolVersions,ffdec:'26.2.1',swfmill:'0.3.6'};
 migration.implementation={...migration.implementation,
  rendering:'compiler-assisted-maintained-Canvas-with-native-accessible-text-advanced-manual-candidate',
  defaultFrameDomainId:'sprite-52',frameDomains:facts.frameDomains.domains.map(d=>({
   id:d.domainId,kind:d.kind,sourceTimelineId:d.domainId,parentFrameDomainId:d.parentDomainIds[0]??null,
   frameCount:d.declaredFrameCount,scenarioIds:['default']}))};
 meta.set('migration.json',JSON_BYTES(migration));
 const coverage={schemaVersion:2,animationId:ID,requirements:facts.frameDomains.domains.flatMap(d=>
  ['en','es'].map(language=>requirement(d.domainId,d.declaredFrameCount,language)))};
 meta.set('evidence/full-frame-coverage.json',JSON_BYTES(coverage));
 const typeRows=[...text.fonts.filter(d=>d.tagName==='DefineFont2').map(d=>({...d,type:'font'})),
  ...text.shapeDefinitions.map(d=>({...d,type:'shape'})),
  ...text.textDefinitions.map(d=>({...d,type:'text'})),
  ...text.buttonDefinitions.map(d=>({...d,type:'button'})),
  ...[52,55].map(id=>({characterId:id,type:'sprite',
   domainFingerprintSha256:facts.frameDomains.domains.find(d=>d.domainId===`sprite-${id}`).domainFingerprintSha256}))];
 const inventory=[['asset_id','swf_character_id','library_symbol','type','source_file','source_frame',
  'exported_file','sha256','format','dimensions_or_bounds','font_glyphs','transformation','confidence','license_or_provenance','notes']];
 for(const item of typeRows.sort((a,b)=>a.characterId-b.characterId)){
  const placements=text.timelines.flatMap(t=>t.instances.filter(i=>i.characterId===item.characterId)
   .map(i=>`${t.timelineId}:${i.firstFrame}..${i.lastFrameExclusive-1}@${i.depth}`));
  const sourceHash=item.sourceTagSha256??item.domainFingerprintSha256;
  inventory.push([`swf-tag-${item.characterId}`,item.characterId,'',item.type,sourceAbsolute,
   placements.join('; '),'',sourceHash,item.sourceTagSha256?'canonical-swf-tag-code-and-payload':'source-domain-fingerprint',
   item.boundsTwips?JSON.stringify(item.boundsTwips):'',item.type==='font'?item.glyphCount:'','',
   item.sourceTagSha256?'verified-structural':'derived-domain',
   'owner-provided SWF',`Source placements: ${placements.join('; ')||'none'}; no rendered visibility or fidelity claim`]);
 }
 meta.set('asset-inventory.csv',Buffer.from(csv(inventory)));
 const keyRows=[['frame','requirement_id','frame_domain_id','trace_id','entry_state_sha256','time_ms',
  'scenario','language','kind','expected_state','trigger','baseline_file','baseline_sha256',
  'implementation_file','implementation_sha256','diff_file','diff_sha256','normalized_rmse',
  'timing_result','visual_result','evidence_source','reviewer','notes']];
 const beats={root:[[1,'root preloader action and stop'],[6,'begin label; main52/title55/text53/border56 placed; root stop'],
  [10,'declared root bound; natural reachability unresolved']],
  'sprite-52':[[1,'main declared entry; stream head'],[4,'first embedded MP3 block'],
   [24,'Functions title placed alpha 0'],[29,'Functions title full alpha'],
   [144,'equation tokens placed alpha 0'],[148,'equation tokens full alpha'],
   [163,'table placed alpha 0'],[167,'table full alpha'],
   [194,'graph labels placed alpha 0'],[198,'graph labels full alpha'],
   [268,'masked closing question and Function button placed'],
   [303,'last declared frame and audio block; no declared main stop']],
  'sprite-55':[[1,'one-frame root title sprite']]};
 for(const [domain,entries] of Object.entries(beats))for(const [frame,description] of entries)
  keyRows.push([frame,'',domain,'','',((frame-1)*1000/12).toFixed(6),'source','undetermined',
   'source-structural-beat',description,'source timeline','','','','','','','','pending','pending',
   `migrations/${ID}/audit/source-v1/source-audit-v1.json`,'',
   'No original-runtime trace or rendered visibility claim']);
 meta.set('keyframes.csv',Buffer.from(csv(keyRows)));
 meta.set('MIGRATION_BRIEF.md',Buffer.from(`# ALG001 L6 P010 source audit and implementation brief\n\n`+
  `Canonical placement: ${ID}, global page 10 / RW page 9. The preserved SWF is ${SOURCE_PATH}, `+
  `${swf.length} bytes, SHA-256 ${SOURCE_SHA}; no paired FLA is bound. The catalog page title is “Page 9”; `+
  `source text character 53 says “Understanding Functions: Real World Activity”. This is a source-only audit, not registration.\n\n`+
  `The CWS v6 stage is 800×600 at 12 fps. Root has 10 declared frames, stops at frame 1 after calling the historical `+
  `preloader, then stops at frame 6 after placing main sprite 52, root text 53, one-frame title sprite 55, and shape 56. `+
  `Main sprite 52 has 303 declared frames. It has no DoAction stop at its last frame. The byte-pinned historical `+
  `indexMI host runs doCheckPrevAndNext from an enter-frame caller and conditionally stops a non-FQ main animation once `+
  `currentFrame reaches totalFrames. The same lesson XML includes this Page 9 SWF, and its root names the main instance animation. `+
  `Thus host-driven hold at frame 303 is source-supported if this host loaded P010; the actual launch and standalone end behavior `+
  `remain unobserved. Source placement is not playback proof. Each root, main and title domain is separately recorded in `+
  `audit/frame-domain-disposition.json and pending evidence/full-frame-coverage.json requirements.\n\n`+
  `The source contains 42 static text definitions with 44 decoded runs and no unresolved runs. Title, equation, table and graph `+
  `labels enter at zero alpha and reach full alpha at main frames 29, 148, 167 and 198 respectively. The concluding question `+
  `is placed at frame 268 under moving shape-47 clip mask (depth 30 through 33). All visibility and semantic reading-order `+
  `decisions require source geometry and product review; text definitions alone do not authorize early native reveal. `+
  `Eight shapes remain subject to outline/role review, and no bitmap definitions occur.\n\n`+
  `Button character 51 appears at main frame 268. FFDec 26.2.1 decompiles its release handler as setting `+
  `KeyAttribute to “Function”, calling _root.DoHyperLinks(), and stopping _root.animation_mc.animation. `+
  `The historical host dialog effect and pause/return behavior still need source-specific integration tests.\n\n`+
  `One embedded MP3 stream head and 300 blocks occupy main frames 4–303. The concatenated source packets are `+
  `${stream.mp3.length} bytes, SHA-256 ${SHA(stream.mp3)}; this audit does not establish audible timing or listening acceptance. `+
  `Separate ${SA_PATH} is ${sa.length} bytes, SHA-256 ${SA_SHA}, currently a catalog candidate. `+
  `It must not be spliced into the source stream or started merely because the UI locale is Spanish. `+
  `The audio agent owns audio-inventory.csv and the detailed audio disposition.\n\n`+
  `Selected engineering lane: a bounded compiler-assisted advanced-manual candidate with maintained Canvas drawing, `+
  `continuous source clock/audio and native accessible text. The source is interactive-understood structurally, while the `+
  `one glossary action, moving question mask and conditional host terminal rule require page-specific behavior. Reuse demonstrated `+
  `P008 contracts only where source semantics match. `+
  `Do not clone P008's 938-frame page-owned terminal stop or no-button assumptions. Test the conditional host terminal rule `+
  `and glossary host outcome `+
  `before selecting the final runtime contract.\n\n`+
  `Remaining gates: source-visible text and outlined-shape role audit, exact audio schedule/SA trigger, maintained renderer and Replay, `+
  `real My Lesson EN/ES responsive/keyboard flows, authoritative original-runtime comparison, audio listening, named human/Owner review, `+
  `strict completion and publication. None is granted by this structural audit.\n`));
 return {auditFiles:outputs,metadataFiles:meta,report};
}

if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 assert(process.argv.length===3&&['--prepare','--check'].includes(process.argv[2]),'Usage: --prepare | --check');
 const {auditFiles,metadataFiles,report}=auditP010();
 if(process.argv[2]==='--prepare')fs.mkdirSync(AUDIT,{recursive:true});
 for(const [name,bytes] of auditFiles){const file=path.join(AUDIT,name);
  if(process.argv[2]==='--prepare')fs.writeFileSync(file,bytes);
  assert.deepEqual(fs.readFileSync(file),bytes,`immutable source audit ${name}`);}
 for(const [name,bytes] of metadataFiles){const file=path.join(WORKSPACE,name);
  if(process.argv[2]==='--prepare')fs.writeFileSync(file,bytes);
  assert.deepEqual(fs.readFileSync(file),bytes,`metadata ${name}`);}
 console.log(JSON.stringify({status:'P010_SOURCE_STRUCTURE_VERIFIED_ONLY',
  domains:report.frameDomains.map(d=>`${d.domainId}:${d.declaredFrames}`),
  auditFiles:[...auditFiles].map(([name,bytes])=>PIN(name,bytes)),
  metadataFiles:[...metadataFiles].map(([name,bytes])=>PIN(name,bytes))}));
}
