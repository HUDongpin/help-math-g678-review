// Run with node_modules/.bin/tsx; imports the same pure module the future view will use.
import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';import {createHash} from 'node:crypto';
import {canonicalJson} from './build-course-trace-specs.mjs';
import {P052_CAPTURE_SCENARIOS,p052CaptureState} from '../packages/demos/src/nms-l02-p052-capture-state-v1.ts';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const audit='migrations/shared-nms002-l02-p052/audit';
const hash=b=>createHash('sha256').update(b).digest('hex');
const read=p=>fs.readFileSync(path.resolve(root,p));
assert.ok(process.argv.slice(2).every(arg=>arg==='--check'),'Unknown argument');
const manifest=JSON.parse(read('migrations/shared-nms002-l02-p052/migration.json'));
const sourceSha256='5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638';
assert.equal(hash(read(`${audit}/preserved-source-v1.swf`)),sourceSha256);
assert.equal(hash(read(manifest.source.swf)),sourceSha256);
const seedsByCue=new Map();
for(let seed=0;seed<64;seed++){
 const result=p052CaptureState({scenario:'first-wrong',frame:115,seed,language:'en',frameDomain:'sprite-350'});
 if(!seedsByCue.has(result.state.audioCue))seedsByCue.set(result.state.audioCue,seed);
}
assert.equal(seedsByCue.size,4);
const seeds=[...seedsByCue.values()].sort((a,b)=>a-b),requirements=[];
for(const language of ['en','es'])for(const seed of seeds)for(const [scenario,definition] of Object.entries(P052_CAPTURE_SCENARIOS)){
 const request={language,seed,scenario,frameDomain:'sprite-350',frame:definition.first};
 const start=p052CaptureState(request),end=p052CaptureState({...request,frame:definition.last});
 assert.deepEqual(start.entryState,end.entryState);
 // Execute every planned frame now. This is state coverage, never PNG/capture coverage.
 for(let frame=definition.first;frame<=definition.last;frame++){
  const result=p052CaptureState({...request,frame});assert.equal(result.frame,frame);
  assert.equal(result.frameDomain,'sprite-350');assert.deepEqual(result.entryState,start.entryState);
 }
 requirements.push({id:`candidate-${scenario}-${language}-seed-${seed}`,scenario,language,seed,
  frameDomainId:'sprite-350',rootEntryFrame:6,range:{first:definition.first,last:definition.last},
  entryState:start.entryState,entryStateSha256:hash(canonicalJson(start.entryState)),
  schedule:definition.steps,firstState:start.state,lastState:end.state,
  originalRuntimeAuthority:'unresolved',imageCaptureCount:0});
}
const inputs=['packages/demos/src/nms-l02-p052-capture-state-v1.ts','packages/demos/src/nms-l02-p052-state-v1.ts',
 'packages/demos/src/nms-l02-p052-copy-v1.ts','packages/demos/src/generated/nms-l02-p052-glossary-v1.ts',
 `${audit}/SOURCE_SPEC_V1.md`,`${audit}/SOURCE_SPEC_V2.md`,`${audit}/NATIVE_BEHAVIOR_CONTRACT_V1.md`,
 `${audit}/NATIVE_AUDIO_WINDOWS_V1.md`,'scripts/build-nms-l02-p052-capture-plan-v1.mjs'];
const plan={schemaVersion:1,animationId:manifest.id,sourceSha256,
 claim:'Executable native main-domain state plan only. Not coverage-v2, natural source execution, rendered images or acceptance.',
 rootFrameCount:10,mainFrameCount:156,stage:[800,600],fps:12,
 seedsByFirstWrongCue:Object.fromEntries([...seedsByCue].sort()),
 pending:['Root/preloader and all reachable child-domain dispositions','Natural original-runtime trace schedules and execution',
  'Feedback child playheads and click audio domains','Coverage-v2 reconciliation','Actual view, audio lifecycle, product integration and browser capture'],
 inputs:inputs.map(file=>({file,sha256:hash(read(file))})),requirements};
const output=path.join(root,audit,'native-main-capture-plan-v1.json'),bytes=JSON.stringify(plan,null,2)+'\n';
if(fs.existsSync(output))assert.equal(fs.readFileSync(output,'utf8'),bytes,'Capture plan drift; preserve old evidence, version deliberately');
else if(process.argv.includes('--check'))throw Error('Capture plan missing');
else fs.writeFileSync(output,bytes,{flag:'wx'});
console.log(JSON.stringify({status:'PASS',scenarios:Object.keys(P052_CAPTURE_SCENARIOS).length,requirements:requirements.length,
 queriedFrames:requirements.reduce((n,r)=>n+r.range.last-r.range.first+1,0),seedsByFirstWrongCue:plan.seedsByFirstWrongCue,
 sha256:hash(bytes),imageCaptureCount:0}));
