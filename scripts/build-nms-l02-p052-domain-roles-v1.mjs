import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {collectSwfTextSourceCatalog} from './lib/swf-text-source-catalog.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const audit=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex');
const source=fs.readFileSync(path.join(audit,'preserved-source-v1.swf'));
assert.equal(sha(source),'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const manifest=JSON.parse(fs.readFileSync(path.join(audit,'../migration.json')));
assert.equal(sha(fs.readFileSync(manifest.source.swf)),sha(source));
const catalog=collectSwfTextSourceCatalog(source),byId=new Map(catalog.timelines.map(t=>[t.timelineId,t]));
const receipt=JSON.parse(fs.readFileSync(path.join(audit,'ffdec-export-v1.json'))),scriptPins=[];
function script(relative){
 const file=path.join(receipt.output,'as/scripts',relative),pin=receipt.files.find(p=>p.path===file);
 assert.ok(pin,relative);const bytes=fs.readFileSync(file);assert.equal(sha(bytes),pin.sha256);
 scriptPins.push({relative,sha256:pin.sha256});return bytes.toString().replace(/\r/g,'').trim();
}
assert.equal(script('frame_1/DoAction.as'),'_level0.InternalPreloader.gotoAndPlay("jump_check");\nstop();');
for(const [id,frames] of [[322,[1,15]],[331,[1]]])for(const frame of frames)
 assert.equal(script(`DefineSprite_${id}/frame_${frame}/DoAction.as`),'stop();');
assert.equal(script('DefineSprite_331/frame_35/DoAction.as'),'stop();\ngotoAndStop(1);');
const done=script('DefineButton2_310/BUTTONCONDACTION on(release).as');
for(const token of ['Mc_Right_Feed.gotoAndPlay(2);','Mc_Wrong_Feed.gotoAndPlay(2);','Coach_audio_2.gotoAndPlay(2);','Coach_audio_1.gotoAndPlay(2);'])assert.ok(done.includes(token));

const roles={root:['legacy-host-entry',10],
 'sprite-8':['button-down-audio',5],'sprite-165':['static-track',1],
 'sprite-297':['static-thumb',1],'sprite-298':['dynamic-grid-template',1],'sprite-300':['dynamic-grid-container',1],
 'sprite-318':['wrong-close-audio',5],'sprite-322':['wrong-feedback',15],
 'sprite-327':['right-close-audio',5],'sprite-331':['right-feedback',35],
 'sprite-345':['static-help-content',1],'sprite-347':['correct-coach-audio',20],
 'sprite-349':['random-wrong-coach-audio',55],'sprite-350':['main-teaching-timeline',156]};
const buttons=new Map(catalog.buttonDefinitions.map(b=>[b.characterId,b]));
const reachable=new Set(),seenButtons=new Set();
function visitCharacter(id){if(byId.has(`sprite-${id}`))visit(`sprite-${id}`);
 if(buttons.has(id)&&!seenButtons.has(id)){seenButtons.add(id);for(const p of buttons.get(id).statePlacements)visitCharacter(p.characterId);}}
function visit(id){if(reachable.has(id))return;reachable.add(id);for(const e of byId.get(id).events)if(e.kind==='place'&&e.characterId!==undefined)visitCharacter(e.characterId);}
visit('root');assert.deepEqual([...reachable].sort(),Object.keys(roles).sort());
const domains=Object.entries(roles).map(([id,[role,frameCount]])=>{
 const t=byId.get(id);assert.equal(t.declaredFrameCount,frameCount);assert.equal(t.observedFrameCount,frameCount);
 const displayEvents=t.events.filter(e=>e.kind==='place'||e.kind==='remove');
 const audioBearing=role.includes('audio');
 if(['sprite-8','sprite-318','sprite-327'].includes(id)){
  assert.equal(displayEvents.length,1);assert.equal(displayEvents[0].characterId,7);assert.equal(displayEvents[0].frame,1);
 }
 if(id==='sprite-347'||id==='sprite-349'){
  assert.deepEqual(displayEvents.map(e=>[e.frame,e.kind,e.characterId??null]),
   id==='sprite-347'?[[1,'place',346],[2,'remove',null]]:[[1,'place',348],[3,'remove',null]]);
 }
 if(id==='sprite-322'||id==='sprite-331'){
  assert.equal(displayEvents.length,3);assert.ok(displayEvents.every(e=>e.kind==='place'&&e.frame===1));
  assert.deepEqual(displayEvents.map(e=>e.characterId),id==='sprite-322'?[319,320,321]:[328,329,330]);
 }
 return {id,role,frameCount,sourceVisualEventCount:displayEvents.length,
  staticDisplayList:displayEvents.every(e=>e.kind==='place'&&e.frame===1),
  sourceVisualEvents:displayEvents.map(e=>({frame:e.frame,kind:e.kind,characterId:e.characterId,depth:e.depth,sourceTagSha256:e.sourceTagSha256})),
  actionTags:t.events.filter(e=>e.kind==='action-bytes').map(e=>({frame:e.frame,sourceTagSha256:e.sourceTagSha256})),
  strictDisposition:'unresolved',
  qualification:audioBearing?'Audio-bearing is not nonvisual: click children retain shape7; coach children have label text before removal. Runtime visibility and placement must be resolved.':
   'Static tag facts do not resolve script visibility, generated cells, instance timing or source runtime acceptance.'};
});
const data={sourceSha256:sha(source),fps:12,wrong:{domain:'sprite-322',frameCount:15,startFrame:2,stopFrame:15},
 right:{domain:'sprite-331',frameCount:35,startFrame:2,returnFrame:35,returnTarget:1},
 displayListChangesAfterFrame1:false,automaticClose:false};
const report={schemaVersion:1,sourceSha256:sha(source),animationId:manifest.id,
 claim:'Engineering source-role evidence, not conventional final frame-domain disposition or natural runtime execution.',
 totalSourceDomains:catalog.timelines.length,rootReachableDomains:domains,scriptPins,
 unplacedLibraryCount:catalog.timelines.length-domains.length,
 unplacedQualification:'No root structural edge; not a proof of runtime unreachability or an exclusion approval.',feedback:data};
for(const [relative,value] of [
 ['packages/demos/src/generated/nms-l02-p052-feedback-domains-v1.ts',
  '// Generated by scripts/build-nms-l02-p052-domain-roles-v1.mjs; do not edit.\nexport const P052_FEEDBACK_DOMAINS='+JSON.stringify(data)+' as const;\n'],
 ['migrations/shared-nms002-l02-p052/audit/source-domain-roles-v1.json',JSON.stringify(report,null,2)+'\n']]){
 const file=path.join(root,relative);if(fs.existsSync(file))assert.equal(fs.readFileSync(file,'utf8'),value);
 else if(process.argv.includes('--check'))throw Error(`Missing ${file}`);else fs.writeFileSync(file,value,{flag:'wx'});
}
console.log(JSON.stringify({status:'PASS',sourceDomains:catalog.timelines.length,reachable:domains.length,audioBearing:domains.filter(d=>d.role.includes('audio')).length,
 feedbackDisplayStable:true,automaticClose:false,strictDisposition:'unresolved'}));
