import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';
import {buildP052AudioWindows} from './lib/nms-l02-p052-audio-windows-v1.mjs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),dir=path.join(root,'migrations/shared-nms002-l02-p052/audit');
const sha=b=>createHash('sha256').update(b).digest('hex'),read=n=>JSON.parse(fs.readFileSync(path.join(dir,n)));
const source=read('source-identity-v1.json'),exported=read('ffdec-export-v1.json'),catalog=read('source-text-catalog-v1.json');
assert.equal(source.source.sha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
assert.equal(sha(fs.readFileSync(source.source.path)),source.source.sha256);
const bindings=[];
function script(name,pattern){const f=path.join(exported.output,'as/scripts',name),p=exported.files.find(p=>p.path===f);assert.ok(p);const b=fs.readFileSync(f);assert.equal(sha(b),p.sha256);assert.equal(b.length,p.bytes);assert.match(b.toString(),pattern);bindings.push(p);}
script('DefineSprite_350/frame_115/DoAction.as',/stop\(\);/);
script('DefineButton2_328/BUTTONCONDACTION on(release).as',/_parent\.play\(\)/);
script('DefineSprite_347/frame_20/DoAction.as',/gotoAndStop\(1\)/);
for(const f of [16,27,36,54])script(`DefineSprite_349/frame_${f}/DoAction.as`,/gotoAndStop\(1\)/);
script('DefineSprite_349/frame_2/DoAction.as',/random\(_global\.rndAudio\.length\)/);
const labels=catalog.timelines.find(t=>t.timelineId==='sprite-349').events.filter(e=>e.kind==='frame-label').map(e=>[e.label.text,e.frame]);
assert.deepEqual(labels,[['S1',3],['S2',18],['S3',31],['S4',40]]);
const file=path.join(dir,'native-audio-plan-v1.json'),bytes=fs.readFileSync(file),plan=JSON.parse(bytes);
assert.equal(plan.sourceSha256,source.source.sha256);
assert.equal(plan.implementationInputSha256,sha(fs.readFileSync(path.join(root,'scripts/lib/nms-l02-p052-audio-plan-v1.mjs'))));
const windows=buildP052AudioWindows(plan.plans);
const obj={schemaVersion:1,sourceSha256:source.source.sha256,plan:{path:path.relative(root,file),bytes:bytes.length,sha256:sha(bytes)},bindings,labels,windows,
 modernAdaptations:{main:'Pause PCM at the start of source stop115; keep its unplayed suffix for outro starting at visual116. This avoids discarding one source-frame interval; original Flash block-stop timing remains unverified.',
  feedback:'Visual return/callback is not permission to discard queued source PCM. Each wrong branch retains the interval until the next source label, or full stream end forS4. Explicit user close, replay or navigation cancels the active cue; cancellation is not natural completion.',
  random:'Seeded selection replaces random(4) only for reproducibility; it does not claim to replay an observed original random sequence.',
  clicks:'Pointer, keyboard and touch activation should emit one corresponding source click, never pointer-down plus click duplicates. Integration remains pending.'},
 qualification:'Executable source-bound engineering cue contract only; browser audio/session integration and original-runtime listening are pending.',audioAccepted:false,registered:false,
 implementationSha256:sha(fs.readFileSync(path.join(root,'scripts/lib/nms-l02-p052-audio-windows-v1.mjs')))};
const out=path.join(dir,'native-audio-windows-v1.json'),data=JSON.stringify(obj,null,2)+'\n';
if(fs.existsSync(out))assert.equal(fs.readFileSync(out,'utf8'),data);else if(process.argv.includes('--check'))throw Error(`Missing ${out}`);else fs.writeFileSync(out,data,{flag:'wx'});
console.log(JSON.stringify({status:'ENGINEERING_CUE_CONTRACT_PASS',windows:windows.length,sourceScriptBindings:bindings.length,mainSeam:windows.find(w=>w.id==='intro').endSample,audioAccepted:false}));
