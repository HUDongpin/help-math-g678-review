#!/usr/bin/env node
/** Freeze the exact P023 source/product candidate after all inputs stabilize. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {pinFile,uniquePins} from '../lib/g678-admission-proof.mjs';

const mode=process.argv[2];
assert(process.argv.length===3&&['--write','--check'].includes(mode),'--write|--check');
const root=fs.realpathSync('.');
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
assert.equal(process.env.HELP_MATH_G678_SOURCE_ROOT,sourceRoot,'physical AWS source root');
assert.equal(fs.realpathSync(sourceRoot),sourceRoot);
const here='output/alg-l06-p023-host-prep-v1';
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const paths={
 intake:'output/alg-l06-p023-intake-recon-v1/intake-recon-v1.json',
 audit:'output/alg-l06-p023-source-audit-v1/time-resolved-audit-v1.json',
 text:'output/alg-l06-p023-native-text-v1/text-state-source-v1.json',
 canvas:'output/alg-l06-p023-canvas-v1/canvas-manifest.json',
 audio:'output/alg-l06-p023-audio-v1/audio-source-audit-v1.json',
 audioPlan:'output/alg-l06-p023-audio-v1/audio-domain-plan-v2.json',
 crosswalk:'output/alg-l06-p023-glossary-audit-v1/four-term-crosswalk-v1.json',
};
const intake=read(paths.intake),audit=read(paths.audit),text=read(paths.text),
 canvas=read(paths.canvas),audio=read(paths.audio),plan=read(paths.audioPlan),cross=read(paths.crosswalk);
const id='shared-alg001-l06-p023',sha='40388017c66f714bdbda480558669aee11a0d3426ed55c74f0976eb2ca85097a';
assert.equal(intake.animationId,id);assert.equal(intake.source.swf.sha256,sha);
assert.equal(audit.identity.animationId,id);assert.equal(audit.source.sha256,sha);
assert.equal(text.animationId,id);assert.equal(text.sourceSwfSha256,sha);
assert.equal(canvas.animationId,id);assert.equal(canvas.source.sha256,sha);
assert.equal(audio.source.swf.sha256,sha);
assert.equal(cross.identity.animationId,id);assert.equal(cross.inputs.swf.sha256,sha);
assert.deepEqual([intake.identity.globalOrdinal,intake.identity.sectionPageOrdinal,
  audit.identity.mainFrameCount,text.frameCount,canvas.mainFrameCount,
  audio.main.blockCount,plan.main.sourceBlocks.count,cross.active.registeredLessonPages],
 [23,13,410,410,410,400,400,33]);
assert.deepEqual(cross.missingModernKeys,['Domain']);
assert.deepEqual(audio.main.negativeSeekBlocks,[]);
assert.equal(plan.optionalSpanishAudio?.localeAutoplay,false);
assert.equal(plan.optionalSpanishAudio?.joinedWithMain,false);
assert(Object.values(canvas.acceptanceEffects).every(value=>value===false));

const other=[
 'output/alg-l06-p023-source-audit-v1/frame-states-v1.json',
 'output/alg-l06-p023-canvas-v1/source.xml',
 'output/alg-l06-p023-canvas-v1/source-export-receipt.json',
 'output/alg-l06-p023-canvas-v1/canvas-metadata-v1.json',
 'output/alg-l06-p023-audio-v1/browser-decode-v1/decode-receipt.json',
 'scripts/prepare-alg-l06-p023-canvas-v1.mjs',
 'scripts/extract-alg-l06-p023-audio-v1.mjs',
 'scripts/prepare-alg-l06-p023-native-text-v1.mjs',
 'output/alg-l06-p023-canvas-v1/build.mjs',
 'output/alg-l06-p023-source-audit-v1/audit-time-resolved-v1.mjs',
 'output/alg-l06-p023-audio-v1/build-browser-plan-v2.mjs',
 'packages/demos/src/modules/shared-alg001-l06-p023.tsx',
 'packages/demos/src/timelines/shared-alg001-l06-p023.ts',
 'packages/demos/src/generated/alg-l06-p023-text-state-v1.ts',
 ...['audio-schedule','clock','audio-owner','optional-spanish-audio','timeline']
  .map(name=>`packages/demos/src/alg-l06-p023-${name}-v1.ts`),
 ...['native-text','player'].map(name=>`packages/demos/src/alg-l06-p023-${name}-v1.tsx`),
 audio.main.extractedMp3.path,audio.separateSa.copy.path,
 'work/g678-shared-page-factory/alg-l06-p023-20260930-v1/members/shared-alg001-l06-p023/canvas-renderer.js',
 ...canvas.inputs.map(item=>item.path),...canvas.outputs.map(item=>item.path),
];
const files=uniquePins([...Object.values(paths),...other].map(p=>pinFile(root,p)));
const external=[...['swf','lessonXml','separateSa'].map(key=>({root:sourceRoot,
 pin:intake.source[key]})),
 ...['en','es'].map(key=>({root:'/Volumes/WestWorld/HELP MATH Related Files',
  pin:{...cross.inputs[key],path:cross.inputs[key].path.split('/HELP MATH Related Files/')[1]}}))];
for(const item of external){
 assert(!path.isAbsolute(item.pin.path)&&item.pin.path&&item.pin.sha256,
  'external source relative path and SHA');
 const actual=pinFile(item.root,item.pin.path);
 assert.equal(actual.bytes,item.pin.bytes,'external source bytes');
 assert.equal(actual.sha256,item.pin.sha256,'external source SHA');
}
const packet={schemaVersion:1,kind:'alg-l06-p023-candidate-source-binding-v1',
 animationId:id,source:intake.source.swf,
 ...Object.fromEntries(Object.entries(paths).map(([key,p])=>[key,pinFile(root,p)])),
 files,external,
 historicalCrosswalkIndex:{...cross.active.index,
  role:'dated glossary crosswalk input; not the current candidate host activation'},
 acceptanceEffects:{originalRuntime:false,fidelity:false,listening:false,human:false,
  owner:false,strictComplete:false,published:false}};
const packetPath=`${here}/candidate-source-binding-v1.json`;
const packetBytes=`${JSON.stringify(packet,null,2)}\n`;
const bindingPath='apps/web/lib/alg-l06-p023-candidate-binding-v1.ts';
if(mode==='--write')fs.mkdirSync(path.join(root,here),{recursive:true});
function freeze(target,value,provisional){
 if(mode==='--check'){
  assert.equal(fs.readFileSync(target,'utf8'),value,`${target} drift`);return;
 }
 if(!fs.existsSync(target)){fs.writeFileSync(target,value,{flag:'wx'});return;}
 const existing=fs.readFileSync(target,'utf8');
 if(existing===value)return;
 assert.equal(existing,fs.readFileSync(provisional,'utf8'),
  `${target} differs from the preserved provisional byte sequence`);
 fs.writeFileSync(target,value);
}
freeze(packetPath,packetBytes,`${here}/provisional-v1/candidate-source-binding-v1.json`);
const binding={registrySha256:pinFile(root,'packages/demos/private-current-js-registry.json').sha256,
 sourceSha256:sha,packet:pinFile(root,packetPath)};
const ts='// Generated source packet binding; reproducible with scripts/prepare-alg-l06-p023-candidate-v1.mjs.\n'
 +'export const P023_CANDIDATE_BINDING = '+JSON.stringify(binding,null,2)+' as const;\n';
freeze(bindingPath,ts,`${here}/provisional-v1/alg-l06-p023-candidate-binding-v1.ts`);
console.log(JSON.stringify({status:mode==='--check'?'verified':'frozen',binding,
 files:files.length,external:external.length}));
