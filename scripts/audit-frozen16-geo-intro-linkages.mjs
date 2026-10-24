import assert from 'node:assert/strict';import{readFile,readdir,lstat,realpath,mkdir,writeFile}from'node:fs/promises';import{createHash}from'node:crypto';import path from'node:path';import{fileURLToPath}from'node:url';import{parseSwfSourceFacts}from'./build-g4-l3-machine-source-audits.mjs';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),TASK='/Volumes/American Dream/hudongpin/helpmath-execution-20260906-01a0747f',OUT=TASK+'/geo-intro-source-audit-v1',ID='shared-geo001-l01-p001';
const sha=b=>createHash('sha256').update(b).digest('hex'),pins=new Map();
async function bound(p,expected){const file=path.resolve(ROOT,p),before=await lstat(file,{bigint:true});assert(before.isFile()&&!before.isSymbolicLink()&&await realpath(file)===file);const b=await readFile(file),after=await lstat(file,{bigint:true});for(const k of ['dev','ino','size','mtimeNs','mode','nlink'])assert.equal(before[k],after[k]);const pin={path:file,bytes:b.length,sha256:sha(b)};if(expected)assert.deepEqual(pin,expected);pins.set(file,pin);return b;}
const catalog=JSON.parse(await bound('catalog/g678-shared-catalog.v1.json')),page=catalog.lessons.flatMap(l=>l.pages).find(p=>p.animationId===ID);
assert.equal(page.sourceSha256,'3034f4bb5df7a2033a57aacf8de5ba1cbda5add4c2d30a7987bac0769403b226');
const sourceFile=path.join('/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware',page.viewPath),source=await bound(sourceFile);assert.equal(source.length,69749);assert.equal(sha(source),page.sourceSha256);
const member=path.join(ROOT,'work/g678-shared-page-factory/g678-advanced-manual-current-js-3-v1/members',ID);assert((await bound(member+'/compiler-input/source.swf')).equals(source));
const facts=parseSwfSourceFacts(source);assert.equal(facts.structureFingerprintSha256,'99c35553c83c535b54a7e315d535459ebb71f6758e4afb055bef662756ef2aae');assert.equal(facts.header.fps,12);assert.equal(facts.header.rootFrameCount,10);
const reachable=facts.frameDomains.domains.filter(d=>d.staticallyRootReachable);assert.deepEqual(reachable.map(d=>d.domainId),['root','sprite-142']);const [root,main]=reachable;
assert.deepEqual(root.placementEdges.map(e=>[e.childSpriteId,e.firstFrame,e.placementCount]),[[142,6,1]]);assert.equal(main.declaredFrameCount,127);assert.equal(main.scriptTagCount,0);
assert.deepEqual(main.placementEdges.map(e=>[e.characterId,e.characterType,e.firstFrame]),[[140,'DefineText',1],[141,'DefineText',1]]);
const placed=new Set(reachable.flatMap(d=>d.placementEdges.map(e=>e.characterId)));assert(facts.linkageAndImports.exportedAssets.every(e=>!placed.has(e.characterId)));assert.equal(facts.linkageAndImports.importedAssets.length,0);
const progress=facts.frameDomains.domains.find(d=>d.spriteId===11),media=facts.frameDomains.domains.find(d=>d.spriteId===12);assert(!progress.staticallyRootReachable&&!media.staticallyRootReachable);assert.deepEqual(progress.parentDomainIds,['sprite-12']);assert.deepEqual(media.parentDomainIds,[]);
const scriptRoot=member+'/canvas/scripts',scripts=[];
for(const relative of (await readdir(scriptRoot,{recursive:true})).filter(f=>f.endsWith('.as')).sort()){const b=await bound(path.join(scriptRoot,relative));scripts.push({path:relative,bytes:b.length,sha256:sha(b)});}
assert.equal(scripts.length,31);assert.equal(sha(JSON.stringify(scripts)),'2d366db3711f35cca7710a30da68ea5fe1824203e4a0e76be4a42eb1100bdc1d');
assert.equal((await bound(scriptRoot+'/frame_1/DoAction.as')).toString(),'_level0.InternalPreloader.gotoAndPlay("jump_check");\r\nstop();\r\n');assert.equal((await bound(scriptRoot+'/frame_6/DoAction.as')).toString(),'stop();\r\n');
assert.deepEqual(scripts.filter(s=>s.path.startsWith('frame_')).map(s=>s.path),['frame_1/DoAction.as','frame_6/DoAction.as']);assert.equal(root.scriptTagCount,4);
const initialization=[];
for(const name of ['FUIComponentSymbol.as','FScrollBarSymbol.as']){const current=await bound(scriptRoot+'/'+name),referenceFile=ROOT+'/work/g678-shared-page-factory/g678-shared-current-js-calibration-13-v1/members/shared-dat001-l01-p001/canvas/scripts/'+name;assert(current.equals(await bound(referenceFile)));initialization.push({name,sha256:sha(current),matchesPreviouslyAuditedDATIntro:true});}
const timing=JSON.parse(await bound(TASK+'/frozen16-audio-v1/'+ID+'/audio-timing.json'));await bound(timing.xml.path,timing.xml);
const segments=JSON.parse(await bound(TASK+'/frozen16-audio-segments-v1/receipt.json')).records.filter(r=>r.animationId===ID);assert.equal(segments.length,1);const audio=segments[0];assert.equal(audio.domain,'sprite-142');assert.equal(audio.segments.length,1);assert.equal(audio.blocks.length,127);assert.equal(audio.segments[0].firstBlockFrame,1);assert(audio.blocks.every(b=>b.seekSamples>=0));await bound(audio.payload.path,audio.payload);
assert.equal(facts.audio.tagCounts.DefineSound,0);assert.equal(facts.audio.tagCounts.StartSound,0);
const hostRoot=TASK+'/canonical-indexmi-host-audit-v1/scripts/scripts',hostFiles=(await readdir(hostRoot,{recursive:true})).filter(f=>f.endsWith('.as'));let literalReferences=0;
for(const f of hostFiles){const b=await bound(path.join(hostRoot,f));if(/media-controls|progress-bar/.test(b.toString()))literalReferences++;}assert.equal(literalReferences,0);
await bound(member+'/canvas-renderer.js');await bound('scripts/build-g4-l3-machine-source-audits.mjs');await bound(fileURLToPath(import.meta.url));
for(const p of pins.values())await bound(p.path,p);
const receipt={schemaVersion:1,status:'source-page-linkage-audit-passed',animationId:ID,source:pins.get(sourceFile),sourceStructureFingerprintSha256:facts.structureFingerprintSha256,
 reachableDomains:reachable,exportedButNotRootPlaced:facts.linkageAndImports.exportedAssets,progressLibrary:{progressDomain:progress,unplacedParent:media},scripts,scriptSetSha256:sha(JSON.stringify(scripts)),initialization,
 activePageButtons:0,activePageScriptedSprites:0,rootHostCall:'_level0.InternalPreloader.gotoAndPlay("jump_check")',
 initializerDisposition:'Retain class/prototype/style initialization and possible global Selection listener as source evidence. No page display instance or page dynamic attachment is established. Do not execute AVM1 globals in the modern host.',
 hostSearch:{scriptFiles:hostFiles.length,literalProgressReferences:literalReferences,boundary:'Exact canonical indexMI script snapshot only. No claim that arbitrary legacy hosts cannot construct linkage names dynamically.'},
 sourceControlsDecision:'Remove the page-level Source media controls candidate requirement: it came from an unplaced library. Keep modern My Lesson navigation and frame inspection. Preserve all original library bytes and the prior advanced-manual implementation as historical evidence.',
 sourceBehavior:'Root preloader call and stops; script-free 127-frame child containing two text characters and one MP3 stream. No explicit child terminal stop: modern once-clamp is not original-runtime terminal authority.',
 audio:{domain:audio.domain,payload:audio.payload,sampleRate:audio.sampleRate,latencySamples:audio.latencySeek,segments:audio.segments},canvas:pins.get(member+'/canvas-renderer.js'),
 resolvedSourceBlocker:'source-fui-linkage-placement-unproven',proposedLane:'source-locked-text-timeline-with-contiguous-main-audio',
 remaining:['current-product-source-controls-correction','native-audio-integration-and-My-Lesson-validation','original-runtime-terminal-and-audio-alignment','language-listening-visual-human-and-owner-acceptance'],
 inputBindings:[...pins.values()],productCalibrationPassed:false,scaleOutAuthorized:false,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false};
await mkdir(OUT);await writeFile(OUT+'/receipt.json',JSON.stringify(receipt,null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({output:OUT,reachableDomains:reachable.map(d=>d.domainId),scripts:scripts.length,activePageButtons:0,hostLiteralReferences:literalReferences}));
