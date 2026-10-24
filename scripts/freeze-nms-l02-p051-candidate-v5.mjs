import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='shared-nms002-l02-p051',calibrationId='g678-nms-l02-p051-native-fraction-match-current-js-v1';
const oldFile=`catalog/product-bridge-calibrations/${calibrationId}-compile-v4.json`;
const newFile=`catalog/product-bridge-calibrations/${calibrationId}-compile-v5.json`;
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const sha=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
function pin(file){const absolute=path.resolve(root,file),s=fs.lstatSync(absolute);assert.ok(s.isFile()&&s.nlink===1);assert.equal(fs.realpathSync(absolute),absolute);const b=fs.readFileSync(absolute);const t=fs.lstatSync(absolute);assert.equal(s.mtimeMs,t.mtimeMs);assert.equal(s.ino,t.ino);assert.equal(s.size,b.length);return {path:absolute.startsWith(root+path.sep)?path.relative(root,absolute):absolute,bytes:b.length,sha256:sha(b)};}
const read=file=>JSON.parse(fs.readFileSync(path.resolve(root,file),'utf8'));
function put(file,value){const target=path.resolve(root,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return pin(target);}
if(process.argv.includes('--check')){const packet=read(newFile);for(const p of [...packet.inputs,...packet.outputs])assert.deepEqual(pin(p.path),p);console.log(JSON.stringify({status:'PASS',freeze:pin(newFile),bindings:packet.inputs.length+packet.outputs.length}));process.exit(0);}
assert.equal(pin(oldFile).sha256,'95755390a72e7dd40b45101f0f37e8b3bbe07c591c3340ed4cb72dcda7a80917');
assert.ok(!fs.existsSync(path.resolve(root,newFile)));
const old=read(oldFile),changed='apps/web/components/nms-l02-p051-host-typography-v1.css';
for(const p of [...old.inputs,...old.outputs])if(p.path!==changed)assert.deepEqual(pin(p.path),p);
assert.equal(pin(evidence+'/p051-host-typography-before-v5.css.txt').sha256,old.outputs.find(p=>p.path===changed).sha256);
const runDir=fs.mkdtempSync(path.join(evidence,'p051-freeze-v5-'));
const results=[];
for(const file of ['scripts/check-nms-l02-p051-audio-normalization-v2.ts','scripts/check-nms-l02-p051-audio-access-v1.ts','scripts/check-nms-l02-p051-source-bytes-v1.ts','scripts/check-nms-l02-p051-audio-loader-v1.ts']){
 const run=spawnSync(path.join(root,'node_modules/.bin/tsx'),[file],{cwd:root,encoding:'utf8',timeout:120000});
 const log=path.join(runDir,path.basename(file)+'.log');fs.writeFileSync(log,(run.stdout??'')+(run.stderr??''),{flag:'wx'});
 results.push({script:pin(file),log:pin(log),exitCode:run.status});assert.equal(run.status,0,log);
}
const resultsPin=put(path.join(runDir,'checks.json'),{checkedAt:new Date().toISOString(),results});
const artifacts=old.entry.artifacts;
const outputs=old.outputs.filter(p=>![artifacts.memberManifest.path,artifacts.sourceRun.path].includes(p.path)).map(p=>pin(p.path));
const inputs=[...old.inputs,pin(oldFile),pin(fileURLToPath(import.meta.url)),pin('scripts/check-nms-l02-p051-audio-normalization-v2.ts'),resultsPin,...results.map(r=>r.log)];
const sourceSpec=put(path.join(runDir,'source-spec.json'),{schemaVersion:1,animationId:id,source:old.source,sourceXml:old.sourceXml,predecessor:pin(oldFile),change:'Use P051 teaching-container width and enlarged rem units to reflow tablet sidebar layouts',inputs,outputs,registered:false,scaleOutAuthorized:false});
const runRoot=`work/g678-shared-page-factory/${calibrationId}-compile-v5`;
const sourceRun=put(runRoot+'/run-manifest.json',{schemaVersion:1,source:old.source,sourceSpec,inputs,outputs,scaleOutAuthorized:false});
const memberManifest=put(runRoot+`/members/${id}/member-manifest.json`,{schemaVersion:1,animationId:id,source:old.source,sourceSpec,sourceRun,inputs,outputs,strictComplete:false,published:false});
const binding={...artifacts,sourceRun,memberManifest};
const entry={...old.entry,artifacts:binding};
const packet={...old,sourceSpec,entry,inputs:[...inputs,sourceSpec],outputs:[...outputs,sourceRun,memberManifest],selectedPages:old.selectedPages.map(p=>({...p,runtime:{...p.runtime,rendererBinding:binding}}))};
for(const p of [...packet.inputs,...packet.outputs])assert.deepEqual(pin(p.path),p);
const freeze=put(newFile,packet);
const gate=path.join(root,'apps/web/lib/g678-nms-l02-p051-freeze-v1.ts');
put(path.join(runDir,'gate-recovery.json'),{pin:pin(gate),content:fs.readFileSync(gate,'utf8')});
fs.writeFileSync(gate,'// Generated exact local candidate pin; independent acceptance remains pending.\nconst pin=Object.freeze('+JSON.stringify(freeze,null,2)+');\nexport function readP051FreezePin(){return pin;}\n');
const fragment=put('catalog/product-bridge-calibrations/g678-nms-l02-p051-prepared-registration-v5.json',{calibrationId,deploymentScope:'local-only',freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]});
console.log(JSON.stringify({status:'PASS-successor',freeze,fragment,runDir,admitted:false}));
