import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='shared-nms002-l02-p052',calibrationId='g678-nms-l02-p052-percent-practice-current-js-v1';
const oldFile=`catalog/product-bridge-calibrations/${calibrationId}-compile-v2.json`,newFile=`catalog/product-bridge-calibrations/${calibrationId}-compile-v3.json`;
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const sha=b=>createHash('sha256').update(b).digest('hex'),resolve=p=>path.resolve(root,p);
function pin(p){const f=resolve(p),a=fs.lstatSync(f,{bigint:true});assert.ok(a.isFile()&&a.nlink===1n);assert.equal(fs.realpathSync(f),f);
 const b=fs.readFileSync(f),z=fs.lstatSync(f,{bigint:true});for(const k of ['dev','ino','size','mode','mtimeNs','nlink'])assert.equal(a[k],z[k]);
 return {path:f.startsWith(root+'/')?path.relative(root,f):f,bytes:b.length,sha256:sha(b)};}
const read=p=>JSON.parse(fs.readFileSync(resolve(p),'utf8'));
function verify(p){const actual=pin(p.path);assert.equal(actual.bytes,p.bytes,p.path);assert.equal(actual.sha256,p.sha256,p.path);}
function put(p,v){const f=resolve(p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,JSON.stringify(v,null,2)+'\n',{flag:'wx'});return pin(f);}
if(process.argv.includes('--check')){const p=read(newFile);for(const x of [...p.inputs,...p.outputs])verify(x);console.log(JSON.stringify({status:'PASS',freeze:pin(newFile),bindings:p.inputs.length+p.outputs.length}));process.exit(0);}
assert.equal(pin(oldFile).sha256,'015899658740b2acb4f7a1d5993ba7d4a32715dedd1ba6506d5de9803a0bccba');
assert.ok(!fs.existsSync(resolve(newFile)));
const old=read(oldFile),changed=['apps/web/lib/nms-l02-p052-preview-access.ts',
 'packages/demos/tests/nms-l02-p052-preview-access-v1.test.ts','packages/demos/tests/nms-l02-p052-audio-access-v1.test.ts'];
for(const p of [...old.inputs,...old.outputs])if(!changed.includes(p.path))verify(p);
for(const file of changed)assert.ok([...old.inputs,...old.outputs].some(p=>p.path===file),'changed file must be in predecessor closure');
const run=fs.mkdtempSync(path.join(evidence,'p052-freeze-v3-'));
const tests=fs.readdirSync(resolve('packages/demos/tests')).filter(n=>/^nms-l02-p052-.*\.test\.tsx?$/.test(n)).map(n=>'packages/demos/tests/'+n);
const scriptTests=fs.readdirSync(resolve('scripts/lib')).filter(n=>/^nms-l02-p052-.*\.test\.mjs$/.test(n)).map(n=>'scripts/lib/'+n);
const result=spawnSync(resolve('node_modules/.bin/tsx'),['--test',...tests,...scriptTests],{cwd:root,encoding:'utf8',timeout:120000});
const log=path.join(run,'tests.log');fs.writeFileSync(log,(result.stdout??'')+(result.stderr??''),{flag:'wx'});assert.equal(result.status,0,log);
const check=put(path.join(run,'checks.json'),{createdAt:new Date().toISOString(),exitCode:result.status,log:pin(log),tests:[...tests,...scriptTests]});
const artifacts=old.entry.artifacts;
const inputs=[...old.inputs.filter(p=>p.path!==old.sourceSpec.path).map(p=>changed.includes(p.path)?pin(p.path):p),pin(oldFile),pin(fileURLToPath(import.meta.url)),check,pin(log)];
const outputs=old.outputs.filter(p=>![artifacts.memberManifest.path,artifacts.sourceRun.path].includes(p.path)).map(p=>changed.includes(p.path)?pin(p.path):p);
const sourceSpec=put(path.join(run,'source-spec.json'),{schemaVersion:1,animationId:id,source:old.source,sourceXml:old.sourceXml,predecessor:pin(oldFile),
 change:'Admit only the observed localhost to 127.0.0.1 same-port default-locale rewrite; verify prefixless English source-audio referer',inputs,outputs,scaleOutAuthorized:false});
const runRoot=`work/g678-shared-page-factory/${calibrationId}-compile-v3`;
const sourceRun=put(runRoot+'/run-manifest.json',{schemaVersion:1,source:old.source,sourceSpec,inputs,outputs,scaleOutAuthorized:false});
const memberManifest=put(runRoot+`/members/${id}/member-manifest.json`,{schemaVersion:1,animationId:id,source:old.source,sourceSpec,sourceRun,inputs,outputs,
 originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false});
const binding={...artifacts,sourceRun,memberManifest},entry={...old.entry,artifacts:binding};
const packet={...old,sourceSpec,entry,inputs:[...inputs,sourceSpec],outputs:[...outputs,sourceRun,memberManifest],
 selectedPages:old.selectedPages.map(p=>({...p,runtime:{...p.runtime,rendererBinding:binding}}))};
for(const p of [...packet.inputs,...packet.outputs])verify(p);
const freeze=put(newFile,packet);
const fragment=put('catalog/product-bridge-calibrations/g678-nms-l02-p052-prepared-registration-v3.json',
 {calibrationId,deploymentScope:'local-only',freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]});
console.log(JSON.stringify({status:'PASS-frozen-successor',freeze,fragment,run,gateInstalled:false}));
