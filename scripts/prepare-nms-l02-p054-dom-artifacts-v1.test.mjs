import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

import {buildP054DomArtifactPlan, canonicalSources, checkP054DomArtifacts,
  prepareP054DomArtifacts, sourceEvidence}
  from './prepare-nms-l02-p054-dom-artifacts-v1.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');
const withSource=fn=>{
  const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
  try{process.env.HELP_MATH_G678_SOURCE_ROOT=sourceRoot;return fn();}
  finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
    else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
};

test('P054 reads the actual SWF/XML, 24 reveals, two feedback streams and source risks',()=>{
  withSource(()=>{
    const evidence=sourceEvidence(root);
    assert.deepEqual(evidence.source,{
      path:`${sourceRoot}/G6-G8-shared/NMS002/L2/GS/L2GS03.swf`,
      bytes:2077270,sha256:'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8',
    });
    assert.deepEqual(evidence.xml,{
      path:`${sourceRoot}/G6-G8-shared/NMS002/L2/index.xml`,
      bytes:12845,sha256:'550aee4286e8a701caf3dc58360f709a606561db8b766057ac36720833d7ff61',
    });
    assert.equal(evidence.audits.interaction.gameSpriteId,731);
    assert.deepEqual(evidence.audits.interaction.levelInitialization.map(row=>row.sourceFrame),[2,4]);
    assert.equal(evidence.audits.interaction.cards.length,24);
    assert.equal(evidence.audits.gameDisplay.controllerFrameCount,5);
    assert.equal(evidence.audits.art.export.items.length,536);
    assert.equal(evidence.revealPins.length,24);
    assert.equal(new Set(evidence.revealPins.map(pin=>pin.path)).size,24);
    assert.deepEqual(evidence.audioPins.map(pin=>pin.sha256),[
      'd34cad2db2f6a6be02a1efffd46ffc169a1b65730cf6f503cbae28fa7aab9fc4',
      '2f88e5ee5c496df615af35c8a53582961becbb4978948a48662cfb4a56485e77',
    ]);
    assert.equal(evidence.disposition.behavior.terminalPhase,'terminal-unresolved');
    assert.equal(evidence.disposition.behavior.hostCompletion,false);
    assert(Object.values(evidence.disposition.acceptanceEffects).every(value=>value===false));
  });
});

test('P054 generated module and timeline are byte-deterministic and never claim generic completion',()=>{
  const first=canonicalSources(),second=canonicalSources();
  assert(first.module.equals(second.module));
  assert(first.timeline.equals(second.timeline));
  assert.equal(first.module.length,272);
  assert.match(first.module.toString(),/nmsL02P054ProductModuleV1/);
  assert.match(first.module.toString(),/maturity: "private-current-js"/);
  const timeline=first.timeline.toString();
  const body=timeline.split('Object.freeze(')[1]?.split(' as const);')[0];
  assert(body,'generated source metadata body');
  const metadata=JSON.parse(body);
  assert.deepEqual({id:metadata.animationId,sprite:metadata.frameDomain,
    rootFrames:metadata.rootFrames,rootPlacementFrame:metadata.rootPlacementFrame,
    spriteFrames:metadata.sourceFrameCount,levelFrames:metadata.levelFrames},
  {id:'shared-nms002-l02-p054',sprite:'sprite-731',rootFrames:10,
    rootPlacementFrame:6,spriteFrames:5,levelFrames:[2,4]});
  assert.equal(metadata.genericFrameCompletionAvailable,false);
  assert.equal(metadata.sourceTimelineSeekAvailable,false);
  assert.equal(metadata.terminalOutcome,'terminal-unresolved');
  assert.equal(metadata.audioAccepted,false);
});

test('P054 producer rejects a compatibility or unconfigured source root',()=>{
  const previous=process.env.HELP_MATH_G678_SOURCE_ROOT;
  try{
    delete process.env.HELP_MATH_G678_SOURCE_ROOT;
    assert.throws(()=>sourceEvidence(root),/exact real source root/u);
    process.env.HELP_MATH_G678_SOURCE_ROOT='/tmp/not-the-canonical-source';
    assert.throws(()=>sourceEvidence(root),/exact real source root/u);
  }finally{if(previous===undefined)delete process.env.HELP_MATH_G678_SOURCE_ROOT;
    else process.env.HELP_MATH_G678_SOURCE_ROOT=previous;}
});

test('P054 prepare preflights all paths before writing and refuses an existing artifact',()=>{
  const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'p054-dom-overwrite-'));
  try{
    fs.mkdirSync(path.join(temporary,'nested'));
    fs.writeFileSync(path.join(temporary,'nested/module.tsx'),'preserved', {flag:'wx'});
    const plan={root:temporary,outputs:[
      {path:'nested/module.tsx',bytes:Buffer.from('new module')},
      {path:'nested/timeline.ts',bytes:Buffer.from('new timeline')},
    ]};
    assert.throws(()=>prepareP054DomArtifacts(plan),/immutable DOM artifacts already exist/u);
    assert.equal(fs.readFileSync(path.join(temporary,'nested/module.tsx'),'utf8'),'preserved');
    assert.equal(fs.existsSync(path.join(temporary,'nested/timeline.ts')),false);
  }finally{fs.rmSync(temporary,{recursive:true,force:true});}
});

test('P054 real DOM plan closes exact inputs and emits deterministic unregistered artifacts',()=>{
  withSource(()=>{
    const registryPath=path.join(root,'packages/demos/private-current-js-registry.json');
    const before=sha256(fs.readFileSync(registryPath));
    const first=buildP054DomArtifactPlan({root});
    const second=buildP054DomArtifactPlan({root});
    assert.equal(sha256(fs.readFileSync(registryPath)),before,'planning cannot mutate registry');
    assert.equal(first.registryShapeAccepted,true);
    const {runManifest:run,memberManifest:member,artifacts}=first;
    assert.equal(run.animationId,'shared-nms002-l02-p054');
    assert.equal(run.source.sha256,'06bde171fe294f555f983c15b50afbb53344851cdc2f76e31e5eb5a4719cabb8');
    assert.equal(run.sourceStructure.frameDomain,'sprite-731');
    assert.equal(run.sourceStructure.sourceFrameCount,5);
    assert.deepEqual(run.sourceStructure.levelFrames,[2,4]);
    assert.equal(run.sourceStructure.genericFrameCompletionAvailable,false);
    assert.equal(run.sourceMatching.levelCount,2);
    assert.equal(run.sourceMatching.cardsPerLevel,12);
    assert.equal(run.sourceMatching.sourceActionScripts.length,110);
    assert.equal(new Set(run.sourceMatching.sourceActionScripts.map(row=>row.exportPath)).size,110);
    assert.equal(run.behavior.terminalOutcome,'terminal-unresolved');
    assert.equal(run.behavior.hostPlaybackCompletion,false);
    assert.equal(run.audio.acceptedCueCount,0);
    assert.equal(run.audio.localeAutoPlayback,false);
    assert.equal(run.reveal.length,24);
    assert.equal(run.externalEvidence.length,30);
    assert.equal(run.generatorChecks.length,4);
    assert(run.generatorChecks.every(row=>row.mode==='--check'&&row.exitCode===0));
    assert.equal(run.validationChecks[0].tests.length,9);
    assert.equal(run.validationChecks[0].exitCode,0);
    assert.deepEqual(run.glossary,[]);
    assert(Object.values(run.acceptanceEffects).every(value=>value===false));
    assert.equal(run.productCalibrationPassed,false);
    assert.equal(run.scaleOutAuthorized,false);
    assert.equal(run.sharedDependencies.length,7);
    assert(run.sharedDependencies.every(pin=>!run.inputs.some(item=>item.path===pin.path)));
    assert.equal(new Set(run.inputs.map(pin=>pin.path)).size,run.inputs.length);
    assert.deepEqual(run.inputs.map(pin=>pin.path),
      [...run.inputs.map(pin=>pin.path)].sort((a,b)=>a.localeCompare(b)));
    assert.equal(artifacts.kind,'maintained-dom-module-v1');
    assert.equal(artifacts.module.path,'packages/demos/src/modules/shared-nms002-l02-p054.tsx');
    assert.equal(artifacts.timeline.path,'packages/demos/src/timelines/shared-nms002-l02-p054.ts');
    assert.deepEqual(member.sourceRun,artifacts.sourceRun);
    assert.deepEqual(member.module,artifacts.module);
    assert.deepEqual(member.timeline,artifacts.timeline);
    assert.deepEqual(member.sharedDependencies,run.sharedDependencies);
    assert.equal(first.outputs.length,4);
    assert.deepEqual(first.outputs.map(item=>({path:item.path,sha256:sha256(item.bytes)})),
      second.outputs.map(item=>({path:item.path,sha256:sha256(item.bytes)})));
    for(const item of first.outputs){
      const pin=[artifacts.module,artifacts.timeline,artifacts.sourceRun,
        artifacts.memberManifest].find(row=>row.path===item.path);
      assert(pin);assert.equal(pin.bytes,item.bytes.length);
      assert.equal(pin.sha256,sha256(item.bytes));
    }
    if(first.outputs.every(item=>!fs.existsSync(path.join(root,item.path))))
      assert.throws(()=>checkP054DomArtifacts(first),'no immutable DOM outputs yet');
    else{
      assert.equal(checkP054DomArtifacts(first).registrationEffect,'none');
      assert.throws(()=>prepareP054DomArtifacts(first),/immutable DOM artifacts already exist/u);
    }
  });
});
