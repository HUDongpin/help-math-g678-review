import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {spawnSync} from 'node:child_process';import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='shared-nms002-l02-p052',calibrationId='g678-nms-l02-p052-percent-practice-current-js-v1';
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const resolve=p=>path.resolve(root,p),read=p=>JSON.parse(fs.readFileSync(resolve(p),'utf8'));
function pin(p){
 const file=resolve(p),before=fs.lstatSync(file,{bigint:true});assert.equal(fs.realpathSync(file),file);
 assert.ok(before.isFile()&&before.nlink===1n,file);const bytes=fs.readFileSync(file),after=fs.lstatSync(file,{bigint:true});
 for(const key of ['dev','ino','size','mode','mtimeNs','nlink'])assert.equal(before[key],after[key],file);
 return {path:file.startsWith(root+'/')?path.relative(root,file):file,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};
}
function verify(p){const actual=pin(p.path);assert.equal(actual.bytes,p.bytes,p.path);assert.equal(actual.sha256,p.sha256,p.path);}
function put(p,value){const file=resolve(p);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return pin(file);}
function walk(p){return fs.readdirSync(resolve(p),{withFileTypes:true}).flatMap(e=>{assert.ok(!e.isSymbolicLink(),e.name);const file=path.join(resolve(p),e.name);return e.isDirectory()?walk(file):[file];});}
assert.ok(process.argv.slice(2).every(arg=>arg==='--write'));assert.equal(process.env.VERCEL_ENV,undefined);
assert.equal(fs.realpathSync(sourceRoot),sourceRoot);
const baseFile='catalog/product-bridge-calibrations/g678-nms-l02-p051-native-fraction-match-current-js-v1-compile-v8.json';
assert.equal(pin(baseFile).sha256,'b7f8de87124f5bfe4072d77bef545414f856f3d9c1a85bfdbdbd9532eb8c670a');
const base=read(baseFile);for(const p of [...base.inputs,...base.outputs])verify(p);
const source=pin(sourceRoot+'/G6-G8-shared/NMS002/L2/TI/L2TI11.swf');
assert.equal(source.bytes,106791);assert.equal(source.sha256,'5efa48905e74c0dd604b9e896bee1a1b4cfb1fe0839044686527fe96e1311638');
const xml=pin(sourceRoot+'/'+base.sourceXml.path);assert.equal(xml.sha256,base.sourceXml.sha256);
verify(base.sourceCatalog);
const gate='apps/web/lib/g678-nms-l02-p052-freeze-v1.ts',gateBefore=pin(gate);
assert.match(fs.readFileSync(resolve(gate),'utf8'),/P052_CANDIDATE_NOT_FROZEN/);
const freezeFile='catalog/product-bridge-calibrations/'+calibrationId+'-compile-v1.json';
assert.ok(!fs.existsSync(resolve(freezeFile)),'do not overwrite a freeze');
const run=fs.mkdtempSync(path.join(evidence,'p052-prefreeze-'));
const tests=walk('packages/demos/tests').filter(p=>/\/nms-l02-p052-.*\.test\.tsx?$/.test(p)).sort();
const scriptTests=walk('scripts/lib').filter(p=>/\/nms-l02-p052-.*\.test\.mjs$/.test(p)).sort();
const commands=[['node_modules/.bin/tsx',['--test',...tests,...scriptTests]],
 ...['runtime-audio','glossary','intro-scene','capture-identities'].map(kind=>['node_modules/.bin/tsx',[`scripts/generate-nms-l02-p052-${kind}-v1.mjs`,'--check']])];
const checks=[];
for(const [command,args]of commands){
 const result=spawnSync(resolve(command),args,{cwd:root,encoding:'utf8',timeout:120000});
 const log=path.join(run,`${checks.length+1}.log`);fs.writeFileSync(log,(result.stdout??'')+(result.stderr??''),{flag:'wx'});
 checks.push({command:[command,...args],exitCode:result.status,log:pin(log)});assert.equal(result.status,0,log);
}
const checkPin=put(path.join(run,'checks.json'),{createdAt:new Date().toISOString(),checks});
const modulePath='packages/demos/src/modules/g678-nms-l02-percent-practice-p052.tsx';
const timelinePath='packages/demos/src/timelines/g678-nms-l02-percent-practice-p052.ts';
const outputs=new Set([...walk('migrations/'+id),resolve(modulePath),resolve(timelinePath),
 ...walk('apps/web/app/[locale]/migration-status/g678-calibration/'+id),...walk('apps/web/app/flash-assets/g678-local/'+id)]);
for(const dir of ['packages/demos/src','packages/demos/src/generated','apps/web/lib','apps/web/components'])
 for(const name of fs.readdirSync(resolve(dir)))if(name.includes('nms-l02-p052')&&resolve(path.join(dir,name))!==resolve(gate))outputs.add(resolve(path.join(dir,name)));
const inputs=new Set([resolve(baseFile),source.path,resolve(base.sourceCatalog.path),xml.path,...tests,...scriptTests,checkPin.path,...checks.map(c=>c.log.path)]);
for(const dir of ['scripts','scripts/lib'])for(const name of fs.readdirSync(resolve(dir)))if(name.includes('p052'))inputs.add(resolve(path.join(dir,name)));
for(const p of [...base.inputs,...base.outputs])inputs.add(resolve(p.path));
for(const file of ['apps/web/lib/g678-nms-l02-p051.server.ts','apps/web/lib/g678-nms-l02-p051-freeze-v1.ts',
 'apps/web/lib/lesson-runtime-adapter.ts','apps/web/lib/load-animation-module.client.ts','apps/web/components/g678-multi-page-lesson-player-v3.generated.tsx',
 'apps/web/proxy.ts','apps/web/lib/g678-preview-policy.ts','apps/web/lib/whole-lesson-player-descriptor.ts'])inputs.add(resolve(file));
// Bind real external extraction/glossary inputs referenced by P052 audit JSON.
function refs(value){
 if(Array.isArray(value)){value.forEach(refs);return;}
 if(value&&typeof value==='object'){Object.values(value).forEach(refs);return;}
 if(typeof value==='string'&&path.isAbsolute(value)&&fs.existsSync(value)&&fs.lstatSync(value).isFile()){
  // The immutable PCM receipt already records this decoder's provenance.
  // It is not a runtime lesson asset and is not read by the server binder.
  if(value==='/opt/homebrew/Cellar/ffmpeg/8.1.2_1/bin/ffmpeg')return;
  assert.ok(value.startsWith(root+'/')||value.startsWith(evidence+'/')||value.startsWith(sourceRoot+'/')||
   ['/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI/L1KTE01.xml','/Volumes/WestWorld/HELP MATH Related Files/HELP_OnlineKeyTerms_XML/MI/L1KTS01.xml'].includes(value),value);
  inputs.add(value);
 }
}
for(const file of walk('migrations/'+id+'/audit').filter(p=>p.endsWith('.json')))refs(read(file));
const inputPins=[...inputs].sort().map(pin),outputPins=[...outputs].sort().map(pin);
if(!process.argv.includes('--write')){console.log(JSON.stringify({status:'PASS-preflight',run,inputs:inputPins.length,outputs:outputPins.length,registered:false}));process.exit(0);}
const runRoot='work/g678-shared-page-factory/'+calibrationId+'-compile-v1';
const sourceSpec=put(path.join(run,'source-spec.json'),{schemaVersion:1,animationId:id,source,sourceXml:base.sourceXml,inputs:inputPins,outputs:outputPins,registered:false,scaleOutAuthorized:false});
const sourceRun=put(runRoot+'/run-manifest.json',{schemaVersion:1,kind:'bounded-percent-practice-v1',source,sourceSpec,inputs:inputPins,outputs:outputPins,scaleOutAuthorized:false});
const memberManifest=put(runRoot+'/members/'+id+'/member-manifest.json',{schemaVersion:1,animationId:id,source,sourceSpec,sourceRun,inputs:inputPins,outputs:outputPins,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false});
const artifacts={kind:'maintained-dom-module-v1',module:pin(modulePath),timeline:pin(timelinePath),memberManifest,sourceRun};
const entry={key:id,module:'./modules/g678-nms-l02-percent-practice-p052',maturity:'private-current-js',complexityLane:'behavior-heavy',artifacts};
const page={...base.selectedPages[0],animationId:id,sourceSha256:source.sha256,globalPageOrdinal:52,sectionPageOrdinal:10,
 runtime:{...base.selectedPages[0].runtime,frameDomain:'sprite-350',frameCount:156,language:'route-locale',scenario:'intro',rendererBinding:artifacts}};
const audio=Object.fromEntries([8,318,327,347,349,350].map(n=>['sprite-'+n,{...pin(`migrations/${id}/audit/sprite-${n}-source-stream-v1.mp3`),contentType:'audio/mpeg'}]));
const packet={schemaVersion:1,calibrationId,deploymentScope:'local-only',source,sourceXml:base.sourceXml,sourceCatalog:base.sourceCatalog,sourceSpec,audio,entry,
 inputs:[...inputPins,sourceSpec],outputs:[...outputPins,sourceRun,memberManifest],selectedPages:[page],productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:base.acceptanceEffects};
for(const p of [...packet.inputs,...packet.outputs])verify(p);
verify(gateBefore);const freeze=put(freezeFile,packet);
put(path.join(run,'gate-recovery.json'),{pin:gateBefore,content:fs.readFileSync(resolve(gate),'utf8')});
// Gate installation is deliberately a separate reviewed apply_patch step.
const fragment=put('catalog/product-bridge-calibrations/g678-nms-l02-p052-prepared-registration-v1.json',
 {calibrationId,deploymentScope:'local-only',freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]});
console.log(JSON.stringify({status:'PASS-frozen-unregistered',freeze,fragment,run,gateInstalled:false}));
