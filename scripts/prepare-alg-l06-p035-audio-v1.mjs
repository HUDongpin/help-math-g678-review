#!/usr/bin/env node
/** Promote P035's source-verified audio closure and measured browser bindings.
 * The browser readback establishes decoder identity, not listening acceptance. */
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
assert.equal(process.cwd(),root);
const mode=process.argv[2];
assert(['--write','--check'].includes(mode));
const stagePlanPath='output/alg-l06-p035-audio-owner-preparation-v1/source-audio-plan-v1.json';
const stageBindingPath='output/alg-l06-p035-measured-audio-integration-v1/p035-measured-bindings-v1.ts';
const readbackPath='output/g678-p034-continuous-successor-20261001-v1/root-p035-browser-decode-readback-v1.json';
const destination='migrations/shared-alg001-l06-p035/audio-source-v1';
const planPath=`${destination}/source-audio-plan-v1.json`;
const runtimePath=`${destination}/source-audio-runtime-v1.json`;
const bindingPath='packages/demos/src/alg-l06-p035-measured-bindings-v1.ts';
const receiptPath=`${destination}/generation-receipt-v1.json`;
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const read=relative=>fs.readFileSync(path.join(root,relative));
const pin=relative=>({path:relative,bytes:read(relative).length,sha256:sha(read(relative))});
const expect=(relative,expected)=>assert.equal(sha(read(relative)),expected,relative);
const writeOrCheck=(relative,bytes)=>{
 const target=path.join(root,relative);
 if(mode==='--write'){
  fs.mkdirSync(path.dirname(target),{recursive:true});
  if(fs.existsSync(target))assert.deepEqual(fs.readFileSync(target),bytes,
   `refusing to overwrite divergent ${relative}`);
  else fs.writeFileSync(target,bytes,{flag:'wx'});
 }else assert.deepEqual(fs.readFileSync(target),bytes,relative);
};
expect(stagePlanPath,'ef34a8e296abafdb99e3b613da42efc06c199545b1d7a9fbbaa9688267b42a68');
expect(stageBindingPath,'42531b50a201266138af080df43d2e749dc3c3c31504f45d927dd6f6c66403a7');
expect(readbackPath,'23daff0c08ed1541b8e51885982fb57df411dc549487143faf57388f88bf538b');
const stage=JSON.parse(read(stagePlanPath));
const readback=JSON.parse(read(readbackPath));
assert.equal(stage.kind,'alg-l06-p035-source-audio-owner-plan-v1');
assert.equal(stage.animationId,'shared-alg001-l06-p035');
assert.equal(stage.sourceSwf.sha256,'9aaf16b58c32b00b056c7c5040b38f9d1391486bb025b71c95fa0326bbae33b3');
assert.equal(stage.unresolvedFeedback179.enabled,false);
assert.equal(readback.kind,'p035-root-browser-native-decode-readback-v1');
assert.equal(readback.rootReviewed,true);
assert.equal(readback.browserResult.results.length,8);
assert.equal(readback.sourcePlanSha256,'ab5085f73ff4884fdc688817c91d6fc51a15d2073bd8df12e6bedb7f8a3f3cf1');
for(const item of stage.inputPins){
 const actual=pin(item.path);assert.deepEqual(actual,item);
}
for(const source of [stage.sourceSwf,stage.separateSupplemental]){
 const before=fs.lstatSync(source.path,{bigint:true});
 assert(before.isFile()&&!before.isSymbolicLink()&&before.nlink===1n);
 const bytes=fs.readFileSync(source.path),after=fs.lstatSync(source.path,{bigint:true});
 for(const field of ['dev','ino','size','mtimeNs','ctimeNs','nlink'])
  assert.equal(before[field],after[field]);
 assert.equal(bytes.length,source.bytes);assert.equal(sha(bytes),source.sha256);
}
const stageBindings=read(stageBindingPath).toString('utf8');
assert.match(stageBindings,/P035_BROWSER_READBACK_SHA256='23daff0c/);
assert.match(stageBindings,/source179Enabled:false,playbackAccepted:false,listeningAccepted:false/);
const promotedState=pin('packages/demos/src/alg-l06-p035-state-v1.ts');
const stagedState=pin('output/alg-l06-p035-state-controller-preparation-v1/alg-l06-p035-state-v1.ts');
assert.equal(promotedState.sha256,stagedState.sha256);

const plan=structuredClone(stage);
plan.inputPins=[...stage.inputPins,pin(stagePlanPath),promotedState];
const assets=[];
for(const item of plan.domains){
 const source=item.transportAsset;
 const bytes=read(source.path);
 assert.equal(bytes.length,source.bytes);assert.equal(sha(bytes),source.sha256);
 if(!item.eligible){assert.equal(item.characterId,179);continue;}
 const target=`${destination}/streams/${path.basename(source.path)}`;
 writeOrCheck(target,bytes);
 item.transportAsset={...source,path:target};
 assets.push(pin(target));
}
assert.deepEqual(assets.map(x=>path.basename(x.path)),[
 'sprite-80-wrong-1.mp3','sprite-95-wrong-3.mp3','sprite-126-wrong-2.mp3',
 'sprite-154-right-4.mp3','sprite-195-right-2.mp3',
 'sprite-207-right-3-ffmpeg-pcm16.wav','sprite-227-main.mp3']);
const saSource=stage.separateSupplemental;
const saTarget=`${destination}/streams/L6IN07-separate-SA.mp3`;
writeOrCheck(saTarget,fs.readFileSync(saSource.path));
plan.separateSupplemental={...saSource,path:saTarget,
 sourcePath:saSource.path};
assets.push(pin(saTarget));
const planBytes=Buffer.from(JSON.stringify(plan,null,2)+'\n');
writeOrCheck(planPath,planBytes);
// This compact runtime projection deliberately excludes physical source paths,
// local evidence paths, and extracted-source metadata from the web bundle.
const runtime={sourcePlanSha256:sha(planBytes),
 sourceSwf:{sha256:plan.sourceSwf.sha256},
 mainClock:plan.mainClock,browserDecodeMeasured:false,
 separateSupplemental:{bytes:plan.separateSupplemental.bytes,
  sha256:plan.separateSupplemental.sha256},
 domains:plan.domains.map(item=>({characterId:item.characterId,
  eligible:item.eligible,codec:item.codec,
  sourceBlockFrames:item.sourceBlockFrames,
  authoredTerminalFrame:item.authoredTerminalFrame,
  technicalDecode:{samples:item.technicalDecode.samples},
  transportAsset:{bytes:item.transportAsset.bytes,
   sha256:item.transportAsset.sha256}}))};
writeOrCheck(runtimePath,Buffer.from(JSON.stringify(runtime,null,2)+'\n'));
let binding=stageBindings.replace(
 "../../packages/demos/src/decoded-source-stream-transport",
 './decoded-source-stream-transport').replace(
 `P035_SOURCE_PLAN_SHA256='${sha(read(stagePlanPath))}'`,
 `P035_SOURCE_PLAN_SHA256='${sha(planBytes)}'`);
assert.notEqual(binding,stageBindings);
assert.match(binding,new RegExp(`P035_SOURCE_PLAN_SHA256='${sha(planBytes)}'`));
binding=binding.replace('Exact P035 HeadlessChrome 154 browser PCM, root-readback-bound.',
 'Exact P035 HeadlessChrome 154 browser PCM, root-readback-bound; product asset hashes unchanged.');
writeOrCheck(bindingPath,Buffer.from(binding));
const receipt={kind:'alg-l06-p035-maintained-audio-promotion-v1',
 sourcePlan:pin(stagePlanPath),stageBindings:pin(stageBindingPath),
 browserReadback:pin(readbackPath),productPlan:pin(planPath),
 productRuntimePlan:pin(runtimePath),productBindings:pin(bindingPath),assets,
 source179Enabled:false,browserDecodeIdentity:true,
 playbackAccepted:false,listeningAccepted:false,originalRuntimeAccepted:false,
 currentJsRegistered:false};
writeOrCheck(receiptPath,Buffer.from(JSON.stringify(receipt,null,2)+'\n'));
console.log(JSON.stringify({mode,productPlanSha256:sha(planBytes),
 productBindingsSha256:pin(bindingPath).sha256,assets:assets.length,
 source179Enabled:false,playbackAccepted:false}));
