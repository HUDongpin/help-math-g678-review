import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),web=path.join(root,'apps/web');
const evidence='/Volumes/American Dream/hudongpin/helpmath-g678-completion-20260909-01a08222';
const run=fs.mkdtempSync(path.join(evidence,'p051-production-negative-'));
const link=path.join(web,'.next-local-reference-diagnostic');
assert.ok(fs.lstatSync(link).isSymbolicLink());
const oldTarget=fs.readlinkSync(link);
assert.equal(oldTarget,path.join(evidence,'continuation544-production-build-v2'));
const tag=path.basename(run),backup=link+'.'+tag+'-prior',retained=link+'.'+tag+'-result';
const build=path.join(run,'build');fs.mkdirSync(build);
const env={...process.env,NODE_OPTIONS:'--max-old-space-size=8192',NODE_ENV:'production',HELP_MATH_LOCAL_REFERENCE_DIAGNOSTIC:'1'};
assert.equal(env.VERCEL_ENV,undefined);
const pin=file=>{const b=fs.readFileSync(file);return {path:file,bytes:b.length,sha256:crypto.createHash('sha256').update(b).digest('hex')};};
const freeze=path.join(root,'catalog/product-bridge-calibrations/g678-nms-l02-p051-native-fraction-match-current-js-v1-compile-v8.json');
const before=pin(freeze),report={kind:'p051-local-production-negative',startedAt:new Date().toISOString(),run,build,freeze:before,oldTarget,providerAccess:false,nodeHeapLimitMiB:8192,status:'RUNNING'};
let server;
function child(command,args,log){const stream=fs.createWriteStream(path.join(run,log),{flags:'wx'});const p=spawn(command,args,{cwd:web,env,stdio:['ignore','pipe','pipe']});for(const channel of [p.stdout,p.stderr])channel.on('data',b=>{stream.write(b);process.stdout.write(b)});p.on('close',()=>stream.end());return p;}
function exitOf(p){return new Promise((resolve,reject)=>{p.once('error',reject);p.once('exit',(code,signal)=>resolve({code,signal}));});}
async function stopServer(){if(!server||server.exitCode!==null)return;const closed=exitOf(server);server.kill('SIGTERM');await closed;}
try{
 fs.renameSync(link,backup);fs.symlinkSync(build,link);
 console.log(JSON.stringify({run,build,status:'BUILDING'}));
 const result=await exitOf(child('npm',['run','build'],'build.log'));report.buildExit=result;
 assert.equal(result.code,0,'production build must pass, including asset-profile preflight');
 assert.deepEqual(pin(freeze),before,'candidate changed during build');
 server=child(process.execPath,[path.join(root,'node_modules/next/dist/bin/next'),'start','--hostname','127.0.0.1','--port','3232'],'server.log');
 const base='http://127.0.0.1:3232';let live=false;
 for(let n=0;n<40;n++){if(server.exitCode!==null)throw Error('production server exited');try{await fetch(base+'/en',{signal:AbortSignal.timeout(5000)});live=true;break}catch{}await new Promise(r=>setTimeout(r,250));}
 assert.ok(live,'production server unavailable');
 const id='shared-nms002-l02-p051',paths=[];
 for(const locale of ['en','es','fr'])for(const suffix of ['','?frame=320','?capture=1'])paths.push('/'+locale+'/migration-status/g678-calibration/'+id+suffix);
 const streams=JSON.parse(fs.readFileSync(path.join(root,'migrations',id,'audit/source-pcm-inventory-v1.json'))).streams;
 for(const stream of streams)paths.push('/flash-assets/g678-local/'+id+'/source-audio/'+stream.domain.split('-')[1]+'?sha256='+stream.source.sha256);
 paths.push('/flash-assets/g678-local/'+id+'/source-audio/invalid','/flash-assets/g678-local/'+id+'/canvas-renderer.js');
 report.routes=[];
 for(const route of paths){const response=await fetch(base+route,{redirect:'manual',signal:AbortSignal.timeout(15000)});await response.arrayBuffer();report.routes.push({path:route,status:response.status});}
 const files=[];function walk(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(e.isFile()&&file.endsWith('.js'))files.push(file);}}walk(path.join(build,'static'));assert.ok(files.length);
 const markers=['9c4c9857bb497497b4301a7b1cfec475b5f7bdf9d2cecabcd779fbd887de5d1f','data-p051-player-frame','P051_AUDIO_HASH','P051_QUERY_IDENTITY'];report.payloadHits=[];
 for(const file of files){const data=fs.readFileSync(file,'utf8');for(const marker of markers)if(data.includes(marker))report.payloadHits.push({file:path.relative(build,file),marker});}
 report.staticJsFiles=files.length;report.buildId=fs.readFileSync(path.join(build,'BUILD_ID'),'utf8').trim();
 assert.ok(report.routes.every(r=>r.status===404),'private production routes must return404');assert.equal(report.payloadHits.length,0,'source runtime payload in client bundle');
 report.status='PASS';
}catch(error){report.status='FAIL';report.error=String(error);process.exitCode=1;}
finally{
 await stopServer();
 if(fs.existsSync(backup)){assert.ok(fs.lstatSync(link).isSymbolicLink());assert.equal(fs.readlinkSync(link),build);fs.renameSync(link,retained);fs.renameSync(backup,link);}
 report.pointerRestored=fs.readlinkSync(link)===oldTarget;report.finishedAt=new Date().toISOString();
 report.script=pin(fileURLToPath(import.meta.url));fs.writeFileSync(path.join(run,'receipt.json'),JSON.stringify(report,null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify(report));
}
