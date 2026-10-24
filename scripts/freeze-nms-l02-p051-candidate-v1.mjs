import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const id='shared-nms002-l02-p051',calibrationId='g678-nms-l02-p051-native-fraction-match-current-js-v1';
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const sourceRoot='/Volumes/WestWorld/HELP MATH Related Files/AWS Grade-Classified Courseware';
const workspace=path.join(root,'migrations',id);
const read=file=>JSON.parse(fs.readFileSync(path.resolve(root,file),'utf8'));
function pin(file){
 const absolute=path.resolve(root,file),a=fs.lstatSync(absolute,{bigint:true});
 assert.equal(fs.realpathSync(absolute),absolute);assert.ok(a.isFile()&&a.nlink===1n);
 const bytes=fs.readFileSync(absolute),b=fs.lstatSync(absolute,{bigint:true});
 for(const key of ['dev','ino','size','mtimeNs'])assert.equal(a[key],b[key]);
 return {path:absolute.startsWith(root+path.sep)?path.relative(root,absolute):absolute,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')};
}
function verify(binding){assert.deepEqual(pin(binding.path),binding);}
function put(file,value){fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,JSON.stringify(value,null,2)+'\n',{flag:'wx'});return pin(file);}
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
 const file=path.join(dir,entry.name);assert.ok(!entry.isSymbolicLink(),file);
 return entry.isDirectory()?walk(file):[file];
});}
const baseFile='catalog/product-bridge-calibrations/g678-nms-l02-p050-native-number-line-current-js-v1-compile-v1.json';
assert.equal(pin(baseFile).sha256,'4d9b2893edb6dafa83de8272eeffc15da393a11d80e7d2df45d2bccd5cdb9de9');
const base=read(baseFile);for(const binding of [...base.inputs,...base.outputs])verify(binding);
const source=pin(path.join(sourceRoot,'G6-G8-shared/NMS002/L2/TI/L2TI10.swf'));
assert.equal(source.sha256,'9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f');
assert.equal(source.bytes,861848);
const xml=pin(path.join(sourceRoot,base.sourceXml.path));assert.equal(xml.sha256,base.sourceXml.sha256);
const freezeFile=path.join(root,'catalog/product-bridge-calibrations',calibrationId+'-compile-v1.json');
const gateFile=path.join(root,'apps/web/lib/g678-nms-l02-p051-freeze-v1.ts');
assert.ok(!fs.existsSync(freezeFile));assert.match(fs.readFileSync(gateFile,'utf8'),/P051_CANDIDATE_NOT_FROZEN/);
const runDir=fs.mkdtempSync(path.join(evidence,'p051-prefreeze-checks-'));
const checks=fs.readdirSync(path.join(root,'scripts')).filter(name=>/^check-nms-l02-p051-.*\.tsx?$/.test(name)).sort();
assert.equal(checks.length,18);
const commands=checks.map(name=>['node_modules/.bin/tsx',['scripts/'+name]]);
commands.push(['node',['scripts/build-nms-l02-p051-inventories-v1.mjs','--check']],
 ['node_modules/.bin/tsx',['scripts/prepare-nms-l02-p051-typography-v1.ts','--check']]);
const results=[];
for(const [command,args]of commands){
 const run=spawnSync(command==='node'?process.execPath:path.resolve(root,command),args,{cwd:root,encoding:'utf8',timeout:120000});
 const log=path.join(runDir,`${results.length+1}.log`);fs.writeFileSync(log,(run.stdout??'')+(run.stderr??''),{flag:'wx'});
 results.push({command:[command,...args],exitCode:run.status,log:pin(log)});
 assert.equal(run.status,0,log);
}
const resultsPin=put(path.join(runDir,'results.json'),{createdAt:new Date().toISOString(),checks:results});
const module=path.join(root,'packages/demos/src/modules/g678-nms-l02-native-fraction-match-p051.tsx');
const timeline=path.join(root,'packages/demos/src/timelines/g678-nms-l02-native-fraction-match-p051.ts');
const outputs=new Set([...walk(workspace),module,timeline,
 path.join(root,'apps/web/app/[locale]/migration-status/g678-calibration',id,'page.tsx'),
 path.join(root,'apps/web/app/flash-assets/g678-local',id,'source-audio/[domain]/route.ts')]);
for(const directory of ['packages/demos/src','packages/demos/src/generated','apps/web/components','apps/web/lib'])
 for(const name of fs.readdirSync(path.join(root,directory)))if(name.includes('nms-l02-p051')&&name!=='g678-nms-l02-p051-freeze-v1.ts')outputs.add(path.join(root,directory,name));
outputs.add(path.join(root,'catalog/typography-v1/g678-page-bindings',id+'.prepared-v1.json'));
const inputs=new Set([path.resolve(root,baseFile),source.path,xml.path,...results.map(x=>x.log.path),resultsPin.path]);
for(const name of fs.readdirSync(path.join(root,'scripts')))if(name.includes('nms-l02-p051'))inputs.add(path.join(root,'scripts',name));
for(const file of read('catalog/typography-v1/g678-integration.json').sharedFiles)inputs.add(path.resolve(root,file.path));
for(const file of ['apps/web/lib/g678-nms-l02-p050.server.ts','apps/web/lib/g678-nms-l02-p050-freeze-v1.ts','apps/web/lib/lesson-runtime-adapter.ts','apps/web/lib/load-animation-module.client.ts','apps/web/proxy.ts','apps/web/lib/g678-preview-policy.ts','apps/web/lib/continuous-source-audio-access.ts'])inputs.add(path.resolve(root,file));
function refs(value){
 if(Array.isArray(value))return value.flatMap(refs);
 if(value&&typeof value==='object')return Object.values(value).flatMap(refs);
 return typeof value==='string'&&value.startsWith(evidence+'/')&&fs.existsSync(value)&&fs.statSync(value).isFile()?[value]:[];
}
for(const name of fs.readdirSync(path.join(workspace,'audit')).filter(name=>name.endsWith('.json')))
 for(const file of refs(read(path.join(workspace,'audit',name))))inputs.add(file);
const inputPins=[...inputs].sort().map(pin),outputPins=[...outputs].sort().map(pin);
if(!process.argv.includes('--write')){console.log(JSON.stringify({status:'PASS-preflight',runDir,inputs:inputPins.length,outputs:outputPins.length,frozen:false,registered:false}));process.exit(0);}
const runRoot=path.join(root,'work/g678-shared-page-factory',calibrationId+'-compile-v1');
const sourceSpec=put(path.join(runDir,'source-spec.json'),{schemaVersion:1,animationId:id,source,sourceXml:base.sourceXml,inputs:inputPins,outputs:outputPins,registered:false,scaleOutAuthorized:false});
const sourceRun=put(path.join(runRoot,'run-manifest.json'),{schemaVersion:1,kind:'bounded-native-fraction-match-v1',source,sourceSpec,inputs:inputPins,outputs:outputPins,scaleOutAuthorized:false});
const memberManifest=put(path.join(runRoot,'members',id,'member-manifest.json'),{schemaVersion:1,animationId:id,source,sourceSpec,sourceRun,inputs:inputPins,outputs:outputPins,originalRuntimeAccepted:false,audioAccepted:false,humanAccepted:false,ownerAccepted:false,strictComplete:false,published:false});
const artifacts={kind:'maintained-dom-module-v1',module:pin(module),timeline:pin(timeline),memberManifest,sourceRun};
const entry={key:id,module:'./modules/g678-nms-l02-native-fraction-match-p051',maturity:'private-current-js',complexityLane:'behavior-heavy',artifacts};
const page={...base.selectedPages[0],animationId:id,sourceSha256:source.sha256,globalPageOrdinal:51,sectionPageOrdinal:9,runtime:{...base.selectedPages[0].runtime,frameDomain:'sprite-257',frameCount:503,rendererBinding:artifacts}};
const audio=Object.fromEntries(read(path.join(workspace,'audit/source-pcm-inventory-v1.json')).streams.filter(s=>['sprite-248','sprite-250','sprite-257'].includes(s.domain)).map(s=>[s.domain.slice(7),{...pin(s.source.path),contentType:'audio/mpeg'}]));
const packet={schemaVersion:1,calibrationId,deploymentScope:'local-only',source,sourceXml:base.sourceXml,sourceCatalog:base.sourceCatalog,sourceSpec,audio,entry,inputs:[...inputPins,sourceSpec],outputs:[...outputPins,sourceRun,memberManifest],selectedPages:[page],productCalibrationPassed:false,scaleOutAuthorized:false,acceptanceEffects:base.acceptanceEffects};
for(const binding of [...packet.inputs,...packet.outputs])verify(binding);
const freeze=put(freezeFile,packet);
put(path.join(runDir,'gate-recovery.json'),{pin:pin(gateFile),content:fs.readFileSync(gateFile,'utf8')});
fs.writeFileSync(gateFile,'// Generated exact local candidate pin. No admission or independent acceptance.\nconst pin=Object.freeze('+JSON.stringify(freeze,null,2)+');\nexport function readP051FreezePin(){return pin;}\n');
const fragment=put(path.join(runDir,'prepared-registration.json'),{calibrationId,deploymentScope:'local-only',freezeManifest:freeze.path,freezeManifestBytes:freeze.bytes,freezeManifestSha256:freeze.sha256,entries:[entry]});
console.log(JSON.stringify({status:'PASS-frozen-unregistered',freeze,fragment,checks:results.length,runDir}));
